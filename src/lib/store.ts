"use client";
import { create } from "zustand";
import type { Machine } from "./types";
import { computeOEE } from "./oee";

const SEED: Omit<Machine, "run" | "idle" | "good" | "rejected" | "total" | "planned" | "availability" | "performance" | "quality" | "oee">[] = [
  { id: "M-01", name: "CNC-01", model: "Haas VF-2",     status: "RUNNING" },
  { id: "M-02", name: "CNC-02", model: "Mazak QT-200",  status: "RUNNING" },
  { id: "M-03", name: "CNC-03", model: "DMG MORI NLX",  status: "IDLE"    },
  { id: "M-04", name: "CNC-04", model: "Okuma LB-3000", status: "RUNNING" },
  { id: "M-05", name: "CNC-05", model: "Haas ST-20",    status: "ALARM"   },
  { id: "M-06", name: "CNC-06", model: "Mazak VTC-800", status: "RUNNING" },
  { id: "M-07", name: "CNC-07", model: "Doosan DNM-5",  status: "RUNNING" },
  { id: "M-08", name: "CNC-08", model: "Haas TM-1",     status: "OFFLINE" },
  { id: "M-09", name: "CNC-09", model: "Brother R-650", status: "RUNNING" },
  { id: "M-10", name: "CNC-10", model: "DMG CMX-50",    status: "IDLE"    },
];

const IDEAL_CYCLE = 0.4;

function seed(): Machine[] {
  return SEED.map((m) => {
    const runMinutes = 60 + Math.random() * 180;
    const idleMinutes = 10 + Math.random() * 40;
    const goodParts = 80 + Math.floor(Math.random() * 220);
    const rejectedParts = Math.floor(Math.random() * 8);
    const out = computeOEE({ runMinutes, idleMinutes, goodParts, rejectedParts, idealCycleMinutes: IDEAL_CYCLE });
    return {
      ...m,
      run: runMinutes, idle: idleMinutes, good: goodParts, rejected: rejectedParts,
      total: out.totalParts, planned: out.plannedMinutes,
      availability: out.availability, performance: out.performance, quality: out.quality, oee: out.oee,
    };
  });
}

interface FloorState {
  machines: Machine[];
  simulatorOn: boolean;
  setSimulatorOn: (v: boolean) => void;
  setMachines: (m: Machine[]) => void;
  updateParts: (id: string, good: number, rejected: number) => void;
}

export const useFloorStore = create<FloorState>((set) => ({
  machines: seed(),
  simulatorOn: true,
  setSimulatorOn: (v) => set({ simulatorOn: v }),
  setMachines: (m) => set({ machines: m }),
  updateParts: (id, good, rejected) => set((s) => ({
    machines: s.machines.map((m) => {
      if (m.id !== id) return m;
      const out = computeOEE({ runMinutes: m.run, idleMinutes: m.idle, goodParts: good, rejectedParts: rejected, idealCycleMinutes: IDEAL_CYCLE });
      return { ...m, good, rejected, total: out.totalParts, planned: out.plannedMinutes,
               availability: out.availability, performance: out.performance, quality: out.quality, oee: out.oee };
    }),
  })),
}));
