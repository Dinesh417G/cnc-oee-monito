import type { TourStep } from "@/hooks/useTourPlayer";

export const TOUR_SCRIPT: TourStep[] = [
  { id: "intro",         durationMs: 10000, caption: "Step 1 — Welcome to your factory floor",          activeTab: "floor"   },
  { id: "plant-oee",     durationMs: 10000, caption: "Step 2 — Plant OEE in real time",                 activeTab: "floor"   },
  { id: "floor-all",     durationMs: 10000, caption: "Step 3 — All machines at a glance",               activeTab: "floor"   },
  { id: "alarm",         durationMs: 10000, caption: "Step 4 — CNC-05 raised an alarm",                 activeTab: "floor"   },
  { id: "machine-drill", durationMs: 10000, caption: "Step 5 — Drill into a single machine",            activeTab: "floor"   },
  { id: "ai-intro",      durationMs: 10000, caption: "Step 6 — AI flags the root cause",                activeTab: "ai"      },
  { id: "ai-fix",        durationMs: 10000, caption: "Step 7 — One recommended action",                 activeTab: "ai"      },
  { id: "trends-intro",  durationMs: 10000, caption: "Step 8 — Trends across shifts",                   activeTab: "trends"  },
  { id: "trends-pareto", durationMs: 10000, caption: "Step 9 — Your six biggest losses, ranked",        activeTab: "trends"  },
  { id: "alerts",        durationMs: 10000, caption: "Step 10 — Floor event feed",                      activeTab: "alerts"  },
  { id: "recovery",      durationMs: 10000, caption: "Step 11 — One shift later: OEE up 12%",           activeTab: "floor"   },
  { id: "cta",           durationMs: 10000, caption: "Step 12 — Your floor, live in 7 days",            activeTab: "floor"   },
];
