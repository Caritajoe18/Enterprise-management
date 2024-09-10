"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductSchema = exports.validateCategory = exports.validatePrices = void 0;
const joi_1 = __importDefault(require("joi"));
const products_1 = __importDefault(require("../models/products"));
const validatePrices = (value) => {
    if (typeof value !== "object" || Object.keys(value).length === 0) {
        throw new Error("Prices must contain at least one category.");
    }
    for (const key in value) {
        if (typeof value[key] !== "number") {
            throw new Error(`The price for ${key} must be a valid number.`);
        }
    }
};
exports.validatePrices = validatePrices;
const validateCategory = async (value) => {
    const products = await products_1.default.findAll();
    const validCategories = products.flatMap((product) => Object.keys(product.dataValues.pricePlan || {}));
    if (!validCategories.includes(value)) {
        throw new Error(`Category must be one of ${validCategories.join(", ")}`);
    }
};
exports.validateCategory = validateCategory;
exports.createProductSchema = joi_1.default.object({
    name: joi_1.default.string().required().messages({
        "string.required": "The name of a product is required",
        "any.required": "Product name is required",
    }),
    price: joi_1.default.object()
        .pattern(joi_1.default.string(), joi_1.default.number().positive().required())
        .min(1)
        .required()
        .messages({
        "object.base": "Price must be a valid object with units as keys.",
        "object.pattern.base": "Each unit must have a valid positive price.",
        "object.min": "Price must contain at least one unit.",
        "any.required": "Price is required and must include at least one unit.",
    }),
    pricePlan: joi_1.default.object()
        .pattern(joi_1.default.string(), joi_1.default.number().positive())
        .optional()
        .messages({
        "object.base": "Price plan must be a valid object with categories as keys.",
        "object.pattern.base": "Each category must have a valid positive price.",
    }),
});
//# sourceMappingURL=productValidations.js.map