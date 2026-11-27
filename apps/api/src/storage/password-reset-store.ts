import type pg from 'pg';
import type { PasswordResetToken } from '@talentsphere/domain';

/**
 * Password reset tokens (ADR-019, migration 00058). Only token hashes are
 * stored. claim() is the single-use guard: it marks a token used and returns
 * it, and returns null for a token that is unknown or already used, so two
 * requests with the same link cannot both succeed. Expiry is the caller's
 * check (passwordResetTokenUsable).
 */
export interface PasswordResetStore {
  create(record: PasswordResetToken): Promise<void>;
  countSince(userId: string, sinceIso: string): Promise<number>;
  claim(tokenHash: string, nowIso: string): Promise<PasswordResetToken | null>;
  /** Marks every unused token of the user used (after a reset or password change). */
  invalidateUser(userId: string, nowIso: string): Promise<void>;
  eraseUser(userId: string): Promise<void>;
}

export class MemoryPasswordResetStore implements PasswordResetStore {
  private readonly byHash = new Map<string, PasswordResetToken>();

  async create(record: PasswordResetToken): Promise<void> {
    this.byHash.set(record.tokenHash, { ...record });
  }

  async countSince(userId: string, sinceIso: string): Promise<number> {
    const since = Date.parse(sinceIso);
    return [...this.byHash.values()].filter(
      (r) => r.userId === userId && Date.parse(r.createdAt) >= since
    ).length;
  }

  async claim(tokenHash: string, nowIso: string): Promise<PasswordResetToken | null> {
    const record = this.byHash.get(tokenHash);
    if (!record || record.usedAt) return null;
    record.usedAt = nowIso;
    return { ...record };
  }

  async invalidateUser(userId: string, nowIso: string): Promise<void> {
    for (const record of this.byHash.values()) {
      if (record.userId === userId && !record.usedAt) record.usedAt = nowIso;
    }
  }

  async eraseUser(userId: string): Promise<void> {
    for (const [hash, record] of this.byHash) {
      if (record.userId === userId) this.byHash.delete(hash);
    }
  }
}

interface ResetRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

function toRecord(row: ResetRow): PasswordResetToken {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: new Date(row.expires_at).toISOString(),
    usedAt: row.used_at ? new Date(row.used_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export class PgPasswordResetStore implements PasswordResetStore {
  constructor(private readonly pool: pg.Pool) {}

  async create(record: PasswordResetToken): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        record.id,
        record.userId,
        record.tokenHash,
        record.expiresAt,
        record.usedAt,
        record.createdAt,
      ]
    );
  }

  async countSince(userId: string, sinceIso: string): Promise<number> {
    const result = await this.pool.query<{ n: string }>(
      'SELECT count(*) AS n FROM public.password_reset_tokens WHERE user_id = $1 AND created_at >= $2',
      [userId, sinceIso]
    );
    return Number(result.rows[0]?.n ?? 0);
  }

  async claim(tokenHash: string, nowIso: string): Promise<PasswordResetToken | null> {
    // One atomic statement: of two concurrent claims, only one sees used_at IS NULL.
    const result = await this.pool.query<ResetRow>(
      `UPDATE public.password_reset_tokens SET used_at = $2
       WHERE token_hash = $1 AND used_at IS NULL RETURNING *`,
      [tokenHash, nowIso]
    );
    return result.rows[0] ? toRecord(result.rows[0]) : null;
  }

  async invalidateUser(userId: string, nowIso: string): Promise<void> {
    await this.pool.query(
      'UPDATE public.password_reset_tokens SET used_at = $2 WHERE user_id = $1 AND used_at IS NULL',
      [userId, nowIso]
    );
  }

  async eraseUser(userId: string): Promise<void> {
    await this.pool.query('DELETE FROM public.password_reset_tokens WHERE user_id = $1', [userId]);
  }
}
