// src/controllers/course.controller.js
import {
  createCourse, updateCourse, deleteCourse, getCourseById, listCourses,
  setCourseTeachers, getCourseTeachers, listMyTeachingCourses
} from "../models/course.model.js";
import { createCourseSchema, updateCourseSchema, assignTeachersSchema } from "../validators/course.validators.js";

export async function create(req, res) {
  const { value, error } = createCourseSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  try {
    const c = await createCourse(value);
    res.status(201).json(c);
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Course code already exists" });
    res.status(500).json({ message: "Server error" });
  }
}

export async function update(req, res) {
  const { value, error } = updateCourseSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  try {
    const c = await updateCourse(req.params.id, value);
    if (!c) return res.status(404).json({ message: "Course not found" });
    res.json(c);
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Course code already exists" });
    res.status(500).json({ message: "Server error" });
  }
}

export async function remove(req, res) {
  try { await deleteCourse(req.params.id); res.status(204).send(); }
  catch (e) { res.status(500).json({ message: "Server error" }); }
}

export async function getOne(req, res) {
  const c = await getCourseById(req.params.id);
  if (!c) return res.status(404).json({ message: "Course not found" });
  res.json(c);
}

export async function list(req, res) {
  const { page = 1, limit = 20, search = "", department_id } = req.query;
  const data = await listCourses({
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 20, 100),
    search: String(search || ""),
    department_id: department_id ? Number(department_id) : undefined
  });
  res.json(data);
}

// Assign/Replace teachers for a course (Admin)
export async function setTeachers(req, res) {
  const { value, error } = assignTeachersSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  await setCourseTeachers(req.params.id, value.teacher_ids);
  const teachers = await getCourseTeachers(req.params.id);
  res.json({ course_id: Number(req.params.id), teachers });
}

export async function getTeachers(req, res) {
  const teachers = await getCourseTeachers(req.params.id);
  res.json({ course_id: Number(req.params.id), teachers });
}

// Teacher's own courses
export async function myTeachingCourses(req, res) {
  const rows = await listMyTeachingCourses(req.user.id);
  res.json(rows);
}
