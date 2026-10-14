import pg from 'pg';
import { createLogger } from '@talentsphere/observability';
import { createPgJobStore, DISPATCH_EVENT_KINDS, type JobStore } from '@talentsphere/domain';
import { PermanentJobError, runClaimCycle, type ClaimHandler } from './claim.js';

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

// Durable claim registry: one handler per kind the API dispatches.
//
// Every kind except the two emails below is an EVENT RECORD: the API commits
// the event's effect before it dispatches (in-app notifications in the same
// transaction as their event, ADR-015; evidence status is read by id wherever
// it is shown, so a change needs no propagation; exports are compiled in the
// request). Completing such a job means "recorded", not "delivered", and the
// handler does nothing else on purpose. A kind that needs work done here —
// a delivery, a recomputation — gets its own handler that does that work and
// fails when it cannot, like the emails (external audit TS-006).
const recordEvent: ClaimHandler = async (_payload, record) => {
  logger.debug({ jobId: record.id, kind: record.kind }, 'event recorded');
};
const claimHandlers = new Map<string, ClaimHandler>();
for (const kind of DISPATCH_EVENT_KINDS) {
  claimHandlers.set(kind, recordEvent);
}

// Transactional email. No email provider is wired yet (docs/quality/
// OPERATIONS.md). These two messages carry a credential the recipient needs —
// a mailbox-ownership code, a referee's one-time link — so pretending they
// were delivered would strand the user. In development the message goes to
// the log (a "dev outbox") so the flow can be completed locally; everywhere
// else the job fails permanently and visibly instead of acking a delivery
// that never happened.
const APP_URL = (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const deliverEmail = (
  render: (payload: Record<string, unknown>) => {
    to: string;
    subject: string;
    text: string;
  }
): ClaimHandler => {
  return async (payload, record) => {
    const message = render(payload);
    if ((process.env.NODE_ENV ?? 'development') === 'development') {
      logger.warn(
        { jobId: record.id, to: message.to, subject: message.subject, text: message.text },
        'DEV OUTBOX: email NOT sent (no provider configured)'
      );
      return;
    }
    throw new PermanentJobError(
      `No email provider configured: "${message.subject}" to ${message.to} was not delivered`
    );
  };
};

claimHandlers.set(
  'work_history.email_verification_requested',
  deliverEmail((p) => ({
    to: String(p.to),
    subject: 'Your TalentSphere verification code',
    text: `Your code is ${String(p.code)}. It expires at ${String(p.expiresAt)}.`,
  }))
);
claimHandlers.set(
  'reference.requested',
  deliverEmail((p) => ({
    to: String(p.to),
    subject: `${String(p.candidateName ?? 'A candidate')} asked you for a reference`,
    text:
      `${String(p.candidateName ?? 'A candidate')} listed you as a reference for ` +
      `${String(p.title)} at ${String(p.companyName)}. Respond here: ` +
      `${APP_URL}/reference/${String(p.referenceId)}#token=${String(p.token)}`,
  }))
);

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
