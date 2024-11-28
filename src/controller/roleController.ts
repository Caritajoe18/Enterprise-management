import { Request, Response } from "express";
import Role from "../models/role";
import Permission from "../models/permission";
import RolePermission from "../models/rolepermission";
import {
  createRoleSchema,
  option,
  updateRoleSchema,
} from "../validations/adminValidation";
import { toPascalCase } from "../utilities/auths";
import NavParent from "../models/navparent";
import { Transaction } from "sequelize";
import db from "../db";
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

    if (permissionsId && permissionsId.length > 0) {
      const permissionsInstances = await Permission.findAll({
        where: {
          id: permissionsId,
        },
      });
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
      const role = await Role.create({ ...req.body, name });
      const rolePermissionData = permissionsInstances.map(
        (permissionInstance) => ({
          roleId: role.dataValues.id,
          permissionId: permissionInstance.dataValues.id,
        })
      );

      await RolePermission.bulkCreate(rolePermissionData, { returning: true });
      return res.status(201).json({ role });
    }
    const role = await Role.create({ ...req.body, name });
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
      order: [["createdAt", "DESC"]],
    });

    if (!roles.length) {
      return res.status(404).json({ message: "No roles found" });
    }

    const rolePermissions = await RolePermission.findAll({
      attributes: ["roleId", "permissionId"],
    });

    const permissionIds = rolePermissions.map(
      (rp) => rp.dataValues.permissionId
    );

    const permissionsWithNavParents = await Permission.findAll({
      where: {
        id: permissionIds,
      },
      attributes: ["id", "name", "slug", "navParentId"],
      include: [
        {
          model: NavParent,
          as: "navParent",
          attributes: ["id", "name", "iconUrl", "slug"],
        },
      ],
    });

    const permWithNav = JSON.stringify(permissionsWithNavParents, null, 2);
    const permWithNavs = JSON.parse(permWithNav);

    const rolesWithPermissionsAndNavParents = roles.map((role) => {
      const uniqueNavParentIds = new Set<string>();

      const associatedNav = rolePermissions
        .filter((rp) => rp.dataValues.roleId === role.dataValues.id)
        .map((rp) => {
          const permission = permWithNavs.find(
            (perm: any) => perm.id === rp.dataValues.permissionId
          );
          if (permission) {
            if (!uniqueNavParentIds.has(permission.navParent.id)) {
              uniqueNavParentIds.add(permission.navParent.id);

              return {
                id: permission.navParent.id,
                name: permission.navParent.name,
                slug: permission.navParent.slug,
              };
            }
          }
          return null;
        })
        .filter((nav) => nav !== null);

      return {
        id: role.dataValues.id,
        name: role.dataValues.name,
        nav: associatedNav,
      };
    });

    return res.status(200).json({ roles: rolesWithPermissionsAndNavParents });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const getARoleWithPermission = async (req: Request, res: Response) => {
  const { roleId } = req.params;
  try {
    const role = await Role.findByPk(roleId, {
      attributes: ["id", "name"],
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Fetch permissions with associated NavParents and stringify the result
    let permissionsWithNavParents = await Permission.findAll({
      include: [
        {
          model: Role,
          as: "roles",
          where: { id: roleId },
          attributes: [],
          through: { attributes: [] },
        },
        {
          model: NavParent,
          as: "navParent",
          attributes: ["id", "name", "iconUrl", "slug"],
          required: false,
        },
      ],
      attributes: ["id", "name", "slug", "navParentId"],
    });

    // Stringify and parse permissionsWithNavParents to ensure no undefined issues
    permissionsWithNavParents = JSON.parse(
      JSON.stringify(permissionsWithNavParents)
    );
    // Map NavParents and their associated permissions
    const navParentsMap = new Map<string, any>();
    permissionsWithNavParents.forEach((permission: any) => {
      const navParent = permission.navParent as any;
      
      if (navParent) {
        if (!navParentsMap.has(navParent.id)) {
          navParentsMap.set(navParent.id, {
            id: navParent.id,
            name: navParent.name,
            slug: navParent.slug,
            permissions: [],
          });
        }
        navParentsMap.get(navParent.id).permissions.push({
          id: permission.id,
          name: permission.name,
          slug: permission.slug,
        });
      }
    });

    // Convert map to an array for response
    const navParentsArray = Array.from(navParentsMap.values());

    // Create response object
    const responseObject = {
      role: {
        id: role.dataValues.id,
        name: role.dataValues.name,
        navParents: navParentsArray,
      },
    };

    return res.status(200).json(responseObject);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.findAll({ order: [["createdAt", "DESC"]] });

    return res.status(200).json(roles);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const editRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { name, permissionsId } = req.body;

    // Validate request
    const validationResult = updateRoleSchema.validate(req.body);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    // Fetch the role
    const role = await Role.findOne({
      where: { id: roleId },
      include: [
        {
          model: Permission,
          as: "permissions",
          include: [
            {
              model: NavParent,
              as: "navParent",
            },
          ],
        },
      ],
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Update role name
    let updatedName = name ? toPascalCase(name) : role.dataValues.name;
    if (updatedName !== role.dataValues.name) {
      const existingRole = await Role.findOne({ where: { name: updatedName } });
      if (existingRole) {
        return res.status(400).json({ message: "Role name already exists" });
      }
    }
    await role.update({ name: updatedName });

    // Handle permissions
    const currentPermissionIds =
      role.permissions?.map((p) => p.dataValues.id) || [];
    const permissionsToAdd = permissionsId.filter(
      (id: string) => !currentPermissionIds?.includes(id)
    );
    const permissionsToRemove = currentPermissionIds?.filter(
      (id) => !permissionsId.includes(id)
    );

    if (permissionsToAdd.length > 0) {
      const permissionsToAddInstances = await Permission.findAll({
        where: { id: permissionsToAdd },
      });
      const rolePermissionDataToAdd = permissionsToAddInstances.map(
        (permission) => ({
          roleId: role.dataValues.id,
          permissionId: permission.dataValues.id,
        })
      );
      await RolePermission.bulkCreate(rolePermissionDataToAdd);
    }

    if ((permissionsToRemove ?? []).length > 0) {
      await RolePermission.destroy({
        where: {
          roleId: role.dataValues.id,
          permissionId: permissionsToRemove,
        },
      });
    }

    // Return updated role and its permissions with NavParent
    const updatedPermissions = await Permission.findAll({
      where: { id: permissionsId },
      include: {
        model: NavParent,
        as: "navParent",
      },
    });

    return res.status(200).json({
      role,
      attachedPermissions: role.permissions,
      updatedPermissions,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const editRolePermissions = async (req: Request, res: Response) => {
  const { roleId } = req.params;
  const { name, permissionsId } = req.body;
  const transaction: Transaction = await db.transaction();
  try {
    const validationResult = updateRoleSchema.validate(req.body);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    // Validate the role
    const role = await Role.findByPk(roleId, { transaction });

    if (!role) {
      await transaction.rollback();

      return res.status(404).json({ error: "Role not found." });
    }
    const updatedName = name ? toPascalCase(name) : role.dataValues.name;

    if (updatedName !== role.dataValues.name) {
      const existingRole = await Role.findOne({
        where: { name: updatedName },
        transaction,
      });
      if (existingRole) {
        await transaction.rollback();
        return res.status(400).json({ message: "Role name already exists" });
      }
    }

    await role.update({ name: updatedName }, { transaction });
    console.log("name updated");
    if (!Array.isArray(permissionsId) || permissionsId.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Invalid or empty permissionsId array." });
    }

    // Validate the permissions
    const validPermissions = await Permission.findAll({
      where: { id: permissionsId },
      transaction,
    });

    if (validPermissions.length !== permissionsId.length) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Invalid or duplicate permissions.",
      });
    }

    // Clear existing permissions for the role
    await RolePermission.destroy({
      where: { roleId },
      transaction,
    });

    // Add the new permissions
    const rolePermissions = permissionsId.map((permissionId: string) => ({
      roleId,
      permissionId,
    }));

    await RolePermission.bulkCreate(rolePermissions, { transaction });

    await transaction.commit();

    return res
      .status(200)
      .json({ message: "Role permissions updated successfully." });
  } catch (error: unknown) {
    await transaction.rollback();
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};
