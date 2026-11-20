import { describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createShutdown } from '../../apps/api/src/lifecycle.js';

// C-07 / C-08: the API entry point shuts down on SIGTERM/SIGINT (exit 0) and
// when the writer lease is lost (exit 1, so the supervisor restarts it),
// closing the app first within a deadline below Docker's 10 s grace period.
function fakeApp(close: () => Promise<void> = async () => undefined) {
  return { close: vi.fn(close) } as unknown as FastifyInstance & {
    close: ReturnType<typeof vi.fn>;
  };
}
const quiet = () => undefined;

describe('API shutdown (C-07, C-08)', () => {
  it('lease loss closes the app, then exits 1 — once, even if fired twice', async () => {
    const app = fakeApp();
    const exit = vi.fn();
    const shutdown = createShutdown(() => app, { exit, log: quiet });
    await Promise.all([shutdown('lease_lost'), shutdown('lease_lost')]);
    expect(app.close).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('SIGTERM closes the app and exits 0; a later signal is ignored', async () => {
    const order: string[] = [];
    const app = fakeApp(async () => {
      order.push('close');
    });
    const exit = vi.fn(() => order.push('exit'));
    const shutdown = createShutdown(() => app, { exit, log: quiet });
    await shutdown('SIGTERM');
    await shutdown('SIGINT');
    expect(order).toEqual(['close', 'exit']);
    expect(exit).toHaveBeenCalledWith(0);
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('still exits when close() hangs past the deadline', async () => {
    vi.useFakeTimers();
    try {
      const app = fakeApp(() => new Promise<void>(() => undefined));
      const exit = vi.fn();
      const done = createShutdown(() => app, { exit, log: quiet, closeTimeoutMs: 8000 })('SIGTERM');
      await vi.advanceTimersByTimeAsync(7999);
      expect(exit).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      await done;
      expect(exit).toHaveBeenCalledWith(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('exits without an app when the signal arrives during boot', async () => {
    const exit = vi.fn();
    await createShutdown(() => undefined, { exit, log: quiet })('SIGINT');
    expect(exit).toHaveBeenCalledWith(0);
  });

  it('logs lease loss at fatal and signals at info', async () => {
    const log = vi.fn();
    await createShutdown(() => fakeApp(), { exit: quiet, log })('lease_lost');
    await createShutdown(() => fakeApp(), { exit: quiet, log })('SIGTERM');
    expect(log.mock.calls.map(([level]) => level)).toEqual(['fatal', 'info']);
  });
});
