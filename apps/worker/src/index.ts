import pg from 'pg';
import { createLogger } from '@talentsphere/observability';
import { createPgJobStore, DISPATCH_EVENT_KINDS, type JobStore } from '@talentsphere/domain';
import { JobQueueEngine } from './queue.js';
import { runClaimCycle, type ClaimHandler } from './claim.js';

// Load .env natively (Node process.loadEnvFile) exactly like the API entry
// (apps/api/src/index.ts): found from the repo root, or two levels up when
// started from apps/worker (pnpm --filter dev). A missing file is fine — CI
// and production pass environment variables directly — and values already in
// process.env are never overridden by the file.
for (const candidate of ['.env', '../../.env']) {
  try {
    process.loadEnvFile(candidate);
    break;
  } catch {
    // not here — try the next location
  }
}

const logger = createLogger({ name: 'talentsphere-worker' });
export const queueEngine = new JobQueueEngine();

// Register background task handlers (Section 22 engine surface, unit-tested
// in tests/unit/worker-queue.test.ts).
queueEngine.registerHandler('evidence.propagate', async (job) => {
  logger.info({ payload: job.payload }, 'Propagating evidence to Career Graph');
});

queueEngine.registerHandler('notifications.send', async (job) => {
  logger.info({ payload: job.payload }, 'Delivering queued notification');
});

queueEngine.registerHandler('analytics.aggregate', async (job) => {
  logger.info({ payload: job.payload }, 'Aggregating daily platform metrics');
});

// Durable claim registry: one handler per dispatch kind the API emits. The
// side effects for these events already happened inline in the route — the
// handler's job is the durable acknowledgment (queued → running → succeeded),
// with specific behavior overriding the default ack where it exists.
const claimHandlers = new Map<string, ClaimHandler>();
for (const kind of DISPATCH_EVENT_KINDS) {
  claimHandlers.set(kind, async (_payload, record) => {
    logger.debug({ jobId: record.id, kind: record.kind }, 'dispatch event acknowledged');
  });
}
claimHandlers.set('evidence.propagate', async (payload) => {
  logger.info({ payload }, 'Propagating evidence to Career Graph');
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** pg store from DATABASE_URL; null when this process must not claim (memory). */
function resolveStore(): JobStore | null {
  const mode =
    process.env.STORAGE === 'pg' || process.env.STORAGE === 'memory'
      ? process.env.STORAGE
      : process.env.NODE_ENV === 'test'
        ? 'memory'
        : 'pg';

  if (mode === 'memory') {
    // The API's memory records live in the API process; this process cannot
    // see them, and memory is not durable. Idling is the honest behavior.
    return null;
  }
  if (!process.env.DATABASE_URL) {
    logger.error('STORAGE=pg requires DATABASE_URL; refusing to start without a durable store');
    process.exit(1);
  }
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30_000,
  });
  // Without this listener an idle-client error would crash the process.
  pool.on('error', (err: Error) => {
    logger.error({ err }, 'idle postgres client error');
  });
  return createPgJobStore((sql, params) => pool.query(sql, params));
}

async function runWorker(): Promise<void> {
  const store = resolveStore();
  if (!store) {
    logger.warn(
      'TalentSphere Async Worker started with STORAGE=memory: background jobs are NOT durable and are NOT processed; idling.'
    );
    for (;;) {
      await sleep(60_000);
    }
  }

  logger.info({ mode: store.mode }, 'TalentSphere Async Worker started (durable claim loop)');
  for (;;) {
    try {
      const result = await runClaimCycle({ store, handlers: claimHandlers });
      if (result.claimed === 0) {
        await sleep(1000);
      }
    } catch (err) {
      // A transient outage (database restart, network blip) must slow the
      // loop down and stay observable, never crash-loop or spin.
      logger.error({ err }, 'claim cycle failed; retrying in 5s');
      await sleep(5000);
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  runWorker().catch((err) => {
    logger.error(err, 'Worker process crashed');
    process.exit(1);
  });
}
