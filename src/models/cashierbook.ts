import { DataTypes, Model } from "sequelize";
import db from "../db";
export interface CashierAttributes {
  id: string;
  departmentId: string;
  name:string;
  approvedByAdminId:string;
  comment: string;
  credit: number;
  debit: number;
  balance: number;
  createdAt:Date;

}

export class CashierBook extends Model<CashierAttributes> {
  static associate(models: any) {
    CashierBook.belongsTo(models.Departments, {
      foreignKey: "departmentId",
      as: "department",
    });
    CashierBook.hasOne(models.OfficialReceipt, {
      foreignKey: "cashierId",
      as: "cashier",  
    });
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
    departmentId: {
      type: DataTypes.UUID,
      references: {
        model: "Departments",  
        key: "id",
      },
      allowNull: true,
      onDelete: 'SET NULL',  
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      
    },
    approvedByAdminId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Admins",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    comment: {
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
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: db,
    modelName: "CashierBook",
  }
);
export default CashierBook;
