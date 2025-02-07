import { DataTypes, Model } from "sequelize";
import db from "../db";

interface CustomerOrderAttributes {
  id: string;
  customerId: string;
  productId: string;
  unit?: string;
  quantity: number;
  price: number;
  discount?: number;
  basePrice?: number;
  rate  ?: number;
  comments: string;
  createdBy: string;
}

class CustomerOrder extends Model<CustomerOrderAttributes> {
  static associate(models: any) {
    // define association here

    CustomerOrder.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "porders",
    });
    CustomerOrder.belongsTo(models.Customer, {
      foreignKey: "customerId",
      as: "corder",
    });
    CustomerOrder.hasOne(models.Waybill, {
      foreignKey: "tranxId",
      as: "waybill",
    });

    CustomerOrder.hasOne(models.AuthToWeigh, {
      foreignKey: "tranxId",
      as: "authToWeighTickets",
    });
    CustomerOrder.hasOne(models.Weigh, {
      foreignKey: "tranxId",
      as: "weighBridge",
    });
    CustomerOrder.hasOne(models.Invoice, {
      foreignKey: "tranxId",
      as: "invoice",
    });
    CustomerOrder.hasOne(models.Ledger, {
      foreignKey: "tranxId",
      as: "ledger",
    });
  }
}

CustomerOrder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Customers",
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
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    basePrice: {
      type: DataTypes.DECIMAL(15, 2),
    },
    rate: {
      type: DataTypes.DECIMAL(15, 2),
    },
    discount: {
      type: DataTypes.DECIMAL(15, 2),
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
    modelName: "CustomerOrder",
  }
);

export default CustomerOrder;
