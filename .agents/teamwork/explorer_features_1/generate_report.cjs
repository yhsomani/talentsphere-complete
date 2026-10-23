const fs = require('fs');
const path = require('path');

const matrixData = JSON.parse(fs.readFileSync(path.join(__dirname, 'traceability_matrix.json'), 'utf8'));
const { stats, matrix } = matrixData;

let md = '';

md += `# TalentSphere — Canonical 173 Features Master Audit & Traceability Report\n\n`;
md += `**Date:** 2026-10-22  \n`;
md += `**Auditor:** Teamwork Canonical Features Audit Explorer (\`explorer_features_1\`)  \n`;
md += `**Workspace:** \`talentsphere-complete\` (\`repository_audit_roadmap\`)  \n`;
md += `**Authority:** SSOT.md v6.0, FEATURE_REGISTRY.md v6.0, PRD.md, TRD.md, ADR-015, apps/api/src/server.ts, packages/domain, apps/web, supabase/migrations  \n\n`;

md += `---\n\n`;

md += `## 1. Executive Summary\n\n`;
md += `An exhaustive, code-level audit was conducted across all **173 canonical features** (F-01 through F-173) defined in the TalentSphere capability registry (\`docs/registries/FEATURE_REGISTRY.md\`). Every feature was cross-referenced against:\n`;
md += `1. **Fastify API Routes** in \`apps/api/src/server.ts\` (exactly **274 routes**).\n`;
md += `2. **Domain Models & Services** in \`packages/domain/src/\` (**48 TypeScript modules**).\n`;
md += `3. **Frontend UI Routes & Components** in \`apps/web/src/\` (**20 pages**, **16 components**).\n`;
md += `4. **Database Migrations** in \`supabase/migrations/\` (**49 PostgreSQL migrations**).\n`;
md += `5. **Durability Classifications** pursuant to ADR-015 and the \`x-talentsphere-durability\` header runtime enforcement.\n\n`;

md += `### High-Level Audit Findings\n\n`;
md += `| Implementation Status | Count | Percentage | Definition |\n`;
md += `|---|---|---|---|\n`;
md += `| **Full** | **${stats.full}** | ${(stats.full/stats.total*100).toFixed(1)}% | Fully implemented end-to-end: DB Migration + Domain Model + API Endpoint + UI View/Page + Passing Tests |\n`;
md += `| **Partial** | **${stats.partial}** | ${(stats.partial/stats.total*100).toFixed(1)}% | Substantial implementation (Domain + Migration + API), but running in-memory (\`ephemeral\`) and/or missing Web UI |\n`;
md += `| **Stub / Mock** | **${stats.stubMock}** | ${(stats.stubMock/stats.total*100).toFixed(1)}% | Deprecated legacy stubs (F-38, F-39) or explicitly gated/prohibited concepts (F-45, F-61, F-62, F-63) |\n`;
md += `| **Missing** | **${stats.missing}** | ${(stats.missing/stats.total*100).toFixed(1)}% | Planned/deferred to future roadmap phases (Ph4–Ph10), Edge extensions, or unbuilt enterprise modules |\n`;
md += `| **Total Canonical Features** | **${stats.total}** | **100%** | Complete inventory from F-01 through F-173 |\n\n`;

md += `### Durability Distribution Across API Surface\n\n`;
md += `In accordance with **ADR-015** (*Core Career Loop Single-Writer Persistence*), runtime persistence is strictly segregated:\n`;
md += `- **Durable Features (${stats.durable})**: Persist to PostgreSQL via \`DURABLE_ROUTES\` (**66 routes**). Writes pass through \`storage.persist()\` with single-writer lease protection (\`advisory_lock\`). Covered by Playwright E2E and real-DB integration tests.\n`;
md += `- **Ephemeral Features (${stats.ephemeral})**: Handled in Fastify via in-process \`Map\` collections (**205 routes**). State is wiped on service restart, and HTTP responses explicitly return \`x-talentsphere-durability: ephemeral\`.\n`;
md += `- **Stateless Features (${stats.stateless})**: Health diagnostics and static billing plan catalogs (**3 routes**).\n`;
md += `- **Non-API / Future Scope (${stats.na})**: Features without direct HTTP routes in \`server.ts\` (**55 features**).\n\n`;

md += `---\n\n`;

