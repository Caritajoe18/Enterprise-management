import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('Products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      category:{
        type:Sequelize.ENUM('For Sale', 'For Purchase'),
        allowNull:false,
      },
      price: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      pricePlan: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      departmentId: {
        type: Sequelize.UUID,
        references: {
          model: "Departments",  
          key: "id",
        },
        allowNull: false,
        onDelete: 'SET NULL',  
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    await queryInterface.dropTable('Products');
  },
};