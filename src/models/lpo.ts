import { Model, DataTypes } from "sequelize";
import db from "../db"; 

interface LPOAttributes {
  id: string;
  deliveredTo: string;
  chequeNo: string;
  chequeVoucherNo: string;
  supplierId: string;
  rawMaterial: string;
  unitPrice: number;
  quantOrdered: number;
  expires: Date;
  period: Date;
  status: "pending" | "approved" | "rejected" | "completed";
  raisedByAdminId:string;
  approvedBySuperAdminId: string;
  comments?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LPO extends Model<LPOAttributes>{
    static associate(models: any) {
        LPO.belongsTo(models.Supplier, { foreignKey: "supplierId", as: "supplier" });
        LPO.belongsTo(models.Product, { foreignKey: "rawMaterial", as: "product" });
    }
}
  


LPO.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    deliveredTo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chequeNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chequeVoucherNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Suppliers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    rawMaterial: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    quantOrdered: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    period: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
        defaultValue: "pending",
      },
      raisedByAdminId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      approvedBySuperAdminId: {
        type: DataTypes.STRING,
        allowNull: true,
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
  {
    sequelize: db,
    tableName: "LPOS",
  }
);
