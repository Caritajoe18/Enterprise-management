import { QueryInterface, DataTypes } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.bulkInsert("NavParents", [
      {
        id: uuidv4(), 
        name: "Dashboard",
        iconUrl: "fa-hat",
        slug: "dashboard",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),

      },
      {
        id: uuidv4(),
        name: "Customers",
        iconUrl: "/icons/users.png",
        slug: "customers",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),

      },
      {
        id: uuidv4(), 
        name: "Suppliers",
        iconUrl: "/icons/products.png",
        slug: "suppliers",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),

      },
      {
        id: uuidv4() ,
        name: "Products",
        iconUrl: "/icons/orders.png",
        slug: "products",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),

      },
      {
        id: uuidv4(),
        name: "Pharmacy Store",
        iconUrl: "/icons/settings.png",
        slug: "pharmacy-store",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),

      },
      {
        id: uuidv4(),
        name: "General Store",
        iconUrl: "/icons/reports.png",
        slug: "general-store",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Department Store",
        iconUrl: "/icons/support.png",
        slug: "department-store",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Department Ledger",
        iconUrl: "/icons/support.png",
        slug: "department-ledger",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id:uuidv4() ,
        name: "Orders",
        iconUrl: "/icons/support.png",
        slug: "orders",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Raise Ticket",
        iconUrl: "/icons/support.png",
        slug: "raise-ticket",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Admins",
        iconUrl: "/icons/support.png",
        slug: "admin",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Department",
        iconUrl: "/icons/support.png",
        slug: "department",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Tickets",
        iconUrl: "/icons/support.png",
        slug: "tickets",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),

      },
      {
        id: uuidv4(),
        name: "Cash Management",
        iconUrl: "/icons/support.png",
        slug: "cash-managment",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Accounting",
        iconUrl: "/icons/support.png",
        slug: "accounting",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Weighing Operations",
        iconUrl: "/icons/support.png",
        slug: "weighing-operations",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Report",
        iconUrl: "/icons/support.png",
        slug: "report",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id:uuidv4() ,
        name: "Notification",
        iconUrl: "/icons/support.png",
        slug: "notification",
        isNav: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("NavParents", {}, {});
  },
};
