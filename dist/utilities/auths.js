"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = exports.bcryptDecode = exports.bcryptEncode = exports.verifyToken = exports.generateToken = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateToken = async (roleId, isAdmin) => {
    const payload = { roleId, isAdmin };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};
exports.generateToken = generateToken;
const generateeToken = async (admin) => {
    const permissions = admin.role.permissions.map((permission) => permission.dataValues.name);
    console.log(permissions, "permissionss");
    const tokenPayload = {
        id: admin.id,
        role: admin.role.name,
        permissions, // Embed permissions into the token
    };
    return jsonwebtoken_1.default.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });
};
const verifyToken = async (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return decoded;
    }
    catch (error) {
        console.error("Error verifying token:", error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return "token expired";
        }
        else {
            throw error;
        }
    }
};
exports.verifyToken = verifyToken;
const bcryptEncode = async (value) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(value.value, salt);
};
exports.bcryptEncode = bcryptEncode;
const bcryptDecode = async (password, comparePassword) => {
    return bcryptjs_1.default.compare(password, comparePassword);
};
exports.bcryptDecode = bcryptDecode;
const generateOtp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const expiry = new Date();
    expiry.setTime(new Date().getTime() + 50 * 60 * 1000);
    return { otp, expiry };
};
exports.generateOtp = generateOtp;
//# sourceMappingURL=auths.js.map