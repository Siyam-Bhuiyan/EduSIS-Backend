const { asyncHandler } = require("../middleware/error");
const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Result = require("../models/Result");
const Grade = require("../models/Grade");
const AdmitCard = require("../models/AdmitCard");
const Event = require("../models/Event");
const Message = require("../models/Message");
const CourseSection = require("../models/CourseSection");

// @desc    Get student dashboard
// @route   GET /api/students/dashboard
// @access  Private/Student
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id }).populate(
    "user",
    "name email profilePicture"
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  // Get enrolled courses
  const enrollments = await Enrollment.find({
    student: student._id,
    status: "enrolled",
  })
    .populate({
      path: "section",
      populate: [
        {
          path: "course",
          select: "courseCode title credits",
        },
        {
          path: "teacher",
          select: "teacherId user",
          populate: {
            path: "user",
            select: "name email",
          },
        },
      ],
    })
    .limit(5);

  // Get pending assignments
  const pendingAssignments = await Assignment.find({
    section: { $in: enrollments.map((e) => e.section._id) },
    status: "published",
    dueDate: { $gte: new Date() },
  })
    .populate("section", "section course")
    .populate("section.course", "courseCode title")
    .sort({ dueDate: 1 })
    .limit(5);

  // Get upcoming events
  const upcomingEvents = await Event.find({
    startDate: { $gte: new Date() },
    $or: [
      { targetAudience: "all" },
      { targetAudience: "students" },
      { section: { $in: enrollments.map((e) => e.section._id) } },
    ],
  })
    .sort({ startDate: 1 })
    .limit(5);

  // Get unread messages count
  const unreadMessagesCount = await Message.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      student,
      enrollments,
      pendingAssignments,
      upcomingEvents,
      unreadMessagesCount,
    },
  });
});

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private/Student
exports.getProfile = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id }).populate(
    "user",
    "name email profilePicture"
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

// @desc    Get enrolled courses
// @route   GET /api/students/courses
// @access  Private/Student
exports.getCourses = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  const enrollments = await Enrollment.find({
    student: student._id,
  })
    .populate({
      path: "section",
      populate: [
        {
          path: "course",
          select: "courseCode title description credits department",
        },
        {
          path: "teacher",
          select: "teacherId user designation",
          populate: {
            path: "user",
            select: "name email",
          },
        },
      ],
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: enrollments,
  });
});

// @desc    Get assignments
// @route   GET /api/students/assignments
// @access  Private/Student
exports.getAssignments = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  // Get student's enrolled sections
  const enrollments = await Enrollment.find({
    student: student._id,
    status: "enrolled",
  });
  const sectionIds = enrollments.map((e) => e.section);

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {
    section: { $in: sectionIds },
    status: "published",
  };

  if (req.query.status === "pending") {
    query.dueDate = { $gte: new Date() };
  } else if (req.query.status === "overdue") {
    query.dueDate = { $lt: new Date() };
  }

  const assignments = await Assignment.find(query)
    .populate({
      path: "section",
      select: "section course",
      populate: {
        path: "course",
        select: "courseCode title",
      },
    })
    .sort({ dueDate: 1 })
    .skip(startIndex)
    .limit(limit);

  // Get submission status for each assignment
  const assignmentsWithSubmissions = await Promise.all(
    assignments.map(async (assignment) => {
      const submission = await AssignmentSubmission.findOne({
        assignment: assignment._id,
        student: student._id,
      });

      return {
        ...assignment.toObject(),
        submission: submission || null,
        isSubmitted: !!submission,
      };
    })
  );

  const total = await Assignment.countDocuments(query);

  res.status(200).json({
    success: true,
    count: assignments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: assignmentsWithSubmissions,
  });
});

