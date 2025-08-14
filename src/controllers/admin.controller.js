// src/controllers/admin.controller.js
import { getPool } from "../config/db.js";

export async function stats(req, res) {
  try {
    const pool = getPool();

    const [[{ students }]] = await pool.query(`SELECT COUNT(*) AS students FROM users WHERE role='student'`);
    const [[{ teachers }]] = await pool.query(`SELECT COUNT(*) AS teachers FROM users WHERE role='teacher'`);
    const [[{ admins }]]   = await pool.query(`SELECT COUNT(*) AS admins FROM users WHERE role='admin'`);
    const [[{ departments }]] = await pool.query(`SELECT COUNT(*) AS departments FROM departments`);
    const [[{ courses }]] = await pool.query(`SELECT COUNT(*) AS courses FROM courses`);
    const [[{ enrollments }]] = await pool.query(`SELECT COUNT(*) AS enrollments FROM enrollments WHERE status='enrolled'`);

    const [[{ upcoming_classes }]] = await pool.query(
      `SELECT COUNT(*) AS upcoming_classes
       FROM online_classes
       WHERE start_at >= NOW() AND start_at <= DATE_ADD(NOW(), INTERVAL 30 DAY)`
    );

    const [[{ assignments_open }]] = await pool.query(
      `SELECT COUNT(*) AS assignments_open
       FROM assignments
       WHERE due_at IS NULL OR due_at >= NOW()`
    );

    // submissions waiting for grades
    const [[{ to_grade }]] = await pool.query(
      `SELECT COUNT(*) AS to_grade
       FROM submissions s
       LEFT JOIN grades g ON g.assignment_id = s.assignment_id AND g.student_id = s.student_id
       WHERE g.assignment_id IS NULL`
    );

    // top 5 courses by active enrollment
    const [top_courses] = await pool.query(
      `SELECT c.id, c.title, c.code, COUNT(e.student_id) AS enrolled
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id AND e.status='enrolled'
       GROUP BY c.id
       ORDER BY enrolled DESC
       LIMIT 5`
    );

    res.json({
      users: { students: Number(students), teachers: Number(teachers), admins: Number(admins) },
      org: { departments: Number(departments), courses: Number(courses) },
      learning: {
        enrollments: Number(enrollments),
        upcoming_classes: Number(upcoming_classes),
        assignments_open: Number(assignments_open),
        submissions_to_grade: Number(to_grade)
      },
      top_courses
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
