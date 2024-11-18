import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface InvoiceAttributes {
  id: string;
  tranxId: string | null;
  customerId: string | null;
  ledgerId: string | null;
  vehicleNo: string | null;
  productId: string | null;
  acctbookId: string | null;
  quantityOrdered: number;
  prevBalance: number;
  credit: number | null;
  balanceBeforeDebit: number;
  debit: number | null;
  currentBalance: number;
  bankName: string | null;
  preparedBy: string | null;
  invoiceNumber: number;
}

export class Invoice extends Model<InvoiceAttributes> {
  static associate(models: any) {
    Invoice.belongsTo(models.Customer, {
      foreignKey: "customerId",
      as: "customer",
    });
    Invoice.belongsTo(models.CustomerOrder, {
      foreignKey: "tranxId",
      as: "transaction",
    });
    Invoice.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
    Invoice.belongsTo(models.AccountBook, {
      foreignKey: "acctbookId",
      as: "accountBook",
    });
    Invoice.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger",
    });
  }
}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    tranxId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "CustomerOrders",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Customers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    ledgerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Ledgers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    vehicleNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    acctbookId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "AccountBooks",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    quantityOrdered: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    prevBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    credit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    balanceBeforeDebit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    debit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    currentBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preparedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoiceNumber: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
    },
  },
  { sequelize: db, tableName: "Invoices" }
);

export default Invoice;
