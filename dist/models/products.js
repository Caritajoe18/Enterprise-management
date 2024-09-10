"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductInstance = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const productValidations_1 = require("../validations/productValidations");
class ProductInstance extends sequelize_1.Model {
}
exports.ProductInstance = ProductInstance;
ProductInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    price: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        validate: {
            isValid: productValidations_1.validatePrices,
        },
    },
    pricePlan: {
        type: sequelize_1.DataTypes.JSON,
        defaultValue: {},
        allowNull: true,
        validate: {
            isValid: productValidations_1.validatePrices,
        },
    },
}, { sequelize: db_1.default, tableName: "products" });
exports.default = ProductInstance;
//# sourceMappingURL=products.js.map