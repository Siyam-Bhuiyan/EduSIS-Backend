require("dotenv").config();
const mongoose = require("mongoose");

// Import models
const User = require("./models/User");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
const Course = require("./models/Course");
const CourseSection = require("./models/CourseSection");
const Enrollment = require("./models/Enrollment");
const Assignment = require("./models/Assignment");
const Event = require("./models/Event");

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const addSampleData = async () => {
  try {
    await connectDB();

    // Student ID from the registration logs
    const studentUserId = "68bc2835f89597ea6023cb96";

    console.log("Adding sample data for student:", studentUserId);

    // 1. Create Student profile
    const studentProfile = await Student.findOneAndUpdate(
      { user: studentUserId },
      {
        user: studentUserId,
        studentId: "IUT-STU-2025-001",
        department: "Computer Science",
        semester: "Spring 2025",
        cgpa: 3.75,
        enrollmentDate: new Date("2025-01-15"),
        status: "active",
      },
      { upsert: true, new: true }
    );
    console.log("✅ Student profile created:", studentProfile);

    // 2. Create some teachers first (check if they exist)
    let teacher1User = await User.findOne({ email: "ashraful@iut-dhaka.edu" });
    if (!teacher1User) {
      teacher1User = new User({
        name: "Dr. Ashraful Alam Khan",
        email: "ashraful@iut-dhaka.edu",
        password: "Teacher123",
        role: "teacher",
      });
      await teacher1User.save();
    }

    let teacher1 = await Teacher.findOne({ user: teacher1User._id });
    if (!teacher1) {
      teacher1 = new Teacher({
        user: teacher1User._id,
        teacherId: "IUT-TCH-001",
        department: "Computer Science",
        designation: "Associate Professor",
        officeLocation: "Room 301",
        phoneNumber: "+8801234567890",
      });
      await teacher1.save();
    }

    let teacher2User = await User.findOne({ email: "ridwan@iut-dhaka.edu" });
    if (!teacher2User) {
      teacher2User = new User({
        name: "Dr. Ridwan Kabir",
        email: "ridwan@iut-dhaka.edu",
        password: "Teacher123",
        role: "teacher",
      });
      await teacher2User.save();
    }

    let teacher2 = await Teacher.findOne({ user: teacher2User._id });
    if (!teacher2) {
      teacher2 = new Teacher({
        user: teacher2User._id,
        teacherId: "IUT-TCH-002",
        department: "Computer Science",
        designation: "Assistant Professor",
        officeLocation: "Room 302",
        phoneNumber: "+8801234567891",
      });
      await teacher2.save();
    }

    console.log("✅ Teachers created");

    // 3. Create Courses (check if they exist)
    let course1 = await Course.findOne({ courseCode: "CSE-301" });
    if (!course1) {
      course1 = new Course({
        title: "Computer Networks",
        courseCode: "CSE-301",
        description:
          "Introduction to computer networking concepts, protocols, and architectures.",
        credits: 3,
        department: "Computer Science",
        prerequisite: "CSE-201",
      });
      await course1.save();
    }

    let course2 = await Course.findOne({ courseCode: "CSE-205" });
    if (!course2) {
      course2 = new Course({
        title: "Database Systems",
        courseCode: "CSE-205",
        description:
          "Database design, implementation, and management using SQL and NoSQL databases.",
        credits: 3,
        department: "Computer Science",
        prerequisite: "CSE-102",
      });
      await course2.save();
    }

    let course3 = await Course.findOne({ courseCode: "CSE-401" });
    if (!course3) {
      course3 = new Course({
        title: "Software Engineering",
        courseCode: "CSE-401",
        description:
          "Software development lifecycle, project management, and best practices.",
        credits: 3,
        department: "Computer Science",
        prerequisite: "CSE-301",
      });
      await course3.save();
    }

    console.log("✅ Courses created");

    // 4. Create/Find Sections
    let section1 = await CourseSection.findOne({
      course: course1._id,
      section: "Section A",
      semester: "Spring 2025",
      academicYear: "2025",
    });

    if (!section1) {
      section1 = new CourseSection({
        course: course1._id,
        teacher: teacher1._id,
        section: "Section A",
        semester: "Spring 2025",
        academicYear: "2025",
        maxStudents: 40,
        currentEnrollment: 1,
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-05-15"),
        schedule: [
          {
            day: "Monday",
            startTime: "10:00",
            endTime: "11:30",
            room: "Lab 201",
            type: "Lecture",
          },
          {
            day: "Wednesday",
            startTime: "10:00",
            endTime: "11:30",
            room: "Lab 201",
            type: "Lab",
          },
        ],
      });
      await section1.save();
    }

    let section2 = await CourseSection.findOne({
      course: course2._id,
      section: "Section B",
      semester: "Spring 2025",
      academicYear: "2025",
    });

    if (!section2) {
      section2 = new CourseSection({
        course: course2._id,
        teacher: teacher2._id,
        section: "Section B",
        semester: "Spring 2025",
        academicYear: "2025",
        maxStudents: 35,
        currentEnrollment: 1,
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-05-15"),
        schedule: [
          {
            day: "Tuesday",
            startTime: "14:00",
            endTime: "15:30",
            room: "Room 105",
            type: "Lecture",
          },
          {
            day: "Thursday",
            startTime: "14:00",
            endTime: "15:30",
            room: "Room 105",
            type: "Tutorial",
          },
        ],
      });
      await section2.save();
    }

    let section3 = await CourseSection.findOne({
      course: course3._id,
      section: "Section A",
      semester: "Spring 2025",
      academicYear: "2025",
    });

    if (!section3) {
      section3 = new CourseSection({
        course: course3._id,
        teacher: teacher1._id,
        section: "Section A",
        semester: "Spring 2025",
        academicYear: "2025",
        maxStudents: 30,
        currentEnrollment: 1,
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-05-15"),
        schedule: [
          {
            day: "Friday",
            startTime: "09:00",
            endTime: "12:00",
            room: "Lab 301",
            type: "Lab",
          },
        ],
      });
      await section3.save();
    }

    console.log("✅ Sections created");

    // 5. Create Enrollments (check if they exist)
    let enrollment1 = await Enrollment.findOne({
      student: studentProfile._id,
      section: section1._id,
    });

    if (!enrollment1) {
      enrollment1 = new Enrollment({
        student: studentProfile._id,
        section: section1._id,
        enrollmentDate: new Date("2025-01-20"),
        status: "enrolled",
        // Don't set grade - let it use the default
      });
      await enrollment1.save();
    }

    let enrollment2 = await Enrollment.findOne({
      student: studentProfile._id,
      section: section2._id,
    });

    if (!enrollment2) {
      enrollment2 = new Enrollment({
        student: studentProfile._id,
        section: section2._id,
        enrollmentDate: new Date("2025-01-20"),
        status: "enrolled",
      });
      await enrollment2.save();
    }

    let enrollment3 = await Enrollment.findOne({
      student: studentProfile._id,
      section: section3._id,
    });

    if (!enrollment3) {
      enrollment3 = new Enrollment({
        student: studentProfile._id,
        section: section3._id,
        enrollmentDate: new Date("2025-01-20"),
        status: "enrolled",
      });
      await enrollment3.save();
    }

    console.log("✅ Enrollments created");

    // 6. Create some Assignments
    const assignment1 = new Assignment({
      title: "Network Protocol Analysis",
      description: "Analyze TCP/IP protocol stack and write a detailed report.",
      section: section1._id,
      teacher: teacher1._id,
      dueDate: new Date("2025-09-15"),
      totalMarks: 100,
      type: "project",
      status: "published",
    });
    await assignment1.save();

    const assignment2 = new Assignment({
      title: "Database Design Project",
      description: "Design and implement a database for an e-commerce system.",
      section: section2._id,
      teacher: teacher2._id,
      dueDate: new Date("2025-09-20"),
      totalMarks: 100,
      type: "project",
      status: "published",
    });
    await assignment2.save();

    console.log("✅ Assignments created");

    // 7. Create some Events
    const event1 = new Event({
      title: "Computer Networks Midterm Exam",
      description: "Midterm examination for CSE-301",
      type: "exam",
      startDate: new Date("2025-09-25T09:00:00"),
      endDate: new Date("2025-09-25T12:00:00"),
      location: "Exam Hall A",
      createdBy: teacher1User._id,
      organizer: teacher1User._id,
      participants: [studentUserId],
      isPublic: false,
    });
    await event1.save();

    const event2 = new Event({
      title: "Database Systems Workshop",
      description: "Hands-on workshop on MongoDB and PostgreSQL",
      type: "workshop",
      startDate: new Date("2025-09-12T14:00:00"),
      endDate: new Date("2025-09-12T17:00:00"),
      location: "Computer Lab 2",
      createdBy: teacher2User._id,
      organizer: teacher2User._id,
      participants: [studentUserId],
      isPublic: true,
    });
    await event2.save();

    console.log("✅ Events created");

    console.log("\n🎉 Sample data added successfully!");
    console.log("📊 Summary:");
    console.log("- Student profile: Created with ID IUT-STU-2025-001");
    console.log("- Teachers: 2 created");
    console.log("- Courses: 3 created (CSE-301, CSE-205, CSE-401)");
    console.log("- Sections: 3 created");
    console.log("- Enrollments: 3 created for the student");
    console.log("- Assignments: 2 created");
    console.log("- Events: 2 created");
    console.log("\n✅ Student dashboard should now work!");
  } catch (error) {
    console.error("❌ Error adding sample data:", error);
  } finally {
    process.exit(0);
  }
};

addSampleData();
