import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface OfficialReceiptAttributes {
  id: string;
  of: string;
  being: string;
  cashierId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OfficialReceipt extends Model<OfficialReceiptAttributes> {
  static associate(models: any) {
    // Associations with other models
    OfficialReceipt.belongsTo(models.CashierBook, {
      foreignKey: "cashierId",
      as: "cashier",  
    });
  }
}

OfficialReceipt.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    of: {
        type: DataTypes.STRING,  
        allowNull: true,
      },
    being: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cashierId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "CashierBooks",  
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", 
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
  { sequelize: db, tableName: "OfficialReceipts" }
);

export default OfficialReceipt;
