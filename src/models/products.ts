import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface RawMaterialAttributes {
  id: string;
  name: string;
  price: number;
}

export class RawMaterialInstance extends Model<RawMaterialAttributes> {}

RawMaterialInstance.init(
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
      unique: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  { sequelize: db, tableName: "raw_materials" }
);

export default RawMaterialInstance;
