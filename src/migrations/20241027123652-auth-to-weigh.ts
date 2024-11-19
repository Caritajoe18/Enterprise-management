import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("AuthToWeigh", {
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
      customerId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      driver: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      vehicleNo: {
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
      tranxId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "CustomerOrders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
    await queryInterface.dropTable("AuthToWeigh");
  },
};
