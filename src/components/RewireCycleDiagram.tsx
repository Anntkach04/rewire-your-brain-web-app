import { motion } from "framer-motion";

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 86;
const labelR = 138;

const fs = 18;
const centerFs = 17;
const serif = '"Instrument Serif", ui-serif, serif';

const NODE_SPOTS = [
  { x: 0, y: -R, key: "t", pulseDelay: 0 },
  { x: R, y: 0, key: "r", pulseDelay: 1.1 },
  { x: 0, y: R, key: "b", pulseDelay: 2.2 },
  { x: -R, y: 0, key: "l", pulseDelay: 3.3 },
] as const;

const BLOB_RADIUS = [
  "42% 58% 63% 37% / 47% 41% 59% 53%",
  "58% 42% 35% 65% / 54% 48% 52% 46%",
  "48% 52% 62% 38% / 43% 57% 43% 57%",
  "55% 45% 40% 60% / 52% 38% 62% 48%",
  "38% 62% 55% 45% / 60% 44% 56% 40%",
  "42% 58% 63% 37% / 47% 41% 59% 53%",
] as const;

const BLOB_SCALE = 1.25 * 1.2;
const BLOB_CORE = Math.round(62 * BLOB_SCALE);

/** HTML blob — avoids iOS Safari foreignObject offset + pink blur spill */
function CenterBlob() {
  return (
    <motion.div
      className="pointer-events-none"
      style={{
        width: BLOB_CORE,
        height: BLOB_CORE,
        borderRadius: BLOB_RADIUS[0],
        background:
          "radial-gradient(at 30% 28%, #FFF9EE 0%, #FBD2B7 48%, #F3E4D4 82%, #EBE4F2 100%)",
      }}
      animate={{
        rotate: [0, 12, -9, 6, -4, 0],
        scale: [1, 1.05, 0.96, 1.03, 0.98, 1],
        borderRadius: [...BLOB_RADIUS],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function RewireCycleDiagram({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative mx-auto aspect-square w-[min(58vw,320px)] shrink-0 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <motion.div
        className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <CenterBlob />
      </motion.div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative z-10 h-full w-full" overflow="visible">
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

        <g transform={`translate(${CX}, ${CY})`}>
          <circle
            r={R + 18}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="10"
            opacity="0.35"
          />

          <motion.circle
            r={R + 4}
            fill="none"
            stroke="url(#rewire-ring-violet)"
            strokeWidth="4"
            animate={{ opacity: [0.28, 0.58, 0.28] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <g filter="url(#rewire-glow)">
            <circle r={R} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" />
            <motion.g
              stroke="rgba(255,255,255,0.95)"
              fill="none"
              strokeWidth="1.05"
              strokeLinecap="round"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d={`M 0 ${-R} A ${R} ${R} 0 0 1 ${R} 0`} markerEnd="url(#rewire-arrow-head)" />
              <path d={`M ${R} 0 A ${R} ${R} 0 0 1 0 ${R}`} markerEnd="url(#rewire-arrow-head)" />
              <path d={`M 0 ${R} A ${R} ${R} 0 0 1 ${-R} 0`} markerEnd="url(#rewire-arrow-head)" />
              <path d={`M ${-R} 0 A ${R} ${R} 0 0 1 0 ${-R}`} markerEnd="url(#rewire-arrow-head)" />
            </motion.g>
          </g>

          {NODE_SPOTS.map((n) => (
            <motion.circle
              key={n.key}
              cx={n.x}
              cy={n.y}
              r={5}
              fill="rgba(255,255,255,0.35)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="0.75"
              filter="url(#rewire-dot-glow)"
              animate={{
                opacity: [0.35, 1, 0.35],
                r: [4.5, 7, 4.5],
              }}
              transition={{
                duration: 4.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: n.pulseDelay,
              }}
            />
          ))}

          <text
            x={0}
            y={-9}
            textAnchor="middle"
            fill="#202020"
            style={{ fontSize: centerFs, fontFamily: serif }}
          >
            repeat
          </text>
          <text
            x={0}
            y={11}
            textAnchor="middle"
            fill="#202020"
            style={{ fontSize: centerFs, fontFamily: serif }}
          >
            → believe
          </text>

          <text
            x={0}
            y={-labelR + 17}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#202020"
            style={{ fontSize: fs, fontFamily: serif }}
          >
            goals
          </text>
          <text
            x={labelR + 5}
            y={0}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#202020"
            style={{ fontSize: fs, fontFamily: serif }}
          >
            feelings
          </text>
          <text
            x={0}
            y={labelR - 17}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#202020"
            style={{ fontSize: fs, fontFamily: serif }}
          >
            actions
          </text>
          <text
            x={-labelR - 5}
            y={0}
            textAnchor="start"
            dominantBaseline="middle"
            fill="#202020"
            style={{ fontSize: fs, fontFamily: serif }}
          >
            beliefs
          </text>
        </g>
      </svg>
    </motion.div>
  );
}
