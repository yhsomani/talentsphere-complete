// Static, read-only audit of historic migrations before adapting them for
// hosted Supabase. Do not execute the migrations against a live database.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('supabase/migrations');
const files = fs.readdirSync(dir).filter(name => /^\d{5}_.+\.sql$/.test(name)).sort();
const checks = [
  ['platform_auth_fk', /\bREFERENCES\s+auth\.users\s*\(/gi],
  ['platform_auth_mutation', /\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+TABLE)\s+auth\.users\b/gi],
  ['auth_uid_claim', /\bauth\.uid\s*\(/gi],
  ['auth_jwt_claim', /\bauth\.jwt\s*\(/gi],
  ['security_definer', /\bSECURITY\s+DEFINER\b/gi],
  ['rls_policy', /\bCREATE\s+POLICY\b/gi],
  ['public_view', /\bCREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+public\./gi],
];
const findings = files.map(file => {
  const sql = fs.readFileSync(path.join(dir, file), 'utf8');
  return { file, flags: Object.fromEntries(checks.map(([name, re]) => [name, [...sql.matchAll(re)].length]).filter(([, count]) => count)) };
}).filter(entry => Object.keys(entry.flags).length);
const totals = Object.fromEntries(checks.map(([key]) => [key, findings.reduce((sum, f) => sum + (f.flags[key] ?? 0), 0)]));
console.log(JSON.stringify({ checkedMigrations: files.length, totals, findings }, null, 2));
if (!files.length || totals.platform_auth_fk || totals.platform_auth_mutation || totals.auth_uid_claim || totals.auth_jwt_claim) {
  console.error('BLOCKED: existing migrations require a reviewed hosted-Supabase authentication adaptation.');
  process.exitCode = 1;
}
