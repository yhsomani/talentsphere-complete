-- TalentSphere — Migration 00020: Product Analytics & Telemetry Schema (F-19, F-31, BR-27)
-- Supports privacy-preserving product telemetry, metadata allowlisting, and KPI rollups.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  anonymous_id VARCHAR(100),
  event_type VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  ip_hash VARCHAR(64),
  user_agent VARCHAR(255),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.analytics_daily_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  value NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}'::jsonb NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_daily_kpi UNIQUE (date, metric_name, dimensions)
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_kpis_date ON public.analytics_daily_kpis(date);

-- RLS: Telemetry is admin-governed; users can only ingest events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can ingest analytics events"
  ON public.analytics_events
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Platform admins can view analytics events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND 'platform_admin' = ANY(users.roles)
    )
  );

CREATE POLICY "Platform admins can manage analytics KPIs"
  ON public.analytics_daily_kpis
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND 'platform_admin' = ANY(users.roles)
    )
  );
