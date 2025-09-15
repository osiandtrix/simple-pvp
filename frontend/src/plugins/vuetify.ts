// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";

export default createVuetify({
  theme: {
    defaultTheme: "modernDark",
    themes: {
      modernDark: {
        dark: true,
        colors: {
          // Primary brand colors - refined for professional appearance
          primary: "#4f46e5", // Professional indigo
          secondary: "#6366f1", // Refined purple accent
          accent: "#0891b2", // Refined cyan accent

          // Semantic colors - maintained for functionality
          success: "#059669", // Emerald green
          warning: "#d97706", // Amber
          error: "#dc2626", // Red
          info: "#0284c7", // Blue

          // Surface colors for professional dark theme - neutral blacks/greys
          background: "#0a0a0a", // Rich black
          surface: "#1a1a1a", // Dark charcoal
          "surface-variant": "#2a2a2a", // Medium charcoal
          "surface-bright": "#3a3a3a", // Light charcoal

          // Text colors - optimized for contrast on neutral backgrounds
          "on-background": "#f5f5f5", // Near white
          "on-surface": "#d0d0d0", // Very light grey
          "on-surface-variant": "#9a9a9a", // Light grey

          // Combat specific colors - maintained for functionality
          "combat-friendly": "#059669", // Your kills - emerald
          "combat-enemy": "#dc2626", // Enemy kills - red
          "combat-neutral": "#6a6a6a", // Neutral elements - medium grey

          // Status colors - refined
          "status-online": "#059669",
          "status-offline": "#6a6a6a",
          "status-busy": "#d97706",
        },
      },
      modernLight: {
        dark: false,
        colors: {
          primary: "#6366f1",
          secondary: "#8b5cf6",
          accent: "#06b6d4",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
          background: "#f8fafc",
          surface: "#ffffff",
          "surface-variant": "#f1f5f9",
          "surface-bright": "#e2e8f0",
          "on-background": "#1e293b",
          "on-surface": "#334155",
          "on-surface-variant": "#64748b",
          "combat-friendly": "#059669",
          "combat-enemy": "#dc2626",
          "combat-neutral": "#64748b",
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 2,
      rounded: "lg",
    },
    VBtn: {
      rounded: "lg",
      style: "text-transform: none; font-weight: 600;",
      elevation: 2,
      class: "modern-btn-enhanced",
    },
    VTextField: {
      variant: "outlined",
      rounded: "lg",
    },
    VSelect: {
      variant: "outlined",
      rounded: "lg",
    },
    VSwitch: {
      color: "primary",
    },
    VTooltip: {
      location: "top",
    },
  },
});
