"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const permission_1 = __importDefault(require("./permission"));
const role_1 = __importDefault(require("./role"));
// module.exports = (sequelize, DataTypes) => {
class RolePermission extends sequelize_1.Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        // define association here
    }
}
RolePermission.init({
    roleId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: role_1.default,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    permissionId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: permission_1.default,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    sequelize: db_1.default,
    modelName: 'RolePermission',
});
exports.default = RolePermission;
//# sourceMappingURL=rolepermission.js.map