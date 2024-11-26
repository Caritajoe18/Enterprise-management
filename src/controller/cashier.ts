import { Request, Response } from "express";
import CashierBook from "../models/cashierbook";
import DepartmentLedger from "../models/departmentLedger";
import OfficialReceipt from "../models/officialReceipt";

export const createCashierEntry = async (req: Request, res: Response) => {
  try {
    const { name, approvedByAdminId, comment, credit, debit, departmentId } =
      req.body;

    const lastEntry = await CashierBook.findOne({
      order: [["createdAt", "DESC"]],
    });

    const lastBalance = lastEntry
      ? parseFloat(lastEntry.dataValues.balance as unknown as string)
      : 0;
    const newBalance =
      lastBalance +
      (credit ? parseFloat(credit) : 0) -
      (debit ? parseFloat(debit) : 0);

    const newEntry = await CashierBook.create({
      ...req.body,
      approvedByAdminId,
      comment,
      credit,
      debit,
      balance: newBalance,
    });

    if (departmentId) {
      const lastDeptLedgerEntry = await DepartmentLedger.findOne({
        where: { departmentId },
        order: [["createdAt", "DESC"]],
      });

      const lastDeptBalance = lastDeptLedgerEntry
        ? parseFloat(
            lastDeptLedgerEntry.dataValues.balance as unknown as string
          )
        : 0;

      const newDeptBalance =
        lastDeptBalance +
        (credit ? parseFloat(credit) : 0) -
        (debit ? parseFloat(debit) : 0);

      await DepartmentLedger.create({
        ...req.body,
        name,
        departmentId,
        credit,
        debit,
        balance: newDeptBalance,
        comments: comment,
      });
    }

    return res.status(201).json({
      message: "Cashier entry created successfully",
      data: newEntry,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};

export const getCashierEntry = async (req: Request, res: Response) => {
  try {
    const entries = await CashierBook.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (entries.length === 0) {
      return res.status(204).json({ messege: "No Cashier Found", entries });
    }
    res.status(200).json({
      message: "successfully retrieved Cashier entries",
      entries,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};

export const getReceipt = async (req: Request, res: Response) => {
  try {
    const { receiptId } = req.params;

    // Find a specific cashier entry by ID
    const receipt = await OfficialReceipt.findOne({
      where: {
        id: receiptId,
      },
      include: [
        {
          model: CashierBook,
          as: "cashier",
          attributes: ["name", "credit"],
        },
      ],
    });

    if (!receipt) {
      return res.status(404).json({ message: "Cashier entry not found" });
    }

    res.status(200).json({
      message: "Successfully retrieved cashier entry",
      receipt,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
export const createOfficialReceipt = async (req: Request, res: Response) => {
  try {
    const { cashierId } = req.params;
    const { of, being } = req.body;
    const cashierBook = await CashierBook.findByPk(cashierId);

    if (!cashierBook) {
      return res.status(404).json({ message: "CashierBook not found" });
    }

    const officialReceipt = await OfficialReceipt.create({
      ...req.body,
      of,
      being,
      cashierId,
    });

    return res.status(201).json({
      message: "OfficialReceipt created successfully",
      officialReceipt,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};

//generating reciept solely from Cashier book

export const getEntryforReceipt = async (req: Request, res: Response) => {
  try {
    const { cashierId } = req.params;

    // Find a specific cashier entry by ID
    const cashierEntry = await CashierBook.findOne({
      where: {
        id: cashierId,
      },
      attributes: ["id", "name", "credit", "createdAt"],
      
    });

    if (!cashierEntry) {
      return res.status(404).json({ message: "Cashier entry not found" });
    }

    res.status(200).json({
      message: "Successfully retrieved cashier entry",
      cashierEntry,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};