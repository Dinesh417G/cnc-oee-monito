"use client";
import { useEffect, useState } from "react";
import { useFloorStore } from "@/lib/store";

export default function FloorStats({
  machines: propMachines,
  hideSimulator = false,
}: {
  machines?: ReturnType<typeof useFloorStore.getState>["machines"];
  hideSimulator?: boolean;
}) {
  const storeMachines = useFloorStore((s) => s.machines);
  const simulatorOn = useFloorStore((s) => s.simulatorOn);
  const setSimulatorOn = useFloorStore((s) => s.setSimulatorOn);
  const machines = propMachines ?? storeMachines;

  const counts = machines.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1; return acc;
  }, {});
  const oeeAvg = machines.reduce((s, m) => s + m.oee, 0) / Math.max(machines.length, 1);

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (n: number) => String(n).padStart(2, "0");
  const clock = now ? `${fmt(now.getHours())}:${fmt(now.getMinutes())}:${fmt(now.getSeconds())}` : "--:--:--";
  let elapsedLbl = "--h --m";
  if (now) {
    const start = new Date(now); start.setHours(6, 0, 0, 0);
    const mins = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000));
    elapsedLbl = `${Math.floor(mins / 60)}h ${fmt(mins % 60)}m`;
  }

  return (
    <div className="flex flex-wrap items-stretch border-b border-line bg-white px-4 py-2.5">
      <Cell label="PLANT OEE" value={`${(oeeAvg * 100).toFixed(1)}%`} large color={oeeAvg >= 0.7 ? "#16a34a" : "#d97706"} />
      <span className="my-1.5 mx-2 w-px bg-line" />
      <Cell label="RUNNING" value={String(counts.RUNNING || 0)} color="#16a34a" />
      <Cell label="IDLE" value={String(counts.IDLE || 0)} color="#d97706" />
      <Cell label="ALARM" value={String(counts.ALARM || 0)} color="#dc2626" />
      <Cell label="OFFLINE" value={String(counts.OFFLINE || 0)} color="#6b7280" />
      <span className="my-1.5 mx-2 w-px bg-line" />
      <Cell label={`SHIFT A · ${elapsedLbl}`} value={clock} mono />
      {!hideSimulator && (
        <div className="ml-auto flex flex-col px-4 py-1">
          <span className="font-mono text-[9.5px] font-medium tracking-[0.14em] text-muted">SIMULATOR</span>
          <button type="button" onClick={() => setSimulatorOn(!simulatorOn)}
                  className="mt-1 inline-flex items-center gap-1.5 border border-line bg-white px-2 py-1 font-mono text-[11px] font-medium tracking-[0.06em]">
            <i className={`h-1.5 w-1.5 rounded-full ${simulatorOn ? "bg-run shadow-[0_0_0_3px_rgba(22,163,74,.18)]" : "bg-[#9ca3af]"}`} />
            <span className={simulatorOn ? "text-ink" : "text-muted"}>{simulatorOn ? "ON" : "OFF"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Cell({ label, value, color, large = false, mono = false }: { label: string; value: string; color?: string; large?: boolean; mono?: boolean }) {
  return (
    <div className="flex min-w-[88px] flex-col justify-center px-4 py-1">
      <span className="font-mono text-[9.5px] font-medium tracking-[0.14em] text-muted" style={{ color }}>{label}</span>
      <span className={`mt-0.5 font-mono font-semibold tabular-nums leading-tight ${large ? "text-2xl" : mono ? "text-sm text-ink2" : "text-lg"}`} style={large && color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}
