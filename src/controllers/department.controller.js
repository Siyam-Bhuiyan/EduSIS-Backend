// src/controllers/department.controller.js
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartment,
  listDepartments
} from "../models/department.model.js";
import { createDepartmentSchema, updateDepartmentSchema } from "../validators/department.validators.js";

export async function create(req, res) {
  const { value, error } = createDepartmentSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  try {
    const dep = await createDepartment(value);
    res.status(201).json(dep);
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Name or Code already exists" });
    res.status(500).json({ message: "Server error" });
  }
}

export async function update(req, res) {
  const { value, error } = updateDepartmentSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  try {
    await updateDepartment(req.params.id, value);
    const dep = await getDepartment(req.params.id);
    if (!dep) return res.status(404).json({ message: "Department not found" });
    res.json(dep);
  } catch (e) { res.status(500).json({ message: "Server error" }); }
}

export async function remove(req, res) {
  try { await deleteDepartment(req.params.id); return res.status(204).send(); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
}

export async function getOne(req, res) {
  const dep = await getDepartment(req.params.id);
  if (!dep) return res.status(404).json({ message: "Department not found" });
  res.json(dep);
}

export async function list(req, res) {
  const rows = await listDepartments();
  res.json(rows);
}
