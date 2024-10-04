import { Request, Response } from "express";
import db from "../db";
import AccountBook from "../models/accountBook";
import Ledger from "../models/ledger";
import { option } from "../validations/adminValidation";
import { createLedgerSchema } from "../validations/customerValid";
import Customer from "../models/customers";
import Products from "../models/products";

export const createAccountandLedger = async (req: Request, res: Response) => {
  const validationResult = createLedgerSchema.validate(req.body, option);
  if (validationResult.error) {
    return res
      .status(400)
      .json({ error: validationResult.error.details[0].message });
  }
  const transaction = await db.transaction();
  try {
    const { customerId, amount, productId } = req.body;
    const customer = await Customer.findOne({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const product = await Products.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("helooo1");
    const accountBook = await AccountBook.create(
      { ...req.body, creditType: "Transfer" },
      { transaction }
    );
    console.log("helooo2");
    const latestEntry = await Ledger.findOne({
      where: { customerId, productId },
      order: [["createdAt", "DESC"]],
      transaction,
    });
    console.log("helooooooo3");
    const prevBalance = latestEntry ? latestEntry.dataValues.balance : 0;
    const newBalance: number = prevBalance + amount;

    console.log(`Previous Balance: ${prevBalance}`);
    console.log(`New Balance: ${newBalance}`);

    await Ledger.create(
      {
        ...req.body,
        customerId,
        productId,
        unit: "N/A",
        quantity: 0,
        credit: amount,
        debit: 0,
        balance: newBalance,
        creditType: "Transfer",
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Account and ledger created successfully",
      accountBook,
    });
  } catch (error: unknown) {
    await transaction.rollback();

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const getAccountBook = async (req: Request, res: Response) => {
  try {
    const acct = await AccountBook.findAll({ order: [["createdAt", "DESC"]] });
    if (acct.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }
     return  res.status(200).json({ message: "Account retrieved successfully", acct });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const getCustomerLedgerByProduct = async (
  req: Request,
  res: Response
) => {
  const { customerId, productId } = req.params;

  try {
    const ledgerEntries = await Ledger.findAll({
      where: {
        customerId,
        productId,
      },
    });
    if (!ledgerEntries) {
      return res.status(404).json({ message: "Customer or Product not found" });
    }

    if (ledgerEntries.length === 0) {
      return res.status(404).json({
        message: "No ledger entries found for this customer and product.",
      });
    }

    return res
      .status(200)
      .json({ message: "ledger retrieved successfully", ledgerEntries });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
};

export const getProductLedger = async (req: Request, res: Response) => {
  const { productId } = req.params;
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required." });
  }
  try {
    const ledgerEntries = await Ledger.findAll({
      where: {
        productId,
      },
      order: [["createdAt", "DESC"]],
    });
    if (!ledgerEntries) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (ledgerEntries.length === 0) {
      return res.status(404).json({
        message: "No ledger entries found for this product.",
      });
    }

    return res
      .status(200)
      .json({ message: "ledger retrieved successfully", ledgerEntries });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
};
export const getCustomerLedger = async (req: Request, res: Response) => {
  const { customerId } = req.params;
  if (!customerId) {
    return res.status(400).json({ message: "customer ID is required." });
  }
  try {
    const ledgerEntries = await Ledger.findAll({
      where: {
        customerId,
      },
      order: [["createdAt", "DESC"]],
    });
    if (!ledgerEntries) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (ledgerEntries.length == 0) {
      return res.status(404).json({
        message: "No ledger entries found for this customer.",
      });
    }

    return res
      .status(200)
      .json({ message: "ledger retrieved successfully", ledgerEntries });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
};