md += `## 2. Methodology & Reality Separation\n\n`;
md += `In compliance with the TalentSphere Constitution and SSOT §Reality Separation:\n`;
md += `\`\`\`text\n`;
md += `DOCUMENTED ≠ IMPLEMENTED\n`;
md += `IMPLEMENTED ≠ VERIFIED\n`;
md += `VERIFIED ≠ PRODUCTION-READY\n`;
md += `\`\`\`\n\n`;
md += `Our audit applied the following classification rubric:\n`;
md += `- **Full**: The feature has a dedicated table in \`supabase/migrations/\`, pure business logic in \`packages/domain/\`, a Fastify route in \`apps/api/src/server.ts\` (durable storage mode), an interactive user route/component in \`apps/web/\`, and test verification.\n`;
md += `- **Partial**: Backend models and endpoints exist and pass unit/integration tests, but state is ephemeral (memory-only) or frontend UI is missing/mocked.\n`;
md += `- **Stub / Mock**: Either an endpoint or UI mock exists with placeholder logic, or the feature is marked deprecated/prohibited in SSOT.\n`;
md += `- **Missing**: No executable code, migrations, or routes exist in the active monorepo.\n\n`;

md += `---\n\n`;

md += `## 3. Monorepo Structural Breakdown\n\n`;
md += `### 3.1 Fastify Server API Surface (\`apps/api/src/server.ts\`)\n`;
md += `The server comprises **13,405 lines of TypeScript** defining **274 HTTP route registrations** across 43 route prefixes:\n`;
md += `- \`/api/v1/auth\` (6 routes) — Durable identity & session lifecycle.\n`;
md += `- \`/api/v1/profile\` (3 routes) — Durable candidate profiles.\n`;
md += `- \`/api/v1/evidence\` (8 routes) — Durable cryptographic proof & validation.\n`;
md += `- \`/api/v1/skills\` (16 routes) — Durable taxonomy (search/CRUD) + ephemeral freshness/decay/forecasts.\n`;
md += `- \`/api/v1/organizations\` (7 routes) — Durable enterprise & hiring orgs.\n`;
md += `- \`/api/v1/jobs\` (22 routes) — Durable postings, bookmarks, saved searches, applications.\n`;
md += `- \`/api/v1/job-templates\` (6 routes) — Ephemeral posting templates.\n`;
md += `- \`/api/v1/salaries\` (5 routes) — Ephemeral differential privacy salary benchmarks.\n`;
md += `- \`/api/v1/applications\` (7 routes) — Durable state transitions + ephemeral feedback.\n`;
md += `- \`/api/v1/candidates\` (8 routes) — Durable work history & referee verification graph.\n`;
md += `- \`/api/v1/interviews\` (13 routes) — Ephemeral technical interview rooms & scorecards.\n`;
md += `- \`/api/v1/reputation\` (15 routes) — Ephemeral multi-context reputation signals.\n`;
md += `- \`/api/v1/challenges\` (5 routes) — Ephemeral arena sessions with \`AI_PROHIBITED\` guards.\n`;
md += `- \`/api/v1/ai\` (6 routes) — Ephemeral career assistant, conversations, quota metering.\n`;
md += `- \`/api/v1/courses\`, \`/api/v1/modules\`, \`/api/v1/lessons\`, \`/api/v1/certificates\` (13 routes) — Ephemeral LMS pipeline.\n`;
md += `- \`/api/v1/threads\` (5 routes) — Durable direct messaging.\n`;
md += `- \`/api/v1/notifications\` (5 routes) — Durable notification center & preferences.\n`;
md += `- \`/api/v1/resumes\` (7 routes) — Ephemeral resume builder & exports.\n`;
md += `- \`/api/v1/connections\` & \`/api/v1/networking\` (14 routes) — Ephemeral connections & warm introductions.\n`;
md += `- \`/api/v1/referrals\` (6 routes) — Ephemeral employee referrals.\n`;
md += `- \`/api/v1/career\` (6 routes) — Ephemeral trajectory transitions & benchmarks.\n`;
md += `- \`/api/v1/learning\` (4 routes) — Ephemeral learning outcomes & impact metrics.\n`;
md += `- \`/api/v1/recruiter\` (13 routes) — Ephemeral talent pools & segmentation.\n`;
md += `- \`/api/v1/alumni\` (11 routes) — Ephemeral alumni networks & mentorship.\n`;
md += `- \`/api/v1/activity\` (5 routes) — Ephemeral contribution scoring.\n`;
md += `- \`/api/v1/portfolio\` (6 routes) — Ephemeral project showcase.\n`;
md += `- \`/api/v1/gamification\` (5 routes) — Ephemeral XP transactions & leaderboard.\n`;
md += `- \`/api/v1/settings\` (8 routes) — Durable GDPR privacy, erasure, and export.\n`;
md += `- \`/api/v1/billing\` (5 routes) — Ephemeral subscription simulation (plans stateless).\n`;
md += `- \`/api/v1/admin\` (8 routes) — Ephemeral maintenance, flags, audit logs.\n`;
md += `- \`/api/v1/search\` (5 routes) — Ephemeral ranked multi-entity search & commands.\n`;
md += `- \`/api/v1/moderation\` (10 routes) — Ephemeral trust & safety triage.\n`;
md += `- \`/api/v1/analytics\` (3 routes) — Ephemeral telemetry & KPI rollups.\n`;
md += `- \`/health\`, \`/api/v1/health\`, \`/api/v1/internal/worker-health\` (3 routes) — Health & worker heartbeat.\n\n`;

