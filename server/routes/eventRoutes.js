const express = require("express");
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getCalendarEvents,
  getUpcomingEvents,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");
const { uploadMultiple, handleMulterError } = require("../middleware/upload");

const router = express.Router();

// All routes are protected
router.use(protect);

// Calendar view
router.get("/calendar", getCalendarEvents);

// Upcoming events
router.get("/upcoming", getUpcomingEvents);

// Main event routes
router.route("/").get(getEvents).post(
  authorize("admin", "teacher"), // Only admins and teachers can create events
  uploadMultiple("attachments", 3),
  handleMulterError,
  createEvent
);

// Individual event operations
router
  .route("/:id")
  .get(getEvent)
  .put(uploadMultiple("attachments", 3), handleMulterError, updateEvent)
  .delete(deleteEvent);

module.exports = router;
