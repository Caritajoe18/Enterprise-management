import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
      await queryInterface.createTable('SupplierOrders', { id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      supplierId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Suppliers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Products', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
        
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.DECIMAL(10,3),
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(15, 2),
      },
      comments: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
      
      });
    
  },

  async down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable('SupplierOrders');
  }
};