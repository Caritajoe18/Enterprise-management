import { DataTypes, Model } from "sequelize";
import db from "../db";
export interface suppliersAttributes {
  id: string;
  name: string;
  date: Date;
  product: string;
  credit: string;
  debit: string;
  
}
export class suppliersInstance extends Model<suppliersAttributes> {}

suppliersInstance.init(
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    
    },
    product: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    credit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    debit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
     
  },
  { sequelize: db, tableName: "suppliers" }
);

export default suppliersInstance;
