import pg from 'pg';
import { createLogger } from '@talentsphere/observability';
import { createPgJobStore, DISPATCH_EVENT_KINDS, type JobStore } from '@talentsphere/domain';
import { runClaimCycle, PermanentJobError, type ClaimHandler } from './claim.js';
import { loadEmailConfig, emailConfigProblems } from './email/config.js';
import { createEmailService } from './email/service.js';
import { renderTemplate } from './email/templates.js';
import { EmailError, type EmailTemplateId } from './email/types.js';

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

// Transactional email is opt-in and provider-independent: handlers name a
// logical template and variables; apps/worker/src/email owns validation,
// rendering and the provider adapter. Development with no provider keeps its
// clearly labelled outbox.
const emailConfig = (() => {
  try {
    return loadEmailConfig(process.env);
  } catch (err) {
    // A stale or mistyped EMAIL_PROVIDER must stop the worker with one clear line.
    logger.error({ reason: (err as Error).message }, 'invalid email configuration; exiting');
    return process.exit(1);
  }
})();
const emailService = createEmailService(emailConfig);
const deliverEmail = (
  templateId: EmailTemplateId,
  variables: (payload: Record<string, unknown>) => Record<string, unknown>
): ClaimHandler => {
  return async (payload, record) => {
    const to = String(payload.to);
    const vars = variables(payload);
    if (
      emailConfig.provider === 'none' &&
      (process.env.NODE_ENV ?? 'development') === 'development'
    ) {
      const rendered = renderTemplate({ templateId, variables: vars }, emailConfig.appUrl);
      logger.warn(
        { jobId: record.id, to, subject: rendered.subject, text: rendered.text },
        'DEV OUTBOX: email NOT sent (no provider configured)'
      );
      return;
    }
    try {
      const result = await emailService.send({
        templateId,
        to,
        variables: vars,
        idempotencyKey: record.id,
      });
      // Acceptance by the provider is not proof of mailbox delivery.
      logger.info(
        { jobId: record.id, templateId, provider: result.provider, messageId: result.messageId },
        'email accepted by provider'
      );
    } catch (err) {
      if (err instanceof EmailError) {
        logger.warn({ jobId: record.id, templateId, code: err.code }, 'email send failed');
        if (!err.retryable) throw new PermanentJobError(err.message);
        throw new Error(err.message);
      }
      throw err;
    }
  };
};

claimHandlers.set(
  'work_history.email_verification_requested',
  deliverEmail('work_history.email_verification', (p) => ({
    code: p.code,
    expiresAt: p.expiresAt,
  }))
);
claimHandlers.set(
  'reference.requested',
  deliverEmail('reference.request', (p) => ({
    candidateName: p.candidateName,
    title: p.title,
    companyName: p.companyName,
    referenceId: p.referenceId,
    token: p.token,
  }))
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** pg store from DATABASE_URL; null when this process must not claim (memory). */
function resolveStore(): { store: JobStore; heartbeat: () => Promise<void> } | null {
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
  return {
    store: createPgJobStore((sql, params) => pool.query(sql, params)),
    heartbeat: async () => {
      await pool.query(
        'INSERT INTO public.worker_health (id, last_seen_at) VALUES (1, now()) ON CONFLICT (id) DO UPDATE SET last_seen_at = EXCLUDED.last_seen_at'
      );
    },
  };
}

async function runWorker(): Promise<void> {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    const problems = emailConfigProblems(emailConfig);
    if (emailConfig.provider !== 'none' && !emailConfig.appUrl.startsWith('https://')) {
      problems.push('APP_URL must be HTTPS for emailed links');
    }
    if (problems.length > 0) {
      throw new Error(`Email provider configuration invalid: ${problems.join('; ')}.`);
    }
  }
  const runner = resolveStore();
  if (!runner) {
    logger.warn(
      'TalentSphere Async Worker started with STORAGE=memory: background jobs are NOT durable and are NOT processed; idling.'
    );
    for (;;) {
      await sleep(60_000);
    }
  }

  const { store, heartbeat } = runner;
  logger.info({ mode: store.mode }, 'TalentSphere Async Worker started (durable claim loop)');
  let lastHeartbeatAt = 0;
  for (;;) {
    try {
      // An idle worker is still alive. A stopped worker leaves a stale timestamp,
      // and a database outage prevents the heartbeat from being refreshed.
      if (Date.now() - lastHeartbeatAt >= 10_000) {
        await heartbeat();
        lastHeartbeatAt = Date.now();
      }
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
