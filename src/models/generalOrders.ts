import { DataTypes, Model } from "sequelize";
import db from "../db";

interface GeneralOrderAttributes {
  id: string;
  productId: string;
  quantity: number;
  unit: string;
  expectedDeliveryDate: Date;
  comments:string;
}

export class GeneralOrder extends Model<GeneralOrderAttributes> {
  static associate(models: any) {
    GeneralOrder.belongsTo(models.Products, {
      as: "store",
      foreignKey: "productId",
    });
  }
}

GeneralOrder.init(
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
    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expectedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "GeneralOrder",
    tableName: "GeneralOrders",
  }
);

export default GeneralOrder;
