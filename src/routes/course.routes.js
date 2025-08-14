// src/routes/course.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  create, update, remove, getOne, list,
  setTeachers, getTeachers, myTeachingCourses
} from "../controllers/course.controller.js";

const router = Router();

// public listing for logged-in users
router.get("/", requireAuth, list);
router.get("/:id", requireAuth, getOne);

// admin manage courses
router.post("/", requireAuth, requireRole("admin"), create);
router.patch("/:id", requireAuth, requireRole("admin"), update);
router.delete("/:id", requireAuth, requireRole("admin"), remove);

// assign teachers (admin)
router.get("/:id/teachers", requireAuth, getTeachers);
router.post("/:id/teachers", requireAuth, requireRole("admin"), setTeachers);

// teacher's own courses
router.get("/me/teaching/list", requireAuth, requireRole("teacher"), myTeachingCourses);

export default router;
