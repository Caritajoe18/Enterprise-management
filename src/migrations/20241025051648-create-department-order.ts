import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("DepartmentOrders", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      departmentId: {
        type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "Departments",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
      },
      productId: {
        type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "Products",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
      expectedDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: true,
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
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable("DepartmentOrders");
  },
};
