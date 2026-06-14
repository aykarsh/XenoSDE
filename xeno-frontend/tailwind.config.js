/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          alabaster: "#FFF8F0",
          copper: "#C08552",
          terracotta: "#8C5A3C",
          espresso: "#4B2E2B",
          richblack: "#0B0706",
        },
      },
      fontFamily: {
        heading: ["Instrument Serif", "serif"],
        body: ["Barlow", "sans-serif"],
      },
      backdropBlur: {
        xs: "4px",
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%":   { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.15 },
          "50%":      { opacity: 0.35 },
        },
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%":      { opacity: 0 },
        },
        chartPulse: {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%":      { transform: "scaleY(1.08)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
      },
      animation: {
        marquee:    "marquee 30s linear infinite",
        "fade-up":  "fadeUp 0.7s ease forwards",
        "pulse-glow":"pulseGlow 4s ease-in-out infinite",
        blink:      "blink 1s step-end infinite",
        "chart-pulse":"chartPulse 3s ease-in-out infinite",
        float:      "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
