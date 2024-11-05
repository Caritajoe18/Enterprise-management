import { DataTypes, Model } from "sequelize";
import db from "../db";

interface SupplierOrderAttributes {
  id: string;
  supplierId: string;
  productId: string;
  unit?: string;
  quantity?: number;
  price: number;
  createdBy: string;
}

class SupplierOrder extends Model<SupplierOrderAttributes> {
  static associate(models: any) {
    // define association here

    SupplierOrder.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "sorders",
    });
    SupplierOrder.belongsTo(models.Supplier, {
      foreignKey: "supplierId",
      as: "sorder",
    });
  }
}

SupplierOrder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
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
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "SupplierOrder",
  }
);

export default SupplierOrder;
