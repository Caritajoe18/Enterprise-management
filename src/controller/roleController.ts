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
import { Op } from "sequelize";

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

    //console.log("role", role);

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
      order: [["createdAt", "DESC"]],
    });

    console.log("roles:", roles);
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
    //console.log("prem:", permissionsWithNavParents);
    // Map NavParents and their associated permissions
    const navParentsMap = new Map<string, any>();
    permissionsWithNavParents.forEach((permission: any) => {
      const navParent = permission.navParent as any;
      // console.log("prem2:", navParent);
      // console.log("prem3:", navParent.id);

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
      //console.log("prem4:", navParent);
      // console.log("prem5:",permissions)
    });

    // Convert map to an array for response
    const navParentsArray = Array.from(navParentsMap.values());
    //console.log("role:", role);
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
    const currentPermissionIds = role.permissions?.map((p) => p.dataValues.id);
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


    // Find the role
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    let updatedName = name ? toPascalCase(name) : role.dataValues.name;
    if (updatedName !== role.dataValues.name) {
      const existingRole = await Role.findOne({ where: { name: updatedName } });
      if (existingRole) {
        return res.status(400).json({ message: "Role name already exists" });
      }
    }
    await role.update({ name: updatedName });

    // Get the current permissions for the role
    const currentRolePermissions = await RolePermission.findAll({
      where: { roleId },
    });
    const currentPermissionIds = currentRolePermissions.map((rp) => rp.dataValues.permissionId);

    // Determine permissions to remove and add
    const permissionsToRemove = currentPermissionIds.filter(id => !permissionsId.includes(id));
    const permissionsToAdd = permissionsId.filter((id: any) => !currentPermissionIds.includes(id));

    // Remove permissions not included in the new permissionsId array
    if (permissionsToRemove.length > 0) {
      await RolePermission.destroy({
        where: {
          roleId,
          permissionId: permissionsToRemove,
        },
      });
    }

    // Add new permissions
    if (permissionsToAdd.length > 0) {
      const newPermissions = permissionsToAdd.map((permissionId: any) => ({
        roleId,
        permissionId,
      }));
      await RolePermission.bulkCreate(newPermissions);
    }

    return res.status(200).json({
      message: "Role permissions updated successfully",
      addedPermissions: permissionsToAdd,
      removedPermissions: permissionsToRemove,
    });
  } catch (error: unknown) {
    console.error("Error updating role permissions:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};



