import Joi from "joi";
import ProductInstance from "../models/products";

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
export const validatePricePlan = (value: { [key: string]: number })=>{
  for (const key in value) {
    if (typeof value[key] !== "number") {
      throw new Error(`The price for ${key} must be a valid number.`);
    }
  }
}

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
  price: Joi.object().pattern(Joi.string(), Joi.number().positive().required())
    .min(1)
    .required()
    .messages({
      "object.base": "Price must be a valid object with units as keys.",
      "object.pattern.base": "Each unit must have a valid positive price.",
      "object.min": "Price must contain at least one unit.",
      "any.required": "Price is required and must include at least one unit.",
    }),
  pricePlan: Joi.object()
    .pattern(Joi.string(), Joi.number().positive()).messages({
      "object.base": "Price plan must be a valid object with categories as keys.",
      "object.pattern.base": "Each category must have a valid positive price.",
    }),
});

