const mongoose = require("mongoose");

const courseSectionSchema = new mongoose.Schema(
  {
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
    section: {
      type: String,
      required: [true, "Please provide section"],
      trim: true,
      maxlength: [10, "Section cannot be more than 10 characters"],
    },
    semester: {
      type: String,
      required: [true, "Please provide semester"],
      trim: true,
      maxlength: [50, "Semester cannot be more than 50 characters"],
    },
    academicYear: {
      type: String,
      required: [true, "Please provide academic year"],
      trim: true,
    },
    maxStudents: {
      type: Number,
      required: [true, "Please provide maximum students limit"],
      min: [1, "Maximum students must be at least 1"],
      max: [200, "Maximum students cannot exceed 200"],
    },
    currentEnrollment: {
      type: Number,
      default: 0,
    },
    schedule: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
          match: [
            /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Please provide valid time format (HH:MM)",
          ],
        },
        endTime: {
          type: String,
          required: true,
          match: [
            /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Please provide valid time format (HH:MM)",
          ],
        },
        room: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ["Lecture", "Lab", "Tutorial", "Seminar"],
          default: "Lecture",
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "completed", "cancelled"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for enrollments
courseSectionSchema.virtual("enrollments", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "section",
  justOne: false,
});

// Virtual for assignments
courseSectionSchema.virtual("assignments", {
  ref: "Assignment",
  localField: "_id",
  foreignField: "section",
  justOne: false,
});

// Compound index for unique course sections
courseSectionSchema.index(
  { course: 1, section: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

// Pre-save middleware to validate dates
courseSectionSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
  }
  next();
});

module.exports = mongoose.model("CourseSection", courseSectionSchema);
