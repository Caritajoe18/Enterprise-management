import { DataTypes, Model } from "sequelize";
import db from "../db";
export interface SupplierAttributes {
  id: string;
  idCount: number;
  supplierTag: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  address: string;
  
  
}
export class Supplier extends Model<SupplierAttributes> {
  static associate(models: any) {
    Supplier.hasMany(models.LPO, {
      foreignKey: "supplierId",
      as: "lpo",
    });
    
  }
}

Supplier.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    idCount:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      unique:true
    },
    supplierTag:{
      type: DataTypes.STRING,
      allowNull: true,
      unique:true

    },

    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
     
  },
  { sequelize: db, tableName: "Suppliers", modelName: "Supplier" }
);

export default Supplier;
