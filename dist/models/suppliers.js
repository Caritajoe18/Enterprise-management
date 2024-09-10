"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppliersInstance = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class suppliersInstance extends sequelize_1.Model {
}
exports.suppliersInstance = suppliersInstance;
suppliersInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    product: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    credit: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    debit: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, { sequelize: db_1.default, tableName: "suppliers" });
exports.default = suppliersInstance;
//# sourceMappingURL=suppliers.js.map