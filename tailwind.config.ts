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
        shell: "#fbfcff",
        line: "rgba(15, 23, 40, 0.08)",
        accent: {
          blue: "#4f7cff",
          cyan: "#4fd1ff",
          rose: "#ff6f91"
        }
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ]
      },
      boxShadow: {
        glass: "0 20px 80px rgba(17, 24, 39, 0.12)",
        float: "0 24px 60px rgba(79, 124, 255, 0.16)"
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at top, rgba(79, 124, 255, 0.18), transparent 42%), radial-gradient(circle at 80% 20%, rgba(79, 209, 255, 0.18), transparent 28%), linear-gradient(180deg, #fbfcff 0%, #f2f6ff 100%)",
        hero:
          "linear-gradient(120deg, #0f1728 0%, #3f5eb3 35%, #4fd1ff 70%, #ffffff 100%)"
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, 12px, 0)" }
        }
      },
      animation: {
        drift: "drift 10s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
