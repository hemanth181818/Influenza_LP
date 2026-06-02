import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1320px",
      },
    },
    extend: {
      fontFamily: {
        // Editorial display — Fraunces (variable, distinctive, magazine energy)
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        // Italic accents — Instrument Serif (kept for inline italic flourishes)
        italic: ['"Instrument Serif"', "ui-serif", "Georgia", "serif"],
        // UI sans — Bricolage Grotesque (free, slightly quirky, editorial)
        sans: [
          '"Bricolage Grotesque"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        // Data / eyebrows — JetBrains Mono
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Kortex brand tokens
        ink: {
          DEFAULT: "hsl(var(--ink))",
          deep: "hsl(var(--ink-deep))",
          soft: "hsl(var(--ink-soft))",
        },
        acid: {
          DEFAULT: "hsl(var(--acid))",
          dim: "hsl(var(--acid-dim))",
          glow: "hsl(var(--acid-glow))",
        },
        cream: "hsl(var(--cream))",
        ash: "hsl(var(--ash))",
        coral: "hsl(var(--acid-dim))",
        mint: "hsl(var(--mint))",
        paper: {
          DEFAULT: "hsl(var(--ink))",
          soft: "hsl(var(--ink-soft))",
          deep: "hsl(var(--ink-deep))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        // Tighter editorial scale
        "display-xl": [
          "clamp(3.2rem, 9vw, 7rem)",
          { lineHeight: "0.95", letterSpacing: "-0.035em" },
        ],
        "display-lg": [
          "clamp(2.4rem, 6vw, 4.5rem)",
          { lineHeight: "1.0", letterSpacing: "-0.03em" },
        ],
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
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scanline-drift": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 -120px" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "0.55",
            transform: "translate(-50%, -50%) scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "translate(-50%, -50%) scale(1.04)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        marquee: "marquee 38s linear infinite",
        "scanline-drift": "scanline-drift 8s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
