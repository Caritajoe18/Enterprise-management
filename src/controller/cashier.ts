import { Request, Response } from "express";
import CashierBook from "../models/cashierbook";

export const createCashierEntry = async (req: Request, res: Response) => {
  try {
    const { approvedByAdminId, comment, credit, debit } =
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
          order: [['createdAt', 'DESC']],
        });
    
        if (entries.length === 0) {
            return res.status(204).json({messege: "No Cashier Found", entries});
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
