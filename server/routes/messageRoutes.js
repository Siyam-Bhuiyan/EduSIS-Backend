const express = require("express");
const {
  getMessages,
  getMessage,
  sendMessage,
  markAsRead,
  toggleStar,
  archiveMessage,
  deleteMessage,
  getConversation,
  getMessageStats,
} = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
const { uploadMultiple, handleMulterError } = require("../middleware/upload");

const router = express.Router();

// All routes are protected
router.use(protect);

// Message statistics
router.get("/stats", getMessageStats);

// Conversation
router.get("/conversation/:userId", getConversation);

// Main message routes
router
  .route("/")
  .get(getMessages)
  .post(uploadMultiple("attachments", 3), handleMulterError, sendMessage);

// Individual message operations
router.get("/:id", getMessage);
router.put("/:id/read", markAsRead);
router.put("/:id/star", toggleStar);
router.put("/:id/archive", archiveMessage);
router.delete("/:id", deleteMessage);

module.exports = router;
