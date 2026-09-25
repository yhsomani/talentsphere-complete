-- ============================================================================
-- Migration 00018: Saved Searches, Job Alerts & Saved Jobs Schema (F-32, F-04, F-25)
-- Canonical Tables 44, 45, 46 from DATABASE.md
-- ============================================================================

-- 1. Saved Searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    query VARCHAR(200),
    location VARCHAR(120),
    work_mode VARCHAR(30) CHECK (work_mode IS NULL OR work_mode IN ('remote', 'hybrid', 'onsite')),
    job_type VARCHAR(30) CHECK (job_type IS NULL OR job_type IN ('full_time', 'part_time', 'contract', 'internship')),
    required_skill_ids UUID[] DEFAULT '{}',
    salary_min_minor BIGINT CHECK (salary_min_minor IS NULL OR salary_min_minor >= 0),
    alert_frequency VARCHAR(20) NOT NULL DEFAULT 'daily' CHECK (alert_frequency IN ('instant', 'daily', 'weekly', 'never')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Job Alerts (new matches dispatched to candidate)
CREATE TABLE IF NOT EXISTS public.job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    saved_search_id UUID NOT NULL REFERENCES public.saved_searches(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Saved Jobs (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_saved_jobs_user_job UNIQUE (user_id, job_id)
);

-- Indexes for performant filtering
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_active ON public.saved_searches(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON public.job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_unread ON public.job_alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Strict Row-Level Security Policies

-- saved_searches: Users can manage only their own saved searches
CREATE POLICY "Users can manage own saved searches"
    ON public.saved_searches
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- job_alerts: Users can view and update their own job alerts
CREATE POLICY "Users can view own job alerts"
    ON public.job_alerts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own job alerts"
    ON public.job_alerts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- saved_jobs: Users can manage their own saved jobs
CREATE POLICY "Users can manage own saved jobs"
    ON public.saved_jobs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
