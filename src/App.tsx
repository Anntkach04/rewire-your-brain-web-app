import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { Atmosphere } from "./components/Atmosphere";
import { PhoneShell } from "./components/PhoneShell";
import { Step1Goals } from "./steps/Step1Goals";
import { Step2Feelings } from "./steps/Step2Feelings";
import { Step3Reflection } from "./steps/Step3Reflection";
import { Step4Actions } from "./steps/Step4Actions";
import { Step5Notes } from "./steps/Step5Notes";
import { generateRewireResponse } from "./lib/generateRewireResponse";
import { getSelectedActions } from "./lib/sessionActions";
import type { SessionState, StepId } from "./types";

const EMPTY_SESSION: SessionState = {
  goals: "",
  suggestedFeelings: [],
  selectedFeelings: [],
  deserveReasons: "",
  actions: [],
  customActions: [],
  completedActions: [],
};

export default function App() {
  const [step, setStep] = useState<StepId>(1);
  const [session, setSession] = useState<SessionState>(EMPTY_SESSION);
  const [thinking, setThinking] = useState<false | "listening" | "rewiring">(false);

  const goTo = useCallback((s: StepId) => {
    setStep(s);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  }, []);

  const handleActivate = useCallback(
    async (goals: string) => {
      setThinking("listening");
      const res = await generateRewireResponse(goals);
      setSession({
        goals,
        suggestedFeelings: res.feelings,
        selectedFeelings: [],
        deserveReasons: "",
        actions: res.actions,
        customActions: [],
        completedActions: [],
      });
      setThinking(false);
      goTo(2);
    },
    [goTo]
  );

  const handleToggleFeeling = useCallback((feeling: string) => {
    setSession((s) => {
      const key = feeling.toLowerCase();
      const exists = s.selectedFeelings.some((f) => f.toLowerCase() === key);
      return {
        ...s,
        selectedFeelings: exists
          ? s.selectedFeelings.filter((f) => f.toLowerCase() !== key)
          : [...s.selectedFeelings, feeling],
      };
    });
  }, []);

  const handleAddFeeling = useCallback((feeling: string) => {
    setSession((s) => {
      const key = feeling.toLowerCase();
      const inSuggested = s.suggestedFeelings.some((f) => f.toLowerCase() === key);
      const inSelected = s.selectedFeelings.some((f) => f.toLowerCase() === key);
      return {
        ...s,
        suggestedFeelings: inSuggested ? s.suggestedFeelings : [...s.suggestedFeelings, feeling],
        selectedFeelings: inSelected ? s.selectedFeelings : [...s.selectedFeelings, feeling],
      };
    });
  }, []);

  const handleToggleAction = useCallback((idx: number) => {
    setSession((s) => ({
      ...s,
      completedActions: s.completedActions.includes(idx)
        ? s.completedActions.filter((i) => i !== idx)
        : [...s.completedActions, idx],
    }));
  }, []);

  const handleAddCustomAction = useCallback((text: string) => {
    const t = text.trim();
    if (t.length < 2) return;
    setSession((s) => ({ ...s, customActions: [...s.customActions, t] }));
  }, []);

  const handleRestart = useCallback(() => {
    setSession(EMPTY_SESSION);
    goTo(1);
  }, [goTo]);

  const continueFromFeelings = useCallback(async () => {
    if (session.selectedFeelings.length === 0) return;
    setThinking("rewiring");
    const seed = `${session.goals}\n${session.selectedFeelings.join(", ")}`;
    const res = await generateRewireResponse(seed);
    setSession((s) => ({
      ...s,
      deserveReasons: "",
      actions: res.actions,
      customActions: [],
      completedActions: [],
    }));
    setThinking(false);
    goTo(3);
  }, [goTo, session.goals, session.selectedFeelings]);

  return (
    <>
      <Atmosphere />

      <PhoneShell
        step={step}
        totalSteps={5}
        onBack={
          step > 1
            ? () => goTo(Math.max(1, step - 1) as StepId)
            : undefined
        }
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1Goals key="s1" initialValue={session.goals} onActivate={handleActivate} />
          )}

          {step === 2 && (
            <Step2Feelings
              key="s2"
              suggested={session.suggestedFeelings}
              selected={session.selectedFeelings}
              onToggle={handleToggleFeeling}
              onAdd={handleAddFeeling}
              onContinue={continueFromFeelings}
            />
          )}

          {step === 3 && (
            <Step3Reflection
              key="s3"
              value={session.deserveReasons}
              onChange={(deserveReasons) => setSession((s) => ({ ...s, deserveReasons }))}
              onContinue={() => goTo(4)}
            />
          )}

          {step === 4 && (
            <Step4Actions
              key="s4"
              suggested={session.actions}
              customActions={session.customActions}
              completed={session.completedActions}
              onToggle={handleToggleAction}
              onAddCustom={handleAddCustomAction}
              onContinue={() => {
                if (getSelectedActions(session).length === 0) return;
                goTo(5);
              }}
            />
          )}

          {step === 5 && (
            <Step5Notes key="s5" session={session} onRestart={handleRestart} />
          )}
        </AnimatePresence>
      </PhoneShell>

      <AnimatePresence>
        {thinking && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50 grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-cream/40 backdrop-blur-sm" />
            <motion.div
              className="relative flex flex-col items-center gap-3"
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
            >
              <motion.div
                className="h-16 w-16 rounded-blob bg-gradient-to-br from-peach-soft via-lemon-soft to-rose-mist shadow-glow"
                animate={{
                  rotate: [0, 30, -20, 0],
                  borderRadius: [
                    "42% 58% 63% 37% / 47% 41% 59% 53%",
                    "55% 45% 38% 62% / 52% 56% 44% 48%",
                    "42% 58% 63% 37% / 47% 41% 59% 53%",
                  ],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="font-display text-[14px] font-normal italic text-ink">
                {thinking === "listening" ? "listening…" : "rewiring…"}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
