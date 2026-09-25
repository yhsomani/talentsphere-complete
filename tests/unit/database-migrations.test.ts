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

  it('contains and validates migration 00010 networking connections schema (F-09)', () => {
    const migrationFile10 = path.join(migrationsDir, '00010_networking_connections_schema.sql');
    expect(fs.existsSync(migrationFile10)).toBe(true);
    const sql = fs.readFileSync(migrationFile10, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.connections');
    expect(sql).toContain('ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('CONSTRAINT chk_connections_no_self CHECK (sender_id != recipient_id)');
    expect(sql).toContain('CONSTRAINT uq_connections_pair UNIQUE (sender_id, recipient_id)');
    expect(sql).toContain('status VARCHAR(32) NOT NULL DEFAULT \'pending\'');
  });

  it('contains and validates migration 00011 portfolio showcase schema (F-26)', () => {
    const migrationFile11 = path.join(migrationsDir, '00011_portfolio_showcase_schema.sql');
    expect(fs.existsSync(migrationFile11)).toBe(true);
    const sql = fs.readFileSync(migrationFile11, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.portfolio_projects');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.portfolio_project_skills');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.portfolio_project_media');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.portfolio_project_evidence');
    expect(sql).toContain('ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.portfolio_project_skills ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.portfolio_project_media ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.portfolio_project_evidence ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('CONSTRAINT uq_portfolio_project_skill UNIQUE (project_id, skill_id)');
    expect(sql).toContain('CONSTRAINT uq_portfolio_project_evidence UNIQUE (project_id, evidence_id)');
  });

  it('contains and validates migration 00012 gamification xp ledger schema (F-22, F-23)', () => {
    const migrationFile12 = path.join(migrationsDir, '00012_gamification_xp_ledger_schema.sql');
    expect(fs.existsSync(migrationFile12)).toBe(true);
    const sql = fs.readFileSync(migrationFile12, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.user_gamification_profiles');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.gamification_badges');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.user_badges');
    expect(sql).toContain('ALTER TABLE public.user_gamification_profiles ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)');
  });

  it('contains and validates migration 00013 account settings and privacy schema (F-15)', () => {
    const migrationFile13 = path.join(migrationsDir, '00013_account_settings_privacy_schema.sql');
    expect(fs.existsSync(migrationFile13)).toBe(true);
    const sql = fs.readFileSync(migrationFile13, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.user_settings');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.data_erasure_requests');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.data_export_requests');
    expect(sql).toContain('ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.data_erasure_requests ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('profile_visibility VARCHAR(32) NOT NULL DEFAULT \'public\'');
    expect(sql).toContain('status VARCHAR(32) NOT NULL DEFAULT \'grace_period\'');
  });

  it('contains and validates migration 00014 billing and subscriptions schema (F-16)', () => {
    const migrationFile14 = path.join(migrationsDir, '00014_billing_subscriptions_schema.sql');
    expect(fs.existsSync(migrationFile14)).toBe(true);
    const sql = fs.readFileSync(migrationFile14, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.subscriptions');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.invoices');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.entitlements');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.billing_events');
    expect(sql).toContain('ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0)');
    expect(sql).toContain('idempotency_key VARCHAR(128) UNIQUE');
  });
});




