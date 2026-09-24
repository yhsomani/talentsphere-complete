-- ============================================================================
-- Migration: 00010_networking_connections_schema.sql
-- Description: Professional Networking & Connection Request State Machine (F-09)
-- ============================================================================

-- Connections Table
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    note VARCHAR(500),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_connections_no_self CHECK (sender_id != recipient_id),
    CONSTRAINT uq_connections_pair UNIQUE (sender_id, recipient_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connections_sender ON public.connections(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_recipient ON public.connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY p_connections_participant_read ON public.connections
    FOR SELECT
    USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY p_connections_sender_insert ON public.connections
    FOR INSERT
    WITH CHECK (sender_id = auth.uid() AND sender_id != recipient_id);

CREATE POLICY p_connections_participant_update ON public.connections
    FOR UPDATE
    USING (sender_id = auth.uid() OR recipient_id = auth.uid())
    WITH CHECK (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY p_connections_participant_delete ON public.connections
    FOR DELETE
    USING (sender_id = auth.uid() OR recipient_id = auth.uid());
