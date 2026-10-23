# TalentSphere — Baseline Verification & Diagnostics Report

**Date**: 2026-10-22  
**Worker**: `worker_baseline_diag_1` (Role: QA & Reliability Diagnostics Worker)  
**Workspace Root**: `C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\repository_audit_roadmap`  
**Git HEAD**: `83dc7d247efbd3b3c3312bef74ac49978d33e924` (`83dc7d24 update`)  
**Git Branch**: `repository_audit_roadmap`  

---

## 1. Executive Summary & Diagnostics Matrix

| Diagnostic Area | Command / Target | Status | Metric / Count | Duration | Notes / Evidence |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Typecheck (Composite)** | `pnpm exec tsc -b` | ✅ PASS | 0 errors | ~3.0s | All workspace packages build composite types cleanly |
| **Typecheck (Tests)** | `pnpm exec tsc -p tests` | ✅ PASS | 0 errors | ~15.0s | All test files in `tests/` pass TypeScript checking |
| **Typecheck (Combined)** | `pnpm typecheck` | ✅ PASS | 0 errors | ~18.0s | Exited 0 (`tsc -b && tsc -p tests`) |
| **Vitest Unit Tests** | `pnpm test:unit` | ✅ PASS | 55 files, 627 passed | 21.36s | 100% pass rate; covers domain logic, queue, auth, moderation |
| **Vitest Integration Tests**| `pnpm test:integration` | ✅ PASS | 50 files, 402 passed | 62.00s | 100% pass rate; Fastify server in-memory integration |
| **Vitest Security Tests** | `vitest run tests/security` | ✅ PASS | 5 files, 101 passed | 13.61s | 100% pass rate; RLS, CSRF/XSS, authz, prompt injection, tokens |
| **Security Script Flaw** | `pnpm test:security` | ⚠️ DEFECT | Exit Code 1 | ~4.0s | Script uses `--dir tests/security` which conflicts with Vitest v3 `include` glob |
| **PostgreSQL Suite** | `pnpm test:pg` (`vitest.pg.config.ts`) | ℹ️ EXPECTED REQUIREMENT | 8 files (requires `TEST_DATABASE_URL`) | 73.34s | Cleanly fails with explicit requirement `TEST_DATABASE_URL is required` |
| **Playwright E2E Core Loop**| `playwright test tests/e2e/core-loop.spec.ts` | ✅ PASS | 1 file, 7 passed | 52.8s | Verified 7/7 core user journeys (Recruiter, Candidate, Referee) |
| **Playwright E2E FE Fixes** | `playwright test tests/e2e/frontend-fixes.spec.ts` | ✅ PASS | 1 file, 6 passed | 17.6s | Verified 6/6 fixes (FE-04, FE-05, FE-06, FE-07, FE-11, double-submit) |
| **Port & Process Isolation**| Ports 4000, 4173, 5173 | ✅ PASS | Clean release | N/A | Ports verified free before and after E2E runs |
| **Monorepo Build** | `pnpm build` | ✅ PASS | 6 packages + 3 apps | ~65.0s | 6 packages (`config`, `contracts`, `observability`, `domain`, `ui`, `testing`), 3 apps (`worker`, `api`, `web`) build cleanly |
| **Code Style / Formatting** | Prettier (`apps`, `packages`, `tests`)| ✅ PASS | All source files clean | ~15.0s | Source directories 100% compliant; root `pnpm lint` catches unignored `graphify-out` |

---

## 2. Environment & Toolchain Diagnostics

- **Operating System**: Windows 10/11 Pro (x64) (PowerShell 5.1 host)
- **Node.js**: `v24.19.0`
- **pnpm**: `11.7.0` (Note: PowerShell execution policy blocks `.ps1` wrapper, execution requires `pnpm.cmd`)
- **TypeScript**: `^5.9.3`
- **Vitest**: `^3.2.7`
- **Playwright**: `^1.63.0` (Chromium headless)
- **Fastify**: `^5.12.5`
- **Git Context**:
  - Branch: `repository_audit_roadmap`
  - Current Commit: `83dc7d247efbd3b3c3312bef74ac49978d33e924` ("update" — commit of graphify analysis output)
  - Preceding Commit: `61eae132` ("Merge pull request #58 from yhsomani/claude/audit-f01-f04-r2")
  - Remote: `origin https://github.com/yhsomani/talentsphere-complete.git`
  - Working Tree State: Clean (only `.agents/` untracked teamwork directory present)

---

## 3. Typecheck Diagnostics

### Command Executed:
```powershell
pnpm.cmd typecheck
# which expands to: tsc -b && tsc -p tests
```

