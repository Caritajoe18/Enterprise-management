import Joi from "joi";
export const regCustomerSchema = Joi.object({
  firstname: Joi.string().min(2).max(30).required().messages({
    "string.empty": "name is required",
    "string.min": "name should have a minimum length of {#limit}",
    "string.max": "First name should have a maximum length of {#limit}",
  }),
  lastname: Joi.string().required(),
  email: Joi.string().email(),
  address: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  profilePic: Joi.string(),
  date: Joi.date(),
});
export const regSupplierSchema = Joi.object({
  firstname: Joi.string().min(2).max(30).required().messages({
    "string.empty": "name is required",
    "string.min": "name should have a minimum length of {#limit}",
    "string.max": "First name should have a maximum length of {#limit}",
  }),
  lastname: Joi.string().required(),
  email: Joi.string().email(),
  address: Joi.string().required(),
  phoneNumber: Joi.string().required(),
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
  phoneNumber: Joi.string(),
  date: Joi.date(),
  profilePic: Joi.string(),
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
  phoneNumber: Joi.string(),
});

export const customerOrderSchema = Joi.object({
  customerId: Joi.string().required(),
  productId: Joi.string().required(),
  unit: Joi.string(),
  quantity: Joi.number().required(),
  price: Joi.number(),
  discount: Joi.number(),
});

export const supplierOrderSchema = Joi.object({
  supplierId: Joi.string().required(),
  productId: Joi.string().required(),
  unit: Joi.string(),
  quantity: Joi.number().required(),
  price: Joi.number(),
  discount: Joi.number(),
  comments: Joi.string(),
});

export const createLedgerSchema = Joi.object({
  supplierId: Joi.string(),
  customerId: Joi.string(),
  productId: Joi.string(),
  amount: Joi.number().required(),
  bankName: Joi.string(),
  other: Joi.string(),
  departmentId: Joi.string(),
  comments: Joi.string(),
});
