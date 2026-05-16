import { motion } from "framer-motion";
import { useState } from "react";
import { RewireCycleDiagram } from "../components/RewireCycleDiagram";

type Props = {
  initialValue: string;
  onActivate: (goals: string) => void;
};

const GOAL_EXAMPLES = [
  "e.g. I want to be in a loving, secure relationship",
  "I want to grow my audience to 1M followers",
  "I want to publish my first book",
] as const;

export function Step1Goals({ initialValue, onActivate }: Props) {
  const [value, setValue] = useState(initialValue);
  const [activating, setActivating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const showExamples = !value.trim() && !isFocused;

  const disabled = value.trim().length < 3 || activating;

  function handleClick() {
    if (disabled) return;
    setActivating(true);
    setTimeout(() => onActivate(value.trim()), 900);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-1 flex-col justify-between pt-2 text-ink"
    >
      {/* Top cluster: 8px under progress (pt-2 on section), then 16 / 16 */}
      <div className="flex w-full shrink-0 flex-col items-center text-center">
        <p className="step-label">step 1</p>
        <h1 className="font-display mt-4 w-full max-w-none text-center text-balance text-[53px] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
          Rewire Your Brain
        </h1>
        <p className="font-inter-display mt-4 w-full max-w-none px-1 text-center text-balance text-ink">
          into creating your dream life
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-2">
        <RewireCycleDiagram />
      </div>

      {/* Bottom cluster: pinned to lower area; 24px before field, 32px before CTA */}
      <div className="flex w-full shrink-0 flex-col items-center text-center">
        <h2 className="font-display w-full max-w-none text-balance text-[32px] font-normal leading-[1.15] tracking-[-0.01em] text-ink">
          Start with one specific goal
        </h2>
        <p className="font-inter-display mt-2 w-full text-center text-ink">
          (one goal at a time works best)
        </p>

        <motion.div className="glass-field grain relative mt-6 flex h-[184px] w-full shrink-0 flex-col rounded-[14px] p-4">
          {showExamples ? (
            <motion.div
              className="pointer-events-none absolute inset-0 flex flex-col gap-[10px] p-4 text-left"
              aria-hidden
            >
              {GOAL_EXAMPLES.map((line) => (
                <p
                  key={line}
                  className="font-inter-display m-0 text-[11px] font-light leading-[18px] tracking-[-0.02em] text-ink/50"
                >
                  {line}
                </p>
              ))}
            </motion.div>
          ) : null}
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="goals-field font-inter-display relative z-[1] h-full min-h-0 w-full min-w-0 flex-1 resize-none bg-transparent text-left text-ink caret-ink outline-none selection:bg-ink/10"
            aria-label="Your goal or dream"
          />
        </motion.div>

        <div className="mt-8 w-full shrink-0">
          <motion.button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            whileTap={{ scale: 0.98 }}
            className="btn-primary-glass font-display w-full max-w-none"
            aria-busy={activating}
          >
            <span className="btn-primary-glass__label">
              {activating ? "Rewiring…" : "Rewire this Goal →"}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
