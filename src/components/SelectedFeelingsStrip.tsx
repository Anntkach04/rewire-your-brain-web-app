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
};

/** Read-only feeling chips shown on steps 3–5 */
export function SelectedFeelingsStrip({ feelings, className = "" }: Props) {
  if (feelings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-wrap justify-center gap-2.5 ${className}`}
      aria-label="Your selected feelings"
    >
      {feelings.map((f, i) => {
        const palette = TAG_PALETTES[i % TAG_PALETTES.length];
        return (
          <span
            key={f}
            className={`glass-chip inline-flex items-center gap-1.5 px-4 py-2.5 text-[14px] font-medium text-ink bg-gradient-to-br ${palette} shadow-glow ring-1 ring-white/65`}
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
