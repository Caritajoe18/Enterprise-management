import Joi from 'joi';



export const validatePrices = (value: { [key: string]: number }) => {
    if (typeof value !== 'object' || Object.keys(value).length === 0) {
      throw new Error("Prices must contain at least one category.");
    }
  
    for (const key in value) {
      if (typeof value[key] !== 'number') {
        throw new Error(`The price for ${key} must be a valid number.`);
      }
    }
  };

  export const createProductSchema = Joi.object({
    name: Joi.string()
      .required()
      .messages({
        "string.required": "The name of a product is required",
      }),
    prices: Joi.object()
      .pattern(
        Joi.string(),
        Joi.number().positive().required()
      )
      .required()
      .min(1)
      .messages({
        "object.base": "Prices must be a valid object with categories as keys.",
        "object.pattern.base": "Each category must have a valid price.",
        "object.min": "Prices must contain at least one category.",
        "any.required": "Prices are required and must include at least one category.",
      }),
  });
  