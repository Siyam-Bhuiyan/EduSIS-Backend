// src/validators/course.validators.js
import Joi from "joi";

export const createCourseSchema = Joi.object({
  department_id: Joi.number().integer().positive().required(),
  title: Joi.string().min(2).max(200).required(),
  code: Joi.string().min(2).max(30).required(),
  credit: Joi.number().min(0.5).max(10).default(3.0),
  description: Joi.string().allow("", null)
});

export const updateCourseSchema = Joi.object({
  department_id: Joi.number().integer().positive(),
  title: Joi.string().min(2).max(200),
  code: Joi.string().min(2).max(30),
  credit: Joi.number().min(0.5).max(10),
  description: Joi.string().allow("", null)
}).min(1);

export const assignTeachersSchema = Joi.object({
  teacher_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});
