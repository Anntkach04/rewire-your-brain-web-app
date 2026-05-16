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

const BLOB_SCALE = 1.25 * 1.2;
const BLOB_R = (62 * BLOB_SCALE) / 2;

export function RewireCycleDiagram({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`mx-auto w-[min(58vw,320px)] shrink-0 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="block h-auto w-full"
        overflow="visible"
      >
        <defs>
          <radialGradient id="rewire-blob-grad" cx="32%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#FFF9EE" />
            <stop offset="48%" stopColor="#FBD2B7" />
            <stop offset="82%" stopColor="#F3E4D4" />
            <stop offset="100%" stopColor="#EBE4F2" />
          </radialGradient>
          <linearGradient id="rewire-ring-violet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(232,214,255,0.95)" />
            <stop offset="50%" stopColor="rgba(210,190,245,0.88)" />
            <stop offset="100%" stopColor="rgba(245,236,255,0.92)" />
          </linearGradient>
          <filter id="rewire-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
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

          {/* Blob: cx/cy = 0 — exact center of ring */}
          <motion.ellipse
            cx={0}
            cy={0}
            fill="url(#rewire-blob-grad)"
            style={{ transformOrigin: "0px 0px" }}
            animate={{
              rx: [BLOB_R * 0.96, BLOB_R * 1.06, BLOB_R * 0.94, BLOB_R * 1.03, BLOB_R],
              ry: [BLOB_R * 1.04, BLOB_R * 0.92, BLOB_R * 1.05, BLOB_R * 0.97, BLOB_R],
              rotate: [0, 10, -8, 5, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />

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
