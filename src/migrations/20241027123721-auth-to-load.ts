import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("Invoices", {
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
      vehicleNo: {
        type: DataTypes.STRING,
        allowNull: true,
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
      quantityOrdered: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      prevBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      credit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      balanceBeforeDebit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      ledgerEntries: {
        type: DataTypes.JSON, 
        allowNull: true,
      },
      currentBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      bankName: {
        type: DataTypes.STRING,
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
      invoiceNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true, 
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
    await queryInterface.dropTable("Invoices");
  },
};
