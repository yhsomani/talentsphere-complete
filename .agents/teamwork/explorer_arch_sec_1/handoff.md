# Handoff Report — Architecture, Security, Durability & Integrations

**Agent:** `explorer_arch_sec_1`  
**Role:** Principal Architect, Application Security Engineer, Data Integrity Specialist Explorer  
**Task:** Deep technical audit of Architecture, Security, Durability & Integrations  
**Date:** 2026-10-22  
**Working Directory:** `C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\repository_audit_roadmap\.agents\teamwork\explorer_arch_sec_1`  
**Deliverable File:** `C:\Users\yashs\.gemini\antigravity\worktrees\talentsphere-complete\repository_audit_roadmap\.agents\teamwork\explorer_arch_sec_1\architecture_security_report.md`  

---

## 1. Observation

1. **Persistence & Durability (ADR-015)**:
   - `apps/api/src/durability.ts:18-94`: `DURABLE_ROUTES` set contains exactly 54 route strings.
   - `apps/api/src/server.ts`: 274 total routes registered (`app.get|post|put|patch|delete`). Exactly 220 routes do not belong to `DURABLE_ROUTES` or `STATELESS_ROUTES` (3 routes) and trigger:
     ```typescript
     // apps/api/src/server.ts:576-578
     if (storage.core.durable === false || isEphemeralRoute(req.method, req.routeOptions?.url)) {
       reply.header('x-talentsphere-durability', 'ephemeral');
     }
     ```
   - `apps/api/src/server.ts`: 150 in-process `new Map()` declarations hold all state for non-durable routes (LMS, challenges, assessments, interviews, reputation, bookmarks, drafts, analytics, billing).
   - `apps/api/src/storage/index.ts:117-124`:
     ```typescript
     const result = await client.query<{ acquired: boolean }>(
       'SELECT pg_try_advisory_lock(718201, 1) AS acquired'
     );
     if (!result.rows[0]?.acquired) {
       throw new Error('A second API writer is already connected to this database. The hydrated read model supports one API instance only (ADR-015).');
     }
     ```
   - `apps/api/src/storage/core-store.ts:803-854`: `PgCoreStore.load()` runs 20 parallel `SELECT * FROM ... ORDER BY created_at, id` queries to hydrate all entities into memory at boot.
   - `apps/api/src/storage/core-store.ts:373, 416, 466`: Update ops execute `DELETE FROM table WHERE parent_id = $1` followed by `INSERT ... unnest($2::uuid[])`, generating junction table write amplification.

2. **Work-History Proof of Control**:
   - `apps/api/src/server.ts:12471-12476`:
     ```typescript
     const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
     // ...
     codeHash: sha256Hex(`${id}:${code}`),
     ```
     `id` is the public `workHistoryId` UUID; hashing is plain SHA-256 without a secret key or HMAC.
   - `apps/api/src/server.ts:12509-12519`: Checks expiration (`EMAIL_CHALLENGE_TTL_MS = 15 * 60 * 1000`), maximum 5 attempts (`EMAIL_CHALLENGE_MAX_ATTEMPTS = 5`), and uses `safeEqualHex`.
   - `packages/domain/src/work-history-graph.ts:510`: Referee token generated with `crypto.randomBytes(16).toString('hex')` (128-bit entropy).
   - `apps/api/src/server.ts:12622`: Stored as `tokenHash: sha256Hex(token)`. Plaintext column dropped in migration 00043; response payload strips `tokenHash`.
   - `packages/domain/src/work-history-graph.ts:49-68`: `EmploymentReference` has `requestedAt` and `submittedAt` but **no `expiresAt` field**; token never expires until consumed.

