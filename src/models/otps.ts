import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface OTPAttributes {
  id: string;
  userId: string;
  otp: number | null;
  expiry: Date;
  
}

export class OTPInstance extends Model<OTPAttributes> {}

OTPInstance.init(
  {
    id: {
      type: DataTypes.UUID,
defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'admin', 
        key: 'id',
      },
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    
  },
  { sequelize: db, tableName: "otps" }
);

export default OTPInstance;
