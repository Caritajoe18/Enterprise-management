"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLedgerSchema = exports.createOrderSchema = exports.updateCustomerSchema = exports.regCustomerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.regCustomerSchema = joi_1.default.object({
    firstname: joi_1.default.string().min(2).max(30).required().messages({
        "string.empty": "name is required",
        "string.min": "name should have a minimum length of {#limit}",
        "string.max": "First name should have a maximum length of {#limit}",
    }),
    lastname: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    address: joi_1.default.string().required(),
    phonenumber: joi_1.default.string(),
    category: joi_1.default.string(),
    profilePic: joi_1.default.string(),
});
exports.updateCustomerSchema = joi_1.default.object({
    firstname: joi_1.default.string().min(2).max(30).messages({
        "string.empty": "name is required",
        "string.min": "name should have a minimum length of {#limit}",
        "string.max": "First name should have a maximum length of {#limit}",
    }),
    lastname: joi_1.default.string().min(2).max(30).messages({
        "string.empty": "name is required",
        "string.min": "name should have a minimum length of {#limit}",
        "string.max": "First name should have a maximum length of {#limit}",
    }),
    email: joi_1.default.string().email().messages({
        "string.email": "Invalid email format",
    }),
    address: joi_1.default.string(),
    phonenumber: joi_1.default.string(),
    category: joi_1.default.string(),
    profilePic: joi_1.default.string(),
});
exports.createOrderSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    catergory: joi_1.default.string().required(),
    product: joi_1.default.string().required(),
    quntity: joi_1.default.number().required(),
    price: joi_1.default.number().required(),
    date: joi_1.default.string().required(),
});
exports.createLedgerSchema = joi_1.default.object({
    credit: joi_1.default.number().required(),
    debit: joi_1.default.number().required(),
    balance: joi_1.default.number().required(),
});
//# sourceMappingURL=customerValid.js.map