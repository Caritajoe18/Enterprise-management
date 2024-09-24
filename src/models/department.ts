import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface Product {
    assignedProduct: string;
    productCategory: string;
  }

export interface DeptAttributes {
  id: string;
  name: string;
  product: Product[];
  
}


  class Department extends Model<DeptAttributes> {
    

    static associate(models: any) {
      
    }
  }
 Department.init({
    
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
      product: {
        type: DataTypes.JSON,
        allowNull: false,
      },
     
  }, {
    sequelize: db,
    modelName: 'Departments',
  });
  export default  Department;
