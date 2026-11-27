import type pg from 'pg';
import type {
  FileContentType,
  FilePurpose,
  FileScanStatus,
  StoredFile,
} from '@talentsphere/domain';

/** Metadata of uploaded files (ADR-020, migration 00059). The bytes live in the ObjectStore. */
export interface FileStore {
  create(file: StoredFile): Promise<void>;
  get(id: string): Promise<StoredFile | null>;
  listByOwner(ownerId: string): Promise<StoredFile[]>;
  countByOwner(ownerId: string): Promise<number>;
  delete(id: string): Promise<void>;
  /** Removes every row of the owner and returns what was removed, so the objects can go too. */
  eraseOwner(ownerId: string): Promise<StoredFile[]>;
}

export class MemoryFileStore implements FileStore {
  private readonly byId = new Map<string, StoredFile>();

  async create(file: StoredFile): Promise<void> {
    this.byId.set(file.id, { ...file });
  }

  async get(id: string): Promise<StoredFile | null> {
    const file = this.byId.get(id);
    return file ? { ...file } : null;
  }

  async listByOwner(ownerId: string): Promise<StoredFile[]> {
    return [...this.byId.values()]
      .filter((f) => f.ownerId === ownerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async countByOwner(ownerId: string): Promise<number> {
    return (await this.listByOwner(ownerId)).length;
  }

  async delete(id: string): Promise<void> {
    this.byId.delete(id);
  }

  async eraseOwner(ownerId: string): Promise<StoredFile[]> {
    const removed = await this.listByOwner(ownerId);
    for (const f of removed) this.byId.delete(f.id);
    return removed;
  }
}

interface FileRow {
  id: string;
  owner_id: string;
  purpose: string;
  content_type: string;
  size_bytes: string | number;
  sha256: string;
  original_name: string;
  storage_key: string;
  scan_status: string;
  created_at: Date;
}

function toFile(row: FileRow): StoredFile {
  return {
    id: row.id,
    ownerId: row.owner_id,
    purpose: row.purpose as FilePurpose,
    contentType: row.content_type as FileContentType,
    sizeBytes: Number(row.size_bytes),
    sha256: row.sha256,
    originalName: row.original_name,
    storageKey: row.storage_key,
    scanStatus: row.scan_status as FileScanStatus,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export class PgFileStore implements FileStore {
  constructor(private readonly pool: pg.Pool) {}

  async create(f: StoredFile): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.files
         (id, owner_id, purpose, content_type, size_bytes, sha256, original_name, storage_key, scan_status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        f.id,
        f.ownerId,
        f.purpose,
        f.contentType,
        f.sizeBytes,
        f.sha256,
        f.originalName,
        f.storageKey,
        f.scanStatus,
        f.createdAt,
      ]
    );
  }

  async get(id: string): Promise<StoredFile | null> {
    const result = await this.pool.query<FileRow>('SELECT * FROM public.files WHERE id = $1', [id]);
    return result.rows[0] ? toFile(result.rows[0]) : null;
  }

  async listByOwner(ownerId: string): Promise<StoredFile[]> {
    const result = await this.pool.query<FileRow>(
      'SELECT * FROM public.files WHERE owner_id = $1 ORDER BY created_at DESC, id',
      [ownerId]
    );
    return result.rows.map(toFile);
  }

  async countByOwner(ownerId: string): Promise<number> {
    const result = await this.pool.query<{ n: string }>(
      'SELECT count(*) AS n FROM public.files WHERE owner_id = $1',
      [ownerId]
    );
    return Number(result.rows[0]?.n ?? 0);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM public.files WHERE id = $1', [id]);
  }

  async eraseOwner(ownerId: string): Promise<StoredFile[]> {
    const result = await this.pool.query<FileRow>(
      'DELETE FROM public.files WHERE owner_id = $1 RETURNING *',
      [ownerId]
    );
    return result.rows.map(toFile);
  }
}
