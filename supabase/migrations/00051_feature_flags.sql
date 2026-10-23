-- Feature flags (F-35). Server-only; the API is the only reader and writer.
CREATE TABLE IF NOT EXISTS public.feature_flags (
    key TEXT PRIMARY KEY,
    enabled BOOLEAN NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
INSERT INTO public.feature_flags (key, enabled, description, created_at, updated_at) VALUES
    ('FEATURE_LMS', TRUE, 'Learning management system and interactive course modules', now(), now()),
    ('FEATURE_CODE_ARENA', TRUE, 'Competitive coding challenges and assessments', now(), now()),
    ('FEATURE_MESSAGING', TRUE, 'Direct messaging and networking channels', now(), now()),
    ('FEATURE_NOTIFICATIONS', TRUE, 'Real-time and batch notification delivery', now(), now()),
    ('FEATURE_AI_MATCHING', FALSE, 'AI-assisted recruiter candidate matching', now(), now())
ON CONFLICT (key) DO NOTHING;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feature_flags FROM PUBLIC;
