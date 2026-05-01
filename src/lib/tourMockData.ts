import type { Machine } from "./types";

export const TOUR_MACHINES: Machine[] = [
  { id: "M-01", name: "CNC-01", model: "Haas VF-2",     status: "RUNNING", run: 210, idle: 18,  good: 248, rejected: 3,  total: 251, planned: 228, availability: 0.921, performance: 0.872, quality: 0.988, oee: 0.793 },
  { id: "M-02", name: "CNC-02", model: "Mazak QT-200",  status: "RUNNING", run: 196, idle: 32,  good: 218, rejected: 5,  total: 223, planned: 228, availability: 0.860, performance: 0.812, quality: 0.978, oee: 0.683 },
  { id: "M-03", name: "CNC-03", model: "DMG MORI NLX",  status: "IDLE",    run: 143, idle: 85,  good: 157, rejected: 2,  total: 159, planned: 228, availability: 0.627, performance: 0.831, quality: 0.987, oee: 0.515 },
  { id: "M-04", name: "CNC-04", model: "Okuma LB-3000", status: "RUNNING", run: 205, idle: 23,  good: 231, rejected: 1,  total: 232, planned: 228, availability: 0.899, performance: 0.854, quality: 0.996, oee: 0.764 },
  { id: "M-05", name: "CNC-05", model: "Haas ST-20",    status: "ALARM",   run: 88,  idle: 140, good: 94,  rejected: 12, total: 106, planned: 228, availability: 0.386, performance: 0.709, quality: 0.887, oee: 0.243 },
  { id: "M-06", name: "CNC-06", model: "Mazak VTC-800", status: "RUNNING", run: 218, idle: 10,  good: 262, rejected: 2,  total: 264, planned: 228, availability: 0.956, performance: 0.912, quality: 0.992, oee: 0.864 },
];
