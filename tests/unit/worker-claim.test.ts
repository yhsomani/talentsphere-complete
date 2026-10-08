import { describe, it, expect } from 'vitest';
import { MemoryJobStore } from '../../packages/domain/src/background-jobs.js';
import {
  runClaimCycle,
  PermanentJobError,
  type ClaimHandler,
} from '../../apps/worker/src/claim.js';

function handlers(entries: Record<string, ClaimHandler>): Map<string, ClaimHandler> {
  return new Map(Object.entries(entries));
}

const failHandler =
  (message: string): ClaimHandler =>
  async () => {
    throw new Error(message);
  };

describe('Claim cycle: durable ack lifecycle', () => {
  it('runs a handler and acknowledges queued → succeeded in one cycle', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'ok.job', payload: { hello: 'world' } });
    let seen: Record<string, unknown> | undefined;

    const result = await runClaimCycle({
      store,
      handlers: handlers({
        'ok.job': async (payload) => {
          seen = payload;
        },
      }),
    });

    expect(result).toMatchObject({ claimed: 1, succeeded: 1, retried: 0, dead: 0 });
    expect(seen).toEqual({ hello: 'world' });
    const [record] = await store.list();
    expect(record.status).toBe('succeeded');
    expect(record.attempts).toBe(1);
    expect(record.id).toBe(job.id);
    expect(record.lockExpiresAt).toBeNull();
    // Terminal — never claimable again.
    expect(await store.claim({ limit: 5, leaseMs: 1000 })).toHaveLength(0);
  });

  it('claims nothing when the queue is empty', async () => {
    const store = new MemoryJobStore();
    const result = await runClaimCycle({ store, handlers: handlers({}) });
    expect(result.claimed).toBe(0);
  });
});

describe('Claim cycle: bounded retries with backoff', () => {
  it('retries a transient failure and schedules the retry with jittered backoff', async () => {
    const store = new MemoryJobStore();
    await store.enqueue({ kind: 'flaky.job', payload: {} });
    const before = Date.now();

    const result = await runClaimCycle({
      store,
      handlers: handlers({ 'flaky.job': failHandler('transient outage') }),
      backoffMs: 1000,
      maxAttempts: 3,
    });

    expect(result).toMatchObject({ claimed: 1, retried: 1, dead: 0 });
    const [record] = await store.list();
    expect(record.status).toBe('queued');
    expect(record.attempts).toBe(1);
    expect(record.lastError).toContain('transient outage');
    const delay = Date.parse(record.runAfter) - before;
    expect(delay).toBeGreaterThanOrEqual(800);
    expect(delay).toBeLessThanOrEqual(1300);
    // Not claimable until the backoff elapses.
    expect(await store.claim({ limit: 5, leaseMs: 1000 })).toHaveLength(0);
  });

  it('exhausts the retry budget into dead with every attempt recorded', async () => {
    const store = new MemoryJobStore();
    await store.enqueue({ kind: 'poison.job', payload: {} });
    const opts = {
      store,
      handlers: handlers({ 'poison.job': failHandler('always fails') }),
      backoffMs: 0, // immediate requeue so the test can loop deterministically
      maxAttempts: 3,
    };

    const first = await runClaimCycle(opts);
    expect(first).toMatchObject({ retried: 1, dead: 0 });
    const second = await runClaimCycle(opts);
    expect(second).toMatchObject({ retried: 1, dead: 0 });
    const third = await runClaimCycle(opts);
    expect(third).toMatchObject({ retried: 0, dead: 1 });

    const [record] = await store.list();
    expect(record.status).toBe('dead');
    expect(record.attempts).toBe(3);
    expect(record.lastError).toContain('always fails');
    expect(await store.claim({ limit: 5, leaseMs: 1000 })).toHaveLength(0);
  });

  it('never retries a PermanentJobError', async () => {
    const store = new MemoryJobStore();
    await store.enqueue({ kind: 'validation.job', payload: {} });

    const result = await runClaimCycle({
      store,
      handlers: handlers({
        'validation.job': async () => {
          throw new PermanentJobError('input failed schema validation');
        },
      }),
      backoffMs: 1000,
      maxAttempts: 5,
    });

    expect(result).toMatchObject({ permanent: 1, retried: 0 });
    const [record] = await store.list();
    expect(record.status).toBe('failed');
    expect(record.attempts).toBe(1);
    expect(record.lastError).toContain('schema validation');
    expect(await store.claim({ limit: 5, leaseMs: 1000 })).toHaveLength(0);
  });
});

describe('Claim cycle: worker safety', () => {
  it('times out a hung handler and schedules a retry', async () => {
    const store = new MemoryJobStore();
    await store.enqueue({ kind: 'hung.job', payload: {} });

    const result = await runClaimCycle({
      store,
      handlers: handlers({
        'hung.job': () => new Promise<void>(() => undefined), // never settles
      }),
      handlerTimeoutMs: 25,
      backoffMs: 0,
      maxAttempts: 3,
    });

    expect(result).toMatchObject({ claimed: 1, retried: 1 });
    const [record] = await store.list();
    expect(record.status).toBe('queued');
    expect(record.lastError).toContain('timed out after 25ms');
  }, 10_000);

  it('dead-letters a dispatch kind with no handler instead of retrying it', async () => {
    const store = new MemoryJobStore();
    await store.enqueue({ kind: 'mystery.kind', payload: {} });

    const result = await runClaimCycle({ store, handlers: handlers({}) });

    expect(result).toMatchObject({ dead: 1 });
    const [record] = await store.list();
    expect(record.status).toBe('dead');
    expect(record.lastError).toContain('no handler registered for job kind: mystery.kind');
  });

  it('reports a completed-after-cancel job as superseded, never succeeded', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'cancel.job', payload: {} });

    const result = await runClaimCycle({
      store,
      handlers: handlers({
        'cancel.job': async () => {
          // Operator cancels while the handler runs; the handler cannot be
          // interrupted — the acknowledgment boundary enforces the cancel.
          await store.cancel(job.id);
        },
      }),
    });

    expect(result).toMatchObject({ claimed: 1, succeeded: 0, superseded: 1 });
    expect((await store.list())[0].status).toBe('canceled');
  });

  it('does not overwrite a cancel that lands while the handler fails', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'cancel.fail', payload: {} });

    const result = await runClaimCycle({
      store,
      handlers: handlers({
        'cancel.fail': async () => {
          await store.cancel(job.id);
          throw new Error('handler exploded after cancel');
        },
      }),
    });

    expect(result).toMatchObject({ superseded: 1, retried: 0, dead: 0 });
    expect((await store.list())[0].status).toBe('canceled');
  });

  it('truncates oversized handler errors into last_error', async () => {
    const store = new MemoryJobStore();
    await store.enqueue({ kind: 'loud.job', payload: {} });

    await runClaimCycle({
      store,
      handlers: handlers({ 'loud.job': failHandler('e'.repeat(10_000)) }),
      backoffMs: 0,
    });

    const [record] = await store.list();
    expect(record.lastError).toHaveLength(4096);
  });
});
