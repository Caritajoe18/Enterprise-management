import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface GatePassAttributes {
  id: string;
  tranxId?: string | null;
  escortName?: string | null;
  destination?: string | null;
  preparedBy?: string | null;
  approvedBy?: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

export class GatePass extends Model<GatePassAttributes> {
  static associate(models: any) {
    GatePass.belongsTo(models.CustomerOrder, {
      foreignKey: "tranxId",
      as: "transaction",
    });
    GatePass.belongsTo(models.Role, {
      foreignKey: "preparedBy",
      as: "preparedByRole",
    });
    GatePass.belongsTo(models.Role, {
      foreignKey: "approvedBy",
      as: "approvedByRole",
    });
  }
}

GatePass.init(
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
    escortName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    destination: {
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
    approvedBy: {
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
  { sequelize: db, tableName: "GatePasses" }
);

export default GatePass;
