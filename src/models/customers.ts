import { DataTypes, Model } from "sequelize";
import db from "../db";
import ProductInstance from "./products";
import { validateCategory } from "../validations/productValidations";

export interface CustomerAttributes {
  id: string;
  name: string;
  date: Date;
  address: string;
  category: string;
  description: string;
}

export class CustomerInstance extends Model<CustomerAttributes> {}

CustomerInstance.init(
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {validateCategory},
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "customers",
  }
);

export default CustomerInstance;
