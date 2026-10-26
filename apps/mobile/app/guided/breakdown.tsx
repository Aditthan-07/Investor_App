import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";
import {
  ChevronLeft,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  MessageSquareText,
  Sparkles,
  Scale,
} from "lucide-react-native";
import { useApp } from "../../src/context/AppContext";
import { ThemeColors } from "../../src/theme/colors";

function resolveAssetCategory(rawKey: string): {
  label: string;
  color: string;
  role: string;
} {
  const lower = rawKey.toLowerCase();
  if (
    lower.includes("equit") ||
    lower.includes("stock") ||
    lower.includes("cap") ||
    lower.includes("growth") ||
    lower.includes("thematic")
  ) {
    return {
      label: "Equities",
      color: "#10B981",
      role: "Capital Appreciation & Long-Term Compounding",
    };
  }
  if (
    lower.includes("debt") ||
    lower.includes("bond") ||
    lower.includes("fixed") ||
    lower.includes("income")
  ) {
    return {
      label: "Fixed Income & Debt",
      color: "#C5A880",
      role: "Capital Stability & Predictable Yield",
    };
  }
  if (
    lower.includes("gold") ||
    lower.includes("commodit") ||
    lower.includes("hedge")
  ) {
    return {
      label: "Commodities & Gold",
      color: "#F59E0B",
      role: "Inflation Hedge & Tail-Risk Insurance",
    };
  }
  if (
    lower.includes("liquid") ||
    lower.includes("cash") ||
    lower.includes("buffer")
  ) {
    return {
      label: "Liquid Cash Buffer",
      color: "#64748B",
      role: "Emergency Liquidity & Tactical Opportunism",
    };
  }
  return {
    label: rawKey,
    color: "#C5A880",
    role: "Balanced Asset Segment",
  };
}

