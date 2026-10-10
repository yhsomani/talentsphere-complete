# TalentSphere — SECURITY.md v6.0

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

RLS is required on exposed tables and should be tested with allow/deny assertions. Supabase's current guidance also distinguishes table grants from RLS policies, so both must be designed together. citeturn123371search0turn123371search4

### Known RLS defect (not exploitable through the API)

The API connects with the service role and authorizes in code, so RLS does not
gate it. The policies matter for any direct (PostgREST/Supabase client) access,
and some compare the wrong ids: `notifications` / `notification_preferences`
(00007) compare a profile id to `auth.uid()` (a user id), so they match nothing.
Review every policy against the ids the API actually writes before enabling
direct database access.

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
every request (see "Account state" below). Tokens for identities with no account row
keep their signed claims, so the signing key is still a full privilege boundary.

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
- In `NODE_ENV=production` the API refuses to start without `TOKEN_SECRET` (and with
  `STORAGE=memory`, the local default `DATABASE_URL`, localhost CORS, or
  `BILLING_MODE=simulated`) — `productionConfigProblems()` in `packages/config`.

### Ending sessions

Tokens are stateless, so a session can only be ended by a rule the API checks on every
request. Changing a password (`POST /api/v1/auth/password`: current password required,
throttled per account like login) sets `users.sessions_valid_after`; `resolveSession`
refuses every token issued before it, and the response carries a fresh token so this
device stays signed in. Tokens record their issue time in whole seconds, so the cut-off
is the start of the next second — a token minted earlier in the same second is refused
too. Suspended accounts may change their password. User-record writes carry `base`, so a
concurrent login re-hash or moderation action computed from the old record cannot
restore the old password (`tests/pg/concurrency.test.ts`). Sign-out alone does not
revoke server-side (G-6).

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
- **Delivery:** no email provider is integrated. In development the worker prints these
  messages ("DEV OUTBOX"); in any other environment it fails them permanently, so the
  verification loop does not work outside development until a provider is chosen.

### Object-level authorization

Every route that loads a record by id must check the caller's relationship to it
(owner, organization member, participant, admin) — "signed in" is not enough. The
adversarial review of 2026-10-10 found the interview-assessment routes acting for any
signed-in user (including moving another company's job application through a
scorecard); they are now scoped to the hiring team and the assessed candidate
(`tests/security/core-authz.test.ts`, "interview assessments are scoped…").

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

**Caveat:** no payment provider is integrated, so this scheme is TalentSphere's own
(modelled on Stripe's `t=…,v1=…`). When a provider is chosen, verify **its** signature
contract instead; do not keep this one alongside it. Paid plans cannot be bought until
then (`BILLING_MODE=disabled`; `simulated` is for demos/tests and refused in production).

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

Use OWASP ASVS 5.0 and OWASP API Security Top 10 as the verification frameworks. citeturn398510search0turn617445search0

## 13. Incident Response

```text
DETECT → CONTAIN → PRESERVE → ASSESS → ERADICATE → RECOVER → NOTIFY → LEARN
```

## 14. Privacy

Implement privacy controls against applicable legal requirements. For India, map the program to the DPDP Act/Rules and their staged commencement timeline; do not claim legal compliance without implementation evidence. citeturn832916search0turn832916search8turn832916search9
