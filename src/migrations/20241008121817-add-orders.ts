import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("Ledgers", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
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
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
      acctBookId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'AccountBooks', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      creditType: {
        type: Sequelize.ENUM("Transfer", "Cash"),
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
      weighImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      invoiceImg: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gatepassImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cashImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      wayBillImage: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Ledgers");
  },
};
