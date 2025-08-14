// src/validators/message.validators.js
import Joi from "joi";

export const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(30),
  before_id: Joi.number().integer().positive(), // for infinite scroll upwards
  after_id: Joi.number().integer().positive()   // for polling newer messages
});

export const createSchema = Joi.object({
  body: Joi.string().allow("", null),
  attachment_url: Joi.string().uri().allow("", null),
  reply_to: Joi.number().integer().positive().allow(null)
}).or("body","attachment_url"); // at least one

export const updateSchema = Joi.object({
  body: Joi.string().allow("", null),
  attachment_url: Joi.string().uri().allow("", null)
}).min(1);

export const readSchema = Joi.object({
  message_id: Joi.number().integer().positive().required()
});
