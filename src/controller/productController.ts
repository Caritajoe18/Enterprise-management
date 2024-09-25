import { Request, Response } from "express";
import { Products } from "../models/products";
import { createProductSchema, updateProductSchema } from "../validations/productValidations";
import { option } from "../validations/adminValidation";
import { Op } from "sequelize";
import { toPascalCase } from "../utilities/auths";
import Departments from "../models/department";

export const createProducts = async (req: Request, res: Response) => {
  try {
    const validationResult = createProductSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

  const { name, price, pricePlan, departmentId} = req.body;

    const exist = await Products.findOne({ where: { name } });
    if (exist) {
      return res.status(400).json({ message: "Product already exists" });
    }
    if (departmentId) {
      const departmentExists = await Departments.findByPk(departmentId);
      if (!departmentExists) {
        return res.status(400).json({ message: "Department not found" });
      }
    }

    let product = await Products.create({
      ...req.body,
      name,
      price,
      pricePlan: pricePlan || {},
      departmentId: departmentId || null,
    });

    res
      .status(201)
      .json({ message: "product added successfully", product });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};

export const updateProducts = async (req: Request, res: Response) => {
  try {
    const validationResult = updateProductSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    const { id } = req.params;
    const { price, name, pricePlan, category } = req.body;

    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }

    const updatedPrices = price ? price : product.dataValues.price;  
    const updatedPricePlan = pricePlan ? pricePlan : product.dataValues.pricePlan;
   await Products.update(
      { name, category, price: updatedPrices, pricePlan: updatedPricePlan},
      { where: { id } }
    );

    const updatedProducts = await Products.findByPk(id);

    if (updatedProducts) {
      if (typeof updatedProducts.dataValues.price == 'string') {
        updatedProducts.dataValues.price = JSON.parse(updatedProducts.dataValues.price);
      }

      if (typeof updatedProducts.dataValues.pricePlan == 'string') {
        updatedProducts.dataValues.pricePlan = JSON.parse(updatedProducts.dataValues.pricePlan);
      }
    }
    
    res
      .status(200)
      .json({ message: "Products updated successfully", updatedProducts });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    const whereClause: {
      name?: { [Op.like]: string };
    } = {};

    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }

    const products = await Products.findAll({ where: whereClause });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No product found matching the criteria" });
    }

    res
      .status(200)
      .json({ message: "Company's products retrieved successfully", products });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Products.findAll();
    if (products.length === 0) {
      return res.status(204).send();
    }

    const parsedProducts = products.map(product => {
      return {
        ...product.toJSON(),
        price: typeof product.dataValues.price === 'string' ? JSON.parse(product.dataValues.price) : product.dataValues.price,
        pricePlan: typeof product.dataValues.pricePlan === 'string' ? JSON.parse(product.dataValues.pricePlan) : product.dataValues.pricePlan,
      };
    });

    res.status(200).json({
      message: "Company's products retrieved successfully",
      products: parsedProducts,
    });

    
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "No product found" });
    }

    
    await product.destroy();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
