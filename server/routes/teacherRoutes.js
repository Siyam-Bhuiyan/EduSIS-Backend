const express = require("express");
const {
  getDashboard,
  getCourses,
  createAnnouncement,
  getAssignments,
  createAssignment,
  gradeAssignment,
  getCourseStudents,
  scheduleOnlineClass,
  getCalendar,
  getGrades,
  createOrUpdateGrade,
  getCourseGrades,
  updateGrade,
} = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/auth");
const { uploadMultiple, handleMulterError } = require("../middleware/upload");

const router = express.Router();

// All routes are protected and require teacher or admin role
router.use(protect);
router.use(authorize("teacher", "admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// Courses
router.get("/courses", getCourses);

// Announcements
router.post("/announcements", createAnnouncement);

// Assignments
router
  .route("/assignments")
  .get(getAssignments)
  .post(uploadMultiple("attachments", 5), handleMulterError, createAssignment);

router.put("/assignments/:id/grade", gradeAssignment);

// Students
router.get("/students/:courseId", getCourseStudents);

// Grades
router.route("/grades").get(getGrades).post(createOrUpdateGrade);

router.get("/grades/:courseId", getCourseGrades);
router.put("/grades/:gradeId", updateGrade);

// Online classes
router.post("/online-classes", scheduleOnlineClass);

// Calendar
router.get("/calendar", getCalendar);

module.exports = router;
