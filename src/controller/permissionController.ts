import { Request, Response } from "express";
import Permission from "../models/permission";
import Role from "../models/role";
import RolePermission from "../models/rolepermission";
import { ValidationError } from "sequelize";
import NavParent from "../models/navparent";
import { sequelize } from "../models/index";

export const createPermissions = async (req: Request, res: Response) => {
  const { name, navParentId, url } = req.body;

  try {
    const slug = name.toLowerCase().replace(/ /g, "-");

    const existingPermission = await Permission.findOne({ where: { url } });
    if (existingPermission) {
      return res
        .status(400)
        .json({ message: "Permission already exists" });
    }
    let navParent = null;

    if (navParentId) {
      navParent = await NavParent.findByPk(navParentId);
      if (!navParent) {
        return res.status(400).json({ message: "Invalid navParent" });
      }
    }
    const newPermission = await Permission.create({
      ...req.body,
      navParentId: navParent ? navParent.dataValues.id : null,
      url,
      slug,
    });

    return res.status(201).json({ permissions: newPermission });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      console.error("Validation error details:", error.errors);
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message) });
    }

    if (error instanceof Error) {
      console.error("Error creating permission:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An error occurred" });
  }
};

export const bulkEditPermissions = async (req: Request, res: Response) => {
  const { permissions } = req.body; // Expected to be an array of permission objects with id and fields to update

  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({ message: "Permissions array is required." });
  }

  try {
    const updatePromises = permissions.map(async (permission) => {
      const { id, name, orderIndex, url } = permission;

      // Validate the permission ID
      const existingPermission = await Permission.findByPk(id);
      if (!existingPermission) {
        return { id, message: `Permission with ID ${id} not found` };
      }

      // Prepare the updated fields
      const updatedFields: any = {};
      if (name) {
        updatedFields.name = name;
        updatedFields.slug = name.toLowerCase().replace(/ /g, "-");
      }
      if (url) {
        updatedFields.url = url;
      }
      if (orderIndex) {
        updatedFields.orderIndex = orderIndex;
      }

      // Update the permission with the dynamic fields
      await existingPermission.update(updatedFields);

      return { id, message: "Permission updated successfully" };
    });

    const results = await Promise.all(updatePromises);

    // Filter out any failed updates and return the results
    const failedUpdates = results.filter(
      (result) =>
        result.message.includes("not found") ||
        result.message.includes("Invalid")
    );
    if (failedUpdates.length) {
      return res.status(400).json({
        message: "Some permissions failed to update",
        details: failedUpdates,
      });
    }

    return res
      .status(200)
      .json({ message: "Permissions updated successfully", details: results });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      console.error("Validation error details:", error.errors);
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message) });
    }

    if (error instanceof Error) {
      console.error("Error updating permissions:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An error occurred" });
  }
};
export const addPermissionsToRole = async (req: Request, res: Response) => {
  const { roleId } = req.params;
  const { permissionsId } = req.body;
  try {
    if (!Array.isArray(permissionsId) || permissionsId.length === 0) {
      return res
        .status(400)
        .json({ message: "Permissions must be a non-empty array" });
    }

    const role = await Role.findByPk(roleId);

    //console.log("roleid1", roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const permissions = await Permission.findAll({
      where: {
        id: permissionsId,
      },
    });

    if (permissions.length === 0) {
      return res.status(404).json({ message: "Permissions not found" });
    }

    const existingRolePermissions = await RolePermission.findAll({
      where: {
        roleId,
        permissionId: permissionsId,
      },
    });

    const existingPermissionIds = existingRolePermissions.map(
      (rp) => rp.dataValues.permissionId
    );

    const newPermissions = permissions.filter(
      (permission) => !existingPermissionIds.includes(permission.dataValues.id)
    );

    if (newPermissions.length === 0) {
      return res.status(400).json({
        message: "All provided permissions are already added to this role",
      });
    }
    const rolePermissionData = newPermissions.map((permission) => ({
      roleId,
      permissionId: permission.dataValues.id,
    }));

    await RolePermission.bulkCreate(rolePermissionData, { returning: true });

    res.status(200).json({
      message: "Permissions added to role successfully",
      addedPermissions: newPermissions,
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
  const { roleId } = req.params;
  const { permissionsId } = req.body;

  try {
    if (!Array.isArray(permissionsId) || permissionsId.length === 0) {
      return res
        .status(400)
        .json({ message: "Permissions must be a non-empty array" });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const permissions = await Permission.findAll({
      where: {
        id: permissionsId,
      },
    });

    if (permissions.length === 0) {
      return res.status(404).json({ message: "Permissions not found" });
    }

    await sequelize.transaction(async (t) => {
      await RolePermission.destroy({
        where: {
          roleId,
          permissionId: permissionsId,
        },
        transaction: t,
      });
    });

    res.status(200).json({
      message: "Permissions removed from role successfully",
      removedPermissions: permissions,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await Permission.findAll();

    return res.status(200).json({ permissions });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
