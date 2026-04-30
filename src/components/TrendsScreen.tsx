"use client";
import { useState, useMemo } from "react";
import type { Machine } from "@/lib/types";

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

interface FleetScenario {
  id: string; color: string; headline: string; sub: string;
  points: number[];
  events: { x: number; y: number; label: string; kind: string; }[];
  story: {
    tag: string; tagColor: string; lossHrs: number; lossDollars: number;
    bullets: string[]; fix: string;
  };
}

const FLEET_SCENARIOS: FleetScenario[] = [
  {
    id: "M-01", color: "#0f62fe",
    headline: "CNC-01 · Haas VF-2",
    sub: "Aluminum bracket, 6061-T6 · Shift B coolant starvation",
    points: [82,83,82,84,83,82,84,85, 82,80,77, 62,55,49,52, 64,72, 80,82,83,82,83,82,83],
    events: [
      { x: 11, y: 62, label: "Coolant pressure ↓ 38%", kind: "alarm" },
      { x: 13, y: 49, label: "Operator clears chip nest", kind: "action" },
      { x: 17, y: 80, label: "Recovered", kind: "ok" },
    ],
    story: {
      tag: "COOLANT STARVATION", tagColor: "#dc2626", lossHrs: 3.4, lossDollars: 1820,
      bullets: ["Chip nest blocked HP coolant nozzle on tool T07 at 17:00", "Surface finish drift triggered 11 micro-stops in 90 min", "Operator on Shift B never escalated — caught only at handover"],
      fix: "Add coolant-pressure alarm at 250 psi → auto-pause + Andon.",
    },
  },
  {
    id: "M-02", color: "#06b6d4",
    headline: "CNC-02 · Mazak QT-200",
    sub: "Steel shaft, 4140 · Tool wear creep across the day",
    points: [88,87,87,86,86,85,84,84, 83,82,80,79,77,75,73,70, 88,89,88,87,86,85,85,84],
    events: [
      { x: 7,  y: 84, label: "Cycle +4s vs ideal", kind: "soft" },
      { x: 15, y: 70, label: "Insert change · T03", kind: "action" },
    ],
    story: {
      tag: "TOOL WEAR DRIFT", tagColor: "#d97706", lossHrs: 2.1, lossDollars: 1140,
      bullets: ["Carbide insert ran 142 min past optimal life on T03", "Cycle time crept from 47s → 51s before anyone noticed", "Quality held, but throughput dropped 8% over Shift A"],
      fix: "Tie insert-change prompt to spindle-load trend, not part count.",
    },
  },
  {
    id: "M-04", color: "#16a34a",
    headline: "CNC-04 · Okuma LB-3000",
    sub: "Brass fittings, high-volume · Reference machine",
    points: [89,90,90,89,89,90,91,90, 89,90,89,90,89,88, 80,72,84,90,91,90,90,89,90,89],
    events: [
      { x: 14, y: 72, label: "Planned changeover · 18 min", kind: "plan" },
      { x: 16, y: 84, label: "Back to nominal", kind: "ok" },
    ],
    story: {
      tag: "WORLD-CLASS · REPLICATE", tagColor: "#16a34a", lossHrs: 0.4, lossDollars: 220,
      bullets: ["Held 89.6% OEE across all three shifts", "SMED-style changeover at 14:00 finished in 18 min (target: 25)", "Zero unplanned stops in trailing 7 days"],
      fix: "Snapshot setup + program; propagate to CNC-06 & CNC-07.",
    },
  },
  {
    id: "M-05", color: "#dc2626",
    headline: "CNC-05 · Haas ST-20",
    sub: "Stainless flanges, 316L · Spindle alarm at 02:40",
    points: [76,77,75,76,77,75,76,77, 76,75,76,75,77,76,75,76, 74,72, 28, 18, 22, 45, 68,73],
    events: [
      { x: 18, y: 28, label: "Spindle overload — ALARM 2027", kind: "alarm" },
      { x: 19, y: 18, label: "Maintenance dispatched", kind: "action" },
      { x: 22, y: 68, label: "Restart after bearing inspection", kind: "ok" },
    ],
    story: {
      tag: "UNPLANNED BREAKDOWN", tagColor: "#dc2626", lossHrs: 4.2, lossDollars: 3060,
      bullets: ["Spindle load spiked to 118% at 00:40, alarmed at 02:40", "Vibration trend was up 23% over the prior 6 shifts — missed", "Bearing showed early-stage spalling on inspection"],
      fix: "Vibration > 1.8 mm/s for 30 min → auto-create maintenance ticket.",
    },
  },
  {
    id: "M-09", color: "#a855f7",
    headline: "CNC-09 · Brother R-650",
    sub: "Drilling cell · Operator-driven idle on Shift C",
    points: [80,81,82,81,80,81,82,80, 79,80,79,80,79,78,79,80, 78,76, 58,52,55,48,52,57],
    events: [
      { x: 18, y: 58, label: "Idle > 6 min between cycles", kind: "soft" },
      { x: 21, y: 48, label: "Pallet not staged", kind: "soft" },
    ],
    story: {
      tag: "OPERATOR-PACED IDLE", tagColor: "#d97706", lossHrs: 2.8, lossDollars: 1490,
      bullets: ["Shift C average idle-between-cycles: 4.7 min vs 1.2 min target", "Pallets staged late 5× during the shift", "No alarms — entire loss invisible to legacy MES"],
      fix: "Andon prompt at 90s post-cycle; pre-stage pallets at handover.",
    },
  },
];

