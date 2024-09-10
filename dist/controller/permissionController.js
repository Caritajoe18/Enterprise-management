"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePermissionsFromRole = exports.addPermissionsToRole = exports.createPermissions = void 0;
const permission_1 = __importDefault(require("../models/permission"));
const role_1 = __importDefault(require("../models/role"));
const rolepermission_1 = __importDefault(require("../models/rolepermission"));
const sequelize_1 = require("sequelize");
const createPermissions = async (req, res) => {
    const { permissions } = req.body;
    try {
        if (!Array.isArray(permissions) || permissions.length === 0) {
            return res
                .status(400)
                .json({ message: "Permissions must be a non-empty array" });
        }
        const existingPermissions = await permission_1.default.findAll({
            where: {
                name: permissions,
            },
        });
        const existingPermissionNames = existingPermissions.map((perm) => perm.name);
        const duplicates = permissions.filter((perm) => existingPermissionNames.includes(perm));
        if (duplicates.length > 0) {
            return res.status(400).json({
                message: `The following permissions already exist: ${duplicates.join(", ")}`,
            });
        }
        const createdPermissions = await permission_1.default.bulkCreate(permissions.map((name) => ({ ...req.body, name })), { returning: true });
        return res.status(201).json({ permissions: createdPermissions });
    }
    catch (error) {
        console.error("Error creating permissions:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.createPermissions = createPermissions;
const addPermissionsToRole = async (req, res) => {
    const roleId = req.params.roleId;
    const { permissions } = req.body;
    try {
        // Find the role
        const role = await role_1.default.findByPk(roleId);
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
        const createdPermissions = await Promise.all(permissions.map(async (name) => {
            const [permission, created] = await permission_1.default.findOrCreate({
                ...req.body,
                where: { name },
                defaults: { name }
            });
            return permission;
        }));
        // Find the permissions to add
        // const Permissions = await Permission.findAll({
        //   where: {
        //     name: permissions,
        //   },
        // });
        //await role.addPermissions(permissionsToAdd);
        const permissionIds = createdPermissions.map(p => p.dataValues.id);
        console.log("roleid3", roleId);
        const rolePermissionData = permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
        }));
        // Perform bulk insert into RolePermission table
        await rolepermission_1.default.bulkCreate(rolePermissionData, { returning: true });
        res
            .status(200)
            .json({
            message: "Permissions added to role successfully",
            createdPermissions,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred." });
    }
};
exports.addPermissionsToRole = addPermissionsToRole;
const removePermissionsFromRole = async (req, res) => {
    const roleId = req.params.roleId;
    const { permissions } = req.body;
    try {
        // Find the role
        const role = await role_1.default.findByPk(roleId);
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        if (!Array.isArray(permissions) || permissions.length === 0) {
            return res
                .status(400)
                .json({ message: "Permissions must be a non-empty array" });
        }
        // Find permissions to remove
        const permissionsToRemove = await permission_1.default.findAll({
            where: {
                name: permissions,
            },
        });
        const permissionIdsToRemove = permissionsToRemove.map((p) => p.dataValues.id);
        // Remove permissions from RolePermission table
        await rolepermission_1.default.destroy({
            where: {
                roleId,
                permissionId: {
                    [sequelize_1.Op.in]: permissionIdsToRemove,
                },
            },
        });
        res
            .status(200)
            .json({ message: "Permissions removed from role successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "An unexpected error occurred." });
        }
    }
};
exports.removePermissionsFromRole = removePermissionsFromRole;
//# sourceMappingURL=permissionController.js.map