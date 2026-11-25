# Repository state reports, October 2026

> **Status.** History. Dated snapshots (2026-10-22 and 2026-10-23). Current code, open GitHub issues and `ARCHITECTURE.md` win any conflict.
>
> **What this file holds.** Architecture and durability review, git and issue reconciliation, release scope and backlog, and the second-pass re-audit with its GitHub issue report.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

| Section | Former file |
|---|---|
| TalentSphere — Architecture, Security, Durability & Integrations Report | `docs/reports/ARCHITECTURE_DURABILITY_REPORT.md` |
| TalentSphere — Git History, Issues & Pull Requests Reconciliation Report | `docs/reports/GIT_RECONCILIATION_REPORT.md` |
| TalentSphere — Release Scope, Backlog & Sprint Roadmap (Stages A–F) | `docs/reports/RELEASE_SCOPE_AND_BACKLOG.md` |
| TalentSphere — Repository Re-Audit & GitHub Issue Reconciliation | `docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md` |

## TalentSphere — Architecture, Security, Durability & Integrations Report

_Former file: `docs/reports/ARCHITECTURE_DURABILITY_REPORT.md`._

> Historical report: findings, counts and executed checks below belong to the recorded revision/session. Current source references and inspection limits are in [the implementation inventory](../system-model/01-inventory-and-coverage.md). No historical pass is a fresh release certification.

**Date:** 2026-10-22  
**Author:** Teamwork Master Synthesis Engineering Group  
**Repository:** `https://github.com/yhsomani/talentsphere-complete.git`  
**Git HEAD:** `83dc7d247efbd3b3c3312bef74ac49978d33e924`  
**Active Branch:** `repository_audit_roadmap`  
**Authoritative Baselines:** `SSOT.md` v6.0, `ADR-015`, `TRD.md`, `SECURITY.md`, `deploy/oracle/compose.yaml`

---

### 1. Executive Summary

TalentSphere implements a **hybrid persistence and security architecture**:
1. **Core Career Loop Durability (ADR-015)**: The critical career loop (authentication, candidate profiles, skills taxonomy DAG, job postings, applications, applicant review pipelines, verified work history, referee vouchers, direct messaging, notifications, and privacy settings) is durably backed by PostgreSQL 16. It operates as a single-writer hydrated read model protected by optimistic concurrency controls and a PostgreSQL session advisory lock.
2. **Ephemeral Long-Tail Exposure**: 217 out of 274 registered Fastify API routes (~80%) maintain state solely within ~150 in-process `Map` collections inside `apps/api/src/server.ts`. Data for learning management (courses, enrollments, certificates), coding challenges, assessment sessions, reputation scores, salary benchmarks, talent pools, and draft applications is completely lost upon server restart or pod redeployment.
3. **Cryptographic Proof-of-Control**:
   - **Corporate Email Verification**: Uses a 6-digit numeric OTP with 15-minute TTL and 5-attempt limit. However, the hash is computed as plain SHA-256 (`sha256Hex(`${id}:${code}`)`) with a public UUID salt and **no HMAC secret key** (**SEC-01**). A database leak allows precomputation / rainbow-table reversal in $<50$ms.
   - **Referee Voucher Tokens**: Uses 128-bit cryptographically secure pseudorandom tokens stored as SHA-256 hashes with single-use consumption and idempotency keys. However, tokens have **no expiration date (TTL)** and remain permanently valid (**SEC-02**).
4. **Auth & Session Security**: Password hashing complies with OWASP 2023 standards (PBKDF2-HMAC-SHA512, 210,000 iterations) with transparent upgrade on sign-in and timing decoy hashing. Session revocation via `revoked_sessions` and `sessions_valid_after` is well-implemented. However, PostgreSQL Row Level Security (RLS) is **bypassed by the Fastify API** because it connects as the database superuser/owner (**SEC-04**).
5. **AI Governance**: `AI_PROHIBITED` is enforced server-side, but relies on an in-memory assessment session map that clears on restart (**SEC-05**). Quota metering hardcodes `userTier: 'free'`, capping paying users at free limits (**SEC-06**). No remote LLMs are integrated; all responses are generated via local heuristic pattern matching.
6. **Integrations & Infrastructure**: Resend email adapter properly separates transient vs permanent errors and fails closed in staging/prod. Stripe integration does not exist (simulated mode only); billing webhooks require signed HMAC-SHA256 headers with replay tolerance. The Oracle ARM64 staging compose configuration enforces strict private networking for DB and API, but packages unpruned build dependencies and misses root `/health` proxying in Caddy (**OPS-02**).

---

### 2. Persistence & Durability Architecture (ADR-015)

#### 2.1 The Hydrated Read Model & Single-Writer Constraint

Under **ADR-015** (*Core Career Loop Persistence Architecture*), the API decouples fast in-memory query reads from ACID transactional writes:
- **Write Path**: In `apps/api/src/server.ts:13317-13335`, state mutations pass through `persist(...ops: CoreOp[])`. In `STORAGE=pg`, ops are committed inside a single PostgreSQL transaction (`PgCoreStore.commit` in `apps/api/src/storage/core-store.ts:785-801`). Only after successful transaction `COMMIT` does `applyToReadModel` mutate in-process memory `Map`s. If the transaction aborts, the read model is untouched and the request fails with a 4xx/5xx error.
- **Topological Write Ordering (`WRITE_ORDER`)**: `apps/api/src/storage/core-store.ts:753-778` orders operations topologically:
  $$\text{users} \to \text{profiles} \to \text{skills} \to \text{orgs} \to \text{memberships} \to \text{jobs} \to \text{evidence} \to \text{applications} \to \text{work history} \to \text{references} \to \text{notifications/sessions} \to \text{deletes}$$
  This strictly prevents foreign key constraint violations regardless of caller invocation order.
- **Boot Hydration**: `apps/api/src/storage/core-store.ts:803-854` (`PgCoreStore.load`) executes 20 parallel `SELECT * FROM table ORDER BY created_at, id` queries to hydrate the in-process Maps prior to accepting traffic.
- **Single-Writer Advisory Lock**: Because reads query in-process Maps, running two API replicas against the same database would cause read-model divergence. To prevent horizontal split-brain, `apps/api/src/storage/index.ts:107-137` acquires a session-level PostgreSQL advisory lock on boot:
  ```sql
  SELECT pg_try_advisory_lock(718201, 1) AS acquired
  ```
  If a second API replica attempts to start against the database, `acquireWriterLease()` throws:
  `Error: A second API writer is already connected to this database. The hydrated read model supports one API instance only (ADR-015).`
  A lost database connection marks `writerLeaseLost = true`, causing `app.addHook('onRequest')` (`apps/api/src/server.ts:523-535`) to fail closed with `503 SERVICE_UNAVAILABLE`.

#### 2.2 Concurrency Control & Optimistic Locking

To prevent race conditions during the asynchronous `await storage.core.commit(ops)` window:
1. **In-Flight Write Locks**: `apps/api/src/server.ts:13317-13335` registers record keys in `writesInFlight: Set<string>`. If another concurrent write targets the same record key, it immediately throws `409 CONFLICT` (`concurrent_modification`).
2. **Read-Model Optimistic Checks**: Updates carry `base`. If `currentRecord(op) !== op.base`, `persist()` rejects with `409 CONFLICT`.
3. **Database Guard Clauses**: Inside the SQL transaction, update statements enforce column-level predicates:
   - `jobs` (`core-store.ts:354`): `WHERE $14::text IS NULL OR jobs.status::text = $14::text`
   - `job_applications` (`core-store.ts:396`): `WHERE $15::text IS NULL OR job_applications.status::text = $15::text`
   - `evidence` (`core-store.ts:441`): `WHERE $17::text IS NULL OR (evidence.status::text = $17::text AND evidence.verification_level::text = $18::text)`
   - `verified_work_histories` (`core-store.ts:495`): `WHERE $20::boolean IS NOT TRUE OR (verification_score = $21 AND email_verified_at IS NOT DISTINCT FROM $22::timestamptz)`
   - `employment_references` (`core-store.ts:541`): `WHERE $20::text IS NULL OR employment_references.status::text = $20::text`
   - `work_history_email_challenges` (`core-store.ts:577`): `WHERE work_history_id = $1 AND code_hash = $3 AND attempts = $4`
   `assertGuardHeld(expected, result)` throws `DomainError('CONFLICT', 'Record was modified concurrently.')` if `result.rowCount === 0`.

#### 2.3 Durable vs. Ephemeral Routes Audit

`apps/api/src/durability.ts` and `apps/api/src/server.ts:574-579` enforce runtime durability disclosure:
```typescript
app.addHook('onSend', async (req, reply) => {
  reply.header('x-request-id', req.id);
  if (storage.core.durable === false || isEphemeralRoute(req.method, req.routeOptions?.url)) {
    reply.header('x-talentsphere-durability', 'ephemeral');
  }
});
```

- **Total Registered Routes**: **274**
- **Durable Routes**: **54** (19.7%) — identity, profiles, evidence, taxonomy, organizations, jobs, applications, verified work history, references, corporate email verification, messaging, notifications, saved searches, saved jobs, account settings.
- **Stateless Routes**: **3** (1.1%) — `/health`, `/api/v1/health`, `/api/v1/billing/plans`.
- **Ephemeral Routes**: **217** (79.2%) — all other `/api/` endpoints.

| Ephemeral Domain Area | Route Count | Representative Endpoints | Impact of Restart / Crash |
| :--- | :---: | :--- | :--- |
| **LMS & Courses** | ~24 | `POST /api/v1/courses`, `POST /api/v1/courses/:id/enroll`, `POST /api/v1/courses/lessons/:id/progress`, `POST /api/v1/courses/:id/certificate` | All created courses, enrollments, module progress, and issued certificates are deleted. |
| **Code Arena & Assessments** | ~14 | `POST /api/v1/challenges`, `POST /api/v1/challenges/:id/sessions`, `POST /api/v1/challenges/sessions/:id/submit` | Active exam sessions, candidate code submissions, and execution scores are wiped. |
| **Gamification & XP** | ~8 | `GET /api/v1/xp/ledger`, `GET /api/v1/gamification/leaderboard`, `POST /api/v1/gamification/badges/claim` | XP transaction histories and daily cap trackers reset to 0. |
| **Technical Interviews** | ~18 | `POST /api/v1/interviews/sessions`, `POST /api/v1/interviews/sessions/:id/scorecards` | Recruiter scorecards and candidate assessment records are lost. |
| **Reputation & Endorsements** | ~22 | `POST /api/v1/endorsements`, `POST /api/v1/instructors/:id/reviews`, `POST /api/v1/employers/:id/reviews` | Peer credibility endorsements, student reviews, and calculated scores disappear. |
| **Career Trajectory & Forecasts**| ~16 | `POST /api/v1/careers/transitions`, `POST /api/v1/skills/forecast` | Anonymized benchmark transitions and 12-month supply/demand forecasts are wiped. |
| **Moderation & Trust/Safety** | ~12 | `POST /api/v1/moderation/reports`, `POST /api/v1/moderation/reports/:id/appeal` | User reports, moderation audit logs, and ban appeals vanish. |
| **Application Drafts & Resumes** | ~14 | `POST /api/v1/applications/drafts`, `POST /api/v1/resumes` | Candidate draft applications and resume documents are deleted. |
| **Billing & Subscriptions** | ~6 | `POST /api/v1/billing/subscribe`, `POST /api/v1/billing/cancel`, `POST /api/v1/billing/webhook` | Subscription states, invoices, and webhook deduplication keys are lost. |

#### 2.4 Operational Bottlenecks & Scalability Limits

1. **Unbounded Boot Scaling ($O(N)$)**:
   `PgCoreStore.load()` queries every row in `users`, `profiles`, `jobs`, `applications`, `evidence`, `messages`, and `notifications`. In production with 100,000 users and 1,000,000 messages, Node.js heap consumption will exceed 2GB and boot hydration will take tens of seconds, causing healthcheck timeouts during rolling deployments (**OPS-01**).
2. **Junction Table Write Amplification**:
   On every update to a job, application, or evidence record, `PgCoreStore.writeOp` executes:
   ```sql
   DELETE FROM public.job_skills WHERE job_id = $1;
   INSERT INTO public.job_skills ... SELECT $1, unnest($2::uuid[]);
   ```
   (Identical pattern for `application_evidence` and `evidence_skills`). This generates severe write amplification, index churn, and dead tuples in PostgreSQL MVCC.
3. **Out-of-Band State Invalidation**:
   If an operator manually inserts or updates a row directly in PostgreSQL (e.g. provisioning an admin, updating job status), the API will continue serving stale data from its in-memory Map until the process is restarted.
4. **Horizontal Scaling Ceiling**:
   Horizontal scaling is completely prohibited. The advisory lock explicitly enforces $N=1$.

---

### 3. Work-History Proof of Control Audit

