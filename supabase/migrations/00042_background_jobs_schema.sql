-- Migration 00042: Durable background_jobs queue (SSOT §27.1 ADR-009, §27.4 job schema)
-- Transactional queue per the approved dual-queue boundary: Postgres + SKIP LOCKED
-- claiming for bounded, observable background work. Heavy-async (Supabase Queues)
-- is NOT introduced here: no workload in the current surface qualifies as heavy
-- (see ARCHITECTURE.md audit), so adding a broker would be speculative infra.

-- 1. Background Jobs Table (§27.4 canonical schema)
CREATE TABLE IF NOT EXISTS public.background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- §27.4 lifecycle: queued → running → succeeded | failed | dead.
    -- 'canceled' is the M-06/UXC-006 terminal state for operator cancellation.
    status VARCHAR(16) NOT NULL DEFAULT 'queued',
    attempts INTEGER NOT NULL DEFAULT 0,
    run_after TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lock_expires_at TIMESTAMPTZ,
    last_error VARCHAR(4096),
    idempotency_key VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_background_jobs_status
        CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'dead', 'canceled')),
    CONSTRAINT chk_background_jobs_attempts
        CHECK (attempts >= 0)
);

-- §27.4: idempotency_key UNIQUE(kind, idempotency_key). A NULL key means the
-- producer supplied no business key; Postgres treats NULLs as distinct, so
-- keyless dispatch events still enqueue (correct: they are per-instance events).
CREATE UNIQUE INDEX IF NOT EXISTS uq_background_jobs_kind_idempotency
    ON public.background_jobs(kind, idempotency_key);

-- Claim path: FOR UPDATE SKIP LOCKED scans by (status, run_after).
CREATE INDEX IF NOT EXISTS idx_background_jobs_claim
    ON public.background_jobs(status, run_after);

-- Retention purge scans terminal rows by age.
CREATE INDEX IF NOT EXISTS idx_background_jobs_updated_at
    ON public.background_jobs(updated_at);

-- 2. Least privilege: infrastructure table, service-role only.
-- Enabled with NO per-user policies: anon/authenticated are denied outright;
-- the API/worker connect as the service role, which bypasses RLS.
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;
