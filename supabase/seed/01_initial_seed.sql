-- Initial Platform Seed
INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('FEATURE_LMS', true, 'Enable Learning Management System'),
  ('FEATURE_CODE_ARENA', true, 'Enable Code Assessment Arena'),
  ('FEATURE_MESSAGING', true, 'Enable Direct Messaging'),
  ('FEATURE_NOTIFICATIONS', true, 'Enable Notification Center'),
  ('FEATURE_AI_MATCHING', false, 'Gated AI matching capability')
ON CONFLICT (key) DO NOTHING;
