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
import CollectFromGenStore from "../models/collectFromGenStore";
import AuthToWeigh from "../models/AuthToWeigh";
import AuthToLoad from "../models/authToLoad";

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
      ticket,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: `A new ticket for cash has been sent to you.`,
          ticket,
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
export const raiseAuthToCollectFromStore = async (
  req: AuthRequest,
  res: Response
) => {
  const admin = req.admin as Admins;
  const { roleId } = admin.dataValues;

  try {
    const ticket = await CollectFromGenStore.create({
      ...req.body,
      raisedByAdminId: roleId,
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
export const raiseAuthToWeight = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId } = admin.dataValues;
  const { customerId } = req.body;

  try {
    const customer = Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const ticket = await AuthToWeigh.create({
      ...req.body,
      raisedByAdminId: roleId,
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
export const raiseAuthToLoad = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId } = admin.dataValues;
  const { customerId } = req.body;

  try {
    const customer = Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const ticket = await AuthToLoad.create({
      ...req.body,
      raisedByAdminId: roleId,
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

export const sendLPOToAdmin = async (req: Request, res: Response) => {
  const { Id } = req.params;
  const { adminId } = req.body;

  try {
    const ticket = await LPO.findByPk(Id);

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new LPO has sent to you.`,
      type: "ticket_recieved",
      ticket,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: `A new LPO has been sent to you.`,
          ticket,
        })
      );
    }

    return res.status(200).json({
      message: "Ticket successfully sent to admin.",
      ticket,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};
export const sendStoreCollectionAdmin = async (req: Request, res: Response) => {
  const { Id } = req.params;
  const { adminId } = req.body;

  try {
    const ticket = await CollectFromGenStore.findByPk(Id);

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new Authority to collect from General Store has sent to you.`,
      type: "ticket_recieved",
      ticket,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: `A new Authority to collect From General store has been sent to you.`,
          ticket,
        })
      );
    }

    return res.status(200).json({
      message: "Ticket successfully sent to admin.",
      ticket,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};
export const sendAuthtoweigh = async (req: Request, res: Response) => {
  const { Id } = req.params;
  const { adminId } = req.body;

  try {
    const ticket = await AuthToWeigh.findByPk(Id);

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new Authority to weigh has been sent to you.`,
      type: "ticket_recieved",
      ticket,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: `A new Authority to weight has been sent to you.`,
          ticket,
        })
      );
    }

    return res.status(200).json({
      message: "Ticket successfully sent to admin.",
      ticket,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};
export const sendAuthtoLoad = async (req: Request, res: Response) => {
  const { Id } = req.params;
  const { adminId } = req.body;

  try {
    const ticket = await AuthToLoad.findByPk(Id);

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new Authority to Load has been sent to you.`,
      type: "ticket_recieved",
      ticket,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: `A new Authority to load has been sent to you.`,
          ticket,
        })
      );
    }

    return res.status(200).json({
      message: "Ticket successfully sent to admin.",
      ticket,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};
