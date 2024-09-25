import { QueryInterface, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    // Seed data to insert into Permissions table
    const permissionsData = [
      {
        id: uuidv4(),
        name: "Add Customer",
        isNav: true,
        slug: "add-customer",
        url: "reg-customer",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "1ab6b7eb-3a5c-4a5f-9a51-7ed43ea360c2",
      },
      {
        id: uuidv4(),
        name: "View Customer",
        isNav: true,
        slug: "view-customer",
        url: "get-customers",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "1ab6b7eb-3a5c-4a5f-9a51-7ed43ea360c2",
      },

      {
        id: uuidv4(),
        name: "Ledger",
        isNav: false,
        slug: "ledger",
        url: "ledger",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "1ab6b7eb-3a5c-4a5f-9a51-7ed43ea360c2",
      },
      {
        id: uuidv4(),
        name: "Get Customer",
        isNav: true,
        slug: "get-customer",
        url: "get-customer",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "1ab6b7eb-3a5c-4a5f-9a51-7ed43ea360c2",
      },
      {
        id: uuidv4(),
        name: "Edit Customer",
        isNav: false,
        slug: "edit-customer",
        url: "edit-customer",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "1ab6b7eb-3a5c-4a5f-9a51-7ed43ea360c2",
      },
      {
        id: uuidv4(),
        name: "Delete Customer",
        isNav: false,
        slug: "delete-customer",
        url: "delete-customer",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "1ab6b7eb-3a5c-4a5f-9a51-7ed43ea360c2",
      },

      {
        id: uuidv4(),
        name: "Create Role",
        isNav: true,
        slug: "create-role",
        url: "create-role",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "e968e73e-dc4c-4d88-bfcd-c78fe001fcfc",
      },
      {
        id: uuidv4(),
        name: "View Role",
        isNav: true,
        slug: "view-role",
        url: "get-roles",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "e968e73e-dc4c-4d88-bfcd-c78fe001fcfc",
      },

      {
        id: uuidv4(),
        name: "Create Admin",
        isNav: true,
        slug: "Create Admin",
        url: "reg-staff",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "e968e73e-dc4c-4d88-bfcd-c78fe001fcfc",
      },
      {
        id: uuidv4(),
        name: "Get Admin",
        isNav: true,
        slug: "get-staff",
        url: "all-staff",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "e968e73e-dc4c-4d88-bfcd-c78fe001fcfc",
      },
      {
        id: uuidv4(),
        name: "View Suspended",
        isNav: true,
        slug: "edit-customer",
        url: "suspended-staff",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "e968e73e-dc4c-4d88-bfcd-c78fe001fcfc",
      },
      {
        id: uuidv4(),
        name: "Delete Staff",
        isNav: false,
        slug: "delete-staff",
        url: "delete-staff",
        createdAt: new Date(),
        updatedAt: new Date(),
        navParentId: "e968e73e-dc4c-4d88-bfcd-c78fe001fcfc",
      },
    ];

    // Insert data into Permissions table
    await queryInterface.bulkInsert("Permissions", permissionsData, {});
  },

  down: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    // Remove seeded data from Permissions table
    await queryInterface.bulkDelete("Permissions", {}, {});
  },
};
