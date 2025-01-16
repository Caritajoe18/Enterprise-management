import { Request, Response } from "express";
import AuthToWeigh from "../models/AuthToWeigh";
import CustomerOrder from "../models/customerOrder";
import Customer from "../models/customers";
import { Transaction } from "sequelize";

import db from "../db";
import Ledger from "../models/ledger";
import Weigh from "../models/weigh";
import Role from "../models/role";

export const getAuthToWeighDetails = async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  try {
    const ticket = await AuthToWeigh.findOne({
      where: { id: ticketId },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
        {
          model: CustomerOrder,
          as: "transactions",
          attributes: ["quantity"],
          include: [
            {
              model: Customer,
              as: "corder",
              attributes: ["firstname", "lastname"],
            },
          ],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    console.log("tick", ticket);
    // Prepare the response to include ticket and order quantity
    return res.status(200).json({
      message: "Ticket details retrieved successfully",
      ticket,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const createWeigh = async (req: Request, res: Response) => {
  const transaction: Transaction = await db.transaction();
  try {
    const { tar, gross, image } = req.body; // Inputs from the user
    const { authToWeighId } = req.params;

    const ticket = await AuthToWeigh.findOne({
      where: { id: authToWeighId },
      include: [
        {
          model: CustomerOrder,
          as: "transactions",
          attributes: ["quantity"],
        },
      ],
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ error: "Authority To Weigh ticket not found" });
    }

    const { customerId, vehicleNo, tranxId, transactions } =
      ticket.get() as any;
    const expectedQuantity = parseFloat(transactions?.quantity || "0");
    console.log("quant ", expectedQuantity);
    const net = parseFloat(gross) - parseFloat(tar);

    let extra = null;
    if (net !== expectedQuantity) {
      extra = net - expectedQuantity;
    }

    // Create the Weigh record with the auto-filled values
    const weigh = await Weigh.create(
      {
        ...req.body,
        customerId,
        tranxId,
        vehicleNo,
        tar,
        gross,
        net,
        extra,
        image,
      },
      { transaction }
    );
    await Ledger.update(
      { weighImage: image },
      { where: { tranxId }, transaction }
    );
    await transaction.commit();
    return res.status(201).json({
      message: "Weigh record created successfully",
      weigh,
      quantity: expectedQuantity,
    });
  } catch (error) {
    console.error("Error creating weigh details:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating weigh details" });
  }
};

export const viewWeigh = async (req: Request, res: Response) => {
  try {
    const { weighId } = req.params;
    const options: any = {
      include: [
        {
          model: CustomerOrder,
          as: "transactions",
          attributes: ["id", "quantity", "price"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["firstname", "lastname"],
        },
      ],
    };

    if (weighId) {
      options.where = { id: weighId };
    }

    const weighRecords = await Weigh.findAll(options);

    if (!weighRecords.length) {
      return res
        .status(404)
        .json({ message: "weigh not found.", weighRecords });
    }

    return res.status(200).json({
      message: "Weigh records retrieved successfully.",
      data: weighRecords,
    });
  } catch (error) {
    console.error("Error retrieving weigh records:", error);
    return res.status(500).json({
      error: "An error occurred while retrieving weigh records.",
    });
  }
};

export const viewAllWeigh = async (req: Request, res: Response) => {
  try {
    const weighRecords = await Weigh.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: CustomerOrder,
          as: "transactions",
          attributes: ["id", "quantity", "price"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["firstname", "lastname"],
        },
      ],
    });

    if (weighRecords.length === 0) {
      return res
        .status(404)
        .json({ message: "weigh not found.", weighRecords });
    }

    return res.status(200).json({
      message: "Weigh records retrieved successfully.",
      data: weighRecords,
    });
  } catch (error) {
    console.error("Error retrieving weigh records:", error);
    return res.status(500).json({
      error: "An error occurred while retrieving weigh records.",
    });
  }
};
