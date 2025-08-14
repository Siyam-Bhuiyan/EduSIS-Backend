// src/routes/assignment.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  create, update, remove, getOne, list,
  submit, submissions, grade, myGrades
} from "../controllers/assignment.controller.js";

const router = Router();

// list & read (any logged-in)
router.get("/", requireAuth, list);
router.get("/:id", requireAuth, getOne);

// teacher manages assignments
router.post("/", requireAuth, requireRole("teacher", "admin"), create);
router.patch("/:id", requireAuth, requireRole("teacher", "admin"), update);
router.delete("/:id", requireAuth, requireRole("teacher", "admin"), remove);

// student submits
router.post("/:id/submit", requireAuth, requireRole("student"), submit);

// teacher views submissions & grades
router.get("/:id/submissions", requireAuth, requireRole("teacher", "admin"), submissions);
router.post("/:id/grade/:student_id", requireAuth, requireRole("teacher", "admin"), grade);

// student results
router.get("/me/results/list", requireAuth, requireRole("student"), myGrades);

export default router;
