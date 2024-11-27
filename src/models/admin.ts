import { DataTypes, Model } from "sequelize";
import db from "../db";
import Role from "./role";

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface AdminAttributes {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  profilePic: string;
  department: string[];
  address: string;
  roleId: string;
  pushSubscription: PushSubscription | null;
  verificationToken?: string;
  resetPasswordToken?: string | null;
  resetPasswordTokenExpiry: number | null;
  isAdmin?: boolean;
  isVerified: boolean;
  password: string;
  active: boolean;
}

class Admins extends Model<AdminAttributes> {
  public role?: Role;
  static associate(models: any) {
    Admins.belongsTo(models.Role, {
      foreignKey: "roleId",
      as: "role",
    });

    //  Role.hasMany(models.Admins, {
    //   foreignKey: 'roleId',
    //    as: 'admins',
    // });
  }
}
Admins.init(
  {
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
    pushSubscription: {
      type: DataTypes.JSON, // Field to store push subscription object
      allowNull: true, // Can be null until they subscribe
    },

    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    roleId: {
      type: DataTypes.UUID,
      references: {
        model: "Roles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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
  },
  {
    sequelize: db,
    modelName: "Admins",
    tableName: "Admins",
  }
);
export default Admins;
