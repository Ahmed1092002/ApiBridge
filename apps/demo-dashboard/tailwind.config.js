/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc5fb",
          400: "#38a5f8",
          500: "#0e87eb",
          600: "#026ac8",
          700: "#0354a2",
          800: "#074785",
          900: "#0c3b6e",
          950: "#082649",
        },
      },
    },
  },
  plugins: [],
};
