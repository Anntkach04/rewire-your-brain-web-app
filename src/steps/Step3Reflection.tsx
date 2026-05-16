import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { SelectedFeelingsStrip } from "../components/SelectedFeelingsStrip";

type Props = {
  selectedFeelings: string[];
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
};

const REFLECTION_EXAMPLE =
  "e.g. I feel accomplished because I keep showing up at the gym, even on hard days";

export function Step3Reflection({ selectedFeelings, value, onChange, onContinue }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isActive, setIsActive] = useState(false);
  const canContinue = value.trim().length >= 8;
  const showExample = !value.trim() && !isActive;

  function activateField() {
    setIsActive(true);
    textareaRef.current?.focus();
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="text-center">
        <span className="step-label">step 3</span>
        <h1 className="heading mt-3 text-balance px-1">Why can you already feel this?</h1>
        <p className="font-inter-display mx-auto mt-3 max-w-[320px] text-balance text-ink">
          You don&apos;t need to wait for the result to feel this way.
        </p>
        <p className="font-inter-display mx-auto mt-2 max-w-[320px] text-balance text-ink">
          Find evidence that this feeling already exists in your life.
        </p>
        <SelectedFeelingsStrip feelings={selectedFeelings} className="mt-5" />
      </div>

      <div className="mt-7 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-field grain relative flex h-[200px] flex-col rounded-[14px] p-4"
          onPointerDown={activateField}
        >
          <AnimatePresence>
            {showExample ? (
              <motion.p
                key="example"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute inset-0 p-4 text-left font-inter-display text-[11px] font-light leading-[18px] tracking-[-0.02em] text-ink/50"
                aria-hidden
              >
                {REFLECTION_EXAMPLE}
              </motion.p>
            ) : null}
          </AnimatePresence>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setIsActive(true);
              onChange(e.target.value);
            }}
            onFocus={() => setIsActive(true)}
            onBlur={() => setIsActive(false)}
            className="goals-field font-inter-display relative z-[1] min-h-0 w-full flex-1 resize-none overflow-y-auto bg-transparent text-left text-ink caret-ink outline-none selection:bg-ink/10"
            aria-label="Evidence that you already feel this way"
          />
        </motion.div>
      </div>

      <div className="mt-auto shrink-0 pt-8">
        <button type="button" onClick={onContinue} disabled={!canContinue} className="btn-primary w-full max-w-none">
          Continue
        </button>
      </div>
    </motion.section>
  );
}
