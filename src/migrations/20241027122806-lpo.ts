import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("LPOS", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      deliveredTo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      chequeNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      chequeVoucherNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      supplierId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Suppliers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      rawMaterial: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      unitPrice: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      quantOrdered: {
        type: Sequelize.DECIMAL(10, 3),
      },
      expires: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      period: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      comments: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
        defaultValue: 'pending',
      },
      raisedByAdminId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      approvedBySuperAdminId: {
        type: DataTypes.STRING,
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
    await queryInterface.dropTable("LPOS");
  },
};
