// src/models/teacher.model.js
import bcrypt from "bcryptjs";
import { getPool } from "../config/db.js";

export async function listTeachers({ page = 1, limit = 20, search = "" }) {
  const offset = (page - 1) * limit;
  const like = `%${search}%`;
  const pool = getPool();

  const [rows] = await pool.query(
    `
    SELECT u.id, u.full_name, u.email,
           tp.employee_no, tp.phone, tp.dob, tp.department, tp.designation, tp.bio,
           u.created_at
    FROM users u
    LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
    WHERE u.role = 'teacher'
      AND (u.full_name LIKE ? OR u.email LIKE ? OR IFNULL(tp.employee_no,'') LIKE ?)
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [like, like, like, Number(limit), Number(offset)]
  );

  const [[{ count }]] = await pool.query(
    `
    SELECT COUNT(*) as count
    FROM users u
    LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
    WHERE u.role = 'teacher'
      AND (u.full_name LIKE ? OR u.email LIKE ? OR IFNULL(tp.employee_no,'') LIKE ?)
    `,
    [like, like, like]
  );

  return { rows, count, page, limit };
}

export async function getTeacherById(id) {
  const [rows] = await getPool().query(
    `
    SELECT u.id, u.full_name, u.email,
           tp.employee_no, tp.phone, tp.dob, tp.department, tp.designation, tp.bio,
           u.created_at
    FROM users u
    LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
    WHERE u.id = ? AND u.role = 'teacher'
    `,
    [id]
  );
  return rows[0] || null;
}

export async function upsertTeacherProfile(user_id, profile) {
  await getPool().query(
    `
    INSERT INTO teacher_profiles (user_id, employee_no, phone, dob, department, designation, bio)
    VALUES (?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      employee_no = VALUES(employee_no),
      phone = VALUES(phone),
      dob = VALUES(dob),
      department = VALUES(department),
      designation = VALUES(designation),
      bio = VALUES(bio)
    `,
    [
      user_id,
      profile.employee_no || null,
      profile.phone || null,
      profile.dob || null,
      profile.department || null,
      profile.designation || null,
      profile.bio || null
    ]
  );
}

export async function createTeacherUser({ full_name, email, password }) {
  const password_hash = await bcrypt.hash(password, 10);
  const [res] = await getPool().query(
    "INSERT INTO users (role, full_name, email, password_hash) VALUES ('teacher', ?, ?, ?)",
    [full_name, email, password_hash]
  );
  return res.insertId;
}

export async function updateTeacherUser(id, { full_name, email, password }) {
  const sets = [];
  const params = [];
  if (full_name) { sets.push("full_name = ?"); params.push(full_name); }
  if (email) { sets.push("email = ?"); params.push(email); }
  if (password) {
    const password_hash = await bcrypt.hash(password, 10);
    sets.push("password_hash = ?");
    params.push(password_hash);
  }
  if (sets.length) {
    params.push(id);
    await getPool().query(`UPDATE users SET ${sets.join(", ")} WHERE id = ? AND role='teacher'`, params);
  }
}

export async function deleteTeacherUser(id) {
  await getPool().query("DELETE FROM users WHERE id = ? AND role = 'teacher'", [id]);
}
