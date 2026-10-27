# TalentSphere — Git History, Issues & Pull Requests Reconciliation Report

> Historical report: findings, counts and executed checks below belong to the recorded revision/session. Current source references and inspection limits are in [the implementation inventory](../system-model/01-inventory-and-coverage.md). No historical pass is a fresh release certification.

**Date:** 2026-10-22  
**Author:** Teamwork Master Synthesis Engineering Group  
**Repository:** `https://github.com/yhsomani/talentsphere-complete.git`  
**Git HEAD:** `83dc7d247efbd3b3c3312bef74ac49978d33e924`  
**Active Branch:** `repository_audit_roadmap`  
**Authoritative Baselines:** Git Commit History (`e93d2514` to `83dc7d24`), GitHub PRs #40–#58, GitHub Issues #44–#50

---

## 1. Executive Summary & Git Commit Lineage to HEAD `83dc7d24`

### 1.1 Repository State Overview
- **Active HEAD:** `83dc7d247efbd3b3c3312bef74ac49978d33e924` (Subject: `update`, author: Yash Somani, committed 2026-10-20T12:06:37-07:00).
- **Total Repository Commits:** Exactly **302 commits** in git history from initial commit (`e93d2514`, 2026-09-19) to `83dc7d24`.
- **Active Branch Alignment:** Local branches `repository_audit_roadmap`, `main`, and `universal_project_clean_reinstall`, as well as remote tracking branches `origin/main` and `origin/HEAD`, all point identically to commit `83dc7d247efbd3b3c3312bef74ac49978d33e924`.
- **Working Tree Cleanliness:** Clean working tree with no uncommitted staged or unstaged modifications; only teamwork metadata directory `.agents/` is present.

### 1.2 Comprehensive Branch Topology & Ancestry Analysis
A complete graph analysis of all local and remote branches in the repository was conducted using `git merge-base --is-ancestor`:

| Branch Reference | Tip Commit | Tip Subject | Direct Ancestor of HEAD `83dc7d24`? | Status & Merge Details |
| :--- | :---: | :--- | :---: | :--- |
| `refs/heads/main` | `83dc7d24` | `update` | **YES** (Identical) | Primary repository line |
| `refs/heads/repository_audit_roadmap` | `83dc7d24` | `update` | **YES** (Identical) | Active audit worktree branch |
| `refs/heads/universal_project_clean_reinstall` | `83dc7d24` | `update` | **YES** (Identical) | Synchronized worktree branch |
| `refs/heads/improvement/core-loop-durability` | `b5d40da1` | `feat(web): messaging between a hiring team and applicants` | **YES** | Pre-merge commit on branch merged in PR #40 (`4004457d`) |
| `refs/heads/install_ralph_loop_extension` | `dc0d8ef0` | `Merge pull request #37 from yhsomani/vibe-coding-security-fixes-50685` | **YES** | Merged historical feature branch |
| `refs/remotes/origin/main` | `83dc7d24` | `update` | **YES** (Identical) | Remote upstream tracking branch |
| `refs/remotes/origin/HEAD` | `83dc7d24` | `update` | **YES** (Identical) | Remote default branch |
| `refs/remotes/origin/improvement/core-loop-durability` | `b5d40da1` | `feat(web): messaging between a hiring team and applicants` | **YES** | Fully merged into HEAD via PR #40 |
| `refs/remotes/origin/implementation-completion-tracker-57547` | `e8290345` | `Title: Next.js core functionality and routing improvements` | **YES** | Fully merged into HEAD via PR #16 (`73632855`) |
| `refs/remotes/origin/next-priority-implementation-ff90f` | `9f8ad4df` | `**Implement User Blocking Mechanism (NET-005)**` | **YES** | Fully merged into HEAD via PR #28 (`49beef19`) |
| `refs/remotes/origin/security/five-lock-smoke-hardening-20261018` | `2f88ff86` | `test(security): add static regression checks for private data RLS` | **YES** | Fully merged into HEAD via PR #41 (`8bdad381`) |
| `refs/remotes/origin/security/rls-runtime-validation-ci-fix-20261018` | `b0036b84` | `test(security): prevent correlated RLS column shadowing regression` | **YES** | Fully merged into HEAD via PR #42 (`5c130a7e`) |

**Core Finding:** There are **zero unmerged, dangling, or orphaned branches** in the entire Git repository. Every branch ever published to `origin` is a direct mathematical ancestor of HEAD `83dc7d24`.

### 1.3 Chronological Merge Lineage from PR #40 to HEAD `83dc7d24`

