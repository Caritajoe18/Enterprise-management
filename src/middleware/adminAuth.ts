import { NextFunction, Response, Request } from "express";
import { verifyToken } from "../utilities/auths";
import { AdminInstance } from '../models/admin';
import dayjs from "dayjs";

export const authenticateAdmin = (roles: string[]) => {
  return async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const token = req.headers["authorization"];
      console.log('Token:', token);
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const verifying = await verifyToken(token);
      if (verifying === "token expired") {
        return res.status(401).json({ error: "Token expired" });
      }

      const { role, id, exp } = verifying as Record<string, string>;

      const now = dayjs().unix();
      console.log('Current time:', now);

      if (Number(exp) < Number(now)) {
        return res
          .status(401)
          .json({ error: "Token expired, please login again" });
      }

      // Check if the admin exists in the database
      const admin = await AdminInstance.findOne({ where: { id } }) as AdminInstance;

      if (!admin) {
        return res.status(400).json({ error: "Admin not found" });
      }

      // Check if the user's role is authorized
      if (!roles.includes(role)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log("admiiii", admin);

      // Attach the admin ID to the request object
      req.admin = admin.dataValues.id.toString();

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};
