import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("Waybills", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      tranxId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "CustomerOrders",
          key: "id",
        },
      },
      ledgerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Ledgers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      invoiceId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Invoices",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transportedBy: {
        type: DataTypes.ENUM("Company","Customer"),
        allowNull: true,
      },
      driversLicense: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bags: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      preparedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable("Waybills");
  },
};
