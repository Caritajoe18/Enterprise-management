import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("Admins", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },

      firstname: {
        type: Sequelize.STRING,
      },
      lastname: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      phoneNumber: {
        type: Sequelize.STRING,
      },
      profilePic: {
        type: Sequelize.STRING,
      },
      department: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      roleName: {
        type: Sequelize.STRING,
      },
      roleId: {
        type: Sequelize.UUID,
      },
      verificationToken: {
        type: Sequelize.STRING,
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
      },
      password: {
        type: Sequelize.STRING,
      },
      active: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("Admins");
  },
};
