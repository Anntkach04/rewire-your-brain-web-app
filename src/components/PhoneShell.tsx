import type { ReactNode } from "react";
import { StepProgress } from "./StepProgress";

type Props = {
  children: ReactNode;
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
};

/**
 * Mobile-first centered container. Progress bar uses the same rules on every step.
 */
export function PhoneShell({ children, step, totalSteps = 5, onBack }: Props) {
  const s = step ?? 1;

  return (
    <div className="relative min-h-[100dvh] w-full">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[440px] flex-col px-10 pt-[max(40px,env(safe-area-inset-top))] pb-[max(40px,env(safe-area-inset-bottom))] sm:max-w-[460px]">
        {s > 1 ? (
          <header className="flex items-center justify-between pb-3">
            <button
              type="button"
              onClick={onBack}
              disabled={!onBack}
              className="glass-icon-btn"
              aria-label="Back"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="flex-1" aria-hidden />

            <div className="h-9 w-9 shrink-0" aria-hidden />
          </header>
        ) : null}

        <div className={s === 1 ? "pb-0" : "pb-4"}>
          <StepProgress current={s} total={totalSteps} />
        </div>

        <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
