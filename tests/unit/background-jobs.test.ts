import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  MemoryJobStore,
  DISPATCH_EVENT_KINDS,
  computeBackoffMs,
  decideFailure,
  truncateError,
} from '../../packages/domain/src/background-jobs.js';

const repoRoot = path.resolve('.');

describe('MemoryJobStore lifecycle (SSOT §27.4)', () => {
  it('enqueues as queued and counts only queued/running as active', async () => {
    const store = new MemoryJobStore();
    const { job, deduped } = await store.enqueue({ kind: 'a.b', payload: { x: 1 } });
    expect(job.status).toBe('queued');
    expect(job.attempts).toBe(0);
    expect(deduped).toBe(false);
    expect(await store.countActive()).toBe(1);

    await store.complete(job.id); // not running → refused
    expect((await store.list())[0].status).toBe('queued');
    expect(await store.countActive()).toBe(1);
  });

  it('claims due queued jobs, increments attempts, and sets a lease', async () => {
    const store = new MemoryJobStore();
    await store.enqueue({ kind: 'a.b', payload: {} });
    const [claimed] = await store.claim({ limit: 5, leaseMs: 60_000 });
    expect(claimed.status).toBe('running');
    expect(claimed.attempts).toBe(1);
    expect(Date.parse(claimed.lockExpiresAt!)).toBeGreaterThan(Date.now());
    // Nothing else to claim while the lease is live.
    expect(await store.claim({ limit: 5, leaseMs: 60_000 })).toHaveLength(0);
  });

  it('redelivers a running job whose lease expired (crash recovery)', async () => {
    const store = new MemoryJobStore();
    await store.enqueue({ kind: 'a.b', payload: {} });
    const [first] = await store.claim({ limit: 1, leaseMs: -1 });
    expect(first.attempts).toBe(1);
    const [second] = await store.claim({ limit: 1, leaseMs: 60_000 });
    expect(second.id).toBe(first.id);
    expect(second.attempts).toBe(2);
  });

  it('refuses double completion', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'a.b', payload: {} });
    await store.claim({ limit: 1, leaseMs: 60_000 });
    expect(await store.complete(job.id)).toBe(true);
    expect(await store.complete(job.id)).toBe(false);
    expect((await store.list())[0].status).toBe('succeeded');
    expect(await store.countActive()).toBe(0);
  });

  it('cancels queued jobs and refuses transitions out of canceled', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'a.b', payload: {} });
    const canceled = await store.cancel(job.id);
    expect(canceled?.status).toBe('canceled');
    expect(await store.countActive()).toBe(0);
    // Claim ignores terminal rows; complete/fail refuse them.
    expect(await store.claim({ limit: 5, leaseMs: 60_000 })).toHaveLength(0);
    expect(await store.complete(job.id)).toBe(false);
    expect(
      await store.fail(job.id, {
        disposition: 'retry',
        error: 'x',
        maxAttempts: 3,
        backoffMs: 0,
        attempts: 1,
      })
    ).toBeNull();
    expect(await store.cancel(job.id)).toBeNull();
  });

  it('keeps a cancel-while-running job terminal (cooperative boundary)', async () => {
    // Cancel-while-running: cooperative boundary, the runner's later
    // complete()/fail() calls are refused (covered in worker-claim tests).
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'a.b', payload: {} });
    await store.claim({ limit: 1, leaseMs: -1 });
    expect((await store.cancel(job.id))?.status).toBe('canceled');
    expect(await store.claim({ limit: 1, leaseMs: 60_000 })).toHaveLength(0);
    expect(await store.complete(job.id)).toBe(false);
  });
});

describe('MemoryJobStore failure transitions (decideFailure)', () => {
  const outcome = {
    disposition: 'retry' as const,
    error: 'boom',
    maxAttempts: 3,
    backoffMs: 1000,
    attempts: 1,
  };

  it('requeues a transient failure with jittered backoff and records last_error', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'a.b', payload: {} });
    await store.claim({ limit: 1, leaseMs: 60_000 });
    const before = Date.now();
    const failed = await store.fail(job.id, outcome);
    expect(failed?.status).toBe('queued');
    expect(failed?.lastError).toBe('boom');
    const delay = Date.parse(failed!.runAfter) - before;
    // base 1000, attempt 1 → 1000ms ±20% jitter.
    expect(delay).toBeGreaterThanOrEqual(800);
    expect(delay).toBeLessThanOrEqual(1300);
    expect(await store.countActive()).toBe(1);
  });

  it('dead-letters once attempts reach maxAttempts', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'a.b', payload: {} });
    await store.claim({ limit: 1, leaseMs: 60_000 });
    const failed = await store.fail(job.id, { ...outcome, attempts: 3 });
    expect(failed?.status).toBe('dead');
  });

  it('never retries a permanent failure', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'a.b', payload: {} });
    await store.claim({ limit: 1, leaseMs: 60_000 });
    const failed = await store.fail(job.id, { ...outcome, disposition: 'permanent' });
    expect(failed?.status).toBe('failed');
    expect(await store.claim({ limit: 5, leaseMs: 60_000 })).toHaveLength(0);
  });

  it('treats an explicit dead disposition as terminal regardless of attempts', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'a.b', payload: {} });
    await store.claim({ limit: 1, leaseMs: 60_000 });
    const failed = await store.fail(job.id, { ...outcome, disposition: 'dead', attempts: 1 });
    expect(failed?.status).toBe('dead');
  });

  it('truncates last_error to 4KB', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'a.b', payload: {} });
    await store.claim({ limit: 1, leaseMs: 60_000 });
    const failed = await store.fail(job.id, { ...outcome, error: 'x'.repeat(10_000) });
    expect(failed?.lastError).toHaveLength(4096);
  });
});

