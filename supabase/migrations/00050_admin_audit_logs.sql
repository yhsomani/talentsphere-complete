-- Server-only admin audit trail (F-17, BR-067). Append-only from the API;
-- no direct-client RLS access is granted.
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY,
    event_name TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    target_id TEXT,
    target_type TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs (created_at DESC, id DESC);
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_audit_logs FROM PUBLIC;
