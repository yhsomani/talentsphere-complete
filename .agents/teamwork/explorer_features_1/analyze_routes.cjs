const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const serverTsPath = path.join(repoRoot, 'apps/api/src/server.ts');
const content = fs.readFileSync(serverTsPath, 'utf8');

const regex = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;
let match;
const routeMap = [];
while ((match = regex.exec(content)) !== null) {
  const lineNo = content.substring(0, match.index).split('\n').length;
  routeMap.push({
    method: match[1].toUpperCase(),
    path: match[2],
    line: lineNo,
    full: `${match[1].toUpperCase()} ${match[2]}`
  });
}

console.log('Found', routeMap.length, 'routes');
fs.writeFileSync(
  path.join(__dirname, 'routes_with_lines.json'),
  JSON.stringify(routeMap, null, 2)
);
