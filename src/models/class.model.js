// src/models/class.model.js
import { getPool } from "../config/db.js";

export async function createClass(data) {
  const [r] = await getPool().query(
    `INSERT INTO online_classes (course_id, title, meeting_url, start_at, end_at, created_by)
     VALUES (?,?,?,?,?,?)`,
    [data.course_id, data.title, data.meeting_url, data.start_at, data.end_at ?? null, data.created_by ?? null]
  );
  return getClassById(r.insertId);
}

export async function updateClass(id, fields) {
  const sets = [], params = [];
  for (const k of ["title","meeting_url","start_at","end_at"]) {
    if (fields[k] !== undefined) { sets.push(`${k} = ?`); params.push(fields[k] ?? null); }
  }
  if (!sets.length) return getClassById(id);
  params.push(id);
  await getPool().query(`UPDATE online_classes SET ${sets.join(", ")} WHERE id = ?`, params);
  return getClassById(id);
}

export async function deleteClass(id) {
  await getPool().query("DELETE FROM online_classes WHERE id = ?", [id]);
}

export async function getClassById(id) {
  const [rows] = await getPool().query(
    `SELECT oc.*, c.title AS course_title, c.code AS course_code
     FROM online_classes oc
     JOIN courses c ON c.id = oc.course_id
     WHERE oc.id = ?`, [id]
  );
  return rows[0] || null;
}

export async function listClasses({ course_id, upcoming=false, page=1, limit=20 }) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "WHERE 1=1";
  if (course_id) { where += " AND oc.course_id = ?"; params.push(Number(course_id)); }
  if (upcoming) { where += " AND oc.start_at >= NOW()"; }

  const [rows] = await getPool().query(
    `SELECT oc.id, oc.course_id, oc.title, oc.meeting_url, oc.start_at, oc.end_at, oc.created_at,
            c.title AS course_title, c.code AS course_code
     FROM online_classes oc
     JOIN courses c ON c.id = oc.course_id
     ${where}
     ORDER BY oc.start_at ASC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ count }]] = await getPool().query(
    `SELECT COUNT(*) AS count FROM online_classes oc ${where}`, params
  );
  return { rows, count, page, limit };
}

// list upcoming for a specific student (by enrolled courses)
export async function listUpcomingForStudent(student_id) {
  const [rows] = await getPool().query(
    `SELECT oc.id, oc.course_id, oc.title, oc.meeting_url, oc.start_at, oc.end_at,
            c.title AS course_title, c.code AS course_code
     FROM enrollments e
     JOIN online_classes oc ON oc.course_id = e.course_id
     JOIN courses c ON c.id = oc.course_id
     WHERE e.student_id = ? AND e.status='enrolled' AND oc.start_at >= NOW()
     ORDER BY oc.start_at ASC`,
    [student_id]
  );
  return rows;
}

// list upcoming for a teacher (their teaching courses)
export async function listUpcomingForTeacher(teacher_id) {
  const [rows] = await getPool().query(
    `SELECT oc.id, oc.course_id, oc.title, oc.meeting_url, oc.start_at, oc.end_at,
            c.title AS course_title, c.code AS course_code
     FROM course_teachers ct
     JOIN online_classes oc ON oc.course_id = ct.course_id
     JOIN courses c ON c.id = oc.course_id
     WHERE ct.teacher_id = ? AND oc.start_at >= NOW()
     ORDER BY oc.start_at ASC`,
    [teacher_id]
  );
  return rows;
}
