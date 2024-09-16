import { Model, DataTypes } from 'sequelize';
import db from '../db'
// import Permission from './permission';
// import Role from './role';


// module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
      // define association here
    }
  }
  RolePermission.init({
    roleId: {
            type: DataTypes.UUID,
            references: {
              model: "Roles",
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          permissionId: {
            type: DataTypes.UUID,
            references: {
              model: "Permissions",
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },


  }, {
    sequelize: db,
    modelName: 'RolePermissions',
  });


  export default RolePermission;
