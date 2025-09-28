# EduSIS - Education Student Information System (Frontend)

## Overview

EduSIS is a comprehensive education management system built with React Native, providing separate interfaces for administrators, teachers, and students. The application offers a rich set of features to manage academic activities, communications, and administrative tasks.

## Features

### Multi-Role Access

- **Admin Dashboard**: Complete administrative control and management
- **Teacher Dashboard**: Course and student management tools
- **Student Dashboard**: Academic progress and course management

### Admin Features

- **Student Management**: Add, view, and manage student profiles
- **Teacher Management**: Handle teacher assignments and profiles
- **Course Management**: Create and manage course offerings
- **Student Enrollment**: Manage student enrollments in courses
- **Teacher Assignment**: Assign teachers to specific courses
- **Admit Card Management**: Generate and manage student admit cards
- **AI-Powered Admin Assistant**: Get management and system support

### Teacher Features

- **Course Management**:
  - Create and manage course materials
  - Post announcements
  - Manage assignments
  - Track student progress
- **Virtual Classroom**:
  - Conduct online classes via Jitsi integration
  - Real-time video conferencing
  - Screen sharing capabilities
- **Assessment Tools**:
  - Create and grade assignments
  - Manage student grades
  - Track submission status
- **Communication**:
  - Send announcements
  - Message students
  - Manage class discussions
- **Calendar Management**:
  - Schedule classes and events
  - Track important dates
  - Manage academic calendar
- **AI Teaching Assistant**: Get help with teaching and course management

### Student Features

- **Course Access**:
  - View enrolled courses
  - Access course materials
  - Submit assignments
  - Track progress
- **Academic Tools**:
  - View and download admit cards
  - Check examination schedules
  - Access grade reports
  - View academic calendar
- **Communication**:
  - Receive announcements
  - Message teachers
  - Participate in class discussions
- **Calendar Integration**:
  - View upcoming events
  - Track assignment deadlines
  - Monitor exam schedules
- **AI Study Assistant**: Get academic support and guidance

### Common Features

- **Profile Management**: Customize user profiles
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Works on various screen sizes
- **Intuitive Navigation**: Easy-to-use drawer navigation
- **Real-time Updates**: Instant notifications and updates

## Technical Implementation

### Navigation

- Implemented using React Navigation
- Drawer navigation for easy access to features
- Custom AppShell component for consistent layout
- Role-based navigation restrictions

### UI Components

- Custom Sidebar with quick actions
- TopBar for consistent header display
- MaterialIcons integration for visual elements
- Responsive layout components

### State Management

- Context API for user authentication
- Theme provider for appearance customization
- Efficient state management for real-time updates

### Integration

- Jitsi Meet integration for video conferencing
- AI chatbot integration for support
- Calendar integration for event management
- File upload/download capabilities

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- React Native development environment
- Expo CLI

### Installation

1. Clone the repository

```bash
git clone https://github.com/Siyam-Bhuiyan/EduSIS-Backend.git
```

2. Navigate to the EduSIS directory

```bash
cd EduSIS-Backend/EduSIS
```

3. Install dependencies

```bash
npm install
```

4. Start the development server

```bash
npm start
```

### Running the App

- Use Expo Go app on your mobile device
- Use Android/iOS emulator
- Scan QR code from Expo developer tools

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- React Native community
- Expo team
- MaterialIcons
- Jitsi Meet team
