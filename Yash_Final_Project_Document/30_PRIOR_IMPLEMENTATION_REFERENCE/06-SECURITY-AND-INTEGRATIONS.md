# 06 - Security and Integrations

Canonical home for: authentication and sessions, authorization, tenancy and RLS, secrets rules, rate limiting/CORS/headers, input security, data protection and privacy, Stripe billing architecture, email, the AI scaffold, other integrations, and the threat and gap register. Feature behaviour, roles and state machines are in [04-FEATURES-AND-WORKFLOWS.md](04-FEATURES-AND-WORKFLOWS.md). Plan prices and limits are in [`docs/PRICING.md`](../31_LEGACY_ARCHIVE/docs/PRICING.md) and are not repeated.

Evidence basis: repository HEAD `40ee2de3`, read 2026-10-26. Labels map to the single status definition in [01-PRODUCT-REQUIREMENTS.md](01-PRODUCT-REQUIREMENTS.md) section 0.1: **Confirmed** = source read in this pass (Implemented-unverified, code-read; never Implemented-verified, which needs tests plus a recorded PG/browser pass); **Reproduced** = the command in section 2.1 was run in this pass; **Doc claim** = historical claim, unverified; **Not verified** = nothing was run. No deployed system, live Stripe or Brevo account, PostgreSQL instance or browser was exercised. This is not a security certification.

## 1. Architecture of trust (as built)

```
Browser (React SPA, token in localStorage)
  -> HTTPS (Caddy in deploy/oracle; TLS terminated there)
  -> Fastify API: request-id, writer-lease check, Helmet, CORS, rate limit
  -> per-handler: extractUser -> resolveSession -> role/ownership checks -> Zod parse -> domain rules
  -> persist() transaction (core) or dedicated store; background_jobs row for async effects
  -> PostgreSQL (API connects with its own DB role; RLS is not part of the request path)
Worker (separate process): claims background_jobs, sends email through the provider adapter
```

There is no global authentication middleware. Every protected handler calls `extractUser(req)` itself; "authenticated" is never enough for a record-by-id route (INVARIANT-014 in `ARCHITECTURE.md`), but compliance is per handler, so new routes must repeat the pattern.

## 2. Authentication and session

| Aspect | As built | Evidence |
|---|---|---|
| Identity provider | None external. Supabase Auth is not used. Accounts live in `public.users`. | Confirmed |
| Sign-up | Email + password, role `candidate` or `recruiter` only. Password 8 to 256 chars; no complexity, breach or common-password check. Email unique (case-insensitive). Rate limited per IP. | `RegisterInputSchema` |
| Password hash | PBKDF2-HMAC-SHA512, 210,000 iterations, 16-byte random salt, stored as `pbkdf2-sha512$<iter>$<salt>$<hash>`; legacy `salt:hash` (10,000 iterations) is verified and re-hashed on next login. Constant-time compare. Deployed environments refuse `PASSWORD_PBKDF2_ITERATIONS` below 210,000. | `packages/domain/src/auth.ts`, `env.ts` |
| Login | Unknown email runs a decoy hash so timing does not reveal account existence. Same error text for wrong email or password. Restricted (suspended/deactivated) accounts can sign in but are confined. | `server.ts` login |
| Token | Custom (not JWT): `base64url(JSON{userId,email,roles,issuedAt,expiresAt,sessionId}) . base64url(HMAC-SHA256)`. Default lifetime 24 h. No refresh token. | `createSessionToken` |
| Signing key | `TOKEN_SECRET` (min 32 chars) if set at module load; otherwise a random per-process key (no hardcoded fallback). Deployed environments refuse to start without it or with the published test secret (hash-matched). | `auth.ts`, `productionConfigProblems` |
| Per-request check | `resolveSession`: revoked `sessionId`; account must exist (durable mode); erased accounts denied; token issued before `users.sessions_valid_after` denied; restricted accounts limited to 12 routes; **current** roles from the account replace the token's roles. | Confirmed |
| Sign-out | `POST /auth/sign-out` stores `sessionId` in `revoked_sessions` until token expiry (migration 00046). Tokens minted before session ids existed cannot be singled out. | Confirmed |
| Password change / sign-out-others | Set `sessions_valid_after` to the start of the next second and return a fresh token. Password change also needs the current password and is rate limited per account. | Confirmed |
| Client storage | `talentsphere_token` and `talentsphere_user` in `localStorage` (readable by any script on the origin); one reason string in `sessionStorage`. Cleared on 401. No cookies, hence no CSRF surface. | `apps/web/src/lib/session.ts` |
| Memory mode | With `STORAGE=memory` (tests/dev; refused when deployed) a validly signed token for an unknown account keeps its signed claims. | `resolveSession` |
| Not present | Account email verification, password reset email, MFA, passkeys, OAuth/SSO, refresh rotation, device list, login history/alerts. | grep, audit F-01 |

### 2.1 Candidate defect: `.env` file does not supply `TOKEN_SECRET` to the session code (Reproduced)

