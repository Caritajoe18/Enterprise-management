import { Request, Response } from "express";
import Permission from "../models/permission";
import Role from "../models/role";
import RolePermission from "../models/rolepermission";
import sequelize from "../db";
import { Op, QueryTypes } from "sequelize";

export const createPermissions = async (req: Request, res: Response) => {
  const { permissions } = req.body;

  try {
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res
        .status(400)
        .json({ message: "Permissions must be a non-empty array" });
    }
    const existingPermissions = await Permission.findAll({
      where: {
        name: permissions,
      },
    });
    const existingPermissionNames = existingPermissions.map(
      (perm: any) => perm.name
    );
    const duplicates = permissions.filter((perm: string) =>
      existingPermissionNames.includes(perm)
    );

    if (duplicates.length > 0) {
      return res.status(400).json({
        message: `The following permissions already exist: ${duplicates.join(
          ", "
        )}`,
      });
    }

    const createdPermissions: any = await Permission.bulkCreate(
      permissions.map((name: string) => ({ ...req.body, name })),
      { returning: true }
    );

    return res.status(201).json({ permissions: createdPermissions });
  } catch (error) {
    console.error("Error creating permissions:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addPermissionsToRole = async (req: Request, res: Response) => {
  const roleId = req.params.roleId;
  const { permissions } = req.body;
  try {
    // Find the role
    const role = await Role.findByPk(roleId);
    console.log("roleid1", roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res
        .status(400)
        .json({ message: "Permissions must be a non-empty array" });
    }
    console.log("roleid2", roleId);

    // const createdPermissions: any = await Permission.bulkCreate(
    //   permissions.map((name: string) => ({ ...req.body, name })),
    //   { returning: true }
    // );

    const createdPermissions = await Promise.all(
      permissions.map(async (name: string) => {
        const [permission, created] = await Permission.findOrCreate({
          ...req.body,
          where: { name },
          defaults: { name }
        });
        return permission;
      })
    );

    // Find the permissions to add
    // const Permissions = await Permission.findAll({
    //   where: {
    //     name: permissions,
    //   },
    // });
    //await role.addPermissions(permissionsToAdd);

    const permissionIds = createdPermissions.map(p => p.dataValues.id);

    console.log("roleid3", roleId);
    const rolePermissionData = permissionIds.map((permissionId: string) => ({
      roleId,
      permissionId,
    }));


    // Perform bulk insert into RolePermission table
    await RolePermission.bulkCreate(rolePermissionData, { returning: true });

    res
      .status(200)
      .json({
        message: "Permissions added to role successfully",
        createdPermissions,
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
       return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const removePermissionsFromRole = async (
  req: Request,
  res: Response
) => {
  const roleId = req.params.roleId;
  const { permissions } = req.body;

  try {
    // Find the role
    const role = await Role.findByPk(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res
        .status(400)
        .json({ message: "Permissions must be a non-empty array" });
    }

    // Find permissions to remove
    const permissionsToRemove = await Permission.findAll({
      where: {
        name: permissions,
      },
    });

    const permissionIdsToRemove = permissionsToRemove.map(
      (p) => p.dataValues.id
    );

    // Remove permissions from RolePermission table
    await RolePermission.destroy({
      where: {
        roleId,
        permissionId: {
          [Op.in]: permissionIdsToRemove,
        },
      },
    });

    res
      .status(200)
      .json({ message: "Permissions removed from role successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
