import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface AccountAttributes {
  id: string;
  supplierId: string;
  customerId: string;
  productId: string;
  amount: number;
  creditType: string;
  bankName:string;
  other:string;
  departmentId:string;
  comments:string;
}

export class AccountBook extends Model<AccountAttributes> {
  static associate(models: any) {
    AccountBook.belongsTo(models.Customer, {
      foreignKey: "customerId",
      as: "account",
    });
    AccountBook.belongsTo(models.Suppliers, {
      foreignKey: "supplierId",
      as: "accounts",
    });
  }
}

AccountBook.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Customers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Suppliers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    other:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    comments:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Departments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    bankName: {
      type: DataTypes.STRING, 
      allowNull: true
    },

    creditType: {
      type: DataTypes.STRING,
      defaultValue: "Transfer",
      allowNull: false,
    },
  },

  { sequelize: db, tableName: "AccountBooks" }
);

export default AccountBook;
