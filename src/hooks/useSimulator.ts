"use client";
import { useEffect } from "react";
import { useFloorStore } from "@/lib/store";
import type { Machine, MachineStatus } from "@/lib/types";
import { computeOEE } from "@/lib/oee";

const IDEAL_CYCLE = 0.4;

function tick(m: Machine): Machine {
  if (m.status === "OFFLINE") return m;
  let status: MachineStatus = m.status;
  let { run, idle, good, rejected } = m;
  const r = Math.random();
  if (status === "RUNNING") {
    if (r < 0.04) status = "IDLE" as MachineStatus;
    else if (r < 0.06) status = "ALARM" as MachineStatus;
  } else if (status === "IDLE") {
    if (r < 0.35) status = "RUNNING" as MachineStatus;
  } else if (status === "ALARM") {
    if (r < 0.4) status = "IDLE" as MachineStatus;
  }
  if (status === "RUNNING") {
    run += 5 / 60;
    good += 1 + Math.floor(Math.random() * 3);
    if (Math.random() < 0.1) rejected += 1;
  } else {
    idle += 5 / 60;
  }
  const out = computeOEE({
    runMinutes: run, idleMinutes: idle, goodParts: good, rejectedParts: rejected, idealCycleMinutes: IDEAL_CYCLE,
  });
  return { ...m, run, idle, good, rejected, status,
           total: out.totalParts, planned: out.plannedMinutes,
           availability: out.availability, performance: out.performance, quality: out.quality, oee: out.oee };
}

export function useSimulator(intervalMs = 1500) {
  const machines = useFloorStore((s) => s.machines);
  const setMachines = useFloorStore((s) => s.setMachines);
  const simulatorOn = useFloorStore((s) => s.simulatorOn);
  useEffect(() => {
    if (!simulatorOn) return;
    const id = setInterval(() => setMachines(machines.map(tick)), intervalMs);
    return () => clearInterval(id);
  }, [simulatorOn, machines, setMachines, intervalMs]);
}