```text
(32a3abc7 docs: correct FINAL_VALIDATION_REPORT to measured reality)
  │
  ├─► [PR #40] 4004457d Merge pull request #40 from yhsomani/improvement/core-loop-durability
  │     (ADR-015, durable core loop, honest UI, Reticle fixes)
  │
  ├─► e0882707 update (Reticle intents refresh)
  │
  ├─► [PR #41] 8bdad381 Merge pull request #41 from yhsomani/security/five-lock-smoke-hardening-20261018
  │     (Messaging/notifications RLS policies)
  │
  ├─► [PR #42] 5c130a7e Merge pull request #42 from yhsomani/security/rls-runtime-validation-ci-fix-20261018
  │     (Outer preference owner RLS qualification, web bundle secret scanner)
  │
  ├─► [PR #43] d8dd0567 Merge pull request #43 from yhsomani/chatgpt/production-safety-gates-20261018
  │     (Single-writer lock, fail-closed email, durable erasure store)
  │
  │   [GitHub Issue Sequence Gap: Issues #44 through #50 created on tracker]
  │
  ├─► [PR #51] 4890ef21 Merge pull request #51 from yhsomani/chatgpt/privacy-mail-hardening-20261018
  │     (BYO AI AES-256-GCM encryption, opt-in Resend adapter, durable settings)
  │
  ├─► [PR #52] 616f942d Merge pull request #52 from yhsomani/chatgpt/release-preflight-20261018
  │     (Migration drift preflight scripts/release-preflight.mjs)
  │
  ├─► [PR #53] eb69a2f8 Merge pull request #53 from yhsomani/chatgpt/durable-saved-searches-20261018
  │     (SQL-backed owner-scoped saved searches store)
  │
  ├─► [PR #54] 1776f948 Merge pull request #54 from yhsomani/chatgpt/durable-job-bookmarks-20261018
  │     (SQL-backed saved-job bookmarks, visibility filter, erasure purge)
  │
  ├─► [PR #55] 8864d2c8 Merge pull request #55 from yhsomani/chatgpt/oracle-staging-readiness
  │     (Oracle ARM64 compose.yaml, private network topology, secret exclusion)
  │
  ├─► [PR #56] 252b03f9 Merge pull request #56 from yhsomani/chatgpt/oracle-staging-recovery
  │     (verify-backup-restore.sh, .dump gitignore)
  │
  ├─► [PR #57] 9156b1a8 Merge pull request #57 from yhsomani/claude/issues-44-50-fixes
  │     (Stage 1 a30fcaab: backend/domain audit fixes; Stage 2 43bb9258: frontend FE-02..07, FE-11, e2e)
  │
  ├─► [PR #58] 61eae132 Merge pull request #58 from yhsomani/claude/audit-f01-f04-r2
  │     (Round 2 regressions R2-2..R2-8; BR-167 reputation visibility, PBKDF2 floor)
  │
  └─► [HEAD]   83dc7d24 update (Graphify knowledge graph artifacts in graphify-out/)
```

---

## 2. GitHub Pull Requests Reconciliation (#40 through #58)

### 2.1 The Issue/PR Numbering Sequence on GitHub
On GitHub, Pull Requests and Issues share a single auto-incrementing integer sequence. Forensically:
- PR #40 through PR #43 were opened and merged in succession.
- When PR #43 merged, numbers **#44 through #50** were allocated to **GitHub Issues #44 through #50** to track production-blocking owner and operational gates.
- Consequently, subsequent pull requests were assigned numbers **#51 through #58**. No pull requests numbered #44–#50 ever existed; they are the issue tracking entities reconciled in Section 3.

### 2.2 Exhaustive Reconciliation of PRs #40–#58

#### PR #40: Core Career Loop Durability & Real User Journeys
- **Merge Commit:** `4004457d` (2026-10-14)
- **Source Branch:** `yhsomani/improvement/core-loop-durability`
- **Intended Delivery:**
  1. Complete implementation of ADR-015: PostgreSQL persistence for core loop entities (users, profiles, organizations, jobs, applications, evidence, work history, references, notifications, sessions, messaging).
  2. Cryptographic proof-of-control verification: 6-digit email challenges and single-use referee voucher tokens stored as SHA-256 hashes.
  3. Frontend rewrite: replacement of the hardcoded "Sarah Chen" mock interface with dynamic React 19 candidate, recruiter, and referee workflows.
  4. Fix global rate-limiting lockout (raised to 300/min per account; health endpoints exempt).
  5. Password change with multi-device session revocation; explicit session sign-out; role removal without account deletion.
  6. Strict test-suite typechecking (`tsc -p tests`).
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Superseded volatile in-process Maps for all core loop entities; superseded unverified mock frontend.

#### PR #41: Five-Lock Smoke Hardening & RLS Policies
- **Merge Commit:** `8bdad381` (2026-10-18)
- **Source Branch:** `yhsomani/security/five-lock-smoke-hardening-20261018`
- **Intended Delivery:**
  1. PostgreSQL Row Level Security (RLS) policies for direct messaging threads, messages, and notification preferences.
  2. Static regression checks and SQL migration policy assertions in `tests/security/private-data-rls.test.ts`.
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Replaced loose default RLS policies with profile-owned tenant isolation.

