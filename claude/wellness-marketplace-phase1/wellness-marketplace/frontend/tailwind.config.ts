import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f4f7f4",
          100: "#e5ede6",
          200: "#c9dccb",
          300: "#a3c4a7",
          400: "#77a57e",
          500: "#57895f",
          600: "#436d4a",
          700: "#37573d",
          800: "#2f4633",
          900: "#293b2c",
        },
        sand: {
          50: "#fbf9f6",
          100: "#f5f0e8",
          200: "#ebe0cf",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        serif: ["'Fraunces'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
