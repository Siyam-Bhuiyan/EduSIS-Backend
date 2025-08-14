// src/validators/enrollment.validators.js
import Joi from "joi";

export const enrollSchema = Joi.object({
  course_id: Joi.number().integer().positive().required()
});
