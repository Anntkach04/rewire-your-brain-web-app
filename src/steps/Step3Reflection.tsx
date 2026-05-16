import { motion } from "framer-motion";
import { SelectedFeelingsStrip } from "../components/SelectedFeelingsStrip";

type Props = {
  selectedFeelings: string[];
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
};

const PLACEHOLDER = `I've kept going even when things felt uncertain.
I care about doing right by myself and the people I love.
I'm allowed to want this feeling without earning it first.`;

export function Step3Reflection({ selectedFeelings, value, onChange, onContinue }: Props) {
  const canContinue = value.trim().length >= 8;

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
        <h1 className="heading mt-3 text-balance px-1">Write down the reasons why you deserve to feel this way</h1>
        <SelectedFeelingsStrip feelings={selectedFeelings} className="mt-5" />
      </div>

      <div className="mt-8 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-field grain relative flex h-[200px] flex-col rounded-[14px] p-3"
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={PLACEHOLDER}
            className="placeholder-ink-soft font-inter-display min-h-0 w-full flex-1 resize-none overflow-y-auto bg-transparent text-left text-ink caret-ink outline-none selection:bg-ink/10"
            aria-label="Reasons you deserve to feel this way"
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
