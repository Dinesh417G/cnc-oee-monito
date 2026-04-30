import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:     "#0b1220",
        ink2:    "#1f2a44",
        muted:   "#5b6473",
        line:    "#e6e8ee",
        line2:   "#eef0f4",
        surface: "#f7f8fb",
        navy:    "#001141",
        primary: { DEFAULT: "#0f62fe", 700: "#0043ce" },
        run:     "#16a34a",
        idle:    "#d97706",
        alarm:   "#dc2626",
        offline: "#6b7280",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        blink:      { "0%,60%": { opacity: "1" }, "80%": { opacity: ".2" }, "100%": { opacity: "1" } },
        alarmFlash: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
        pulse2: {
          "0%":   { transform: "translate(-50%,-50%) scale(.95)", opacity: ".5" },
          "70%":  { transform: "translate(-50%,-50%) scale(1.15)", opacity: "0" },
          "100%": { transform: "translate(-50%,-50%) scale(1.15)", opacity: "0" },
        },
      },
      animation: {
        blink:      "blink 1.4s infinite",
        alarmFlash: "alarmFlash 1.4s infinite",
        pulseRing:  "pulse2 2.4s cubic-bezier(.4,0,.6,1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
