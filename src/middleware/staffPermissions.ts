import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utilities/auths";
import RolePermission from "../models/rolepermission";  
import Permission from "../models/permission";
import { JwtPayload } from "jsonwebtoken";  
import Admins from "../models/admin";

export interface AuthRequest extends Request {
  admin?: Admins;  
}

export const authorize = () => {
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

      const { id, roleId, isAdmin } = decoded  as JwtPayload;

      if (!id || (!roleId && !isAdmin)) {
        return res.status(401).json({ message: "Unauthorized: No roleId or admin rights found" });
      }

      if (isAdmin) {
        const admin = await Admins.findOne({ where: { isAdmin: true, id } });
        if (!admin) {
          return res.status(404).json({ message: "Admin not found" });
        }

        req.admin = admin;
        return next();  
      }

      if (roleId) {
        const admin = await Admins.findByPk(id);
        if (!admin) {
          return res.status(404).json({ message: "Admin with the roleId not found" });
        }

        req.admin = admin;
        const permissionUrl = req.path.startsWith('/') ? req.path.slice(1) : req.path;

        const permission = await Permission.findOne({
          where: { url: permissionUrl  }, 
        });

        if (!permission) {
          return res.status(404).json({ message: "unauthorized" });
        }

        
        const rolePermission = await RolePermission.findOne({
          where: { roleId, permissionId: permission.dataValues.id },
        });

        if (!rolePermission) {
          return res.status(403).json({ message: "Access Denied: Insufficient permissions" });
        }

        
        next();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "An error occurred" });
    }
  };
};





// export const authorizePermission = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const staff = req.admin;  token verification
//     const requestedUrl = req.originalUrl;

//     
//     const role = await Role.findOne({
//       where: { id: staff.roleId },
//       include: {
//         model: Permission,
//         as: 'permissions',
//         where: { url: requestedUrl },
//       },
//     });

//     if (!role) {
//       return res.status(403).json({ message: 'Access denied: No permissions for this route' });
//     }

//   
//     next();
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };
