import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface WaybillAttributes {
  id: string;
  tranxId: string;
  ledgerId: string;
  invoiceId: string;
  address: string;
  transportedBy: "Company" | "Customer" ;
  driversLicense: string;
  bags: number;
  preparedBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Waybill extends Model<WaybillAttributes> {
  static associate(models: any) {
    Waybill.belongsTo(models.CustomerOrder, {
      foreignKey: "tranxId",
      as: "transaction",
    });
    Waybill.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger",
    });
    Waybill.belongsTo(models.Invoice, {
      foreignKey: "invoiceId",
      as: "invoice",
    });
    Waybill.belongsTo(models.Role, {
      foreignKey: "preparedBy",
      as: "preparedByRole",
    });
  }
}

Waybill.init(
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
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Invoices",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transportedBy: {
      type: DataTypes.ENUM("Company", "Customer"),
      allowNull: true,
    },
    driversLicense: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bags: {
      type: DataTypes.INTEGER,
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
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize: db, tableName: "Waybills" }
);

export default Waybill;
