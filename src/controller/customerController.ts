import { Request, Response } from "express";
import { Customer } from "../models/customers";
import {
  regCustomerSchema,
  updateCustomerSchema,
} from "../validations/customerValid";
import { option } from "../validations/adminValidation";
import { toPascalCase } from "../utilities/auths";
import { Op } from "sequelize";

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const validationResult = regCustomerSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    let { phoneNumber, firstname, lastname, email } = req.body;
    firstname = toPascalCase(firstname);
    lastname = toPascalCase(lastname);
    email = email ? email.toLowerCase(): null;

    const exist = await Customer.findOne({ where: { phoneNumber } });

    if (exist) {
      return res
        .status(400)
        .json({ error: "Customer with phone number already exists" });
    }
    
    const customer = await Customer.create({
      ...req.body,
      firstname,
      lastname,
      email,
    });

    const customerTag = `PC/${String(customer.dataValues.idCount).padStart(4, '0')}`;
    await Customer.update({ customerTag }, { where: { idCount: customer.dataValues.idCount } });
    const newCus = await Customer.findOne({where: {customerTag}})
    return res.status(201).json({
      message: "customer created succsesfully",
       newCus
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
      order: [["createdAt", "DESC"]],
    });
    if (customers.length === 0) {
      return res.status(204).json({messege: "No Customers Found"});
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
 //console.log(req.path, "yyy")
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(204).json({ message: "customer not found", customer });
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

    const { phoneNumber, firstname, lastname, address, email} = req.body;

    const updatedFirstname = toPascalCase(firstname);
    const updatedLastname = toPascalCase(lastname);
    const updatedEmail = email ? email.toLowerCase() : null;
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
      firstname: updatedFirstname,
      lastname: updatedLastname,
      address,
      email:updatedEmail
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

export const searchCustomer = async (req: Request, res: Response) => {
  try {
    const {search} = req.query 

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

    const customerList = await Customer.findAll({ where: whereClause });

    if (customerList.length == 0) {
      return res
        .status(404)
        .json({ message: "No customer found matching the criteria" });
    }

    res
      .status(200)
      .json({ message: "Staff retrieved successfully", customerList });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

export const orderCustomersFirstname = async (req: Request, res: Response) => {
  try {
    
    const customerList = await Customer.findAll({
      order: [['firstname', 'ASC']],
    });

    if (customerList.length === 0) {
      return res
        .status(404)
        .json({ message: "No customers found" });
    }

    res
      .status(200)
      .json({ message: "Customers retrieved successfully", customerList });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};
