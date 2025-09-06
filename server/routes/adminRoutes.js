const express = require("express");
const {
  getStudents,
  addStudent,
  getTeachers,
  addTeacher,
  getCourses,
  addCourse,
  createCourseSection,
  enrollStudents,
  assignTeacher,
  getAdmitCards,
  generateAdmitCards,
  getDashboardStats,
  createAdminTeacherProfile,
  assignAllCoursesToTeacher,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboardStats);

// Student management
router.route("/students").get(getStudents).post(addStudent);

// Teacher management
router.route("/teachers").get(getTeachers).post(addTeacher);

// Create teacher profile for admin
router.post("/create-teacher-profile", createAdminTeacherProfile);

// Assign all courses to teacher (for testing)
router.post("/assign-all-courses/:teacherId", assignAllCoursesToTeacher);

// Course management
router.route("/courses").get(getCourses).post(addCourse);

// Course section management
router.post("/course-sections", createCourseSection);

// Enrollment management
router.post("/enrollments", enrollStudents);

// Teacher assignment
router.post("/teacher-assignments", assignTeacher);

// Admit card management
router.route("/admit-cards").get(getAdmitCards).post(generateAdmitCards);

module.exports = router;