3. **Auth & Session Security**:
   - `packages/domain/src/auth.ts:11, 22-25, 58-63`: PBKDF2 uses SHA-512, 64-byte key length, and 210,000 iterations minimum.
   - `apps/api/src/server.ts:1053-1063`: On sign-in, `passwordNeedsRehash(user.passwordHash)` transparently re-hashes legacy 10,000-iteration credentials.
   - `packages/domain/src/auth.ts:120-124, 138`: Session tokens carry a 16-byte random `sessionId` and are signed with `TOKEN_SECRET` (or a random 48-byte fallback).
   - `apps/api/src/server.ts:863-865`:
     ```typescript
     if (session.sessionId && revokedSessions.has(session.sessionId)) {
       throw new DomainError('UNAUTHENTICATED', 'You signed out of this session. Sign in again.');
     }
     ```
   - `apps/api/src/server.ts:886-894`: `users.sessions_valid_after` cuts off sessions issued prior to password change or remote logout.
   - `supabase/migrations/`: All 49 migrations enable RLS on tables. Migration 00047 hardened private data RLS; 00048 fixed `user_id` shadowing.
   - Database Connection: The API connects with `DATABASE_URL` as database owner, completely bypassing PostgreSQL RLS during production API requests.
   - Entity ID mismatch: `job_applications.candidate_id` references `profiles(id)`, while `verified_work_histories.candidate_id` references `users(id)`.

4. **AI Governance**:
   - `apps/api/src/server.ts:4770-4773, 6084-6089`: Enforces `assertAIAssistanceAllowed(activeSessions)` across `/api/v1/ai/assistant/query` and `/api/v1/ai/career-assistant/chat`. Throws `403 ASSESSMENT_AI_PROHIBITED`.
   - `apps/api/src/server.ts:6085`: `assessmentSessionsByCandidateId` is an in-memory Map; cleared on server restart.
   - `apps/api/src/server.ts:6097`: `const userTier: AITier = 'free';` hardcodes user tier to free for all users.
   - `apps/api/src/server.ts:6016`: `aiUsageMetersByUserAndDate` is an in-memory Map; resets consumed token count to 0 on restart.
   - `packages/domain/src/ai-gateway.ts:199-269`: `generateCareerAssistantResponse()` runs `executionMode: 'local_heuristic'`; zero remote LLM API calls exist in the codebase.
   - `apps/api/src/storage/account-store.ts:130-159`: `byo_ai_key` is encrypted via AES-256-GCM, but the decrypted key is never used to invoke any model provider.

5. **External Integrations & Staging**:
   - `apps/worker/src/mail-provider.ts:18-66`: Resend adapter sends POST to `https://api.resend.com/emails` with `Idempotency-Key: jobId` and separates retryable errors (408, 409, 429, 5xx) from `PermanentJobError`.
   - `apps/api/src/server.ts:12457, 12589`: API rejects email verification and reference request routes with 503 if Resend is unconfigured in staging/prod.
   - `apps/api/src/server.ts:10607-10613`: Paid plans reject with 503 unless `BILLING_MODE === 'simulated'`. No Stripe SDK integrated.
   - `apps/api/src/server.ts:10746-10755`: Webhooks require `x-talentsphere-signature: t=<timestamp>,v1=<hmac>` using `BILLING_WEBHOOK_SECRET` with 300s replay tolerance and constant-time check.
   - `deploy/oracle/compose.yaml:3-17, 19-44`: `db` and `api` expose NO host ports, residing on `internal` network only. Caddy exposes 80/443.
   - `deploy/oracle/Dockerfile:11`: Copies unpruned build directory `/app` into runtime image.
   - `deploy/oracle/Caddyfile:7-13`: Routes `/api/*` to API; root `/health` falls through to static file handler.

---

## 2. Logic Chain

1. **Persistence Fragility (Observation 1 $\to$ Conclusion)**:
   Because only 54 of 274 routes persist to PostgreSQL via `PgCoreStore` and 220 routes mutate in-memory `Map`s, any process restart or deployment wipes all state for learning, coding arena submissions, assessments, interviews, reputation, bookmarks, and billing. Furthermore, because boot hydration loads all historical core entities into memory ($O(N)$), boot time and heap usage scale unsustainably with user growth. The PostgreSQL advisory lock (`718201, 1`) strictly prevents horizontal scaling beyond a single replica.
2. **Work-History Cryptographic Insecurities (Observation 2 $\to$ Conclusion)**:
   Because the corporate email verification challenge code is hashed with `sha256Hex(`${id}:${code}`)` where `id` is a public UUID, an attacker reading the `work_history_email_challenges` table faces an un-peppering search space of only $10^6$ combinations. A precomputed dictionary attack takes $<50\text{ms}$, defeating mailbox ownership verification. Additionally, because referee voucher tokens lack an `expiresAt` timestamp, emailed credentials remain indefinitely valid, exposing candidates to stale or compromised referee submissions.
