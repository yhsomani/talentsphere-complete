const fs = require('fs');
const path = require('path');

// We are constructing the Authoritative Implementation Completion Tracker v3.0.0
// strictly derived from TalentSphere Project & Product Specification.md.

// Load the specification text to extract any exact strings
const specContent = fs.readFileSync('TalentSphere Project & Product Specification.md', 'utf8');
const specLines = specContent.split('\n');

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
          priority: cells[2] || 'MVP',
          specStatus: cells[3] || 'CONFIRMED',
          sourceLine: i + 1
        });
      }
    }
  }
  return rows;
}

// 1. AUTH (18): Lines 324-345
const rawAuth = extractTableRows(324, 345, /^AUTH-[0-9]{3}/);

// 2. CHALL (15): Lines 360-385
const rawChall = extractTableRows(360, 385, /^CHALL-[0-9]{3}/);

// 3. NET (13): Lines 405-425
const rawNet = extractTableRows(405, 425, /^NET-[0-9]{3}/);

// 4. MSG (16): Lines 428-448
const rawMsg = extractTableRows(428, 448, /^MSG-[0-9]{3}/);

// 5. GAM (11): Lines 451-470
const rawGam = extractTableRows(451, 470, /^(GAMI|GAM)-[0-9]{3}/);

// 6. SRCH (13): Lines 491-510
const rawSrch = extractTableRows(491, 510, /^(SEARCH|SRCH)-[0-9]{3}/);

// 7. NTF (11): Lines 515-535
const rawNtf = extractTableRows(515, 535, /^(NOTIF|NTF)-[0-9]{3}/);

// 8. BILL & LIC (32): Lines 548-588
const rawBillLic = extractTableRows(548, 588, /^(BILL|LIC)-[0-9]{3}/);

// 9. TRU (12): Lines 627-650
const rawTru = extractTableRows(627, 650, /^(TRUST|TRU)-[0-9]{3}/);

// 10. ADM (18): Lines 657-683
const rawAdm = extractTableRows(657, 683, /^(ADMIN|ADM)-[0-9]{3}/);

// 11. ANA (10): Lines 685-698
const rawAna = extractTableRows(685, 698, /^(ANALYTICS|ANA)-[0-9]{3}/);

// 12. EXT (12): Lines 700-717
const rawExt = extractTableRows(700, 717, /^EXT-[0-9]{3}/);

// 13. CORE (13): Lines 719-735
const rawCore = extractTableRows(719, 735, /^CORE-[0-9]{3}/);

// 14. INST (30): Lines 4190-4222
const rawInst = extractTableRows(4190, 4222, /^INST-[0-9]{3}/);

// 15. MEDIA (48): Lines 4242-4293
const rawMedia = extractTableRows(4242, 4293, /^MEDIA-[0-9]{3}/);

// 16. SEO (18): Lines 3046-3066
const rawSeo = extractTableRows(3046, 3066, /^SEO-[0-9]{3}/);

// 17. NFR (7): Lines 4987-4996
const rawNfr = extractTableRows(4987, 4996, /^NFR-[0-9]{2}/);

console.log('Parsed table counts:', {
  auth: rawAuth.length,
  chall: rawChall.length,
  net: rawNet.length,
  msg: rawMsg.length,
  gam: rawGam.length,
  srch: rawSrch.length,
  ntf: rawNtf.length,
  billLic: rawBillLic.length,
  tru: rawTru.length,
  adm: rawAdm.length,
  ana: rawAna.length,
  ext: rawExt.length,
  core: rawCore.length,
  inst: rawInst.length,
  media: rawMedia.length,
  seo: rawSeo.length,
  nfr: rawNfr.length
});
