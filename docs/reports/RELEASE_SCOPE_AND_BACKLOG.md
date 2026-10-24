# TalentSphere — Release Scope, Backlog & Sprint Roadmap (Stages A–F)

> Historical report: findings, counts and executed checks below belong to the recorded revision/session. Current source references and inspection limits are in [the implementation inventory](../system-model/01-inventory-and-coverage.md). No historical pass is a fresh release certification.

**Date:** 2026-10-22  
**Author:** Teamwork Master Synthesis Engineering Group  
**Repository:** `https://github.com/yhsomani/talentsphere-complete.git`  
**Git HEAD:** `83dc7d247efbd3b3c3312bef74ac49978d33e924`  
**Active Branch:** `repository_audit_roadmap`  
**Authoritative Baselines:** `SSOT.md` v6.0, `FEATURE_REGISTRY.md` v6.0, `ADR-015`, `PRD.md`, `TRD.md`

---

## 1. Executive Overview & Release Strategy

The TalentSphere product portfolio spans 173 canonical features, but architectural reality dictates a strict **two-tier boundary**:
1. **Tier 1: The Core Career Loop (In Scope for GA Launch)**:
   - Fully implemented, backed by PostgreSQL 16 transactional persistence (ADR-015), and validated by Playwright browser E2E tests (`core-loop.spec.ts`).
   - Solves the fundamental market problem: **cryptographically attested candidate work history and hiring without resume fraud**.
2. **Tier 2: The Extended Ecosystem (Progressive Staged Rollout)**:
   - Learning Management (LMS), coding arena challenges, video interview rooms, multi-context reputation, and salary intelligence.
   - These features currently operate in-process (`x-talentsphere-durability: ephemeral`) and must be progressively migrated to durable PostgreSQL before broad commercial release.

---

## 2. Release Scope Definition: The Core Career Loop

### 2.1 The End-to-End User Journey
The production release scope delivers an uncompromised, verifiable candidate-to-hire journey:

```text
┌─────────────────┐      ┌─────────────────┐      ┌───────────────────────────┐
│ Candidate Signup│ ───► │ Profile Building│ ───► │ Work History & Proof      │
│ & Authentication│      │ & Skills DAG    │      │ (Corporate Email HMAC OTP)│
└─────────────────┘      └─────────────────┘      └─────────────┬─────────────┘
                                                                │
                                                                ▼
┌─────────────────┐      ┌─────────────────┐      ┌───────────────────────────┐
│ Application     │ ◄─── │ ATS Candidate   │ ◄─── │ Referee Voucher Request   │
│ Outcome & Move  │      │ Pipeline Review │      │ (128-bit Single-Use Token)│
└────────┬────────┘      └─────────────────┘      └─────────────┬─────────────┘
         │                                                      │
         ▼                                                      ▼
┌─────────────────┐                               ┌───────────────────────────┐
│ 1:1 Messaging & │ ◄──────────────────────────── │ Referee Vouch Submission  │
│ Notifications   │                               │ & Verification Score Mint │
└─────────────────┘                               └───────────────────────────┘
```

### 2.2 Feature Scope Boundary

| Category | In-Scope Canonical Features (GA Core Loop) | Out-of-Scope / Deferred to Future Stages |
| :--- | :--- | :--- |
| **Identity & Access** | **F-01** (Auth & Session), **F-03** (Role-Adaptive Dashboard), **F-12** (Profile Management), **F-15** (Settings & Privacy), **F-60** (Profile Visibility RLS), **F-65** (Decoupled Identity), **F-80** (Profile Enhancements) | F-81 (Govt ID Verification), F-163 (W3C Wallet) |
| **Taxonomy & Evidence**| **F-84** (Skills Taxonomy DAG), **F-96** (Skill Evidence & Digital Credentials), **F-173** (Company-to-Skills Mapping) | F-110 (Peer Endorsements), F-123 (Skill Freshness Engine) |
| **Proof of Control** | **F-58** (Written Recommendations), **F-94** (Verified Work History & Corporate Email Attestation), **F-162** (Verified Work History Graph) | F-89 (Activity Contributions), F-146 (Contribution Tracking) |
| **Jobs & Hiring** | **F-04** (Job Marketplace), **F-05** (Post Job Studio), **F-06** (ATS Pipeline), **F-25** (Job Detail View), **F-32** (Saved Searches & Alerts), **F-56** (Org Management), **F-102** (Hiring Manager Portal), **F-117** (Mobile Apply) | F-36 (Draft Autosave), F-37 (Job Templates), F-104 (Custom Assessment Builder), F-142 (Referral Requests) |
| **Communication** | **F-10** (Direct Messaging), **F-14** (Notification Center), **F-29** (Notification Digests) | F-33 (Video Rooms), F-53 (Social Feed), F-55 (Communities) |
| **Platform & UI** | **F-02** (Landing Page Shell), **F-21** (Error Recovery & Session Notice) | F-07 (LMS), F-08 (Challenges Arena), F-16 (Paid Subscriptions), F-17 (Admin UI Console) |

