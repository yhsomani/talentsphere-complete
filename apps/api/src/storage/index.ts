import pg from 'pg';
import { MemoryJobStore, createPgJobStore, type JobStore } from '@talentsphere/domain';
import { MemoryCoreStore, PgCoreStore, type CoreStore } from './core-store.js';
import {
  MemoryAccountMetadataStore,
  PgAccountMetadataStore,
  type AccountMetadataStore,
} from './account-store.js';
import {
  MemoryErasureRequestStore,
  PgErasureRequestStore,
  type ErasureRequestStore,
} from './erasure-store.js';

export * from './core-store.js';
import {
  MemorySavedSearchStore,
  PgSavedSearchStore,
  type SavedSearchStore,
} from './saved-search-store.js';

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
  /**
   * Core-loop entities (users, profiles, organizations, jobs, applications,
   * evidence, work history) — ADR-015. Durable in pg mode only.
   */
  readonly core: CoreStore;
  readonly erasureRequests: ErasureRequestStore;
  readonly accountMetadata: AccountMetadataStore;
  readonly savedSearches: SavedSearchStore;
  /** Live round-trip check against the backing store — never cached, never assumed. */
  health(): Promise<StorageHealth>;
  /** Claim a session-level advisory lease before hydrating the in-memory read model. */
  acquireWriterLease(): Promise<void>;
  /** A lost lease must make the API refuse further traffic. */
  writerLeaseHealthy(): boolean;
  /** Measured worker liveness, not merely queue/database reachability. */
  workerHeartbeat(): Promise<{ alive: boolean; lastSeenAt: string | null }>;
  close(): Promise<void>;
}

/** Strips credentials from a DSN so it is safe to log. */
function redactDsn(dsn: string): string {
  return dsn.replace(/:[^:@/]*@/, ':***@');
}

class PgStorage implements Storage {
  readonly mode = 'pg' as const;
  readonly jobs: JobStore;
  readonly core: CoreStore;
  readonly erasureRequests: ErasureRequestStore;
  readonly accountMetadata: AccountMetadataStore;
  readonly savedSearches: SavedSearchStore;
  private readonly pool: pg.Pool;
  private readonly target: string;
  private writerLease: pg.PoolClient | null = null;
  private writerLeaseLost = false;
  private writerLeaseStarted = false;

  constructor(databaseUrl: string, encryptionKey?: string) {
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
    this.core = new PgCoreStore(this.pool);
    this.erasureRequests = new PgErasureRequestStore(this.pool);
    this.accountMetadata = new PgAccountMetadataStore(this.pool, encryptionKey);
    this.savedSearches = new PgSavedSearchStore(this.pool);
  }

  async acquireWriterLease(): Promise<void> {
    if (this.writerLeaseStarted) {
      throw new Error('The exclusive API writer lease was already initialized.');
    }
    this.writerLeaseStarted = true;
    const client = await this.pool.connect();
    try {
      // Advisory locks are scoped to THIS database and this retained session.
      // Lock key pair is reserved for the TalentSphere API read-model writer.
      const result = await client.query<{ acquired: boolean }>(
        'SELECT pg_try_advisory_lock(718201, 1) AS acquired'
      );
      if (!result.rows[0]?.acquired) {
        throw new Error(
          'A second API writer is already connected to this database. ' +
            'The hydrated read model supports one API instance only (ADR-015).'
        );
      }
      client.on('error', () => {
        this.writerLeaseLost = true;
      });
      client.on('end', () => {
        this.writerLeaseLost = true;
      });
      this.writerLease = client;
    } catch (error) {
      client.release();
      this.writerLeaseLost = true;
      throw error;
    }
  }

  writerLeaseHealthy(): boolean {
    return this.writerLeaseStarted && this.writerLease !== null && !this.writerLeaseLost;
  }

  async workerHeartbeat(): Promise<{ alive: boolean; lastSeenAt: string | null }> {
    try {
      const result = await this.pool.query<{
        last_seen_at: Date;
        age_seconds: number;
      }>(
        'SELECT last_seen_at, EXTRACT(EPOCH FROM (now() - last_seen_at))::float8 AS age_seconds FROM public.worker_health WHERE id = 1'
      );
      const row = result.rows[0];
      if (!row) return { alive: false, lastSeenAt: null };
      return {
        alive: row.age_seconds >= -5 && row.age_seconds <= 45,
        lastSeenAt: new Date(row.last_seen_at).toISOString(),
      };
    } catch {
      return { alive: false, lastSeenAt: null };
    }
  }

  async health(): Promise<StorageHealth> {
    const started = Date.now();
    if (this.writerLeaseStarted && !this.writerLeaseHealthy()) {
      return {
        ok: false,
        latencyMs: null,
        detail: 'Exclusive API writer lease lost; restart required.',
      };
    }
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
    const lease = this.writerLease;
    this.writerLease = null;
    if (lease) {
      try {
        if (!this.writerLeaseLost) {
          await lease.query('SELECT pg_advisory_unlock(718201, 1)');
        }
      } finally {
        lease.release();
      }
    }
    await this.pool.end();
  }
}

class MemoryStorage implements Storage {
  readonly mode = 'memory' as const;
  readonly jobs: JobStore = new MemoryJobStore();
  readonly core: CoreStore = new MemoryCoreStore();
  readonly erasureRequests: ErasureRequestStore = new MemoryErasureRequestStore();
  readonly accountMetadata: AccountMetadataStore = new MemoryAccountMetadataStore();
  readonly savedSearches: SavedSearchStore = new MemorySavedSearchStore();

  health(): Promise<StorageHealth> {
    return Promise.resolve({
      ok: false,
      latencyMs: null,
      detail: 'in-memory storage (STORAGE=memory): no database; data is lost on restart',
    });
  }

  async acquireWriterLease(): Promise<void> {
    // Memory storage has no database and is only allowed in tests/development.
  }

  writerLeaseHealthy(): boolean {
    return true;
  }

  async workerHeartbeat(): Promise<{ alive: boolean; lastSeenAt: string | null }> {
    return { alive: false, lastSeenAt: null };
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
  BYO_AI_KEY_ENCRYPTION_KEY?: string;
}): Storage {
  const fromProcess =
    process.env.STORAGE === 'pg' || process.env.STORAGE === 'memory'
      ? process.env.STORAGE
      : undefined;
  const mode: StorageMode =
    env.STORAGE ?? fromProcess ?? (env.NODE_ENV === 'test' ? 'memory' : 'pg');
  return mode === 'pg'
    ? new PgStorage(env.DATABASE_URL, env.BYO_AI_KEY_ENCRYPTION_KEY)
    : new MemoryStorage();
}
