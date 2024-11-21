import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("GatePasses", {
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
      customerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      escortName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      destination: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      preparedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      approvedBy: {
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
    await queryInterface.dropTable("GatePasses");
  },
};
