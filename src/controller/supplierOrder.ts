import { Response, Request } from "express";
import { AuthRequest } from "../middleware/adminAuth";
import Admins from "../models/admin";
import { supplierOrderSchema } from "../validations/customerValid";
import { option } from "../validations/adminValidation";
import Supplier from "../models/suppliers";
import Products from "../models/products";
import Decimal from "decimal.js";
import SupplierOrder from "../models/supplierOrder";
import SupplierLedger from "../models/supplierLedger";
export const raiseSupplierOrder = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.admin as Admins;
    console.log("Admin from request:", admin);
    const { roleId: adminId } = admin.dataValues;
    const { supplierId, productId, quantity, unit } = req.body;

    const validationResult = supplierOrderSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    // Check if customer exists
    const customer = await Supplier.findOne({ where: { id: supplierId } });
    if (!customer) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Check if product exists
    const product = await Products.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let prices;
    // Validate and wrap the price array
    try {
      prices =
        typeof product.dataValues.price == "object"
          ? product.dataValues.price
          : JSON.parse(product.dataValues.price);
    } catch (error) {
      throw new Error("Invalid price format.");
    }

    if (!Array.isArray(prices)) prices = [prices];

    let productPrice = prices.find((p: any) => p.unit === unit);
    if (!productPrice) {
      const availableUnits = prices.map((p: any) => p.unit).join(", ");
      //console.log("Available units:", availableUnits);
      throw new Error(
        `Price not found for unit "${unit}". Available units: [${availableUnits}].`
      );
    }

    let priceToUse = new Decimal(productPrice.amount);
    console.log("price to use:", priceToUse);

    // Calculate total price
    const parsedQuantity = new Decimal(quantity);
    const totalPrice = priceToUse.mul(parsedQuantity);
    console.log(
      `Unit Price: ${priceToUse} * Quantity: ${parsedQuantity} = Total Price: ${totalPrice}`
    );

    // Create new customer order
    const newOrder = await SupplierOrder.create({
      ...req.body,
      supplierId,
      productId,
      createdBy: adminId,
      unit,
      quantity,
      price: totalPrice.toNumber(),
    });
    //console.log("Order created successfully:", newOrder);

    // Update ledger with new balance
    const latestEntry = await SupplierLedger.findOne({
      where: { supplierId, productId },
      order: [["createdAt", "DESC"]],
    });

    const prevBalance = latestEntry
      ? new Decimal(latestEntry.dataValues.balance)
      : new Decimal(0);
    const newBalance = prevBalance.minus(totalPrice);
    console.log(`Previous Balance: ${prevBalance}, New Balance: ${newBalance}`);

    await SupplierLedger.create({
      ...req.body,
      supplierId,
      productId,
      unit,
      quantity,
      credit: 0,
      debit: totalPrice.toNumber(),
      balance: newBalance.toNumber(),
    });

    return res.status(201).json({
      message: "Order raised and supplier ledger updated successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Transaction failed:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const getAllSupplierOrders = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId: adminId, isAdmin } = admin.dataValues;
  try {
    const orders = await SupplierOrder.findAll({
      where: isAdmin ? {} : { createdBy: adminId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(orders);
  } catch (error: unknown) {
    console.error("Transaction failed:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};
