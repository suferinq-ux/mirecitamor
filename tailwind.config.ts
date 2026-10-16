import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        script: ["var(--font-script)", "cursive"],
        body: ["var(--font-body)", "sans-serif"]
      },
      colors: {
        night: {
          950: "#0b0509",
          900: "#120810",
          800: "#1a0d16",
          700: "#24131d"
        },
        blush: {
          50: "#fdf6f8",
          100: "#fbe9ee",
          200: "#f7d3dd",
          300: "#f2b3c4",
          400: "#ea8aa4",
          500: "#dd6485",
          600: "#c74a6c",
          700: "#a83a58",
          800: "#8c324b",
          900: "#752e42"
        }
      },
      letterSpacing: {
        micro: "0.22em"
      },
      boxShadow: {
        glow: "0 0 60px rgba(221,100,133,0.25)",
        "glow-sm": "0 0 24px rgba(221,100,133,0.22)",
        panel: "0 24px 60px -24px rgba(0,0,0,0.6)"
      },
      keyframes: {
        fall: {
          "0%": { transform: "translateY(-8vh) rotate(0deg)", opacity: "0" },
          "12%": { opacity: "0.35" },
          "100%": { transform: "translateY(108vh) rotate(240deg)", opacity: "0" }
        },
        beat: {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.1)" },
          "45%": { transform: "scale(0.98)" },
          "65%": { transform: "scale(1.06)" }
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        fall: "fall linear infinite",
        beat: "beat 1.8s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
