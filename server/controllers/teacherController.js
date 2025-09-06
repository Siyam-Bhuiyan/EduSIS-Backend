const { asyncHandler } = require("../middleware/error");
const Teacher = require("../models/Teacher");
const CourseSection = require("../models/CourseSection");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const Event = require("../models/Event");
const Message = require("../models/Message");
const Grade = require("../models/Grade");
const Course = require("../models/Course");

// @desc    Get teacher dashboard
// @route   GET /api/teachers/dashboard
// @access  Private/Teacher
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOne({ user: req.user._id }).populate(
    "user",
    "name email profilePicture"
  );

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  // Get assigned courses
  const assignedCourses = await CourseSection.find({
    teacher: teacher._id,
    status: "active",
  })
    .populate("course", "courseCode title credits")
    .limit(5);

  // Get recent assignments
  const recentAssignments = await Assignment.find({
    section: { $in: assignedCourses.map((c) => c._id) },
  })
    .populate("section", "section course")
    .populate("section.course", "courseCode title")
    .sort({ createdAt: -1 })
    .limit(5);

  // Get pending submissions count
  const pendingSubmissions = await AssignmentSubmission.countDocuments({
    assignment: { $in: recentAssignments.map((a) => a._id) },
    status: "submitted",
  });

  // Get upcoming events
  const upcomingEvents = await Event.find({
    startDate: { $gte: new Date() },
    $or: [
      { organizer: req.user._id },
      { createdBy: req.user._id },
      { targetAudience: "teachers" },
      { targetAudience: "all" },
    ],
  })
    .sort({ startDate: 1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      teacher,
      assignedCourses,
      recentAssignments,
      pendingSubmissions,
      upcomingEvents,
    },
  });
});

// @desc    Get assigned courses
// @route   GET /api/teachers/courses
// @access  Private/Teacher
exports.getCourses = asyncHandler(async (req, res, next) => {
  let teacher;

  // Check if user is admin or teacher
  if (req.user.role === "admin") {
    // For admin users, find any teacher profile or create a virtual one
    teacher = await Teacher.findOne({ user: req.user._id });

    if (!teacher) {
      // If admin doesn't have teacher profile, get all courses
      const allCourses = await Course.find({ status: "active" })
        .select("courseCode title description credits department")
        .sort({ courseCode: 1 });

      return res.status(200).json({
        success: true,
        data: allCourses,
      });
    }
  } else {
    // For teacher users, find their teacher profile
    teacher = await Teacher.findOne({ user: req.user._id });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }
  }

  const courseSections = await CourseSection.find({
    teacher: teacher._id,
  })
    .populate("course", "courseCode title description credits department")
    .sort({ createdAt: -1 });

  // Transform course sections to course format expected by frontend
  const courses = courseSections.map((section) => {
    const course = section.course;
    return {
      _id: course._id,
      courseCode: course.courseCode,
      title: course.title,
      description: course.description,
      credits: course.credits,
      department: course.department,
      section: section.section,
      sectionId: section._id,
    };
  });

  // Remove duplicates by course ID (in case teacher teaches multiple sections)
  const uniqueCourses = courses.reduce((acc, current) => {
    const existing = acc.find(
      (item) => item._id.toString() === current._id.toString()
    );
    if (!existing) {
      acc.push(current);
    }
    return acc;
  }, []);

  res.status(200).json({
    success: true,
    data: uniqueCourses,
  });
});

// @desc    Create announcement
// @route   POST /api/teachers/announcements
// @access  Private/Teacher
exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  const { title, content, sectionId, priority } = req.body;

  // Verify teacher teaches this section
  const section = await CourseSection.findOne({
    _id: sectionId,
    teacher: teacher._id,
  });

  if (!section) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to create announcements for this section",
    });
  }

  // Get all students in this section
  const enrollments = await Enrollment.find({
    section: sectionId,
    status: "enrolled",
  }).populate("student", "user");

  // Create messages for all students
  const messages = await Promise.all(
    enrollments.map((enrollment) =>
      Message.create({
        sender: req.user._id,
        receiver: enrollment.student.user,
        subject: title,
        content: content,
        messageType: "announcement",
        priority: priority || "normal",
      })
    )
  );

  res.status(201).json({
    success: true,
    message: `Announcement sent to ${messages.length} students`,
    data: {
      title,
      content,
      recipientCount: messages.length,
    },
  });
});

