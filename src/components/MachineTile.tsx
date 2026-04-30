"use client";
import OEEGauge from "./OEEGauge";
import type { Machine } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/types";

export default function MachineTile({ m, onClick }: { m: Machine; onClick?: (m: Machine) => void }) {
  const isRun = m.status === "RUNNING";
  const isAlarm = m.status === "ALARM";
  const c = STATUS_COLORS[m.status];
  return (
    <button
      onClick={() => onClick?.(m)}
      className="group relative flex flex-col gap-3 bg-white p-4 text-left transition hover:-translate-y-px hover:bg-[#fafbfd] hover:shadow-[0_8px_20px_-10px_rgba(0,17,65,.18),inset_0_0_0_1px_#0f62fe] hover:z-10"
    >
      <span className={`absolute bottom-0 left-0 top-0 w-[3px] ${isAlarm ? "animate-alarmFlash" : ""}`} style={{ background: c.color }} />
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <strong className="text-[13px] font-bold tracking-[-.005em]">{m.name}</strong>
          <span className="font-mono text-[10px] text-muted">{m.model}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: c.color, background: c.bg }}>
          <i className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
          {m.status}
        </span>
      </header>
      <div className="relative flex justify-center pt-1">
        {isRun && <span className="pointer-events-none absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 animate-pulseRing rounded-full border-[1.5px] border-run" />}
        <OEEGauge value={m.oee} size={130} stroke={10} />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {(["A", "P", "Q"] as const).map((k, i) => {
          const v = [m.availability, m.performance, m.quality][i];
          return (
            <div key={k} className="flex flex-col items-center gap-0 border-t-2 border-line bg-[#f4f6fb] px-1 py-1.5">
              <span className="font-mono text-[9.5px] font-semibold tracking-[0.16em] text-muted">{k}</span>
              <span className="font-mono text-sm font-semibold tabular-nums">
                {(v * 100).toFixed(0)}<i className="not-italic text-[.7em] opacity-55">%</i>
              </span>
            </div>
          );
        })}
      </div>
      <footer className="grid grid-cols-3 gap-1.5 border-t border-dashed border-line pt-2 font-mono text-[10.5px] text-muted">
        <Foot label="Run" value={`${m.run.toFixed(0)}m`} />
        <Foot label="Idle" value={`${m.idle.toFixed(0)}m`} />
        <Foot label="Parts" value={String(m.total)} />
      </footer>
    </button>
  );
}

function Foot({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col">
      <i className="not-italic tracking-[.08em] opacity-70">{label}</i>
      <b className="font-semibold tabular-nums text-ink">{value}</b>
    </span>
  );
}
