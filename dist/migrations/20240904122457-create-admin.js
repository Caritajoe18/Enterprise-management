"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
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
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Admins");
    },
};
//# sourceMappingURL=20240904122457-create-admin.js.map