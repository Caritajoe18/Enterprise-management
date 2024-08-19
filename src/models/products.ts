import { DataTypes, Model } from "sequelize";
import db from "../db";
import { validatePrices } from "../validations/prioductValidations";

export interface ProductsAttributes {
  id: string;
  name: string;
  prices: { [category: string]: number };
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
    prices: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValid: validatePrices,
      },
    },
  },

  { sequelize: db, tableName: "products" }
);

export default ProductInstance;
