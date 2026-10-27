# TalentSphere — SECURITY.md v6.0

> **Evidence scope (2026-10-21):** security objectives and checklists below are requirements, not certification. Implementation notes describe source behavior; referenced PostgreSQL/browser results remain historical unless the current audit records a fresh run. See [current findings](../reports/FEATURE_STATUS_2026-10-21.md), especially D-01 assessment simulation, D-02 worker duplicates, D-03 erasure recovery and D-07 scanner false positives.

The deployed interview-execution refusal below does not cover challenge submissions:
that separate evaluator can award simulated success without executing code. Erasure
also spans several stores after account deactivation; complete cleanup and recovery
are not established. Neither behavior meets full security/privacy acceptance. LMS certificate issuance also omits the BR-048 final-assessment gate (audit D-09): lesson completion alone currently produces authority-verified evidence.

## 1. Security Objective

Protect identity, private career data, evidence, assessments, tenant data, financial state, credentials, provider credentials and audit history.

## 2. Security Architecture

```text
Browser
→ HTTPS
→ AuthN
→ Session verification
→ Authorization
→ Purpose/privacy policy
→ Domain validation
→ DB constraints + RLS
→ Audit
```

## 3. Authorization

Use:
`Identity → Role → Permission → Resource ownership → Tenant → Purpose → Policy`.

Never trust client role/tenant IDs.

## 4. Supabase Security

RLS is required on exposed tables and should be tested with allow/deny assertions. Supabase's current guidance also distinguishes table grants from RLS policies, so both must be designed together. [Supabase Data API security](https://supabase.com/docs/guides/api/securing-your-api)

### Private-data RLS corrections (migrations 00047–00048)

The API currently uses its own Fastify sessions and authorizes in code; its
privileged database connection bypasses RLS. Database policies are a
defense-in-depth boundary for future direct JWT/PostgREST access, **not** a
substitute for API authorization.

- Migration 00047 corrects profile-id versus auth-user-id comparisons for
  messaging and notifications. It removes direct participant insertion,
  constrains message authorship and notification update columns, and replaces
  a recursive thread participant policy with a fixed-search-path,
  `SECURITY DEFINER` membership helper.
- Real PostgreSQL two-account tests exposed a second defect: an unqualified
  `user_id` in the notification-preference subquery bound to the inner
  `profiles` table, denying legitimate owners. Forward-only migration 00048
  explicitly uses `notification_preferences.user_id`.
- `tests/pg/private-data-rls.test.ts` runs under transaction-local
  `authenticated` role and JWT subject. It checks owner reads/writes,
  cross-account denials, absent-claim denials, membership insertion,
  sender impersonation, and notification field restrictions.
- The CI build checks synthetic server-secret values are absent from the
  shipped web bundle. This is **not** a substitute for scanning real
  deployment assets, repository history, or rotating compromised credentials.

Do not enable direct database access solely because these tests pass. Verify
production grants, all additional permissive policies, function ownership,
and the actual identity mapping in the deployed Supabase project first.

### Deployment safety boundaries (2026-10-18)

- Automated interview code execution is a development/test **simulation**, not
  a sandbox. The API refuses this endpoint with `SERVICE_UNAVAILABLE` in
  staging/production until a real isolated executor and abuse controls exist.
- Work-history badge scoring counts independently endorsed skills only, not
  skills entered by a candidate; any change to this trust policy requires
  owner review before merge.
- Public privacy/security inboxes are configured via build-time
  `VITE_PRIVACY_EMAIL`/`VITE_SECURITY_EMAIL` only after ownership and
  monitoring have been verified. No unsupported response SLA is advertised.
  The legal pages remain **unapproved drafts** and do not pass a launch gate
  merely because addresses are configured.

## 5. Threat Model

Primary threats:
- broken object-level authorization;
- broken function-level authorization;
- account/session compromise;
- tenant isolation failure;
- SSRF;
- XSS/CSRF;
- unsafe file upload;
- webhook replay;
- rate-limit bypass;
- secret leakage;
- supply-chain compromise;
- prompt injection;
- AI data leakage;
- assessment cheating;
- billing replay/double effects.

