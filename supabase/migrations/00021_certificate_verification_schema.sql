-- TalentSphere — Migration 00021: Certificate Verification & Revocation Schema (F-52, S-02, BR-150, SSOT 1132)
-- Expands course_certificates with revocation fields and audit trail for public cryptographic verification.

ALTER TABLE public.course_certificates
  ADD COLUMN IF NOT EXISTS revocation_reason TEXT,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.certificate_revocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES public.course_certificates(id) ON DELETE CASCADE,
  revoked_by UUID NOT NULL REFERENCES public.users(id),
  reason TEXT NOT NULL,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_certificate_revocations_cert ON public.certificate_revocations(certificate_id);

-- Public Zero-PII verification policy (anyone can query verified certificate status by proof hash)
CREATE OR REPLACE VIEW public.public_certificate_verifications AS
  SELECT 
    cc.certificate_number,
    cc.verification_proof_hash,
    c.title AS course_title,
    c.level AS course_level,
    cc.status,
    cc.issued_at,
    cc.revoked_at,
    cc.revocation_reason
  FROM public.course_certificates cc
  JOIN public.courses c ON c.id = cc.course_id;
