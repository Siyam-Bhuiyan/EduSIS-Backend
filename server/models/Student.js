const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: String,
      required: [true, "Please provide student ID"],
      unique: true,
      trim: true,
      maxlength: [20, "Student ID cannot be more than 20 characters"],
    },
    department: {
      type: String,
      required: [true, "Please provide department"],
      trim: true,
      maxlength: [100, "Department cannot be more than 100 characters"],
    },
    batch: {
      type: String,
      required: [true, "Please provide batch"],
      trim: true,
      maxlength: [50, "Batch cannot be more than 50 characters"],
    },
    semester: {
      type: String,
      required: [true, "Please provide semester"],
      trim: true,
      maxlength: [50, "Semester cannot be more than 50 characters"],
    },
    section: {
      type: String,
      required: [true, "Please provide section"],
      trim: true,
      maxlength: [10, "Section cannot be more than 10 characters"],
    },
    rollNumber: {
      type: String,
      required: [true, "Please provide roll number"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please provide date of birth"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    parentContact: {
      fatherName: String,
      motherName: String,
      guardianPhone: String,
      guardianEmail: String,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "graduated", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create compound index for department, batch, semester, section
studentSchema.index({ department: 1, batch: 1, semester: 1, section: 1 });

// Virtual for enrollments
studentSchema.virtual("enrollments", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "student",
  justOne: false,
});

// Virtual for results
studentSchema.virtual("results", {
  ref: "Result",
  localField: "_id",
  foreignField: "student",
  justOne: false,
});

module.exports = mongoose.model("Student", studentSchema);
