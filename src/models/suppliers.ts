import { DataTypes, Model } from "sequelize";
import db from "../db";
export interface SupplierAttributes {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  address: string;
  
  
}
export class Supplier extends Model<SupplierAttributes> {
  static associate(models: any) {
    
    
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
