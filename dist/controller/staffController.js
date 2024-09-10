"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchStaff = exports.getSuspendedStaff = exports.getAllStaff = exports.deleteStaff = exports.restoreStaff = exports.suspendStaff = exports.updateStaff = exports.signupStaff = void 0;
const admin_1 = __importDefault(require("../models/admin"));
const adminValidation_1 = require("../validations/adminValidation");
const auths_1 = require("../utilities/auths");
const sendVerification_1 = require("../utilities/sendVerification");
const htmls_1 = require("../utilities/htmls");
const sequelize_1 = require("sequelize");
const adminController_1 = require("./adminController");
const role_1 = __importDefault(require("../models/role"));
const signupStaff = async (req, res) => {
    try {
        const validationResult = adminValidation_1.signUpSchema.validate(req.body, adminValidation_1.option);
        if (validationResult.error) {
            return res
                .status(400)
                .json({ error: validationResult.error.details[0].message });
        }
        const { email, password, firstname, roleName } = req.body;
        const exist = await admin_1.default.findOne({ where: { email } });
        if (exist) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const role = await role_1.default.findOne({ where: { name: roleName } });
        if (!role) {
            return res.status(400).json({ error: "Role does not exist" });
        }
        const passwordHashed = await (0, auths_1.bcryptEncode)({ value: password });
        const user = await admin_1.default.create({
            ...req.body,
            roleId: role.dataValues.id,
            password: passwordHashed,
        });
        //console.log(user, "uerrrrr issss");
        await (0, sendVerification_1.sendVerificationMail)(email, adminController_1.loginurl, firstname, htmls_1.generateVerificationEmailHTML);
        return res.status(201).json({
            message: "Staff created successfully, Check your email to activate your account",
            user
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An error occurred" });
    }
};
exports.signupStaff = signupStaff;
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const validationResult = adminValidation_1.updateStaffSchema.validate(req.body, adminValidation_1.option);
        if (validationResult.error) {
            return res
                .status(400)
                .json({ error: validationResult.error.details[0].message });
        }
        const staff = await admin_1.default.findByPk(id);
        if (!staff) {
            return res.status(404).json({ error: "staff not found" });
        }
        const updatedStaff = await staff.update(req.body);
        res
            .status(200)
            .json({ message: "Staff updated successfully", updatedStaff });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred." });
    }
};
exports.updateStaff = updateStaff;
const suspendStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await admin_1.default.findByPk(id);
        if (!staff || !staff.dataValues.active) {
            return res
                .status(404)
                .json({ error: "staff not found or already suspended" });
        }
        if (staff.dataValues.isAdmin) {
            return res.status(403).json({ message: "Cannont Suspend this user" });
        }
        await admin_1.default.update({ active: false }, { where: { id }, returning: true });
        res.status(200).json({ message: "Staff suspended successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred" });
    }
};
exports.suspendStaff = suspendStaff;
const restoreStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await admin_1.default.findByPk(id);
        if (!staff) {
            return res.status(404).json({ error: "Staff not found" });
        }
        await admin_1.default.update({ active: true }, { where: { id }, returning: true });
        res.status(200).json({ message: "Staff restored successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred" });
    }
};
exports.restoreStaff = restoreStaff;
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await admin_1.default.findByPk(id);
        if (!staff) {
            return res.status(404).json({ error: "staff not found" });
        }
        if (staff.dataValues.isAdmin) {
            res.status(403).json({ message: "Cannont delete this user" });
        }
        const deletedStaff = await staff.destroy();
        res.status(200).json({ message: "Staff deleted successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred" });
    }
};
exports.deleteStaff = deleteStaff;
const getAllStaff = async (req, res) => {
    try {
        const staffList = await admin_1.default.findAll({
            order: [["fullname", "ASC"]],
        });
        if (staffList.length === 0) {
            return res.status(204).send();
        }
        res
            .status(200)
            .json({ message: "Staff retrieved successfully", staffList });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred" });
    }
};
exports.getAllStaff = getAllStaff;
const getSuspendedStaff = async (req, res) => {
    try {
        const suspendedStaffList = await admin_1.default.findAll({
            where: { active: false },
        });
        if (suspendedStaffList.length === 0) {
            return res.status(404).json({ message: "No suspended staff found" });
        }
        res
            .status(200)
            .json({
            message: "Suspended staff retrieved successfully",
            suspendedStaffList,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        else {
            return res.status(500).json({ error: "An unexpected error occurred" });
        }
    }
};
exports.getSuspendedStaff = getSuspendedStaff;
const searchStaff = async (req, res) => {
    try {
        const { search } = req.query;
        const whereClause = {};
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { fullname: { [sequelize_1.Op.like]: `%${search}%` } },
                { department: { [sequelize_1.Op.like]: `%${search}%` } },
                { role: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        const staffList = await admin_1.default.findAll({ where: whereClause });
        if (staffList.length == 0) {
            return res
                .status(404)
                .json({ message: "No staff found matching the criteria" });
        }
        res
            .status(200)
            .json({ message: "Staff retrieved successfully", staffList });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "An unexpected error occurred" });
        }
    }
};
exports.searchStaff = searchStaff;
//# sourceMappingURL=staffController.js.map