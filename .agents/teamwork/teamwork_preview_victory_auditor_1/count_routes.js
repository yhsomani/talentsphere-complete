const fs = require('fs');

const content = fs.readFileSync('apps/api/src/server.ts', 'utf8');
const routes = [];
const re = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;
let m;
while ((m = re.exec(content)) !== null) {
  routes.push({ method: m[1].toUpperCase(), path: m[2] });
}
console.log('Total routes registered:', routes.length);
const methods = {};
routes.forEach(r => methods[r.method] = (methods[r.method] || 0) + 1);
console.log('By method:', methods);

// Also check durable routes
const durability = fs.readFileSync('apps/api/src/durability.ts', 'utf8');
const durableMatches = [...durability.matchAll(/['"`]([^'"`]+)['"`]/g)].map(m => m[1]);
console.log('Total quoted strings in durability.ts:', durableMatches.length);
