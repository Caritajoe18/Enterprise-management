import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface CashTicketAttributes {
  id: string;
  customerId: string;
  staffName: string;
  amount: number;
  productId: string;
  departmentId: string;
  item: string;
  comments: string;
  creditOrDebit: string;
  status: "pending" | "approved" | "rejected" | "completed";
  raisedByAdminId: string | null;
  approvedBySuperAdminId: string;
  cashierId: string;
}

class CashTicket extends Model<CashTicketAttributes> {
  static associate(models: any) {
    CashTicket.belongsTo(models.Role, {
      foreignKey: "raisedByAdminId",
      as: "role", // Alias for the association
    });
    CashTicket.belongsTo(models.Customer, {
      foreignKey: "customerId",
      as: "customer", // Alias for the association
    });
    CashTicket.belongsTo(models.Departments, {
      foreignKey: "departmentId",
      as: "department",
    });
    CashTicket.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "product",
    });
  }
}
CashTicket.init(
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
      onDelete: "SET NULL",
    },
    staffName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    item: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comments: {
      type: DataTypes.STRING,
      allowNull: true,
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
      onDelete: "SET NULL",
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Departments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    creditOrDebit: {
      type: DataTypes.ENUM("credit", "debit"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
      defaultValue: "pending",
    },
    raisedByAdminId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Roles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    approvedBySuperAdminId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    cashierId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "CashTicket",
  }
);
export default CashTicket;
