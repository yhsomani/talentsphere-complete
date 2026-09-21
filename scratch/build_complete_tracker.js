const fs = require('fs');

// We will construct the complete 424-requirement dataset exactly aligned with:
// TalentSphere Project & Product Specification.md

// Let's verify each module and requirement range.
const specPath = 'TalentSphere Project & Product Specification.md';
const specContent = fs.readFileSync(specPath, 'utf8');

console.log('Building authoritative tracker dataset from spec...');

// Helper to check codebase existence
const fsExists = (p) => fs.existsSync(p);

// Define the 27 categories
const categories = [
  { id: 1, name: 'Identity, Authentication & Account Security', prefix: 'AUTH', count: 18, section: '§10.1 & §11 Module 1' },
  { id: 2, name: 'Candidate Profile, Career Identity & Portfolio', prefix: 'PROFILE', count: 14, section: '§10.2 & §11 Module 2' },
  { id: 3, name: 'Organizations, Teams & Employer Verification', prefix: 'ORG', count: 13, section: '§10.3 & §11 Module 3' },
  { id: 4, name: 'Requisitions, Jobs & Talent Marketplace', prefix: 'JOB', count: 16, section: '§10.4 & §11 Module 4' },
  { id: 5, name: 'Applications & Candidate Review Pipeline', prefix: 'APPL', count: 15, section: '§10.5 & §11 Module 5' },
  { id: 6, name: 'Learning Management System', prefix: 'LMS', count: 19, section: '§10.6 & §11 Module 6' },
  { id: 7, name: 'Challenges, Assessment & Code Arena', prefix: 'CHALL', count: 15, section: '§10.8 & §11 Module 7' },
  { id: 8, name: 'Networking, Social & Community', prefix: 'NET', count: 13, section: '§10.9 & §11 Module 8' },
  { id: 9, name: 'Direct Messaging & Video Coordination', prefix: 'MSG', count: 16, section: '§10.10 & §11 Module 9' },
  { id: 10, name: 'Gamification & XP Ledger', prefix: 'GAM', count: 11, section: '§10.11 & §11 Module 10' },
  { id: 11, name: 'Search & Discovery', prefix: 'SRCH', count: 13, section: '§10.12 & §11 Module 11' },
  { id: 12, name: 'Notifications & Preference Center', prefix: 'NTF', count: 11, section: '§10.13 & §11 Module 12' },
  { id: 13, name: 'Billing, Subscriptions & Metering', prefix: 'BILL', count: 32, section: '§10.14 & §11 Module 13' },
  { id: 14, name: 'Trust, Safety & Content Moderation', prefix: 'TRU', count: 12, section: '§10.16 & §11 Module 14' },
  { id: 15, name: 'Platform Administration & Governance', prefix: 'ADM', count: 18, section: '§10.17 & §11 Module 15' },
  { id: 16, name: 'Product Analytics & Telemetry', prefix: 'ANA', count: 10, section: '§10.18 & §11 Module 16' },
  { id: 17, name: 'Chrome Extension Companion', prefix: 'EXT', count: 12, section: '§10.19 & §11 Module 17' },
  { id: 18, name: 'Core Platform Shell & State Machines', prefix: 'CORE', count: 13, section: '§10.20 & §11 Module 18' },
  { id: 19, name: 'Reporting & Dashboards', prefix: 'DASH', count: 10, section: '§10.21 & §11 Module 19' },
  { id: 20, name: 'Integrations & API Ecosystem', prefix: 'INT', count: 16, section: '§10.22 & §11 Module 20' },
  { id: 21, name: 'Localization & Internationalization', prefix: 'L10N', count: 8, section: '§10.23 & §11 Module 21' },
  { id: 22, name: 'Institutional Managed Learning', prefix: 'INST', count: 30, section: '§11 Module 22' },
  { id: 23, name: 'Provider-Agnostic Media Engine', prefix: 'MEDIA', count: 48, section: '§11 Module 23' },
  { id: 24, name: 'Cross-Cutting Security Architecture', prefix: 'SEC', count: 8, section: '§23 Security' },
  { id: 25, name: 'Cross-Cutting Non-Functional Requirements', prefix: 'NFR', count: 7, section: '§29 NFR' },
  { id: 26, name: 'Cross-Cutting SEO Requirements', prefix: 'SEO', count: 18, section: '§38 SEO' },
  { id: 27, name: 'Cross-Cutting DevOps & Operations', prefix: 'OPS', count: 8, section: '§34 DevOps & Deployment' }
];

let totalCount = 0;
categories.forEach(c => totalCount += c.count);
console.log('Total categories:', categories.length, 'Total requirements sum:', totalCount);
