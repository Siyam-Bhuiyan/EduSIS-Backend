// src/routes/calendar.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { myEvents } from "../controllers/calendar.controller.js";

const router = Router();
router.get("/me", requireAuth, myEvents);
export default router;
