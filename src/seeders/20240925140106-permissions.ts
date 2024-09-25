import { QueryInterface, DataTypes } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
module.exports = {
  up: async (queryInterface:QueryInterface , Sequelize: typeof DataTypes) => {
    // Seed data to insert into Permissions table
    const permissionsData = [
      {
        name: 'Admin Dashboard Access',
        isNav: true,
        slug: 'admin-dashboard-access',
        url: '/admin/dashboard',
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: '7ecec2a0-e51e-465d-8f55-d66ae745bda3', 
      },
      
    ];

    // Insert data into Permissions table
    await queryInterface.bulkInsert('Permissions', permissionsData, {});
  },

  down: async (queryInterface: QueryInterface , Sequelize: typeof DataTypes) => {
    // Remove seeded data from Permissions table
    await queryInterface.bulkDelete('Permissions', {}, {});
  }
};
