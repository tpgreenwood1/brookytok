import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        foreground: "var(--text)",
        "fg-muted": "var(--muted)",
        border: "var(--border)",
        "border-muted": "var(--border-muted)",
        brand: "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        "brand-light": "var(--brand-light)",
        destructive: "var(--destructive)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "skeleton-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-like": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.3)" },
          "50%": { transform: "scale(0.9)" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
        "skeleton-shimmer": "skeleton-shimmer 1.5s linear infinite",
        "bounce-like": "bounce-like 350ms ease-out",
        "scale-in": "scale-in 150ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
