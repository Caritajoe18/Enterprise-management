import { QueryInterface, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { bcryptEncode } from "../utilities/auths";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
        const hashedPassword = await bcryptEncode({ value: 'Password123' });
        await queryInterface.bulkInsert(
            "Admins",
            [
        {
          id: uuidv4(),
          firstname: "admin",
          lastname: "admin",
          email: "admin3@example.com",
          phoneNumber: +234801111,
          password: hashedPassword,
          //confirmPassword:"Pass12345",
          isAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("NavParents", {}, {});
  },
};
