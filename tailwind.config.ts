import { type Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        "accent-primary": "var(--accent-primary)",
        "accent-hover": "var(--accent-hover)",
        inverted: "var(--text-primary)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        "accent-primary": "var(--accent-primary)",
        "accent-hover": "var(--accent-hover)",
        inverted: "var(--bg-primary)",
      },
      borderColor: {
        primary: "var(--border-primary)",
      },
    },
  },
  plugins: [],
} satisfies Config;
