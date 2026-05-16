import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type Props = {
  suggested: string[];
  selected: string[];
  onToggle: (feeling: string) => void;
  onAdd: (feeling: string) => void;
  onContinue: () => void;
};

const TAG_PALETTES = [
  "from-peach-soft to-rose-mist",
  "from-lemon-soft to-peach-soft",
  "from-lavender-soft to-rose-mist",
  "from-rose-mist to-lavender-soft",
  "from-lemon to-peach",
  "from-lavender-mist to-lemon-soft",
];

export function Step2Feelings({ suggested, selected, onToggle, onAdd, onContinue }: Props) {
  const [custom, setCustom] = useState("");
  const [shake, setShake] = useState(false);

  const tags = useMemo(() => {
    // Keep suggested order stable but ensure any user-added feelings appear at the end.
    const set = new Set<string>();
    const ordered: string[] = [];
    [...suggested, ...selected].forEach((t) => {
      const key = t.toLowerCase();
      if (!set.has(key)) {
        set.add(key);
        ordered.push(t);
      }
    });
    return ordered;
  }, [suggested, selected]);

  function handleAdd() {
    const v = custom.trim().toLowerCase();
    if (!v) return;
    onAdd(v);
    setCustom("");
  }

  function handleContinue() {
    if (selected.length === 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onContinue();
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col"
    >
      <div className="text-center">
        <span className="step-label">step 2</span>
        <h1 className="heading mt-3 text-balance">What do you actually want to feel?</h1>
        <p className="subtle font-inter-display mt-3 mx-auto max-w-[320px] text-balance">
          You don&apos;t really want the goal — you want how it will make you feel.
          <br />
          <br />
          Choose the feeling you believe this goal will give you.
        </p>
      </div>

      <motion.div
        className="relative mt-7 flex flex-wrap justify-center gap-2.5"
        animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence>
          {tags.map((t, i) => {
            const isSelected = selected.some((s) => s.toLowerCase() === t.toLowerCase());
            const palette = TAG_PALETTES[i % TAG_PALETTES.length];
            return (
              <motion.button
                key={t}
                type="button"
                onClick={() => onToggle(t)}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{
                  delay: i * 0.06,
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -2 }}
                className={[
                  "glass-chip font-display group relative inline-flex items-center gap-2 px-5 py-3 text-[17px] font-normal italic text-ink transition-shadow",
                  isSelected
                    ? `bg-gradient-to-br ${palette} shadow-glow ring-1 ring-white/65`
                    : "hover:brightness-[1.02]",
                ].join(" ")}
                aria-pressed={isSelected}
              >
                {isSelected ? (
                  <motion.span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                ) : null}
                {t}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <div className="mt-7">
        <div className="glass-field grain flex w-full min-w-0 items-center gap-2 rounded-[14px] p-2 pl-4">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="add your own feeling…"
            className="placeholder-ink-soft font-inter-display min-w-0 w-full flex-1 bg-transparent text-left text-ink outline-none"
            aria-label="Add your own feeling"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!custom.trim()}
            className="btn-ghost shrink-0 px-3.5 py-2 font-display text-[13px] font-medium text-ink transition-opacity disabled:opacity-40"
          >
            add
          </button>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary w-full max-w-none"
          aria-disabled={selected.length === 0}
        >
          continue →
        </button>
      </div>
    </motion.section>
  );
}
