-- =============================================================================
-- TalentSphere Database Migration 00004: Challenges Arena & Assessment Schema
-- Conforming to docs/engineering/DATABASE.md, BR-24, BR-25, BR-49..51, and SSOT v6.0
-- =============================================================================

-- 1. Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL,
  time_limit_ms INTEGER NOT NULL DEFAULT 5000,
  memory_limit_mb INTEGER NOT NULL DEFAULT 512,
  policy_mode TEXT NOT NULL DEFAULT 'AI_PROHIBITED' CHECK (policy_mode IN ('AI_PROHIBITED', 'AI_RESTRICTED', 'AI_ALLOWED', 'POST_ASSESSMENT_ONLY')),
  test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Assessment Sessions Table
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  policy_mode TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  time_limit_seconds INTEGER NOT NULL DEFAULT 3600,
  submitted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'timed_out', 'abandoned', 'invalidated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Challenge Submissions Table
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE SET NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'compilation_error', 'runtime_error', 'timed_out')),
  score INTEGER NOT NULL DEFAULT 0,
  passed_cases INTEGER NOT NULL DEFAULT 0,
  total_cases INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. XP Ledger Transactions Table (Idempotent per user, ref_type, ref_id - BR-25)
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, reference_type, reference_id)
);

-- Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_challenges_slug ON public.challenges(slug);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON public.challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_candidate ON public.assessment_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_status ON public.assessment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_candidate ON public.challenge_submissions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_xp_user_date ON public.xp_transactions(user_id, created_at);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- Challenges RLS: Publicly readable; mutations admin/instructor only
CREATE POLICY challenges_select_policy ON public.challenges
  FOR SELECT
  USING (true);

-- Sessions RLS: Candidate access only
CREATE POLICY sessions_candidate_policy ON public.assessment_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = assessment_sessions.candidate_id AND p.user_id = auth.uid()
    )
  );

-- Submissions RLS: Candidate access only
CREATE POLICY submissions_candidate_policy ON public.challenge_submissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = challenge_submissions.candidate_id AND p.user_id = auth.uid()
    )
  );

-- XP Ledger RLS: User can read own XP ledger
CREATE POLICY xp_user_policy ON public.xp_transactions
  FOR SELECT
  USING (user_id = auth.uid());
