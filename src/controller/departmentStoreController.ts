import { Request, Response } from "express";
import {
  createDeptOrderValidationSchema,
  deptOrderValidationSchema,
  editGenStoreValidationSchema,
  genStoreValidationSchema,
} from "../validations/productValidations";
import DepartmentStore from "../models/departmentStore";
import Departments from "../models/department";
import Products from "../models/products";
import DepartmentOrder from "../models/departmentOrders";
import { AuthRequest } from "../middleware/adminAuth";
import Admins from "../models/admin";

export const createDeptStore = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.admin as Admins;
    const { roleId: adminId } = admin.dataValues;
    const { productId, departmentId } = req.body;
    const { error, value } = genStoreValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors });
    }

    const dept = await Departments.findOne({
      where: { id: departmentId },
    });

    if (!dept) {
      return res.status(404).json({ message: "department not found" });
    }
    const product = await Products.findOne({
      where: { id: productId, departmentId: departmentId },
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found in the department" });
    }

    const exist = await DepartmentStore.findOne({ where: { productId } });
    if (exist) {
      return res.status(409).json({ message: "Product already exists" });
    }
    const store = await DepartmentStore.create({...value, createdBy: adminId});
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

export const getDeptStoreForSale = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId : adminId, isAdmin} = admin.dataValues;
  try {
    const stores = await DepartmentStore.findAll({
      where: isAdmin ? {} : { createdBy: adminId }, 
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Products,
          as: "product",
          where: { category: "For Sale" },
          attributes: ["name"],
          include: [
            {
              model: Departments,
              as: "department",
              attributes: ["name"],
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
export const getDeptStoreForPurchase = async (
  req: AuthRequest,
  res: Response
) => {
  const admin = req.admin as Admins;
  const { roleId: adminId, isAdmin } = admin.dataValues;
  try {
    const stores = await DepartmentStore.findAll({
      where: isAdmin ? {} : { createdBy: adminId }, 
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Products,
          as: "product",
          where: { category: "For Purchase" },
          attributes: ["name"],
          include: [
            {
              model: Departments,
              as: "department",
              attributes: ["name"],
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
      message: "stores with raw materials retrieved successfully",
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

export const deleteDeptStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const store = await DepartmentStore.findByPk(id);

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

export const createDeptOrder = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.admin as Admins;
    const { roleId: adminId } = admin.dataValues;
    const { orders } = req.body;

    const validatedOrders = [];
    for (const order of orders) {
      const { error, value } = deptOrderValidationSchema.validate(order, {
        abortEarly: false,
      });

      if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ errors });
      }

      const shelf = await DepartmentStore.findOne({
        where: { productId: value.productId },
      });

      if (!shelf) {
        return res
          .status(404)
          .json({ message: "Product or products not found in store" });
      }
      validatedOrders.push(value);
    }

    const newOrders = await DepartmentOrder.bulkCreate(
      validatedOrders.map((order) => ({
        ...order,
        createdBy: adminId,
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

export const viewDeptOrder = async (req: AuthRequest, res: Response) => {
  const admin = req.admin as Admins;
  const { roleId: adminId, isAdmin } = admin.dataValues;
  try {
    const stores = await DepartmentOrder.findAll({
      where: isAdmin ? {} : { createdBy: adminId }, 
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
