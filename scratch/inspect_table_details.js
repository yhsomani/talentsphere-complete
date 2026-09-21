const fs = require('fs');

const specPath = 'c:/Users/yashs/OneDrive/Desktop/talentsphere-complete/TalentSphere Project & Product Specification.md';
const content = fs.readFileSync(specPath, 'utf8');
const lines = content.split('\n');

// Read req_tables.json
const reqTables = JSON.parse(fs.readFileSync('C:/Users/yashs/.gemini/antigravity/brain/be60e8dd-af50-453f-bc81-c97047231b63/scratch/req_tables.json', 'utf8'));

console.log(`Total requirement-like tables: ${reqTables.length}`);

// Group tables by domain/type
const groups = {};
reqTables.forEach(t => {
  const sample = t.sampleId || 'UNKNOWN';
  const prefix = sample.split('-')[0];
  if (!groups[prefix]) groups[prefix] = [];
  groups[prefix].push(t);
});

for (const [p, tbls] of Object.entries(groups)) {
  const totalRows = tbls.reduce((sum, t) => sum + t.rowCount, 0);
  console.log(`Prefix: ${p.padEnd(10)} | Tables: ${tbls.length} | Total Rows: ${totalRows.toString().padEnd(4)} | Lines: ${tbls.map(t => `${t.startLine}-${t.endLine}`).join(', ')}`);
}
