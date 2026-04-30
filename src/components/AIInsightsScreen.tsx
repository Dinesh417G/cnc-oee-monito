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

const REVENUE_PER_PART = 18.4;
const PARTS_PER_HOUR_IDEAL = 6;

interface Loss { label: string; pct: number; color: string; }
interface Reason {
  kind: string; severity: "high" | "med" | "low";
  title: string; detail: string; losses: Loss[];
  failureModes?: string[];
}
interface Suggestion {
  title: string; impact: string; effort: string; detail: string; roi?: string;
}

function oeeHealthScore(m: Machine): { score: number; grade: string; color: string } {
  const score = Math.round(m.oee * 100);
  if (score >= 85) return { score, grade: "World-Class", color: "#16a34a" };
  if (score >= 75) return { score, grade: "Good",        color: "#0f62fe" };
  if (score >= 65) return { score, grade: "Average",     color: "#d97706" };
  if (score >= 50) return { score, grade: "Poor",        color: "#f97316" };
  return              { score, grade: "Critical",   color: "#dc2626" };
}

function lossImpact(m: Machine) {
  const plannedHrs = m.planned / 60;
  const lostOEEFraction = 1 - m.oee;
  const lostHrs = lostOEEFraction * plannedHrs;
  const lostParts = Math.round(lostHrs * PARTS_PER_HOUR_IDEAL);
  const lostRevenue = lostParts * REVENUE_PER_PART;
  const availLoss = (1 - m.availability) * plannedHrs;
  const perfLoss  = m.availability * (1 - m.performance) * plannedHrs;
  const qualLoss  = m.availability * m.performance * (1 - m.quality) * plannedHrs;
  return { lostHrs, lostParts, lostRevenue, availLoss, perfLoss, qualLoss };
}

function reasonsFor(m: Machine): Reason[] {
  const reasons: Reason[] = [];
  if (m.availability < 0.85) {
    reasons.push({
      kind: "availability", severity: m.availability < 0.7 ? "high" : "med",
      title: "Availability loss is dragging OEE",
      detail: `Run time is only ${(m.availability * 100).toFixed(0)}% of planned. ${m.idle.toFixed(0)} min lost to non-productive states this shift. Every 6 min of additional downtime costs ~1 part.`,
      failureModes: [
        "Changeover not pre-staged (external setup overlap missing)",
        "Chip conveyor jam triggering micro-stop every ~22 min",
        "Operator away from machine at cycle end (manual reload delay)",
      ],
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
      detail: `Cycle time is ${((1 / m.performance - 1) * 100).toFixed(1)}% slower than the 0.40 min/part ideal. Feed override or tooling wear is the most common cause at this loss level.`,
      failureModes: [
        `Feed/speed override set at ${Math.round(m.performance * 100)}% — operator hasn't reset after last alarm`,
        "Carbide insert past optimal tool life — cutting force up, cycle time creeping",
        "Coolant pressure reduced → longer chip-breaking pauses",
      ],
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
      detail: `${m.rejected} rejects / ${m.total} parts = ${((m.rejected / Math.max(m.total, 1)) * 100).toFixed(2)}% defect rate. Above the 1.5% alert threshold. Rework and scrap both present.`,
      failureModes: [
        "Dimensional drift on X-axis bore — correlates with tool wear progression",
        "Surface finish out-of-spec on last 8 parts (roughness > 1.6 Ra)",
        "First-off inspection skipped after changeover — setup shift undetected",
      ],
      losses: [
        { label: "Rework", pct: 58, color: LOSS_PALETTE.rework },
        { label: "Scrap",  pct: 42, color: LOSS_PALETTE.scrap },
      ],
    });
  }
  if (m.status === "ALARM") {
    reasons.unshift({
      kind: "alarm", severity: "high",
      title: "Active ALARM — immediate intervention required",
      detail: "Machine is in fault state. All OEE loss recovery is blocked until the alarm is cleared. Every minute of alarm downtime at this machine's output rate = 0.1 parts lost.",
      failureModes: [
        "Spindle overload (axis load > 110%) — check for tool breakage",
        "Door interlock not releasing — safety circuit check required",
        "Coolant level low — automated shutdown triggered",
      ],
      losses: [],
    });
  }
  if (reasons.length === 0) {
    reasons.push({
      kind: "ok", severity: "low",
      title: "World-class performance — replicate this setup",
      detail: `OEE of ${(m.oee * 100).toFixed(1)}% exceeds the 85% world-class threshold. A/P/Q are all in the green band. Snapshot and propagate this configuration to similar machines.`,
      losses: [],
    });
  }
  return reasons;
}

