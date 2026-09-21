const fs = require('fs');

const specPath = 'c:/Users/yashs/OneDrive/Desktop/talentsphere-complete/TalentSphere Project & Product Specification.md';
const content = fs.readFileSync(specPath, 'utf8');
const lines = content.split('\n');

// Let's inspect how the specification defines the requirements baseline.
// Notice in lines 4148-4170 (Module 1-21 Summary) + Module 22 + Module 23:
// Total Module Requirement families:
// Module 1: AUTH-001..018 (18)
// Module 2: PROFILE-001..010 (10), RESUME-001..003 (3), PORTFOLIO-001 (1) -> 14
// Module 3: ORG-001..008 (8), RECRUIT-001..005 (5) -> 13
// Module 4: JOB-001..016 (16)
// Module 5: APPL-001..015 (15)
// Module 6: COURSE-001..005 (5), LMS-001..014 (14) -> 19
// Module 7: CHALL-001..015 (15)
// Module 8: NET-001..013 (13)
// Module 9: MSG-001..016 (16)
// Module 10: GAMI-001..004 (4), GAM-005..011 (7) -> 11
// Module 11: SEARCH-001..003 (3), SRCH-001..010 (10) -> 13
// Module 12: NOTIF-001..005 (5), NTF-006..011 (6) -> 11
// Module 13: BILL-001..014 (14), LIC-001..018 (18) -> 32
// Module 14: TRUST-001..004 (4), TRU-005..012 (8) -> 12
// Module 15: ADMIN-001..007 (7), ADM-008..018 (11) -> 18
// Module 16: ANALYTICS-001..003 (3), ANA-004..010 (7) -> 10
// Module 17: EXT-001..012 (12)
// Module 18: CORE-001..013 (13)
// Module 19: DASH-001..010 (10)
// Module 20: INT-001..008 (8), API-001..008 (8) -> 16
// Module 21: L10N-001..008 (8)
// Module 22: INST-001..030 (30)
// Module 23: MEDIA-001..048 (48)

const moduleSummary = [
  { module: 1, name: 'Identity, Authentication & Account Security', families: ['AUTH-001..018'], count: 18 },
  { module: 2, name: 'Candidate Profile, Career Identity & Portfolio', families: ['PROFILE-001..010', 'RESUME-001..003', 'PORTFOLIO-001'], count: 14 },
  { module: 3, name: 'Organizations, Teams & Employer Verification', families: ['ORG-001..008', 'RECRUIT-001..005'], count: 13 },
  { module: 4, name: 'Requisitions, Jobs & Talent Marketplace', families: ['JOB-001..016'], count: 16 },
  { module: 5, name: 'Applications & Candidate Review Pipeline', families: ['APPL-001..015'], count: 15 },
  { module: 6, name: 'Learning Management System', families: ['COURSE-001..005', 'LMS-001..014'], count: 19 },
  { module: 7, name: 'Challenges, Assessment & Code Arena', families: ['CHALL-001..015'], count: 15 },
  { module: 8, name: 'Networking, Social & Community', families: ['NET-001..013'], count: 13 },
  { module: 9, name: 'Direct Messaging & Video Coordination', families: ['MSG-001..016'], count: 16 },
  { module: 10, name: 'Gamification & XP Ledger', families: ['GAMI-001..004', 'GAM-005..011'], count: 11 },
  { module: 11, name: 'Search & Discovery', families: ['SEARCH-001..003', 'SRCH-001..010'], count: 13 },
  { module: 12, name: 'Notifications & Preference Center', families: ['NOTIF-001..005', 'NTF-006..011'], count: 11 },
  { module: 13, name: 'Billing, Subscriptions & Metering', families: ['BILL-001..014', 'LIC-001..018'], count: 32 },
  { module: 14, name: 'Trust, Safety & Content Moderation', families: ['TRUST-001..004', 'TRU-005..012'], count: 12 },
  { module: 15, name: 'Platform Administration & Governance', families: ['ADMIN-001..007', 'ADM-008..018'], count: 18 },
  { module: 16, name: 'Product Analytics & Telemetry', families: ['ANALYTICS-001..003', 'ANA-004..010'], count: 10 },
  { module: 17, name: 'Chrome Extension Companion', families: ['EXT-001..012'], count: 12 },
  { module: 18, name: 'Core Platform Shell & State Machines', families: ['CORE-001..013'], count: 13 },
  { module: 19, name: 'Reporting & Dashboards', families: ['DASH-001..010'], count: 10 },
  { module: 20, name: 'Integrations & API Ecosystem', families: ['INT-001..008', 'API-001..008'], count: 16 },
  { module: 21, name: 'Localization & Internationalization', families: ['L10N-001..008'], count: 8 },
  { module: 22, name: 'Institutional Managed Learning', families: ['INST-001..030'], count: 30 },
  { module: 23, name: 'Provider-Agnostic Media Engine', families: ['MEDIA-001..048'], count: 48 }
];

let totalModuleReqs = 0;
moduleSummary.forEach(m => totalModuleReqs += m.count);
console.log('Total Domain Module Functional Requirements:', totalModuleReqs);
console.table(moduleSummary);