md += `### 3.2 Domain Model Coverage (\`packages/domain/src/\`)\n`;
md += `All **48 domain source files** provide pure, side-effect-free TypeScript domain invariants, business rules, state machines, and mathematical formulas (e.g., Markov transition probabilities in career trajectory, half-life decay in skill freshness, k-anonymity checks in salary benchmarks, PBKDF2 iterations floor, and XP capping). Domain modules exist for virtually all Ph0–Ph4 features.\n\n`;

md += `### 3.3 Database Migrations (\`supabase/migrations/\`)\n`;
md += `**49 SQL migrations** define complete schemas, constraints, foreign keys, and RLS policies for: core identity, profiles, evidence, jobs, applications, assessments, LMS, messaging, notifications, AI gateway, resumes, networking, portfolio, gamification, privacy/settings, billing, admin, search, moderation, saved searches, drafts, analytics, certificate verification, job templates, salary intelligence, application feedback, skill decay, technical interviews, reputation engine, warm intros, referrals, activity, instructor reputation, peer credibility, alumni, employer reputation, skill forecasting, career trajectory, learning impact, talent pools, behavioral talent, talent segmentation, verified work history, background jobs, worker liveness, session revocation, and private RLS hardening.\n\n`;

md += `### 3.4 Web Application Surface (\`apps/web/src/\`)\n`;
md += `The React PWA contains **20 pages** focusing heavily on the **Core Career Loop**:\n`;
md += `- Public Shell: \`LandingPage.tsx\`, \`LoginPage.tsx\`, \`SignUpPage.tsx\`, \`CheckoutPage.tsx\`, \`PrivacyPage.tsx\`, \`TermsPage.tsx\`, \`NotFoundPage.tsx\`.\n`;
md += `- Candidate Loop: \`DashboardPage.tsx\`, \`JobsPage.tsx\`, \`JobDetailPage.tsx\`, \`ApplicationsPage.tsx\`, \`ProfilePage.tsx\`, \`EvidencePage.tsx\`, \`AssessmentsPage.tsx\` (preview), \`NotificationsPage.tsx\`, \`MessagesPage.tsx\`, \`ConversationPage.tsx\`.\n`;
md += `- Recruiter Loop: \`HiringPage.tsx\`, \`HiringJobPage.tsx\`.\n`;
md += `- Verification Loop: \`ReferencePage.tsx\` (public tokenized referee portal).\n\n`;

md += `---\n\n`;

md += `## 4. Comprehensive 173-Feature Traceability Matrix\n\n`;
md += `Below is the complete traceability register mapping every canonical feature (F-01 through F-173) to its technical artifacts and operational status:\n\n`;

md += `| ID | Feature Name | Category | Domain Module | Fastify API Endpoint(s) | Durability | UI Route / Component | DB Table & Migration | Status | Notes |\n`;
md += `|---|---|---|---|---|---|---|---|---|---|\n`;

matrix.forEach(row => {
  // sanitize pipes for markdown
  const clean = str => String(str).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  md += `| ${clean(row.id)} | ${clean(row.name)} | ${clean(row.category)} | ${clean(row.domain)} | ${clean(row.routes)} | ${clean(row.durability)} | ${clean(row.ui)} | ${clean(row.migrations)} | **${clean(row.status)}** | ${clean(row.notes)} |\n`;
});

md += `\n---\n\n`;

md += `## 5. Architectural & Durability Analysis\n\n`;
md += `### 5.1 The ADR-015 Core Career Loop (Durable Core)\n`;
md += `The repository implements a single-writer PostgreSQL architecture for the essential core career loop:\n`;
md += `1. **Identity & Auth (F-01)**: User registration, login, PBKDF2 password hashing, session tokens, multi-device logout, and DB-enforced session revocation (\`revoked_sessions\` table).\n`;
md += `2. **Profiles (F-12)**: Canonical candidate professional identity backed by \`profiles\` table.\n`;
md += `3. **Skills Taxonomy (F-84)**: Canonical skills DAG, aliases, and prerequisite relationships in \`skills\` and \`skill_relationships\`.\n`;
md += `4. **Work History Proof of Control (F-94, F-162)**: Corporate email HMAC verification challenge (\`work_history_email_challenges\`), single-use referee vouchers, structured reference responses, and verified work history graph.\n`;
md += `5. **Skill Evidence & Credentials (F-96)**: Digital evidence with SHA-256 public verification tokens, dispute/revocation lifecycle.\n`;
md += `6. **Marketplace & Pipeline (F-04, F-05, F-06, F-25, F-102)**: Job postings, recruiter review pipeline, state transitions, application withdrawal, and bookmarked jobs.\n`;
md += `7. **Saved Searches & Alerts (F-32)**: Saved queries and scheduled notification criteria stored in PostgreSQL.\n`;
md += `8. **Direct Messaging (F-10)**: Thread and message persistence (\`message_threads\`, \`messages\`).\n`;
md += `9. **Notifications (F-14, F-29)**: Notification delivery, summary badges, and delivery preferences.\n`;
md += `10. **Account Privacy & Settings (F-15)**: User privacy toggles, GDPR data export archives, and scheduled erasure requests.\n\n`;

