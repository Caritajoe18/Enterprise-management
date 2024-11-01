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
}

export class AuthToWeigh extends Model<AuthToWeighAttributes> {
  static associate(models: any) {
    // Define associations here, if needed
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
      type: DataTypes.STRING,
      allowNull: false,
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
  },
  {
    sequelize: db,
    modelName: "AuthToWeigh",
    tableName: "AuthToWeigh",
  }
);

export default AuthToWeigh;
