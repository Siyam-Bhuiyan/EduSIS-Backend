// src/validators/assignment.validators.js
import Joi from "joi";

export const createAssignmentSchema = Joi.object({
  course_id: Joi.number().integer().positive().required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow("", null),
  due_at: Joi.date().iso().allow(null),
  attachment_url: Joi.string().uri().allow("", null)
});

export const updateAssignmentSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string().allow("", null),
  due_at: Joi.date().iso().allow(null),
  attachment_url: Joi.string().uri().allow("", null)
}).min(1);

export const submitSchema = Joi.object({
  file_url: Joi.string().uri().allow(null, ""),
  text_answer: Joi.string().allow("", null)
}).or("file_url", "text_answer"); // require at least one

export const gradeSchema = Joi.object({
  score: Joi.number().min(0).max(100).required(),
  feedback: Joi.string().max(1000).allow("", null)
});
