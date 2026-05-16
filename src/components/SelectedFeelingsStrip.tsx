import { motion } from "framer-motion";

const TAG_PALETTES = [
  "from-peach-soft to-rose-mist",
  "from-lemon-soft to-peach-soft",
  "from-lavender-soft to-rose-mist",
  "from-rose-mist to-lavender-soft",
  "from-lemon to-peach",
  "from-lavender-mist to-lemon-soft",
] as const;

type Props = {
  feelings: string[];
  className?: string;
  /** Step 5 brain note — same chip style, 2px smaller */
  compact?: boolean;
};

/** Read-only feeling chips shown on steps 3–5 */
export function SelectedFeelingsStrip({ feelings, className = "", compact = false }: Props) {
  if (feelings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-wrap justify-center gap-3 ${className}`}
      aria-label="Your selected feelings"
    >
      {feelings.map((f, i) => {
        const palette = TAG_PALETTES[i % TAG_PALETTES.length];
        return (
          <span
            key={f}
            className={`glass-chip font-display inline-flex items-center gap-2 px-5 py-3 font-normal italic text-ink bg-gradient-to-br ${palette} shadow-glow ring-1 ring-white/65 ${compact ? "text-[15px]" : "text-[17px]"}`}
          >
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current"
              aria-hidden
            />
            {f}
          </span>
        );
      })}
    </motion.div>
  );
}
