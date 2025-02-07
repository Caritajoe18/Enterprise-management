import { Request, Response } from "express";
import AdminInstance from "../models/admin";

import {
  option,
  signUpSchema,
  updateStaffSchema,
} from "../validations/adminValidation";
import { bcryptEncode, toPascalCase } from "../utilities/auths";
import crypto from "crypto";
import { sendVerificationMail } from "../utilities/sendVerification";
import { generateVerificationEmailHTML } from "../utilities/htmls";
import { Op } from "sequelize";
import { loginurl } from "./adminController";
import Role from "../models/role";
import { AuthRequest } from "../middleware/staffPermissions";

export const signupStaff = async (req: Request, res: Response) => {
  try {
    const validationResult = signUpSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    let { email, password, firstname, lastname, roleId, department } = req.body;

    firstname = toPascalCase(firstname);
    lastname = toPascalCase(lastname);
    email = email.toLowerCase();

    const exist = await AdminInstance.findOne({ where: { email } });

    if (exist) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const role = await Role.findOne({ where: { id: roleId } });
    if (!role) {
      return res.status(400).json({ error: "Role does not exist" });
    }
    const randomPassword =  crypto.randomBytes(3).toString("hex").slice(0,5);

    const passwordHashed = await bcryptEncode({ value: randomPassword });

    const user = await AdminInstance.create({
      ...req.body,
      roleId: role.dataValues.id,
      password: passwordHashed,
      firstname,
      lastname,
      email,
      department,
    });

    await sendVerificationMail(
      email,
      loginurl,
      firstname,
      generateVerificationEmailHTML,
      randomPassword
    );

    return res.status(201).json({
      message:
        "Staff created successfully, Check your email to activate your account",
      user,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let {
      firstname,
      lastname,
      phoneNumber,
      department,
      roleId,
      address,
      password,
    } = req.body;

    firstname = firstname ? toPascalCase(firstname) : firstname;

    lastname = lastname ? toPascalCase(lastname) : lastname;

    const validationResult = updateStaffSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    const staff = await AdminInstance.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: "staff not found" });
    }
    let passwordHashed = null;
    if (password) {
      passwordHashed = await bcryptEncode({ value: password });
    }
    const updatedStaff = await staff.update(
      {
        firstname,
        lastname,
        phoneNumber,
        department,
        address,
        roleId,
        ...(passwordHashed && { password: passwordHashed }),
      },
      { where: { id } }
    );
    res
      .status(200)
      .json({ message: "Staff updated successfully", updatedStaff });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const suspendStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await AdminInstance.findByPk(id);
    if (!staff || !staff.dataValues.active) {
      return res
        .status(404)
        .json({ error: "staff not found or already suspended" });
    }
    if (staff.dataValues.isAdmin) {
      return res.status(403).json({ message: "Cannont Suspend this user" });
    }
    const suspendedStaff = await staff.update(
      { active: false },
      { where: { id }, returning: true }
    );

    res
      .status(200)
      .json({ message: "Staff suspended successfully", suspendedStaff });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const restoreStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await AdminInstance.findByPk(id);
    if (!staff || staff.dataValues.active) {
      return res
        .status(404)
        .json({ error: "Staff not found or was not suspended" });
    }

    const restoredStaff = await staff.update(
      { active: true },
      { where: { id }, returning: true }
    );

    res
      .status(200)
      .json({ message: "Staff restored successfully", restoredStaff });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await AdminInstance.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: "staff not found" });
    }
    if (staff.dataValues.isAdmin) {
      res.status(403).json({ message: "Cannont delete this user" });
    }
    const deletedStaff = await staff.destroy();
    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const getAllStaff = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.admin?.dataValues.id;
    const whereClause = currentUserId ? { id: { [Op.ne]: currentUserId } } : {};
    const staffList = await AdminInstance.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });
    if (staffList.length === 0) {
      return res
        .status(200)
        .json({ message: "No staff found in the database", staffList });
    }
    res
      .status(200)
      .json({ message: "Staff retrieved successfully", staffList });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};
export const getAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const staffList = await AdminInstance.findAll({
      where: { isAdmin: true },
      order: [["createdAt", "DESC"]],
    });
    if (staffList.length === 0) {
      return res
        .status(200)
        .json({ message: "No admin found in the database", staffList });
    }
    res
      .status(200)
      .json({ message: "Admin retrieved successfully", staffList });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const getSuspendedStaff = async (req: Request, res: Response) => {
  try {
    const suspendedStaffList = await AdminInstance.findAll({
      where: { active: false },
      order: [["createdAt", "DESC"]],
    });

    if (suspendedStaffList.length === 0) {
      return res
        .status(200)
        .json({ message: "No staff found in the database", suspendedStaffList });;
    }

    res.status(200).json({
      message: "Suspended staff retrieved successfully",
      suspendedStaffList,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

export const searchStaff = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const whereClause: {
      [Op.or]?: {
        firstname?: { [Op.like]: string };
        department?: { [Op.like]: string };
        roleId?: { [Op.eq]: string };
      }[];
    } = {};

    if (search) {
      whereClause[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { department: { [Op.like]: `%${search}%` } },
        { roleId: { [Op.eq]: search.toString() } },
      ];
    }

    const staffList = await AdminInstance.findAll({ where: whereClause });

    if (staffList.length == 0) {
      return res
        .status(200)
        .json({ message: "No staff found matching the criteria", staffList });
    }

    res
      .status(200)
      .json({ message: "Staff retrieved successfully", staffList });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

export const orderStaffFirstname = async (req: Request, res: Response) => {
  try {
    const customerList = await AdminInstance.findAll({
      order: [["firstname", "ASC"]],
    });

    if (customerList.length === 0) {
      return res.status(200).json({ message: "No Staff found", customerList });
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