#### 3.1 Corporate Email Verification Flow

Implemented in `apps/api/src/server.ts:12421-12553` across two distinct steps:
1. **Step 1: Code Request**:
   - `assertCorporateEmailEligible(email, companyDomain)` validates domain matching (`verifyCorporateEmailDomain`) and rejects disposable email providers (`DISPOSABLE_EMAIL_DOMAINS`) or consumer webmail (`CONSUMER_WEBMAIL_DOMAINS`).
   - Generation: `const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');` (6-digit numeric string, $\approx 19.93$ bits of entropy).
   - Storage:
     ```typescript
     const challenge: EmailChallenge = {
       workHistoryId: id,
       email,
       codeHash: sha256Hex(`${id}:${code}`),
       attempts: 0,
       expiresAt: new Date(now.getTime() + EMAIL_CHALLENGE_TTL_MS).toISOString(),
       createdAt: now.toISOString(),
     };
     ```
   - TTL: `EMAIL_CHALLENGE_TTL_MS = 15 * 60 * 1000` (15 minutes).
   - Delivery: Enqueued durably via `storage.jobs.enqueue({ kind: 'work_history.email_verification_requested', ... })`. Never returned in HTTP responses.
2. **Step 2: Code Verification**:
   - Compares candidate code against `challenge.codeHash`:
     ```typescript
     if (!safeEqualHex(sha256Hex(`${id}:${body.verificationCode.trim()}`), challenge.codeHash))
     ```
   - Brute-force & Concurrency Defense: `EMAIL_CHALLENGE_MAX_ATTEMPTS = 5`.
     When an incorrect code is submitted, an optimistic update increments `attempts: challenge.attempts + 1` with `base: challenge`. In SQL (`core-store.ts:574-580`):
     ```sql
     WHERE work_history_id = $1 AND code_hash = $3 AND attempts = $4
     ```
     Parallel requests cannot bypass attempt counting.
   - Single-use Consumption: Upon verification, `emailChallengeDelete` deletes the challenge with `base: challenge`, and `verifyCorporateEmail()` awards verified status.

##### Vulnerability SEC-01: Insecure Challenge Hash (Missing HMAC Key)
- **Severity**: **High** (CWE-328 / CWE-916)
- **Finding**: The challenge hash is computed as:
  ```typescript
  sha256Hex(`${id}:${code}`) // where id is the public workHistoryId UUID
  ```
- **Mechanism**: The work history ID `id` is a known public UUID exposed in API requests and profile graphs. The code space is only $10^6$ combinations ($000000$ to $999999$). There is **no secret server pepper or HMAC key** used in hashing. If an attacker gains read access to `public.work_history_email_challenges` (via SQL injection, database snapshot, or read replica compromise), they can precompute a 1,000,000-entry rainbow table for that specific UUID in less than 50 milliseconds using standard GPU SHA-256 acceleration, completely bypassing mailbox control.
- **Remediation**: Hash with `crypto.createHmac('sha256', env.TOKEN_SECRET).update(`${id}:${code}`).digest('hex')`.

---

#### 3.2 Single-Use Referee Voucher Tokens

Implemented in `apps/api/src/server.ts:12555-12780` and `packages/domain/src/work-history-graph.ts:494-585`:
1. **Minting & Entropy**:
   ```typescript
   const token = crypto.randomBytes(16).toString('hex');
   ```
   Generates a 128-bit cryptographically secure pseudorandom token (32 hex characters).
2. **Storage & Secret Protection**:
   - The token plaintext is stripped from API response payloads (`publicReference` in `server.ts:12366-12369`).
   - Stored in database table `employment_references` as `token_hash CHAR(64)` (`00043_core_persistence_alignment.sql:105`).
   - Plaintext `token` exists only briefly in memory to be enqueued in the durable worker job (`reference.requested`) for delivery to `refereeEmail`.
3. **Referee Access & Evaluation**:
   - The referee accesses `GET /api/v1/references/:refId` passing header `x-reference-token: <token>`.
   - Token is verified using constant-time comparison: `safeEqualHex(sha256Hex(token), reference.tokenHash)`.
   - Candidate details and dates are returned; invalid tokens return generic `404 NOT_FOUND` to prevent ID harvesting (`server.ts:12668`).
4. **Consumption & Replay Prevention**:
   - On submission, `tokenHash` is set to `undefined` (written as `NULL` in SQL) and `status: 'submitted'`.
   - Concurrency is guarded by `base: reference` in SQL:
     ```sql
     WHERE $20::text IS NULL OR employment_references.status::text = $20::text
     ```
     Once consumed, `tokenHash` is null and status is `'submitted'`, preventing replay.
5. **Anti-Self Endorsement Enforcement**:
   - In domain (`work-history-graph.ts:499-507`):
     - `refereeUserId === candidateUserId` $\to$ throws `409 CONFLICT`
     - `refereeEmail === candidateEmail` $\to$ throws `409 CONFLICT`
   - In API route (`server.ts:12701`):
     - `session && session.userId === reference.candidateId` $\to$ throws `403 FORBIDDEN`
6. **Replay & Double-Submission Guards**:
   - `clientRequestId` idempotency key: `referencesByClientRequest` deduplicates retry submissions.
   - Enforced by PostgreSQL partial unique index:
     ```sql
     CREATE UNIQUE INDEX uq_reference_client_request ON public.employment_references (candidate_id, client_request_id) WHERE client_request_id IS NOT NULL;
     ```

##### Vulnerability SEC-02: Missing Token Expiration (Indefinite TTL)
- **Severity**: **Medium** (CWE-613)
- **Finding**: Referee voucher tokens have **no expiration timestamp**.
- **Mechanism**: `EmploymentReference` stores `requestedAt` and `submittedAt`, but lacks an `expiresAt` column. Neither domain logic nor API checks token age. An invitation sent to an employee remains valid months or years later, even if the referee leaves the company, changes roles, or becomes adversarial.
- **Remediation**: Add `expires_at TIMESTAMPTZ` (30 days TTL) to `employment_references` and validate `Date.now() < Date.parse(reference.expiresAt)` upon lookup and submission.

---

### 4. Auth & Session Security Audit

#### 4.1 Password Hashing & Verification (PBKDF2 Floor)

Implemented in `packages/domain/src/auth.ts:1-91`:
- **Current Algorithm**: PBKDF2-HMAC-SHA512 with 64-byte derived key length.
- **Iteration Floor**: `PBKDF2_DEFAULT_ITERATIONS = 210_000` (meets OWASP 2023 recommendations).
- **Environment Override Floor**: `configuredPasswordIterations()` enforces a hard minimum floor:
  ```typescript
  const raw = Number(process.env.PASSWORD_PBKDF2_ITERATIONS);
  return Number.isInteger(raw) && raw >= 1000 ? raw : PBKDF2_DEFAULT_ITERATIONS;
  ```
- **Transparent Re-Hash**: On successful sign-in (`apps/api/src/server.ts:1053-1063`), if `passwordNeedsRehash(user.passwordHash)` is true, the hash is upgraded to 210,000 iterations while the plaintext password is in memory.
- **Side-Channel Timing Protection**: When a login email does not exist, the server Derives PBKDF2 against a precomputed decoy hash (`timingDecoyHash`), preventing username enumeration via timing analysis.

#### 4.2 Session Token Lifecycle & Revocation Mechanism

Implemented in `packages/domain/src/auth.ts:94-178` and `apps/api/src/server.ts:860-930, 1159-1210`:
1. **Token Minting**: HMAC-SHA256 signed JWT-like strings (`base64url(payload).signature`). Signing key fails safe: an unconfigured secret generates a random per-process secret rather than using a default key.
2. **Session Identification**: Every token contains a unique `sessionId: crypto.randomBytes(16).toString('base64url')`.
3. **Session Revocation Table (`public.revoked_sessions`)**:
   Created in migration `00046_session_sign_out.sql`. When a user signs out (`POST /api/v1/auth/sign-out`), `{ sessionId, userId, expiresAt }` is persisted to `revoked_sessions`. Opportunistic cleanup purges expired sessions (`DELETE FROM public.revoked_sessions WHERE expires_at <= now()`).
4. **Runtime Check**: `resolveSession` verifies `!revokedSessions.has(session.sessionId)` on every request.
5. **Global Cut-Off (`sessions_valid_after`)**: Added in migration `00045_session_revocation.sql`. Triggered on password change or `POST /api/v1/auth/sign-out-others`: sets `users.sessions_valid_after = now() + 1s`. Any token issued prior to this timestamp is rejected with `401 UNAUTHENTICATED`.

#### 4.3 Row Level Security (RLS) & Fastify Bypass Analysis

- **Migration RLS Coverage**: Across all 49 migrations, `ENABLE ROW LEVEL SECURITY` is set on every table. Hardened in `00047_private_data_rls_hardening.sql` and `00048_notification_preferences_rls_scope.sql`.
- **Vulnerability SEC-04: API Bypasses PostgreSQL RLS**:
  The Fastify API connects to PostgreSQL using `DATABASE_URL` as the table owner/superuser role (`postgres` or `talentsphere`). In PostgreSQL, table owners **bypass RLS by default** (`BYPASSRLS`). The RLS policies in migrations 00001–00049 are **never evaluated** during standard API operation. All tenant isolation relies exclusively on Fastify route guards and domain checks.

#### 4.4 Entity ID Fragmentation (`user.id` vs `profile.id`)
The codebase exhibits architectural identity fragmentation:
- In `00001_core_schema.sql`, `profiles.id` is distinct from `profiles.user_id` (a UUID linked to `users.id`).
- In `job_applications`: `candidate_id` references `public.profiles(id)` (`00001_core_schema.sql:182`).
- In `verified_work_histories`: `candidate_id` references `public.users(id)` (`00043_core_persistence_alignment.sql:80`).
- In `employment_references`: `candidate_id` references `public.users(id)` (`00043_core_persistence_alignment.sql:91`).
API handlers frequently translate `profilesByUserId.get(session.userId)` to obtain the profile UUID, creating subtle risks of ID confusion.

---

### 5. AI Governance Audit

#### 5.1 `AI_PROHIBITED` Server Enforcement

1. **Policy Specification**: Under SSOT Section D and TRD Section 7, proctored coding assessments require strict isolation from generative AI assistants.
2. **Server Enforcement Implementation**:
   - `packages/domain/src/assessment.ts:33-44`:
     ```typescript
     export function assertAIAssistanceAllowed(activeSessions: AssessmentSession[]): void {
       const prohibitedSession = activeSessions.find(
         (s) => s.status === 'in_progress' && s.policyMode === 'AI_PROHIBITED'
       );
       if (prohibitedSession) {
         throw new DomainError(
           'ASSESSMENT_AI_PROHIBITED',
           'AI assistance is strictly prohibited during an active proctored assessment session (SSOT Section D).'
         );
       }
     }
     ```
   - Invoked at API entry points: `/api/v1/ai/assistant/query` and `/api/v1/ai/career-assistant/chat`.
3. **Vulnerability SEC-05: Ephemeral Session Map Reset**:
   Active assessment sessions live in `assessmentSessionsByCandidateId = new Map<string, AssessmentSession[]>()`. If the API restarts during an assessment, the in-memory session map is lost. The candidate can immediately access AI assistance for the remainder of the session without server restriction.

#### 5.2 Quota Metering & Flaws

Implemented in `packages/domain/src/ai-gateway.ts:52-172`:
1. **Tier Limits**: `free` (5,000 tokens/day, 20 req/day), `pro` (100,000 tokens/day, 500 req/day), `enterprise` (1,000,000 tokens/day, 5,000 req/day).
2. **Vulnerability SEC-06: Hardcoded 'free' Tier in API Route**:
   In `apps/api/src/server.ts:6097`:
   ```typescript
   const userTier: AITier = 'free'; // default free tier, strictly metered
   const meter = getOrCreateAIUsageMeter(session.userId, userTier);
   ```
   `userTier` is **hardcoded to `'free'`**. Even if a user has an active Pro subscription in `subscriptionsByUserId`, they are permanently throttled to 20 requests/day and 5,000 tokens/day. Furthermore, `aiUsageMetersByUserAndDate` is an in-process Map; restarting the server resets all daily quota consumption to 0.

#### 5.3 Local Heuristic Execution vs. Remote LLM Calls
- **Execution Mode**: `generateCareerAssistantResponse()` executes entirely locally (`executionMode: 'local_heuristic'`) using keyword pattern matching.
- **Remote LLMs**: Across the entire repository, there are **zero HTTP client calls** to external AI providers.
- **BYO AI Keys**: `apps/api/src/storage/account-store.ts` provides AES-256-GCM encryption/decryption for user-provided API keys, but the decrypted key is never passed to any client or agent runner.

---

### 6. External Integrations & Staging Deployment

