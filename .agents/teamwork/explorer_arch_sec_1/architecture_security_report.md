# TalentSphere Architecture, Security, Durability & Integrations Audit Report

**Date:** 2026-10-22  
**Auditor:** Architecture & Application Security Explorer (`explorer_arch_sec_1`)  
**Scope:** Core Architecture, Data Durability (ADR-015), Cryptographic Proof of Control, Auth/Session Security, AI Governance, External Integrations & Staging Deployment.  
**Git HEAD:** `83dc7d24` on branch `repository_audit_roadmap`  
**Workspace Root:** `C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\repository_audit_roadmap`

---

## Executive Summary

TalentSphere is in a **hybrid transition state**:
1. **Core Career Loop Durability**: The primary career loop (users, profiles, organizations, jobs, applications, evidence, work history, references, notifications, messaging) is backed by PostgreSQL under ADR-015 (`PgCoreStore`). 54 routes are durably persisted and protected by transactional writes, optimistic concurrency controls, and a single-writer PostgreSQL advisory lock.
2. **Ephemeral Route Exposure**: 220 out of 274 registered API routes (~80%) are completely non-durable, persisting data solely in ~150 in-process `Map`s inside `buildApp()`. State in learning management (LMS), coding arena challenges, assessment sessions, reputation, endorsements, reviews, bookmarks, application drafts, moderation reports, analytics, and billing is completely lost upon process restart or crash.
3. **Cryptographic Proof of Control**:
   - **Corporate Email Attestation**: Uses SHA-256 with public UUID salts rather than HMAC-SHA256. A database read leak allows full precomputation / rainbow-table reversal of the 6-digit numeric space ($10^6$ hashes) in milliseconds.
   - **Referee Voucher Tokens**: Uses 128-bit cryptographic random tokens hashed with SHA-256 and single-use consumption. However, tokens have **no expiration date (TTL)** and remain permanently valid until submitted.
4. **Auth & Session Security**: Password hashing meets OWASP 2023 standards (PBKDF2-HMAC-SHA512, 210,000 iterations) with transparent upgrade on login. Session revocation via `revoked_sessions` and `sessions_valid_after` is well-implemented and guarded. However, PostgreSQL Row Level Security (RLS) is completely bypassed by the Fastify API (which connects as the database superuser/owner), serving only hypothetical future direct Supabase access.
5. **AI Governance**: Enforces `AI_PROHIBITED` server-side, but relies on an in-memory assessment session map that clears on restart. Quota metering hardcodes `userTier: 'free'`, capping paying users at free limits. No remote LLMs are integrated; all responses are generated via local heuristic pattern matching.
6. **Integrations & Infrastructure**: Resend email adapter properly separates transient vs permanent errors and fails closed in staging/prod. Stripe integration does not exist (simulated mode only); billing webhooks require signed HMAC-SHA256 headers with replay tolerance. The Oracle ARM64 staging compose configuration enforces strict private networking for DB and API, but packages unpruned build dependencies and misses root `/health` proxying in Caddy.

---

## 1. Persistence & Durability Audit (ADR-015)

### 1.1 Architectural Mechanism & Single-Writer Constraint

Under ADR-015 (`docs/engineering/adr/ADR-015-core-loop-persistence.md`), the core career loop operates as a **single-writer hydrated read model**:
- **Write Path**: In `apps/api/src/server.ts:13317-13335`, writes route through `persist(...ops: CoreOp[])`. In `STORAGE=pg`, ops are committed in a single PostgreSQL transaction (`PgCoreStore.commit` in `apps/api/src/storage/core-store.ts:785-801`). Only after successful transaction `COMMIT` does `applyToReadModel` mutate in-process memory `Map`s. If the transaction aborts, the read model is untouched and the request fails with a 4xx/5xx error.
- **Write Ordering (`WRITE_ORDER`)**: `apps/api/src/storage/core-store.ts:753-778` orders operations topologically (users $\to$ profiles $\to$ skills $\to$ organizations $\to$ memberships $\to$ jobs $\to$ evidence $\to$ applications $\to$ work history $\to$ references $\to$ challenges/notifications/sessions $\to$ deletes), preventing foreign key constraint violations regardless of caller order.
- **Boot Hydration**: `apps/api/src/storage/core-store.ts:803-854` (`PgCoreStore.load`) executes 20 parallel `SELECT * FROM table ORDER BY created_at, id` queries to hydrate the in-process Maps prior to accepting traffic.
- **Single-Writer Advisory Lock**: Because reads query in-process Maps, running two API replicas against the same database would cause read-model divergence. To prevent horizontal split-brain, `apps/api/src/storage/index.ts:107-137` acquires a session-level PostgreSQL advisory lock on boot:
  ```sql
  SELECT pg_try_advisory_lock(718201, 1) AS acquired
  ```
  If a second API replica attempts to start against the database, `acquireWriterLease()` throws:
  `Error: A second API writer is already connected to this database. The hydrated read model supports one API instance only (ADR-015).`
  A lost database connection marks `writerLeaseLost = true`, causing `app.addHook('onRequest')` (`apps/api/src/server.ts:523-535`) to fail closed with `503 SERVICE_UNAVAILABLE`.

