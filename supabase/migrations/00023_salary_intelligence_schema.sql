-- TalentSphere Schema Migration 00023: Salary Intelligence & Compensation Benchmarks (F-86, BR-177..BR-183)

CREATE TABLE IF NOT EXISTS salary_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    standardized_role VARCHAR(100) NOT NULL,
    seniority_level VARCHAR(50) NOT NULL CHECK (seniority_level IN ('entry', 'mid', 'senior', 'lead', 'principal', 'director', 'executive')),
    location VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL DEFAULT 'US',
    work_mode VARCHAR(20) CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    base_salary_minor BIGINT NOT NULL CHECK (base_salary_minor > 0),
    bonus_minor BIGINT NOT NULL DEFAULT 0 CHECK (bonus_minor >= 0),
    equity_annual_minor BIGINT NOT NULL DEFAULT 0 CHECK (equity_annual_minor >= 0),
    years_of_experience NUMERIC(4, 1) NOT NULL CHECK (years_of_experience >= 0),
    company_name VARCHAR(255),
    company_size VARCHAR(50) CHECK (company_size IN ('seed', 'early', 'midsize', 'enterprise')),
    industry VARCHAR(100),
    verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('self_reported', 'employment_verified')) DEFAULT 'self_reported',
    verification_weight NUMERIC(3, 2) NOT NULL DEFAULT 0.50,
    status VARCHAR(50) NOT NULL CHECK (status IN ('submitted', 'verified', 'flagged_outlier', 'withdrawn')) DEFAULT 'verified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS salary_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_key VARCHAR(255) NOT NULL UNIQUE,
    standardized_role VARCHAR(100) NOT NULL,
    seniority_level VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    sample_count INTEGER NOT NULL CHECK (sample_count >= 1),
    p25_minor BIGINT NOT NULL,
    p50_minor BIGINT NOT NULL,
    p75_minor BIGINT NOT NULL,
    p90_minor BIGINT NOT NULL,
    mean_minor BIGINT NOT NULL,
    min_minor BIGINT NOT NULL,
    max_minor BIGINT NOT NULL,
    equity_p50_minor BIGINT NOT NULL DEFAULT 0,
    bonus_p50_minor BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_salary_reports_user_id ON salary_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_reports_cohort ON salary_reports(standardized_role, seniority_level, location, status);
CREATE INDEX IF NOT EXISTS idx_salary_reports_company ON salary_reports(company_name, status);
CREATE INDEX IF NOT EXISTS idx_salary_aggregates_cohort ON salary_aggregates(standardized_role, seniority_level, location);

-- Row Level Security (RLS)
ALTER TABLE salary_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_aggregates ENABLE ROW LEVEL SECURITY;

-- 1. Users can insert their own reports
CREATE POLICY insert_own_salary_report ON salary_reports
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 2. Users can view their own reports
CREATE POLICY view_own_salary_reports ON salary_reports
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- 3. Users can withdraw/update their own reports
CREATE POLICY update_own_salary_reports ON salary_reports
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Aggregates are public to authenticated users
CREATE POLICY view_salary_aggregates ON salary_aggregates
    FOR SELECT TO authenticated
    USING (true);
