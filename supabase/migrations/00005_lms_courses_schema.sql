-- TalentSphere Migration: 00005_lms_courses_schema.sql
-- Learning Management System (LMS) schema: courses, modules, lessons, enrollments, progress, certificates, and skills mapping.
-- Conforms to: BR-21, BR-22, BR-23, BR-46, BR-47, BR-48, BR-91, BR-92, BR-94, BR-144, BR-150.

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INT NOT NULL DEFAULT 60 CHECK (estimated_duration_minutes > 0),
  passing_score_percent INT NOT NULL DEFAULT 70 CHECK (passing_score_percent BETWEEN 1 AND 100),
  xp_reward INT NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);

-- 2. Course Modules Table (Sequential Ordering BR-47)
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL CHECK (order_index >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);

-- 3. Lessons Table (Prerequisites BR-22, Content Types BR-92, Free Previews BR-94)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'interactive', 'quiz')),
  content_body TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 10 CHECK (duration_minutes > 0),
  order_index INT NOT NULL CHECK (order_index >= 0),
  prerequisite_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_prerequisite ON public.lessons(prerequisite_lesson_id);

-- 4. Course Enrollments Table (Unique Active Enrollment BR-46)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'expired')),
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (progress_percent BETWEEN 0.00 AND 100.00),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments(course_id);

-- 5. Lesson Progress Table (Idempotent Completion BR-21)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment_id ON public.lesson_progress(enrollment_id);

-- 6. Course Certificates Table (Zero-PII Proof BR-150, Linked Evidence BR-23)
CREATE TABLE IF NOT EXISTS public.course_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  verification_proof_hash TEXT NOT NULL,
  evidence_id UUID REFERENCES public.evidence(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('verified', 'revoked', 'expired')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id)
);

CREATE INDEX IF NOT EXISTS idx_course_certificates_number ON public.course_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_course_certificates_proof_hash ON public.course_certificates(verification_proof_hash);

-- 7. Course Skills Table (Canonical Skill Association BR-144)
CREATE TABLE IF NOT EXISTS public.course_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_course_skills_course_id ON public.course_skills(course_id);
CREATE INDEX IF NOT EXISTS idx_course_skills_skill_id ON public.course_skills(skill_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_skills ENABLE ROW LEVEL SECURITY;

-- Courses RLS Policies
CREATE POLICY courses_select_policy ON public.courses
  FOR SELECT USING (
    status = 'published' OR
    instructor_id = auth.uid()
  );

CREATE POLICY courses_insert_policy ON public.courses
  FOR INSERT WITH CHECK (
    instructor_id = auth.uid()
  );

CREATE POLICY courses_update_policy ON public.courses
  FOR UPDATE USING (
    instructor_id = auth.uid()
  );

-- Course Modules RLS Policies
CREATE POLICY course_modules_select_policy ON public.course_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_modules.course_id
      AND (c.status = 'published' OR c.instructor_id = auth.uid())
    )
  );

CREATE POLICY course_modules_write_policy ON public.course_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_modules.course_id
      AND c.instructor_id = auth.uid()
    )
  );

-- Lessons RLS Policies
CREATE POLICY lessons_select_policy ON public.lessons
  FOR SELECT USING (
    is_free_preview = TRUE OR
    EXISTS (
      SELECT 1 FROM public.course_modules m
      JOIN public.courses c ON c.id = m.course_id
      LEFT JOIN public.course_enrollments e ON e.course_id = c.id AND e.user_id = auth.uid()
      WHERE m.id = lessons.module_id
      AND (c.instructor_id = auth.uid() OR e.id IS NOT NULL)
    )
  );

-- Enrollments RLS Policies
CREATE POLICY course_enrollments_select_policy ON public.course_enrollments
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_enrollments.course_id
      AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY course_enrollments_insert_policy ON public.course_enrollments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Lesson Progress RLS Policies
CREATE POLICY lesson_progress_all_policy ON public.lesson_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments e
      WHERE e.id = lesson_progress.enrollment_id
      AND e.user_id = auth.uid()
    )
  );

-- Certificates RLS Policies
CREATE POLICY course_certificates_select_policy ON public.course_certificates
  FOR SELECT USING (TRUE); -- Public verification allowed

-- Course Skills RLS Policies
CREATE POLICY course_skills_select_policy ON public.course_skills
  FOR SELECT USING (TRUE);
