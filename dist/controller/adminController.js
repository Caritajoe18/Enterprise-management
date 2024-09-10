"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.loginAdmin = exports.loginMial = exports.signupAdmin = exports.loginurl = void 0;
const adminValidation_1 = require("../validations/adminValidation");
const admin_1 = __importDefault(require("../models/admin"));
const auths_1 = require("../utilities/auths");
const sendVerification_1 = require("../utilities/sendVerification");
const htmls_1 = require("../utilities/htmls");
exports.loginurl = `http/3000/frontend login`;
const signupAdmin = async (req, res) => {
    try {
        const validationResult = adminValidation_1.signUpSchema.validate(req.body, adminValidation_1.option);
        if (validationResult.error) {
            return res
                .status(400)
                .json({ error: validationResult.error.details[0].message });
        }
        const { email, password, roleName, firstname, isAdmin } = req.body;
        // Check if the admin already exists by email
        const exist = await admin_1.default.findOne({ where: { email } });
        if (exist) {
            return res.status(400).json({ error: "Email already exists" });
        }
        // Hash the password
        const passwordHashed = await (0, auths_1.bcryptEncode)({ value: password });
        // Create the new admin and associate the roleName directly
        const admin = await admin_1.default.create({
            ...req.body,
            password: passwordHashed,
            roleName,
            isAdmin: true
        });
        // Send verification email
        await (0, sendVerification_1.sendVerificationMail)(email, exports.loginurl, firstname, htmls_1.generateVerificationEmailHTML);
        // Return response
        return res.status(201).json({
            message: "Admin created successfully, check your email to activate your account",
            admin,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: "An error occurred" });
    }
};
exports.signupAdmin = signupAdmin;
const loginMial = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await admin_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                error: "user not found please sign up",
            });
        }
        if (user.dataValues.isVerified) {
            return res.status(400).json({ error: "User already verified" });
        }
        const fullname = user.dataValues.firstname;
        await (0, sendVerification_1.sendVerificationMail)(email, exports.loginurl, fullname, htmls_1.generateVerificationEmailHTML);
        return res.status(201).json({
            message: "A new login has been sent to your mail",
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred." });
    }
};
exports.loginMial = loginMial;
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const valid = adminValidation_1.loginSchema.validate(req.body, adminValidation_1.option);
        if (valid.error) {
            return res.status(400).json({ error: valid.error.details[0].message });
        }
        const admin = (await admin_1.default.findOne({
            where: { email },
        }));
        if (!admin) {
            return res.status(401).json({ error: "invalid credentials" });
        }
        //console.log("adminnnnnn", admin);
        if (!admin.dataValues.active) {
            return res.status(403).json({ error: "unauthorized access" });
        }
        const isValid = await (0, auths_1.bcryptDecode)(password, admin.dataValues.password);
        if (!isValid) {
            return res.status(401).json({ error: "invalid credentials" });
        }
        // if (!admin.dataValues.isVerified) {
        //   return res.status(401).json({
        //     error: "please verify your email",
        //   });
        // }
        const { roleId, isAdmin } = admin.dataValues;
        const token = await (0, auths_1.generateToken)(roleId, isAdmin);
        console.log(token);
        return res
            .status(200)
            .json({ messages: "login successfull", admin, token });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An error occurred" });
    }
};
exports.loginAdmin = loginAdmin;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await admin_1.default.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: "Email not found" });
        }
        const { id, isAdmin, firstname } = user.dataValues;
        const token = await (0, auths_1.generateToken)(id, isAdmin);
        await user.update({ ...req.body, resetPasswordToken: token });
        await (0, sendVerification_1.sendVerificationMail)(email, token, firstname, htmls_1.generateTokenEmailHTML);
        return res
            .status(200)
            .json({ message: "Reset password link sent to your email" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    console.log(req.body);
    const { token } = req.params;
    const { password } = req.body;
    try {
        const validatedInput = adminValidation_1.resetPasswordSchema.validate(req.body, adminValidation_1.option);
        if (validatedInput.error) {
            return res
                .status(400)
                .json({ error: validatedInput.error.details[0].message });
        }
        const decodedToken = await (0, auths_1.verifyToken)(token);
        if (!decodedToken) {
            return res.status(401).json({
                error: "Invalid or expired token",
            });
        }
        const { id } = decodedToken;
        const user = await admin_1.default.findOne({ where: { id: id } });
        console.log("userrr", user);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        else {
            const passwordHashed = await (0, auths_1.bcryptEncode)({ value: password });
            req.body.password = passwordHashed;
            const updated = await user.update({
                ...req.body,
                password: passwordHashed,
                resetPasswordToken: null,
            });
            return res
                .status(200)
                .json({ message: "Password reset successful", updated });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=adminController.js.map