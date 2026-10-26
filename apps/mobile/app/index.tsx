import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Shield, Sparkles, ArrowRight, Activity } from "lucide-react-native";
import { checkFastAPIHealth } from "../src/services/api";
import { useApp } from "../src/context/AppContext";
import { ThemeColors } from "../src/theme/colors";

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useApp();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [serverState, setServerState] = useState<"checking" | "connected" | "offline">("checking");
  const [, setServerUrl] = useState<string>("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // 1.2s smooth breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Check FastAPI health
    checkFastAPIHealth().then((res) => {
      setServerState(res.status);
      setServerUrl(res.url);
    });
  }, []);

  const handleEnter = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Minimalist Tag */}
        <View style={styles.topBadge}>
          <Activity size={12} color={colors.emerald} />
          <Text style={styles.topBadgeText}>INSTITUTIONAL WEALTH ENGINE</Text>
        </View>

        {/* Center Glowing Monogram Emblem */}
        <View style={styles.emblemContainer}>
          <Animated.View
            style={[
              styles.glowAura,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.emblemCard,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.innerShield}>
              <Shield size={38} color={colors.gold} />
              <Sparkles size={16} color={colors.emerald} style={styles.sparkleIcon} />
            </View>
          </Animated.View>
        </View>

        {/* Brand Typography */}
        <Animated.View
          style={[
            styles.textBlock,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>
            FinSight <Text style={styles.titleAccent}>AI</Text>
          </Text>
          <Text style={styles.subtitle}>
            Autonomous Intelligence for Modern Portfolio Wealth
          </Text>
        </Animated.View>

        {/* Connection Status Pill */}
        <View style={styles.statusPill}>
          {serverState === "checking" ? (
            <>
              <ActivityIndicator size="small" color={colors.gold} style={{ marginRight: 8 }} />
              <Text style={styles.statusText}>VERIFYING BACKEND ENGINE...</Text>
            </>
          ) : serverState === "connected" ? (
            <>
              <View style={[styles.statusDot, { backgroundColor: colors.emerald }]} />
              <Text style={[styles.statusText, { color: colors.emerald }]}>
                FASTAPI 2.0 • CORE ACTIVE
              </Text>
            </>
          ) : (
            <>
              <View style={[styles.statusDot, { backgroundColor: colors.amber }]} />
              <Text style={[styles.statusText, { color: colors.amber }]}>
                OFFLINE ENGINE • LOCAL CACHE
              </Text>
            </>
          )}
        </View>

        {/* Enter CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleEnter}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>ENTER WEALTH SUITE</Text>
          <ArrowRight size={18} color={colors.isDark ? colors.bgPrimary : "#FFFFFF"} />
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Clean-Slate Architecture • Zero Pre-Filled Dummy Numbers
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
    },
    topBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: colors.emeraldSubtle,
      borderWidth: 1,
      borderColor: colors.emerald,
      marginBottom: 48,
    },
    topBadgeText: {
      color: colors.emerald,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.2,
    },
    emblemContainer: {
      width: 140,
      height: 140,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32,
    },
    glowAura: {
      position: "absolute",
      width: 130,
      height: 130,
      borderRadius: 65,
      backgroundColor: colors.goldSubtle,
      borderWidth: 1,
      borderColor: colors.borderAccent,
    },
    emblemCard: {
      width: 88,
      height: 88,
      borderRadius: 26,
      backgroundColor: colors.bgSurfaceElevated,
      borderWidth: 1.5,
      borderColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 10,
    },
    innerShield: {
      alignItems: "center",
      justifyContent: "center",
    },
    sparkleIcon: {
      position: "absolute",
      top: -2,
      right: -4,
    },
    textBlock: {
      alignItems: "center",
      marginBottom: 28,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 32,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    titleAccent: {
      color: colors.gold,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
      maxWidth: 280,
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      marginBottom: 36,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 8,
    },
    statusText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.8,
    },
    ctaButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: colors.gold,
      width: "100%",
      paddingVertical: 15,
      borderRadius: 14,
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    ctaText: {
      color: colors.isDark ? colors.bgPrimary : "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 1,
    },
    footnote: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 18,
      letterSpacing: 0.4,
    },
  });