`packages/domain/src/auth.ts` reads `process.env.TOKEN_SECRET` once, when the module is first loaded. `apps/api/src/index.ts` statically imports the server (which imports the domain package) and only afterwards calls `process.loadEnvFile('.env')` inside the module body. Reproduction (bash, from `packages/domain`, built `dist` present; no script file needed). The first command signs and verifies with the secret as a real environment variable (control, prints `true`); the second signs in a process whose secret comes only from a `.env` file loaded after the domain import, as `apps/api/src/index.ts` does, then verifies with the real variable (prints `false`):

```bash
S=0123456789abcdef0123456789abcdef0123456789
T=$(TOKEN_SECRET=$S node --input-type=module -e "import {createSessionToken as c} from './dist/auth.js'; console.log(c('u','e@x.y',['candidate']))")
TOKEN_SECRET=$S node --input-type=module -e "import {verifySessionToken as v} from './dist/auth.js'; console.log(v('$T')!==null)"
echo "TOKEN_SECRET=$S" > .env.probe
T=$(node --input-type=module -e "import {createSessionToken as c} from './dist/auth.js'; process.loadEnvFile('.env.probe'); console.log(c('u','e@x.y',['candidate']))"); rm .env.probe
TOKEN_SECRET=$S node --input-type=module -e "import {verifySessionToken as v} from './dist/auth.js'; console.log(v('$T')!==null)"
```

The secret above is a throwaway test string, not a real credential. Result when last run (2026-10-26, Windows Git Bash, Node 24): `true` then `false`. `validateServerEnv()` runs after the load and therefore reports the secret as present, so `productionConfigProblems` does not catch it. Effect: if a deployment supplies `TOKEN_SECRET` only through an `.env` file, every restart invalidates all sessions and replicas reject each other's tokens, silently. Deployments that inject real environment variables (Compose `environment`/`env_file`, a platform secret store) are not affected. The compiled `apps/api/dist/index.js` has the same order (import of `./server.js` first, `loadEnvFile` after); the full API entry was not started. The worker has the same load pattern but does not sign tokens.

## 3. Authorization model

