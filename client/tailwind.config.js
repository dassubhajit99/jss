/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maroon: { DEFAULT: "#7B1E1E", 700: "#651818", 900: "#4A1111" },
        gold: { DEFAULT: "#C99700", 600: "#A87E00", 300: "#E7C64D" },
        cream: { DEFAULT: "#FAF6EF", 200: "#F2EADD" },
        ink: { DEFAULT: "#1F1B18", 700: "#3A332E" },
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: [
          "Inter",
          '"Hind Siliguri"',
          '"Noto Sans Bengali"',
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem" },
      boxShadow: { soft: "0 6px 24px -8px rgba(31,27,24,0.18)" },
      maxWidth: { content: "72rem" },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
