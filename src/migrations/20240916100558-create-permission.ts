import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable("Permissions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isNav: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isAssigned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      orderIndex: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      navParentId: {
        type: Sequelize.UUID,
        references: {
          model: "NavParents",
          key: "id",
        },
        onDelete: "SET NULL",
        allowNull: true,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable("Permissions");
  },
};
