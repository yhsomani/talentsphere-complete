-- Migration 00035: Skill Supply/Demand Forecasting Schema (F-151, F-84, F-86, F-97)

CREATE TABLE IF NOT EXISTS public.skill_market_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    demand_postings_count INT NOT NULL DEFAULT 0,
    active_candidates_count INT NOT NULL DEFAULT 0,
    avg_salary_offered NUMERIC(12, 2),
    geographic_region TEXT NOT NULL DEFAULT 'Global',
    industry TEXT NOT NULL DEFAULT 'Technology'
);

CREATE TABLE IF NOT EXISTS public.skill_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    forecast_horizon_months INT NOT NULL DEFAULT 12 CHECK (forecast_horizon_months BETWEEN 1 AND 36),
    demand_growth_pct NUMERIC(6, 2) NOT NULL,
    supply_growth_pct NUMERIC(6, 2) NOT NULL,
    scarcity_index NUMERIC(4, 3) NOT NULL CHECK (scarcity_index BETWEEN 0 AND 1),
    projected_median_salary NUMERIC(12, 2) NOT NULL,
    salary_lower_bound NUMERIC(12, 2) NOT NULL,
    salary_upper_bound NUMERIC(12, 2) NOT NULL,
    confidence_level NUMERIC(4, 3) NOT NULL DEFAULT 0.950,
    estimated_weeks_to_marketability INT NOT NULL DEFAULT 8 CHECK (estimated_weeks_to_marketability >= 1),
    regional_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    industry_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    historical_accuracy_mape NUMERIC(5, 2),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(skill_id, forecast_horizon_months)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skill_market_signals_skill_time ON public.skill_market_signals(skill_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_skill_forecasts_lookup ON public.skill_forecasts(skill_id, forecast_horizon_months);

-- Row Level Security
ALTER TABLE public.skill_market_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_forecasts ENABLE ROW LEVEL SECURITY;

-- Forecasting data is publicly queryable for labor market transparency
CREATE POLICY skill_market_signals_select ON public.skill_market_signals
    FOR SELECT
    USING (true);

CREATE POLICY skill_forecasts_select ON public.skill_forecasts
    FOR SELECT
    USING (true);
