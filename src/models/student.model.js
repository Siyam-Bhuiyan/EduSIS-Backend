// src/models/student.model.js
import bcrypt from "bcryptjs";
import { getPool } from "../config/db.js";

export async function listStudents({ page = 1, limit = 20, search = "" }) {
  const offset = (page - 1) * limit;
  const searchLike = `%${search}%`;
  const pool = getPool();

  const [rows] = await pool.query(
    `
    SELECT u.id, u.full_name, u.email, sp.reg_no, sp.phone, sp.dob,
           sp.department, sp.batch, sp.address, u.created_at
    FROM users u
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    WHERE u.role = 'student'
      AND (u.full_name LIKE ? OR u.email LIKE ? OR IFNULL(sp.reg_no,'') LIKE ?)
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `,
    [searchLike, searchLike, searchLike, Number(limit), Number(offset)]
  );

  const [[{ count }]] = await pool.query(
    `
    SELECT COUNT(*) as count
    FROM users u
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    WHERE u.role = 'student'
      AND (u.full_name LIKE ? OR u.email LIKE ? OR IFNULL(sp.reg_no,'') LIKE ?)
  `,
    [searchLike, searchLike, searchLike]
  );

  return { rows, count, page, limit };
}

export async function getStudentById(id) {
  const [rows] = await getPool().query(
    `
    SELECT u.id, u.full_name, u.email, sp.reg_no, sp.phone, sp.dob,
           sp.department, sp.batch, sp.address, u.created_at
    FROM users u
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    WHERE u.id = ? AND u.role = 'student'
  `,
    [id]
  );
  return rows[0] || null;
}

export async function upsertStudentProfile(user_id, profile) {
  const pool = getPool();
  // insert or update
  await pool.query(
    `
    INSERT INTO student_profiles (user_id, reg_no, phone, dob, department, batch, address)
    VALUES (?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      reg_no = VALUES(reg_no),
      phone = VALUES(phone),
      dob = VALUES(dob),
      department = VALUES(department),
      batch = VALUES(batch),
      address = VALUES(address)
  `,
    [
      user_id,
      profile.reg_no || null,
      profile.phone || null,
      profile.dob || null,
      profile.department || null,
      profile.batch || null,
      profile.address || null
    ]
  );
}

export async function createStudentUser({ full_name, email, password }) {
  const password_hash = await bcrypt.hash(password, 10);
  const pool = getPool();
  const [res] = await pool.query(
    "INSERT INTO users (role, full_name, email, password_hash) VALUES ('student', ?, ?, ?)",
    [full_name, email, password_hash]
  );
  return res.insertId;
}

export async function updateStudentUser(id, { full_name, email, password }) {
  const sets = [];
  const params = [];

  if (full_name) {
    sets.push("full_name = ?");
    params.push(full_name);
  }
  if (email) {
    sets.push("email = ?");
    params.push(email);
  }
  if (password) {
    const password_hash = await bcrypt.hash(password, 10);
    sets.push("password_hash = ?");
    params.push(password_hash);
  }

  if (sets.length) {
    params.push(id);
    await getPool().query(`UPDATE users SET ${sets.join(", ")} WHERE id = ? AND role = 'student'`, params);
  }
}
export async function deleteStudentUser(id) {
  await getPool().query("DELETE FROM users WHERE id = ? AND role = 'student'", [id]);
}
