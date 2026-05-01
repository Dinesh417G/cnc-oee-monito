"use client";
import { useState, useEffect } from "react";
import type { Machine } from "@/lib/types";
import FloorStats from "./FloorStats";
import MachineTile from "./MachineTile";
import MobileFloorView from "./MobileFloorView";
import AIInsightsScreen from "./AIInsightsScreen";
import TrendsScreen from "./TrendsScreen";
import AlertsScreen from "./AlertsScreen";

type Tab = "floor" | "ai" | "trends" | "alerts";

const TAB_ICONS: Record<Tab, string> = { floor: "⚙", ai: "✦", trends: "↗", alerts: "⚠" };
const TAB_LABELS: Record<Tab, string> = { floor: "Floor View", ai: "AI Insights", trends: "Trends", alerts: "Alerts" };

export default function TourDashboard({
  machines,
  activeTab,
}: {
  machines: Machine[];
  activeTab: Tab;
}) {
  const [tab, setTab] = useState<Tab>(activeTab);

  // Script drives tab changes
  useEffect(() => { setTab(activeTab); }, [activeTab]);

  const alarmCount = machines.filter((m) => m.status === "ALARM").length;

  return (
    <div className="overflow-hidden border border-line bg-white">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-[#fafbfd] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d6dae2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d6dae2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d6dae2]" />
        <span className="ml-3 max-w-[380px] flex-1 rounded border border-line bg-white px-2.5 py-1 font-mono text-[10px] text-muted">
          <span className="hidden md:inline">app.electronix.io / </span>floor / plant-a / shift-A
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-run">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-run" /> LIVE
        </span>
      </div>

      {/* KPI bar — hides simulator toggle, uses mock machines */}
      <FloorStats machines={machines} hideSimulator />

      {/* tab strip */}
      <div className="view-tabs">
        {(["floor", "ai", "trends", "alerts"] as Tab[]).map((t) => (
          <button key={t} className={`view-tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
            <i>{TAB_ICONS[t]}</i>
            {TAB_LABELS[t]}
            {t === "alerts" && alarmCount > 0 && <span className="badge">{alarmCount}</span>}
          </button>
        ))}
      </div>

      {/* tab panels */}
      {tab === "floor" && (
        <>
          {/* desktop grid — no onClick so no drill-down in tour */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-px bg-line">
            {machines.map((m) => <MachineTile key={m.id} m={m} />)}
          </div>
          <div className="md:hidden">
            <MobileFloorView machines={machines} />
          </div>
        </>
      )}
      {tab === "ai"      && <AIInsightsScreen machines={machines} />}
      {tab === "trends"  && <TrendsScreen machines={machines} />}
      {tab === "alerts"  && <AlertsScreen machines={machines} />}
    </div>
  );
}