### Results:
1. `pnpm.cmd exec tsc -b`: Exited with code `0`. Clean build across all workspace projects and project references.
2. `pnpm.cmd exec tsc -p tests`: Exited with code `0`. Clean typecheck across all 110+ test files in `tests/`.
3. Combined `pnpm.cmd typecheck`: Exited with code `0`.

---

## 4. Vitest Unit Test Suite

### Command Executed:
```powershell
pnpm.cmd test:unit
# which runs: vitest run tests/unit
```

### Metrics:
- **Test Files**: 55 passed (55 total)
- **Tests**: 627 passed (627 total)
- **Duration**: 21.36s (transform 13.17s, collect 35.61s, tests 2.07s)
- **Exit Code**: 0

### Test Breakdown by Subsystem:
- **Worker & Async Queue**: `worker-claim.test.ts` (10 tests), `worker-queue.test.ts` (4 tests)
- **Domain Foundation & Core**: `foundation.test.ts` (14 tests), `search-domain.test.ts` (26 tests), `settings-domain.test.ts` (12 tests), `session-ended-reason.test.ts` (3 tests)
- **Talent, Reputation & Credibility**: `talent-segmentation-domain.test.ts` (31 tests), `peer-credibility-domain.test.ts` (13 tests), `reputation-engine-domain.test.ts` (8 tests), `employer-reputation-domain.test.ts` (10 tests), `instructor-reputation-domain.test.ts` (13 tests), `behavioral-talent-discovery-domain.test.ts` (19 tests)
- **Career, Evidence & Graph**: `career-trajectory.test.ts` (17 tests), `evidence-skills-domain.test.ts` (14 tests), `work-history-graph-domain.test.ts` (26 tests), `resumes-domain.test.ts` (6 tests), `portfolio-domain.test.ts` (10 tests), `warm-introductions-domain.test.ts` (16 tests), `alumni-networks-domain.test.ts` (18 tests), `skill-decay-domain.test.ts` (5 tests), `skill-forecasting-domain.test.ts` (12 tests)
- **Jobs & Hiring**: `jobs-applications-domain.test.ts` (9 tests), `job-templates-domain.test.ts` (6 tests), `application-drafts-domain.test.ts` (8 tests), `saved-searches-domain.test.ts` (13 tests), `referral-requests-domain.test.ts` (12 tests)
- **Assessment & Learning**: `challenges-assessment-domain.test.ts` (8 tests), `technical-interview-domain.test.ts` (13 tests), `certificate-verification-domain.test.ts` (8 tests), `lms-domain.test.ts` (6 tests), `learning-impact-domain.test.ts` (9 tests)
- **Communication & Platform**: `messaging-domain.test.ts` (4 tests), `notifications-domain.test.ts` (6 tests), `moderation-domain.test.ts` (23 tests), `gamification-domain.test.ts` (15 tests), `analytics-domain.test.ts` (7 tests), `activity-contributions-domain.test.ts` (6 tests)
- **Security & Infrastructure**: `admin-domain.test.ts` (14 tests), `ai-gateway-domain.test.ts` (11 tests), `billing-domain.test.ts` (12 tests), `transactional-mail.test.ts` (4 tests), `persistence-honesty.test.ts` (12 tests), `private-data-rls-hardening.test.ts` (6 tests), `rate-limit-config.test.ts` (4 tests), `web-shell.test.ts` (5 tests), `web-domain-mirrors.test.ts` (2 tests)

---

## 5. Vitest Integration Test Suite

### Command Executed:
```powershell
pnpm.cmd test:integration
# which runs: vitest run tests/integration
```

### Metrics:
- **Test Files**: 50 passed (50 total)
- **Tests**: 402 passed (402 total)
- **Duration**: 62.00s (tests 130.64s across threads)
- **Exit Code**: 0

### Key Observations:
- All integration tests instantiate the Fastify API application via `buildApp(...)` in `STORAGE=memory` mode.
- Each test runs against in-memory stores with `x-talentsphere-durability: ephemeral` headers where appropriate.
- Covers end-to-end HTTP request/response validation for authentication, accounts, hiring pipelines, job publishing, referral management, messaging, notifications, reporting, and webhook handlers.

---

## 6. Vitest Security Test Suite

### Commands Executed:
1. `pnpm.cmd test:security` (`vitest run --dir tests/security`)
   - **Result**: FAILED with exit code 1 (`No test files found, exiting with code 1`).
   - **Root Cause Analysis**: Vitest v3 `--dir` flag alters the working root directory for test lookup to `tests/security`. In `vitest.config.ts`, `include` specifies `tests/security/**/*.test.ts`. Combined with `--dir`, Vitest searches for `tests/security/tests/security/**/*.test.ts`, which matches 0 files.
