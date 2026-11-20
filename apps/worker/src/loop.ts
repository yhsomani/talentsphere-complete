// The worker's claim loop, stoppable for graceful SIGTERM/SIGINT (C-08).
// Kept apart from index.ts, whose module body loads configuration and may
// exit the process, so the loop can be unit-tested.
import type { JobStore } from '@talentsphere/domain';
import { runClaimCycle, type ClaimCycleOptions, type ClaimHandler } from './claim.js';

/** A stop flag whose sleep() returns early once stop() is called. */
export interface StopSignal {
  readonly stopping: boolean;
  stop(): void;
  sleep(ms: number): Promise<void>;
}

export function createStopSignal(): StopSignal {
  let stopping = false;
  const wakers = new Set<() => void>();
  return {
    get stopping() {
      return stopping;
    },
    stop() {
      stopping = true;
      for (const wake of wakers) wake();
      wakers.clear();
    },
    sleep(ms: number) {
      if (stopping) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => {
          clearTimeout(timer);
          wakers.delete(done);
          resolve();
        };
        const timer = setTimeout(done, ms);
        wakers.add(done);
      });
    },
  };
}

export interface RunLoopOptions {
  store: JobStore;
  handlers: Map<string, ClaimHandler>;
  heartbeat: () => Promise<void>;
  signal: StopSignal;
  onError?: (err: unknown) => void;
  /** Test seam; defaults to the real claim cycle. */
  runCycle?: (options: ClaimCycleOptions) => ReturnType<typeof runClaimCycle>;
}

/**
 * Claims and runs jobs until `signal` stops. A cycle in progress is never
 * interrupted: it finishes (or the process is cut by the entry point's hard
 * deadline and its job is redelivered after the lease, as before); no new
 * claim starts once stopping.
 */
export async function runLoop({
  store,
  handlers,
  heartbeat,
  signal,
  onError = () => undefined,
  runCycle = runClaimCycle,
}: RunLoopOptions): Promise<void> {
  let lastHeartbeatAt = 0;
  while (!signal.stopping) {
    try {
      // An idle worker is still alive. A stopped worker leaves a stale timestamp,
      // and a database outage prevents the heartbeat from being refreshed.
      if (Date.now() - lastHeartbeatAt >= 10_000) {
        await heartbeat();
        lastHeartbeatAt = Date.now();
      }
      const result = await runCycle({ store, handlers });
      if (result.claimed === 0) {
        await signal.sleep(1000);
      }
    } catch (err) {
      // A transient outage (database restart, network blip) must slow the
      // loop down and stay observable, never crash-loop or spin.
      onError(err);
      await signal.sleep(5000);
    }
  }
}
