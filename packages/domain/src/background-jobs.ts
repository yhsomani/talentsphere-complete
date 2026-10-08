import crypto from 'node:crypto';

// Durable background-job substrate — SSOT §27.1 ADR-009 (dual-queue boundary)
// and §27.4 (job schema). The API enqueues domain-event dispatches through a
// JobStore; the worker claims them with SKIP LOCKED semantics (pg) or idles
// honestly (memory). One state machine, two persistence backends.
//
// Phase-1 audit verdict this encodes: no user-visible operation defers work to
// a job (all side effects commit synchronously in the route). Jobs therefore
// exist for durable, observable *dispatch*, never to defer user outcomes.

export type BackgroundJobStatus =
  'queued' | 'running' | 'succeeded' | 'failed' | 'dead' | 'canceled';

export interface BackgroundJobRecord {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  status: BackgroundJobStatus;
  attempts: number;
  runAfter: string;
  lockExpiresAt: string | null;
  lastError: string | null;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnqueueInput {
  kind: string;
  payload: Record<string, unknown>;
  /** Optional business-level dedupe key; UNIQUE(kind, idempotency_key) in pg. */
  idempotencyKey?: string;
}

export interface EnqueueResult {
  job: BackgroundJobRecord;
  /** True when an existing record with the same (kind, idempotencyKey) won. */
  deduped: boolean;
}

export type FailDisposition =
  /** Transient: back to queued with run_after = now + backoff. */
  | 'retry'
  /** Permanent (non-retryable): terminal failed, needs no operator. */
  | 'permanent'
  /** Operator attention: retries exhausted or unregistered handler. */
  | 'dead';

export interface FailOutcome {
  disposition: FailDisposition;
  error: string;
  maxAttempts: number;
  backoffMs: number;
  /** Attempt count of the claimed record — the backoff exponent. */
  attempts: number;
}

export interface JobStore {
  readonly mode: 'memory' | 'pg';
  enqueue(input: EnqueueInput): Promise<EnqueueResult>;
  list(opts?: { limit?: number }): Promise<BackgroundJobRecord[]>;
  /** queued + running — the only statuses that may be reported as "active". */
  countActive(): Promise<number>;
  /** queued → canceled, or running → canceled (cooperative, post-completion). */
  cancel(id: string): Promise<BackgroundJobRecord | null>;
  /** Claims due jobs (queued & run_after elapsed, or running with an expired lease). */
  claim(opts: { limit: number; leaseMs: number }): Promise<BackgroundJobRecord[]>;
  /** running → succeeded; guarded so double-completion is a no-op. */
  complete(id: string): Promise<boolean>;
  fail(id: string, outcome: FailOutcome): Promise<BackgroundJobRecord | null>;
  /** Retention: purges terminal rows older than the cutoff; active rows are kept. */
  purgeOlderThan(cutoffIso: string): Promise<number>;
}

/** §27.4 retry brain shared by the in-memory engine and the durable store. */
export function computeBackoffMs(
  baseMs: number,
  attempts: number,
  random: () => number = Math.random
): number {
  if (baseMs <= 0) return 0;
  const exponential = baseMs * 2 ** Math.max(0, attempts - 1);
  const capped = Math.min(exponential, 30_000);
  // ±20% jitter so a poison batch does not retry in lockstep.
  return Math.round(capped * (0.8 + 0.4 * random()));
}

/**
 * Single decision point for failure transitions — the pg store's SQL CASE and
 * the memory store apply the identical rules:
 *   permanent → failed (terminal, no retry)
 *   dead      → dead (terminal, operator attention)
 *   retry     → queued with backoff, or dead once attempts >= maxAttempts
 */
export function decideFailure(params: {
  disposition: FailDisposition;
  attempts: number;
  maxAttempts: number;
  backoffMs: number;
}): { nextStatus: 'queued' | 'failed' | 'dead'; delayMs: number } {
  if (params.disposition === 'permanent') return { nextStatus: 'failed', delayMs: 0 };
  if (params.disposition === 'dead') return { nextStatus: 'dead', delayMs: 0 };
  if (params.attempts >= params.maxAttempts) return { nextStatus: 'dead', delayMs: 0 };
  return {
    nextStatus: 'queued',
    delayMs: computeBackoffMs(params.backoffMs, params.attempts),
  };
}

export function truncateError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  // §27.4: last_error is bounded to 4KB in the durable record.
  return message.length > 4096 ? message.slice(0, 4096) : message;
}

