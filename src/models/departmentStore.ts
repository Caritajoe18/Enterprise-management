import { DataTypes, Model } from "sequelize";
import db from "../db";

export interface PharmacyStoreAttributes {
  id: string;
  name: string;
  image?: string;
  department: string;
  unit: string;
  quantity:number;
  thresholdValue: number;
}

export class DepartmentStore extends Model<PharmacyStoreAttributes> {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models: any) {
    DepartmentStore.belongsTo(models.Products, {
      foreignKey: "name",
      as: "product",  // Alias for accessing the related product
    });

    // define association here
  }
  get status(): string {
    const quantity = this.getDataValue('quantity');
    const thresholdValue = this.getDataValue('thresholdValue');
    
    if (quantity > thresholdValue) {
      return "In Stock";
    } else if (quantity <= 0) {
      return "Out Stock";
    } else {
      return "Low Stock";
    }
  }
}

DepartmentStore.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    department: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Departments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity:{
      type: DataTypes.DECIMAL(10,3),
      allowNull: true,
      defaultValue: 0,

    },
    thresholdValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  { sequelize: db, tableName: "DepartmentStores",
}
);

export default DepartmentStore;
