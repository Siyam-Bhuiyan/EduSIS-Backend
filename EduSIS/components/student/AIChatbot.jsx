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

export default function AIChatbot() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your EDUSIS AI Assistant. I can help you with:\n\n📚 Questions about EDUSIS features\n❓ Frequently Asked Questions\n📖 Academic study assistance\n💡 General university information\n\nHow can I help you today?",
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
    return `You are EDUSIS AI Assistant, a helpful chatbot for the EDUSIS university management system. 

ABOUT EDUSIS:
EDUSIS is a comprehensive university management system that unifies all academic and administrative processes in one platform. Unlike existing solutions requiring multiple apps (Google Classroom, Google Meet, separate university apps), EDUSIS integrates everything seamlessly.

FEATURES BY USER TYPE:

ADMIN FEATURES:
- Student/Faculty Management: Enroll students and teachers
- Department and Course Creation: Create and manage departments/courses  
- Teacher Assignment: Assign teachers to specific courses
- Student Enrollment: Enroll students into courses
- System Oversight: Monitor and manage overall system

TEACHER FEATURES:
- Announcements: Post announcements to classes
- Online Classes: Conduct live online classes
- File and Assignment Upload: Share files and assignments
- Grading: Grade students' assignments and exams
- Calendar: Manage events, reminders, and schedules

STUDENT FEATURES:
- Course Management: View enrolled courses and details
- Announcements: Receive and view teacher announcements
- Assignment Submission: Submit assignments and upload files
- Group Chats: Participate in course-specific group chats
- Results: View grades and results
- Online Classes: Join live classes hosted by teachers
- Calendar: Access personalized calendar for events and reminders

COMMON FAQs TO ADDRESS:
1. How do I access my grades? - Go to Results section in student dashboard
2. How do I submit assignments? - Use Assignment Submission feature in student portal
3. How do I join online classes? - Click on Online Classes in your dashboard when class is live
4. How do teachers post announcements? - Teachers use Announcements feature in their dashboard
5. Can I chat with classmates? - Yes, use Group Chats feature for course-specific discussions
6. How do I check my course schedule? - Use the Calendar feature to view all events and schedules
7. How do admins enroll students? - Admins use Student/Faculty Management in admin dashboard
8. Can I access EDUSIS on mobile? - Yes, EDUSIS is available as a mobile app for all platforms

For academic questions, provide helpful study tips, explain concepts clearly, and encourage learning.

Keep responses concise, friendly, and helpful. If asked about features not mentioned above, explain that EDUSIS is comprehensive and may include additional features.

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
        text: "I apologize, but I'm having trouble connecting right now. Here are some quick answers:\n\n📱 EDUSIS unifies all university processes in one app\n📚 Students can view grades in Results section\n✏️ Submit assignments through Assignment Submission\n🎥 Join live classes via Online Classes feature\n💬 Use Group Chats for course discussions\n\nPlease try again later or contact support for technical issues.",
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
    "How do I check my grades?",
    "How to submit assignments?",
    "How to join online classes?",
    "What is EDUSIS?",
    "How to use group chats?",
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
        <MaterialIcons name="smart-toy" size={24} color="#ffffff" />
        <Text style={styles.headerTitle}>EDUSIS AI Assistant</Text>
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
          placeholder="Ask me anything about EDUSIS..."
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
