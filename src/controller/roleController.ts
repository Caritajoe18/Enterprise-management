import { Request, Response } from "express";
import Role from "../models/role";
import Permission from "../models/permission";
import RolePermission from "../models/rolepermission";
import { createRoleSchema, option } from "../validations/adminValidation";
import { toPascalCase } from "../utilities/auths";

export const addRole = async (req: Request, res: Response) => {
  try {
    const validationResult = createRoleSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    let { name, permissionsId } = req.body;
    name = toPascalCase(name);
    const existingRole = await Role.findOne({
      where: { name },
    });

    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = await Role.create({ ...req.body, name });

    console.log("role", role);

    if (permissionsId && permissionsId.length > 0) {
      const permissionsInstances = await Permission.findAll({
        where: {
          id: permissionsId,
        },
      });
      //console.log(permissionsInstances, "permissions instances");
      const foundPermissionIds = permissionsInstances.map(
        (permission) => permission.dataValues.id
      );

      const missingPermissions = permissionsId.filter(
        (id: string) => !foundPermissionIds.includes(id)
      );

      if (missingPermissions.length > 0) {
        return res.status(404).json({
          message: "Some permissions were not found",
          missingPermissions,
        });
      }
      const rolePermissionData = permissionsInstances.map(
        (permissionInstance) => ({
          roleId: role.dataValues.id,
          permissionId: permissionInstance.dataValues.id,
        })
      );
      //console.log(rolePermissionData, "role permission data");

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
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    if (!roles.length) {
      return res.status(404).json({ error: "No roles found" });
    }

    const rolePermissions = await RolePermission.findAll({
      attributes: ["roleId", "permissionId"],
    });

    const roleIds = roles.map((role) => role.dataValues.id);
    const permissionIds = rolePermissions.map(
      (rp) => rp.dataValues.permissionId
    );

    const permissions = await Permission.findAll({
      where: {
        id: permissionIds,
      },
      attributes: ["id", "name"],
    });

    const rolesWithPermissions = roles.map((role) => {
      const associatedPermissions = rolePermissions
        .filter((rp) => rp.dataValues.roleId === role.dataValues.id)
        .map((rp) => {
          const permission = permissions.find(
            (p) => p.dataValues.id === rp.dataValues.permissionId
          );
          return permission
            ? { id: permission.dataValues.id, name: permission.dataValues.name }
            : null;
        })
        .filter((p) => p !== null);

      return {
        id: role.dataValues.id,
        name: role.dataValues.name,
        permissions: associatedPermissions,
      };
    });

    return res.status(200).json({ roles: rolesWithPermissions });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.findAll({ order: [["name", "ASC"]] });

    return res.status(200).json(roles);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

