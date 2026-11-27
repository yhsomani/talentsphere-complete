/** Presentation helpers shared by pages. Pure functions, no I/O. */

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

/** "2026-06-01" or an ISO timestamp → "Jun 1, 2026". Unparseable input is returned as-is. */
export function formatDate(value: string | undefined | null): string {
  if (!value) return '—';
  // A bare YYYY-MM-DD is a calendar date: parse it as local midnight so it
  // never shifts a day in western time zones.
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** ISO timestamp → "Oct 11, 1:45 PM" (when a message was sent). */
export function formatDateTime(value: string | undefined | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateTimeFormatter.format(parsed);
}

/**
 * Integer minor units → "$90,000" or "$19.99" (SSOT money rule: integers on the wire).
 * Whole-dollar amounts drop the cents; anything else shows both decimals.
 */
export function formatMoney(minor: number, currency: string): string {
  const fractionDigits = Number.isInteger(minor / 100) ? 0 : 2;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(minor / 100);
  } catch {
    return `${(minor / 100).toLocaleString()} ${currency}`;
  }
}

export function formatSalaryRange(
  range: { minMinor: number; maxMinor: number; currency: string } | undefined
): string | null {
  if (!range) return null;
  return `${formatMoney(range.minMinor, range.currency)} – ${formatMoney(range.maxMinor, range.currency)}`;
}

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In review',
  shortlisted: 'Shortlisted',
  interviewing: 'Interviewing',
  offered: 'Offer made',
  hired: 'Hired',
  rejected: 'Not selected',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
};

export function applicationStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}

const JOB_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  approved: 'Approved',
  published: 'Published',
  paused: 'Paused',
  closed: 'Closed',
  archived: 'Archived',
};

export function jobStatusLabel(status: string): string {
  return JOB_STATUS_LABELS[status] ?? status;
}

// How an attached evidence record reads to the hiring team: a revoked or
// expired record says so instead of showing the level it once had (C-12).
export function evidenceStatusLabel(ev: { status: string; verificationLevel: string }): string {
  if (ev.status === 'revoked' || ev.status === 'expired') return ev.status;
  return ev.verificationLevel === 'unverified'
    ? 'self-reported'
    : ev.verificationLevel.replace('_', ' ');
}

// How strongly a skill is shown, by its strongest rung (the evidence levels).
export function skillRungLabel(rung: string): string {
  return rung === 'unverified' ? 'self-reported' : rung.replace('_', ' ');
}

const WORK_MODE_LABELS: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};
const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

export const workModeLabel = (v?: string) => (v ? (WORK_MODE_LABELS[v] ?? v) : null);
export const jobTypeLabel = (v?: string) => (v ? (JOB_TYPE_LABELS[v] ?? v) : null);

/** Experience levels a job can ask for (TS-09), in order. */
export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'fresher', label: 'Fresher' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
];
export const JOB_TYPE_OPTIONS = Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
export const experienceLevelLabel = (v?: string) =>
  v ? (EXPERIENCE_LEVEL_OPTIONS.find((o) => o.value === v)?.label ?? v) : null;

/** A link safe to render as an anchor: http(s) only, so a stored javascript: URL stays inert. */
export const safeHref = (url: string | undefined | null): string | undefined =>
  url && /^https?:\/\//i.test(url) ? url : undefined;
