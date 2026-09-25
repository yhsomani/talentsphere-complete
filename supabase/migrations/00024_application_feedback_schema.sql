-- TalentSphere Schema Migration 00024: Application Feedback Loop (F-122, BR-217..BR-224, P-02)

CREATE TABLE IF NOT EXISTS feedback_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    template_name VARCHAR(150) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    reason_category VARCHAR(50) NOT NULL CHECK (reason_category IN ('skills_gap', 'experience_gap', 'culture_fit', 'overqualified', 'position_filled', 'compensation_mismatch', 'other')),
    default_strengths TEXT,
    default_areas_for_improvement TEXT,
    default_actionable_advice TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS application_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    job_id UUID NOT NULL,
    org_id UUID NOT NULL,
    author_id UUID NOT NULL,
    stage VARCHAR(50) NOT NULL,
    reason_category VARCHAR(50) NOT NULL CHECK (reason_category IN ('skills_gap', 'experience_gap', 'culture_fit', 'overqualified', 'position_filled', 'compensation_mismatch', 'other')),
    strengths TEXT NOT NULL,
    areas_for_improvement TEXT NOT NULL,
    actionable_advice TEXT NOT NULL,
    suggested_skill_ids TEXT[] DEFAULT '{}',
    is_ai_assisted BOOLEAN NOT NULL DEFAULT false,
    human_reviewed BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'provided', 'viewed', 'requested', 'responded', 'skipped')) DEFAULT 'provided',
    requested_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance & Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_application_feedback_app_id ON application_feedback(application_id);
CREATE INDEX IF NOT EXISTS idx_application_feedback_candidate ON application_feedback(candidate_id, status);
CREATE INDEX IF NOT EXISTS idx_application_feedback_org ON application_feedback(org_id);
CREATE INDEX IF NOT EXISTS idx_feedback_templates_org ON feedback_templates(org_id);

-- Row Level Security (RLS)
ALTER TABLE application_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_templates ENABLE ROW LEVEL SECURITY;

-- 1. Candidates can only read feedback delivered to them (BR-219)
CREATE POLICY candidate_view_own_feedback ON application_feedback
    FOR SELECT TO authenticated
    USING (auth.uid() = candidate_id);

-- 2. Organization members can view feedback for applications to their org
CREATE POLICY org_members_view_feedback ON application_feedback
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM org_memberships
            WHERE org_memberships.org_id = application_feedback.org_id
              AND org_memberships.user_id = auth.uid()
        )
    );

-- 3. Recruiters can insert/update feedback for their org
CREATE POLICY org_members_manage_feedback ON application_feedback
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM org_memberships
            WHERE org_memberships.org_id = application_feedback.org_id
              AND org_memberships.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM org_memberships
            WHERE org_memberships.org_id = application_feedback.org_id
              AND org_memberships.user_id = auth.uid()
        )
    );
