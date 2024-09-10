"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerInstance = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const productValidations_1 = require("../validations/productValidations");
class CustomerInstance extends sequelize_1.Model {
}
exports.CustomerInstance = CustomerInstance;
CustomerInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    firstname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    profilePic: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "Regular",
        validate: {
            async isCategory(value) {
                await (0, productValidations_1.validateCategory)(value);
            }
        },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    tableName: "customers",
});
exports.default = CustomerInstance;
//# sourceMappingURL=customers.js.map