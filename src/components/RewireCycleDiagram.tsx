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

const BLOB_SCALE = 1.25 * 1.2; /* +25%, then +20% */
const BLOB_BOX = 88 * BLOB_SCALE;
const BLOB_CORE = 62 * BLOB_SCALE;

/** Organic center blob — morphing shapes, centered at SVG origin */
function CenterBlob() {
  const box = BLOB_BOX;
  const half = box / 2;
  const core = BLOB_CORE;

  return (
    <foreignObject x={-half} y={-half} width={box} height={box} overflow="hidden">
      <motion.div className="relative" style={{ width: box, height: box, overflow: "hidden" }}>
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{
            width: core,
            height: core,
            marginLeft: -core / 2,
            marginTop: -core / 2,
            borderRadius: BLOB_RADIUS[0],
            background:
              "radial-gradient(at 28% 28%, #FFF8EC 0%, #FBD2B7 45%, #F5E8DC 78%, #EDE6F5 100%)",
          }}
          animate={{
            rotate: [0, 14, -11, 7, -5, 0],
            scale: [1, 1.06, 0.94, 1.03, 0.97, 1],
            borderRadius: [...BLOB_RADIUS],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            top: "22%",
            left: "28%",
            width: "30%",
            height: "20%",
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(255,255,255,0.75), rgba(255,255,255,0) 72%)",
          }}
        />
      </motion.div>
    </foreignObject>
  );
}

export function RewireCycleDiagram({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative mx-auto flex w-full max-w-[300px] shrink-0 items-center justify-center ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-[min(58vw,320px)] w-[min(58vw,320px)]"
        overflow="visible"
      >
        <defs>
          <radialGradient id="rewire-center-grad" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="rgba(255,248,236,0.98)" />
            <stop offset="35%" stopColor="rgba(252,234,176,0.88)" />
            <stop offset="65%" stopColor="rgba(232,180,184,0.55)" />
            <stop offset="100%" stopColor="rgba(216,201,238,0.72)" />
          </radialGradient>
          <radialGradient id="rewire-glow-pulse-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="50%" stopColor="rgba(230,210,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
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

        {/* Single centered group — ring, blob, labels move together */}
        <motion.g
          transform={`translate(${CX}, ${CY})`}
          style={{ transformBox: "fill-box", transformOrigin: "0px 0px" }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle
            r={R + 18}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="12"
            filter="url(#rewire-ring-aura)"
            opacity="0.4"
          />

          <motion.circle
            r={R + 4}
            fill="none"
            stroke="url(#rewire-ring-violet)"
            strokeWidth="4"
            filter="url(#rewire-ring-aura)"
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

          <CenterBlob />

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
        </motion.g>
      </svg>
    </motion.div>
  );
}
