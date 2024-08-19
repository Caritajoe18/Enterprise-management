import { NextFunction, Response, Request } from "express";
import { verifyToken } from "../utilities/auths";
import { AdminInstance } from "../models/admin";
import dayjs from "dayjs";

interface AuthRequest extends Request {
  role?: string
}

export const authenticateAdmin = (roles: string[]) => {
  return async (req: AuthRequest | any , res: Response, next: NextFunction) => {

    console.log("Request Object:", req);

    const authorization = req.headers["authorization"];

    if (!authorization) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authorization.split(" ")[1];
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
        return res
          .status(401)
          .json({ error: "Token expired, please login again" });
      }

      const admin = (await AdminInstance.findOne({
        where: { id },
      })) as AdminInstance;
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      if (!roles.includes(role)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      req.admin = verifying;

      console.log("Updated Request Object:", req)

      next();
    } catch (error) {
      console.error("Authentication error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};
