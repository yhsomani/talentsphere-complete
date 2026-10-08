import pg from 'pg';
import { MemoryJobStore, createPgJobStore, type JobStore } from '@talentsphere/domain';

// Phase 1 (production audit): the API's only persistence boundary. Two modes,
// both honest:
//   pg     — real Postgres; boot fails fast when the database is unreachable.
//   memory — the extracted in-process Maps; explicitly opt-in, non-durable,
//            and reported as "no database" wherever health is measured.
// There is deliberately no automatic fallback from pg to memory: losing the
// database must be visible, never silent.

export type StorageMode = 'pg' | 'memory';

export interface StorageHealth {
  ok: boolean;
  latencyMs: number | null;
  detail: string;
}

export interface Storage {
  readonly mode: StorageMode;
  /**
   * Background-job store (SSOT §27.1 ADR-009): durable in pg mode, in-process
   * in memory mode — same honesty rule as entity data.
   */
  readonly jobs: JobStore;
  /** Live round-trip check against the backing store — never cached, never assumed. */
  health(): Promise<StorageHealth>;
  close(): Promise<void>;
}

/** Strips credentials from a DSN so it is safe to log. */
function redactDsn(dsn: string): string {
  return dsn.replace(/:[^:@/]*@/, ':***@');
}

class PgStorage implements Storage {
  readonly mode = 'pg' as const;
  readonly jobs: JobStore;
  private readonly pool: pg.Pool;
  private readonly target: string;

  constructor(databaseUrl: string) {
    this.target = redactDsn(databaseUrl);
    this.pool = new pg.Pool({
      connectionString: databaseUrl,
      // Fail fast: an unreachable host must not hang the boot check.
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30_000,
    });
    // Idle clients die on restarts and network blips; without a listener the
    // pool's 'error' event would crash the process.
    this.pool.on('error', (err: Error) => {
      console.error(`[storage] idle postgres client error: ${err.message}`);
    });
    // One pool, one boundary: dispatch enqueues and health checks share it.
    this.jobs = createPgJobStore((sql, params) => this.pool.query(sql, params));
  }

  async health(): Promise<StorageHealth> {
    const started = Date.now();
    try {
      await this.pool.query('SELECT 1');
      const latencyMs = Date.now() - started;
      return { ok: true, latencyMs, detail: `${this.target} (SELECT 1 in ${latencyMs}ms)` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, latencyMs: null, detail: `${this.target}: ${message}` };
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

class MemoryStorage implements Storage {
  readonly mode = 'memory' as const;
  readonly jobs: JobStore = new MemoryJobStore();

  health(): Promise<StorageHealth> {
    return Promise.resolve({
      ok: false,
      latencyMs: null,
      detail: 'in-memory storage (STORAGE=memory): no database; data is lost on restart',
    });
  }

  async close(): Promise<void> {
    // Nothing to close.
  }
}

/**
 * Resolution order: explicit env.STORAGE → process.env.STORAGE (buildApp
 * calls with a partial env do not carry it) → NODE_ENV, so the vitest suite
 * runs without a database while every other environment defaults to pg.
 */
export function createStorage(env: {
  STORAGE?: StorageMode;
  DATABASE_URL: string;
  NODE_ENV: string;
}): Storage {
  const fromProcess =
    process.env.STORAGE === 'pg' || process.env.STORAGE === 'memory'
      ? process.env.STORAGE
      : undefined;
  const mode: StorageMode =
    env.STORAGE ?? fromProcess ?? (env.NODE_ENV === 'test' ? 'memory' : 'pg');
  return mode === 'pg' ? new PgStorage(env.DATABASE_URL) : new MemoryStorage();
}
