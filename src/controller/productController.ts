import { Request, Response } from "express";
import { ProductInstance } from "../models/products";
import { createProductSchema } from "../validations/productValidations";
import { option } from "../validations/adminValidation";
import { Op } from "sequelize";

export const createProducts = async (req: Request, res: Response) => {
  try {
    const validationResult = createProductSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    const { name, price, pricePlan } = req.body;

    const exist = await ProductInstance.findOne({ where: { name } });
    if (exist) {
      return res.status(400).json({ message: "Product already exists" });
    }

    let product = await ProductInstance.create({
      ...req.body,
      price,
      pricePlan: pricePlan || {},
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
    const { id } = req.params;
    const { prices, name } = req.body;

    const product = await ProductInstance.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }

    const updatedPrices = { ...product.dataValues.price, ...prices };

    const updatedProducts = await ProductInstance.update(
      { name, price: updatedPrices },
      { where: { id } }
    );
    //product.dataValues.prices = { ...product.dataValues.prices, ...prices };

    // console.log("After update:", product.dataValues);
    //await product.save();

    res
      .status(200)
      .json({ message: "Prices updated successfully", updatedProducts });
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

    const products = await ProductInstance.findAll({ where: whereClause });

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
    const products = await ProductInstance.findAll();
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

    // res
    //   .status(200)
    //   .json({ message: "Company's products retrieved successfully", products });
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

    const product = await ProductInstance.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "No product found" });
    }

    // Delete the product
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
