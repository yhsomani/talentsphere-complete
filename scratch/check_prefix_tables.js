const fs = require('fs');
const content = fs.readFileSync('TalentSphere Project & Product Specification.md', 'utf8');
const lines = content.split('\n');

const prefixes = [
  'AUTH', 'PROFILE', 'RESUME', 'PORTFOLIO', 'ORG', 'RECRUIT', 'JOB', 'APPL', 
  'COURSE', 'LMS', 'CHALL', 'NET', 'MSG', 'GAMI', 'GAM', 'SEARCH', 'SRCH', 
  'NOTIF', 'NTF', 'BILL', 'LIC', 'TRUST', 'TRU', 'ADMIN', 'ADM', 'ANALYTICS', 
  'ANA', 'EXT', 'CORE', 'DASH', 'INT', 'API', 'L10N', 'INST', 'MEDIA', 'SEO', 
  'NFR', 'SEC', 'OPS'
];

prefixes.forEach(p => {
  const tableRows = [];
  const re = new RegExp('^\\|\\s*' + p + '-[0-9]');
  lines.forEach((l, idx) => {
    if (re.test(l.trim())) {
      tableRows.push({ line: idx + 1, text: l.trim() });
    }
  });
  console.log(p.padEnd(10) + ': table rows = ' + tableRows.length + (tableRows.length > 0 ? ` (first at line ${tableRows[0].line})` : ''));
});
