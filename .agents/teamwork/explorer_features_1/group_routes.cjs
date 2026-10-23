const fs = require('fs');
const path = require('path');

const routes = JSON.parse(fs.readFileSync(path.join(__dirname, 'routes_with_lines.json'), 'utf8'));

// Group routes by path prefix
const groups = {};
routes.forEach(r => {
  const parts = r.path.split('/').filter(Boolean);
  // e.g. api, v1, auth
  const group = parts.slice(0, 3).join('/');
  if (!groups[group]) {
    groups[group] = {
      prefix: group,
      routes: [],
      startLine: r.line,
      endLine: r.line
    };
  }
  groups[group].routes.push(r);
  groups[group].endLine = r.line;
});

Object.values(groups).forEach(g => {
  console.log(`${g.prefix.padEnd(30)} | count: ${String(g.routes.length).padStart(2)} | lines: ${String(g.startLine).padStart(5)} - ${String(g.endLine).padStart(5)}`);
});
