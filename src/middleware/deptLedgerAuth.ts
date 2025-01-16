import { Response, NextFunction } from "express";
import Admins from "../models/admin";
import { AuthRequest } from "./adminAuth";
import { verifyToken } from "../utilities/auths";
import { JwtPayload } from "jsonwebtoken";

export const checkDepartmentAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers["authorization"];
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid token format" });
    }

    // Step 2: Verify the token
    const decoded = await verifyToken(token);
    if (typeof decoded === "string") {
      return res.status(401).json({ message: decoded });
    }

    const { id, isAdmin } = decoded as JwtPayload;
    const { departmentId } = req.params;

    if (isAdmin) {
      return next();
    }
    const admin = await Admins.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const department = admin.dataValues.department;
    if (!department || !department.includes(departmentId)) {
      return res
        .status(403)
        .json({ message: "Access denied to this department ledger" });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred",
      error: error instanceof Error ? error.message : undefined,
    });
  }
};
