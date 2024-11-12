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
export const getRecords = async (
  req: Request,
  res: Response,
  model: ModelStatic<Model>,
  entityName: string
) => {
  try {
    const records = await model.findAll({
      order: [["createdAt", "DESC"]],
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

export const createAccountBookEntry = async (data: any, creditType: string) => {
  return await AccountBook.create({ ...data, creditType });
};

export const calculateNewBalance = (
  latestEntry: any,
  amount: Decimal,
  isDebit: boolean = false
) => {
  const prevBalance = latestEntry
    ? new Decimal(latestEntry.dataValues.balance)
    : new Decimal(0);
  return isDebit ? prevBalance.minus(amount) : prevBalance.plus(amount);
};

export const createDepartmentLedgerEntry = async (
  data: any,
  departmentId: string,
  productName: string | null,
  name: string,
  amount: Decimal,
  isDebit: boolean,
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
    isDebit
  );
  await DepartmentLedger.create(
    {
      ...data,
      departmentId,
      name,
      productName,
      balance: departmentNewBalance.toNumber(),
      [isDebit ? "debit" : "credit"]: amount.toNumber(),
    },
    { transaction }
  );
};

export const  fetchCustomerAndProduct = async(customerId: string, productId: string)=> {
  const [customer, product] = await Promise.all([
    Customer.findOne({ where: { id: customerId } }),
    Products.findOne({ where: { id: productId } }),
  ]);
  if (!customer) throw new Error("Customer not found");
  if (!product) throw new Error("Product not found");
  return { customer, product };
};

export const  getProductPrice = (product: Products, unit: string): Decimal =>{
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
}


export const applyDiscount = (priceToUse: Decimal, discount: number | null, pricePlan: Plan[] | undefined): Decimal => {
  if (discount && pricePlan) {
    const matchingPlan = pricePlan.find((plan: Plan) => plan.amount === discount);
    if (!matchingPlan) {
      throw new Error(
        `Discount of ${discount} does not match any available price plan. Available plans: ${pricePlan
          .map((plan) => plan.amount)
          .join(", ")}`
      );
    }
    const discountedPrice = priceToUse.minus(new Decimal(discount));
    if (discountedPrice.lessThan(0)) throw new Error("Discount cannot exceed product price.");
    return discountedPrice;
  }
  if (discount && !pricePlan) {
    throw new Error("Discounts are not applicable as no price plan is available.");
  }
  return priceToUse;
}


