// import { QueryInterface, DataTypes } from "sequelize";
// import { v4 as uuidv4 } from "uuid";

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
//     await queryInterface.bulkInsert(
//       "Admins",
//       [
//         {
//           id: uuidv4(),
//           firstname: "admin",
//           lastname: "admin",
//           email: "admin@example.com",
//           phoneNumber: +23480,
//           password: "Pass12345",
//           //confirmPassword:"Pass12345",
//           isAdmin: true,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       ],
//       {}
//     );
//   },

//   async down(queryInterface: QueryInterface) {
//     await queryInterface.bulkDelete("NavParents", {}, {});
//   },
// };
