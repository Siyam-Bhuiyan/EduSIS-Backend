import React, { useState, useEffect } from "react";
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

export default function Students() {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // User data
    name: "",
    email: "",
    password: "",
    // Student data
    studentId: "",
    department: "",
    batch: "",
    semester: "",
    section: "",
    rollNumber: "",
    dateOfBirth: "",
    phoneNumber: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      studentId: "",
      department: "",
      batch: "",
      semester: "",
      section: "",
      rollNumber: "",
      dateOfBirth: "",
      phoneNumber: "",
    });
  };

  const handleAddStudent = async () => {
    if (!user || !user.id) {
      Alert.alert("Error", "User not authenticated. Please login again.");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.studentId ||
      !formData.department
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const studentData = {
        userData: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        studentData: {
          studentId: formData.studentId,
          department: formData.department,
          batch: formData.batch,
          semester: formData.semester,
          section: formData.section,
          rollNumber: formData.rollNumber,
          dateOfBirth: formData.dateOfBirth
            ? new Date(formData.dateOfBirth)
            : undefined,
          phoneNumber: formData.phoneNumber,
        },
      };

      const response = await ApiService.addStudent(user.id, studentData);

      if (response.success) {
        Alert.alert("Success", "Student added successfully");
        setShowAddModal(false);
        resetForm();
        // Here you would typically refresh the students list
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  // Demo data
  const students = [
    {
      id: "210041215",
      name: "John Doe",
      department: "CSE",
      semester: "4th",
      cgpa: "3.75",
    },
    {
      id: "210041216",
      name: "Jane Smith",
      department: "EEE",
      semester: "4th",
      cgpa: "3.85",
    },
    {
      id: "210041217",
      name: "Mike Johnson",
      department: "CSE",
      semester: "4th",
      cgpa: "3.90",
    },
    {
      id: "210041218",
      name: "Sarah Williams",
      department: "ME",
      semester: "4th",
      cgpa: "3.70",
    },
    {
      id: "210041219",
      name: "David Brown",
      department: "CSE",
      semester: "4th",
      cgpa: "3.95",
    },
  ];

  const StudentCard = ({ student, index }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100)}
      style={[styles.card, { backgroundColor: colors.cardBg }]}
    >
      <View style={styles.cardHeader}>
        <LinearGradient
          colors={["#4facfe", "#00f2fe"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <MaterialIcons name="person" size={24} color="white" />
        </LinearGradient>
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.text }]}>
            {student.name}
          </Text>
          <Text style={[styles.id, { color: colors.textDim }]}>
            ID: {student.id}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color={colors.textDim} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textDim }]}>
              Department
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {student.department}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textDim }]}>
              Semester
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {student.semester}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textDim }]}>
              CGPA
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {student.cgpa}
            </Text>
          </View>
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
          placeholder="Search students..."
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
            colors={["#4facfe", "#00f2fe"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <MaterialIcons name="person-add" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.content}>
        {students.map((student, index) => (
          <StudentCard key={student.id} student={student} index={index} />
        ))}
      </ScrollView>

      {/* Add Student Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add New Student
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
            {/* User Information Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                User Information
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Full Name *
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
                  placeholder="Enter full name"
                  placeholderTextColor={colors.textDim}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Email *
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
                  placeholder="Enter email address"
                  placeholderTextColor={colors.textDim}
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Password *
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
                  placeholder="Enter password"
                  placeholderTextColor={colors.textDim}
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry
                />
              </View>
            </View>

            {/* Student Information Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Student Information
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Student ID *
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
                  placeholder="e.g., 210041215"
                  placeholderTextColor={colors.textDim}
                  value={formData.studentId}
                  onChangeText={(text) =>
                    setFormData({ ...formData, studentId: text })
                  }
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
                    Batch
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
                    placeholder="e.g., 2021"
                    placeholderTextColor={colors.textDim}
                    value={formData.batch}
                    onChangeText={(text) =>
                      setFormData({ ...formData, batch: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Semester
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
                    placeholder="e.g., 4th"
                    placeholderTextColor={colors.textDim}
                    value={formData.semester}
                    onChangeText={(text) =>
                      setFormData({ ...formData, semester: text })
                    }
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Section
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
                    placeholder="e.g., A"
                    placeholderTextColor={colors.textDim}
                    value={formData.section}
                    onChangeText={(text) =>
                      setFormData({ ...formData, section: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Roll Number
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
                  placeholder="Enter roll number"
                  placeholderTextColor={colors.textDim}
                  value={formData.rollNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, rollNumber: text })
                  }
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Phone Number
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
                    placeholder="+8801234567890"
                    placeholderTextColor={colors.textDim}
                    value={formData.phoneNumber}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phoneNumber: text })
                    }
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Date of Birth
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
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textDim}
                    value={formData.dateOfBirth}
                    onChangeText={(text) =>
                      setFormData({ ...formData, dateOfBirth: text })
                    }
                  />
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
                onPress={handleAddStudent}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#4facfe", "#00f2fe"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? "Adding..." : "Add Student"}
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
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  id: {
    fontSize: 14,
  },
  moreButton: {
    padding: 8,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
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