// @desc    Get course assignments
// @route   GET /api/teachers/assignments
// @access  Private/Teacher
exports.getAssignments = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  // Get teacher's sections
  const sections = await CourseSection.find({
    teacher: teacher._id,
  });
  const sectionIds = sections.map((s) => s._id);

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { section: { $in: sectionIds } };

  if (req.query.sectionId) {
    query.section = req.query.sectionId;
  }
  if (req.query.status) {
    query.status = req.query.status;
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
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Assignment.countDocuments(query);

  // Add submission stats for each assignment
  const assignmentsWithStats = await Promise.all(
    assignments.map(async (assignment) => {
      const totalSubmissions = await AssignmentSubmission.countDocuments({
        assignment: assignment._id,
      });
      const gradedSubmissions = await AssignmentSubmission.countDocuments({
        assignment: assignment._id,
        status: "graded",
      });

      return {
        ...assignment.toObject(),
        submissionStats: {
          total: totalSubmissions,
          graded: gradedSubmissions,
          pending: totalSubmissions - gradedSubmissions,
        },
      };
    })
  );

  res.status(200).json({
    success: true,
    count: assignments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: assignmentsWithStats,
  });
});

// @desc    Create assignment
// @route   POST /api/teachers/assignments
// @access  Private/Teacher
exports.createAssignment = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  // Verify teacher teaches this section
  const section = await CourseSection.findOne({
    _id: req.body.section,
    teacher: teacher._id,
  });

  if (!section) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to create assignments for this section",
    });
  }

  const assignmentData = { ...req.body };

  // Handle file attachments
  if (req.files && req.files.length > 0) {
    assignmentData.attachments = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
    }));
  }

  const assignment = await Assignment.create(assignmentData);

  const populatedAssignment = await Assignment.findById(
    assignment._id
  ).populate({
    path: "section",
    select: "section course",
    populate: {
      path: "course",
      select: "courseCode title",
    },
  });

  res.status(201).json({
    success: true,
    data: populatedAssignment,
  });
});

// @desc    Grade assignment submission
// @route   PUT /api/teachers/assignments/:id/grade
// @access  Private/Teacher
exports.gradeAssignment = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  const submission = await AssignmentSubmission.findById(
    req.params.id
  ).populate("assignment");

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Submission not found",
    });
  }

  // Verify teacher teaches this course
  const section = await CourseSection.findOne({
    _id: submission.assignment.section,
    teacher: teacher._id,
  });

  if (!section) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to grade this submission",
    });
  }

  const { marks, feedback } = req.body;

  submission.marks = marks;
  submission.feedback = feedback;
  submission.status = "graded";
  submission.gradedBy = teacher._id;
  submission.gradedDate = new Date();

  await submission.save();

  res.status(200).json({
    success: true,
    data: submission,
  });
});

// @desc    Get course students
// @route   GET /api/teachers/students/:courseId
// @access  Private/Teacher
exports.getCourseStudents = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  // Verify teacher teaches this section
  const section = await CourseSection.findOne({
    _id: req.params.courseId,
    teacher: teacher._id,
  });

  if (!section) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view students for this section",
    });
  }

  const enrollments = await Enrollment.find({
    section: req.params.courseId,
    status: "enrolled",
  })
    .populate({
      path: "student",
      select: "studentId user department batch semester section",
      populate: {
        path: "user",
        select: "name email profilePicture",
      },
    })
    .sort({ "student.studentId": 1 });

  res.status(200).json({
    success: true,
    data: enrollments,
  });
});

// @desc    Schedule online class
// @route   POST /api/teachers/online-classes
// @access  Private/Teacher
exports.scheduleOnlineClass = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  const { sectionId, title, description, startDate, endDate, meetingLink } =
    req.body;

  // Verify teacher teaches this section
  const section = await CourseSection.findOne({
    _id: sectionId,
    teacher: teacher._id,
  });

  if (!section) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to schedule classes for this section",
    });
  }

  const event = await Event.create({
    title,
    description,
    eventType: "academic",
    startDate,
    endDate,
    organizer: req.user._id,
    createdBy: req.user._id,
    section: sectionId,
    targetAudience: "specific-course",
    location: {
      venue: "Online",
      address: meetingLink,
    },
  });

  res.status(201).json({
    success: true,
    data: event,
  });
});

// @desc    Get calendar events
// @route   GET /api/teachers/calendar
// @access  Private/Teacher
exports.getCalendar = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  // Get teacher's sections
  const sections = await CourseSection.find({
    teacher: teacher._id,
    status: "active",
  });
  const sectionIds = sections.map((s) => s._id);

  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate
    ? new Date(endDate)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const events = await Event.getEventsInRange(start, end, {
    $or: [
      { organizer: req.user._id },
      { createdBy: req.user._id },
      { targetAudience: "teachers" },
      { targetAudience: "all" },
      { section: { $in: sectionIds } },
      { department: teacher.department },
    ],
  });

  res.status(200).json({
    success: true,
    data: events,
  });
});

