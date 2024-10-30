import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface CollectFromGenStoreAttributes {
    id: string;
    recievedBy: string;
    items: Record<string, number>; 
    comments?: string;
    status: "pending" | "approved" | "rejected" | "completed";
    raisedByAdminId?: string;
    approvedBySuperAdminId?: string;

  }
  

export class CollectFromGenStore extends Model <CollectFromGenStoreAttributes>{}

CollectFromGenStore.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    raisedByAdminId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    recievedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    items: {
      type: DataTypes.JSON, 
      allowNull: false,
    },
    comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
      defaultValue: "pending",
    },
    approvedBySuperAdminId: {
      type: DataTypes.STRING,
      allowNull: true,
    }
    
  },
  {
    sequelize: db,
    modelName: "CollectFromGenStore",
    tableName: "CollectFromGenStore",
  }
);

export default CollectFromGenStore;
