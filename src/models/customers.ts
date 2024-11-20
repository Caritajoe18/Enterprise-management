import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface CustomerAttributes {
  id: string;
  idCount: number;
  customerTag: string;
  firstname: string;
  lastname: string;
  date: Date;
  email: string;
  profilePic?: string;
  phoneNumber: string;
  address?: string;
}

export class Customer extends Model<CustomerAttributes> {
  static associate(models: any) {
    Customer.hasMany(models.CustomerOrder, {
      foreignKey: "customerId",
      as: "orders",
    });
    Customer.hasMany(models.AccountBook, {
      foreignKey: "customerId",
      as: "accountBooks",
    });
    Customer.hasMany(models.Invoice, {
      foreignKey: "customerId",
      as: "customerInvoice",
    });
  }
}

Customer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    idCount: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      unique: true,
    },
    customerTag: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
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
      allowNull: true,
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "Customers",
  }
);

export default Customer;
