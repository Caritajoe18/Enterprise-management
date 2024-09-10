"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const role_1 = __importDefault(require("./role"));
// module.exports = (sequelize, DataTypes) => {
class Admins extends sequelize_1.Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    role;
    static associate(models) {
        // define association here
        Admins.belongsTo(models.Role, {
            foreignKey: 'roleId',
            as: 'role',
        });
        role_1.default.hasMany(models.Admins, {
            foreignKey: 'roleId',
            as: 'admins',
        });
    }
}
Admins.init({
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
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    profilePic: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    department: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    roleName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    roleId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'roles',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    verificationToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
    },
    isAdmin: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Admins',
});
exports.default = Admins;
//# sourceMappingURL=admin.js.map