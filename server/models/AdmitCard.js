const mongoose = require("mongoose");

const admitCardSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "Student",
      required: true,
    },
    examType: {
      type: String,
      required: [true, "Please provide exam type"],
      enum: ["Midterm", "Final", "Supplementary", "Improvement"],
      trim: true,
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
    examCenter: {
      name: {
        type: String,
        required: [true, "Please provide exam center name"],
        trim: true,
      },
      address: {
        type: String,
        required: [true, "Please provide exam center address"],
        trim: true,
      },
      roomNumber: {
        type: String,
        trim: true,
      },
    },
    examSchedule: [
      {
        course: {
          type: mongoose.Schema.ObjectId,
          ref: "Course",
          required: true,
        },
        examDate: {
          type: Date,
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
        duration: {
          type: Number,
          required: true,
          min: 30,
          max: 300,
        },
        roomNumber: {
          type: String,
          trim: true,
        },
        seatNumber: {
          type: String,
          trim: true,
        },
      },
    ],
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["issued", "cancelled", "expired"],
      default: "issued",
    },
    instructions: [
      {
        type: String,
        trim: true,
      },
    ],
    requiredDocuments: [
      {
        type: String,
        trim: true,
      },
    ],
    issuedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    barcode: {
      type: String,
      unique: true,
    },
    qrCode: {
      type: String,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloaded: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for unique admit cards
admitCardSchema.index(
  { student: 1, examType: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

// Virtual to check if admit card is valid
admitCardSchema.virtual("isValid").get(function () {
  return this.status === "issued" && new Date() <= this.validUntil;
});

// Pre-save middleware to generate barcode
admitCardSchema.pre("save", function (next) {
  if (this.isNew && !this.barcode) {
    this.barcode = `AC${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;
  }
  next();
});

// Method to increment download count
admitCardSchema.methods.recordDownload = async function () {
  this.downloadCount += 1;
  this.lastDownloaded = new Date();
  await this.save();
};

// Static method to get admit cards for a semester
admitCardSchema.statics.getAdmitCardsForSemester = function (
  semester,
  academicYear,
  examType
) {
  return this.find({
    semester,
    academicYear,
    examType,
    status: "issued",
  })
    .populate("student", "studentId user")
    .populate("student.user", "name email")
    .populate("examSchedule.course", "courseCode title");
};

module.exports = mongoose.model("AdmitCard", admitCardSchema);
