/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          blue: "#1A73E8",
          "blue-dark": "#1558B0",
          "blue-light": "#E8F0FE",
          orange: "#F57C00",
          red: "#E53935",
        },
        surface: {
          primary: "#FAFAFA",
          white: "#FFFFFF",
          muted: "#F5F5F5",
          dark: "#1A1A2E",
        },
        border: {
          primary: "#E0E0E0",
          light: "#F0F0F0",
        },
        ink: {
          primary: "#1A1A1A",
          secondary: "#555555",
          tertiary: "#888888",
          muted: "#AAAAAA",
        },
      },
      fontFamily: {
        heading: ['"Newsreader"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      maxWidth: {
        content: "1216px",
        article: "760px",
        narrow: "640px",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        ticker: "ticker 40s linear infinite",
      },
    },
  },
  plugins: [],
};