---

## 3. Actionable, Deduplicated Backlog with Stable IDs

Every backlog item carries a stable identifier (`BL-xxx`), urgency rating (`P0` Blocker to `P3` Medium), structured Given/When/Then acceptance criteria, and explicit verifying tests.

### 3.1 P0: Launch Blockers (Mandatory Pre-Launch Operational Gates)

#### BL-001: Corporate Email Challenge HMAC Key Hardening (SEC-01)
- **Urgency:** **P0 Blocker**
- **Domain:** Cryptography / Work History
- **Traceability:** SEC-01, Issue #44, F-94
- **User Story:** As an application security engineer, I want corporate email OTP codes hashed using HMAC-SHA256 with a server secret so that database read leaks cannot be rainbow-table reversed.
- **Acceptance Criteria:**
  - **Given** a candidate requests corporate email verification for work history `W`
  - **When** the 6-digit numeric OTP is generated and stored in `work_history_email_challenges`
  - **Then** `code_hash` MUST be computed using `crypto.createHmac('sha256', env.TOKEN_SECRET).update(`${workHistoryId}:${code}`).digest('hex')`
  - **And** raw `sha256Hex(`${id}:${code}`)` without server secret MUST NOT be used anywhere.
- **Verifying Test:**
  - `pnpm exec vitest run tests/integration/work-history-graph.test.ts`
  - `pnpm exec vitest run tests/security/injection-defenses.test.ts`

#### BL-002: Referee Voucher Token TTL Expiration Enforcement (SEC-02)
- **Urgency:** **P0 Blocker**
- **Domain:** Cryptography / Work History
- **Traceability:** SEC-02, Issue #44, F-58, F-94
- **User Story:** As a candidate and recruiter, I want referee voucher links to expire after 30 days so that stale or compromised email links cannot be submitted indefinitely.
- **Acceptance Criteria:**
  - **Given** an employment reference request is minted with a 128-bit voucher token
  - **When** the record is created in `employment_references`
  - **Then** an `expires_at TIMESTAMPTZ` column MUST be set to `now() + INTERVAL '30 days'`
  - **And** when `GET /api/v1/references/:refId` or `POST /api/v1/candidates/work-history/references/:refId/submit` is called after `expires_at`, the server MUST reject with `410 GONE` (`reference_voucher_expired`).
- **Verifying Test:**
  - `pnpm exec vitest run tests/integration/work-history-graph.test.ts -t "voucher expiration"`
  - `pnpm test:pg tests/pg/work-history-removal.test.ts`

#### BL-003: Transactional Email Staging DNS & Resend Configuration (Issue #44)
- **Urgency:** **P0 Blocker**
- **Domain:** Infrastructure / Operations
- **Traceability:** Issue #44, F-94
- **User Story:** As a DevOps engineer, I want Resend credentials and domain DNS records (SPF, DKIM, DMARC) verified in staging so that corporate email OTPs and referee requests are delivered reliably.
- **Acceptance Criteria:**
  - **Given** staging environment configuration in `deploy/oracle/.env`
  - **When** the API server boots in staging mode (`NODE_ENV=production`)
  - **Then** `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM` MUST validate cleanly
  - **And** worker process MUST successfully dispatch a live test email through Resend with valid DKIM alignment.
- **Verifying Test:**
  - `pnpm exec vitest run tests/unit/production-config.test.ts`
  - Staging live verification: `node scripts/test-staging-mail.mjs`

#### BL-004: Legal Terms & Privacy Policy Founder Review (Issue #47)
- **Urgency:** **P0 Blocker**
- **Domain:** Legal / Compliance
- **Traceability:** Issue #47, F-15
- **User Story:** As company legal counsel, I want to review and ratify `PrivacyPage.tsx` and `TermsPage.tsx` so that public legal contracts accurately reflect platform operations and liability boundaries.
- **Acceptance Criteria:**
  - **Given** legal terms in `apps/web/src/pages/PrivacyPage.tsx` and `TermsPage.tsx`
  - **When** audited against applicable law (GDPR, CCPA/CPRA, India DPDP)
  - **Then** formal legal approval MUST be recorded in `docs/governance/LEGAL_APPROVAL.md`
  - **And** contact mailboxes (`VITE_PRIVACY_EMAIL`, `VITE_SECURITY_EMAIL`) MUST be active mailboxes.
