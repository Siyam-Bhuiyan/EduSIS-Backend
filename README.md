# EduSIS Backend

Educational Student Information System (EduSIS) Backend API built with Node.js, Express.js, mongodb
## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Setup](#project-setup)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [File Storage](#file-storage)

## Tech Stack

- Node.js
- Express.js
- mongodb
- Multer for File Upload


## Project Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev

# Start production server
npm start
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Students Table

```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  student_id VARCHAR(20) UNIQUE NOT NULL,
  department VARCHAR(100),
  batch VARCHAR(50),
  semester VARCHAR(50),
  section VARCHAR(10)
);
```

### Teachers Table

```sql
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  teacher_id VARCHAR(20) UNIQUE NOT NULL,
  department VARCHAR(100),
  designation VARCHAR(100),
  specialization TEXT[]
);
```

### Courses Table

```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  credits INTEGER,
  department VARCHAR(100)
);
```

### Course_Sections Table

```sql
CREATE TABLE course_sections (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  teacher_id INTEGER REFERENCES teachers(id),
  section VARCHAR(10),
  semester VARCHAR(50),
  max_students INTEGER,
  schedule JSON
);
```

### Enrollments Table

```sql
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  section_id INTEGER REFERENCES course_sections(id),
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Assignments Table

```sql
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES course_sections(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  total_marks INTEGER,
  file_url VARCHAR(255)
);
```

### Assignment_Submissions Table

```sql
CREATE TABLE assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id),
  student_id INTEGER REFERENCES students(id),
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_url VARCHAR(255),
  marks INTEGER,
  feedback TEXT
);
```

### Results Table

```sql
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  section_id INTEGER REFERENCES course_sections(id),
  marks JSON,
  grade VARCHAR(2),
  semester VARCHAR(50)
);
```

### Admit_Cards Table

```sql
CREATE TABLE admit_cards (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  exam_type VARCHAR(50),
  semester VARCHAR(50),
  issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20)
);
```

### Messages Table

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  content TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);
```

### Events Table

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  section_id INTEGER REFERENCES course_sections(id)
);
```

## API Endpoints

### Authentication

- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update user profile

### Admin Routes

- GET /api/admin/students - List all students
- POST /api/admin/students - Add new student
- GET /api/admin/teachers - List all teachers
- POST /api/admin/teachers - Add new teacher
- GET /api/admin/courses - List all courses
- POST /api/admin/courses - Add new course
- POST /api/admin/enrollments - Enroll students in courses
- POST /api/admin/teacher-assignments - Assign teachers to courses
- GET /api/admin/admit-cards - List all admit cards
- POST /api/admin/admit-cards - Generate admit cards

### Student Routes

- GET /api/students/courses - Get enrolled courses
- GET /api/students/assignments - Get assignments
- POST /api/students/assignments/:id/submit - Submit assignment
- GET /api/students/results - Get results
- GET /api/students/admit-cards - Get admit cards
- GET /api/students/calendar - Get calendar events
- GET /api/students/messages - Get messages

### Teacher Routes

- GET /api/teachers/courses - Get assigned courses
- POST /api/teachers/announcements - Create announcement
- GET /api/teachers/assignments - Get course assignments
- POST /api/teachers/assignments - Create assignment
- PUT /api/teachers/assignments/:id/grade - Grade assignment
- GET /api/teachers/students/:courseId - Get course students
- POST /api/teachers/online-classes - Schedule online class
- GET /api/teachers/calendar - Get calendar events

### Messages

- GET /api/messages - Get user messages
- POST /api/messages - Send message
- PUT /api/messages/:id/read - Mark message as read

### Events

- GET /api/events - Get events
- POST /api/events - Create event
- PUT /api/events/:id - Update event
- DELETE /api/events/:id - Delete event



## File Storage

For handling file uploads (assignments, profile pictures, etc.):

1. Use Multer middleware for file upload handling

3. Store file URLs in database
4. Implement file type and size validation
5. Generate signed URLs for secure file access

---

i will save data in mongodb
