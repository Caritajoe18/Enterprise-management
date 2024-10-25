

import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("GeneralOrders", {
    id: {
      type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    productId: {
        type: Sequelize.UUID,
        references: {
          model: 'GeneralStores',
          key: 'id'
        },
        onDelete: 'CASCADE'
    },
    quantity: {
      type: Sequelize.DECIMAL(10,3),
      allowNull: false,
    },
    unit: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    expectedDeliveryDate: {
      type: Sequelize.DATE,
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
  await queryInterface.dropTable("GeneralOrders");
},
};