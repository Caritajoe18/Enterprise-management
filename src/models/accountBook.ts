import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface AccountAttributes {
  id: string;
  supplierId: string;
  customerId: string;
  productId: string;
  amount: number;
  creditType: string;
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
        model: "Supplierss",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
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

    creditType: {
      type: DataTypes.STRING,
      defaultValue: "Transfer",
      allowNull: false,
    },
  },

  { sequelize: db, tableName: "AccountBooks" }
);

export default AccountBook;