### 1.2 Concurrency Control & Optimistic Locking

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

### 1.3 Durable Routes vs. Ephemeral Routes Audit

`apps/api/src/durability.ts` declares:
- **`DURABLE_ROUTES`**: 54 routes backing identity, profiles, evidence, taxonomy, organizations, jobs, applications, verified work history, references, corporate email verification, messaging, notifications, saved searches, saved jobs, and account settings.
- **`STATELESS_ROUTES`**: 3 routes (`GET /health`, `GET /api/v1/health`, `GET /api/v1/billing/plans`).
- **`isEphemeralRoute(method, url)`**: Returns `true` for all other `/api/` routes.
- **Response Header Hook** (`apps/api/src/server.ts:574-579`):
  ```typescript
  app.addHook('onSend', async (req, reply) => {
    reply.header('x-request-id', req.id);
    if (storage.core.durable === false || isEphemeralRoute(req.method, req.routeOptions?.url)) {
      reply.header('x-talentsphere-durability', 'ephemeral');
    }
  });
  ```
- **Total Route Analysis**:
  - Total routes in `apps/api/src/server.ts`: **274 routes**
  - Durable routes: **54 routes** (19.7%)
  - Stateless routes: **3 routes** (1.1%)
  - Ephemeral routes: **217 routes** (~80%)

| Ephemeral Domain Area | Route Count | Representative Routes | Impact of Restart / Crash |
|-----------------------|-------------|-----------------------|---------------------------|
| **LMS & Courses** | ~24 | `POST /api/v1/courses`, `POST /api/v1/courses/:id/enroll`, `POST /api/v1/courses/lessons/:id/progress`, `POST /api/v1/courses/:id/certificate` | All created courses, student enrollments, module progression, and issued certificates vanish from memory. |
| **Code Arena & Assessments** | ~14 | `POST /api/v1/challenges`, `POST /api/v1/challenges/:id/sessions`, `POST /api/v1/challenges/sessions/:id/submit` | Active assessment sessions, candidate code submissions, and execution scores are wiped. |
| **Gamification & XP** | ~8 | `GET /api/v1/xp/ledger`, `GET /api/v1/gamification/leaderboard`, `POST /api/v1/gamification/badges/claim` | XP transaction histories and daily cap trackers reset to 0. |
| **Interviews Platform** | ~18 | `POST /api/v1/interviews/sessions`, `POST /api/v1/interviews/sessions/:id/scorecards` | Recruiter scorecards and candidate assessment records are lost. |
| **Reputation & Endorsements** | ~22 | `POST /api/v1/endorsements`, `POST /api/v1/instructors/:id/reviews`, `POST /api/v1/employers/:id/reviews` | Peer credibility endorsements, student reviews, and calculated reputation scores disappear. |
| **Career Trajectory & Forecasts**| ~16 | `POST /api/v1/careers/transitions`, `POST /api/v1/skills/forecast` | Anonymized benchmark transitions and 12-month supply/demand forecasts are wiped. |
| **Moderation & Trust/Safety** | ~12 | `POST /api/v1/moderation/reports`, `POST /api/v1/moderation/reports/:id/appeal` | User reports, moderation audit logs, and ban appeals vanish. |
| **Application Drafts & Resumes** | ~14 | `POST /api/v1/applications/drafts`, `POST /api/v1/resumes` | Candidate draft applications and resume builder documents are deleted. |
| **Billing & Subscriptions** | ~6 | `POST /api/v1/billing/subscribe`, `POST /api/v1/billing/cancel`, `POST /api/v1/billing/webhook` | All subscription states, invoices, and webhook deduplication keys are lost. |

### 1.4 Durability Risks & Operational Bottlenecks

1. **Unbounded Memory & Boot Scaling ($O(N)$)**:
   `PgCoreStore.load()` queries every row in `users`, `profiles`, `jobs`, `applications`, `evidence`, `messages`, and `notifications`. In production with 100,000 users and 1,000,000 messages, Node.js heap consumption will exceed 2GB and boot hydration will take tens of seconds, causing healthcheck timeouts during rolling deployments.
