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
        ink: "#0f1728",
        mist: "#f5f7fb",
        shell: "#fafbff",
        line: "rgba(15, 23, 40, 0.08)",
        accent: {
          blue: "#4f7cff",
          cyan: "#38bdf8",
          violet: "#7c5cfc",
          rose: "#f472b6",
          pink: "#f9a8d4"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "PingFang SC",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ]
      },
      letterSpacing: {
        tightest: "-0.04em"
      },
      boxShadow: {
        glass: "0 8px 32px rgba(17, 24, 39, 0.08)",
        float: "0 24px 60px rgba(124, 92, 252, 0.16)",
        glow: "0 0 20px rgba(124, 92, 252, 0.22), 0 0 40px rgba(56, 189, 248, 0.12)"
      },
      backgroundImage: {
        aurora:
          "radial-gradient(ellipse at 15% 8%, rgba(139, 92, 246, 0.13), transparent 44%), radial-gradient(ellipse at 82% 12%, rgba(56, 189, 248, 0.11), transparent 38%), linear-gradient(180deg, #fafbff 0%, #f3f5fd 100%)",
        hero:
          "linear-gradient(112deg, #0f1728 0%, #4c3db5 22%, #7c5cfc 42%, #38bdf8 68%, #e0f2ff 100%)"
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, 12px, 0)" }
        },
        "orb-float-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "30%": { transform: "translate(55px, -38px) scale(1.07)" },
          "70%": { transform: "translate(-28px, 22px) scale(0.95)" }
        },
        "orb-float-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "40%": { transform: "translate(-65px, 48px) scale(1.09)" },
          "80%": { transform: "translate(18px, -14px) scale(0.97)" }
        },
        "orb-float-3": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(36px, 55px) scale(1.06)" }
        }
      },
      animation: {
        drift: "drift 10s ease-in-out infinite",
        "orb-1": "orb-float-1 18s ease-in-out infinite",
        "orb-2": "orb-float-2 23s ease-in-out infinite",
        "orb-3": "orb-float-3 28s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
