-- ============================================================================
-- Migration: 00009_resumes_schema.sql
-- Description: Resume Builder, Section Models, Append-Only Exports & Soft Delete (F-13, BR-26)
-- ============================================================================

-- Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled Resume',
    template VARCHAR(64) NOT NULL DEFAULT 'modern' CHECK (template IN ('modern', 'minimal', 'executive', 'technical')),
    headline VARCHAR(255),
    summary TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(64),
    location VARCHAR(255),
    website_url VARCHAR(500),
    experience JSONB NOT NULL DEFAULT '[]'::jsonb,
    education JSONB NOT NULL DEFAULT '[]'::jsonb,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resume Exports Table (BR-26: Append-only with soft-delete)
CREATE TABLE IF NOT EXISTS public.resume_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    format VARCHAR(32) NOT NULL CHECK (format IN ('json', 'markdown', 'html', 'pdf')),
    rendered_content TEXT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performant lookup
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_exports_resume_id ON public.resume_exports(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_exports_user_id ON public.resume_exports(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY p_resumes_owner ON public.resumes
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY p_resume_exports_owner ON public.resume_exports
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
