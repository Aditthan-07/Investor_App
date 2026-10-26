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
  Alert,
  Animated,
  Keyboard,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import {
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  CreditCard,
  Activity,
  Sparkles,
  ChevronRight,
  Info,
  AlertTriangle,
} from "lucide-react-native";
import { useApp } from "../../src/context/AppContext";
import { ThemeColors } from "../../src/theme/colors";
import {
  formatIndianCurrencyPreview,
  formatINR,
  getCibilCategory,
} from "../../src/utils/formatters";

// 5-Axis Polygon Radar Component
function SolvencyRadar({
  metrics,
  colors,
}: {
  metrics: Array<{ subject: string; score: number }>;
  colors: ThemeColors;
}) {
  const svgWidth = 320;
  const svgHeight = 248;
  const cx = 160;
  const cy = 120;
  const maxR = 76;
  const numAxes = 5;

  const levels = [0.33, 0.66, 1.0];
  const gridPolygons = levels.map((lvl) => {
    return Array.from({ length: numAxes }, (_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
      const x = cx + Math.cos(angle) * maxR * lvl;
      const y = cy + Math.sin(angle) * maxR * lvl;
      return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
    }).join(" ");
  });

  const spokes = Array.from({ length: numAxes }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
    return {
      x2: cx + Math.cos(angle) * maxR,
      y2: cy + Math.sin(angle) * maxR,
    };
  });

  const axisData = Array.from({ length: numAxes }, (_, i) => {
    const metric = metrics[i] || { subject: `Axis ${i + 1}`, score: 70 };
    const score = Math.max(0, Math.min(100, metric.score));
    const r = Math.max(14, (score / 100) * maxR);
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    return {
      subject: metric.subject,
      score,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    };
  });

  const dataPoints = axisData.map((d) => `${d.x},${d.y}`).join(" ");

  const labelPositions = [
    { x: cx, y: cy - maxR - 8, anchor: "middle" },
    { x: cx + maxR + 10, y: cy - 12, anchor: "start" },
    { x: cx + maxR - 6, y: cy + maxR + 16, anchor: "start" },
    { x: cx - maxR + 6, y: cy + maxR + 16, anchor: "end" },
    { x: cx - maxR - 10, y: cy - 12, anchor: "end" },
  ];

  const gridStroke = colors.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.12)";

  return (
    <View style={{ alignItems: "center", justifyContent: "center", marginVertical: 8 }}>
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {/* Concentric Guide Pentagons */}
        {gridPolygons.map((pts, idx) => (
          <Polygon
            key={`grid-${idx}`}
            points={pts}
            fill="none"
            stroke={gridStroke}
            strokeWidth={1}
          />
        ))}

        {/* 5 Radial Spokes */}
        {spokes.map((spoke, idx) => (
          <Line
            key={`spoke-${idx}`}
            x1={cx}
            y1={cy}
            x2={spoke.x2}
            y2={spoke.y2}
            stroke={gridStroke}
            strokeWidth={1}
          />
        ))}

        {/* Filled Data Polygon */}
        <Polygon
          points={dataPoints}
          fill={colors.emeraldSubtle}
          stroke={colors.emerald}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />

        {/* Vertex Highlight Points */}
        {axisData.map((pt, idx) => (
          <Circle
            key={`dot-${idx}`}
            cx={pt.x}
            cy={pt.y}
            r={4.5}
            fill={colors.emerald}
            stroke={colors.gold}
            strokeWidth={1.5}
          />
        ))}

        {/* Axis Labels & Values */}
        {axisData.map((axis, idx) => {
          const pos = labelPositions[idx];
          return (
            <SvgText
              key={`label-${idx}`}
              x={pos.x}
              y={pos.y}
              fontSize={10}
              fontWeight="700"
              fill={colors.textSecondary}
              textAnchor={pos.anchor as any}
            >
              {axis.subject} ({Math.round(axis.score)}%)
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

export default function HealthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    colors,
    salary,
    setSalary,
    creditScore,
    setCreditScore,
    hasLoan,
    setHasLoan,
    loanAmount,
    setLoanAmount,
    emergencyFund,
    setEmergencyFund,
    healthResult,
    evaluatingHealth,
    auditSolvency,
    saveCurrentInputs,
  } = useApp();

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Local text input states to allow smooth typing
  const [salaryInput, setSalaryInput] = useState<string>(
    salary !== null ? String(salary) : ""
  );
  const [creditInput, setCreditInput] = useState<string>(
    creditScore !== null ? String(creditScore) : ""
  );
  const [loanInput, setLoanInput] = useState<string>(
    loanAmount > 0 ? String(loanAmount) : ""
  );
  const [showPoorWarningModal, setShowPoorWarningModal] = useState<boolean>(false);

  // Synchronize inputs when hydrated from persistent storage
  useEffect(() => {
    if (salary !== null && (!salaryInput || salaryInput === "0")) setSalaryInput(String(salary));
    if (creditScore !== null && (!creditInput || creditInput === "0")) setCreditInput(String(creditScore));
    if (loanAmount > 0 && (!loanInput || loanInput === "0")) setLoanInput(String(loanAmount));
  }, [salary, creditScore, loanAmount]);

  // Auto-persist balance sheet updates to local storage under active user
  useEffect(() => {
    saveCurrentInputs({
      salary,
      creditScore,
      hasLoan,
      loanAmount: hasLoan ? loanAmount : 0,
      emergencyFund,
    });
  }, [salary, creditScore, hasLoan, loanAmount, emergencyFund]);

  // Smooth opacity & slide animation on evaluation reveal
  const resultFadeAnim = useRef(new Animated.Value(healthResult ? 1 : 0)).current;
  const resultSlideAnim = useRef(new Animated.Value(healthResult ? 0 : 16)).current;

  useEffect(() => {
    if (healthResult) {
      Animated.parallel([
        Animated.timing(resultFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(resultSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [healthResult]);

  const numericSalary = parseFloat(salaryInput) || 0;
  const numericCredit = parseInt(creditInput, 10) || 0;
  const numericLoan = parseFloat(loanInput) || 0;

  const cibilInfo =
    numericCredit >= 300 && numericCredit <= 900
      ? getCibilCategory(numericCredit)
      : null;

  const handleSalaryChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setSalaryInput(cleaned);
    setSalary(cleaned ? parseFloat(cleaned) : null);
  };

  const handleCreditChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setCreditInput(cleaned);
    setCreditScore(cleaned ? parseInt(cleaned, 10) : null);
  };

  const handleLoanChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setLoanInput(cleaned);
    setLoanAmount(cleaned ? parseFloat(cleaned) : 0);
  };

  const addSalary = (addition: number) => {
    Keyboard.dismiss();
    const next = (numericSalary + addition).toString();
    setSalaryInput(next);
    setSalary(parseFloat(next));
  };

  const addLoan = (addition: number) => {
    Keyboard.dismiss();
    const next = (numericLoan + addition).toString();
    setLoanInput(next);
    setLoanAmount(parseFloat(next));
  };

  const handleAudit = async () => {
    Keyboard.dismiss();
    if (!salary || salary <= 0) {
      Alert.alert("Input Required", "Please enter your valid annual salary in INR.");
      return;
    }
    if (!creditScore || creditScore < 300 || creditScore > 900) {
      Alert.alert(
        "Invalid CIBIL Score",
        "Please enter a valid CIBIL credit score between 300 and 900."
      );
      return;
    }

    try {
      await auditSolvency();
    } catch (err: any) {
      Alert.alert("Audit Error", err.message || "Failed to contact evaluation engine");
    }
  };

  const getTierColor = (tier: string) => {
    const upper = tier.toUpperCase();
    if (upper.includes("GOOD")) return colors.emerald;
    if (upper.includes("FAIR")) return colors.amber;
    return colors.crimson;
  };

  const handleProceed = () => {
    if (!healthResult) return;
    if (healthResult.health_tier.toUpperCase() === "POOR") {
      setShowPoorWarningModal(true);
    } else {
      router.push("/guided/strategy");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 24) }]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {/* Navigation Header */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 01 OF 03</Text>
          </View>
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.eyebrow}>FOUNDATIONAL METRICS</Text>
          <Text style={styles.mainTitle}>Solvency & Capacity</Text>
          <Text style={styles.subtitle}>
            Enter your authentic financial parameters. FinSight will evaluate institutional debt coverage and solvency resilience.
          </Text>
        </View>

        {/* Input Card 1: Annual Income */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBox}>
              <DollarSign size={16} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Annual Compensation (INR)</Text>
              <Text style={styles.cardSubtitle}>Gross annual taxable income</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1200000"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={salaryInput}
              onChangeText={handleSalaryChange}
            />
          </View>

          {numericSalary > 0 && (
            <Text style={styles.previewText}>
              In Words: {formatIndianCurrencyPreview(numericSalary)}
            </Text>
          )}

          {/* Quick-add Chips */}
          <View style={styles.chipRow}>
            <TouchableOpacity style={styles.chip} onPress={() => addSalary(200000)}>
              <Text style={styles.chipText}>+₹2 Lakh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => addSalary(500000)}>
              <Text style={styles.chipText}>+₹5 Lakh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => addSalary(1000000)}>
              <Text style={styles.chipText}>+₹10 Lakh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Card 2: CIBIL Score */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBox}>
              <CreditCard size={16} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>CIBIL / Credit Score</Text>
              <Text style={styles.cardSubtitle}>Credit bureau score (300 - 900)</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { paddingLeft: 14 }]}
              placeholder="e.g. 780"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
              value={creditInput}
              onChangeText={handleCreditChange}
            />

            {cibilInfo && (
              <View
                style={[
                  styles.cibilBadge,
                  { backgroundColor: `${cibilInfo.color}20`, borderColor: cibilInfo.color },
                ]}
              >
                <Text style={[styles.cibilBadgeText, { color: cibilInfo.color }]}>
                  {cibilInfo.label}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cibilScale}>
            <View style={[styles.cibilBarSegment, { backgroundColor: "#EF4444" }]} />
            <View style={[styles.cibilBarSegment, { backgroundColor: "#F59E0B" }]} />
            <View style={[styles.cibilBarSegment, { backgroundColor: colors.gold }]} />
            <View style={[styles.cibilBarSegment, { backgroundColor: colors.emerald }]} />
          </View>
          <View style={styles.cibilScaleLabels}>
            <Text style={styles.cibilScaleText}>300 Poor</Text>
            <Text style={styles.cibilScaleText}>600 Fair</Text>
            <Text style={styles.cibilScaleText}>750+ Prime</Text>
            <Text style={styles.cibilScaleText}>900</Text>
          </View>
        </View>

        {/* Debt & Emergency Fund Toggles */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Active Debt / Loans</Text>
              <Text style={styles.toggleSubtitle}>
                Car loans, personal loans, or ongoing EMIs
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, hasLoan && styles.toggleBtnActive]}
              onPress={() => setHasLoan(!hasLoan)}
            >
              <Text style={[styles.toggleBtnText, hasLoan && styles.toggleBtnTextActive]}>
                {hasLoan ? "YES" : "NO"}
              </Text>
            </TouchableOpacity>
          </View>

          {hasLoan && (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.miniLabel}>TOTAL OUTSTANDING DEBT (INR)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 500000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  value={loanInput}
                  onChangeText={handleLoanChange}
                />
              </View>

              {numericLoan > 0 && (
                <Text style={styles.previewText}>
                  In Words: {formatIndianCurrencyPreview(numericLoan)} total principal
                </Text>
              )}

              {/* Quick-add Chips */}
              <View style={styles.chipRow}>
                <TouchableOpacity style={styles.chip} onPress={() => addLoan(100000)}>
                  <Text style={styles.chipText}>+₹1 Lakh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => addLoan(500000)}>
                  <Text style={styles.chipText}>+₹5 Lakh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => addLoan(1000000)}>
                  <Text style={styles.chipText}>+₹10 Lakh</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={[styles.divider, { marginVertical: 14 }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Emergency Buffer</Text>
              <Text style={styles.toggleSubtitle}>
                Savings covering at least 3 months expenses
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, emergencyFund && styles.toggleBtnActive]}
              onPress={() => setEmergencyFund(!emergencyFund)}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  emergencyFund && styles.toggleBtnTextActive,
                ]}
              >
                {emergencyFund ? "YES" : "NO"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Run Solvency Evaluation Button */}
        <TouchableOpacity
          style={styles.auditButton}
          activeOpacity={0.85}
          onPress={handleAudit}
          disabled={evaluatingHealth}
        >
          {evaluatingHealth ? (
            <ActivityIndicator color={colors.isDark ? colors.bgPrimary : "#FFFFFF"} />
          ) : (
            <>
              <ShieldCheck size={18} color={colors.isDark ? colors.bgPrimary : "#FFFFFF"} />
              <Text style={styles.auditButtonText}>
                {healthResult ? "RE-AUDIT SOLVENCY PROFILE" : "RUN SOLVENCY EVALUATION"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Evaluation Summary & Immediate Unmissable Navigation CTA */}
        {healthResult ? (
          <Animated.View
            style={[
              styles.resultContainer,
              {
                opacity: resultFadeAnim,
                transform: [{ translateY: resultSlideAnim }],
              },
            ]}
          >
            {/* Primary Evaluation Summary Card with Embedded Step 2 CTA */}
            <View style={styles.summaryCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.resultEyebrow}>EVALUATION OUTCOME</Text>
                  <View style={styles.tierBadgeRow}>
                    <View
                      style={[
                        styles.tierIndicatorDot,
                        { backgroundColor: getTierColor(healthResult.health_tier) },
                      ]}
                    />
                    <Text style={[styles.resultTier, { color: getTierColor(healthResult.health_tier) }]}>
                      TIER: {healthResult.health_tier.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.scorePill}>
                  <Sparkles size={12} color={colors.gold} />
                  <Text style={styles.scorePillText}>
                    {healthResult.health_score} / 7 PTS
                  </Text>
                </View>
              </View>

              <Text style={styles.resultSummary}>
                {healthResult.recommendation_summary}
              </Text>
            </View>

            {/* 5-Axis Polygon Radar */}
            <View style={styles.radarCard}>
              <View style={styles.radarHeader}>
                <Activity size={14} color={colors.emerald} />
                <Text style={styles.radarTitle}>5-Axis Solvency Polygon Radar</Text>
              </View>
              <SolvencyRadar metrics={healthResult.radar_metrics} colors={colors} />
            </View>

            {/* Radar Metrics Progress Bars */}
            <View style={styles.metricsList}>
              <Text style={styles.metricsTitle}>Parameter Contributions</Text>
              {healthResult.radar_metrics.map((metric, idx) => (
                <View key={idx} style={styles.metricItem}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricSubject}>{metric.subject}</Text>
                    <Text style={styles.metricScore}>{Math.round(metric.score)}%</Text>
                  </View>
                  <View style={styles.metricTrack}>
                    <View
                      style={[
                        styles.metricFill,
                        {
                          width: `${metric.score}%`,
                          backgroundColor:
                            metric.score >= 70
                              ? colors.emerald
                              : metric.score >= 50
                              ? colors.gold
                              : colors.crimson,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Cautionary Banner if Solvency Profile is POOR */}
            {healthResult.health_tier.toUpperCase() === "POOR" && (
              <View style={styles.cautionBanner}>
                <View style={styles.cautionBannerHeader}>
                  <AlertTriangle size={18} color={colors.amber} />
                  <Text style={styles.cautionBannerTitle}>Solvency Profile Alert</Text>
                </View>
                <Text style={styles.cautionText}>
                  Caution: Your solvency profile indicates high vulnerability. Deploying capital into volatile equities carries significant risk before high-interest liabilities are cleared and emergency cash is secured.
                </Text>
              </View>
            )}

            {/* Primary Navigation CTA */}
            <TouchableOpacity
              style={styles.proceedButton}
              activeOpacity={0.85}
              onPress={handleProceed}
            >
              <Text style={styles.proceedButtonText}>
                Proceed to Step 2: Strategy & Equities →
              </Text>
              <ArrowRight size={18} color={colors.isDark ? colors.bgPrimary : "#FFFFFF"} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          /* Subtle persistent guide card when not yet evaluated */
          <View style={styles.unverifiedCard}>
            <Info size={16} color={colors.gold} />
            <Text style={styles.unverifiedText}>
              Click <Text style={{ color: colors.gold, fontWeight: "700" }}>RUN SOLVENCY EVALUATION</Text> above to evaluate debt capacity and unlock Step 2: ML Strategy & Equities.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Solvency Vulnerability Caution Modal */}
      <Modal
        visible={showPoorWarningModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPoorWarningModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <AlertTriangle size={28} color={colors.amber} />
            </View>
            <Text style={styles.modalTitle}>Vulnerable Solvency Warning</Text>
            <Text style={styles.modalBody}>
              Your solvency profile indicates high vulnerability. Financial advisory principles recommend clearing high-interest debt and securing 3-6 months of emergency reserves before deploying capital into volatile equity markets.
              {"\n\n"}
              Do you still wish to proceed with equity allocation models?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                activeOpacity={0.7}
                onPress={() => setShowPoorWarningModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Review Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalProceedBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setShowPoorWarningModal(false);
                  router.push("/guided/strategy");
                }}
              >
                <Text style={styles.modalProceedBtnText}>Proceed Anyway</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
      paddingBottom: 60,
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
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colors.isDark ? 0.3 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    cardIconBox: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.goldSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    cardSubtitle: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 1,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.bgInput,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingHorizontal: 12,
      height: 48,
    },
    currencyPrefix: {
      color: colors.gold,
      fontSize: 18,
      fontWeight: "700",
      marginRight: 6,
    },
    input: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "600",
    },
    previewText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "600",
      marginTop: 8,
      paddingLeft: 4,
    },
    chipRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.bgSurfaceElevated,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },
    cibilBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
    },
    cibilBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    cibilScale: {
      flexDirection: "row",
      height: 4,
      borderRadius: 2,
      overflow: "hidden",
      gap: 3,
      marginTop: 12,
    },
    cibilBarSegment: {
      flex: 1,
      height: "100%",
    },
    cibilScaleLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 6,
    },
    cibilScaleText: {
      color: colors.textMuted,
      fontSize: 10,
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    toggleTitle: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    toggleSubtitle: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    toggleBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: colors.bgSurfaceElevated,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    toggleBtnActive: {
      backgroundColor: colors.gold,
      borderColor: colors.gold,
    },
    toggleBtnText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    toggleBtnTextActive: {
      color: colors.isDark ? colors.bgPrimary : "#FFFFFF",
    },
    miniLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderSubtle,
    },
    auditButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.gold,
      paddingVertical: 14,
      borderRadius: 14,
      marginBottom: 16,
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    auditButtonText: {
      color: colors.isDark ? colors.bgPrimary : "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    resultContainer: {
      marginBottom: 20,
    },
    summaryCard: {
      backgroundColor: colors.bgSurface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderAccent,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    resultEyebrow: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
    },
    tierBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
    },
    tierIndicatorDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    resultTier: {
      fontSize: 16,
      fontWeight: "800",
    },
    scorePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: colors.goldSubtle,
      borderWidth: 1,
      borderColor: colors.borderAccent,
    },
    scorePillText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "800",
    },
    resultSummary: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 6,
      marginBottom: 14,
    },
    proceedButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.emerald,
      paddingVertical: 15,
      borderRadius: 14,
      shadowColor: colors.emerald,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    proceedButtonText: {
      color: colors.isDark ? colors.bgPrimary : "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.6,
    },
    unverifiedCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.bgSurface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 14,
      marginBottom: 16,
    },
    unverifiedText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    radarCard: {
      backgroundColor: colors.bgSurface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 14,
      marginBottom: 16,
      alignItems: "center",
    },
    radarHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      marginBottom: 4,
    },
    radarTitle: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
    },
    metricsList: {
      backgroundColor: colors.bgSurface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 16,
      marginBottom: 16,
    },
    metricsTitle: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    metricItem: {
      marginBottom: 10,
    },
    metricRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    metricSubject: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    metricScore: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "700",
    },
    metricTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.bgSurfaceElevated,
      overflow: "hidden",
    },
    metricFill: {
      height: "100%",
      borderRadius: 2,
    },
    cautionBanner: {
      backgroundColor: `${colors.amber}15`,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: `${colors.amber}50`,
      padding: 14,
      marginBottom: 16,
    },
    cautionBannerHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    cautionBannerTitle: {
      color: colors.amber,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    cautionText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    modalContent: {
      width: "100%",
      maxWidth: 380,
      backgroundColor: colors.bgSurface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: `${colors.amber}50`,
      padding: 22,
      alignItems: "center",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    modalIconBox: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: `${colors.amber}20`,
      borderWidth: 1,
      borderColor: `${colors.amber}60`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    modalTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 10,
    },
    modalBody: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      marginBottom: 20,
    },
    modalButtonRow: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    modalCancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.bgSurfaceElevated,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    modalCancelBtnText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "700",
    },
    modalProceedBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.amber,
      alignItems: "center",
      justifyContent: "center",
    },
    modalProceedBtnText: {
      color: "#0F172A",
      fontSize: 13,
      fontWeight: "800",
    },
  });
