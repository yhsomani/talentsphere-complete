import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Text scan over migration files — does NOT execute SQL. Guards the class of
// defect that first-time execution surfaced: relations referenced by policies/FKs
// that no migration creates (naming drift across migration history).
describe('Migration reference integrity', () => {
  const dir = path.resolve('supabase/migrations');
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  // Relations provided by the compatibility shim in scripts/lib/pg.mjs,
  // not by any migration file. Kept in sync by the second test below.
  const shimProvided = new Set([
    'auth.users', // Supabase platform table; trigger-maintained mirror of public.users
    'public.organization_members', // alias views over org_memberships — naming
    'public.organization_memberships', // drift: 00022/00026, 00029, 00038-00041
    'public.memberships', // were authored under older table names
  ]);

  it('every referenced public/auth relation is created by a migration or the shim', () => {
    const created = new Set<string>();
    const referenced = new Map<string, Set<string>>();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');

      for (const m of sql.matchAll(
        /CREATE\s+(?:OR\s+REPLACE\s+)?(?:TABLE|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?((?:public|auth)\.[a-z_]+)/gi
      )) {
        created.add(m[1].toLowerCase());
      }

      for (const re of [
        /\bFROM\s+((?:public|auth)\.[a-z_]+)/gi,
        /\bJOIN\s+((?:public|auth)\.[a-z_]+)/gi,
        /\bREFERENCES\s+((?:public|auth)\.[a-z_]+)/gi,
        /\bON\s+((?:public|auth)\.[a-z_]+)/gi, // CREATE POLICY ... ON <table>
      ]) {
        for (const m of sql.matchAll(re)) {
          const name = m[1].toLowerCase();
          if (!referenced.has(name)) referenced.set(name, new Set());
          referenced.get(name)!.add(file);
        }
      }
    }

    const missing = [...referenced.keys()]
      .filter((r) => !created.has(r) && !shimProvided.has(r))
      .sort()
      .map((name) => `${name} <- ${[...referenced.get(name)!].join(', ')}`);

    expect(missing).toEqual([]);
  });

  it('the shim-provided list matches the compat shim source', () => {
    const shim = fs.readFileSync(path.resolve('scripts/lib/pg.mjs'), 'utf8');
    expect(shim).toMatch(/CREATE TABLE IF NOT EXISTS auth\.users/);
    expect(shim).toMatch(/public\.organization_members AS/);
    expect(shim).toMatch(/public\.organization_memberships AS/);
    expect(shim).toMatch(/public\.memberships AS/);
  });
});