#### 6.1 Resend Email Adapter
- Implemented in `apps/worker/src/mail-provider.ts` and `apps/worker/src/index.ts`.
- In `NODE_ENV === 'development'`, emails are logged to console (`DEV OUTBOX`).
- In staging/production, requires `EMAIL_PROVIDER === 'resend'`, `RESEND_API_KEY`, and `EMAIL_FROM`.
- Dispatches HTTP POST to `https://api.resend.com/emails` with `Idempotency-Key: jobId` header (preventing duplicate sends on worker retries).
- Transient failures (408, 429, 5xx) trigger worker retries with exponential backoff; permanent rejections (4xx auth) throw `PermanentJobError` and terminate.
- API endpoints fail closed (`503 SERVICE_UNAVAILABLE`) if transactional mail is unconfigured in staging/production.

#### 6.2 Billing Integration & Webhook Signatures
- **Payment Processor**: No live Stripe API integration exists. When `BILLING_MODE !== 'simulated'`, paid plans are refused with `503 SERVICE_UNAVAILABLE`.
- **Signed Webhook Verification (WIT-016)**:
  `POST /api/v1/billing/webhook` requires header `x-talentsphere-signature: t=<unix_seconds>,v1=<hex_hmac_sha256>`. Fastify uses a raw string content-type parser to guarantee byte-for-byte HMAC verification against `BILLING_WEBHOOK_SECRET`. Replays older than 5 minutes are rejected.

#### 6.3 Oracle Ampere ARM64 Staging Deployment
Defined in `deploy/oracle/compose.yaml`, `Dockerfile`, and `Caddyfile`:
- **Architecture**: Multi-arch ARM64 images (`node:24-bookworm-slim`, `postgres:16-bookworm`, `caddy:2-alpine`).
- **Network Isolation**: Three networks (`public`, `egress`, `internal`). `db` is strictly connected to `internal` with **zero published host ports**; `api` is connected to `internal` and `egress` with **zero published host ports**. Only Caddy binds to `80`/`443`.
- **Defects Identified**:
  - **Image Bloat**: `deploy/oracle/Dockerfile` copies `/app` without `pnpm prune --prod`, producing container images $>1\text{GB}$.
  - **Defect OPS-02 (Caddy Health Route)**: `deploy/oracle/Caddyfile` routes only `/api/*` to Fastify. Requests to `https://SITE_DOMAIN/health` are intercepted by Caddy's static file handler, returning `index.html` 200 OK and masking API failure.

---

### 7. Consolidated Vulnerabilities & Findings Register

| Finding ID | Domain | File & Line | Summary of Finding | Impact | Severity | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **SEC-01** | Cryptography | `apps/api/src/server.ts:12440` | Corporate email verification code uses plain SHA-256 with public UUID salt, not HMAC. | Rainbow-table precomputation of 6-digit codes ($10^6$) in $<50$ms upon DB leak. | **High** | Replace with HMAC-SHA256 keyed by server `TOKEN_SECRET`. |
| **SEC-02** | Cryptography | `packages/domain/src/work-history-graph.ts:510` | Referee voucher tokens have no expiration timestamp (TTL). | Emailed voucher links remain valid indefinitely; ex-employees can voucher years later. | **Medium** | Add `expires_at TIMESTAMPTZ` (30 days TTL) to `employment_references` and validate on submit. |
| **SEC-03** | Durability | `apps/api/src/server.ts` | 217 routes persist state only in ~150 in-process Maps (`x-talentsphere-durability: ephemeral`). | Total data loss on process restart for courses, code challenges, interviews, reviews, bookmarks. | **Critical** | Incrementally migrate high-priority domain tables into `apps/api/src/storage/`. |
| **SEC-04** | Architecture | Database Connection | API bypasses PostgreSQL RLS by connecting as superuser/owner. | Database does not enforce tenant isolation; all security relies solely on application layer code. | **Medium** | Connect API via a restricted role with RLS enabled, or document explicit threat model boundary. |
| **SEC-05** | AI Governance | `apps/api/src/server.ts:4770` | Active assessment session map is in-memory; resets on restart. | Server restart during active exam unblocks AI assistant, bypassing `AI_PROHIBITED`. | **High** | Persist active assessment sessions in PostgreSQL (`00004_challenges_assessment_schema.sql`). |
| **SEC-06** | AI Governance | `apps/api/src/server.ts:6097` | `userTier` hardcoded to `'free'` in `/api/v1/ai/career-assistant/chat`; usage meter is in-memory. | Paid subscribers throttled to free limits; token usage resets on server restart. | **Medium** | Read plan tier from `subscriptionsByUserId`; persist `ai_usage_meters` in PostgreSQL. |
| **OPS-01** | Scalability | `apps/api/src/storage/core-store.ts:803` | Boot hydration reads entire database ($O(N)$ memory/time); single-writer lock blocks scaling. | Scaling ceiling; memory exhaustion and deployment timeouts as data grows. | **High** | Move core reads directly to SQL queries; retire in-memory Maps to unlock multi-replica API scaling. |
| **OPS-02** | Deployment | `deploy/oracle/Caddyfile:7` | Caddy fails to route `/health` to API container. | Synthetic healthchecks return `index.html` 200 OK, masking API crash or outage. | **Low** | Route `/health` and `/api/*` to `api:4000` in `Caddyfile`. |

---

*Report ratified and published by the Teamwork Master Synthesis Engineering Group at commit `83dc7d24`.*

## TalentSphere — Git History, Issues & Pull Requests Reconciliation Report

_Former file: `docs/reports/GIT_RECONCILIATION_REPORT.md`._

> Historical report: findings, counts and executed checks below belong to the recorded revision/session. Current source references and inspection limits are in [the implementation inventory](../system-model/01-inventory-and-coverage.md). No historical pass is a fresh release certification.

**Date:** 2026-10-22  
**Author:** Teamwork Master Synthesis Engineering Group  
**Repository:** `https://github.com/yhsomani/talentsphere-complete.git`  
**Git HEAD:** `83dc7d247efbd3b3c3312bef74ac49978d33e924`  
**Active Branch:** `repository_audit_roadmap`  
**Authoritative Baselines:** Git Commit History (`e93d2514` to `83dc7d24`), GitHub PRs #40–#58, GitHub Issues #44–#50

---

### 1. Executive Summary & Git Commit Lineage to HEAD `83dc7d24`

#### 1.1 Repository State Overview
- **Active HEAD:** `83dc7d247efbd3b3c3312bef74ac49978d33e924` (Subject: `update`, author: Yash Somani, committed 2026-10-20T12:06:37-07:00).
- **Total Repository Commits:** Exactly **302 commits** in git history from initial commit (`e93d2514`, 2026-09-19) to `83dc7d24`.
- **Active Branch Alignment:** Local branches `repository_audit_roadmap`, `main`, and `universal_project_clean_reinstall`, as well as remote tracking branches `origin/main` and `origin/HEAD`, all point identically to commit `83dc7d247efbd3b3c3312bef74ac49978d33e924`.
- **Working Tree Cleanliness:** Clean working tree with no uncommitted staged or unstaged modifications; only teamwork metadata directory `.agents/` is present.

#### 1.2 Comprehensive Branch Topology & Ancestry Analysis
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

#### 1.3 Chronological Merge Lineage from PR #40 to HEAD `83dc7d24`

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

### 2. GitHub Pull Requests Reconciliation (#40 through #58)

#### 2.1 The Issue/PR Numbering Sequence on GitHub
On GitHub, Pull Requests and Issues share a single auto-incrementing integer sequence. Forensically:
- PR #40 through PR #43 were opened and merged in succession.
- When PR #43 merged, numbers **#44 through #50** were allocated to **GitHub Issues #44 through #50** to track production-blocking owner and operational gates.
- Consequently, subsequent pull requests were assigned numbers **#51 through #58**. No pull requests numbered #44–#50 ever existed; they are the issue tracking entities reconciled in Section 3.

#### 2.2 Exhaustive Reconciliation of PRs #40–#58

##### PR #40: Core Career Loop Durability & Real User Journeys
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

##### PR #41: Five-Lock Smoke Hardening & RLS Policies
- **Merge Commit:** `8bdad381` (2026-10-18)
- **Source Branch:** `yhsomani/security/five-lock-smoke-hardening-20261018`
- **Intended Delivery:**
  1. PostgreSQL Row Level Security (RLS) policies for direct messaging threads, messages, and notification preferences.
  2. Static regression checks and SQL migration policy assertions in `tests/security/private-data-rls.test.ts`.
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Replaced loose default RLS policies with profile-owned tenant isolation.

##### PR #42: RLS Runtime Validation & Web Bundle Sentinel CI Guard
- **Merge Commit:** `5c130a7e` (2026-10-18)
- **Source Branch:** `yhsomani/security/rls-runtime-validation-ci-fix-20261018`
- **Intended Delivery:**
  1. Fix correlated RLS column shadowing in outer preference owner queries (`tests/security/private-data-rls.test.ts`).
  2. Runtime two-account RLS validation on real PostgreSQL (`tests/pg/private-data-rls.test.ts`).
  3. SQL apostrophe escape safety test (`tests/security/private-data-rls.test.ts`).
  4. CI sentinel script scanning Vite production web bundles to guarantee server secrets (e.g. `TOKEN_SECRET`, `DATABASE_URL`) are never compiled into client JavaScript.
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Closed correlated subquery security vulnerability in migration RLS policies.

##### PR #43: Production Safety Gates & Fail-Closed Enforcement
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

##### PR #51: Privacy, BYO AI Encryption & Resend Email Hardening
- **Merge Commit:** `4890ef21` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/privacy-mail-hardening-20261018`
- **Intended Delivery:**
  1. AES-256-GCM encryption at rest for Bring-Your-Own (BYO) AI provider API keys using separate `BYO_AI_KEY_ENCRYPTION_KEY` (64 hex characters). Plaintext downgrade strictly refused.
  2. Opt-in Resend transactional email adapter (`apps/worker/src/email-adapter.ts`) with idempotent retries.
  3. Durable user settings and data export metadata backed by PostgreSQL tables `user_settings` and `data_export_requests`.
  4. Comprehensive PostgreSQL persistence tests (`tests/pg/core-persistence.test.ts`).
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Merged cleanly; established secure key management for external AI credentials.

##### PR #52: Release Preflight Migration Drift Gate
- **Merge Commit:** `616f942d` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/release-preflight-20261018`
- **Intended Delivery:**
  1. Read-only release preflight tool (`scripts/release-preflight.mjs`) to verify database migration alignment.
  2. Strict sequential numbering regex matching for `supabase/migrations/*.sql` to prevent migration drift or skipped versions.
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Merged cleanly.

##### PR #53: Durable Saved Searches with Owner-Scoped SQL CRUD
- **Merge Commit:** `eb69a2f8` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/durable-saved-searches-20261018`
- **Intended Delivery:**
  1. Migration of candidate saved searches from volatile in-memory Maps to PostgreSQL table `saved_searches`.
  2. Owner-scoped SQL CRUD operations preventing horizontal IDOR.
  3. Real PostgreSQL restart survival and ownership isolation tests (`tests/pg/saved-searches.test.ts`).
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Superseded ephemeral in-memory storage for saved searches.

##### PR #54: Durable Job Bookmarks with Job Visibility Guards
- **Merge Commit:** `1776f948` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/durable-job-bookmarks-20261018`
- **Intended Delivery:**
  1. Migration of job bookmarks from volatile in-memory Maps to PostgreSQL table `saved_jobs`.
  2. Strict job visibility enforcement: saving or listing bookmarks refuses unpublished/draft jobs, preventing unpublished job disclosure.
  3. Account erasure integration: bookmark records purged on account deletion.
  4. Real PostgreSQL race, ownership, restart, and erasure tests (`tests/pg/saved-jobs.test.ts`).
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Superseded ephemeral in-memory storage for job bookmarks.

##### PR #55: Oracle Ampere ARM64 Staging Deployment Foundation
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

##### PR #56: Staging Backup & Isolated Restore Verification
- **Merge Commit:** `252b03f9` (2026-10-18)
- **Source Branch:** `yhsomani/chatgpt/oracle-staging-recovery`
- **Intended Delivery:**
  1. Operational backup and isolated restore verification script (`deploy/oracle/verify-backup-restore.sh`).
  2. Proven end-to-end restore verification into an ephemeral database container, verifying schema, table row counts, and background job queues.
  3. Security hardening: `.gitignore` updated to guarantee PostgreSQL `.dump` files are never committed to version control.
- **Incorporation into HEAD `83dc7d24`:** **INCORPORATED & ACTIVE.**
- **Conflicts / Superseded:** Merged cleanly.

##### PR #57: Comprehensive October 2026 Audit Fixes (Issues #44–#50)
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

##### PR #58: Review Round 2 Regressions & BR-167 Reputation Visibility
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

### 3. GitHub Issues Reconciliation (#44 through #50)

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

#### 3.1 Issue #44: Transactional Email Delivery, Provider Integration & Fail-Closed Guard
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

