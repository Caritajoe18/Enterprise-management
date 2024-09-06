import { Request, Response } from "express";
import { CustomerInstance } from "../models/customers";
import {
  regCustomerSchema,
  updateCustomerSchema,
} from "../validations/customerValid";
import { option } from "../validations/adminValidation";

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const validationResult = regCustomerSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    const { email } = req.body;

    const exist = await CustomerInstance.findOne({ where: { email } });

    if (exist) {
      return res.status(400).json({ error: "Customer name already exists" });
    }

    const customer = await CustomerInstance.create({ ...req.body });
    return res.status(201).json({
      message: "customer created succsesfully",
      customer,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await CustomerInstance.findAll({
      order: [["name", "ASC"]],
    });
    if (customers.length === 0) {
      return res.status(204).send();
    }
    res.status(200).json({
      message: "successfully retrieved your customers",
      customers,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await CustomerInstance.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "customer not found", customer });
    }
    res
      .status(200)
      .json({ messages: "Customer retrieved succesfully", customer });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validationResult = updateCustomerSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    const customer = await CustomerInstance.findByPk(id);
    if (!customer) {
      return res.status(404).json({ error: "customer not found" });
    }
    const updatedCustomer = await customer.update(req.body);
    res.status(200).json({
      message: "Customer updated succesfully",
      updatedCustomer,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
