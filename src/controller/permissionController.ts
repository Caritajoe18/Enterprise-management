import { Request, Response } from "express";
import Permission from "../models/permission";
import Role from "../models/role";
import RolePermission from "../models/rolepermission";
import { Op, ValidationError } from "sequelize";
import NavParent from "../models/navparent";

export const createPermissions = async (req: Request, res: Response) => {
  const { name, isNav, navParentId } = req.body;

  try {
    const slug = name.toLowerCase().replace(/ /g, "-");

    
    const existingPermission = await Permission.findOne({ where: { slug } });
    if (existingPermission) {
      return res
        .status(400)
        .json({ message: "Permission name already exists" });
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
      url: name,
      slug
    });

    return res.status(201).json({ permissions: newPermission });
  }catch (error: unknown) {
    
    if (error instanceof ValidationError) {
      console.error('Validation error details:', error.errors);
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }

    if (error instanceof Error) {
      console.error('Error creating permission:', error.message);
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

    console.log("roleid1", roleId);

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
    const rolePermissionData = permissions.map((permission) => ({
      roleId,
      permissionId: permission.dataValues.id,
    }));

    await RolePermission.bulkCreate(rolePermissionData, { returning: true });

    console.log("roleid3", roleId);

    res.status(200).json({
      message: "Permissions added to role successfully",
      addedPermissions: permissions,
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

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    // Fetch all permissions from the database
    const permissions = await Permission.findAll();

    return res.status(200).json({ permissions });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
