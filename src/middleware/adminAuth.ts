import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utilities/auths';
import Admins from '../models/admin'; 
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: Admins;
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

  
    const { id, isAdmin } = decoded  as JwtPayload;

    
    if (!id && !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized: No user ID in token' });
    }

    if (isAdmin) {
      const admin = await Admins.findOne({ where: { isAdmin: true, id } });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      req.admin = admin;
        return next();  
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
