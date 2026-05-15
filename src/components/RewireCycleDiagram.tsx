import { motion } from "framer-motion";

const CX = 160;
const CY = 160;
/** White orbit ring — smaller */
const R = 86;
const labelR = 138;

const fs = 18;
const centerFs = 17;

const serif = '"Instrument Serif", ui-serif, serif';

const BLOB_RADIUS = [
  "42% 58% 63% 37% / 47% 41% 59% 53%",
  "55% 45% 38% 62% / 52% 56% 44% 48%",
  "48% 52% 58% 42% / 44% 48% 52% 56%",
  "58% 42% 45% 55% / 50% 44% 56% 50%",
  "42% 58% 63% 37% / 47% 41% 59% 53%",
] as const;

const BLOB_GRADIENTS = [
  "radial-gradient(ellipse 85% 90% at 38% 32%, rgba(255,252,240,0.98) 0%, rgba(252,234,176,0.88) 42%, rgba(232,180,184,0.55) 72%, rgba(216,201,238,0.7) 100%)",
  "radial-gradient(ellipse 90% 85% at 62% 38%, rgba(255,248,230,0.98) 0%, rgba(255,225,190,0.85) 40%, rgba(245,200,210,0.5) 70%, rgba(200,185,240,0.75) 100%)",
  "radial-gradient(ellipse 88% 92% at 45% 55%, rgba(255,250,238,0.98) 0%, rgba(252,228,188,0.9) 45%, rgba(228,195,200,0.52) 75%, rgba(210,200,245,0.72) 100%)",
  "radial-gradient(ellipse 92% 88% at 55% 42%, rgba(255,251,245,0.98) 0%, rgba(250,232,178,0.86) 42%, rgba(235,188,195,0.54) 72%, rgba(218,205,248,0.68) 100%)",
  "radial-gradient(ellipse 85% 90% at 38% 32%, rgba(255,252,240,0.98) 0%, rgba(252,234,176,0.88) 42%, rgba(232,180,184,0.55) 72%, rgba(216,201,238,0.7) 100%)",
] as const;

const NODE_SPOTS = [
  { cx: CX, cy: CY - R, key: "t", pulseDelay: 0 },
  { cx: CX + R, cy: CY, key: "r", pulseDelay: 1.1 },
  { cx: CX, cy: CY + R, key: "b", pulseDelay: 2.2 },
  { cx: CX - R, cy: CY, key: "l", pulseDelay: 3.3 },
] as const;

