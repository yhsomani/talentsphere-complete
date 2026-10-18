import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/** Static migration regression checks; real JWT/RLS enforcement needs a
 * PostgreSQL integration test before this migration is deployed. */
describe('SEC: private data RLS hardening migration', () => {
  const sql = fs.readFileSync(
    path.resolve('supabase/migrations/00047_private_data_rls_hardening.sql'),
    'utf8'
  );

  it('uses the owning profile user id for notifications and preferences', () => {
    expect(sql).toContain('p.id = recipient_id AND p.user_id = auth.uid()');
    expect(sql).toContain('p.id = user_id AND p.user_id = auth.uid()');
    expect(sql).not.toMatch(/recipient_id\s*=\s*auth\.uid\(\)/);
  });

  it('avoids recursive participant RLS and rejects direct membership insertion', () => {
    expect(sql).toContain('SECURITY DEFINER');
    expect(sql).toContain("SET search_path = ''");
    expect(sql).toContain('public.is_message_thread_participant(thread_id)');
    expect(sql).toContain('REVOKE INSERT ON public.thread_participants');
    expect(sql).toContain('p.user_id = auth.uid()');
  });

  it('restricts client notification updates to read state only', () => {
    expect(sql).toContain('GRANT UPDATE (is_read, read_at)');
    expect(sql).toContain('REVOKE UPDATE ON public.notifications');
  });

  it('re-enables RLS on all five private tables', () => {
    for (const table of [
      'message_threads',
      'thread_participants',
      'messages',
      'notifications',
      'notification_preferences',
    ]) {
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it('qualifies the outer preference owner in the follow-up migration', () => {
    const fix = fs.readFileSync(
      path.resolve('supabase/migrations/00048_notification_preferences_rls_scope.sql'),
      'utf8'
    );
    expect(fix).toContain('p.id = notification_preferences.user_id');
    expect(fix).not.toMatch(/p\.id\s*=\s*user_id\b/);
  });
});