describe('MemoryJobStore idempotency and retention', () => {
  it('dedupes on (kind, idempotencyKey) and returns the prior record', async () => {
    const store = new MemoryJobStore();
    const first = await store.enqueue({ kind: 'a.b', payload: { v: 1 }, idempotencyKey: 'k1' });
    const second = await store.enqueue({ kind: 'a.b', payload: { v: 2 }, idempotencyKey: 'k1' });
    expect(second.deduped).toBe(true);
    expect(second.job.id).toBe(first.job.id);
    expect(second.job.payload).toEqual({ v: 1 });
    expect(await store.list()).toHaveLength(1);

    // Different kind, same key → separate record (the key is composite).
    const other = await store.enqueue({ kind: 'c.d', payload: {}, idempotencyKey: 'k1' });
    expect(other.deduped).toBe(false);
    expect(await store.list()).toHaveLength(2);
  });

  it('keyless enqueues never dedupe (per-instance events)', async () => {
    const store = new MemoryJobStore();
    await store.enqueue({ kind: 'a.b', payload: {} });
    await store.enqueue({ kind: 'a.b', payload: {} });
    expect(await store.list()).toHaveLength(2);
  });

  it('purges old terminal jobs and keeps active ones', async () => {
    const store = new MemoryJobStore();
    const { job } = await store.enqueue({ kind: 'a.b', payload: {} });
    await store.claim({ limit: 1, leaseMs: 60_000 });
    await store.complete(job.id);
    await store.enqueue({ kind: 'c.d', payload: {} }); // stays queued

    const purged = await store.purgeOlderThan(new Date(Date.now() + 60_000).toISOString());
    expect(purged).toBe(1);
    const remaining = await store.list();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].kind).toBe('c.d');
  });
});

describe('Shared retry brain', () => {
  it('computeBackoffMs is exponential, jittered ±20%, capped at 30s', () => {
    expect(computeBackoffMs(0, 1)).toBe(0);
    expect(computeBackoffMs(1000, 1, () => 0.5)).toBe(1000);
    expect(computeBackoffMs(1000, 2, () => 0.5)).toBe(2000);
    expect(computeBackoffMs(1000, 3, () => 0.5)).toBe(4000);
    expect(computeBackoffMs(1000, 20, () => 0.5)).toBe(30_000); // capped
    expect(computeBackoffMs(1000, 1, () => 0)).toBe(800); // jitter floor
    expect(computeBackoffMs(1000, 1, () => 1)).toBe(1200); // jitter ceiling
  });

  it('decideFailure maps every disposition to the §27.4 transition', () => {
    expect(
      decideFailure({ disposition: 'permanent', attempts: 1, maxAttempts: 3, backoffMs: 0 })
    ).toEqual({
      nextStatus: 'failed',
      delayMs: 0,
    });
    expect(
      decideFailure({ disposition: 'dead', attempts: 1, maxAttempts: 3, backoffMs: 0 })
    ).toEqual({
      nextStatus: 'dead',
      delayMs: 0,
    });
    expect(
      decideFailure({ disposition: 'retry', attempts: 3, maxAttempts: 3, backoffMs: 0 })
    ).toEqual({
      nextStatus: 'dead',
      delayMs: 0,
    });
    expect(
      decideFailure({ disposition: 'retry', attempts: 2, maxAttempts: 3, backoffMs: 500 })
    ).toEqual({
      nextStatus: 'queued',
      delayMs: expect.any(Number),
    });
  });

  it('truncateError bounds captured errors to 4096 chars', () => {
    expect(truncateError(new Error('y'.repeat(10_000)))).toHaveLength(4096);
    expect(truncateError('plain string')).toBe('plain string');
  });
});

describe('Dispatch kind drift guard (server.ts ↔ DISPATCH_EVENT_KINDS)', () => {
  const serverSource = fs.readFileSync(path.join(repoRoot, 'apps/api/src/server.ts'), 'utf8');
  const emittedKinds = [...serverSource.matchAll(/await dispatchJob\(\{\s*type: '([^']+)'/g)].map(
    (m) => m[1]
  );

  it('the legacy fire-and-forget array is fully replaced', () => {
    expect(serverSource).not.toContain('enqueuedWorkerJobs.push');
    expect(emittedKinds.length).toBeGreaterThan(0);
  });

  it('every kind the API emits is registered (unknown kinds would dead-letter)', () => {
    const known = new Set<string>(DISPATCH_EVENT_KINDS);
    const unknown = emittedKinds.filter((kind) => !known.has(kind));
    expect(unknown).toEqual([]);
  });

  it('every registered kind is still emitted (no stale registrations)', () => {
    const emitted = new Set(emittedKinds);
    const stale = DISPATCH_EVENT_KINDS.filter((kind) => !emitted.has(kind));
    expect(stale).toEqual([]);
  });
});
