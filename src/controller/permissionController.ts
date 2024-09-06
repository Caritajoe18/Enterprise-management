import { Request, Response } from "express";
import Permission from "../models/permission";

export const createPermissions = async (req: Request, res: Response) => {
    const { permissions } = req.body; 
  
    try {
      
      if (!Array.isArray(permissions) || permissions.length === 0) {
        return res.status(400).json({ message: 'Permissions must be a non-empty array' });
      }
  

      const createdPermissions: any = await Permission.bulkCreate(
        permissions.map((name: string) => ({ ...req.body,name })),
        { returning: true }
      );
  

      return res.status(201).json({ permissions: createdPermissions });
    } catch (error) {
      console.error('Error creating permissions:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

export const removePermission = async (req: Request, res:Response)=>{

}