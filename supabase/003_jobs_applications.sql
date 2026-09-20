-- ============================================================================
-- Migration 003: Jobs and Applications
-- ============================================================================
-- Purpose: Creates job board and Applicant Tracking System (ATS) tables.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Jobs Table
-- ----------------------------------------------------------------------------

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    responsibilities TEXT[],
    benefits TEXT[],
    job_type job_type NOT NULL,
    work_mode work_mode NOT NULL,
    experience_level experience_level NOT NULL,
    department VARCHAR(100),
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    location_remote BOOLEAN DEFAULT FALSE,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    salary_period VARCHAR(20) DEFAULT 'yearly',
    status job_status NOT NULL DEFAULT 'draft',
    application_deadline DATE,
    start_date DATE,
    positions_available INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_remote_worldwide BOOLEAN DEFAULT FALSE,
    visa_sponsorship BOOLEAN DEFAULT FALSE,
    relocation_assistance BOOLEAN DEFAULT FALSE,
    required_skills UUID[],
    preferred_skills UUID[],
    application_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT jobs_salary_check CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min),
    CONSTRAINT jobs_positions_check CHECK (positions_filled <= positions_available)
);

CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_organization ON jobs(organization_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_work_mode ON jobs(work_mode);
CREATE INDEX idx_jobs_experience ON jobs(experience_level);
CREATE INDEX idx_jobs_location ON jobs(location_city, location_country);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX idx_jobs_title_fts ON jobs USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_jobs_required_skills ON jobs USING GIN(required_skills);

-- ----------------------------------------------------------------------------
-- Applications Table
-- ----------------------------------------------------------------------------

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'submitted',
    cover_letter TEXT,
    resume_url VARCHAR(500),
    portfolio_urls TEXT[],
    answers_to_questions JSONB,
    referral_source VARCHAR(100),
    referred_by UUID REFERENCES users(id),
    current_stage_id UUID,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    decision_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_application UNIQUE(job_id, candidate_profile_id)
);

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_profile_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied ON applications(applied_at DESC);
CREATE INDEX idx_applications_current_stage ON applications(current_stage_id);

-- ----------------------------------------------------------------------------
-- Hiring Pipeline Stages Table
-- ----------------------------------------------------------------------------

CREATE TABLE hiring_pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    order_index INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    requires_scorecard BOOLEAN DEFAULT FALSE,
    auto_advance_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT hiring_pipeline_stages_type_check CHECK (type IN (
        'application_review', 'phone_screen', 'technical_assessment', 
        'interview', 'onsite', 'reference_check', 'offer', 'hired'
    ))
);

CREATE INDEX idx_pipeline_stages_org ON hiring_pipeline_stages(organization_id);
CREATE INDEX idx_pipeline_stages_order ON hiring_pipeline_stages(order_index);

-- Add current_stage_id foreign key after table creation
ALTER TABLE applications 
    ADD CONSTRAINT fk_current_stage 
    FOREIGN KEY (current_stage_id) 
    REFERENCES hiring_pipeline_stages(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- Scorecards Table
-- ----------------------------------------------------------------------------

CREATE TABLE scorecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES hiring_pipeline_stages(id) ON DELETE SET NULL,
    overall_decision scorecard_decision NOT NULL,
    overall_score INTEGER,
    technical_score INTEGER,
    communication_score INTEGER,
    culture_fit_score INTEGER,
    problem_solving_score INTEGER,
    leadership_score INTEGER,
    comments TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    would_rehire BOOLEAN,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT scorecards_score_range CHECK (
        overall_score IS NULL OR (overall_score >= 1 AND overall_score <= 10)
    )
);

CREATE INDEX idx_scorecards_application ON scorecards(application_id);
CREATE INDEX idx_scorecards_interviewer ON scorecards(interviewer_id);
CREATE INDEX idx_scorecards_stage ON scorecards(stage_id);
CREATE INDEX idx_scorecards_submitted ON scorecards(submitted_at);

-- ----------------------------------------------------------------------------
-- Application Activity Log Table
-- ----------------------------------------------------------------------------

CREATE TABLE application_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_application ON application_activity_log(application_id);
CREATE INDEX idx_activity_actor ON application_activity_log(actor_id);
CREATE INDEX idx_activity_action ON application_activity_log(action);
CREATE INDEX idx_activity_created ON application_activity_log(created_at DESC);

-- ----------------------------------------------------------------------------
-- Auto-update triggers
-- ----------------------------------------------------------------------------

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hiring_pipeline_stages_updated_at
    BEFORE UPDATE ON hiring_pipeline_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Function to update application count on job
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs SET application_count = application_count + 1 WHERE id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs SET application_count = application_count - 1 WHERE id = OLD.job_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_job_application_count_insert
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_job_application_count();

CREATE TRIGGER trg_update_job_application_count_delete
    AFTER DELETE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_job_application_count();

-- ----------------------------------------------------------------------------
-- Seed default pipeline stages
-- ----------------------------------------------------------------------------

INSERT INTO hiring_pipeline_stages (name, order_index, type, is_default) VALUES
('Application Received', 1, 'application_review', TRUE),
('Screening', 2, 'application_review', TRUE),
('Under Review', 3, 'application_review', TRUE),
('Interview Scheduled', 4, 'interview', TRUE),
('Interviewed', 5, 'interview', TRUE),
('Decision', 6, 'offer', TRUE);

-- ----------------------------------------------------------------------------
-- End of Migration 003
-- ----------------------------------------------------------------------------
