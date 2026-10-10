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

/** Integer minor units → "$90,000" (SSOT money rule: integers on the wire). */
export function formatMoney(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
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
