"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const auths_1 = require("../utilities/auths");
const admin_1 = __importDefault(require("../models/admin"));
const dayjs_1 = __importDefault(require("dayjs"));
const authenticateAdmin = (products) => {
    return async (req, res, next) => {
        console.log("Request Object:", req);
        const authorization = req.headers["authorization"];
        if (!authorization) {
            return res.status(401).json({ error: "No token provided" });
        }
        const token = authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Invalid token format" });
        }
        try {
            const verifying = await (0, auths_1.verifyToken)(token);
            if (verifying === "token expired") {
                return res.status(401).json({ error: "Token expired" });
            }
            const { products, id, exp } = verifying;
            const now = (0, dayjs_1.default)().unix();
            if (Number(exp) < now) {
                return res
                    .status(401)
                    .json({ error: "Token expired, please login again" });
            }
            const admin = (await admin_1.default.findOne({
                where: { id },
            }));
            if (!admin) {
                return res.status(404).json({ error: "Admin not found" });
            }
            if (!products.includes(products)) {
                return res.status(403).json({ error: "Unauthorized" });
            }
            req.admin = verifying;
            console.log("Updated Request Object:", req);
            console.log(req.admin.id); // Logs the admin's ID
            console.log(req.admin.role); // Logs the admin's role
            next();
        }
        catch (error) {
            console.error("Authentication error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    };
};
exports.authenticateAdmin = authenticateAdmin;
//# sourceMappingURL=adminAuth.js.map