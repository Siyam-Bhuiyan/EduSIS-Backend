import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import ApiService from "../services/ApiService";
import { useUser } from "../contexts/UserContext";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveUser } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.login(email, password);

      if (response.success) {
        const userData = response.data;
        await saveUser(userData);

        // Navigate based on user role
        if (userData.role === "student") navigation.navigate("StudentApp");
        else if (userData.role === "teacher") navigation.navigate("TeacherApp");
        else if (userData.role === "admin") navigation.navigate("AdminApp");
        else Alert.alert("Error", "Invalid user role.");
      }
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.message || "Please check your credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Artistic background shapes */}
      <View style={styles.artShape1} />
      <View style={styles.artShape2} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.wrapper}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/logo.jpg")}
                style={styles.logo}
              />
            </View>
          </View>

          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Login to EDUSIS</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                Don't have an account?{" "}
                <Text style={styles.registerBold}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },

  artShape1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    top: -50,
    right: -50,
  },
  artShape2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 20,
    backgroundColor: "rgba(78, 205, 196, 0.08)",
    bottom: -30,
    left: -30,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  wrapper: {
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoWrapper: {
    padding: 15,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    width: "100%",
    gap: 16,
  },
  pickerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  picker: {
    height: 50,
    color: "#ffffff",
  },
  input: {
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    fontSize: 16,
    color: "#ffffff",
  },
  button: {
    backgroundColor: "#45B7D1",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
    shadowColor: "#45B7D1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  registerBold: {
    fontWeight: "700",
    color: "#4ECDC4",
  },
});

export default Login;
