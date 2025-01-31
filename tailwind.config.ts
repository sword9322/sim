import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        border: "rgb(229, 229, 234)",
        input: "rgb(229, 229, 234)",
        ring: "rgb(0, 0, 0)",
        background: "rgb(250, 250, 253)",
        foreground: "rgb(17, 17, 17)",
        primary: {
          DEFAULT: "rgb(0, 0, 0)",
          foreground: "rgb(250, 250, 253)",
        },
        secondary: {
          DEFAULT: "rgb(245, 245, 248)",
          foreground: "rgb(17, 17, 17)",
        },
        destructive: {
          DEFAULT: "rgb(255, 59, 48)",
          foreground: "rgb(250, 250, 253)",
        },
        muted: {
          DEFAULT: "rgb(245, 245, 248)",
          foreground: "rgb(115, 115, 115)",
        },
        accent: {
          DEFAULT: "rgb(245, 245, 248)",
          foreground: "rgb(17, 17, 17)",
        },
        popover: {
          DEFAULT: "rgb(250, 250, 253)",
          foreground: "rgb(17, 17, 17)",
        },
        card: {
          DEFAULT: "rgb(250, 250, 253)",
          foreground: "rgb(17, 17, 17)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
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
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;