import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f7f8f5",
        ink: "#1f2a2e",
        muted: "#617073",
        riskHigh: "#b42318",
        riskMedium: "#b7791f",
        riskLow: "#28765a"
      }
    }
  },
  plugins: []
};

export default config;
