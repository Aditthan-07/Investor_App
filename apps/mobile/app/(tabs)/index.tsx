import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";
import {
  TrendingUp,
  ShieldCheck,
  Cpu,
  PieChart,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  User,
} from "lucide-react-native";
import { useApp } from "../../src/context/AppContext";
import { fetchLiveNifty, NiftyUpdateResponse } from "../../src/services/api";
import { ThemeColors } from "../../src/theme/colors";
import { formatPct } from "../../src/utils/formatters";
import { VersionBadge } from "../../src/components/VersionBadge";
import { ProfileDrawer } from "../../src/components/ProfileDrawer";
import { AuthModal } from "../../src/components/AuthModal";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    currentUser,
    isAudited,
    healthResult,
    recommendation,
    resetAllData,
    salary,
    colors,
    themeMode,
    toggleTheme,
  } = useApp();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [nifty, setNifty] = useState<NiftyUpdateResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadMarket = async () => {
    try {
      const data = await fetchLiveNifty();
      setNifty(data);
    } catch (e) {
      // Handled silently
    }
  };

  useEffect(() => {
    loadMarket();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMarket();
    setRefreshing(false);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset All Data",
      "Are you sure you want to restore the pristine clean-slate state? All entered numbers will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset Clean Slate", style: "destructive", onPress: resetAllData },
      ]
    );
  };

  // Kinetic ring calculations
  const solvencyScorePct =
    isAudited && healthResult ? Math.round((healthResult.health_score / 7) * 100) : 0;

  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (solvencyScorePct / 100) * circumference;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 18) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
        }
      >
        {/* Top Header with Balanced Spacing & Separated Columns */}
        <View style={styles.headerRow}>
          {/* Left: Titles */}
          <View style={styles.titleColumn}>
            <Text style={styles.preTitle}>FINSIGHT WEALTH SUITE</Text>
            <Text numberOfLines={1} style={styles.mainTitle}>
              Executive Desk
            </Text>
          </View>

          {/* Right: Actions Grouped Together */}
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => setDrawerOpen(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.8}
            >
              <User size={15} color={colors.gold} />
              <Text numberOfLines={1} style={styles.profileBadgeText}>
                {currentUser || "Guest Investor"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.themeToggleBtn}
              onPress={toggleTheme}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.8}
            >
              {themeMode === "dark" ? (
                <Sun size={18} color={colors.gold} />
              ) : (
                <Moon size={18} color={colors.gold} />
              )}
            </TouchableOpacity>

            {nifty && (
              <TouchableOpacity
                style={styles.niftyPill}
                activeOpacity={0.8}
                onPress={() => router.push("/(tabs)/market")}
              >
                <View style={styles.livePulseDot} />
                <View>
                  <Text style={styles.niftyLabel}>NIFTY 50</Text>
                  <Text style={styles.niftyPrice}>
                    ₹{(nifty.latest_price || 24857.30).toLocaleString("en-IN", {
                      minimumFractionDigits: 1,
                    })}{" "}
                    <Text
                      style={[
                        styles.niftyDelta,
                        {
                          color:
                            (nifty.change_pct ?? 0.92) >= 0
                              ? colors.emerald
                              : colors.crimson,
                        },
                      ]}
                    >
                      {formatPct(nifty.change_pct ?? 0.92)}
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Kinetic Solvency Ring Card (Full Visual Prominence) */}
        <TouchableOpacity
          style={styles.kineticCard}
          activeOpacity={0.9}
          onPress={() => router.push("/guided/health")}
        >
          <View style={styles.kineticRingWrapper}>
            <Svg width={136} height={136} viewBox="0 0 136 136">
              <G rotation="-90" origin="68, 68">
                {/* Background Ring */}
                <Circle
                  cx="68"
                  cy="68"
                  r={radius}
                  stroke={colors.bgSurfaceElevated}
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Progress Ring */}
                <Circle
                  cx="68"
                  cy="68"
                  r={radius}
                  stroke={isAudited ? colors.emerald : colors.gold}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={isAudited ? strokeDashoffset : circumference}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            </Svg>

            {/* Inner Ring Text */}
            <View style={styles.ringCenterText}>
              <Text style={styles.ringValueText}>
                {isAudited ? `${solvencyScorePct}%` : "0%"}
              </Text>
              <Text style={styles.ringLabelText}>
                {isAudited ? "SOLVENCY" : "UNAUDITED"}
              </Text>
            </View>
          </View>

          <View style={styles.kineticInfo}>
            <View style={styles.kineticTag}>
              <Sparkles size={12} color={isAudited ? colors.emerald : colors.gold} />
              <Text
                style={[
                  styles.kineticTagText,
                  { color: isAudited ? colors.emerald : colors.gold },
                ]}
              >
                {isAudited
                  ? `TIER: ${healthResult?.health_tier?.toUpperCase()}`
                  : "PRISTINE CANVAS"}
              </Text>
            </View>

            <Text style={styles.kineticTitle}>
              {isAudited ? "Solvency Assessment Active" : "Audit Your Solvency Profile"}
            </Text>

            <Text style={styles.kineticDesc} numberOfLines={2}>
              {isAudited
                ? healthResult?.recommendation_summary
                : "Evaluate salary, CIBIL score, and debt commitments to unlock portfolio allocation."}
            </Text>

            <View style={styles.kineticActionRow}>
              <Text style={styles.kineticActionText}>
                {isAudited ? "Review Audit Details" : "Start Step 1 Audit"}
              </Text>
              <ChevronRight size={14} color={colors.gold} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Guided Steps Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Guided Architecture Steps</Text>
          <Text style={styles.sectionSubtitle}>Sequential Institutional Flow</Text>
        </View>

        {/* Step 1 Card */}
        <TouchableOpacity
          style={styles.stepCard}
          activeOpacity={0.85}
          onPress={() => router.push("/guided/health")}
        >
          <View style={[styles.stepIconBox, isAudited && styles.stepIconBoxDone]}>
            <ShieldCheck size={20} color={isAudited ? colors.emerald : colors.gold} />
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeaderRow}>
              <Text style={styles.stepTag}>STEP 01</Text>
              <Text style={[styles.stepStatus, isAudited && styles.stepStatusDone]}>
                {isAudited ? "VERIFIED" : "PENDING"}
              </Text>
            </View>
            <Text style={styles.stepTitle}>Financial Health & Solvency Audit</Text>
            <Text style={styles.stepMeta}>
              {isAudited && salary
                ? `Salary: ₹${salary.toLocaleString("en-IN")} • CIBIL: ${healthResult?.credit_score_val}`
                : "Input income, credit score & emergency buffer"}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Step 2 Card */}
        <TouchableOpacity
          style={styles.stepCard}
          activeOpacity={0.85}
          onPress={() => router.push("/guided/strategy")}
        >
          <View style={[styles.stepIconBox, recommendation && styles.stepIconBoxDone]}>
            <Cpu size={20} color={recommendation ? colors.emerald : colors.gold} />
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeaderRow}>
              <Text style={styles.stepTag}>STEP 02</Text>
              <Text style={[styles.stepStatus, recommendation && styles.stepStatusDone]}>
                {recommendation ? "INFERRED" : "AWAITING"}
              </Text>
            </View>
            <Text style={styles.stepTitle}>ML Asset Strategy & Equities</Text>
            <Text style={styles.stepMeta}>
              {recommendation
                ? `Profile: ${recommendation.risk_profile} • ${(recommendation.confidence * 100).toFixed(1)}% Confidence (${recommendation.recommended_stocks.length} Stocks)`
                : "Random Forest multi-factor risk inference & stock basket"}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Step 3 Card */}
        <TouchableOpacity
          style={styles.stepCard}
          activeOpacity={0.85}
          onPress={() => router.push("/guided/breakdown")}
        >
          <View style={[styles.stepIconBox, recommendation && styles.stepIconBoxDone]}>
            <PieChart size={20} color={recommendation ? colors.emerald : colors.gold} />
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeaderRow}>
              <Text style={styles.stepTag}>STEP 03</Text>
              <Text style={[styles.stepStatus, recommendation && styles.stepStatusDone]}>
                {recommendation ? "ALLOCATED" : "LOCKED"}
              </Text>
            </View>
            <Text style={styles.stepTitle}>Deep Portfolio Analytics & Allocation</Text>
            <Text style={styles.stepMeta}>
              {recommendation
                ? "Segmented asset donut ring & rebalancing advisories"
                : "Dynamic weights: Equity, Debt, Gold & Liquid Cash"}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Clean Slate Action */}
        <TouchableOpacity
          style={styles.resetButton}
          activeOpacity={0.8}
          onPress={handleReset}
        >
          <RotateCcw size={16} color={colors.textMuted} />
          <Text style={styles.resetButtonText}>RESTORE CLEAN SLATE STATE</Text>
        </TouchableOpacity>

        {/* In-App Version Badge */}
        <VersionBadge />
      </ScrollView>

      {/* Profile Sidebar Drawer */}
      <ProfileDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Auth Gate Modal */}
      <AuthModal />
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
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 40,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginBottom: 20,
      paddingVertical: 4,
    },
    titleColumn: {
      flex: 1,
      paddingRight: 12,
    },
    preTitle: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
    },
    mainTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "700",
      marginTop: 2,
    },
    actionGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    profileBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderAccent,
    },
    profileBadgeText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.3,
      maxWidth: 96,
    },
    themeToggleBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    niftyPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    livePulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.emerald,
    },
    niftyLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    niftyPrice: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "800",
    },
    niftyDelta: {
      fontSize: 10,
      fontWeight: "700",
    },
    kineticCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      backgroundColor: colors.bgSurface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 16,
      marginBottom: 24,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: colors.isDark ? 0.35 : 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    kineticRingWrapper: {
      width: 136,
      height: 136,
      alignItems: "center",
      justifyContent: "center",
    },
    ringCenterText: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    ringValueText: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    ringLabelText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
      marginTop: 1,
    },
    kineticInfo: {
      flex: 1,
    },
    kineticTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: colors.goldSubtle,
      marginBottom: 6,
    },
    kineticTagText: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    kineticTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "800",
      lineHeight: 18,
    },
    kineticDesc: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 4,
    },
    kineticActionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 8,
    },
    kineticActionText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "700",
    },
    sectionHeader: {
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "800",
    },
    sectionSubtitle: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    stepCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.bgSurface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 14,
      marginBottom: 12,
    },
    stepIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.goldSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    stepIconBoxDone: {
      backgroundColor: colors.emeraldSubtle,
    },
    stepContent: {
      flex: 1,
    },
    stepHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 2,
    },
    stepTag: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    stepStatus: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    stepStatusDone: {
      color: colors.emerald,
    },
    stepTitle: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    stepMeta: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      marginTop: 12,
      backgroundColor: colors.bgSurface,
    },
    resetButtonText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
    },
  });
