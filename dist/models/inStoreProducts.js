"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productInstance = exports.Status = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
var Status;
(function (Status) {
    Status["LOW"] = "low";
    Status["OUT"] = "out";
    Status["IN"] = "in";
})(Status || (exports.Status = Status = {}));
class productInstance extends sequelize_1.Model {
}
exports.productInstance = productInstance;
productInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    item: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(Status)),
        allowNull: false,
    },
}, { sequelize: db_1.default, tableName: "products" });
exports.default = productInstance;
//# sourceMappingURL=inStoreProducts.js.map