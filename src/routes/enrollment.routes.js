// src/routes/enrollment.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { enrollMe, dropMe, myList, listByCourse } from "../controllers/enrollment.controller.js";

const router = Router();

// student actions
router.get("/me", requireAuth, requireRole("student"), myList);
router.post("/me", requireAuth, requireRole("student"), enrollMe);
router.delete("/me/:course_id", requireAuth, requireRole("student"), dropMe);

// admin view per course
router.get("/course/:course_id", requireAuth, requireRole("admin"), listByCourse);

export default router;
