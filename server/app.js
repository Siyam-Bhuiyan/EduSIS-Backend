const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Database connection
const connectDB = require("./db/connection");

// Middleware imports
const { errorHandler, notFound } = require("./middleware/error");

// Route imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const messageRoutes = require("./routes/messageRoutes");
const eventRoutes = require("./routes/eventRoutes");

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:8081", // Expo web
      "exp://localhost:8081", // Expo protocol
      "http://192.168.31.91:8081", // Local network for mobile
      "http://192.168.31.91:5000", // Backend access from same network
      "*", // Allow all origins for development (remove in production)
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "user-id"],
  })
);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduSIS Backend API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/events", eventRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduSIS Backend is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Documentation endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduSIS Backend API v1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "Login user",
        "GET /api/auth/logout": "Logout user",
        "GET /api/auth/profile": "Get user profile",
        "PUT /api/auth/profile": "Update user profile",
        "PUT /api/auth/updatepassword": "Update password",
      },
      admin: {
        "GET /api/admin/dashboard": "Get dashboard stats",
        "GET /api/admin/students": "List all students",
        "POST /api/admin/students": "Add new student",
        "GET /api/admin/teachers": "List all teachers",
        "POST /api/admin/teachers": "Add new teacher",
        "GET /api/admin/courses": "List all courses",
        "POST /api/admin/courses": "Add new course",
        "POST /api/admin/enrollments": "Enroll students in courses",
        "POST /api/admin/teacher-assignments": "Assign teachers to courses",
        "GET /api/admin/admit-cards": "List all admit cards",
        "POST /api/admin/admit-cards": "Generate admit cards",
      },
      students: {
        "GET /api/students/dashboard": "Get student dashboard",
        "GET /api/students/courses": "Get enrolled courses",
        "GET /api/students/assignments": "Get assignments",
        "POST /api/students/assignments/:id/submit": "Submit assignment",
        "GET /api/students/results": "Get results",
        "GET /api/students/admit-cards": "Get admit cards",
        "GET /api/students/calendar": "Get calendar events",
        "GET /api/students/messages": "Get messages",
      },
      teachers: {
        "GET /api/teachers/dashboard": "Get teacher dashboard",
        "GET /api/teachers/courses": "Get assigned courses",
        "POST /api/teachers/announcements": "Create announcement",
        "GET /api/teachers/assignments": "Get course assignments",
        "POST /api/teachers/assignments": "Create assignment",
        "PUT /api/teachers/assignments/:id/grade": "Grade assignment",
        "GET /api/teachers/students/:courseId": "Get course students",
        "POST /api/teachers/online-classes": "Schedule online class",
        "GET /api/teachers/calendar": "Get calendar events",
      },
      messages: {
        "GET /api/messages": "Get user messages",
        "POST /api/messages": "Send message",
        "GET /api/messages/:id": "Get message by ID",
        "PUT /api/messages/:id/read": "Mark message as read",
        "PUT /api/messages/:id/star": "Toggle star on message",
        "PUT /api/messages/:id/archive": "Archive message",
        "DELETE /api/messages/:id": "Delete message",
        "GET /api/messages/conversation/:userId": "Get conversation",
        "GET /api/messages/stats": "Get message statistics",
      },
      events: {
        "GET /api/events": "Get events",
        "POST /api/events": "Create event",
        "GET /api/events/:id": "Get event by ID",
        "PUT /api/events/:id": "Update event",
        "DELETE /api/events/:id": "Delete event",
        "GET /api/events/calendar": "Get calendar view events",
        "GET /api/events/upcoming": "Get upcoming events",
      },
    },
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0"; // Listen on all network interfaces

const server = app.listen(PORT, HOST, () => {
  console.log(`
🚀 EduSIS Backend Server is running!
📡 Environment: ${process.env.NODE_ENV || "development"}
🌐 Port: ${PORT}
🖥️  Host: ${HOST}
📊 Database: Connected to MongoDB
🔐 API Base URL: http://localhost:${PORT}/api
🌍 Network URL: http://192.168.31.91:${PORT}/api
📚 API Documentation: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/health
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  console.log("Shutting down the server due to uncaught exception");
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated");
  });
});

module.exports = app;
