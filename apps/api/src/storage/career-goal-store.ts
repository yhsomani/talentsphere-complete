import type pg from 'pg';
import type { CareerGoal } from '@talentsphere/domain';

/**
 * Career goals (plan TS-13, ADR-034, migration 00066): one row per person, the
 * role title they aim for. In pg mode SQL is the source of truth (TPD-05: new
 * modules read from SQL). Owner-scoped: only its person reads or changes it.
 */
export interface CareerGoalStore {
  get(userId: string): Promise<CareerGoal | null>;
  /** Sets or replaces the person's goal, keeping when it was first set. */
  set(userId: string, title: string, nowIso: string): Promise<CareerGoal>;
  /** Removes the goal; true when there was one. */
  clear(userId: string): Promise<boolean>;
  eraseUser(userId: string): Promise<void>;
}

export class MemoryCareerGoalStore implements CareerGoalStore {
  private readonly records = new Map<string, CareerGoal>();

  async get(userId: string): Promise<CareerGoal | null> {
    const goal = this.records.get(userId);
    return goal ? { ...goal } : null;
  }

  async set(userId: string, title: string, nowIso: string): Promise<CareerGoal> {
    const goal = {
      userId,
      title,
      createdAt: this.records.get(userId)?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };
    this.records.set(userId, goal);
    return { ...goal };
  }

  async clear(userId: string): Promise<boolean> {
    return this.records.delete(userId);
  }

  async eraseUser(userId: string): Promise<void> {
    this.records.delete(userId);
  }
}

interface Row {
  user_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

const fromRow = (row: Row): CareerGoal => ({
  userId: row.user_id,
  title: row.title,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
});

export class PgCareerGoalStore implements CareerGoalStore {
  constructor(private readonly pool: pg.Pool) {}

  async get(userId: string): Promise<CareerGoal | null> {
    const rows = await this.pool.query<Row>(
      'SELECT * FROM public.career_goals WHERE user_id = $1',
      [userId]
    );
    return rows.rows[0] ? fromRow(rows.rows[0]) : null;
  }

  async set(userId: string, title: string, nowIso: string): Promise<CareerGoal> {
    const rows = await this.pool.query<Row>(
      `INSERT INTO public.career_goals (user_id, title, created_at, updated_at)
       VALUES ($1, $2, $3, $3)
       ON CONFLICT (user_id) DO UPDATE SET title = EXCLUDED.title, updated_at = EXCLUDED.updated_at
       RETURNING *`,
      [userId, title, nowIso]
    );
    return fromRow(rows.rows[0]!);
  }

  async clear(userId: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM public.career_goals WHERE user_id = $1', [
      userId,
    ]);
    return (res.rowCount ?? 0) > 0;
  }

  async eraseUser(userId: string): Promise<void> {
    await this.clear(userId);
  }
}
