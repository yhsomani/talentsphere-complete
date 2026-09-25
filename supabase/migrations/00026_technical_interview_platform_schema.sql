-- Migration 00026: Technical Interview Assessment Platform Schema (F-88, S-06, BR-169..BR-176)

CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES public.users(id),
    title TEXT NOT NULL,
    statement TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('code', 'design', 'behavioral', 'text')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    duration_minutes INT NOT NULL DEFAULT 30,
    expected_competencies JSONB NOT NULL DEFAULT '[]'::jsonb,
    test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interview_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
    candidate_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interviewer_user_id UUID NOT NULL REFERENCES public.users(id),
    title TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'scored', 'reviewed')),
    meeting_url TEXT NOT NULL,
    question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    candidate_joined_at TIMESTAMPTZ,
    interviewer_joined_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    recording_consent_candidate BOOLEAN NOT NULL DEFAULT false,
    recording_consent_interviewer BOOLEAN NOT NULL DEFAULT false,
    recording_status TEXT NOT NULL DEFAULT 'disabled' CHECK (recording_status IN ('disabled', 'consented', 'active', 'completed')),
    retention_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interview_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.interview_assessments(id) ON DELETE CASCADE,
    interviewer_user_id UUID NOT NULL REFERENCES public.users(id),
    technical_correctness INT NOT NULL CHECK (technical_correctness BETWEEN 1 AND 5),
    communication INT NOT NULL CHECK (communication BETWEEN 1 AND 5),
    problem_solving INT NOT NULL CHECK (problem_solving BETWEEN 1 AND 5),
    code_quality INT NOT NULL CHECK (code_quality BETWEEN 1 AND 5),
    recommendation TEXT NOT NULL CHECK (recommendation IN ('strong_yes', 'yes', 'neutral', 'no', 'strong_no')),
    overall_score NUMERIC(4, 2) NOT NULL,
    strengths TEXT NOT NULL,
    areas_for_improvement TEXT NOT NULL,
    private_notes TEXT,
    revision_number INT NOT NULL DEFAULT 1,
    parent_scorecard_id UUID REFERENCES public.interview_scorecards(id),
    compensation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interview_ai_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.interview_assessments(id) ON DELETE CASCADE,
    communication_clarity_score INT NOT NULL CHECK (communication_clarity_score BETWEEN 1 AND 100),
    technical_summary TEXT NOT NULL,
    suggested_improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_advisory BOOLEAN NOT NULL DEFAULT true,
    requires_human_review BOOLEAN NOT NULL DEFAULT true,
    excluded_protected_attributes BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_interview_questions_org ON public.interview_questions(org_id);
CREATE INDEX IF NOT EXISTS idx_interview_assessments_org ON public.interview_assessments(org_id);
CREATE INDEX IF NOT EXISTS idx_interview_assessments_candidate ON public.interview_assessments(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_interview_assessments_status ON public.interview_assessments(status);
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_assessment ON public.interview_scorecards(assessment_id);
CREATE INDEX IF NOT EXISTS idx_interview_ai_feedbacks_assessment ON public.interview_ai_feedbacks(assessment_id);

-- Row Level Security
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_ai_feedbacks ENABLE ROW LEVEL SECURITY;

-- Questions are company-scoped (BR-173); visible only to members of the organization
CREATE POLICY interview_questions_org_members_select ON public.interview_questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.org_id = interview_questions.org_id
              AND om.user_id = auth.uid()
        )
    );

CREATE POLICY interview_questions_org_members_modify ON public.interview_questions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.org_id = interview_questions.org_id
              AND om.user_id = auth.uid()
              AND om.role IN ('owner', 'admin', 'recruiter')
        )
    );

-- Assessments: visible to organization members and the candidate profile owner
CREATE POLICY interview_assessments_participant_select ON public.interview_assessments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = interview_assessments.candidate_profile_id
              AND p.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.org_id = interview_assessments.org_id
              AND om.user_id = auth.uid()
        )
    );

CREATE POLICY interview_assessments_recruiter_modify ON public.interview_assessments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.org_id = interview_assessments.org_id
              AND om.user_id = auth.uid()
              AND om.role IN ('owner', 'admin', 'recruiter')
        )
    );

-- Scorecards: visible to organization members, and candidate receives only high-level feedback
CREATE POLICY interview_scorecards_org_select ON public.interview_scorecards
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.interview_assessments ia
            JOIN public.organization_members om ON om.org_id = ia.org_id
            WHERE ia.id = interview_scorecards.assessment_id
              AND om.user_id = auth.uid()
        )
    );

CREATE POLICY interview_scorecards_interviewer_insert ON public.interview_scorecards
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.interview_assessments ia
            JOIN public.organization_members om ON om.org_id = ia.org_id
            WHERE ia.id = interview_scorecards.assessment_id
              AND om.user_id = auth.uid()
        )
    );
