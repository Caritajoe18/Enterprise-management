import CustomerOrder from "../models/customerOrder";
import { Plan, Products } from "../models/products";
import { Response} from "express";
import { customerOrderSchema } from "../validations/customerValid";
import { option } from "../validations/adminValidation";
import Customer from "../models/customers";
import Ledger from "../models/ledger";
import Decimal from "decimal.js";
import { Op, Transaction } from "sequelize";

import { AuthRequest } from "../middleware/adminAuth";
import Admins from "../models/admin";
import {
  createDepartmentLedgerEntry,
  fetchCustomerAndProduct,
} from "../utilities/modules";
import db from "../db";

export const raiseCustomerOrder = async (req: AuthRequest, res: Response) => {
  const transaction: Transaction = await db.transaction();
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
    const { customer, product } = await fetchCustomerAndProduct(
      customerId,
      productId
    );

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
    let rate = priceToUse.toNumber();
    let basePrice = priceToUse.mul(new Decimal(quantity));

    // Apply discount if provided and if a price plan is available
    if (discount && pricePlan) {
      const matchingPlan = pricePlan.find((plan: Plan) => {
        // json objects are usually stored stringified in c Panel mysql database, so I
        //am changing the priceplan amout to number first.

        const planAmount = Number(plan.amount);
        return !isNaN(planAmount) && planAmount === discount;
      });
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
      rate = priceToUse.toNumber(); 
    } else if (discount && !pricePlan) {
      throw new Error(
        "Discounts are not applicable for this product as no price plan is available."
      );
    }

    // Calculate total price
    const parsedQuantity = new Decimal(quantity);
    const totalPrice = priceToUse.mul(parsedQuantity);

    // Create new customer order
    const newOrder = await CustomerOrder.create(
      {
        ...req.body,
        customerId,
        productId,
        createdBy: adminId,
        unit,
        quantity,
        price: totalPrice.toNumber(),
        rate,
        basePrice: basePrice.toNumber(),
      },
      { transaction }
    );

    // Update ledger with new balance
    const latestEntry = await Ledger.findOne({
      where: { customerId },
      order: [["createdAt", "DESC"]],
      transaction,
    });

    const prevBalance = latestEntry
      ? new Decimal(latestEntry.dataValues.balance)
      : new Decimal(0);
    const newBalance = prevBalance.minus(totalPrice);

    await Ledger.create(
      {
        ...req.body,
        tranxId: newOrder.dataValues.id,
        customerId,
        productId,
        unit,
        quantity,
        credit: 0,
        debit: totalPrice.toNumber(),
        balance: newBalance.toNumber(),
      },
      { transaction }
    );
    await createDepartmentLedgerEntry(
      req.body,
      product.dataValues.departmentId,
      product.dataValues.name,
      `${customer.dataValues.firstname} ${customer.dataValues.lastname}`,
      totalPrice,
      false,
      transaction
    );

    await transaction.commit();

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
    });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this product", orders });
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
    if(orders.length == 0){
      return res
        .status(200)
        .json({ message: "No orders found", orders }); 
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
        .status(200)
        .json({ message: "No orders found for this customer",orders });
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
