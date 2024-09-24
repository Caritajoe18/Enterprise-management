import { Request, Response } from "express";
import Department from "../models/department";
import {
  createDepartmentSchema,
  editDepartmentSchema,
} from "../validations/productValidations";
import { option } from "../validations/adminValidation";
import { toPascalCase } from "../utilities/auths";

export const creaetDepartment = async (req: Request, res: Response) => {
  try {
    const validationResult = createDepartmentSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    let { name } = req.body;
    name = toPascalCase(name);
    const exist = await Department.findOne({ where: { name } });
    if (exist) {
      return res.status(400).json({ error: "Department already exists" });
    }
    const dept = await Department.create({
      ...req.body,
      name,
    });
    console.log("prrrr:", typeof dept.dataValues.product);
    return res.status(201).json({
      message: "Department created successfully",
      dept,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const editDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  let { name, product } = req.body;
  name = toPascalCase(name);
  try {
    const validationResult = editDepartmentSchema.validate(req.body, option);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }
    const dept = await Department.findByPk(id);
    if (!dept) {
      return res.status(404).json({ error: "Department not found" });
    }
    const updatedDept = await Department.update(
      { name, product },
      { where: { id } }
    );
    const updatedDeptData = await Department.findByPk(id);
    if (!updatedDept) {
      return res
        .status(500)
        .json({ error: "Error retrieving updated department" });
    }
    res
      .status(200)
      .json({ message: "Staff updated successfully", updatedDeptData });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Department.findAll({ order: [["name", "ASC"]] });

    const parsedDepartments = departments.map((department) => {
      return {
        ...department.toJSON(),
        product:
          typeof department.dataValues.product === "string"
            ? JSON.parse(department.dataValues.product)
            : department.dataValues.product,
      };
    });

    return res.status(200).json({ departments: parsedDepartments });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const deleteDept = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dept = await Department.findByPk(id);
    if (!dept) {
      return res.status(404).json({ error: "staff not found" });
    }

    const deletedStaff = await dept.destroy();
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};
