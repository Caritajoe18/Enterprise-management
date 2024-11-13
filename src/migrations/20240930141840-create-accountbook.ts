import { DataTypes, QueryInterface } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('AccountBooks', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Customers', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      },
      supplierId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Suppliers', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      },
      credit: {
        type: Sequelize.DECIMAL(15, 2), 
        allowNull: false
      },
      debit: {
        type: Sequelize.DECIMAL(15, 2), 
        allowNull: false
      },
      creditType: {
        type: Sequelize.STRING, 
        allowNull: false
      },
      bankName: {
        type: Sequelize.STRING, 
        allowNull: true
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Products', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      },
      other: {
        type: Sequelize.STRING, 
        allowNull: true
      },
      comments: {
        type: Sequelize.STRING, 
        allowNull: true
      },
      departmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Departments', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable('AccountBooks');
  }
};
