import { Request, Response } from "express";
import db from "../db";
import AccountBook from "../models/accountBook";
import Ledger from "../models/ledger";
import { option } from "../validations/adminValidation";
import { createLedgerSchema } from "../validations/customerValid";
import Customer from "../models/customers";
import Products from "../models/products";
import Decimal from "decimal.js";
import SupplierLedger from "../models/supplierLedger";
import Departments from "../models/department";

export const createAccountAndLedger = async (req: Request, res: Response) => {
  const validationResult = createLedgerSchema.validate(req.body, option);
  if (validationResult.error) {
    console.error("Validation Error:", validationResult.error.details);
    return res
      .status(400)
      .json({ error: validationResult.error.details[0].message });
  }

  // const transaction = await db.transaction();
  try {
    const { customerId, amount, productId, supplierId } = req.body;

    const parsedAmount = new Decimal(amount);
    let accountBook;
    if (customerId) {
      // Find Customer and Product in parallel for better performance
      const [customer, product] = await Promise.all([
        Customer.findOne({ where: { id: customerId } }),
        Products.findOne({ where: { id: productId } }),
      ]);

      if (!customer) {
        // await transaction.rollback();
        return res.status(404).json({ message: "Customer not found" });
      }
      if (!product) {
        // await transaction.rollback();
        return res.status(404).json({ message: "Product not found" });
      }

      //console.log("Creating account book entry...");
      accountBook = await AccountBook.create(
        { ...req.body, creditType: "Transfer" }
        // { transaction }
      );

      //console.log("Fetching latest ledger entry...");
      const latestEntry = await Ledger.findOne({
        where: { customerId, productId },
        order: [["createdAt", "DESC"]],
        // transaction,  // Ensure this operation is under the same transaction
      });

      const prevBalance = latestEntry
        ? new Decimal(latestEntry.dataValues.balance)
        : new Decimal(0);
      const newBalance = prevBalance.plus(parsedAmount);

      // console.log("Creating new ledger entry...");
      await Ledger.create({
        ...req.body,
        customerId,
        productId,
        unit: "N/A",
        quantity: 0,
        credit: parsedAmount.toNumber(),
        debit: 0,
        balance: newBalance.toNumber(),
        creditType: "Transfer",
      });
    } else if (supplierId) {
      // console.log("Creating account book entry for supplier...");
      accountBook = await AccountBook.create({
        ...req.body,
        creditType: "Transfer",
      });

      // Fetch the product and products with the same departmentId
      const product = await Products.findOne({ where: { id: productId } });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const {departmentId} = product.dataValues

      const latestEntry = await SupplierLedger.findOne({
        where: { supplierId, productId },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Products,
            as: "customer",
            include: [
              {
                model: Departments,
                as: "department",
                where: { id: departmentId },
                attributes: ["id", "name"]
              }
            ],
            attributes: ["id", "name", "departmentId"]
          }
        ]
      });
    

      const supplierPrevBalance = latestEntry
        ? new Decimal(latestEntry.dataValues.balance)
        : new Decimal(0);
      const supplierNewBalance = supplierPrevBalance.plus(parsedAmount);

      await SupplierLedger.create({
        ...req.body,
        supplierId,
        productId,
        unit: "N/A",
        quantity: 0,
        credit: parsedAmount.toNumber(),
        debit: 0,
        balance: supplierNewBalance.toNumber(),
        creditType: "Transfer",
      });
    }
    

    return res.status(201).json({
      message: "Account and ledger created successfully",
      accountBook,
    });
  } catch (error: unknown) {
    console.error("Transaction failed, rolling back:", error);

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
    return res
      .status(200)
      .json({ message: "Account retrieved successfully", acct });
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
export const getSupplierLedger = async (req: Request, res: Response) => {
  const { supplierId } = req.params;
  if (!supplierId) {
    return res.status(400).json({ message: "customer ID is required." });
  }
  try {
    const ledgerEntries = await SupplierLedger.findAll({
      where: {
        supplierId,
      },
      order: [["createdAt", "DESC"]],
    });
    if (!ledgerEntries) {
      return res.status(404).json({ message: "Supplier Ledger entry not found" });
    }

    if (ledgerEntries.length == 0) {
      return res.status(200).json({
        message: "No ledger entries found for this customer.",ledgerEntries
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
