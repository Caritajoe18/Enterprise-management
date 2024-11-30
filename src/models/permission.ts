import { Model, DataTypes } from "sequelize";
import db from "../db";
import NavParent from "./navparent";

export interface PermissionAttributes {
  id: string;
  name: string;
  isNav: boolean;
  orderIndex: number;
  navParentId: string;
  isAssigned: boolean;
  url: string;
  slug: string;
}


class Permission extends Model<PermissionAttributes> {
  public navParent?: NavParent;
  static associate(models: any) {
    Permission.belongsTo(models.NavParent, {
      foreignKey: "navParentId",
      as: "navParent",
    });

    Permission.belongsToMany(models.Role, {
      through: "RolePermission",
      as: "roles",
      foreignKey: "permissionId",
      otherKey: "roleId",
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
    },
    isNav: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isAssigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    navParentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "NavParents",
        key: "id",
      },
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "Permission",
    tableName: "Permissions",
  }
);

export default Permission;
