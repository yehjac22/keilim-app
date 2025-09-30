/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: { tv: "1600px" }, // ≥1600px (living-room TVs, ultrawide monitors)
    },
  },
  plugins: [],
};
