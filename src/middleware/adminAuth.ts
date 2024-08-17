import { NextFunction, Response, Request } from "express";
import { verifyToken } from "../utilities/auths";
import { AdminInstance } from '../models/admin';
import dayjs from "dayjs";

export const authenticateAdmin = (roles: string[]) => {
  return async (req: Request | any, res: Response, next: NextFunction) => {
    const authorization = req.headers["authorization"];
    
    if (!authorization) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authorization.split(" ")[1]; // Better handling of token extraction
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    try {
      const verifying = await verifyToken(token);
      if (verifying === "token expired") {
        return res.status(401).json({ error: "Token expired" });
      }

      const { role, id, exp } = verifying as Record<string, string>;
      const now = dayjs().unix();

      if (Number(exp) < now) {
        return res.status(401).json({ error: "Token expired, please login again" });
      }

      // Check if the admin exists in the database
      const admin = await AdminInstance.findOne({ where: { id } }) as AdminInstance;
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      // Check if the user's role is authorized
      if (!roles.includes(role)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Attach the verified admin details to the request object
      //req.admin = {id : admin.dataValues.id.toString(), role: admin.dataValues.role};
      req.admin = verifying;

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};
