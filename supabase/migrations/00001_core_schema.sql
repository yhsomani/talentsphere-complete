-- =============================================================================
-- TalentSphere Database Migration 00001: Core Domain Schema & RLS
-- Conforming to docs/engineering/DATABASE.md and SSOT v6.0
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'candidate',
    'recruiter',
    'hiring_manager',
    'course_author',
    'instructor',
    'institution_admin',
    'platform_admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE profile_privacy AS ENUM (
    'public',
    'connections_only',
    'recruiters_only',
    'private'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM (
    'draft',
    'submitted',
    'in_review',
    'shortlisted',
    'interviewing',
    'offered',
    'hired',
    'rejected',
    'withdrawn',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_type AS ENUM (
    'self_declaration',
    'course_completion',
    'assessment',
    'project',
    'work_experience',
    'contribution',
    'employer_verification',
    'institution_credential',
    'external_verification'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_level AS ENUM (
    'unverified',
    'peer_reviewed',
    'institution_verified',
    'authority_verified'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_status AS ENUM (
    'pending',
    'verified',
    'disputed',
    'revoked',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  privacy profile_privacy NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Evidence Table
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type evidence_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT,
  provenance TEXT,
  verification_level verification_level NOT NULL DEFAULT 'unverified',
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  status evidence_status NOT NULL DEFAULT 'pending',
  recency_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Organization Memberships Table
CREATE TABLE IF NOT EXISTS public.org_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

-- 5. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, candidate_id)
);

-- 7. Audit Logs Table (Append-only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  actor_id UUID NOT NULL,
  target_id UUID,
  target_type TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Feature Flags Table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_subject_id ON public.evidence(subject_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_user ON public.org_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON public.jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate ON public.job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON public.audit_logs(event_name);

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY profiles_select_policy ON public.profiles
  FOR SELECT
  USING (
    privacy = 'public' 
    OR (auth.uid() = user_id)
  );

CREATE POLICY profiles_update_policy ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY profiles_insert_policy ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Evidence Policies
CREATE POLICY evidence_select_policy ON public.evidence
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = evidence.subject_id 
        AND (p.privacy = 'public' OR p.user_id = auth.uid())
    )
  );

CREATE POLICY evidence_insert_policy ON public.evidence
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = evidence.subject_id AND p.user_id = auth.uid()
    )
  );

-- Jobs Policies
CREATE POLICY jobs_select_policy ON public.jobs
  FOR SELECT
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM public.org_memberships om
    WHERE om.org_id = jobs.org_id AND om.user_id = auth.uid()
  ));

-- Applications Policies
CREATE POLICY applications_candidate_policy ON public.job_applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = job_applications.candidate_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY applications_recruiter_policy ON public.job_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.org_memberships om ON om.org_id = j.org_id
      WHERE j.id = job_applications.job_id AND om.user_id = auth.uid()
    )
  );

-- Feature Flags: Read-only for authenticated and public
CREATE POLICY feature_flags_select_policy ON public.feature_flags
  FOR SELECT
  USING (true);
