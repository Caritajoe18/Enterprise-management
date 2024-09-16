import { Request, Response } from "express";
import Role from '../models/role';
import Permission from "../models/permission";
import AdminInstance from '../models/admin';
import RolePermission from '../models/rolepermission'

export const addRole = async (req: Request, res: Response) => {
    try {
      const { name, permissionsId } = req.body;

      const existingRole = await Role.findOne({
        where: { name },
      });
  
      if (existingRole) {
        return res.status(400).json({ message: 'Role already exists' });
      }
  
      const role = await Role.create({ ...req.body, name });
  
      if (permissionsId && permissionsId.length > 0) {

        const permissionsInstances = await Permission.findAll({
          where: {
            id: permissionsId,
          },
        });
        console.log(permissionsInstances, "permissions instances");
        // for (const permissionInstance of permissionsInstances) {
        //   await RolePermission.create({
        //     roleId: role.dataValues.id,
        //     permissionId: permissionInstance.dataValues.id,
        //   });
        // }

        // Alternatively
      // await Promise.all(permissionsInstances.map(permissionInstance =>
      //   RolePermission.create({
      //     roleId: role.dataValues.id,
      //     permissionId: permissionInstance.dataValues.id,
      //   })
      // ));
        const rolePermissionData = permissionsInstances.map((permissionInstance) => ({
            roleId: role.dataValues.id,
            permissionId: permissionInstance.dataValues.id,
          }));
          console.log(rolePermissionData, "role permission data");
    
          // Perform bulk insert into RolePermission table
          await RolePermission.bulkCreate(rolePermissionData, { returning: true });
          
        }
        console.log(RolePermission, "role permission")
  
        return res.status(201).json({ role });
      } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An error occurred" });
      }
    };
export const getAllRoles = async(req:Request, res:Response)=>{
try {
  // const roles = await Role.findAll({
  //   include: [{
  //     model: Permission,
  //     as: 'permissions',
  //     attributes: ['id', 'name'],
  //   }],
  //   attributes: ['id', 'name'],
  // });

  const roles = await Role.findAll({
    attributes: ['id', 'name'], // Fetch role attributes
  });

  if (!roles.length) {
    return res.status(404).json({ error: 'No roles found' });
  }


  const rolePermissions = await RolePermission.findAll({
    attributes: ['roleId', 'permissionId'], // Fetch role-permission attributes
  });

  
  const roleIds = roles.map(role => role.dataValues.id);
  const permissionIds = rolePermissions.map(rp => rp.dataValues.permissionId);

  
  const permissions = await Permission.findAll({
    where: {
      id: permissionIds,
    },
    attributes: ['id', 'name'], 
  });

  // Combine roles with their permissions
  const rolesWithPermissions = roles.map(role => {
    const associatedPermissions = rolePermissions
      .filter(rp => rp.dataValues.roleId === role.dataValues.id)
      .map(rp => {
        const permission = permissions.find(p => p.dataValues.id === rp.dataValues.permissionId);
        return permission ? { id: permission.dataValues.id, name: permission.dataValues.name } : null;
      })
      .filter(p => p !== null);

    return {
      id: role.dataValues.id,
      name: role.dataValues.name,
      permissions: associatedPermissions,
    };
  });


  return res.status(200).json({ roles : rolesWithPermissions});
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