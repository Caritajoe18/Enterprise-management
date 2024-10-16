import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface IProduct {
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
  category: 'For Sale' | 'For Purchase';
  price: IProduct[]; 
  pricePlan?: Plan[];
  departmentId: string | null;
}

export class Products extends Model<ProductsAttributes> {
  static associate(models: any) {
    
    Products.belongsTo(models.Departments, {
      foreignKey: "departmentId",
      as: "department", 
    });
    Products.hasMany(models.CustomerOrder, { foreignKey: 'productId', as : 'orders' });
  }
}

Products.init(
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
    category: {
      type: DataTypes.ENUM('For Sale', 'For Purchase'),
      allowNull: false,
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
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true, 
      references: {
        model: "Departments",  
        key: "id",
      },
      onDelete: "SET NULL",  
    },
  },

  { sequelize: db, modelName: 'Products', tableName: "Products" }
);

export default Products;