- **Verifying Test:**
  - `pnpm exec playwright test tests/e2e/frontend-fixes.spec.ts -t "FE-02"`

#### BL-005: Caddy Reverse Proxy Root Health Route Proxying (OPS-02)
- **Urgency:** **P0 Blocker**
- **Domain:** Infrastructure / DevOps
- **Traceability:** OPS-02, PR #55
- **User Story:** As an SRE, I want Caddy to proxy `/health` to the Fastify API so that synthetic monitoring alerts immediately when the API service fails.
- **Acceptance Criteria:**
  - **Given** `deploy/oracle/Caddyfile`
  - **When** an HTTP GET request is made to `https://SITE_DOMAIN/health`
  - **Then** Caddy MUST proxy the request to `api:4000` rather than serving static `index.html`
  - **And** the HTTP response MUST return JSON `{"status":"ok"}` with status code 200.
- **Verifying Test:**
  - `curl -k https://127.0.0.1/health` on deployed staging instance.

---

### 3.2 P1: Critical Quality & Release Readiness

#### BL-006: User Data Erasure 30-Day Scheduled Worker Automation (Issue #48)
- **Urgency:** **P1 Critical**
- **Domain:** Compliance / Background Worker
- **Traceability:** Issue #48, F-15
- **User Story:** As a candidate exercising GDPR Article 17 erasure with a 30-day grace period, I want my data automatically purged when the grace period expires without manual operator intervention.
- **Acceptance Criteria:**
  - **Given** an active erasure request with `status: 'pending'` and `scheduled_for <= now()`
  - **When** the scheduled worker cron runs
  - **Then** `executeScheduledErasures()` MUST purge the candidate's work history, references, applications, messages, and account
  - **And** update `data_erasure_requests.status = 'executed'`.
- **Verifying Test:**
  - `pnpm test:pg tests/pg/core-persistence.test.ts -t "erasure"`
  - `pnpm exec vitest run tests/unit/worker-queue.test.ts`

#### BL-007: Fix Vitest Security Script Argument in `package.json`
- **Urgency:** **P1 Critical**
- **Domain:** Toolchain / CI
- **Traceability:** Baseline Diagnostics §6
- **User Story:** As a developer, I want `pnpm test:security` to run cleanly without Vitest v3 argument syntax errors.
- **Acceptance Criteria:**
  - **Given** `package.json` line 17
  - **When** `pnpm test:security` is executed
  - **Then** the command MUST invoke `vitest run tests/security` (removing `--dir`)
  - **And** exit with code 0 across all 5 security test files.
- **Verifying Test:**
  - `pnpm test:security`

#### BL-008: Add Committed Cache & Agent Folders to `.prettierignore`
- **Urgency:** **P1 Critical**
- **Domain:** Toolchain / Code Quality
- **Traceability:** Baseline Diagnostics §10
- **User Story:** As a CI pipeline engineer, I want `pnpm lint` to ignore `graphify-out/` and `.agents/` so that lint checks report true repository code health.
- **Acceptance Criteria:**
  - **Given** `.prettierignore`
  - **When** `graphify-out/` and `.agents/` are appended
  - **Then** `pnpm lint` MUST exit 0 with all matched files compliant.
- **Verifying Test:**
  - `pnpm lint`

#### BL-009: Persist Active Assessment Sessions to PostgreSQL (SEC-05)
- **Urgency:** **P1 Critical**
- **Domain:** Security / AI Governance
- **Traceability:** SEC-05, F-08, F-11
- **User Story:** As an assessment integrity officer, I want active proctored assessment sessions persisted in PostgreSQL so that API restarts cannot wipe the session map and unblock the AI assistant.
- **Acceptance Criteria:**
  - **Given** a candidate starts an assessment with `policyMode: 'AI_PROHIBITED'`
  - **When** the session is created
  - **Then** the record MUST be written to `public.assessment_sessions` (migration 00004)
  - **And** when `assertAIAssistanceAllowed()` is invoked after an API process restart, it MUST load the active session from SQL and reject with `403 ASSESSMENT_AI_PROHIBITED`.
