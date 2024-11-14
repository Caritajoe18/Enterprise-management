import { Request, Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middleware/staffPermissions";
import Notify from "../models/notification";
import Admins from "../models/admin";


export const getNotifications = async (req: AuthRequest, res: Response) => {
    const admin = req.admin as Admins;
    const { roleId, id:adminId } = admin.dataValues;
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 28);
    
    await Notify.destroy({
      where: {
        adminId,
        read: true,
        createdAt: { [Op.lt]: cutoffDate },
      },
    });

    const readNotifications = await Notify.findAll({
      where: { adminId, read: true },
      order: [["updatedAt", "DESC"]],
    });

    const unreadNotifications = await Notify.findAll({
      where: { adminId, read: false },
      order: [["createdAt", "DESC"]],
    });

    if (readNotifications.length === 0 && unreadNotifications.length === 0) {
      return res.status(200).json({
        message: "No notifications available",
        data: {
          readNotifications: [],
          unreadNotifications: [],
        },
      });
    }

    return res.status(200).json({
      message: "Notifications fetched successfully",
      data: {
        readNotifications,
        unreadNotifications,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};
