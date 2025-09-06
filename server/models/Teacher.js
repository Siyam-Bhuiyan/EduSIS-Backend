const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: String,
      required: [true, "Please provide teacher ID"],
      unique: true,
      trim: true,
      maxlength: [20, "Teacher ID cannot be more than 20 characters"],
    },
    department: {
      type: String,
      required: [true, "Please provide department"],
      trim: true,
      maxlength: [100, "Department cannot be more than 100 characters"],
    },
    designation: {
      type: String,
      required: [true, "Please provide designation"],
      trim: true,
      maxlength: [100, "Designation cannot be more than 100 characters"],
      enum: [
        "Professor",
        "Associate Professor",
        "Assistant Professor",
        "Lecturer",
        "Senior Lecturer",
        "Instructor",
      ],
    },
    specialization: [
      {
        type: String,
        trim: true,
      },
    ],
    qualifications: [
      {
        degree: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        year: {
          type: Number,
          required: true,
        },
        specialization: String,
      },
    ],
    experience: {
      totalYears: {
        type: Number,
        default: 0,
      },
      previousInstitutions: [
        {
          name: String,
          position: String,
          duration: String,
          from: Date,
          to: Date,
        },
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"],
    },
    officeLocation: {
      type: String,
      trim: true,
    },
    officeHours: {
      type: String,
      trim: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on-leave", "retired"],
      default: "active",
    },
    research: {
      areas: [String],
      publications: [
        {
          title: String,
          journal: String,
          year: Number,
          url: String,
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for assigned courses
teacherSchema.virtual("assignedCourses", {
  ref: "CourseSection",
  localField: "_id",
  foreignField: "teacher",
  justOne: false,
});

module.exports = mongoose.model("Teacher", teacherSchema);
