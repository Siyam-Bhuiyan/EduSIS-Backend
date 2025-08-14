// src/controllers/student.controller.js
import {
  listStudents,
  getStudentById,
  upsertStudentProfile,
  createStudentUser,
  updateStudentUser,
  deleteStudentUser
} from "../models/student.model.js";
import { createStudentSchema, updateStudentSchema } from "../validators/student.validators.js";

export async function list(req, res) {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const data = await listStudents({
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
    const { id } = req.params;
    const student = await getStudentById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function create(req, res) {
  try {
    const { value, error } = createStudentSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: "Validation failed", details: error.details });

    // create user
    const user_id = await createStudentUser({
      full_name: value.full_name,
      email: value.email,
      password: value.password
    });

    // create profile if any profile fields were provided
    const { full_name, email, password, ...profile } = value;
    await upsertStudentProfile(user_id, profile);

    const created = await getStudentById(user_id);
    res.status(201).json(created);
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email or Reg No already exists" });
    }
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { value, error } = updateStudentSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: "Validation failed", details: error.details });

    // update user fields
    const { full_name, email, password, ...profile } = value;
    await updateStudentUser(id, { full_name, email, password });

    // update profile fields (if provided at all)
    if (Object.keys(profile).length > 0) {
      await upsertStudentProfile(id, profile);
    }

    const updated = await getStudentById(id);
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.json(updated);
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email or Reg No already exists" });
    }
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    await deleteStudentUser(id);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

// current student's own profile (for StudentDashboard/Profile)
export async function meProfile(req, res) {
  try {
    const student = await getStudentById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    res.json(student);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
