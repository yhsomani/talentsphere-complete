import type pg from 'pg';
import { createSavedJob, DomainError, type SavedJob } from '@talentsphere/domain';

/** Bookmarks are owner-scoped; PostgreSQL arbitrates duplicate requests. */
export interface SavedJobStore {
  list(userId: string): Promise<SavedJob[]>;
  add(userId: string, jobId: string): Promise<SavedJob>;
  remove(userId: string, jobId: string): Promise<void>;
  eraseUser(userId: string): Promise<void>;
}

export class MemorySavedJobStore implements SavedJobStore {
  private readonly byOwner = new Map<string, Map<string, SavedJob>>();

  async list(userId: string): Promise<SavedJob[]> {
    return [...(this.byOwner.get(userId)?.values() ?? [])];
  }

  async add(userId: string, jobId: string): Promise<SavedJob> {
    const saved = createSavedJob(userId, jobId, await this.list(userId));
    const items = this.byOwner.get(userId) ?? new Map<string, SavedJob>();
    items.set(jobId, saved);
    this.byOwner.set(userId, items);
    return saved;
  }

  async remove(userId: string, jobId: string): Promise<void> {
    if (!this.byOwner.get(userId)?.delete(jobId)) {
      throw new DomainError('NOT_FOUND', 'Saved job bookmark not found.');
    }
  }

  async eraseUser(userId: string): Promise<void> {
    this.byOwner.delete(userId);
  }
}

interface SavedRow {
  id: string;
  user_id: string;
  job_id: string;
  created_at: Date;
}

function toSavedJob(row: SavedRow): SavedJob {
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export class PgSavedJobStore implements SavedJobStore {
  constructor(private readonly pool: pg.Pool) {}

  async list(userId: string): Promise<SavedJob[]> {
    const result = await this.pool.query<SavedRow>(
      'SELECT * FROM public.saved_jobs WHERE user_id = $1 ORDER BY created_at, id',
      [userId]
    );
    return result.rows.map(toSavedJob);
  }

  async add(userId: string, jobId: string): Promise<SavedJob> {
    const saved = createSavedJob(userId, jobId, []);
    // A single atomic insert honors uq_saved_jobs_user_job under concurrency.
    const result = await this.pool.query<SavedRow>(
      `INSERT INTO public.saved_jobs (id, user_id, job_id, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, job_id) DO NOTHING RETURNING *`,
      [saved.id, saved.userId, saved.jobId, saved.createdAt]
    );
    if (!result.rowCount) {
      throw new DomainError('CONFLICT', 'Job is already saved in your bookmarks.');
    }
    return toSavedJob(result.rows[0]);
  }

  async remove(userId: string, jobId: string): Promise<void> {
    const result = await this.pool.query(
      'DELETE FROM public.saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );
    if (!result.rowCount) {
      throw new DomainError('NOT_FOUND', 'Saved job bookmark not found.');
    }
  }

  async eraseUser(userId: string): Promise<void> {
    await this.pool.query('DELETE FROM public.saved_jobs WHERE user_id = $1', [userId]);
  }
}
