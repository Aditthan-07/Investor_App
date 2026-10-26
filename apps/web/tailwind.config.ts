import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        corporate: {
          app: "#F8FAFC",
          surface: "#FFFFFF",
          subtle: "#F1F5F9",
          border: "#E2E8F0",
          head: "#0F172A",
          body: "#334155",
          sub: "#64748B",
          green: "#047857",
          greenHover: "#065F46",
          greenLight: "#ECFDF5",
          greenBorder: "#A7F3D0",
          gold: "#B45309",
          goldLight: "#FFFBEB",
          goldBorder: "#FDE68A",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "SF Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