2. **Junction Table Write Amplification**:
   On every update to a job, application, or evidence record, `PgCoreStore.writeOp` executes:
   ```sql
   DELETE FROM public.job_skills WHERE job_id = $1;
   INSERT INTO public.job_skills ... SELECT $1, unnest($2::uuid[]);
   ```
   (Identical pattern for `application_evidence` and `evidence_skills`).
   This generates severe write amplification, index churn, and dead tuples in PostgreSQL MVCC.
3. **Out-of-Band State Invalidation**:
   If an operator manually inserts or updates a row directly in PostgreSQL (e.g. provisioning an admin, updating job status), the API will continue serving stale data from its in-memory Map until the process is restarted.
4. **Horizontal Scaling Ceiling**:
   Horizontal scaling is completely prohibited. The advisory lock explicitly enforces $N=1$.

---

## 2. Work-History Proof of Control Audit

### 2.1 Corporate Email Verification Flow

Implemented in `apps/api/src/server.ts:12421-12553` across two distinct steps:
1. **Step 1: Code Request**:
   - `assertCorporateEmailEligible(email, companyDomain)` validates that the domain matches the employer (`verifyCorporateEmailDomain`) and rejects disposable email providers (`DISPOSABLE_EMAIL_DOMAINS`) or consumer webmail (`CONSUMER_WEBMAIL_DOMAINS`).
   - Generation:
     ```typescript
     const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
     ```
     Generates a 6-digit numeric string with $\approx 19.93$ bits of entropy.
   - Storage & Secret Handling:
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
   - Expiration: `EMAIL_CHALLENGE_TTL_MS = 15 * 60 * 1000` (15 minutes).
   - Delivery: Enqueued durably via `storage.jobs.enqueue({ kind: 'work_history.email_verification_requested', payload: { workHistoryId: id, to: email, code, expiresAt: challenge.expiresAt } })`. The code is never returned in HTTP responses.
2. **Step 2: Code Verification**:
   - Compares candidate code against `challenge.codeHash`:
     ```typescript
     if (!safeEqualHex(sha256Hex(`${id}:${body.verificationCode.trim()}`), challenge.codeHash))
     ```
   - Brute-force & Concurrency Defense:
     Max attempts: `EMAIL_CHALLENGE_MAX_ATTEMPTS = 5`.
     When an incorrect code is submitted, an optimistic update increments `attempts: challenge.attempts + 1` with `base: challenge`. In SQL (`core-store.ts:574-580`), it updates `WHERE work_history_id = $1 AND code_hash = $3 AND attempts = $4`. Parallel requests cannot bypass attempt counting.
   - Single-use Consumption: Upon verification, `emailChallengeDelete` deletes the challenge with `base: challenge`, and `verifyCorporateEmail()` awards verified status.

#### Vulnerability Analysis: Insecure Challenge Hash (Lack of HMAC)
- **Finding**: The challenge hash is computed as:
  ```typescript
  sha256Hex(`${id}:${code}`) // where id is the public workHistoryId UUID
  ```
- **Severity**: **Medium** (CWE-328 / CWE-916)
- **Mechanism**: The work history ID `id` is a known UUID exposed in API requests and profile graphs. The code space is only $10^6$ combinations ($000000$ to $999999$). There is **no secret server pepper or HMAC key** used in hashing. If an attacker gains read access to `public.work_history_email_challenges` (via SQL injection, database snapshot, or read replica compromise), they can precompute a 1,000,000-entry rainbow table for that specific UUID in less than 50 milliseconds using standard GPU SHA-256 acceleration, completely bypassing mailbox control.
- **Remediation**: Hash with `crypto.createHmac('sha256', env.TOKEN_SECRET).update(`${id}:${code}`).digest('hex')`.

---

### 2.2 Single-Use Referee Voucher Tokens

Implemented in `apps/api/src/server.ts:12555-12780` and `packages/domain/src/work-history-graph.ts:494-585`:
1. **Minting & Cryptographic Entropy**:
   ```typescript
   // packages/domain/src/work-history-graph.ts:510
   const token = crypto.randomBytes(16).toString('hex');
   ```
   Generates a 128-bit cryptographically secure pseudorandom token (32 hexadecimal characters).
