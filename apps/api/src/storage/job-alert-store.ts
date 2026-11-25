import type pg from 'pg';
import { DomainError, type JobAlert } from '@talentsphere/domain';

/**
 * Job alerts (F-32, migration 00018): one row per saved-search match of a newly
 * published job. In pg mode SQL is the source of truth, so alerts survive an
 * API restart. Alerts are owner-scoped: only their candidate reads or marks them.
 */
export interface JobAlertStore {
  /** The owner's alerts, newest first. */
  listByUser(userId: string): Promise<JobAlert[]>;
  /** Stores alerts generated for one publish event, all or none. */
  createMany(alerts: JobAlert[]): Promise<void>;
  /** Marks the owner's alert read. NOT_FOUND when missing, FORBIDDEN for others. */
  markRead(id: string, userId: string): Promise<JobAlert>;
  eraseUser(userId: string): Promise<void>;
}

const newestFirst = (a: JobAlert, b: JobAlert) =>
  b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);

const notFound = (id: string) =>
  new DomainError('NOT_FOUND', `Job alert with ID "${id}" not found.`);
const forbidden = () => new DomainError('FORBIDDEN', 'Access denied to this alert.');
// Alert ids come from the URL; a malformed one names no row (404, not a SQL error).
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class MemoryJobAlertStore implements JobAlertStore {
  private readonly records = new Map<string, JobAlert>();

  async listByUser(userId: string): Promise<JobAlert[]> {
    return [...this.records.values()]
      .filter((alert) => alert.userId === userId)
      .map((alert) => ({ ...alert }))
      .sort(newestFirst);
  }

  async createMany(alerts: JobAlert[]): Promise<void> {
    for (const alert of alerts) this.records.set(alert.id, { ...alert });
  }

  async markRead(id: string, userId: string): Promise<JobAlert> {
    const alert = this.records.get(id);
    if (!alert) throw notFound(id);
    if (alert.userId !== userId) throw forbidden();
    alert.isRead = true;
    return { ...alert };
  }

  async eraseUser(userId: string): Promise<void> {
    for (const [id, alert] of this.records) {
      if (alert.userId === userId) this.records.delete(id);
    }
  }
}

interface Row {
  id: string;
  user_id: string;
  saved_search_id: string;
  job_id: string;
  is_read: boolean;
  delivered_at: Date;
  created_at: Date;
}

function fromRow(row: Row): JobAlert {
  return {
    id: row.id,
    userId: row.user_id,
    savedSearchId: row.saved_search_id,
    jobId: row.job_id,
    isRead: row.is_read,
    deliveredAt: new Date(row.delivered_at).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export class PgJobAlertStore implements JobAlertStore {
  constructor(private readonly pool: pg.Pool) {}

  async listByUser(userId: string): Promise<JobAlert[]> {
    const rows = await this.pool.query<Row>(
      'SELECT * FROM public.job_alerts WHERE user_id = $1 ORDER BY created_at DESC, id DESC',
      [userId]
    );
    return rows.rows.map(fromRow);
  }

  async createMany(alerts: JobAlert[]): Promise<void> {
    if (!alerts.length) return;
    // One statement, so a publish never stores half its alerts. The join keeps
    // only alerts whose saved search still exists for that owner: a search
    // deleted (or an account erased) after matching drops its alert instead of
    // failing everyone else's with a foreign-key error.
    await this.pool.query(
      `INSERT INTO public.job_alerts
         (id, user_id, saved_search_id, job_id, is_read, delivered_at, created_at)
       SELECT a.id, a.user_id, a.saved_search_id, a.job_id, a.is_read, a.delivered_at, a.created_at
       FROM unnest($1::uuid[], $2::uuid[], $3::uuid[], $4::uuid[], $5::boolean[],
                   $6::timestamptz[], $7::timestamptz[])
            AS a(id, user_id, saved_search_id, job_id, is_read, delivered_at, created_at)
       JOIN public.saved_searches s ON s.id = a.saved_search_id AND s.user_id = a.user_id`,
      [
        alerts.map((a) => a.id),
        alerts.map((a) => a.userId),
        alerts.map((a) => a.savedSearchId),
        alerts.map((a) => a.jobId),
        alerts.map((a) => a.isRead),
        alerts.map((a) => a.deliveredAt),
        alerts.map((a) => a.createdAt),
      ]
    );
  }

  async markRead(id: string, userId: string): Promise<JobAlert> {
    if (!UUID.test(id)) throw notFound(id);
    const updated = await this.pool.query<Row>(
      'UPDATE public.job_alerts SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    if (updated.rows[0]) return fromRow(updated.rows[0]);
    const exists = await this.pool.query('SELECT 1 FROM public.job_alerts WHERE id = $1', [id]);
    throw exists.rowCount ? forbidden() : notFound(id);
  }

  async eraseUser(userId: string): Promise<void> {
    await this.pool.query('DELETE FROM public.job_alerts WHERE user_id = $1', [userId]);
  }
}