- **Verifying Test:**
  - `pnpm exec vitest run tests/security/injection-defenses.test.ts -t "AI_PROHIBITED"`
  - `pnpm test:pg tests/pg/core-persistence.test.ts -t "assessment session restart"`

#### BL-010: Fix AI Gateway Hardcoded 'free' Tier & Usage Metering (SEC-06)
- **Urgency:** **P1 Critical**
- **Domain:** AI Gateway / Monetization
- **Traceability:** SEC-06, F-11, F-16
- **User Story:** As a Pro subscriber, I want the AI Career Assistant to grant me Pro token quotas (100,000 tokens/day) rather than throttling me to the free tier limit.
- **Acceptance Criteria:**
  - **Given** a user with an active `'pro'` tier subscription
  - **When** querying `POST /api/v1/ai/career-assistant/chat`
  - **Then** `userTier` MUST resolve to `'pro'` from user entitlements
  - **And** daily usage meters MUST be persisted in PostgreSQL `ai_usage_meters` table to prevent reset upon restart.
- **Verifying Test:**
  - `pnpm exec vitest run tests/unit/ai-gateway-domain.test.ts`
  - `pnpm exec vitest run tests/integration/ai-gateway.test.ts`

---

### 3.3 P2: Staged Capability Migrations & Enhancements

#### BL-011: Migrate Challenges & Arena to Durable Storage (F-08)
- **Urgency:** **P2 High**
- **Domain:** Assessment / Durability
- **Traceability:** F-08, Issue #49
- **User Story:** As a candidate solving coding challenges, I want my submissions, scores, and XP persisted to PostgreSQL so that my challenge progress is never lost.
- **Acceptance Criteria:**
  - **Given** challenge submission `POST /api/v1/challenges/:id/submit`
  - **When** code evaluation completes
  - **Then** writes MUST pass through `storage.persist()` into `challenge_submissions` and `xp_transactions`
  - **And** response header `x-talentsphere-durability` MUST NOT return `ephemeral`.
- **Verifying Test:**
  - `pnpm test:pg tests/pg/core-persistence.test.ts -t "challenges durability"`

#### BL-012: Wire Assessments Page UI to Backend API (F-08)
- **Urgency:** **P2 High**
- **Domain:** Frontend / Assessment
- **Traceability:** F-08
- **User Story:** As a candidate visiting `AssessmentsPage.tsx`, I want to browse real backend challenges and submit code rather than viewing a static client-side preview modal.
- **Acceptance Criteria:**
  - **Given** candidate on `/assessments`
  - **When** page loads
  - **Then** it MUST fetch active challenges from `GET /api/v1/challenges`
  - **And** submitting code MUST dispatch `POST /api/v1/challenges/:id/submit` and display verified test results.
- **Verifying Test:**
  - `pnpm exec playwright test tests/e2e/core-loop.spec.ts`

#### BL-013: Migrate LMS Courses & Module Progression to PostgreSQL (F-07)
- **Urgency:** **P2 High**
- **Domain:** Learning / Durability
- **Traceability:** F-07, Issue #49
- **User Story:** As a student taking courses, I want my lesson progress, quiz completions, and certificates persisted to the database across server restarts.
- **Acceptance Criteria:**
  - **Given** an enrollment in a course
  - **When** `POST /api/v1/lessons/:id/progress` is called
  - **Then** record MUST be committed to `lesson_progress` table (migration 00005)
  - **And** issued certificates MUST be written to `course_certificates`.
- **Verifying Test:**
  - `pnpm test:pg tests/pg/core-persistence.test.ts -t "lms durability"`

#### BL-014: Candidate Explicit Reputation Visibility Consent Setting (Issue #45)
- **Urgency:** **P2 High**
- **Domain:** Privacy / Reputation
- **Traceability:** Issue #45, F-144
- **User Story:** As a candidate, I want an explicit toggle in Privacy Settings to allow recruiters to view my verified reputation score before I submit a job application.
- **Acceptance Criteria:**
  - **Given** candidate settings on `ProfilePage.tsx`
  - **When** toggling "Allow verified recruiters to view reputation"
  - **Then** `user_settings.reputation_visibility` MUST update in PostgreSQL
  - **And** `GET /api/v1/reputation/users/:userId` MUST allow authorized recruiters when consent is granted.
- **Verifying Test:**
  - `pnpm exec vitest run tests/integration/reputation-visibility.test.ts`

