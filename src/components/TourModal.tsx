"use client";
import { useEffect, useState } from "react";
import type { Machine } from "@/lib/types";
import { useTourPlayer } from "@/hooks/useTourPlayer";
import { TOUR_SCRIPT } from "@/lib/tourScript";
import { TOUR_MACHINES } from "@/lib/tourMockData";
import TourDashboard from "./TourDashboard";

interface Props { onClose: () => void; }

export default function TourModal({ onClose }: Props) {
  const {
    currentStep, currentStepIndex, totalSteps,
    progress, isPaused, isComplete, controls,
  } = useTourPlayer(TOUR_SCRIPT);

  // Apply data patches as steps advance
  const [machines, setMachines] = useState<Machine[]>(TOUR_MACHINES);
  useEffect(() => {
    if (currentStep?.dataPatch?.machines) {
      setMachines(currentStep.dataPatch.machines);
    }
  }, [currentStep?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ESC + keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     { onClose(); return; }
      if (e.key === "ArrowRight") { controls.skipNext(); return; }
      if (e.key === "ArrowLeft")  { controls.skipPrev(); return; }
      if (e.key === " ")          { e.preventDefault(); isPaused ? controls.play() : controls.pause(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, controls, isPaused]);

  const pct = Math.round(progress * 100);
  const activeTab = currentStep?.activeTab ?? "floor";

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-2 md:p-6"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-5xl flex-col bg-white shadow-[0_40px_80px_-20px_rgba(0,17,65,0.5)]"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-line bg-[#fafbfd] px-5 py-3">
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

        {/* ── Dashboard ── */}
        <div className="relative min-h-0 flex-1 overflow-auto">
          <TourDashboard machines={machines} activeTab={activeTab} />

          {/* Tour-complete overlay */}
          {isComplete && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(0,17,65,0.72)", backdropFilter: "blur(2px)" }}
            >
              <div className="flex flex-col items-center gap-5 border border-line bg-white p-8 text-center shadow-xl max-w-sm mx-4">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Tour complete
                </span>
                <h2 className="text-2xl font-bold leading-tight tracking-tight text-navy">
                  Want this on your factory floor?
                </h2>
                <p className="text-sm leading-relaxed text-muted">
                  Book a 30-minute call. We&apos;ll show you with your real machine data.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-1">
                  <button
                    onClick={onClose}
                    className="inline-flex h-11 items-center gap-2 bg-primary px-6 text-[14px] font-semibold text-white hover:bg-[#0050e6]"
                  >
                    Book a demo →
                  </button>
                  <button
                    onClick={controls.restart}
                    className="inline-flex h-11 items-center gap-2 border border-line px-5 text-[14px] font-medium hover:bg-ink hover:text-white hover:border-ink"
                  >
                    ↺ Watch again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Progress + Controls ── */}
        <div className="flex-shrink-0 border-t border-line">
          <div className="h-[3px] bg-line overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${pct}%`, transition: "width 150ms linear" }}
            />
          </div>
          <div className="flex items-center justify-between px-5 py-2.5">
            <div className="flex items-center gap-0.5">
              <CtrlBtn onClick={controls.skipPrev} disabled={currentStepIndex === 0} title="Previous (←)">⏮</CtrlBtn>
              <CtrlBtn onClick={isPaused ? controls.play : controls.pause} title={isPaused ? "Play (Space)" : "Pause (Space)"}>
                {isPaused ? "▶" : "⏸"}
              </CtrlBtn>
              <CtrlBtn onClick={controls.skipNext} disabled={isComplete} title="Next (→)">⏭</CtrlBtn>
              <CtrlBtn onClick={controls.restart} title="Restart">↺</CtrlBtn>
            </div>
            <span className="font-mono text-[11px] text-muted tabular-nums select-none">{pct}%</span>
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
