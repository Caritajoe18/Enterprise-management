import { DataTypes, Model } from "sequelize";
import db from "../db";

interface GeneralOrderAttributes {
  id: string;
  productId: string;
  departmentId: string;
  quantity: number;
  unit: string;
  expectedDeliveryDate: Date;
  comments:string;
  createdBy:string;
}

export class DepartmentOrder extends Model<GeneralOrderAttributes> {
  static associate(models: any) {
    DepartmentOrder.belongsTo(models.Products, {
      as: "store",
      foreignKey: "productId",
    });
  }
}

DepartmentOrder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
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
    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expectedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "DepartmentOrder",
    tableName: "DepartmentOrders",
  }
);

export default DepartmentOrder;
