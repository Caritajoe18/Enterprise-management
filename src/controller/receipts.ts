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
import { generatePdf } from "../utilities/generatePdf";

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
      attributes: [
        "productId",
        "quantity",
        "unit",
        "credit",
        "debit",
        "balance",
        "createdAt",
      ],
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
    let balanceBeforeDebit = null;
    if (previousEntries.length === 2) {
      const lastEntry = previousEntries[0];
      const secondLastEntry = previousEntries[1];

      if (lastEntry.dataValues.credit) {
        credit = lastEntry.dataValues.credit;
        balanceBeforeDebit = lastEntry.dataValues.balance;
        const accountBook = lastEntry.get("accountBook") as AccountBook | null;
        console.log("acct", accountBook);
        bankName = accountBook?.dataValues.bankName;

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
    const { porders, authToWeighTickets } = order.get() as any;

    const productId = porders?.id;
    const vehicleNo = authToWeighTickets.vehicleNo;
    const latestLedgerEntry = await Ledger.findOne({
      where: { customerId },
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

export const getApprovedInvoice = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findOne({
      where: {
        id: invoiceId,
        status: "approved",
      },
      include: [
        {
          model: Products,
          as: "product",
          attributes: ["name"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["firstname", "lastname"],
        },
      ],
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ message: "Invoice not found or not approved" });
    }

    const parsedInvoice = {
      ...invoice.toJSON(),
      ledgerEntries:
        typeof invoice.dataValues.ledgerEntries === "string"
          ? JSON.parse(invoice.dataValues.ledgerEntries)
          : invoice.dataValues.ledgerEntries,
    };

    return res.status(200).json({
      message: "Invoice retrieved successfully!",
      invoice: parsedInvoice,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Products,
          as: "product",
          attributes: ["name"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["firstname", "lastname"],
        },
      ],
    });

    const parsedInvoices = invoices.map((invoice) => ({
      ...invoice.toJSON(),
      ledgerEntries:
        typeof invoice.dataValues.ledgerEntries === "string"
          ? JSON.parse(invoice.dataValues.ledgerEntries)
          : invoice.dataValues.ledgerEntries,
    }));

    return res.status(200).json({
      message: "Invoices retrieved successfully!",
      invoices: parsedInvoices,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const generateInvoicePdf = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findOne({
      where: {
        id: invoiceId,
        //status: "approved",
      },
      include: [
        {
          model: Products,
          as: "product",
          attributes: ["name"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["firstname", "lastname"],
        },
      ],
    });


    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found or not approved" });
    }
 const {customer, product} = invoice.get() as any;
    const pdfContent = {
      title: `Invoice #${invoice.dataValues.invoiceNumber}`,
      fields: [
        { label: "Customer Name", value: `${customer.firstname} ${customer.lastname}` },
        { label: "Date", value: `${invoice.dataValues.createdAt?.toISOString().split("T")[0]}`},
        
        // { label: "Time Out", value: `${invoice.dataValues.createdAt?.toISOString().split("T")[1]}`},

  //       { label: "Time Out",
  // value: `${new Date(invoice.dataValues.createdAt).toLocaleTimeString('en-US', {
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   second: '2-digit',
  //   hour12: true,
  // })}`,},
        { label: "balance", value: `${invoice.dataValues.currentBalance }`},
      ],
      footer: "Thank you for your business!",
    };
    // Use the generatePdf function
    generatePdf(res, `invoice-${invoiceId}.pdf`, pdfContent);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the invoice PDF." });
  }
};
