// src/routes/class.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  create, update, remove, getOne, list,
  myUpcomingStudent, myUpcomingTeacher, join
} from "../controllers/class.controller.js";

const router = Router();

// list / read (any logged-in)
router.get("/", requireAuth, list);
router.get("/:id", requireAuth, getOne);

// create/update/delete (teacher or admin)
router.post("/", requireAuth, requireRole("teacher","admin"), create);
router.patch("/:id", requireAuth, requireRole("teacher","admin"), update);
router.delete("/:id", requireAuth, requireRole("teacher","admin"), remove);

// role-specific upcoming
router.get("/me/student/upcoming", requireAuth, requireRole("student"), myUpcomingStudent);
router.get("/me/teacher/upcoming", requireAuth, requireRole("teacher"), myUpcomingTeacher);

// get joinable meeting URL (your UI will open it)
router.get("/:id/join", requireAuth, join);

export default router;
