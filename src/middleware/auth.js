// src/middleware/auth.js
import jwt from "jsonwebtoken";
import { findUserByEmail } from "../models/user.model.js";
import { getPool } from "../config/db.js";

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await getPool().query("SELECT id, role, full_name, email FROM users WHERE id = ?", [payload.sub]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
