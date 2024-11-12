import CustomerOrder from "../models/customerOrder";
import { Plan, Products } from "../models/products";
import { Response, Request } from "express";
import { customerOrderSchema } from "../validations/customerValid";
import { option } from "../validations/adminValidation";
import Customer from "../models/customers";
import Ledger from "../models/ledger";
import Decimal from "decimal.js";
import { Op } from "sequelize";

import { AuthRequest } from "../middleware/adminAuth";
import Admins from "../models/admin";

export const raiseCustomerOrder = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.admin as Admins;
    const { roleId: adminId } = admin.dataValues;
    const { customerId, productId, quantity, unit, discount } = req.body;

    const validationResult = customerOrderSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    // Check if customer exists
    const customer = await Customer.findOne({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
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
        typeof product.dataValues.price === "object"
          ? product.dataValues.price
          : JSON.parse(product.dataValues.price);
    } catch (error) {
      throw new Error("Invalid price format.");
    }

    if (!Array.isArray(prices)) prices = [prices];

    // Find product price based on unit
    let productPrice = prices.find((p: any) => p.unit === unit);
    if (!productPrice) {
      const availableUnits = prices.map((p: any) => p.unit).join(", ");
      throw new Error(
        `Price not found for unit "${unit}". Available units: [${availableUnits}].`
      );
    }

    let pricePlan: Plan[] | undefined;
    if (
      product.dataValues.pricePlan &&
      Object.keys(product.dataValues.pricePlan).length !== 0
    ) {
      try {
        pricePlan = Array.isArray(product.dataValues.pricePlan)
          ? product.dataValues.pricePlan
          : JSON.parse(product.dataValues.pricePlan);
      } catch (error) {
        throw new Error("Invalid price plan format.");
      }
    }

    let priceToUse = new Decimal(productPrice.amount);

    // Apply discount if provided and if a price plan is available
    if (discount && pricePlan) {
      const matchingPlan = pricePlan.find(
        (plan: Plan) => plan.amount === discount
      );
      if (!matchingPlan) {
        throw new Error(
          `Discount of ${discount} does not match any available price plan. Available plans: ${pricePlan
            .map((plan) => plan.amount)
            .join(", ")}`
        );
      }
      const discountedPrice = priceToUse.minus(new Decimal(discount));
      if (discountedPrice.lessThan(0)) {
        throw new Error("Discount cannot exceed product price.");
      }
      priceToUse = discountedPrice;
    } else if (discount && !pricePlan) {
      throw new Error(
        "Discounts are not applicable for this product as no price plan is available."
      );
    }

    // Calculate total price
    const parsedQuantity = new Decimal(quantity);
    const totalPrice = priceToUse.mul(parsedQuantity);

    // Create new customer order
    const newOrder = await CustomerOrder.create({
      ...req.body,
      customerId,
      productId,
      createdBy: adminId,
      unit,
      quantity,
      price: totalPrice.toNumber(),
    });

    // Update ledger with new balance
    const latestEntry = await Ledger.findOne({
      where: { customerId},
      order: [["createdAt", "DESC"]],
    });

    const prevBalance = latestEntry
      ? new Decimal(latestEntry.dataValues.balance)
      : new Decimal(0);
    const newBalance = prevBalance.minus(totalPrice);

    await Ledger.create({
      ...req.body,
      customerId,
      productId,
      unit,
      quantity,
      credit: 0,
      debit: totalPrice.toNumber(),
      balance: newBalance.toNumber(),
    });

    return res.status(201).json({
      message: "Order raised and ledger updated successfully",
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

export const getOrdersByProduct = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId: adminId, isAdmin } = admin.dataValues;
  const { productId } = req.params;

  try {
    const orders = await CustomerOrder.findAll({
      where: isAdmin ? {} : { createdBy: adminId, productId },

      include: [
        {
          model: Customer,
          as: "corder",
          attributes: ["id", "customerTag", "firstname", "lastname"],
        },
        {
          model: Products,
          as: "porders",
          attributes: ["id", "name", "price", "pricePlan"],
        },
      ],
      order: [["createdAt", "DESC"]],
      //logging: console.log, //
    });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this product" });
    }

    return res.status(200).json(orders);
  } catch (error: unknown) {
    console.error("Transaction failed:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId: adminId, isAdmin } = admin.dataValues;
  try {
    const orders = await CustomerOrder.findAll({
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

export const getOrdersByCustomer = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId: adminId, isAdmin } = admin.dataValues;
  const { customerId } = req.params;

  try {
    const orders = await CustomerOrder.findAll({
      where: isAdmin ? {} : { createdBy: adminId, customerId },
      include: [
        {
          model: Customer,
          as: "corder",
          attributes: ["customerTag", "firstname", "lastname"],
        },
        {
          model: Products,
          as: "porders",
          attributes: ["name", "price", "pricePlan"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this customer" });
    }

    return res.status(200).json(orders);
  } catch (error: unknown) {
    console.error("Transaction failed:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const searchCustomersFromOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const admin = req.admin as Admins;
    const { roleId: adminId, isAdmin } = admin.dataValues;
    const { searchQuery } = req.query;

    // Fetch orders based on the admin's permissions
    const orders = await CustomerOrder.findAll({
      where: isAdmin ? {} : { createdBy: adminId },
      attributes: ["customerId"],
    });

    const customerIds = [
      ...new Set(orders.map((order) => order.dataValues.customerId)),
    ];

    if (customerIds.length === 0) {
      return res.status(404).json({ message: "No customers entries found." });
    }

    // Search for customers with the obtained IDs and matching search criteria
    const customers = await Customer.findAll({
      where: {
        id: { [Op.in]: customerIds },
        [Op.or]: [
          { firstname: { [Op.like]: `%${searchQuery}%` } },
          { lastname: { [Op.like]: `%${searchQuery}%` } },
          { customerTag: { [Op.like]: `%${searchQuery}%` } },
        ],
      },
      attributes: ["id", "customerTag", "firstname", "lastname"],
    });

    if (customers.length === 0) {
      return res
        .status(404)
        .json({ message: "No matching customers found.", customers });
    }

    return res
      .status(200)
      .json({ message: "Customers retrieves successfully.", customers });
  } catch (error) {
    console.error("Error retrieving customers from orders:", error);
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};
