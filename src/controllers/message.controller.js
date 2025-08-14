// src/controllers/message.controller.js
import { listSchema, createSchema, updateSchema, readSchema } from "../validators/message.validators.js";
import {
  listMessages, createMessage, getMessageById, updateMessage, deleteMessage,
  markRead, readers
} from "../models/message.model.js";

function isPrivileged(role) { return role === "teacher" || role === "admin"; }

export async function list(req, res) {
  const { value, error } = listSchema.validate(req.query, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const rows = await listMessages(Number(req.params.course_id), value);
  res.json(rows);
}

export async function create(req, res) {
  const { value, error } = createSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const msg = await createMessage(Number(req.params.course_id), req.user.id, value);
  res.status(201).json(msg);
}

export async function update(req, res) {
  const { value, error } = updateSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const id = Number(req.params.message_id);
  const msg = await getMessageById(id);
  if (!msg) return res.status(404).json({ message: "Message not found" });

  const updated = await updateMessage(id, req.user.id, value, isPrivileged(req.user.role));
  if (!updated) return res.status(403).json({ message: "Forbidden" });
  res.json(updated);
}

export async function remove(req, res) {
  const id = Number(req.params.message_id);
  const msg = await getMessageById(id);
  if (!msg) return res.status(404).json({ message: "Message not found" });

  await deleteMessage(id, req.user.id, isPrivileged(req.user.role));
  res.status(204).send();
}

export async function mark_read(req, res) {
  const { value, error } = readSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  await markRead(value.message_id, req.user.id);
  res.status(201).json({ message: "ok" });
}

export async function list_readers(req, res) {
  const rows = await readers(Number(req.params.message_id));
  res.json(rows);
}
