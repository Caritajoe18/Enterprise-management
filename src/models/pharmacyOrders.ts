import { DataTypes, Model } from 'sequelize';
import db from '../db'; // assuming db is properly configured

interface PharmacyOrderAttributes {
  id: string;
  rawMaterial: string;
  quantity: number;
  unit: string;
  expectedDeliveryDate: Date;
}

export class PharmacyOrder extends Model<PharmacyOrderAttributes> {}

PharmacyOrder.init(
  {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    rawMaterial: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expectedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: 'PharmacyOrder',
    tableName: 'PharmacyOrders',
  }
);

export default PharmacyOrder;
