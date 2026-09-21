const fs = require('fs');
const content = fs.readFileSync('c:/Users/yashs/OneDrive/Desktop/talentsphere-complete/TalentSphere Project & Product Specification.md', 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('canonical routes') || l.includes('Route Path') || l.includes('shared route registry') || l.includes('14.1') || l.includes('Route Registry')) {
    console.log(`L${idx + 1}: ${l.trim().substring(0, 120)}`);
  }
});
