import { motion } from "framer-motion";
import { useState } from "react";
import { copyNotesToClipboard } from "../lib/buildNotesExport";
import type { SessionState } from "../types";

type Props = {
  session: SessionState;
  onRestart: () => void;
};

export function Step5Notes({ session, onRestart }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const allActions = [...session.actions, ...session.customActions];

  async function handleCopy() {
    const ok = await copyNotesToClipboard(session);
    if (!ok) {
      setCopyState("idle");
      return;
    }
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 1800);
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
        <span className="step-label">step 5</span>
        <h1 className="heading mt-3 text-balance">Your rewired thoughts</h1>
        <p className="subtle font-inter-display mt-3 mx-auto max-w-[320px] text-balance">
          A soft page to keep. Read it tomorrow morning.
        </p>
      </div>

      <div className="mt-7">
        <div className="glass-card grain relative mx-auto w-full overflow-hidden p-6 text-ink">
          <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.09] mix-blend-multiply" />
          <div
            className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(252,234,176,0.7), transparent 70%)",
              filter: "blur(10px)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(216,201,238,0.55), transparent 70%)",
              filter: "blur(14px)",
            }}
          />

          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="font-display text-[15px] font-normal italic text-ink">brain note</span>
              <span className="font-display text-[12px] font-normal text-ink">
                {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <Block label="What I want">
                <p className="font-display whitespace-pre-wrap text-[15px] font-normal leading-relaxed text-ink">
                  {session.goals}
                </p>
              </Block>

              <Block label="Feelings behind it">
                <div className="flex flex-wrap gap-1.5">
                  {session.selectedFeelings.map((f) => (
                    <span key={f} className="pill font-display text-[12px] font-normal text-ink">
                      {f}
                    </span>
                  ))}
                </div>
              </Block>

              <Block label="Why I deserve to feel this way">
                <p className="font-display whitespace-pre-wrap text-[15px] font-normal leading-relaxed text-ink">
                  {session.deserveReasons}
                </p>
              </Block>

              <Block label="Actions to feel more this way.">
                <ul className="space-y-2">
                  {allActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-peach-deep" />
                      <span className="font-inter-display text-ink">{a}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7">
        <button
          type="button"
          onClick={handleCopy}
          className="btn-ghost flex w-full items-center justify-center gap-2 py-3.5 text-[16px] font-medium"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="9" y="9" width="13" height="13" rx="3" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          {copyState === "copied" ? "Copied ✓" : "Export to notes"}
        </button>
      </div>

      <div className="mt-auto pt-8">
        <button type="button" onClick={onRestart} className="btn-primary w-full max-w-none">
          Add another goal
        </button>
      </div>
    </motion.section>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-display text-[16px] font-normal leading-snug text-ink">
        {label}
      </div>
      {children}
    </div>
  );
}
