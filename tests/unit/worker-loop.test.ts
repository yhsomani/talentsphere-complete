import { describe, expect, it, vi } from 'vitest';
import { MemoryJobStore } from '../../packages/domain/src/background-jobs.js';
import { createStopSignal, runLoop } from '../../apps/worker/src/loop.js';
import type { ClaimCycleResult } from '../../apps/worker/src/claim.js';

// C-08: on SIGTERM/SIGINT the worker stops claiming, lets the cycle in
// progress finish, and returns so the entry point can close the pool.
const result = (claimed: number): ClaimCycleResult => ({
  claimed,
  succeeded: claimed,
  retried: 0,
  permanent: 0,
  dead: 0,
  superseded: 0,
  lapsed: 0,
});

describe('Worker loop stops gracefully (C-08)', () => {
  it('finishes the in-flight cycle, makes no further claim, and resolves', async () => {
    const signal = createStopSignal();
    let finished = 0;
    const runCycle = vi.fn(async () => {
      if (runCycle.mock.calls.length === 2) {
        // A stop request arrives while this cycle is running.
        signal.stop();
        await new Promise((r) => setTimeout(r, 20));
      }
      finished += 1;
      return result(1);
    });
    await runLoop({
      store: new MemoryJobStore(),
      handlers: new Map(),
      heartbeat: async () => undefined,
      signal,
      runCycle,
    });
    expect(runCycle).toHaveBeenCalledTimes(2);
    expect(finished).toBe(2);
  });

  it('an idle sleep is cut short by stop()', async () => {
    const signal = createStopSignal();
    const runCycle = vi.fn(async () => result(0)); // idle: the loop sleeps 1 s
    const started = Date.now();
    const loop = runLoop({
      store: new MemoryJobStore(),
      handlers: new Map(),
      heartbeat: async () => undefined,
      signal,
      runCycle,
    });
    await new Promise((r) => setTimeout(r, 20));
    signal.stop();
    await loop;
    expect(Date.now() - started).toBeLessThan(500);
    expect(runCycle).toHaveBeenCalledTimes(1);
  });

  it('createStopSignal: sleep after stop resolves immediately', async () => {
    const signal = createStopSignal();
    expect(signal.stopping).toBe(false);
    signal.stop();
    expect(signal.stopping).toBe(true);
    const started = Date.now();
    await signal.sleep(60_000);
    expect(Date.now() - started).toBeLessThan(50);
  });
});
