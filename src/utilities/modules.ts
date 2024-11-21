import { Request, Response } from "express";
import { Model, ModelStatic, Transaction } from "sequelize";
import Admins from "../models/admin";
import Notify from "../models/notification";
import { getAdminConnection } from "../utilities/web-push";
import AccountBook from "../models/accountBook";
import Decimal from "decimal.js";
import DepartmentLedger from "../models/departmentLedger";
import Customer from "../models/customers";
import Products, { Plan } from "../models/products";
import { AuthRequest } from "../middleware/staffPermissions";
import Role from "../models/role";
export const getRecords = async (
  req: Request,
  res: Response,
  model: ModelStatic<Model>,
  entityName: string
) => {
  try {
    const records = await model.findAll({
      order: [["createdAt", "DESC"]],
      //where:{status: "approved"}
    });

    if (records.length === 0) {
      return res
        .status(200)
        .json({ message: `No ${entityName} Found`, records });
    }

    res.status(200).json({
      message: `Successfully retrieved ${entityName}`,
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

export const sendTicketToAdmin = async (
  ticketModel: ModelStatic<Model>,
  req: Request,
  res: Response,
  messageType: string,
  messageContent: string
) => {
  const { Id } = req.params;
  const { adminId } = req.body;

  try {
    const ticket = await ticketModel.findByPk(Id);
    const admin = await Admins.findByPk(adminId);

    if (!ticket || !admin) {
      return res.status(404).json({ message: "Ticket or admin not found" });
    }

    await Notify.create({
      ...req.body,
      adminId,
      message: messageContent,
      type: messageType,
      ticketId: Id,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: messageContent,
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
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const approveTicket = async (
  req: AuthRequest,
  res: Response,
  model: ModelStatic<Model>,
  ticketIdParam: string,
  status: string,
  notificationMessage: string,
  notificationType: string
) => {
  const admin = req.admin as Admins;
  const { id } = admin.dataValues;
  const ticketId = req.params[ticketIdParam];

  try {
    const ticket = await model.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.set({
      status,
      approvedBySuperAdminId: id,
    });

    await ticket.save();
    const notification = await Notify.findOne({ where: { ticketId } });
    //console.log("Notification found:", notification);
    if (notification) {
      await notification.update({ read: true });
    }
    await Notify.create({
      ...req.body,
      adminId: ticket.dataValues.raisedByAdminId,
      message: notificationMessage,
      type: notificationType,
      ticketId,
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
export const approveReceipt = async (
  req: AuthRequest,
  res: Response,
  model: ModelStatic<Model>,
  receiptIdParam: string
) => {
  const admin = req.admin as Admins;
  const { id } = admin.dataValues;
  const recieptId = req.params[receiptIdParam];

  try {
    const ticket = await model.findByPk(recieptId);

    if (!ticket) {
      return res.status(404).json({ message: "Reciept not found" });
    }

    ticket.set({
      status: "approved",
    });

    await ticket.save();
    const notification = await Notify.findOne({ where: { ticketId: recieptId } });
    //console.log("Notification found:", notification);
    if (notification) {
      await notification.update({ read: true });
    }
    // await Notify.create({
    //   ...req.body,
    //   adminId: ticket.dataValues.raisedByAdminId,
    //   message: notificationMessage,
    //   type: notificationType,
    //   ticketId,
    // });

    return res
      .status(200)
      .json({ message: "Receipt approved successfully", ticket });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const getSingleRecord = async (
  req: Request,
  res: Response,
  model: ModelStatic<Model>,
  entityName: string
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    const record = await model.findOne({
      where: {
        id,
        //status: "approved",
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });

    if (!record) {
      return res.status(404).json({ message: `${entityName} not found.` });
    }

    res.status(200).json({
      message: `Successfully retrieved ${entityName}`,
      record,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};

export const createAccountBookEntry = async (data: any, creditType: string) => {
  return await AccountBook.create({ ...data, creditType });
};

export const calculateNewBalance = (
  latestEntry: any,
  amount: Decimal,
  isCredit: boolean
): Decimal => {
  const prevBalance = latestEntry
    ? new Decimal(latestEntry.dataValues.balance)
    : new Decimal(0);
  return isCredit ? prevBalance.plus(amount) : prevBalance.minus(amount);
};

export const createDepartmentLedgerEntry = async (
  data: any,
  departmentId: string,
  productName: string | null,
  name: string,
  amount: Decimal,
  isCredit: boolean,
  transaction?: Transaction
) => {
  const departmentLatestEntry = await DepartmentLedger.findOne({
    where: { departmentId },
    order: [["createdAt", "DESC"]],
    transaction,
  });

  const departmentNewBalance = calculateNewBalance(
    departmentLatestEntry,
    amount,
    isCredit
  );

  await DepartmentLedger.create(
    {
      ...data,
      departmentId,
      name,
      productName,
      balance: departmentNewBalance.toNumber(),
      credit: isCredit ? amount.toNumber() : 0,
      debit: !isCredit ? amount.toNumber() : 0,
    },
    { transaction }
  );
};
export const fetchCustomerAndProduct = async (
  customerId: string,
  productId: string
) => {
  const [customer, product] = await Promise.all([
    Customer.findOne({ where: { id: customerId } }),
    Products.findOne({ where: { id: productId } }),
  ]);
  if (!customer) throw new Error("Customer not found");
  if (!product) throw new Error("Product not found");
  return { customer, product };
};

export const getProductPrice = (product: Products, unit: string): Decimal => {
  let prices = Array.isArray(product.dataValues.price)
    ? product.dataValues.price
    : JSON.parse(product.dataValues.price || "[]");
  const productPrice = prices.find((p: any) => p.unit === unit);
  if (!productPrice) {
    const availableUnits = prices.map((p: any) => p.unit).join(", ");
    throw new Error(
      `Price not found for unit "${unit}". Available units: [${availableUnits}].`
    );
  }
  return new Decimal(productPrice.amount);
};

export const applyDiscount = (
  priceToUse: Decimal,
  discount: number | null,
  pricePlan: Plan[] | undefined
): Decimal => {
  if (discount && pricePlan) {
    const matchingPlan = pricePlan.find(
      (plan: Plan) => plan.amount === discount
    );
    if (!matchingPlan) {
      throw new Error(
        `Discount of ${discount} does not match any available price plan. Available plans: ${pricePlan
          .map((plan) => plan.amount)
          .join(", ")}`
      );
    }
    const discountedPrice = priceToUse.minus(new Decimal(discount));
    if (discountedPrice.lessThan(0))
      throw new Error("Discount cannot exceed product price.");
    return discountedPrice;
  }
  if (discount && !pricePlan) {
    throw new Error(
      "Discounts are not applicable as no price plan is available."
    );
  }
  return priceToUse;
};

export const removeQuantityFromStore = async (
  req: Request,
  res: Response,
  StoreModel: ModelStatic<Model>
) => {
  const { amount } = req.body;
  const { Id } = req.params;

  try {
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount value" });
    }

    const storeEntry = await StoreModel.findByPk(Id);

    if (!storeEntry) {
      return res
        .status(404)
        .json({ message: `${StoreModel.name} entry not found` });
    }

    if (storeEntry.dataValues.quantity < amount) {
      return res
        .status(400)
        .json({ message: "Insufficient quantity to remove" });
    }

    storeEntry.dataValues.quantity -= amount;

    await storeEntry.save();

    return res.status(200).json({
      message: "Quantity removed successfully",
      data: storeEntry,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const addQuantityToStore = async (
  req: Request,
  res: Response,
  StoreModel: ModelStatic<Model>
) => {
  const { amount } = req.body;
  const { Id } = req.params;

  try {
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount value" });
    }

    const storeEntry = await StoreModel.findByPk(Id);

    if (!storeEntry) {
      return res
        .status(404)
        .json({ message: `${StoreModel.name} entry not found` });
    }

    storeEntry.dataValues.quantity += amount;

    await storeEntry.save();

    return res.status(200).json({
      message: "Quantity added successfully",
      data: storeEntry,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const updateTicketStatus = async (
  req: Request,
  res: Response,
  options: {
    model: ModelStatic<Model>;
    ticketIdParam: string;
    status: string;
    notificationMessage: string;
    notificationType: string;
  }
) => {
  const {
    ticketIdParam,
    model,
    status,
    notificationMessage,
    notificationType,
  } = options;
  const ticketId = req.params[ticketIdParam];

  try {
    // Find ticket by ID
    const ticket = await model.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.dataValues.status = status;
    await ticket.save();
    const notification = await Notify.findOne({ where: { ticketId } });
    console.log("Notification found:", notification);
    if (notification && !notification.dataValues.read) {
      await notification.update({ read: true });
    }

    await Notify.create({
      ...req.body,
      adminId: ticket.dataValues.raisedByAdminId,
      message: notificationMessage,
      type: notificationType,
      ticketId,
    });

    return res
      .status(200)
      .json({ message: `Ticket ${status} successfully`, ticket });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};
