// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import classRoutes from "./routes/class.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes); 
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/classes", classRoutes);
//app.use("/api/courses/:course_id/messages", messageRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/calendar", calendarRoutes);

export default app;
