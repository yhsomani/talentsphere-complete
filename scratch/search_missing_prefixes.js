const fs = require('fs');
const content = fs.readFileSync('TalentSphere Project & Product Specification.md', 'utf8');
const lines = content.split('\n');

const prefixes = [
  'PROFILE', 'RESUME', 'PORTFOLIO', 'ORG', 'RECRUIT', 'JOB', 'APPL', 
  'COURSE', 'LMS', 'DASH', 'INT', 'API', 'L10N', 'SEC', 'OPS'
];

prefixes.forEach(p => {
  const occurrences = [];
  const re = new RegExp('\\b' + p + '-[0-9]');
  lines.forEach((l, idx) => {
    if (re.test(l)) {
      occurrences.push({ line: idx + 1, text: l.trim() });
    }
  });
  console.log(p.padEnd(10) + ': occurrences = ' + occurrences.length);
  if (occurrences.length > 0) {
    console.log('  Samples:');
    occurrences.slice(0, 3).forEach(o => console.log(`    L${o.line}: ${o.text.substring(0, 100)}`));
  }
});