## 6. Sensitive Data

```text
PUBLIC
INTERNAL
PRIVATE
SENSITIVE
RESTRICTED
NEVER-EXTERNAL
```

Assessment answer keys, provider secrets, access tokens and security internals are never sent to external AI.

## 7. File Security

```text
UPLOAD
→ validate size/type
→ MIME/content inspection
→ malware scan where needed
→ isolated storage
→ access policy
→ signed delivery
→ lifecycle
```

## 8. API Security

- Zod validation at boundary.
- Allow-listed filters/sorts.
- Rate limiting.
- Idempotency.
- CSRF strategy aligned to auth transport.
- Secure headers.
- CORS allow-list.
- No stack traces to clients.

### Session signing key

Session tokens are `base64url(payload).base64url(HMAC-SHA256(payload))`, where the
payload carries `userId`, `email`, and `roles`. The signature proves who the caller was
when the token was issued; for any account the API knows, `resolveSession`
(`apps/api/src/server.ts`) then applies the account's **current** roles and status on
every request (see "Account state" below). With durable storage (`STORAGE=pg`, required
in production) a token for an identity with no account row is refused ("This account no
longer exists."). Memory storage, used only in development and tests, still lets such
tokens keep their signed claims — the test suites mint platform-admin tokens that way —
so the signing key remains a full privilege boundary there.

- The key is `process.env.TOKEN_SECRET` and **must be at least 32 characters** in any
  deployed environment. `validateServerEnv()` enforces the length when it is set.
- There is **no hardcoded fallback key**. If `TOKEN_SECRET` is unset, the domain layer
  generates a random per-process key, so tokens remain unforgeable but do not survive a
  restart. A committed constant would let anyone read a valid signing key out of the
  source tree and mint a `platform_admin` token.
- Generate a key with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- Regression coverage: `tests/security/api-security.test.ts`, describe block
  *"SEC: Session signing key is not a committed constant"*, asserts that a token signed
  with the former hardcoded literal and with other guessed secrets is rejected.
- Any component that mints tokens out of band (test harnesses, scripts) must set
  `TOKEN_SECRET` for the API process as well; see `test-secrets.mjs`.
- Deployed (`NODE_ENV=production` or `staging`), the API refuses to start without
  `TOKEN_SECRET`, with `STORAGE=memory` or with the local default `DATABASE_URL`;
  production also refuses localhost CORS and `BILLING_MODE=simulated` —
  `productionConfigProblems()` in `packages/config`. Both deployed environments send a
  Content-Security-Policy and hide internal error messages from clients (`isDeployed()`).

### Ending sessions

Tokens are stateless, so a session can only be ended by a rule the API checks on every
request. Changing a password (`POST /api/v1/auth/password`: current password required,
throttled per account like login) sets `users.sessions_valid_after`; `resolveSession`
refuses every token issued before it, and the response carries a fresh token so this
device stays signed in. Tokens record their issue time in whole seconds, so the cut-off
is the start of the next second — a token minted earlier in the same second is refused
too. Suspended accounts may change their password. User-record writes carry `base`, so a
concurrent login re-hash or moderation action computed from the old record cannot
restore the old password (`tests/pg/concurrency.test.ts`).

- **Sign out of other devices** (`POST /api/v1/auth/sign-out-others`, profile page) uses
  the same cut-off without changing the password; this device gets a fresh token.
  Allowed for suspended accounts.
- **Sign-out** ends this session on the server, not only in the browser (OWASP ASVS
  V3.3.1). Every token carries a random `sessionId`; `POST /api/v1/auth/sign-out` records
  it in `revoked_sessions` (migration 00046) until the token would have expired, and
  `resolveSession` refuses it on every route. Expired rows are pruned on each new
  sign-out. The web app clears its copy first and sends the request with `keepalive`,
  so being offline never keeps anyone signed in locally — but then the server copy
  lives until expiry. Tokens minted before session ids existed (before 2026-10-11)
  cannot be singled out; sign-out reports `ended: false` for them and they expire
  within 24 hours. Coverage: `tests/security/session-sign-out.test.ts`,
  `tests/pg/concurrency.test.ts` (survives a restart), e2e `account-security`.
- **Telling the person:** when a session ends on its own, the web app shows the API's
  reason once on the sign-in page (tab-scoped `sessionStorage`, rendered as text).

### Account state

- Suspended or banned accounts are confined to viewing their reports, appealing, and
  exporting or erasing their data (`RESTRICTED_SESSION_ROUTES`); every other route
  returns 403. Erased accounts have no credential (`!erased`) and every token for them
  returns 401. Role changes apply on the next request.
- Coverage: `tests/security/core-authz.test.ts` "account state is enforced on every request".

### Passwords and credential endpoints

- PBKDF2-SHA512, 210,000 iterations, per-user salt, stored as
  `pbkdf2-sha512$<iterations>$<salt>$<hash>`; older hashes are upgraded on the next
  successful login. Unknown-email logins run a decoy hash so response time does not
  reveal whether an account exists.
- Login is rate-limited per client IP + email and sign-up per client IP
  (`AUTH_RATE_LIMIT_MAX_REQUESTS`, default 10 per 15 minutes), on top of the global limiter.
- Global limiter: 300 requests per minute per signed-in account (keyed by the verified
  token's user id), or per client address for anonymous and invalid-token callers, so a
  forged token buys no budget. Health checks are exempt. Behind a proxy set `TRUST_PROXY`,
  or every anonymous caller shares the proxy's bucket. A throttle answers 429
  `RATE_LIMIT_EXCEEDED` with a plain message and `Retry-After` in every environment.
  (The former default — 100 per 15 minutes per address — locked a normal user out after
  about 20 page views; found by driving the running app with Reticle on 2026-10-10.)

### Verification credentials (the product's trust boundary)

A verification tier is only as strong as the proof behind it, so the person being
verified must never hold the proof.

- **Corporate email:** a single-use 6-digit code is emailed to the address; only its
  SHA-256 is stored (`work_history_email_challenges`), it expires after 15 minutes and
  allows 5 wrong attempts. The code is never returned to the browser that asked for it.
- **References:** the referee's one-time token is delivered only to the referee; only
  its SHA-256 is stored (`employment_references.token_hash`), submission requires it,
  and it dies on use. The candidate never sees it.
- **Concurrency:** both checks are check-then-act; `persist()` refuses a write whose base
  record changed or has another write in flight, and Postgres re-checks the decisive
  columns, so concurrent guesses cannot be folded into one attempt
  (`tests/pg/concurrency.test.ts`).
- **At rest in the job queue:** the email job carries the code/token until delivered;
  every terminal job transition strips `token` and `code` from the payload.
- **When the role goes away:** removing a role (`DELETE /api/v1/candidates/work-history/:id`,
  owner only) or erasing the account deletes its references and open email check and
  cancels their still-queued emails (credentials stripped), so a referee is not emailed
  a dead link on behalf of someone who withdrew the request. Best effort: an email the
  worker has already picked up still goes out (`tests/integration/work-history-removal.test.ts`,
  `tests/pg/work-history-removal.test.ts`).
- **Delivery:** development uses the dev outbox; deployed environments support the opt-in Brevo adapter in `apps/worker/src/email/brevo.ts`. Live mailbox delivery and sender approval remain unverified. Without configured delivery, creation endpoints fail closed. Queue idempotency does not establish exactly-once handler execution; see audit D-02.

### Object-level authorization

Every route that loads a record by id must check the caller's relationship to it
(owner, organization member, participant, admin) — "signed in" is not enough. The
adversarial review of 2026-10-10 found the interview-assessment routes acting for any
signed-in user (including moving another company's job application through a
scorecard); they are now scoped to the hiring team and the assessed candidate
(`tests/security/core-authz.test.ts`, "interview assessments are scoped…").

Messaging follows the product rule (blueprint §9.6): a conversation can be started
only between connected people, or between a candidate and a member of the hiring
team of a job they applied to (`mayStartConversation`); before 2026-10-11 any
signed-in user could message any profile. Only participants can read or post, and
erasing an account deletes the person's messages
(`tests/integration/messaging-rules.test.ts`, `tests/pg/messaging.test.ts`).

## 9. Webhooks

Verify provider signature + timestamp/replay window. Record provider event ID and make handling idempotent.

### Billing webhook — signed (closed 2026-10-10)

`POST /api/v1/billing/webhook` rejects every request that does not carry

```text
x-talentsphere-signature: t=<unix seconds>,v1=<hex HMAC-SHA256(BILLING_WEBHOOK_SECRET, "<t>.<raw body>")>
```

with `t` within 300 seconds of the server clock (constant-time comparison over the exact
bytes received). With no `BILLING_WEBHOOK_SECRET` configured the endpoint refuses
everything (503) rather than trusting callers. Duplicate event ids are idempotent.
Coverage: `tests/security/api-security.test.ts` (unsigned, wrong secret, stale timestamp,
tampered body, valid).

**Caveat:** this scheme is TalentSphere's own and serves only `BILLING_MODE=simulated`
and tests. Real payments use the Stripe endpoint below; the two are never both the source
of paid access (`BILLING_MODE=disabled` is the default; `simulated` is refused in
production).

### Stripe billing (added 2026-10-23)

With `BILLING_MODE=stripe`:

- `POST /api/v1/billing/stripe-webhook` verifies Stripe's `Stripe-Signature` over the
  exact bytes received (SDK `constructEvent`, 5-minute tolerance). Missing, forged, stale
  or altered requests get 401 and change nothing.
- Stripe is the source of truth. A paid tier exists only after a signed subscription event
  at a price id in the server-side catalog, in `active`/`trialing` status. `past_due`,
  `unpaid`, `paused`, `incomplete` and `canceled` fall back to free. The Checkout success
  redirect grants nothing, and `POST /billing/subscribe` refuses paid plans.
- The client names a plan and cycle only; price ids come from `STRIPE_PRICE_*`.
- Events are recorded and applied in one transaction keyed by `(provider, event id)`;
  duplicates are no-ops, and an event older than the newest applied one is skipped
  (Stripe does not guarantee order).
- Account erasure deletes the Stripe customer first (a Stripe outage stops the erasure
  before anything else changes, so it can be retried) and then the local billing rows.
- Personal data sent to Stripe: the account email and user id (metadata). Stripe holds card
  data; this API never sees or stores it.
- Billing tables are server-only (RLS on, `REVOKE ALL FROM PUBLIC`).
- Provider failures return a generic 503; details go to the server log without secrets.

Not covered: `scripts/check-client-secrets.mjs` was not extended with Stripe key patterns
(protected file; ask first). Dispute/refund events are acknowledged but not acted on.
Coverage: `tests/unit/stripe-billing-domain.test.ts`, `tests/integration/stripe-billing.test.ts`,
`tests/pg/billing.test.ts`, `tests/unit/production-config.test.ts`.

## 10. AI Security

Before any provider call:
1. authenticate;
2. resolve entitlement;
3. classify data;
4. inspect assessment context;
5. evaluate policy;
6. minimize context;
7. invoke provider;
8. validate output;
9. record provenance.

## 11. Assessment Security

AI restrictions must be inherited by all AI routes. Protected answers are never returned to clients.

## 12. Security Testing Baseline

Use OWASP ASVS 5.0 and OWASP API Security Top 10 as the verification frameworks. [OWASP ASVS](https://asvs.owasp.org/) and [OWASP security projects](https://devguide.owasp.org/en/02-foundations/05-top-ten/)

## 13. Incident Response

```text
DETECT → CONTAIN → PRESERVE → ASSESS → ERADICATE → RECOVER → NOTIFY → LEARN
```

## 14. Privacy

Implement privacy controls against applicable legal requirements. For India, map the program to the DPDP Act/Rules and their staged commencement timeline; do not claim legal compliance without implementation evidence. [MeitY rules, corrigendum and enforcement documents](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa)
