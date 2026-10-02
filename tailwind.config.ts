import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#062F54",
          "navy-dark": "#03192E",
          "navy-light": "#0A3A66",
          sky: "#BCDAE6",
          "sky-light": "#E8F4F8",
          caramel: "#AC6E3B",
          "caramel-light": "#C9854E",
          cream: "#FAF6F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(3deg)" },
        },
        bubbleUp: {
          "0%": { transform: "translateY(100%) scale(0.8)", opacity: "0.2" },
          "50%": { opacity: "0.8" },
          "100%": { transform: "translateY(-100vh) scale(1.2)", opacity: "0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "bubble-up": "bubbleUp 12s linear infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
