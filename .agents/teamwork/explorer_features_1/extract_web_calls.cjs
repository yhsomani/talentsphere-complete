const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const webSrcDir = path.join(repoRoot, 'apps/web/src');

function walk(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const f of list) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files = files.concat(walk(full));
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(webSrcDir);
const apiCalls = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(repoRoot, f).replace(/\\/g, '/');
  // Look for /api/v1/... strings
  const regex = /['"`](\/api\/v1\/[^'"`\s\?]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    apiCalls.push({
      file: relPath,
      endpoint: match[1]
    });
  }
});

console.log('Total web API calls found:', apiCalls.length);
const uniqueEndpoints = Array.from(new Set(apiCalls.map(a => a.endpoint))).sort();
console.log('Unique endpoints called by UI:');
uniqueEndpoints.forEach(e => console.log('  ', e));

fs.writeFileSync(
  path.join(__dirname, 'web_api_calls.json'),
  JSON.stringify({ apiCalls, uniqueEndpoints }, null, 2)
);