#### 3.2 Issue #45: Reputation Engine Visibility, Recruiter Scoping & Candidate Consent (BR-167)
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

#### 3.3 Issue #46: Technical Interview Code Execution Sandbox Security & Cross-Tenant IDOR
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

#### 3.4 Issue #47: Privacy Policy, Terms, Contact Verification & False Compliance Claims
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

#### 3.5 Issue #48: User Data Erasure (GDPR Art. 17 / DPDP) Semantics & Scheduled Deletion Lifecycle
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

#### 3.6 Issue #49: PostgreSQL Durability (ADR-015) vs ~220 Ephemeral Routes & Single-Writer Constraints
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

#### 3.7 Issue #50: Billing & Monetization Integrity / Payment Gateway Integration
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

### 4. Git & GitHub Tracking Reconciliation Matrix

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

## TalentSphere — Release Scope, Backlog & Sprint Roadmap (Stages A–F)

_Former file: `docs/reports/RELEASE_SCOPE_AND_BACKLOG.md`._

> Historical report: findings, counts and executed checks below belong to the recorded revision/session. Current source references and inspection limits are in [the implementation inventory](../system-model/01-inventory-and-coverage.md). No historical pass is a fresh release certification.

**Date:** 2026-10-22  
**Author:** Teamwork Master Synthesis Engineering Group  
**Repository:** `https://github.com/yhsomani/talentsphere-complete.git`  
**Git HEAD:** `83dc7d247efbd3b3c3312bef74ac49978d33e924`  
**Active Branch:** `repository_audit_roadmap`  
**Authoritative Baselines:** `SSOT.md` v6.0, `FEATURE_REGISTRY.md` v6.0, `ADR-015`, `PRD.md`, `TRD.md`

---

### 1. Executive Overview & Release Strategy

The TalentSphere product portfolio spans 173 canonical features, but architectural reality dictates a strict **two-tier boundary**:
1. **Tier 1: The Core Career Loop (In Scope for GA Launch)**:
   - Fully implemented, backed by PostgreSQL 16 transactional persistence (ADR-015), and validated by Playwright browser E2E tests (`core-loop.spec.ts`).
   - Solves the fundamental market problem: **cryptographically attested candidate work history and hiring without resume fraud**.
2. **Tier 2: The Extended Ecosystem (Progressive Staged Rollout)**:
   - Learning Management (LMS), coding arena challenges, video interview rooms, multi-context reputation, and salary intelligence.
   - These features currently operate in-process (`x-talentsphere-durability: ephemeral`) and must be progressively migrated to durable PostgreSQL before broad commercial release.

---

### 2. Release Scope Definition: The Core Career Loop

#### 2.1 The End-to-End User Journey
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

#### 2.2 Feature Scope Boundary

| Category | In-Scope Canonical Features (GA Core Loop) | Out-of-Scope / Deferred to Future Stages |
| :--- | :--- | :--- |
| **Identity & Access** | **F-01** (Auth & Session), **F-03** (Role-Adaptive Dashboard), **F-12** (Profile Management), **F-15** (Settings & Privacy), **F-60** (Profile Visibility RLS), **F-65** (Decoupled Identity), **F-80** (Profile Enhancements) | F-81 (Govt ID Verification), F-163 (W3C Wallet) |
| **Taxonomy & Evidence**| **F-84** (Skills Taxonomy DAG), **F-96** (Skill Evidence & Digital Credentials), **F-173** (Company-to-Skills Mapping) | F-110 (Peer Endorsements), F-123 (Skill Freshness Engine) |
| **Proof of Control** | **F-58** (Written Recommendations), **F-94** (Verified Work History & Corporate Email Attestation), **F-162** (Verified Work History Graph) | F-89 (Activity Contributions), F-146 (Contribution Tracking) |
| **Jobs & Hiring** | **F-04** (Job Marketplace), **F-05** (Post Job Studio), **F-06** (ATS Pipeline), **F-25** (Job Detail View), **F-32** (Saved Searches & Alerts), **F-56** (Org Management), **F-102** (Hiring Manager Portal), **F-117** (Mobile Apply) | F-36 (Draft Autosave), F-37 (Job Templates), F-104 (Custom Assessment Builder), F-142 (Referral Requests) |
| **Communication** | **F-10** (Direct Messaging), **F-14** (Notification Center), **F-29** (Notification Digests) | F-33 (Video Rooms), F-53 (Social Feed), F-55 (Communities) |
| **Platform & UI** | **F-02** (Landing Page Shell), **F-21** (Error Recovery & Session Notice) | F-07 (LMS), F-08 (Challenges Arena), F-16 (Paid Subscriptions), F-17 (Admin UI Console) |

---

### 3. Actionable, Deduplicated Backlog with Stable IDs

Every backlog item carries a stable identifier (`BL-xxx`), urgency rating (`P0` Blocker to `P3` Medium), structured Given/When/Then acceptance criteria, and explicit verifying tests.

#### 3.1 P0: Launch Blockers (Mandatory Pre-Launch Operational Gates)

##### BL-001: Corporate Email Challenge HMAC Key Hardening (SEC-01)
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

##### BL-002: Referee Voucher Token TTL Expiration Enforcement (SEC-02)
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

##### BL-003: Transactional Email Staging DNS & Resend Configuration (Issue #44)
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

##### BL-004: Legal Terms & Privacy Policy Founder Review (Issue #47)
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

##### BL-005: Caddy Reverse Proxy Root Health Route Proxying (OPS-02)
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

#### 3.2 P1: Critical Quality & Release Readiness

##### BL-006: User Data Erasure 30-Day Scheduled Worker Automation (Issue #48)
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

##### BL-007: Fix Vitest Security Script Argument in `package.json`
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

##### BL-008: Add Committed Cache & Agent Folders to `.prettierignore`
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

##### BL-009: Persist Active Assessment Sessions to PostgreSQL (SEC-05)
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

##### BL-010: Fix AI Gateway Hardcoded 'free' Tier & Usage Metering (SEC-06)
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

#### 3.3 P2: Staged Capability Migrations & Enhancements

##### BL-011: Migrate Challenges & Arena to Durable Storage (F-08)
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

##### BL-012: Wire Assessments Page UI to Backend API (F-08)
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

##### BL-013: Migrate LMS Courses & Module Progression to PostgreSQL (F-07)
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

##### BL-014: Candidate Explicit Reputation Visibility Consent Setting (Issue #45)
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

##### BL-015: Connect Application Draft Autosave to Database (F-36)
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

#### 3.4 P3: Monetization, Sandboxing & Ecosystem Expansion

##### BL-016: Stripe Checkout & Subscription Lifecycle Integration (Issue #50, F-16)
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

##### BL-017: Secure Containerized Code Execution Sandbox (Issue #46, F-88)
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

##### BL-018: Dockerfile Multi-Stage Image Pruning (OPS-01)
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

### 4. Sprint Roadmap: Dependency-Aware Stages A through F

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

#### Stage A: Production Hardening & Operational Gates
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

#### Stage B: Core Career Loop GA Launch
- **Objective:** Deploy the verified Core Career Loop to production under a free early-access launch tier.
- **Deliverables:**
  - BL-006 (Automated 30-day erasure execution cron)
  - BL-009 (Postgres persistence for active assessment sessions)
  - BL-010 (AI gateway Pro tier quota resolution)
  - Production deployment on single-writer PostgreSQL architecture with automated backup verification (`deploy/oracle/verify-backup-restore.sh`).
- **Exit Criteria:** End-to-end user journeys pass in production: Candidate sign-up $\to$ Corporate email attestation $\to$ Referee voucher completion $\to$ Job apply $\to$ Recruiter pipeline move.

#### Stage C: Progressive Durability Migration (PostgreSQL Long-Tail)
- **Objective:** Eliminate ephemeral in-process `Map` state loss across high-value capability domains.
- **Deliverables:**
  - BL-011 & BL-012 (Challenges Arena & Assessments persisted to PostgreSQL)
  - BL-013 (LMS Courses & module completion persisted to PostgreSQL)
  - BL-015 (Application draft autosave persisted to PostgreSQL)
  - Portfolio Showcase (F-26) and Admin Console (F-17) persisted to PostgreSQL.
- **Exit Criteria:** Ephemeral route count reduced from 217 to $<100$; server restart preserves all challenge submissions, course progress, and drafts.

#### Stage D: Commercial Monetization & Enterprise Subscriptions
- **Objective:** Enable paid plan monetization and enterprise hiring licenses.
- **Deliverables:**
  - BL-016 (Live Stripe Checkout and billing webhook processing)
  - Enterprise seat licensing and invoice generation
  - Webhook deduplication key persistence in PostgreSQL.
- **Exit Criteria:** Live credit card test transaction succeeds in Stripe test mode, webhook activates Pro subscription, and canceling plan updates entitlements.

#### Stage E: Sandboxed Code Execution & Advanced Assessment
- **Objective:** Safely evaluate candidate programming submissions without security risk to the host.
- **Deliverables:**
  - BL-017 (Containerized gVisor/Docker execution sandbox)
  - Multi-language execution runner (Node.js, Python, TypeScript)
  - Technical Interview real-time WebRTC room wiring.
- **Exit Criteria:** Unprivileged execution of untrusted code passes security isolation audit; fork bombs and unauthorized network calls are strictly blocked.

#### Stage F: Ecosystem, Reputation & Career Graph Expansion
- **Objective:** Activate advanced community, reputation, and career intelligence features.
- **Deliverables:**
  - BL-014 (Candidate reputation opt-in consent UI)
  - Career Trajectory graph visualizations in React web app
  - Alumni networks, warm introduction pathfinding, and peer credibility UI views.
- **Exit Criteria:** Full 173-feature capability matrix achieved with end-to-end database persistence and accessible UI views.

---

*Report ratified and published by the Teamwork Master Synthesis Engineering Group at commit `83dc7d24`.*

## TalentSphere — Repository Re-Audit & GitHub Issue Reconciliation

_Former file: `docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md`._

> Historical report: findings, counts and executed checks below belong to the recorded revision/session. Current source references and inspection limits are in [the implementation inventory](../system-model/01-inventory-and-coverage.md). No historical pass is a fresh release certification.

