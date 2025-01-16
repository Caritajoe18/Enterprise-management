import { Model, DataTypes } from "sequelize";
import db from "../db";

class RolePermission extends Model {
  static associate(models: any) {
    // define association here
  }
}
RolePermission.init(
  {
    roleId: {
      type: DataTypes.UUID,
      references: {
        model: "Roles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    permissionId: {
      type: DataTypes.UUID,
      references: {
        model: "Permissions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    sequelize: db,
    modelName: "RolePermission",
  }
);

export default RolePermission;
