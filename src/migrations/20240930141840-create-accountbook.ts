import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('AccountBooks', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Customers', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2), 
        allowNull: false
      },
      creditType: {
        type: Sequelize.STRING, 
        allowNull: false
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
    await queryInterface.dropTable('AccountBooks');
  }
};
