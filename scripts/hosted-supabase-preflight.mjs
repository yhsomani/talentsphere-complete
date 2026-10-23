// Read-only inventory for the currently configured database. Safe on hosted
// Supabase: never writes to auth, public or the Supabase migration ledger.
import { connect, loadDotEnv, requireDatabaseUrl, isHostedSupabase } from './lib/pg.mjs';

loadDotEnv();
const url = requireDatabaseUrl();
const client = await connect(url);
try {
  const [platform, tables, policies, migrationLedger] = await Promise.all([
    isHostedSupabase(client),
    client.query(`
      SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
        c.relforcerowsecurity AS rls_forced
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
      ORDER BY c.relname
    `),
    client.query(`
      SELECT tablename, policyname, cmd, roles
      FROM pg_policies WHERE schemaname='public' ORDER BY tablename,policyname
    `),
    client.query(`SELECT to_regclass('public.schema_migrations') IS NOT NULL AS exists`),
  ]);
  const report = {
    hostedSupabase: platform,
    publicTables: tables.rows,
    policySummary: policies.rows.map(p => ({
      table: p.tablename,
      policy: p.policyname,
      command: p.cmd,
      roles: p.roles,
    })),
    hasApplicationMigrationLedger: migrationLedger.rows[0].exists,
    blockers: [
      ...(platform
        ? ['The existing migration runner cannot be run against hosted Supabase.']
        : []),
      ...tables.rows.filter(t => !t.rls_enabled).map(t => `RLS disabled: ${t.table_name}`),
    ],
  };
  console.log(JSON.stringify(report, null, 2));
  if (report.blockers.length) process.exitCode = 1;
} finally {
  await client.end();
}
