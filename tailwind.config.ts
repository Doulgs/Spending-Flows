import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
        display: ["var(--font-geist-sans)"],
      },
      colors: {
        background: { DEFAULT: "hsl(var(--background))", secondary: "hsl(var(--background-secondary))" },
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: {
          DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))", hover: "hsl(var(--primary-hover))",
          active: "hsl(var(--primary-active))", subtle: "hsl(var(--primary-subtle))", soft: "hsl(var(--primary-soft))", border: "hsl(var(--primary-border))",
        },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))", hover: "hsl(var(--destructive-hover))",
          subtle: "hsl(var(--destructive-subtle))", soft: "hsl(var(--destructive-soft))", border: "hsl(var(--destructive-border))",
        },
        border: { DEFAULT: "hsl(var(--border))", subtle: "hsl(var(--border-subtle))", strong: "hsl(var(--border-strong))" },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        surface: { DEFAULT: "hsl(var(--surface))", elevated: "hsl(var(--surface-elevated))", hover: "hsl(var(--surface-hover))" },
        success: { DEFAULT: "hsl(var(--success))", subtle: "hsl(var(--success-subtle))", soft: "hsl(var(--success-soft))", border: "hsl(var(--success-border))" },
        warning: { DEFAULT: "hsl(var(--warning))", subtle: "hsl(var(--warning-subtle))", soft: "hsl(var(--warning-soft))", border: "hsl(var(--warning-border))" },
        text: { primary: "hsl(var(--text-primary))", secondary: "hsl(var(--text-secondary))", muted: "hsl(var(--text-muted))" },
        chart: { "1": "hsl(var(--chart-1))", "2": "hsl(var(--chart-2))", "3": "hsl(var(--chart-3))", "4": "hsl(var(--chart-4))", "5": "hsl(var(--chart-5))" },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))", foreground: "hsl(var(--sidebar-foreground))", primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))", accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))", border: "hsl(var(--sidebar-border))", ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "accordion-down": "accordion-down .2s ease-out", "accordion-up": "accordion-up .2s ease-out", "fade-up": "fade-up .55s cubic-bezier(.2,.7,.2,1) both" },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
