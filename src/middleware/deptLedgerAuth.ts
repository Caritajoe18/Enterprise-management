import { Response, NextFunction } from "express";
import Admins from "../models/admin";
import { AuthRequest } from "./adminAuth";

export const checkDepartmentAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const admin = req.admin as Admins;
  const { isAdmin, department } = admin.dataValues;
  const { departmentId } = req.params;

  try {
    if (isAdmin) {
      return next();
    }

    if (department && department.includes(departmentId)) {
      return next();
    }

    return res
      .status(403)
      .json({ message: "Access denied to this department ledger" });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "An error occurred",
        error: error instanceof Error ? error.message : undefined,
      });
  }
};
