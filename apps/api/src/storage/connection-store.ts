import type pg from 'pg';
import { DomainError, type Connection } from '@talentsphere/domain';

/**
 * Professional connections (F-09, migrations 00010 and 00057). The API keeps
 * connections in Maps as a read model (many profile-visibility checks read
 * them synchronously); this store is the write-through source of truth that
 * the Maps are rebuilt from at boot. Writes go here first, then to the Maps.
 */
export interface ConnectionStore {
  /** Every connection, oldest first. */
  loadAll(): Promise<Connection[]>;
  /** CONFLICT when an open (pending or accepted) connection already joins the pair. */
  insert(connection: Connection): Promise<void>;
  /** CONFLICT when the row changed since `previousUpdatedAt` was read. */
  update(connection: Connection, previousUpdatedAt: string): Promise<void>;
  remove(id: string): Promise<void>;
  /** Deletes every connection the user sent or received. */
  eraseUser(userId: string): Promise<void>;
}

const pairTaken = () =>
  new DomainError('CONFLICT', 'A connection already exists between these users.');
const changed = () =>
  new DomainError('CONFLICT', 'Connection changed since it was read. Reload and try again.');

/** Memory mode keeps nothing across restarts; the Maps in server.ts are the data. */
export class MemoryConnectionStore implements ConnectionStore {
  async loadAll(): Promise<Connection[]> {
    return [];
  }
  async insert(): Promise<void> {}
  async update(): Promise<void> {}
  async remove(): Promise<void> {}
  async eraseUser(): Promise<void> {}
}

interface Row {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: Connection['status'];
  note: string | null;
  accepted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function fromRow(row: Row): Connection {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    status: row.status,
    note: row.note ?? undefined,
    acceptedAt: row.accepted_at ? new Date(row.accepted_at).toISOString() : undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export class PgConnectionStore implements ConnectionStore {
  constructor(private readonly pool: pg.Pool) {}

  async loadAll(): Promise<Connection[]> {
    const rows = await this.pool.query<Row>(
      'SELECT * FROM public.connections ORDER BY created_at, id'
    );
    return rows.rows.map(fromRow);
  }

  async insert(c: Connection): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO public.connections
           (id, sender_id, recipient_id, status, note, accepted_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          c.id,
          c.senderId,
          c.recipientId,
          c.status,
          c.note ?? null,
          c.acceptedAt ?? null,
          c.createdAt,
          c.updatedAt,
        ]
      );
    } catch (error) {
      // uq_connections_open_pair: a second open request for the same pair,
      // in either direction, raced past the in-memory check.
      if ((error as { code?: string }).code === '23505') throw pairTaken();
      throw error;
    }
  }

  async update(c: Connection, previousUpdatedAt: string): Promise<void> {
    const rows = await this.pool.query(
      `UPDATE public.connections
       SET status = $2, note = $3, accepted_at = $4, updated_at = $5
       WHERE id = $1 AND updated_at = $6::timestamptz`,
      [c.id, c.status, c.note ?? null, c.acceptedAt ?? null, c.updatedAt, previousUpdatedAt]
    );
    if (!rows.rowCount) throw changed();
  }

  async remove(id: string): Promise<void> {
    await this.pool.query('DELETE FROM public.connections WHERE id = $1', [id]);
  }

  async eraseUser(userId: string): Promise<void> {
    await this.pool.query(
      'DELETE FROM public.connections WHERE sender_id = $1 OR recipient_id = $1',
      [userId]
    );
  }
}
