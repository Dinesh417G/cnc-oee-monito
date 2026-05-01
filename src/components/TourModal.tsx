"use client";
import { useEffect } from "react";
import { useTourPlayer } from "@/hooks/useTourPlayer";
import { TOUR_SCRIPT } from "@/lib/tourScript";

interface Props { onClose: () => void; }

export default function TourModal({ onClose }: Props) {
  const {
    currentStep, currentStepIndex, totalSteps,
    progress, isPaused, isComplete, controls,
  } = useTourPlayer(TOUR_SCRIPT);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ESC to close; arrow keys + space
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")      { onClose(); return; }
      if (e.key === "ArrowRight")  { controls.skipNext(); return; }
      if (e.key === "ArrowLeft")   { controls.skipPrev(); return; }
      if (e.key === " ")           { e.preventDefault(); isPaused ? controls.play() : controls.pause(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, controls, isPaused]);

  const pct = Math.round(progress * 100);

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-5xl flex-col bg-white shadow-[0_40px_80px_-20px_rgba(0,17,65,0.5)] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-line bg-[#fafbfd] px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Guided Tour
            </span>
            <span className="font-mono text-[10px] text-muted">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center text-muted hover:bg-line hover:text-ink"
            aria-label="Close tour"
          >
            ✕
          </button>
        </div>

        {/* ── Content — Phase 1 placeholder ── */}
        <div className="flex flex-1 items-center justify-center bg-[#fafbfd] px-8 py-16 min-h-[420px]">
          <div className="text-center max-w-lg">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              {currentStep?.activeTab ?? "floor"} view
            </span>
            <p className="mt-4 text-xl font-bold leading-snug tracking-tight text-navy">
              {currentStep?.caption}
            </p>
            <p className="mt-3 text-sm text-muted">
              Dashboard renders here in Phase 2.
            </p>

            {isComplete && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-sm font-semibold text-navy">Tour complete.</p>
                <div className="flex gap-3">
                  <button
                    onClick={controls.restart}
                    className="inline-flex h-10 items-center gap-2 border border-line px-4 text-sm font-medium hover:bg-ink hover:text-white hover:border-ink"
                  >
                    ↺ Watch again
                  </button>
                  <button
                    onClick={onClose}
                    className="inline-flex h-10 items-center gap-2 bg-primary px-5 text-sm font-medium text-white hover:bg-[#0050e6]"
                  >
                    Book a demo →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Progress + Controls ── */}
        <div className="border-t border-line">
          <div className="h-[3px] bg-line overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${pct}%`, transition: "width 150ms linear" }}
            />
          </div>
          <div className="flex items-center justify-between px-5 py-2.5">
            <div className="flex items-center gap-0.5">
              <CtrlBtn onClick={controls.skipPrev} disabled={currentStepIndex === 0} title="Previous (←)">
                ⏮
              </CtrlBtn>
              <CtrlBtn
                onClick={isPaused ? controls.play : controls.pause}
                title={isPaused ? "Play (Space)" : "Pause (Space)"}
              >
                {isPaused ? "▶" : "⏸"}
              </CtrlBtn>
              <CtrlBtn onClick={controls.skipNext} disabled={isComplete} title="Next (→)">
                ⏭
              </CtrlBtn>
              <CtrlBtn onClick={controls.restart} title="Restart">
                ↺
              </CtrlBtn>
            </div>
            <span className="font-mono text-[11px] text-muted tabular-nums select-none">
              {pct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CtrlBtn({
  children, onClick, disabled = false, title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-8 w-8 items-center justify-center text-sm text-ink hover:bg-line disabled:opacity-25 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