md += `### 5.2 The In-Memory Ephemeral Long-Tail (~205 Routes)\n`;
md += `While SQL migrations exist for 49 domain scopes, 205 API routes do NOT route their mutations through \`storage.persist()\`. Instead, \`server.ts\` maintains state in local process \`Map\` instances. Responses from these routes carry \`x-talentsphere-durability: ephemeral\`.\n`;
md += `- **Impact**: A server restart wipes all active interview sessions, reputation scores, skill freshness records, course enrollments, learning outcomes, talent pools, and saved drafts.\n`;
md += `- **Production Risk**: Any deployment or pod crash in production results in immediate data loss for these modules unless their writes are migrated to durable storage.\n\n`;

md += `### 5.3 Assessment Integrity & AI Governance\n`;
md += `- **Assessment AI Lockout**: In \`challenges-assessment\`, the server enforces the \`AI_PROHIBITED\` constraint at the API boundary (\`assertAIAssistanceAllowed\`), refusing to deliver AI assistance regardless of client parameters.\n`;
md += `- **AI Quota & Cost Control**: The AI Gateway enforces token estimation, user tier limits (\`AI_QUOTA_LIMITS\`), and returns local heuristic responses (\`generateCareerAssistantResponse\`) when third-party provider keys are absent, preventing unauthorized billing leakage.\n\n`;

md += `### 5.4 Payment & Billing Realism\n`;
md += `- **Checkout Page Truthfulness**: In \`apps/web/src/pages/CheckoutPage.tsx\`, the app openly informs users that no payment processor is integrated and offers free access during early access, eliminating mock-payment dark patterns.\n\n`;

md += `---\n\n`;

md += `## 6. Strategic Recommendations & Roadmap Sequencing\n\n`;
md += `### Stage A: Harden Core Career Loop to GA Production Quality\n`;
md += `1. **Complete Core Durability**: The 26 **Full** features form a cohesive end-to-end user loop. Ensure database indexing, backup strategies, and RLS policies are locked down.\n`;
md += `2. **E2E Playwright Suite**: Retain strict regression gates on \`core-loop.spec.ts\` and \`frontend-fixes.spec.ts\`.\n\n`;

md += `### Stage B: Priority Ephemeral-to-Durable Migrations\n`;
md += `Promote high-value Partial features that already have DB migrations and domain logic into \`DURABLE_ROUTES\`:\n`;
md += `1. **F-08 Challenges & Assessment**: Connect \`00004_challenges_assessment_schema.sql\` to Postgres storage and wire the \`AssessmentsPage.tsx\` frontend to actual backend API routes.\n`;
md += `2. **F-07 LMS & Courses**: Route course progress and certificate minting through Postgres storage.\n`;
md += `3. **F-36 Application Draft Autosave**: Connect \`application_drafts\` table to eliminate lost candidate work.\n`;
md += `4. **F-26 Portfolio Showcase**: Persist portfolio projects to \`portfolio_projects\` table.\n`;
md += `5. **F-17 Admin Console**: Build web administration UI and persist audit logs/feature flags.\n\n`;

md += `### Stage C: Gated & Out-of-Scope Capabilities\n`;
md += `1. Maintain explicit exclusion of **F-62** (Sponsored Content) and **F-63** (BD Sales Graph).\n`;
md += `2. Defer **F-45** (Third-party proctoring) and **F-61** (Premium candidate tier) until formal vendor and founder review.\n`;
md += `3. Enforce SSOT §E: Prohibit automated candidate rejection / predictive hiring models (**F-154**, **F-168**) from production GA.\n\n`;

md += `---\n\n`;
md += `*Report compiled and verified against repository commit \`83dc7d24\` by \`explorer_features_1\`.*\n`;

fs.writeFileSync(
  path.join(__dirname, 'features_audit_report.md'),
  md,
  'utf8'
);

console.log('Successfully generated features_audit_report.md');
console.log('Report size:', md.length, 'bytes');
