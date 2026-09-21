const fs = require('fs');
const content = fs.readFileSync('TalentSphere Project & Product Specification.md', 'utf8');
const lines = content.split('\n');

const idRegex = /\|\s*([A-Z][A-Z0-9_]{1,10}-[0-9]{1,4})\s*\|/;
const ids = new Map();

lines.forEach((l, idx) => {
  const m = l.match(idRegex);
  if (m) {
    const id = m[1];
    const prefix = id.split('-')[0];
    if (!ids.has(prefix)) ids.set(prefix, []);
    ids.get(prefix).push({ id, line: idx + 1, text: l.trim() });
  }
});

console.log('All prefix families found in markdown tables:');
for (const [prefix, list] of ids.entries()) {
  const unique = new Set(list.map(x => x.id));
  console.log('Prefix: ' + prefix.padEnd(10) + ' Total rows: ' + list.length.toString().padEnd(4) + ' Unique IDs: ' + unique.size);
}
