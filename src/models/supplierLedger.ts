import { DataTypes, Model } from "sequelize";
import db from "../db";


export interface LedgerAttributes { 
  id: string;
  supplierId: string;
  productId: string | null;
  unit:string;
  quantity:number;
  credit:number;
  creditType: 'Transfer' | 'Cash';
  debit:number;
  balance:number;

}

export class SupplierLedger extends Model<LedgerAttributes> {
  static associate(models: any) {
    
    SupplierLedger.belongsTo(models.Products, {
      foreignKey: "productId",
      as: "customer", 
    });
    SupplierLedger.belongsTo(models.Suppliers, {
        foreignKey: "supplierId",
        as:"product"
    })
  }
}

SupplierLedger.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
      supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Suppliers',
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
        type: DataTypes.INTEGER,
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
      balance: {
        type: DataTypes.DECIMAL(15, 2)
        ,
        allowNull: false
      },
  },

  { sequelize: db, tableName: "SupplierLedgers" }
);

export default SupplierLedger;