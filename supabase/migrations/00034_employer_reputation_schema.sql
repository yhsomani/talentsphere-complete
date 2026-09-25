-- Migration 00034: Employer Reputation & Brand System Schema (F-149, F-75, F-56, F-144)

CREATE TABLE IF NOT EXISTS public.employer_reputation_breakdown (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    overall_score NUMERIC(5, 2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    hiring_score NUMERIC(5, 2) NOT NULL CHECK (hiring_score BETWEEN 0 AND 100),
    culture_score NUMERIC(5, 2) NOT NULL CHECK (culture_score BETWEEN 0 AND 100),
    growth_score NUMERIC(5, 2) NOT NULL CHECK (growth_score BETWEEN 0 AND 100),
    compensation_reliability_score NUMERIC(5, 2) NOT NULL CHECK (compensation_reliability_score BETWEEN 0 AND 100),
    leadership_score NUMERIC(5, 2) NOT NULL CHECK (leadership_score BETWEEN 0 AND 100),
    reputation_band TEXT NOT NULL CHECK (reputation_band IN ('top_employer', 'strong_reputation', 'developing', 'needs_improvement')),
    verified_reviews_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    employment_status TEXT NOT NULL CHECK (employment_status IN ('current', 'former', 'candidate')),
    hiring_rating NUMERIC(3, 2) NOT NULL CHECK (hiring_rating BETWEEN 1 AND 5),
    culture_rating NUMERIC(3, 2) NOT NULL CHECK (culture_rating BETWEEN 1 AND 5),
    growth_rating NUMERIC(3, 2) NOT NULL CHECK (growth_rating BETWEEN 1 AND 5),
    compensation_rating NUMERIC(3, 2) NOT NULL CHECK (compensation_rating BETWEEN 1 AND 5),
    leadership_rating NUMERIC(3, 2) NOT NULL CHECK (leadership_rating BETWEEN 1 AND 5),
    title TEXT NOT NULL,
    feedback TEXT,
    is_verified_employee BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, reviewer_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employer_reputation_band ON public.employer_reputation_breakdown(reputation_band, overall_score);
CREATE INDEX IF NOT EXISTS idx_employer_reviews_org ON public.employer_reviews(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employer_reviews_reviewer ON public.employer_reviews(reviewer_id);

-- Row Level Security
ALTER TABLE public.employer_reputation_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_reviews ENABLE ROW LEVEL SECURITY;

-- Reputation breakdowns are publicly readable for platform transparency
CREATE POLICY employer_reputation_select ON public.employer_reputation_breakdown
    FOR SELECT
    USING (true);

-- Reviews: Publicly readable, but only authored by verified/candidate users
CREATE POLICY employer_reviews_select ON public.employer_reviews
    FOR SELECT
    USING (true);

CREATE POLICY employer_reviews_insert ON public.employer_reviews
    FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);
