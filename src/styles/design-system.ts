/**
 * MatchPoint Design System
 *
 * This file contains the design tokens and theme configuration for the MatchPoint application.
 * It defines colors, typography, spacing, and other design variables used throughout the app.
 */

/**
 * Color Palette
 *
 * Primary colors are used for primary actions, buttons, and key UI elements.
 * Secondary colors are used for secondary actions and supporting UI elements.
 * Neutral colors are used for text, backgrounds, and borders.
 * Semantic colors are used for status indicators, alerts, and feedback.
 * Sport-specific colors are used for sport-themed UI elements.
 */
export const colors = {
  // Primary colors
  primary: {
    50: "#EBF5FF",
    100: "#D6EBFF",
    200: "#ADD6FF",
    300: "#85C2FF",
    400: "#5CADFF",
    500: "#3399FF", // Primary brand color
    600: "#2980E4",
    700: "#1F66CC",
    800: "#144DA6",
    900: "#0A3380",
  },

  // Secondary colors
  secondary: {
    50: "#F0F4F8",
    100: "#D9E2EC",
    200: "#BCCCDC",
    300: "#9FB3C8",
    400: "#829AB1",
    500: "#627D98", // Secondary brand color
    600: "#486581",
    700: "#334E68",
    800: "#243B53",
    900: "#102A43",
  },

  // Neutral colors
  neutral: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },

  // Semantic colors
  success: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981", // Success
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },

  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444", // Error
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },

  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B", // Warning
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  info: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6", // Info
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },

  // Sport-specific colors
  sport: {
    tennis: {
      primary: "#4CAF50", // Green
      secondary: "#8BC34A",
      accent: "#CDDC39",
    },
    basketball: {
      primary: "#FF5722", // Orange
      secondary: "#FF9800",
      accent: "#FFC107",
    },
    soccer: {
      primary: "#2196F3", // Blue
      secondary: "#03A9F4",
      accent: "#00BCD4",
    },
    volleyball: {
      primary: "#9C27B0", // Purple
      secondary: "#673AB7",
      accent: "#3F51B5",
    },
    baseball: {
      primary: "#F44336", // Red
      secondary: "#E91E63",
      accent: "#9C27B0",
    },
  },
};

/**
 * Typography
 *
 * Font families, sizes, weights, and line heights used throughout the app.
 */
export const typography = {
  // Font families
  fontFamily: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },

  // Font sizes
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },

  // Font weights
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  // Line heights
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },

  // Letter spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};

/**
 * Spacing
 *
 * Spacing values used for margins, paddings, and gaps.
 */
export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
};

/**
 * Border radius
 *
 * Border radius values used for rounded corners.
 */
export const borderRadius = {
  none: "0",
  sm: "0.125rem", // 2px
  DEFAULT: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
};

/**
 * Shadows
 *
 * Box shadow values used for elevation and depth.
 */
export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  none: "none",
};

/**
 * Transitions
 *
 * Transition properties used for animations.
 */
export const transitions = {
  property: {
    none: "none",
    all: "all",
    DEFAULT:
      "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
    colors: "background-color, border-color, color, fill, stroke",
    opacity: "opacity",
    shadow: "box-shadow",
    transform: "transform",
  },
  timingFunction: {
    DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  duration: {
    DEFAULT: "150ms",
    75: "75ms",
    100: "100ms",
    150: "150ms",
    200: "200ms",
    300: "300ms",
    500: "500ms",
    700: "700ms",
    1000: "1000ms",
  },
};

/**
 * Z-index
 *
 * Z-index values used for stacking elements.
 */
export const zIndex = {
  auto: "auto",
  0: "0",
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50",
};

/**
 * Breakpoints
 *
 * Breakpoints used for responsive design.
 */
export const breakpoints = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

/**
 * Export all design tokens
 */
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
};

export default designSystem;