#### BL-015: Connect Application Draft Autosave to Database (F-36)
- **Urgency:** **P2 High**
- **Domain:** Candidate / Durability
- **Traceability:** F-36, Issue #49
- **User Story:** As a candidate drafting a lengthy job application, I want my draft cover letter and answers saved to PostgreSQL every 30 seconds so that closing my browser does not lose my work.
- **Acceptance Criteria:**
  - **Given** candidate editing application on `JobDetailPage.tsx`
  - **When** input changes
  - **Then** draft MUST be written to `application_drafts` table (migration 00019)
  - **And** reopening the job detail page MUST restore the saved draft.
- **Verifying Test:**
  - `pnpm test:pg tests/pg/core-persistence.test.ts -t "application drafts"`

---

### 3.4 P3: Monetization, Sandboxing & Ecosystem Expansion

#### BL-016: Stripe Checkout & Subscription Lifecycle Integration (Issue #50, F-16)
- **Urgency:** **P3 Medium**
- **Domain:** Monetization / Billing
- **Traceability:** Issue #50, F-16
- **User Story:** As an enterprise recruiter, I want to purchase a Pro hiring plan using credit card checkout via Stripe so that our organization unlocks multi-seat postings.
- **Acceptance Criteria:**
  - **Given** `BILLING_MODE=stripe` and valid `STRIPE_SECRET_KEY`
  - **When** recruiter selects Pro plan on `CheckoutPage.tsx`
  - **Then** server MUST create a Stripe Checkout Session
  - **And** upon `checkout.session.completed` webhook, activate subscription in `subscriptions` table.
- **Verifying Test:**
  - `pnpm exec vitest run tests/integration/billing.test.ts`

#### BL-017: Secure Containerized Code Execution Sandbox (Issue #46, F-88)
- **Urgency:** **P3 Medium**
- **Domain:** Sandboxing / Technical Interview
- **Traceability:** Issue #46, F-88
- **User Story:** As an interviewer, I want candidate submitted code executed inside an isolated, unprivileged gVisor/Docker container so that arbitrary code execution cannot compromise the API host.
- **Acceptance Criteria:**
  - **Given** code submission on `POST /api/v1/interviews/execute-code`
  - **When** executed
  - **Then** runner MUST execute inside a container with seccomp profile, zero network egress, memory cap (128MB), and 5-second CPU timeout
  - **And** stdout/stderr and exit code returned cleanly to Fastify.
- **Verifying Test:**
  - `pnpm exec vitest run tests/integration/technical-interview.test.ts`

#### BL-018: Dockerfile Multi-Stage Image Pruning (OPS-01)
- **Urgency:** **P3 Medium**
- **Domain:** DevOps / Deployment
- **Traceability:** OPS-01
- **User Story:** As a DevOps engineer, I want the production Docker image pruned of build tools and devDependencies so that image size drops below 250MB.
- **Acceptance Criteria:**
  - **Given** `deploy/oracle/Dockerfile`
  - **When** image is built
  - **Then** runtime stage MUST copy only compiled `dist/` and `node_modules` generated by `pnpm --prod`
  - **And** Vitest, Playwright, and TypeScript compiler MUST NOT exist in the final container image.
- **Verifying Test:**
  - `docker images talentsphere-api` verified $<250$MB.

---

