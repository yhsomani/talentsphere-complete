/**
 * Erasure-request lifecycle storage. PostgreSQL uses the existing migration
 * 00013 table; memory mode remains suitable for isolated tests only.
 * An automatic retention/deletion scheduler is NOT implemented here.
 */
import pg from 'pg';
import { DomainError, cancelAccountErasure, type DataErasureRequest } from '@talentsphere/domain';

export interface ErasureRequestStore {
  list(userId: string): Promise<DataErasureRequest[]>;
  create(request: DataErasureRequest): Promise<void>;
  cancel(userId: string, requestId: string): Promise<DataErasureRequest>;
  /**
   * Records that irreversible execution has started, BEFORE any destructive
   * step, so an interrupted run can be resumed. Moves the user's active
   * request (or an existing 'processing' one) to 'processing' and stores the
   * anonymized hash; with no request at all (immediate erasure) a 'processing'
   * row is created with `newId`. Idempotent.
   */
  beginExecution(
    userId: string,
    newId: string,
    startedAt: string,
    anonymizedHash: string
  ): Promise<DataErasureRequest>;
  completeActive(userId: string, completedAt: string, anonymizedHash: string): Promise<void>;
}

const isActive = (r: DataErasureRequest) => r.status === 'pending' || r.status === 'grace_period';
const isOpen = (r: DataErasureRequest) => isActive(r) || r.status === 'processing';

export class MemoryErasureRequestStore implements ErasureRequestStore {
  private readonly requests = new Map<string, DataErasureRequest>();

