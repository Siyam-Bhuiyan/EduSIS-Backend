// src/validators/department.validators.js
import Joi from "joi";

export const createDepartmentSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  code: Joi.string().min(2).max(20).required()
});

export const updateDepartmentSchema = Joi.object({
  name: Joi.string().min(2).max(150),
  code: Joi.string().min(2).max(20)
}).min(1);
