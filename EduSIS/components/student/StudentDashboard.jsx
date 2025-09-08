import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CourseCard from "./CourseCard";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../contexts/UserContext";
import ApiService from "../../services/ApiService";

const DEMO_ENROLLMENTS = [
  {
    _id: "demo-enrollment-1",
    section: {
      course: {
        courseCode: "CSE-301",
        title: "Computer Networks",
      },
      teacher: {
        user: {
          name: "Dr. Sarah Johnson",
        },
      },
      section: "A",
    },
  },
  {
    _id: "demo-enrollment-2",
    section: {
      course: {
        courseCode: "CSE-205",
        title: "Database Systems",
      },
      teacher: {
        user: {
          name: "Prof. Michael Chen",
        },
      },
      section: "B",
    },
  },
  {
    _id: "demo-enrollment-3",
    section: {
      course: {
        courseCode: "CSE-401",
        title: "Software Engineering",
      },
      teacher: {
        user: {
          name: "Dr. Emily Rodriguez",
        },
      },
      section: "A",
    },
  },
];

export default function StudentDashboard() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user } = useUser();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (user?.id) {
        const response = await ApiService.getStudentDashboard(user.id);
        if (
          response.success &&
          response.data &&
          response.data.enrollments &&
          response.data.enrollments.length > 0
        ) {
          setDashboardData(response.data);
        } else {
          console.log("Using demo dashboard data");
          setDashboardData({
            enrollments: DEMO_ENROLLMENTS,
          });
        }
      }
    } catch (error) {
      console.log("Using demo dashboard data due to API error:", error.message);
      setDashboardData({
        enrollments: DEMO_ENROLLMENTS,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get courses from dashboard data
  const courses = dashboardData?.enrollments || [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView style={styles.content}>
        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              My Courses
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {courses.length > 0 ? (
            courses.map((enrollment, index) => (
              <CourseCard
                key={enrollment._id || index}
                courseID={
                  enrollment.section?.course?.courseCode || `course-${index}`
                }
                courseTitle={
                  enrollment.section?.course?.title || "Course Title"
                }
                teacherName={
                  enrollment.section?.teacher?.user?.name || "Teacher Name"
                }
                section={enrollment.section?.section || "N/A"}
                coverUri="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=60"
                teacherAvatarUri={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  enrollment.section?.teacher?.user?.name || "T"
                )}&background=random`}
                colors={colors}
              />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <MaterialIcons
                name="school"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No courses enrolled yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  coursesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
