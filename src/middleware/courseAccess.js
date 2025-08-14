// src/middleware/courseAccess.js
import { getPool } from "../config/db.js";

// Checks if the current user is a member of the course (admin OR assigned teacher OR enrolled student)
export async function requireCourseMember(req, res, next) {
  try {
    const user = req.user;
    const course_id = Number(req.params.course_id || req.body.course_id);
    if (!course_id) return res.status(400).json({ message: "course_id required" });

    if (user.role === "admin") return next();

    const pool = getPool();
    if (user.role === "teacher") {
      const [rows] = await pool.query(
        "SELECT 1 FROM course_teachers WHERE course_id=? AND teacher_id=? LIMIT 1",
        [course_id, user.id]
      );
      if (rows.length) return next();
    }
    if (user.role === "student") {
      const [rows] = await pool.query(
        "SELECT 1 FROM enrollments WHERE course_id=? AND student_id=? AND status='enrolled' LIMIT 1",
        [course_id, user.id]
      );
      if (rows.length) return next();
    }

    return res.status(403).json({ message: "Forbidden: not a member of this course" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
