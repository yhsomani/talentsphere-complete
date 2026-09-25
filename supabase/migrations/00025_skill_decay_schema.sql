-- TalentSphere Schema Migration 00025: Skill Decay & Freshness Tracking (F-123, BR-225..BR-232)

CREATE TABLE IF NOT EXISTS skill_freshness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL,
    skill_id VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('fast_changing', 'moderate', 'stable', 'foundational')) DEFAULT 'moderate',
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    freshness_score INTEGER NOT NULL CHECK (freshness_score >= 0 AND freshness_score <= 100),
    freshness_band VARCHAR(20) NOT NULL CHECK (freshness_band IN ('fresh', 'current', 'aging', 'stale', 'expired')),
    is_demoted BOOLEAN NOT NULL DEFAULT false,
    verification_source VARCHAR(50) NOT NULL DEFAULT 'evidence',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(candidate_id, skill_id)
);

CREATE TABLE IF NOT EXISTS skill_freshness_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL,
    skill_id VARCHAR(100) NOT NULL,
    freshness_score INTEGER NOT NULL,
    freshness_band VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_skill_freshness_candidate ON skill_freshness(candidate_id);
CREATE INDEX IF NOT EXISTS idx_skill_freshness_score ON skill_freshness(freshness_score, freshness_band);
CREATE INDEX IF NOT EXISTS idx_skill_freshness_history ON skill_freshness_history(candidate_id, skill_id, recorded_at);

-- Row Level Security (RLS)
ALTER TABLE skill_freshness ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_freshness_history ENABLE ROW LEVEL SECURITY;

-- 1. Candidate can view their own freshness records (BR-230)
CREATE POLICY candidate_view_own_freshness ON skill_freshness
    FOR SELECT TO authenticated
    USING (auth.uid() = candidate_id);

-- 2. Candidate can manage their own freshness records
CREATE POLICY candidate_manage_own_freshness ON skill_freshness
    FOR ALL TO authenticated
    USING (auth.uid() = candidate_id)
    WITH CHECK (auth.uid() = candidate_id);

-- 3. Candidate can view their historical decay series (BR-232)
CREATE POLICY candidate_view_freshness_history ON skill_freshness_history
    FOR SELECT TO authenticated
    USING (auth.uid() = candidate_id);
