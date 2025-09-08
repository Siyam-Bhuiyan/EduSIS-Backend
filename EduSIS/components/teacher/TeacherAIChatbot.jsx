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

export default function TeacherAIChatbot() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your EDUSIS AI Teaching Assistant. I can help you with:\n\n🏫 EDUSIS teaching features and tools\n📝 Assignment and grading management\n🎥 Online class management\n📢 Announcements and communication\n📚 Academic teaching strategies\n💡 Educational best practices\n\nHow can I assist you today?",
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
    return `You are EDUSIS AI Teaching Assistant, a helpful chatbot for teachers using the EDUSIS university management system.

EDUSIS TEACHER FEATURES:
- Announcements: Post announcements to respective classes and courses
- Online Classes: Conduct live online classes with integrated video conferencing
- File and Assignment Upload: Share educational materials, assignments, and resources with students
- Grading: Grade students' assignments, quizzes, and exams with detailed feedback
- Calendar: Manage academic events, class schedules, assignment deadlines, and reminders
- Course Management: Organize course content, track student progress, and manage enrollments
- Communication: Direct messaging with students and group discussions
- Assessment Tools: Create quizzes, assignments, and track student performance

COMMON TEACHER FAQs:
1. How do I post announcements? - Use the Announcements feature in your teacher dashboard to communicate with students
2. How do I start an online class? - Navigate to Online Classes and click "Start Class" to begin live sessions
3. How do I upload assignments? - Use File and Assignment Upload to share materials and create new assignments
4. How do I grade students? - Access the Grading section to evaluate and provide feedback on student submissions
5. How do I manage my class schedule? - Use the Calendar feature to view and manage all your classes and events
6. How do I communicate with students? - Use the messaging system for direct communication or group discussions
7. How do I track student progress? - View detailed analytics and progress reports in your teacher dashboard
8. How do I create quizzes? - Use the Assessment Tools to create and manage quizzes and exams

EDUCATIONAL SUPPORT:
For academic and teaching questions, provide:
- Effective teaching strategies and methodologies
- Student engagement techniques
- Assessment and feedback best practices
- Classroom management tips
- Technology integration in education
- Curriculum development guidance

Keep responses professional, supportive, and focused on enhancing teaching effectiveness and student learning outcomes.

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
        text: "I apologize, but I'm having trouble connecting right now. Here are some quick teacher tips:\n\n📢 Use Announcements to communicate with students\n🎥 Start Online Classes for live teaching sessions\n📝 Upload assignments via File and Assignment Upload\n✏️ Grade student work in the Grading section\n📅 Manage your schedule with the Calendar feature\n\nPlease try again later or contact support for technical issues.",
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
    "How do I post announcements?",
    "How to start online classes?",
    "How do I grade assignments?",
    "Teaching strategies for engagement",
    "How to manage class schedule?",
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
        <MaterialIcons name="school" size={24} color="#ffffff" />
        <Text style={styles.headerTitle}>EDUSIS Teaching Assistant</Text>
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
          placeholder="Ask me about teaching or EDUSIS features..."
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