export function RewireCycleDiagram({ className = "" }: { className?: string }) {
  const topY = CY - labelR;
  const bottomY = CY + labelR;
  const leftX = CX - labelR - 5;
  const rightX = CX + labelR + 5;

  const topOrbit = CY - R;
  const rightOrbit = CX + R;
  const bottomOrbit = CY + R;
  const leftOrbit = CX - R;

  return (
    <motion.div
      className={`relative mx-auto flex w-full max-w-[300px] shrink-0 items-center justify-center ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <svg viewBox="0 0 320 320" className="h-[min(58vw,320px)] w-[min(58vw,320px)] overflow-visible">
        <defs>
          <linearGradient id="rewire-ring-violet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(232,214,255,0.95)" />
            <stop offset="50%" stopColor="rgba(210,190,245,0.88)" />
            <stop offset="100%" stopColor="rgba(245,236,255,0.92)" />
          </linearGradient>
          <filter id="rewire-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="rewire-soft-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="rewire-ring-aura" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
            </feMerge>
          </filter>
          <filter id="rewire-dot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker
            id="rewire-arrow-head"
            markerWidth="5"
            markerHeight="5"
            refX="4"
            refY="2.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L5,2.5 L0,5 Z" fill="rgba(255,255,255,0.95)" />
          </marker>
        </defs>

        {/* Ambient halo */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={R + 18}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="12"
          filter="url(#rewire-ring-aura)"
          animate={{ opacity: [0.25, 0.55, 0.25], r: [R + 16, R + 20, R + 16] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Violet under-glow */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={R + 4}
          fill="none"
          stroke="url(#rewire-ring-violet)"
          strokeWidth="4"
          filter="url(#rewire-ring-aura)"
          animate={{ opacity: [0.28, 0.58, 0.28] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* White ring — smaller, brighter pulse */}
        <motion.g filter="url(#rewire-glow)">
          <motion.circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.1"
            animate={{ opacity: [0.5, 0.95, 0.5], strokeWidth: [1, 1.35, 1] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.g
            stroke="rgba(255,255,255,0.95)"
            fill="none"
            strokeWidth="1.05"
            strokeLinecap="round"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d={`M ${CX} ${topOrbit} A ${R} ${R} 0 0 1 ${rightOrbit} ${CY}`} markerEnd="url(#rewire-arrow-head)" />
            <path d={`M ${rightOrbit} ${CY} A ${R} ${R} 0 0 1 ${CX} ${bottomOrbit}`} markerEnd="url(#rewire-arrow-head)" />
            <path d={`M ${CX} ${bottomOrbit} A ${R} ${R} 0 0 1 ${leftOrbit} ${CY}`} markerEnd="url(#rewire-arrow-head)" />
            <path d={`M ${leftOrbit} ${CY} A ${R} ${R} 0 0 1 ${CX} ${topOrbit}`} markerEnd="url(#rewire-arrow-head)" />
          </motion.g>
        </motion.g>

        {/* Ring nodes — sequential highlight */}
        {NODE_SPOTS.map((n) => (
          <motion.circle
            key={n.key}
            cx={n.cx}
            cy={n.cy}
            r={5}
            fill="rgba(255,255,255,0.35)"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="0.75"
            filter="url(#rewire-dot-glow)"
            animate={{
              opacity: [0.35, 1, 0.35],
              r: [4.5, 7, 4.5],
              fill: [
                "rgba(255,255,255,0.35)",
                "rgba(255,255,255,0.95)",
                "rgba(255,255,255,0.35)",
              ],
              stroke: [
                "rgba(255,255,255,0.45)",
                "rgba(255,255,255,1)",
                "rgba(255,255,255,0.45)",
              ],
            }}
            transition={{
              duration: 4.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: n.pulseDelay,
            }}
          />
        ))}

        {/* Morphing center blob */}
        <foreignObject x={CX - 50} y={CY - 50} width={100} height={100} className="overflow-visible">
          <motion.div
            className="h-full w-full"
            style={{
              boxShadow:
                "0 0 28px rgba(255,255,255,0.45), 0 0 48px rgba(216,201,238,0.35), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
            animate={{
              borderRadius: [...BLOB_RADIUS],
              background: [...BLOB_GRADIENTS],
              scale: [1, 1.05, 0.97, 1.03, 1],
              x: [0, 3, -2, 2, 0],
              y: [0, -2, 3, -1, 0],
              rotate: [0, 3, -2, 2, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </foreignObject>

        {/* Center copy — moves gently with blob */}
        <motion.g
          animate={{ y: [0, -1.5, 1, 0], opacity: [0.92, 1, 0.92] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <text
            x={CX}
            y={CY - 9}
            textAnchor="middle"
            fill="#202020"
            style={{ fontSize: centerFs, fontFamily: serif }}
          >
            repeat
          </text>
          <text
            x={CX}
            y={CY + 11}
            textAnchor="middle"
            fill="#202020"
            style={{ fontSize: centerFs, fontFamily: serif }}
          >
            → believe
          </text>
        </motion.g>

        {/* Corner labels — static, further from ring */}
        <text
          x={CX}
          y={topY + 7}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#202020"
          style={{ fontSize: fs, fontFamily: serif }}
        >
          goals
        </text>
        <text
          x={rightX}
          y={CY}
          textAnchor="end"
          dominantBaseline="middle"
          fill="#202020"
          style={{ fontSize: fs, fontFamily: serif }}
        >
          feelings
        </text>
        <text
          x={CX}
          y={bottomY - 7}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#202020"
          style={{ fontSize: fs, fontFamily: serif }}
        >
          actions
        </text>
        <text
          x={leftX}
          y={CY}
          textAnchor="start"
          dominantBaseline="middle"
          fill="#202020"
          style={{ fontSize: fs, fontFamily: serif }}
        >
          beliefs
        </text>
      </svg>
    </motion.div>
  );
}
