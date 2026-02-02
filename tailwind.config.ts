import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Etihad Brand Colors
        etihad: {
          black: "#270015",
          gold: "#C4921B",
          white: "#FCFBF5",
          "gold-light": "#D4A82B",
          "gold-dark": "#A47A15",
          "black-light": "#3D0022",
        },
      },
    },
  },
  plugins: [],
};
export default config;
