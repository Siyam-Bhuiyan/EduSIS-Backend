// src/routes/profile.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { me, updateMe, changePassword } from "../controllers/profile.controller.js";

const router = Router();

router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, updateMe);
router.patch("/me/password", requireAuth, changePassword);

export default router;
