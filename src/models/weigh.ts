import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface WeighAttributes {
  id: string;
  customerId: string;
  tranxId: string;
  vehicleNo?: string;
  tar: number;
  gross: number;
  net: number;
  extra?: number| null;
  image:string
  createdAt?: Date;
  updatedAt?: Date;
}

export class Weigh extends Model<WeighAttributes> {
  static associate(models: any) {
    Weigh.belongsTo(models.Customer, {
      foreignKey: "customerId",
      as: "customer",
    });
    Weigh.belongsTo(models.CustomerOrder, {
      foreignKey: "tranxId",
      as: "transactions",
    });
  }
}

Weigh.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Customers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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
    vehicleNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tar: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    gross: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    net: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    extra: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
    },
    image:{
        type: DataTypes.STRING,
        allowNull: false,
      },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  { sequelize: db, tableName: "Weighs" }
);

export default Weigh;
