// src/models/user.model.js
import { getPool } from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await getPool().query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

export async function createUser({ role, full_name, email, password_hash }) {
  const [res] = await getPool().query(
    "INSERT INTO users (role, full_name, email, password_hash) VALUES (?,?,?,?)",
    [role, full_name, email, password_hash]
  );
  const [rows] = await getPool().query("SELECT * FROM users WHERE id = ?", [res.insertId]);
  return rows[0];
}
