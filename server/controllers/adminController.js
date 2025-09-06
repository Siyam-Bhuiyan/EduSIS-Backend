const { asyncHandler } = require("../middleware/error");
const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
const CourseSection = require("../models/CourseSection");
const Enrollment = require("../models/Enrollment");
const AdmitCard = require("../models/AdmitCard");
const Result = require("../models/Result");

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
exports.getStudents = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {};
  if (req.query.department) query.department = req.query.department;
  if (req.query.batch) query.batch = req.query.batch;
  if (req.query.semester) query.semester = req.query.semester;
  if (req.query.section) query.section = req.query.section;
  if (req.query.status) query.status = req.query.status;

  const students = await Student.find(query)
    .populate("user", "name email profilePicture isActive")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Student.countDocuments(query);

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: students,
  });
});

// @desc    Add new student
// @route   POST /api/admin/students
// @access  Private/Admin
exports.addStudent = asyncHandler(async (req, res, next) => {
  const { userData, studentData } = req.body;

  // Create user account
  const user = await User.create({
    ...userData,
    role: "student",
  });

  // Create student profile
  const student = await Student.create({
    user: user._id,
    ...studentData,
  });

  const populatedStudent = await Student.findById(student._id).populate(
    "user",
    "name email profilePicture"
  );

  res.status(201).json({
    success: true,
    data: populatedStudent,
  });
});

// @desc    Get all teachers
// @route   GET /api/admin/teachers
// @access  Private/Admin
exports.getTeachers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {};
  if (req.query.department) query.department = req.query.department;
  if (req.query.designation) query.designation = req.query.designation;
  if (req.query.status) query.status = req.query.status;

  const teachers = await Teacher.find(query)
    .populate("user", "name email profilePicture isActive")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Teacher.countDocuments(query);

  res.status(200).json({
    success: true,
    count: teachers.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: teachers,
  });
});

// @desc    Add new teacher
// @route   POST /api/admin/teachers
// @access  Private/Admin
exports.addTeacher = asyncHandler(async (req, res, next) => {
  console.log("Received request body:", req.body);
  const { userData, teacherData } = req.body;
  console.log("Extracted userData:", userData);
  console.log("Extracted teacherData:", teacherData);

  // Create user account
  const user = await User.create({
    ...userData,
    role: "teacher",
  });

  // Create teacher profile
  const teacher = await Teacher.create({
    user: user._id,
    ...teacherData,
  });

  const populatedTeacher = await Teacher.findById(teacher._id).populate(
    "user",
    "name email profilePicture"
  );

  res.status(201).json({
    success: true,
    data: populatedTeacher,
  });
});

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getCourses = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {};
  if (req.query.department) query.department = req.query.department;
  if (req.query.courseType) query.courseType = req.query.courseType;
  if (req.query.isActive !== undefined)
    query.isActive = req.query.isActive === "true";

  const courses = await Course.find(query)
    .sort({ courseCode: 1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Course.countDocuments(query);

  res.status(200).json({
    success: true,
    count: courses.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: courses,
  });
});

