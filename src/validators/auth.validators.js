// src/validators/auth.validators.js
import Joi from "joi";

export const registerSchema = Joi.object({
  full_name: Joi.string().min(3).max(120).required(),
  email: Joi.string().email().max(120).required(),
  password: Joi.string().min(8).max(64).required(),
  role: Joi.string().valid("admin", "teacher", "student").default("student")
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
