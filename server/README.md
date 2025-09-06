# EduSIS Backend API

A comprehensive Educational Student Information System (EduSIS) backend API built with Node.js, Express.js, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd EduSIS-Backend/server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📁 Project Structure

```
server/
├── controllers/          # Business logic controllers
├── middleware/           # Custom middleware functions
├── models/              # MongoDB/Mongoose models
├── routes/              # API route definitions
├── utils/               # Utility functions
├── uploads/             # File upload storage
├── db/                  # Database connection
├── app.js               # Express app configuration
├── server.js            # Server startup script
└── package.json         # Project dependencies
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **Admin**: Full system access
- **Teacher**: Course management, grading, announcements
- **Student**: View courses, submit assignments, access results

## 📊 API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /updatepassword` - Change password

### Admin Routes (`/api/admin`)

- `GET /dashboard` - Dashboard statistics
- `GET /students` - List all students
- `POST /students` - Add new student
- `GET /teachers` - List all teachers
- `POST /teachers` - Add new teacher
- `GET /courses` - List all courses
- `POST /courses` - Add new course
- `POST /enrollments` - Enroll students
- `POST /teacher-assignments` - Assign teachers
- `GET /admit-cards` - List admit cards
- `POST /admit-cards` - Generate admit cards

### Student Routes (`/api/students`)

- `GET /dashboard` - Student dashboard
- `GET /courses` - Enrolled courses
- `GET /assignments` - View assignments
- `POST /assignments/:id/submit` - Submit assignment
- `GET /results` - View results
- `GET /admit-cards` - View admit cards
- `GET /calendar` - Calendar events
- `GET /messages` - View messages

### Teacher Routes (`/api/teachers`)

- `GET /dashboard` - Teacher dashboard
- `GET /courses` - Assigned courses
- `POST /announcements` - Create announcement
- `GET /assignments` - Course assignments
- `POST /assignments` - Create assignment
- `PUT /assignments/:id/grade` - Grade assignment
- `GET /students/:courseId` - Course students
- `POST /online-classes` - Schedule online class
- `GET /calendar` - Calendar events

### Message Routes (`/api/messages`)

- `GET /` - Get messages
- `POST /` - Send message
- `GET /:id` - Get message by ID
- `PUT /:id/read` - Mark as read
- `PUT /:id/star` - Toggle star
- `PUT /:id/archive` - Archive message
- `DELETE /:id` - Delete message
- `GET /conversation/:userId` - Get conversation
- `GET /stats` - Message statistics

### Event Routes (`/api/events`)

- `GET /` - Get events
- `POST /` - Create event
- `GET /:id` - Get event by ID
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `GET /calendar` - Calendar view
- `GET /upcoming` - Upcoming events

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

### Paginated Response

```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "data": [
    // Array of items
  ]
}
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation
- **File Upload Security**: File type and size validation
- **Password Hashing**: bcrypt password hashing
- **JWT Authentication**: Secure token-based auth

## 📤 File Upload

The API supports file uploads for:

- Profile pictures
- Assignment submissions
- Event attachments
- Message attachments

### Supported File Types

- Images: JPG, PNG, GIF
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Archives: ZIP

### Upload Limits

- Maximum file size: 10MB
- Maximum files per request: 5

## 🗃️ Database Models

### User Model

- Basic user information
- Authentication data
- Role-based access

### Student Model

- Student-specific information
- Academic details
- Enrollment data

### Teacher Model

- Teacher-specific information
- Qualifications
- Experience data

### Course Model

- Course information
- Prerequisites
- Syllabus data

### Assignment Model

- Assignment details
- Due dates
- File attachments

### Result Model

- Exam results
- Grades and GPA
- Academic performance

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_strong_jwt_secret
CLIENT_URL=your_frontend_url
```

### Docker Deployment (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Issues & Support

For bug reports and feature requests, please create an issue in the repository.

---

**EduSIS Backend API v1.0.0** - Built with ❤️ for educational institutions
