-- 00016_search_discovery_schema.sql
-- Multi-Entity Backend Search & Command Palette (F-20, F-34, F-32)

CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    entity_type TEXT NOT NULL DEFAULT 'all',
    result_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_created ON public.search_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON public.search_history (user_id, query);

-- Enable RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own search history"
    ON public.search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
    ON public.search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own search history"
    ON public.search_history FOR DELETE
    USING (auth.uid() = user_id);
