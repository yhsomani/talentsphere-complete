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

  it('contains and validates migration 00002 evidence and skills schema', () => {
    const migrationFile2 = path.join(migrationsDir, '00002_evidence_skills_schema.sql');
    expect(fs.existsSync(migrationFile2)).toBe(true);
    const sql = fs.readFileSync(migrationFile2, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.skills');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.skill_relationships');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.evidence_skills');
    expect(sql).toContain('ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.skill_relationships ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.evidence_skills ENABLE ROW LEVEL SECURITY;');
  });

  it('contains and validates migration 00003 jobs and applications schema', () => {
    const migrationFile3 = path.join(migrationsDir, '00003_jobs_applications_schema.sql');
    expect(fs.existsSync(migrationFile3)).toBe(true);
    const sql = fs.readFileSync(migrationFile3, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.job_skills');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.application_evidence');
    expect(sql).toContain('ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.application_evidence ENABLE ROW LEVEL SECURITY;');
  });
});


