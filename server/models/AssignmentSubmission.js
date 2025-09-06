const mongoose = require("mongoose");

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "Student",
      required: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    marks: {
      type: Number,
      min: 0,
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["submitted", "graded", "returned", "late"],
      default: "submitted",
    },
    isLateSubmission: {
      type: Boolean,
      default: false,
    },
    gradedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "Teacher",
      default: null,
    },
    gradedDate: {
      type: Date,
      default: null,
    },
    submissionAttempts: {
      type: Number,
      default: 1,
    },
    plagiarismScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index to prevent duplicate submissions
assignmentSubmissionSchema.index(
  { assignment: 1, student: 1 },
  { unique: true }
);

// Virtual for grade percentage
assignmentSubmissionSchema.virtual("gradePercentage").get(function () {
  if (!this.marks || !this.populated("assignment")?.totalMarks) return null;
  return Math.round(
    (this.marks / this.populated("assignment").totalMarks) * 100
  );
});

// Pre-save middleware to check if submission is late
assignmentSubmissionSchema.pre("save", async function (next) {
  if (this.isNew) {
    const assignment = await mongoose
      .model("Assignment")
      .findById(this.assignment);
    if (assignment && new Date() > assignment.dueDate) {
      this.isLateSubmission = true;
      this.status = "late";
    }
  }
  next();
});

// Method to calculate final marks with late penalty
assignmentSubmissionSchema.methods.calculateFinalMarks = async function () {
  if (!this.marks) return null;

  const assignment = await mongoose
    .model("Assignment")
    .findById(this.assignment);
  if (!assignment) return this.marks;

  if (this.isLateSubmission && assignment.latePenalty > 0) {
    const penalty = (assignment.latePenalty / 100) * this.marks;
    return Math.max(0, this.marks - penalty);
  }

  return this.marks;
};

module.exports = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);
