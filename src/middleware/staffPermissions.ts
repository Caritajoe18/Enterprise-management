import { Request, Response, NextFunction } from 'express';
import Admin from '../models/admin'; 
import Role from '../models/role'; 
import Permission from '../models/permission'; 
interface AuthRequest extends Request {
    user?: any; // Adjust based on how you attach the user to the request
}

export const authorize = (requiredPermission: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            // Assuming the user ID is stored in the request object after authentication
            const adminId = req.user?.id;
            console.log('userrrr', adminId)

            if (!adminId) {
                return res.status(401).json({ message: 'Unauthorized: No admin ID found' });
            }

            // Fetch the admin with their role and permissions
            const admin = await Admin.findByPk(adminId, {
                include: [{
                    model: Role,
                    as: 'role',
                    include: [{
                        model: Permission,
                        as: 'permissions',
                        attributes: ['name']
                    }],
                }],
            });

            if (!admin || !admin.role || !admin.role.permissions) {
              return res.status(403).json({ message: 'Access Denied: Insufficient permissions' });
          }
            // Extract permissions from the role
            const rolePermissions = admin.role.permissions.map((permission: Permission) => permission.dataValues.name);

            // Check if the admin has the required permission
            const hasPermission = rolePermissions.includes(requiredPermission);

            if (!hasPermission) {
                return res.status(403).json({ message: 'Access Denied: Insufficient permissions' });
            }

            // If authorized, proceed to the next middleware or route handler
            next();
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};
