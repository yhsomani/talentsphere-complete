import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Database Migration & Schema Authority (E-04, E-05)', () => {
  const migrationsDir = path.resolve('supabase/migrations');
  const migrationFile = path.join(migrationsDir, '00001_core_schema.sql');

  it('contains the foundational migration file', () => {
    expect(fs.existsSync(migrationFile)).toBe(true);
  });

  it('defines the required canonical core tables', () => {
    const sql = fs.readFileSync(migrationFile, 'utf8');
    const requiredTables = [
      'public.profiles',
      'public.evidence',
      'public.organizations',
      'public.org_memberships',
      'public.jobs',
      'public.job_applications',
      'public.audit_logs',
      'public.feature_flags',
    ];

    for (const table of requiredTables) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it('enforces RLS enablement across all core tables', () => {
    const sql = fs.readFileSync(migrationFile, 'utf8');
    const requiredRlsTables = [
      'public.profiles',
      'public.evidence',
      'public.organizations',
      'public.org_memberships',
      'public.jobs',
      'public.job_applications',
      'public.audit_logs',
      'public.feature_flags',
    ];

    for (const table of requiredRlsTables) {
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it('contains seed file with baseline feature flags', () => {
    const seedFile = path.resolve('supabase/seed/01_initial_seed.sql');
    expect(fs.existsSync(seedFile)).toBe(true);
    const seedSql = fs.readFileSync(seedFile, 'utf8');
    expect(seedSql).toContain('FEATURE_LMS');
    expect(seedSql).toContain('FEATURE_CODE_ARENA');
  });
});
