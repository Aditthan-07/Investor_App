import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Dimensions,
} from "react-native";
import {
  User,
  X,
  ShieldCheck,
  CreditCard,
  DollarSign,
  Activity,
  Trash2,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { formatINR, formatIndianCurrencyPreview } from "../utils/formatters";

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.85, 340);

export function ProfileDrawer({ visible, onClose }: ProfileDrawerProps) {
  const {
    colors,
    currentUser,
    salary,
    creditScore,
    hasLoan,
    loanAmount,
    emergencyFund,
    healthResult,
    isAudited,
    clearCurrentProfile,
    logout,
    setAuthModalVisible,
  } = useApp();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClearData = () => {
    Alert.alert(
      "Clear Financial Profile",
      "Are you sure you want to delete all saved balance sheet figures and audit scores for this account? This will restore clean slate defaults.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            await clearCurrentProfile();
            onClose();
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to end your current session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          onClose();
          await logout();
        },
      },
    ]);
  };

  const isGuest = !currentUser || currentUser === "Guest" || currentUser === "Guest Investor";
  const usernameDisplay = isGuest ? "Guest Investor" : currentUser;
  const userRoleLabel = isGuest ? "Guest Investor" : "Institutional User";

  const userInitials = isGuest
    ? "GI"
    : (currentUser.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "IP");

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop tap to close */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Slide-in Drawer Container */}
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: colors.bgSurfaceElevated,
              borderColor: colors.borderSubtle,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.drawerContent}
          >
            {/* Drawer Header with Close Button */}
            <View style={styles.headerRow}>
              <View style={[styles.avatarBox, { backgroundColor: colors.goldSubtle, borderColor: colors.borderAccent }]}>
                <Text style={[styles.avatarText, { color: colors.gold }]}>{userInitials}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.profileCategory, { color: colors.gold }]}>INVESTOR PROFILE</Text>
                <Text numberOfLines={1} style={[styles.userName, { color: colors.textPrimary }]}>
                  {usernameDisplay}
                </Text>
                <View style={styles.sessionBadge}>
                  <View style={[styles.sessionDot, { backgroundColor: colors.emerald }]} />
                  <Text style={[styles.sessionText, { color: colors.emerald }]}>
                    {userRoleLabel.toUpperCase()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Solvency Audit Status Card */}
            <View
              style={[
                styles.auditCard,
                {
                  backgroundColor: colors.bgSurface,
                  borderColor: isAudited ? colors.borderAccent : colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <ShieldCheck size={14} color={isAudited ? colors.gold : colors.textMuted} />
                <Text style={[styles.cardHeaderTitle, { color: colors.gold }]}>SOLVENCY AUDIT STATUS</Text>
              </View>

              {isAudited && healthResult ? (
                <View style={styles.auditBody}>
                  <View style={styles.tierRow}>
                    <Text style={[styles.tierName, { color: colors.textPrimary }]}>
                      {healthResult.health_tier} Solvency
                    </Text>
                    <View
                      style={[
                        styles.tierPill,
                        {
                          backgroundColor:
                            healthResult.health_tier.toUpperCase() === "POOR"
                              ? colors.crimsonSubtle
                              : healthResult.health_tier.toUpperCase() === "FAIR"
                              ? colors.amberSubtle
                              : colors.emeraldSubtle,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tierPillText,
                          {
                            color:
                              healthResult.health_tier.toUpperCase() === "POOR"
                                ? colors.crimson
                                : healthResult.health_tier.toUpperCase() === "FAIR"
                                ? colors.amber
                                : colors.emerald,
                          },
                        ]}
                      >
                        {healthResult.health_score} / 7 INDEX
                      </Text>
                    </View>
                  </View>
                  <Text numberOfLines={3} style={[styles.auditDesc, { color: colors.textSecondary }]}>
                    {healthResult.recommendation_summary}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyAuditBody}>
                  <Text style={[styles.emptyAuditText, { color: colors.textMuted }]}>
                    No solvency audit completed yet. Tap "Step 1" on Executive Desk to evaluate capacity.
                  </Text>
                </View>
              )}
            </View>

            {/* Saved Balance Sheet Parameters */}
            <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
              PERSISTENT BALANCE SHEET
            </Text>

            <View style={[styles.metricsCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
              {/* Metric: Income */}
              <View style={styles.metricRow}>
                <View style={styles.metricLabelGroup}>
                  <DollarSign size={14} color={colors.gold} />
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Annual Salary</Text>
                </View>
                <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                  {salary ? formatIndianCurrencyPreview(salary) : "Not Set"}
                </Text>
              </View>
              <View style={[styles.metricDivider, { backgroundColor: colors.borderSubtle }]} />

              {/* Metric: CIBIL */}
              <View style={styles.metricRow}>
                <View style={styles.metricLabelGroup}>
                  <CreditCard size={14} color={colors.gold} />
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>CIBIL Score</Text>
                </View>
                <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                  {creditScore ? `${creditScore} / 900` : "Not Set"}
                </Text>
              </View>
              <View style={[styles.metricDivider, { backgroundColor: colors.borderSubtle }]} />

              {/* Metric: Debt */}
              <View style={styles.metricRow}>
                <View style={styles.metricLabelGroup}>
                  <Activity size={14} color={colors.gold} />
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Active Debt</Text>
                </View>
                <Text style={[styles.metricValue, { color: hasLoan && loanAmount > 0 ? formatINR(loanAmount) : "Zero Debt" }]}>
                  {hasLoan && loanAmount > 0 ? formatINR(loanAmount) : "None"}
                </Text>
              </View>
              <View style={[styles.metricDivider, { backgroundColor: colors.borderSubtle }]} />

              {/* Metric: Emergency Reserve */}
              <View style={styles.metricRow}>
                <View style={styles.metricLabelGroup}>
                  <ShieldCheck size={14} color={colors.gold} />
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Emergency Reserve</Text>
                </View>
                <Text style={[styles.metricValue, { color: emergencyFund ? colors.emerald : colors.crimson }]}>
                  {emergencyFund ? "Secured (≥ 3M)" : "Unfunded"}
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
              ACCOUNT CONTROLS
            </Text>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}
              onPress={handleClearData}
              activeOpacity={0.7}
            >
              <View style={styles.actionBtnLeft}>
                <Trash2 size={16} color={colors.amber} />
                <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
                  Clear Saved Financial Data
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}
              onPress={() => {
                onClose();
                setAuthModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.actionBtnLeft}>
                <User size={16} color={colors.gold} />
                <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
                  Switch User Account
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signOutBtn, { backgroundColor: colors.crimsonSubtle, borderColor: colors.crimson }]}
              onPress={handleSignOut}
              activeOpacity={0.75}
            >
              <LogOut size={16} color={colors.crimson} />
              <Text style={[styles.signOutText, { color: colors.crimson }]}>Sign Out of FinSight</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  drawerContainer: {
    height: "100%",
    borderRightWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 25,
  },
  drawerContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  profileCategory: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sessionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sessionText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  auditCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  auditBody: {
    marginTop: 2,
  },
  tierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  tierName: {
    fontSize: 15,
    fontWeight: "800",
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  auditDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  emptyAuditBody: {
    paddingVertical: 4,
  },
  emptyAuditText: {
    fontSize: 11,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  metricsCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  metricLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  metricDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  actionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  actionBtnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
