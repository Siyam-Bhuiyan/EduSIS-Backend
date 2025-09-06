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

router.get("/upcoming", getUpcomingEvents);

router.route("/").get(getEvents).post(
  authorize("admin", "teacher"),
  uploadMultiple("attachments", 3),
  handleMulterError,
  createEvent
);

router
  .route("/:id")
  .get(getEvent)
  .put(uploadMultiple("attachments", 3), handleMulterError, updateEvent)
  .delete(deleteEvent);

module.exports = router;