// @desc    Add new course
// @route   POST /api/admin/courses
// @access  Private/Admin
exports.addCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @desc    Create teacher profile for admin user
// @route   POST /api/admin/create-teacher-profile
// @access  Private/Admin
exports.createAdminTeacherProfile = asyncHandler(async (req, res) => {
  console.log("Create admin teacher profile called");
  console.log("User ID:", req.headers["user-id"]);
  console.log("Request body:", req.body);

  // Check if teacher profile already exists for this user
  const existingTeacher = await Teacher.findOne({ user: req.user._id });

  if (existingTeacher) {
    return res.status(200).json({
      success: true,
      message: "Teacher profile already exists",
      data: existingTeacher,
    });
  }

  // Create teacher profile for admin user
  const teacherData = {
    user: req.user._id,
    teacherId: req.body.teacherId || `ADMIN-${Date.now()}`,
    department: req.body.department || "Administration",
    designation: req.body.designation || "Administrator",
    phoneNumber: req.body.phoneNumber || "",
    officeLocation: req.body.officeLocation || "Admin Office",
    specialization: req.body.specialization || ["Administration"],
    status: "active",
  };

  const teacher = await Teacher.create(teacherData);

  // Create some sample courses if none exist
  const existingCourses = await Course.find();
  if (existingCourses.length === 0) {
    const sampleCourses = [
      {
        courseCode: "CSE-301",
        title: "Computer Networks",
        description: "Introduction to computer networking concepts",
        credits: 3,
        department: "Computer Science",
        status: "active",
      },
      {
        courseCode: "CSE-205",
        title: "Database Systems",
        description: "Database design and management",
        credits: 3,
        department: "Computer Science",
        status: "active",
      },
      {
        courseCode: "CSE-401",
        title: "Software Engineering",
        description: "Software development methodologies",
        credits: 3,
        department: "Computer Science",
        status: "active",
      },
    ];

    await Course.insertMany(sampleCourses);
    console.log("Created sample courses");
  }

  // Assign all courses to this teacher
  const allCourses = await Course.find({ status: "active" });
  const courseSections = [];

  for (const course of allCourses) {
    const courseSection = await CourseSection.create({
      course: course._id,
      teacher: teacher._id,
      section: "A",
      semester: "Fall 2024",
      academicYear: "2024-2025",
      maxStudents: 50,
      status: "active",
    });
    courseSections.push(courseSection);
  }

  console.log(`Assigned ${courseSections.length} courses to teacher`);

  // Populate user information
  await teacher.populate("user", "name email profilePicture");

  res.status(201).json({
    success: true,
    message: `Teacher profile created and assigned ${courseSections.length} courses`,
    data: teacher,
  });
});

// @desc    Assign all courses to teacher (for testing/admin purposes)
// @route   POST /api/admin/assign-all-courses/:teacherId
// @access  Private/Admin
exports.assignAllCoursesToTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;

  // Find the teacher
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found",
    });
  }

  // Get all courses
  const courses = await Course.find({ status: "active" });

  if (courses.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No active courses found",
    });
  }

  // Create course sections for each course if they don't exist
  const courseSections = [];

  for (const course of courses) {
    // Check if course section already exists for this teacher
    let courseSection = await CourseSection.findOne({
      course: course._id,
      teacher: teacher._id,
    });

    if (!courseSection) {
      // Create new course section
      courseSection = await CourseSection.create({
        course: course._id,
        teacher: teacher._id,
        section: "A", // Default section
        semester: "Fall 2024",
        academicYear: "2024-2025",
        maxStudents: 50,
        status: "active",
      });
    }

    courseSections.push(courseSection);
  }

  // Populate the response
  await Promise.all(
    courseSections.map((section) =>
      section.populate("course", "courseCode title description credits")
    )
  );

  res.status(201).json({
    success: true,
    message: `Assigned ${courseSections.length} courses to teacher`,
    data: courseSections,
  });
});

// @desc    Create course section
// @route   POST /api/admin/course-sections
// @access  Private/Admin
exports.createCourseSection = asyncHandler(async (req, res, next) => {
  const {
    courseId,
    teacherId,
    section,
    semester,
    academicYear,
    maxStudents,
    schedule,
  } = req.body;

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Verify teacher exists
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found",
    });
  }

  const courseSection = await CourseSection.create({
    course: courseId,
    teacher: teacherId,
    section,
    semester,
    academicYear,
    maxStudents,
    schedule,
  });

  const populatedSection = await CourseSection.findById(courseSection._id)
    .populate("course", "courseCode title")
    .populate("teacher", "teacherId user")
    .populate("teacher.user", "name email");

  res.status(201).json({
    success: true,
    data: populatedSection,
  });
});

