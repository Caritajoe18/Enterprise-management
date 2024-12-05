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
        // {
        //   id: uuidv4(),
        //   firstname: "Okay",
        //   lastname: "Obi",
        //   email: "polobi700@yahoo.co.uk",
        //   phoneNumber: +2348065208084,
        //   password: hashedPassword,
        //   isAdmin: true,
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        // },
        // {
        //   id: uuidv4(),
        //   firstname: "Emmanuel",
        //   lastname: "Obi",
        //   email: "onwaobiec@yahoo.com",
        //   phoneNumber: +2348033245044,
        //   password: hashedPassword,
        //   isAdmin: true,
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        // },
        {
          id: uuidv4(),
          firstname: "Rad",
          lastname: "Rad5",
          email: "admin@example.com",
          phoneNumber: +23480000000,
          password: hashedPassword,
          isAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("Admins", {}, {});
  },
};
