import { DataTypes, Model } from "sequelize";
import db from "../db";
import { validatePricePlan, validatePrices } from "../validations/productValidations";

export interface ProductsAttributes {
  id: string;
  name: string;
  price: { [unit: string]: number }; 
  pricePlan?: { [category: string]: number };
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
      validate: {
        isValid: validatePrices,
      },
      
    },
    pricePlan: {
      type: DataTypes.JSON,
      defaultValue:{},
      allowNull: true,
      validate: {
        isValid: validatePricePlan,
      },
    },
  },

  { sequelize: db, tableName: "products" }
);

export default ProductInstance;
