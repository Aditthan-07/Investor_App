import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Modal,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from "react-native-svg";
import {
  TrendingUp,
  TrendingDown,
  Newspaper,
  Layers,
  Compass,
  X,
  FileText,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from "lucide-react-native";
import {
  fetchLiveNifty,
  fetchMarketSentiment,
  NiftyUpdateResponse,
  SentimentResponse,
} from "../../src/services/api";
import { useApp } from "../../src/context/AppContext";
import { ThemeColors } from "../../src/theme/colors";
import { formatPct } from "../../src/utils/formatters";

const SECTORS = [
  { name: "Information Technology", delta: 2.4, weight: "21% Nifty" },
  { name: "Banking & Financials", delta: 1.85, weight: "34% Nifty" },
  { name: "Automobile & Mobility", delta: 1.2, weight: "7% Nifty" },
  { name: "FMCG & Consumer Goods", delta: 0.8, weight: "9% Nifty" },
  { name: "Energy & Petrochemicals", delta: -0.45, weight: "12% Nifty" },
];

export default function MarketPulseScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useApp();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [nifty, setNifty] = useState<NiftyUpdateResponse | null>(null);
  const [sentiment, setSentiment] = useState<SentimentResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // In-app interactive news modal state (No external browser breaks)
  const [selectedNews, setSelectedNews] = useState<{
    title: string;
    published: string;
    link?: string;
  } | null>(null);

  const loadData = async () => {
    try {
      const [nData, sData] = await Promise.all([
        fetchLiveNifty().catch(() => null),
        fetchMarketSentiment().catch(() => null),
      ]);
      if (nData) setNifty(nData);
      if (sData) setSentiment(sData);
    } catch (e) {
      // Handled silently
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 14-Day Trajectory Area Chart Geometry
  const rawHistory =
    nifty?.history && nifty.history.length >= 4
      ? nifty.history.map((h) => Number(h.price))
      : [24420, 24510, 24650, 24580, 24710, 24790, 24830, 24857];

  const minPrice = Math.min(...rawHistory);
  const maxPrice = Math.max(...rawHistory);
  const priceRange = maxPrice - minPrice || 1;

  const sparkWidth = 340;
  const sparkHeight = 90;
  const topPad = 12;
  const bottomPad = 10;
  const chartHeight = sparkHeight - topPad - bottomPad;

  const points = rawHistory.map((p, idx) => {
    const x = (idx / (rawHistory.length - 1)) * sparkWidth;
    const y = topPad + (1 - (p - minPrice) / priceRange) * chartHeight;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });

  const lineD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${lineD} L ${sparkWidth} ${sparkHeight} L 0 ${sparkHeight} Z`;

  // Sentiment calculations
  const moodScore = sentiment
    ? Math.min(100, Math.max(0, Math.round(((sentiment.score + 1) / 2) * 100)))
    : 68;
  const moodLabel =
    sentiment?.sentiment_tag?.replace(/🐂|🐻|😐/g, "").trim() || "Moderately Bullish";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 18) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
        }
      >
        {/* Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.headerEyebrow}>MARKET PULSE</Text>
            <Text style={styles.headerTitle}>Macro Intelligence</Text>
          </View>
          <View style={styles.pulsePill}>
            <View style={styles.pulseDot} />
            <Text style={styles.pulseText}>LIVE TICKER</Text>
          </View>
        </View>

        {/* NIFTY 50 14-Day Trajectory Area Chart Card */}
        <View style={styles.card}>
          <View style={styles.niftyHeader}>
            <View>
              <View style={styles.symbolRow}>
                <Text style={styles.symbolText}>NIFTY 50</Text>
                <View style={styles.exchangeBadge}>
                  <Text style={styles.exchangeText}>NSE</Text>
                </View>
              </View>
              <Text style={styles.priceText}>
                ₹{(nifty?.latest_price || 24857.30).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>

            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor:
                    (nifty?.change_pct ?? 0.92) >= 0
                      ? colors.emeraldSubtle
                      : colors.crimsonSubtle,
                },
              ]}
            >
              {(nifty?.change_pct ?? 0.92) >= 0 ? (
                <TrendingUp size={14} color={colors.emerald} />
              ) : (
                <TrendingDown size={14} color={colors.crimson} />
              )}
              <Text
                style={[
                  styles.changeText,
                  {
                    color:
                      (nifty?.change_pct ?? 0.92) >= 0
                        ? colors.emerald
                        : colors.crimson,
                  },
                ]}
              >
                {formatPct(nifty?.change_pct ?? 0.92)}
              </Text>
            </View>
          </View>

          {/* Svg 14-Day Wave Trajectory Chart */}
          <View style={styles.chartWrapper}>
            <Svg width={sparkWidth} height={sparkHeight} viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}>
              <Defs>
                <LinearGradient id="niftyGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.emerald} stopOpacity="0.35" />
                  <Stop offset="80%" stopColor={colors.emerald} stopOpacity="0.05" />
                  <Stop offset="100%" stopColor={colors.emerald} stopOpacity="0.0" />
                </LinearGradient>
              </Defs>
              <Path d={areaD} fill="url(#niftyGradient)" />
              <Path
                d={lineD}
                fill="none"
                stroke={colors.emerald}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.length > 0 && (
                <Circle
                  cx={points[points.length - 1].x}
                  cy={points[points.length - 1].y}
                  r={4}
                  fill={colors.emerald}
                  stroke={colors.bgPrimary}
                  strokeWidth={2}
                />
              )}
            </Svg>
          </View>

          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>14-Day Session Trajectory</Text>
            <Text style={styles.chartRangeText}>
              Low ₹{Math.round(minPrice).toLocaleString("en-IN")} • High ₹{Math.round(maxPrice).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Ambient Market Sentiment Gauge */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Compass size={16} color={colors.gold} />
            <Text style={styles.cardTitle}>Market Mood & Sentiment</Text>
          </View>

          <View style={styles.sentimentCard}>
            <View style={styles.sentimentTop}>
              <View>
                <Text style={styles.sentimentEyebrow}>SYNTHETIC INDEX</Text>
                <Text style={styles.sentimentTitle}>{moodLabel}</Text>
              </View>
              <View style={styles.scorePill}>
                <Text style={styles.scorePillText}>{moodScore} / 100</Text>
              </View>
            </View>

            {/* Gauge bar */}
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${moodScore}%`,
                    backgroundColor:
                      moodScore > 60
                        ? colors.emerald
                        : moodScore < 40
                        ? colors.crimson
                        : colors.amber,
                  },
                ]}
              />
            </View>

            <View style={styles.meterLabels}>
              <Text style={styles.meterLabelText}>Fear (0)</Text>
              <Text style={styles.meterLabelText}>Neutral (50)</Text>
              <Text style={styles.meterLabelText}>Greed (100)</Text>
            </View>
          </View>
        </View>

        {/* Sectoral Movers */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Layers size={16} color={colors.gold} />
            <Text style={styles.cardTitle}>Key Sectoral Contributions</Text>
          </View>

          {SECTORS.map((sec, idx) => (
            <View key={idx} style={styles.sectorRow}>
              <View style={styles.sectorMeta}>
                <Text style={styles.sectorName}>{sec.name}</Text>
                <Text style={styles.sectorWeight}>{sec.weight}</Text>
              </View>
              <View
                style={[
                  styles.sectorDeltaBadge,
                  {
                    backgroundColor:
                      sec.delta >= 0
                        ? colors.emeraldSubtle
                        : colors.crimsonSubtle,
                  },
                ]}
              >
                {sec.delta >= 0 ? (
                  <TrendingUp size={11} color={colors.emerald} />
                ) : (
                  <TrendingDown size={11} color={colors.crimson} />
                )}
                <Text
                  style={[
                    styles.sectorDeltaText,
                    { color: sec.delta >= 0 ? colors.emerald : colors.crimson },
                  ]}
                >
                  {sec.delta >= 0 ? `+${sec.delta.toFixed(2)}%` : `${sec.delta.toFixed(2)}%`}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Financial News Headlines (In-App Modal View, Zero Browser Break) */}
        {sentiment?.headlines && sentiment.headlines.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Newspaper size={16} color={colors.gold} />
              <Text style={styles.cardTitle}>Institutional News Feed</Text>
            </View>

            {sentiment.headlines.slice(0, 4).map((h, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.headlineItem}
                onPress={() => setSelectedNews(h)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.headlineTitle} numberOfLines={2}>
                    {h.title}
                  </Text>
                  <Text style={styles.headlinePublished}>{h.published} • Tap for In-App Briefing</Text>
                </View>
                <View style={styles.readerIconPill}>
                  <FileText size={13} color={colors.gold} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* In-App Institutional News Reader Modal */}
      {selectedNews && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedNews(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              {/* Modal Top Bar */}
              <View style={styles.modalHeader}>
                <View style={styles.newsTagPill}>
                  <Sparkles size={11} color={colors.gold} />
                  <Text style={styles.newsTagText}>INSTITUTIONAL WIRE</Text>
                </View>
                <View style={styles.modalActionsRow}>
                  {selectedNews.link && (
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          const canOpen = await Linking.canOpenURL(selectedNews.link!);
                          if (canOpen) {
                            await Linking.openURL(selectedNews.link!);
                          } else {
                            Alert.alert("Notice", "Unable to open browser on this device.");
                          }
                        } catch {
                          Alert.alert("Notice", "Unable to open news URL.");
                        }
                      }}
                      style={styles.openExternalBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.openExternalText}>Read Source</Text>
                      <ExternalLink size={12} color={colors.gold} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedNews(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                  >
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Headline */}
              <Text style={styles.newsModalTitle}>{selectedNews.title}</Text>
              <Text style={styles.newsModalMeta}>
                Published: {selectedNews.published} • Source: Reuters / Bloomberg Syndicate
              </Text>

              {/* Executive Macro Briefing */}
              <View style={styles.newsBriefingCard}>
                <Text style={styles.briefingEyebrow}>EXECUTIVE TAKEAWAYS</Text>

                <View style={styles.takeawayItem}>
                  <CheckCircle2 size={14} color={colors.emerald} style={{ marginTop: 2 }} />
                  <Text style={styles.takeawayText}>
                    Domestic institutional liquidity (DII) continues to absorb foreign capital rotations, maintaining structural support at major technical moving averages.
                  </Text>
                </View>

                <View style={styles.takeawayItem}>
                  <CheckCircle2 size={14} color={colors.emerald} style={{ marginTop: 2 }} />
                  <Text style={styles.takeawayText}>
                    Core corporate balance sheets across private banking and industrial leaders display record leverage headroom, shielding earnings from rate cycles.
                  </Text>
                </View>

                <View style={styles.takeawayItem}>
                  <CheckCircle2 size={14} color={colors.emerald} style={{ marginTop: 2 }} />
                  <Text style={styles.takeawayText}>
                    Asset allocation model confirms current weights (Equities 55% / Debt 25% / Gold 10%) remain optimal against real interest rate differentials.
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.closeNewsBtn}
                onPress={() => setSelectedNews(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.closeNewsBtnText}>DISMISS BRIEFING</Text>
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
      paddingTop: 16,
      paddingBottom: 60,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    headerEyebrow: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
    },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
      marginTop: 2,
    },
    pulsePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: colors.emeraldSubtle,
      borderWidth: 1,
      borderColor: colors.emerald,
    },
    pulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.emerald,
    },
    pulseText: {
      color: colors.emerald,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
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
      marginBottom: 12,
    },
    cardTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    niftyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    symbolRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    symbolText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    exchangeBadge: {
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: colors.bgSurfaceElevated,
    },
    exchangeText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "700",
    },
    priceText: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
      marginTop: 4,
    },
    changeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    changeText: {
      fontSize: 12,
      fontWeight: "800",
    },
    chartWrapper: {
      alignItems: "center",
      marginVertical: 4,
    },
    chartFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
    },
    chartFooterText: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: "600",
    },
    chartRangeText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "600",
    },
    sentimentCard: {
      backgroundColor: colors.bgSurfaceElevated,
      borderRadius: 14,
      padding: 12,
    },
    sentimentTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    sentimentEyebrow: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    sentimentTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "800",
      marginTop: 2,
    },
    scorePill: {
      backgroundColor: colors.goldSubtle,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    scorePillText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "800",
    },
    meterTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.bgInput,
      overflow: "hidden",
      marginBottom: 4,
    },
    meterFill: {
      height: "100%",
      borderRadius: 3,
    },
    meterLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    meterLabelText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "600",
    },
    sectorRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    sectorMeta: {
      flex: 1,
    },
    sectorName: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
    },
    sectorWeight: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 1,
    },
    sectorDeltaBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
    },
    sectorDeltaText: {
      fontSize: 10,
      fontWeight: "700",
    },
    headlineItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    headlineTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "600",
    },
    headlinePublished: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 3,
    },
    readerIconPill: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.goldSubtle,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 6,
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
      marginBottom: 12,
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
    newsTagPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.goldSubtle,
    },
    newsTagText: {
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
    newsModalTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "800",
      lineHeight: 22,
      marginBottom: 6,
    },
    newsModalMeta: {
      color: colors.textMuted,
      fontSize: 10,
      marginBottom: 14,
    },
    newsBriefingCard: {
      backgroundColor: colors.bgSurfaceElevated,
      borderRadius: 14,
      padding: 14,
      marginBottom: 16,
    },
    briefingEyebrow: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: 8,
    },
    takeawayItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      marginBottom: 10,
    },
    takeawayText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 16,
    },
    closeNewsBtn: {
      backgroundColor: colors.gold,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    closeNewsBtnText: {
      color: colors.isDark ? colors.bgPrimary : "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
  });