2. **Storage & Secret Protection**:
   - `apps/api/src/server.ts:12619-12624`:
     ```typescript
     const { token, ...rest } = requested;
     const stored: StoredReference = {
       ...rest,
       tokenHash: token ? sha256Hex(token) : undefined,
       clientRequestId: body.clientRequestId,
     };
     ```
   - In migration `00043_core_persistence_alignment.sql:105-109`, the plaintext `token` column was dropped from `employment_references`, replaced by `token_hash CHAR(64)`.
   - The token plaintext is stripped from API response payloads (`publicReference` in `server.ts:12366-12369`).
   - Plaintext `token` exists only briefly in memory to be enqueued in the durable worker job (`reference.requested`) for delivery to `refereeEmail`.
3. **Referee Access & Evaluation**:
   - The referee accesses `GET /api/v1/references/:refId` passing header `x-reference-token: <token>`.
   - The token is verified using constant-time comparison:
     ```typescript
     safeEqualHex(sha256Hex(token), reference.tokenHash)
     ```
   - Candidate details and employment dates are returned; invalid tokens return generic `404 NOT_FOUND` to prevent ID harvesting (`server.ts:12668`).
4. **Consumption & Replay Prevention**:
   - When submitted (`POST /api/v1/candidates/work-history/references/:refId/submit`), the token is validated against `reference.tokenHash`.
   - On submission, `tokenHash: undefined` (written as `null` in SQL) and `status: 'submitted'`.
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
   - `clientRequestId` idempotency key: `referencesByClientRequest` deduplicates retry submissions, returning the existing reference rather than minting new tokens or spamming referees.
   - Enforced by PostgreSQL partial unique index:
     ```sql
     CREATE UNIQUE INDEX uq_reference_client_request ON public.employment_references (candidate_id, client_request_id) WHERE client_request_id IS NOT NULL;
     ```

#### Vulnerability Analysis: Missing Token Expiration (Indefinite TTL)
- **Finding**: Referee voucher tokens have **no expiration timestamp**.
- **Severity**: **Medium** (CWE-613)
- **Mechanism**: `EmploymentReference` stores `requestedAt` and `submittedAt`, but lacks an `expiresAt` column. Neither `packages/domain/src/work-history-graph.ts` nor `apps/api/src/server.ts` checks token age. An invitation sent to an employee remains valid months or years later, even if the referee leaves the company, changes roles, or becomes adversarial.
- **Remediation**: Add `expires_at TIMESTAMPTZ` (e.g. 30 days TTL) to `employment_references` and validate `Date.now() < Date.parse(reference.expiresAt)` upon lookup and submission.

---

## 3. Auth & Session Security Audit

### 3.1 Password Hashing & Verification (PBKDF2 Floor)

Implemented in `packages/domain/src/auth.ts:1-91`:
- **Current Algorithm**: PBKDF2-HMAC-SHA512 with 64-byte derived key length.
- **Iteration Floor**: `PBKDF2_DEFAULT_ITERATIONS = 210_000` (meets OWASP 2023 recommendations).
- **Environment Override Floor**: `configuredPasswordIterations()` enforces a hard minimum floor:
  ```typescript
  const raw = Number(process.env.PASSWORD_PBKDF2_ITERATIONS);
  return Number.isInteger(raw) && raw >= 1000 ? raw : PBKDF2_DEFAULT_ITERATIONS;
  ```
- **Hash Format**: `pbkdf2-sha512$<iterations>$<salt>$<hash>` where salt is 16 cryptographically random bytes (`crypto.randomBytes(16).toString('hex')`).
- **Legacy Migration & Transparent Re-Hash**:
  - Legacy format `<salt>:<hash>` (10,000 iterations) is parsed and supported by `verifyPassword()`.
  - On successful sign-in (`apps/api/src/server.ts:1053-1063`):
    ```typescript
    if (passwordNeedsRehash(user.passwordHash)) {
      await persist({
        kind: 'user',
        base: user,
        value: { ...user, passwordHash: await hashPassword(input.password) },
      });
    }
    ```
    Upgrades the hash to 210,000 iterations transparently while plaintext is in memory.
- **Side-Channel Timing Protection**:
  In `apps/api/src/server.ts:1040-1043`, when a login email does not exist:
  ```typescript
  if (!user) {
    await verifyPassword(input.password, await timingDecoyHash);
    throw new DomainError('UNAUTHENTICATED', 'Invalid email or password.');
  }
  ```
  Executes a full PBKDF2 derivation against a precomputed decoy hash to prevent username enumeration via timing analysis.

### 3.2 Session Token Lifecycle & Revocation Mechanism

