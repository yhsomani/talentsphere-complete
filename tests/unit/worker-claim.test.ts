import { describe, it, expect, vi } from 'vitest';
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

  it('claims only as many jobs as fit inside one lease', async () => {
    const store = new MemoryJobStore();
    for (let i = 0; i < 3; i += 1) await store.enqueue({ kind: 'slow.job', payload: {} });
    const claimSizes: number[] = [];
    const spy = {
      ...store,
      claim: (o: { limit: number; leaseMs: number }) => {
        claimSizes.push(o.limit);
        return store.claim(o);
      },
      complete: store.complete.bind(store),
      fail: store.fail.bind(store),
    } as unknown as MemoryJobStore;
    const result = await runClaimCycle({
      store: spy,
      handlers: handlers({ 'slow.job': async () => undefined }),
    });
    expect(result).toMatchObject({ claimed: 1, succeeded: 1, lapsed: 0 });
    expect(claimSizes[0]).toBe(1); // 60s lease / 30s handler timeout leaves room for one
  });

  it('still refuses to start a job whose lease cannot cover the handler timeout', async () => {
    const store = new MemoryJobStore();
    await store.enqueue({ kind: 'slow.job', payload: {} });
    let runs = 0;
    const result = await runClaimCycle({
      store,
      leaseMs: 60_000,
      handlerTimeoutMs: 30_000,
      // Worker clock is 45s ahead of the database: only 15s of lease remain.
      now: () => Date.now() + 45_000,
      handlers: handlers({
        'slow.job': async () => {
          runs += 1;
        },
      }),
    });
    expect(runs).toBe(0);
    expect(result).toMatchObject({ claimed: 1, succeeded: 0, lapsed: 1 });
  });
});

describe('Claim cycle: D-02 two workers, slow handlers', () => {
  it('runs each of 6 jobs exactly once when worker two starts after worker one lease would lapse', async () => {
    const store = new MemoryJobStore();
    for (let i = 0; i < 6; i += 1) await store.enqueue({ kind: 'slow.job', payload: { i } });
    const runs = new Map<number, number>();
    const opts = {
      store,
      leaseMs: 600,
      handlerTimeoutMs: 300,
      batchSize: 6,
      handlers: handlers({
        'slow.job': async (payload) => {
          const i = payload.i as number;
          runs.set(i, (runs.get(i) ?? 0) + 1);
          await new Promise((r) => setTimeout(r, 190));
        },
      }),
    };
    const drain = async () => {
      while ((await store.countActive()) > 0) {
        const r = await runClaimCycle(opts);
        if (r.claimed === 0) await new Promise((res) => setTimeout(res, 20));
      }
    };
    const w1 = drain();
    await new Promise((r) => setTimeout(r, 650));
    await Promise.all([w1, drain()]);
    expect([...runs.values()]).toEqual([1, 1, 1, 1, 1, 1]);
    expect((await store.list()).every((j) => j.status === 'succeeded')).toBe(true);
  }, 15_000);
});

describe('Claim cycle: attempts fencing against stale workers', () => {
  async function reclaimed() {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'fence.job', payload: {} });
    const [a] = await store.claim({ limit: 1, leaseMs: 1 });
    await new Promise((r) => setTimeout(r, 10));
    const [b] = await store.claim({ limit: 1, leaseMs: 60_000 });
    expect(a.attempts).toBe(1);
    expect(b.attempts).toBe(2);
    return { store, id: job.id };
  }
  const outcome = (attempts: number) => ({
    disposition: 'retry' as const,
    error: 'boom',
    maxAttempts: 5,
    backoffMs: 100,
    attempts,
    fence: attempts,
  });

  it('refuses a stale complete and accepts the current holder', async () => {
    const { store, id } = await reclaimed();
    expect(await store.complete(id, 1)).toBe(false);
    expect((await store.list())[0].status).toBe('running');
    expect(await store.complete(id, 2)).toBe(true);
    expect((await store.list())[0].status).toBe('succeeded');
  });

  it('keeps legacy complete(id) without a token working', async () => {
    const { store, id } = await reclaimed();
    expect(await store.complete(id)).toBe(true);
  });

  it('refuses a stale fail and accepts the current holder', async () => {
    const { store, id } = await reclaimed();
    expect(await store.fail(id, outcome(1))).toBeNull();
    expect((await store.list())[0].status).toBe('running');
    expect((await store.fail(id, outcome(2)))?.status).toBe('queued');
  });

  it('reports a stale ack in a claim cycle as superseded, never succeeded', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      const store = new MemoryJobStore();
      await store.enqueue({ kind: 'stale.job', payload: {} });
      const result = await runClaimCycle({
        store,
        handlers: handlers({
          'stale.job': async () => {
            // Lease lapses while the handler is paused; another worker re-claims.
            vi.setSystemTime(Date.now() + 120_000);
            const [b] = await store.claim({ limit: 1, leaseMs: 60_000 });
            expect(b.attempts).toBe(2);
          },
        }),
        leaseMs: 60_000,
        handlerTimeoutMs: 1_000,
      });
      expect(result).toMatchObject({ claimed: 1, succeeded: 0, superseded: 1 });
      expect((await store.list())[0].status).toBe('running');
    } finally {
      vi.useRealTimers();
    }
  });
});
