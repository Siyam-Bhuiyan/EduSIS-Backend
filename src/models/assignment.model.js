// src/models/assignment.model.js
import { getPool } from "../config/db.js";

export async function createAssignment({ course_id, title, description, due_at, attachment_url, created_by }) {
  const [r] = await getPool().query(
    "INSERT INTO assignments (course_id, title, description, due_at, attachment_url, created_by) VALUES (?,?,?,?,?,?)",
    [course_id, title, description || null, due_at || null, attachment_url || null, created_by]
  );
  return getAssignmentById(r.insertId);
}

export async function updateAssignment(id, fields) {
  const sets = [], params = [];
  for (const k of ["title","description","due_at","attachment_url"]) {
    if (fields[k] !== undefined) { sets.push(`${k} = ?`); params.push(fields[k] ?? null); }
  }
  if (!sets.length) return getAssignmentById(id);
  params.push(id);
  await getPool().query(`UPDATE assignments SET ${sets.join(", ")} WHERE id = ?`, params);
  return getAssignmentById(id);
}

export async function deleteAssignment(id) {
  await getPool().query("DELETE FROM assignments WHERE id = ?", [id]);
}

export async function getAssignmentById(id) {
  const [rows] = await getPool().query(
    `SELECT a.*, c.title AS course_title, c.code AS course_code
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     WHERE a.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function listAssignments({ course_id, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const params = [], where = [];
  if (course_id) { where.push("a.course_id = ?"); params.push(Number(course_id)); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows] = await getPool().query(
    `SELECT a.id, a.title, a.due_at, a.course_id, c.title AS course_title, c.code AS course_code, a.created_at
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     ${whereSql}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ count }]] = await getPool().query(
    `SELECT COUNT(*) AS count FROM assignments a ${whereSql}`,
    params
  );
  return { rows, count, page, limit };
}

// submissions
export async function submitAssignment({ assignment_id, student_id, file_url, text_answer }) {
  await getPool().query(
    `INSERT INTO submissions (assignment_id, student_id, file_url, text_answer)
     VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE
       submitted_at = CURRENT_TIMESTAMP,
       file_url = VALUES(file_url),
       text_answer = VALUES(text_answer)`,
    [assignment_id, student_id, file_url || null, text_answer || null]
  );
}

export async function listSubmissions(assignment_id) {
  const [rows] = await getPool().query(
    `SELECT s.assignment_id, s.student_id, s.submitted_at, s.file_url, s.text_answer,
            u.full_name, u.email
     FROM submissions s
     JOIN users u ON u.id = s.student_id
     WHERE s.assignment_id = ?
     ORDER BY s.submitted_at DESC`,
    [assignment_id]
  );
  return rows;
}

export async function getMySubmission(assignment_id, student_id) {
  const [rows] = await getPool().query(
    `SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?`,
    [assignment_id, student_id]
  );
  return rows[0] || null;
}

// grades
export async function gradeSubmission({ assignment_id, student_id, score, feedback, graded_by }) {
  await getPool().query(
    `INSERT INTO grades (assignment_id, student_id, score, feedback, graded_by)
     VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       score = VALUES(score),
       feedback = VALUES(feedback),
       graded_by = VALUES(graded_by),
       graded_at = CURRENT_TIMESTAMP`,
    [assignment_id, student_id, score, feedback || null, graded_by]
  );
}

export async function getGrade(assignment_id, student_id) {
  const [rows] = await getPool().query(
    `SELECT * FROM grades WHERE assignment_id = ? AND student_id = ?`,
    [assignment_id, student_id]
  );
  return rows[0] || null;
}

export async function listMyGrades(student_id) {
  const [rows] = await getPool().query(
    `SELECT g.assignment_id, g.score, g.feedback, g.graded_at,
            a.title AS assignment_title, a.course_id, c.title AS course_title, c.code AS course_code
     FROM grades g
     JOIN assignments a ON a.id = g.assignment_id
     JOIN courses c ON c.id = a.course_id
     WHERE g.student_id = ?
     ORDER BY g.graded_at DESC`,
    [student_id]
  );
  return rows;
}
