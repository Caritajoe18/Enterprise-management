import { Request, Response } from "express";
import Ledger from "../models/ledger"; // Adjust based on your actual imports
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middleware/adminAuth";
import Admins from "../models/admin";
import CustomerOrder from "../models/customerOrder";
import AccountBook from "../models/accountBook";
import Customer from "../models/customers";
import Products from "../models/products";
import AuthToWeigh from "../models/AuthToWeigh";
import Weigh from "../models/weigh";
import Invoice from "../models/invoice";
import { Op } from "sequelize";

export const generateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.admin as Admins;
    const { roleId: adminId } = admin.dataValues;
    const { tranxId } = req.params;
    const ledger = await Ledger.findOne({
      where: { tranxId },
      
    });
    if (!ledger) {
      return res.status(404).json({ message: "Ledger not found" });
    }
    const customerId = ledger.dataValues.customerId;

    const ledgerEntries = await Ledger.findAll({
      where: {
        customerId,
        createdAt: { [Op.gte]: ledger.dataValues.createdAt },
      },
      order: [["createdAt", "ASC"]],
      attributes: ["productId","quantity","unit","credit", "debit","balance"],
    });
    const previousEntries = await Ledger.findAll({
      where: {
        customerId,
        id: { [Op.lt]: ledger.dataValues.id },
      },
      order: [["id", "DESC"]],
      limit: 2,
      include: [
        {
          model: AccountBook,
          as: "accountBook",
          attributes: ["id", "bankName"],
        },
      ],
    });

    let prevBalance = null;
    let credit = null;
    let bankName = null;
    let balanceBeforeDebit = null
    if (previousEntries.length === 2) {
      const lastEntry = previousEntries[0];
      const secondLastEntry = previousEntries[1];

      if (lastEntry.dataValues.credit) {
        credit = lastEntry.dataValues.credit;
        balanceBeforeDebit = lastEntry.dataValues.balance
        const accountBook = lastEntry.get("accountBook") as AccountBook | null;
        console.log("acct", accountBook)
        bankName = accountBook?.dataValues.bankName


        prevBalance = secondLastEntry.dataValues.balance;
      } else {
        credit = null;
        prevBalance = lastEntry.dataValues.balance;
      }
    } else if (previousEntries.length === 1) {
      prevBalance = previousEntries[0].dataValues.balance;
    }

    const order = await CustomerOrder.findByPk(tranxId, {
      attributes: ["id", "price", "quantity"],
      include: [
        // {
        //   model: Customer,
        //   as: "corder",
        //   attributes: ["id", "firstname", "lastname"],
        // },
        {
          model: Products,
          as: "porders",
          attributes: ["id", "name"],
        },
        {
          model: AuthToWeigh,
          as: "authToWeighTickets",
          attributes: ["id", "vehicleNo"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const { porder, authToWeighTickets } = order.get() as any;

    const productId = porder?.id;
    const vehicleNo = authToWeighTickets.vehicleId;
    const latestLedgerEntry = await Ledger.findOne({
      where: { customerId},
      order: [["createdAt", "DESC"]],
      attributes: ["balance"],
    });
    const currentBalance = latestLedgerEntry
      ? latestLedgerEntry.dataValues.balance
      : 0;

    const invoice = await Invoice.create({
      ...req.body,
      tranxId,
      customerId,
      ledgerId: ledger.dataValues.id,
      vehicleNo,
      productId,
      quantityOrdered: order.dataValues.quantity,
      prevBalance,
      credit,
      balanceBeforeDebit: prevBalance,
      currentBalance,
      bankName,
      ledgerEntries,
      preparedBy: adminId,
    });
    const formattedInvoiceNumber = invoice.dataValues.invoiceNumber
      .toString()
      .padStart(6, "0");

    return res.status(201).json({
      message: "Invoice generated successfully!",
      invoice,
      invoiceNumber: formattedInvoiceNumber,
      ledgerEntries,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const { tranxId } = req.params;

    // Fetch the invoice
    const invoice = await Invoice.findOne({
      where: { tranxId },
      include: [
        {
          model: Ledger,
          as: "ledgers", // Ensure this matches your alias
          attributes: [
            "id",
            "tranxId",
            "productId",
            "quantity",
            "unit",
            "credit",
            "debit",
            "balance",
            "createdAt",
          ],
          include: [
            {
              model: AccountBook,
              as: "accountBook",
              attributes: ["id", "bankName"],
            },
          ],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Parse ledger entries
    // const ledgerEntries = invoice.dataValues.ledgerEntries.map((ledger: any) => {
    //   const parsedLedger = {
    //     ...ledger.toJSON(),
    //     credit:
    //       typeof ledger.dataValues.credit === "string"
    //         ? JSON.parse(ledger.dataValues.credit)
    //         : ledger.dataValues.credit,
    //     debit:
    //       typeof ledger.dataValues.debit === "string"
    //         ? JSON.parse(ledger.dataValues.debit)
    //         : ledger.dataValues.debit,
    //     accountBook: ledger.accountBook,
    //   };

    //   return parsedLedger;
    // });

    // // Return the invoice with parsed ledger entries
    // return res.status(200).json({
    //   message: "Invoice retrieved successfully!",
    //   invoice: {
    //     ...invoice.toJSON(),
    //     ledgerEntries,
    //   },
    // });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};
