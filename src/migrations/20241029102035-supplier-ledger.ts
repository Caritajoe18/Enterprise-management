import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('SupplierLedgers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
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
      unit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      creditType: {
        type: Sequelize.ENUM('Transfer', 'Cash'),
        allowNull: true
      },
      credit: {
        type: Sequelize.DECIMAL(15, 2)
        ,
        allowNull: true
      },
      debit: {
        type: Sequelize.DECIMAL(15, 2)
        ,
        allowNull: true
      },
      balance: {
        type: Sequelize.DECIMAL(15, 2)
        ,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable('SupplierLedgers');
  }
};
