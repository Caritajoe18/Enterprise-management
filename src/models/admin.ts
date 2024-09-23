import { DataTypes, Model } from "sequelize";
import db from "../db";
import Role from "./role";

export interface AdminAttributes {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  profilePic: string;
  department: string[];
  address: string;
  //roleName: string;
  roleId: string;
  verificationToken?: string;
  resetPasswordToken?: string| null;
  resetPasswordTokenExpiry:number| null;
  isAdmin?: boolean;
  isVerified: boolean;
  password: string;
  active: boolean;
}


// module.exports = (sequelize, DataTypes) => {
  class Admins extends Model<AdminAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    public role?: Role;
    static associate(models: any) {
      // define association here

      Admins.belongsTo(models.Roles, {
 foreignKey: 'roleId',
   as: 'roles',  });

 Role.hasMany(models.Admins, {
  foreignKey: 'roleId',
   as: 'admins',
});
    }
  }
  Admins.init({
    
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
  
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
  
      profilePic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      department: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      // roleName: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      
      roleId: {
        type: DataTypes.UUID,
        references: {
          model: 'Roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
  
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordTokenExpiry: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
  
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
  }, {
    sequelize: db,
    modelName: 'Admins',
  });
  export default  Admins;
