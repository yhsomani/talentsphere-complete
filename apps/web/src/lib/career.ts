export interface WorkRole {
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
}

const DAY_MS = 86_400_000;

/**
 * Years of experience across a set of roles, counting overlapping roles once (two jobs held
 * in the same months are not double experience). Rounded to one decimal, never negative.
 */
export function yearsOfExperience(roles: WorkRole[], now: Date = new Date()): number {
  const spans = roles
    .map((r) => {
      const start = Date.parse(r.startDate);
      const end = r.isCurrent || !r.endDate ? now.getTime() : Date.parse(r.endDate);
      return { start, end };
    })
    .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start)
    .sort((a, b) => a.start - b.start);

  let total = 0;
  let current: { start: number; end: number } | null = null;
  for (const s of spans) {
    if (current && s.start <= current.end) current.end = Math.max(current.end, s.end);
    else {
      if (current) total += current.end - current.start;
      current = { ...s };
    }
  }
  if (current) total += current.end - current.start;
  return Math.round((total / DAY_MS / 365.25) * 10) / 10;
}
