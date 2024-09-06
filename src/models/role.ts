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

    static associate() {
      Role.belongsToMany(Permission, {
        through: 'RolePermission',
        as: 'permissions',
          foreignKey: 'roleId',
        otherKey: 'permissionId' 
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
  });
  export default Role;
