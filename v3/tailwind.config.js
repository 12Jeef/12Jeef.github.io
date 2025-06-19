/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        blob1: ["Blob1", "sans-serif"],
        blob2: ["Blob2", "sans-serif"],
        blob3: ["Blob3", "sans-serif"],
      },
    },
  },
  plugins: [],
};