// @desc    Get grades for teacher's courses
// @route   GET /api/teachers/grades
// @access  Private/Teacher or Admin
exports.getGrades = asyncHandler(async (req, res, next) => {
  let teacher;

  // Check if user is admin or teacher
  if (req.user.role === "admin") {
    // For admin users, we'll get all grades or allow them to specify teacherId
    if (req.query.teacherId) {
      teacher = await Teacher.findById(req.query.teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }
    }
  } else {
    // For teacher users, find their teacher profile
    teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {};

  if (teacher) {
    query.teacher = teacher._id;
  }

  if (req.query.courseId) query.course = req.query.courseId;
  if (req.query.semester) query.semester = req.query.semester;
  if (req.query.academicYear) query.academicYear = req.query.academicYear;

  const grades = await Grade.find(query)
    .populate("student", "studentId user")
    .populate("course", "courseCode title")
    .populate("teacher", "teacherId user")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Grade.countDocuments(query);

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

// @desc    Get grades for a specific course
// @route   GET /api/teachers/grades/:courseId
// @access  Private/Teacher or Admin
exports.getCourseGrades = asyncHandler(async (req, res, next) => {
  let teacher;

  // Check if user is admin or teacher
  if (req.user.role === "admin") {
    // For admin users, allow access to any course
    if (req.query.teacherId) {
      teacher = await Teacher.findById(req.query.teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }
    }
  } else {
    // For teacher users, find their teacher profile
    teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }
  }

  const { courseId } = req.params;

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Build query
  let query = { course: courseId };
  if (teacher) {
    query.teacher = teacher._id;
  }

  const grades = await Grade.find(query)
    .populate("student", "studentId user")
    .populate("course", "courseCode title")
    .populate("teacher", "teacherId user")
    .sort({ "student.studentId": 1 });

  res.status(200).json({
    success: true,
    data: grades,
  });
});

// @desc    Create or update grade
// @route   POST /api/teachers/grades
// @access  Private/Teacher or Admin
exports.createOrUpdateGrade = asyncHandler(async (req, res, next) => {
  let teacher;

  // Check if user is admin or teacher
  if (req.user.role === "admin") {
    // For admin users, we'll need to create a default teacher or get one from the request
    if (req.body.teacherId) {
      teacher = await Teacher.findById(req.body.teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }
    } else {
      teacher = await Teacher.findOne().limit(1);
      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: "Please specify teacherId in request body for admin users",
        });
      }
    }
  } else {
    // For teacher users, find their teacher profile
    teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }
  }

  const {
    studentId,
    courseId,
    semester,
    academicYear,
    quiz1_marks,
    quiz2_marks,
    quiz3_marks,
    assignments_marks,
    attendance_marks,
    mid_sem_marks,
    final_sem_marks,
    remarks,
  } = req.body;

  // Validate required fields
  if (!studentId || !courseId || !semester || !academicYear) {
    return res.status(400).json({
      success: false,
      message: "Student, course, semester, and academic year are required",
    });
  }

  // Verify student exists
  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Check if grade already exists
  let grade = await Grade.findOne({
    student: studentId,
    course: courseId,
    semester,
    academicYear,
  });

  const gradeData = {
    student: studentId,
    course: courseId,
    teacher: teacher._id,
    semester,
    academicYear,
    quiz1_marks: quiz1_marks || 0,
    quiz2_marks: quiz2_marks || 0,
    quiz3_marks: quiz3_marks || 0,
    assignments_marks: assignments_marks || 0,
    attendance_marks: attendance_marks || 0,
    mid_sem_marks: mid_sem_marks || 0,
    final_sem_marks: final_sem_marks || 0,
    remarks: remarks || "",
  };

  if (grade) {
    // Update existing grade
    Object.assign(grade, gradeData);
    await grade.save();
  } else {
    // Create new grade
    grade = await Grade.create(gradeData);
  }

  // Populate the response
  await grade.populate("student", "studentId user");
  await grade.populate("course", "courseCode title");
  await grade.populate("teacher", "teacherId user");

  res.status(grade.isNew ? 201 : 200).json({
    success: true,
    data: grade,
  });
});

// @desc    Update grade
// @route   PUT /api/teachers/grades/:gradeId
// @access  Private/Teacher
exports.updateGrade = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  let grade = await Grade.findById(req.params.gradeId);

  if (!grade) {
    return res.status(404).json({
      success: false,
      message: "Grade not found",
    });
  }

  // Verify teacher owns this grade
  if (grade.teacher.toString() !== teacher._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this grade",
    });
  }

  // Update grade
  const allowedFields = [
    "quiz1_marks",
    "quiz2_marks",
    "quiz3_marks",
    "assignments_marks",
    "attendance_marks",
    "mid_sem_marks",
    "final_sem_marks",
    "remarks",
    "isPublished",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      grade[field] = req.body[field];
    }
  });

  if (req.body.isPublished && !grade.publishedDate) {
    grade.publishedDate = new Date();
  }

  await grade.save();

  await grade.populate("student", "studentId user");
  await grade.populate("course", "courseCode title");

  res.status(200).json({
    success: true,
    data: grade,
  });
});
