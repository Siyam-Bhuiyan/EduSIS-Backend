const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
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
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["enrolled", "dropped", "completed", "failed"],
      default: "enrolled",
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
        null,
      ],
      default: null,
    },
    finalMarks: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    attendance: {
      totalClasses: {
        type: Number,
        default: 0,
      },
      attendedClasses: {
        type: Number,
        default: 0,
      },
    },
    midTermMarks: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    finalExamMarks: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    assignmentMarks: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    labMarks: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    dropDate: {
      type: Date,
      default: null,
    },
    dropReason: {
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

// Compound unique index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, section: 1 }, { unique: true });

// Virtual for attendance percentage
enrollmentSchema.virtual("attendancePercentage").get(function () {
  if (this.attendance.totalClasses === 0) return 0;
  return Math.round(
    (this.attendance.attendedClasses / this.attendance.totalClasses) * 100
  );
});

// Method to calculate final grade
enrollmentSchema.methods.calculateGrade = function () {
  if (!this.finalMarks) return null;

  if (this.finalMarks >= 90) return "A+";
  if (this.finalMarks >= 85) return "A";
  if (this.finalMarks >= 80) return "A-";
  if (this.finalMarks >= 75) return "B+";
  if (this.finalMarks >= 70) return "B";
  if (this.finalMarks >= 65) return "B-";
  if (this.finalMarks >= 60) return "C+";
  if (this.finalMarks >= 55) return "C";
  if (this.finalMarks >= 50) return "C-";
  if (this.finalMarks >= 45) return "D+";
  if (this.finalMarks >= 40) return "D";
  return "F";
};

module.exports = mongoose.model("Enrollment", enrollmentSchema);
