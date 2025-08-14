// src/models/department.model.js
import { getPool } from "../config/db.js";

export async function createDepartment({ name, code }) {
  const [r] = await getPool().query(
    "INSERT INTO departments (name, code) VALUES (?, ?)",
    [name, code]
  );
  const [rows] = await getPool().query("SELECT * FROM departments WHERE id = ?", [r.insertId]);
  return rows[0];
}

export async function updateDepartment(id, fields) {
  const sets = [];
  const params = [];
  if (fields.name) { sets.push("name = ?"); params.push(fields.name); }
  if (fields.code) { sets.push("code = ?"); params.push(fields.code); }
  if (!sets.length) return;
  params.push(id);
  await getPool().query(`UPDATE departments SET ${sets.join(", ")} WHERE id = ?`, params);
}

export async function deleteDepartment(id) {
  await getPool().query("DELETE FROM departments WHERE id = ?", [id]);
}

export async function getDepartment(id) {
  const [rows] = await getPool().query("SELECT * FROM departments WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function listDepartments() {
  const [rows] = await getPool().query("SELECT * FROM departments ORDER BY name ASC");
  return rows;
}
