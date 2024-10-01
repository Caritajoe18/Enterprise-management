import { DataTypes, Model } from "sequelize";
import db from "../db";

export enum Status {
	LOW = "low",
	OUT = "out",
	IN = "in",
}
export interface productAttributes {
  id: string;
  item: string;
  quantity: number;
  status: Status;
  
  
}
export class productInstance extends Model<productAttributes> {
  static associate(models: any) {
    
    
  }
}

productInstance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.NUMBER,
      allowNull: false,
    
    },
    status: {
      type: DataTypes.ENUM(...Object.values(Status)),
      allowNull: false,
    },

    
    
     
  },
  { sequelize: db, tableName: "products" }
);

export default productInstance;
