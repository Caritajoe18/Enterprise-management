import { Request, Response } from "express";
import { Customer } from "../models/customers";
import {
  regCustomerSchema,
  updateCustomerSchema,
} from "../validations/customerValid";
import { option } from "../validations/adminValidation";
import { toPascalCase } from "../utilities/auths";

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const validationResult = regCustomerSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    let { phoneNumber, firstname, lastname } = req.body;
    firstname = toPascalCase(firstname);
    lastname = toPascalCase(lastname);

    const exist = await Customer.findOne({ where: { phoneNumber } });

    if (exist) {
      return res
        .status(400)
        .json({ error: "Customer with phonenumber already exists" });
    }

    const customer = await Customer.create({
      ...req.body,
      firstname,
      lastname,
    });
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
    const customers = await Customer.findAll({
      order: [["firstname", "ASC"]],
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

    const customer = await Customer.findByPk(id);
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

    const { phoneNumber, firstname, lastname, address, description } = req.body;

    const updatedFirstname = toPascalCase(firstname);
    const updatedLastname = toPascalCase(lastname);

    const validationResult = updateCustomerSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ error: "customer not found" });
    }
    if (phoneNumber && phoneNumber !== customer.dataValues.phoneNumber) {
      const existingCustomer = await Customer.findOne({
        where: { phoneNumber },
      });
      if (existingCustomer) {
        return res
          .status(400)
          .json({ error: "Customer with this phone number already exists" });
      }
    }

    const updatedCustomer = await customer.update({
      phoneNumber,
      description,
      firstname: updatedFirstname,
      lastname: updatedLastname,
      address,
    });
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

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await customer.destroy();

    return res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
