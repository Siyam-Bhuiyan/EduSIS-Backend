// src/validators/announcement.validators.js
import Joi from "joi";

export const createAnnouncementSchema = Joi.object({
  course_id: Joi.number().integer().positive().allow(null),
  title: Joi.string().min(2).max(200).required(),
  body: Joi.string().allow("", null),
  visible_to: Joi.string().valid("all","students","teachers").default("all"),
  pinned: Joi.boolean().default(false)
});

export const updateAnnouncementSchema = Joi.object({
  course_id: Joi.number().integer().positive().allow(null),
  title: Joi.string().min(2).max(200),
  body: Joi.string().allow("", null),
  visible_to: Joi.string().valid("all","students","teachers"),
  pinned: Joi.boolean()
}).min(1);

export const listAnnouncementsSchema = Joi.object({
  course_id: Joi.number().integer().positive(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});
