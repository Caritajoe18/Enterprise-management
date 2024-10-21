import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface PharmacyStoreAttributes {
  id: string;
  productId: string;
  image?: string;
  productTag: string;
  category: string;
  unit: string;
  quantity:number;
  thresholdValue: number;
}

export class PharmacyStore extends Model<PharmacyStoreAttributes> {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models: any) {
    // define association here
  }
}
PharmacyStore.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    productTag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity:{
      type: DataTypes.DECIMAL(10,3),
      allowNull: true,
      defaultValue: 0,

    },
    thresholdValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { sequelize: db, tableName: "PharmacyStores" }
);

export default PharmacyStore;
