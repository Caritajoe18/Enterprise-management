import { Request, Response } from "express";
import cloudinary from "../utilities/cloudinary";
import PharmacyStore from "../models/pharmacyStore";
import {
  orderValidationSchema,
  storeEditValidationSchema,
  storeValidationSchema,
} from "../validations/productValidations";
import Products from "../models/products";
import PharmacyOrder from "../models/pharmacyOrders";
import { addQuantityToStore, removeQuantityFromStore } from "../utilities/modules";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(500).json({ error: "no file uploaded" });
    }
    const imageUpload = await cloudinary.uploader.upload(req.file.path);
    res.status(200).json({ imageUrl: imageUpload.secure_url });
  } catch (error) {
    res.status(500).json({ error: "image upload failed" });
  }
};

export const createStore = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const { error, value } = storeValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors });
    }

    const product = await Products.findOne({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const exist = await PharmacyStore.findOne({where: {productId}});
    if (exist) {
        return res.status(409).json({ message: "Product already added to store" });
      }
    const store = await PharmacyStore.create(value);
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

export const getPharmStores = async (req: Request, res: Response) => {
  try {
    const stores = await PharmacyStore.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (stores.length === 0) {
      return res.status(404).json({ message: "No stores found", stores });
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


export const getStoreForSale = async (req: Request, res: Response) => {
  try {
    const stores = await PharmacyStore.findAll({
      order: [["createdAt", "DESC"]],
      include: [{
        model: Products,  
        as: 'product',    
        where: {
          category: 'For Sale'
        },
        attributes: ['id', 'name']
      }]
    });


    if (!stores.length) {
      return res.status(404).json({ message: "No stores found for sale", stores });
    }
    const parsedStores = stores.map((store) => ({
      ...store.toJSON(),
      status: store.status, 
    }));

    res.status(200).json({
      message: "Pharmacy stores with products for sale retrieved successfully",
      parsedStores,
    });
  } catch (error) {
    console.error("Error fetching pharmacy stores:", error);
    return res.status(500).json({
      error: "Failed to fetch pharmacy stores",
    });
  }
};

export const getStoreForPurchase = async (req: Request, res: Response) => {
  try {
    const stores = await PharmacyStore.findAll({
      order: [["createdAt", "DESC"]],
      include: [{
        model: Products,  
        as: 'product',    
        where: {
          category: 'For Purchase'
        },
        attributes: ['id', 'name']
      }]
    });


    if (!stores.length) {
      return res.status(404).json({ message: "No stores found for raw materils", stores });
    }
    const parsedStores = stores.map((store) => ({
      ...store.toJSON(),
      status: store.status, 
    }));

    res.status(200).json({
      message: "Pharmacy stores with raw materials retrieved successfully",
      parsedStores,
    });
  } catch (error) {
    console.error("Error fetching pharmacy stores:", error);
    return res.status(500).json({
      error: "Failed to fetch pharmacy stores",
    });
  }
};


export const editStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = storeEditValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors });
    }

    const store = await PharmacyStore.findByPk(id);
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
      store: updatedStore,
    });
  } catch (error) {
    console.error("Error updating store:", error);
    return res.status(500).json({ error: "Failed to update store" });
  }
};



export const createOrder = async (req: Request, res: Response) => {
  try {
    const { orders } = req.body;

    const validatedOrders = [];
    for (const order of orders) {
      const { error, value } = orderValidationSchema.validate(order, {
        abortEarly: false,
      });

      if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ errors });
      }

      const product = await Products.findOne({
        where: { id: value.rawMaterial },
      });

    if (!product) {
      return res.status(404).json({ message: "Product or products not found" });
    }
    validatedOrders.push(value);
    }

    const newOrders = await PharmacyOrder.bulkCreate(
      validatedOrders.map((order) => ({
        ...req.body,
        rawMaterial: order.rawMaterial,
        quantity: order.quantity,
        unit: order.unit,
        expectedDeliveryDate: order.expectedDeliveryDate,
      }))
    );

    return res.status(201).json({
      message: "Orders created successfully",
      order: newOrders,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({
      error: "Failed to create order",
    });
  }
};

export const viewOrder = async (req: Request, res: Response) =>{
  try {
    const stores = await PharmacyOrder.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (stores.length === 0) {
      return res.status(404).json({ message: "No stores found", stores });
    }


    res.status(200).json({
      message: "Ordes retrieved successfully",
      Orders: stores,
    });
  } catch (error) {
    console.error("Error retrieving stores:", error);
    return res.status(500).json({ error: "Failed to retrieve stores" });
  } 
}

export const deletePharmStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const store = await PharmacyStore.findByPk(id);

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

export const addQuantityToPharmacyStore = async (req: Request, res: Response) => {
  return addQuantityToStore(req, res, PharmacyStore);
};

export const removeQuantityFromPharmacyStore = async (req: Request, res: Response) => {
  return removeQuantityFromStore(req, res, PharmacyStore);
};