"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateStaffSchema = exports.sendVerification = exports.resetPasswordSchema = exports.loginSchema = exports.signUpSchema = exports.option = void 0;
const joi_1 = __importDefault(require("joi"));
exports.option = {
    abortEarly: false,
    errors: {
        wrap: {
            label: "",
        },
    },
};
const passwordSchema = joi_1.default.string()
    .min(5)
    .max(15)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,15}$/)
    .message("Password must be between 5 and 15 characters, contain at least one lowercase letter, one uppercase letter and one digit")
    .required();
exports.signUpSchema = joi_1.default.object({
    firstname: joi_1.default.string().min(2).max(30).required().messages({
        "string.empty": "First name is required",
        "string.min": "First name should have a minimum length of {#limit}",
        "string.max": "First name should have a maximum length of {#limit}",
    }),
    lastname: joi_1.default.string().min(2).max(30).required().messages({
        "string.empty": "last name is required",
        "string.min": "Last name should have a minimum length of {#limit}",
        "string.max": "Last name should have a maximum length of {#limit}",
    }),
    email: joi_1.default.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format",
    }),
    phoneNumber: joi_1.default.string()
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
        "string.empty": "Phone number is required",
        //   "string.length": "Phone number should have a length of {#limit}",
    }),
    department: joi_1.default.string().min(4).max(30),
    roleName: joi_1.default.string().min(2).max(30).required(),
    password: passwordSchema,
    confirmPassword: joi_1.default.any()
        .equal(joi_1.default.ref("password"))
        .required()
        .label("Confirm password")
        .messages({
        "any.only": "Passwords do not match",
        "any.required": "Password confirmation is required",
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format",
    }),
    password: passwordSchema,
});
exports.resetPasswordSchema = joi_1.default.object({
    password: passwordSchema,
    confirmPassword: joi_1.default.any()
        .equal(joi_1.default.ref("password"))
        .required()
        .label("Confirm password")
        .messages({
        "any.only": "Passwords do not match",
        "any.required": "Password confirmation is required",
    }),
});
exports.sendVerification = joi_1.default.object().keys({
    email: joi_1.default.string().trim().lowercase().email().required(),
});
exports.updateStaffSchema = joi_1.default.object({
    fullname: joi_1.default.string().min(3).max(30).messages({
        "string.min": "firstname should have a minimum length of {#limit}",
        "string.max": "firstname should have a maximum length of {#limit}",
    }),
    email: joi_1.default.string().email().messages({
        "string.email": "invalid email format",
    }),
    phoneNumber: joi_1.default.string()
        .pattern(/^[0-9]+$/)
        .messages({
        "string.length": "phone number should have the length of {#limit}",
    }),
    department: joi_1.default.string().messages({
        "string.length": "phone number should have the length of {#limit}",
    }),
    address: joi_1.default.string().messages({
        "string.length": "phone number should have the length of {#limit}",
    }),
    role: joi_1.default.string().messages({
        "string.length": "phone number should have the length of {#limit}",
    }),
    active: joi_1.default.boolean(),
    password: passwordSchema,
    confirmPassword: joi_1.default.any()
        .equal(joi_1.default.ref("password"))
        .required()
        .label("Confirm password")
        .messages({
        "any.only": "Passwords do not match",
        "any.required": "Password confirmation is required",
    }),
});
exports.changePasswordSchema = joi_1.default.object({
    password: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: joi_1.default.any()
        .equal(joi_1.default.ref("newPassword"))
        .required()
        .label("Confirm password")
        .messages({
        "any.only": "Passwords do not match",
        "any.required": "Password confirmation is required",
    }),
});
//# sourceMappingURL=adminValidation.js.map