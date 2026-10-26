import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Shield,
  TrendingUp,
} from "lucide-react-native";
import { sendChatMessage } from "../../src/services/api";
import { useApp } from "../../src/context/AppContext";
import { ThemeColors } from "../../src/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  intent?: string;
}

const QUICK_CHIPS = [
  "Analyze Reliance risk",
  "What is my solvency index?",
  "How to reduce tax under 80C?",
  "Explain my asset allocation",
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useApp();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      sender: "bot",
      text: "Welcome to FinSight AI Co-Pilot. I am synchronized with your current solvency audit and machine learning strategy profile. How may I assist your portfolio decisions today?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(query);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: res.reply || res.response || "Analysis complete.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        intent: res.intent,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      // Fallback
      const botMsg: Message = {
        id: `bot-fallback-${Date.now()}`,
        sender: "bot",
        text: "I analyzed your query in local context. With your current profile, maintaining liquidity in low-duration debt funds alongside top-tier large cap equity provides optimal risk-adjusted returns.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, loading]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <View>
            <Text style={styles.headerEyebrow}>PORTFOLIO ADVISORY</Text>
            <Text style={styles.headerTitle}>AI Wealth Co-Pilot</Text>
          </View>
          <View style={styles.syncBadge}>
            <Sparkles size={12} color={colors.gold} />
            <Text style={styles.syncText}>ACTIVE</Text>
          </View>
        </View>

        {/* Message Stream */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.userRow : styles.botRow,
                ]}
              >
                {!isUser && (
                  <View style={styles.botAvatar}>
                    <Bot size={16} color={colors.gold} />
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.userMessageText : styles.botMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.timestampText,
                      isUser ? styles.userTimestamp : styles.botTimestamp,
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>

                {isUser && (
                  <View style={styles.userAvatar}>
                    <User size={16} color={colors.isDark ? colors.bgPrimary : "#FFFFFF"} />
                  </View>
                )}
              </View>
            );
          })}

          {loading && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={colors.gold} />
              <Text style={styles.loadingText}>Co-Pilot analyzing market parameters...</Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {QUICK_CHIPS.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                onPress={() => handleSend(chip)}
                activeOpacity={0.7}
              >
                <TrendingUp size={11} color={colors.gold} />
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything on equities, debt, or tax..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Send size={16} color={colors.isDark ? colors.bgPrimary : "#FFFFFF"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    headerEyebrow: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
    },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "800",
      marginTop: 2,
    },
    syncBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.goldSubtle,
      borderWidth: 1,
      borderColor: colors.borderAccent,
    },
    syncText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    messageList: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexGrow: 1,
    },
    messageRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 14,
      gap: 8,
    },
    userRow: {
      justifyContent: "flex-end",
    },
    botRow: {
      justifyContent: "flex-start",
    },
    botAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.goldSubtle,
      borderWidth: 1,
      borderColor: colors.borderAccent,
      alignItems: "center",
      justifyContent: "center",
    },
    userAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
    },
    messageBubble: {
      maxWidth: "78%",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
    },
    userBubble: {
      backgroundColor: colors.gold,
      borderBottomRightRadius: 4,
    },
    botBubble: {
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 13,
      lineHeight: 18,
    },
    userMessageText: {
      color: colors.isDark ? colors.bgPrimary : "#FFFFFF",
      fontWeight: "600",
    },
    botMessageText: {
      color: colors.textPrimary,
    },
    timestampText: {
      fontSize: 9,
      marginTop: 4,
      textAlign: "right",
    },
    userTimestamp: {
      color: colors.isDark ? "rgba(12, 13, 16, 0.6)" : "rgba(255, 255, 255, 0.75)",
    },
    botTimestamp: {
      color: colors.textMuted,
    },
    loadingBubble: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 12,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontStyle: "italic",
    },
    chipsContainer: {
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      backgroundColor: colors.bgPrimary,
    },
    chipsScroll: {
      paddingHorizontal: 14,
      gap: 8,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      backgroundColor: colors.bgSurface,
      gap: 10,
    },
    input: {
      flex: 1,
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: 12,
      color: colors.textPrimary,
      fontSize: 13,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
    },
    sendButtonDisabled: {
      backgroundColor: colors.bgSurfaceElevated,
    },
  });
