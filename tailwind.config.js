/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBF1E2",
          50: "#FFFBF5",
          100: "#FDF6EC",
          200: "#FAEAD4",
        },
        beige: {
          DEFAULT: "#F2E2C9",
          warm: "#EAD3B2",
        },
        peach: {
          DEFAULT: "#FBD2B7",
          soft: "#FFE3CE",
          deep: "#F5B89C",
        },
        rose: {
          dusty: "#E8B4B8",
          mist: "#F2C9CE",
        },
        lemon: {
          DEFAULT: "#FCEAB0",
          soft: "#FFF1C2",
        },
        lavender: {
          DEFAULT: "#D8C9EE",
          soft: "#E8DEF7",
          mist: "#EFE8FB",
        },
        cocoa: {
          DEFAULT: "#5C4632",
          soft: "#74604D",
          ink: "#3F2E20",
          mist: "#A18A75",
        },
        ink: {
          DEFAULT: "#202020",
        },
      },
      fontFamily: {
        sans: ['"Instrument Serif"', "serif"],
        serif: ['"Instrument Serif"', "serif"],
        display: ['"Instrument Serif"', "serif"],
      },
      borderRadius: {
        blob: "42% 58% 63% 37% / 47% 41% 59% 53%",
      },
      boxShadow: {
        glow: "0 30px 80px -30px rgba(245, 184, 156, 0.55), 0 10px 30px -10px rgba(216, 201, 238, 0.45)",
        soft: "0 10px 40px -15px rgba(92, 70, 50, 0.18)",
        card: "0 24px 60px -28px rgba(92, 70, 50, 0.28), 0 4px 14px -6px rgba(92, 70, 50, 0.08)",
        ring: "0 0 0 1px rgba(92, 70, 50, 0.08)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.6)",
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 0 0.2  0 0 0 0.22 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(20px,-30px,0) scale(1.05)" },
          "66%": { transform: "translate3d(-15px,15px,0) scale(0.97)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.85", filter: "blur(0px)" },
          "50%": { opacity: "1", filter: "blur(0.5px)" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        drift: "drift 18s ease-in-out infinite",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
        twinkle: "twinkle 3.5s ease-in-out infinite",
        shimmer: "shimmer 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