Implemented in `packages/domain/src/auth.ts:94-178` and `apps/api/src/server.ts:860-930, 1159-1210`:
1. **Token Minting & Secret Fallback**:
   - Tokens are HMAC-SHA256 signed JWT-like strings (`base64url(payload).signature`).
   - Signing Key (`auth.ts:120-123`):
     ```typescript
     const TOKEN_SECRET =
       process.env.TOKEN_SECRET && process.env.TOKEN_SECRET.length >= 32
         ? process.env.TOKEN_SECRET
         : crypto.randomBytes(48).toString('hex');
     ```
     Fails safe: An unconfigured secret generates a random per-process secret rather than using a hardcoded default key, preventing token forgery across restarts.
2. **Session Identification**:
   Every minted token contains `sessionId: crypto.randomBytes(16).toString('base64url')` (`auth.ts:138`).
3. **Session Revocation Table (`public.revoked_sessions`)**:
   Created in migration `00046_session_sign_out.sql`:
   ```sql
   CREATE TABLE public.revoked_sessions (
     session_id TEXT PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
     expires_at TIMESTAMPTZ NOT NULL,
     revoked_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   CREATE INDEX idx_revoked_sessions_expires_at ON public.revoked_sessions (expires_at);
   ```
4. **Sign-Out Operation (`POST /api/v1/auth/sign-out`)**:
   - Commits `{ kind: 'sessionRevocation', value: { sessionId, userId, expiresAt } }`.
   - In SQL (`core-store.ts:684-691`): Inserts into `public.revoked_sessions` and executes opportunistic cleanup:
     ```sql
     DELETE FROM public.revoked_sessions WHERE expires_at <= now();
     ```
   - In memory: Adds to `revokedSessions: Map<string, number>`.
5. **Runtime Authentication Check (`resolveSession`)**:
   - Checked on every request in `apps/api/src/server.ts:862-865`:
     ```typescript
     if (session.sessionId && revokedSessions.has(session.sessionId)) {
       throw new DomainError('UNAUTHENTICATED', 'You signed out of this session. Sign in again.');
     }
     ```
6. **Global Cut-Off (`sessions_valid_after`)**:
   - Added in migration `00045_session_revocation.sql`.
   - Triggered on password change (`POST /api/v1/auth/password`) or `POST /api/v1/auth/sign-out-others`:
     Sets `users.sessions_valid_after = now() + 1s`.
   - Checked in `resolveSession` (`server.ts:886-894`):
     ```typescript
     if (account.sessionsValidAfter && session.issuedAt * 1000 < Date.parse(account.sessionsValidAfter)) {
       throw new DomainError('UNAUTHENTICATED', 'This session was ended from another device. Sign in again.');
     }
     ```

### 3.3 Row Level Security (RLS) & Route Authorization Matrix

#### Database Migration RLS Coverage
Across all 49 migrations in `supabase/migrations/`:
- All tables have `ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;`.
- Tables without explicit SELECT policies default to deny-all for non-service roles.
- Private communication and notification tables were specifically hardened in `00047_private_data_rls_hardening.sql`:
  - `is_message_thread_participant(UUID)` is `SECURITY DEFINER` with fixed `search_path = ''`.
  - Direct INSERT on `thread_participants` was revoked from `PUBLIC, anon, authenticated`.
  - Notification updates restricted to `GRANT UPDATE (is_read, read_at)`.
  - Shadowing defect in `notification_preferences` was corrected in `00048_notification_preferences_rls_scope.sql` (`p.id = notification_preferences.user_id`).

#### Critical Architecture Mismatch: RLS Bypass in Fastify API
- **Observation**: The Fastify API connects to PostgreSQL using `DATABASE_URL` as the database owner/superuser role (`postgres` or `talentsphere`).
- **Impact**: In PostgreSQL, the table owner and superuser roles **bypass Row Level Security by default** (`BYPASSRLS`). The extensive RLS policies defined in migrations 00001–00049 are **never evaluated** during standard API operation.
- **Evidence**: `tests/pg/private-data-rls.test.ts:41` explicitly sets `SET LOCAL ROLE authenticated` to force RLS policy evaluation in unit tests, because standard API connections execute as owner.
- **Consequence**: All tenant isolation, authorization, and data boundary enforcement relies entirely on Fastify route guards and domain entity checks.

#### Entity ID Fragmentation (`user.id` vs `profile.id`)
The codebase exhibits architectural identity fragmentation:
- In `00001_core_schema.sql`, `profiles.id` is distinct from `profiles.user_id` (a UUID linked to `users.id`).
- In `job_applications`: `candidate_id` references `public.profiles(id)` (`00001_core_schema.sql:182`).
- In `verified_work_histories`: `candidate_id` references `public.users(id)` (`00043_core_persistence_alignment.sql:80`).
- In `employment_references`: `candidate_id` references `public.users(id)` (`00043_core_persistence_alignment.sql:91`).
- In `thread_participants`: `user_id` originally referenced `profiles(id)` before being resolved in 00047.
- **Risk**: API handlers frequently have to translate `profilesByUserId.get(session.userId)` to obtain the profile UUID. If an endpoint mixes up `session.userId` and `profile.id`, queries fail silently or violate foreign keys.