const losses = [
  { k: "Unplanned breakdown",       v: 4.2, c: LOSS_PALETTE.breakdown, src: "CNC-05 spindle" },
  { k: "Coolant / micro-stops",     v: 3.4, c: LOSS_PALETTE.micro,     src: "CNC-01 nozzle" },
  { k: "Operator-paced idle",       v: 2.8, c: LOSS_PALETTE.setup,     src: "CNC-09 Shift C" },
  { k: "Tool wear (reduced speed)", v: 2.1, c: LOSS_PALETTE.speed,     src: "CNC-02 inserts" },
  { k: "Changeover",                v: 1.5, c: LOSS_PALETTE.changeover, src: "fleet-wide" },
  { k: "Rework",                    v: 0.9, c: LOSS_PALETTE.rework,    src: "CNC-05 first-off" },
  { k: "Scrap",                     v: 0.4, c: LOSS_PALETTE.scrap,     src: "CNC-01 finish drift" },
];
const lossMax = Math.max(...losses.map((l) => l.v));

const shiftRows = [
  { s: "Shift A · 06–14", oee: 0.82, run: 7.2, parts: 1842, note: "Steady — CNC-04 reference" },
  { s: "Shift B · 14–22", oee: 0.69, run: 6.4, parts: 1601, note: "CNC-01 coolant event" },
  { s: "Shift C · 22–06", oee: 0.58, run: 5.6, parts: 1284, note: "CNC-05 alarm + CNC-09 idle" },
];

const W = 880, H = 300, PAD_L = 36, PAD_R = 16, PAD_T = 16, PAD_B = 32;
const xStep = (W - PAD_L - PAD_R) / 23;
const yToPx = (y: number) => PAD_T + (H - PAD_T - PAD_B) * (1 - (y - 20) / 80);
const xToPx = (x: number) => PAD_L + x * xStep;

const shiftBands = [
  { x0: 0,  x1: 8,  label: "SHIFT A · 06–14", tone: "rgba(15,98,254,.04)" },
  { x0: 8,  x1: 16, label: "SHIFT B · 14–22", tone: "rgba(217,119,6,.04)" },
  { x0: 16, x1: 23, label: "SHIFT C · 22–06", tone: "rgba(168,85,247,.05)" },
];

