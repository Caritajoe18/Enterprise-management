import { Request, Response } from "express";
import {
  editGenStoreValidationSchema,
  genStoreValidationSchema,
} from "../validations/productValidations";
import GeneralStore from "../models/generalStore";

export const createGenStore = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { error, value } = genStoreValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors });
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
