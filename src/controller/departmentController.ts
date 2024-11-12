import { Request, Response } from "express";
import Departments from "../models/department";
import {
  createDepartmentSchema,
  editDepartmentSchema,
} from "../validations/productValidations";
import { option } from "../validations/adminValidation";
import { toPascalCase } from "../utilities/auths";
import Products from "../models/products";
import { Op } from "sequelize";
import DepartmentLedger from "../models/departmentLedger";

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const validationResult = createDepartmentSchema.validate(req.body, {
      abortEarly: false,
    });
    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.details.map((detail) => detail.message),
      });
    }

    let { name } = req.body;
    name = toPascalCase(name);

    const existingDepartment = await Departments.findOne({ where: { name } });
    if (existingDepartment) {
      return res.status(400).json({ error: "Department already exists" });
    }

    const newDepartment = await Departments.create({
      ...req.body,
      name,
    });

    return res.status(201).json({
      message: "Department created successfully",
      department: newDepartment,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const editDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  let { name } = req.body;
  name = toPascalCase(name);

  try {
    const validationResult = editDepartmentSchema.validate(req.body, {
      abortEarly: false,
    });
    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.details.map((detail) => detail.message),
      });
    }

    const department = await Departments.findByPk(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    await department.update({ name });

    const updatedDepartment = await Departments.findByPk(id);

    if (!updatedDepartment) {
      return res
        .status(500)
        .json({ error: "Error retrieving updated department" });
    }

    return res.status(200).json({
      message: "Department updated successfully",
      department: updatedDepartment,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};
export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Departments.findAll({
      order:[["createdAt", "DESC"]],
      include: [
        {
          model: Products,
          as: "products",
          attributes: ["id", "name", "category"],
        },
      ],
    });

    return res.status(200).json({ departments });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Departments.findAll({
      order: [["name", "ASC"]],
    });

    return res.status(200).json({ departments });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const getDepartmentsLikePharm = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.name || 'pharm'; 
    const departments = await Departments.findAll({
      where: {
        name: {
          [Op.like]: `%${searchTerm}%`, 
        },
      },
    });

    if (departments.length === 0) {
      return res.status(404).json({ message: 'No departments found' });
    }


    // const serializedDepartments = departments.map(dept => ({
    //   id: dept.dataValues.id,
    //   name: dept.dataValues.name,
      
    // }));

    return res.status(200).json({
      message: 'Departments retrieved successfully',
      department: departments,
    });
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
    const dept = await Departments.findByPk(id);
    if (!dept) {
      return res.status(404).json({ error: "Department not found" });
    }

    const deletedStaff = await dept.destroy();
    res.status(200).json({ message: "Departments deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};


export const getDepartmentLedgerByDepartmentId = async (req: Request, res: Response) => {
  const { departmentId } = req.params;

  try {
    // Validate that departmentId is provided
    const dept = await Departments.findByPk(departmentId)
    if (!dept) {
      return res.status(400).json({ message: "Department is not found" });
    }

    // Find all entries in DepartmentLedger with the specified departmentId
    const departmentLedgerEntries = await DepartmentLedger.findAll({
      where: { departmentId },
      order: [["createdAt", "DESC"]], // Orders entries by creation date, latest first
    });

    // If no entries are found, return a 404 response
    if (!departmentLedgerEntries.length) {
      return res.status(404).json({ message: "No entries found for this department", departmentLedgerEntries });
    }

    // Return the department ledger entries
    return res.status(200).json(departmentLedgerEntries);
  } catch (error: unknown) {
    console.error("Error retrieving department ledger:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "An unknown error occurred" });
  }
};
