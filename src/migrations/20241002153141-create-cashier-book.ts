import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('CashierBooks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      amount: {
        type: Sequelize.DECIMAL(15,2)
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true, 
      },
      credit: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: true,
      },
      debit: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: true,
      },
      balance: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false,
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
    await queryInterface.dropTable('CashierBooks');
  }
};