import type { Config } from "tailwindcss";
import {
  colors,
  typography,
  borderRadius,
  shadows,
} from "./src/styles/design-system";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          ...colors.primary,
          DEFAULT: colors.primary[500],
          foreground: "#FFFFFF",
        },
        // Secondary palette
        secondary: {
          ...colors.secondary,
          DEFAULT: colors.secondary[500],
          foreground: "#FFFFFF",
        },
        // Accent palette
        accent: {
          DEFAULT: colors.primary[300],
          foreground: colors.neutral[900],
        },
        // Neutral palette
        neutral: {
          ...colors.neutral,
          light: colors.neutral[100],
          DEFAULT: colors.neutral[500],
          dark: colors.neutral[800],
        },
        // Semantic colors
        success: {
          ...colors.success,
          DEFAULT: colors.success[500],
          foreground: "#FFFFFF",
        },
        error: {
          ...colors.error,
          DEFAULT: colors.error[500],
          foreground: "#FFFFFF",
        },
        warning: {
          ...colors.warning,
          DEFAULT: colors.warning[500],
          foreground: colors.warning[700],
        },
        info: {
          ...colors.info,
          DEFAULT: colors.info[500],
          foreground: "#FFFFFF",
        },

        // Base colors
        white: "#FFFFFF",
        black: "#000000",

        // UI component colors
        background: "#FFFFFF",
        foreground: colors.neutral[900],
        muted: colors.neutral[100],
        "muted-foreground": colors.neutral[500],
        popover: "#FFFFFF",
        "popover-foreground": colors.neutral[900],
        card: "#FFFFFF",
        "card-foreground": colors.neutral[900],
        border: colors.neutral[300],
        input: colors.neutral[300],
        ring: colors.primary[500],

        // Sport-specific theme colors
        "sport-tennis-primary": colors.sport.tennis.primary,
        "sport-tennis-secondary": colors.sport.tennis.secondary,
        "sport-tennis-accent": colors.sport.tennis.accent,

        "sport-basketball-primary": colors.sport.basketball.primary,
        "sport-basketball-secondary": colors.sport.basketball.secondary,
        "sport-basketball-accent": colors.sport.basketball.accent,

        "sport-soccer-primary": colors.sport.soccer.primary,
        "sport-soccer-secondary": colors.sport.soccer.secondary,
        "sport-soccer-accent": colors.sport.soccer.accent,

        "sport-volleyball-primary": colors.sport.volleyball.primary,
        "sport-volleyball-secondary": colors.sport.volleyball.secondary,
        "sport-volleyball-accent": colors.sport.volleyball.accent,

        "sport-baseball-primary": colors.sport.baseball.primary,
        "sport-baseball-secondary": colors.sport.baseball.secondary,
        "sport-baseball-accent": colors.sport.baseball.accent,
      },
      borderRadius: {
        ...borderRadius,
        lg: borderRadius.lg,
        md: borderRadius.md,
        sm: borderRadius.sm,
      },
      fontFamily: {
        sans: typography.fontFamily.sans,
        mono: typography.fontFamily.mono,
        inter: "Inter, sans-serif",
      },
      fontSize: typography.fontSize,
      // Convert string values for fontWeight
      fontWeight: {
        light: typography.fontWeight.light,
        normal: typography.fontWeight.normal,
        medium: typography.fontWeight.medium,
        semibold: typography.fontWeight.semibold,
        bold: typography.fontWeight.bold,
        extrabold: typography.fontWeight.extrabold,
      },
      // Convert string values for lineHeight
      lineHeight: {
        none: typography.lineHeight.none,
        tight: typography.lineHeight.tight,
        snug: typography.lineHeight.snug,
        normal: typography.lineHeight.normal,
        relaxed: typography.lineHeight.relaxed,
        loose: typography.lineHeight.loose,
      },
      letterSpacing: typography.letterSpacing,
      boxShadow: {
        ...shadows,
        "card-hover":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "button-hover":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        dropdown:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "inner-highlight": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-pattern": "url('/images/hero-pattern.svg')",
        "card-texture": "url('/images/card-texture.png')",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.5s ease-out",
      },
    },
  },
  plugins: [
    // @ts-ignore - Tailwind plugin
    require("tailwindcss-animate"),
    // Add custom text shadow utilities
    // @ts-ignore - Tailwind plugin
    ({
      addUtilities,
    }: {
      addUtilities: (utilities: Record<string, Record<string, string>>) => void;
    }) => {
      const newUtilities = {
        ".text-shadow-sm": {
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
        },
        ".text-shadow": {
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
        ".text-shadow-md": {
          textShadow:
            "0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)",
        },
        ".text-shadow-lg": {
          textShadow:
            "0 15px 30px rgba(0, 0, 0, 0.11), 0 5px 15px rgba(0, 0, 0, 0.08)",
        },
        ".text-shadow-none": {
          textShadow: "none",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
export default config;
