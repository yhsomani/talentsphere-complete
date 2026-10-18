import type pg from 'pg';
import { DomainError, MAX_ACTIVE_SAVED_SEARCHES, type SavedSearch } from '@talentsphere/domain';

/** Saved-search CRUD is immediately authoritative in SQL in pg mode. */
export interface SavedSearchStore {
  listAll(): Promise<SavedSearch[]>;
  listByUser(userId: string): Promise<SavedSearch[]>;
  get(id: string): Promise<SavedSearch | null>;
  create(search: SavedSearch): Promise<void>;
  update(search: SavedSearch, previousUpdatedAt: string): Promise<SavedSearch>;
  remove(id: string, userId: string): Promise<void>;
  eraseUser(userId: string): Promise<void>;
}

export class MemorySavedSearchStore implements SavedSearchStore {
  private readonly records = new Map<string, SavedSearch>();

  async listAll(): Promise<SavedSearch[]> {
    return [...this.records.values()];
  }
  async listByUser(userId: string): Promise<SavedSearch[]> {
    return [...this.records.values()].filter((item) => item.userId === userId);
  }
  async get(id: string): Promise<SavedSearch | null> {
    return this.records.get(id) ?? null;
  }
  async create(search: SavedSearch): Promise<void> {
    const active = (await this.listByUser(search.userId)).filter((item) => item.isActive);
    if (active.length >= MAX_ACTIVE_SAVED_SEARCHES) {
      throw new DomainError('VALIDATION_FAILED', 'Too many active saved searches.');
    }
    if (this.records.has(search.id)) {
      throw new DomainError('CONFLICT', 'Saved search already exists.');
    }
    this.records.set(search.id, search);
  }
  async update(search: SavedSearch, previousUpdatedAt: string): Promise<SavedSearch> {
    const current = this.records.get(search.id);
    if (!current || current.userId !== search.userId || current.updatedAt !== previousUpdatedAt) {
      throw new DomainError('CONFLICT', 'Saved search changed; reload before editing.');
    }
    this.records.set(search.id, search);
    return search;
  }
  async remove(id: string, userId: string): Promise<void> {
    if (this.records.get(id)?.userId !== userId) {
      throw new DomainError('NOT_FOUND', 'Saved search not found.');
    }
    this.records.delete(id);
  }
  async eraseUser(userId: string): Promise<void> {
    for (const item of await this.listByUser(userId)) this.records.delete(item.id);
  }
}

interface Row {
  id: string;
  user_id: string;
  title: string;
  query: string | null;
  location: string | null;
  work_mode: SavedSearch['criteria']['workMode'] | null;
  job_type: SavedSearch['criteria']['jobType'] | null;
  required_skill_ids: string[] | null;
  salary_min_minor: string | number | null;
  alert_frequency: SavedSearch['alertFrequency'];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

function fromRow(row: Row): SavedSearch {
  const minimum = row.salary_min_minor == null ? undefined : Number(row.salary_min_minor);
  if (minimum !== undefined && !Number.isSafeInteger(minimum)) {
    throw new Error('Invalid saved search salary bound; cannot safely represent as a number.');
  }
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    criteria: {
      query: row.query ?? undefined,
      location: row.location ?? undefined,
      workMode: row.work_mode ?? undefined,
      jobType: row.job_type ?? undefined,
      requiredSkillIds: row.required_skill_ids?.length ? row.required_skill_ids : undefined,
      salaryMinMinor: minimum,
    },
    alertFrequency: row.alert_frequency,
    isActive: row.is_active,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export class PgSavedSearchStore implements SavedSearchStore {
  constructor(private readonly pool: pg.Pool) {}

  async listAll(): Promise<SavedSearch[]> {
    const rows = await this.pool.query<Row>(
      'SELECT * FROM public.saved_searches ORDER BY created_at, id'
    );
    return rows.rows.map(fromRow);
  }

  async listByUser(userId: string): Promise<SavedSearch[]> {
    const rows = await this.pool.query<Row>(
      'SELECT * FROM public.saved_searches WHERE user_id = $1 ORDER BY created_at, id',
      [userId]
    );
    return rows.rows.map(fromRow);
  }

  async get(id: string): Promise<SavedSearch | null> {
    const rows = await this.pool.query<Row>('SELECT * FROM public.saved_searches WHERE id = $1', [
      id,
    ]);
    return rows.rows[0] ? fromRow(rows.rows[0]) : null;
  }

  async create(search: SavedSearch): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // A row lock on the owner serializes the 20-active-search limit,
      // including requests racing across app processes.
      const owner = await client.query('SELECT id FROM public.users WHERE id = $1 FOR UPDATE', [
        search.userId,
      ]);
      if (!owner.rowCount) throw new DomainError('NOT_FOUND', 'Saved search owner not found.');
      const active = await client.query<{ n: string }>(
        'SELECT count(*)::text AS n FROM public.saved_searches WHERE user_id = $1 AND is_active = true',
        [search.userId]
      );
      if (Number(active.rows[0]?.n ?? 0) >= MAX_ACTIVE_SAVED_SEARCHES) {
        throw new DomainError('VALIDATION_FAILED', 'Too many active saved searches.');
      }
      const c = search.criteria;
      await client.query(
        `INSERT INTO public.saved_searches (
          id, user_id, title, query, location, work_mode, job_type,
          required_skill_ids, salary_min_minor, alert_frequency, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          search.id,
          search.userId,
          search.title,
          c.query ?? null,
          c.location ?? null,
          c.workMode ?? null,
          c.jobType ?? null,
          c.requiredSkillIds ?? [],
          c.salaryMinMinor ?? null,
          search.alertFrequency,
          search.isActive,
          search.createdAt,
          search.updatedAt,
        ]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(search: SavedSearch, previousUpdatedAt: string): Promise<SavedSearch> {
    const c = search.criteria;
    const rows = await this.pool.query<Row>(
      `UPDATE public.saved_searches
       SET title = $3, query = $4, location = $5, work_mode = $6, job_type = $7,
           required_skill_ids = $8, salary_min_minor = $9, alert_frequency = $10,
           is_active = $11,
           updated_at = GREATEST($12::timestamptz, updated_at + interval '1 millisecond')
       WHERE id = $1 AND user_id = $2 AND updated_at = $13::timestamptz
       RETURNING *`,
      [
        search.id,
        search.userId,
        search.title,
        c.query ?? null,
        c.location ?? null,
        c.workMode ?? null,
        c.jobType ?? null,
        c.requiredSkillIds ?? [],
        c.salaryMinMinor ?? null,
        search.alertFrequency,
        search.isActive,
        search.updatedAt,
        previousUpdatedAt,
      ]
    );
    if (!rows.rowCount) {
      throw new DomainError('CONFLICT', 'Saved search changed; reload before editing.');
    }
    return fromRow(rows.rows[0]);
  }

  async remove(id: string, userId: string): Promise<void> {
    const rows = await this.pool.query(
      'DELETE FROM public.saved_searches WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!rows.rowCount) {
      throw new DomainError('NOT_FOUND', 'Saved search no longer exists.');
    }
  }

  async eraseUser(userId: string): Promise<void> {
    // Existing ON DELETE CASCADE also removes dependent job alerts.
    await this.pool.query('DELETE FROM public.saved_searches WHERE user_id = $1', [userId]);
  }
}
