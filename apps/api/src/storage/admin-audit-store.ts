import type pg from 'pg';
import type { AdminAuditLog } from '@talentsphere/domain';

export interface AdminAuditQuery {
  actorId?: string;
  eventName?: string;
  limit: number;
}

/** Append-only trail of administrator actions, newest first on read. */
export interface AdminAuditStore {
  append(log: AdminAuditLog): Promise<void>;
  list(query: AdminAuditQuery): Promise<AdminAuditLog[]>;
}

export class MemoryAdminAuditStore implements AdminAuditStore {
  private readonly logs: AdminAuditLog[] = [];

  async append(log: AdminAuditLog): Promise<void> {
    this.logs.unshift(log);
  }

  async list(query: AdminAuditQuery): Promise<AdminAuditLog[]> {
    return this.logs
      .filter((l) => !query.actorId || l.actorId === query.actorId)
      .filter((l) => !query.eventName || l.eventName === query.eventName)
      .slice(0, query.limit);
  }
}

interface AuditRow {
  id: string;
  event_name: string;
  actor_id: string;
  target_id: string | null;
  target_type: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}

function toAuditLog(row: AuditRow): AdminAuditLog {
  return {
    id: row.id,
    eventName: row.event_name,
    actorId: row.actor_id,
    targetId: row.target_id ?? undefined,
    targetType: row.target_type ?? undefined,
    metadata: row.metadata,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export class PgAdminAuditStore implements AdminAuditStore {
  constructor(private readonly pool: pg.Pool) {}

  async append(log: AdminAuditLog): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.admin_audit_logs
         (id, event_name, actor_id, target_id, target_type, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        log.id,
        log.eventName,
        log.actorId,
        log.targetId ?? null,
        log.targetType ?? null,
        JSON.stringify(log.metadata),
        log.createdAt,
      ]
    );
  }

  async list(query: AdminAuditQuery): Promise<AdminAuditLog[]> {
    const result = await this.pool.query<AuditRow>(
      `SELECT * FROM public.admin_audit_logs
       WHERE ($1::text IS NULL OR actor_id = $1)
         AND ($2::text IS NULL OR event_name = $2)
       ORDER BY created_at DESC, id DESC
       LIMIT $3`,
      [query.actorId ?? null, query.eventName ?? null, query.limit]
    );
    return result.rows.map(toAuditLog);
  }
}
