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
    const accountBook = await AccountBook.create(
      { ...req.body, creditType: "Transfer" },
      { transaction }
    );
    const ledger = await Ledger.findOne({
      where: { customerId, productId },
      order: [["createdAt", "DESC"]],
      transaction,
    });
    if (ledger) {
      const newCredit = ledger.dataValues.credit + amount;
      const newBalance = ledger.dataValues.balance + amount;

      await ledger.update(
        {
          credit: newCredit,
          balance: newBalance,
        },
        { transaction }
      );
    } else {
      await Ledger.create(
        {
          ...req.body,
          customerId,
          productId,
          unit: "N/A",
          quantity: 0,
          credit: amount,
          debit: 0,
          balance: amount,
          creditType: "Transfer",
        },
        { transaction }
      );
    }

    await transaction.commit();

    return res.status(201).json({
      message: "Account and ledger created/updated successfully",
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

    if (ledgerEntries.length === 0) {
      return res
        .status(404)
        .json({
          message: "No ledger entries found for this customer and product.",
        });
    }

    return res.status(200).json(ledgerEntries);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
};

export const createLedgerfromAccountbook = async (
  req: Request,
  res: Response
) => {};
