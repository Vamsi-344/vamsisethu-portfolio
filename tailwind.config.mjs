import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Inter", ...defaultTheme.fontFamily.sans],
        display: ["Space Grotesk", "Inter", ...defaultTheme.fontFamily.sans],
        serif: ["Lora", ...defaultTheme.fontFamily.serif],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        nb: {
          // surfaces
          bg: "#fffdf5",
          "bg-dark": "#17181c",
          card: "#ffffff",
          "card-dark": "#202228",
          // text / lines
          ink: "#111111",
          "ink-dark": "#f5f3ea",
          border: "#111111",
          "border-dark": "#f5f3ea",
          // accents (match the plan docs)
          yellow: "#ffe14d",
          pink: "#ff8fab",
          blue: "#7cc8ff",
          green: "#8ef0a5",
          orange: "#ffb057",
          purple: "#c9a7ff",
          zebra: "#fff7d1",
          // legacy aliases used in a few places
          cyan: "#7cc8ff",
          lime: "#8ef0a5",
        },
      },
      borderRadius: {
        nb: "6px",
      },
      boxShadow: {
        nb: "6px 6px 0 0 var(--nb-shadow)",
        "nb-sm": "4px 4px 0 0 var(--nb-shadow)",
        "nb-xs": "2px 2px 0 0 var(--nb-shadow)",
        "nb-lg": "9px 9px 0 0 var(--nb-shadow)",
        "nb-xl": "12px 12px 0 0 var(--nb-shadow)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
