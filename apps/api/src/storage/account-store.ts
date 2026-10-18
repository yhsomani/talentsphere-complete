import type pg from 'pg';
import crypto from 'node:crypto';
import { DomainError } from '@talentsphere/domain';
import type { DataExportRequest, UserSettings } from '@talentsphere/domain';

/** Settings and export metadata are account data, not ephemeral feature state. */
export interface AccountMetadataStore {
  getSettings(userId: string): Promise<UserSettings | null>;
  saveSettings(settings: UserSettings): Promise<void>;
  recordExport(request: DataExportRequest): Promise<void>;
  latestExport(userId: string): Promise<DataExportRequest | null>;
  erase(userId: string): Promise<void>;
}

export class MemoryAccountMetadataStore implements AccountMetadataStore {
  private readonly settings = new Map<string, UserSettings>();
  private readonly exports = new Map<string, DataExportRequest[]>();

  async getSettings(userId: string): Promise<UserSettings | null> {
    return this.settings.get(userId) ?? null;
  }
  async saveSettings(settings: UserSettings): Promise<void> {
    this.settings.set(settings.userId, settings);
  }
  async recordExport(request: DataExportRequest): Promise<void> {
    this.exports.set(request.userId, [request, ...(this.exports.get(request.userId) ?? [])]);
  }
  async latestExport(userId: string): Promise<DataExportRequest | null> {
    return this.exports.get(userId)?.[0] ?? null;
  }
  async erase(userId: string): Promise<void> {
    this.settings.delete(userId);
    this.exports.delete(userId);
  }
}

interface SettingsRow {
  user_id: string;
  theme: UserSettings['theme'];
  language: string;
  timezone: string;
  profile_visibility: UserSettings['profileVisibility'];
  show_email: boolean;
  show_activity: boolean;
  allow_connection_requests: boolean;
  allow_direct_messages: UserSettings['allowDirectMessages'];
  search_engine_indexing: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  digest_frequency: UserSettings['digestFrequency'];
  two_factor_enabled: boolean;
  byo_ai_key: string | null;
  ai_data_usage_consent: boolean;
  created_at: Date;
  updated_at: Date;
}