// @desc    Enroll students in courses
// @route   POST /api/admin/enrollments
// @access  Private/Admin
exports.enrollStudents = asyncHandler(async (req, res, next) => {
  const { studentIds, sectionId } = req.body;

  // Check if section exists and has capacity
  const section = await CourseSection.findById(sectionId);
  if (!section) {
    return res.status(404).json({
      success: false,
      message: "Course section not found",
    });
  }

  if (section.currentEnrollment + studentIds.length > section.maxStudents) {
    return res.status(400).json({
      success: false,
      message: "Enrollment would exceed maximum capacity",
    });
  }

  const enrollments = [];
  for (const studentId of studentIds) {
    try {
      const enrollment = await Enrollment.create({
        student: studentId,
        section: sectionId,
      });
      enrollments.push(enrollment);
    } catch (error) {
      // Skip if already enrolled
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  // Update section enrollment count
  await CourseSection.findByIdAndUpdate(sectionId, {
    $inc: { currentEnrollment: enrollments.length },
  });

  res.status(201).json({
    success: true,
    data: enrollments,
    message: `${enrollments.length} students enrolled successfully`,
  });
});

// @desc    Assign teachers to courses
// @route   POST /api/admin/teacher-assignments
// @access  Private/Admin
exports.assignTeacher = asyncHandler(async (req, res, next) => {
  const { teacherId, courseId, sectionData } = req.body;

  // Verify teacher and course exist
  const teacher = await Teacher.findById(teacherId);
  const course = await Course.findById(courseId);

  if (!teacher || !course) {
    return res.status(404).json({
      success: false,
      message: "Teacher or course not found",
    });
  }

  const section = await CourseSection.create({
    course: courseId,
    teacher: teacherId,
    ...sectionData,
  });

  const populatedSection = await CourseSection.findById(section._id)
    .populate("course", "courseCode title credits")
    .populate("teacher", "teacherId user")
    .populate("teacher.user", "name email");

  res.status(201).json({
    success: true,
    data: populatedSection,
  });
});

// @desc    Get all admit cards
// @route   GET /api/admin/admit-cards
// @access  Private/Admin
exports.getAdmitCards = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {};
  if (req.query.semester) query.semester = req.query.semester;
  if (req.query.academicYear) query.academicYear = req.query.academicYear;
  if (req.query.examType) query.examType = req.query.examType;
  if (req.query.status) query.status = req.query.status;

  const admitCards = await AdmitCard.find(query)
    .populate("student", "studentId user")
    .populate("student.user", "name email")
    .populate("examSchedule.course", "courseCode title")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await AdmitCard.countDocuments(query);

  res.status(200).json({
    success: true,
    count: admitCards.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: admitCards,
  });
});

// @desc    Generate admit cards
// @route   POST /api/admin/admit-cards
// @access  Private/Admin
exports.generateAdmitCards = asyncHandler(async (req, res, next) => {
  const { studentIds, examData } = req.body;

  const admitCards = [];
  for (const studentId of studentIds) {
    try {
      const admitCard = await AdmitCard.create({
        student: studentId,
        ...examData,
        issuedBy: req.user._id,
      });
      admitCards.push(admitCard);
    } catch (error) {
      // Skip if admit card already exists for this student/exam
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  res.status(201).json({
    success: true,
    data: admitCards,
    message: `${admitCards.length} admit cards generated successfully`,
  });
});

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const stats = await Promise.all([
    Student.countDocuments({ status: "active" }),
    Teacher.countDocuments({ status: "active" }),
    Course.countDocuments({ isActive: true }),
    CourseSection.countDocuments({ status: "active" }),
    Enrollment.countDocuments({ status: "enrolled" }),
  ]);

  const [
    activeStudents,
    activeTeachers,
    activeCourses,
    activeSections,
    totalEnrollments,
  ] = stats;

  // Get recent activities
  const recentStudents = await Student.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  const recentEnrollments = await Enrollment.find()
    .populate("student", "studentId user")
    .populate("student.user", "name")
    .populate("section", "section semester")
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        activeStudents,
        activeTeachers,
        activeCourses,
        activeSections,
        totalEnrollments,
      },
      recentActivities: {
        recentStudents,
        recentEnrollments,
      },
    },
  });
});
