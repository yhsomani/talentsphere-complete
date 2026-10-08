import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  loadDotEnv,
  requireDatabaseUrl,
  ensureDatabase,
  ensureSupabaseCompat,
  ensureOrgAliases,
  ensureUsersMirror,
  connect,
} from './lib/pg.mjs';

const MIGRATIONS_DIR = path.resolve('supabase/migrations');

function listMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`Migrations directory not found at ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.error(`No .sql migration files found in ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const expected = files.map((_, i) => String(i + 1).padStart(5, '0'));
  const actual = files.map(f => f.slice(0, 5));
  const gaps = expected.filter((seq, i) => seq !== actual[i]);

  if (gaps.length > 0) {
    console.error('Migration sequence is not contiguous from 00001.');
    console.error(`Expected next sequence numbers: ${gaps.join(', ')}`);
    process.exit(1);
  }

  return files;
}

function verifyFiles(files) {
  let empty = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    if (content.trim().length === 0) {
      console.error(`Migration file is empty: ${file}`);
      empty += 1;
      continue;
    }
    console.log(`  present: ${file} (${content.length} bytes)`);
  }

  if (empty > 0) {
    console.error(`${empty} migration file(s) are empty.`);
    process.exit(1);
  }
}

function checksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function runMigrations() {
  console.log('--- TalentSphere Migration Runner ---');

  const files = listMigrations();
  console.log(`Found ${files.length} migration file(s) in supabase/migrations/`);
  verifyFiles(files);

  loadDotEnv();
  const databaseUrl = requireDatabaseUrl();
  const target = databaseUrl.replace(/:[^:@/]*@/, ':***@');
  console.log(`target: ${target}`);

  await ensureDatabase(databaseUrl);
  const client = await connect(databaseUrl);

  try {
    await ensureSupabaseCompat(client);
    await ensureOrgAliases(client);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const appliedRows = await client.query('SELECT filename, checksum FROM schema_migrations');
    const applied = new Map(appliedRows.rows.map(r => [r.filename, r.checksum]));
    const pending = files.filter(f => !applied.has(f));

    // ponytail: modified-after-apply is reported, not failed; add a hard
    // checksum gate once migrations start changing in anger.
    for (const file of files) {
      if (!applied.has(file)) continue;
      const current = checksum(fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'));
      if (current !== applied.get(file)) {
        console.warn(`  WARNING: ${file} changed after being applied (not re-run).`);
      }
    }

    const results = [];
    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)', [
          file,
          checksum(sql),
        ]);
        await client.query('COMMIT');
        results.push(file);
        console.log(`  applied: ${file}`);
        // Aliases needed by later policies become available as soon as 00001 lands.
        await ensureOrgAliases(client);
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('');
        console.error(`FAILED: ${file}`);
        console.error(`  ${err.message}`);
        console.error(`Applied before failure: ${results.length ? results.join(', ') : '(none)'}`);
        console.error(`Not applied: ${pending.slice(pending.indexOf(file) + 1).join(', ') || '(none)'}`);
        console.error('The failed migration was rolled back; earlier ones remain applied.');
        process.exit(1);
      }
    }

    // Idempotent; must run after migrations so public.users exists.
    await ensureUsersMirror(client);

    if (results.length === 0) {
      console.log(`Already up to date: all ${files.length} migration(s) applied.`);
    } else {
      console.log(`Applied ${results.length} migration(s). Schema is up to date.`);
    }
  } finally {
    await client.end().catch(() => {});
  }
}

runMigrations().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
