-- 00022_job_templates_schema.sql
-- Feature F-37: Job Templates (Recruiting, Post Job Studio companion, BR-01, BR-12, BR-144)

CREATE TABLE IF NOT EXISTS public.job_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    template_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    work_mode TEXT CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),
    job_type TEXT CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship')),
    required_skill_ids TEXT[] DEFAULT '{}' NOT NULL,
    salary_min_minor BIGINT,
    salary_max_minor BIGINT,
    currency TEXT DEFAULT 'USD' NOT NULL,
    department TEXT,
    screening_questions JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT job_templates_salary_check CHECK (
        (salary_min_minor IS NULL AND salary_max_minor IS NULL) OR
        (salary_min_minor IS NOT NULL AND salary_max_minor IS NOT NULL AND salary_min_minor >= 0 AND salary_max_minor >= salary_min_minor)
    )
);

CREATE INDEX IF NOT EXISTS idx_job_templates_org_id ON public.job_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_job_templates_archived ON public.job_templates(org_id, is_archived);

-- Enable RLS
ALTER TABLE public.job_templates ENABLE ROW LEVEL SECURITY;

-- Policies:
-- 1. Org members with recruiter role or org admins can read templates for their organization
CREATE POLICY "Org members can read their organization job templates"
    ON public.job_templates
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.org_id = job_templates.org_id
              AND om.user_id = auth.uid()
        )
        OR (auth.jwt() -> 'app_metadata' -> 'roles') ? 'platform_admin'
    );

-- 2. Org recruiters or platform admins can insert templates
CREATE POLICY "Org recruiters can insert job templates"
    ON public.job_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (
            EXISTS (
                SELECT 1 FROM public.organization_members om
                WHERE om.org_id = job_templates.org_id
                  AND om.user_id = auth.uid()
                  AND om.role IN ('owner', 'admin', 'recruiter')
            )
            OR (auth.jwt() -> 'app_metadata' -> 'roles') ? 'platform_admin'
        )
    );

-- 3. Org recruiters or platform admins can update templates
CREATE POLICY "Org recruiters can update job templates"
    ON public.job_templates
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.org_id = job_templates.org_id
              AND om.user_id = auth.uid()
              AND om.role IN ('owner', 'admin', 'recruiter')
        )
        OR (auth.jwt() -> 'app_metadata' -> 'roles') ? 'platform_admin'
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.org_id = job_templates.org_id
              AND om.user_id = auth.uid()
              AND om.role IN ('owner', 'admin', 'recruiter')
        )
        OR (auth.jwt() -> 'app_metadata' -> 'roles') ? 'platform_admin'
    );
