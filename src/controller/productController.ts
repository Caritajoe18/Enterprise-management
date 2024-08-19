import { Request, Response } from "express";
import { ProductInstance } from "../models/products";
import { createProductSchema } from "../validations/prioductValidations";
import { option } from "../validations/userValidation";

export const createRawMaterial = async (req: Request, res: Response) => {
  try {
    const validationResult = createProductSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    const { name } = req.body;

    const exist = await ProductInstance.findOne({ where: { name } });
    if (exist) {
      return res.status(400).json({ error: "Product already exists" });
    }

    const product = await ProductInstance.create({
      ...req.body,
    });

    res
      .status(201)
      .json({ message: "Raw material added successfully", product });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};

export const updateRawMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { prices } = req.body;

    const product = await ProductInstance.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }

    product.dataValues.prices = { ...product.dataValues.prices, ...prices };
    await product.save();

    res.status(200).json({ message: "Prices updated successfully", product });
  } catch (error: unknown){
    if (error instanceof Error){
        res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "An unexpected error occurred." });
  } 
  
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
      const products= await ProductInstance.findAll();
    
      res.status(200)
        .json({ message: "Company's products retrieved successfully", products });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  };
  
