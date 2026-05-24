/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        surface: "#1E293B",

        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
        },

        brand: {
          primary: "#0F766E", // destaque
        },

        success: "#166534",
        danger: "#831843",
      },

      fontFamily: {
        display: ["IBM Plex Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};