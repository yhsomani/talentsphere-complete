// New migrations must not expand the historic dependency on Supabase Auth.
// Earlier 00001–00051 migrations are immutable history; review and adapt them
// using a separate hosted track instead of rewriting their checksums.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('supabase/migrations');
const files = fs.readdirSync(dir).filter(f => /^\d{5}_.+\.sql$/.test(f));
const forbidden = [
  /\bauth\.users\b/i,
  /\bauth\.(?:uid|jwt)\s*\(/i,
  /\b(?:CREATE|ALTER|DROP)\s+(?:TABLE|FUNCTION|SCHEMA)\s+auth\./i,
];
// Reviewed exceptions, by exact file name. 00054 names auth.users only to
// repoint foreign keys away from it (owner-approved 2026-11-25).
const reviewed = new Set(['00054_repoint_auth_users_foreign_keys.sql']);
let violations = 0;
for (const file of files) {
  if (Number(file.slice(0, 5)) <= 51 || reviewed.has(file)) continue;
  const sql = fs.readFileSync(path.join(dir, file), 'utf8');
  if (forbidden.some(pattern => pattern.test(sql))) {
    console.error(`Unreviewed platform Auth reference in new migration: ${file}`);
    violations++;
  }
}
if (violations) process.exitCode = 1;
else console.log('New migration platform-Auth dependency guard passed.');
