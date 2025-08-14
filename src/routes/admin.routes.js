// src/routes/admin.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { stats } from "../controllers/admin.controller.js";

const router = Router();

// Admin-only dashboard stats
router.get("/dashboard/stats", requireAuth, requireRole("admin"), stats);

export default router;