  async list(userId: string): Promise<DataErasureRequest[]> {
    return [...this.requests.values()]
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(request: DataErasureRequest): Promise<void> {
    if ((await this.list(request.userId)).some(isOpen)) {
      throw new DomainError('CONFLICT', 'An active erasure request already exists.');
    }
    this.requests.set(request.id, request);
  }

  async cancel(userId: string, id: string): Promise<DataErasureRequest> {
    const current = this.requests.get(id);
    if (!current) throw new DomainError('NOT_FOUND', 'Erasure request not found.');
    if (current.userId !== userId) {
      throw new DomainError('FORBIDDEN', 'Not authorized to cancel this request.');
    }
    const next = cancelAccountErasure(current);
    this.requests.set(id, next);
    return next;
  }

  async beginExecution(
    userId: string,
    newId: string,
    startedAt: string,
    anonymizedHash: string
  ): Promise<DataErasureRequest> {
    const open = (await this.list(userId)).filter(isOpen);
    const current = open.find((r) => r.status === 'processing') ?? open[0];
    const next: DataErasureRequest = current
      ? { ...current, status: 'processing', confirmedAt: current.confirmedAt ?? startedAt }
      : {
          id: newId,
          userId,
          status: 'processing',
          gracePeriodEndsAt: startedAt,
          confirmedAt: startedAt,
          createdAt: startedAt,
          updatedAt: startedAt,
        };
    // A retry before the account was erased re-derives the hash; keep the latest.
    this.requests.set(next.id, { ...next, anonymizedHash, updatedAt: startedAt });
    return this.requests.get(next.id)!;
  }

  async completeActive(userId: string, completedAt: string, anonymizedHash: string): Promise<void> {
    for (const request of await this.list(userId)) {
      if (isOpen(request)) {
        this.requests.set(request.id, {
          ...request,
          status: 'completed',
          completedAt,
          updatedAt: completedAt,
          anonymizedHash,
        });
      }
    }
  }
}

interface Row {
  id: string;
  user_id: string;
  status: DataErasureRequest['status'];
  reason: string | null;
  grace_period_ends_at: Date;
  confirmed_at: Date | null;
  cancelled_at: Date | null;
  completed_at: Date | null;
  anonymized_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

function toRequest(r: Row): DataErasureRequest {
  return {
    id: r.id,
    userId: r.user_id,
    status: r.status,
    reason: r.reason ?? undefined,
    gracePeriodEndsAt: new Date(r.grace_period_ends_at).toISOString(),
    confirmedAt: r.confirmed_at ? new Date(r.confirmed_at).toISOString() : undefined,
    cancelledAt: r.cancelled_at ? new Date(r.cancelled_at).toISOString() : undefined,
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
    anonymizedHash: r.anonymized_hash ?? undefined,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export class PgErasureRequestStore implements ErasureRequestStore {
  constructor(private readonly pool: pg.Pool) {}

  async list(userId: string): Promise<DataErasureRequest[]> {
    const result = await this.pool.query<Row>(
      'SELECT * FROM public.data_erasure_requests WHERE user_id = $1 ORDER BY created_at DESC, id',
      [userId]
    );
    return result.rows.map(toRequest);
  }

  async create(request: DataErasureRequest): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Serializes two requests per owner, including across application instances.
      const owner = await client.query('SELECT id FROM public.users WHERE id = $1 FOR UPDATE', [
        request.userId,
      ]);
      if (!owner.rowCount) {
        throw new DomainError('NOT_FOUND', 'Account for erasure not found.');
      }
      const existing = await client.query(
        "SELECT id FROM public.data_erasure_requests WHERE user_id = $1 AND status IN ('pending', 'grace_period', 'processing') LIMIT 1",
        [request.userId]
      );
      if (existing.rowCount) {
        throw new DomainError('CONFLICT', 'An active erasure request already exists.');
      }
      await client.query(
        'INSERT INTO public.data_erasure_requests (id, user_id, status, reason, grace_period_ends_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          request.id,
          request.userId,
          request.status,
          request.reason ?? null,
          request.gracePeriodEndsAt,
          request.createdAt,
          request.updatedAt,
        ]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async cancel(userId: string, id: string): Promise<DataErasureRequest> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query<Row>(
        'SELECT * FROM public.data_erasure_requests WHERE id = $1 FOR UPDATE',
        [id]
      );
      if (!result.rows[0]) throw new DomainError('NOT_FOUND', 'Erasure request not found.');
      const current = toRequest(result.rows[0]);
      if (current.userId !== userId) {
        throw new DomainError('FORBIDDEN', 'Not authorized to cancel this request.');
      }
      const next = cancelAccountErasure(current);
      await client.query(
        "UPDATE public.data_erasure_requests SET status = 'cancelled', cancelled_at = $2, updated_at = $2 WHERE id = $1",
        [id, next.cancelledAt]
      );
      await client.query('COMMIT');
      return next;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async beginExecution(
    userId: string,
    newId: string,
    startedAt: string,
    anonymizedHash: string
  ): Promise<DataErasureRequest> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Serializes concurrent executions for one owner across instances.
      const owner = await client.query('SELECT id FROM public.users WHERE id = $1 FOR UPDATE', [
        userId,
      ]);
      if (!owner.rowCount) throw new DomainError('NOT_FOUND', 'Account for erasure not found.');
      const open = await client.query<Row>(
        "SELECT * FROM public.data_erasure_requests WHERE user_id = $1 AND status IN ('pending', 'grace_period', 'processing') ORDER BY (status = 'processing') DESC, created_at DESC LIMIT 1 FOR UPDATE",
        [userId]
      );
      let row: Row | undefined;
      if (open.rows[0]) {
        const updated = await client.query<Row>(
          "UPDATE public.data_erasure_requests SET status = 'processing', confirmed_at = COALESCE(confirmed_at, $2), updated_at = $2, anonymized_hash = $3 WHERE id = $1 AND status IN ('pending', 'grace_period', 'processing') RETURNING *",
          [open.rows[0].id, startedAt, anonymizedHash]
        );
        row = updated.rows[0];
        if (!row) {
          throw new DomainError('CONFLICT', 'The erasure request changed state; retry.');
        }
      } else {
        const inserted = await client.query<Row>(
          "INSERT INTO public.data_erasure_requests (id, user_id, status, grace_period_ends_at, confirmed_at, anonymized_hash, created_at, updated_at) VALUES ($1, $2, 'processing', $3, $3, $4, $3, $3) RETURNING *",
          [newId, userId, startedAt, anonymizedHash]
        );
        row = inserted.rows[0];
      }
      await client.query('COMMIT');
      return toRequest(row!);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async completeActive(userId: string, completedAt: string, anonymizedHash: string): Promise<void> {
    await this.pool.query(
      "UPDATE public.data_erasure_requests SET status = 'completed', completed_at = $2, updated_at = $2, anonymized_hash = $3 WHERE user_id = $1 AND status IN ('pending', 'grace_period', 'processing')",
      [userId, completedAt, anonymizedHash]
    );
  }
}