// @desc    Submit assignment
// @route   POST /api/students/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: "Assignment not found",
    });
  }

  // Check if student is enrolled in the course
  const enrollment = await Enrollment.findOne({
    student: student._id,
    section: assignment.section,
    status: "enrolled",
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: "Not enrolled in this course",
    });
  }

  // Check if already submitted
  const existingSubmission = await AssignmentSubmission.findOne({
    assignment: assignment._id,
    student: student._id,
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: "Assignment already submitted",
    });
  }

  // Create submission
  const submissionData = {
    assignment: assignment._id,
    student: student._id,
    content: req.body.content,
  };

  // Handle file attachments
  if (req.files && req.files.length > 0) {
    submissionData.attachments = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
    }));
  }

  const submission = await AssignmentSubmission.create(submissionData);

  res.status(201).json({
    success: true,
    data: submission,
  });
});

// @desc    Get results
// @route   GET /api/students/results
// @access  Private/Student
exports.getResults = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {
    student: student._id,
    isPublished: true,
  };

  if (req.query.semester) query.semester = req.query.semester;
  if (req.query.academicYear) query.academicYear = req.query.academicYear;
  if (req.query.examType) query.examType = req.query.examType;

  const results = await Result.find(query)
    .populate({
      path: "section",
      select: "section course",
      populate: {
        path: "course",
        select: "courseCode title credits",
      },
    })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Result.countDocuments(query);

  // Calculate GPA if semester and academic year are provided
  let gpa = null;
  if (req.query.semester && req.query.academicYear) {
    gpa = await Result.calculateGPA(
      student._id,
      req.query.semester,
      req.query.academicYear
    );
  }

  res.status(200).json({
    success: true,
    count: results.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    gpa,
    data: results,
  });
});

// @desc    Get admit cards
// @route   GET /api/students/admit-cards
// @access  Private/Student
exports.getAdmitCards = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  const admitCards = await AdmitCard.find({
    student: student._id,
    status: "issued",
  })
    .populate("examSchedule.course", "courseCode title")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: admitCards,
  });
});

// @desc    Download admit card
// @route   GET /api/students/admit-cards/:id/download
// @access  Private/Student
exports.downloadAdmitCard = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  const admitCard = await AdmitCard.findOne({
    _id: req.params.id,
    student: student._id,
  })
    .populate("student", "studentId user")
    .populate("student.user", "name email")
    .populate("examSchedule.course", "courseCode title");

  if (!admitCard) {
    return res.status(404).json({
      success: false,
      message: "Admit card not found",
    });
  }

  if (!admitCard.isValid) {
    return res.status(400).json({
      success: false,
      message: "Admit card is not valid",
    });
  }

  // Record download
  await admitCard.recordDownload();

  res.status(200).json({
    success: true,
    data: admitCard,
  });
});

// @desc    Get calendar events
// @route   GET /api/students/calendar
// @access  Private/Student
exports.getCalendar = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  // Get student's enrolled sections
  const enrollments = await Enrollment.find({
    student: student._id,
    status: "enrolled",
  });
  const sectionIds = enrollments.map((e) => e.section);

  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate
    ? new Date(endDate)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

  const events = await Event.getEventsInRange(start, end, {
    $or: [
      { targetAudience: "all" },
      { targetAudience: "students" },
      { section: { $in: sectionIds } },
      { department: student.department },
    ],
  });

  res.status(200).json({
    success: true,
    data: events,
  });
});

// @desc    Get messages
// @route   GET /api/students/messages
// @access  Private/Student
exports.getMessages = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const messages = await Message.find({
    receiver: req.user._id,
    isDeleted: false,
  })
    .populate("sender", "name email role")
    .sort({ sentAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Message.countDocuments({
    receiver: req.user._id,
    isDeleted: false,
  });

  const unreadCount = await Message.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    count: messages.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    unreadCount,
    data: messages,
  });
});

// @desc    Get student grades
// @route   GET /api/students/grades
// @access  Private/Student
exports.getGrades = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query options
  const options = {
    semester: req.query.semester,
    academicYear: req.query.academicYear,
    courseId: req.query.courseId,
    published:
      req.query.published !== undefined ? req.query.published === "true" : true, // Default to published only
  };

  // Get grades using the static method
  let grades = await Grade.getStudentGrades(student._id, options);

  // Apply pagination
  const total = grades.length;
  grades = grades.slice(startIndex, startIndex + limit);

  res.status(200).json({
    success: true,
    count: grades.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: grades,
  });
});
