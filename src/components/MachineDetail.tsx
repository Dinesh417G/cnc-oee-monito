"use client";
import { useMemo, useState } from "react";
import OEEGauge from "./OEEGauge";
import type { Machine } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/types";
import { useFloorStore } from "@/lib/store";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export default function MachineDetail({ m, onClose }: { m: Machine; onClose: () => void }) {
  const updateParts = useFloorStore((s) => s.updateParts);
  const [good, setGood] = useState(m.good);
  const [rejected, setRejected] = useState(m.rejected);

  const trend = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ shift: `S-${7 - i}`, oee: 55 + Math.random() * 40 })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [m.id]
  );
  const total = m.run + m.idle + 1;
  const blocks = [
    { kind: "run", color: "#16a34a", pct: (m.run / total) * 100 },
    { kind: "idle", color: "#d97706", pct: (m.idle / total) * 100 },
    { kind: "alarm", color: "#dc2626", pct: 100 - ((m.run + m.idle) / total) * 100 },
  ];
  const defectRate = m.total ? (m.rejected / m.total) * 100 : 0;
  const c = STATUS_COLORS[m.status];

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(11,18,32,0.55)] p-6 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[90vh] w-[min(960px,96vw)] flex-col overflow-auto border border-line bg-white shadow-[0_30px_80px_-20px_rgba(0,17,65,.4)]">
        <header className="flex items-start justify-between gap-4 border-b border-line p-6">
          <div>
            <h3 className="text-xl font-bold tracking-[-.01em]">{m.name} <span className="font-mono text-sm font-normal text-muted">· {m.model}</span></h3>
            <span className="mt-2 inline-flex items-center gap-1.5 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: c.color, background: c.bg }}>
              <i className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />{m.status}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 border border-line bg-white text-sm text-muted hover:bg-ink hover:text-white">&#x2715;</button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col items-center gap-6 border-r border-line bg-[#fafbfd] p-6">
            <OEEGauge value={m.oee} size={220} stroke={14} />
            <div className="flex w-full flex-col gap-2">
              <Apq label="Availability" value={`${(m.availability * 100).toFixed(1)}%`} formula="Run / Planned" />
              <Apq label="Performance" value={`${(m.performance * 100).toFixed(1)}%`} formula="Ideal x Total / Run" />
              <Apq label="Quality"     value={`${(m.quality * 100).toFixed(1)}%`} formula="Good / Total" />
            </div>
          </div>
          <div className="flex flex-col gap-4 p-6">
            <Card title="Shift Timeline">
              <div className="flex h-3.5 overflow-hidden bg-line2">
                {blocks.map((b) => <div key={b.kind} style={{ width: `${b.pct}%`, background: b.color }} />)}
              </div>
              <div className="mt-2 flex gap-3.5 font-mono text-[11px] text-muted">
                <span><i className="mr-1 inline-block h-2 w-2 align-middle bg-run" />Run</span>
                <span><i className="mr-1 inline-block h-2 w-2 align-middle bg-idle" />Idle</span>
                <span><i className="mr-1 inline-block h-2 w-2 align-middle bg-alarm" />Alarm</span>
              </div>
            </Card>
            <Card title="7-Shift OEE Trend">
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer>
                  <LineChart data={trend} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                    <XAxis dataKey="shift" stroke="#5b6473" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                    <YAxis width={28} domain={[0, 100]} stroke="#5b6473" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
                      formatter={(v: number | string) => [`${(+v).toFixed(1)}%`, "OEE"]}
                      wrapperStyle={{ maxWidth: 160 }}
                      allowEscapeViewBox={{ x: false, y: false }}
                    />
                    <Line type="monotone" dataKey="oee" stroke="#0f62fe" strokeWidth={2} dot={{ r: 3, fill: "#0f62fe" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Parts">
              <div className="mb-3.5 grid grid-cols-4 gap-2.5">
                <Stat label="Good" value={String(m.good)} />
                <Stat label="Rejected" value={String(m.rejected)} />
                <Stat label="Total" value={String(m.total)} />
                <Stat label="Defect" value={`${defectRate.toFixed(2)}%`} />
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex min-w-[120px] flex-1 flex-col gap-1 font-mono text-[11px] text-muted">
                  Good
                  <input type="number" value={good} onChange={(e) => setGood(Number(e.target.value))}
                         className="h-8 border border-line px-2.5 font-mono text-[13px]" />
                </label>
                <label className="flex min-w-[120px] flex-1 flex-col gap-1 font-mono text-[11px] text-muted">
                  Rejected
                  <input type="number" value={rejected} onChange={(e) => setRejected(Number(e.target.value))}
                         className="h-8 border border-line px-2.5 font-mono text-[13px]" />
                </label>
                <button
                  onClick={() => updateParts(m.id, good, rejected)}
                  className="h-8 bg-primary px-3.5 text-xs font-semibold tracking-[.04em] text-white hover:bg-primary-700"
                >
                  Save Snapshot
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line bg-white p-4">
      <div className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</div>
      {children}
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border border-line bg-[#fafbfd] px-2.5 py-2">
      <span className="font-mono text-[10.5px] uppercase tracking-[.1em] text-muted">{label}</span>
      <b className="text-lg tabular-nums">{value}</b>
    </div>
  );
}
function Apq({ label, value, formula }: { label: string; value: string; formula: string }) {
  return (
    <div className="flex flex-col gap-0.5 border border-line bg-white px-3 py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{label}</span>
      <b className="text-2xl font-bold tabular-nums text-navy">{value}</b>
      <i className="font-mono text-[10.5px] not-italic text-muted">{formula}</i>
    </div>
  );
}
