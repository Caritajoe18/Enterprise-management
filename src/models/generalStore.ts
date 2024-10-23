import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface GeneralAttributes {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  thresholdValue: number;
}
export class GeneralStore extends Model<GeneralAttributes> {
  static associate(models: any) {}
  get status(): string {
    const quantity = this.getDataValue('quantity');
    const thresholdValue = this.getDataValue('thresholdValue');
    
    if (quantity > thresholdValue) {
      return "In Stock";
    } else if (quantity === thresholdValue) {
      return "Out of Stock";
    } else {
      return "Low Stock";
    }
  }
}

GeneralStore.init(
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
    quantity: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thresholdValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  { sequelize: db, tableName: "GeneralStores"}
);

export default GeneralStore;
