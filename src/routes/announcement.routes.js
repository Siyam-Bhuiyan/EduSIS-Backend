// src/routes/announcement.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { create, update, remove, getOne, list } from "../controllers/announcement.controller.js";

const router = Router();

router.get("/", requireAuth, list);
router.get("/:id", requireAuth, getOne);

router.post("/", requireAuth, requireRole("teacher","admin"), create);
router.patch("/:id", requireAuth, requireRole("teacher","admin"), update);
router.delete("/:id", requireAuth, requireRole("teacher","admin"), remove);

export default router;
