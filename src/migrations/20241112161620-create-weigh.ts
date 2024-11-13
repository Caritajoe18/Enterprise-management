import { DataTypes, QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('Weighs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      tranxId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'CustomerOrders', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      vehicleNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tar: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      gross: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      net: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      extra: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('Weighs');
  },
};
