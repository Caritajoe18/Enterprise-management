import { DataTypes, Model } from "sequelize";
import db from "../db";
import Permission from "./permission";

export interface NavParentAttributes {
  id: string;
  name: string;
  iconUrl: string;
  isNav: boolean;
  slug: string;
}

class NavParent extends Model<NavParentAttributes> {
  permissions: any;
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models: any) {
    NavParent.hasMany(models.Permission, {
      foreignKey: "navParentId",
      as: "permissions",
    });
  //   Permission.belongsTo(models.NavParent, { foreignKey: "navParentId" });
   }
}
NavParent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isNav: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    iconUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "NavParent",
    tableName: "NavParents",
  }
);
//return createNavParent;

export default NavParent;
