"use client";
import { useState } from "react";
import OEEGauge from "./OEEGauge";
import type { Machine } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/types";
import MachineDetail from "./MachineDetail";

export default function MobileFloorView({ machines }: { machines: Machine[] }) {
  const [selectedId, setSelectedId] = useState(machines[0]?.id);
  const [detailOpen, setDetailOpen] = useState(false);
  const m = machines.find((x) => x.id === selectedId) || machines[0];
  const c = STATUS_COLORS[m.status];
  const defectRate = m.total ? (m.rejected / m.total) * 100 : 0;

  return (
    <div className="flex flex-col min-w-0">
      {/* machine selector strip — overflow-hidden on wrapper clips page; inner div scrolls */}
      <div className="relative overflow-hidden border-b border-line bg-[#fafbfd]">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
        {machines.map((mm) => {
          const sc = STATUS_COLORS[mm.status];
          const active = mm.id === selectedId;
          return (
            <button
              key={mm.id}
              onClick={() => setSelectedId(mm.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2.5 flex-shrink-0 border-r border-line transition-colors ${active ? "bg-white border-b-2 border-b-primary" : "hover:bg-white"}`}
              style={active ? { borderBottomColor: "#0f62fe" } : {}}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: sc.color }} />
              <span className="font-mono text-[9.5px] font-semibold">{mm.name}</span>
              <span className="font-mono text-[9px]" style={{ color: mm.oee >= 0.85 ? "#16a34a" : mm.oee >= 0.65 ? "#0f62fe" : "#d97706" }}>
                {(mm.oee * 100).toFixed(0)}%
              </span>
            </button>
          );
        })}
        </div>
        {/* right-edge fade — hints at horizontal scrollability */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#fafbfd] to-transparent" />
      </div>

      {/* focused machine card */}
      <div className="flex flex-col gap-0 bg-white">
        {/* machine header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-block h-full w-[3px] rounded-full" style={{ background: c.color }} />
            <div>
              <p className="text-[15px] font-bold tracking-tight">{m.name}</p>
              <p className="font-mono text-[10.5px] text-muted">{m.model}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em]"
            style={{ color: c.color, background: c.bg }}>
            <i className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
            {m.status}
          </span>
        </div>

        {/* OEE gauge + APQ */}
        <div className="flex items-center gap-0 border-b border-line">
          <div className="flex flex-1 min-w-0 flex-col items-center justify-center px-4 py-5">
            <OEEGauge value={m.oee} size={140} stroke={11} />
          </div>
          <div className="flex flex-col gap-px border-l border-line min-w-0">
            {(["A", "P", "Q"] as const).map((k, i) => {
              const v = [m.availability, m.performance, m.quality][i];
              const good = v >= (k === "Q" ? 0.97 : 0.85);
              return (
                <div key={k} className="flex items-center gap-3 border-b border-line px-3 py-3 last:border-0">
                  <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-muted w-4 flex-shrink-0">{k}</span>
                  <div className="flex-1 min-w-0">
                    <div className="h-1.5 w-full bg-line overflow-hidden">
                      <div className="h-full transition-all" style={{ width: `${v * 100}%`, background: good ? "#16a34a" : v >= 0.7 ? "#d97706" : "#dc2626" }} />
                    </div>
                  </div>
                  <span className="font-mono text-[13px] font-bold tabular-nums w-10 text-right">
                    {(v * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* run stats */}
        <div className="grid grid-cols-4 divide-x divide-line border-b border-line">
          <StatCell label="Run" value={`${m.run.toFixed(0)}m`} />
          <StatCell label="Idle" value={`${m.idle.toFixed(0)}m`} />
          <StatCell label="Parts" value={String(m.total)} />
          <StatCell label="Defect" value={`${defectRate.toFixed(1)}%`} highlight={defectRate > 2} />
        </div>

        {/* shift timeline bar */}
        <div className="border-b border-line px-4 py-3">
          <p className="mb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted">Shift Timeline</p>
          <div className="flex h-3 overflow-hidden bg-line2">
            {(() => {
              const total = m.run + m.idle + 1;
              return (
                <>
                  <div style={{ width: `${(m.run / total) * 100}%`, background: "#16a34a" }} />
                  <div style={{ width: `${(m.idle / total) * 100}%`, background: "#d97706" }} />
                  <div style={{ flex: 1, background: "#dc2626", opacity: 0.4 }} />
                </>
              );
            })()}
          </div>
          <div className="mt-1.5 flex gap-3 font-mono text-[10px] text-muted">
            <span><i className="mr-1 inline-block h-2 w-2 align-middle bg-run" />Run {m.run.toFixed(0)}m</span>
            <span><i className="mr-1 inline-block h-2 w-2 align-middle bg-idle" />Idle {m.idle.toFixed(0)}m</span>
          </div>
        </div>

        {/* drill down button */}
        <button
          onClick={() => setDetailOpen(true)}
          className="flex w-full items-center justify-between bg-navy px-4 py-3.5 text-white"
        >
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">Full Detail + Edit Parts</span>
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/></svg>
        </button>
      </div>

      {detailOpen && (
        <MachineDetail
          m={machines.find((x) => x.id === selectedId) || m}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}

function StatCell({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 py-2.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{label}</span>
      <b className={`font-mono text-[13px] font-bold tabular-nums ${highlight ? "text-alarm" : "text-ink"}`}>{value}</b>
    </div>
  );
}
