import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface NavParentAttributes {
  id: string;
  name: string;
  iconUrl: string;
  slug: string;
}

class NavParent extends Model<NavParentAttributes> {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models: any) {
    NavParent.hasMany(models.Permissions, {
      foreignKey: "navParentId",
      as: "permissions",
    });
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
      unique:true,
    },
    iconUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "NavParents",
  }
);
//return createNavParent;

export default NavParent;
