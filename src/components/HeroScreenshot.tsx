"use client";
import { useFloorStore } from "@/lib/store";
import { useSimulator } from "@/hooks/useSimulator";
import OEEGauge from "./OEEGauge";
import { STATUS_COLORS } from "@/lib/types";

export default function HeroScreenshot() {
  useSimulator();
  const machines = useFloorStore((s) => s.machines);
  const oee = machines.reduce((s, m) => s + m.oee, 0) / Math.max(machines.length, 1);
  const counts = machines.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1; return acc;
  }, {});
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-white shadow-[0_30px_60px_-20px_rgba(0,17,65,0.25),0_10px_20px_-8px_rgba(0,17,65,0.12)]">
      <div className="flex items-center gap-2 border-b border-line bg-[#fafbfd] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d6dae2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d6dae2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d6dae2]" />
        <span className="ml-3 max-w-[380px] flex-1 rounded border border-line bg-white px-2.5 py-1 font-mono text-[11px] text-muted">
          app.electronix.io / floor / plant-a
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-run">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-run" /> LIVE
        </span>
      </div>
      <div className="flex flex-wrap items-stretch gap-0 border-b border-line bg-white px-4 py-2">
        <KPI label="PLANT OEE" value={`${(oee * 100).toFixed(1)}%`} large color={oee >= 0.7 ? "#16a34a" : "#d97706"} />
        <span className="my-1.5 w-px bg-line" />
        <KPI label="RUN" value={String(counts.RUNNING || 0)} color="#16a34a" />
        <KPI label="IDLE" value={String(counts.IDLE || 0)} color="#d97706" />
        <KPI label="ALARM" value={String(counts.ALARM || 0)} color="#dc2626" />
        <KPI label="SHIFT A" value="06:00 - 14:00" mono />
      </div>
      <div className="grid grid-cols-5 gap-px bg-line">
        {machines.map((m) => (
          <div key={m.id} className="relative flex flex-col gap-1.5 bg-white p-2.5">
            <span className="absolute bottom-0 left-0 top-0 w-0.5" style={{ background: STATUS_COLORS[m.status].color }} />
            <div className="flex items-center justify-between text-[11px] font-bold">
              <strong>{m.name}</strong>
              <i className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLORS[m.status].color }} />
            </div>
            <div className="flex justify-center"><OEEGauge value={m.oee} size={64} stroke={6} /></div>
            <div className="flex justify-between font-mono text-[9.5px] font-semibold text-muted">
              <span><i className="not-italic mr-0.5 text-ink2/60">A</i>{(m.availability * 100).toFixed(0)}</span>
              <span><i className="not-italic mr-0.5 text-ink2/60">P</i>{(m.performance * 100).toFixed(0)}</span>
              <span><i className="not-italic mr-0.5 text-ink2/60">Q</i>{(m.quality * 100).toFixed(0)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KPI({ label, value, color, large = false, mono = false }: { label: string; value: string; color?: string; large?: boolean; mono?: boolean }) {
  return (
    <div className="flex min-w-[64px] flex-col justify-center px-2.5 py-1">
      <span className="font-mono text-[9.5px] font-medium tracking-[0.14em] text-muted" style={{ color }}>{label}</span>
      <span className={`mt-0.5 font-mono font-semibold tabular-nums leading-tight ${large ? "text-lg" : mono ? "text-sm text-ink2" : "text-base"}`} style={large && color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}
