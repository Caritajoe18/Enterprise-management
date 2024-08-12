import { DataTypes, Model } from "sequelize";
import db from "../db";
export interface AdminAttributes {
  id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  password: string;
  active: boolean;
}
export class AdminInstance extends Model<AdminAttributes> {}

AdminInstance.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },

    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  { sequelize: db, tableName: "admin" }
);

export default AdminInstance;
