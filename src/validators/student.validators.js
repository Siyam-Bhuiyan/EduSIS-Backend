// src/validators/student.validators.js
import Joi from "joi";

export const createStudentSchema = Joi.object({
  full_name: Joi.string().min(3).max(120).required(),
  email: Joi.string().email().max(120).required(),
  password: Joi.string().min(8).max(64).required(),
  // profile fields
  reg_no: Joi.string().max(50).optional(),
  phone: Joi.string().max(30).allow("", null),
  dob: Joi.date().iso().allow(null),
  department: Joi.string().max(120).allow("", null),
  batch: Joi.string().max(60).allow("", null),
  address: Joi.string().max(255).allow("", null)
});

export const updateStudentSchema = Joi.object({
  // user
  full_name: Joi.string().min(3).max(120),
  email: Joi.string().email().max(120),
  password: Joi.string().min(8).max(64),
  // profile
  reg_no: Joi.string().max(50),
  phone: Joi.string().max(30).allow("", null),
  dob: Joi.date().iso().allow(null),
  department: Joi.string().max(120).allow("", null),
  batch: Joi.string().max(60).allow("", null),
  address: Joi.string().max(255).allow("", null)
}).min(1);
