// src/routes/teacher.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole, selfOrAdmin } from "../middleware/rbac.js";
import { list, getOne, create, update, remove, meProfile } from "../controllers/teacher.controller.js";

const router = Router();

// Admin list & create
router.get("/", requireAuth, requireRole("admin"), list);
router.post("/", requireAuth, requireRole("admin"), create);

// Get/Update/Delete by id (self can read/update their own)
router.get("/:id", requireAuth, selfOrAdmin("id"), getOne);
router.patch("/:id", requireAuth, selfOrAdmin("id"), update);
router.delete("/:id", requireAuth, requireRole("admin"), remove);

// current teacher’s own profile
router.get("/me/profile", requireAuth, meProfile);

export default router;
