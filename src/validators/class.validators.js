// src/validators/class.validators.js
import Joi from "joi";

export const createClassSchema = Joi.object({
  course_id: Joi.number().integer().positive().required(),
  title: Joi.string().min(2).max(200).required(),
  meeting_url: Joi.string().uri().required(),
  start_at: Joi.date().iso().required(),
  end_at: Joi.date().iso().allow(null)
});

export const updateClassSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  meeting_url: Joi.string().uri(),
  start_at: Joi.date().iso(),
  end_at: Joi.date().iso()
}).min(1);

export const listClassesSchema = Joi.object({
  course_id: Joi.number().integer().positive(),
  upcoming: Joi.boolean().default(false),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});