function suggestionsFor(m: Machine): Suggestion[] {
  const out: Suggestion[] = [];
  if (m.availability < 0.85) {
    out.push({ title: "SMED changeover review", impact: "+4.2% OEE", effort: "medium", roi: "~$220/shift",
      detail: "Pre-stage tools and fixtures externally. Parallel-process setup steps. Target: cut changeover from observed time to < 15 min." });
    out.push({ title: "Enable auto-restart on micro-stop", impact: "+1.8% OEE", effort: "low", roi: "~$90/shift",
      detail: "Chip conveyor jams and door interlocks resolve themselves ~70% of the time. Auto-recovery eliminates the operator call time (avg 4.2 min/incident)." });
  }
  if (m.performance < 0.92) {
    out.push({ title: "Reset feed/speed override to 100%", impact: "+3.1% OEE", effort: "low", roi: "~$160/shift",
      detail: `Current override is ~${Math.round(m.performance * 100)}%. Confirm no vibration or acoustic reason before resetting. Should recover cycle time immediately.` });
    out.push({ title: "Predictive tool-change via spindle load", impact: "+2.0% OEE", effort: "high", roi: "~$104/shift",
      detail: "Monitor Z-axis load trend. At 15% above baseline, prompt tool change before cycle slowdown compounds — avoids both performance AND quality loss." });
  }
  if (m.quality < 0.97) {
    out.push({ title: "In-process probing after rough pass", impact: "−40% scrap", effort: "medium", roi: "~$80/shift",
      detail: "Renishaw probe macro detects bore drift before finishing cut. Catches the leading edge of tool wear before it produces scrap — reduces first-article re-inspection." });
  }
  if (m.status === "ALARM") {
    out.unshift({ title: "Page on-call maintenance now", impact: "critical", effort: "immediate", roi: "blocks all recovery",
      detail: "Alarm has persisted past the 5-min SLO. Notify on-call mechanical tech via PagerDuty. Every 10 min of delay = ~1 additional lost part at this machine's output rate." });
  }
  if (out.length === 0) {
    out.push({ title: "Document as gold-standard SOP", impact: "fleet-wide", effort: "low", roi: "~$500+/shift fleet",
      detail: "Snapshot program, offsets, tooling, and fixture setup. Propagate to CNC-06 and CNC-07 which run the same family of parts — fleet OEE gain of ~3–5% expected." });
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
  }, [text]);
  return <>{shown}<span className="ai-caret">▍</span></>;
}

function AIAnalysisAnimation({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= ANALYSIS_STEPS.length) { onComplete?.(); return; }
    const id = setTimeout(() => setStep((s) => s + 1), 460);
    return () => clearTimeout(id);
  }, [step]);
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

function ImpactCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col gap-1 border border-line bg-white p-3">
      <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      <b className="font-mono text-xl font-bold tabular-nums" style={color ? { color } : {}}>{value}</b>
      {sub && <span className="font-mono text-[10px] text-muted">{sub}</span>}
    </div>
  );
}

