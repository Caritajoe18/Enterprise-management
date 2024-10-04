import { DataTypes, Model } from "sequelize";
import db from "../db";
export interface CashierAttributes {
  id: string;
  amount: number;
  description: string;
  credit: number;
  debit: number;
  balance: number;
}

export class CashierBook extends Model<CashierAttributes> {
  static associate(models: any) {
    // define association here
  }
}
CashierBook.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue:  DataTypes.UUIDV4,
      allowNull: false,
      primaryKey:true
    },
    amount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull:false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      
    },
    credit: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    debit: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    balance: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
  },
  {
    sequelize: db,
    modelName: "CashierBook",
  }
);
export default CashierBook;
