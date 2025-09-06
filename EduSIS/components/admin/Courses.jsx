import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useUser } from "../../contexts/UserContext";
import ApiService from "../../services/ApiService";

export default function Courses() {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    courseCode: "",
    title: "",
    description: "",
    credits: "",
    department: "",
    courseType: "Core",
  });

  const resetForm = () => {
    setFormData({
      courseCode: "",
      title: "",
      description: "",
      credits: "",
      department: "",
      courseType: "Core",
    });
  };

  const handleAddCourse = async () => {
    if (!user || !user.id) {
      Alert.alert("Error", "User not authenticated. Please login again.");
      return;
    }

    if (
      !formData.courseCode ||
      !formData.title ||
      !formData.credits ||
      !formData.department
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (
      isNaN(formData.credits) ||
      parseInt(formData.credits) < 1 ||
      parseInt(formData.credits) > 10
    ) {
      Alert.alert("Error", "Credits must be a number between 1 and 10");
      return;
    }

    setLoading(true);
    try {
      const courseData = {
        courseCode: formData.courseCode.toUpperCase(),
        title: formData.title,
        description: formData.description,
        credits: parseInt(formData.credits),
        department: formData.department,
        courseType: formData.courseType,
      };

      const response = await ApiService.addCourse(user.id, courseData);

      if (response.success) {
        Alert.alert("Success", "Course added successfully");
        setShowAddModal(false);
        resetForm();
        // Here you would typically refresh the courses list
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  // Demo data
  const courses = [
    {
      id: "CSE301",
      title: "Computer Networks",
      department: "CSE",
      credit: 3,
      semester: "4th",
      teacher: "Dr. Sarah Johnson",
      students: 45,
    },
    {
      id: "CSE205",
      title: "Database Systems",
      department: "CSE",
      credit: 3,
      semester: "3rd",
      teacher: "Prof. Michael Chen",
      students: 40,
    },
    {
      id: "EEE201",
      title: "Digital Electronics",
      department: "EEE",
      credit: 4,
      semester: "3rd",
      teacher: "Dr. Emily Brown",
      students: 38,
    },
  ];

  const CourseCard = ({ course, index }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100)}
      style={[styles.card, { backgroundColor: colors.cardBg }]}
    >
      <LinearGradient
        colors={["#fa709a", "#fee140"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBanner}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.courseId}>{course.id}</Text>
          <View style={styles.creditContainer}>
            <Text style={styles.creditText}>{course.credit} Credits</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={[styles.courseTitle, { color: colors.text }]}>
            {course.title}
          </Text>
          <TouchableOpacity style={styles.moreButton}>
            <MaterialIcons name="more-vert" size={24} color={colors.textDim} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialIcons name="business" size={20} color={colors.textDim} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {course.department}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="schedule" size={20} color={colors.textDim} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {course.semester} Semester
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="school" size={20} color={colors.textDim} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {course.teacher}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="groups" size={20} color={colors.textDim} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {course.students} Students
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? "#2d3748" : "#e2e8f0" },
            ]}
          >
            <MaterialIcons name="edit" size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? "#2d3748" : "#e2e8f0" },
            ]}
          >
            <MaterialIcons name="people" size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Enrollment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Animated.View
        entering={FadeInDown.delay(100)}
        style={[styles.searchContainer, { backgroundColor: colors.cardBg }]}
      >
        <MaterialIcons name="search" size={24} color={colors.textDim} />
        <TextInput
          placeholder="Search courses..."
          placeholderTextColor={colors.textDim}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <LinearGradient
            colors={["#fa709a", "#fee140"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.content}>
        {courses.map((course, index) => (
          <CourseCard key={course.id} course={course} index={index} />
        ))}
      </ScrollView>

      {/* Add Course Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add New Course
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Course Information Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Course Information
              </Text>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Course Code *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBg,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="e.g., CSE-301"
                    placeholderTextColor={colors.textDim}
                    value={formData.courseCode}
                    onChangeText={(text) =>
                      setFormData({ ...formData, courseCode: text })
                    }
                    autoCapitalize="characters"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Credits *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBg,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="e.g., 3"
                    placeholderTextColor={colors.textDim}
                    value={formData.credits}
                    onChangeText={(text) =>
                      setFormData({ ...formData, credits: text })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Course Title *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.cardBg,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="e.g., Computer Networks"
                  placeholderTextColor={colors.textDim}
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData({ ...formData, title: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Description
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.cardBg,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Enter course description..."
                  placeholderTextColor={colors.textDim}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Department *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBg,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="e.g., CSE"
                    placeholderTextColor={colors.textDim}
                    value={formData.department}
                    onChangeText={(text) =>
                      setFormData({ ...formData, department: text })
                    }
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Course Type
                  </Text>
                  <View
                    style={[
                      styles.pickerContainer,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.picker}
                      onPress={() => {
                        const types = [
                          "Core",
                          "Elective",
                          "Lab",
                          "Project",
                          "Thesis",
                        ];
                        Alert.alert(
                          "Select Course Type",
                          "",
                          types
                            .map((type) => ({
                              text: type,
                              onPress: () =>
                                setFormData({ ...formData, courseType: type }),
                            }))
                            .concat([{ text: "Cancel", style: "cancel" }])
                        );
                      }}
                    >
                      <Text style={[styles.pickerText, { color: colors.text }]}>
                        {formData.courseType}
                      </Text>
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={24}
                        color={colors.textDim}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleAddCourse}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#fa709a", "#fee140"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? "Adding..." : "Add Course"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  addButton: {
    marginLeft: 12,
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "hidden",
  },
  cardBanner: {
    padding: 16,
  },
  bannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseId: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  creditContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creditText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  moreButton: {
    padding: 8,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statText: {
    marginLeft: 8,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: "center",
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingBottom: 40,
  },
  cancelButton: {
    flex: 0.48,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 0.48,
  },
  submitButtonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