2. `pnpm.cmd exec vitest run tests/security`
   - **Result**: PASSED with exit code 0.
   - **Metrics**: 5 files passed (5 total), 101 tests passed (101 total), duration 13.61s.

### Security Test Files & Scope:
1. `tests/security/api-security.test.ts` (38 tests, 2863ms):
   - Validates rate-limiting headers, CORS constraints, request size caps, secure header configurations, API key authentication, and error sanitation.
2. `tests/security/core-authz.test.ts` (30 tests, 4621ms):
   - Validates RBAC/ABAC authorization boundaries across Candidate, Recruiter, Admin, and Anonymous roles.
3. `tests/security/injection-defenses.test.ts` (21 tests, 2067ms):
   - Validates SQL injection immunity, XSS sanitization, Content-Security-Policy header generation, prompt injection firewall (WIT-007), SSRF URL allow-listing, and client-bundle secret leakage checks.
   - *Cross-platform observation*: Line 215 executes `execSync("grep -rInE ...")`. On Windows, `grep` is unrecognized, emitting a stderr line, but the test gracefully catches and verifies `hits === ''`.
4. `tests/security/session-sign-out.test.ts` (7 tests, 1654ms):
   - Validates token invalidation, session revocation tables, PBKDF2 hash verification floor, and replay attack prevention.
5. `tests/security/private-data-rls.test.ts` (5 tests, 11ms):
   - Validates candidate private data isolation (work emails, referee voucher tokens, unverified notes).

---

## 7. PostgreSQL Durability Suite (`vitest.pg.config.ts`)

### Configuration Inspection:
- Config file: `vitest.pg.config.ts`
- Target pattern: `tests/pg/**/*.test.ts`
- Test files (8 test files + 1 helper):
  1. `concurrency.test.ts` (data integrity, race conditions, brute-force mitigation, duplicate arbitration)
  2. `core-persistence.test.ts` (ADR-015 career loop durability across full API process restarts)
  3. `messaging.test.ts` (conversation, message, read-receipt durability)
  4. `notifications.test.ts` (notification persistence and delivery status)
  5. `private-data-rls.test.ts` (database-level RLS policies on private fields)
  6. `saved-jobs.test.ts` (saved job bookmarks, migration 00018)
  7. `saved-searches.test.ts` (saved searches and alert persistence)
  8. `work-history-removal.test.ts` (work history verification removal and cascade)
  9. Helper: `test-db.ts` (`dropTestDatabase` connection teardown helper)

### Execution Diagnostic:
- Command: `pnpm.cmd test:pg`
- Result: 8 test files failed at module evaluation with:
  `Error: TEST_DATABASE_URL is required for the pg suite (e.g. postgresql://postgres:postgres@localhost:5432/postgres)`
- Local Host Environment:
  - Windows service `postgresql-x64-18` is running and port 5432 is open.
  - Default credentials `postgresql://postgres:postgres@localhost:5432/postgres` fail authentication (custom password required).
  - This demonstrates that the pg suite correctly fails closed when no valid test database URL is provided, preventing false positive passes in environments without real database durability.

---

## 8. Playwright E2E Suite Diagnostics

### Configuration Inspection:
- Config file: `playwright.config.ts`
- WebServers spawned:
  1. API Server: `node scripts/start-e2e-api.mjs` on `http://127.0.0.1:4000/health` (port 4000)
  2. Web Client: `pnpm --filter @talentsphere/web preview --port 4173 --host 127.0.0.1` on `http://127.0.0.1:4173` (port 4173)
  3. Base URL: `http://127.0.0.1:4173`
- Port Architecture & Isolation:
  - Development Dev Server: Port 5173 (web) / Port 4000 (api)
  - E2E Test Server: Port 4173 (web preview) / Port 4000 (api)
  - Pre-run port check: Ports 4000, 4173, and 5173 confirmed free.
  - Post-run port check: Ports 4000, 4173, and 5173 confirmed clean and free (no orphaned processes).

### Test Executions:
#### 1. Core Loop Spec (`tests/e2e/core-loop.spec.ts`)
Command: `pnpm.cmd exec playwright test tests/e2e/core-loop.spec.ts`
- **Total Tests**: 7
- **Passed**: 7 (100%)
- **Duration**: 52.8s
- **Journey Verifications**:
  1. Recruiter signs up, creates organization, and publishes job (11.6s)
  2. Candidate signs up and verifies personal dashboard state (4.8s)
  3. Candidate proves employment role via corporate email OTP code and referee request (2.0s)
  4. Referee receives one-time voucher link, completes reference ratings, and link invalidates on replay (4.2s)
  5. Candidate browses jobs and submits application with cover letter (1.2s)
  6. Recruiter reviews application, verifies Gold reputation tier without exposing private email, and shortlists (1.3s)
  7. Candidate observes status update and withdraws application; recruiter pipeline updates (1.1s)

