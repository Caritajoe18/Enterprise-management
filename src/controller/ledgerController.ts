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
import { Op, Transaction } from "sequelize";
import DepartmentLedger from "../models/departmentLedger";
import {
  calculateNewBalance,
  createAccountBookEntry,
  createDepartmentLedgerEntry,
} from "../utilities/modules";
import Supplier from "../models/suppliers";
import { AuthRequest } from "../middleware/staffPermissions";
import Admins from "../models/admin";
import CustomerOrder from "../models/customerOrder";
import AuthToWeigh from "../models/AuthToWeigh";
import Weigh from "../models/weigh";

export const createAccountAndLedger = async (req: Request, res: Response) => {
  const validationResult = createLedgerSchema.validate(req.body, option);
  if (validationResult.error) {
    console.error("Validation Error:", validationResult.error.details);
    return res
      .status(400)
      .json({ error: validationResult.error.details[0].message });
  }
  const transaction: Transaction = await db.transaction();
  try {
    const {
      customerId,
      credit,
      debit,
      productId,
      supplierId,
      other,
      comments,
      departmentId,
    } = req.body;

    const parsedAmount = new Decimal(credit || debit || 0);
    let accountBook;
    if (customerId) {
      const [customer, product] = await Promise.all([
        Customer.findOne({ where: { id: customerId } }),
        Products.findOne({ where: { id: productId } }),
      ]);

      if (!customer) {
        await transaction.rollback();
        return res.status(404).json({ message: "Customer not found" });
      }
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: "Product not found" });
      }

      accountBook = await createAccountBookEntry(req.body, "Transfer");

      const latestCustomerEntry = await Ledger.findOne({
        where: { customerId },
        order: [["createdAt", "DESC"]],
        transaction,
      });

      const customerNewBalance = calculateNewBalance(
        latestCustomerEntry,
        parsedAmount,
        !!credit // Pass true if credit, false if debit
      );

      await Ledger.create(
        {
          ...req.body,
          customerId,
          productId,
          acctBookId: accountBook.dataValues.id,
          unit: "N/A",
          quantity: 0,
          credit: credit ? parsedAmount.toNumber() : 0,
          debit: debit ? parsedAmount.toNumber() : 0,
          balance: customerNewBalance.toNumber(),
          creditType: "Transfer",
        },
        { transaction }
      );
    } else if (supplierId) {
      accountBook = await createAccountBookEntry(req.body, "Transfer");

      // Fetch the product and products with the same departmentId
      const product = await Products.findOne({ where: { id: productId } });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: "Product not found" });
      }

      const supplier = await Supplier.findOne({ where: { id: supplierId } });
      if (!supplier) {
        await transaction.rollback();
        return res.status(404).json({ message: "Supplier not found" });
      }

      // const departmentId = product.dataValues.departmentId;

      const latestSupplierEntry = await SupplierLedger.findOne({
        where: { supplierId },
        order: [["createdAt", "DESC"]],
        transaction,
      });
      const isCredit = debit ? true : false;

      const supplierNewBalance = calculateNewBalance(
        latestSupplierEntry,
        parsedAmount,
        isCredit
      );
      const supplierDebit = credit ? 0 : parsedAmount.toNumber();
      const supplierCredit = credit ? parsedAmount.toNumber() : 0;

      await SupplierLedger.create(
        {
          ...req.body,
          supplierId,
          productId,
          acctBookId: accountBook.dataValues.id,
          unit: "N/A",
          quantity: 0,
          credit: supplierDebit,
          debit: supplierCredit,
          balance: supplierNewBalance.toNumber(),
          creditType: "Transfer",
        },
        { transaction }
      );
      //console.log("sup", supLedgerEntry);
    } else if (other) {
      accountBook = await createAccountBookEntry(req.body, "Transfer");

      const isCredit = credit ? true : false;
      await createDepartmentLedgerEntry(
        req.body,
        departmentId,
        null,
        other,
        parsedAmount,
        isCredit,
        transaction
      );
    }

    await transaction.commit();
    return res.status(201).json({
      message: "Account and ledger created successfully",
      accountBook,
    });
  } catch (error: unknown) {
    await transaction.rollback();
    console.error("Transaction failed, rolling back:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const getAccountBook = async (req: Request, res: Response) => {
  try {
    const acct: AccountBook[] = await AccountBook.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Customer,
          as: "theCustomer",
          attributes: ["firstname", "lastname"],
        },
        {
          model: Supplier,
          as: "theSupplier",
          attributes: ["firstname", "lastname"],
        },
        {
          model: Products,
          as: "theProduct",
          attributes: ["name"],
        },
      ],
    });
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
export const getSupplierAccountBook = async (req: Request, res: Response) => {
  try {
    const acct: AccountBook[] = await AccountBook.findAll({
      where: {
        supplierId: {
          [Op.ne]: null,
        } as any,
      },
      order: [["createdAt", "DESC"]],
    });

    if (acct.length === 0) {
      return res
        .status(404)
        .json({ message: "No accounts found with a supplierId" });
    }

    return res
      .status(200)
      .json({ message: "Accounts retrieved successfully", acct });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};
export const getOtherAccountBook = async (req: Request, res: Response) => {
  try {
    const acct: AccountBook[] = await AccountBook.findAll({
      where: {
        other: {
          [Op.ne]: null,
        } as any,
      },
      order: [["createdAt", "DESC"]],
    });

    if (acct.length === 0) {
      return res.status(404).json({ message: "No accounts found for Other" });
    }

    return res
      .status(200)
      .json({ message: "Accounts retrieved successfully", acct });
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
      return res
        .status(404)
        .json({ message: "Supplier Ledger entry not found" });
    }

    if (ledgerEntries.length == 0) {
      return res.status(200).json({
        message: "No ledger entries found for this customer.",
        ledgerEntries,
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

export const generateLedgerSummary = async (req: Request, res: Response) => {
  try {
    const { tranxId } = req.params;
    const ledger = await Ledger.findOne({
      where: { tranxId },
    });
    if (!ledger) {
      return res.status(404).json({ message: "Ledger not found" });
    }
    const customerId = ledger.dataValues.customerId;

    const ledgerEntries = await Ledger.findAll({
      where: {
        customerId,
        createdAt: { [Op.gte]: ledger.dataValues.createdAt },
      },
      order: [["createdAt", "ASC"]],
      attributes: [
        "productId",
        "quantity",
        "unit",
        "credit",
        "weighImage",
        "creditType",
        "debit",
        "balance",
        "createdAt",
      ],
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
      ],
    });
    const previousEntries = await Ledger.findAll({
      where: {
        customerId,
        id: { [Op.lt]: ledger.dataValues.id },
      },
      order: [["id", "DESC"]],
      limit: 2,
      include: [
        {
          model: AccountBook,
          as: "accountBook",
          attributes: ["id", "bankName"],
        },
      ],
    });

    console.log("prex",previousEntries)

    let prevBalance = null;
    let credit = null;
    let bankName = null;
    let balanceBeforeDebit = null;
    if (previousEntries.length >= 2) {
      const lastEntry = previousEntries[0];
      const secondLastEntry = previousEntries[1];

      if (lastEntry.dataValues.credit) {
        credit = lastEntry.dataValues.credit;
        balanceBeforeDebit = lastEntry.dataValues.balance;
        const accountBook = lastEntry.get("accountBook") as AccountBook | null;
        console.log("acct", accountBook);
        bankName = accountBook?.dataValues.bankName;

        prevBalance = secondLastEntry.dataValues.balance;
      } else {
        credit = null;
        prevBalance = lastEntry.dataValues.balance;
      }
    } else if (previousEntries.length == 1) {
      //prevBalance = previousEntries[0].dataValues.balance;
      const singleEntry = previousEntries[0]
      if (singleEntry.dataValues.credit) {
        credit = singleEntry.dataValues.credit;
        const accountBook = singleEntry.get("accountBook") as AccountBook | null;
        bankName = accountBook?.dataValues.bankName || null; 
      } else {
        credit = null; 
        bankName = null; 
      }
    
      prevBalance = singleEntry.dataValues.balance;
    }
    const order = await CustomerOrder.findByPk(tranxId, {
      attributes: ["id", "price", "quantity"],
      include: [
        {
          model: Products,
          as: "porders",
          attributes: ["id", "name"],
        },
        {
          model: AuthToWeigh,
          as: "authToWeighTickets",
          attributes: ["id", "vehicleNo", "driver"],
        },
        {
          model: Weigh,
          as: "weighBridge",
          attributes: ["tar", "gross", "net"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const { porders, authToWeighTickets } = order.get() as any;

    const productId = porders?.id;
    const vehicleNo = authToWeighTickets?.vehicleNo;
    const latestLedgerEntry = await Ledger.findOne({
      where: { customerId },
      order: [["createdAt", "DESC"]],
      attributes: ["balance"],
    });
    const currentBalance = latestLedgerEntry
      ? latestLedgerEntry.dataValues.balance
      : 0;

    return res.status(200).json({
      message: "Ledger Summary  generated successfully!",
      ledgerSummary: {
        tranxId,
        customerId,
        productId,
        vehicleNo,
        prevBalance,
        credit,
        balanceBeforeDebit: prevBalance,
        currentBalance,
        bankName,
        ledgerEntries,
      },
      order,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};
