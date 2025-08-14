// src/controllers/course.controller.js
import { getPool } from "../config/db.js";
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

//extra

// GET /api/courses/:id/overview
export async function overview(req, res) {
  const pool = getPool();
  const course_id = Number(req.params.id);
  try {
    // core course info
    const [courseRows] = await pool.query(
      `SELECT c.id, c.title, c.code, c.credit, c.description,
              d.id AS department_id, d.name AS department_name, d.code AS department_code,
              c.created_at, c.updated_at
       FROM courses c
       JOIN departments d ON d.id = c.department_id
       WHERE c.id = ?`,
      [course_id]
    );
    const course = courseRows[0];
    if (!course) return res.status(404).json({ message: "Course not found" });

    // teachers
    const [teachers] = await pool.query(
      `SELECT u.id, u.full_name, u.email
       FROM course_teachers ct
       JOIN users u ON u.id = ct.teacher_id
       WHERE ct.course_id = ?
       ORDER BY u.full_name ASC`,
      [course_id]
    );

    // enrollment stats
    const [[{ enrolled_count }]] = await pool.query(
      `SELECT COUNT(*) AS enrolled_count FROM enrollments
       WHERE course_id = ? AND status='enrolled'`,
      [course_id]
    );

    // my membership (student enrolled? teacher assigned?)
    let my_membership = { is_student: false, is_teacher: false };
    if (req.user?.role) {
      if (req.user.role === "student") {
        const [r] = await pool.query(
          `SELECT 1 FROM enrollments WHERE course_id=? AND student_id=? AND status='enrolled' LIMIT 1`,
          [course_id, req.user.id]
        );
        my_membership.is_student = r.length > 0;
      }
      if (req.user.role === "teacher") {
        const [r] = await pool.query(
          `SELECT 1 FROM course_teachers WHERE course_id=? AND teacher_id=? LIMIT 1`,
          [course_id, req.user.id]
        );
        my_membership.is_teacher = r.length > 0;
      }
      if (req.user.role === "admin") {
        my_membership = { is_student: false, is_teacher: false, is_admin: true };
      }
    }

    // recent announcements (visible to caller)
    const audience = req.user?.role === "student" ? ["all","students"]
                    : req.user?.role === "teacher" ? ["all","teachers"]
                    : ["all","students","teachers"];
    const [announcements] = await pool.query(
      `SELECT a.id, a.title, a.pinned, a.visible_to, a.created_at
       FROM announcements a
       WHERE a.course_id = ? AND a.visible_to IN (?)
       ORDER BY a.pinned DESC, a.created_at DESC
       LIMIT 5`,
      [course_id, [audience]]
    );

    // upcoming classes (next 2 weeks)
    const [classes] = await pool.query(
      `SELECT oc.id, oc.title, oc.start_at, oc.end_at
       FROM online_classes oc
       WHERE oc.course_id = ? AND oc.start_at >= NOW() AND oc.start_at <= DATE_ADD(NOW(), INTERVAL 14 DAY)
       ORDER BY oc.start_at ASC
       LIMIT 10`,
      [course_id]
    );

    // recent assignments (latest 5)
    const [assignments] = await pool.query(
      `SELECT a.id, a.title, a.due_at, a.created_at
       FROM assignments a
       WHERE a.course_id = ?
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [course_id]
    );

    // messages latest (for a peek)
    const [messages] = await pool.query(
      `SELECT m.id, m.body, m.attachment_url, m.created_at,
              u.id AS sender_id, u.full_name AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.course_id = ?
       ORDER BY m.id DESC
       LIMIT 10`,
      [course_id]
    );

    res.json({
      course,
      teachers,
      enrolled_count: Number(enrolled_count),
      my_membership,
      announcements,
      upcoming_classes: classes,
      recent_assignments: assignments,
      recent_messages: messages
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

