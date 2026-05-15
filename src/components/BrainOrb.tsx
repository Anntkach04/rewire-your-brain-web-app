import { motion } from "framer-motion";

type Props = {
  state?: "idle" | "activating";
  size?: number;
};

/**
 * The glowing "brain / sun / blob" centerpiece.
 * Not a literal brain — more like a warm pulsing organism of light.
 */
export function BrainOrb({ state = "idle", size = 220 }: Props) {
  const activating = state === "activating";

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      {/* Outer halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.45,
          height: size * 1.45,
          background:
            "radial-gradient(closest-side, rgba(251,210,183,0.55), rgba(252,234,176,0.25) 45%, rgba(216,201,238,0) 75%)",
          filter: "blur(8px)",
        }}
        animate={{
          scale: activating ? [1, 1.25, 1.1] : [1, 1.05, 1],
          opacity: activating ? [0.6, 1, 0.85] : [0.55, 0.85, 0.55],
        }}
        transition={{
          duration: activating ? 1.6 : 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Middle aura */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.05,
          height: size * 1.05,
          background:
            "radial-gradient(closest-side, rgba(255,227,206,0.95), rgba(232,180,184,0.55) 55%, rgba(216,201,238,0) 80%)",
          filter: "blur(4px)",
        }}
        animate={{
          scale: activating ? [1, 1.12, 1.04] : [1, 1.03, 1],
        }}
        transition={{
          duration: activating ? 1.2 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Core blob — imperfect shape */}
      <motion.div
        className="relative grid place-items-center"
        style={{
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: "42% 58% 63% 37% / 47% 41% 59% 53%",
          background:
            "radial-gradient(at 30% 30%, #FFF6E2 0%, #FBD2B7 35%, #E8B4B8 75%, #D8C9EE 100%)",
          boxShadow:
            "inset 0 6px 24px rgba(255,255,255,0.6), inset 0 -10px 30px rgba(92,70,50,0.18), 0 30px 80px -30px rgba(245,184,156,0.6)",
        }}
        animate={{
          rotate: [0, 8, -6, 0],
          scale: activating ? [1, 1.08, 1.02] : [1, 1.02, 1],
          borderRadius: [
            "42% 58% 63% 37% / 47% 41% 59% 53%",
            "55% 45% 38% 62% / 52% 56% 44% 48%",
            "48% 52% 60% 40% / 45% 50% 50% 55%",
            "42% 58% 63% 37% / 47% 41% 59% 53%",
          ],
        }}
        transition={{
          duration: activating ? 3 : 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute"
          style={{
            top: "14%",
            left: "20%",
            width: "32%",
            height: "22%",
            borderRadius: "50%",
            background:
              "radial-gradient(closest-side, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)",
            filter: "blur(4px)",
          }}
        />
        {/* Soft inner ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: "62%",
            height: "62%",
            border: "1px solid rgba(255,255,255,0.45)",
            filter: "blur(0.6px)",
          }}
        />
      </motion.div>

      {/* Tiny orbiting sparkles */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
          style={{
            top: "50%",
            left: "50%",
          }}
          animate={{
            x: [
              Math.cos((i * 2.1) + 0) * size * 0.55,
              Math.cos((i * 2.1) + Math.PI) * size * 0.55,
              Math.cos((i * 2.1) + 2 * Math.PI) * size * 0.55,
            ],
            y: [
              Math.sin((i * 2.1) + 0) * size * 0.55,
              Math.sin((i * 2.1) + Math.PI) * size * 0.55,
              Math.sin((i * 2.1) + 2 * Math.PI) * size * 0.55,
            ],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 9 + i * 2,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}
