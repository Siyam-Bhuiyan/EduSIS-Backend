import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../theme/ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "../../contexts/UserContext";
import ApiService from "../../services/ApiService";

export default function AssignGrades() {
  const { colors } = useTheme();
  const { user } = useUser();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState({
    quiz1_marks: "",
    quiz2_marks: "",
    quiz3_marks: "",
    assignments_marks: "",
    attendance_marks: "",
    mid_sem_marks: "",
    final_sem_marks: "",
  });

  // Current semester/year - you might want to make this configurable
  const currentSemester = "Fall 2024";
  const currentAcademicYear = "2024-2025";

  // Demo data
  const DEMO_COURSES = [
    {
      _id: "demo-course-1",
      courseCode: "CSE-301",
      title: "Computer Networks",
      description: "Introduction to computer networking concepts",
      credits: 3,
      department: "Computer Science",
    },
    {
      _id: "demo-course-2",
      courseCode: "CSE-205",
      title: "Database Systems",
      description: "Database design and management",
      credits: 3,
      department: "Computer Science",
    },
    {
      _id: "demo-course-3",
      courseCode: "CSE-401",
      title: "Software Engineering",
      description: "Software development methodologies",
      credits: 3,
      department: "Computer Science",
    },
  ];

  const DEMO_STUDENTS = [
    {
      _id: "demo-student-1",
      studentId: "CSE-2021-001",
      user: { _id: "user-1", name: "John Doe", email: "john.doe@email.com" },
      department: "Computer Science",
    },
    {
      _id: "demo-student-2",
      studentId: "CSE-2021-002",
      user: {
        _id: "user-2",
        name: "Jane Smith",
        email: "jane.smith@email.com",
      },
      department: "Computer Science",
    },
    {
      _id: "demo-student-3",
      studentId: "CSE-2021-003",
      user: {
        _id: "user-3",
        name: "Mike Johnson",
        email: "mike.johnson@email.com",
      },
      department: "Computer Science",
    },
    {
      _id: "demo-student-4",
      studentId: "CSE-2021-004",
      user: {
        _id: "user-4",
        name: "Sarah Wilson",
        email: "sarah.wilson@email.com",
      },
      department: "Computer Science",
    },
    {
      _id: "demo-student-5",
      studentId: "CSE-2021-005",
      user: {
        _id: "user-5",
        name: "David Brown",
        email: "david.brown@email.com",
      },
      department: "Computer Science",
    },
  ];

  useEffect(() => {
    if (user && user.id) {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
      // Reset student selection when course changes
      setSelectedStudent("");
      resetGrades();
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedStudent && selectedCourse) {
      fetchExistingGrade();
    }
  }, [selectedStudent, selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await ApiService.getTeacherCourses(user.id);
      if (response.success && response.data && response.data.length > 0) {
        // Use real data if available
        setCourses(response.data);
      } else {
        // Fallback to demo data
        setCourses(DEMO_COURSES);
      }
    } catch (error) {
      console.log("Using demo courses due to API error:", error.message);
      // Always fallback to demo data instead of showing alerts
      setCourses(DEMO_COURSES);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await ApiService.getStudents(user.id);
      if (response.success && response.data && response.data.length > 0) {
        // Use real data if available
        setStudents(response.data);
      } else {
        // Fallback to demo data
        setStudents(DEMO_STUDENTS);
      }
    } catch (error) {
      console.log("Using demo students due to API error:", error.message);
      // Always fallback to demo data instead of showing alerts
      setStudents(DEMO_STUDENTS);
    }
  };

  const fetchExistingGrade = async () => {
    try {
      const params = {
        courseId: selectedCourse,
        semester: currentSemester,
        academicYear: currentAcademicYear,
      };

      const response = await ApiService.getCourseGrades(
        user.id,
        selectedCourse,
        params
      );
      if (response.success && response.data) {
        const existingGrade = response.data.find(
          (grade) => grade.student._id === selectedStudent
        );

        if (existingGrade) {
          setGrades({
            quiz1_marks: existingGrade.quiz1_marks?.toString() || "",
            quiz2_marks: existingGrade.quiz2_marks?.toString() || "",
            quiz3_marks: existingGrade.quiz3_marks?.toString() || "",
            assignments_marks:
              existingGrade.assignments_marks?.toString() || "",
            attendance_marks: existingGrade.attendance_marks?.toString() || "",
            mid_sem_marks: existingGrade.mid_sem_marks?.toString() || "",
            final_sem_marks: existingGrade.final_sem_marks?.toString() || "",
          });
        } else {
          resetGrades();
        }
      }
    } catch (error) {
      console.log("No existing grade found, using empty form:", error.message);
      resetGrades();
    }
  };

  const resetGrades = () => {
    setGrades({
      quiz1_marks: "",
      quiz2_marks: "",
      quiz3_marks: "",
      assignments_marks: "",
      attendance_marks: "",
      mid_sem_marks: "",
      final_sem_marks: "",
    });
  };

  const handleGradeChange = (field, value) => {
    // Validate numeric input
    if (value === "" || /^\d+$/.test(value)) {
      setGrades((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const calculateTotal = () => {
    const values = Object.values(grades).map((v) => Number(v) || 0);
    return values.reduce((a, b) => a + b, 0);
  };

  const calculateGrade = (total) => {
    // Based on 130 total marks (10+10+10+20+10+30+40)
    const percentage = (total / 130) * 100;

    if (percentage >= 90) return "A+";
    if (percentage >= 85) return "A";
    if (percentage >= 80) return "A-";
    if (percentage >= 75) return "B+";
    if (percentage >= 70) return "B";
    if (percentage >= 65) return "B-";
    if (percentage >= 60) return "C+";
    if (percentage >= 55) return "C";
    if (percentage >= 50) return "C-";
    if (percentage >= 45) return "D+";
    if (percentage >= 40) return "D";
    return "F";
  };

  const handleSubmitGrades = async () => {
    if (!selectedCourse || !selectedStudent) {
      console.log("Please select both course and student");
      return;
    }

    setLoading(true);
    try {
      const gradeData = {
        studentId: selectedStudent,
        courseId: selectedCourse,
        semester: currentSemester,
        academicYear: currentAcademicYear,
        quiz1_marks: Number(grades.quiz1_marks) || 0,
        quiz2_marks: Number(grades.quiz2_marks) || 0,
        quiz3_marks: Number(grades.quiz3_marks) || 0,
        assignments_marks: Number(grades.assignments_marks) || 0,
        attendance_marks: Number(grades.attendance_marks) || 0,
        mid_sem_marks: Number(grades.mid_sem_marks) || 0,
        final_sem_marks: Number(grades.final_sem_marks) || 0,
      };

      const response = await ApiService.createOrUpdateGrade(user.id, gradeData);

      if (response.success) {
        console.log("Grades saved successfully");
        // Optionally reset the form or provide visual feedback
        resetGrades();
      }
    } catch (error) {
      console.log("Failed to save grades:", error.message);
      // Continue silently without showing alerts
    } finally {
      setLoading(false);
    }
  };

  const renderGradeInput = (label, field, maxValue) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.cardBg,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        value={grades[field]}
        onChangeText={(value) => handleGradeChange(field, value)}
        keyboardType="numeric"
        maxLength={3}
        placeholder="0"
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );

  const selectedCourseData = courses.find((c) => c._id === selectedCourse);
  const selectedStudentData = students.find((s) => s._id === selectedStudent);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={[styles.title, { color: colors.text }]}>Assign Grades</Text>

      {/* Course Selection */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.cardBg, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Select Course
        </Text>
        <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
          <Picker
            selectedValue={selectedCourse}
            onValueChange={setSelectedCourse}
            style={{ color: colors.text }}
            dropdownIconColor={colors.primary}
          >
            <Picker.Item label="-- Choose a Course --" value="" />
            {courses.map((course) => (
              <Picker.Item
                key={course._id}
                label={`${course.courseCode}: ${course.title}`}
                value={course._id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Student Selection */}
      {selectedCourse && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Select Student
          </Text>
          <View
            style={[styles.pickerContainer, { borderColor: colors.border }]}
          >
            <Picker
              selectedValue={selectedStudent}
              onValueChange={setSelectedStudent}
              style={{ color: colors.text }}
              dropdownIconColor={colors.primary}
            >
              <Picker.Item label="-- Choose a Student --" value="" />
              {students.map((student) => (
                <Picker.Item
                  key={student._id}
                  label={`${student.user?.name || "N/A"} (${
                    student.studentId
                  })`}
                  value={student._id}
                />
              ))}
            </Picker>
          </View>
        </View>
      )}

      {/* Grade Inputs */}
      {selectedStudent && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Enter Grades
          </Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            {selectedCourseData?.courseCode} - {selectedStudentData?.user?.name}
          </Text>

          <View style={styles.gradeInputsContainer}>
            {renderGradeInput("Quiz 1 (Max: 10)", "quiz1_marks", 10)}
            {renderGradeInput("Quiz 2 (Max: 10)", "quiz2_marks", 10)}
            {renderGradeInput("Quiz 3 (Max: 10)", "quiz3_marks", 10)}
            {renderGradeInput("Assignments (Max: 20)", "assignments_marks", 20)}
            {renderGradeInput("Attendance (Max: 10)", "attendance_marks", 10)}
            {renderGradeInput("Mid Semester (Max: 30)", "mid_sem_marks", 30)}
            {renderGradeInput(
              "Final Semester (Max: 40)",
              "final_sem_marks",
              40
            )}
          </View>

          <View style={styles.totalContainer}>
            <Text style={[styles.totalText, { color: colors.text }]}>
              Total Marks: {calculateTotal()} / 130
            </Text>
            <Text style={[styles.totalText, { color: colors.text }]}>
              Percentage: {Math.round((calculateTotal() / 130) * 100)}%
            </Text>
            <Text style={[styles.totalText, { color: colors.text }]}>
              Grade: {calculateGrade(calculateTotal())}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: loading ? colors.textDim : colors.primary,
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleSubmitGrades}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Saving..." : "Save Grades"}
            </Text>
            <MaterialIcons
              name={loading ? "hourglass-empty" : "save"}
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
    fontStyle: "italic",
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  gradeInputsContainer: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  input: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: "center",
    fontSize: 16,
  },
  totalContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
