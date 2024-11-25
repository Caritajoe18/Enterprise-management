import { DataTypes, Model } from "sequelize";
import db from "../db";


export interface LedgerAttributes { 
  id: string;
  tranxId:string;
  customerId: string;
  productId: string | null;
  unit:string;
  quantity:number;
  credit:number;
  creditType: 'Transfer' | 'Cash';
  debit:number;
  balance:number;
  weighImage:string;
  acctBookId:string;
  createdAt:Date

}

export class Ledger extends Model<LedgerAttributes> {
  static associate(models: any) {
    
    Ledger.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "product", 
    });
    Ledger.belongsTo(models.Customer, {
        foreignKey: "customerId",
        as:"customer"
    })
    Ledger.belongsTo(models.AccountBook, {
        foreignKey: "acctBookId",
        as:"accountBook"
    })
  }
}

Ledger.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    tranxId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'CustomerOrders', 
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Products', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
    acctBookId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'AccountBooks', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: true
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
      },
      creditType: {
        type: DataTypes.ENUM('Transfer', 'Cash'),
        allowNull: true
      },
      credit: {
        type: DataTypes.DECIMAL(15, 2)
        ,
        allowNull: true 
      },
      debit: {
        type: DataTypes.DECIMAL(15, 2)
        ,
        allowNull: true
      },
      weighImage: {
        type: DataTypes.STRING,
        allowNull: true
      },
      balance: {
        type: DataTypes.DECIMAL(15, 2)
        ,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
  },

  { sequelize: db, tableName: "Ledgers" }
);

export default Ledger;
