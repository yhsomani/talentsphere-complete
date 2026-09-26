import fs from 'node:fs';
import path from 'node:path';

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

function isPlaceholderDatabaseUrl(databaseUrl) {
  return !databaseUrl || databaseUrl.includes('postgres:postgres@localhost');
}

function runMigrations() {
  console.log('--- TalentSphere Migration File Integrity Check ---');

  const files = listMigrations();
  console.log(`Found ${files.length} migration file(s) in supabase/migrations/`);

  verifyFiles(files);

  const databaseUrl = process.env.DATABASE_URL;

  console.log('');
  console.log('NOTICE: this command performs file-integrity checks only.');
  console.log('NOTICE: it does NOT connect to a database and does NOT apply SQL.');
  console.log('NOTICE: SQL is not parsed here. Only Postgres can validate it.');

  if (isPlaceholderDatabaseUrl(databaseUrl)) {
    console.log('');
    console.log('Result: file integrity OK. No database targeted (placeholder DATABASE_URL).');
    return;
  }

  console.error('');
  console.error('REFUSING TO REPORT SUCCESS: DATABASE_URL points at a real database,');
  console.error('but this project has no Postgres client and no migration runner.');
  console.error('No SQL was applied. The target database is unchanged.');
  console.error('');
  console.error('To actually apply migrations, use the Supabase CLI:');
  console.error('  npx supabase link --project-ref <ref>');
  console.error('  npx supabase db push');
  console.error('');
  console.error('See docs/engineering/DATABASE.md for the authoritative procedure.');
  process.exit(1);
}

runMigrations();
