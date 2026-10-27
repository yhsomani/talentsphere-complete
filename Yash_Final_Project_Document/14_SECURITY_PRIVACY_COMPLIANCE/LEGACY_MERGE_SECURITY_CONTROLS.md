# Legacy Merge B-14a: Security Controls, Threat Lists, Credential Handling and Privacy Pointers (Prior Attempt) Reconciled to the Target Security Design

Doc ID: LGM-B-14A · Owner: Security Architect · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: SEC-01, SEC-02, SEC-02-R2, SEC-03, SEC-04, ADR-T06, ADR-T07, ADR-T12, ADR-T13, ADR-T15, INV-T05, INV-T06, INV-T14, INV-T17, OPEN-08, OPEN-24, OPEN-27, OPEN-48 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/quality/SECURITY.md` v6.0 (17.7 KB) - all 14 sections including the threat-model lists (sections 5-7) and the baseline/incident/privacy sections (12-14); security-relevant parts of `docs/quality/OPERATIONS.md`.

## 0. Frame

- **No security control exists in this project.** Everything below tagged "prior attempt reported" describes an earlier attempt, not this project. "Target requires" is a requirement for this project. Legacy `SECURITY.md` itself said: "security objectives and checklists below are requirements, not certification. Implementation notes describe source behavior; referenced PostgreSQL/browser results remain historical unless the current audit records a fresh run."
- Legacy caveats kept as lessons: simulated assessment scoring (audit D-01), duplicate worker execution (D-02), erasure spanning several stores after deactivation with no recovery (D-03), a security-scan test that could pass when its external grep command was unavailable (D-07), and LMS certificate issuance omitting the final-assessment gate BR-048 (D-09: lesson completion alone produced authority-verified evidence). **Target requires** that each of these five classes has an explicit negative test (section 11 and the QA file).

## 1. Objective, pipeline and authorization chain (legacy sections 1-3)

- Objective: protect identity, private career data, evidence, assessments, tenant data, financial state, credentials, provider credentials and audit history.
- Request pipeline: `Browser -> HTTPS -> AuthN -> Session verification -> Authorization -> Purpose/privacy policy -> Domain validation -> DB constraints + RLS -> Audit`.
- Authorization chain: `Identity -> Role -> Permission -> Resource ownership -> Tenant -> Purpose -> Policy`. Never trust client role/tenant IDs.
- **Target mapping:** SEC-02 and ADR-T07 (central policy module, deny-by-default), INV-T01/T02/T03, consent scope INV-T15. The legacy chain adds "Purpose/privacy policy" before domain validation - confirm SEC-02 places a purpose check at the same point (action: Security Architect).

## 2. Database-level security (legacy section 4) - lessons on RLS and grants

- RLS is required on exposed tables and should be tested with allow/deny assertions. Table grants and RLS policies are distinct and both must be designed (legacy cited the managed-database vendor's Data API security guidance).
- Prior-attempt state: the API used its own sessions and authorized in code; its privileged connection bypassed RLS; policies were defence-in-depth for hypothetical direct JWT access, **not** a substitute for API authorization.
- Corrections found by real PostgreSQL two-account tests (migrations 00047-00048 of the prior attempt):
  - profile-id vs auth-user-id comparisons were wrong for messaging and notifications; direct participant insertion was removed; message authorship and notification update columns were constrained; a recursive thread-participant policy was replaced by a fixed-search-path `SECURITY DEFINER` membership helper;
  - an unqualified `user_id` in a notification-preference subquery bound to the inner `profiles` table and denied legitimate owners; fixed by a forward-only migration that qualifies `notification_preferences.user_id`;
  - tests ran under a transaction-local `authenticated` role and JWT subject and checked owner reads/writes, cross-account denials, absent-claim denials, membership insertion, sender impersonation and notification field restrictions.
- CI build check: synthetic server-secret values must be absent from the shipped web bundle. Not a substitute for scanning real deployment assets, repository history, or rotating compromised credentials. A client-secrets scan script was **not** extended with payment-provider key patterns (protected file; ask first).
- "Do not enable direct database access solely because these tests pass": verify production grants, all additional permissive policies, function ownership and the actual identity mapping first.
- **Target requires:** every policy migration ships with allow/deny tests (CODE_STYLE rule 7); policy subqueries qualify all columns; membership helpers are `SECURITY DEFINER` with fixed `search_path`; a CI check that built web assets contain none of the secret patterns for **all** configured providers (payment keys included); cross-tenant canary tests (FF-05).

## 3. Deployment safety boundaries (legacy, dated 2026-10-18)

- Automated interview code execution was a development/test **simulation**, not a sandbox; the API refused it with `SERVICE_UNAVAILABLE` in staging/production until a real isolated executor and abuse controls existed. A second simulated evaluator (challenge submissions) could return success without executing code (mitigated only because the evidence was stored unverified with `executed:false`).
- Work-history badge scoring counted *independently endorsed* skills only, not skills entered by the candidate; changing this trust policy required owner review.
- Public privacy/security inboxes were configured through build-time variables (`VITE_PRIVACY_EMAIL`, `VITE_SECURITY_EMAIL`, plus `VITE_SUPPORT_EMAIL`) **only after ownership and monitoring were verified**; no unsupported response SLA was advertised. Legal pages remained **unapproved drafts** and did not pass a launch gate merely because addresses were configured.
- **Target requires:** ADR-T13 (no verified evidence from simulation; sandbox runner or `unverified`), OPEN-27 sandbox decision, SEC-03 launch gate for legal pages and monitored inboxes (OPEN-08, OPEN-34, OPEN-16). Conflict kept visible **L-B14-06**: the verified-skill scoring rule (independent endorsement only) must be confirmed as a target business rule (candidate BR-T) - owner Product Director.

## 4. Primary threats, sensitive-data tiers, file pipeline, API security (legacy sections 5-8 head)

**Primary threats (legacy list, 15 items):** broken object-level authorization; broken function-level authorization; account/session compromise; tenant isolation failure; SSRF; XSS/CSRF; unsafe file upload; webhook replay; rate-limit bypass; secret leakage; supply-chain compromise; prompt injection; AI data leakage; assessment cheating; billing replay/double effects.
**Target mapping:** text search of `THREAT_MODEL.md` (SEC-01) finds SSRF, replay, supply-chain, malware and canary coverage; verify the threats "rate-limit bypass", "secret leakage" and "billing replay/double effects" each have a named row (action: Security Architect; low risk).

**Sensitive data tiers (legacy):** `PUBLIC, INTERNAL, PRIVATE, SENSITIVE, RESTRICTED, NEVER-EXTERNAL`. "Assessment answer keys, provider secrets, access tokens and security internals are never sent to external AI." **Target mapping:** the target uses classes C0-C4 (DB-03: C1 Internal, C2 Personal, C3 sensitive, C4 Secret). **Conflict L-B14-04:** two classification vocabularies; the target's C0-C4 governs, and "NEVER-EXTERNAL" (data that may never leave to an AI/provider) is a property, not a tier - confirm `NEVER-EXTERNAL` is represented as a flag in the AI egress policy (ADR-T12 / SEC-02). Owner: Privacy Engineer.

**File security pipeline (legacy):** `UPLOAD -> validate size/type -> MIME/content inspection -> malware scan where needed -> isolated storage -> access policy -> signed delivery -> lifecycle`. **Target:** SEC-02/THREAT_MODEL cover upload; ensure the "content inspection after type validation" and "signed delivery" steps appear in the file-handling section.

**API security (legacy):** Zod validation at boundary; allow-listed filters/sorts; rate limiting; idempotency; CSRF strategy aligned to auth transport; secure headers; CORS allow-list; no stack traces to clients.

## 5. Session and credential controls reported (legacy "Session signing key" onward) - detailed facts

### 5.1 Session token and signing key

- Token format `base64url(payload).base64url(HMAC-SHA256(payload))`; payload carried user id, email and roles; at each request the account's **current** roles and status were applied on top of the signed claims. With durable storage a token for an identity with no account row was refused ("This account no longer exists."); memory storage (tests only) still trusted signed claims, so the signing key was a full privilege boundary there.
- Key rules: `TOKEN_SECRET` at least 32 characters in any deployed environment; **no hardcoded fallback key** (a committed constant would let anyone read a valid signing key from the source tree and mint an admin token); if unset the domain layer generated a random per-process key (tokens unforgeable but not restart-proof). Generation command preserved: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Regression test: a token signed with the former hardcoded literal and other guessed secrets must be rejected. Out-of-band token mints (test harnesses, scripts) must set the same secret.
- Deployed refusals: no start without `TOKEN_SECRET`, with in-memory storage, or with the local default database URL; production also refused localhost CORS and simulated billing; both deployed environments sent a Content-Security-Policy and hid internal error messages.
- Rotation: rotating `TOKEN_SECRET` signed everyone out.
- **Conflict L-B14-02 (decided by ADR-T06 but kept visible):** legacy used stateless HMAC bearer tokens kept in browser storage (XSS-readable, no refresh flow); this blueprint uses httpOnly cookie sessions with CSRF token and rotating refresh tokens. **Target requires** key custody in a secret manager (OPEN-22), key rotation without mass sign-out (dual-key verification window), and a boot-time refusal when a key is shorter than the minimum or equals any published test key. Open consistency question carried from the legacy register (CF-21): whether the shared config validator runs at every process boot including the worker.

### 5.2 Ending sessions

- Changing a password required the current password, was throttled per account like login, and set a `sessions_valid_after` cutoff; every older token was refused; the response carried a fresh token so the current device stayed signed in. Tokens recorded issue time in whole seconds so the cutoff was the start of the next second (a token minted earlier in the same second was refused too). Suspended accounts could change their password. Writes to the user record carried `base` so a concurrent login re-hash or moderation action computed from an old record could not restore the old password (test: concurrency suite).
- "Sign out of other devices" used the same cutoff without changing the password; allowed for suspended accounts.
- Sign-out ended the session **server-side** (ASVS V3.3.1): a random `sessionId` per token was recorded in `revoked_sessions` until it would have expired; expired rows pruned on each new sign-out; the web app cleared its local copy first and sent the request with `keepalive` so being offline never kept anyone signed in locally; tokens minted before session ids existed could not be singled out (sign-out reported `ended: false`; they expired within 24 hours).
- User-visible reason: when a session ends on its own the web app showed the API's reason once on the sign-in page (tab-scoped `sessionStorage`, rendered as text).
- **Target requires:** refresh-token families with reuse detection (`session-reuse-detected`, BR-T050), server-side session table with revoke-by-session and revoke-all, password change and role change revoke other sessions, logout is server-confirmed with a client-side local clear regardless, and the "why you were signed out" message rendered as text only. Test classes: sign-out survives restart; concurrent login does not undo a password change.

### 5.3 Account state

Suspended or banned accounts were confined to viewing their reports, appealing, and exporting or erasing their data (a fixed `RESTRICTED_SESSION_ROUTES` set); every other route returned 403. Erased accounts had no credential and every token for them returned 401. Role changes applied on the next request. (Note the register's CF-19: documents mentioned "banned" while the user-status type had `active, pending_verification, suspended, deactivated`.) **Target requires** the same confinement as an explicit policy rule (data-rights access never blocked by a sanction) and a defined status set (SM-ACCOUNT) without undefined states.

### 5.4 Passwords and credential endpoints

- PBKDF2-SHA512, 210,000 iterations, per-user salt, stored as `pbkdf2-sha512$<iterations>$<salt>$<hash>`; older hashes upgraded on next successful login; unknown-email logins ran a decoy hash so response time did not reveal existence.
- Login rate-limited per client IP + email and sign-up per client IP (`AUTH_RATE_LIMIT_MAX_REQUESTS`, default 10 per 15 minutes) on top of the global limiter.
- **Conflict L-B14-01:** prior algorithm PBKDF2-SHA512 vs target argon2id with PHC-string storage and lazy rehash (SEC-02 section 3). **Decision (already in SEC-02):** argon2id for all new hashes; legacy PBKDF2 hashes only verified-then-replaced during import of reference users (MIG-DATA-01, OPEN-17). Keep the decoy-hash anti-enumeration behaviour and uniform login error text.

### 5.5 Verification credentials (the product's trust boundary)

"A verification tier is only as strong as the proof behind it, so the person being verified must never hold the proof."

- **Corporate email:** single-use 6-digit code emailed to the address; only its SHA-256 stored; expires after 15 minutes; 5 wrong attempts allowed; never returned to the requesting browser.
- **References:** the referee's one-time token delivered only to the referee; only its SHA-256 stored; submission requires it; it dies on use; the candidate never sees it. (A later fix added a 30-day expiry for the link - CF-10. The target design uses a 14-day expiry; see diagram DGM-01 section 6.)
- **Concurrency:** both are check-then-act; the single write function refused a write whose base record changed or had another write in flight and the database re-checked decisive columns, so concurrent guesses could not be folded into one attempt.
- **At rest in the job queue:** the email job carried the code/token until delivered; every terminal job transition stripped `token` and `code` from the payload.
- **When the role goes away:** removing a role (owner only) or erasing the account deleted its references and open email check and cancelled still-queued emails (credentials stripped); best effort - an email the worker had already picked up still went out.
- **Delivery:** development used a labelled log outbox (the log contained the code and link - treat as sensitive); deployed environments used an opt-in provider adapter; creation endpoints failed closed (503) without configured delivery; "queue idempotency does not establish exactly-once handler execution" (D-02).
- **Open conflict kept visible CF-11 (P1, undecided):** the email-ownership check intended to prove the person works at the company matched the domain only when the role had a company **with a website**; otherwise any non-webmail address passed, so a candidate could verify a mailbox they control. **Target requires** a decided rule: employer-domain verification requires a registered employer domain (or an alternative verification route) and never relies on candidate-entered domain data; decision owner Product Director + Security Architect (new item **L-B14-05**, relates to OPEN-48).
- **Target requires** (already INV-T05): hashed, single-use, expiring, request-bound credentials; add the legacy-tested behaviours as acceptance tests: code never returned to requester; 5-attempt lockout with new-code requirement; token consumed on use; queued payload scrubbed on terminal state; role removal cancels queued mail.

### 5.6 Object-level authorization and messaging

- Every route that loads a record by id must check the caller's relationship to it (owner, organization member, participant, admin) - "signed in" is not enough. An adversarial review of 2026-10-10 found interview-assessment routes acting for any signed-in user (including moving another company's job application through a scorecard); fixed and covered by a core-authorization suite.
- Messaging rule (blueprint 9.6 of the legacy SSOT): a conversation may be started only between connected people, or between a candidate and a member of the hiring team of a job they applied to; before 2026-10-11 any signed-in user could message any profile. Only participants can read or post; erasing an account deletes the person's messages.
- **Target requires:** INV-T02; a generated IDOR matrix from the permission matrix (listed in the API-STD test table); messaging start-rule as a policy action `message.start` with the two allowed relationships; erasure deletes authored messages while preserving other participants' thread integrity (decision recorded in DB-03 deletion column; verify).

## 6. Webhooks and payment security (legacy section 9)

- Rule: verify provider signature + timestamp/replay window; record the provider event ID and make handling idempotent.
- **Own-format billing webhook (prior attempt, closed 2026-10-10):** every request had to carry `x-talentsphere-signature: t=<unix seconds>,v1=<hex HMAC-SHA256(BILLING_WEBHOOK_SECRET, "<t>.<raw body>")>` with `t` within 300 seconds of server clock and constant-time comparison over the exact bytes received; without a configured secret the endpoint refused everything (503); duplicate event ids were idempotent; tests covered unsigned, wrong secret, stale timestamp, tampered body, valid. Caveat: this scheme was TalentSphere's own, used only for simulated billing and tests; never both it and the real provider as sources of paid access.
- **Stripe mode (added 2026-10-23):** webhook verified the provider's signature over the exact received bytes (SDK, 5-minute tolerance); missing, forged, stale or altered requests got 401 and changed nothing. The provider is source of truth: a paid tier exists only after a signed subscription event at a price id in the server-side catalog with `active`/`trialing` status; `past_due`, `unpaid`, `paused`, `incomplete`, `canceled` fall back to free; the Checkout success redirect grants nothing and a direct "subscribe" route refused paid plans; the client names plan and cycle only (price ids server-side); events recorded and applied in one transaction keyed by `(provider, event id)`, duplicates no-ops, events older than the newest applied one skipped (providers do not guarantee order); account erasure deleted the provider customer first (a provider outage stopped erasure before anything else changed, so it could be retried) then local billing rows; personal data sent to the provider: account email and user id (metadata); card data never seen or stored; billing tables server-only (RLS on, `REVOKE ALL FROM PUBLIC`); provider failures returned a generic 503 with details in the server log without secrets. Not covered: dispute/refund events acknowledged but not acted on (later fixed for full current-period refunds, CF-07).
- **Target requires:** ADR-T15 and INV-T17 (unchanged), plus the legacy erasure-order rule (provider customer deletion first, retryable) as a saga step in the erasure design, and a production guard that refuses provider **test-mode** keys in production (and refuses live keys outside production).

## 7. AI and assessment security (legacy sections 10-11)

- Before any provider call: 1 authenticate; 2 resolve entitlement; 3 classify data; 4 inspect assessment context; 5 evaluate policy; 6 minimize context; 7 invoke provider; 8 validate output; 9 record provenance.
- Assessment: AI restrictions are inherited by **all** AI routes; protected answers are never returned to clients.
- Prior-attempt failure mode (to test against): a second "assistant query" route skipped the quota and prompt firewall (conflict CF-35); the data-consent setting was not checked on any AI route; the tier was hard-coded to free.
- **Target requires:** one gateway (ADR-T12), the nine-step order above as the gateway pipeline (check it matches SEC-02/BE-01 ordering - action: Security Architect), tests that every AI entry point rejects `AI_PROHIBITED` sessions, and a route-registry lint that forbids a model call outside the gateway.

## 8. Security testing baseline, incident response and privacy (legacy sections 12-14)

- Verification frameworks: **OWASP ASVS 5.0** and **OWASP API Security Top 10**. **Target:** SEC-02 already cites ASVS; add the API Top 10 as the second named framework in the test strategy (action: QA Architect).
- Incident sequence (legacy): `DETECT -> CONTAIN -> PRESERVE -> ASSESS -> ERADICATE -> RECOVER -> NOTIFY -> LEARN`. The operations file used a shorter lifecycle `detect -> contain -> assess -> recover -> communicate -> postmortem`. **Target:** SUP-INC defines the process; confirm it includes evidence preservation and eradication steps (they are in the longer legacy sequence only).
- Privacy: "Implement privacy controls against applicable legal requirements. For India, map the program to the **DPDP Act and Rules** and their staged commencement timeline; do not claim legal compliance without implementation evidence." The prior attempt's hosted-database project was in a Mumbai region.
- **Conflict L-B14-03 (gap found):** the target compliance matrix (SEC-04) and privacy design (SEC-03) contain no mention of India or the DPDP Act (checked by text search across the target blueprint). **Decision needed:** whether India (DPDP) is in launch jurisdiction scope; owner Legal/Privacy Lead; blocks OPEN-08 and OPEN-30 (residency) and OPEN-34 (DPAs). Until decided, SEC-04 must list DPDP as "applicability unconfirmed - counsel review", not omit it.

## 9. Open items raised by this file

| ID | Question | Owner / link |
|---|---|---|
| L-B14-01 | PBKDF2-SHA512 (legacy) vs argon2id (target) - confirm migration-only use of PBKDF2 | Security Architect, OPEN-17 |
| L-B14-02 | Bearer-in-browser-storage (legacy) vs cookie sessions (target) - decided by ADR-T06; record as superseded | ARB secretary |
| L-B14-03 | DPDP / India jurisdiction absent from SEC-03/SEC-04 | Legal/Privacy Lead, OPEN-08/30/34 |
| L-B14-04 | Two data-classification vocabularies; where does NEVER-EXTERNAL live | Privacy Engineer |
| L-B14-05 | Employer-domain verification rule (legacy CF-11) | Product Director + Security Architect, OPEN-48 |
| L-B14-06 | Independent-endorsement-only scoring rule as target BR-T | Product Director, OPEN-43 |
| L-B14-07 | Gateway step order vs SEC-02/BE-01 ordering; incident sequence vs SUP-INC | Security Architect, SRE Lead |


<!-- ledger-D D-07 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/quality/SECURITY.md (gap closure D-07)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: 4 external guidance URLs (lines 37, 330, 340), prior test file names `tests/pg/billing.test.ts`, `tests/unit/stripe-billing-domain.test.ts`, the `tests/security/api-security.test.ts` describe block (line 157), and `apps/worker/src/email/brevo.ts` (line 243).

~~~~text
L37: RLS is required on exposed tables and should be tested with allow/deny assertions. Supabase's current guidance also distinguishes table grants from RLS policies, so both must be designed together. [Supabase Data API security](https://supabase.com/docs/guides/api/securing-your-api)
[...]
L155: - Generate a key with:
L156:   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
L157: - Regression coverage: `tests/security/api-security.test.ts`, describe block
L158:   *"SEC: Session signing key is not a committed constant"*, asserts that a token signed
L159:   with the former hardcoded literal and with other guessed secrets is rejected.
[...]
L243: - **Delivery:** development uses the dev outbox; deployed environments support the opt-in Brevo adapter in `apps/worker/src/email/brevo.ts`. Live mailbox delivery and sender approval remain unverified. Without configured delivery, creation endpoints fail closed. Queue idempotency does not establish exactly-once handler execution; see audit D-02.
[...]
L306: Not covered: `scripts/check-client-secrets.mjs` was not extended with Stripe key patterns
L307: (protected file; ask first). Dispute/refund events are acknowledged but not acted on.
L308: Coverage: `tests/unit/stripe-billing-domain.test.ts`, `tests/integration/stripe-billing.test.ts`,
L309: `tests/pg/billing.test.ts`, `tests/unit/production-config.test.ts`.
L310: 
[...]
L330: Use OWASP ASVS 5.0 and OWASP API Security Top 10 as the verification frameworks. [OWASP ASVS](https://asvs.owasp.org/) and [OWASP security projects](https://devguide.owasp.org/en/02-foundations/05-top-ten/)
[...]
L340: Implement privacy controls against applicable legal requirements. For India, map the program to the DPDP Act/Rules and their staged commencement timeline; do not claim legal compliance without implementation evidence. [MeitY rules, corrigendum and enforcement documents](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa)
~~~~


<!-- ledger-D D-09a -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/ARCHITECTURE_DURABILITY_REPORT.md (gap closure D-09a)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: CWE-328 / CWE-916 (SEC-01, line 142) and CWE-613 (SEC-02, line 189) with the full vulnerability text.

| Prior-attempt finding | Severity | CWE | Prior-attempt remedy (target requirement) |
|---|---|---|---|
| SEC-01 Insecure challenge hash: `sha256Hex(`${id}:${code}`)` with public work-history UUID and 10^6 code space, no server pepper | High | CWE-328, CWE-916 (hash weakness; insufficient computational effort / no keyed hash) | Key the hash with a server secret: `crypto.createHmac('sha256', env.TOKEN_SECRET)` |
| SEC-02 Referee voucher tokens never expire (no `expiresAt`) | Medium | CWE-613 (insufficient session/credential expiration) | Add `expires_at TIMESTAMPTZ` with a 30-day TTL and check on lookup and submission |

CWE titles in the CWE column are the standard MITRE names as understood by the merger; the source gives only the ids. Target: both remedies are requirements for this project.

~~~~text
L141: #### Vulnerability SEC-01: Insecure Challenge Hash (Missing HMAC Key)
L142: - **Severity**: **High** (CWE-328 / CWE-916)
L143: - **Finding**: The challenge hash is computed as:
L144:   ```typescript
L145:   sha256Hex(`${id}:${code}`) // where id is the public workHistoryId UUID
L146:   ```
L147: - **Mechanism**: The work history ID `id` is a known public UUID exposed in API requests and profile graphs. The code space is only $10^6$ combinations ($000000$ to $999999$). There is **no secret server pepper or HMAC key** used in hashing. If an attacker gains read access to `public.work_history_email_challenges` (via SQL injection, database snapshot, or read replica compromise), they can precompute a 1,000,000-entry rainbow table for that specific UUID in less than 50 milliseconds using standard GPU SHA-256 acceleration, completely bypassing mailbox control.
L148: - **Remediation**: Hash with `crypto.createHmac('sha256', env.TOKEN_SECRET).update(`${id}:${code}`).digest('hex')`.
[...]
L188: #### Vulnerability SEC-02: Missing Token Expiration (Indefinite TTL)
L189: - **Severity**: **Medium** (CWE-613)
L190: - **Finding**: Referee voucher tokens have **no expiration timestamp**.
L191: - **Mechanism**: `EmploymentReference` stores `requestedAt` and `submittedAt`, but lacks an `expiresAt` column. Neither domain logic nor API checks token age. An invitation sent to an employee remains valid months or years later, even if the referee leaves the company, changes roles, or becomes adversarial.
L192: - **Remediation**: Add `expires_at TIMESTAMPTZ` (30 days TTL) to `employment_references` and validate `Date.now() < Date.parse(reference.expiresAt)` upon lookup and submission.
L193: 
~~~~
