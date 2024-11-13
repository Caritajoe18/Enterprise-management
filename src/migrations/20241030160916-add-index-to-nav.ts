import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const table = await queryInterface.describeTable('Permissions');
    if (!table.orderIndex) { 
      await queryInterface.addColumn("Permissions", "orderIndex", {
        type: DataTypes.INTEGER,
        allowNull: false,
      });
    }
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn("Permissions", "orderIndex");
  },
};
