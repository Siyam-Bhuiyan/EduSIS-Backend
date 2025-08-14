// src/routes/message.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireCourseMember } from "../middleware/courseAccess.js";
import { list, create, update, remove, mark_read, list_readers } from "../controllers/message.controller.js";

const router = Router({ mergeParams: true });

// List & send
router.get("/", requireAuth, requireCourseMember, list);
router.post("/", requireAuth, requireCourseMember, create);

// Edit / delete
router.patch("/:message_id", requireAuth, requireCourseMember, update);
router.delete("/:message_id", requireAuth, requireCourseMember, remove);

// Read receipts
router.post("/read", requireAuth, requireCourseMember, mark_read);
router.get("/:message_id/readers", requireAuth, requireCourseMember, list_readers);

export default router;
