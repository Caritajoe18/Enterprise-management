import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface ProductTuple {
  item: string;
  quantity: number;
  price: number;
}

export interface customerAttributes {
   customer_id: string;
  name: string;
  date: Date;
  address: string;
  category: string;
  product: ProductTuple[];
  amount: number;
  credit: number;
  balance: string;
}

export class customerInstance extends Model<customerAttributes> {}

customerInstance.init(
  {
    customer_id: {
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
    address:{
        type: DataTypes.STRING,
        allowNull: true,

    },
    category:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    product: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    credit: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    balance: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { 
    sequelize: db, 
    tableName: "customers",
    hooks: {
      beforeSave: (customer: customerInstance) => {
        if (customer.dataValues.product) {
          customer.dataValues.amount = customer.dataValues.product.reduce((total, product) => {
            return total + (product.quantity * product.price);
          }, 0);
        }
      }
    }
  }
);

export default customerInstance;