Layers, in code order: (1) account state (`resolveSession`); (2) role check (`session.roles.includes(...)`, or domain `assert*` functions such as `assertPlatformAdmin`, `verifyEvidence`, `createJobPosting`); (3) resource relationship (owner of profile, member of the job's organization, participant in the thread, connected users, confirmed referee, course instructor); (4) privacy check for reads (`canViewProfile`, `canViewPortfolioProject`); (5) Zod validation of the body. Business rules live in `packages/domain` (INVARIANT-002), but several authorization decisions are written inline in `server.ts`.

The role matrix and per-feature behaviour are in 04 section 3. Route-by-route detail exists in `docs/system-model/06-route-authorization.md` (a second-pass review; some of its "open" rows are now fixed, see 04 section 8).

### Known authorization gaps (Confirmed unless noted)

| ID | Gap | Impact | Status |
|---|---|---|---|
| A-1 | Organization membership role is never read: any member (including a low-privilege one) can list a job's applicants, move applications, publish jobs, schedule interviews, use talent pools and job templates. | A single invited member has full hiring-team power. | Open; needs an owner decision on which org roles may act (CF-14, CF-45). |
| A-2 | `hiring_manager`, `service_account`, `institution_admin`, `verification_staff` have thin or no distinct enforcement; `hiring_manager` cannot create jobs. | Role names promise more than the code enforces. | Open |
| A-3 | `POST /gamification/claim-activity` lets any signed-in user award XP and badges for self-chosen references. | Gamification and leaderboard integrity. | Open (CF-31) |
| A-4 | `GET /activity/users/:userId/score` ignores the target's `showActivity` setting. | Privacy leak of activity scores. | Open (CF-34) |
| A-5 | Anonymous reads of aggregate feedback, salary benchmarks and company summaries, organization reputation and its reviews (reviewer ids). | Small-cohort inference; reviewer exposure. | Open (CF-36) |
| A-6 | Warm-intro path queries across the whole accepted-connection graph; connection requests have no per-user rate limit or block list. | Graph enumeration, harassment. | Open (CF-39) |
| A-7 | Moderation report/appeal targets are not validated for existence; moderation outcomes (suspensions) are recorded only in process memory. | Lost evidence for a sanction after restart. | Open |
| A-8 | `GET /internal/worker-jobs` is unauthenticated in `development` and `test` and exposes job payloads including one-time codes and tokens. | Only reachable if a dev server is exposed on a network. | Low; returns 404 in staging/production. |
| A-9 | Maintenance mode blocks nothing. | Operational control is cosmetic. | Open (CF-42) |
| A-10 | First `platform_admin` requires direct SQL; there is no audited bootstrap. | Operational, not a vulnerability; documented in `docs/quality/OPERATIONS.md`. | Accepted |

Fixed in earlier passes and re-confirmed in code: unpublished course visibility, forecast generation role, alumni moderator self-grant, endorsement recipient check, employer-review verified flag, instructor-review verified flag, referral resume ownership, market-signal admin-only, interview routes scoped to the hiring team and assessed candidate, messaging start rule.

## 4. Tenancy and row-level security

| Topic | As built |
|---|---|
| Tenant model | Organization = tenant for hiring data. Isolation is enforced in handlers (`canManageJobs`, membership checks). The status-update route derives the actor's organization from memberships, never from the job (BR-12). There is no tenant id column filter at the database for API traffic. |
| RLS in migrations | Across the 55 migrations: 118 `ENABLE ROW LEVEL SECURITY` statements and 181 `CREATE POLICY` statements, written for Supabase `auth.uid()` (200 usages). |
| RLS in the request path | **Not used.** The API connects with its own database role (`DATABASE_URL`) and never sets JWT claims (`set_config`, `SET ROLE` absent from `apps/api/src/storage`). Policies would apply only to direct PostgREST/Supabase clients, which the product does not use. RLS is defence in depth for a future direct-access mode. |
| Tests | `tests/pg/private-data-rls.test.ts` and `tests/security/private-data-rls.test.ts` exercise two-account allow/deny under transaction-local roles (Doc claim; not run here). |
| Hardening migrations | 00047/00048 (messaging, notifications, preferences), 00053 (revoke client-role grants on billing tables), 00055 (certificate revocations). Billing tables are server-only. |
| Hosted Supabase | Blocked by design: migrations 00016, 00018, 00022, 00023 referenced `auth.users`; 00054 repoints foreign keys, a gated manual adapter exists, but the migration runner refuses hosted Supabase and applied state is unverified (CF-13). |
| Single writer | The API takes a session advisory lock (`pg_try_advisory_lock(718201,1)`) and hydrates core tables into in-process Maps at boot. Reads come from the Maps (ADR-015). If the lock's database session is lost, every request returns 503. Consequence: a second API instance cannot start against the same database, and SQL changes made outside the API are invisible until restart. |

## 5. Secrets handling rules

Rules (from `AGENTS.md`, `CLAUDE.md` and the code): never commit secrets; never print them; documentation lists variable **names** only; browser code receives no server variables.

| Class | Names | Where read | Notes |
|---|---|---|---|
| Session/signing | `TOKEN_SECRET` | domain `auth.ts` (module load), config | See 2.1. |
| Database | `DATABASE_URL`, `DIRECT_URL`, `STORAGE`, `SUPABASE_PROJECT_REF` | storage, config, scripts | Deployed refuses the local default DSN; with a project ref the URL must match and use `sslmode=verify-full`. |
| Stripe | `BILLING_MODE`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, six `STRIPE_PRICE_*` ids | `stripe-gateway.ts`, `server.ts` | Secret key must match `sk_/rk_` + `test|live`; production refuses a test key with `BILLING_MODE=stripe`. |
| Generic webhook | `BILLING_WEBHOOK_SECRET` | `server.ts` | Used only by `/billing/webhook`; unset = endpoint refuses. |
| Email | `EMAIL_PROVIDER`, `BREVO_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO` | worker `email/config.ts` (single reader), config | |
| BYO AI key encryption | `BYO_AI_KEY_ENCRYPTION_KEY` (64 hex) | `account-store.ts` | AES-256-GCM per value; required to save a BYO key in `pg` mode. Rotation not implemented. |
| Web build | `VITE_PRIVACY_EMAIL`, `VITE_SECURITY_EMAIL` | build time | Public by nature. |
| Defined but unused | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS_URL`, `SUPABASE_BUCKET_*`, `AI_ENABLED`, `AI_FREE_USER_PAID_INFERENCE`, `AI_CLOUD_FALLBACK_ENABLED`, `AI_REQUEST_TIMEOUT_MS` | schema only | No code reads them. The `AI_*` flags use `z.coerce.boolean()`, so the string `false` parses as true. |

Controls that exist: deployed startup refusals (`productionConfigProblems`: missing or published test `TOKEN_SECRET`, `STORAGE=memory`, weak PBKDF2 setting, default DSN, localhost CORS and simulated billing in production, Stripe misconfiguration, non-HTTPS `APP_URL` with email/Stripe); CI scan that fails if sentinel values of five server variables appear in the web bundle (`scripts/check-client-secrets.mjs`, not extended with Stripe/Brevo patterns); `.env` and `.env.local` are git-ignored (only `.env.example` files are tracked); logger redaction of `authorization`, `password`, `token`, `accessToken` (API) plus `apiKey`, `secret`, `refreshToken` in the shared logger; Stripe/Brevo error text is not echoed to clients. Weak points: `test-secrets.mjs` publishes test secrets in the repository (blocked only by hash match in deployed mode); the dev outbox logs email bodies including one-time codes at warn level; queued jobs hold the code/token in plaintext until a terminal transition strips the keys `token` and `code`; CI has no dependency audit, SAST or history secret scan (workflows: `ci.yml`, `hosted-supabase-audit.yml`, `oracle-staging.yml`).

## 6. Rate limiting, CORS, headers, transport

| Control | Setting | Notes |
|---|---|---|
| Global limiter | `RATE_LIMIT_MAX_REQUESTS` default 300 per `RATE_LIMIT_WINDOW_MS` default 60 s; key `user:<id>` for a valid token, else `ip:<addr>`. Forged tokens fall back to IP. | Behind a proxy set `TRUST_PROXY` or all anonymous clients share one bucket. In-process counters: reset on restart, not shared across instances. |
| Login | `AUTH_RATE_LIMIT_MAX_REQUESTS` default 10 per 15 min, key IP + target email, applied in `preHandler` | |
| Register | 2x the auth limit per IP per 15 min | |
| Password change | auth limit per account per 15 min | |
| Health | exempt | |
| Stripe webhook | subject to the global limit (no exemption) | CF-30. |
| Per-feature limits | work-email code: 5 attempts, 15 min; salary reports 5 per day; free AI chat quota by plan; XP 200 per day | |
| CORS | `CORS_ALLOWED_ORIGINS` comma list (default `http://localhost:5173`), `credentials: true` | Production refuses a localhost origin. Credentials are unnecessary (bearer header) but allowed. |
| Helmet | Defaults on every API response (HSTS, nosniff, frame options, etc.); `contentSecurityPolicy` enabled only when `NODE_ENV` is staging or production | The API returns JSON, so CSP there protects little. |
| Static site headers | `deploy/oracle/Caddyfile` sets `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options DENY` only. **No CSP and no HSTS for the SPA.** | With tokens in `localStorage`, an XSS would expose sessions. React escapes output by default; no CSP backstop exists. |
| Request ids | A client-supplied `x-request-id` is accepted as the request id and echoed. | Length/charset not validated; low risk log forgery. |
| Body size | Fastify default (1 MiB); no explicit override found. | Not tuned per route. |
| Error envelope | `{error:{code,message,request_id,details?}}`; deployed 500s are masked; plugin 4xx pass through. | |
| Idempotency | Client keys on checkout, work-history create and reference request; no general `Idempotency-Key` layer. | |

## 7. Input security

| Control | Status |
|---|---|
| Zod schemas at the boundary (`packages/contracts`), including enums for roles | Implemented. Schemas are on request bodies and many queries. |
| Parameterized SQL in stores (`pg` with placeholders) | Implemented by pattern; not exhaustively audited here. Stores are small and explicit. |
| `packages/domain/src/input-security.ts` (SQL-injection patterns, XSS payload check, `escapeHtml`, SSRF-safe `validateOutboundUrl` with private-range block) | **Implemented but not wired into any API, worker or web code path**; only `tests/security/injection-defenses.test.ts` imports it. Treat as unused. The pattern list would also reject legitimate text (for example `#`). |
| Prompt firewall for AI chat | Implemented in `sanitizePromptInput`: 2000-char cap, injection-phrase rejection, HTML escape. Not applied to `POST /ai/assistant/query`. |
| Content scan | `scanContentForAbuse` (compute-only, anonymous route). |
| File uploads | None exist (no multipart handler, no storage bucket use). Avatars, resume files and attachments are not supported. |
| Outbound requests | Only Stripe SDK and Brevo REST with fixed hosts; no user-supplied URLs fetched. |
| Email content | Candidate free text is flattened and capped at 80 characters before plain-text rendering (header/phrase injection defence). |
| Output | React default escaping; no `dangerouslySetInnerHTML` audit performed in this pass (Not verified). |
| CSRF | Not applicable to bearer-header auth; becomes mandatory if cookies are adopted (the target design adds them). |

## 8. Data protection and privacy as implemented

| Area | As built |
|---|---|
| At rest | PostgreSQL; managed encryption depends on hosting (not established). BYO AI keys encrypted with AES-256-GCM in `pg` mode; settings responses mask the key. |
| Verification credentials | Email code and referee token are stored only as SHA-256 hashes (`sha256("<historyId>:<code>")` for codes; plain SHA-256 for tokens) and never returned to the person verified. A 6-digit code hashed without a secret can be brute-forced offline by anyone who reads the table; mitigated by 15-minute expiry and deletion on success. Referee token travels in the URL **fragment** (`#token=`), is sent to the API in the `x-reference-token` header, and expires in 30 days. |
| Queue payloads | Plaintext code/token until a terminal job transition; terminal records purged after 7 days (opportunistic, every 100 dispatches). |
| Notifications | Written without candidate names or message text so they outlive erasure safely. |
| Profile visibility | Four levels enforced on profile, evidence and work-history reads; an organization the candidate applied to sees their work history regardless. |
| Aggregates | k-anonymity style floors: salary benchmark 5 and company summary 3 reports, career benchmarks 20 distinct people, learning impact 30, feedback insights 10. These are suppression thresholds, not differential privacy. The Privacy page's claims of Laplace noise and 30-day purge are not backed by code found (CF-26; unverified). |
| Export | `POST /settings/export` compiles a JSON snapshot of durable and in-memory records (excludes credential hashes and reference token hashes) and returns it inline; a record row is kept. No CSV. Not a complete statutory export (the response says so). |
| Erasure | See 04 section 5.7. No grace-period enforcement on `execute`. Anonymises account and profile; deletes work history, evidence, notifications, messages; withdraws open applications; deletes the Stripe customer; clears many in-memory stores. Retained by design/gap: reviews and other parties' chat history; durable stores for modules that are memory-only do not exist, so those are cleared only while the process lives; backups are untouched; no certification of full erasure. |
| Consent | Telemetry setting honoured by analytics events. The AI data-consent setting is stored but enforced nowhere. Recording consent exists inside the interview flow. |
| Retention | No scheduled retention jobs, only the job-queue purge above. Maintenance and retention policies are not implemented. |
| Logging | pino JSON logs with request ids; 4xx logged at info; no PII scrubbing beyond the redaction list; `auth.*` and other business events are pushed to an **in-memory array that nothing reads** (44 call sites in `server.ts`, no consumer), so only admin-initiated actions are durably audited (`admin_audit_logs`). |
| Legal | Privacy and Terms pages are unapproved drafts. No compliance regime is claimed. The Yash blueprint maps candidate regimes for counsel and states applicability is undetermined. |

## 9. Stripe billing architecture

| Aspect | As built |
|---|---|
| Modes | `BILLING_MODE=disabled` (default: paid plans refused with 503 `SERVICE_UNAVAILABLE`), `simulated` (activates paid plans without payment, development/test only, refused in production config), `stripe`. The three Stripe routes always exist and refuse when Stripe is off. |
| Source of truth | Stripe. A paid tier exists only after a signed subscription event for a price id in the server catalog with status `active` or `trialing`. The Checkout success page grants nothing. `POST /billing/subscribe` refuses paid plans in stripe mode and refuses downgrading to free while a paid Stripe subscription is live. |
| Catalog | `buildPriceCatalog` from six `STRIPE_PRICE_*` env ids; the client names plan and cycle only; ids must be distinct. Plan/limit data: `docs/PRICING.md`. |
| Checkout | `POST /billing/checkout`: plan must match the account type (candidate vs recruiter/hiring_manager); refuses if a live paid subscription exists; creates or reuses a Stripe customer (idempotency key `customer:<userId>`); creates a Checkout session with an idempotency key including plan, cycle and a client key. |
| Portal | `POST /billing/portal` returns a Stripe-hosted portal URL for the account's customer. |
| Webhook | `POST /billing/stripe-webhook` in an isolated scope that keeps the raw body; `stripe.webhooks.constructEvent` with the signing secret (5-minute tolerance); missing/invalid = 401. Handled: `checkout.session.completed` (links customer only), `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`. Everything else is acknowledged as ignored. |
| Idempotency and ordering | Each event and its state change commit in one transaction keyed by `(provider, event id)`; duplicates are no-ops; a snapshot older than the newest applied one is stale; a late event for a superseded subscription is ignored; a customer already linked to another account is ignored (avoids endless Stripe retries). |
| Refunds | A full refund of the charge that paid the current period of the subscription that grants access cancels it (resolved through the payment intent to the subscription); partial refunds and other charges do not. Disputes and voided invoices are not handled. |
| Entitlements | `effectiveEntitlements` from the stored subscription; elapsed scheduled cancellations settled on read; free tier when absent or not active/trialing. Enforced today: AI chat quota, recruiter active-job limit. Advertised but not gated: see `docs/PRICING.md`. |
| Generic webhook | `POST /billing/webhook`: `x-talentsphere-signature: t=<unix>,v1=<hex HMAC-SHA256(secret, "t.rawBody")>`, 300 s tolerance, constant-time compare, durable replay detection by idempotency key. It only **records** an event; it changes no subscription. Refuses everything without `BILLING_WEBHOOK_SECRET`. |
| Erasure interplay | Deletes the Stripe customer first; a missing customer counts as done; a Stripe outage stops erasure before anything else changes. |
| Data sent to Stripe | Account email and user id (metadata); card data never touches this API. |
| Storage | `subscriptions`, `invoices`, `entitlements`, `stripe_customers`, `billing_events` (migrations 00014, 00052, 00053); server-only. |
| Status | Test-mode products/prices were created 2026-10-24 per `docs/PRICING.md`; **no checkout, payment or webhook delivery was exercised**; the endpoint is unregistered until a public HTTPS URL exists. Concurrent Checkout sessions can both be paid and the second is ignored but billed (CF-30). |

## 10. Email provider (Brevo) and worker

| Aspect | As built |
|---|---|
| Use | Two transactional kinds only: `work_history.email_verification` (code) and `reference.request` (link). In-app notifications are not emailed; digests are not sent. |
| Layering | Worker handlers name a template + variables; `email/templates.ts` validates required variables and renders plain text; `email/service.ts` validates config, address and idempotency key, and picks the provider; `email/brevo.ts` is the only Brevo code (native `fetch` to the Brevo transactional endpoint, `api-key` header, 20 s timeout, error text dropped to avoid echoing bodies). `email/config.ts` is the single env reader. Adding a provider: new adapter + `buildProvider` case + `SUPPORTED_EMAIL_PROVIDERS` entry. |
| Modes | `EMAIL_PROVIDER=none` (default): development writes a labelled dev-outbox log line (body included); any other environment sends nothing, and deployed API routes refuse to start verification or reference flows with 503 so users are not told a code was sent. `brevo`: needs `BREVO_API_KEY`, a provider-verified `EMAIL_FROM`, and an HTTPS `APP_URL` when deployed. Unknown provider names stop the worker. |
| Failure handling | Provider failures map to retryable/non-retryable `EmailError`; permanent errors dead-letter without retry; transient ones retry up to 3 attempts. Brevo has no idempotency header; the job id is attached as `X-TS-Idempotency-Key` for tracing only, so an uncertain timeout can duplicate an email. |
| Gaps | Provider acceptance is not mailbox delivery; no bounce/complaint webhook; SPF/DKIM/DMARC and sender verification are outside the repo; live delivery never exercised. |

## 11. AI scaffold

| Aspect | As built |
|---|---|
| Engine | `generateCareerAssistantResponse`: keyword-selected canned guidance (`executionMode: local_heuristic`, model label `talentsphere-career-v1`). The type allows `cloud_provider` but no provider code, SDK or key use exists. |
| Routes | `/ai/career-assistant/chat` (conversation ownership, prompt firewall, plan-derived daily quota, usage meter, event dispatch), `/ai/conversations*`, `/ai/usage`, `/ai/assistant/query` (echo; quota skipped). All state is in memory. |
| Assessment rule | `assertAIAssistanceAllowed` rejects both AI routes with `ASSESSMENT_AI_PROHIBITED` (403) while the caller has an `in_progress` session with policy `AI_PROHIBITED`. Interview AI feedback is a separate advisory generator. |
| Quota | Derived from entitlements (free 5 requests/day, 5,000 tokens; see `docs/PRICING.md`); exceeding returns 402. The usage meter is per process per day. |
| BYO key | A user can store a key in settings; it is encrypted at rest and never used. |
| Not enforced | AI data-consent setting; `AI_*` environment flags; any rule for sending data to an external model (none is sent). |
| Rule to keep | Any real provider integration needs an explicit owner decision (INVARIANT-011) and must pass the assessment prohibition, quota, consent and context-minimization steps listed in `docs/quality/SECURITY.md` section 10. |

## 12. Other integrations and status

| Integration | Status | Notes |
|---|---|---|
| PostgreSQL via `pg` | Implemented | Default storage; `STORAGE=memory` for tests. Custom migration runner `pnpm db:migrate`; `supabase db push` must not be used. |
| Stripe | Implemented, unverified live | Section 9. |
| Brevo email | Implemented, unverified live | Section 10. |
| Supabase (Auth, Storage, Realtime, Queues), hosted DB | Not used / blocked | Only SQL history and a gated adapter; env keys unused. |
| Reverse proxy / hosting | Assets exist, deployment unverified | `deploy/oracle` (Caddy, Compose, backup, restore verification scripts), `deploy/coolify`. Doc 08 owns operations. |
| External LLM, OAuth/SSO, LinkedIn, Mux/video, push/SMS, object storage, analytics SaaS | Not implemented | Planned or Proposed-only. |
| Webhooks out to customers, public API keys | Not implemented | |
| Reticle (verification tooling) | Dev tooling, not a runtime integration | Required by `CLAUDE.md` for user-visible changes. |

## 13. Threat and gap register

Severity is a judgement for a small beta with one API writer. "Status" is the state in code as read in this pass.

| ID | Threat / gap | Sev | Status | Mitigation present | Needed |
|---|---|---|---|---|---|
| T-01 | `.env`-only `TOKEN_SECRET` ignored by session code (2.1) | High if deployed that way | Reproduced (command in 2.1; full API entry not started) | Compose env injection avoids it | Load env before importing the domain package, or read the secret lazily; add a startup self-check that the signing key is the configured one. Protected build/source change: ask owner. |
| T-02 | XSS can steal bearer tokens from `localStorage`; no CSP or HSTS on the SPA | High | Confirmed | React escaping | CSP and HSTS in the static host; consider cookie sessions (target design) |
| T-03 | Course completion mints authority-verified evidence without an assessment (04 G-03) | High for trust claims | Confirmed Open | Instructor cannot enroll in own course | Final-assessment gate or lower evidence level; separate issuer identity |
| T-04 | Certificate revocation leaves linked evidence verified and publicly verifiable | Medium | Confirmed Open | none | Cascade revocation (owner decision) |
| T-05 | Any org member acts as hiring team (A-1) | Medium | Confirmed Open | Membership required | Role matrix for org roles |
| T-06 | Erasure `execute` skips the grace period; UI calls it directly | Medium | Confirmed Open | Resumable, durable marker | Enforce grace or change the promise |
| T-07 | Non-admin security events are not durably audited (in-memory write-only array); moderation sanctions live in memory | Medium | Confirmed | Admin actions audited durably | Persist audit via the existing store or `packages/observability` sink |
| T-08 | Long-tail modules lose data on restart; response header says so | Medium | Confirmed | `x-talentsphere-durability` header | Persist per module (scoped projects) |
| T-09 | `POST /ai/assistant/query` bypasses quota; consent unenforced | Low now (no model), High if a provider is added | Confirmed Open | Assessment prohibition applies | Quota and consent before any provider |
| T-10 | Email code stored as unsalted SHA-256; queued payload plaintext; dev outbox logs the code | Low | Confirmed | Expiry, single use, attempt cap, payload strip on terminal state | Use HMAC with a server key |
| T-11 | In-process rate limiter (reset on restart, per instance) | Low (single writer) | Confirmed | Auth limits | Shared store if more than one instance is ever allowed |
| T-12 | Stripe webhook shares the global limiter; concurrent Checkout double charge; disputes unhandled | Medium (money) | Confirmed / doc claim | Idempotent event ledger | Exempt webhook from limiter; decide entitlement policy (CF-30) |
| T-13 | Unwired `input-security` module may give a false sense of coverage | Low | Confirmed | Zod + parameterized SQL | Remove or wire; do not cite as a control |
| T-14 | Corporate-email proof can pass without an org website (04 G-13) | Medium for badge trust | Confirmed Open | Code to the mailbox, webmail/disposable block | Require a company domain |
| T-15 | `AI_*` flags parse the string `false` as true; Supabase keys unused | Low | Confirmed | flags unused | Fix parser when first used |
| T-16 | Job create vs publish plan-limit race (04 G-12) | Low | Open | Status route is locked | Lock create path |
| T-17 | Single-writer read model: a second API instance or an out-of-band SQL edit yields stale reads | Medium (ops) | Confirmed by design | Advisory lock, fail-closed 503 | Move reads to SQL before scaling |
| T-18 | No dependency audit, SAST or secret-history scanning in CI | Medium (supply chain) | Confirmed | Bundle sentinel scan | Add audit and secret scan (workflow files are protected: ask) |
| T-19 | Worker timeout does not abort the handler promise | Low | Doc claim, consistent with `claim.ts` | Lease-fit check, fenced acknowledgements | Abort signal in handlers |
| T-20 | Brevo has no idempotency: duplicate emails possible after uncertain timeout | Low | Confirmed | Job id header for tracing | Accept or add provider-side dedupe |
| T-21 | Privacy page makes unbacked claims (noise, 30-day purge) | Medium (legal) | Doc claim, unverified | Pages marked draft | Verify or remove |
| T-22 | PBKDF2 rather than a memory-hard hash; no breached-password check; no MFA | Medium | Confirmed | 210k iterations | Target design adopts Argon2id, passkeys, TOTP |

## 14. Target security design (proposed)

Not implemented. The greenfield blueprint in `Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/` (read for pointers only, status Under Review, all `[TARGET]`) proposes a different system: passkeys and Argon2id passwords, optional TOTP required for privileged roles, 15-minute signed access tokens in `__Host-` cookies with rotating opaque refresh tokens and a CSRF token, key rotation, a strict CSP with a separate user-content domain, durable edge-first authentication throttles, consent read from the primary (no consent cache), operational telemetry separated from consented analytics, and a compliance applicability matrix that explicitly defers every legal conclusion to counsel. Start at [`INDEX.md`](../../Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/INDEX.md), then `SECURITY_ARCHITECTURE.md`, `SECURITY_REV2.md` (supersedes parts), `THREAT_MODEL.md`, `PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md`, `COMPLIANCE_APPLICABILITY_MATRIX.md`. Its independent reviews (`27_INDEPENDENT_REVIEWS/REVIEW_FIX_STATUS.md`) record open items, including no consolidated OPEN register, an undecided telemetry legal basis (OPEN-08), an undecided user-content domain (OPEN-B57), and REV2 fixes that were not independently re-read. Adopting any of it is a security-architecture decision that `AGENTS.md` reserves for the owner.

## 15. Security claims in other documents that do not match code

| Document and claim | Reality |
|---|---|
| `docs/quality/SECURITY.md` section 9: refund/dispute events "acknowledged but not acted on" | Full refunds of the current period's charge cancel the subscription; disputes remain unhandled. |
| `ARCHITECTURE.md` section 20 and SECURITY.md header: challenge evaluator can return simulated `passed`/100 | Fixed 2026-10-24; returns `submitted`/0 (04 G-01). |
| `ARCHITECTURE.md` section 24 R-4 and CF-35: AI tier hardcoded free | Quota follows the stored subscription (04 G-06). |
| `ARCHITECTURE.md` section 18: batch waiting burns later leases; completion not fenced | Fixed (04 G-18). |
| System model 06: free AI quota 20 requests/day | 5 per day per `billing.ts`. |
| SECURITY.md section 8: "At rest in the job queue: every terminal transition strips token and code" | Code defines `SECRET_PAYLOAD_KEYS = ['token','code']`; consistent, but queued and running jobs and the dev outbox log still carry them. |
| `ARCHITECTURE.md` INVARIANT-006: tokens signed with `TOKEN_SECRET` or a random key | True, except that an `.env` file does not reach the signer (2.1). |

## 16. Policy content carried from `docs/quality/SECURITY.md` (requirements and targets, not built behaviour)

These items are the parts of `SECURITY.md` (sections 2, 4 boundaries, 5, 6, 7, 10, 12, 13, 14) that sections 1 to 15 above do not restate. They are requirements. Where the code already meets one, the section above says so; the rest are Planned-approved or open.

### 16.1 Intended request path and authorization chain

Browser > HTTPS > authentication > session verification > authorization > purpose/privacy policy > domain validation > database constraints and RLS > audit. Authorization is meant to follow identity > role > permission > resource ownership > tenant > purpose > policy, and never trusts client-supplied role or tenant ids. Built: session verification, role and ownership checks, domain validation, database constraints. Not built as designed: purpose/privacy policy as a distinct layer, RLS in the request path (section 4), and durable audit of non-admin events (section 8).

### 16.2 Threat model (primary threats named by the project)

Broken object-level authorization; broken function-level authorization; account or session compromise; tenant isolation failure; SSRF; XSS and CSRF; unsafe file upload; webhook replay; rate-limit bypass; secret leakage; supply-chain compromise; prompt injection; AI data leakage; assessment cheating; billing replay or double effects. Mapping to this document: object and function level authorization (sections 3, A-1 to A-9), session compromise (2, T-01, T-02), tenant isolation (4), SSRF (no user-supplied outbound URL exists; the unwired helper is T-13), XSS (T-02), CSRF (not applicable to bearer headers), upload (no upload feature, 16.4), webhook replay (9), rate limits (6, T-11), secrets (5), supply chain (T-18), prompt injection (11), AI leakage (no model call exists), assessment cheating (04 G-01, G-02), billing replay (9). A fuller STRIDE-style model exists only in the Proposed-only blueprint (section 14).

### 16.3 Sensitive-data classes

Intended classes: PUBLIC, INTERNAL, PRIVATE, SENSITIVE, RESTRICTED, NEVER-EXTERNAL. Assessment answer keys, provider secrets, access tokens and security internals are never to be sent to an external AI. Built: hidden test cases are stripped from candidate views of challenges and interviews; no external AI call exists. No data-class labelling exists in code or schema.

### 16.4 File security pipeline (target; no upload feature exists)

Intended: upload > validate size and type > MIME and content inspection > malware scan where needed > isolated storage > access policy > signed delivery > lifecycle. The Supabase storage bucket names in the environment schema are unused. Any future upload feature must implement this whole chain before shipping.

### 16.5 API security checklist (SECURITY.md section 8)

Zod validation at the boundary (built, section 7); allow-listed filters and sorts (partly; `PaginationQuerySchema` exists but no route uses it); rate limiting (built, section 6); idempotency (only on checkout, work history, reference request); CSRF strategy aligned to auth transport (n/a for bearer headers); secure headers (API built, SPA not); CORS allow-list (built); no stack traces to clients (built in deployed environments).

### 16.6 AI security sequence (SECURITY.md section 10)

Before any provider call: authenticate; resolve entitlement; classify data; inspect assessment context; evaluate policy; minimize context; invoke provider; validate output; record provenance. Built for chat: authenticate, entitlement and quota, assessment context, prompt firewall, local response with provenance fields. Not built: data classification, consent check, minimization, output validation (no provider exists). Assessment rule: AI restrictions are inherited by every AI route (`ASSESSMENT_AI_PROHIBITED`); protected answers are never returned to clients.

### 16.7 Deployment safety boundaries recorded 2026-10-18

Interview code execution is a development/test simulation, not a sandbox; the API returns `SERVICE_UNAVAILABLE` in staging and production until a real isolated executor and abuse controls exist. Work-history badge scoring counts only independently endorsed skills, not skills the candidate typed; changing that trust policy needs owner review. Public privacy and security inbox addresses are set only through build-time `VITE_PRIVACY_EMAIL` / `VITE_SECURITY_EMAIL` after ownership and monitoring are verified; no response SLA is advertised; the legal pages remain unapproved drafts and pass no launch gate merely because addresses exist. Do not enable direct database access to clients just because the RLS tests pass: verify production grants, every additional permissive policy, function ownership and the real identity mapping first.

### 16.8 Testing baseline

Verification frameworks named by the project: OWASP ASVS 5.0 and the OWASP API Security Top 10. Existing security tests (names only, not run here): `tests/security/api-security.test.ts` (signing key, signed webhook), `core-authz.test.ts` (account state, object-level checks), `session-sign-out.test.ts`, `injection-defenses.test.ts` (the unwired module), `private-data-rls.test.ts`, plus `tests/pg/*` for concurrency, billing and RLS. No ASVS conformance statement exists.

### 16.9 Incident response outline

Detect > contain > preserve > assess > eradicate > recover > notify > learn. Only the outline exists in the repository; there is no runbook for key rotation, token revocation of all sessions (the practical lever today is changing `TOKEN_SECRET`, which invalidates every token), or Stripe/Brevo credential rotation. Operational procedures are owned by the testing and operations document.

### 16.10 Privacy programme statement

Privacy controls are to be implemented against applicable legal requirements. For India the project intends to map the programme to the DPDP Act and Rules and their staged commencement; no legal compliance is claimed without implementation evidence, and none exists here. The blueprint's compliance matrix marks every regime as applicability to be confirmed by counsel.
