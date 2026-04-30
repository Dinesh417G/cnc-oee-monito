export type MachineStatus = "RUNNING" | "IDLE" | "ALARM" | "OFFLINE";

export interface Machine {
  id: string;
  name: string;
  model: string;
  status: MachineStatus;
  run: number;          // minutes
  idle: number;         // minutes
  good: number;
  rejected: number;
  total: number;
  planned: number;
  availability: number; // 0..1
  performance: number;  // 0..1
  quality: number;      // 0..1
  oee: number;          // 0..1
}

export const STATUS_COLORS: Record<MachineStatus, { color: string; bg: string }> = {
  RUNNING: { color: "#16a34a", bg: "rgba(22,163,74,.08)" },
  IDLE:    { color: "#d97706", bg: "rgba(217,119,6,.08)" },
  ALARM:   { color: "#dc2626", bg: "rgba(220,38,38,.08)" },
  OFFLINE: { color: "#6b7280", bg: "rgba(107,114,128,.08)" },
};
