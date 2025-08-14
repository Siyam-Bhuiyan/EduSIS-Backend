// src/controllers/class.controller.js
import {
  createClass, updateClass, deleteClass, getClassById,
  listClasses, listUpcomingForStudent, listUpcomingForTeacher
} from "../models/class.model.js";
import { createClassSchema, updateClassSchema, listClassesSchema } from "../validators/class.validators.js";

export async function create(req, res) {
  const { value, error } = createClassSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const row = await createClass({ ...value, created_by: req.user.id });
  res.status(201).json(row);
}

export async function update(req, res) {
  const existing = await getClassById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Class not found" });
  if (req.user.role !== "admin" && existing.created_by !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { value, error } = updateClassSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const upd = await updateClass(req.params.id, value);
  res.json(upd);
}

export async function remove(req, res) {
  const existing = await getClassById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Class not found" });
  if (req.user.role !== "admin" && existing.created_by !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  await deleteClass(req.params.id);
  res.status(204).send();
}

export async function getOne(req, res) {
  const row = await getClassById(req.params.id);
  if (!row) return res.status(404).json({ message: "Class not found" });
  res.json(row);
}

export async function list(req, res) {
  const { value, error } = listClassesSchema.validate(req.query, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const data = await listClasses(value);
  res.json(data);
}

// Students: upcoming classes from their enrolled courses
export async function myUpcomingStudent(req, res) {
  const rows = await listUpcomingForStudent(req.user.id);
  res.json(rows);
}

// Teachers: upcoming classes for their teaching courses
export async function myUpcomingTeacher(req, res) {
  const rows = await listUpcomingForTeacher(req.user.id);
  res.json(rows);
}

// Simple join endpoint returns the meeting URL (your frontend will open it)
export async function join(req, res) {
  const row = await getClassById(req.params.id);
  if (!row) return res.status(404).json({ message: "Class not found" });
  res.json({ meeting_url: row.meeting_url });
}
