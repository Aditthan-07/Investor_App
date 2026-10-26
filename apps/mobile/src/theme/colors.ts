export interface ThemeColors {
  isDark: boolean;
  // Backgrounds
  bgPrimary: string;
  bgSurface: string;
  bgSurfaceElevated: string;
  bgInput: string;
  bgOverlay: string;

  // Borders & Dividers
  borderSubtle: string;
  borderMedium: string;
  borderAccent: string;

  // Executive Accents
  gold: string;
  goldLight: string;
  goldDark: string;
  goldSubtle: string;

  // Financial Semantics
  emerald: string;
  emeraldSubtle: string;
  crimson: string;
  crimsonSubtle: string;
  amber: string;
  amberSubtle: string;
  blue: string;
  blueSubtle: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;

  // Simulator specifics
  simBackdrop: string;
  simFrameBorder: string;
}

export const DARK_COLORS: ThemeColors = {
  isDark: true,
  // Deep Obsidian / Graphite
  bgPrimary: "#0C0D10",
  bgSurface: "#121418",
  bgSurfaceElevated: "#181B22",
  bgInput: "#08090C",
  bgOverlay: "rgba(12, 13, 16, 0.85)",

  // Borders & Dividers
  borderSubtle: "rgba(255, 255, 255, 0.07)",
  borderMedium: "rgba(255, 255, 255, 0.12)",
  borderAccent: "rgba(197, 168, 128, 0.35)",

  // Executive Accents
  gold: "#C5A880", // Refined Champagne Gold
  goldLight: "#DFCDAF",
  goldDark: "#9E825A",
  goldSubtle: "rgba(197, 168, 128, 0.12)",

  // Financial Semantics
  emerald: "#10B981", // Wealth Green
  emeraldSubtle: "rgba(16, 185, 129, 0.12)",
  crimson: "#EF4444", // Negative / Alert
  crimsonSubtle: "rgba(239, 68, 68, 0.12)",
  amber: "#F59E0B", // Caution / Neutral
  amberSubtle: "rgba(245, 158, 11, 0.12)",
  blue: "#3B82F6",
  blueSubtle: "rgba(59, 130, 246, 0.12)",

  // Typography
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textDisabled: "#475569",

  // Simulator
  simBackdrop: "#07080A",
  simFrameBorder: "rgba(197, 168, 128, 0.3)",
};

export const LIGHT_COLORS: ThemeColors = {
  isDark: false,
  // Corporate Wealth Alabaster & White
  bgPrimary: "#F8FAFC",
  bgSurface: "#FFFFFF",
  bgSurfaceElevated: "#F1F5F9",
  bgInput: "#F1F5F9",
  bgOverlay: "rgba(248, 250, 252, 0.92)",

  // Hairline Slate Borders
  borderSubtle: "rgba(15, 23, 42, 0.08)",
  borderMedium: "rgba(15, 23, 42, 0.15)",
  borderAccent: "rgba(180, 83, 9, 0.35)",

  // Executive Amber / Gold
  gold: "#B45309",
  goldLight: "#D97706",
  goldDark: "#92400E",
  goldSubtle: "rgba(180, 83, 9, 0.10)",

  // Financial Semantics
  emerald: "#047857", // Institutional Wealth Green
  emeraldSubtle: "rgba(4, 120, 87, 0.10)",
  crimson: "#DC2626",
  crimsonSubtle: "rgba(220, 38, 38, 0.10)",
  amber: "#D97706",
  amberSubtle: "rgba(217, 119, 6, 0.10)",
  blue: "#2563EB",
  blueSubtle: "rgba(37, 99, 235, 0.10)",

  // Typography
  textPrimary: "#0F172A", // Deep Executive Slate
  textSecondary: "#334155", // Charcoal Slate
  textMuted: "#64748B", // Subtle Slate
  textDisabled: "#94A3B8",

  // Simulator
  simBackdrop: "#EAEEF4",
  simFrameBorder: "rgba(15, 23, 42, 0.15)",
};

// Default export for backward compatibility
export const COLORS = DARK_COLORS;
