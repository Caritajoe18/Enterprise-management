import { Request, Response } from "express";
import { Model, ModelStatic } from "sequelize";
export const getRecords = async (req: Request, res: Response, model: ModelStatic<Model>, entityName: string) => {
  try {
    const records = await model.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (records.length === 0) {
      return res.status(200).json({ message: `No ${entityName} Found`, records });
    }

    res.status(200).json({
      message: `Successfully retrieved ${entityName}`,
      records,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
};
