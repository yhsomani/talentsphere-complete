// Durable claim → execute → acknowledge cycle (SSOT §27.1 ADR-009 §27.4).
// One cycle claims due jobs under a lease (SKIP LOCKED in pg), runs each
// handler under a hard timeout, and records exactly one terminal transition:
//   succeeded | retry (bounded, jittered backoff) | failed (permanent) | dead.
// The in-memory JobQueueEngine in queue.ts keeps its unit-tested standalone
// queue; this runner is the durable path the API's dispatch events travel.
import { createLogger } from '@talentsphere/observability';
import { truncateError, type BackgroundJobRecord, type JobStore } from '@talentsphere/domain';

const logger = createLogger({ name: 'talentsphere-worker' });

/** Thrown by a handler when the failure is non-retryable (validation, bad input). */
export class PermanentJobError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermanentJobError';
  }
}

export type ClaimHandler = (
  payload: Record<string, unknown>,
  record: BackgroundJobRecord
) => Promise<void>;

export interface ClaimCycleOptions {
  store: JobStore;
  handlers: Map<string, ClaimHandler>;
  /** Claim lease; must exceed handlerTimeoutMs so a live handler is never double-claimed. */
  leaseMs?: number;
  handlerTimeoutMs?: number;
  maxAttempts?: number;
  /** Base backoff; actual delay is base * 2^(attempts-1), capped, ±20% jitter. */
  backoffMs?: number;
  batchSize?: number;
}

export interface ClaimCycleResult {
  claimed: number;
  succeeded: number;
  retried: number;
  permanent: number;
  dead: number;
  /** Finished after a concurrent cancel, or record left terminal by cancel — no double-write. */
  superseded: number;
}

async function runWithTimeout(
  handler: ClaimHandler,
  record: BackgroundJobRecord,
  timeoutMs: number
): Promise<void> {
  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      handler(record.payload, record),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`handler timed out after ${timeoutMs}ms`)),
          timeoutMs
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function runClaimCycle(options: ClaimCycleOptions): Promise<ClaimCycleResult> {
  const {
    store,
    handlers,
    // 60s lease > 30s handler timeout: a running handler always finishes (or
    // times out) before its lease expires, so redelivery cannot double-run it.
    leaseMs = 60_000,
    handlerTimeoutMs = 30_000,
    maxAttempts = 3,
    backoffMs = 1_000,
    batchSize = 10,
  } = options;

  const result: ClaimCycleResult = {
    claimed: 0,
    succeeded: 0,
    retried: 0,
    permanent: 0,
    dead: 0,
    superseded: 0,
  };

  const claimed = await store.claim({ limit: batchSize, leaseMs });
  result.claimed = claimed.length;

  for (const record of claimed) {
    const handler = handlers.get(record.kind);
    if (!handler) {
      // Unregistered kind = a dispatch drift bug; dead-letter it visibly
      // rather than retrying a permanent configuration gap.
      await store.fail(record.id, {
        disposition: 'dead',
        error: `no handler registered for job kind: ${record.kind}`,
        maxAttempts,
        backoffMs,
        attempts: record.attempts,
      });
      result.dead += 1;
      logger.warn({ jobId: record.id, kind: record.kind }, 'no handler for job kind; marked dead');
      continue;
    }

    try {
      await runWithTimeout(handler, record, handlerTimeoutMs);
      const acked = await store.complete(record.id);
      if (acked) {
        result.succeeded += 1;
        logger.debug({ jobId: record.id, kind: record.kind }, 'job succeeded');
      } else {
        // Canceled while running: the store refused the success transition.
        // The handler's side effects are not rolled back — cancel is a
        // cooperative request honored at the acknowledgment boundary.
        result.superseded += 1;
        logger.info(
          { jobId: record.id, kind: record.kind },
          'job finished after cancel; transition superseded'
        );
      }
    } catch (err) {
      const permanent = err instanceof PermanentJobError;
      const failed = await store.fail(record.id, {
        disposition: permanent ? 'permanent' : 'retry',
        error: truncateError(err),
        maxAttempts,
        backoffMs,
        attempts: record.attempts,
      });
      if (!failed) {
        result.superseded += 1;
        continue;
      }
      if (permanent) {
        result.permanent += 1;
        logger.warn(
          { jobId: record.id, kind: record.kind, error: failed.lastError },
          'permanent failure; not retried'
        );
      } else if (failed.status === 'dead') {
        result.dead += 1;
        logger.error(
          { jobId: record.id, kind: record.kind, attempts: failed.attempts },
          'retries exhausted; marked dead'
        );
      } else {
        result.retried += 1;
        logger.warn(
          {
            jobId: record.id,
            kind: record.kind,
            attempts: failed.attempts,
            runAfter: failed.runAfter,
          },
          'transient failure; retry scheduled'
        );
      }
    }
  }

  return result;
}
