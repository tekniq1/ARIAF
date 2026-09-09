/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: "#3E2723", // Deep Espresso Brown
          dark: "#2A1A17",
          light: "#5D4037",
        },
        gold: {
          DEFAULT: "#C2A878", // Muted Gold
          soft: "#D6C39A",
          dark: "#9B8356",
          light: "#E8DCC4",
        },
        beige: {
          DEFAULT: "#F4EFEA", // Soft Warm Beige
          warm: "#EAE2D6",
        },
        cream: {
          DEFAULT: "#FAF8F5", // Warm Ivory / Cream
          pure: "#FCFBF9", // Slightly lighter for cards
        },
        graySoft: "#E6DED3", // Borders
        darkText: "#2D1E1B", // Text Primary
        taupe: "#8D7B68", // Text Secondary
      },
      fontFamily: {
        alexandria: ["'Alexandria'", "'Noto Kufi Arabic'", "sans-serif"],
        serif: ["'Playfair Display'", "serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
      },
      boxShadow: {
        luxury: "0 10px 40px -10px rgba(62, 39, 35, 0.06)",
        gold: "0 4px 20px rgba(194, 168, 120, 0.15)",
        goldHover: "0 8px 30px rgba(194, 168, 120, 0.25)",
        card: "0 4px 15px rgba(62, 39, 35, 0.03)",
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [],
};
