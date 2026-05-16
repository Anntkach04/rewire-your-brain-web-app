import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Props = {
  suggested: string[];
  customActions: string[];
  completed: number[];
  onToggle: (idx: number) => void;
  onAddCustom: (text: string) => void;
  onContinue: () => void;
};

const CARD_TINTS = [
  "from-peach-soft/85 to-rose-mist/60",
  "from-lemon-soft/90 to-peach-soft/55",
  "from-lavender-soft/85 to-rose-mist/55",
  "from-rose-mist/85 to-lavender-soft/60",
];

function ActionCard({
  label,
  isDone,
  tint,
  onToggle,
}: {
  label: string;
  isDone: boolean;
  tint: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isDone}
      className={[
        "glass-field grain group relative flex w-full items-start gap-3 rounded-[14px] p-4 text-left transition-shadow",
        isDone ? `bg-gradient-to-br ${tint} shadow-glow ring-1 ring-white/55` : "shadow-soft hover:shadow-card",
      ].join(" ")}
    >
      <span
        className={[
          "relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
          isDone ? "border-transparent bg-cocoa-ink/85 text-white" : "border-cocoa/25 bg-white/70 text-transparent",
        ].join(" ")}
        aria-hidden
      >
        <AnimatePresence>
          {isDone && (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="font-inter-display flex-1 text-ink transition-colors">{label}</span>
    </button>
  );
}

export function Step4Actions({ suggested, customActions, completed, onToggle, onAddCustom, onContinue }: Props) {
  const [draft, setDraft] = useState("");

  const combined = [...suggested, ...customActions];
  const total = combined.length;
  const done = completed.length;

  function commitDraft() {
    const t = draft.trim();
    if (t.length < 2) return;
    onAddCustom(t);
    setDraft("");
  }

  const canContinue = completed.length >= 1;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col"
    >
      <div className="text-center">
        <span className="step-label">step 4</span>
        <h1 className="heading mt-3 text-balance px-1">What can you do today to feel this way?</h1>
        <p className="subtle font-inter-display mt-3 mx-auto max-w-[320px] text-balance">
          Think of small things you can do today to create this feeling.
        </p>

        <div className="mt-5 flex items-center justify-center gap-2 text-[12px] text-ink">
          <div className="h-[3px] w-32 overflow-hidden rounded-full bg-cocoa/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-peach-deep via-rose-dusty to-lavender"
              initial={false}
              animate={{ width: `${total ? (done / total) * 100 : 0}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
            />
          </div>
          <span>
            {done}/{total}
          </span>
        </div>
      </div>

      <div className="mt-7 min-h-0 flex-1 space-y-6 overflow-y-auto">
        {suggested.length > 0 ? (
          <div className="space-y-3">
            <p className="font-inter-display text-center text-ink">suggested actions</p>
            <ul className="space-y-3">
              {suggested.map((a, i) => {
                const isDone = completed.includes(i);
                const tint = CARD_TINTS[i % CARD_TINTS.length];
                return (
                  <motion.li
                    key={`s-${i}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                  >
                    <ActionCard label={a} isDone={isDone} tint={tint} onToggle={() => onToggle(i)} />
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {customActions.length > 0 ? (
          <ul className="space-y-3">
            {customActions.map((a, j) => {
              const idx = suggested.length + j;
              const isDone = completed.includes(idx);
              const tint = CARD_TINTS[idx % CARD_TINTS.length];
              return (
                <motion.li
                  key={`c-${j}-${a}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <ActionCard label={a} isDone={isDone} tint={tint} onToggle={() => onToggle(idx)} />
                </motion.li>
              );
            })}
          </ul>
        ) : null}

        <div className="glass-field grain flex w-full min-w-0 items-center gap-2 rounded-[14px] p-2 pl-4">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitDraft()}
            placeholder="Write your own small actions…"
            className="placeholder-ink-soft font-inter-display min-w-0 w-full flex-1 bg-transparent text-left text-ink outline-none"
            aria-label="Write your own small actions"
          />
          <button
            type="button"
            onClick={commitDraft}
            disabled={draft.trim().length < 2}
            className="btn-ghost shrink-0 px-3.5 py-2 font-display text-[13px] font-medium text-ink transition-opacity disabled:opacity-40"
          >
            add
          </button>
        </div>
      </div>

      <div className="mt-auto shrink-0 pt-6">
        <button type="button" onClick={onContinue} disabled={!canContinue} className="btn-primary w-full max-w-none">
          lock this in
        </button>
      </div>
    </motion.section>
  );
}
