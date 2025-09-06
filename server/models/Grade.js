const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "Student",
      required: true,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Course",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: "Teacher",
      required: true,
    },
    semester: {
      type: String,
      required: [true, "Please provide semester"],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, "Please provide academic year"],
      trim: true,
    },
    // Individual grade components
    quiz1_marks: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    quiz2_marks: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    quiz3_marks: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    assignments_marks: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },
    attendance_marks: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    mid_sem_marks: {
      type: Number,
      default: 0,
      min: 0,
      max: 30,
    },
    final_sem_marks: {
      type: Number,
      default: 0,
      min: 0,
      max: 40,
    },
    // Calculated fields
    total_marks: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"],
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedDate: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient querying
gradeSchema.index(
  { student: 1, course: 1, semester: 1, academicYear: 1 },
  { unique: true }
);
gradeSchema.index({ course: 1, teacher: 1 });

// Pre-save middleware to calculate total marks, percentage, and grade
gradeSchema.pre("save", function (next) {
  // Calculate total marks
  this.total_marks =
    this.quiz1_marks +
    this.quiz2_marks +
    this.quiz3_marks +
    this.assignments_marks +
    this.attendance_marks +
    this.mid_sem_marks +
    this.final_sem_marks;

  // Calculate percentage (out of 130 total possible marks)
  const maxMarks = 130; // 10+10+10+20+10+30+40
  this.percentage = Math.round((this.total_marks / maxMarks) * 100);

  // Calculate grade based on total marks
  if (this.total_marks >= 117) {
    // 90% of 130
    this.grade = "A+";
  } else if (this.total_marks >= 110) {
    // 85% of 130
    this.grade = "A";
  } else if (this.total_marks >= 104) {
    // 80% of 130
    this.grade = "A-";
  } else if (this.total_marks >= 98) {
    // 75% of 130
    this.grade = "B+";
  } else if (this.total_marks >= 91) {
    // 70% of 130
    this.grade = "B";
  } else if (this.total_marks >= 85) {
    // 65% of 130
    this.grade = "B-";
  } else if (this.total_marks >= 78) {
    // 60% of 130
    this.grade = "C+";
  } else if (this.total_marks >= 72) {
    // 55% of 130
    this.grade = "C";
  } else if (this.total_marks >= 65) {
    // 50% of 130
    this.grade = "C-";
  } else if (this.total_marks >= 59) {
    // 45% of 130
    this.grade = "D+";
  } else if (this.total_marks >= 52) {
    // 40% of 130
    this.grade = "D";
  } else {
    this.grade = "F";
  }

  next();
});

// Virtual for getting best 3 quiz scores
gradeSchema.virtual("best_quiz_total").get(function () {
  const quizScores = [this.quiz1_marks, this.quiz2_marks, this.quiz3_marks];
  return quizScores
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((sum, score) => sum + score, 0);
});

// Static method to get grades for a student
gradeSchema.statics.getStudentGrades = async function (
  studentId,
  options = {}
) {
  let query = { student: studentId };

  if (options.semester) query.semester = options.semester;
  if (options.academicYear) query.academicYear = options.academicYear;
  if (options.courseId) query.course = options.courseId;
  if (options.published !== undefined) query.isPublished = options.published;

  return this.find(query)
    .populate("course", "courseCode title credits")
    .populate("student", "studentId user")
    .populate("teacher", "teacherId user")
    .sort({ createdAt: -1 });
};

// Static method to get course grades for teacher
gradeSchema.statics.getCourseGrades = async function (
  courseId,
  teacherId,
  options = {}
) {
  let query = { course: courseId, teacher: teacherId };

  if (options.semester) query.semester = options.semester;
  if (options.academicYear) query.academicYear = options.academicYear;

  return this.find(query)
    .populate("student", "studentId user")
    .populate("course", "courseCode title")
    .sort({ "student.studentId": 1 });
};

module.exports = mongoose.model("Grade", gradeSchema);
