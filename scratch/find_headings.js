const fs = require('fs');
const content = fs.readFileSync('c:/Users/yashs/OneDrive/Desktop/talentsphere-complete/TalentSphere Project & Product Specification.md', 'utf8');
const lines = content.split('\n');

// Find lines in Part 1 that mention sections or descriptions of profile, jobs, applications, lms
const topics = ['Candidate Profile', 'Resume', 'Portfolio', 'Organization', 'Requisition', 'Job', 'Application', 'LMS', 'Course'];

lines.forEach((l, idx) => {
  const lineNum = idx + 1;
  if (lineNum > 3676) return;
  const trimmed = l.trim();
  if (trimmed.startsWith('#') || /^[0-9]+(\.[0-9]+)*\s+[A-Z]/.test(trimmed)) {
    topics.forEach(t => {
      if (trimmed.toLowerCase().includes(t.toLowerCase())) {
        console.log(`L${lineNum}: ${trimmed}`);
      }
    });
  }
});
