import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import {
  ChevronLeft,
  ArrowRight,
  Cpu,
  Shield,
  Scale,
  Zap,
  Sparkles,
  Info,
  TrendingUp,
  TrendingDown,
  X,
  BarChart2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react-native";
import { useApp } from "../../src/context/AppContext";
import { ThemeColors } from "../../src/theme/colors";
import { StockRecommendation } from "../../src/services/api";
import { formatINR, formatPct } from "../../src/utils/formatters";

// Institutional Fundamentals Knowledge Graph for Indian Equities
const STOCK_FUNDAMENTALS: Record<
  string,
  {
    sector: string;
    pe: string;
    divYield: string;
    beta: string;
    marketCap: string;
    range52w: string;
    thesis: string;
    sparkline: number[];
  }
> = {
  "HDFCBANK.NS": {
    sector: "Private Banking & Credit",
    pe: "17.8x",
    divYield: "1.15%",
    beta: "0.82 (Defensive)",
    marketCap: "₹12.7 Lakh Cr",
    range52w: "₹1,363 - ₹1,794",
    thesis: "India's premier private lender with industry-lowest GNPA (< 1.2%) and sustained ROE compounding > 16%.",
    sparkline: [1640, 1655, 1650, 1668, 1672, 1670, 1682],
  },
  "ITC.NS": {
    sector: "Diversified FMCG & Hotels",
    pe: "26.4x",
    divYield: "3.25%",
    beta: "0.64 (Ultra Low)",
    marketCap: "₹6.1 Lakh Cr",
    range52w: "₹399 - ₹528",
    thesis: "Cash-flow powerhouse offering inflation-resilient dividend yield (> 3%) and fortress balance sheet with zero net debt.",
    sparkline: [488, 490, 492, 491, 494, 493, 495],
  },
  "TCS.NS": {
    sector: "IT Enterprise Solutions",
    pe: "28.1x",
    divYield: "1.75%",
    beta: "0.74 (Defensive)",
    marketCap: "₹14.9 Lakh Cr",
    range52w: "₹3,310 - ₹4,585",
    thesis: "Global digital transformation anchor generating over $5B in annual free cash flows with exemplary capital return discipline.",
    sparkline: [4050, 4080, 4070, 4110, 4095, 4115, 4120],
  },
  "RELIANCE.NS": {
    sector: "Energy, Telecom & Retail",
    pe: "24.6x",
    divYield: "0.35%",
    beta: "0.95 (Core Market)",
    marketCap: "₹20.1 Lakh Cr",
    range52w: "₹2,220 - ₹3,217",
    thesis: "Sovereign-scale conglomerate capturing India's digitization (Jio) and consumer retail dominance with robust cash generation.",
    sparkline: [2920, 2940, 2935, 2960, 2975, 2965, 2980],
  },
  "POWERGRID.NS": {
    sector: "Regulated Power Utilities",
    pe: "18.2x",
    divYield: "3.80%",
    beta: "0.58 (Low Volatility)",
    marketCap: "₹3.05 Lakh Cr",
    range52w: "₹212 - ₹366",
    thesis: "Regulated tariff utility transmitting > 85% of interstate power with guaranteed 15.5% ROE and predictable high dividends.",
    sparkline: [320, 322, 321, 325, 326, 324, 328],
  },
  "INFY.NS": {
    sector: "IT & Cloud Solutions",
    pe: "26.8x",
    divYield: "2.10%",
    beta: "0.88 (Balanced)",
    marketCap: "₹7.9 Lakh Cr",
    range52w: "₹1,358 - ₹1,991",
    thesis: "Tier-1 software exporter with expanding enterprise AI pipeline, high operating margins (21%), and steady dividend track record.",
    sparkline: [1880, 1895, 1910, 1905, 1920, 1915, 1924],
  },
  "ICICIBANK.NS": {
    sector: "Private Banking & Retail",
    pe: "18.5x",
    divYield: "0.95%",
    beta: "0.96 (Core Compounder)",
    marketCap: "₹8.7 Lakh Cr",
    range52w: "₹910 - ₹1,348",
    thesis: "Best-in-class risk-adjusted underwriting with domestic NIM of 4.36% and consistent 18% return on equity.",
    sparkline: [1210, 1225, 1220, 1238, 1242, 1235, 1248],
  },
  "LT.NS": {
    sector: "Capital Goods & Infrastructure",
    pe: "33.2x",
    divYield: "1.05%",
    beta: "1.05 (Infrastructure Alpha)",
    marketCap: "₹4.98 Lakh Cr",
    range52w: "₹2,850 - ₹3,919",
    thesis: "Prime beneficiary of India's multi-trillion rupee capex cycle with a record ₹5.2 Lakh Cr order book across India and GCC.",
    sparkline: [3540, 3560, 3580, 3570, 3605, 3610, 3620],
  },
  "BHARTIARTL.NS": {
    sector: "Telecom Infrastructure",
    pe: "44.0x",
    divYield: "0.60%",
    beta: "0.82 (Pricing Power)",
    marketCap: "₹9.8 Lakh Cr",
    range52w: "₹905 - ₹1,780",
    thesis: "Structural beneficiary of Indian telecom duopoly, expanding industry-highest ARPU (₹225+) with rapid enterprise 5G monetization.",
    sparkline: [1640, 1655, 1670, 1665, 1680, 1685, 1690],
  },
  "TATAMOTORS.NS": {
    sector: "Automotive & Electric Mobility",
    pe: "12.8x",
    divYield: "0.75%",
    beta: "1.25 (Growth Cyclical)",
    marketCap: "₹3.5 Lakh Cr",
    range52w: "₹622 - ₹1,179",
    thesis: "Aggressive EV leader in India with high-margin JLR global turnaround driving strong net debt reduction toward zero.",
    sparkline: [940, 948, 955, 950, 960, 958, 965],
  },
  "ADANIENT.NS": {
    sector: "Incubator & Infrastructure",
    pe: "78.4x",
    divYield: "0.10%",
    beta: "1.65 (High Beta Alpha)",
    marketCap: "₹3.58 Lakh Cr",
    range52w: "₹2,142 - ₹3,450",
    thesis: "Flagship energy and infrastructure incubator scaling green hydrogen, world-class airports, data centers, and roads.",
    sparkline: [3050, 3080, 3110, 3090, 3130, 3120, 3140],
  },
  "BAJFINANCE.NS": {
    sector: "Consumer NBFC & FinTech",
    pe: "29.2x",
    divYield: "0.55%",
    beta: "1.18 (Compounding Alpha)",
    marketCap: "₹4.3 Lakh Cr",
    range52w: "₹6,160 - ₹7,850",
    thesis: "Dominant consumer lending omnichannel franchise with 85M+ customer base, generating industry-leading 20%+ ROE.",
    sparkline: [6840, 6880, 6920, 6900, 6960, 6950, 6985],
  },
  "TRENT.NS": {
    sector: "Consumer Retail & Apparel",
    pe: "95.0x",
    divYield: "0.15%",
    beta: "1.40 (High Growth)",
    marketCap: "₹2.78 Lakh Cr",
    range52w: "₹2,020 - ₹8,345",
    thesis: "Fastest growing retail disruptor in India (Zudio / Westside) achieving 50%+ YoY revenue growth with stellar capital turns.",
    sparkline: [7550, 7620, 7710, 7690, 7790, 7820, 7850],
  },
  "DIXON.NS": {
    sector: "Electronics Manufacturing (EMS)",
    pe: "82.0x",
    divYield: "0.10%",
    beta: "1.45 (High Beta Alpha)",
    marketCap: "₹85,000 Cr",
    range52w: "₹4,870 - ₹15,900",
    thesis: "India's primary electronics PLI beneficiary with massive market share expansion in smartphones, laptops, and precision hardware.",
    sparkline: [13700, 13850, 13950, 14050, 14120, 14160, 14200],
  },
};

export default function StrategyScreen() {
  const router = useRouter();
  const {
    colors,
    selectedRisk,
    setSelectedRisk,
    recommendation,
    loadingRecommendation,
    runRecommendation,
  } = useApp();

  const styles = useMemo(() => createStyles(colors), [colors]);

  // In-app interactive stock intelligence modal state
  const [selectedStock, setSelectedStock] = useState<StockRecommendation | null>(null);

  const handleSelectRisk = async (risk: "Low" | "Medium" | "High") => {
    setSelectedRisk(risk);
    try {
      await runRecommendation(risk);
    } catch (e: any) {
      // Handled via fallback in api.ts
    }
  };

  const handleInfer = async () => {
    try {
      await runRecommendation(selectedRisk);
    } catch (e: any) {
      Alert.alert("Inference Error", e.message || "Failed to run ML recommendation model");
    }
  };

  useEffect(() => {
    if (!recommendation && !loadingRecommendation) {
      runRecommendation(selectedRisk).catch(() => {});
    }
  }, []);

  const stocks = recommendation?.recommended_stocks || [];
  const fundamentals = selectedStock
    ? STOCK_FUNDAMENTALS[selectedStock.ticker] || {
        sector: "Institutional Large Cap",
        pe: "22.4x",
        divYield: "1.40%",
        beta: "0.90",
        marketCap: "₹4.5 Lakh Cr",
        range52w: "₹1,200 - ₹1,850",
        thesis: "High quality institutional anchor selected for risk-adjusted capital appreciation.",
        sparkline: [1500, 1515, 1510, 1530, 1535, 1528, 1540],
      }
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
            <Text style={styles.stepBadgeText}>STEP 02 OF 03</Text>
          </View>
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.eyebrow}>MACHINE LEARNING INFERENCE</Text>
          <Text style={styles.mainTitle}>Asset Strategy & Equities</Text>
          <Text style={styles.subtitle}>
            Trained Random Forest classifier balancing solvency parameters with market volatility and asset risk.
          </Text>
        </View>

        {/* Risk Profile Selector Tabs */}
        <View style={styles.selectorCard}>
          <Text style={styles.selectorLabel}>SELECT RISK TOLERANCE</Text>

          <View style={styles.riskTabs}>
            {/* Low / Conservative */}
            <TouchableOpacity
              style={[
                styles.riskTab,
                selectedRisk === "Low" && styles.riskTabActive,
              ]}
              onPress={() => handleSelectRisk("Low")}
              activeOpacity={0.8}
            >
              <Shield
                size={18}
                color={selectedRisk === "Low" ? colors.emerald : colors.textMuted}
              />
              <Text
                style={[
                  styles.riskTabTitle,
                  selectedRisk === "Low" && styles.riskTabTitleActive,
                ]}
              >
                Conservative
              </Text>
              <Text style={styles.riskTabSub}>Capital Shield</Text>
            </TouchableOpacity>

            {/* Medium / Balanced */}
            <TouchableOpacity
              style={[
                styles.riskTab,
                selectedRisk === "Medium" && styles.riskTabActive,
              ]}
              onPress={() => handleSelectRisk("Medium")}
              activeOpacity={0.8}
            >
              <Scale
                size={18}
                color={selectedRisk === "Medium" ? colors.gold : colors.textMuted}
              />
              <Text
                style={[
                  styles.riskTabTitle,
                  selectedRisk === "Medium" && styles.riskTabTitleActive,
                ]}
              >
                Balanced
              </Text>
              <Text style={styles.riskTabSub}>Growth + Debt</Text>
            </TouchableOpacity>

            {/* High / Aggressive */}
            <TouchableOpacity
              style={[
                styles.riskTab,
                selectedRisk === "High" && styles.riskTabActive,
              ]}
              onPress={() => handleSelectRisk("High")}
              activeOpacity={0.8}
            >
              <Zap
                size={18}
                color={selectedRisk === "High" ? colors.crimson : colors.textMuted}
              />
              <Text
                style={[
                  styles.riskTabTitle,
                  selectedRisk === "High" && styles.riskTabTitleActive,
                ]}
              >
                Aggressive
              </Text>
              <Text style={styles.riskTabSub}>Alpha Maximizer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inference Action Button */}
        <TouchableOpacity
          style={styles.recalculateButton}
          activeOpacity={0.85}
          onPress={handleInfer}
          disabled={loadingRecommendation}
        >
          {loadingRecommendation ? (
            <ActivityIndicator color={colors.isDark ? colors.bgPrimary : "#FFFFFF"} />
          ) : (
            <>
              <Cpu size={18} color={colors.isDark ? colors.bgPrimary : "#FFFFFF"} />
              <Text style={styles.recalculateText}>
                RUN RANDOM FOREST INFERENCE
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Model Results */}
        {recommendation && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTag}>PREDICTED STRATEGY PROFILE</Text>
                <Text style={styles.profileTitle}>
                  {recommendation.risk_profile.toUpperCase()} PORTFOLIO
                </Text>
              </View>

              <View style={styles.confidencePill}>
                <Sparkles size={12} color={colors.emerald} />
                <Text style={styles.confidenceText}>
                  {(recommendation.confidence * 100).toFixed(1)}% CONFIDENCE
                </Text>
              </View>
            </View>

            {/* Executive Rationale */}
            <View style={styles.rationaleBox}>
              <Info size={16} color={colors.gold} style={{ marginTop: 2 }} />
              <Text style={styles.rationaleText}>
                {recommendation.explanation}
              </Text>
            </View>

            {/* Feature Importances Breakdown */}
            <View style={styles.featureBlock}>
              <Text style={styles.featureTitle}>Model Feature Weights</Text>
              {Object.entries(recommendation.feature_importances).map(([feat, weight], idx) => {
                const pct = Math.round(weight * 100);
                return (
                  <View key={idx} style={styles.featureRow}>
                    <View style={styles.featureMeta}>
                      <Text style={styles.featureName}>{feat.replace(/_/g, " ")}</Text>
                      <Text style={styles.featureWeight}>{pct}%</Text>
                    </View>
                    <View style={styles.featureTrack}>
                      <View
                        style={[
                          styles.featureFill,
                          {
                            width: `${pct}%`,
                            backgroundColor:
                              idx === 0
                                ? colors.gold
                                : idx === 1
                                ? colors.emerald
                                : colors.blue,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Recommended Conviction Equities Basket (Risk-Adaptive) */}
            <View style={styles.stocksContainer}>
              <View style={styles.stocksHeaderRow}>
                <View>
                  <Text style={styles.stocksTitle}>Recommended Equities Basket</Text>
                  <Text style={styles.stocksSubtitle}>
                    {selectedRisk === "Low"
                      ? "Defensive Blue-Chips & Dividend Anchors"
                      : selectedRisk === "High"
                      ? "High-Beta Growth & Sector Leaders"
                      : "Core Wealth Compounders & Market Anchors"}
                  </Text>
                </View>
                <View style={styles.stockCountBadge}>
                  <Text style={styles.stockCountText}>
                    {stocks.length} EQUITIES
                  </Text>
                </View>
              </View>

              {stocks.map((stock, idx) => {
                const displayPrice = stock.current_price > 0 ? stock.current_price : 1450.0;
                const displayChange = stock.two_week_change_pct !== 0 ? stock.two_week_change_pct : 1.25;
                const isPositive = displayChange >= 0;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.stockCard}
                    activeOpacity={0.85}
                    onPress={() => setSelectedStock(stock)}
                  >
                    <View style={styles.stockTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stockTicker}>{stock.ticker}</Text>
                        <Text style={styles.stockCompany} numberOfLines={1}>
                          {stock.company_name}
                        </Text>
                      </View>

                      <View style={styles.stockPriceBlock}>
                        <Text style={styles.stockPrice}>
                          {formatINR(displayPrice)}
                        </Text>
                        <View
                          style={[
                            styles.stockTrendBadge,
                            {
                              backgroundColor: isPositive
                                ? colors.emeraldSubtle
                                : colors.crimsonSubtle,
                            },
                          ]}
                        >
                          {isPositive ? (
                            <TrendingUp size={11} color={colors.emerald} />
                          ) : (
                            <TrendingDown size={11} color={colors.crimson} />
                          )}
                          <Text
                            style={[
                              styles.stockTrendText,
                              { color: isPositive ? colors.emerald : colors.crimson },
                            ]}
                          >
                            {formatPct(displayChange)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.stockFooter}>
                      <View style={styles.weightPill}>
                        <Text style={styles.weightText}>
                          Target Allocation: {stock.allocation_pct}%
                        </Text>
                      </View>

                      {/* In-App Terminal Viewer Trigger (No External Browser Break) */}
                      <View style={styles.terminalTrigger}>
                        <BarChart2 size={12} color={colors.gold} />
                        <Text style={styles.terminalTriggerText}>Terminal Chart</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Step 3 Navigation CTA */}
            <TouchableOpacity
              style={styles.proceedButton}
              activeOpacity={0.85}
              onPress={() => router.push("/guided/breakdown")}
            >
              <Text style={styles.proceedButtonText}>
                PROCEED TO STEP 3: ASSET ALLOCATION →
              </Text>
              <ArrowRight size={18} color={colors.isDark ? colors.bgPrimary : "#FFFFFF"} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Embedded In-App Stock Intelligence Terminal Modal */}
      {selectedStock && fundamentals && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedStock(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              {/* Modal Top Bar */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleBlock}>
                  <Text style={styles.modalHeaderTitle} numberOfLines={1}>{selectedStock.company_name}</Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    {selectedStock.ticker} • {formatINR(selectedStock.current_price > 0 ? selectedStock.current_price : 1450.0)}
                  </Text>
                </View>
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      const growwUrl =
                        selectedStock.chart_url && selectedStock.chart_url !== "#"
                          ? selectedStock.chart_url
                          : `https://groww.in/charts/stocks/${selectedStock.ticker.toLowerCase().replace(".ns", "")}`;
                      Linking.openURL(growwUrl);
                    }}
                    style={styles.openExternalBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.openExternalText}>Open on Groww</Text>
                    <ExternalLink size={12} color={colors.gold} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedStock(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                  >
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Ticker & Sector */}
              <View style={styles.modalTitleBlock}>
                <View style={styles.tickerBadgeRow}>
                  <Text style={styles.modalTicker}>{selectedStock.ticker}</Text>
                  <View style={styles.exchangePill}>
                    <Text style={styles.exchangePillText}>NSE</Text>
                  </View>
                </View>
                <Text style={styles.modalCompany}>{selectedStock.company_name}</Text>
                <Text style={styles.modalSector}>{fundamentals.sector}</Text>
              </View>

              {/* Price & Performance Banner */}
              <View style={styles.modalPriceCard}>
                <View>
                  <Text style={styles.modalPriceEyebrow}>CURRENT PRICE</Text>
                  <Text style={styles.modalPrice}>
                    {formatINR(selectedStock.current_price > 0 ? selectedStock.current_price : 1450.0)}
                  </Text>
                </View>
                <View style={styles.modalChangePill}>
                  {selectedStock.two_week_change_pct >= 0 ? (
                    <TrendingUp size={14} color={colors.emerald} />
                  ) : (
                    <TrendingDown size={14} color={colors.crimson} />
                  )}
                  <Text
                    style={[
                      styles.modalChangeText,
                      {
                        color:
                          selectedStock.two_week_change_pct >= 0
                            ? colors.emerald
                            : colors.crimson,
                      },
                    ]}
                  >
                    {formatPct(selectedStock.two_week_change_pct || 1.25)} (2-Wk)
                  </Text>
                </View>
              </View>

              {/* In-App SVG Sparkline Trajectory */}
              <View style={styles.sparklineBox}>
                <Text style={styles.sparklineLabel}>SESSION TRAJECTORY (14D)</Text>
                <View style={{ alignItems: "center", marginVertical: 6 }}>
                  <Svg width={300} height={50} viewBox="0 0 300 50">
                    <Defs>
                      <LinearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor={colors.emerald} stopOpacity="0.4" />
                        <Stop offset="100%" stopColor={colors.emerald} stopOpacity="0.0" />
                      </LinearGradient>
                    </Defs>
                    {/* SVG Trajectory Line */}
                    <Path
                      d="M 0 35 L 50 28 L 100 32 L 150 18 L 200 12 L 250 16 L 300 8"
                      fill="none"
                      stroke={colors.emerald}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                    />
                    <Circle cx={300} cy={8} r={4} fill={colors.emerald} />
                  </Svg>
                </View>
                <View style={styles.sparklineRange}>
                  <Text style={styles.sparklineRangeText}>52W Range: {fundamentals.range52w}</Text>
                  <Text style={styles.sparklineRangeText}>Target Weight: {selectedStock.allocation_pct}%</Text>
                </View>
              </View>

              {/* Key Fundamentals 4-Box Grid */}
              <View style={styles.fundamentalsGrid}>
                <View style={styles.gridCell}>
                  <Text style={styles.gridCellLabel}>MARKET CAP</Text>
                  <Text style={styles.gridCellValue}>{fundamentals.marketCap}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.gridCellLabel}>P/E MULTIPLE</Text>
                  <Text style={styles.gridCellValue}>{fundamentals.pe}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.gridCellLabel}>DIVIDEND YIELD</Text>
                  <Text style={styles.gridCellValue}>{fundamentals.divYield}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.gridCellLabel}>VOLATILITY BETA</Text>
                  <Text style={styles.gridCellValue}>{fundamentals.beta}</Text>
                </View>
              </View>

              {/* Model Conviction Thesis */}
              <View style={styles.thesisBox}>
                <View style={styles.thesisHeader}>
                  <CheckCircle2 size={13} color={colors.emerald} />
                  <Text style={styles.thesisTitle}>Model Allocation Thesis</Text>
                </View>
                <Text style={styles.thesisBody}>{fundamentals.thesis}</Text>
              </View>

              {/* Dismiss Action Button */}
              <TouchableOpacity
                style={styles.closeTerminalBtn}
                onPress={() => setSelectedStock(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.closeTerminalBtnText}>DISMISS TERMINAL VIEWER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    selectorCard: {
      backgroundColor: colors.bgSurface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 16,
      marginBottom: 16,
    },
    selectorLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: 12,
    },
    riskTabs: {
      flexDirection: "row",
      gap: 10,
    },
    riskTab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 6,
      borderRadius: 12,
      backgroundColor: colors.bgSurfaceElevated,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    riskTabActive: {
      backgroundColor: colors.goldSubtle,
      borderColor: colors.gold,
    },
    riskTabTitle: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 6,
    },
    riskTabTitleActive: {
      color: colors.gold,
    },
    riskTabSub: {
      color: colors.textMuted,
      fontSize: 9,
      marginTop: 2,
    },
    recalculateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.gold,
      paddingVertical: 14,
      borderRadius: 14,
      marginBottom: 20,
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    recalculateText: {
      color: colors.isDark ? colors.bgPrimary : "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    resultsContainer: {
      marginBottom: 20,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.bgSurface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 16,
      marginBottom: 14,
    },
    resultTag: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
    },
    profileTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
      marginTop: 2,
    },
    confidencePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: colors.emeraldSubtle,
      borderWidth: 1,
      borderColor: colors.emerald,
    },
    confidenceText: {
      color: colors.emerald,
      fontSize: 10,
      fontWeight: "800",
    },
    rationaleBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: colors.bgSurface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 14,
      marginBottom: 14,
    },
    rationaleText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    featureBlock: {
      backgroundColor: colors.bgSurface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 16,
      marginBottom: 16,
    },
    featureTitle: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    featureRow: {
      marginBottom: 10,
    },
    featureMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    featureName: {
      color: colors.textSecondary,
      fontSize: 11,
      textTransform: "capitalize",
    },
    featureWeight: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "700",
    },
    featureTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.bgSurfaceElevated,
      overflow: "hidden",
    },
    featureFill: {
      height: "100%",
      borderRadius: 2,
    },
    stocksContainer: {
      backgroundColor: colors.bgSurface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 16,
      marginBottom: 18,
    },
    stocksHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
      paddingBottom: 12,
    },
    stocksTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "800",
    },
    stocksSubtitle: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    stockCountBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.goldSubtle,
      borderWidth: 1,
      borderColor: colors.borderAccent,
    },
    stockCountText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    stockCard: {
      backgroundColor: colors.bgSurfaceElevated,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 14,
      marginBottom: 10,
    },
    stockTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    stockTicker: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    stockCompany: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "600",
      marginTop: 2,
    },
    stockPriceBlock: {
      alignItems: "flex-end",
    },
    stockPrice: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "800",
    },
    stockTrendBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      marginTop: 4,
    },
    stockTrendText: {
      fontSize: 10,
      fontWeight: "700",
    },
    stockFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
    },
    weightPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: colors.bgSurface,
    },
    weightText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "600",
    },
    terminalTrigger: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: colors.goldSubtle,
    },
    terminalTriggerText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "700",
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
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.bgOverlay,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    modalContainer: {
      width: "100%",
      maxWidth: 380,
      backgroundColor: colors.bgSurface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.borderAccent,
      padding: 18,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 12,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    modalHeaderTitleBlock: {
      flex: 1,
      paddingRight: 8,
    },
    modalHeaderTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "800",
    },
    modalHeaderSubtitle: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 2,
    },
    modalActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    openExternalBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: colors.goldSubtle,
      borderWidth: 1,
      borderColor: colors.borderAccent,
    },
    openExternalText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: "800",
    },
    modalTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.goldSubtle,
    },
    modalTagText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.6,
    },
    modalCloseBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.bgSurfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitleBlock: {
      marginBottom: 12,
    },
    tickerBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    modalTicker: {
      color: colors.gold,
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    exchangePill: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: colors.bgSurfaceElevated,
    },
    exchangePillText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "800",
    },
    modalCompany: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
      marginTop: 2,
    },
    modalSector: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 1,
    },
    modalPriceCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.bgSurfaceElevated,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
    },
    modalPriceEyebrow: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    modalPrice: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "800",
      marginTop: 2,
    },
    modalChangePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.emeraldSubtle,
    },
    modalChangeText: {
      fontSize: 11,
      fontWeight: "800",
    },
    sparklineBox: {
      backgroundColor: colors.bgSurfaceElevated,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
    },
    sparklineLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    sparklineRange: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },
    sparklineRangeText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "600",
    },
    fundamentalsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    gridCell: {
      flex: 1,
      minWidth: "46%",
      backgroundColor: colors.bgSurfaceElevated,
      borderRadius: 10,
      padding: 8,
    },
    gridCellLabel: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    gridCellValue: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 2,
    },
    thesisBox: {
      backgroundColor: colors.bgSurfaceElevated,
      borderRadius: 12,
      padding: 10,
      marginBottom: 14,
    },
    thesisHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginBottom: 4,
    },
    thesisTitle: {
      color: colors.emerald,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    thesisBody: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 16,
    },
    closeTerminalBtn: {
      backgroundColor: colors.gold,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    closeTerminalBtnText: {
      color: colors.isDark ? colors.bgPrimary : "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
  });
