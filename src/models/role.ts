import { Model, DataTypes } from 'sequelize';
import db from '../db'
import Permission from './permission';

export interface RoleAttributes {
     id: string;
  name: string;
 }

// module.exports = (sequelize, DataTypes) => {
  class Role extends Model<RoleAttributes>  {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    public permissions?: Permission[];

    static associate(models: any) {
      Role.belongsToMany(models.Permission, {
        through: 'RolePermission',
        as: 'permissions',
          foreignKey: 'roleId',
        otherKey: 'permissionId' 
        });
        Role.hasMany(models.Admins, {
          foreignKey: "roleId",
          as: "admins",  
        });
        Role.hasMany(models.Invoice, {
          foreignKey: "preparedBy",
          as: "invoice",  
        });
        Role.hasMany(models.LPO, {
          foreignKey: "raisedByAdminId",
          as: "lpo",  
        });
        Role.hasMany(models.CollectFromGenStore, {
          foreignKey: "raisedByAdminId",
          as: "store",  
        });
        Role.hasMany(models.CashTicket, {
          foreignKey: "raisedByAdminId",
          as: "cash",  
        });
        Role.hasMany(models.AuthToWeigh, {
          foreignKey: "raisedByAdminId",
          as: "weigh",  
        });
    }
  }
  Role.init({
    id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
          },
  }, {
    sequelize:db,
    modelName: 'Role',
    tableName:'Roles',
  });
  export default Role;
