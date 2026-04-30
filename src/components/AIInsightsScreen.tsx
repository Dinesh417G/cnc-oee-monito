"use client";
import { useState, useEffect, useMemo } from "react";
import type { Machine } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/types";

const LOSS_PALETTE: Record<string, string> = {
  setup:      "#0f62fe",
  changeover: "#3b82f6",
  micro:      "#06b6d4",
  speed:      "#d97706",
  rework:     "#a855f7",
  scrap:      "#dc2626",
  breakdown:  "#ef4444",
  starved:    "#6b7280",
};

interface Loss { label: string; pct: number; color: string; }
interface Reason {
  kind: string; severity: "high" | "med" | "low";
  title: string; detail: string; losses: Loss[];
}
interface Suggestion {
  title: string; impact: string; effort: string; detail: string;
}

function reasonsFor(m: Machine): Reason[] {
  const reasons: Reason[] = [];
  if (m.availability < 0.85) {
    reasons.push({
      kind: "availability", severity: m.availability < 0.7 ? "high" : "med",
      title: "Availability loss is dragging OEE",
      detail: `Run time is only ${(m.availability * 100).toFixed(0)}% of planned. ${m.idle.toFixed(0)} min were lost to idle/alarm states this shift.`,
      losses: [
        { label: "Changeover",  pct: 38, color: LOSS_PALETTE.changeover },
        { label: "Micro-stops", pct: 27, color: LOSS_PALETTE.micro },
        { label: "Setup",       pct: 21, color: LOSS_PALETTE.setup },
        { label: "Starved",     pct: 14, color: LOSS_PALETTE.starved },
      ],
    });
  }
  if (m.performance < 0.92) {
    reasons.push({
      kind: "performance", severity: m.performance < 0.8 ? "high" : "med",
      title: "Spindle running below ideal cycle",
      detail: `Average cycle is 12.4% slower than the ideal 0.40 min/part. Most likely tooling wear or feed override.`,
      losses: [
        { label: "Reduced speed", pct: 64, color: LOSS_PALETTE.speed },
        { label: "Tool wear",     pct: 22, color: LOSS_PALETTE.changeover },
        { label: "Operator",      pct: 14, color: LOSS_PALETTE.starved },
      ],
    });
  }
  if (m.quality < 0.97) {
    reasons.push({
      kind: "quality", severity: m.quality < 0.92 ? "high" : "med",
      title: "Quality losses detected",
      detail: `${m.rejected} rejects of ${m.total} parts (${((m.rejected / Math.max(m.total, 1)) * 100).toFixed(1)}%). Review inspection logs for trend.`,
      losses: [
        { label: "Rework", pct: 58, color: LOSS_PALETTE.rework },
        { label: "Scrap",  pct: 42, color: LOSS_PALETTE.scrap },
      ],
    });
  }
  if (m.status === "ALARM") {
    reasons.unshift({
      kind: "alarm", severity: "high",
      title: "Active ALARM state — immediate attention",
      detail: "Machine has been in alarm condition. Operator intervention required before performance can be recovered.",
      losses: [],
    });
  }
  if (reasons.length === 0) {
    reasons.push({
      kind: "ok", severity: "low",
      title: "World-class performance",
      detail: `OEE of ${(m.oee * 100).toFixed(1)}% is above the 85% world-class threshold. Maintain current setup.`,
      losses: [],
    });
  }
  return reasons;
}

function suggestionsFor(m: Machine): Suggestion[] {
  const out: Suggestion[] = [];
  if (m.availability < 0.85) {
    out.push({ title: "SMED changeover review", impact: "+4.2% OEE", effort: "medium", detail: "Schedule a 30-minute changeover audit on next shift. Pre-stage tooling, parallel-process external setup." });
    out.push({ title: "Auto-restart on micro-stop", impact: "+1.8% OEE", effort: "low", detail: "Enable auto-recovery for chip-conveyor jams and door interlocks. ~70% of micro-stops resolve themselves." });
  }
  if (m.performance < 0.92) {
    out.push({ title: "Verify feed/speed override", impact: "+3.1% OEE", effort: "low", detail: "Operator override is below 100%. Confirm there's no acoustic or vibration reason before resetting." });
    out.push({ title: "Tool wear telemetry", impact: "+2.0% OEE", effort: "high", detail: "Add load-cell signal on Z-axis to predict tool replacement before cycle slowdown is observed." });
  }
  if (m.quality < 0.97) {
    out.push({ title: "In-process probing", impact: "−40% scrap", effort: "medium", detail: "Add a Renishaw probe macro after rough pass; catches drift before finishing operations." });
  }
  if (m.status === "ALARM") {
    out.unshift({ title: "Page on-call maintenance", impact: "critical", effort: "now", detail: "Notify the on-call mechanical tech via PagerDuty; alarm has persisted longer than the 5-minute SLO." });
  }
  if (out.length === 0) {
    out.push({ title: "Document setup as gold-standard", impact: "replicate", effort: "low", detail: "Snapshot current parameters and propagate to similar machines on the floor." });
  }
  return out;
}

