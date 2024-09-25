import Joi from "joi";
import ProductInstance from "../models/products";

export const createDepartmentSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.required": "The name of a department is required",
  }),
  
    
});
export const editDepartmentSchema = Joi.object({
  name: Joi.string(),
  
});

export const validatePrices = (value: { [key: string]: number }) => {
  if (typeof value !== "object" || Object.keys(value).length === 0) {
    throw new Error("Prices must contain at least one category.");
  }

  for (const key in value) {
    if (typeof value[key] !== "number") {
      throw new Error(`The price for ${key} must be a valid number.`);
    }
  }
};
export const validatePricePlan = (value: { [key: string]: number }) => {
  for (const key in value) {
    if (typeof value[key] !== "number") {
      throw new Error(`The price for ${key} must be a valid number.`);
    }
  }
};

export const validateCategory = async (value: string) => {
  const products = await ProductInstance.findAll();
  const validCategories = products.flatMap((product) =>
    Object.keys(product.dataValues.pricePlan || {})
  );
  if (!validCategories.includes(value)) {
    throw new Error(`Category must be one of ${validCategories.join(", ")}`);
  }
};
export const createProductSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.required": "The name of a product is required",
    "any.required": "Product name is required",
  }),
  departmentId: Joi.string(),
  category:  Joi.string().valid('For Sale', 'For Purchase').required(),
  price: Joi.array()
    .items(
      Joi.object({
        unit: Joi.string().required().messages({
          "string.required": "Unit is required.",
        }),
        amount: Joi.number().positive().required().messages({
          "number.positive": "Amount must be a positive number.",
          "any.required": "Amount is required.",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Price must be a valid array of objects.",
      "array.min": "Price must contain at least one unit.",
      "any.required": "Price is required and must include at least one unit.",
    }),
  pricePlan: Joi.array()
    .items(
      Joi.object({
        category: Joi.string().required().messages({
          "string.required": "Unit in PricePlan is required.",
        }),
        amount: Joi.number().positive().required().messages({
          "number.positive": "Amount in pricePlan must be a positive number.",
          "any.required": "Amount in pricePlan is required.",
        }),
      })
    )
    .messages({
      "array.base": "Price plan must be a valid array of objects.",
    }),
});
export const updateProductSchema = Joi.object({
  name: Joi.string().messages({
    "string.required": "The name of a product is required",
    "any.required": "Product name is required",
  }),
  departmentId: Joi.string(),
  category:  Joi.string().valid('For Sale', 'For Purchase'),
  price: Joi.array()
    .items(
      Joi.object({
        unit: Joi.string().required().messages({
          "string.required": "Unit is required.",
        }),
        amount: Joi.number().positive().required().messages({
          "number.positive": "Amount must be a positive number.",
          "any.required": "Amount is required.",
        }),
      })
    )
    .min(1)
    .messages({
      "array.base": "Price must be a valid array of objects.",
      "array.min": "Price must contain at least one unit.",
      "any.required": "Price is required and must include at least one unit.",
    }),
  pricePlan: Joi.array()
    .items(
      Joi.object({
        category: Joi.string().required().messages({
          "string.required": "Unit in PricePlan is required.",
        }),
        amount: Joi.number().positive().required().messages({
          "number.positive": "Amount in pricePlan must be a positive number.",
          "any.required": "Amount in pricePlan is required.",
        }),
      })
    )
    .messages({
      "array.base": "Price plan must be a valid array of objects.",
    }),
});
