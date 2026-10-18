/**
 * Fail CI if a server-only environment value is embedded in the built browser
 * bundle. CI supplies harmless, unique sentinels for each sensitive variable;
 * this does not require production credentials.
 *
 * This is a leak regression check, NOT a replacement for secret scanning of
 * git history, deployment configuration or browser traffic.
 */
import fs from 'node:fs';
import path from 'node:path';

const browserDist = path.resolve('apps/web/dist');
const serverOnly = [
  'TOKEN_SECRET',
  'DATABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'API_AUTH_TOKEN',
  'BILLING_WEBHOOK_SECRET',
];

if (!fs.existsSync(browserDist)) {
  console.error('Browser dist directory missing; build the web app before scanning.');
  process.exit(1);
}

const sentinels = serverOnly.map((key) => ({ key, value: process.env[key] }));
if (sentinels.some(({ value }) => !value || value.length < 20)) {
  console.error('Missing or short CI secret-scan sentinels; refusing an unverified pass.');
  process.exit(1);
}

const textExtensions = new Set(['.js', '.css', '.html', '.json', '.map', '.txt']);
const findings = [];
let scanned = 0;

function scanDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
      continue;
    }
    if (!entry.isFile() || !textExtensions.has(path.extname(entry.name))) continue;

    scanned++;
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const { key, value } of sentinels) {
      if (content.includes(value)) {
        // Never print the secret itself, even if CI later uses real values.
        findings.push(`${path.relative(browserDist, fullPath)} contains ${key}`);
      }
    }
  }
}

scanDirectory(browserDist);
if (scanned === 0) {
  console.error('No browser bundle files were scanned.');
  process.exit(1);
}
if (findings.length > 0) {
  console.error('Server-only values leaked into the browser bundle:');
  findings.forEach((finding) => console.error(`  ${finding}`));
  process.exit(1);
}
console.log(`Client bundle secret-sentinel scan passed (${scanned} files, ${sentinels.length} values).`);
