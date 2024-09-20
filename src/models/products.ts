import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface Product {
  unit: string;
  amount: number;
}
export interface Plan {
  category: string;
  amount: number;
}
export interface ProductsAttributes {
  id: string;
  name: string;
  price: Product[]; 
  pricePlan?: Plan[];
}

export class ProductInstance extends Model<ProductsAttributes> {}

ProductInstance.init(
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
      unique: true,
    },
    
     price: {
      type: DataTypes.JSON,
      allowNull: false,
      
    },
    pricePlan: {
      type: DataTypes.JSON,
      defaultValue:{},
      allowNull: true,
    },
  },

  { sequelize: db, tableName: "products" }
);

export default ProductInstance;
