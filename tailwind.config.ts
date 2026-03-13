import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gym-bg": "#0A0F1C",
        "gym-card": "#111827",
        "gym-sidebar": "#070B14",
        "gym-border": "#1E293B",
        "gym-primary": "#0350FF",
        "gym-accent": "#06B6D4",
        "gym-success": "#10B981",
        "gym-warning": "#F59E0B",
        "gym-danger": "#EF4444",
        "gym-text": "#F1F5F9",
        "gym-text-secondary": "#94A3B8",
        "gym-text-muted": "#64748B",
      },
    },
  },
  plugins: [],
};
export default config;