export default function BreakdownScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recommendation, colors } = useApp();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [revealProgress, setRevealProgress] = useState(1);

  const rawAlloc = recommendation?.target_asset_allocation || {
    "Large & Mid Cap Equities": 55,
    "Corporate Debt & Fixed Income": 25,
    "Sovereign Gold / Commodities": 10,
    "Liquid Emergency Buffer": 10,
  };

  // Segmented Donut Geometry
  const radius = 56;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const donutSegments = Object.entries(rawAlloc).map(([key, rawPct]) => {
    const meta = resolveAssetCategory(key);
    const pct = Math.max(0, Number(rawPct) || 0);
    const segmentLength = (pct / 100) * circumference * revealProgress;
    const strokeGap = circumference - segmentLength;
    const offset = -cumulativeOffset;
    cumulativeOffset += segmentLength;

    return {
      rawKey: key,
      label: meta.label,
      pct,
      color: meta.color,
      role: meta.role,
      dashArray: `${segmentLength} ${strokeGap}`,
      offset,
    };
  });

  const handleSimulateRebalance = () => {
    Alert.alert(
      "Rebalancing Simulation",
      "Portfolio weights are mathematically aligned with your current solvency tier. Rebalancing is recommended semi-annually or when any asset drifts > 5%.",
      [{ text: "Understood", style: "default" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 03 OF 03 • MACRO ALLOCATION</Text>
          </View>
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.eyebrow}>DEEP PORTFOLIO ANALYTICS</Text>
          <Text style={styles.mainTitle}>Portfolio Allocation & Rebalancing</Text>
          <Text style={styles.subtitle}>
            Macro capital distribution calibrated against your solvency index. Balances equity compounding with debt buffers and hedge reserves.
          </Text>
        </View>

        {/* Multi-Color Segmented SVG Donut Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <PieChart size={16} color={colors.gold} />
            <Text style={styles.cardTitle}>Target Capital Distribution</Text>
          </View>

          <View style={styles.donutWrapper}>
            <Svg width={160} height={160} viewBox="0 0 160 160">
              <G rotation="-90" origin="80, 80">
                <Circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={colors.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.08)"}
                  strokeWidth={strokeWidth}
                  fill="none"
                />

                {donutSegments.map((seg, idx) => (
                  <Circle
                    key={idx}
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.offset}
                    strokeLinecap="butt"
                    fill="none"
                  />
                ))}
              </G>
            </Svg>

            <View style={styles.donutCenter}>
              <Text style={styles.donutCenterValue}>100%</Text>
              <Text style={styles.donutCenterLabel}>CAPITAL</Text>
            </View>
          </View>

          {/* Allocation Legend Details */}
          <View style={styles.allocationList}>
            {donutSegments.map((item, idx) => (
              <View key={idx} style={styles.allocationItem}>
                <View style={[styles.segmentIndicator, { backgroundColor: item.color }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.allocationRow}>
                    <Text style={styles.allocationLabel}>{item.label}</Text>
                    <Text style={[styles.allocationPct, { color: item.color }]}>
                      {item.pct}%
                    </Text>
                  </View>
                  <Text style={styles.allocationRole}>{item.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Rebalancing & Portfolio Resilience Advisory */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Scale size={16} color={colors.gold} />
            <Text style={styles.cardTitle}>Institutional Rebalancing Policy</Text>
          </View>

          <View style={styles.advisoryInner}>
            <View style={styles.advisoryRow}>
              <View style={styles.advisoryBadge}>
                <Text style={styles.advisoryBadgeText}>DRIFT TOLERANCE</Text>
              </View>
              <Text style={styles.advisoryValue}>±5.0% Max Threshold</Text>
            </View>

            <View style={styles.advisoryRow}>
              <View style={styles.advisoryBadge}>
                <Text style={styles.advisoryBadgeText}>AUDIT CADENCE</Text>
              </View>
              <Text style={styles.advisoryValue}>Semi-Annual Realignment</Text>
            </View>

            <View style={styles.advisoryRow}>
              <View style={styles.advisoryBadge}>
                <Text style={styles.advisoryBadgeText}>VOLATILITY SHIELD</Text>
              </View>
              <Text style={styles.advisoryValue}>Dynamic Debt / Gold Hedge</Text>
            </View>

            <TouchableOpacity
              style={styles.rebalanceButton}
              activeOpacity={0.8}
              onPress={handleSimulateRebalance}
            >
              <RefreshCw size={14} color={colors.gold} />
              <Text style={styles.rebalanceButtonText}>SIMULATE REBALANCING CADENCE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action CTAs */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            activeOpacity={0.85}
            onPress={() => router.replace("/(tabs)")}
          >
            <CheckCircle2 size={18} color={colors.isDark ? colors.bgPrimary : "#FFFFFF"} />
            <Text style={styles.completeButtonText}>RETURN TO EXECUTIVE DESK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.consultButton}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/chat")}
          >
            <MessageSquareText size={16} color={colors.gold} />
            <Text style={styles.consultButtonText}>CONSULT AI CO-PILOT ON ALLOCATION</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 40,
    },
    navBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    stepBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: colors.goldSubtle,
      borderWidth: 1,
      borderColor: colors.borderAccent,
    },
    stepBadgeText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
    },
    titleArea: {
      marginBottom: 20,
    },
    eyebrow: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
    },
    mainTitle: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
      marginTop: 2,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 6,
      lineHeight: 18,
    },
    card: {
      backgroundColor: colors.bgSurface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 16,
      marginBottom: 16,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    },
    cardTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    donutWrapper: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 12,
    },
    donutCenter: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    donutCenterValue: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    donutCenterLabel: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
      marginTop: 2,
    },
    allocationList: {
      marginTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingTop: 14,
    },
    allocationItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 12,
    },
    segmentIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 4,
    },
    allocationRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    allocationLabel: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    allocationPct: {
      fontSize: 13,
      fontWeight: "800",
    },
    allocationRole: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    advisoryInner: {
      marginTop: 4,
    },
    advisoryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    advisoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: colors.goldSubtle,
    },
    advisoryBadgeText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: "800",
    },
    advisoryValue: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
    },
    rebalanceButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 12,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderAccent,
      backgroundColor: colors.goldSubtle,
    },
    rebalanceButtonText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    actionContainer: {
      gap: 10,
      marginTop: 8,
      marginBottom: 20,
    },
    completeButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.emerald,
      paddingVertical: 15,
      borderRadius: 14,
      shadowColor: colors.emerald,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    completeButtonText: {
      color: colors.isDark ? colors.bgPrimary : "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    consultButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingVertical: 14,
      borderRadius: 14,
    },
    consultButtonText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.6,
    },
  });