/**
 * Every dispatch kind the API emits today (server.ts `dispatchJob` sites).
 * The worker registers a durable-ack handler for each kind that has no
 * specific side-effect handler. tests/unit/background-jobs.test.ts drift-guards
 * this list against the actual server.ts emissions.
 */
export const DISPATCH_EVENT_KINDS = [
  'admin.user.status_updated',
  'ai.interaction.logged',
  'alumni.affiliation.created',
  'alumni.affiliation.verified',
  'alumni.mentorship.requested',
  'application.feedback_delivered',
  'application.status_changed',
  'application.submitted',
  'billing.subscription.cancelled',
  'billing.subscription.created',
  'billing.webhook.received',
  'career.transition_recorded',
  'connection.accepted',
  'connection.removed',
  'connection.rejected',
  'connection.requested',
  'connection.withdrawn',
  'employer.reputation.updated',
  'evidence.propagate',
  'gamification.badge.unlocked',
  'gamification.xp.awarded',
  'gdpr.data.exported',
  'gdpr.erasure.cancelled',
  'gdpr.erasure.completed',
  'gdpr.erasure.requested',
  'instructor.reputation.updated',
  'learning.outcome_recorded',
  'lms.course.completed',
  'messaging.message.sent',
  'moderation.appeal_reviewed',
  'moderation.appeal_submitted',
  'moderation.report_created',
  'moderation.report_resolved',
  'notification.push',
  'portfolio.project.created',
  'portfolio.project.removed',
  'portfolio.project.updated',
  'resume.exported',
  'search.queried',
  'skill.endorsed',
  'skill.forecast_generated',
  'skill.market_signal_recorded',
  'user.settings.updated',
] as const;

export type DispatchEventKind = (typeof DISPATCH_EVENT_KINDS)[number];

/**
 * In-process store. Honest by construction: it is NOT durable — records die
 * with the process, exactly like every other memory-mode entity. Used by the
 * test suite (STORAGE=memory) and as the fallback shape reference.
 */
export class MemoryJobStore implements JobStore {
  readonly mode = 'memory' as const;
  private jobs: BackgroundJobRecord[] = [];
  private idempotencyKeys = new Set<string>();

