// src/models/enrollment.model.js
import { getPool } from "../config/db.js";

export async function enroll(student_id, course_id) {
  await getPool().query(
    `INSERT INTO enrollments (course_id, student_id, status)
     VALUES (?,?, 'enrolled')
     ON DUPLICATE KEY UPDATE status='enrolled', enrolled_at=CURRENT_TIMESTAMP`,
    [course_id, student_id]
  );
}

export async function drop(student_id, course_id) {
  await getPool().query(
    `UPDATE enrollments SET status='dropped' WHERE course_id=? AND student_id=?`,
    [course_id, student_id]
  );
}

export async function myEnrollments(student_id) {
  const [rows] = await getPool().query(
    `SELECT c.id AS course_id, c.title, c.code, c.credit, d.name AS department_name, e.status, e.enrolled_at
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     JOIN departments d ON d.id = c.department_id
     WHERE e.student_id = ? AND e.status='enrolled'
     ORDER BY c.title ASC`,
    [student_id]
  );
  return rows;
}

export async function listEnrollmentsForCourse(course_id) {
  const [rows] = await getPool().query(
    `SELECT u.id AS student_id, u.full_name, u.email, e.status, e.enrolled_at
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     WHERE e.course_id = ? AND e.status='enrolled'
     ORDER BY u.full_name ASC`,
    [course_id]
  );
  return rows;
}
