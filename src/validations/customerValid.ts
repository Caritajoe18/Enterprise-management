import Joi from 'joi';
export const regCustomerSchema = Joi.object({
    firstname: Joi.string().min(2).max(30).required().messages({
        "string.empty": "name is required",
        "string.min": "name should have a minimum length of {#limit}",
        "string.max": "First name should have a maximum length of {#limit}",
      }),
      lastname:Joi.string().required(),
      email: Joi.string().email(),
      address: Joi.string().required(),
      phoneNumber:Joi.string().required(),
      profilePic:Joi.string(),
      date:Joi.date()
});
export const regSupplierSchema = Joi.object({
  firstname: Joi.string().min(2).max(30).required().messages({
      "string.empty": "name is required",
      "string.min": "name should have a minimum length of {#limit}",
      "string.max": "First name should have a maximum length of {#limit}",
    }),
    lastname:Joi.string().required(),
    email: Joi.string().email(),
    address: Joi.string().required(),
    phoneNumber:Joi.string().required(),
    
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
      phoneNumber:Joi.string(),
      date:Joi.date(),
      profilePic:Joi.string()
});
export const updateSupplierSchema = Joi.object({
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
      phoneNumber:Joi.string(),

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
