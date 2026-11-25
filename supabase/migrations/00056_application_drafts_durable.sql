-- ============================================================================
-- Migration: 00056_application_drafts_durable.sql
-- Description: The API now writes application drafts (00019) to PostgreSQL
--              (F-36, issue #48). Two adjustments make that possible and safe:
--   1. Resumes are still held in API memory, so a draft's resume_id names a
--      row public.resumes does not have. Drop that foreign key; the API checks
--      the resume belongs to the caller before saving. Restore it once resumes
--      are durable.
--   2. The API role alone reads and writes drafts (there is no Supabase Auth,
--      so the auth.uid() policies never match). Drop client-role access, as
--      00053 and 00055 do. RLS stays enabled.
--              Idempotent; no data change.
-- ============================================================================

ALTER TABLE public.application_drafts
  DROP CONSTRAINT IF EXISTS application_drafts_resume_id_fkey;

REVOKE ALL ON public.application_drafts FROM anon, authenticated;
REVOKE ALL ON public.application_draft_versions FROM anon, authenticated;
