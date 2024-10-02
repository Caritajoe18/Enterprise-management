import { Request, Response } from "express";
import { AuthRequest } from "../middleware/staffPermissions";
import Admins from "../models/admin";
import CashTicket from "../models/CashTicket";
import Customer from "../models/customers";
import Products from "../models/products";

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
