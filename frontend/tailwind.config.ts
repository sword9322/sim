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
          DEFAULT: "rgb(99, 102, 241)",
          hover: "rgb(79, 82, 231)",
          foreground: "rgb(255, 255, 255)",
        },
        secondary: {
          DEFAULT: "rgb(244, 245, 255)",
          foreground: "rgb(67, 70, 153)",
        },
        destructive: {
          DEFAULT: "rgb(239, 68, 68)",
          foreground: "rgb(255, 255, 255)",
        },
        muted: {
          DEFAULT: "rgb(245, 245, 248)",
          foreground: "rgb(115, 115, 115)",
        },
        accent: {
          DEFAULT: "rgb(99, 102, 241, 0.1)",
          foreground: "rgb(99, 102, 241)",
        },
        card: {
          DEFAULT: "rgb(255, 255, 255)",
          hover: "rgb(250, 250, 255)",
        },
        success: {
          DEFAULT: "rgb(34, 197, 94)",
          foreground: "rgb(255, 255, 255)",
        },
        warning: {
          DEFAULT: "rgb(234, 179, 8)",
          foreground: "rgb(255, 255, 255)",
        }
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
        'card-hover': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        'card-hover': 'card-hover 0.3s ease-out',
      },
      backgroundImage: {
        'gradient-sidebar': 'linear-gradient(to bottom, rgb(244, 245, 255), rgb(255, 255, 255))',
        'gradient-card': 'linear-gradient(to bottom right, rgb(255, 255, 255), rgb(250, 250, 255))'
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;