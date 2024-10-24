import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("DepartmentStores", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      department: {
        type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "Departments",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "Products",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
      },
      image:{
        type: Sequelize.STRING,
        allowNull: true,
      },

      unit: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
        defaultValue: 0,
      },
      thresholdValue: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
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

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable("DepartmentStores");
  },
};
