-- =============================================================================
-- TalentSphere Database Migration 00043: Core-loop persistence alignment
--
-- Until this migration the API never wrote entity rows: every user, profile,
-- organization, job, application, evidence item and work-history record lived
-- in process memory and vanished on restart (production audit P0-04). The API
-- now persists these entities (ADR-015, apps/api/src/storage/core-store.ts).
-- Writing real rows exposed places where the schema and the domain disagreed;
-- this migration reconciles them. It is additive or corrective only — no data
-- is dropped (these tables have never held rows written by the application).
-- =============================================================================

-- 1. Evidence: the domain tracks dispute/override state.
ALTER TABLE public.evidence
  ADD COLUMN IF NOT EXISTS conflict_state TEXT NOT NULL DEFAULT 'none';
DO $$ BEGIN
  ALTER TABLE public.evidence
    ADD CONSTRAINT chk_evidence_conflict_state
    CHECK (conflict_state IN ('none', 'disputed', 'overridden'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Jobs: fields the domain and API contract already carry.
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS work_mode TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_type TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_min_minor BIGINT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_max_minor BIGINT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_currency CHAR(3);
DO $$ BEGIN
  ALTER TABLE public.jobs
    ADD CONSTRAINT chk_jobs_status
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'paused', 'closed', 'archived'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.jobs
    ADD CONSTRAINT chk_jobs_work_mode
    CHECK (work_mode IS NULL OR work_mode IN ('remote', 'hybrid', 'onsite'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.jobs
    ADD CONSTRAINT chk_jobs_job_type
    CHECK (job_type IS NULL OR job_type IN ('full_time', 'part_time', 'contract', 'internship'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  -- Money is integer minor units (SSOT money rule); a range is all-or-nothing.
  ALTER TABLE public.jobs
    ADD CONSTRAINT chk_jobs_salary_range
    CHECK (
      (salary_min_minor IS NULL AND salary_max_minor IS NULL AND salary_currency IS NULL)
      OR (salary_min_minor >= 0 AND salary_max_minor >= salary_min_minor AND salary_currency IS NOT NULL)
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Applications.
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS is_referred BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS referral_id UUID;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS hired_at TIMESTAMPTZ;

-- BR-15 forbids a second *active* application to the same job; it does not
-- forbid re-applying after a withdrawal or rejection. The 00001 UNIQUE
-- (job_id, candidate_id) forbade both, so it is replaced by a partial index
-- that enforces exactly the rule.
ALTER TABLE public.job_applications
  DROP CONSTRAINT IF EXISTS job_applications_job_id_candidate_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_job_applications_one_active
  ON public.job_applications (job_id, candidate_id)
  WHERE status NOT IN ('rejected', 'withdrawn', 'expired');

-- 4. Work history and references are keyed by the candidate's USER id: the API
--    writes user ids and the 00041 RLS policies compare candidate_id to
--    auth.uid(). The 00041 foreign keys pointed at profiles(id), which would
--    reject every row the API writes. Re-point them at users(id).
ALTER TABLE public.verified_work_histories
  DROP CONSTRAINT IF EXISTS verified_work_histories_candidate_id_fkey;
ALTER TABLE public.verified_work_histories
  ADD CONSTRAINT verified_work_histories_candidate_id_fkey
  FOREIGN KEY (candidate_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.verified_work_histories
  ADD COLUMN IF NOT EXISTS client_request_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_work_history_client_request
  ON public.verified_work_histories (candidate_id, client_request_id)
  WHERE client_request_id IS NOT NULL;

ALTER TABLE public.employment_references
  DROP CONSTRAINT IF EXISTS employment_references_candidate_id_fkey;
ALTER TABLE public.employment_references
  ADD CONSTRAINT employment_references_candidate_id_fkey
  FOREIGN KEY (candidate_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.employment_references
  DROP CONSTRAINT IF EXISTS employment_references_referee_id_fkey;
ALTER TABLE public.employment_references
  ADD CONSTRAINT employment_references_referee_id_fkey
  FOREIGN KEY (referee_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.employment_references
  ADD COLUMN IF NOT EXISTS client_request_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_reference_client_request
  ON public.employment_references (candidate_id, client_request_id)
  WHERE client_request_id IS NOT NULL;

-- The referee's one-time token is a bearer credential: whoever holds it can
-- vouch for the candidate. Store only its SHA-256, never the token itself.
ALTER TABLE public.employment_references ADD COLUMN IF NOT EXISTS token_hash CHAR(64);
UPDATE public.employment_references
   SET token_hash = encode(sha256(convert_to(token, 'UTF8')), 'hex')
 WHERE token IS NOT NULL AND token_hash IS NULL;
ALTER TABLE public.employment_references DROP COLUMN IF EXISTS token;

-- 5. Corporate-email ownership challenges (one open challenge per record).
--    "Verified" now requires proof of mailbox control: a single-use code sent
--    to the address. Only the code's hash is stored.
CREATE TABLE IF NOT EXISTS public.work_history_email_challenges (
  work_history_id UUID PRIMARY KEY
    REFERENCES public.verified_work_histories(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  code_hash CHAR(64) NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Service-role only: no user-facing policy (codes must never be readable).
ALTER TABLE public.work_history_email_challenges ENABLE ROW LEVEL SECURITY;

-- 6. Users: case-insensitive email uniqueness (the API lowercases on write;
--    this makes the database enforce it rather than trust it).
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON public.users (lower(email));
