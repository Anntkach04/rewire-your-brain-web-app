import { useEffect, useRef, useState } from "react";

type Props = {
  intensity?: number;
};

const VIDEO_URL = `${import.meta.env.BASE_URL}background.mp4`;
const POSTER_URL = `${import.meta.env.BASE_URL}app-background.png`;

/**
 * Full-screen looping video background, with poster fallback while loading and
 * a static image if the user prefers reduced motion. Subtle CSS layers on top
 * (glow + grain) match the previous ritual aesthetic.
 */
export function Atmosphere({ intensity = 1 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [staticBg, setStaticBg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* iOS shows a native play icon over transparent UI; use poster instead */
  useEffect(() => {
    const ua = navigator.userAgent;
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setStaticBg(ios);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduceMotion) return;
    el.controls = false;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    const p = el.play();
    if (p !== undefined) p.catch(() => {});
  }, [reduceMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream">
      <div className="absolute -inset-[12%]">
        <div
          className="app-bg-photo h-full w-full will-change-transform"
          style={{
            opacity: 0.92 * intensity + 0.08,
          }}
        >
          {reduceMotion || staticBg ? (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${POSTER_URL})` }}
              aria-hidden
            />
          ) : (
            <video
              ref={videoRef}
              className="app-bg-video h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={POSTER_URL}
              controls={false}
              controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
              disablePictureInPicture
              disableRemotePlayback
              tabIndex={-1}
              aria-hidden
            >
              <source src={VIDEO_URL} type="video/mp4" />
            </video>
          )}
        </div>
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
