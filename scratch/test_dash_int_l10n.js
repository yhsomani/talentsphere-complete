const fs = require('fs');

const specContent = fs.readFileSync('TalentSphere Project & Product Specification.md', 'utf8');
const specLines = specContent.split('\n');

// DASH (lines 738-750)
const dashRows = [];
for (let i = 737; i < 750; i++) {
  const line = specLines[i].trim();
  if (line.startsWith('|') && line.endsWith('|')) {
    const cells = line.split('|').map(c => c.trim()).slice(1, -1);
    if (cells.length >= 3 && !cells[0].includes('Dashboard') && !cells[0].includes('---')) {
      const idx = dashRows.length + 1;
      const id = `DASH-${String(idx).padStart(3, '0')}`;
      dashRows.push({
        id,
        name: cells[0].replace('RECOMMENDED ADDITION ', ''),
        audience: cells[1],
        metrics: cells[2],
        refresh: cells[3],
        priority: idx <= 3 ? 'MVP' : (idx <= 6 ? 'Post-MVP' : 'Phase 3'),
        specStatus: 'CONFIRMED',
        sourceLine: i + 1
      });
    }
  }
}
console.log('Parsed DASH rows:', dashRows.length, dashRows.map(d => d.id + ': ' + d.name));

// INT & API (lines 755-778)
const intRows = [];
const apiRows = [];
for (let i = 754; i < 778; i++) {
  const line = specLines[i].trim();
  if (line.startsWith('|') && line.endsWith('|')) {
    const cells = line.split('|').map(c => c.trim()).slice(1, -1);
    if (cells.length >= 4 && !cells[0].includes('Integration') && !cells[0].includes('---')) {
      const name = cells[0].replace('RECOMMENDED ADDITION ', '');
      if (intRows.length < 8) {
        const id = `INT-${String(intRows.length + 1).padStart(3, '0')}`;
        intRows.push({
          id,
          name,
          direction: cells[1],
          purpose: cells[2],
          priority: cells[3] || 'MVP',
          auth: cells[4] || '',
          sourceLine: i + 1
        });
      } else if (apiRows.length < 8) {
        const id = `API-${String(apiRows.length + 1).padStart(3, '0')}`;
        apiRows.push({
          id,
          name,
          direction: cells[1],
          purpose: cells[2],
          priority: cells[3] || 'Post-MVP',
          auth: cells[4] || '',
          sourceLine: i + 1
        });
      }
    }
  }
}
console.log('Parsed INT rows:', intRows.length, intRows.map(d => d.id + ': ' + d.name));
console.log('Parsed API rows:', apiRows.length, apiRows.map(d => d.id + ': ' + d.name));

// L10N (lines 783-792)
const l10nRows = [];
for (let i = 782; i < 792; i++) {
  const line = specLines[i].trim();
  if (line.startsWith('|') && line.endsWith('|')) {
    const cells = line.split('|').map(c => c.trim()).slice(1, -1);
    if (cells.length >= 4 && !cells[0].includes('Layer') && !cells[0].includes('---')) {
      const id = `L10N-${String(l10nRows.length + 1).padStart(3, '0')}`;
      l10nRows.push({
        id,
        layer: cells[0],
        scope: cells[1],
        languages: cells[2],
        mechanism: cells[3],
        priority: l10nRows.length < 4 ? 'Phase 2' : (l10nRows.length === 5 ? 'Phase 6' : 'MVP'),
        sourceLine: i + 1
      });
    }
  }
}
// Plus 2 items from §10.23 Principles
l10nRows.push({
  id: 'L10N-007',
  layer: 'User Preference',
  scope: 'Persisted User Locale',
  languages: 'All',
  mechanism: 'Persisted user locale preference (stored on profile; browser detection is a hint only)',
  priority: 'MVP',
  sourceLine: 792
});
l10nRows.push({
  id: 'L10N-008',
  layer: 'Source of Truth',
  scope: 'English Baseline Catalog',
  languages: 'English baseline',
  mechanism: 'All strings extracted to message catalogs; English catalog is source-of-truth baseline diffed against',
  priority: 'MVP',
  sourceLine: 792
});
console.log('Parsed L10N rows:', l10nRows.length, l10nRows.map(d => d.id + ': ' + d.layer));
