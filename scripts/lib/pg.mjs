// Shared Postgres helpers for scripts/migrate.mjs and scripts/seed.mjs.
// Phase 1 (production audit): these scripts now really execute SQL; the
// honesty contract lives in tests/unit/persistence-honesty.test.ts.
import pg from 'pg';

export function loadDotEnv() {
  try {
    process.loadEnvFile('.env');
  } catch {
    // No .env in CI — environment comes from the workflow instead.
  }
}

export function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set.');
    console.error('Set it in .env (see .env.example) or in the environment.');
    process.exit(1);
  }
  return url;
}

/** Same server, different database name (string surgery: no query strings in our URLs). */
export function withDatabase(databaseUrl, dbName) {
  return databaseUrl.replace(/\/[^/]*$/, `/${dbName}`);
}

export function databaseName(databaseUrl) {
  const match = databaseUrl.match(/\/([^/?#]+)(?:[?#]|$)/);
  return match ? match[1] : '';
}

/**
 * Supabase hosts an `auth` schema with auth.uid()/auth.jwt() (and auth.users)
 * that migrations reference. A bare Postgres has none of them, so the runner
 * provides the compatibility shim before applying migrations. Idempotent; no
 * migration file is modified by this.
 *
 * auth.users is created empty here; it becomes an FK-valid mirror of
 * public.users ids via ensureUsersMirror() once migrations (and therefore
 * public.users) exist. Nothing queries auth.users — see ensureUsersMirror.
 */
export async function ensureSupabaseCompat(client) {
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY);
    DO $$ BEGIN
      CREATE ROLE authenticated NOLOGIN;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE ROLE anon NOLOGIN;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
      LANGUAGE sql STABLE AS $$
        SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
    CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
      LANGUAGE sql STABLE AS $$
        SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
      $$
  `);
}

/**
 * Migrations 00016/00018/00022/00023 carry FKs to auth.users(id) — Supabase's
 * platform user table. Under self-owned auth (decision D4) users live in
 * public.users, so auth.users exists ONLY as an FK target: a trigger-maintained
 * mirror of public.users ids. ON DELETE CASCADE flows through it; no application
 * code queries it. Must run after migrations (needs public.users to exist).
 */
export async function ensureUsersMirror(client) {
  await client.query(`
    CREATE OR REPLACE FUNCTION auth.sync_users_mirror() RETURNS trigger
      LANGUAGE plpgsql AS $$
    BEGIN
      IF TG_OP = 'DELETE' THEN
        DELETE FROM auth.users WHERE id = OLD.id;
      ELSE
        INSERT INTO auth.users (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
      END IF;
      RETURN COALESCE(NEW, OLD);
    END;
    $$;
    INSERT INTO auth.users (id) SELECT id FROM public.users ON CONFLICT (id) DO NOTHING;
    CREATE OR REPLACE TRIGGER users_mirror_sync
      AFTER INSERT OR UPDATE OR DELETE ON public.users
      FOR EACH ROW EXECUTE FUNCTION auth.sync_users_mirror();
  `);
}

/**
 * The membership table has four names across migration history: 00001 defines
 * public.org_memberships; 00022/00026 reference organization_members, 00029
 * organization_memberships, 00038-00041 memberships. Rather than editing
 * applied-policy SQL, those names are alias views over org_memberships so
 * every policy reads live membership data from one table. Call after 00001
 * exists (guarded); idempotent.
 */
export async function ensureOrgAliases(client) {
  const present = await client.query(`SELECT to_regclass('public.org_memberships') AS t`);
  if (!present.rows[0].t) return;
  await client.query(`
    CREATE OR REPLACE VIEW public.organization_members AS
      SELECT id, org_id, user_id, role, created_at FROM public.org_memberships;
    CREATE OR REPLACE VIEW public.organization_memberships AS
      SELECT id, org_id, user_id, role, created_at FROM public.org_memberships;
    CREATE OR REPLACE VIEW public.memberships AS
      SELECT id, org_id, user_id, role, created_at, org_id AS organization_id
      FROM public.org_memberships;
  `);
}

/** Create the target database if it does not exist yet (via the maintenance DB). */
export async function ensureDatabase(databaseUrl) {
  const dbName = databaseName(databaseUrl);
  if (!dbName) {
    console.error(`DATABASE_URL has no database name: ${databaseUrl}`);
    process.exit(1);
  }
  const maintenance = new pg.Client({
    connectionString: withDatabase(databaseUrl, 'postgres'),
    connectionTimeoutMillis: 5000,
  });
  await maintenance.connect();
  try {
    const existing = await maintenance.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      dbName,
    ]);
    if (existing.rowCount === 0) {
      await maintenance.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`created database: ${dbName}`);
    }
  } finally {
    await maintenance.end();
  }
}

export async function connect(databaseUrl) {
  const client = new pg.Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
  });
  await client.connect();
  return client;
}
