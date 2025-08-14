// src/validators/profile.validators.js
import Joi from "joi";

export const updateMeSchema = Joi.object({
  full_name: Joi.string().min(3).max(120),
  email: Joi.string().email().max(120)
}).min(1);

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(8).max(64).required()
});