#### PR #42: RLS Runtime Validation & Web Bundle Sentinel CI Guard
- **Merge Commit:** `5c130a7e` (2026-10-18)
- **Source Branch:** `yhsomani/security/rls-runtime-validation-ci-fix-20261018`
- **Intended Delivery:**
  1. Fix correlated RLS column shadowing in outer preference owner queries (`tests/security/private-data-rls.test.ts`).
  2. Runtime two-account RLS validation on real PostgreSQL (`tests/pg/private-data-rls.test.ts`).
  3. SQL apostrophe escape safety test (`tests/security/private-data-rls.test.ts`).
  4. CI sentinel script scanning Vite production web bundles to guarantee server secrets (e.g. `TOKEN_SECRET`, `DATABASE_URL`) are never compiled into client JavaScript.
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Closed correlated subquery security vulnerability in migration RLS policies.

#### PR #43: Production Safety Gates & Fail-Closed Enforcement
- **Merge Commit:** `d8dd0567` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/production-safety-gates-20261018`
- **Intended Delivery:**
  1. Enforce single API writer per database via PostgreSQL advisory lock lease (`pg_try_advisory_lock(718201, 1)`).
  2. Worker heartbeat measurement and health diagnostic reporting.
  3. Deployed fail-closed enforcement for transactional email (503 if provider unconfigured).
  4. Durable erasure request store backed by PostgreSQL table `erasure_requests` with restart survival test (`tests/pg/core-persistence.test.ts`).
  5. Inline JSON data export replacing dead/fabricated download URLs.
  6. Rejection of unverified legal contact mailboxes (`VITE_PRIVACY_EMAIL`, `VITE_SECURITY_EMAIL`).
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Removed simulated execution claims and unverified marketing compliance badges.

#### PR #51: Privacy, BYO AI Encryption & Resend Email Hardening
- **Merge Commit:** `4890ef21` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/privacy-mail-hardening-20261018`
- **Intended Delivery:**
  1. AES-256-GCM encryption at rest for Bring-Your-Own (BYO) AI provider API keys using separate `BYO_AI_KEY_ENCRYPTION_KEY` (64 hex characters). Plaintext downgrade strictly refused.
  2. Opt-in Resend transactional email adapter (`apps/worker/src/email-adapter.ts`) with idempotent retries.
  3. Durable user settings and data export metadata backed by PostgreSQL tables `user_settings` and `data_export_requests`.
  4. Comprehensive PostgreSQL persistence tests (`tests/pg/core-persistence.test.ts`).
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Merged cleanly; established secure key management for external AI credentials.

