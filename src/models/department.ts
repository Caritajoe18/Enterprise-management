import { DataTypes, Model } from "sequelize";
import db from "../db";
import  { Products } from "./products";


export interface DeptAttributes {
  id: string;
  name: string;
  
}


  class Departments extends Model<DeptAttributes> {
    

    static associate(models: any) {
      Departments.hasMany(models.Products, {
        foreignKey: "departmentId", 
        as: "products",
      }); 
      Departments.hasMany(models.CashTicket, {
        foreignKey: "departmentId", 
        as: "cash",
      }); 
    }
  }
 Departments.init({
    
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
      
  }, {
    sequelize: db,
    modelName: 'Departments',
    tableName:'Departments',
  });
  export default  Departments;
