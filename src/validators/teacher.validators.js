// src/validators/teacher.validators.js
import Joi from "joi";

export const createTeacherSchema = Joi.object({
  full_name: Joi.string().min(3).max(120).required(),
  email: Joi.string().email().max(120).required(),
  password: Joi.string().min(8).max(64).required(),
  // profile fields
  employee_no: Joi.string().max(50).optional(),
  phone: Joi.string().max(30).allow("", null),
  dob: Joi.date().iso().allow(null),
  department: Joi.string().max(120).allow("", null),
  designation: Joi.string().max(120).allow("", null),
  bio: Joi.string().max(500).allow("", null)
});

export const updateTeacherSchema = Joi.object({
  full_name: Joi.string().min(3).max(120),
  email: Joi.string().email().max(120),
  password: Joi.string().min(8).max(64),
  employee_no: Joi.string().max(50),
  phone: Joi.string().max(30).allow("", null),
  dob: Joi.date().iso().allow(null),
  department: Joi.string().max(120).allow("", null),
  designation: Joi.string().max(120).allow("", null),
  bio: Joi.string().max(500).allow("", null)
}).min(1);
