-- 00017_moderation_trust_safety_schema.sql
-- Trust, Safety & Moderation Schema (F-24, BR-34, BR-059, BR-068, BR-125, WIT-008, WIT-013)

CREATE TABLE IF NOT EXISTS public.moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'job', 'message', 'evidence', 'review', 'portfolio_project')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'fraud', 'inappropriate', 'intellectual_property', 'security_violation', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action_taken TEXT NOT NULL DEFAULT 'none' CHECK (action_taken IN ('none', 'warning', 'content_removed', 'user_suspended', 'user_banned', 'dismissed')),
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  appeal_eligible_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON public.moderation_reports(status);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_target ON public.moderation_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_reporter ON public.moderation_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_severity ON public.moderation_reports(severity);

CREATE TABLE IF NOT EXISTS public.moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.moderation_reports(id) ON DELETE CASCADE,
  appellant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'upheld', 'denied')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  decision_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_appeals_report ON public.moderation_appeals(report_id);
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_appellant ON public.moderation_appeals(appellant_id);
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_status ON public.moderation_appeals(status);

-- Enable RLS
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_appeals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moderation_reports
CREATE POLICY "Users can create reports"
  ON public.moderation_reports
  FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Reporters can view their own submitted reports"
  ON public.moderation_reports
  FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY "Moderators and platform admins can view all reports"
  ON public.moderation_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (
        'moderator' = ANY(users.roles) OR
        'platform_admin' = ANY(users.roles)
      )
    )
  );

CREATE POLICY "Moderators and platform admins can update reports"
  ON public.moderation_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (
        'moderator' = ANY(users.roles) OR
        'platform_admin' = ANY(users.roles)
      )
    )
  );

-- RLS Policies for moderation_appeals
CREATE POLICY "Appellants can create appeals"
  ON public.moderation_appeals
  FOR INSERT
  WITH CHECK (appellant_id = auth.uid());

CREATE POLICY "Appellants can view their own appeals"
  ON public.moderation_appeals
  FOR SELECT
  USING (appellant_id = auth.uid());

CREATE POLICY "Moderators and platform admins can view and update appeals"
  ON public.moderation_appeals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (
        'moderator' = ANY(users.roles) OR
        'platform_admin' = ANY(users.roles)
      )
    )
  );