function fromSettingsRow(r: SettingsRow): UserSettings {
  return {
    userId: r.user_id,
    theme: r.theme,
    language: r.language,
    timezone: r.timezone,
    profileVisibility: r.profile_visibility,
    showEmail: r.show_email,
    showActivity: r.show_activity,
    allowConnectionRequests: r.allow_connection_requests,
    allowDirectMessages: r.allow_direct_messages,
    searchEngineIndexing: r.search_engine_indexing,
    emailNotifications: r.email_notifications,
    pushNotifications: r.push_notifications,
    marketingEmails: r.marketing_emails,
    digestFrequency: r.digest_frequency,
    twoFactorEnabled: r.two_factor_enabled,
    byoAiKey: r.byo_ai_key,
    aiDataUsageConsent: r.ai_data_usage_consent,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

interface ExportRow {
  id: string;
  user_id: string;
  status: DataExportRequest['status'];
  format: DataExportRequest['format'];
  download_url: string | null;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function fromExportRow(r: ExportRow): DataExportRequest {
  return {
    id: r.id,
    userId: r.user_id,
    status: r.status,
    format: r.format,
    downloadUrl: r.download_url ?? undefined,
    expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : undefined,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export class PgAccountMetadataStore implements AccountMetadataStore {
  private readonly encryptionKey: Buffer | null;

  constructor(private readonly pool: pg.Pool, encryptionKey?: string) {
    this.encryptionKey = encryptionKey ? Buffer.from(encryptionKey, 'hex') : null;
    if (this.encryptionKey && this.encryptionKey.length !== 32) {
      throw new Error('BYO_AI_KEY_ENCRYPTION_KEY must be 64 hexadecimal characters.');
    }
  }

  private encryptSecret(secret: string | null | undefined, userId: string): string | null {
    if (!secret) return null;
    if (!this.encryptionKey) {
      throw new DomainError(
        'SERVICE_UNAVAILABLE',
        'BYO AI key storage requires a configured encryption key.'
      );
    }
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    cipher.setAAD(Buffer.from(userId));
    const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
    return `enc:v1:${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
  }

  private decryptSecret(secret: string | null, userId: string): string | null {
    if (!secret) return null;
    if (!this.encryptionKey || !secret.startsWith('enc:v1:')) {
      throw new DomainError(
        'SERVICE_UNAVAILABLE',
        'Saved BYO AI key is not accessible without the correct encryption configuration.'
      );
    }
    try {
      const [, , ivHex, tagHex, encryptedHex] = secret.split(':');
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        this.encryptionKey,
        Buffer.from(ivHex, 'hex')
      );
      decipher.setAAD(Buffer.from(userId));
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      return Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, 'hex')),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new DomainError('SERVICE_UNAVAILABLE', 'Unable to decrypt the stored BYO AI key.');
    }
  }

  async getSettings(userId: string): Promise<UserSettings | null> {
    const result = await this.pool.query<SettingsRow>(
      'SELECT * FROM public.user_settings WHERE user_id = $1',
      [userId]
    );
    if (!result.rows[0]) return null;
    const settings = fromSettingsRow(result.rows[0]);
    return {
      ...settings,
      byoAiKey: this.decryptSecret(result.rows[0].byo_ai_key, userId),
    };
  }

  async saveSettings(s: UserSettings): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.user_settings (
        user_id, theme, language, timezone, profile_visibility,
        show_email, show_activity, allow_connection_requests, allow_direct_messages,
        search_engine_indexing, email_notifications, push_notifications,
        marketing_emails, digest_frequency, two_factor_enabled, byo_ai_key,
        ai_data_usage_consent, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19
      ) ON CONFLICT (user_id) DO UPDATE SET
        theme = EXCLUDED.theme, language = EXCLUDED.language,
        timezone = EXCLUDED.timezone, profile_visibility = EXCLUDED.profile_visibility,
        show_email = EXCLUDED.show_email, show_activity = EXCLUDED.show_activity,
        allow_connection_requests = EXCLUDED.allow_connection_requests,
        allow_direct_messages = EXCLUDED.allow_direct_messages,
        search_engine_indexing = EXCLUDED.search_engine_indexing,
        email_notifications = EXCLUDED.email_notifications,
        push_notifications = EXCLUDED.push_notifications,
        marketing_emails = EXCLUDED.marketing_emails,
        digest_frequency = EXCLUDED.digest_frequency,
        two_factor_enabled = EXCLUDED.two_factor_enabled,
        byo_ai_key = EXCLUDED.byo_ai_key,
        ai_data_usage_consent = EXCLUDED.ai_data_usage_consent,
        updated_at = EXCLUDED.updated_at`,
      [
        s.userId, s.theme, s.language, s.timezone, s.profileVisibility,
        s.showEmail, s.showActivity, s.allowConnectionRequests, s.allowDirectMessages,
        s.searchEngineIndexing, s.emailNotifications, s.pushNotifications,
        s.marketingEmails, s.digestFrequency, s.twoFactorEnabled,
        this.encryptSecret(s.byoAiKey, s.userId),
        s.aiDataUsageConsent, s.createdAt, s.updatedAt,
      ]
    );
  }

  async recordExport(r: DataExportRequest): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.data_export_requests (
        id, user_id, status, format, download_url, expires_at, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        r.id, r.userId, r.status, r.format, r.downloadUrl ?? null,
        r.expiresAt ?? null, r.createdAt, r.updatedAt,
      ]
    );
  }

  async latestExport(userId: string): Promise<DataExportRequest | null> {
    const result = await this.pool.query<ExportRow>(
      'SELECT * FROM public.data_export_requests WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 1',
      [userId]
    );
    return result.rows[0] ? fromExportRow(result.rows[0]) : null;
  }

  async erase(userId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM public.data_export_requests WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM public.user_settings WHERE user_id = $1', [userId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
