import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface AuthToWeighAttributes {
  id: string;
  raisedByAdminId?: string;
  customerId: string;
  driver?: string;
  vehicleNo?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  approvedBySuperAdminId?: string;
  tranxId: string;
}

export class AuthToWeigh extends Model<AuthToWeighAttributes> {
  static associate(models: any) {
    // Define associations here, if needed
    AuthToWeigh.belongsTo(models.CustomerOrder, {
      foreignKey: "tranxId",
      as: "transactions", // Alias for the association
    });
    AuthToWeigh.belongsTo(models.Customer, {
      foreignKey: "customerId",
      as: "customer", // Alias for the association
    });
    
  }
}

AuthToWeigh.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    raisedByAdminId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Customer",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    driver: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vehicleNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
      defaultValue: "pending",
    },
    approvedBySuperAdminId: {
      type: DataTypes.STRING,
      allowNull: true,
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
  },
  {
    sequelize: db,
    modelName: "AuthToWeigh",
    tableName: "AuthToWeigh",
  }
);

export default AuthToWeigh;
