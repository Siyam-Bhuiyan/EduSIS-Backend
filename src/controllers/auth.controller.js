// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../validators/auth.validators.js";
import { findUserByEmail, createUser } from "../models/user.model.js";

function toPublicUser(u) {
  return { id: u.id, role: u.role, full_name: u.full_name, email: u.email };
}

export async function register(req, res) {
  try {
    const { value, error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: "Validation failed", details: error.details });

    const exists = await findUserByEmail(value.email);
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const password_hash = await bcrypt.hash(value.password, 10);
    const user = await createUser({
      role: value.role,
      full_name: value.full_name,
      email: value.email,
      password_hash
    });

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });

    res.status(201).json({ user: toPublicUser(user), token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { value, error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: "Validation failed", details: error.details });

    const user = await findUserByEmail(value.email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(value.password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });

    res.json({ user: toPublicUser(user), token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function me(req, res) {
  // req.user is set by auth middleware
  res.json({ user: req.user });
}