## 4. Sprint Roadmap: Dependency-Aware Stages A through F

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TALENTSPHERE STRATEGIC SPRINT ROADMAP                           │
├─────────┬───────────────────────────────┬────────────┬─────────────────────────────────┤
│ Stage   │ Focus Area                    │ Timeline   │ Backlog Items Delivered         │
├─────────┼───────────────────────────────┼────────────┼─────────────────────────────────┤
│ Stage A │ Production Hardening & Gates  │ Sprint 1-2 │ BL-001, BL-002, BL-003, BL-004, │
│         │                               │            │ BL-005, BL-007, BL-008          │
├─────────┼───────────────────────────────┼────────────┼─────────────────────────────────┤
│ Stage B │ Core Career Loop GA Launch    │ Sprint 3-4 │ BL-006, BL-009, BL-010, Core GA │
│         │                               │            │ Deployment on Oracle Staging    │
├─────────┼───────────────────────────────┼────────────┼─────────────────────────────────┤
│ Stage C │ Progressive Durability        │ Sprint 5-6 │ BL-011, BL-012, BL-013, BL-015, │
│         │ (PostgreSQL Migration)        │            │ Portfolio & Admin Durability    │
├─────────┼───────────────────────────────┼────────────┼─────────────────────────────────┤
│ Stage D │ Commercial Monetization       │ Sprint 7-8 │ BL-016, Stripe Billing Gateway, │
│         │ & Enterprise Tier             │            │ Webhook Replay Persistence      │
├─────────┼───────────────────────────────┼────────────┼─────────────────────────────────┤
│ Stage E │ Sandboxed Code Execution      │ Sprint 9-10│ BL-017, gVisor Code Sandbox,    │
│         │ & Remote Assessment           │            │ Technical Interview Rooms       │
├─────────┼───────────────────────────────┼────────────┼─────────────────────────────────┤
│ Stage F │ Ecosystem, Reputation & Graph │ Sprint 11+ │ BL-014, Career Progression UI,  │
│         │                               │            │ Alumni & Warm Intro Pathways    │
└─────────┴───────────────────────────────┴────────────┴─────────────────────────────────┘
```

### Stage A: Production Hardening & Operational Gates
- **Objective:** Eliminate cryptographic weaknesses, fix toolchain scripts, establish live transactional mail in staging, and secure founder legal ratification.
- **Deliverables:**
  - BL-001 (HMAC-SHA256 for email OTPs)
  - BL-002 (30-day TTL for referee voucher tokens)
  - BL-003 (Resend DNS SPF/DKIM verification in staging)
  - BL-004 (Legal counsel review of Terms & Privacy)
  - BL-005 (Caddy `/health` proxying)
  - BL-007 (`pnpm test:security` fix)
  - BL-008 (`.prettierignore` fix)
- **Exit Criteria:** All 1,143 tests green, `pnpm test:security` exits 0, `pnpm lint` exits 0, live email successfully received from staging instance.

### Stage B: Core Career Loop GA Launch
- **Objective:** Deploy the verified Core Career Loop to production under a free early-access launch tier.
- **Deliverables:**
  - BL-006 (Automated 30-day erasure execution cron)
  - BL-009 (Postgres persistence for active assessment sessions)
  - BL-010 (AI gateway Pro tier quota resolution)
  - Production deployment on single-writer PostgreSQL architecture with automated backup verification (`deploy/oracle/verify-backup-restore.sh`).
- **Exit Criteria:** End-to-end user journeys pass in production: Candidate sign-up $\to$ Corporate email attestation $\to$ Referee voucher completion $\to$ Job apply $\to$ Recruiter pipeline move.

### Stage C: Progressive Durability Migration (PostgreSQL Long-Tail)
- **Objective:** Eliminate ephemeral in-process `Map` state loss across high-value capability domains.
- **Deliverables:**
  - BL-011 & BL-012 (Challenges Arena & Assessments persisted to PostgreSQL)
  - BL-013 (LMS Courses & module completion persisted to PostgreSQL)
  - BL-015 (Application draft autosave persisted to PostgreSQL)
  - Portfolio Showcase (F-26) and Admin Console (F-17) persisted to PostgreSQL.
- **Exit Criteria:** Ephemeral route count reduced from 217 to $<100$; server restart preserves all challenge submissions, course progress, and drafts.

### Stage D: Commercial Monetization & Enterprise Subscriptions
- **Objective:** Enable paid plan monetization and enterprise hiring licenses.
- **Deliverables:**
  - BL-016 (Live Stripe Checkout and billing webhook processing)
  - Enterprise seat licensing and invoice generation
  - Webhook deduplication key persistence in PostgreSQL.
- **Exit Criteria:** Live credit card test transaction succeeds in Stripe test mode, webhook activates Pro subscription, and canceling plan updates entitlements.

### Stage E: Sandboxed Code Execution & Advanced Assessment
- **Objective:** Safely evaluate candidate programming submissions without security risk to the host.
- **Deliverables:**
  - BL-017 (Containerized gVisor/Docker execution sandbox)
  - Multi-language execution runner (Node.js, Python, TypeScript)
  - Technical Interview real-time WebRTC room wiring.
- **Exit Criteria:** Unprivileged execution of untrusted code passes security isolation audit; fork bombs and unauthorized network calls are strictly blocked.

### Stage F: Ecosystem, Reputation & Career Graph Expansion
- **Objective:** Activate advanced community, reputation, and career intelligence features.
- **Deliverables:**
  - BL-014 (Candidate reputation opt-in consent UI)
  - Career Trajectory graph visualizations in React web app
  - Alumni networks, warm introduction pathfinding, and peer credibility UI views.
- **Exit Criteria:** Full 173-feature capability matrix achieved with end-to-end database persistence and accessible UI views.

---

*Report ratified and published by the Teamwork Master Synthesis Engineering Group at commit `83dc7d24`.*
