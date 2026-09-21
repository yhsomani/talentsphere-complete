const fs = require('fs');

// We will parse all explicit tables from TalentSphere Project & Product Specification.md
const specContent = fs.readFileSync('TalentSphere Project & Product Specification.md', 'utf8');
const specLines = specContent.split('\n');

// Parse table rows by prefix
function extractTableRows(startLine, endLine, idRegex) {
  const rows = [];
  for (let i = startLine - 1; i < Math.min(endLine, specLines.length); i++) {
    const line = specLines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).slice(1, -1);
      if (cells.length >= 2 && idRegex.test(cells[0])) {
        rows.push({
          id: cells[0],
          name: cells[1],
          priority: cells[2] || '',
          status: cells[3] || '',
          raw: line,
          lineNum: i + 1
        });
      }
    }
  }
  return rows;
}

// 1. AUTH (18): Lines 324-344
const authRows = extractTableRows(324, 345, /^AUTH-[0-9]{3}/);
console.log('Parsed AUTH rows:', authRows.length);

// 2. CHALL (15): Lines 360-385
const challRows = extractTableRows(360, 385, /^CHALL-[0-9]{3}/);
console.log('Parsed CHALL rows:', challRows.length);

// 3. NET (13): Lines 405-425
const netRows = extractTableRows(405, 425, /^NET-[0-9]{3}/);
console.log('Parsed NET rows:', netRows.length);

// 4. MSG (16): Lines 428-448
const msgRows = extractTableRows(428, 448, /^MSG-[0-9]{3}/);
console.log('Parsed MSG rows:', msgRows.length);

// 5. GAM (11): Lines 451-470
const gamRows = extractTableRows(451, 470, /^(GAMI|GAM)-[0-9]{3}/);
console.log('Parsed GAM rows:', gamRows.length);

// 6. SRCH (13): Lines 491-510
const srchRows = extractTableRows(491, 510, /^(SEARCH|SRCH)-[0-9]{3}/);
console.log('Parsed SRCH rows:', srchRows.length);

// 7. NTF (11): Lines 515-535
const ntfRows = extractTableRows(515, 535, /^(NOTIF|NTF)-[0-9]{3}/);
console.log('Parsed NTF rows:', ntfRows.length);

// 8. BILL & LIC (32): Lines 548-588
const billRows = extractTableRows(548, 588, /^(BILL|LIC)-[0-9]{3}/);
console.log('Parsed BILL & LIC rows:', billRows.length);

// 9. TRU (12): Lines 627-650
const truRows = extractTableRows(627, 650, /^(TRUST|TRU)-[0-9]{3}/);
console.log('Parsed TRU rows:', truRows.length);

// 10. ADM (18): Lines 657-680
const admRows = extractTableRows(657, 680, /^(ADMIN|ADM)-[0-9]{3}/);
console.log('Parsed ADM rows:', admRows.length);

// 11. ANA (10): Lines 685-698
const anaRows = extractTableRows(685, 698, /^(ANALYTICS|ANA)-[0-9]{3}/);
console.log('Parsed ANA rows:', anaRows.length);

// 12. EXT (12): Lines 700-717
const extRows = extractTableRows(700, 717, /^EXT-[0-9]{3}/);
console.log('Parsed EXT rows:', extRows.length);

// 13. CORE (13): Lines 719-735
const coreRows = extractTableRows(719, 735, /^CORE-[0-9]{3}/);
console.log('Parsed CORE rows:', coreRows.length);

// 14. INST (30): Lines 4190-4222
const instRows = extractTableRows(4190, 4222, /^INST-[0-9]{3}/);
console.log('Parsed INST rows:', instRows.length);

// 15. MEDIA (48): Lines 4242-4293
const mediaRows = extractTableRows(4242, 4293, /^MEDIA-[0-9]{3}/);
console.log('Parsed MEDIA rows:', mediaRows.length);

// 16. SEO (18): Lines 3046-3066
const seoRows = extractTableRows(3046, 3066, /^SEO-[0-9]{3}/);
console.log('Parsed SEO rows:', seoRows.length);

// 17. NFR (7): Lines 4987-4996
const nfrRows = extractTableRows(4987, 4996, /^NFR-[0-9]{2}/);
console.log('Parsed NFR rows:', nfrRows.length);
