import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface InvoiceAttributes {
  id: string;
  tranxId: string | null;
  customerId: string | null;
  ledgerId: string | null;
  vehicleNo: string | null;
  productId: string | null;
  quantityOrdered: number;
  prevBalance: number;
  credit: number | null;
  balanceBeforeDebit: number;
  ledgerEntries: object;
  currentBalance: number;
  bankName: string | null;
  preparedBy: string | null;
  invoiceNumber: number;
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
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
    Invoice.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "product",
    });
    Invoice.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger",
    });
    Invoice.belongsTo(models.Role, { foreignKey: "preparedBy", as: "role" });
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
    quantityOrdered: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    prevBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    credit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    balanceBeforeDebit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    ledgerEntries: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    currentBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preparedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Roles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    invoiceNumber: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize: db, tableName: "Invoices" }
);

export default Invoice;
