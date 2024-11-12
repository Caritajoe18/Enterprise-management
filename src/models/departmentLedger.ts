import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface DepartmentLedgerAttributes {
  id: string;
  name: string;
  productName: string;
  rawMaterial: string;
  productId: string;
  departmentId: string;
  unit: string;
  quantity: number;
  credit: number;
  debit: number;
  balance: number;
  comments: string;
}

export class DepartmentLedger extends Model<DepartmentLedgerAttributes> {
  static associate(models: any) {
    // You can define any associations here, like if there's a relation with Products
    DepartmentLedger.belongsTo(models.Departments, {
      foreignKey: "departmentId",
      as: "departmentledgers",
    });
  }
}

DepartmentLedger.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rawMaterial: {
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
      onDelete: "CASCADE",
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Departments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
    },
    credit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    debit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "DepartmentLedgers",
  }
);

export default DepartmentLedger;
