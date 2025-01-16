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
  departmentId: Joi.string().required(),
  category: Joi.string().valid("For Sale", "For Purchase").required(),
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
  category: Joi.string().valid("For Sale", "For Purchase"),
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

export const storeValidationSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    "string.base": "Product ID must be a string.",
    "string.guid": "Product ID must be a valid UUID.",
    "any.required": "Product ID is required.",
  }),
  image: Joi.string().uri().messages({
    "string.uri": "Image must be a valid URL.",
  }),
  productTag: Joi.string().messages({
    "string.base": "ProductID must be a string.",
  }),

  category: Joi.string().messages({
    "string.base": "Category must be a string.",
  }),
  unit: Joi.string().messages({
    "string.base": "Unit must be a string.",
  }),
  quantity: Joi.number().min(0).optional().default(0).messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity cannot be negative.",
  }),
  thresholdValue: Joi.number().integer().min(0).messages({
    "number.base": "Threshold value must be an integer.",
    "number.min": "Threshold value cannot be negative.",

  }),
});

export const storeEditValidationSchema = Joi.object({
  image: Joi.string().uri().optional().messages({
    "string.uri": "Image must be a valid URL.",
  }),
  productTag: Joi.string().messages({
    "string.base": "Product tag must be a string.",
  }),
  category: Joi.string().messages({
    "string.base": "Category must be a string.",
  }),
  unit: Joi.string().messages({
    "string.base": "Unit must be a string.",
  }),
  quantity: Joi.number().min(0).optional().messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity cannot be negative.",
  }),
  thresholdValue: Joi.number().integer().min(0).messages({
    "number.base": "Threshold value must be an integer.",
    "number.min": "Threshold value cannot be negative.",
    "any.required": "Threshold value is required.",
  }),
});

export const orderValidationSchema = Joi.object({
  rawMaterial: Joi.string().required().messages({
    "string.base": "Raw material must be a string.",
    "any.required": "Raw material is required.",
  }),
  quantity: Joi.number().min(1).required().messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be at least 1.",
    "any.required": "Quantity is required.",
  }),
  unit: Joi.string().required().messages({
    "string.base": "Unit must be a string.",
    "any.required": "Unit is required.",
  }),
  expectedDeliveryDate: Joi.date().messages({
    "date.base": "Expected delivery date must be a valid date.",
    "any.required": "Expected delivery date is required.",
  }),
});
export const genOrderValidationSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.base": "name must be a string.",
    "any.required": "name is required.",
  }),
  quantity: Joi.number().min(1).required().messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be at least 1.",
    "any.required": "Quantity is required.",
  }),
  unit: Joi.string().required().messages({
    "string.base": "Unit must be a string.",
    "any.required": "Unit is required.",
  }),
  expectedDeliveryDate: Joi.date().messages({
    "date.base": "Expected delivery date must be a valid date.",
    "any.required": "Expected delivery date is required.",
  }),
});
export const deptOrderValidationSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.base": "name must be a string.",
    "any.required": "name is required.",
  }),
  departmentId: Joi.string().required().messages({
    "string.base": "name must be a string.",
    "any.required": "name is required.",
  }),
  quantity: Joi.number().min(1).required().messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be at least 1.",
    "any.required": "Quantity is required.",
  }),
  unit: Joi.string().required().messages({
    "string.base": "Unit must be a string.",
    "any.required": "Unit is required.",
  }),
  expectedDeliveryDate: Joi.date().messages({
    "date.base": "Expected delivery date must be a valid date.",
    "any.required": "Expected delivery date is required.",
  }),
});
export const deptstoreValidationSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.base": "name must be a string.",
    "any.required": "name is required.",
  }),
  departmentId: Joi.string().required().messages({
    "string.base": "name must be a string.",
    "any.required": "name is required.",
  }),
  image: Joi.string().messages({
    "string.base": "name must be a string.",
  }),
  quantity: Joi.number().min(1).messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be at least 1.",
    "any.required": "Quantity is required.",
  }),
  unit: Joi.string().messages({
    "string.base": "Unit must be a string.",
    "any.required": "Unit is required.",
  }),
  thresholdValue: Joi.number().integer().min(0).messages({
    "number.base": "Threshold value must be an integer.",
    "number.min": "Threshold value cannot be negative.",
    "any.required": "Threshold value is required.",
  }),
  
});
export const editDepteptstoreValidationSchema = Joi.object({
  image: Joi.string().messages({
    "string.base": "name must be a string.",
  }),
  quantity: Joi.number().min(1).messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be at least 1.",
    "any.required": "Quantity is required.",
  }),
  unit: Joi.string().messages({
    "string.base": "Unit must be a string.",
    "any.required": "Unit is required.",
  }),
  thresholdValue: Joi.number().integer().min(0).messages({
    "number.base": "Threshold value must be an integer.",
    "number.min": "Threshold value cannot be negative.",
    "any.required": "Threshold value is required.",
  }),
  
});
export const createDeptOrderValidationSchema = Joi.object({
  orders: Joi.array().items(
    deptOrderValidationSchema
  ).messages({
    "array.base": "Orders must be an array.",
  }),
});



export const genStoreValidationSchema = Joi.object({
  name:Joi.string().required().messages({
    "string.base": "name must be a string.",
  }),
  unit: Joi.string().required().messages({
    "string.base": "Unit must be a string.",
  }),
  quantity: Joi.number().min(0).optional().default(0).messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity cannot be negative.",
  }),
  thresholdValue: Joi.number().integer().min(0).messages({
    "number.base": "Threshold value must be an integer.",
    "number.min": "Threshold value cannot be negative.",
    "any.required": "Threshold value is required.",
  }),
});
export const editGenStoreValidationSchema = Joi.object({
  name:Joi.string().messages({
    "string.base": "name must be a string.",
  }),
  unit: Joi.string().messages({
    "string.base": "Unit must be a string.",
  }),
  quantity: Joi.number().min(0).optional().default(0).messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity cannot be negative.",
  }),
  thresholdValue: Joi.number().integer().min(0).messages({
    "number.base": "Threshold value must be an integer.",
    "number.min": "Threshold value cannot be negative.",
    "any.required": "Threshold value is required.",
  }),
});
