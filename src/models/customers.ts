import { DataTypes, Model } from "sequelize";
import db from "../db";
import { validateCategory } from "../validations/productValidations";

export interface CustomerAttributes {
  id: string;
  firstname: string;
  lastname: string;
  date: Date;
  email:string;
  profilePic:string;
  phoneNumber: number;
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
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Regular", 
      validate: {
        async isCategory(value: string) {
          await validateCategory(value);
        }
      },
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
