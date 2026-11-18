import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FBF8F3",
        cream: "#F4EFE6",
        ink: "#222222",
        stone: "#6B665F",
        line: "#E7E0D3",
        gold: {
          DEFAULT: "#B8975A",
          dark: "#9A7B42",
          light: "#E9DCC0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};

export default config;
