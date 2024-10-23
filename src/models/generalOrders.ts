import { DataTypes, Model } from 'sequelize';
import db from '../db'; // assuming db is properly configured

interface GeneralOrderAttributes {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expectedDeliveryDate: Date;
}

export class GeneralOrder extends Model<GeneralOrderAttributes> {}

GeneralOrder.init(
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
    modelName: 'GeneralOrder',
    tableName: 'GeneralOrders',
  }
);

export default GeneralOrder;
