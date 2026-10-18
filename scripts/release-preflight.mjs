/**
 * Read-only target-database release preflight. This is NOT a migration runner,
 * backup verifier, legal sign-off, or proof of a deployed staging environment.
 *
 * Usage (from repository root; DATABASE_URL points to the real target):
 *   node scripts/release-preflight.mjs --mode=pre-00043
 *   node scripts/release-preflight.mjs --mode=schema
 *   node scripts/release-preflight.mjs --mode=operational
 *
 * Intended for an operator-controlled CI/CD gate or external health monitor.
 * No user emails, job payloads, credentials or SQL connection strings are logged.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';
import { loadDotEnv, requireDatabaseUrl } from './lib/pg.mjs';
import { assertMigrationHistory } from './lib/migration-integrity.mjs';

const mode = process.argv.find((arg) => arg.startsWith('--mode='))?.slice(7) ?? 'schema';
if (!['pre-00043', 'schema', 'operational'].includes(mode)) {
  console.error('Expected --mode=pre-00043, --mode=schema or --mode=operational');
  process.exit(2);
}

const checks = [];
function record(id, ok, description) {
  checks.push({ id, result: ok ? 'pass' : 'fail', description });
}

async function count(query, sql, params = []) {
  const response = await query(sql, params);
  return Number(response.rows[0]?.n ?? 0);
}

async function run(query) {
  if (mode === 'pre-00043') {
    // 00043 builds a lower(email) unique index; report counts, not addresses.
    const duplicateEmails = await count(
      query,
      'SELECT COUNT(*) AS n FROM (SELECT lower(email) FROM public.users GROUP BY lower(email) HAVING COUNT(*) > 1) duplicates'
    );
    record('email-case-collisions', duplicateEmails === 0, `${duplicateEmails} colliding email group(s)`);

    const activeApplications = await count(
      query,
      "SELECT COUNT(*) AS n FROM (SELECT job_id, candidate_id FROM public.job_applications WHERE status NOT IN ('rejected', 'withdrawn', 'expired') GROUP BY job_id, candidate_id HAVING COUNT(*) > 1) duplicates"
    );
    record('active-application-duplicates', activeApplications === 0, `${activeApplications} conflicting pair(s)`);

    const workHistoryOrphans = await count(
      query,
      'SELECT COUNT(*) AS n FROM public.verified_work_histories h LEFT JOIN public.users u ON u.id = h.candidate_id WHERE u.id IS NULL'
    );
    record('work-history-user-fk-backfill', workHistoryOrphans === 0, `${workHistoryOrphans} row(s) lack matching users`);

    const referenceOrphans = await count(
      query,
      'SELECT COUNT(*) AS n FROM public.employment_references r LEFT JOIN public.users u ON u.id = r.candidate_id WHERE u.id IS NULL'
    );
    record('reference-user-fk-backfill', referenceOrphans === 0, `${referenceOrphans} row(s) lack matching users`);
    return;
  }

  const dir = path.resolve('supabase/migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql') && /^[0-9]{5}_/.test(f)).sort();
  const ledger = await query('SELECT filename, checksum FROM public.schema_migrations');
  try {
    assertMigrationHistory(files, ledger.rows, (file) =>
      crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, file))).digest('hex')
    );
    record('migration-ledger-integrity', true, `${ledger.rows.length} applied migration(s) match files`);
  } catch {
    record('migration-ledger-integrity', false, 'Applied files, checksums or order do not match the repository');
  }

  const applied = new Set(ledger.rows.map((row) => row.filename));
  for (const migration of ['00043_core_persistence_alignment.sql', '00049_worker_liveness.sql']) {
    record(`required-${migration.slice(0, 5)}`, applied.has(migration), 'Required migration in target ledger');
  }

  const requiredIndexes = ['uq_users_email_lower', 'uq_job_applications_one_active'];
  const indexRows = await query(
    "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname = ANY($1::text[])",
    [requiredIndexes]
  );
  const indexes = new Set(indexRows.rows.map((row) => row.indexname));
  for (const name of requiredIndexes) {
    record(`index-${name}`, indexes.has(name), 'Required uniqueness constraint/index exists');
  }

  const requiredForeignKeys = [
    'verified_work_histories_candidate_id_fkey',
    'employment_references_candidate_id_fkey',
    'employment_references_referee_id_fkey',
  ];
  const fkRows = await query(
    "SELECT conname, confrelid = 'public.users'::regclass AS targets_users FROM pg_constraint WHERE conname = ANY($1::text[])",
    [requiredForeignKeys]
  );
  const fks = new Map(fkRows.rows.map((row) => [row.conname, row.targets_users]));
  for (const name of requiredForeignKeys) {
    record(`foreign-key-${name}`, fks.get(name) === true, 'Foreign key must target public.users');
  }

  const rlsTables = [
    'background_jobs',
    'worker_health',
    'work_history_email_challenges',
    'user_settings',
    'data_erasure_requests',
    'data_export_requests',
  ];
  const rlsRows = await query(
    "SELECT c.relname, c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = ANY($1::text[]) AND c.relkind = 'r'",
    [rlsTables]
  );
  const rls = new Map(rlsRows.rows.map((row) => [row.relname, row.relrowsecurity]));
  for (const table of rlsTables) {
    record(`rls-${table}`, rls.get(table) === true, 'Row-level security enabled');
  }

  // Read-only schema checks can run on clean CI databases without a worker.
  if (mode !== 'operational') return;

  const beat = await query(
    'SELECT EXTRACT(EPOCH FROM (now() - last_seen_at))::float8 AS seconds FROM public.worker_health WHERE id = 1'
  );
  const seconds = beat.rows[0] ? Number(beat.rows[0].seconds) : null;
  record(
    'worker-heartbeat',
    seconds !== null && seconds >= -5 && seconds <= 45,
    seconds === null ? 'No worker heartbeat' : `Worker heartbeat age ${Math.round(seconds)}s (maximum 45s)`
  );

  const staleQueued = await count(
    query,
    "SELECT COUNT(*) AS n FROM public.background_jobs WHERE status = 'queued' AND run_after < now() - interval '5 minutes'"
  );
  record('queued-jobs-overdue', staleQueued === 0, `${staleQueued} queued job(s) overdue by more than 5 minutes`);

  const recentlyFailed = await count(
    query,
    "SELECT COUNT(*) AS n FROM public.background_jobs WHERE status IN ('dead', 'failed') AND updated_at > now() - interval '1 hour'"
  );
  record('recent-terminal-job-failures', recentlyFailed === 0, `${recentlyFailed} terminal failure(s) in the past hour`);
}

loadDotEnv();
const databaseUrl = requireDatabaseUrl();
const client = new pg.Client({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 });
try {
  await client.connect();
  // Protect target data even if later diagnostics are expanded.
  await client.query('BEGIN READ ONLY');
  await run((sql, params) => client.query(sql, params));
  await client.query('ROLLBACK');
  console.log(JSON.stringify({ mode, checks, ready: checks.every((c) => c.result === 'pass') }, null, 2));
  if (checks.some((c) => c.result === 'fail')) process.exitCode = 1;
} catch {
  // Provider/SQL errors may carry credentials. Never echo raw exceptions.
  console.error(JSON.stringify({ mode, ready: false, error: 'Database preflight could not complete; verify schema and connection securely.' }));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