---

## 4. AI Governance Audit

### 4.1 `AI_PROHIBITED` Server Enforcement

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
   - Invoked at two API entry points:
     - `POST /api/v1/ai/assistant/query` (`apps/api/src/server.ts:4770-4773`)
     - `POST /api/v1/ai/career-assistant/chat` (`apps/api/src/server.ts:6083-6089`)
3. **Vulnerabilities**:
   - **Vulnerability 1: Ephemeral Session Map**. Active assessment sessions live in `assessmentSessionsByCandidateId = new Map<string, AssessmentSession[]>()`. If the API restarts during a 60-minute proctored assessment, the in-memory session map is lost. The candidate can immediately access AI assistance for the remainder of the session without server restriction.
   - **Vulnerability 2: Missing Profile Guard Bypass**. In `apps/api/src/server.ts:4768` and `6081`:
     ```typescript
     const profile = profilesByUserId.get(session.userId);
     if (profile) {
       assertAIAssistanceAllowed(...);
     }
     ```
     If a newly registered account queries `/api/v1/ai/assistant/query` without completing profile creation, `profile` is undefined and `assertAIAssistanceAllowed` is completely bypassed.

### 4.2 Quota Metering & Token Accounting

Implemented in `packages/domain/src/ai-gateway.ts:52-172`:
1. **Tier Limits**:
   - `free`: 5,000 tokens/day, 20 requests/day
   - `pro`: 100,000 tokens/day, 500 requests/day
   - `enterprise`: 1,000,000 tokens/day, 5,000 requests/day
2. **Prompt Sanitization & Context Firewall (WIT-007)**:
   - Enforces max 2,000 characters.
   - Regex scan for prompt injection attempts (`system prompt override`, `ignore previous instructions`, `you are now in developer mode`, script tags).
   - Escapes HTML entities and wraps user text in `<user_content>`.
3. **Audit Findings & Flaws**:
   - **Defect: Hardcoded 'free' Tier in API Route**:
     In `apps/api/src/server.ts:6097`:
     ```typescript
     const userTier: AITier = 'free'; // default free tier, strictly metered
     const meter = getOrCreateAIUsageMeter(session.userId, userTier);
     ```
     `userTier` is **hardcoded to `'free'`**! Even if a user has an active Pro subscription in `subscriptionsByUserId`, they are permanently throttled to 20 requests/day and 5,000 tokens/day.
   - **Defect: Ephemeral Usage Meter**:
     `aiUsageMetersByUserAndDate` is an in-process Map (`apps/api/src/server.ts:6016`). Every API restart resets all user token consumption and request counters to 0, completely breaking daily quota enforcement.

### 4.3 Local Heuristic Fallback vs. Remote LLM Calls

- **Execution Mode**: `generateCareerAssistantResponse()` in `packages/domain/src/ai-gateway.ts:199-269` executes entirely locally:
  ```typescript
  executionMode: 'local_heuristic'
  ```
- **Response Generation**: Uses trivial keyword matching on prompt strings (`'resume'`, `'cv'`, `'interview'`, `'prep'`, `'skill'`).
- **Remote LLM Audit**: Across the entire repository (`apps/` and `packages/`), there are **zero HTTP client calls** to external AI providers (OpenAI, Anthropic, Google Gemini, Mistral, or Ollama).
- **BYO AI Key Integration Status**:
  - `apps/api/src/storage/account-store.ts:130-159` provides AES-256-GCM encryption/decryption for user-provided API keys (`byo_ai_key`).
  - However, the decrypted key is **never passed to any client or agent runner**. It is purely dead persistence code.

---

## 5. External Integrations Audit

### 5.1 Resend Email Adapter

Implemented in `apps/worker/src/mail-provider.ts:1-67` and `apps/worker/src/index.ts:50-86`:
1. **Modes**:
   - **Development**: If `NODE_ENV === 'development'`, emails are intercepted and logged to console with job ID, recipient, subject, and body (`DEV OUTBOX`). No external network requests occur.
   - **Staging / Production**: Requires `EMAIL_PROVIDER === 'resend'`, `RESEND_API_KEY`, and `EMAIL_FROM`.
