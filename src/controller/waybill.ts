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
  
      const ledgerId = ledger.dataValues.id
  
      const invoice = await Invoice.findOne({ where: { tranxId } });
      const invoiceId = invoice?.dataValues.id
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
  
      const {corder } = order.get() as any;
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
  