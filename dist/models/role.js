"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
// module.exports = (sequelize, DataTypes) => {
class Role extends sequelize_1.Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    permissions;
    static associate(models) {
        Role.belongsToMany(models.Permission, {
            through: 'RolePermission',
            as: 'permissions',
            foreignKey: 'roleId',
            otherKey: 'permissionId'
        });
        Role.hasMany(models.Admins, {
            foreignKey: "roleId",
            as: "admins", // Alias used to reference Admins from Role
        });
    }
}
Role.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Role',
});
exports.default = Role;
//# sourceMappingURL=role.js.map