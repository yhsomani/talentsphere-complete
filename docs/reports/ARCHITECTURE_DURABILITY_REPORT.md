# TalentSphere — Architecture, Security, Durability & Integrations Report

**Date:** 2026-10-22  
**Author:** Teamwork Master Synthesis Engineering Group  
**Repository:** `https://github.com/yhsomani/talentsphere-complete.git`  
**Git HEAD:** `83dc7d247efbd3b3c3312bef74ac49978d33e924`  
**Active Branch:** `repository_audit_roadmap`  
**Authoritative Baselines:** `SSOT.md` v6.0, `ADR-015`, `TRD.md`, `SECURITY.md`, `deploy/oracle/compose.yaml`

---

## 1. Executive Summary

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

## 2. Persistence & Durability Architecture (ADR-015)

### 2.1 The Hydrated Read Model & Single-Writer Constraint

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

### 2.2 Concurrency Control & Optimistic Locking

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

### 2.3 Durable vs. Ephemeral Routes Audit

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

### 2.4 Operational Bottlenecks & Scalability Limits

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

## 3. Work-History Proof of Control Audit

### 3.1 Corporate Email Verification Flow

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

#### Vulnerability SEC-01: Insecure Challenge Hash (Missing HMAC Key)
- **Severity**: **High** (CWE-328 / CWE-916)
- **Finding**: The challenge hash is computed as:
  ```typescript
  sha256Hex(`${id}:${code}`) // where id is the public workHistoryId UUID
  ```
- **Mechanism**: The work history ID `id` is a known public UUID exposed in API requests and profile graphs. The code space is only $10^6$ combinations ($000000$ to $999999$). There is **no secret server pepper or HMAC key** used in hashing. If an attacker gains read access to `public.work_history_email_challenges` (via SQL injection, database snapshot, or read replica compromise), they can precompute a 1,000,000-entry rainbow table for that specific UUID in less than 50 milliseconds using standard GPU SHA-256 acceleration, completely bypassing mailbox control.
- **Remediation**: Hash with `crypto.createHmac('sha256', env.TOKEN_SECRET).update(`${id}:${code}`).digest('hex')`.

---

### 3.2 Single-Use Referee Voucher Tokens

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

#### Vulnerability SEC-02: Missing Token Expiration (Indefinite TTL)
- **Severity**: **Medium** (CWE-613)
- **Finding**: Referee voucher tokens have **no expiration timestamp**.
- **Mechanism**: `EmploymentReference` stores `requestedAt` and `submittedAt`, but lacks an `expiresAt` column. Neither domain logic nor API checks token age. An invitation sent to an employee remains valid months or years later, even if the referee leaves the company, changes roles, or becomes adversarial.
- **Remediation**: Add `expires_at TIMESTAMPTZ` (30 days TTL) to `employment_references` and validate `Date.now() < Date.parse(reference.expiresAt)` upon lookup and submission.

---

## 4. Auth & Session Security Audit

### 4.1 Password Hashing & Verification (PBKDF2 Floor)

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

### 4.2 Session Token Lifecycle & Revocation Mechanism

Implemented in `packages/domain/src/auth.ts:94-178` and `apps/api/src/server.ts:860-930, 1159-1210`:
1. **Token Minting**: HMAC-SHA256 signed JWT-like strings (`base64url(payload).signature`). Signing key fails safe: an unconfigured secret generates a random per-process secret rather than using a default key.
2. **Session Identification**: Every token contains a unique `sessionId: crypto.randomBytes(16).toString('base64url')`.
3. **Session Revocation Table (`public.revoked_sessions`)**:
   Created in migration `00046_session_sign_out.sql`. When a user signs out (`POST /api/v1/auth/sign-out`), `{ sessionId, userId, expiresAt }` is persisted to `revoked_sessions`. Opportunistic cleanup purges expired sessions (`DELETE FROM public.revoked_sessions WHERE expires_at <= now()`).
4. **Runtime Check**: `resolveSession` verifies `!revokedSessions.has(session.sessionId)` on every request.
5. **Global Cut-Off (`sessions_valid_after`)**: Added in migration `00045_session_revocation.sql`. Triggered on password change or `POST /api/v1/auth/sign-out-others`: sets `users.sessions_valid_after = now() + 1s`. Any token issued prior to this timestamp is rejected with `401 UNAUTHENTICATED`.

### 4.3 Row Level Security (RLS) & Fastify Bypass Analysis

- **Migration RLS Coverage**: Across all 49 migrations, `ENABLE ROW LEVEL SECURITY` is set on every table. Hardened in `00047_private_data_rls_hardening.sql` and `00048_notification_preferences_rls_scope.sql`.
- **Vulnerability SEC-04: API Bypasses PostgreSQL RLS**:
  The Fastify API connects to PostgreSQL using `DATABASE_URL` as the table owner/superuser role (`postgres` or `talentsphere`). In PostgreSQL, table owners **bypass RLS by default** (`BYPASSRLS`). The RLS policies in migrations 00001–00049 are **never evaluated** during standard API operation. All tenant isolation relies exclusively on Fastify route guards and domain checks.

