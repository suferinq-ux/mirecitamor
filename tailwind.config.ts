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
          900: "#0d0217",
          800: "#150425",
          700: "#1e0733",
          600: "#2a0b45"
        },
        rose: {
          glow: "#ff6b9d"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(255,107,157,0.35)",
        "glow-sm": "0 0 18px rgba(255,107,157,0.30)"
      },
      keyframes: {
        fall: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "0.7" },
          "100%": { transform: "translateY(110vh) rotate(360deg)", opacity: "0" }
        },
        beat: {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.12)" },
          "40%": { transform: "scale(0.98)" },
          "60%": { transform: "scale(1.08)" }
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        }
      },
      animation: {
        fall: "fall linear infinite",
        beat: "beat 1.6s ease-in-out infinite",
        floaty: "floaty 5s ease-in-out infinite",
        shimmer: "shimmer 6s ease infinite"
      }
    }
  },
  plugins: []
};

export default config;
