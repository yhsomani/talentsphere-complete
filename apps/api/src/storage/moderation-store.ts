import type pg from 'pg';
import type { ModerationAppeal, ModerationReport } from '@talentsphere/domain';

/**
 * Moderation reports and appeals (F-24, migrations 00017 and 00064; plan
 * TS-03, ADR-026). The API keeps them in Maps as a read model; this store is
 * the write-through source of truth the Maps are rebuilt from at boot. Writes
 * go here first, then to the Maps. Pending ban proposals (BR-068) stay in
 * memory: after a restart a ban needs proposing again, which fails closed.
 */
export interface ModerationStore {
  loadAll(): Promise<{ reports: ModerationReport[]; appeals: ModerationAppeal[] }>;
  saveReport(report: ModerationReport): Promise<void>;
  saveAppeal(appeal: ModerationAppeal): Promise<void>;
  /** One transaction: a reviewed appeal and, when upheld, the report it reverses. */
  saveAppealReview(appeal: ModerationAppeal, report?: ModerationReport): Promise<void>;
}

/** Memory mode keeps nothing across restarts; the Maps in server.ts are the data. */
export class MemoryModerationStore implements ModerationStore {
  async loadAll() {
    return { reports: [], appeals: [] };
  }
  async saveReport(): Promise<void> {}
  async saveAppeal(): Promise<void> {}
  async saveAppealReview(): Promise<void> {}
}

type Db = Pick<pg.PoolClient, 'query'>;
type Row = Record<string, any>;

const iso = (d: Date | string) => new Date(d).toISOString();
const isoOrUndefined = (d: Date | string | null) => (d ? iso(d) : undefined);

async function upsertReport(db: Db, r: ModerationReport): Promise<void> {
  await db.query(
    `INSERT INTO public.moderation_reports
       (id, reporter_id, target_type, target_id, reason, details, status, severity,
        action_taken, resolved_by, resolved_at, resolution_notes, appeal_eligible_until,
        created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     ON CONFLICT (id) DO UPDATE SET
       status = EXCLUDED.status, severity = EXCLUDED.severity,
       action_taken = EXCLUDED.action_taken, resolved_by = EXCLUDED.resolved_by,
       resolved_at = EXCLUDED.resolved_at, resolution_notes = EXCLUDED.resolution_notes,
       appeal_eligible_until = EXCLUDED.appeal_eligible_until, updated_at = EXCLUDED.updated_at`,
    [
      r.id,
      r.reporterId,
      r.targetType,
      r.targetId,
      r.reason,
      r.details ?? null,
      r.status,
      r.severity,
      r.actionTaken,
      r.resolvedBy ?? null,
      r.resolvedAt ?? null,
      r.resolutionNotes ?? null,
      r.appealEligibleUntil ?? null,
      r.createdAt,
      r.updatedAt,
    ]
  );
}

async function upsertAppeal(db: Db, a: ModerationAppeal): Promise<void> {
  await db.query(
    `INSERT INTO public.moderation_appeals
       (id, report_id, appellant_id, reason, status, reviewed_by, reviewed_at, decision_notes,
        created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO UPDATE SET
       status = EXCLUDED.status, reviewed_by = EXCLUDED.reviewed_by,
       reviewed_at = EXCLUDED.reviewed_at, decision_notes = EXCLUDED.decision_notes,
       updated_at = EXCLUDED.updated_at`,
    [
      a.id,
      a.reportId,
      a.appellantId,
      a.reason,
      a.status,
      a.reviewedBy ?? null,
      a.reviewedAt ?? null,
      a.decisionNotes ?? null,
      a.createdAt,
      a.updatedAt,
    ]
  );
}

export class PgModerationStore implements ModerationStore {
  constructor(private readonly pool: pg.Pool) {}

  async loadAll() {
    const q = (sql: string) => this.pool.query<Row>(sql).then((r) => r.rows);
    const [reports, appeals] = await Promise.all([
      q('SELECT * FROM public.moderation_reports ORDER BY created_at, id'),
      q('SELECT * FROM public.moderation_appeals ORDER BY created_at, id'),
    ]);
    return {
      reports: reports.map((r): ModerationReport => ({
        id: r.id,
        reporterId: r.reporter_id,
        targetType: r.target_type,
        targetId: r.target_id,
        reason: r.reason,
        details: r.details ?? undefined,
        status: r.status,
        severity: r.severity,
        actionTaken: r.action_taken,
        resolvedBy: r.resolved_by ?? undefined,
        resolvedAt: isoOrUndefined(r.resolved_at),
        resolutionNotes: r.resolution_notes ?? undefined,
        appealEligibleUntil: isoOrUndefined(r.appeal_eligible_until),
        createdAt: iso(r.created_at),
        updatedAt: iso(r.updated_at),
      })),
      appeals: appeals.map((a): ModerationAppeal => ({
        id: a.id,
        reportId: a.report_id,
        appellantId: a.appellant_id,
        reason: a.reason,
        status: a.status,
        reviewedBy: a.reviewed_by ?? undefined,
        reviewedAt: isoOrUndefined(a.reviewed_at),
        decisionNotes: a.decision_notes ?? undefined,
        createdAt: iso(a.created_at),
        updatedAt: iso(a.updated_at),
      })),
    };
  }

  async saveReport(report: ModerationReport): Promise<void> {
    await upsertReport(this.pool, report);
  }

  async saveAppeal(appeal: ModerationAppeal): Promise<void> {
    await upsertAppeal(this.pool, appeal);
  }

  async saveAppealReview(appeal: ModerationAppeal, report?: ModerationReport): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await upsertAppeal(client, appeal);
      if (report) await upsertReport(client, report);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }
}
