import { Request, Response } from "express";
import RawMaterialInstance from "../models/products";






export const createRawMaterial = async (req: Request, res: Response) => {
    try {
      const { name, price } = req.body;
    
  
      const rawMaterial = await RawMaterialInstance.create({
        ...req.body,
        name: name,
        price: price,
      });
      res
        .status(201)
        .json({ message: "Raw material added successfully", rawMaterial });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const updateRawMaterial = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { price } = req.body;
      const rawMaterial = await RawMaterialInstance.findByPk(id);
      if (!rawMaterial) {
        return res.status(404).json({ error: "Raw material not found" });
      }
      rawMaterial.dataValues.price = price;
      await rawMaterial.save();
      res
        .status(200)
        .json({ message: "Price updated successfully", rawMaterial });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  