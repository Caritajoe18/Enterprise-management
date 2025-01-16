import { Request, Response } from "express";
import Ledger from "../models/ledger"; // Adjust based on your actual imports
import { AuthRequest } from "../middleware/adminAuth";
import Admins from "../models/admin";
import CustomerOrder from "../models/customerOrder";
import AccountBook from "../models/accountBook";
import Customer from "../models/customers";
import Products from "../models/products";
import AuthToWeigh from "../models/AuthToWeigh";
import Invoice from "../models/invoice";
import { Op } from "sequelize";
import Role from "../models/role";
import { approveReceipt, updateTicketStatus } from "../utilities/modules";
import Notify from "../models/notification";
import { getAdminConnection } from "../utilities/web-push";
import VehicleDispatch from "../models/vehicle";

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
      include: [
        {
          model: CustomerOrder,
          as: "order",
          attributes: ["rate", "basePrice"],
        },
      ],
    });
    const previousEntries = await Ledger.findAll({
      where: {
        customerId,
        createdAt: { [Op.lt]: ledger.dataValues.createdAt },
      },
      order: [["createdAt", "DESC"]],
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
        //console.log("acct", accountBook);
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
    const vehicleNo = authToWeighTickets?.vehicleNo;
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
          attributes: ["firstname", "lastname", "address"],
        },
        {
          model: Role,
          as: "role",
          attributes: ["name"],
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

export const getAllInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.admin as Admins;
    const { roleId: adminId, isAdmin } = admin.dataValues;
    const invoices = await Invoice.findAll({
      order: [["createdAt", "DESC"]],
      where: isAdmin ? {} : { preparedBy: adminId },
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
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });
    if (invoices.length == 0) {
      return res.status(200).json({ message: "No invoice found", invoices });
    }

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
export const sendInvoice = async (req: Request, res: Response) => {
  const { Id } = req.params;
  const { adminId } = req.body;

  try {
    const ticket = await Invoice.findByPk(Id);
    const admin = await Admins.findByPk(adminId);
    if (!ticket || !admin) {
      return res.status(404).json({ message: "Receipt or admin not found" });
    }

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new Invoice has been sent to you.`,
      type: "invoice",
      ticketId: Id,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: `A new Invoice has been sent to you.`,
          ticket,
        })
      );
    }

    return res.status(200).json({
      message: "Receipt successfully sent to admin.",
      ticket,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const approveInvoice = (req: AuthRequest, res: Response) => {
  return approveReceipt(
    req,
    res,
    Invoice,
    "recieptId",
    "A new Invoice has been approved",
    "invoice"
  );
};

export const generateInvoicePdf = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;

    // Fetch the invoice along with associated product, customer, and role
    const invoice = await Invoice.findOne({
      where: {
        id: invoiceId,
        // status: "approved",
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
          attributes: ["firstname", "lastname", "address"],
        },
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ message: "Invoice not found or not approved" });
    }

    const ledgerEntries =
      typeof invoice.dataValues.ledgerEntries === "string"
        ? JSON.parse(invoice.dataValues.ledgerEntries)
        : invoice.dataValues.ledgerEntries;

    const enrichedLedgerEntries = await Promise.all(
      ledgerEntries.map(async (entry: any) => {
        let productName = null; // Set default as null
        let customerName = null; // Set default as null

        // Fetch product name if productId is valid
        if (entry.productId) {
          const product = await Products.findOne({
            where: { id: entry.productId },
            attributes: ["name"],
          });
          if (product) {
            productName = product.dataValues.name;
          }
        }

        // Fetch customer name if customerId is valid
        if (entry.customerId) {
          const customer = await Customer.findOne({
            where: { id: entry.customerId },
            attributes: ["firstname", "lastname"],
          });
          if (customer) {
            customerName = `${customer.dataValues.firstname} ${customer.dataValues.lastname}`;
          }
        }

        return {
          ...entry,
          productName,
          customerName,
        };
      })
    );

    // Prepare the final invoice object
    const parsedInvoice = {
      ...invoice.toJSON(),
      ledgerEntries: enrichedLedgerEntries,
    };

    return res.status(200).json({
      message: "Invoice retrieved successfully!",
      invoice: parsedInvoice,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const rejectInvoice = (req: Request, res: Response) =>
  updateTicketStatus(req, res, {
    model: Invoice,
    ticketIdParam: "invoiceId",
    status: "rejected",
    notificationMessage: "An invoice was rejected.",
    notificationType: "invoice",
  });

export const generateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.admin as Admins;
    const { roleId: adminId } = admin.dataValues;

    const { escortName, destination } = req.body;

    const vehicle = await VehicleDispatch.create({
      ...req.body,
      preparedBy: adminId,
    });

    return res.status(201).json({
      message: "Vehicle Dispatch generated successfully!",
      vehicle,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getAllVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.admin as Admins;
    const { roleId: adminId, isAdmin } = admin.dataValues;
    const vehicles = await VehicleDispatch.findAll({
      order: [["createdAt", "DESC"]],
      where: isAdmin ? {} : { preparedBy: adminId },
    });
    if (vehicles.length == 0) {
      return res.status(200).json({ message: "No vehicles found", vehicles });
    }

    return res.status(200).json({
      message: "Vehicle dispatch retrieved successfully!",
      vehicles,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};
export const sendVehicle = async (req: Request, res: Response) => {
  const { Id } = req.params;
  const { adminId } = req.body;

  try {
    const ticket = await VehicleDispatch.findByPk(Id);
    const admin = await Admins.findByPk(adminId);
    if (!ticket || !admin) {
      return res.status(404).json({ message: "Receipt or admin not found" });
    }

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new vehicle dispatch receipt has been sent to you.`,
      type: "vehicle",
      ticketId: Id,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: `A new vehicle dispatch has been sent to you.`,
          ticket,
        })
      );
    }

    return res.status(200).json({
      message: "Receipt successfully sent to admin.",
      ticket,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const approveVehicle = (req: AuthRequest, res: Response) => {
  return approveReceipt(
    req,
    res,
    VehicleDispatch,
    "recieptId",
    "A new Vehicle Dispatch note has been approved",
    "vehicle"
  );
};
export const rejectVehicle = (req: Request, res: Response) =>
  updateTicketStatus(req, res, {
    model: VehicleDispatch,
    ticketIdParam: "vehicleId",
    status: "rejected",
    notificationMessage: "A vehicle dispatch was rejected.",
    notificationType: "vehicle",
  });

export const getAVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await VehicleDispatch.findOne({
      where: {
        id: vehicleId,
      },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "vehicle not found" });
    }

    return res.status(200).json({
      message: "Vehicle Dispatch retrieved successfully.",

      vehicle,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};
