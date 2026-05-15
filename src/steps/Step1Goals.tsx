import { motion } from "framer-motion";
import { useState } from "react";
import { RewireCycleDiagram } from "../components/RewireCycleDiagram";

type Props = {
  initialValue: string;
  onActivate: (goals: string) => void;
};

const PLACEHOLDER = `I want to move abroad
I want financial freedom
I want to feel attractive`;

export function Step1Goals({ initialValue, onActivate }: Props) {
  const [value, setValue] = useState(initialValue);
  const [activating, setActivating] = useState(false);

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
          Rewire your brain
        </h1>
        <p className="font-inter-display mt-4 w-full max-w-none px-1 text-center text-balance text-ink">
          Turn your goals into feelings
          <br />
          you can start living now.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-2">
        <RewireCycleDiagram />
      </div>

      {/* Bottom cluster: pinned to lower area; 24px before field, 32px before CTA */}
      <div className="flex w-full shrink-0 flex-col items-center text-center">
        <h2 className="font-display w-full max-w-none text-balance text-[32px] font-normal leading-[1.15] tracking-[-0.01em] text-ink">
          Start with one goal or dream
        </h2>

        <motion.div className="glass-field grain relative mt-6 flex h-[184px] w-full shrink-0 flex-col rounded-[14px] p-4">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={PLACEHOLDER}
            className="placeholder-ink-soft font-inter-display h-full min-h-0 w-full min-w-0 flex-1 resize-none bg-transparent text-left text-ink caret-ink outline-none selection:bg-ink/10"
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
              {activating ? "Rewiring…" : "Rewire my brain"}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