3. **Auth & Identity Realities (Observation 3 $\to$ Conclusion)**:
   Password hashing meets modern security standards with automatic upward migration. Session revocation is durably backed in `revoked_sessions` and checked at runtime. However, because the Fastify API connects as the database superuser, PostgreSQL RLS is completely bypassed during production runtime; tenant security relies exclusively on Node.js application-layer guards. The divergent use of `user_id` vs `profile_id` creates architectural complexity and potential foreign key bugs.
4. **AI Governance Limitations (Observation 4 $\to$ Conclusion)**:
   Server-side AI prohibition during assessments is implemented, but relying on an in-memory session map creates a restart bypass vulnerability. Hardcoding `userTier = 'free'` penalizes paying subscribers. The AI subsystem is purely simulated via local heuristics; no real LLM capabilities or BYO key executions exist.
5. **Deployment & Integration Readiness (Observation 5 $\to$ Conclusion)**:
   Resend email integration is robust with proper idempotency and fail-closed gates. Stripe billing is simulated only. The Oracle ARM64 staging configuration provides good network segmentation (internal DB/API), but exhibits container image bloat and a Caddy routing flaw where `/health` is served by static files rather than reaching the API.

---

## 3. Caveats

1. **Supabase Client vs. Direct Fastify**: The audit focused on the Fastify API architecture. Direct client-side access via Supabase SDK was not audited as the repository does not deploy direct PostgREST client endpoints in staging.
2. **PostgreSQL Real Database Concurrency**: Concurrency tests (`tests/pg/concurrency.test.ts`) require a live PostgreSQL instance with `TEST_DATABASE_URL`; code-level review confirms guard clauses and transaction logic.
3. **No Caveats Regarding Audited Code**: All audited files, line numbers, and logic flows were directly inspected from local repository source files.

---

## 4. Conclusion

The TalentSphere architecture is sound at its core (ADR-015 transactional persistence, PBKDF2 floor, session revocation table, Resend idempotency), but requires immediate remediation before production launch:
1. **Critical P0**: Migrate high-value ephemeral modules (assessments, LMS progress, billing) to PostgreSQL to eliminate the 220-route data-loss exposure.
2. **High P1**: Replace plain SHA-256 in email verification with HMAC-SHA256 (`TOKEN_SECRET`) to prevent offline rainbow-table reversal, and add a 30-day expiration TTL to referee tokens.
3. **High P1**: Move active assessment session tracking to PostgreSQL to prevent `AI_PROHIBITED` bypasses across server restarts, and bind AI tier metering to actual user subscriptions.
4. **Medium P2**: Prune Dockerfile runtime layers (`pnpm prune --prod`) and fix Caddy reverse proxy routing for `/health`.

---

## 5. Verification Method

1. **Verify Route Durability Split**:
   ```powershell
   powershell -Command "(Select-String -Path 'apps/api/src/server.ts' -Pattern '^\s*app\.(get|post|put|patch|delete)\(').Count"
   # Output: 274 routes
   powershell -Command "(Select-String -Path 'apps/api/src/durability.ts' -Pattern '''(GET|POST|PUT|PATCH|DELETE) ').Count"
   # Output: 54 routes
   ```
2. **Verify Password Hashing & Session Revocation**:
   ```bash
   pnpm vitest run tests/security/session-sign-out.test.ts
   pnpm vitest run tests/security/core-authz.test.ts -t "Durability is stated"
   ```
3. **Verify Staging Docker Compose Model**:
   ```bash
   SITE_DOMAIN=staging.example.test ACME_EMAIL=ci@example.test POSTGRES_PASSWORD=secret TOKEN_SECRET=secret012345678901234567890123456789 docker compose -f deploy/oracle/compose.yaml config
   ```
4. **Invalidation Conditions**:
   - If `apps/api/src/server.ts` routes are rewritten to query SQL directly without in-memory Maps, the single-writer advisory lock constraint and boot hydration scaling risks are invalidated.
   - If `TOKEN_SECRET` is added to `sha256Hex` in `verify-email`, the rainbow-table vulnerability is invalidated.
