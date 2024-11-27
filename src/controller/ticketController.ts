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
import {
  approveReceipt,
  approveTicket,
  calculateNewBalance,
  getRecords,
  getSingleRecord,
  updateTicketStatus,
} from "../utilities/modules";
import CustomerOrder from "../models/customerOrder";
import Departments from "../models/department";
import db from "../db";
import { Op, Transaction } from "sequelize";
import Decimal from "decimal.js";
import Ledger from "../models/ledger";
import DepartmentLedger from "../models/departmentLedger";
import Role from "../models/role";

export const raiseCashTicket = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId } = admin.dataValues;
  const {
    customerId,
    staffName,
    amount,
    productId,
    creditOrDebit,
    departmentId,
    item,
  } = req.body;
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
    const ticket = await CashTicket.findOne({
      where: { id: Id },
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
          model: Departments,
          as: "department",
          attributes: ["name"],
        },
      ],
    });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new  cash ticket has been sent to you.`,
      type: "cash",
      ticketId: Id,
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
    const notification = await Notify.findOne({ where: { ticketId } });
    if (notification && !notification.dataValues.read) {
      await notification.update({ read: true });
    }
    await Notify.create({
      ...req.body,
      adminId: ticket.dataValues.raisedByAdminId,
      message: `A cash ticket was approved.`,
      type: "cash",
      ticketId,
    });

    const cashier = await Admins.findOne({
      include: {
        model: Role,
        as: 'role',
        where: {
          name: { [Op.like]: "%Cashier%" }, // Case-insensitive comparison
        },
      },
    });

    if (cashier) {
      // Send a notification to the cashier
      await Notify.create({
        ...req.body,
        adminId: cashier.dataValues.id,
        message: `An approved cash ticket has been sent to you.`,
        type: "cash",
        ticketId,
      });
    }

    // const adminWs = getAdminConnection(adminId);
    // if (adminWs) {
    //   adminWs.send(
    //     JSON.stringify({
    //       message: `A new ticket for cash has been approved.`,
    //       ticket,
    //     })
    //   );
    // }

    return res
      .status(200)
      .json({ message: `Ticket approved successfully and sent to ${cashier?.dataValues.id}`});
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
    const notification = await Notify.findOne({ where: { ticketId } });
    if (notification && !notification.dataValues.read) {
      await notification.update({ read: true });
    }

    await Notify.create({
      ...req.body,
      adminId: ticket.dataValues.raisedByAdminId,
      message: `A cash ticket was rejected.`,
      type: "cash",
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

  const transaction: Transaction = await db.transaction();
  try {
    const ticket = await CashTicket.findByPk(ticketId, {
      include: [
        {
          association: "customer",
          attributes: ["firstname", "lastname"],
          required: false,
        },
      ],
      transaction,
    });
    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ message: "Ticket not found" });
    }
    const { customerId, departmentId, staffName, creditOrDebit, amount, comments } =
      ticket.dataValues;
    const isCredit = creditOrDebit === "credit";
    const isLedgerCredit = creditOrDebit === "debit";

    const customer = ticket.get("customer") as any;

    const customerName = customer
      ? `${customer.firstname} ${customer.lastname}`
      : "N/A";

    const lastEntry = await CashierBook.findOne({
      order: [["createdAt", "DESC"]],
      transaction,
    });
    const newCashierBalance = calculateNewBalance(
      lastEntry,
      new Decimal(amount),
      isCredit
    );

    await CashierBook.create(
      {
        ...req.body,
        approvedByAdminId: ticket.dataValues.approvedBySuperAdminId,
        name: staffName || customerName,
        comment: comments,
        credit: isCredit ? amount : 0,
        debit: isCredit ? 0 : amount,
        balance: newCashierBalance.toNumber(),
      },
      { transaction }
    );
    if (customerId) {
      const lastLedgerEntry = await Ledger.findOne({
        where: { customerId },
        order: [["createdAt", "DESC"]],
        transaction,
      });

      const newLedgerBalance = calculateNewBalance(
        lastLedgerEntry,
        new Decimal(amount),
        isLedgerCredit
      );
      await Ledger.create(
        {
          ...req.body,
          customerId,
          credit: isCredit ? amount : 0,
          debit: isCredit ? 0 : amount,
          balance: newLedgerBalance.toNumber(),
        },
        { transaction }
      );
    } else if (departmentId) {
      const lastDepartmentEntry = await DepartmentLedger.findOne({
        where: { departmentId },
        order: [["createdAt", "DESC"]],
        transaction,
      });

      const newDepartmentBalance = calculateNewBalance(
        lastDepartmentEntry,
        new Decimal(amount),
        isLedgerCredit
      );
      await DepartmentLedger.create(
        {
          ...req.body,
          departmentId,
          credit: isCredit ? amount : 0,
          debit: isCredit ? 0 : amount,
          balance: newDepartmentBalance.toNumber(),
        },
        { transaction }
      );
    }

    ticket.dataValues.status = "completed";

    await ticket.save({ transaction });
    await transaction.commit();
    return res
      .status(200)
      .json({ message: "Ticket approved successfully", ticket });
  } catch (error: unknown) {
    await transaction.rollback();
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const raiseLPO = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId } = admin.dataValues;
  const { supplierId, rawMaterial } = req.body;
  try {
    const supplier = Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    const product = Products.findByPk(rawMaterial);
    if (!product) {
      return res.status(404).json({ message: "Raw material not found" });
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
  // const { customerId } = req.body;
  const { orderId } = req.params;

  try {
    const Order = await CustomerOrder.findByPk(orderId);
    if (!Order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const ticket = await AuthToWeigh.create({
      ...req.body,
      customerId: Order.dataValues.customerId,
      raisedByAdminId: roleId,
      tranxId: orderId,
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
    const admin = await Admins.findByPk(adminId);
    if (!ticket || !admin) {
      return res.status(404).json({ message: "Ticket or admin not found" });
    }

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new LPO has sent to you.`,
      type: "lpo",
      ticketId: Id,
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
    const admin = await Admins.findByPk(adminId);
    if (!ticket || !admin) {
      return res.status(404).json({ message: "Ticket or admin not found" });
    }

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new Authority to collect from General Store has sent to you.`,
      type: "store",
      ticketId: Id,
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
    const admin = await Admins.findByPk(adminId);
    if (!ticket || !admin) {
      return res.status(404).json({ message: "Ticket or admin not found" });
    }

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new Authority to weigh has been sent to you.`,
      type: "weigh",
      ticketId: Id,
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
export const getCashTicket = async (req: Request, res: Response) => {
  try {
    const records = await CashTicket.findAll({
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
        {
          model: Departments,
          as: "department",
          attributes: ["name"],
        },
      ],
    });

    if (records.length === 0) {
      return res.status(200).json({ message: `No Cash Ticket Found`, records });
    }

    res.status(200).json({
      message: `Successfully retrieved Cash `,
      records,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
export const getACashTicket = (req: Request, res: Response) => {
  getSingleRecord(req, res, CashTicket, "cashTickets");
};
export const getLPO = (req: Request, res: Response) => {
  getRecords(req, res, LPO, "LPOs");
};
export const getAnLPO = (req: Request, res: Response) => {
  getSingleRecord(req, res, LPO, "LPOs");
};
export const getStoreAuth = async (req: Request, res: Response) => {
  try {
    const records = await CollectFromGenStore.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (records.length === 0) {
      return res.status(200).json({
        message: `No Authorities To collect From General Store Found`,
        records,
      });
    }

    const parsedRecords = records.map((record) => {
      return {
        ...record.toJSON(),
        items:
          typeof record.dataValues.items === "string"
            ? JSON.parse(record.dataValues.items)
            : record.dataValues.items,
      };
    });

    res.status(200).json({
      message: `Successfully retrieved Authorities to collects from General store`,
      records: parsedRecords,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
export const getAStoreAuth = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "ID is required to fetch the record." });
    }
    const record = await CollectFromGenStore.findOne({
      where: { id },
    });

    if (!record) {
      return res.status(404).json({
        message: `Authority to collect from General Store with ID ${id} not found.`,
      });
    }

    const parsedRecord = {
      ...record.toJSON(),
      items:
        typeof record.dataValues.items === "string"
          ? JSON.parse(record.dataValues.items)
          : record.dataValues.items,
    };

    res.status(200).json({
      message: `Successfully retrieved Authorities to collects from General store`,
      records: parsedRecord,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};

export const getAuthToWeigh = (req: Request, res: Response) => {
  getRecords(req, res, AuthToWeigh, "Authorities to weigh");
};
export const getAnAuthToWeigh = (req: Request, res: Response) => {
  getSingleRecord(req, res, AuthToWeigh, "Authorities to weigh");
};
export const approveLPO = (req: AuthRequest, res: Response) => {
  return approveTicket(
    req,
    res,
    LPO,
    "ticketId",
    "approved",
    "An lpo was approved.",
    "lpo"
  );
};
export const approveStoreAuth = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { id } = admin.dataValues;
  const { ticketId } = req.params;

  const transaction = await db.transaction();
  try {
    // Find the ticket
    const ticket = await CollectFromGenStore.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update ticket status and save
    ticket.dataValues.status = "approved";
    ticket.dataValues.approvedBySuperAdminId = id;
    await ticket.save({ transaction });

    // Create notification for the admin who raised the ticket
    await Notify.create(
      { ...req.body,
        adminId: ticket.dataValues.raisedByAdminId,
        message: "A new authority to collect from Store has been approved",
        type: "store",
        ticketId,
        
      },
      { transaction }
    );

    // Find admins with roles containing "general store" (case-insensitive)
    const generalStoreAdmin = await Admins.findOne({
      include: {
        model: Role,
        as: 'role',
        where: {
          name: { [Op.like]: "%general store%" }, // Case-insensitive match
        },

      },
    });

    if (generalStoreAdmin) {
      await Notify.create(
        {...req.body,
          adminId: generalStoreAdmin.dataValues.id,
          message: "A new authority to collect from Store has been approved.",
          type: "store",
          ticketId,
          
        },
        { transaction }
      );
    }

    // Commit transaction
    await transaction.commit();

    return res
      .status(200)
      .json({ message: "Authority to collect from Store approved successfully" });
  } catch (error: unknown) {
    await transaction.rollback();
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};


export const approveAuthToWeigh = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { id } = admin.dataValues;
  const { ticketId } = req.params;

  try {
    // Find the ticket
    const ticket = await AuthToWeigh.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update ticket status and save
    ticket.dataValues.status = "approved";
    ticket.dataValues.approvedBySuperAdminId = id;
    await ticket.save();

    // Update existing notification if unread
    const notification = await Notify.findOne({ where: { ticketId } });
    if (notification && !notification.dataValues.read) {
      await notification.update({ read: true });
    }

    // Create a new notification for the admin who raised the ticket
    await Notify.create({
      ...req.body,
      adminId: ticket.dataValues.raisedByAdminId,
      message: `An Authority to weigh was approved.`,
      type: "weigh",
      ticketId,
    });

    // Find admins with roles containing "weigh" (case-insensitive)
    const weighAdmin = await Admins.findOne({
      include: {
        model: Role,
        as: 'role',
        where: {
          name: { [Op.like]: "%weigh%" }, // Case-insensitive match for "weigh"
        },
      },
    });

    
    if (weighAdmin ){
      await Notify.create({
        ...req.body,
        adminId:  weighAdmin.dataValues.id,
        message: `An Authority to weigh has been approved.`,
        type: "weigh",
        ticketId
      });
    }

    // Return success response
    return res
      .status(200)
      .json({ message: "Authority to weigh approved successfully", ticket });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const rejectLPO = (req: Request, res: Response) =>
  updateTicketStatus(req, res, {
    model: LPO,
    ticketIdParam: "ticketId",
    status: "rejected",
    notificationMessage: "An LPO was rejected.",
    notificationType: "lpo",
  });
export const rejectStoreAuth = (req: Request, res: Response) =>
  updateTicketStatus(req, res, {
    model: CollectFromGenStore,
    ticketIdParam: "ticketId",
    status: "rejected",
    notificationMessage: "An Authority to collect from store was rejected.",
    notificationType: "store",
  });
export const rejectAuthToWeigh = (req: Request, res: Response) =>
  updateTicketStatus(req, res, {
    model: AuthToWeigh,
    ticketIdParam: "ticketId",
    status: "rejected",
    notificationMessage: "An Authority to collect from store was rejected.",
    notificationType: "weigh",
  });
