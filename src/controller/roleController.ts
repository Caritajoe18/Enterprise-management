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

  // export const editRole = async (req: Request, res: Response) => {
  //   const { roleId } = req.params;
  //   const { name, permissions } = req.body;
  
  //   try {
  //     // Find the role to edit
  //     const role = await Role.findByPk(roleId);
  //     if (!role) {
  //       return res.status(404).json({ message: 'Role not found' });
  //     }
  
  //     // Update role name if provided
  //     if (name) {
  //       role.name = name;
  //       await role.save();
  //     }
  
  //     if (permissions) {
  //       // Fetch current permissions and new permissions in bulk
  //       const [currentPermissions, permissionsInstances] = await Promise.all([
  //         role.getPermissions(), // Fetch current permissions
  //         Permission.findAll({ where: { id: permissions } }), // Fetch new permissions
  //       ]);
  
  //       // Convert to sets for easy comparison
  //       const currentPermissionIds = new Set(currentPermissions.map(p => p.id));
  //       const newPermissionIds = new Set(permissions);
  
  //       // Determine permissions to add and remove
  //       // const permissionsToAdd = permissionsInstances.filter(p => !currentPermissionIds.has(p.id));
  //       // const permissionsToRemove = currentPermissions.filter(p => !newPermissionIds.has(p.id));
  
  //       // // Perform bulk operations
  //       // await Promise.all([
  //       //   role.addPermissions(permissionsToAdd),
  //       //   role.removePermissions(permissionsToRemove),
  //       // ]);
  //     }
  
  //     // Optionally include permissions in response
  //     const updatedRole = await Role.findByPk(roleId, { include: 'permissions' });
  
  //     return res.status(200).json({ role: updatedRole });
  //   } catch (error) {
  //     console.error('Error editing role:', error);
  //     return res.status(500).json({ message: 'Internal Server Error' });
  //   }
  // };

// Assign a role to an admin
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