### 4.4 Entity ID Fragmentation (`user.id` vs `profile.id`)
The codebase exhibits architectural identity fragmentation:
- In `00001_core_schema.sql`, `profiles.id` is distinct from `profiles.user_id` (a UUID linked to `users.id`).
- In `job_applications`: `candidate_id` references `public.profiles(id)` (`00001_core_schema.sql:182`).
- In `verified_work_histories`: `candidate_id` references `public.users(id)` (`00043_core_persistence_alignment.sql:80`).
- In `employment_references`: `candidate_id` references `public.users(id)` (`00043_core_persistence_alignment.sql:91`).
API handlers frequently translate `profilesByUserId.get(session.userId)` to obtain the profile UUID, creating subtle risks of ID confusion.

---

## 5. AI Governance Audit

### 5.1 `AI_PROHIBITED` Server Enforcement

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

### 5.2 Quota Metering & Flaws

Implemented in `packages/domain/src/ai-gateway.ts:52-172`:
1. **Tier Limits**: `free` (5,000 tokens/day, 20 req/day), `pro` (100,000 tokens/day, 500 req/day), `enterprise` (1,000,000 tokens/day, 5,000 req/day).
2. **Vulnerability SEC-06: Hardcoded 'free' Tier in API Route**:
   In `apps/api/src/server.ts:6097`:
   ```typescript
   const userTier: AITier = 'free'; // default free tier, strictly metered
   const meter = getOrCreateAIUsageMeter(session.userId, userTier);
   ```
   `userTier` is **hardcoded to `'free'`**. Even if a user has an active Pro subscription in `subscriptionsByUserId`, they are permanently throttled to 20 requests/day and 5,000 tokens/day. Furthermore, `aiUsageMetersByUserAndDate` is an in-process Map; restarting the server resets all daily quota consumption to 0.

### 5.3 Local Heuristic Execution vs. Remote LLM Calls
- **Execution Mode**: `generateCareerAssistantResponse()` executes entirely locally (`executionMode: 'local_heuristic'`) using keyword pattern matching.
- **Remote LLMs**: Across the entire repository, there are **zero HTTP client calls** to external AI providers.
- **BYO AI Keys**: `apps/api/src/storage/account-store.ts` provides AES-256-GCM encryption/decryption for user-provided API keys, but the decrypted key is never passed to any client or agent runner.

---

## 6. External Integrations & Staging Deployment

### 6.1 Resend Email Adapter
- Implemented in `apps/worker/src/mail-provider.ts` and `apps/worker/src/index.ts`.
- In `NODE_ENV === 'development'`, emails are logged to console (`DEV OUTBOX`).
- In staging/production, requires `EMAIL_PROVIDER === 'resend'`, `RESEND_API_KEY`, and `EMAIL_FROM`.
- Dispatches HTTP POST to `https://api.resend.com/emails` with `Idempotency-Key: jobId` header (preventing duplicate sends on worker retries).
- Transient failures (408, 429, 5xx) trigger worker retries with exponential backoff; permanent rejections (4xx auth) throw `PermanentJobError` and terminate.
- API endpoints fail closed (`503 SERVICE_UNAVAILABLE`) if transactional mail is unconfigured in staging/production.

### 6.2 Billing Integration & Webhook Signatures
- **Payment Processor**: No live Stripe API integration exists. When `BILLING_MODE !== 'simulated'`, paid plans are refused with `503 SERVICE_UNAVAILABLE`.
- **Signed Webhook Verification (WIT-016)**:
  `POST /api/v1/billing/webhook` requires header `x-talentsphere-signature: t=<unix_seconds>,v1=<hex_hmac_sha256>`. Fastify uses a raw string content-type parser to guarantee byte-for-byte HMAC verification against `BILLING_WEBHOOK_SECRET`. Replays older than 5 minutes are rejected.

### 6.3 Oracle Ampere ARM64 Staging Deployment
Defined in `deploy/oracle/compose.yaml`, `Dockerfile`, and `Caddyfile`:
- **Architecture**: Multi-arch ARM64 images (`node:24-bookworm-slim`, `postgres:16-bookworm`, `caddy:2-alpine`).
- **Network Isolation**: Three networks (`public`, `egress`, `internal`). `db` is strictly connected to `internal` with **zero published host ports**; `api` is connected to `internal` and `egress` with **zero published host ports**. Only Caddy binds to `80`/`443`.
- **Defects Identified**:
  - **Image Bloat**: `deploy/oracle/Dockerfile` copies `/app` without `pnpm prune --prod`, producing container images $>1\text{GB}$.
  - **Defect OPS-02 (Caddy Health Route)**: `deploy/oracle/Caddyfile` routes only `/api/*` to Fastify. Requests to `https://SITE_DOMAIN/health` are intercepted by Caddy's static file handler, returning `index.html` 200 OK and masking API failure.

---

## 7. Consolidated Vulnerabilities & Findings Register

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
