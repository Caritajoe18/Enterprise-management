import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utilities/auths";
import RolePermission from "../models/rolepermission";  
import Permission from "../models/permission";
import { JwtPayload } from "jsonwebtoken";  

interface AuthRequest extends Request {
  admin?: any;  
}

export const authorize = (requiredPermission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers["authorization"];
      if (!authorization) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
      }

      const token = authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized: Invalid token format" });
      }

      
      const decoded = await verifyToken(token);

      
      if (typeof decoded === "string") {
        return res.status(401).json({ message: decoded });  
      }

      const { roleId , isAdmin} = decoded as JwtPayload;  
      if (!roleId && !isAdmin) {
        return res.status(401).json({ message: "Unauthorized: No roleId or admin rights found" });
      }
      if (isAdmin) {
        return next();  // Admins bypass the permission check
      }

      if (roleId) {
        // Find the permissionId from the Permission table
        const permission = await Permission.findOne({
          where: { name: requiredPermission },
        });

      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }

      // Check if the role has the required permission
      const rolePermission = await RolePermission.findOne({
        where: { roleId, permissionId: permission.dataValues.id },
      });

      if (!rolePermission) {
        return res.status(403).json({ message: "Access Denied: Insufficient permissions" });
      }

      // Proceed if permission is found
      next();
    }
    } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An error occurred" });
      }
  };
};






    
