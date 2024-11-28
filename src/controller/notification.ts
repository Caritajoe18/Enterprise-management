import { Request, Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middleware/staffPermissions";
import Notify from "../models/notification";
import Admins from "../models/admin";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { id: adminId, roleId } = admin.dataValues;
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 28);

    await Notify.destroy({
      where: {
        [Op.or]: [{ adminId }, { adminId: roleId }],
        read: true,
        createdAt: { [Op.lt]: cutoffDate },
      },
    });

    const readNotifications = await Notify.findAll({
      where: { [Op.or]: [{ adminId }, { adminId: roleId }], read: true },
      order: [["updatedAt", "DESC"]],
    });

    const unreadNotifications = await Notify.findAll({
      where: { [Op.or]: [{ adminId }, { adminId: roleId }], read: false },
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

export const getNotification = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const notification = await Notify.findByPk(id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (!notification.dataValues.read) {
      await notification.update({ read: true });
    }

    return res.status(200).json({
      message: "Notification fetched successfully",
      data: notification,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};
export const bulkDeleteNotifications = async (req: Request, res: Response) => {
  const { notificationIds } = req.body;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid or empty notificationIds array." });
  }

  try {
    const deletedCount = await Notify.destroy({
      where: {
        id: {
          [Op.in]: notificationIds,
        },
      },
    });

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No notifications found to delete." });
    }

    return res.status(200).json({
      message: `${deletedCount} notifications deleted successfully.`,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};
