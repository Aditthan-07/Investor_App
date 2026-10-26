import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ShieldCheck, User, Lock, ArrowRight, Sparkles, X, Eye, EyeOff } from "lucide-react-native";
import { useApp } from "../context/AppContext";

export function AuthModal() {
  const { authModalVisible, setAuthModalVisible, login, signUp, continueAsGuest, colors, isAuthenticated } =
    useApp();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!authModalVisible && isAuthenticated) return null;

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!username.trim()) {
      setErrorMsg("Please enter your username.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = isRegisterMode
        ? await signUp(username, password)
        : await login(username, password);

      if (!res.success) {
        setErrorMsg(res.error || "Authentication failed. Please verify credentials.");
      } else {
        setUsername("");
        setPassword("");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={authModalVisible || !isAuthenticated}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (isAuthenticated) setAuthModalVisible(false);
      }}
    >
      <View style={[styles.backdrop, { backgroundColor: "rgba(0, 0, 0, 0.85)" }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.bgSurfaceElevated,
                borderColor: colors.borderAccent,
              },
            ]}
          >
            {/* Close button only available if already authenticated */}
            {isAuthenticated && (
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setAuthModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            {/* Brand Header */}
            <View style={styles.brandRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.goldSubtle, borderColor: colors.borderAccent }]}>
                <ShieldCheck size={20} color={colors.gold} />
              </View>
              <View>
                <Text style={[styles.preTitle, { color: colors.gold }]}>FINSIGHT WEALTH SUITE</Text>
                <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                  Executive <Text style={{ color: colors.gold }}>Gateway</Text>
                </Text>
              </View>
            </View>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isRegisterMode
                ? "Create an institutional wealth profile to synchronize your balance sheet audits across devices."
                : "Sign in to access your persistent solvency audits and risk-calibrated asset allocations."}
            </Text>

            {/* Mode Switcher Pills */}
            <View style={[styles.modeToggleRow, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  !isRegisterMode && { backgroundColor: colors.bgSurfaceElevated, borderColor: colors.borderAccent },
                ]}
                onPress={() => {
                  setIsRegisterMode(false);
                  setErrorMsg("");
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    { color: !isRegisterMode ? colors.gold : colors.textMuted },
                  ]}
                >
                  SIGN IN
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeTab,
                  isRegisterMode && { backgroundColor: colors.bgSurfaceElevated, borderColor: colors.borderAccent },
                ]}
                onPress={() => {
                  setIsRegisterMode(true);
                  setErrorMsg("");
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    { color: isRegisterMode ? colors.gold : colors.textMuted },
                  ]}
                >
                  CREATE ACCOUNT
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message Banner */}
            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: colors.crimsonSubtle, borderColor: colors.crimson }]}>
                <Text style={[styles.errorText, { color: colors.crimson }]}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Input 1: Username */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>USERNAME (E.G. INVESTOR_01)</Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: colors.bgSurface,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <User size={16} color={colors.gold} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="e.g. investor_01"
                  placeholderTextColor={colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Input 2: Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>PASSWORD</Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: colors.bgSurface,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Lock size={16} color={colors.gold} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.gold} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Action Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.gold }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>
                    {isRegisterMode ? "Create Wealth Account" : "Enter Executive Desk"}
                  </Text>
                  <ArrowRight size={16} color="#000000" />
                </>
              )}
            </TouchableOpacity>

            {/* Guest / Demo Bypass Option */}
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={continueAsGuest}
              activeOpacity={0.7}
            >
              <Sparkles size={13} color={colors.emerald} />
              <Text style={[styles.guestBtnText, { color: colors.textMuted }]}>
                Continue as <Text style={{ color: colors.emerald, fontWeight: "700" }}>Guest Investor</Text> • Demo Mode
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  keyboardWrap: {
    width: "100%",
    maxWidth: 420,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
    padding: 4,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  preTitle: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 1,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 18,
  },
  modeToggleRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "transparent",
  },
  modeTabText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  errorBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 11,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryBtnText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginTop: 6,
  },
  guestBtnText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
