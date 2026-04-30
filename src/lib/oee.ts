// OEE = Availability × Performance × Quality
//   Availability = Run Time / Planned Production Time
//   Performance  = (Ideal Cycle Time × Total Parts) / Run Time
//   Quality      = Good Parts / Total Parts

export interface OEEInput {
  runMinutes: number;
  idleMinutes: number;
  goodParts: number;
  rejectedParts: number;
  idealCycleMinutes: number; // per part
  plannedBuffer?: number;    // additional planned minutes
}

export interface OEEOutput {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  totalParts: number;
  plannedMinutes: number;
}

export function computeOEE(input: OEEInput): OEEOutput {
  const { runMinutes, idleMinutes, goodParts, rejectedParts, idealCycleMinutes } = input;
  const totalParts = goodParts + rejectedParts;
  const plannedMinutes = runMinutes + idleMinutes + (input.plannedBuffer ?? 5);
  const availability = plannedMinutes > 0 ? runMinutes / plannedMinutes : 0;
  const performance  = runMinutes > 0
    ? Math.min(1, (idealCycleMinutes * totalParts) / runMinutes)
    : 0;
  const quality      = totalParts > 0 ? goodParts / totalParts : 1;
  const oee = availability * performance * quality;
  return { availability, performance, quality, oee, totalParts, plannedMinutes };
}
