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


// module.exports = (sequelize, DataTypes) => {
  class Department extends Model<DeptAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models: any) {
      // define association here
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
