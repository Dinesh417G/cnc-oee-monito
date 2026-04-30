"use client";
import { useState } from "react";
import { useFloorStore } from "@/lib/store";
import { useSimulator } from "@/hooks/useSimulator";
import FloorStats from "./FloorStats";
import MachineTile from "./MachineTile";
import MachineDetail from "./MachineDetail";
import AIInsightsScreen from "./AIInsightsScreen";
import TrendsScreen from "./TrendsScreen";
import AlertsScreen from "./AlertsScreen";
import type { Machine } from "@/lib/types";

type Tab = "floor" | "ai" | "trends" | "alerts";

export default function LiveDashboardSection() {
  useSimulator();
  const machines = useFloorStore((s) => s.machines);
  const [active, setActive] = useState<Machine | null>(null);
  const [tab, setTab] = useState<Tab>("floor");

  const alarmCount = machines.filter((m) => m.status === "ALARM").length;

  return (
    <section id="product" className="border-b border-line bg-gradient-to-b from-white to-[#eef2f9] py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-8">
          <div>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Live Floor View
            </span>
            <h2 className="mt-2 max-w-[18ch] text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-navy md:text-4xl lg:text-[44px]">
              Ten machines. One screen. Zero refresh.
            </h2>
          </div>
          <p className="max-w-[46ch] text-muted">
            The same digital-twin view your shift supervisors see — try it.
            Click any tile to drill into the machine; toggle the simulator off when you wire up
            real OPC UA / MQTT connectors.
          </p>
        </header>
        <div className="overflow-hidden border border-line bg-white shadow-[0_20px_50px_-25px_rgba(0,17,65,0.25)]">
          {/* browser chrome bar */}
          <div className="flex items-center gap-2 border-b border-line bg-[#fafbfd] px-3.5 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d6dae2]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d6dae2]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d6dae2]" />
            <span className="ml-3 max-w-[420px] flex-1 rounded border border-line bg-white px-2.5 py-1 font-mono text-[11px] text-muted">
              app.electronix.io / floor / plant-a / shift-A
            </span>
            <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-run">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-run" /> LIVE &middot; 5s tick
            </span>
          </div>

          {/* KPI bar — always visible */}
          <FloorStats />

          {/* tabs */}
          <div className="view-tabs">
            <button className={`view-tab ${tab === "floor" ? "on" : ""}`} onClick={() => setTab("floor")}>
              <i>⚙</i> Floor View
            </button>
            <button className={`view-tab ${tab === "ai" ? "on" : ""}`} onClick={() => setTab("ai")}>
              <i>✦</i> AI Insights
            </button>
            <button className={`view-tab ${tab === "trends" ? "on" : ""}`} onClick={() => setTab("trends")}>
              <i>↗</i> Trends
            </button>
            <button className={`view-tab ${tab === "alerts" ? "on" : ""}`} onClick={() => setTab("alerts")}>
              <i>⚠</i> Alerts
              {alarmCount > 0 && <span className="badge">{alarmCount}</span>}
            </button>
          </div>

          {/* tab panels */}
          {tab === "floor" && (
            <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-3 lg:grid-cols-5">
              {machines.map((m) => (
                <MachineTile key={m.id} m={m} onClick={setActive} />
              ))}
            </div>
          )}
          {tab === "ai" && <AIInsightsScreen machines={machines} />}
          {tab === "trends" && <TrendsScreen machines={machines} />}
          {tab === "alerts" && <AlertsScreen machines={machines} />}
        </div>
      </div>
      {active && (
        <MachineDetail
          m={machines.find((x) => x.id === active.id) || active}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}
