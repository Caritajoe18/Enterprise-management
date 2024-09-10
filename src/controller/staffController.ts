import { Request, Response } from "express";
import AdminInstance from "../models/admin";

import {
  option,
  signUpSchema,
  updateStaffSchema,
} from "../validations/adminValidation";
import { bcryptEncode } from "../utilities/auths";

import { sendVerificationMail } from "../utilities/sendVerification";
import { generateVerificationEmailHTML } from "../utilities/htmls";
import { Op } from "sequelize";
import { loginurl } from "./adminController";
import Role from "../models/role";

export const signupStaff = async (req: Request, res: Response) => {
  try {
    const validationResult = signUpSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    const { email, password, firstname,roleName } = req.body;

    const exist = await AdminInstance.findOne({ where: { email } });

    if (exist) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ error: "Role does not exist" });
    }
    const passwordHashed = await bcryptEncode({ value: password });

  
    const user = await AdminInstance.create({
      ...req.body,
      roleId: role.dataValues.id,
      password: passwordHashed,
    });
    //console.log(user, "uerrrrr issss");

    

    await sendVerificationMail(
      email,
      loginurl,
      firstname,
      generateVerificationEmailHTML
    );


    return res.status(201).json({
      message:
        "Staff created successfully, Check your email to activate your account",
      user
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
    const updatedStaff = await staff.update(req.body);
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
    await AdminInstance.update(
      { active: false },
      { where: { id }, returning: true }
    );

    res.status(200).json({ message: "Staff suspended successfully" });
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
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    await AdminInstance.update(
      { active: true },
      { where: { id }, returning: true }
    );

    res.status(200).json({ message: "Staff restored successfully" });
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

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const staffList = await AdminInstance.findAll({
      order: [["firstname", "ASC"]],
    });
    if(staffList.length === 0){
      return res.status(204).send()
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

export const getSuspendedStaff = async (req: Request, res: Response) => {
  try {
    const suspendedStaffList = await AdminInstance.findAll({
      where: { active: false },
    });

    if (suspendedStaffList.length === 0) {
      return res.status(404).json({ message: "No suspended staff found" });
    }

    res
      .status(200)
      .json({
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
        fullname?: { [Op.like]: string };
        department?: { [Op.like]: string };
        role?: { [Op.like]: string };
      }[];
    } = {};

    if (search) {
      whereClause[Op.or] = [
        { fullname: { [Op.like]: `%${search}%` } },
        { department: { [Op.like]: `%${search}%` } },
        { role: { [Op.like]: `%${search}%` } },
      ];
    }

    const staffList = await AdminInstance.findAll({ where: whereClause });

    if (staffList.length == 0) {
      return res
        .status(404)
        .json({ message: "No staff found matching the criteria" });
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
