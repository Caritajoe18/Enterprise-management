import { Request, Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middleware/adminAuth";
import Admins from "../models/admin";
import Ledger from "../models/ledger";
import CustomerOrder from "../models/customerOrder";
import AuthToWeigh from "../models/AuthToWeigh";
import Products from "../models/products";
import Invoice from "../models/invoice";
import Customer from "../models/customers";
import Waybill from "../models/waybill";
import { generatePdf } from "../utilities/generatePdf";
import { approveReceipt } from "../utilities/modules";
import { getAdminConnection } from "../utilities/web-push";
import Notify from "../models/notification";
import Weigh from "../models/weigh";
import Role from "../models/role";
export const generateWaybill = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.admin as Admins;
    const { roleId: adminId } = admin.dataValues;
    const { tranxId } = req.params;

    const { transportedBy, driversLicense, bags, address } = req.body;

    const ledger = await Ledger.findOne({ where: { tranxId } });
    if (!ledger) {
      return res.status(404).json({ message: "Ledger not found" });
    }

    const ledgerId = ledger.dataValues.id;

    const invoice = await Invoice.findOne({ where: { tranxId } });
    const invoiceId = invoice?.dataValues.id;
    const order = await CustomerOrder.findByPk(tranxId, {
      include: [
        {
          model: Customer,
          as: "corder",
          attributes: ["id", "address"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { corder } = order.get() as any;
    const cusAddress = corder?.address;
    const finalAddress = address || cusAddress;

    // Create the waybill
    const waybill = await Waybill.create({
      ...req.body,
      address: finalAddress,
      tranxId,
      invoiceId,
      ledgerId,
      preparedBy: adminId,
      transportedBy,
      driversLicense,
      bags,
    });

    return res.status(201).json({
      message: "Waybill generated successfully!",
      waybill,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getAllWaybill = async (req: Request, res: Response) => {
  try {
    const waybills = await Waybill.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: CustomerOrder,
          as: "transaction",
          attributes: ["id"],
        },
        {
          model: Invoice,
          as: "invoice",
          attributes: ["vehicleNo"],
        },
      ],
    });

    return res.status(200).json({
      message: "Invoices retrieved successfully!",
      waybills,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};
export const sendWaybill = async (req: Request, res: Response) => {
  const { Id } = req.params;
  const { adminId } = req.body;

  try {
    const ticket = await Invoice.findByPk(Id);
    const admin = await Admins.findByPk(adminId);
    if (!ticket || !admin) {
      return res.status(404).json({ message: "Receipt or admin not found" });
    }

    await Notify.create({
      ...req.body,
      adminId,
      message: `A new Invoice has been sent to you.`,
      type: "waybill",
      ticketId: Id,
    });

    const adminWs = getAdminConnection(adminId);
    if (adminWs) {
      adminWs.send(
        JSON.stringify({
          message: `A new Invoice has been sent to you.`,
          ticket,
        })
      );
    }

    return res.status(200).json({
      message: "Receipt successfully sent to admin.",
      ticket,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const approveWaybill = (req: AuthRequest, res: Response) => {
  return approveReceipt(req, res, Waybill, "recieptId");
};

export const getAWaybill= async (req: Request, res: Response) => {
  try {
    const { waybillId } = req.params;

    // Fetch the waybill using waybillId
    const waybill = await Waybill.findOne({
      where: {
        id: waybillId,
      },
      include: [
        {
          model: CustomerOrder,
          as: "transaction",
          attributes: ["id"],
          include: [
            {
              model: Weigh,
              as: "weighBridge",
              attributes: ["tar", "gross", "net"],
            },
            {
              model: Products,
              as: "porders",
              attributes: ["name"],
            },
            {
              model: Customer,
              as: "corder",
              attributes: ["firstname","lastname"],
              
            },
          ],
        },
        {
          model: Invoice,
          as: "invoice",
          attributes: ["vehicleNo", "ledgerEntries", "invoiceNumber"],
          include: [
            {
              model: Products,
              as: "product",
              attributes: ["name"],
            }]
        },
        {
          model: Role,
          as: "preparedByRole",
          attributes: ["name"],
        },
      ],
    });
    
    if (!waybill) {
        return res.status(404).json({ message: "Waybill not found" });
    }
    
    const parsedWaybill = {
        ...waybill.toJSON(),
        invoice: {
          ...(waybill as any).invoice?.toJSON(),
          ledgerEntries:
            typeof (waybill as any).invoice?.dataValues.ledgerEntries === "string"
              ? JSON.parse((waybill as any).invoice?.dataValues.ledgerEntries)
              : (waybill as any).invoice?.dataValues.ledgerEntries,
        },
      };
  

    return res.status(200).json({
        message: "Receipt successfully sent to admin.",
        //waybill,
        parse: parsedWaybill
      });

  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the waybill PDF." });
  }
};
