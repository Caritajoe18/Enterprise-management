import { DataTypes, Model } from "sequelize";
import db from "../db";
import { AuthToWeighAttributes } from "./AuthToWeigh";

export class AuthToLoad extends Model<AuthToWeighAttributes> {
  static associate(models: any) {
    // Define associations here, if needed
  }
}

AuthToLoad.init(
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
    customer: {
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
    modelName: "AuthToLoad",
    tableName: "AuthToLoad",
  }
);

export default AuthToLoad;
