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
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: "Customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      ledgerId: {
        type: DataTypes.STRING,
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
        type: DataTypes.STRING,
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
        allowNull: false,
      },
      credit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      balanceBeforeDebit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      debit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      currentBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      preparedBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deliveredBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      checkedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customerSig: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invoiceNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
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
