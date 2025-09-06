const express = require("express");
const {
  getDashboard,
  getProfile,
  getCourses,
  getAssignments,
  submitAssignment,
  getResults,
  getGrades,
  getAdmitCards,
  downloadAdmitCard,
  getCalendar,
  getMessages,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/auth");
const { uploadMultiple, handleMulterError } = require("../middleware/upload");

const router = express.Router();

// All routes are protected and require student role
router.use(protect);
router.use(authorize("student"));

// Dashboard
router.get("/dashboard", getDashboard);

// Profile
router.get("/profile", getProfile);

// Courses
router.get("/courses", getCourses);

// Assignments
router.get("/assignments", getAssignments);
router.post(
  "/assignments/:id/submit",
  uploadMultiple("attachments", 5),
  handleMulterError,
  submitAssignment
);

// Results
router.get("/results", getResults);

// Grades
router.get("/grades", getGrades);

// Admit cards
router.get("/admit-cards", getAdmitCards);
router.get("/admit-cards/:id/download", downloadAdmitCard);

// Calendar
router.get("/calendar", getCalendar);

// Messages
router.get("/messages", getMessages);

module.exports = router;
