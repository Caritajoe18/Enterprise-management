import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface VehicleDispatchAttributes {
  id: string;
  tranxId?:string;
  escortName:string;
  destination:string;
  preparedBy?: string;
  approvedBy?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

export class VehicleDispatch extends Model<VehicleDispatchAttributes> {
  static associate(models: any) {
    // Associations with other models
    VehicleDispatch.belongsTo(models.CustomerOrder, {
      foreignKey: "tranxId",
      as: "customerOrder",
    });
  }
}

VehicleDispatch.init(
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
    preparedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    escortName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      destination: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
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
  { sequelize: db, tableName: "VehicleDispatches" }
);

export default VehicleDispatch;
