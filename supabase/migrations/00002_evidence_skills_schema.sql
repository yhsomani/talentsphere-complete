-- =============================================================================
-- TalentSphere Database Migration 00002: Evidence Graph & Skills Taxonomy
-- Conforming to docs/engineering/DATABASE.md, BR-141..BR-156, and SSOT v6.0
-- =============================================================================

-- 1. Alter Evidence table to ensure metadata JSONB column exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evidence' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.evidence ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 2. Skills Taxonomy Table (Platform Curated - BR-141)
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Skill Relationships Table (Directional & Acyclic - BR-142, BR-147)
CREATE TABLE IF NOT EXISTS public.skill_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  target_skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('prerequisite_of', 'subskill_of', 'supersedes', 'correlates_with')),
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_skill_id, target_skill_id, relationship_type)
);

-- 4. Evidence Skills Join Table (Evidence mapped to Canonical Skills - BR-144)
CREATE TABLE IF NOT EXISTS public.evidence_skills (
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (evidence_id, skill_id)
);

-- Indexes for Skills Graph Query Performance
CREATE INDEX IF NOT EXISTS idx_skills_slug ON public.skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skill_rel_source ON public.skill_relationships(source_skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_rel_target ON public.skill_relationships(target_skill_id);
CREATE INDEX IF NOT EXISTS idx_evidence_skills_skill ON public.evidence_skills(skill_id);

-- Enable Row Level Security
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_skills ENABLE ROW LEVEL SECURITY;

-- Skills RLS: Readable by authenticated and public users; mutations restricted
CREATE POLICY skills_select_policy ON public.skills
  FOR SELECT
  USING (true);

-- Skill Relationships RLS: Readable by authenticated and public users
CREATE POLICY skill_relationships_select_policy ON public.skill_relationships
  FOR SELECT
  USING (true);

-- Evidence Skills RLS: Readable according to profile privacy or subject ownership
CREATE POLICY evidence_skills_select_policy ON public.evidence_skills
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.evidence e
      JOIN public.profiles p ON p.id = e.subject_id
      WHERE e.id = evidence_skills.evidence_id
        AND (p.privacy = 'public' OR p.user_id = auth.uid())
    )
  );

CREATE POLICY evidence_skills_insert_policy ON public.evidence_skills
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.evidence e
      JOIN public.profiles p ON p.id = e.subject_id
      WHERE e.id = evidence_skills.evidence_id
        AND p.user_id = auth.uid()
    )
  );
