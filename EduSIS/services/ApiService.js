import { Platform } from "react-native";

// API configuration and base URL
const getApiBaseUrl = () => {
  // Use React Native Platform API for reliable detection
  if (Platform.OS === "web") {
    // Web environment - use localhost
    console.log("Detected Web environment via Platform.OS");
    return "http://localhost:5000/api";
  } else {
    // React Native environment (iOS/Android) - use network IP
    console.log(
      "Detected React Native environment via Platform.OS:",
      Platform.OS
    );
    return "http://192.168.31.91:5000/api";
  }
};

const API_BASE_URL = getApiBaseUrl();

// Debug log to see which URL is being used
console.log("API_BASE_URL configured as:", API_BASE_URL);

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    console.log("Making API request to:", url);
    console.log("Config:", config);

    try {
      const response = await fetch(url, config);
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Network request failed. Please check if the server is running."
        );
      }
      throw error;
    }
  }

  // Authentication APIs
  static async login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Protected API calls with user-id header
  static async protectedRequest(endpoint, userId, options = {}) {
    console.log("Protected request called:", { endpoint, userId, options });
    return this.request(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json", // Base content type
        "user-id": userId,
        ...options.headers, // Allow overriding if needed
      },
    });
  }

  // Student APIs
  static async getStudentDashboard(userId) {
    return this.protectedRequest("/students/dashboard", userId);
  }

  static async getStudentProfile(userId) {
    return this.protectedRequest("/students/profile", userId);
  }

  static async getStudentCourses(userId) {
    return this.protectedRequest("/students/courses", userId);
  }

  static async getStudentAssignments(userId) {
    return this.protectedRequest("/students/assignments", userId);
  }

  // Student Grade APIs
  static async getStudentGrades(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/students/grades${queryString ? `?${queryString}` : ""}`;
    return this.protectedRequest(endpoint, userId);
  }

  // Teacher APIs
  static async getTeacherDashboard(userId) {
    return this.protectedRequest("/teachers/dashboard", userId);
  }

  static async getTeacherCourses(userId) {
    return this.protectedRequest("/teachers/courses", userId);
  }

  // Teacher Grade APIs
  static async getTeacherGrades(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/teachers/grades${queryString ? `?${queryString}` : ""}`;
    return this.protectedRequest(endpoint, userId);
  }

  static async getCourseGrades(userId, courseId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/teachers/grades/${courseId}${
      queryString ? `?${queryString}` : ""
    }`;
    return this.protectedRequest(endpoint, userId);
  }

  static async createOrUpdateGrade(userId, gradeData) {
    return this.protectedRequest("/teachers/grades", userId, {
      method: "POST",
      body: JSON.stringify(gradeData),
    });
  }

  static async updateGrade(userId, gradeId, gradeData) {
    return this.protectedRequest(`/teachers/grades/${gradeId}`, userId, {
      method: "PUT",
      body: JSON.stringify(gradeData),
    });
  }

  // Admin APIs
  static async getAdminDashboard(userId) {
    return this.protectedRequest("/admin/dashboard", userId);
  }

  static async getStudents(userId) {
    return this.protectedRequest("/admin/students", userId);
  }

  static async getTeachers(userId) {
    return this.protectedRequest("/admin/teachers", userId);
  }

  static async getCourses(userId) {
    return this.protectedRequest("/admin/courses", userId);
  }

  // Admin POST APIs
  static async addStudent(userId, studentData) {
    return this.protectedRequest("/admin/students", userId, {
      method: "POST",
      body: JSON.stringify(studentData),
    });
  }

  static async addTeacher(userId, teacherData) {
    console.log("API Service - addTeacher called with:", {
      userId,
      teacherData,
    });
    return this.protectedRequest("/admin/teachers", userId, {
      method: "POST",
      body: JSON.stringify(teacherData),
    });
  }

  static async addCourse(userId, courseData) {
    return this.protectedRequest("/admin/courses", userId, {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  }

  // Create teacher profile for admin
  static async createAdminTeacherProfile(userId, teacherData = {}) {
    return this.protectedRequest("/admin/create-teacher-profile", userId, {
      method: "POST",
      body: JSON.stringify(teacherData),
    });
  }

  // Assign all courses to teacher
  static async assignAllCoursesToTeacher(userId, teacherId) {
    return this.protectedRequest(
      `/admin/assign-all-courses/${teacherId}`,
      userId,
      {
        method: "POST",
      }
    );
  }

  // Messages
  static async getMessages(userId) {
    return this.protectedRequest("/messages", userId);
  }

  static async sendMessage(userId, messageData) {
    return this.protectedRequest("/messages", userId, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  }

  // Events
  static async getEvents(userId) {
    return this.protectedRequest("/events", userId);
  }
}

export default ApiService;
