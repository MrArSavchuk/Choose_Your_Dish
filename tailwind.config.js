/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: { soft: "0 12px 30px rgba(0,0,0,.12)" },
    },
  },
  plugins: [],
};
