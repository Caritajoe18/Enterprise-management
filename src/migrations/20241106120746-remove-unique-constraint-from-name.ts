import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.changeColumn("Permissions", "name", {
      type: Sequelize.STRING,
      allowNull: false,
      unique:false
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.changeColumn("Permissions", "name", {
      type: Sequelize.STRING,
      allowNull: false
    });
  },
};
