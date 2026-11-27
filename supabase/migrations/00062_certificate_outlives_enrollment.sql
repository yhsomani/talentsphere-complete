-- ============================================================================
-- Migration: 00062_certificate_outlives_enrollment.sql
-- Description: An issued course certificate stays publicly verifiable after
--              its learner's account is erased (owner decision #5; plan
--              TS-03). Erasure deletes the learner's enrolments, which used to
--              cascade to the certificate. The certificate's enrolment link
--              becomes optional and is set to NULL instead. Relaxes one
--              constraint; no existing data changes.
-- ============================================================================

ALTER TABLE public.course_certificates ALTER COLUMN enrollment_id DROP NOT NULL;
ALTER TABLE public.course_certificates
  DROP CONSTRAINT IF EXISTS course_certificates_enrollment_id_fkey;
ALTER TABLE public.course_certificates
  ADD CONSTRAINT course_certificates_enrollment_id_fkey
  FOREIGN KEY (enrollment_id) REFERENCES public.course_enrollments(id) ON DELETE SET NULL;
