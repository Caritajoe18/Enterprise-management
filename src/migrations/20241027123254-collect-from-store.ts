import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("CollectFromGenStore", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      raisedByAdminId: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      recievedBy: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      items: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      comments: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected", "completed"),
        defaultValue: "pending",
      },

      approvedBySuperAdminId: {
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
    await queryInterface.dropTable("CollectFromGenStore");
  },
};
