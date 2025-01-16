import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("CashTickets", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      staffName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      item: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comments: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      departmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Departments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      creditOrDebit: {
        type: Sequelize.ENUM("credit", "debit"),
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected", "completed"),
        defaultValue: "pending",
      },
      raisedByAdminId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      approvedBySuperAdminId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      cashierId: {
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
    await queryInterface.dropTable("CashTickets");
  },
};
