const { asyncHandler } = require("../middleware/error");
const Event = require("../models/Event");
const User = require("../models/User");

// @desc    Get events
// @route   GET /api/events
// @access  Private
exports.getEvents = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {};

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date();
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    query = {
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
      ],
    };
  }

  // Other filters
  if (req.query.eventType) query.eventType = req.query.eventType;
  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.targetAudience) query.targetAudience = req.query.targetAudience;
  if (req.query.department) query.department = req.query.department;

  // Visibility filter based on user role
  if (req.user.role !== "admin") {
    query.$and = [
      query.$and || {},
      {
        $or: [
          { isPublic: true },
          { organizer: req.user._id },
          { createdBy: req.user._id },
          { targetAudience: "all" },
          {
            targetAudience:
              req.user.role === "student" ? "students" : "teachers",
          },
        ],
      },
    ];
  }

  const events = await Event.find(query)
    .populate("organizer", "name email")
    .populate("createdBy", "name email")
    .populate("section", "section semester course")
    .populate("section.course", "courseCode title")
    .sort({ startDate: 1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Event.countDocuments(query);

  res.status(200).json({
    success: true,
    count: events.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: events,
  });
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate("organizer", "name email")
    .populate("createdBy", "name email")
    .populate("section", "section semester course")
    .populate("section.course", "courseCode title");

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  // Check visibility permissions
  if (!event.isPublic && req.user.role !== "admin") {
    const hasAccess =
      event.organizer._id.toString() === req.user._id.toString() ||
      event.createdBy._id.toString() === req.user._id.toString() ||
      event.targetAudience === "all" ||
      event.targetAudience ===
        (req.user.role === "student" ? "students" : "teachers");

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this event",
      });
    }
  }

  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc    Create event
// @route   POST /api/events
// @access  Private
exports.createEvent = asyncHandler(async (req, res, next) => {
  const eventData = {
    ...req.body,
    organizer: req.user._id,
    createdBy: req.user._id,
  };

  // Handle file attachments
  if (req.files && req.files.length > 0) {
    eventData.attachments = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
    }));
  }

  const event = await Event.create(eventData);

  const populatedEvent = await Event.findById(event._id)
    .populate("organizer", "name email")
    .populate("createdBy", "name email")
    .populate("section", "section semester course");

  res.status(201).json({
    success: true,
    data: populatedEvent,
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  // Check if user is authorized to update
  if (
    event.organizer.toString() !== req.user._id.toString() &&
    event.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this event",
    });
  }

  // Handle file attachments
  if (req.files && req.files.length > 0) {
    const newAttachments = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
    }));

    req.body.attachments = [...(event.attachments || []), ...newAttachments];
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("organizer", "name email")
    .populate("createdBy", "name email")
    .populate("section", "section semester course");

  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  // Check if user is authorized to delete
  if (
    event.organizer.toString() !== req.user._id.toString() &&
    event.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this event",
    });
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});

// @desc    Get calendar view events
// @route   GET /api/events/calendar
// @access  Private
exports.getCalendarEvents = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Start date and end date are required",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Build visibility filter
  let visibilityFilter = {};
  if (req.user.role !== "admin") {
    visibilityFilter = {
      $or: [
        { isPublic: true },
        { organizer: req.user._id },
        { createdBy: req.user._id },
        { targetAudience: "all" },
        {
          targetAudience: req.user.role === "student" ? "students" : "teachers",
        },
      ],
    };
  }

  const events = await Event.getEventsInRange(start, end, visibilityFilter);

  // Transform events for calendar view
  const calendarEvents = events.map((event) => ({
    id: event._id,
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    allDay: event.isAllDay,
    color: getEventColor(event.eventType, event.priority),
    extendedProps: {
      description: event.description,
      eventType: event.eventType,
      priority: event.priority,
      status: event.status,
      location: event.location,
      organizer: event.organizer?.name,
    },
  }));

  res.status(200).json({
    success: true,
    data: calendarEvents,
  });
});

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
exports.getUpcomingEvents = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const days = parseInt(req.query.days, 10) || 7;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  // Build visibility filter
  let visibilityFilter = {};
  if (req.user.role !== "admin") {
    visibilityFilter = {
      $or: [
        { isPublic: true },
        { organizer: req.user._id },
        { createdBy: req.user._id },
        { targetAudience: "all" },
        {
          targetAudience: req.user.role === "student" ? "students" : "teachers",
        },
      ],
    };
  }

  const events = await Event.find({
    startDate: { $gte: startDate, $lte: endDate },
    status: { $in: ["scheduled", "ongoing"] },
    ...visibilityFilter,
  })
    .populate("organizer", "name email")
    .populate("section", "section course")
    .populate("section.course", "courseCode title")
    .sort({ startDate: 1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    data: events,
  });
});

// Helper function to get event color based on type and priority
const getEventColor = (eventType, priority) => {
  const colors = {
    academic: "#3174ad",
    cultural: "#e91e63",
    sports: "#4caf50",
    workshop: "#ff9800",
    seminar: "#9c27b0",
    exam: "#f44336",
    holiday: "#00bcd4",
    meeting: "#795548",
    other: "#607d8b",
  };

  let color = colors[eventType] || colors.other;

  // Adjust for priority
  if (priority === "high") {
    color = "#f44336"; // Red for high priority
  } else if (priority === "urgent") {
    color = "#d32f2f"; // Dark red for urgent
  }

  return color;
};
