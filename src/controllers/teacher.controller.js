// src/controllers/teacher.controller.js
import {
  listTeachers,
  getTeacherById,
  upsertTeacherProfile,
  createTeacherUser,
  updateTeacherUser,
  deleteTeacherUser
} from "../models/teacher.model.js";
import { createTeacherSchema, updateTeacherSchema } from "../validators/teacher.validators.js";

export async function list(req, res) {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const data = await listTeachers({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
      search: String(search || "")
    });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getOne(req, res) {
  try {
    const t = await getTeacherById(req.params.id);
    if (!t) return res.status(404).json({ message: "Teacher not found" });
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function create(req, res) {
  try {
    const { value, error } = createTeacherSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: "Validation failed", details: error.details });

    const id = await createTeacherUser({
      full_name: value.full_name,
      email: value.email,
      password: value.password
    });

    const { full_name, email, password, ...profile } = value;
    await upsertTeacherProfile(id, profile);

    const created = await getTeacherById(id);
    res.status(201).json(created);
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email or Employee No already exists" });
    }
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function update(req, res) {
  try {
    const { value, error } = updateTeacherSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: "Validation failed", details: error.details });

    const { full_name, email, password, ...profile } = value;
    await updateTeacherUser(req.params.id, { full_name, email, password });

    if (Object.keys(profile).length) {
      await upsertTeacherProfile(req.params.id, profile);
    }

    const updated = await getTeacherById(req.params.id);
    if (!updated) return res.status(404).json({ message: "Teacher not found" });
    res.json(updated);
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email or Employee No already exists" });
    }
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function remove(req, res) {
  try {
    await deleteTeacherUser(req.params.id);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function meProfile(req, res) {
  try {
    const t = await getTeacherById(req.user.id);
    if (!t) return res.status(404).json({ message: "Teacher profile not found" });
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