2. **HTTP Request & Idempotency**:
   - Dispatches POST to `https://api.resend.com/emails`.
   - Sends `Idempotency-Key: jobId` header. If the async worker crashes and retries a claimed job, Resend deduplicates the message and prevents duplicate emails.
   - Timeout: 20-second abort signal (`AbortSignal.timeout(20_000)`).
3. **Error Classification**:
   - Transient failures (408, 409, 429, 5xx, or network aborts) throw standard `Error`, allowing the background job runner to retry with exponential backoff.
   - Permanent rejections (invalid sender, 4xx auth errors) throw `PermanentJobError`, moving the job to terminal failed state without indefinite retry loops.
4. **API Fail-Closed Gate**:
   `apps/api/src/server.ts:12457-12469` and `12589-12601` verify Resend readiness before allowing corporate email verification or reference requests in staging/production, rejecting with `503 SERVICE_UNAVAILABLE` if credentials are unconfigured.

### 5.2 Billing Integration & Webhook Signatures

Implemented in `apps/api/src/server.ts:10560-10760`:
1. **Payment Processor Status**:
   - There is **no live Stripe API integration**. No Stripe client SDK (`stripe-node`) is imported.
   - When `BILLING_MODE !== 'simulated'`, `POST /api/v1/billing/subscribe` refuses paid plans:
     ```typescript
     if (input.planTier !== 'free' && env.BILLING_MODE !== 'simulated') {
       throw new DomainError('SERVICE_UNAVAILABLE', 'Paid plans are not available yet. TalentSphere is free while payments are being set up.');
     }
     ```
2. **Webhook Cryptographic Verification (WIT-016)**:
   - Endpoint: `POST /api/v1/billing/webhook`.
   - Header: `x-talentsphere-signature: t=<unix_seconds>,v1=<hex_hmac_sha256>`.
   - Payload: Signed over `${timestamp}.${rawBody}` using `BILLING_WEBHOOK_SECRET`.
   - Raw Body Preservation: Fastify registers a custom content type parser (`addContentTypeParser('application/json', { parseAs: 'string' })`) to guarantee byte-for-byte signature verification.
   - Replay Protection: Rejects any request where `|now - timestamp| > 300` seconds (5 minutes).
   - Constant-Time Comparison: Uses `crypto.timingSafeEqual` via `safeEqualHex`.
   - Fail-Closed: If `BILLING_WEBHOOK_SECRET` is unset, immediately returns `503 SERVICE_UNAVAILABLE`.
   - Flaw: Webhook idempotency (`billingEventsByIdempotency`) is stored in an in-memory Map; duplicate webhooks delivered across server restarts will be re-processed.

### 5.3 Oracle Ampere ARM64 Staging Deployment

Defined in `deploy/oracle/compose.yaml`, `deploy/oracle/Dockerfile`, and `deploy/oracle/Caddyfile`:
1. **ARM64 Architecture Compatibility**:
   - Base images:
     - `node:24-bookworm-slim` (official multi-arch ARM64 support)
     - `postgres:16-bookworm` (official multi-arch ARM64 support)
     - `caddy:2-alpine` (official multi-arch ARM64 support)
   - Compatibility on Oracle Ampere A1 (Neoverse-N1) is solid.
2. **Container Build Model**:
   - `compose.yaml` targets local multistage build targets (`target: api`, `target: worker`, `target: web`) using `deploy/oracle/Dockerfile`.
   - Images are **not pulled from a container registry**; they must be built on the Oracle VM or built using `docker buildx` with `--platform linux/arm64`.
3. **Network Isolation**:
   - Defines three networks: `public`, `egress`, and `internal` (`internal: true`).
   - `db` is strictly connected to `internal` with **zero published host ports** (verified in CI by `.github/workflows/oracle-staging.yml:25`).
   - `api` is connected to `internal` and `egress` with **zero published host ports** (verified in CI).
   - Only `web` (Caddy reverse proxy) binds to host ports `80`, `443`, and `443/udp`.
4. **DevOps & Image Hardening Deficiencies**:
   - **Severe Image Bloat**: `deploy/oracle/Dockerfile:11` does:
     ```dockerfile
     COPY --from=build /app /app
     ```
     This copies all source code, tests, markdown files, and full `node_modules` (including TypeScript compiler, vitest, playwright) into the runtime container, producing images $>1\text{GB}$ and increasing attack surface.
   - **Caddy Reverse Proxy Routing Defect**:
     `deploy/oracle/Caddyfile:7-13`:
     ```caddyfile
     handle /api/* {
         reverse_proxy api:4000
     }
     handle {
         try_files {path} /index.html
         file_server
     }
     ```
     The Fastify base healthcheck is registered at `GET /health` (`server.ts:719`). Caddy only routes `/api/*` to the API. Requests to `https://SITE_DOMAIN/health` are intercepted by Caddy's static file handler and return `index.html` with a 200 status, masking actual API health. Only `/api/v1/health` reaches Fastify.

