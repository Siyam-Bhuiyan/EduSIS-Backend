// src/models/course.model.js
import { getPool } from "../config/db.js";

export async function createCourse(data) {
  const [r] = await getPool().query(
    "INSERT INTO courses (department_id, title, code, credit, description) VALUES (?,?,?,?,?)",
    [data.department_id, data.title, data.code, data.credit ?? 3.0, data.description || null]
  );
  return getCourseById(r.insertId);
}

export async function updateCourse(id, fields) {
  const sets = [], params = [];
  for (const k of ["department_id","title","code","credit","description"]) {
    if (fields[k] !== undefined) { sets.push(`${k} = ?`); params.push(fields[k]); }
  }
  if (!sets.length) return;
  params.push(id);
  await getPool().query(`UPDATE courses SET ${sets.join(", ")} WHERE id = ?`, params);
  return getCourseById(id);
}

export async function deleteCourse(id) {
  await getPool().query("DELETE FROM courses WHERE id = ?", [id]);
}

export async function getCourseById(id) {
  const [rows] = await getPool().query(
    `SELECT c.*, d.name AS department_name, d.code AS department_code
     FROM courses c
     JOIN departments d ON d.id = c.department_id
     WHERE c.id = ?`,
    [id]
  );
  const course = rows[0];
  if (!course) return null;

  const [teachers] = await getPool().query(
    `SELECT u.id, u.full_name, u.email
     FROM course_teachers ct
     JOIN users u ON u.id = ct.teacher_id
     WHERE ct.course_id = ?`,
    [id]
  );

  const [[{ enrolled_count }]] = await getPool().query(
    `SELECT COUNT(*) AS enrolled_count FROM enrollments WHERE course_id = ? AND status='enrolled'`,
    [id]
  );

  return { ...course, teachers, enrolled_count };
}

export async function listCourses({ page = 1, limit = 20, search = "", department_id }) {
  const offset = (page - 1) * limit;
  const like = `%${search}%`;
  const params = [];
  let where = "WHERE 1=1";
  if (search) {
    where += " AND (c.title LIKE ? OR c.code LIKE ?)";
    params.push(like, like);
  }
  if (department_id) {
    where += " AND c.department_id = ?";
    params.push(Number(department_id));
  }

  const [rows] = await getPool().query(
    `SELECT c.id, c.title, c.code, c.credit, c.department_id,
            d.name AS department_name, d.code AS department_code
     FROM courses c
     JOIN departments d ON d.id = c.department_id
     ${where}
     ORDER BY c.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ count }]] = await getPool().query(
    `SELECT COUNT(*) AS count
     FROM courses c
     ${where.replace("JOIN departments d ON d.id = c.department_id","")}
    `,
    params
  );

  return { rows, count, page, limit };
}

export async function setCourseTeachers(course_id, teacher_ids = []) {
  const pool = getPool();
  await pool.query("DELETE FROM course_teachers WHERE course_id = ?", [course_id]);
  if (teacher_ids.length) {
    const values = teacher_ids.map(tid => [course_id, tid]);
    await pool.query("INSERT INTO course_teachers (course_id, teacher_id) VALUES ?", [values]);
  }
}

export async function getCourseTeachers(course_id) {
  const [rows] = await getPool().query(
    `SELECT u.id, u.full_name, u.email
     FROM course_teachers ct
     JOIN users u ON u.id = ct.teacher_id
     WHERE ct.course_id = ?`,
    [course_id]
  );
  return rows;
}

export async function listMyTeachingCourses(teacher_id) {
  const [rows] = await getPool().query(
    `SELECT c.id, c.title, c.code, c.credit, d.name AS department_name
     FROM course_teachers ct
     JOIN courses c ON c.id = ct.course_id
     JOIN departments d ON d.id = c.department_id
     WHERE ct.teacher_id = ?
     ORDER BY c.title ASC`,
    [teacher_id]
  );
  return rows;
}
