import Joi from "joi";

export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};


const passwordSchema = Joi.string()
  .min(5)
  .max(15)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,15}$/)
  .message(
    "Password must be between 5 and 15 characters, contain at least one lowercase letter, one uppercase letter and one digit"
  )
  .required();

export const signUpSchema = Joi.object({
  firstname: Joi.string().min(2).max(30).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name should have a minimum length of {#limit}",
    "string.max": "First name should have a maximum length of {#limit}",
  }),
  lastname: Joi.string().min(2).max(30).required().messages({
    "string.empty": "last name is required",
    "string.min": "Last name should have a minimum length of {#limit}",
    "string.max": "Last name should have a maximum length of {#limit}",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),

  phoneNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      
    }),
  department: Joi.string().min(4).max(30),
  profilePic:Joi.string(),
  roleId: Joi.string().min(2).max(50).optional(),
  password: passwordSchema,
  confirmPassword: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Password confirmation is required",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: passwordSchema,
});
export const resetPasswordSchema = Joi.object({
  password: passwordSchema,
  confirmPassword: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Password confirmation is required",
    }),
});

export const sendVerification = Joi.object().keys({
  email: Joi.string().trim().lowercase().email().required(),
});


export const updateStaffSchema = Joi.object({
  firstname: Joi.string().min(2).max(30).messages({
    "string.min": "firstname should have a minimum length of {#limit}",
    "string.max": "firstname should have a maximum length of {#limit}",
  }),
  lastname: Joi.string().min(2).max(30).messages({
    "string.min": "firstname should have a minimum length of {#limit}",
    "string.max": "firstname should have a maximum length of {#limit}",
  }),

  email: Joi.string().email().messages({
    "string.email": "invalid email format",
  }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .messages({
      "string.length": "phone number should have the length of {#limit}",
    }),
  department: Joi.string().messages({
    "string.length": "phone number should have the length of {#limit}",
  }),
  address: Joi.string().messages({
    "string.length": "phone number should have the length of {#limit}",
  }),
  password: passwordSchema,
  confirmPassword: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Password confirmation is required",
    }),
});
export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(30).required().messages({
    "string.min": "firstname should have a minimum length of {#limit}",
    "string.max": "firstname should have a maximum length of {#limit}",
    "string.empty": "name is required",
  }),
  
});


export const changePasswordSchema = Joi.object({
  password: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: Joi.any()
    .equal(Joi.ref("newPassword"))
    .required()
    .label("Confirm password")
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Password confirmation is required",
    }),
});

export const permissionValidationSchema = Joi.object({
  isNav: Joi.boolean()
    .optional()
    .default(false),
  navParentId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .allow(null)
    .optional(),
  url: Joi.string()
    .required()
    .messages({
      'string.empty': 'URL is required',
    }),
  name: Joi.string()
    .min(3)
    .max(255)
    .messages({
      'string.empty': 'name is required',
      'string.min': 'name should be at least 3 characters',
      'string.max': 'name should not exceed 255 characters',
    }),
});

