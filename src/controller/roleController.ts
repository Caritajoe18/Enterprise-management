import { Request, Response } from "express";
import Role from '../models/role';
import Permission from "../models/permission";
import AdminInstance from '../models/admin';
import RolePermission from '../models/rolepermission'

export const addRole = async (req: Request, res: Response) => {
    try {
      const { name, permissions } = req.body;

      const existingRole = await Role.findOne({
        where: { name },
      });
  
      if (existingRole) {
        return res.status(400).json({ message: 'Role already exists' });
      }
  
      const role = await Role.create({ ...req.body, name });
  
      if (permissions && permissions.length > 0) {

        const permissionsInstances = await Permission.findAll({
          where: {
            name: permissions,
          },
        });

        const rolePermissionData = permissionsInstances.map((permissionInstance) => ({
            roleId: role.dataValues.id,
            permissionId: permissionInstance.dataValues.id,
          }));
    
          // Perform bulk insert into RolePermission table
          await RolePermission.bulkCreate(rolePermissionData, { returning: true });
          
        }
  
        return res.status(201).json({ role });
      } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An error occurred" });
      }
    };

  
export const assignRoleToAdmin = async (req: Request, res: Response) => {
    try {
        const { adminId, roleId } = req.body;

        // Find the admin and role
        const admin = await AdminInstance.findByPk(adminId);
        const role = await Role.findByPk(roleId);

        if (!admin || !role) {
            return res.status(404).json({ message: 'Admin or Role not found' });
        }

        // Assign role to admin
        await admin.update({ roleId });

        res.status(200).json({ message: 'Role assigned to admin' });
    } catch (error) {
        console.error('Error assigning role to admin:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
export const removeRole = async (req: Request, res:Response)=>{

}