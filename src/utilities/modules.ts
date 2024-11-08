import { Request, Response } from "express";
import { Model, ModelStatic } from "sequelize";
import Admins from "../models/admin";
import Notify from "../models/notification";
import { getAdminConnection } from "../utilities/web-push";
export const getRecords = async (
  req: Request,
  res: Response,
  model: ModelStatic<Model>,
  entityName: string
) => {
  try {
    const records = await model.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (records.length === 0) {
      return res
        .status(200)
        .json({ message: `No ${entityName} Found`, records });
    }

    res.status(200).json({
      message: `Successfully retrieved ${entityName}`,
      records,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};

export const sendTicketToAdmin = async (
  ticketModel: ModelStatic<Model>,
  req: Request,
  res: Response,
  messageType: string,
  messageContent: string
) => {
  const { Id } = req.params;
  const { adminId } = req.body;

  try {
    const ticket = await ticketModel.findByPk(Id);
    const admin = await Admins.findByPk(adminId);

    if (!ticket || !admin) {
      return res.status(404).json({ message: "Ticket or admin not found" });
    }

    await Notify.create({
      ...req.body,
      adminId,
      message: messageContent,
      type: messageType,
      ticketId: Id,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: messageContent,
          ticket,
        })
      );
    }

    return res.status(200).json({
      message: "Ticket successfully sent to admin.",
      ticket,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};
