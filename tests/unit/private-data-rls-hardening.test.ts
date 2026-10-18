import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Static regression checks only. These do NOT prove PostgreSQL RLS works.
 * A database-backed two-user isolation suite is required before deployment.
 */
describe('private data RLS hardening migration', () => {
  const sql = readFileSync(resolve('supabase/migrations/00047_private_data_rls_hardening.sql'), 'utf8');

  it('maps Supabase auth user IDs to profile IDs', () => {
    expect(sql).toMatch(/p\.id\s*=\s*tp\.user_id/);
    expect(sql).toMatch(/p\.user_id\s*=\s*auth\.uid\(\)/);
  });

  it('avoids recursive participant-policy lookups via a fixed-search-path helper', () => {
    expect(sql).toMatch(/FUNCTION public\.is_message_thread_participant\(target_thread_id UUID\)/);
    expect(sql).toMatch(/SECURITY DEFINER\s+SET search_path = ''/);
    expect(sql).toMatch(/thread_participants_select_policy[\s\S]*?public\.is_message_thread_participant\(thread_id\)/);
  });

  it('does not permit direct participant insertion', () => {
    expect(sql).toContain('DROP POLICY IF EXISTS thread_participants_insert_policy');
    expect(sql).toContain('REVOKE INSERT ON public.thread_participants FROM PUBLIC, anon, authenticated');
  });

  it('binds inserted messages to the authenticated sender and thread', () => {
    expect(sql).toMatch(/messages_insert_policy[\s\S]*?is_message_thread_participant\(thread_id\)/);
    expect(sql).toMatch(/p\.id = sender_id AND p\.user_id = auth\.uid\(\)/);
  });

  it('restricts notification updates to read-status columns', () => {
    expect(sql).toContain('REVOKE UPDATE ON public.notifications FROM PUBLIC, anon, authenticated');
    expect(sql).toContain('GRANT UPDATE (is_read, read_at) ON public.notifications TO authenticated');
  });

  it('keeps RLS enabled for all affected tables', () => {
    for (const table of ['message_threads', 'thread_participants', 'messages', 'notifications', 'notification_preferences']) {
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });
});
