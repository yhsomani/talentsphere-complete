import type pg from 'pg';
import type { FeatureFlag } from '@talentsphere/domain';

/** Flags the platform starts with. Pg mode seeds the same rows in migration 00051. */
const DEFAULT_FLAGS: ReadonlyArray<Omit<FeatureFlag, 'createdAt' | 'updatedAt'>> = [
  {
    key: 'FEATURE_LMS',
    enabled: true,
    description: 'Learning management system and interactive course modules',
  },
  {
    key: 'FEATURE_CODE_ARENA',
    enabled: true,
    description: 'Competitive coding challenges and assessments',
  },
  {
    key: 'FEATURE_MESSAGING',
    enabled: true,
    description: 'Direct messaging and networking channels',
  },
  {
    key: 'FEATURE_NOTIFICATIONS',
    enabled: true,
    description: 'Real-time and batch notification delivery',
  },
  {
    key: 'FEATURE_AI_MATCHING',
    enabled: false,
    description: 'AI-assisted recruiter candidate matching',
  },
];

export interface FeatureFlagStore {
  list(): Promise<FeatureFlag[]>;
  get(key: string): Promise<FeatureFlag | undefined>;
  upsert(flag: FeatureFlag): Promise<void>;
}

export class MemoryFeatureFlagStore implements FeatureFlagStore {
  private readonly flags = new Map<string, FeatureFlag>(
    DEFAULT_FLAGS.map((f) => {
      const now = new Date().toISOString();
      return [f.key, { ...f, createdAt: now, updatedAt: now }];
    })
  );

  async list(): Promise<FeatureFlag[]> {
    return [...this.flags.values()];
  }

  async get(key: string): Promise<FeatureFlag | undefined> {
    return this.flags.get(key);
  }

  async upsert(flag: FeatureFlag): Promise<void> {
    this.flags.set(flag.key, flag);
  }
}

interface FlagRow {
  key: string;
  enabled: boolean;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

function toFlag(row: FlagRow): FeatureFlag {
  return {
    key: row.key,
    enabled: row.enabled,
    description: row.description ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export class PgFeatureFlagStore implements FeatureFlagStore {
  constructor(private readonly pool: pg.Pool) {}

  async list(): Promise<FeatureFlag[]> {
    const result = await this.pool.query<FlagRow>(
      'SELECT * FROM public.feature_flags ORDER BY key'
    );
    return result.rows.map(toFlag);
  }

  async get(key: string): Promise<FeatureFlag | undefined> {
    const result = await this.pool.query<FlagRow>(
      'SELECT * FROM public.feature_flags WHERE key = $1',
      [key]
    );
    return result.rows[0] ? toFlag(result.rows[0]) : undefined;
  }

  async upsert(flag: FeatureFlag): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.feature_flags (key, enabled, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (key) DO UPDATE SET
         enabled = EXCLUDED.enabled,
         description = EXCLUDED.description,
         updated_at = EXCLUDED.updated_at`,
      [flag.key, flag.enabled, flag.description ?? null, flag.createdAt, flag.updatedAt]
    );
  }
}