function simulateAIAnswer(m: Machine, _q: string): string {
  const health = oeeHealthScore(m);
  const impact = lossImpact(m);
  if (m.status === "ALARM") {
    return `${m.name} is in an active ALARM and requires immediate mechanical attention. Do not attempt OEE optimization until the fault is cleared — all downstream improvements are blocked.\n\nEstimated loss while alarm persists: ~$${(impact.lostRevenue).toFixed(0)} revenue / shift.\n\nAction: page on-call maintenance, run alarm diagnostics (check spindle load history, door interlock, coolant level), and log root cause in the maintenance system.`;
  }
  if (m.oee >= 0.85) {
    return `${m.name} is at ${health.score}% OEE — ${health.grade}. All three pillars (A ${(m.availability*100).toFixed(0)}%, P ${(m.performance*100).toFixed(0)}%, Q ${(m.quality*100).toFixed(0)}%) are in the green band.\n\nThe best move now is to snapshot this setup (program, offsets, tooling, fixture) and propagate it to CNC-06 and CNC-07. A 3% fleet-wide OEE lift from replication is achievable within the next two shifts.`;
  }
  const topLoss = m.availability < 0.85 ? `availability (${(m.availability*100).toFixed(0)}%)` : m.performance < 0.92 ? `performance (${(m.performance*100).toFixed(0)}%)` : `quality (${(m.quality*100).toFixed(0)}%)`;
  return `${m.name} is at ${health.score}% OEE (${health.grade}). Primary loss driver is ${topLoss}.\n\nThis shift: ~${impact.lostHrs.toFixed(1)} hrs of productive time lost, ~${impact.lostParts} parts foregone, ~$${impact.lostRevenue.toFixed(0)} in revenue impact.\n\nHighest-leverage action: ${topLoss.startsWith("availability") ? "run the SMED changeover audit and enable micro-stop auto-restart" : topLoss.startsWith("performance") ? "reset feed/speed override to 100% — single highest-ROI action" : "add in-process probing after rough pass to catch bore drift early"}. Expected OEE recovery: 3–5% within current shift.`;
}