**As-of:** 2026-10-23 UTC • **Repository:** [yhsomani/talentsphere-complete](https://github.com/yhsomani/talentsphere-complete) • **Reviewed upstream `main`:** [`0f40b6c951bc305f0bf8faf13d4a0897dd80c0e2`](https://github.com/yhsomani/talentsphere-complete/commit/0f40b6c951bc305f0bf8faf13d4a0897dd80c0e2) • **Report branch:** `chatgpt/second-pass-audit-20261023`.

> **Scope/verification warning.** This is a second-pass, remote/read-only repository and live integration audit with one isolated E2E regression-test improvement. It is **not** an independent line-by-line review of 859 files, execution of the repository locally, full 173-feature acceptance, a production penetration test, or a hosted/live billing signoff. The E2E change is **proposed, unverified until PR CI runs**. Every unexecuted step remains explicitly unverified. The feature appendix is the **historical 2026-10-21 registry assessment**, not newly certified statuses for all 173 features.

### A. Executive summary / verdict

**Verdict: NOT READY for production or a paid public launch.** The most recent GitHub Actions run for this precise `main` commit [#40017740619](https://github.com/yhsomani/talentsphere-complete/actions/runs/40017740619) **failed 1 of 236 Playwright cases** (`tests/e2e/account-security.spec.ts:127`); 235 passed. Preceding commits [`deaea7665`](https://github.com/yhsomani/talentsphere-complete/actions/runs/40016584724) and [`4d3cf5d4`](https://github.com/yhsomani/talentsphere-complete/actions/runs/40014603225) had successful CI. Latest job passed all prior lint, typecheck, memory-mode unit/integration/security tests, local migration checks, real-Postgres tests, build and browser secret scan.

**Latest CI measured evidence:** **1,231 passing Vitest tests (117 files)**; **50 passing PostgreSQL tests (11 files)**; **235/236 Playwright passing**; clean local PostgreSQL migrations **00001–00052** succeeded. These were executed by GitHub Actions, **not re-executed by this auditor locally**. The failing browser case saw `page.waitForURL: net::ERR_ABORTED; maybe frame was detached?` while checking the revoked other-device session. The test file was changed in this review branch to wait for the same final URL using `expect(page).toHaveURL` without requiring the transient navigation load event; the subsequent exact revoked-session-message assertion is **unchanged**. Classification: **timing/race hypothesis, pending CI confirmation**, not proved application fix.

**Integration reality:**
- **Stripe implementation now exists** (PR [#71](https://github.com/yhsomani/talentsphere-complete/pull/71)): SDK gateway, signed webhook, Postgres records, idempotent provider-event storage, cancellation and domain tests. This supersedes `docs/reports/PAYMENT_AUDIT_2026-10-23.md` §Scope's earlier statement that Stripe did not exist.
- **Stripe connected-account live read (read only):** account `talentsphere-production` accessible **in test mode only**; **1 active USD 2.99/month recurring price, 2 active test subscriptions, 0 configured webhook endpoints** (GET Prices, Subscriptions, Webhook Endpoints). This is **not a production payment test**. Nothing was charged, refunded, canceled, created or edited.
- **Supabase connected-project live read (read only):** `talentsphere-production`, Mumbai `ap-south-1`, project `qidckctwrkxyiwworchd`, healthy PostgreSQL 17; **0 public application tables, 1 recorded keepalive migration, 0 Edge Functions**; security/performance advisors returned no notices. Empty application schema means those advisors cannot certify TalentSphere's RLS, grants or authorization. The repository's 52 local migrations are **not deployed to that project** and use `auth.uid()/auth.users` constructs incompatible with the app's self-issued Fastify HMAC sessions without an explicit adapter and review.

**GitHub tracker:** **7 issues reviewed, all 7 remain open** ([#44](https://github.com/yhsomani/talentsphere-complete/issues/44)–[#50](https://github.com/yhsomani/talentsphere-complete/issues/50)); none meets full acceptance gates. **0 issue closures** justified. Recent merged PRs #61–#71 are implementation evidence, not hosted deployment proof. No open PR was present in the baseline GitHub query.

#### Status accounting

| Review set | Fixed and verified | Implemented, not fully verified | Partially fixed / open | Regressed | Blocked | Not reproducible |
|---|---:|---:|---:|---:|---:|---:|
| Seven *full* GitHub issue acceptance gates #44–#50 | 0 | 0 | 3 (#48, #49, #50) | 0 | 4 (#44–#47; external proof/approval) | 0 |

The categories describe **whole issue acceptance**, not individual merged code changes. #49 remains partly implemented while product decisions block full completion; #48 partial and hosted rollout blocked by #46; #50 code progressed but price/production decision and live verification remain open. The CI navigation test failure is separately tracked below and has not yet been classified as a confirmed application regression.

### B. Scope, sources, repository inventory and limitations

| Area | Inspected evidence | Coverage / limitation |
|---|---|---|
| Git/GitHub | Remote branch `main` SHA, last 12 commits, merged PR metadata #40–#71, complete open-issue snapshot and latest comments, Actions latest run and full failed job log | GitHub remote state verified; **local working-tree `git status` unavailable** because repository clone/network access is unavailable in execution container; isolated GitHub branch created from exact SHA |
| Repository structure | Git tree API: **978 tree entries, 859 tracked files**, 52 SQL migrations, React/Vite web, Fastify API, worker, shared packages, tests, workflows, Oracle deployment files | Tree/path inventory comprehensive; detailed source review **targeted** to billing, migrations, security, E2E and high-risk modules; no claim of semantic review of all 859 files |
| Governing docs | `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md`, root `ARCHITECTURE.md` and `SSOT.md` referenced, `FEATURE_STATUS_2026-10-21.md`, `FEATURE_REGISTRY.md`, `FEATURE_PLAN_2026-10-21.md`, `PAYMENT_AUDIT_2026-10-23.md`, hosted-Supabase audit/gate, older master audit/release plan, issue descriptions | Dated snapshots conflict with Oct 23 state. `SSOT.md` is *intent*, code and CI prove *presence*; no line-by-line revalidation of massive SSOT |
| Stripe | `apps/api/src/stripe-gateway.ts`, `billing-stripe.ts`, `storage/billing-store.ts`, `server.ts` billing routes, `packages/domain/src/stripe-billing.ts`, `packages/config/src/env.ts`, migration 00052, unit/integration/PG tests, connected account **test mode read-only** | No live-mode Stripe account accessible; no remote delivery rehearsal; zero webhook endpoints in connected test account |
| Supabase | Connected project list, public table inventory, migration ledger, advisors and Edge Functions; historical/hosted migration gate docs; repository SQL history and CI guard | No application tables on hosted target; **no schema mutation or unsafe migration** performed; hosted owner/tenant RLS tests cannot run on absent tables |
| Auth/data | HMAC tokens (not Supabase Auth), session-revocation E2E, PostgreSQL billing idempotency and RLS assertions, worker claims, erasure store, project RLS tests | Two-user data-isolation tests passed in **CI local Postgres**, not hosted Supabase or running production |
| Operations | CI pipeline, `docs/quality/OPERATIONS.md`, `deploy/oracle` references, issue release gates | No deployed TLS/worker/backup/recovery/rollback drill performed; no production credentials used |

**Build-file safety:** `AGENTS.md` forbids AI edits to `package.json`, lockfiles, `tsconfig*`, Playwright/Vite/Vitest config, `.github/**`, `deploy/**`, generated builds and assets without **explicit build-file authorization**. This audit makes **no protected-file changes**. Creating this report and changing an E2E source test is permitted. The container could not resolve `github.com` via Git; GitHub integration supplied remote evidence; no local pnpm commands were run.

**Project commands (observed in package manifest, NOT run locally):** `pnpm lint`; `pnpm typecheck`; `pnpm test`; `node --test scripts/tests/migration-integrity.test.mjs`; `node scripts/audit-hosted-supabase-migrations.mjs` (expected incompatible-history exit 1); `pnpm db:migrate` (**only disposable local PostgreSQL; NOT hosted Supabase**); `node scripts/release-preflight.mjs --mode=schema`; `pnpm test:pg` (isolated TEST_DATABASE_URL); `pnpm build`; `node scripts/check-client-secrets.mjs`; `pnpm test:e2e`. These **were** run in the inspected GitHub workflow as applicable; do not run emitting builds in a protected local checkout without permission.

### C. Previous fixes independently cross-checked

| Change / reference | Claimed remediation | Current evidence | Status / missing proof |
|---|---|---|---|
| [PR #41](https://github.com/yhsomani/talentsphere-complete/pull/41), [#42](https://github.com/yhsomani/talentsphere-complete/pull/42) | Private-data RLS/ownership and security regression tests | `tests/pg/private-data-rls.test.ts` and security suite, Postgres tests green in CI | **Locally verified only**; hosted target has no tables; not production RLS verified |
| [PR #43](https://github.com/yhsomani/talentsphere-complete/pull/43), [#58](https://github.com/yhsomani/talentsphere-complete/pull/58) | Fail-closed assessment and reputation visibility, PBKDF2 floor | Domain/security paths and CI green earlier in run; no approved executor | **Partial** #49; do not advertise real scoring |
| [PR #51](https://github.com/yhsomani/talentsphere-complete/pull/51), [#53](https://github.com/yhsomani/talentsphere-complete/pull/53), [#54](https://github.com/yhsomani/talentsphere-complete/pull/54) | Durable privacy metadata, saved searches and saved bookmarks | PostgreSQL-backed store source, CI memory/PG tests; no hosted app schema | **Partial** #45/#48, deployment unverified |
| [PR #55](https://github.com/yhsomani/talentsphere-complete/pull/55), [#56](https://github.com/yhsomani/talentsphere-complete/pull/56) | Oracle deployment, backup/restore artifacts | `deploy/oracle` manifests/scripts exist | **Implemented, not operationally verified**; #47 open |
| [PR #61–#66](https://github.com/yhsomani/talentsphere-complete/pulls?q=is%3Apr+is%3Amerged) | Hosted-target guard, preflight, migration incompatibility scanners, CI gate | `.github/workflows/ci.yml` explicitly expects hosted dependency scanner to detect legacy Auth dependencies; local 52 migrations green | **Fail-closed compatibility warning works in CI**, not a hosted-compatible schema; #46 open |
| [PR #67–#69](https://github.com/yhsomani/talentsphere-complete/pulls?q=is%3Apr+is%3Amerged) | Refuse unpaid entitlements and remedy lint block | Later CI succeeded on `deaea7665` and `4d3cf5d4` | **CI verification** of merged guard/formatting; monetization still blocked |
| [PR #70](https://github.com/yhsomani/talentsphere-complete/pull/70) | Simulated billing lifecycle, idempotency and erasure | Unit/integration tests in latest run, domain paths | **Tested code**, but simulated billing must remain disabled outside dev/test |
| [PR #71](https://github.com/yhsomani/talentsphere-complete/pull/71) | Stripe SDK, signed webhook, durable PG billing, cancellation | `apps/api/src/{billing-stripe,stripe-gateway}.ts`, `billing-store.ts`, migration 00052, `tests/{integration,pg,unit}/*stripe* / billing*`; 50 PG cases pass in CI | **Implemented; integration & local PG verified**, but zero configured provider webhook endpoints and zero hosted app tables. Paid prod launch **not verified** |
| [Commit `fca16f5`](https://github.com/yhsomani/talentsphere-complete/commit/fca16f5117c8) | Two prior Playwright HTTP 5xx assertion failures | Latest run includes passing `mutation-feedback.spec.ts` cases; safe generic server message preserved | **Verified for current CI**, previous red E2E mismatch resolved |
| Latest `main` [`0f40b6c`](https://github.com/yhsomani/talentsphere-complete/commit/0f40b6c951bc305f0bf8faf13d4a0897dd80c0e2) | Readability refactor | Current run red only at session revocation E2E navigation wait | **Causality unproved**; isolated test improvement awaiting CI |

**Important:** `PAYMENT_AUDIT_2026-10-23.md` was written *before* PR #71 and explicitly reports Stripe absence, in-memory billing and no GitHub access. Those statements are **superseded by later code and connected-service evidence**, not evidence of regressions. Similarly `docs/reports/AUDIT_MASTER_REPORT.md`, `GIT_RECONCILIATION_REPORT.md`, `RELEASE_SCOPE_AND_BACKLOG.md` claim older SHAs, 49/51 migrations and historical counts; they must retain historical labels, not be treated as Oct 23 runtime state.

### D. Complete open GitHub issue inventory

| Issue | Priority | Original root gap and affected components | Current assessment / required action | Whole-issue status |
|---|---|---|---|---|
| [#44 Transactional email](https://github.com/yhsomani/talentsphere-complete/issues/44) | P0 | No proven delivery to external mailboxes; `apps/worker/src/mail-provider.ts`, token dispatch, delivery jobs | Opt-in Resend code exists, but sender ownership/DNS, live code + referee mail, retry/alert results absent. Test delivery without leaking raw tokens. | **BLOCKED** provider/live proof |
| [#45 Privacy/legal/erasure](https://github.com/yhsomani/talentsphere-complete/issues/45) | P0 | Unapproved terms, monitored contacts, due-execution and backup retention; erasure lifecycle | Approve policy, instrument scheduled execution and recovery, prove deletion across stores and Stripe when applicable, plus counsel signoff. | **BLOCKED** owner/legal and live proof |
| [#46 ADR-015/hosted migration](https://github.com/yhsomani/talentsphere-complete/issues/46) | P0 | Auth model/SQL conflict, populated schema, permission/RLS proof | CI local 52 migrations pass; **hosted project has 0 app tables**. Never apply historic scripts as-is. Create approved compatibility adaptation, disposable trial, grants/RLS/rollback test, then apply. | **BLOCKED** schema/approval |
| [#47 Deployment, restore, single writer](https://github.com/yhsomani/talentsphere-complete/issues/47) | P0 | No real proof of HTTPS, worker health alerts, backups, single API writer and recovery | Existing Oracle code not operational evidence; hosted schema prereq #46; finish staging boot/restore/rollback/load/monitoring and obtain signoff. | **BLOCKED** infrastructure proof |
| [#48 Durable beta modules](https://github.com/yhsomani/talentsphere-complete/issues/48) | P1 | Ephemeral drafts, networking, alerts and long-tail APIs | Saves/bookmarks/settings **and now billing in PG mode** are durable; drafts/network/alerts still need target-scope persistence and honest UI. Hosted realization depends #46. | **PARTIAL** |
| [#49 Interview/trust/token storage](https://github.com/yhsomani/talentsphere-complete/issues/49) | P1 | Simulated scoring, trust policy, browser token architecture | Fails closed in deployment; still no approved sandbox with determinism/resource limits, scoring provenance/badge ratification, cookie/CSRF decision. | **PARTIAL** / decisions blocked |
| [#50 Commercial policy/payment](https://github.com/yhsomani/talentsphere-complete/issues/50) | P1 | Paid plans previously impossible; entitlement trust and billing records | PR #71 implemented Stripe backend and 00052; **test Stripe has 0 webhook endpoints**, UI `CheckoutPage.tsx` still markets free-only, hosted target empty, no live/isolated end-to-end event reconciliation or pricing approval. | **PARTIAL** |

**Disposition:** Keep all seven **OPEN**. No issue may be auto-closed because unit/CI green does not meet its operational acceptance. Earlier issue comments from Oct 23 already note Supabase's empty hosted schema; post new comments only for **material changes**, particularly #50's Stripe implementation, #48's corrected durable billing and the updated 52-migration CI baseline.

### E. Supabase — architecture, live database and security

1. **Observed:** project `qidckctwrkxyiwworchd` ACTIVE_HEALTHY, `ap-south-1`; `list_tables(public)` **[]**, migration ledger exactly one `add_readonly_keepalive_ping`, `list_edge_functions` **[]**. Security/performance advisor output empty, but that **does not imply healthy application access control** when application tables are absent.
2. **Repository:** `supabase/migrations/00001_...` to `00052_billing_persistence_and_stripe.sql`. CI's custom local runner can apply all 52 to **disposable PostgreSQL 16** and rerun idempotently. This is **not evidence** they can run unmodified on **hosted Supabase PostgreSQL 17**.
3. **Identity incompatibility:** Fastify signs HMAC sessions; it does not use Supabase Auth. Historical SQL references `auth.users`, `auth.uid()`, `auth.jwt()` (documented by `HOSTED_SUPABASE_MIGRATION_GATE.md`). A real browser token is not a platform Auth identity. **Do not** insert fake `auth.users`, replace `auth.uid` globally or grant blanket access.
4. **RLS/grants:** Local PG tests for message/notification owner isolation and the 00052 `stripe_customers` table's RLS/grants passed. The new table declares RLS and `REVOKE ALL ... FROM PUBLIC`. Hosted grant, policy, tenant-crossing and application-user role behavior **cannot be verified** absent deployed schema. SQL local superuser execution must not be mistaken for Data API protection.
5. **Migrations:** `docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md` explicitly says **do not run `pnpm db:migrate` on hosted target**. Perform reviewable identity adaptation and populated migration rehearsal on separate throwaway environment; test drift, abort/rollback, grants, RLS and concurrent writes first.
6. **No destructive action:** No SQL, migrations, functions, policies or keys changed on the connected project. Local schema remains safe to inspect/test only, production target not initialized for TalentSphere.

### F. Stripe & subscription audit

| Capability | Code and measured evidence | Result / remaining gate |
|---|---|---|
| Server-side catalog & access | `buildPriceCatalog`, `CreateCheckoutSessionInputSchema`, `registerStripeBilling` enforce server-side prices and plan role; routes require session | Unit/integration CI passes; commercial price and entitlement policy must be approved (#50) |
| Checkout | `/api/v1/billing/checkout`, SDK `stripe.checkout.sessions.create`, idempotency including user/plan/cycle, client reference | Network is **mocked** in repo tests; connected Stripe has only one test recurring price; browser `CheckoutPage.tsx` still says no processor exists, and does not expose purchase UI |
| Source-of-truth & trust | `processStripeEvent`, `reconcileStripeSubscription`; paid access from signed known-price, eligible subscription; unknown prices grant free entitlements | Appropriate fail-closed design in tests; verify all user-facing gates really read `entitlements` and never `subscription.planTier` alone |
| Webhooks | `stripe.webhooks.constructEvent(rawBody, signature, whsec)`, normalized checkout/subscription/invoice events | Genuine local signature verification with **synthetic payloads**; connected test Stripe has **zero** configured endpoints, so remote delivery unproven |
| Idempotency/ordering | PG `billing_events(provider,provider_event_id)` unique and transactional write, timestamp freshness guard, concurrency tests | Tests green against local PG, but event IDs tied to seconds; test equal-second conflicting event order and asynchronous external side-effects; no remote retry drill |
| Subscriptions/cancel | Gateway calls Stripe, domain reconciles, cancels scheduled/immediate; PG persists | Integration/PG coverage exists; live cancel, portal behavior, downgrade at renewal, subscription replace and retries not verified |
| Invoices | `invoice.paid` and `invoice.payment_failed` events, Stripe invoice ID uniqueness, stored paid fields | PG tests; live provider invoice mapping/credit notes/refunds not independently verified |
| Refunds/disputes | `normalizeEvent` defaults `charge.refunded` to **ignored** (integration test explicitly does this) | **P1/P2 product decision & coverage gap:** clarify whether refunds/chargebacks need invoice/entitlement changes, then implement and test. Do not assume refund means auto-cancel without policy |
| Stripe erase | `eraseBillingData` calls `deleteCustomer` when Stripe mode is enabled, then local purge | **P1 risk:** if existing Stripe customer but server boots with billing disabled, code logs a warning and still purges local mapping; external customer may remain, requiring reconciliation/manual action. Add explicit operator workflow and failure test. |
| Live connected Stripe | Test-mode account: **1 price, 2 active test subscriptions, 0 endpoints** | Test data existence is **not** an app-integrated success signal; cannot claim webhook delivered, paid entitlements granted or live financial processing |

**Additional risk needing code-level verification:** status/order events use Stripe's Unix-second `event.created`; guard uses less-than and allows same-second events. Under particular arrival order, two status changes with equal timestamps could overwrite an outcome. This is a **potential ordering gap**, not a reproduced financial defect; design adversarial order tests before editing policy.

**Backend/UI discrepancy:** `apps/web/src/pages/CheckoutPage.tsx:8–14` comment and all visible plans still describe a free-only service and say no processor exists, while backend supports `BILLING_MODE=stripe`. A deliberate free-only launch can retain the non-purchasable UI, but update that misleading code comment and make operator/billing mode truthful; do not enable paid CTAs without approved price policy and full staging tests.

### G. New / outstanding defects and risk register

| ID | Priority | Finding & evidence | Classification | Remediation / proof |
|---|---|---|---|---|
| R2-01 | **P0 CI gate** | Latest `main` Actions 40017740619 failed `account-security.spec.ts:127` with aborted navigation; previous two runs green | Confirmed **E2E test failure**, root cause not yet proven | Replace transient load wait with eventual URL assertion without weakening session-revocation banner; run PR CI, investigate app/network traces if still failing |
| R2-02 | **P0 release** | Hosted Supabase public tables 0, repo migrations 52; custom HMAC != hosted Auth | Confirmed production deployment blocker | #46 hosted schema/identity and two-user hosted RLS/restore acceptance |
| R2-03 | **P1 paid release** | Stripe test account webhook endpoints 0 despite signed backend handler | Confirmed delivery-configuration gap | Configure webhook in approved test/staging environment; verify signed events/retry, replay, idempotent persistence, entitlements |
| R2-04 | **P1 UX/contracts** | `CheckoutPage.tsx` still says no processor despite merged Stripe backend | Confirmed **documentation/UI integration mismatch**; purchasability may intentionally remain gated | Decide free-only vs approved paid staging; conditional truthful CTA and decline states, real browser E2E |
| R2-05 | **P1 privacy** | `server.ts` erasure local purge even when Stripe mode disabled and external customer mapping exists | Confirmed branch of code, **external impact untested** | Fail closed or queue operator reconciliation depending policy, test mode-off delete and recoverability |
| R2-06 | **P2 payment policy** | `normalizeEvent` ignores `charge.refunded` | Confirmed missing handler; semantics undecided | Decide refund/dispute strategy, reconcile with invoice and entitlements; signed refund test |
| R2-07 | **P1 reliability investigation** | `apps/worker/src/claim.ts` sequential batch claims, lease/handler timeout assumptions; previous Oct 21 audit saw duplicate side effects with two synthetic workers | Current source pattern still present; **previous reproduction not rerun this pass** | Per-claim fenced ownership and bounded concurrency, two-worker Postgres lease-expiry E2E and idempotent side-effect proof |
| R2-08 | **P1 product** | Dated master audit/payment audit/feature docs describe 49/51 migrations, no Stripe and obsolete CI status | Confirmed doc drift | Point docs index to this report; retain old audit as historical, change any misleading *current* descriptions separately |
| R2-09 | **P1 billing ordering investigation** | Provider timestamp precision seconds allows same-second conflicting events | Potential only | Deterministic equal-timestamp event-order/recovery test; decide monotonic reconciliation strategy |
| R2-10 | **P0 operational** | No live mailbox test, counsel signoff, restore/worker alerts and single-writer staging proof in issues | Confirmed missing acceptance evidence | #44–#47 owner/ops gates |

Do **not** close R2-01 as fixed until PR CI passes; do **not** assert R2-07/R2-09 production failure without new reproductions.

### H. Code changes in this audit

| File | Branch action | Why / safety |
|---|---|---|
| `tests/e2e/account-security.spec.ts` | One narrow source-test change, replacing `waitForURL('**/login**')` after in-app navigation with `await expect(elsewhere).toHaveURL(/\/login(?:\?|$)/)` | Playwright's URL assertion retries through a client-side redirect without requiring an abort-prone `load` navigation event; exact revoked-session banner, re-login and landing checks **retained**. No app/auth code weakened. **CI verdict pending**. |
| `docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md` | New consolidated report | Current provenance, seven-issue register, 173-feature historical appendix, and live Stripe/Supabase read-only evidence. Root `REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md` is a concise pointer to this report. |

**Protected files:** none changed. **Hosted SQL/Stripe mutations:** none. **Existing user working tree:** not accessible, not modified/reset; remote `main` untouched.

### I. Test and verification ledger

| Check | Real source of result | Result | Limits |
|---|---|---|---|
| Latest GitHub `pnpm lint`, `pnpm typecheck` | Actions run 40017740619, earlier steps successful | PASS | No local command execution |
| GitHub `pnpm test` | Same run log | **1,231 pass**, 117 files | Memory-mode test suite; mocks for Stripe network |
| Migration integrity test & local runner | Same workflow successful earlier steps | PASS, 52 migrations to disposable PostgreSQL | Does **not** apply to connected Supabase |
| Hosted migration compatibility scanner | CI step expects exit code 1 for known auth incompatibility; step passed | **BLOCKER DETECTION PASS**, compatibility itself **FAIL/BLOCKED** | Not a hosted migration proof |
| GitHub `pnpm test:pg` | Same run log | **50 pass**, 11 files | PostgreSQL 16 CI, no real Stripe network |
| Production build + frontend secret sentinel scan | Same run, step successful | PASS | No deployed browser/release proof |
| GitHub `pnpm test:e2e` | Same run log | **235 pass / 1 fail** | Browser case R2-01; no retry to hide flake |
| Connected Supabase read-only | Supabase project, table, migration, Edge Function and advisor queries | 0 public app tables; 1 migration; 0 functions; 0 advisor notices | Zero app schema → no RLS acceptance possible |
| Connected Stripe read-only | Stripe test-mode Prices/Subscriptions/WebhookEndpoints | 1 price, 2 active test subscriptions, 0 endpoints | Test account only; no provider delivery test |
| New branch E2E test modification | GitHub write API | Source committed; **NOT EXECUTED YET** | Await PR CI before marking fixed |
| Local Git status / `pnpm` execution / Reticle / live email / real Stripe webhook / Oracle restore | No clone, local dependencies or deployed browser in this session | **NOT RUN** | Do not invent green outcomes; Reticle skipped because change is test/documentation only |

### J. GitHub issue reconciliation journal

**Baseline and final GitHub issue states:** #44–#50 **OPEN**. Existing issue comments from 2026-10-23 ~18:15–18:25 UTC already cover hosted Supabase and older provider work. This review **posted five new substantive comments to #45, #46, #47, #48 and #50**; #44 and #49 were not repeated because their prior comments remain current. No issue state, labels, assignees or milestones were changed; no duplicate issues created and **no issue closed**.

| Issue | Baseline state | Verified updated fact | Expected tracker disposition |
|---|---|---|---|
| #44 | OPEN | Live email remains unproven | Keep open; no new comment (previous note adequate) |
| #45 | OPEN | No approved deletion/legal/live contact; payment erasure mode-off risk R2-05 | [Comment 6374109469](https://github.com/yhsomani/talentsphere-complete/issues/45#issuecomment-6374109469); kept open |
| #46 | OPEN | Local migration count now 52; hosted public schema still empty | [Comment 6374110168](https://github.com/yhsomani/talentsphere-complete/issues/46#issuecomment-6374110168); kept open |
| #47 | OPEN | CI latest red; stage/restore remains unproven | [Comment 6374110786](https://github.com/yhsomani/talentsphere-complete/issues/47#issuecomment-6374110786); kept open |
| #48 | OPEN | Durable billing added to saved jobs/searches/settings; long-tail ephemeral | [Comment 6374111482](https://github.com/yhsomani/talentsphere-complete/issues/48#issuecomment-6374111482); kept open |
| #49 | OPEN | Simulated assessment/executor/token decisions still not resolved | Keep open; no new comment (previous note adequate) |
| #50 | OPEN | Stripe added in PR71; connected test account zero webhook endpoints; UI free-only | [Comment 6374112336](https://github.com/yhsomani/talentsphere-complete/issues/50#issuecomment-6374112336); kept open |

The five comments above were returned by the GitHub integration with the listed IDs. No production-delivery or hosted-migration success was claimed; all seven issue acceptance gates remain unsatisfied.

### K. Remaining blockers, owners and decisions

- **Release P0:** Approve compatible application identity schema and deploy to disposable hosted target; owner/architecture approval of ADR-015; trusted HTTPS/network topology; real single-writer/worker heartbeat/backup restore drills (#46, #47).
- **Privacy P0:** Approve actual erasure schedule/retention and published legal contacts; prove scheduled due execution, recovery, deletion boundary including Stripe external retention, and notify users (#45).
- **Communication P0:** Configure email sender, DNS, live mailbox tests, retries/bounces/queue alerting (#44).
- **Monetization P1:** Select free-only vs paid production rollout; approve all prices/currencies, entitlements, refund/dispute behavior, Stripe webhook provisioning and replay monitoring; ensure UI truthfulness (#50). **Only test-mode connected account discovered**.
- **Trust P1:** Approve sandbox/executor and evidence provenance, score policy, browser-token migration decision; preserve fail-closed simulation (#49).
- **Product scope P1:** Decide which beta-scope ephemeral routes must persist before exposure (#48).
- **CI P0:** Prove E2E navigation wait improvement passes and revoked-token correctness still holds.

### L. Deployment readiness

| Gate | Observed state | Verdict |
|---|---|---|
| Latest upstream full CI | Failed 1/236 Playwright tests; earlier two green | **RED** |
| 52 local database migrations and 50 PG tests | Successful CI | **GREEN (local CI only)** |
| Managed Supabase target schema | No application tables | **BLOCKED** |
| Hosted RLS authorization / grants | Cannot test real app objects | **BLOCKED** |
| Stripe SDK / signed webhook / PG durability | Code present; mocked network tests and local PG green | **PARTIAL** |
| Stripe test account webhook delivery | 0 webhook endpoints configured | **BLOCKED** |
| Live-mode payments | Not accessed; no mutation performed | **NOT VERIFIED** |
| Legal, email, privacy, backups, worker, load, TLS | Acceptance evidence missing | **BLOCKED** |
| App-wide 173-feature production verification | Only historical provisional inventory | **NOT VERIFIED** |

**Do not enable `BILLING_MODE=stripe` for public users, deploy application migrations to the current Supabase project, or describe this as production ready before the relevant owner-approved gates and environment checks pass.**

### M. Dependency-ordered action plan (always-working delivery)

| Order | Priority | Workstream / link | Observable acceptance, no invented dates |
|---|---|---|---|
| 0 | P0 | CI R2-01 | PR CI completes with 236/236 E2E; revoked external session still redirected with exact banner, active session retained |
| 1 | P0 | Schema #46 | Approved identity model, migration adaption, clean + populated disposable rehearsal, 2-user/2-tenant RLS and grant checks; **no direct hosted target migration until signed approval** |
| 2 | P0 | Operations #47 | After #46: Oracle app boot, single-writer lock, worker liveness/queue backlog alarm, fresh encrypted off-host restore, rollback and smoke |
| 3 | P0 | Communication #44 | Verified sender, code/reference real-mailbox sends, expiry and replay negatives, bounces/retry alerting, secrets absent from logs |
| 4 | P0 | Privacy #45 + R2-05 | Legal/retention/contact approval, due-erasure scheduler/queue, restart recovery, Stripe disabled/enabled erasure consistency and staging tests |
| 5 | P1 | Monetization #50 + R2-03/04/06/09 | Decide launch mode; test-mode Stripe endpoint and signed delivery; complete refund/order policy, entitlement read model, honest UI; *then* any live-mode readiness |
| 6 | P1 | Core product #48 | Prioritize drafts/network/alerts by accepted beta scope; each vertical slice: API + Postgres + authz + UI + restart/tenant/browser tests |
| 7 | P1 | Trust #49 + worker R2-07 | Code executor sandbox/fail closed, policy provenance, safe worker lease fencing and replay proof |
| 8 | P2 | Doc reconciliation R2-08 | Mark stale snapshots clearly; link this report in `docs/INDEX.md`, refresh current feature ledger after acceptance not before |

**Sprint increments (capacity unknown; sequencing, not promises):** Sprint A CI+observability baseline (no new feature); Sprint B hosted schema proof on disposable target; Sprint C one staging candidate → reference → job application journey; Sprint D privacy+mail/erasure proof; Sprint E optional paid vertical slice *only after commercial approval*; Sprint F durable beta micro-features and technical-interview security. Each sprint merges only after lint/typecheck, unit/integration/security, PG, E2E, safe migration checks, manual stage flow when applicable, and rollback proof. A sprint with red CI does not complete or unlock next work.

**Definition of Done:** traceable requirement and reproducible observable acceptance; no fake verification; reviewed minimal diff; no protected-file edits or leaked secrets; authorizations/role boundaries/negative/retry/idempotency tests; main green and manual runtime proof for UI changes; schema migration and rollback signoff for DB work; documentation of deferred gaps and release decision.

### N. Feature inventory (historical baseline, not reverified)

The **173 entries below are imported directly from** [`docs/reports/FEATURE_STATUS_2026-10-21.md`](FEATURE_STATUS_2026-10-21.md). They retain its October 21 **provisional/search-limited** statuses, because the remote-only targeted re-audit cannot honestly recertify 173 end-to-end contracts. **F-16 has advanced since this snapshot** with PR #71; see section F. **¹NOT FOUND** means search-limited absence, not a universal impossibility; **¹BROKEN** references older reproduced evidence unless explicitly verified above.

| Feature | Canonical name | 2026-10-21 provisional status | Historical code/evidence observation (not new verification) |
|---|---|---|---|
| F-01 | Authentication & Session | PARTIAL | Email/password registration, HMAC session/revocation and UI exist. Full SSOT contract remains partial: account-email verification, OAuth, forgot/reset-password, refresh-token cookies and age-gate |
| F-02 | Landing Page | UNVERIFIED | Landing page, e2e |
| F-03 | Dashboard (Role-Adaptive) | UNVERIFIED | Role-adaptive dashboard, e2e |
| F-04 | Job Marketplace | PARTIAL | Jobs browse/filter/apply and saved bookmarks exist; full SSOT matching/discovery and dependent outcome acceptance remain incomplete or unverified. |
| F-05 | Post Job Studio | PARTIAL | Recruiter create/publish UI and durable job lifecycle exist. BR-11 includes scheduled status; current JobStatus union omits it. Full studio acceptance remains partial. |
| F-06 | ATS / Candidate Pipeline | PARTIAL | Recruiter pipeline UI and guarded durable transitions exist; full SSOT interview/scorecard/hiring-manager and outcome journey not established. |
| F-07 | Learning Management System | PARTIAL | Lesson player and sequential completion UI now exist; course/module/lesson/progress state is process-local. D-09: verified certificate issuance checks lesson count but omits canonical BR-048 fina |
| F-08 | Challenges Arena | BROKEN¹ | Submission UI explicitly says unexecuted/unscored; evaluator still returns passed/100 for arbitrary nonempty text (probe reproduced). Evidence is unverified. |
| F-09 | Professional Networking | PARTIAL | Network page: search, request, withdraw, e2e |
| F-10 | Direct Messaging | UNVERIFIED | Messages UI, threads API, e2e |
| F-11 | AI Career Assistant (Basic) | PARTIAL | Career assistant chat API; no UI route calls it |
| F-12 | Profile Management | PARTIAL | Profile UI, basic fields, skills and evidence exist. Full contract includes uploads, education/certification editing, per-section visibility and other capabilities not established by current subs |
| F-13 | Resume Builder | PARTIAL | Resume create and export API; UI creates only, no section editor |
| F-14 | Notification Center | UNVERIFIED | Notifications page and badge, e2e |
| F-15 | Settings | PARTIAL | Settings SQL, export metadata and erasure request/status/cancel exist. Due scheduler/policy unresolved; cleanup can fail after deactivation (D-03). |
| F-16 | Billing & Subscriptions | PARTIAL | Billing defaults disabled; paid activation refused. Simulated records exist only when allowed in development/test. Checkout displays plans; no real payment provider integration. |
| F-17 | Admin Console | PARTIAL | AdminPage exists: user search/status, audit log, health, maintenance. Broad governance scope remains partial. |
| F-18 | Chrome Extension Companion | NOT FOUND¹ | No extension code in repo |
| F-19 | Product Analytics | PARTIAL | Analytics events API; no UI |
| F-20 | Command Search (⌘K) | UNVERIFIED | Command palette, e2e |
| F-21 | Error Recovery & Resilience | PARTIAL | Session error notice only; no systematic recovery |
| F-22 | Gamification & XP Ledger | PARTIAL | XP ledger and gamification API; no UI |
| F-23 | Leaderboard & Badges | PARTIAL | Leaderboard and badges API; no UI |
| F-24 | Trust, Safety & Moderation | PARTIAL | Moderation API; no UI |
| F-25 | Job Detail View | UNVERIFIED | Job detail page, e2e |
| F-26 | Portfolio Showcase | PARTIAL | Portfolio page, e2e (server memory only) |
| F-27 | Local Resume Match Preview | NOT FOUND¹ | No extension code |
| F-28 | External Job Page Scanner | NOT FOUND¹ | No extension code |
| F-29 | Scheduled Notification Digest | PARTIAL | Digest preference stored; no digest sending in worker |
| F-30 | Networking Stale-Request Nudges | NOT FOUND¹ | No stale-request nudge code |
| F-31 | KPI Aggregation & Rollups | PARTIAL | KPI API; no UI |
| F-32 | Saved Searches & Job Alerts | PARTIAL | Saved-search SQL store exists; alert records/delivery remain incomplete. Do not rebuild saved searches. |
| F-33 | Video Interview Rooms | PARTIAL | Interview join API; no UI |
| F-34 | Multi-Entity Backend Search | PARTIAL | Search API; only the Network name lookup calls it |
| F-35 | Feature Flag Console | PARTIAL | PostgreSQL feature flags store exists; full console acceptance not traced. |
| F-36 | Application Draft Autosave | PARTIAL | Application drafts API; no UI calls it |
| F-37 | Job Templates | PARTIAL | Job templates API; no UI |
| F-38 | Legacy Chat Service (DEPRECATED) | EXCLUDED | Deprecated in registry |
| F-39 | Unified Backend Stub (DEPRECATED) | EXCLUDED | Deprecated in registry |
| F-40 | Institutional Managed Learning | PARTIAL | Alumni institutions API; no UI |
| F-41 | Procurement & Seat Licensing | NOT FOUND¹ | No seat licensing code |
| F-42 | Provider-Agnostic Media Engine | NOT FOUND¹ | No media engine code |
| F-43 | B2B2C Graduation Flywheel | NOT FOUND¹ | No graduation flywheel code |
| F-44 | AI Media Enrichment | NOT FOUND¹ | No AI media enrichment code |
| F-45 | Proctoring (Third-Party, vendor-gated OD-35) | PARTIAL | Proctoring fields on interviews only; no vendor integration |
| F-46 | Institutional Analytics | NOT FOUND¹ | No institutional analytics code |
| F-47 | Faculty Dashboard | NOT FOUND¹ | No faculty dashboard code |
| F-48 | OS Shell & Workbench | NOT FOUND¹ | No OS shell or workbench code |
| F-49 | Automation & Agents | NOT FOUND¹ | AI orchestrator only; no automation product |
| F-50 | Institutional Course Marketplace | NOT FOUND¹ | No institutional marketplace code |
| F-51 | Media Health Monitoring | NOT FOUND¹ | No media health code |
| F-52 | Certificate Verification | PARTIAL | Public VerifyPage is routed at /verify/:hash. Course certificates are process-local; evidence proof has durable source. D-09: verified certificate issuance checks lesson count but omits canonical |
| F-53 | Professional Social Graph & Feed | NOT FOUND¹ | No social feed (feedback routes only) |
| F-54 | Content Publishing | NOT FOUND¹ | No content publishing code |
| F-55 | Groups & Communities | PARTIAL | Alumni groups API; no UI |
| F-56 | Organization & Institution Pages | PARTIAL | Organization API and hiring page; no public company page |
| F-57 | Events & Webinars | NOT FOUND¹ | No events or webinars code |
| F-58 | Written Recommendations | NOT FOUND¹ | No written recommendations code |
| F-59 | Outreach Credits (TalentMail) | NOT FOUND¹ | No outreach credits code |
| F-60 | Profile Views & Privacy Controls | PARTIAL | Profile visibility settings; no view tracking |
| F-61 | Premium Candidate Tier (OD-34 gated) | PARTIAL | Candidate plan defined; no gating |
| F-62 | Sponsored Content (NOT RECOMMENDED) | EXCLUDED | Not recommended by registry |
| F-63 | Business-Development Graph (NOT RECOMMENDED) | EXCLUDED | Not recommended by registry |
| F-64 | LinkedIn Migration Engine | NOT FOUND¹ | No LinkedIn migration code |
| F-65 | LinkedIn Decoupling & Independence | NOT FOUND¹ | No LinkedIn decoupling code |
| F-66 | Course Creation Studio | PARTIAL | Course create and publish API; no studio UI |
| F-67 | Categories, Discovery & Comparison | PARTIAL | Level filter and skill categories; no category browse |
| F-68 | Quizzes, Practice Tests & Final Exams | PARTIAL | Quiz lesson type exists; no quiz engine |
| F-69 | Assignments & Peer Review | NOT FOUND¹ | No assignments code |
| F-70 | Learning Paths, Programs & Specializations | NOT FOUND¹ | No learning paths code (career pathways are separate) |
| F-71 | Course Q&A, Discussions, Notes | NOT FOUND¹ | No course Q&A or notes code |
| F-72 | Course Reviews & Ratings | NOT FOUND¹ | No course reviews (instructor reviews only) |
| F-73 | Course Commerce | NOT FOUND¹ | No course commerce code |
| F-74 | Instructor Platform | PARTIAL | Instructor reputation API; no instructor platform UI |
| F-75 | Employer Insights | PARTIAL | Employer reputation and metrics API; no UI |
| F-76 | Coding Contests & Live Leaderboards | NOT FOUND¹ | No coding contest code |
| F-77 | Skill Certification Exams | PARTIAL | Certificates API; no exam platform |
| F-78 | Practice Sets & Interview Prep | NOT FOUND¹ | No practice sets code |
| F-79 | Articles & Newsletters | NOT FOUND¹ | No articles code |
| F-80 | Profile Enhancements | PARTIAL | Headline, bio, location fields; no enhancements |
| F-81 | Identity Verification | PARTIAL | Work-email verification of roles; no identity document check |
| F-82 | Student Learning Analytics | PARTIAL | Per-course learning outcomes API; no UI |
| F-83 | Admin Platform Expansion | PARTIAL | Admin UI exists, but expanded institutional/governance coverage is not established. |
| F-84 | Skills Graph & Taxonomy | PARTIAL | Profile SkillsSection displays relationships; full taxonomy workflow and graph durability remain partial. |
| F-85 | Career Graph & Progression | PARTIAL | CareerPaths UI exists; career state remains process-local. |
| F-86 | Salary Intelligence | PARTIAL | Salary benchmarks and reports API; no UI |
| F-87 | Interview Experience Repository | PARTIAL | Interview question bank API; no UI |
| F-88 | Technical Interview Platform | PARTIAL | Technical interview API; no UI |
| F-89 | Contribution Verification System | PARTIAL | Contribution scores API; no UI |
| F-90 | Peer Mentorship & Advisor Network | PARTIAL | Alumni mentorship API; no UI |
| F-91 | Career Readiness Assessment | PARTIAL | CareerPage calls readiness API; outcome validation and persistence remain partial. |
| F-92 | Advanced Recruiter Search | PARTIAL | Recruiter talent pools API; no UI |
| F-93 | Interview Video Recording & AI Feedback | PARTIAL | Interview AI feedback API; no UI |
| F-94 | Verified Work History & References | PARTIAL | Hashed expiring mailbox codes, mandatory single-use reference token, anti-self checks, Resend queue adapter exist; real mailbox delivery unverified. |
| F-95 | Career Transition Planning | PARTIAL | CareerPaths UI exists; persistent plans and outcome validation remain partial. |
| F-96 | Skill Evidence & Digital Credentials | PARTIAL | Profile CredentialsSection and public VerifyPage exist; certificate persistence and full credential lifecycle incomplete. D-10: linked certificate/evidence revocation paths are independent (stati |
| F-97 | Real-Time Job Market Analytics | PARTIAL | Market signals API; no UI |
| F-98 | Employer Equity & Compensation Intelligence | PARTIAL | Company salary API; no UI |
| F-99 | AI Career Coach (Enhanced) | PARTIAL | Basic career assistant only; enhanced coach not built |
| F-100 | Peer Project Collaboration | NOT FOUND¹ | No peer project collaboration code |
| F-101 | Badge Marketplace & Recognition | PARTIAL | Badges API; no marketplace |
| F-102 | Hiring Manager Portal | PARTIAL | Recruiter hiring UI; no hiring-manager portal |
| F-103 | Candidate Comparison & Rubric | PARTIAL | Scorecard and comparison API; no UI |
| F-104 | Pre-Hire Assessment Customization | NOT FOUND¹ | No pre-hire customisation code |
| F-105 | Post-Hire Analytics & ROI Tracking | NOT FOUND¹ | No post-hire ROI code |
| F-106 | Skill Prerequisite Engine | PARTIAL | Skill relationships API; no UI |
| F-107 | Live Q&A with Instructors | NOT FOUND¹ | No live instructor Q&A code |
| F-108 | Expert Network Matching | NOT FOUND¹ | No expert matching code |
| F-109 | Salary Negotiation Guidance | NOT FOUND¹ | No salary negotiation code |
| F-110 | Verified Skill Endorsements | PARTIAL | Endorsements API; no UI |
| F-111 | Industry-Specific Learning Hubs | NOT FOUND¹ | No learning hubs code |
| F-112 | Resume Parsing & Optimization | NOT FOUND¹ | No resume parsing code |
| F-113 | Recruiter Outreach Analytics | NOT FOUND¹ | No outreach analytics code |
| F-114 | Learning Impact Tracking | PARTIAL | Learning impact API; no UI |
| F-115 | Certification Exam Platform | NOT FOUND¹ | No certification exam platform code |
| F-116 | Accessibility & Inclusive Learning | NOT FOUND¹ | No inclusive learning features |
| F-117 | Mobile-First Job Application | PARTIAL | Responsive apply flow; no offline or native app |
| F-118 | Emerging Skills Detection | PARTIAL | Top-growth skills API; no UI |
| F-119 | Diversity & Inclusion Analytics | NOT FOUND¹ | No diversity analytics code |
| F-120 | API & Integration Platform | NOT FOUND¹ | Only the billing webhook; no public API keys |
| F-121 | Warm Introduction Paths | PARTIAL | Warm intros API; no UI |
| F-122 | Application Feedback Loop | PARTIAL | Application feedback API; no UI |
| F-123 | Skill Decay Tracking (Freshness Engine) | PARTIAL | Skill freshness API; no UI |
| F-124 | Project Marketplace | NOT FOUND¹ | No project marketplace code |
| F-125 | Alumni Networks | PARTIAL | Alumni networks API; no UI |
| F-126 | Interview Prep Marketplace | NOT FOUND¹ | No interview prep marketplace code |
| F-127 | Company Culture Assessment | NOT FOUND¹ | Culture-fit score field on scorecards only |
| F-128 | Offer Comparison Tool | NOT FOUND¹ | Memory file says verified; no code or tests found |
| F-129 | Leadership Development | NOT FOUND¹ | No leadership development code |
| F-130 | Freelance Marketplace | NOT FOUND¹ | Memory file says verified; only a freelance employment type exists |
| F-131 | Apprenticeship Matching | NOT FOUND¹ | No apprenticeship code |
| F-132 | Scholarship Discovery | NOT FOUND¹ | Memory file says verified; no code or tests found |
| F-133 | Volunteer Matching | NOT FOUND¹ | Memory file says verified; no code or tests found |
| F-134 | Code Review Practice | NOT FOUND¹ | No code review practice code |
| F-135 | System Design Practice | NOT FOUND¹ | No system design practice code |
| F-136 | Micro-Learning | NOT FOUND¹ | No micro-learning code |
| F-137 | Spaced Repetition | NOT FOUND¹ | No spaced repetition code |
| F-138 | Study Accountability Partners | NOT FOUND¹ | No accountability partner code |
| F-139 | Local Communities & Meetups | NOT FOUND¹ | No meetup code |
| F-140 | Affinity Groups | NOT FOUND¹ | No affinity group code |
| F-141 | Onboarding Preparation | NOT FOUND¹ | No onboarding preparation code |
| F-142 | Referral Request System | PARTIAL | Referral requests API; no UI |
| F-143 | OSS Contribution Discovery | NOT FOUND¹ | No OSS discovery code |
| F-144 | Reputation Engine (multi-context) | PARTIAL | Reputation engine API; no UI |
| F-145 | Recommendation Engine Core | NOT FOUND¹ | Memory file says verified; no recommendation engine |
| F-146 | Activity & Contribution Tracking | PARTIAL | Activity tracking API; no UI |
| F-147 | Unified Search & Discovery | PARTIAL | Unified search API; no UI |
| F-148 | Instructor Reputation System | PARTIAL | Instructor reputation API; no UI |
| F-149 | Employer Reputation & Brand System | PARTIAL | Employer reputation API; no UI |
| F-150 | Peer Credibility Networks | PARTIAL | Peer credibility API; no UI |
| F-151 | Skill Supply/Demand Forecasting | PARTIAL | Skill forecasting API; no UI |
| F-152 | Career Trajectory Analysis | PARTIAL | Career trajectory API; no UI |
| F-153 | Learning Impact Dashboard (Enhanced) | PARTIAL | Learning impact dashboard API; no UI |
| F-154 | Interview Prediction & Benchmarking | NOT FOUND¹ | No interview prediction code |
| F-155 | Adaptive Learning System | NOT FOUND¹ | No adaptive learning code |
| F-156 | Professional Development Plan System | NOT FOUND¹ | No development plan code |
| F-157 | Skills Co-Learning Path Optimizer | NOT FOUND¹ | No co-learning optimiser code |
| F-158 | Talent Pool Intelligence & Analytics | PARTIAL | Talent pools API; no UI |
| F-159 | Behavioral Talent Discovery | PARTIAL | Behavioural discovery API; no UI |
| F-160 | Talent Segmentation & Classification | PARTIAL | Segmentation API; no UI |
| F-161 | Internal Mobility & Succession Platform | NOT FOUND¹ | No internal mobility code |
| F-162 | Verified Work History Network & Graph | PARTIAL | Work-history graph UI/API exists; independent-reference scoring implemented; policy ratification and live proof missing. |
| F-163 | Credential Wallet & Portability | NOT FOUND¹ | No credential wallet code |
| F-164 | Skills Evidence Narrative & Storytelling | NOT FOUND¹ | No narrative code |
| F-165 | Diversity, Equity & Inclusion Data System | NOT FOUND¹ | No DEI data system code |
| F-166 | Interview Performance Benchmarking | NOT FOUND¹ | No interview benchmarking code |
| F-167 | Candidate Comparison & Rubric (Enhanced) | NOT FOUND¹ | No enhanced comparison code |
| F-168 | Hiring Prediction & Success Modeling | NOT FOUND¹ | No hiring prediction code |
| F-169 | Community Contribution Scoring & Recognition | PARTIAL | Contribution scoring API; no UI |
| F-170 | Expert Network (Enhanced) | NOT FOUND¹ | No enhanced expert network code |
| F-171 | Employer Brand Management System | NOT FOUND¹ | No employer brand management code |
| F-172 | Advanced Compensation Intelligence | PARTIAL | Compensation reports API; no UI |
| F-173 | Company-to-Skills Mapping | NOT FOUND¹ | No company-skills mapping code |

### O. Evidence and review links

- [Latest red main CI, run 40017740619](https://github.com/yhsomani/talentsphere-complete/actions/runs/40017740619) — exact commit 0f40b6c, one E2E failure
- [Earlier green run 40016584724](https://github.com/yhsomani/talentsphere-complete/actions/runs/40016584724), [green run 40014603225](https://github.com/yhsomani/talentsphere-complete/actions/runs/40014603225)
- [PR #71: durable Stripe billing](https://github.com/yhsomani/talentsphere-complete/pull/71), [PR #70: billing fixes](https://github.com/yhsomani/talentsphere-complete/pull/70), [PRs #61–#66: hosted migration guards](https://github.com/yhsomani/talentsphere-complete/pulls?q=is%3Apr+is%3Amerged)
- [Original 173-feature matrix](FEATURE_STATUS_2026-10-21.md), [backlog](FEATURE_PLAN_2026-10-21.md), [docs index](../INDEX.md), [architecture ADR-015](../engineering/DECISIONS.md#adr-015--persist-the-core-career-loop-keep-the-apis-maps-as-a-read-model)
- [Hosted dependency analysis](../engineering/DATABASE.md#hosted-supabase-migration-gate-and-dependency-audit), [hosted migration release gate](../engineering/DATABASE.md#hosted-supabase-migration-gate-and-dependency-audit), [historical payment audit](AUDITS_2026-10.md#payment-audit-and-fixes-2026-10-23)
- [Agent safety and build-file restrictions](../../AGENTS.md), [exact CI workflow](../../.github/workflows/ci.yml), [open issues](https://github.com/yhsomani/talentsphere-complete/issues)

**Review boundary:** A GitHub report is a maintainable evidence artifact, not authority to deploy, migrate hosted SQL, run live charges or declare all canonical features verified. Update this report as CI and staging proof become available.
