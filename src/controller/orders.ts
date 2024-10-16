import CustomerOrder from "../models/customerOrder";
import { Products } from "../models/products";
import { Response, Request } from "express";
import { customerOrderSchema } from "../validations/customerValid";
import { option } from "../validations/adminValidation";
import Customer from "../models/customers";
import Ledger from "../models/ledger";
import Decimal from 'decimal.js';
import db from "../db";

export const raiseCustomerOrder = async (req: Request, res: Response) => {
  const { customerId, productId, quantity, unit } = req.body;
  //const transaction = await db.transaction();
  try {
    const validationResult = customerOrderSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    const customer = await Customer.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ message: "customer not found" });
    }
    const product = await Products.findOne({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const prices = Array.isArray(product.dataValues.price) 
  ? product.dataValues.price 
  : [product.dataValues.price];

    const productPrice = prices.find(
      (p: any) => p.unit === unit
    );
    if (!productPrice) {
      throw new Error(`Price not found for unit: ${unit}`);
    }

    const unitPrice = new Decimal(productPrice.amount); 
    const parsedQuantity = new Decimal(quantity);
    const totalPrice = unitPrice.mul(parsedQuantity); 
    console.log(`${unitPrice} * ${parsedQuantity} = ${totalPrice} (Total Price)`);


    const newOrder = await CustomerOrder.create({
      ...req.body,
      customerId,
      productId,
      unit,
      quantity,
      price: totalPrice.toNumber()
    });

    console.log("Order created successfully:", newOrder);

    const latestEntry = await Ledger.findOne({
      where: { customerId, productId },
      order: [["createdAt", "DESC"]],
      //transaction,
    });

    const prevBalance = latestEntry 
      ? new Decimal(latestEntry.dataValues.balance) 
      : new Decimal(0);

    const newBalance = prevBalance.minus(totalPrice);
    console.log(`Previous Balance: ${prevBalance}, New Balance: ${newBalance}`);
    console.log(`Previous Balance: ${prevBalance}, New Balance: ${newBalance}`);

    
    await Ledger.create({
      ...req.body,
      customerId,
      productId,
      unit,
      quantity,
      credit: 0,
      debit: totalPrice.toNumber(), 
      balance: newBalance.toNumber(),
    });
    // await transaction.commit();
    // console.log("Transaction committed successfully.");

    return res.status(201).json({
      message: "Order raised and ledger updated successfully",
      order: newOrder,
    });
  } catch (error: unknown) {
    console.error("Transaction failed:", error);

    // Attempt to rollback the transaction
    // try {
    //   await transaction.rollback();
    // } catch (rollbackError) {
    //   console.error("Rollback failed:", rollbackError);
    //   return res.status(500).json({ error: "Rollback failed. Check logs." });
    // }

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const getOrdersByProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;

  try {
    const orders = await CustomerOrder.findAll({
      where: { productId },
      include: [
        { model: Customer,as: "corder", attributes: ['customerTag', 'firstname', 'lastname'] },
        { model: Products,as: "porders", attributes: ['name', 'price', 'pricePlan'] },
        
      ],
      order: [["createdAt", "DESC"]]
      //logging: console.log, //
    });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this product" });
    }

    return res.status(200).json(orders);
  } catch (error: unknown) {
    console.error("Transaction failed:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await CustomerOrder.findAll({ order: [["createdAt", "DESC"]]
    });

    return res.status(200).json(orders);
  } catch (error: unknown) {
    console.error("Transaction failed:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const getOrdersByCustomer = async (req: Request, res: Response) => {
  const { customerId } = req.params;

  try {
    const orders = await CustomerOrder.findAll({
      where: { customerId },
      include: [
        { model: Customer,as: "corder", attributes: ['customerTag', 'firstname', 'lastname'] },
        { model: Products,as: "porders", attributes: ['name', 'price', 'pricePlan'] },
      ],
      order: [["createdAt", "DESC"]]
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this customer' });
    }

    return res.status(200).json(orders);
  } catch (error: unknown) {
    console.error("Transaction failed:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

