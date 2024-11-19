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
      include: [
        {
          model: AccountBook,
          as: "accountBook",
          attributes: ["id", "bankName"],
        },
      ],
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
      include: [
        {
          model: AccountBook,
          as: "accountBook",
          attributes: ["id", "bankName"],
        },
      ],
    });

    const previousEntries = await Ledger.findAll({
      where: {
        customerId,
        id: { [Op.lt]: ledger.dataValues.id },
      },
      order: [["id", "DESC"]],
      limit: 2,
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
        bankName = await AccountBook.findOne({
          where: { id: lastEntry.dataValues.acctBookId },
          attributes: ["bankName"],
        }).then((book) => book?.dataValues.bankName);

        // Balance before credit
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
        {
          model: Customer,
          as: "corder",
          attributes: ["id", "firstname", "lastname"],
        },
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
    const { id, corder, porder, authToWeighTickets } = order.get() as any;

    const productId = porder?.id;
    const vehicleNo = authToWeighTickets.vehicleId;
    const latestLedgerEntry = await Ledger.findOne({
      where: { customerId: ledger.dataValues.customerId },
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
