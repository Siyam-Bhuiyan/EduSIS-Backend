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

export default function Teachers() {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiTeachers, setApiTeachers] = useState([]);
  const [fetchingTeachers, setFetchingTeachers] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // User data
    name: "",
    email: "",
    password: "",
    // Teacher data
    teacherId: "",
    department: "",
    designation: "",
    phoneNumber: "",
    officeLocation: "",
    specialization: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      teacherId: "",
      department: "",
      designation: "",
      phoneNumber: "",
      officeLocation: "",
      specialization: "",
    });
  };

  // Fetch teachers from API
  const fetchTeachers = async () => {
    if (!user || !user.id) return;

    setFetchingTeachers(true);
    try {
      const response = await ApiService.getTeachers(user.id);
      if (response.success && response.data) {
        // Transform API teachers to match the expected format
        const transformedTeachers = response.data.map((teacher) => ({
          id: teacher.teacherId || teacher._id,
          name: teacher.user?.name || "N/A",
          department: teacher.department || "N/A",
          designation: teacher.designation || "N/A",
          courses: [], // You might want to add this field later
          email: teacher.user?.email || "N/A",
          isFromAPI: true,
        }));
        setApiTeachers(transformedTeachers);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    } finally {
      setFetchingTeachers(false);
    }
  };

  // Load teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, [user]);

  const handleAddTeacher = async () => {
    console.log("User object:", user);
    console.log("User ID:", user?.id);

    if (!user || !user.id) {
      Alert.alert("Error", "User not authenticated. Please login again.");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.teacherId ||
      !formData.department ||
      !formData.designation
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      console.log("Form data before sending:", formData);

      const teacherData = {
        userData: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        teacherData: {
          teacherId: formData.teacherId,
          department: formData.department,
          designation: formData.designation,
          phoneNumber: formData.phoneNumber,
          officeLocation: formData.officeLocation,
          specialization: formData.specialization
            ? [formData.specialization]
            : [],
        },
      };

      console.log("Sending teacher data:", teacherData);

      const response = await ApiService.addTeacher(user.id, teacherData);

      if (response.success) {
        Alert.alert("Success", "Teacher added successfully");
        setShowAddModal(false);
        resetForm();
        // Refresh the teachers list to show the new teacher
        await fetchTeachers();
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  // Demo data
  const dummyTeachers = [
    {
      id: "FAC001",
      name: "Dr. Sarah Johnson",
      department: "CSE",
      designation: "Professor",
      courses: ["Computer Networks", "Data Structures"],
      email: "sarah.j@edusis.com",
      isFromAPI: false,
    },
    {
      id: "FAC002",
      name: "Prof. Michael Chen",
      department: "EEE",
      designation: "Associate Professor",
      courses: ["Digital Electronics", "Circuit Theory"],
      email: "michael.c@edusis.com",
      isFromAPI: false,
    },
    {
      id: "FAC003",
      name: "Dr. Emily Brown",
      department: "CSE",
      designation: "Assistant Professor",
      courses: ["Database Systems", "Web Development"],
      email: "emily.b@edusis.com",
      isFromAPI: false,
    },
  ];

  // Combine dummy data with API data
  const teachers = [...dummyTeachers, ...apiTeachers];

  const TeacherCard = ({ teacher, index }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100)}
      style={[styles.card, { backgroundColor: colors.cardBg }]}
    >
      <LinearGradient
        colors={["#43e97b", "#38f9d7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="school" size={32} color="white" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{teacher.name}</Text>
            <Text style={styles.designation}>{teacher.designation}</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MaterialIcons name="more-vert" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="badge" size={20} color={colors.textDim} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {teacher.id}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="business" size={20} color={colors.textDim} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {teacher.department}
            </Text>
          </View>
        </View>

        <View style={styles.coursesContainer}>
          <Text style={[styles.coursesTitle, { color: colors.textDim }]}>
            Courses
          </Text>
          <View style={styles.coursesList}>
            {teacher.courses.map((course, idx) => (
              <View
                key={idx}
                style={[
                  styles.courseChip,
                  { backgroundColor: isDark ? "#2d3748" : "#e2e8f0" },
                ]}
              >
                <Text style={[styles.courseText, { color: colors.text }]}>
                  {course}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.emailContainer}>
          <MaterialIcons name="email" size={20} color={colors.textDim} />
          <Text style={[styles.emailText, { color: colors.text }]}>
            {teacher.email}
          </Text>
        </TouchableOpacity>

        {teacher.isFromAPI && (
          <View style={styles.apiIndicator}>
            <MaterialIcons name="cloud" size={16} color="#43e97b" />
            <Text style={[styles.apiText, { color: "#43e97b" }]}>
              From Database
            </Text>
          </View>
        )}
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
          placeholder="Search teachers..."
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
            colors={["#43e97b", "#38f9d7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <MaterialIcons name="person-add" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.content}>
        {teachers.map((teacher, index) => (
          <TeacherCard key={teacher.id} teacher={teacher} index={index} />
        ))}
      </ScrollView>

      {/* Add Teacher Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add New Teacher
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

            {/* Teacher Information Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Teacher Information
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Teacher ID *
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
                  placeholder="e.g., FAC001"
                  placeholderTextColor={colors.textDim}
                  value={formData.teacherId}
                  onChangeText={(text) =>
                    setFormData({ ...formData, teacherId: text })
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
                    Designation *
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
                    placeholder="e.g., Professor"
                    placeholderTextColor={colors.textDim}
                    value={formData.designation}
                    onChangeText={(text) =>
                      setFormData({ ...formData, designation: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Specialization
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
                  value={formData.specialization}
                  onChangeText={(text) =>
                    setFormData({ ...formData, specialization: text })
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
                    Office Location
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
                    placeholder="e.g., Room 301"
                    placeholderTextColor={colors.textDim}
                    value={formData.officeLocation}
                    onChangeText={(text) =>
                      setFormData({ ...formData, officeLocation: text })
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
                onPress={handleAddTeacher}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#43e97b", "#38f9d7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? "Adding..." : "Add Teacher"}
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
  cardHeader: {
    padding: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
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
    color: "white",
    marginBottom: 4,
  },
  designation: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  moreButton: {
    padding: 8,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
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
  coursesContainer: {
    marginBottom: 16,
  },
  coursesTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  coursesList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  courseChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  courseText: {
    fontSize: 14,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailText: {
    marginLeft: 8,
    fontSize: 14,
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
  apiIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(67, 233, 123, 0.1)",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  apiText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
  },
});
