"use client";
import { useMemo } from "react";
import type { Machine } from "@/lib/types";

const EVENT_TYPES = [
  { t: "ALARM",     c: "#dc2626", msg: "X-axis overload — load > 110% limit" },
  { t: "IDLE",      c: "#d97706", msg: "Operator idle > 5 min after cycle complete" },
  { t: "OEE",       c: "#0f62fe", msg: "Performance dropped 8% vs trailing 4-shift avg" },
  { t: "QUALITY",   c: "#a855f7", msg: "Reject rate exceeded 1.5% threshold" },
  { t: "RECOVERED", c: "#16a34a", msg: "Returned to RUNNING after micro-stop" },
  { t: "SETUP",     c: "#3b82f6", msg: "Changeover started — program 4221" },
];

const STATIC_OFFSETS = [0,4,2,6,1,3,5,2,4,1,7,3,0,2];

export default function AlertsScreen({ machines }: { machines: Machine[] }) {
  const events = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const m = machines[i % machines.length];
      const e = EVENT_TYPES[i % EVENT_TYPES.length];
      const minsAgo = i * 7 + STATIC_OFFSETS[i];
      return { ...e, id: i, machine: m.name, model: m.model, minsAgo };
    });
  }, [machines]);

  return (
    <div className="alerts-screen">
      <header className="trends-h">
        <div>
          <span className="ai-eyebrow">EVENTS · LAST 4 HOURS</span>
          <h3>Floor activity feed</h3>
        </div>
        <div className="trends-range">
          {["ALL", "ALARM", "OEE", "QUALITY"].map((r) => (
            <button key={r} className={r === "ALL" ? "on" : ""}>{r}</button>
          ))}
        </div>
      </header>

      <div className="alerts-list">
        {events.map((e, i) => (
          <div key={e.id} className="alert-row animate-in" style={{ animationDelay: `${i * 30}ms` }}>
            <span className="alert-time">{e.minsAgo}m ago</span>
            <span className="alert-tag" style={{ color: e.c, background: e.c + "1a" }}>{e.t}</span>
            <span className="alert-machine">
              <strong>{e.machine}</strong>
              <i>{e.model}</i>
            </span>
            <span className="alert-msg">{e.msg}</span>
            <button className="alert-cta">Investigate →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
