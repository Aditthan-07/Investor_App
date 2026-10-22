import React from "react";
import { Platform, View, StyleSheet, useWindowDimensions, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { Sun, Moon } from "lucide-react-native";
import { AppProvider, useApp } from "../src/context/AppContext";

function MainSimulatorShell() {
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width > 480;
  const { colors, themeMode, toggleTheme } = useApp();

  const stackContent = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPrimary },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="guided" />
    </Stack>
  );

  return (
    <>
      <StatusBar
        style={themeMode === "dark" ? "light" : "dark"}
        backgroundColor={colors.bgPrimary}
      />
      {isWebDesktop ? (
        <View style={[styles.webBackdrop, { backgroundColor: colors.simBackdrop }]}>
          {/* Header watermark with Brand & Global Theme Toggle */}
          <View style={styles.desktopHeader}>
            <View style={[styles.brandDot, { backgroundColor: colors.emerald }]} />
            <Text style={[styles.desktopBrand, { color: colors.textPrimary }]}>
              FinSight <Text style={{ color: colors.gold }}>AI</Text>
            </Text>
            <Text style={[styles.desktopTagline, { color: colors.textMuted }]}>
              Mobile Web Simulator
            </Text>

            {/* Global Light / Dark Theme Switcher Button */}
            <TouchableOpacity
              style={[
                styles.themeToggleBtn,
                {
                  backgroundColor: colors.bgSurface,
                  borderColor: colors.borderSubtle,
                },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              {themeMode === "dark" ? (
                <>
                  <Sun size={14} color={colors.gold} />
                  <Text style={[styles.themeToggleText, { color: colors.gold }]}>
                    LIGHT MODE
                  </Text>
                </>
              ) : (
                <>
                  <Moon size={14} color={colors.gold} />
                  <Text style={[styles.themeToggleText, { color: colors.gold }]}>
                    DARK MODE
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Smartphone Viewport Frame */}
          <View
            style={[
              styles.deviceFrame,
              {
                backgroundColor: colors.bgPrimary,
                borderColor: colors.simFrameBorder,
              },
            ]}
          >
            {/* Top Dynamic Island / Speaker Pill */}
            <View style={[styles.notchContainer, { backgroundColor: colors.bgPrimary }]}>
              <View
                style={[
                  styles.notchPill,
                  {
                    backgroundColor: themeMode === "dark" ? "#000000" : "#E2E8F0",
                    borderColor: colors.borderSubtle,
                  },
                ]}
              />
            </View>

            <View style={[styles.deviceScreen, { backgroundColor: colors.bgPrimary }]}>
              {stackContent}
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.mobileRoot, { backgroundColor: colors.bgPrimary }]}>
          {stackContent}
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <MainSimulatorShell />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  webBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    // @ts-ignore
    minHeight: "100vh",
  },
  desktopHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  desktopBrand: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  desktopTagline: {
    fontSize: 12,
    fontWeight: "500",
  },
  themeToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  themeToggleText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  deviceFrame: {
    width: 414,
    maxWidth: "100%",
    // @ts-ignore
    height: "92vh",
    maxHeight: 880,
    borderRadius: 40,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 20,
  },
  notchContainer: {
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  notchPill: {
    width: 86,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  deviceScreen: {
    flex: 1,
    overflow: "hidden",
  },
  mobileRoot: {
    flex: 1,
  },
});
