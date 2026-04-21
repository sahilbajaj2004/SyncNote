/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Satoshi", "-apple-system", "sans-serif"],
        body: ["General Sans", "-apple-system", "sans-serif"],
      },
      colors: {
        void: "#06060b",
        deep: "#0a0a12",
        gold: {
          50: "#fffbeb",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};