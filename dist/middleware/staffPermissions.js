"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const auths_1 = require("../utilities/auths");
const rolepermission_1 = __importDefault(require("../models/rolepermission"));
const permission_1 = __importDefault(require("../models/permission"));
const authorize = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const authorization = req.headers["authorization"];
            if (!authorization) {
                return res.status(401).json({ message: "Unauthorized: No token provided" });
            }
            const token = authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized: Invalid token format" });
            }
            const decoded = await (0, auths_1.verifyToken)(token);
            if (typeof decoded === "string") {
                return res.status(401).json({ message: decoded });
            }
            const { roleId, isAdmin } = decoded;
            if (!roleId && !isAdmin) {
                return res.status(401).json({ message: "Unauthorized: No roleId or admin rights found" });
            }
            if (isAdmin) {
                return next(); // Admins bypass the permission check
            }
            if (roleId) {
                // Find the permissionId from the Permission table
                const permission = await permission_1.default.findOne({
                    where: { name: requiredPermission },
                });
                if (!permission) {
                    return res.status(404).json({ message: "Permission not found" });
                }
                // Check if the role has the required permission
                const rolePermission = await rolepermission_1.default.findOne({
                    where: { roleId, permissionId: permission.dataValues.id },
                });
                if (!rolePermission) {
                    return res.status(403).json({ message: "Access Denied: Insufficient permissions" });
                }
                // Proceed if permission is found
                next();
            }
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            }
            res.status(500).json({ error: "An error occurred" });
        }
    };
};
exports.authorize = authorize;
//# sourceMappingURL=staffPermissions.js.map