  async enqueue(input: EnqueueInput): Promise<EnqueueResult> {
    if (input.idempotencyKey !== undefined) {
      const composite = `${input.kind}\u0000${input.idempotencyKey}`;
      const existing = this.idempotencyKeys.has(composite);
      if (existing) {
        const prior = this.jobs.find(
          (j) => j.kind === input.kind && j.idempotencyKey === input.idempotencyKey
        );
        if (prior) return { job: { ...prior }, deduped: true };
      }
      this.idempotencyKeys.add(composite);
    }
    const now = new Date().toISOString();
    const job: BackgroundJobRecord = {
      id: crypto.randomUUID(),
      kind: input.kind,
      payload: input.payload,
      status: 'queued',
      attempts: 0,
      runAfter: now,
      lockExpiresAt: null,
      lastError: null,
      idempotencyKey: input.idempotencyKey ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.push(job);
    return { job: { ...job }, deduped: false };
  }

  async list(opts: { limit?: number } = {}): Promise<BackgroundJobRecord[]> {
    const limit = opts.limit ?? 500;
    return this.jobs.slice(0, limit).map((j) => ({ ...j }));
  }

  async countActive(): Promise<number> {
    return this.jobs.filter((j) => j.status === 'queued' || j.status === 'running').length;
  }

  async cancel(id: string): Promise<BackgroundJobRecord | null> {
    const job = this.jobs.find((j) => j.id === id);
    if (!job) return null;
    if (job.status !== 'queued' && job.status !== 'running') return null;
    job.status = 'canceled';
    job.updatedAt = new Date().toISOString();
    return { ...job };
  }

  async claim(opts: { limit: number; leaseMs: number }): Promise<BackgroundJobRecord[]> {
    const now = Date.now();
    const claimed: BackgroundJobRecord[] = [];
    for (const job of this.jobs) {
      if (claimed.length >= opts.limit) break;
      const due = job.status === 'queued' && Date.parse(job.runAfter) <= now;
      const leaseExpired =
        job.status === 'running' &&
        job.lockExpiresAt !== null &&
        Date.parse(job.lockExpiresAt) < now;
      if (!due && !leaseExpired) continue;
      job.status = 'running';
      job.attempts += 1;
      job.lockExpiresAt = new Date(now + opts.leaseMs).toISOString();
      job.updatedAt = new Date(now).toISOString();
      claimed.push({ ...job });
    }
    return claimed;
  }

  async complete(id: string): Promise<boolean> {
    const job = this.jobs.find((j) => j.id === id);
    // A canceled record refuses the success transition (cooperative cancel).
    if (!job || job.status !== 'running') return false;
    job.status = 'succeeded';
    job.lockExpiresAt = null;
    job.updatedAt = new Date().toISOString();
    return true;
  }

  async fail(id: string, outcome: FailOutcome): Promise<BackgroundJobRecord | null> {
    const job = this.jobs.find((j) => j.id === id);
    if (!job || job.status !== 'running') return null;
    const { nextStatus, delayMs } = decideFailure({
      disposition: outcome.disposition,
      // Same source as the pg backend: the claimed record's attempt count
      // passed by the runner (identical to the row — lease > timeout invariant).
      attempts: outcome.attempts,
      maxAttempts: outcome.maxAttempts,
      backoffMs: outcome.backoffMs,
    });
    job.lastError = truncateError(outcome.error);
    job.lockExpiresAt = null;
    if (nextStatus === 'queued') {
      job.status = 'queued';
      job.runAfter = new Date(Date.now() + delayMs).toISOString();
    } else {
      job.status = nextStatus;
    }
    job.updatedAt = new Date().toISOString();
    return { ...job };
  }

  async purgeOlderThan(cutoffIso: string): Promise<number> {
    const cutoff = Date.parse(cutoffIso);
    const before = this.jobs.length;
    this.jobs = this.jobs.filter((j) => {
      const active = j.status === 'queued' || j.status === 'running';
      return active || Date.parse(j.updatedAt) >= cutoff;
    });
    return before - this.jobs.length;
  }
}

/** Minimal structural contract over pg's pool.query — keeps `pg` out of domain. */
export type PgQueryFn = (
  sql: string,
  params?: unknown[]
) => Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }>;

