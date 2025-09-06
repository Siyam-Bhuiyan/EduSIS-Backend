const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "Student",
      required: true,
    },
    section: {
      type: mongoose.Schema.ObjectId,
      ref: "CourseSection",
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
    examType: {
      type: String,
      enum: ["Midterm", "Final", "Quiz", "Assignment", "Lab", "Project"],
      required: true,
    },
    marks: {
      obtainedMarks: {
        type: Number,
        required: true,
        min: 0,
      },
      totalMarks: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    grade: {
      type: String,
      enum: [
        "A+",
        "A",
        "A-",
        "B+",
        "B",
        "B-",
        "C+",
        "C",
        "C-",
        "D+",
        "D",
        "F",
        "I",
        "W",
      ],
    },
    gradePoints: {
      type: Number,
      min: 0,
      max: 4,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    remarks: {
      type: String,
      trim: true,
    },
    publishedDate: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient querying
resultSchema.index({ student: 1, section: 1, examType: 1 });
resultSchema.index({ student: 1, semester: 1, academicYear: 1 });

// Pre-save middleware to calculate grade and percentage
resultSchema.pre("save", function (next) {
  // Calculate percentage
  this.percentage = Math.round(
    (this.marks.obtainedMarks / this.marks.totalMarks) * 100
  );

  // Calculate grade based on percentage
  if (this.percentage >= 90) {
    this.grade = "A+";
    this.gradePoints = 4.0;
  } else if (this.percentage >= 85) {
    this.grade = "A";
    this.gradePoints = 3.7;
  } else if (this.percentage >= 80) {
    this.grade = "A-";
    this.gradePoints = 3.3;
  } else if (this.percentage >= 75) {
    this.grade = "B+";
    this.gradePoints = 3.0;
  } else if (this.percentage >= 70) {
    this.grade = "B";
    this.gradePoints = 2.7;
  } else if (this.percentage >= 65) {
    this.grade = "B-";
    this.gradePoints = 2.3;
  } else if (this.percentage >= 60) {
    this.grade = "C+";
    this.gradePoints = 2.0;
  } else if (this.percentage >= 55) {
    this.grade = "C";
    this.gradePoints = 1.7;
  } else if (this.percentage >= 50) {
    this.grade = "C-";
    this.gradePoints = 1.3;
  } else if (this.percentage >= 45) {
    this.grade = "D+";
    this.gradePoints = 1.0;
  } else if (this.percentage >= 40) {
    this.grade = "D";
    this.gradePoints = 0.7;
  } else {
    this.grade = "F";
    this.gradePoints = 0.0;
  }

  next();
});

// Static method to calculate GPA for a student
resultSchema.statics.calculateGPA = async function (
  studentId,
  semester,
  academicYear
) {
  const results = await this.aggregate([
    {
      $match: {
        student: mongoose.Types.ObjectId(studentId),
        semester: semester,
        academicYear: academicYear,
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "coursesections",
        localField: "section",
        foreignField: "_id",
        as: "sectionInfo",
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "sectionInfo.course",
        foreignField: "_id",
        as: "courseInfo",
      },
    },
    {
      $addFields: {
        credits: { $arrayElemAt: ["$courseInfo.credits", 0] },
      },
    },
    {
      $group: {
        _id: null,
        totalGradePoints: { $sum: { $multiply: ["$gradePoints", "$credits"] } },
        totalCredits: { $sum: "$credits" },
      },
    },
  ]);

  if (results.length === 0 || results[0].totalCredits === 0) return 0;
  return (
    Math.round((results[0].totalGradePoints / results[0].totalCredits) * 100) /
    100
  );
};

module.exports = mongoose.model("Result", resultSchema);
