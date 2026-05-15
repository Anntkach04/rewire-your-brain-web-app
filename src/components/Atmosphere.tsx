import { useEffect, useState } from "react";

type Props = {
  intensity?: number;
};

const POSTER_URL = `${import.meta.env.BASE_URL}app-background.png`;

/**
 * Full-screen static background (no video — avoids native play icon on mobile).
 */
export function Atmosphere({ intensity = 1 }: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream">
      <div className="absolute -inset-[12%]">
        <div
          className={`app-bg-photo h-full w-full bg-cover bg-center ${reduceMotion ? "" : "will-change-transform"}`}
          style={{
            backgroundImage: `url(${POSTER_URL})`,
            opacity: 0.92 * intensity + 0.08,
          }}
          aria-hidden
        />
      </div>

      <div
        className="app-bg-glowspin absolute inset-0 mix-blend-soft-light"
        style={{
          opacity: 0.22 * intensity,
          background:
            "conic-gradient(from 0deg at 50% 45%, rgba(252,234,176,0.35), rgba(251,210,183,0.2), rgba(232,180,184,0.22), rgba(216,201,238,0.25), rgba(252,234,176,0.35))",
        }}
        aria-hidden
      />

      <div className="absolute inset-0 bg-noise opacity-[0.07] mix-blend-multiply" aria-hidden />
    </div>
  );
}