const ANALYSIS_STEPS = [
  "Reading 5-second telemetry samples…",
  "Cross-referencing alarm history & operator notes…",
  "Decomposing the six big losses…",
  "Comparing against fleet benchmarks…",
  "Drafting recommendations…",
];

function TypingLine({ text, speed = 14, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); onDone?.(); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, onDone]);
  return <>{shown}<span className="ai-caret">▍</span></>;
}

function AIAnalysisAnimation({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= ANALYSIS_STEPS.length) { onComplete?.(); return; }
    const id = setTimeout(() => setStep((s) => s + 1), 480);
    return () => clearTimeout(id);
  }, [step, onComplete]);
  return (
    <div className="ai-steps">
      {ANALYSIS_STEPS.map((s, i) => (
        <div key={i} className={`ai-step ${i < step ? "done" : i === step ? "active" : "pending"}`}>
          <span className="ai-step-icon">
            {i < step ? "✓" : i === step ? <span className="ai-spinner" /> : "○"}
          </span>
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}

function LossBar({ losses }: { losses: Loss[] }) {
  if (!losses.length) return null;
  return (
    <div className="loss-bar-wrap">
      <div className="loss-bar">
        {losses.map((l, i) => (
          <div key={i} className="loss-seg" style={{ width: `${l.pct}%`, background: l.color }} title={`${l.label} ${l.pct}%`}>
            <span>{l.pct}%</span>
          </div>
        ))}
      </div>
      <div className="loss-legend">
        {losses.map((l, i) => (
          <span key={i}><i style={{ background: l.color }} />{l.label}</span>
        ))}
      </div>
    </div>
  );
}

function simulateAIAnswer(m: Machine, q: string): string {
  if (m.status === "ALARM") return `${m.name} is currently in an ALARM state and requires immediate operator attention. The spindle load exceeded threshold, preventing normal production. Resolve the alarm condition first, then re-evaluate OEE once the machine returns to RUNNING. Maintenance should inspect for mechanical fault or coolant issue.`;
  if (m.oee >= 0.85) return `${m.name} is operating at world-class OEE of ${(m.oee * 100).toFixed(1)}%. Availability at ${(m.availability * 100).toFixed(0)}% and quality at ${(m.quality * 100).toFixed(0)}% are both strong. Continue current setup parameters and consider documenting this configuration as the reference standard for similar machines on the floor.`;
  const topLoss = m.availability < 0.85 ? "availability" : m.performance < 0.92 ? "performance" : "quality";
  return `${m.name} is running at ${(m.oee * 100).toFixed(1)}% OEE — below the 85% world-class target. The primary driver is ${topLoss} loss (${topLoss === "availability" ? (m.availability * 100).toFixed(0) : topLoss === "performance" ? (m.performance * 100).toFixed(0) : (m.quality * 100).toFixed(0)}%). Focus the next shift's improvement effort on the ${topLoss} lever for the highest OEE gain. Check the Suggested Next Steps panel for ranked actions.`;
}

export default function AIInsightsScreen({ machines }: { machines: Machine[] }) {
  const [selectedId, setSelectedId] = useState(machines[0]?.id);
  const [snap, setSnap] = useState<Machine>(machines[0]);

  useEffect(() => {
    const cur = machines.find((x) => x.id === selectedId);
    if (cur) setSnap(cur);
  }, [selectedId, machines]);

  const m = snap;
  const [phase, setPhase] = useState<"analyzing" | "typing" | "done">("analyzing");
  const [headlineDone, setHeadlineDone] = useState(false);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setPhase("analyzing");
    setHeadlineDone(false);
    setRevealed(0);
  }, [selectedId]);

  const reasons = useMemo(() => reasonsFor(m), [m.id, m.status]);
  const suggestions = useMemo(() => suggestionsFor(m), [m.id, m.status]);

  useEffect(() => {
    if (!headlineDone || revealed >= reasons.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 220);
    return () => clearTimeout(id);
  }, [headlineDone, revealed, reasons.length]);

  const [prompt, setPrompt] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const askAI = async (q: string) => {
    if (!q.trim() || aiBusy) return;
    setAiBusy(true);
    setAiAnswer("");
    await new Promise((r) => setTimeout(r, 1200));
    setAiAnswer(simulateAIAnswer(m, q));
    setAiBusy(false);
  };

  const headline =
    m.status === "ALARM"
      ? `${m.name} is in an active ALARM. The first action is to clear the fault before any optimization will help.`
      : m.oee >= 0.85
        ? `${m.name} is performing at world-class levels (${(m.oee * 100).toFixed(1)}% OEE). Hold the line and replicate this setup.`
        : m.oee >= 0.65
          ? `${m.name} is running at ${(m.oee * 100).toFixed(1)}% OEE — typical for the fleet, but ${reasons.length} clear levers are available to push past 85%.`
          : `${m.name} is below ${(m.oee * 100).toFixed(0)}% OEE. The biggest losses are concentrated in ${reasons[0]?.kind}; here's what I'd do next.`;

  const presets = [
    "Why is OEE low this shift?",
    "How can I improve performance?",
    "What's causing the alarms?",
    "Compare to last week.",
  ];

  return (
    <div className="ai-screen">
      <aside className="ai-sidebar">
        <div className="ai-side-h">
          <span className="ai-eyebrow">SELECT MACHINE</span>
          <span className="ai-count">{machines.length}</span>
        </div>
        <div className="ai-side-list">
          {machines.map((mm) => {
            const c = STATUS_COLORS[mm.status].color;
            return (
              <button key={mm.id} type="button"
                className={`ai-side-item ${mm.id === selectedId ? "active" : ""}`}
                onClick={() => setSelectedId(mm.id)}>
                <span className="ai-side-dot" style={{ background: c }} />
                <span className="ai-side-name">
                  <strong>{mm.name}</strong>
                  <i>{mm.model}</i>
                </span>
                <span className="ai-side-oee" style={{ color: mm.oee >= 0.85 ? "#16a34a" : mm.oee >= 0.65 ? "#0f62fe" : "#d97706" }}>
                  {(mm.oee * 100).toFixed(0)}<i>%</i>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="ai-main">
        <header className="ai-head">
          <div>
            <span className="ai-eyebrow"><span className="ai-spark" /> AI ROOT-CAUSE ANALYST</span>
            <h3>{m.name}<span className="muted"> · {m.model}</span></h3>
          </div>
          <div className="ai-head-stats">
            <div><span>OEE</span><b style={{ color: "#0f62fe" }}>{(m.oee * 100).toFixed(1)}%</b></div>
            <div><span>A</span><b>{(m.availability * 100).toFixed(0)}%</b></div>
            <div><span>P</span><b>{(m.performance * 100).toFixed(0)}%</b></div>
            <div><span>Q</span><b>{(m.quality * 100).toFixed(0)}%</b></div>
          </div>
        </header>

        <section className="ai-card ai-answer">
          <div className="ai-card-h">
            <span className="ai-spark" />
            <span>ELECTRONIX AI</span>
            <span className="ai-pill">claude-haiku</span>
            <button className="ai-rerun" onClick={() => { setPhase("analyzing"); setHeadlineDone(false); setRevealed(0); }}>
              ↻ Re-analyze
            </button>
          </div>
          {phase === "analyzing" && <AIAnalysisAnimation onComplete={() => setPhase("typing")} />}
          {(phase === "typing" || phase === "done") && (
            <p className="ai-headline">
              <TypingLine text={headline} onDone={() => { setHeadlineDone(true); setPhase("done"); }} />
            </p>
          )}
        </section>

        {headlineDone && (
          <section>
            <h4 className="ai-section-h">
              <span>WHY THIS IS HAPPENING</span>
              <i>{reasons.length} root cause{reasons.length > 1 ? "s" : ""} detected</i>
            </h4>
            <div className="ai-reasons">
              {reasons.slice(0, revealed).map((r, i) => (
                <div key={i} className={`ai-reason sev-${r.severity} animate-in`}>
                  <div className="ai-reason-h">
                    <span className={`ai-tag tag-${r.kind}`}>{r.kind.toUpperCase()}</span>
                    <span className={`sev-pill sev-${r.severity}`}>{r.severity}</span>
                  </div>
                  <h5>{r.title}</h5>
                  <p>{r.detail}</p>
                  <LossBar losses={r.losses} />
                </div>
              ))}
            </div>
          </section>
        )}

        {revealed >= reasons.length && headlineDone && (
          <section>
            <h4 className="ai-section-h">
              <span>SUGGESTED NEXT STEPS</span>
              <i>ranked by impact / effort</i>
            </h4>
            <div className="ai-suggestions">
              {suggestions.map((s, i) => (
                <div key={i} className="ai-sugg animate-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="ai-sugg-impact">{s.impact}</div>
                  <div className="ai-sugg-body">
                    <h5>{s.title}</h5>
                    <p>{s.detail}</p>
                  </div>
                  <div className="ai-sugg-effort">
                    <span>EFFORT</span><b>{s.effort}</b>
                  </div>
                  <button className="ai-sugg-cta">Create work order →</button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="ai-ask">
          <div className="ai-card-h">
            <span className="ai-spark" />
            <span>ASK ANYTHING</span>
          </div>
          <div className="ai-presets">
            {presets.map((p) => (
              <button key={p} type="button" onClick={() => { setPrompt(p); askAI(p); }}>{p}</button>
            ))}
          </div>
          <form className="ai-form" onSubmit={(e) => { e.preventDefault(); askAI(prompt); }}>
            <input type="text" placeholder={`Ask about ${m.name}…  e.g. "What changed since Tuesday?"`}
              value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <button type="submit" disabled={aiBusy || !prompt.trim()}>
              {aiBusy ? "Thinking…" : "Ask AI →"}
            </button>
          </form>
          {aiAnswer && (
            <div className="ai-live-answer">
              <span className="ai-eyebrow"><span className="ai-spark" /> AI</span>
              <p>{aiAnswer}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