export default function AIInsightsScreen({ machines }: { machines: Machine[] }) {
  const [selectedId, setSelectedId] = useState(machines[0]?.id);
  const [snap, setSnap] = useState<Machine>(machines[0]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const cur = machines.find((x) => x.id === selectedId);
    if (cur) setSnap(cur);
  }, [selectedId]);

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
  const health = useMemo(() => oeeHealthScore(m), [m.oee]);
  const impact = useMemo(() => lossImpact(m), [m.oee, m.planned]);

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
    await new Promise((r) => setTimeout(r, 1400));
    setAiAnswer(simulateAIAnswer(m, q));
    setAiBusy(false);
  };

  const headline =
    m.status === "ALARM"
      ? `${m.name} is in an active ALARM. Resolve the fault first — every minute costs ~0.1 parts.`
      : m.oee >= 0.85
        ? `${m.name} is world-class at ${(m.oee * 100).toFixed(1)}% OEE. Replicate this setup to lift the fleet.`
        : m.oee >= 0.65
          ? `${m.name} is at ${(m.oee * 100).toFixed(1)}% — ${reasons.length} clear loss drivers identified. Estimated $${impact.lostRevenue.toFixed(0)} in recoverable revenue this shift.`
          : `${m.name} is at ${(m.oee * 100).toFixed(0)}% — critical loss in ${reasons[0]?.kind}. Immediate action needed.`;

  const presets = [
    "Why is OEE low this shift?",
    "What is the revenue impact?",
    "How do I fix performance loss?",
    "What to do about the alarm?",
  ];

  return (
    <div className="ai-screen">
      {/* ── desktop sidebar / mobile bottom sheet toggle ── */}
      <aside className="ai-sidebar">
        <div className="ai-side-h">
          <span className="ai-eyebrow">SELECT MACHINE</span>
          <span className="ai-count">{machines.length}</span>
        </div>
        <div className="ai-side-list">
          {machines.map((mm) => {
            const c = STATUS_COLORS[mm.status].color;
            const h = oeeHealthScore(mm);
            return (
              <button key={mm.id} type="button"
                className={`ai-side-item ${mm.id === selectedId ? "active" : ""}`}
                onClick={() => { setSelectedId(mm.id); setMobileSidebarOpen(false); }}>
                <span className="ai-side-dot" style={{ background: c }} />
                <span className="ai-side-name">
                  <strong>{mm.name}</strong>
                  <i>{mm.model}</i>
                </span>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="ai-side-oee" style={{ color: h.color }}>
                    {(mm.oee * 100).toFixed(0)}<i>%</i>
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: h.color, letterSpacing: ".04em" }}>{h.grade}</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── mobile machine picker bar (hidden on desktop) ── */}
      <div className="ai-mobile-picker">
        <div className="ai-mobile-picker-scroll">
          {machines.map((mm) => {
            const c = STATUS_COLORS[mm.status].color;
            return (
              <button key={mm.id} type="button"
                className={`ai-mobile-chip ${mm.id === selectedId ? "active" : ""}`}
                onClick={() => setSelectedId(mm.id)}>
                <span className="ai-mobile-chip-dot" style={{ background: c }} />
                <span>{mm.name}</span>
                <span style={{ color: oeeHealthScore(mm).color }}>{(mm.oee * 100).toFixed(0)}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── main content ── */}
      <div className="ai-main">
        {/* machine header */}
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

        {/* ── health score + loss impact (always visible) ── */}
        <div className="ai-impact-row">
          <div className="ai-health-badge" style={{ borderColor: health.color + "44", background: health.color + "0d" }}>
            <span className="ai-health-score" style={{ color: health.color }}>{health.score}</span>
            <div className="ai-health-meta">
              <span className="ai-health-grade" style={{ color: health.color }}>{health.grade}</span>
              <span className="ai-health-label">Health Score</span>
            </div>
          </div>
          <div className="ai-impact-grid">
            <ImpactCard label="Hours lost" value={`${impact.lostHrs.toFixed(1)}h`} sub="this shift" color={impact.lostHrs > 1 ? "#dc2626" : "#d97706"} />
            <ImpactCard label="Parts foregone" value={String(impact.lostParts)} sub="vs world-class" color="#d97706" />
            <ImpactCard label="Revenue impact" value={`$${impact.lostRevenue.toFixed(0)}`} sub="est. this shift" color={impact.lostRevenue > 500 ? "#dc2626" : "#d97706"} />
          </div>
        </div>

        {/* ── loss waterfall ── */}
        <div className="ai-card">
          <div className="ai-card-h"><span>OEE LOSS WATERFALL</span></div>
          <div className="ai-waterfall">
            {[
              { label: "Availability", lost: impact.availLoss, color: LOSS_PALETTE.changeover },
              { label: "Performance",  lost: impact.perfLoss,  color: LOSS_PALETTE.speed },
              { label: "Quality",      lost: impact.qualLoss,  color: LOSS_PALETTE.rework },
            ].map((row) => (
              <div key={row.label} className="ai-waterfall-row">
                <span className="ai-waterfall-lbl">{row.label}</span>
                <div className="ai-waterfall-track">
                  <div className="ai-waterfall-bar" style={{ width: `${Math.min((row.lost / Math.max(impact.lostHrs, 0.1)) * 100, 100)}%`, background: row.color }} />
                </div>
                <span className="ai-waterfall-val">{row.lost.toFixed(2)}h lost</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── fleet benchmark ── */}
        <div className="ai-card">
          <div className="ai-card-h"><span>FLEET BENCHMARK</span></div>
          <div className="ai-benchmark">
            {machines.slice(0, 6).map((mm) => {
              const isSelected = mm.id === m.id;
              const pct = mm.oee * 100;
              return (
                <div key={mm.id} className={`ai-bench-row ${isSelected ? "ai-bench-selected" : ""}`}>
                  <span className="ai-bench-name">{mm.name}</span>
                  <div className="ai-bench-track">
                    <div className="ai-bench-bar" style={{ width: `${pct}%`, background: pct >= 85 ? "#16a34a" : pct >= 65 ? "#0f62fe" : "#dc2626" }} />
                  </div>
                  <span className="ai-bench-val">{pct.toFixed(0)}%</span>
                  {isSelected && <span className="ai-bench-you">← YOU</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AI answer card ── */}
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

        {/* ── root causes ── */}
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
                  {r.failureModes && r.failureModes.length > 0 && (
                    <div className="ai-failure-modes">
                      <span className="ai-fm-label">LIKELY FAILURE MODES</span>
                      <ul>
                        {r.failureModes.map((fm, fi) => <li key={fi}>{fm}</li>)}
                      </ul>
                    </div>
                  )}
                  <LossBar losses={r.losses} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── suggestions ── */}
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
                    {s.roi && <span className="ai-sugg-roi">Est. ROI: {s.roi}</span>}
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

        {/* ── ask anything ── */}
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
            <input type="text" placeholder={`Ask about ${m.name}…`}
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
