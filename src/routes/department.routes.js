// src/routes/department.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { create, update, remove, getOne, list } from "../controllers/department.controller.js";

const router = Router();

router.get("/", requireAuth, list);                        
router.get("/:id", requireAuth, getOne);
router.post("/", requireAuth, requireRole("admin"), create);
router.patch("/:id", requireAuth, requireRole("admin"), update);
router.delete("/:id", requireAuth, requireRole("admin"), remove);

export default router;
