import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";

const GEMINI_API_KEY = "AIzaSyBsBhJgQaMIBUCppLPhW0JispdgPUA5vvw";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export default function AdminAIChatbot() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your EDUSIS AI Administrative Assistant. I can help you with:\n\n🏛️ System administration and management\n👥 Student and faculty enrollment\n📚 Department and course creation\n👨‍🏫 Teacher assignments and management\n📊 System oversight and analytics\n🔧 Administrative best practices\n💼 University management strategies\n\nHow can I assist you today?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const createSystemPrompt = (userMessage) => {
    return `You are EDUSIS AI Administrative Assistant, a helpful chatbot for administrators using the EDUSIS university management system.

EDUSIS ADMIN FEATURES:
- Student/Faculty Management: Enroll students and teachers into the university system, manage user accounts and permissions
- Department and Course Creation: Create and manage academic departments, design course curricula, and organize academic programs
- Teacher Assignment: Assign qualified teachers to specific courses and manage teaching loads
- Student Enrollment: Enroll students into courses, manage academic records, and track enrollment statistics
- System Oversight: Monitor overall system performance, user activity, and generate comprehensive reports
- User Management: Create, modify, and deactivate user accounts for students, teachers, and staff
- Academic Calendar: Manage semester schedules, exam periods, and academic events
- Analytics and Reporting: Generate insights on student performance, teacher effectiveness, and system usage

COMMON ADMIN FAQs:
1. How do I enroll new students? - Use Student/Faculty Management to add new student accounts and course enrollments
2. How do I create new courses? - Navigate to Department and Course Creation to design and implement new academic programs
3. How do I assign teachers to courses? - Use Teacher Assignment feature to match qualified faculty with appropriate courses
4. How do I manage user permissions? - Access User Management to set roles and permissions for different user types
5. How do I generate reports? - Use Analytics and Reporting tools to create comprehensive system and academic reports
6. How do I manage the academic calendar? - Update semester schedules and important dates through the Academic Calendar feature
7. How do I monitor system performance? - Use System Oversight dashboard to track usage, performance metrics, and user activity
8. How do I handle enrollment issues? - Access Student Enrollment tools to resolve enrollment conflicts and manage waitlists

ADMINISTRATIVE GUIDANCE:
For management and leadership questions, provide:
- Best practices for educational administration
- Student enrollment and retention strategies
- Faculty management and development
- Academic quality assurance
- System security and data management
- Policy development and implementation
- Budget planning and resource allocation
- Compliance and regulatory guidance

Keep responses professional, strategic, and focused on effective institutional management and educational excellence.

User question: ${userMessage}`;
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: createSystemPrompt(userMessage.text),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.candidates[0].content.parts[0].text,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("AI API Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble connecting right now. Here are some quick admin tips:\n\n👥 Use Student/Faculty Management for user enrollment\n📚 Create courses via Department and Course Creation\n👨‍🏫 Assign teachers through Teacher Assignment\n📊 Monitor system through System Oversight dashboard\n📈 Generate reports with Analytics and Reporting\n\nPlease try again later or contact support for technical issues.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isBot ? styles.botMessage : styles.userMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: message.isBot ? colors.card : colors.primary,
            borderColor: message.isBot ? colors.border : colors.primary,
          },
        ]}
      >
        {message.isBot && (
          <View style={styles.botIcon}>
            <MaterialIcons name="smart-toy" size={16} color={colors.primary} />
          </View>
        )}
        <Text
          style={[
            styles.messageText,
            {
              color: message.isBot ? colors.text : "#ffffff",
            },
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            {
              color: message.isBot ? colors.textDim : "#ffffff80",
            },
          ]}
        >
          {message.timestamp}
        </Text>
      </View>
    </View>
  );

  const quickQuestions = [
    "How do I enroll new students?",
    "How to create new courses?",
    "How do I assign teachers?",
    "How to generate reports?",
    "System management best practices",
  ];

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <MaterialIcons name="admin-panel-settings" size={24} color="#ffffff" />
        <Text style={styles.headerTitle}>EDUSIS Admin Assistant</Text>
        <MaterialIcons name="auto-awesome" size={20} color="#ffffff" />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textDim }]}>
              AI is thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <View style={styles.quickQuestionsContainer}>
          <Text style={[styles.quickQuestionsTitle, { color: colors.text }]}>
            Quick Questions:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickQuestionButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => handleQuickQuestion(question)}
              >
                <Text
                  style={[styles.quickQuestionText, { color: colors.text }]}
                >
                  {question}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me about administration or EDUSIS management..."
          placeholderTextColor={colors.textDim}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim()
                ? colors.primary
                : colors.textDim,
            },
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <MaterialIcons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginVertical: 4,
  },
  botMessage: {
    alignItems: "flex-start",
  },
  userMessage: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  botIcon: {
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  quickQuestionsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  quickQuestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  quickQuestionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    paddingBottom: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
