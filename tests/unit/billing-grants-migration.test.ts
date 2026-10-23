import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Migration 00053 billing role grants — SQL text assertions, does NOT execute SQL', () => {
  const sql = fs.readFileSync(
    path.resolve('supabase/migrations/00053_billing_role_grants_hardening.sql'),
    'utf8'
  );

  it('removes all client-role access to the Stripe customer mapping', () => {
    expect(sql).toContain('REVOKE ALL ON public.stripe_customers FROM anon, authenticated;');
  });

  it.each(['subscriptions', 'invoices', 'entitlements', 'billing_events'])(
    'keeps client roles from writing public.%s (the API role alone writes billing state)',
    (table) => {
      expect(sql).toContain(
        `REVOKE INSERT, UPDATE, DELETE ON public.${table} FROM anon, authenticated;`
      );
    }
  );

  it('does not widen any access', () => {
    expect(sql).not.toMatch(/\bGRANT\b/i);
    expect(sql).not.toMatch(/\bDISABLE ROW LEVEL SECURITY\b/i);
  });
});
