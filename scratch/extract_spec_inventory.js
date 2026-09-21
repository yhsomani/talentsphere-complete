const fs = require('fs');

const content = fs.readFileSync('c:/Users/yashs/OneDrive/Desktop/talentsphere-complete/TalentSphere Project & Product Specification.md', 'utf8');
const lines = content.split('\n');

// Let's find all requirement tables in Section 10 / 11 and other sections
// Let's list all tables and their section headings

let currentHeading = '';
let currentSection = '';
const sectionTables = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith('#') || /^[0-9]+(\.[0-9]+)*\s+[A-Z]/.test(line)) {
    currentHeading = line;
  }
  
  if (line.startsWith('|') && line.endsWith('|')) {
    const tableLines = [];
    const startLine = i + 1;
    while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
      tableLines.push({ lineNum: i + 1, text: lines[i].trim() });
      i++;
    }
    const endLine = i;
    
    // Parse table
    if (tableLines.length >= 2) {
      const header = tableLines[0].text.split('|').map(s => s.trim()).slice(1, -1);
      const rows = tableLines.slice(2).map(tl => ({
        lineNum: tl.lineNum,
        cells: tl.text.split('|').map(s => s.trim()).slice(1, -1)
      }));
      
      sectionTables.push({
        heading: currentHeading,
        startLine,
        endLine,
        header,
        rows
      });
    }
  }
}

console.log('Total tables parsed:', sectionTables.length);

// Let's find tables that have an ID column and describe requirements
const reqInventory = [];

sectionTables.forEach(st => {
  const h = st.header.map(c => c.toLowerCase());
  const idIdx = h.findIndex(c => c === 'id' || c === 'feature id' || c === 'rule id' || c === 'code prefix' || c === '#');
  if (idIdx === -1) return;
  
  const reqIdx = h.findIndex((c, i) => i !== idIdx && (c.includes('requirement') || c.includes('feature name') || c.includes('rule') || c.includes('name') || c.includes('description') || c.includes('contract')));
  const prioIdx = h.findIndex(c => c.includes('priority') || c.includes('build phase') || c.includes('phase'));
  const statusIdx = h.findIndex(c => c.includes('status') || c.includes('enforcement'));

  st.rows.forEach(r => {
    const id = r.cells[idIdx];
    if (!id) return;
    
    // Valid ID patterns
    const isValidId = /^[A-Z]{2,10}(-[A-Z0-9]+)?-[0-9]{1,4}/.test(id) || /^F-[0-9]{2}/.test(id) || /^BR-[0-9]{2,3}/.test(id);
    if (isValidId) {
      reqInventory.push({
        id,
        heading: st.heading,
        line: r.lineNum,
        requirement: reqIdx !== -1 ? r.cells[reqIdx] : r.cells[1],
        priority: prioIdx !== -1 ? r.cells[prioIdx] : '',
        status: statusIdx !== -1 ? r.cells[statusIdx] : '',
        rawCells: r.cells
      });
    }
  });
});

console.log('Total requirements with explicit table row IDs:', reqInventory.length);

// Group by prefix
const prefixGroups = {};
reqInventory.forEach(r => {
  const prefix = r.id.split('-')[0];
  if (!prefixGroups[prefix]) prefixGroups[prefix] = [];
  prefixGroups[prefix].push(r);
});

console.log('\nPrefixes:');
for (const [p, items] of Object.entries(prefixGroups)) {
  const uniqueIds = new Set(items.map(i => i.id));
  console.log(`Prefix: ${p.padEnd(10)} Total rows: ${items.length.toString().padEnd(4)} Unique IDs: ${uniqueIds.size}`);
}

fs.writeFileSync('C:/Users/yashs/.gemini/antigravity/brain/be60e8dd-af50-453f-bc81-c97047231b63/scratch/spec_raw_inventory.json', JSON.stringify(reqInventory, null, 2));
