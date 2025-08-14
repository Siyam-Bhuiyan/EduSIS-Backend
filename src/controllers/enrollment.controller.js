// src/controllers/enrollment.controller.js
import { enroll, drop, myEnrollments, listEnrollmentsForCourse } from "../models/enrollment.model.js";
import { enrollSchema } from "../validators/enrollment.validators.js";

export async function enrollMe(req, res) {
  const { value, error } = enrollSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  await enroll(req.user.id, value.course_id);
  res.status(201).json({ message: "Enrolled", course_id: value.course_id });
}

export async function dropMe(req, res) {
  const course_id = Number(req.params.course_id);
  await drop(req.user.id, course_id);
  res.status(200).json({ message: "Dropped", course_id });
}

export async function myList(req, res) {
  const rows = await myEnrollments(req.user.id);
  res.json(rows);
}

// Admin: list enrollments for a course
export async function listByCourse(req, res) {
  const course_id = Number(req.params.course_id);
  const rows = await listEnrollmentsForCourse(course_id);
  res.json(rows);
}
