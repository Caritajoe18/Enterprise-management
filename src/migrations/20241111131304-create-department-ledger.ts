import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("DepartmentLedgers", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rawMaterial: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      unit: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
      },
      credit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      debit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      balance: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      comments: {
        type: DataTypes.STRING,
        allowNull: true,
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
      },
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable("DepartmentLedgers");
  },
};
