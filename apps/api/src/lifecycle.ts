import type { FastifyInstance } from 'fastify';

export type ShutdownReason = 'SIGTERM' | 'SIGINT' | 'lease_lost';

export interface ShutdownOptions {
  exit?: (code: number) => void;
  /**
   * In-process drain budget. Below Docker's default 10 s stop grace period,
   * so the process exits on its own before it would be SIGKILLed (C-08).
   */
  closeTimeoutMs?: number;
  log?: (level: 'info' | 'fatal', message: string) => void;
}

/**
 * Process shutdown for the API (C-07, C-08). Idempotent: the first reason
 * wins and later calls are ignored. Closes the app (Fastify stops accepting
 * requests, in-flight ones finish, onClose releases the writer lease and the
 * pool) within `closeTimeoutMs`, then exits: 0 for a signal, 1 when the
 * writer lease was lost so the supervisor restarts the service.
 */
export function createShutdown(
  getApp: () => FastifyInstance | undefined,
  {
    exit = (code) => process.exit(code),
    closeTimeoutMs = 8000,
    log = (level, message) => console[level === 'fatal' ? 'error' : 'log'](message),
  }: ShutdownOptions = {}
): (reason: ShutdownReason) => Promise<void> {
  let started = false;
  return async (reason) => {
    if (started) return;
    started = true;
    if (reason === 'lease_lost') {
      log('fatal', 'API writer lease lost: shutting down so the service is restarted (C-07)');
    } else {
      log('info', `${reason} received: shutting down the API`);
    }
    const app = getApp();
    if (app) {
      let timer: NodeJS.Timeout | undefined;
      const deadline = new Promise<void>((resolve) => {
        timer = setTimeout(resolve, closeTimeoutMs);
      });
      try {
        await Promise.race([app.close(), deadline]);
      } catch (err) {
        log('fatal', `API close failed: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        clearTimeout(timer);
      }
    }
    exit(reason === 'lease_lost' ? 1 : 0);
  };
}
