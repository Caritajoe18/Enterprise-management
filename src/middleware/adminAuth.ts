import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utilities/auths'; // Assuming you have a verifyToken function
import Admins from '../models/admin'; // Import your Admin model

export interface AuthRequest extends Request {
  admin?: any;
}

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }

    const decoded = await verifyToken(token);
    if (typeof decoded === 'string') {
      return res.status(401).json({ message: decoded });
    }

    const { id, roleId, isAdmin } = decoded as { id: string, roleId: string, isAdmin: boolean };

    if (!id) {
      return res.status(401).json({ message: 'Unauthorized: No user ID in token' });
    }

    // Find the admin by ID
    const admin = await Admins.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Error authenticating admin:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
