const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, "Please provide course code"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, "Course code cannot be more than 20 characters"],
    },
    title: {
      type: String,
      required: [true, "Please provide course title"],
      trim: true,
      maxlength: [255, "Course title cannot be more than 255 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Course description cannot be more than 1000 characters",
      ],
    },
    credits: {
      type: Number,
      required: [true, "Please provide course credits"],
      min: [1, "Credits must be at least 1"],
      max: [10, "Credits cannot be more than 10"],
    },
    department: {
      type: String,
      required: [true, "Please provide department"],
      trim: true,
      maxlength: [100, "Department cannot be more than 100 characters"],
    },
    courseType: {
      type: String,
      enum: ["Core", "Elective", "Lab", "Project", "Thesis"],
      default: "Core",
    },
    prerequisites: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Course",
      },
    ],
    syllabus: {
      objectives: [String],
      modules: [
        {
          title: String,
          topics: [String],
          hours: Number,
        },
      ],
      outcomes: [String],
      references: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for course sections
courseSchema.virtual("sections", {
  ref: "CourseSection",
  localField: "_id",
  foreignField: "course",
  justOne: false,
});

// Index for efficient searching
courseSchema.index({ courseCode: 1, department: 1 });
courseSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Course", courseSchema);
