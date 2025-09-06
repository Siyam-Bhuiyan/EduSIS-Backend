const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.ObjectId,
      ref: "CourseSection",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide assignment title"],
      trim: true,
      maxlength: [255, "Assignment title cannot be more than 255 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide assignment description"],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Please provide due date"],
    },
    totalMarks: {
      type: Number,
      required: [true, "Please provide total marks"],
      min: [1, "Total marks must be at least 1"],
      max: [100, "Total marks cannot exceed 100"],
    },
    assignmentType: {
      type: String,
      enum: ["Individual", "Group", "Lab", "Project", "Quiz", "Presentation"],
      default: "Individual",
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
    submissionFormat: {
      allowedFileTypes: [String],
      maxFileSize: {
        type: Number,
        default: 10485760, // 10MB
      },
      maxFiles: {
        type: Number,
        default: 5,
      },
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    latePenalty: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for submissions
assignmentSchema.virtual("submissions", {
  ref: "AssignmentSubmission",
  localField: "_id",
  foreignField: "assignment",
  justOne: false,
});

// Virtual to check if assignment is overdue
assignmentSchema.virtual("isOverdue").get(function () {
  return new Date() > this.dueDate;
});

// Virtual to get time remaining
assignmentSchema.virtual("timeRemaining").get(function () {
  const now = new Date();
  const due = new Date(this.dueDate);
  if (now > due) return "Overdue";

  const diff = due - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} days, ${hours} hours`;
  return `${hours} hours`;
});

// Index for efficient querying
assignmentSchema.index({ section: 1, dueDate: 1 });
assignmentSchema.index({ section: 1, status: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
