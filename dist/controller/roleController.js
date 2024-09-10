"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRole = exports.assignRoleToAdmin = exports.addRole = void 0;
const role_1 = __importDefault(require("../models/role"));
const permission_1 = __importDefault(require("../models/permission"));
const admin_1 = __importDefault(require("../models/admin"));
const rolepermission_1 = __importDefault(require("../models/rolepermission"));
const addRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const existingRole = await role_1.default.findOne({
            where: { name },
        });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists' });
        }
        const role = await role_1.default.create({ ...req.body, name });
        if (permissions && permissions.length > 0) {
            const permissionsInstances = await permission_1.default.findAll({
                where: {
                    name: permissions,
                },
            });
            const rolePermissionData = permissionsInstances.map((permissionInstance) => ({
                roleId: role.dataValues.id,
                permissionId: permissionInstance.dataValues.id,
            }));
            // Perform bulk insert into RolePermission table
            await rolepermission_1.default.bulkCreate(rolePermissionData, { returning: true });
        }
        return res.status(201).json({ role });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An error occurred" });
    }
};
exports.addRole = addRole;
const assignRoleToAdmin = async (req, res) => {
    try {
        const { adminId, roleId } = req.body;
        // Find the admin and role
        const admin = await admin_1.default.findByPk(adminId);
        const role = await role_1.default.findByPk(roleId);
        if (!admin || !role) {
            return res.status(404).json({ message: 'Admin or Role not found' });
        }
        // Assign role to admin
        await admin.update({ roleId });
        res.status(200).json({ message: 'Role assigned to admin' });
    }
    catch (error) {
        console.error('Error assigning role to admin:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.assignRoleToAdmin = assignRoleToAdmin;
const removeRole = async (req, res) => {
};
exports.removeRole = removeRole;
//# sourceMappingURL=roleController.js.map