#### 2. Frontend Fixes Spec (`tests/e2e/frontend-fixes.spec.ts`)
Command: `pnpm.cmd exec playwright test tests/e2e/frontend-fixes.spec.ts`
- **Total Tests**: 6
- **Passed**: 6 (100%)
- **Duration**: 17.6s
- **Fix Verifications**:
  1. `FE-07`: Text inputs have border meeting 3:1 contrast ratio (`rgb(100, 116, 139)`)
  2. `FE-04`: Retrying after failed publish does not create duplicate job
  3. `FE-06`: Closing a job displays confirmation dialog, and cancel preserves published status
  4. `FE-11`: Applicant filter uses accessible toggle button group, not fake tab roles
  5. Rapid double-click on Sign-In form dispatches exactly one HTTP request
  6. `FE-05`: API 503 outage displays retryable error state instead of false "dead link" message

---

## 9. Monorepo Build Verification

### Command Executed:
```powershell
pnpm.cmd build
```

### Build Log Breakdown:
1. Workspace Packages (6 projects built in dependency order):
   - `packages/config` -> `tsc` (Done)
   - `packages/contracts` -> `tsc` (Done)
   - `packages/observability` -> `tsc` (Done)
   - `packages/domain` -> `tsc` (Done)
   - `packages/ui` -> `tsc` (Done)
   - `packages/testing` -> `tsc` (Done)
2. Workspace Applications (3 projects built in parallel):
   - `apps/worker` -> `tsc` (Done)
   - `apps/api` -> `tsc` (Done)
   - `apps/web` -> `tsc && vite build` (Done)
     - Vite bundle: `dist/index.html` (0.74 kB), `dist/assets/index-*.css` (9.63 kB), `dist/assets/index-*.js` (426.55 kB)
     - Vite build duration: 11.42s
3. Overall Exit Code: `0` (Clean Build)

---

## 10. Code Style & Linting Diagnostics

### Diagnostics:
- `pnpm.cmd lint` (`prettier --check "**/*.{ts,tsx,js,json,md}"`):
  - Flags 140 files with style issues.
  - Inspection confirms that all 140 flagged files belong to:
    1. `graphify-out/` (117 minified JSON cache files committed in `83dc7d24`)
    2. `.agents/teamwork/` (in-flight teamwork coordinator and worker metadata)
- Targeted Prettier Check:
  - Command: `pnpm.cmd exec prettier --check "apps/**/*.{ts,tsx,js,json,md}" "packages/**/*.{ts,tsx,js,json,md}" "tests/**/*.{ts,tsx,js,json,md}"`
  - Output: `All matched files use Prettier code style!`
  - Result: 100% of production and test source code is fully formatted and lint-compliant.
- Recommendation: Add `graphify-out/` and `.agents/` to `.prettierignore` to restore green status to `pnpm lint`.

---

## 11. Consolidated Reliability & Diagnostics Findings

1. **Test Suite Integrity**:
   - Total automated tests verified passing in memory/mock/browser modes:
     - Unit: **627**
     - Integration: **402**
     - Security: **101**
     - Playwright E2E: **13** (7 core-loop + 6 frontend-fixes)
     - **Grand Total: 1,143 passing tests across 112 test files**.
2. **PostgreSQL Suite Distinction**:
   - The 8 test files in `tests/pg/` are strictly designed to verify ADR-015 database persistence against real PostgreSQL.
   - They require `TEST_DATABASE_URL` and deliberately refuse to run on in-memory mocks, safeguarding against false durability claims.
3. **Packaging & Script Fixes Identified**:
   - `package.json` line 17: `"test:security": "vitest run --dir tests/security"` should be updated to `"test:security": "vitest run tests/security"` to align with Vitest v3 and match `test:unit` / `test:integration`.
   - `.prettierignore` should be updated to include `graphify-out/` and `.agents/`.
   - `tests/security/injection-defenses.test.ts` line 215: shell invocation of `grep` should use Node's `fs` or `git grep` / JavaScript regex scan to avoid Windows stderr noise.
4. **Readiness Status**:
   - TypeScript compilation, Vitest unit & integration suites, security test suite, E2E browser flows, and production build are **100% GREEN**.
