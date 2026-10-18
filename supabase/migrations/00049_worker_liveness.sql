-- Server-only worker heartbeat. No direct-client RLS access is granted.
-- The API marks the worker degraded if the newest record is more than 45s old.
CREATE TABLE IF NOT EXISTS public.worker_health (
    id SMALLINT PRIMARY KEY CHECK (id = 1),
    last_seen_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE public.worker_health ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.worker_health FROM PUBLIC;
