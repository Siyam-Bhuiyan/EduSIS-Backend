const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide event title"],
      trim: true,
      maxlength: [255, "Event title cannot be more than 255 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Event description cannot be more than 1000 characters",
      ],
    },
    eventType: {
      type: String,
      enum: [
        "academic",
        "cultural",
        "sports",
        "workshop",
        "seminar",
        "exam",
        "holiday",
        "meeting",
        "other",
      ],
      default: "academic",
    },
    startDate: {
      type: Date,
      required: [true, "Please provide start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please provide end date"],
    },
    startTime: {
      type: String,
      match: [
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please provide valid time format (HH:MM)",
      ],
    },
    endTime: {
      type: String,
      match: [
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please provide valid time format (HH:MM)",
      ],
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    location: {
      venue: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      room: {
        type: String,
        trim: true,
      },
    },
    organizer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    section: {
      type: mongoose.Schema.ObjectId,
      ref: "CourseSection",
      default: null,
    },
    targetAudience: {
      type: String,
      enum: [
        "all",
        "students",
        "teachers",
        "admins",
        "specific-course",
        "specific-department",
      ],
      default: "all",
    },
    department: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled", "postponed"],
      default: "scheduled",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    maxAttendees: {
      type: Number,
      min: 1,
    },
    currentAttendees: {
      type: Number,
      default: 0,
    },
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    registrationDeadline: {
      type: Date,
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
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    reminders: [
      {
        type: {
          type: String,
          enum: ["email", "push", "sms"],
          default: "email",
        },
        timeBefore: {
          type: Number, // minutes before event
          default: 60,
        },
        sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      pattern: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
      interval: {
        type: Number,
        min: 1,
      },
      endDate: Date,
      daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ eventType: 1, status: 1 });
eventSchema.index({ targetAudience: 1, isPublic: 1 });
eventSchema.index({ section: 1, startDate: 1 });

// Virtual to check if event is happening now
eventSchema.virtual("isOngoing").get(function () {
  const now = new Date();
  return (
    now >= this.startDate && now <= this.endDate && this.status === "ongoing"
  );
});

// Virtual to check if event is in the past
eventSchema.virtual("isPast").get(function () {
  return new Date() > this.endDate;
});

// Virtual to check if registration is open
eventSchema.virtual("isRegistrationOpen").get(function () {
  if (!this.registrationRequired) return false;
  if (!this.registrationDeadline) return true;
  return new Date() < this.registrationDeadline;
});

// Pre-save validation
eventSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
  }

  if (
    this.registrationRequired &&
    this.registrationDeadline &&
    this.registrationDeadline > this.startDate
  ) {
    next(new Error("Registration deadline must be before event start date"));
  }

  // Auto-update status based on dates
  const now = new Date();
  if (this.status === "scheduled") {
    if (now >= this.startDate && now <= this.endDate) {
      this.status = "ongoing";
    } else if (now > this.endDate) {
      this.status = "completed";
    }
  }

  next();
});

// Static method to get events for a specific date range
eventSchema.statics.getEventsInRange = function (
  startDate,
  endDate,
  filters = {}
) {
  const query = {
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
    ],
    ...filters,
  };

  return this.find(query)
    .populate("organizer", "name email")
    .populate("createdBy", "name email")
    .populate("section", "section semester")
    .sort({ startDate: 1 });
};

module.exports = mongoose.model("Event", eventSchema);
