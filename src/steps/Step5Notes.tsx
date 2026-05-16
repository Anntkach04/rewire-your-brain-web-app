import { motion } from "framer-motion";
import { useState } from "react";
import { SelectedFeelingsStrip } from "../components/SelectedFeelingsStrip";
import { copyNotesToClipboard } from "../lib/buildNotesExport";
import { getSelectedActions } from "../lib/sessionActions";
import type { SessionState } from "../types";

type Props = {
  session: SessionState;
  onRestart: () => void;
};

const NOTE_BODY = "font-inter-display text-[16px] font-light leading-relaxed text-ink";

export function Step5Notes({ session, onRestart }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const selectedActions = getSelectedActions(session);

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
          Save this to your notes and act on this today.
        </p>
        <SelectedFeelingsStrip feelings={session.selectedFeelings} className="mt-5" />
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
                <p className={`${NOTE_BODY} whitespace-pre-wrap`}>{session.goals}</p>
              </Block>

              <Block label="Feelings behind it">
                <div className="flex flex-wrap gap-2">
                  {session.selectedFeelings.map((f) => (
                    <span key={f} className="pill font-display px-4 py-2 text-[14px] font-normal text-ink">
                      {f}
                    </span>
                  ))}
                </div>
              </Block>

              <Block label="Why I can already feel this">
                <p className={`${NOTE_BODY} whitespace-pre-wrap`}>{session.deserveReasons}</p>
              </Block>

              <Block label="Actions to feel this today">
                <ul className="space-y-2">
                  {selectedActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-peach-deep" />
                      <span className={NOTE_BODY}>{a}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7">
        <button type="button" onClick={onRestart} className="btn-ghost w-full max-w-none font-display text-[20px] font-normal">
          Add another goal
        </button>
      </div>

      <div className="mt-auto pt-6">
        <button type="button" onClick={handleCopy} className="btn-primary w-full max-w-none">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="9" y="9" width="13" height="13" rx="3" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          {copyState === "copied" ? "Copied ✓" : "Export to notes"}
        </button>
      </div>
    </motion.section>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-display text-[20px] font-medium leading-snug text-[#141414]">
        {label}
      </div>
      {children}
    </div>
  );
}