---

## 6. Synthesis of Critical Vulnerabilities & Strategic Roadmap

### Severity Matrix

| ID | Category | Finding | Impact | Severity | Recommended Fix |
|----|----------|---------|--------|----------|-----------------|
| **SEC-01** | Cryptography | Corporate email verification code uses plain SHA-256 with public UUID salt, not HMAC. | Trivial rainbow-table reversal of 6-digit codes ($10^6$ hashes) if challenge table leaked. | **High** | Replace `sha256Hex(`${id}:${code}`)` with HMAC-SHA256 keyed by `TOKEN_SECRET`. |
| **SEC-02** | Cryptography | Referee voucher tokens have no expiration timestamp (TTL). | Emailed bearer tokens remain permanently valid; ex-employees or compromised inboxes can voucher years later. | **Medium** | Add `expires_at TIMESTAMPTZ` (30 days TTL) to `employment_references` and validate on submit. |
| **SEC-03** | Durability | 220 routes persist state only in ~150 in-process Maps (`x-talentsphere-durability: ephemeral`). | Total data loss on process restart for courses, code challenges, interviews, reviews, bookmarks, and billing. | **Critical** | Incrementally migrate high-priority domain tables from `supabase/migrations` into `apps/api/src/storage/`. |
| **SEC-04** | Architecture | API bypasses PostgreSQL RLS by connecting as superuser/owner. | Database does not enforce tenant isolation; all security relies solely on application layer code. | **Medium** | Transition API connection pool to a restricted role with RLS enabled, or document explicit threat model boundary. |
| **SEC-05** | AI Governance | `assessmentSessionsByCandidateId` is stored in an in-process Map; reset on restart. | Server restart during active exam unblocks AI assistant, bypassing `AI_PROHIBITED`. | **High** | Persist active assessment sessions in PostgreSQL (`00004_challenges_assessment_schema.sql`). |
| **SEC-06** | AI Governance | `userTier` hardcoded to `'free'` in `/api/v1/ai/career-assistant/chat`; usage meter is in-memory. | Paid subscribers throttled to free limits; token usage resets on server restart. | **Medium** | Read plan tier from `subscriptionsByUserId`; persist `ai_usage_meters` in PostgreSQL (`00008`). |
| **OPS-01** | Architecture | Hydration reads entire database at boot ($O(N)$ memory/time); single-writer lock blocks scaling. | Scaling bottleneck; memory exhaustion and deployment timeouts as data grows. | **High** | Move core read paths directly to SQL queries; retire in-memory Maps to unlock multi-replica API scaling. |
| **OPS-02** | Deployment | Dockerfile copies unpruned build tree; Caddy fails to route `/health`. | Bloated container images ($>1\text{GB}$); synthetic healthchecks mask API failure. | **Low** | Use `pnpm prune --prod` in Dockerfile; update Caddyfile to route `/health` and `/api/*`. |

---

## 7. Independent Independent Verification Guide

To independently verify all findings in this report:

1. **Verify Ephemeral vs Durable Split**:
   ```powershell
   # Count total routes vs durable routes
   powershell -Command "(Select-String -Path 'apps/api/src/server.ts' -Pattern '^\s*app\.(get|post|put|patch|delete)\(').Count"
   # Verify durable routes set
   powershell -Command "(Select-String -Path 'apps/api/src/durability.ts' -Pattern '''(GET|POST|PUT|PATCH|DELETE) ').Count"
   ```
2. **Verify Password Hashing Floor & Session Revocation**:
   ```bash
   pnpm vitest run tests/security/session-sign-out.test.ts
   pnpm vitest run tests/security/core-authz.test.ts -t "Durability is stated"
   ```
3. **Verify Email Challenge and Concurrency on Real Postgres**:
   ```bash
   # Set TEST_DATABASE_URL and run
   pnpm test:pg tests/pg/concurrency.test.ts
   pnpm test:pg tests/pg/core-persistence.test.ts
   ```
4. **Verify Docker Staging Model & Network Port Isolation**:
   ```bash
   SITE_DOMAIN=staging.example.test ACME_EMAIL=ci@example.test POSTGRES_PASSWORD=secret TOKEN_SECRET=secret012345678901234567890123456789 docker compose -f deploy/oracle/compose.yaml config
   ```
