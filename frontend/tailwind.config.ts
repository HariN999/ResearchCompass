import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        border: "var(--border)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
      },
      fontSize: {
        "heading-xl": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "heading-l": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "heading-m": ["18px", { lineHeight: "26px", fontWeight: "600" }],
        body: ["14px", { lineHeight: "22px", fontWeight: "400" }],
        small: ["12px", { lineHeight: "18px", fontWeight: "400" }],
        caption: ["11px", { lineHeight: "16px", fontWeight: "500" }],
        code: ["12px", { lineHeight: "16px" }],
      },
      borderRadius: {
        small: "var(--radius-small)",
        medium: "var(--radius-medium)",
        large: "var(--radius-large)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        dialog: "var(--shadow-dialog)",
        dropdown: "var(--shadow-dropdown)",
      },
    },
  },
  plugins: [],
};

export default config;
