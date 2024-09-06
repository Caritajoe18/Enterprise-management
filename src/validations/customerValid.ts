import Joi from 'joi';
export const regCustomerSchema = Joi.object({
    name: Joi.string().min(4).max(30).required().messages({
        "string.empty": "name is required",
        "string.min": "name should have a minimum length of {#limit}",
        "string.max": "First name should have a maximum length of {#limit}",
      }),
      address: Joi.string().required(),
      phonenumber:Joi.string(),
      category:Joi.string(),
      profilePic:Joi.string(),
});

export const updateCustomerSchema = Joi.object({
    firstname: Joi.string().min(2).max(30).messages({
        "string.empty": "name is required",
        "string.min": "name should have a minimum length of {#limit}",
        "string.max": "First name should have a maximum length of {#limit}",
      }),
    lastname: Joi.string().min(2).max(30).messages({
        "string.empty": "name is required",
        "string.min": "name should have a minimum length of {#limit}",
        "string.max": "First name should have a maximum length of {#limit}",
      }),
      email: Joi.string().email().messages({
        "string.email": "Invalid email format",
      }),
      
    
      address: Joi.string(),
      phonenumber:Joi.string(),
      category:Joi.string(),
      profilePic:Joi.string(),
});

export const createOrderSchema = Joi.object({
name: Joi.string().required(),
catergory: Joi.string().required(),
product: Joi.string().required(),
quntity: Joi.number().required(),
price:Joi.number().required(),
date:Joi.string().required(),
});

export const createLedgerSchema = Joi.object({
  credit: Joi.number().required(),
  debit: Joi.number().required(),
  balance: Joi.number().required(),
})
