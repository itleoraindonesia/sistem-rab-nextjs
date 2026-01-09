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
        // Brand colors
        brand: {
          primary: "var(--color-brand-primary)",
          accent: "var(--color-brand-accent)",
          dark: "var(--color-brand-dark)",
        },

        // App primary color (shadcn-style alias)
        primary: {
          DEFAULT: "var(--color-brand-primary)",
          foreground: "var(--color-primary-foreground)",
        },

        // Surface colors
        bg: {
          surface: "var(--color-bg-surface)",
          "surface-secondary": "var(--color-bg-surface-secondary)",
          "surface-muted": "var(--color-bg-surface-muted)",
          "surface-hover": "var(--color-bg-surface-hover)",
          "gray-200": "var(--color-bg-gray-200)",
          "gray-300": "var(--color-bg-gray-300)",
          "gray-hover": "var(--color-bg-gray-hover)",
        },

        // Aliases so utilities match the classes used in components
        surface: {
          DEFAULT: "var(--color-bg-surface)",
          secondary: "var(--color-bg-surface-secondary)",
          muted: "var(--color-bg-surface-muted)",
          hover: "var(--color-bg-surface-hover)",
        },

        // Text colors
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          subtle: "var(--color-text-subtle)",
          inverse: "var(--color-text-inverse)",
          "gray-500": "var(--color-text-gray-500)",
          "gray-600": "var(--color-text-gray-600)",
          "gray-800": "var(--color-text-gray-800)",
        },

        // Direct text aliases (used as utilities like `text-secondary`, `text-muted`, etc.)
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
        inverse: "var(--color-text-inverse)",
        "muted-foreground": "var(--color-muted-foreground)",

        // Border colors
        border: {
          default: "var(--color-border-default)",
          secondary: "var(--color-border-secondary)",
          focus: "var(--color-border-focus)",
          "gray-200": "var(--color-border-gray-200)",
          "gray-300": "var(--color-border-gray-300)",
        },

        // Default border alias (for `border-default`)
        default: "var(--color-border-default)",

        // Status colors - Error
        error: {
          surface: "var(--color-bg-error-surface)",
          DEFAULT: "var(--color-text-error)",
          dark: "var(--color-text-error-dark)",
          darker: "var(--color-text-error-darker)",
        },

        // Status colors - Success
        success: {
          surface: "var(--color-bg-success-surface)",
          DEFAULT: "var(--color-bg-success)",
          hover: "var(--color-bg-success-hover)",
          text: "var(--color-text-success)",
          "text-dark": "var(--color-text-success-dark)",
          "text-darker": "var(--color-text-success-darker)",
          "text-darkest": "var(--color-text-success-darkest)",
        },

        // Status colors - Warning
        warning: {
          surface: "var(--color-bg-warning-surface)",
          DEFAULT: "var(--color-text-warning)",
          dark: "var(--color-text-warning-dark)",
          darker: "var(--color-text-warning-darker)",
        },

        // Status colors - Info
        info: {
          surface: "var(--color-bg-info-surface)",
          DEFAULT: "var(--color-text-info)",
          dark: "var(--color-text-info-dark)",
          darker: "var(--color-text-info-darker)",
        },

        // Component colors (shadcn-style)
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        "primary-foreground": "var(--color-primary-foreground)",
        "secondary-foreground": "var(--color-secondary-foreground)",
        "accent-foreground": "var(--color-accent-foreground)",
        "destructive-foreground": "var(--color-destructive-foreground)",
        "card-foreground": "var(--color-card-foreground)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
