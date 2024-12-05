import { Request, Response } from "express";
import { Supplier } from "../models/suppliers";
import {
  regSupplierSchema,
  updateSupplierSchema,
} from "../validations/customerValid";
import { option } from "../validations/adminValidation";
import { toPascalCase } from "../utilities/auths";
import { Op } from "sequelize";

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const validationResult = regSupplierSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    let { phoneNumber, firstname, lastname, email } = req.body;
    firstname = toPascalCase(firstname);
    lastname = toPascalCase(lastname);
    email = email ? email.toLowerCase() : null;
    const exist = await Supplier.findOne({ where: { phoneNumber } });

    if (exist) {
      return res
        .status(400)
        .json({ error: "Supplier with phonenumber already exists" });
    }

    const customer = await Supplier.create({
      ...req.body,
      firstname,
      lastname,
      email,
    });

    const supplierTag = `PS/${String(customer.dataValues.idCount).padStart(
      4,
      "0"
    )}`;
    await Supplier.update(
      { supplierTag },
      { where: { idCount: customer.dataValues.idCount } }
    );
    const newSup = await Supplier.findOne({ where: { supplierTag } });
    return res.status(201).json({
      message: "Supplier created succsesfully",
      newSup,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};

export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const customers = await Supplier.findAll({
      order: [["createdAt", "DESC"]],
    });
    if (customers.length === 0) {
      return res.status(200).json({ message: "No supplier found", customers });
    }
    res.status(200).json({
      message: "successfully retrieved your Suppliers",
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
export const getSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    //console.log(req.path, "yyy")
    const customer = await Supplier.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Supplier not found", customer });
    }
    res
      .status(200)
      .json({ messages: "Supplier retrieved succesfully", customer });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { phoneNumber, firstname, lastname, address, email } = req.body;

    const updatedFirstname = toPascalCase(firstname);
    const updatedLastname = toPascalCase(lastname);
    const updatedEmail = email ? email.toLowerCase() : null;

    const validationResult = updateSupplierSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    const customer = await Supplier.findByPk(id);
    if (!customer) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    if (phoneNumber && phoneNumber !== customer.dataValues.phoneNumber) {
      const existingCustomer = await Supplier.findOne({
        where: { phoneNumber },
      });
      if (existingCustomer) {
        return res
          .status(400)
          .json({ error: "Supplier with this phone number already exists" });
      }
    }

    const updatedCustomer = await customer.update({
      phoneNumber,
      firstname: updatedFirstname,
      lastname: updatedLastname,
      address,
      email: updatedEmail,
    });
    res.status(200).json({
      message: "Supplier updated succesfully",
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

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await Supplier.findByPk(id);
    if (!customer) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    await customer.destroy();

    return res.status(200).json({
      message: "Supplier deleted successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};

export const searchSupplier = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const whereClause: {
      [Op.or]?: {
        firstname?: { [Op.like]: string };
        lastname?: { [Op.like]: string };
        id?: { [Op.eq]: string };
      }[];
    } = {};

    if (search) {
      whereClause[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { id: { [Op.eq]: search.toString() } },
      ];
    }

    const customerList = await Supplier.findAll({ where: whereClause });

    if (customerList.length == 0) {
      return res
        .status(200)
        .json({ message: "No supplier found matching the criteria", customerList });
    }

    res
      .status(200)
      .json({ message: "Supplier retrieved successfully", customerList });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

export const orderSupplierFirstname = async (req: Request, res: Response) => {
  try {
    const customerList = await Supplier.findAll({
      order: [["firstname", "ASC"]],
    });

    if (customerList.length === 0) {
      return res.status(200).json({ message: "No suppliers found",customerList });
    }

    res
      .status(200)
      .json({ message: "Suppliers retrieved successfully", customerList });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};