export default function TrendsScreen({ machines }: { machines: Machine[] }) {
  const [range, setRange] = useState("shift");
  const [focusId, setFocusId] = useState<string | null>(null);
  const ranges = ["shift", "24h", "7d", "30d"];

  const series = useMemo(() =>
    FLEET_SCENARIOS.map((sc) => {
      const live = machines.find((m) => m.id === sc.id);
      return {
        ...sc,
        name: live ? live.name : sc.id,
        pts: sc.points.map((y, i) => ({ x: i, y })),
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [machines.map((m) => m.id).join(",")]
  );

  const todayLabel = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="trends-screen">
      <header className="trends-h">
        <div>
          <span className="ai-eyebrow">FLEET TRENDS · PLANT A · {todayLabel}</span>
          <h3>OEE drift across the fleet</h3>
          <p className="trends-sub">5 representative machines · authored from the last 24 h of telemetry. Hover a line to read the story.</p>
        </div>
        <div className="trends-range">
          {ranges.map((r) => (
            <button key={r} className={r === range ? "on" : ""} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </header>

      <div className="trends-card trends-chart-card">
        <svg viewBox={`0 0 ${W} ${H}`} className="trends-chart" onMouseLeave={() => setFocusId(null)}>
          {shiftBands.map((b, i) => (
            <g key={i}>
              <rect x={xToPx(b.x0)} y={PAD_T} width={xToPx(b.x1) - xToPx(b.x0)} height={H - PAD_T - PAD_B} fill={b.tone} />
              <text x={xToPx((b.x0 + b.x1) / 2)} y={PAD_T + 12} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#5b6473" letterSpacing=".08em">{b.label}</text>
            </g>
          ))}
          {[40, 60, 80].map((g) => (
            <g key={g}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yToPx(g)} y2={yToPx(g)} stroke="#eef0f4" strokeDasharray="3 3" />
              <text x={PAD_L - 6} y={yToPx(g) + 3} textAnchor="end" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#5b6473">{g}</text>
            </g>
          ))}
          <rect x={PAD_L} y={yToPx(95)} width={W - PAD_L - PAD_R} height={yToPx(85) - yToPx(95)} fill="rgba(22,163,74,.07)" />
          <text x={W - PAD_R - 6} y={yToPx(85) - 4} textAnchor="end" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#16a34a" letterSpacing=".1em">WORLD-CLASS · 85–95</text>

          {series.map((s) => {
            const dim = focusId !== null && focusId !== s.id;
            const path = s.pts.map((p, i) => (i === 0 ? "M" : "L") + xToPx(p.x).toFixed(1) + " " + yToPx(p.y).toFixed(1)).join(" ");
            return (
              <g key={s.id} style={{ opacity: dim ? 0.18 : 1, transition: "opacity .2s" }}
                onMouseEnter={() => setFocusId(s.id)}>
                <path d={path} fill="none" stroke={s.color} strokeWidth={focusId === s.id ? 2.6 : 1.8}
                  className="trend-line" strokeLinejoin="round" strokeLinecap="round" />
              </g>
            );
          })}

          {series.map((s) =>
            s.events.map((ev, i) => {
              const show = focusId === s.id || (!focusId && ev.kind === "alarm");
              if (!show) return null;
              const cx = xToPx(ev.x), cy = yToPx(ev.y);
              const evColor = ev.kind === "alarm" ? "#dc2626" : ev.kind === "action" ? "#0f62fe" : ev.kind === "plan" ? "#5b6473" : "#16a34a";
              return (
                <g key={s.id + "-" + i}>
                  <circle cx={cx} cy={cy} r="4.5" fill="#fff" stroke={evColor} strokeWidth="1.6" />
                  <circle cx={cx} cy={cy} r="1.8" fill={evColor} />
                  <line x1={cx} x2={cx} y1={cy - 6} y2={cy - 22} stroke={evColor} strokeWidth=".8" strokeDasharray="2 2" />
                  <rect x={cx - 2} y={cy - 36} width={Math.max(96, ev.label.length * 5.6)} height="16" fill="#fff" stroke="#e5e7eb" rx="2" />
                  <text x={cx + 2} y={cy - 25} fontSize="9.5" fontFamily="JetBrains Mono, monospace" fill={evColor}>{ev.label}</text>
                </g>
              );
            })
          )}

          {[0, 4, 8, 12, 16, 20, 23].map((t) => (
            <text key={t} x={xToPx(t)} y={H - 10} textAnchor="middle" fontSize="9.5" fontFamily="JetBrains Mono, monospace" fill="#5b6473">
              {String((6 + t) % 24).padStart(2, "0")}:00
            </text>
          ))}
        </svg>

        <div className="trends-legend">
          {series.map((s) => (
            <button key={s.id} type="button"
              className={"trend-legend-item" + (focusId === s.id ? " on" : "")}
              onMouseEnter={() => setFocusId(s.id)}
              onMouseLeave={() => setFocusId(null)}
              onClick={() => setFocusId(focusId === s.id ? null : s.id)}>
              <i style={{ background: s.color }} />
              <span className="ll-name">{s.name}</span>
              <span className="ll-tag" style={{ color: s.story.tagColor }}>{s.story.tag}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="trends-grid">
        <div className="trends-card scenario-card">
          {(() => {
            const s = series.find((x) => x.id === focusId) || series.find((x) => x.id === "M-05") || series[0];
            const st = s.story;
            return (
              <>
                <div className="card-h">
                  <span>WHAT HAPPENED · {s.name}</span>
                  <span className="scenario-tag" style={{ background: st.tagColor }}>{st.tag}</span>
                </div>
                <p className="scenario-sub">{s.sub}</p>
                <div className="scenario-stats">
                  <div><b>{st.lossHrs.toFixed(1)}h</b><span>lost today</span></div>
                  <div><b>${st.lossDollars.toLocaleString()}</b><span>est. revenue impact</span></div>
                </div>
                <ul className="scenario-bullets">
                  {st.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <div className="scenario-fix">
                  <span className="scenario-fix-eyebrow">RECOMMENDED FIX</span>
                  <p>{st.fix}</p>
                </div>
              </>
            );
          })()}
        </div>

        <div className="trends-card">
          <div className="card-h">SIX BIG LOSSES · LAST 24 H</div>
          <div className="pareto">
            {losses.map((l, i) => (
              <div key={l.k} className="pareto-row">
                <span className="pareto-lbl">{l.k}<em>{l.src}</em></span>
                <div className="pareto-bar">
                  <div className="pareto-fill" style={{ width: `${(l.v / lossMax) * 100}%`, background: l.c, animationDelay: `${i * 60}ms` }} />
                </div>
                <span className="pareto-val">{l.v.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="trends-card">
          <div className="card-h">SHIFT COMPARISON</div>
          <div className="shift-grid">
            {shiftRows.map((r) => (
              <div key={r.s} className="shift-row">
                <strong>{r.s}</strong>
                <div className="shift-oee">
                  <div className="shift-oee-bar" style={{ width: `${r.oee * 100}%`, background: r.oee > 0.75 ? "#16a34a" : r.oee > 0.65 ? "#d97706" : "#dc2626" }} />
                  <span>{(r.oee * 100).toFixed(0)}%</span>
                </div>
                <span className="shift-meta">{r.run}h · {r.parts}</span>
                <span className="shift-note" style={{ gridColumn: "1 / -1", paddingLeft: "120px" }}>{r.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
