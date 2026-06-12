import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fffaf7",
        coral: "#ff6575",
        rosepop: "#ff4b6a",
        butter: "#ffe69b",
        lilac: "#e8dcff",
        mint: "#dff8e8",
        skysoft: "#def3ff",
        ink: "#171717"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(244, 63, 114, 0.14)",
        sticker: "0 8px 0 rgba(23, 23, 23, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
