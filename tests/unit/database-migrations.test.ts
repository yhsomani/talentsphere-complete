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

  it('contains and validates migration 00004 challenges and assessment schema', () => {
    const migrationFile4 = path.join(migrationsDir, '00004_challenges_assessment_schema.sql');
    expect(fs.existsSync(migrationFile4)).toBe(true);
    const sql = fs.readFileSync(migrationFile4, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.challenges');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.assessment_sessions');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.challenge_submissions');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.xp_transactions');
    expect(sql).toContain('ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;');
  });

  it('contains and validates migration 00005 lms courses schema', () => {
    const migrationFile5 = path.join(migrationsDir, '00005_lms_courses_schema.sql');
    expect(fs.existsSync(migrationFile5)).toBe(true);
    const sql = fs.readFileSync(migrationFile5, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.courses');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.course_modules');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.lessons');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.course_enrollments');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.lesson_progress');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.course_certificates');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.course_skills');
    expect(sql).toContain('ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.course_skills ENABLE ROW LEVEL SECURITY;');
  });

  it('contains and validates migration 00006 messaging schema', () => {
    const migrationFile6 = path.join(migrationsDir, '00006_messaging_schema.sql');
    expect(fs.existsSync(migrationFile6)).toBe(true);
    const sql = fs.readFileSync(migrationFile6, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.message_threads');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.thread_participants');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.messages');
    expect(sql).toContain('ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;');
  });

  it('contains and validates migration 00007 notifications schema', () => {
    const migrationFile7 = path.join(migrationsDir, '00007_notifications_schema.sql');
    expect(fs.existsSync(migrationFile7)).toBe(true);
    const sql = fs.readFileSync(migrationFile7, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.notifications');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.notification_preferences');
    expect(sql).toContain('ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;');
  });

  it('contains and validates migration 00008 ai gateway schema', () => {
    const migrationFile8 = path.join(migrationsDir, '00008_ai_gateway_schema.sql');
    expect(fs.existsSync(migrationFile8)).toBe(true);
    const sql = fs.readFileSync(migrationFile8, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.ai_conversations');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.ai_messages');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.ai_usage_meters');
    expect(sql).toContain('ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.ai_usage_meters ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('CONSTRAINT uq_ai_usage_meter UNIQUE (user_id, period_date)');
  });

  it('contains and validates migration 00009 resumes schema (BR-26)', () => {
    const migrationFile9 = path.join(migrationsDir, '00009_resumes_schema.sql');
    expect(fs.existsSync(migrationFile9)).toBe(true);
    const sql = fs.readFileSync(migrationFile9, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.resumes');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.resume_exports');
    expect(sql).toContain('ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.resume_exports ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('status VARCHAR(32) NOT NULL DEFAULT \'active\'');
    expect(sql).toContain('deleted_at TIMESTAMPTZ');
  });
});

