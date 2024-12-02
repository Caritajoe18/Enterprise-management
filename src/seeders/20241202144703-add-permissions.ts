import { QueryInterface, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.bulkInsert(
      "Permissions",
      [
        {
          id: uuidv4(),
          name: "Place Order",
          slug:"place-order",
          navParentId: "e837484c-713a-4526-bb9e-8a8434c82828",
          url: "raise-customer-order",
          orderIndex: 3,
          isNav: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("Permissions", {}, {});
  },
};