function toIso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapRow(row: Record<string, unknown>): BackgroundJobRecord {
  return {
    id: String(row.id),
    kind: String(row.kind),
    payload: (row.payload ?? {}) as Record<string, unknown>,
    status: String(row.status) as BackgroundJobStatus,
    attempts: Number(row.attempts),
    runAfter: toIso(row.run_after),
    lockExpiresAt:
      row.lock_expires_at === null || row.lock_expires_at === undefined
        ? null
        : toIso(row.lock_expires_at),
    lastError:
      row.last_error === null || row.last_error === undefined ? null : String(row.last_error),
    idempotencyKey:
      row.idempotency_key === null || row.idempotency_key === undefined
        ? null
        : String(row.idempotency_key),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

/**
 * Durable store over the §27.4 background_jobs table (migration 00042).
 * Claiming uses FOR UPDATE SKIP LOCKED + lock_expires_at leases, so a worker
 * crash mid-job redelivers after the lease instead of stranding the row.
 */
export function createPgJobStore(query: PgQueryFn): JobStore {
  return {
    mode: 'pg',

    async enqueue(input: EnqueueInput): Promise<EnqueueResult> {
      const inserted = await query(
        `INSERT INTO public.background_jobs (kind, payload, status, attempts, run_after, idempotency_key)
         VALUES ($1, $2::jsonb, 'queued', 0, NOW(), $3)
         ON CONFLICT (kind, idempotency_key) DO NOTHING
         RETURNING *`,
        [input.kind, JSON.stringify(input.payload), input.idempotencyKey ?? null]
      );
      if (inserted.rows.length > 0) {
        return { job: mapRow(inserted.rows[0]), deduped: false };
      }
      const prior = await query(
        `SELECT * FROM public.background_jobs WHERE kind = $1 AND idempotency_key = $2`,
        [input.kind, input.idempotencyKey ?? null]
      );
      return { job: mapRow(prior.rows[0]), deduped: true };
    },

    async list(opts: { limit?: number } = {}): Promise<BackgroundJobRecord[]> {
      const result = await query(
        `SELECT * FROM public.background_jobs ORDER BY created_at ASC LIMIT $1`,
        [opts.limit ?? 500]
      );
      return result.rows.map(mapRow);
    },

    async countActive(): Promise<number> {
      const result = await query(
        `SELECT count(*)::int AS n FROM public.background_jobs WHERE status IN ('queued', 'running')`
      );
      return Number(result.rows[0]?.n ?? 0);
    },

    async cancel(id: string): Promise<BackgroundJobRecord | null> {
      const result = await query(
        `UPDATE public.background_jobs
         SET status = 'canceled', lock_expires_at = NULL, updated_at = NOW()
         WHERE id = $1 AND status IN ('queued', 'running')
         RETURNING *`,
        [id]
      );
      return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
    },

    async claim(opts: { limit: number; leaseMs: number }): Promise<BackgroundJobRecord[]> {
      const result = await query(
        `UPDATE public.background_jobs
         SET status = 'running',
             attempts = attempts + 1,
             lock_expires_at = NOW() + ($2::bigint * INTERVAL '1 millisecond'),
             updated_at = NOW()
         WHERE id IN (
           SELECT id FROM public.background_jobs
           WHERE (status = 'queued' AND run_after <= NOW())
              OR (status = 'running' AND lock_expires_at IS NOT NULL AND lock_expires_at < NOW())
           ORDER BY run_after
           LIMIT $1
           FOR UPDATE SKIP LOCKED
         )
         RETURNING *`,
        [opts.limit, opts.leaseMs]
      );
      return result.rows.map(mapRow);
    },

    async complete(id: string): Promise<boolean> {
      const result = await query(
        `UPDATE public.background_jobs
         SET status = 'succeeded', lock_expires_at = NULL, updated_at = NOW()
         WHERE id = $1 AND status = 'running'`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    },

    async fail(id: string, outcome: FailOutcome): Promise<BackgroundJobRecord | null> {
      // The transition is decided in JS by the shared decideFailure() so both
      // backends apply byte-identical backoff+jitter rules; the WHERE clause
      // guards it (only a `running` row may fail) — safe because the runner's
      // lease (60s) exceeds its handler timeout (30s), so attempts cannot move
      // between claim and fail.
      const { nextStatus, delayMs } = decideFailure({
        disposition: outcome.disposition,
        attempts: outcome.attempts,
        maxAttempts: outcome.maxAttempts,
        backoffMs: outcome.backoffMs,
      });
      const result = await query(
        `UPDATE public.background_jobs
         SET status = $2::varchar,
             run_after = CASE WHEN $2::text = 'queued'
                              THEN NOW() + ($3::bigint * INTERVAL '1 millisecond')
                              ELSE run_after END,
             last_error = LEFT($4::text, 4096),
             lock_expires_at = NULL,
             updated_at = NOW()
         WHERE id = $1 AND status = 'running'
         RETURNING *`,
        [id, nextStatus, delayMs, outcome.error]
      );
      return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
    },

    async purgeOlderThan(cutoffIso: string): Promise<number> {
      const result = await query(
        `DELETE FROM public.background_jobs
         WHERE updated_at < $1::timestamptz AND status NOT IN ('queued', 'running')`,
        [cutoffIso]
      );
      return result.rowCount ?? 0;
    },
  };
}
