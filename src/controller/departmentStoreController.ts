import { Request, Response } from "express";
import { editGenStoreValidationSchema, genStoreValidationSchema } from "../validations/productValidations";
import DepartmentStore from "../models/departmentStore";
import Departments from "../models/department";
import Products from "../models/products";

export const createDeptStore = async (req: Request, res: Response) => {
    try {
      const { name, department } = req.body;
      const { error, value } = genStoreValidationSchema.validate(req.body, {
        abortEarly: false,
      });
  
      if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ errors });
      }

      const dept = await Departments.findOne({
        where: { id: department },
      });
  
      if (!dept) {
        return res.status(404).json({ message: "department not found" });
      };
      const product = await Products.findOne({
        where: { id: name, departmentId: department },  
      });
  
      if (!product) {
        return res.status(404).json({ message: "Product not found in thedepartment" });
      }
  
      const exist = await DepartmentStore.findOne({ where: { name } });
      if (exist) {
        return res.status(409).json({ message: "Product already exists" });
      }
      const store = await DepartmentStore.create(value);
      const storeData = {
        ...store.get(),
        status: store.status,
      };
  
      return res
        .status(201)
        .json({ message: "Store created successfully", store: storeData });
    } catch (error: unknown) {
        if (error instanceof Error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    };


export const getDeptStoreForSale = async (req: Request, res: Response) => {
  try {
    const stores = await DepartmentStore.findAll({
      include: [
        {
          model: Products,
          as: 'product',
          where: { category: 'For Sale' },  
          attributes: ['name'],  
          include: [
            {
              model: Departments,
              as: 'department',
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    if (!stores.length) {
      return res.status(404).json({ message: "No stores found for sale" });
    }

    const parsedStores = stores.map((store) => ({
      ...store.toJSON(),
      status: store.status,
    }));

    return res.status(200).json({
      message: "stores with products for sale retrieved successfully",
      stores: parsedStores,  
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};
export const getDeptStoreForPurchase = async (req: Request, res: Response) => {
  try {
    const stores = await DepartmentStore.findAll({
      include: [
        {
          model: Products,
          as: 'product',
          where: { category: 'For Purchase' },  
          attributes: ['name'],  
          include: [
            {
              model: Departments,
              as: 'department',
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    if (!stores.length) {
      return res.status(404).json({ message: "No stores found for sale" });
    }

    const parsedStores = stores.map((store) => ({
      ...store.toJSON(),
      status: store.status
    }));

    return res.status(200).json({
      message: "stores with products for sale retrieved successfully",
      stores: parsedStores,  
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const editDeptStore = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { error, value } = editGenStoreValidationSchema.validate(req.body, {
        abortEarly: false,
      });
  
      if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ errors });
      }
  
      const store = await DepartmentStore.findByPk(id);
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
        Departmnetstore: updatedStore,
      });
    } catch (error: unknown) {
        if (error instanceof Error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    };
    