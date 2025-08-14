// src/controllers/profile.controller.js
import bcrypt from "bcryptjs";
import { getPool } from "../config/db.js";
import { updateMeSchema, changePasswordSchema } from "../validators/profile.validators.js";

function toPublic(u) {
  return { id: u.id, role: u.role, full_name: u.full_name, email: u.email };
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function updateMe(req, res) {
  const { value, error } = updateMeSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });

  const sets = [], params = [];
  if (value.full_name !== undefined) { sets.push("full_name=?"); params.push(value.full_name); }
  if (value.email !== undefined)     { sets.push("email=?");     params.push(value.email); }
  if (!sets.length) return res.json({ user: req.user });

  params.push(req.user.id);
  try {
    await getPool().query(`UPDATE users SET ${sets.join(",")} WHERE id=?`, params);
    const [rows] = await getPool().query(`SELECT id, role, full_name, email FROM users WHERE id=?`, [req.user.id]);
    res.json({ user: toPublic(rows[0]) });
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Email already in use" });
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function changePassword(req, res) {
  const { value, error } = changePasswordSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });

  const [[user]] = await getPool().query(`SELECT id, password_hash FROM users WHERE id=?`, [req.user.id]);
  const ok = await bcrypt.compare(value.current_password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

  const newHash = await bcrypt.hash(value.new_password, 10);
  await getPool().query(`UPDATE users SET password_hash=? WHERE id=?`, [newHash, req.user.id]);
  res.json({ message: "Password updated" });
}