#### PR #52: Release Preflight Migration Drift Gate
- **Merge Commit:** `616f942d` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/release-preflight-20261018`
- **Intended Delivery:**
  1. Read-only release preflight tool (`scripts/release-preflight.mjs`) to verify database migration alignment.
  2. Strict sequential numbering regex matching for `supabase/migrations/*.sql` to prevent migration drift or skipped versions.
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Merged cleanly.

#### PR #53: Durable Saved Searches with Owner-Scoped SQL CRUD
- **Merge Commit:** `eb69a2f8` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/durable-saved-searches-20261018`
- **Intended Delivery:**
  1. Migration of candidate saved searches from volatile in-memory Maps to PostgreSQL table `saved_searches`.
  2. Owner-scoped SQL CRUD operations preventing horizontal IDOR.
  3. Real PostgreSQL restart survival and ownership isolation tests (`tests/pg/saved-searches.test.ts`).
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Superseded ephemeral in-memory storage for saved searches.

#### PR #54: Durable Job Bookmarks with Job Visibility Guards
- **Merge Commit:** `1776f948` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/durable-job-bookmarks-20261018`
- **Intended Delivery:**
  1. Migration of job bookmarks from volatile in-memory Maps to PostgreSQL table `saved_jobs`.
  2. Strict job visibility enforcement: saving or listing bookmarks refuses unpublished/draft jobs, preventing unpublished job disclosure.
  3. Account erasure integration: bookmark records purged on account deletion.
  4. Real PostgreSQL race, ownership, restart, and erasure tests (`tests/pg/saved-jobs.test.ts`).
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Superseded ephemeral in-memory storage for job bookmarks.

#### PR #55: Oracle Ampere ARM64 Staging Deployment Foundation
- **Merge Commit:** `8864d2c8` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/oracle-staging-readiness`
- **Intended Delivery:**
  1. Staging deployment foundation for Oracle Ampere ARM64 (`deploy/oracle/compose.yaml`, `.env.example`, `README.md`).
  2. Isolated Docker network topology: database (`5432`) and API (`4000`) remain strictly private; only Caddy edge proxy exposes `80`/`443`.
  3. Outbound email permitted from API and worker while database retains zero public ingress/egress.
  4. `.dockerignore` hardened to exclude secrets, `.env`, and local build artifacts.
  5. CI staging compose validation workflow (`.github/workflows/oracle-staging.yml`).
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Replaced unverified local Docker configs with hardened ARM64 staging specification.

#### PR #56: Staging Backup & Isolated Restore Verification
- **Merge Commit:** `252b03f9` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/oracle-staging-recovery`
- **Intended Delivery:**
  1. Operational backup and isolated restore verification script (`deploy/oracle/verify-backup-restore.sh`).
  2. Proven end-to-end restore verification into an ephemeral database container, verifying schema, table row counts, and background job queues.
  3. Security hardening: `.gitignore` updated to guarantee PostgreSQL `.dump` files are never committed to version control.
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Merged cleanly.

#### PR #57: Comprehensive October 2026 Audit Fixes (Issues #44–#50)
- **Merge Commit:** `9156b1a8` (2026-10-20)
- **Source Branch:** `yhsomani/claude/issues-44-50-fixes`
- **Intended Delivery:**
  - **Stage 1 (`a30fcaab` - Backend & Domain):**
    1. Evidence relationship and dispute handling; work-history visibility & referee contact redaction.
    2. Admin-only recomputation for analytics and scores; immutable $k$-anonymity floors ($k \ge 10$ default, $k \ge 20$ benchmarks, $k \ge 30$ cohorts).
    3. Recruiter candidate profiling strictly limited to active applicants or visible public profiles; stealth candidates completely hidden.
    4. Institution-scoped admin seat verification; certificate revocation limited to course instructor or platform admin.
    5. Two-step account bans with lapsing proposals; moderation appeals for content owners with reporter anonymity.
    6. Challenge evidence stored exactly once; duplicate passes return original evidence; self-verification blocked; self-reported skills earn 0 trust points.
    7. Technical interview question org-scoping preventing cross-tenant access.
  - **Stage 2 (`43bb9258` - Frontend & E2E):**
    1. `FE-02`: Profile page "Download my data" with explicit partial export disclosure and error handling.
    2. `FE-03`: Evidence page session-ended notice.
    3. `FE-04`: Hiring retry after failed publish reuses created draft instead of duplicating jobs.
    4. `FE-05`: Reference verification page distinguishes API outage (503) from invalid/used tokens (404), providing a retry button.
    5. `FE-06`: Closing a job requires confirmation dialog; Cancel leaves job published.
    6. `FE-07`: Form input borders meet WCAG 3:1 contrast ratio (`neutral[500]`, 4.76:1).
    7. `FE-11`: Applicant pipeline filter converted from fake tabs to accessible toggle-button group (`aria-pressed`).
    8. Sign-in synchronous double-click in-flight guard.
    9. Ported 10 security/frontend E2E specs including `tests/e2e/frontend-fixes.spec.ts`.
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Closed major security/privacy vulnerabilities identified in the audit.

#### PR #58: Review Round 2 Regressions & BR-167 Reputation Visibility
- **Merge Commit:** `61eae132` (2026-10-20)
- **Source Branch:** `yhsomani/claude/audit-f01-f04-r2`
- **Intended Delivery:**
  1. Enforce BR-167 Candidate Reputation Visibility (`GET /api/v1/reputation/users/:userId` restricted to subject candidate, platform admin, or recruiter whose org has an active application from the candidate; unrelated recruiters receive 403 Forbidden).
  2. Enforce `PASSWORD_PBKDF2_ITERATIONS >= 210000` floor in deployed staging and production configurations (`MIN_DEPLOYED_PBKDF2_ITERATIONS`).
  3. Regression tests for Round 2 review findings:
     - `R2-2`: Stealth candidates hidden from recruiter talent segmentation listings.
     - `R2-3`: `/reports/my` reveals only resolved decisions to subject, redacting reporter ID and moderator notes.
     - `R2-7`: Expired ban proposal cannot be confirmed by a second admin after 24h lapse.
     - `R2-8`: Resubmitting a passed challenge returns the existing stored evidence record.
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Merged cleanly.

---

## 3. GitHub Issues Reconciliation (#44 through #50)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                GITHUB ISSUES #44 - #50 STATUS SUMMARY                                  │
├──────┬──────────────────────────────────────────┬─────────────────────────────┬────────────────────────┤
│ ID   │ Title / Scope                            │ Current Codebase Status     │ Release Status         │
├──────┼──────────────────────────────────────────┼─────────────────────────────┼────────────────────────┤
│ #44  │ Transactional Email & Provider Delivery  │ PARTIALLY ADDRESSED         │ Gated (Staging Proof)  │
│ #45  │ Reputation Engine Visibility & Consent   │ PARTIALLY ADDRESSED         │ Gated (Consent Setting)│
│ #46  │ Technical Interview Code Execution       │ PARTIALLY ADDRESSED / GATED │ Documented Limitation  │
│ #47  │ Privacy Policy, Terms & Legal Contacts   │ RESOLVED (Code) / OPEN(Law) │ Gated (Legal Counsel)  │
│ #48  │ User Data Erasure & Scheduled Deletion   │ PARTIALLY ADDRESSED         │ Gated (30-day Executor)│
│ #49  │ PostgreSQL Durability vs Ephemeral Routes│ PARTIALLY ADDRESSED         │ Progressive Migration  │
│ #50  │ Payment Gateway & Billing Integrity      │ RESOLVED (Code) / OPEN(Plan)│ Gated (Stripe Provider)│
└──────┴──────────────────────────────────────────┴─────────────────────────────┴────────────────────────┘
```

### 3.1 Issue #44: Transactional Email Delivery, Provider Integration & Fail-Closed Guard
- **Category:** Infrastructure / Security / Core Loop Operations
- **Reported Defect:** Local development logged email verification codes to console. In staging or production, without an email provider configured, the platform accepted verification requests without sending emails, leaving candidates unable to verify corporate email domains or obtain reference upgrades.
- **Resolution Lineage & Commits:**
  - `22fb8190`, `ad613fc3` (PR #43): Fail-closed guard added; deployed API refuses email delivery requests with 503 Service Unavailable when unconfigured.
  - `43ef011e`, `73f27b29`, `f75fd3b4` (PR #51): Opt-in Resend transactional email adapter implemented with exponential backoff retries and idempotency headers.
  - `8aea7fee` (PR #51): Worker configuration validator rejects incomplete email configuration on startup.
  - `7c723a0e` (PR #55): Docker Compose networking adjusted to permit outbound SMTP/HTTPS traffic from API/worker while keeping Postgres private.
  - `43bb9258` (PR #57, `FE-05`): Web UI distinguishes 503 API outages from 404 invalid tokens.
- **Current Codebase State:** **PARTIALLY ADDRESSED / OPERATIONAL GATE OPEN.**
  The code is robust and fail-closed: `EMAIL_PROVIDER=resend` is supported, verified, and unit-tested. However, live production DNS (SPF, DKIM, DMARC) and real Resend API credentials have not yet been deployed and verified in staging.
- **Verifying Tests:**
  - `tests/unit/production-config.test.ts`
  - `tests/integration/work-history-graph.test.ts`
  - `tests/e2e/core-loop.spec.ts`
  - `tests/e2e/frontend-fixes.spec.ts` (`FE-05`)

---

### 3.2 Issue #45: Reputation Engine Visibility, Recruiter Scoping & Candidate Consent (BR-167)
- **Category:** Authorization / Privacy / Anti-Gaming
- **Reported Defect:** Reputation score endpoints allowed any authenticated caller to inspect any candidate's multi-dimensional reputation score and breakdown without consent, violating Business Rule BR-167. Recalculation was accessible without platform-admin privileges, and stealth candidates were exposed in talent discovery.
- **Resolution Lineage & Commits:**
  - `a30fcaab` (PR #57): Restricted reputation recalculation to platform administrators; restricted talent discovery profiling to active applicants; hid stealth candidates.
  - `8f5ff69a` (PR #58, `R2-2`): Added regression test proving self-declared stealth candidates are excluded from recruiter talent searches.
  - `d3607f0f` (PR #58): Enforced BR-167 visibility gate on `GET /api/v1/reputation/users/:userId`. Endpoint allows only the candidate, a platform admin, or a recruiter whose organization has an active application from the candidate; unrelated recruiters receive HTTP 403 Forbidden.
- **Current Codebase State:** **PARTIALLY ADDRESSED.**
  The core security hole is closed: unauthorized recruiters cannot view candidate reputation scores. However, the explicit candidate opt-in consent setting (allowing recruiters to browse reputation *without* an active application) is not yet implemented in settings or database schema. Commit `d3607f0f` explicitly records: *"No reputation consent setting exists yet, so that path is not modelled. Related issues #45 #49 remain open."*
- **Verifying Tests:**
  - `tests/integration/reputation-visibility.test.ts`
  - `tests/integration/review-r2-regressions.test.ts` (`R2-2`)
  - `tests/integration/reputation-engine.test.ts`
  - `tests/e2e/reputation-engine.spec.ts`

---

### 3.3 Issue #46: Technical Interview Code Execution Sandbox Security & Cross-Tenant IDOR
- **Category:** Security / Architecture / Sandboxing
- **Reported Defect:** Interview evaluation was simulated in-process (stubbed execution claiming to run submitted code). Cross-tenant IDOR existed: interview routes acted for any signed-in user, allowing rival organizations to link another company's application to its own assessment, score it, move pipelines, and expose private interview questions and hidden test cases.
- **Resolution Lineage & Commits:**
  - `93dfe125` (PR #40): Fixed cross-tenant application linking and interview scorecard manipulation; added participant checks.
  - `48b5fd55`, `f9c2d0bb` (PR #43): Removed simulated sandbox claims; configured deployed API to reject simulated code execution with 503.
  - `a30fcaab` (PR #57): Scoped interview questions strictly to the hiring organization; prevented scorecards from resurrecting rejected applications.
- **Current Codebase State:** **PARTIALLY ADDRESSED / ARCHITECTURAL LIMITATION.**
  Object-level authorization and tenant isolation are fully resolved. However, a containerized execution sandbox (Docker/gVisor/Firecracker) is not implemented; deployed environments honestly reject code evaluation with 503 rather than simulating it.
- **Verifying Tests:**
  - `tests/integration/technical-interview.test.ts`
  - `tests/security/core-authz.test.ts` ("interview assessments are scoped...")

---

### 3.4 Issue #47: Privacy Policy, Terms, Contact Verification & False Compliance Claims
- **Category:** Compliance / Legal / Product Integrity
- **Reported Defect:** Web UI presented fabricated claims: "SOC2 Type II Ready", "GDPR & CCPA Compliant", "DKIM Verified", fictitious cryptographic hashes, a fake 555 phone number, and a support address at an unowned domain (`privacy@talentsphere.dev`). Terms and Privacy Policy were unreviewed boilerplate.
- **Resolution Lineage & Commits:**
  - `ae99e31c` (PR #40): Stripped fake certification badges and fictitious phone numbers; added `VITE_SUPPORT_EMAIL`.
  - `731c2ef3`, `d0f21535`, `f9c2d0bb` (PR #43): Mandated verified `VITE_PRIVACY_EMAIL` and `VITE_SECURITY_EMAIL`; rejected unverified mailboxes.
  - `8a81a953`, `ab410a92` (PR #43): Data export metadata updated to explicitly disclaim statutory GDPR/CCPA completeness while long-tail modules remain ephemeral.
  - `43bb9258` (PR #57, `FE-02`): Profile page "Download my data" feature implemented with explicit notice of partial snapshot scope.
- **Current Codebase State:** **RESOLVED IN CODE / GATED ON LEGAL COUNSEL.**
  The application is completely honest: all fake compliance claims are eliminated, contact emails require environment validation, and exports disclaim statutory completeness. However, formal legal review of the Terms of Service and Privacy Policy by company counsel remains an open release blocker.
- **Verifying Tests:**
  - `tests/e2e/frontend-fixes.spec.ts` (`FE-02`)
  - `tests/e2e/core-loop.spec.ts`
  - `tests/security/core-authz.test.ts`

---

### 3.5 Issue #48: User Data Erasure (GDPR Art. 17 / DPDP) Semantics & Scheduled Deletion Lifecycle
- **Category:** Data Governance / Compliance / Durability
- **Reported Defect:** Account erasure previously left work history, references, and candidate applications in database tables. Erasure requests and cancellations were stored only in volatile in-process Maps and lost on restart. Furthermore, no automated background executor existed to process scheduled 30-day grace period deletions, and recruiter application retention vs candidate deletion semantics were undefined.
- **Resolution Lineage & Commits:**
  - `1bb0f625` (PR #40): Immediate erasure deletes work history, references, and evidence in PostgreSQL.
  - `15b44921`, `7bc608b8`, `de352710` (PR #43): Added durable erasure request store backed by PostgreSQL table `erasure_requests`; restart survival test added.
  - `34e54020`, `6f88ef74` (PR #51): Account erasure purges user settings and data export records.
  - `a30fcaab` (PR #57): Scrubbing personal identifiers across moderation and community records.
- **Current Codebase State:** **PARTIALLY ADDRESSED.**
  Immediate erasure is fully durable and clears all core database tables and memory Maps. However, an automated background cron/worker to execute scheduled deletions upon reaching the 30-day grace period due date does not exist. The policy choice between immediate deletion vs 30-day grace period remains an unratified founder decision.
- **Verifying Tests:**
  - `tests/pg/core-persistence.test.ts`
  - `tests/pg/notifications.test.ts`
  - `tests/pg/messaging.test.ts`
  - `tests/pg/work-history-removal.test.ts`
  - `tests/pg/saved-jobs.test.ts`

---

### 3.6 Issue #49: PostgreSQL Durability (ADR-015) vs ~220 Ephemeral Routes & Single-Writer Constraints
- **Category:** Persistence / Architecture / SRE
- **Reported Defect:** In `STORAGE=pg`, only the core career loop was persisted to PostgreSQL (ADR-015). ~220 API routes across LMS courses, gamification XP, salary benchmarks, talent pools, and behavioral discovery kept state in in-process `Map`s and lost all state on restart (`x-talentsphere-durability: ephemeral`). Furthermore, horizontal scaling was unsafe due to absence of single-writer locking.
- **Resolution Lineage & Commits:**
  - `1bb0f625` (PR #40): ADR-015 single-writer PostgreSQL persistence established for core loop.
  - `1515beae`, `e49c43b1` (PR #43): Single API writer enforced via PostgreSQL advisory lock lease (`pg_try_advisory_lock`); worker heartbeat monitored.
  - `000013c3`, `f6612e46`, `34e54020` (PR #51): Account settings and data export requests migrated to PostgreSQL.
  - `735b30ea` (PR #53): Candidate saved searches migrated to PostgreSQL.
  - `47a3f130`, `b30e7e42` (PR #54): Job bookmarks migrated to PostgreSQL.
  - `8864d2c8` (PR #55): Single API container replica configuration locked in Docker Compose.
- **Current Codebase State:** **PARTIALLY ADDRESSED / PROGRESSIVE MIGRATION.**
  Single-writer safety is fully locked in code. Persistence has expanded from core loop to settings, exports, saved searches, and bookmarks. However, ~210 long-tail routes (LMS, gamification, talent discovery, benchmarks) remain in-memory and return `x-talentsphere-durability: ephemeral`. As acknowledged in commit `d3607f0f`: *"Related issues #45 #49 remain open."*
- **Verifying Tests:**
  - `tests/pg/core-persistence.test.ts`
  - `tests/pg/concurrency.test.ts`
  - `tests/pg/saved-searches.test.ts`
  - `tests/pg/saved-jobs.test.ts`

---

### 3.7 Issue #50: Billing & Monetization Integrity / Payment Gateway Integration
- **Category:** Monetization / Billing / Security
- **Reported Defect:** Checkout form previously collected credit card numbers without submitting them to any gateway and activated paid plans without payment. Webhook was unsigned and vulnerable to spoofed payment confirmations.
- **Resolution Lineage & Commits:**
  - `ae99e31c` (PR #40): Card fields removed from web UI; paid plan checkout refused unless `BILLING_MODE=simulated`. Production environment refuses to start if `BILLING_MODE=simulated`.
  - `1bb0f625` (PR #40): Signed webhook verification via HMAC-SHA256 with 5-minute timestamp tolerance.
  - `48b5fd55` (PR #43): Documentation updated confirming billing is disabled in staging/production.
  - `8864d2c8` (PR #55): Staging Docker Compose sets `BILLING_MODE=disabled`.
- **Current Codebase State:** **RESOLVED IN CODE / GATED ON COMMERCIAL PROVIDER.**
  Financial vulnerabilities are completely eliminated: no fake checkout, no unsigned webhooks, and deployed environments refuse simulated billing. However, live Stripe/payment processor integration does not exist; paid plans cannot be purchased by real users.
- **Verifying Tests:**
  - `tests/integration/billing.test.ts`
  - `tests/security/api-security.test.ts`
  - `tests/unit/production-config.test.ts`

---

## 4. Git & GitHub Tracking Reconciliation Matrix

| Entity ID | Entity Type | Title / Focus Area | Source Branch / Author | Merge Commit | Incorporated in `83dc7d24`? | Codebase Status | Key Code Files | Key Verifying Tests |
| :--- | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **PR #40** | PR | Core Loop Durability & Honest Journeys | `improvement/core-loop-durability` | `4004457d` | **YES** | Resolved | `apps/api/src/server.ts`, `apps/web/src/*` | `tests/e2e/core-loop.spec.ts`, `tests/pg/core-persistence.test.ts` |
| **PR #41** | PR | Five-Lock RLS Hardening | `security/five-lock-smoke-hardening-20261018` | `8bdad381` | **YES** | Resolved | `supabase/migrations/00044*` | `tests/security/private-data-rls.test.ts` |
| **PR #42** | PR | RLS Runtime Validation & Secret Scan | `security/rls-runtime-validation-ci-fix-20261018` | `5c130a7e` | **YES** | Resolved | `supabase/migrations/*`, `.github/workflows/ci.yml` | `tests/pg/private-data-rls.test.ts`, `tests/security/private-data-rls.test.ts` |
| **PR #43** | PR | Production Safety Gates & Fail-Closed | `chatgpt/production-safety-gates-20261018` | `d8dd0567` | **YES** | Resolved | `apps/api/src/server.ts`, `apps/api/src/storage/*` | `tests/pg/core-persistence.test.ts`, `tests/security/core-authz.test.ts` |
| **Issue #44** | Issue | Transactional Email & Provider Delivery | Issue Tracker (tracked in PR #43, #51, #55, #57) | N/A (Issue) | N/A | **Partially Addressed** | `apps/worker/src/email-adapter.ts`, `apps/api/src/server.ts` | `tests/unit/production-config.test.ts`, `tests/e2e/frontend-fixes.spec.ts` |
| **Issue #45** | Issue | Reputation Visibility & Candidate Consent | Issue Tracker (tracked in PR #57, #58) | N/A (Issue) | N/A | **Partially Addressed** | `apps/api/src/server.ts`, `packages/domain/src/reputation-engine.ts` | `tests/integration/reputation-visibility.test.ts`, `tests/integration/review-r2-regressions.test.ts` |
| **Issue #46** | Issue | Technical Interview Sandbox Security | Issue Tracker (tracked in PR #40, #43, #57) | N/A (Issue) | N/A | **Partially Addressed** | `apps/api/src/server.ts`, `packages/domain/src/technical-interview.ts` | `tests/integration/technical-interview.test.ts`, `tests/security/core-authz.test.ts` |
| **Issue #47** | Issue | Privacy Policy & Legal Contact Claims | Issue Tracker (tracked in PR #40, #43, #57) | N/A (Issue) | N/A | **Partially Addressed** | `apps/web/src/pages/LegalPages.tsx`, `packages/config/src/env.ts` | `tests/e2e/frontend-fixes.spec.ts`, `tests/security/core-authz.test.ts` |
| **Issue #48** | Issue | User Data Erasure & Scheduled Deletion | Issue Tracker (tracked in PR #40, #43, #51, #57) | N/A (Issue) | N/A | **Partially Addressed** | `apps/api/src/server.ts`, `apps/api/src/storage/erasure-request-store.ts` | `tests/pg/core-persistence.test.ts`, `tests/pg/work-history-removal.test.ts` |
| **Issue #49** | Issue | PostgreSQL Durability vs Ephemeral Routes | Issue Tracker (tracked in PR #40, #43, #51, #53, #54) | N/A (Issue) | N/A | **Partially Addressed** | `apps/api/src/server.ts`, `apps/api/src/storage/*` | `tests/pg/core-persistence.test.ts`, `tests/pg/saved-jobs.test.ts` |
| **Issue #50** | Issue | Payment Gateway & Billing Integrity | Issue Tracker (tracked in PR #40, #43, #55) | N/A (Issue) | N/A | **Partially Addressed** | `apps/api/src/server.ts`, `packages/domain/src/billing.ts` | `tests/integration/billing.test.ts`, `tests/unit/production-config.test.ts` |
| **PR #51** | PR | Privacy, BYO AI Encryption & Resend | `chatgpt/privacy-mail-hardening-20261018` | `4890ef21` | **YES** | Resolved | `apps/worker/src/email-adapter.ts`, `apps/api/src/server.ts` | `tests/pg/core-persistence.test.ts`, `tests/unit/production-config.test.ts` |
| **PR #52** | PR | Release Preflight Migration Drift Gate | `chatgpt/release-preflight-20261018` | `616f942d` | **YES** | Resolved | `scripts/release-preflight.mjs` | Manual preflight execution |
| **PR #53** | PR | Durable Saved Searches Persistence | `chatgpt/durable-saved-searches-20261018` | `eb69a2f8` | **YES** | Resolved | `apps/api/src/storage/saved-searches-store.ts` | `tests/pg/saved-searches.test.ts` |
| **PR #54** | PR | Durable Job Bookmarks & Visibility | `chatgpt/durable-job-bookmarks-20261018` | `1776f948` | **YES** | Resolved | `apps/api/src/storage/saved-jobs-store.ts` | `tests/pg/saved-jobs.test.ts` |
| **PR #55** | PR | Oracle Ampere ARM64 Staging Foundation | `chatgpt/oracle-staging-readiness` | `8864d2c8` | **YES** | Resolved | `deploy/oracle/compose.yaml`, `deploy/oracle/.env.example` | `.github/workflows/oracle-staging.yml` |
| **PR #56** | PR | Staging Backup & Isolated Restore Drill | `chatgpt/oracle-staging-recovery` | `252b03f9` | **YES** | Resolved | `deploy/oracle/verify-backup-restore.sh`, `.gitignore` | Execution of `verify-backup-restore.sh` |
| **PR #57** | PR | Audit Findings Port & Frontend Fixes | `claude/issues-44-50-fixes` | `9156b1a8` | **YES** | Resolved | `apps/api/src/server.ts`, `apps/web/src/pages/*` | `tests/e2e/frontend-fixes.spec.ts`, integration suites |
| **PR #58** | PR | Review Round 2 Regressions & BR-167 | `claude/audit-f01-f04-r2` | `61eae132` | **YES** | Resolved | `apps/api/src/server.ts`, `packages/config/src/env.ts` | `tests/integration/reputation-visibility.test.ts`, `tests/integration/review-r2-regressions.test.ts` |
| **Commit `83dc7d24`** | Commit | Knowledge Graph & Architecture Index | `main` / `repository_audit_roadmap` | `83dc7d24` | **HEAD** | Resolved | `graphify-out/*` | Graphify AST and HTML reports |

---

*Report ratified and published by the Teamwork Master Synthesis Engineering Group at commit `83dc7d24`.*
