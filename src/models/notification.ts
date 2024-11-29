import { DataTypes, Model, Optional } from "sequelize";
import db from "../db";

interface NotificationAttributes {
  id: string;
  adminId: string;
  message: string;
  read: boolean;
  ticketId: string;
  type:string;
  createdAt: Date;
}

class Notify extends Model<NotificationAttributes> {
  static associate(models: any) {
    // Notify.hasMany(models.Admins, {
    //   foreignKey: "adminId",
    //   as: "notification",
    // });
  }
}

Notify.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: true,
      // references: {
      //   model: "Admins",
      //   key: "id",
      // },
      // onUpdate: "CASCADE",
      // onDelete: "CASCADE",
    },
    ticketId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    type: {
      type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: db,
    modelName: "Notification",
  }
);

export default Notify;
