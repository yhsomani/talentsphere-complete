import fs from 'node:fs';
import path from 'node:path';
import { loadDotEnv, requireDatabaseUrl, ensureSupabaseCompat, connect } from './lib/pg.mjs';

const SEED_DIR = path.resolve('supabase/seed');
const MIGRATIONS_DIR = path.resolve('supabase/migrations');

async function runSeed() {
  console.log('--- TalentSphere Database Seeder ---');

  if (!fs.existsSync(SEED_DIR)) {
    fs.mkdirSync(SEED_DIR, { recursive: true });
  }

  const seedFile = path.join(SEED_DIR, '01_initial_seed.sql');
  if (!fs.existsSync(seedFile)) {
    const defaultSeed = `-- Initial Platform Seed
INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('FEATURE_LMS', true, 'Enable Learning Management System'),
  ('FEATURE_CODE_ARENA', true, 'Enable Code Assessment Arena'),
  ('FEATURE_MESSAGING', true, 'Enable Direct Messaging'),
  ('FEATURE_NOTIFICATIONS', true, 'Enable Notification Center'),
  ('FEATURE_AI_MATCHING', false, 'Gated AI matching capability')
ON CONFLICT (key) DO NOTHING;
`;
    fs.writeFileSync(seedFile, defaultSeed, 'utf8');
    console.log(`Created default seed file at ${seedFile}`);
  }

  loadDotEnv();
  const databaseUrl = requireDatabaseUrl();

  const files = fs
    .readdirSync(SEED_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
  const migrationCount = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql')).length;

  const client = await connect(databaseUrl);
  try {
    await ensureSupabaseCompat(client);

    const applied = await client.query(
      'SELECT 1 FROM schema_migrations LIMIT 1'
    ).catch(() => null);
    const ledger = await client
      .query('SELECT count(*)::int AS n FROM schema_migrations')
      .catch(() => ({ rows: [{ n: 0 }] }));

    if (!applied || ledger.rows[0].n < migrationCount) {
      console.error(
        `Refusing to seed: ${ledger.rows[0].n}/${migrationCount} migrations applied. Run "pnpm db:migrate" first.`
      );
      process.exit(1);
    }

    // Seed files must be idempotent (ON CONFLICT DO NOTHING etc.) — they run on every invocation.
    for (const file of files) {
      const sql = fs.readFileSync(path.join(SEED_DIR, file), 'utf8');
      await client.query(sql);
      console.log(`  seeded: ${file}`);
    }

    console.log(`Applied ${files.length} seed file(s).`);
  } finally {
    await client.end().catch(() => {});
  }
}

runSeed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
