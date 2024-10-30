import { Request, Response } from "express";
import { AuthRequest } from "../middleware/staffPermissions";
import Admins from "../models/admin";
import CashTicket from "../models/CashTicket";
import Customer from "../models/customers";
import Products from "../models/products";
import Notify from "../models/notification";
import { getAdminConnection } from "../utilities/web-push";
import CashierBook from "../models/cashierbook";
import Supplier from "../models/suppliers";
import { LPO } from "../models/lpo";

export const raiseCashTicket = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId } = admin.dataValues;
  const { customerId, staffName, amount, productId, creditOrDebit } = req.body;
  try {
    const customer = customerId
      ? await Customer.findOne({ where: { id: customerId } })
      : null;

    if (customerId && !customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const product = productId
      ? await Products.findOne({ where: { id: productId } })
      : null;

    if (productId && !product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const ticket = await CashTicket.create({
      ...req.body,
      customerId,
      staffName,
      amount,
      productId,
      creditOrDebit,
      raisedByAdminId: roleId,
      status: "pending",
    });

    return res
      .status(201)
      .json({ message: "Ticket created successfully", ticket });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const sendTicketToAdmin = async (req: Request, res: Response) => {
  const { Id } = req.params;
  const { adminId } = req.body;

  try {
    const ticket = await CashTicket.findByPk(Id);

    // Create a notification for the designated admin
    await Notify.create({
      ...req.body,
      adminId,
      message: `A new ticket has sent to you.`,
      type: "ticket_recieved",
      ticketId: Id,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: `A new ticket with ID ${Id} has been sent to you.`,
          ticketId: Id,
        })
      );
    }

    return res.status(200).json({
      message: "Ticket successfully sent to the designated admin.",
      ticket,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const approveCashTicket = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { id } = admin.dataValues;
  const { ticketId } = req.params;

  try {
    const ticket = await CashTicket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.dataValues.status = "approved";
    ticket.dataValues.approvedBySuperAdminId = id;

    await ticket.save();
    return res
      .status(200)
      .json({ message: "Ticket approved successfully", ticket });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const rejectCashTicket = async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  try {
    const ticket = await CashTicket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.dataValues.status = "rejected";

    await ticket.save();

    await Notify.create({
      ...req.body,
      adminId: ticket.dataValues.raisedByAdminId,
      message: `A ticket was rejected.`,
      ticketId,
    });
    return res
      .status(200)
      .json({ message: "Ticket rejected successfully", ticket });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const recieveCashTicket = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { id } = admin.dataValues;
  const { ticketId } = req.params;

  try {
    const ticket = await CashTicket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.dataValues.status = "completed";

    await ticket.save();

    await CashierBook.create({
      ...req.body,
      approvedByAdminId: ticket.dataValues.approvedBySuperAdminId,
      name: ticket.dataValues.customerId,
      // credit: parsedAmount.toNumber(),
      // debit: 0,
      // balance: newBalance.toNumber(),
    });
    return res
      .status(200)
      .json({ message: "Ticket approved successfully", ticket });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const raiseLPO = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId } = admin.dataValues;
  const { supplierId } = req.body;
  try {
    const supplier = Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const ticket = await LPO.create({
      ...req.body,
      raisedByAdminId: roleId,
      status: "pending",
    });

    return res
      .status(201)
      .json({ message: "Ticket created successfully", ticket });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};
