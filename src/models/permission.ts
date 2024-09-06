import { Model, DataTypes } from "sequelize";
import db from "../db";
import Role from "./role";

export interface PermissionAttributes {
  id: string;
  name: string;
}

// export default (sequelize, DataTypes) => {
class Permission extends Model<PermissionAttributes> {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate() {
    Permission.belongsToMany(Role, {
      through: "RolePermission",
      as: "roles",
        foreignKey: 'permissionId',
     otherKey: 'roleId'
    });
  }
}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: db,
    modelName: "Permission",
  }
);

export default Permission;
