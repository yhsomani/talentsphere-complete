import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Migration 00055 certificate_revocations RLS — SQL text assertions, does NOT execute SQL', () => {
  const sql = fs.readFileSync(
    path.resolve('supabase/migrations/00055_certificate_revocations_rls.sql'),
    'utf8'
  );

  it('enables row level security on the revocation records', () => {
    expect(sql).toContain('ALTER TABLE public.certificate_revocations ENABLE ROW LEVEL SECURITY;');
  });

  it('removes all client-role access to the table', () => {
    expect(sql).toContain('REVOKE ALL ON public.certificate_revocations FROM anon, authenticated;');
  });

  it('does not widen any access', () => {
    expect(sql).not.toMatch(/\bGRANT\b/i);
    expect(sql).not.toMatch(/\bDISABLE ROW LEVEL SECURITY\b/i);
  });
});
