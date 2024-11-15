import { Request, Response } from "express";
import {
  editGenStoreValidationSchema,
  genOrderValidationSchema,
  genStoreValidationSchema,
} from "../validations/productValidations";
import GeneralStore from "../models/generalStore";
import GeneralOrder from "../models/generalOrders";
import {
  addQuantityToStore,
  removeQuantityFromStore,
} from "../utilities/modules";
import Products from "../models/products";

export const createGenStore = async (req: Request, res: Response) => {
  try {
    const { name, productId, departmentId } = req.body;
    const { error, value } = genStoreValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors });
    }
    const product = await Products.findOne({
      where: { id: productId, departmentId },
    });
    if (!product) {
      return res.status(404).json({
        message: `Product not found in department or does not exist`,
      });
    }

    const exist = await GeneralStore.findOne({ where: { name } });
    if (exist) {
      return res.status(409).json({ message: "Shelf name already exists" });
    }
    const store = await GeneralStore.create(value);
    const storeData = {
      ...store.get(),
      status: store.status,
    };

    return res
      .status(201)
      .json({ message: "Store created successfully", store: storeData });
  } catch (error) {
    console.error("Error creating store:", error);
    return res.status(500).json({ error: "Failed to create store" });
  }
};

export const getGenStores = async (req: Request, res: Response) => {
  try {
    const stores = await GeneralStore.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (stores.length === 0) {
      return res.status(404).json({ message: "No stores found" });
    }

    const parsedStores = stores.map((store) => ({
      ...store.toJSON(),
      status: store.status,
    }));

    res.status(200).json({
      message: "Stores retrieved successfully",
      stores: parsedStores,
    });
  } catch (error) {
    console.error("Error retrieving stores:", error);
    return res.status(500).json({ error: "Failed to retrieve stores" });
  }
};

export const editGenStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = editGenStoreValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors });
    }

    const store = await GeneralStore.findByPk(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    await store.update(value);

    const updatedStore = {
      ...store.get(),
      status: store.status,
    };

    return res.status(200).json({
      message: "Store updated successfully",
      Genstore: updatedStore,
    });
  } catch (error) {
    console.error("Error updating store:", error);
    return res.status(500).json({ error: "Failed to update store" });
  }
};

export const createGenOrder = async (req: Request, res: Response) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ message: "Orders array cannot be empty." });
    }
    const productIds = new Set();
    const validatedOrders = [];
    for (const order of orders) {
      if (productIds.has(order.productId)) {
        return res.status(400).json({
          message: `Duplicate order for product ID ${order.productId} is not allowed.`,
        });
      }
      productIds.add(order.productId);
      const { error, value } = genOrderValidationSchema.validate(order, {
        abortEarly: false,
      });

      if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ errors });
      }

      const shelf = await GeneralStore.findOne({
        where: { id: value.productId },
      });

      if (!shelf) {
        return res
          .status(404)
          .json({ message: "Product or products not found in store, please add to store to place order" });
      }
      validatedOrders.push(value);
    }

    const newOrders = await GeneralOrder.bulkCreate(
      validatedOrders.map((order) => ({
        ...req.body,
        productId: order.productId,
        quantity: order.quantity,
        unit: order.unit,
        expectedDeliveryDate: order.expectedDeliveryDate,
      }))
    );

    return res.status(201).json({
      message: "Orders created successfully",
      order: newOrders,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const viewGenOrder = async (req: Request, res: Response) => {
  try {
    const stores = await GeneralOrder.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (stores.length === 0) {
      return res.status(404).json({ message: "No Orders found" });
    }

    res.status(200).json({
      message: "Orders retrieved successfully",
      Orders: stores,
    });
  } catch (error) {
    console.error("Error retrieving stores:", error);
    return res.status(500).json({ error: "Failed to retrieve stores" });
  }
};

export const deleteGenStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const store = await GeneralStore.findByPk(id);

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    await store.destroy();

    return res.status(200).json({
      message: "Store deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting store:", error);
    return res.status(500).json({
      error: "Failed to delete store",
    });
  }
};

export const addQuantityToGeneralStore = async (
  req: Request,
  res: Response
) => {
  return addQuantityToStore(req, res, GeneralStore);
};

export const removeQuantityFromGeneralStore = async (
  req: Request,
  res: Response
) => {
  return removeQuantityFromStore(req, res, GeneralStore);
};
