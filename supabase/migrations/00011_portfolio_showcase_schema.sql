-- ============================================================================
-- Migration: 00011_portfolio_showcase_schema.sql
-- Description: Portfolio Showcase, Media Assets, and Verified Skills Link (F-26)
-- ============================================================================

-- Portfolio Projects Table
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    project_url VARCHAR(500),
    repo_url VARCHAR(500),
    visibility VARCHAR(32) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'connections_only', 'recruiters_only', 'private')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio Project Skills (Canonical Skill Tagging BR-144)
CREATE TABLE IF NOT EXISTS public.portfolio_project_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_portfolio_project_skill UNIQUE (project_id, skill_id)
);

-- Portfolio Project Media Attachments
CREATE TABLE IF NOT EXISTS public.portfolio_project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
    media_url VARCHAR(1000) NOT NULL,
    media_type VARCHAR(32) NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'document')),
    caption VARCHAR(255),
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio Project Linked Evidence (F-96 Digital Credentials Link)
CREATE TABLE IF NOT EXISTS public.portfolio_project_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_portfolio_project_evidence UNIQUE (project_id, evidence_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_user ON public.portfolio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_visibility ON public.portfolio_projects(visibility);
CREATE INDEX IF NOT EXISTS idx_portfolio_project_skills_project ON public.portfolio_project_skills(project_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_project_skills_skill ON public.portfolio_project_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_project_media_project ON public.portfolio_project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_project_evidence_project ON public.portfolio_project_evidence(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_project_evidence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Portfolio Projects
CREATE POLICY p_portfolio_projects_owner_all ON public.portfolio_projects
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY p_portfolio_projects_public_read ON public.portfolio_projects
    FOR SELECT
    USING (visibility = 'public');

-- RLS Policies for Project Skills
CREATE POLICY p_portfolio_skills_select ON public.portfolio_project_skills
    FOR SELECT
    USING (TRUE);

CREATE POLICY p_portfolio_skills_modify ON public.portfolio_project_skills
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolio_projects p
            WHERE p.id = project_id AND p.user_id = auth.uid()
        )
    );

-- RLS Policies for Project Media
CREATE POLICY p_portfolio_media_select ON public.portfolio_project_media
    FOR SELECT
    USING (TRUE);

CREATE POLICY p_portfolio_media_modify ON public.portfolio_project_media
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolio_projects p
            WHERE p.id = project_id AND p.user_id = auth.uid()
        )
    );

-- RLS Policies for Project Evidence
CREATE POLICY p_portfolio_evidence_select ON public.portfolio_project_evidence
    FOR SELECT
    USING (TRUE);

CREATE POLICY p_portfolio_evidence_modify ON public.portfolio_project_evidence
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolio_projects p
            WHERE p.id = project_id AND p.user_id = auth.uid()
        )
    );
