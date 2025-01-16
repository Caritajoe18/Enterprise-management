import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("CashierBooks", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      departmentId: {
        type: Sequelize.UUID,
        references: {
          model: "Departments",  
          key: "id",
        },
        allowNull: true,
        onDelete: 'SET NULL',  
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      approvedByAdminId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Admins",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      comment: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("CashierBooks");
  },
};
