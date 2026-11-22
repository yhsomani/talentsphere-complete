# Feature Specifications — Group 1: Identity, Sessions, Profile & Consent

Doc ID: SPEC-G1 · Owner: Product Director + Identity/Profile leads · Version 1.0 · Status: Under Review · Relates: DOM-01, DOM-03, DOM-22, FEAT-01-01…01-06, FEAT-01-13, FEAT-03-01, FEAT-03-02, FEAT-03-06, FEAT-03-08, FEAT-03-09, FEAT-22-01, SM-ACCOUNT, SM-SESSION, BR-T050…T059, BR-T061…T063, INV-T01, INV-T05, INV-T15, INV-T16, ADR-T06

Contract and conventions: see `README.md` in this folder. Endpoints are **provisional** paths under `/api/v1` (canonical `API-*` IDs are assigned in the API catalogue). All content **[TARGET]**; `{…}` values **[OPEN]**.

---

# SPEC-01 Registration, Login, Passkey, Session Refresh & Revocation

**Metadata:** Doc ID SPEC-01 · Owner: Identity PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 (passkey P1) · Features: FEAT-01-01, FEAT-01-02, FEAT-01-03, FEAT-01-04, FEAT-01-05, FEAT-01-06, FEAT-01-13 · Modules: MOD-SHELL, MOD-ACC · `api/identity` · Relates: ADR-T06, BR-T050…T059, INV-T05, INV-T16, INV-T33, INV-T34, SM-ACCOUNT, SM-SESSION, DT-09

## 1. Business purpose
Let a person create an identity, prove control of an email, sign in with a password or a phishing-resistant passkey, and hold a short-lived session that is renewable, listable and revocable. Remove the reference design's script-readable bearer token [REF] so that remotes never touch credentials (INV-T16). Business value: trust baseline for every other feature; activation funnel start (BP-01).

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-ANON | register, verify email, sign in, request reset | `auth:register`, `auth:login`, `auth:reset` (public, rate-limited) |
| Any authenticated principal | list/revoke own sessions, manage own passkeys/password | `session:read:own`, `session:revoke:own`, `credential:manage:own` |
| ROLE-ADM / ROLE-SUP | no direct access to credentials or session secrets; may revoke sessions of a user under an active grant (BR-T042) | `session:revoke:subject` (grant-bound) |
| System | purge unverified accounts, expire sessions, send mail | worker jobs |

## 3. Functional behavior
### 3.1 Inputs and validation
| Field | Rule | Error |
|---|---|---|
| email | trimmed, NFKC, lower-cased domain; local part case preserved but compared case-insensitively; ≤ 254; one `@`; no control chars | `422 email_invalid` |
| password | 12–128 chars (Unicode allowed, no composition rules); not in breached list (BR-T051); not equal to email local part | `422 password_weak` / `password_breached` |
| displayName | 1–80 chars, no control chars, trimmed | `422` |
| acceptedPolicies | array of `{policyId, version}` for current Terms and Privacy versions (FEAT-01-13, FEAT-22-06) | `422 policy_not_accepted` |
| ageAttestation | boolean checkbox "I am old enough to use this service" **[OPEN-09: age and guardian rules not decided]** | `422` |
| passkey creation options | WebAuthn `PublicKeyCredentialCreationOptions` generated server-side; challenge ≥ 16 bytes, single-use, TTL 5 min | `400 challenge_expired` |
| verification code | 6 digits (≥ 6), TTL 15 min, ≤ 5 attempts, hashed (BR-T053) | `422 code_invalid`, `429 too_many_attempts` |
| reset token | ≥ 128-bit random, TTL 30 min, single-use (BR-T054) | `410 token_invalid` (single message for expired/used/unknown) |

### 3.2 Rules and calculations
1. **Enumeration safety:** `POST /auth/register`, `/auth/login`, `/auth/password/reset-request` return responses whose body, status and (within tolerance) latency do not depend on whether the email exists. If the email exists, the owner receives an "already registered / someone tried to sign up" email instead.
2. **Login throttle (BR-T052):** delay = min(15 min, 2^(n−5) × 15 s) after the 5th consecutive failure, tracked per (normalised email, IP /24 or /64 bucket) and per IP globally; during a delay even correct credentials return `429 Retry-After` (denies an oracle).
3. **Session creation (BR-T056):** on success create a *session family* (SM-SESSION t1); issue access (15 min) and refresh (generation 1) cookies; family `idle_expires_at = +14 d`, `abs_expires_at = +30 d` ("remember me": +90 d; privileged roles: idle 30 min, abs 8 h, BR-T044).
4. **Refresh:** per DT-09 (rotation, 5 s leeway, reuse ⇒ family revoke).
5. **Cookies:** access `__Host-ts_at` (`Secure; HttpOnly; SameSite=Lax; Path=/`); refresh `__Secure-ts_rt` (`Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth/refresh` — `__Host-` cannot be path-scoped). CSRF: unsafe requests require an `X-CSRF-Token` header equal to the per-session value issued by `GET /me` / login **and** a matching `Origin`.
6. **Passkey login:** verify origin, `rpId`, challenge, user-presence/verification flags; if stored `signCount` > 0 and presented ≤ stored ⇒ reject, mark credential `suspect`, notify holder (synced passkeys reporting 0 are exempt).
7. **Step-up (BR-T057):** sensitive actions require a re-authentication newer than 5 min (`reauthAt` claim).
8. **Password change/reset:** revokes all other sessions (SM-SESSION t5); reset also revokes the current one.

### 3.3 Side effects
Events (outbox, INV-T12): `account.registered`, `account.verified`, `session.created`, `session.revoked`, `credential.added/removed`, `auth.reuse_detected`. Notifications: verification code, new-device sign-in (BR-T059), password changed, passkey added, reset requested, reuse detected. Audit entries for all credential and session changes.

### 3.4 Postconditions
After register: exactly one `pending_verification` account (INV-T34). After verification: `active`, one primary verified email, session issued. After revoke: family `revoked`, effective on every request within 60 s p95 (access tokens carry `sid`, checked against a revocation cache).

## 4. User interaction
| Screen (provisional) | Behaviour |
|---|---|
| SCR-SIGNUP | email, password with strength hint (length first), "Use a passkey instead" if feature-detected, policy acceptance with links; generic success state "Check your email" |
| SCR-VERIFY-EMAIL | 6-digit field `autocomplete="one-time-code"`, resend (countdown 60 s), paste allowed |
| SCR-LOGIN | email field with `autocomplete="username webauthn"` enabling conditional-UI passkey autofill; password field `current-password`; show/hide toggle; no CAPTCHA |
| SCR-PASSKEY-PROMPT | after first password login, offer "Add a passkey" (skippable, re-offered after 30 d, max 3 times) |
| SCR-RESET / SCR-RESET-SET | non-enumerating copy; new password with `new-password` |
| SCR-SESSIONS (MOD-ACC) | device label, approx location (country/region from IP prefix), last used, current marked; revoke one, revoke others |
**Accessibility (WCAG 2.2 AA):** labels and error summary, focus to first error, 3.3.8 Accessible Authentication (paste, password managers, passkeys; no cognitive tests), touch targets ≥ 24 px, no reliance on colour. **Offline:** all auth is online-only (ADR-T10). **Remotes:** call `host.auth.requireAuth()`/`host.auth.onSessionLost()`; they never receive credentials (INV-T16).

## 5. Backend behavior
Same-origin BFF routes (ADR-T06). Order on `POST /auth/login`: rate-limit check → normalise → lookup (constant-time path for unknown email: hash a dummy) → verify → account-state check (`active` only) → create family + tokens → audit + outbox → set cookies. Workers: `purge-unverified-accounts` (daily), `expire-sessions` (hourly sweep; lazy check on use), `send-email` via notify. Ports: `EmailPort`, `ClockPort`, `BreachListPort` (k-anonymity range query; if unavailable at registration accept only length ≥ 14 and set `breach_recheck_at` — fail-safe, not fail-open), `WebAuthnPort`.

| Endpoint (provisional) | Method | Notes |
|---|---|---|
| `/auth/register` | POST | idempotent by normalised email; always `202` |
| `/auth/verify-email` | POST | consumes code; issues session |
| `/auth/verify-email/resend` | POST | ≤ 3/h |
| `/auth/login` | POST | password |
| `/auth/passkey/options` + `/auth/passkey/verify` | POST | login ceremony |
| `/me/passkeys` | GET/POST/PATCH/DELETE | requires step-up for POST/DELETE |
| `/auth/refresh` | POST | cookie only |
| `/auth/logout` | POST | revokes current family |
| `/auth/sessions` | GET | own families |
| `/auth/sessions/{id}` | DELETE | revoke one |
| `/auth/sessions/revoke-others` | POST | |
| `/auth/password/reset-request`, `/auth/password/reset` | POST | |

## 6. Data (logical, not final DDL)
| Entity | Key fields | Retention |
|---|---|---|
| `account` | id, email_normalised (unique among non-erased), email_verified_at, state (SM-ACCOUNT), display_name, locale, version | until erasure |
| `credential_password` | account_id, hash + parameters, changed_at, breach_recheck_at | until erasure |
| `credential_passkey` | id, account_id, credential_id (unique), public_key, sign_count, transports, name, status (`ok`/`suspect`), created_at, last_used_at | until removed |
| `one_time_code` | id, account_id, purpose, code_hash, expires_at, attempts, consumed_at | 30 d after expiry |
| `session_family` | id, account_id, state, reason, created_at, last_seen_at, idle_expires_at, abs_expires_at, device_label, ua_hash, ip_prefix | 90 d after end (security audit) |
| `refresh_token` | id, family_id, generation, token_hash, issued_at, used_at | with family |
| `login_attempt` | account_key_hash, ip_bucket, outcome, at | 30 d |
| `policy_acceptance` | account_id, policy_id, version, accepted_at | permanent ledger |
Invariants: INV-T05, INV-T33, INV-T34, INV-T43.

## 7. States and transitions
Account: SM-ACCOUNT t1, t2 (this spec). Session: SM-SESSION t1–t6. Forbidden examples: `revoked → active`; refresh for non-`active` account (DT-09 row 7).

## 8. Non-functional requirements
| Area | Requirement (targets; authoritative values in NFR docs) |
|---|---|
| Performance | login server time p95 ≤ 400 ms (hash cost dominates); refresh p95 ≤ 150 ms |
| Availability | auth is tier-0; if the session store is down, fail **closed** (`503`), never allow |
| Security | memory-hard password hashing; constant-time compares; no token in URL/body/log; Origin+CSRF; credential stuffing throttles; INV-T14 log redaction |
| Privacy | IP stored as prefix; device label derived from UA; no raw UA retained beyond hash + label |
| Accessibility | WCAG 2.2 AA incl. 3.3.8 |
| i18n | emails and errors localisable; email normalisation Unicode-safe |
| Compatibility | WebAuthn feature-detected; Safari/iOS installed-PWA cookie behaviour covered in the platform matrix (FF-09) |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Email provider down at registration | `202` still; outbox retries (SM-NOTIFY); resend available; no duplicate account |
| Duplicate submit / double click | idempotent by normalised email; one account, one active code |
| Two tabs refresh at once | client uses Web Locks single-flight; server leeway returns same successor; no logout |
| Cookies blocked by browser | login succeeds server-side but app detects missing session cookie and shows explanatory screen |
| Stolen refresh cookie replayed after rotation | reuse ⇒ family revoked, victim notified (BR-T050) |
| Breach-list service unavailable | accept ≥ 14-char password, schedule re-check, force change if later found breached |
| Passkey device lost | sign in with password/recovery; remove passkey; if passkey-only account ⇒ recovery email flow (FEAT-01-06.3) with 24 h hold and notice |
| Clock skew on client | irrelevant: all expiry on server clock |
| Account suspended while session active | next request 403 `account_state`; family revoked (SM-SESSION t6) |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-01-01-01 | no account for `a@x.com` | register with valid password and policies | `202` generic body; one `pending_verification` account; one code email queued; no cookie set | Happy |
| AC-01-01-02 | account for `a@x.com` exists | register again (any case variant) | identical `202` body; no second account; owner gets "already registered" email | Negative/enumeration |
| AC-01-01-03 | password lengths 11, 12, 128, 129 | register | 11 and 129 ⇒ `422`; 12 and 128 ⇒ accepted | Boundary |
| AC-01-01-04 | breached password | register | `422 password_breached`; no account | Negative |
| AC-01-01-05 | valid code, age 14 min | verify | account `active`, session cookies set, code consumed | Happy |
| AC-01-01-06 | same code | verify again | `422 code_invalid`; no second session | Negative |
| AC-01-01-07 | 5 wrong codes | 6th attempt with the correct code | `429`; requires new code | Boundary |
| AC-01-01-08 | two concurrent registrations `A@x.com` and `a@x.com` | submitted simultaneously | exactly one account exists | Concurrency |
| AC-01-01-09 | email provider returns 5xx for 10 min | register | `202`; delivery retried per SM-NOTIFY; user can resend | Recovery |
| AC-01-01-10 | unverified 7 days | purge job runs | account `purged`, email reusable | Time |
| AC-01-13-01 | policies not accepted | register | `422 policy_not_accepted`; with acceptance, ledger rows store versions | Negative/Happy |
| AC-01-02-01 | valid credentials | login | cookies `HttpOnly; Secure; SameSite=Lax`; response body contains no token | Happy/Security |
| AC-01-02-02 | 5 failures for (account, IP bucket) | 6th attempt with the correct password immediately | `429 Retry-After`; same account from another IP bucket unaffected | Boundary |
| AC-01-02-03 | unknown email vs wrong password | login | identical status/body; latency distributions indistinguishable in test | Negative |
| AC-01-02-04 | first login from new device | login | "new sign-in" email within 5 min | Happy |
| AC-01-02-05 | account `suspended` | login | read-only appeal screen only; no profile data returned | Negative |
| AC-01-03-01 | authenticated user with recent re-auth | add passkey | credential stored; appears in list; confirmation email | Happy |
| AC-01-03-02 | add passkey without recent re-auth | POST | `403 reauth_required` | Negative |
| AC-01-03-03 | browser without WebAuthn | open login | passkey UI hidden; password path works | Fallback |
| AC-01-03-04 | challenge already used or older than 5 min | verify assertion | rejected `400` | Negative/Replay |
| AC-01-03-05 | assertion with wrong origin/rpId | verify | rejected | Security |
| AC-01-03-06 | account with a single passkey and no password/recovery | remove it | `409 last_method` | Negative |
| AC-01-03-07 | stored signCount 5, presented 3 | verify | rejected; credential `suspect`; holder notified | Security |
| AC-01-04-01 | access token expired | next API call | client refreshes silently; request retried once; user sees nothing | Happy |
| AC-01-04-02 | refresh token generation 1 presented after rotation to 2, 10 s later | refresh | `401 reuse_detected`; family revoked; notice sent | Security |
| AC-01-04-03 | two tabs refresh within 1 s | both refresh | both succeed; family valid; exactly one successor exists | Concurrency |
| AC-01-04-04 | idle 14 d + 1 s | any call | `401 session_expired`; absolute 30 d likewise | Boundary |
| AC-01-04-05 | running app | inspect `localStorage`, `sessionStorage`, JS-visible cookies | no access or refresh token present | Security |
| AC-01-04-06 | unsafe request with missing CSRF header or foreign Origin | POST | `403` | Security |
| AC-01-05-01 | 3 sessions | open sessions page | 3 rows, current flagged | Happy |
| AC-01-05-02 | revoke other device | that device's next request | `401` within 60 s | Happy |
| AC-01-05-03 | change password | complete | all other families revoked, current kept | Happy |
| AC-01-06-01 | unknown or known email | request reset | identical response | Negative |
| AC-01-06-02 | reset token used once | reuse | `410`; expired at 30 min + 1 s also `410` | Negative/Boundary |
| AC-01-06-03 | successful reset | complete | all sessions revoked; notice to account email | Happy |

## 11. Testing
Unit: normaliser, throttle curve, code/token lifecycle, DT-09 table (one test per row). Integration: full ceremonies with fake `EmailPort` and `ClockPort`; passkey with virtual authenticator. Security suite: enumeration timing, CSRF, token-in-log scan (INV-T14), cookie flags, reuse detection. E2E (Playwright): signup→verify→login→refresh across tab pair→revoke; WebKit run for FF-09. Accessibility: automated axe + manual keyboard/screen-reader script for SCR-LOGIN. Load: credential-stuffing profile against throttle.

## 12. Developer guidance
Build order: account+code lifecycle → password login → sessions/refresh → session UI → passkeys → reset. Pitfalls: never return `Set-Cookie` tokens in JSON; do not log request bodies on `/auth/*`; email scanners prefetch links, so **codes** (not click-through tokens) are used for verification; ensure refresh path cookie scoping does not break the shell's silent refresh. Decision pending: **OPEN-09** age/guardian rules; **OPEN** idle/absolute lifetimes; **OPEN** whether to allow passwordless-only signup in Phase 1.

## 13. Related
`ADR_REGISTER.md` ADR-T06 · `CANONICAL_INVARIANTS.md` INV-T05/T14/T16 · `STATE_MACHINES.md` SM-ACCOUNT, SM-SESSION · `DECISION_TABLES.md` DT-09 · `BUSINESS_RULES_REGISTRY.md` BR-T050…T059.

---

# SPEC-02 Profile & Consent Scopes

**Metadata:** Doc ID SPEC-02 · Owner: Profile PM + Privacy PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-03-01, FEAT-03-02, FEAT-03-06, FEAT-03-08, FEAT-03-09, FEAT-22-01 · Modules: MOD-CAND, MOD-ACC, MOD-SHELL · `api/profile`, `api/privacy` · Relates: INV-T15, INV-T29, INV-T40, BR-T061…T063, BR-T069, BR-T117, DT-01, ADR-T08, ADR-T10

## 1. Business purpose
Let a candidate present themselves truthfully and decide, per field and per grantee, who may see what. Consent scopes are the product's answer to "recruiters see evidence only with permission" (INV-T15): without this feature, search, outreach and application snapshots cannot ship. Business value: candidate trust, regulatory posture, higher-quality discoverable pool.

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-CAND | create/read/update own profile; grant/revoke consents; manage links, blocklist | `profile:write:own`, `consent:write:own` |
| Any viewer | read visible fields per DT-01 | `profile:read:visible` |
| ROLE-REC / ROLE-HM | read per DT-01 rows 4–7 | `profile:read:consented` |
| ROLE-SUP | read under grant only (DT-01 row 14) | `profile:read:granted` |
| ROLE-AUD | read consent ledger aggregates | `consent:audit` |

## 3. Functional behavior
### 3.1 Profile inputs and validation
| Field | Rule |
|---|---|
| displayName | 1–80, trimmed |
| headline | ≤ 120 (boundary tested at 120/121) |
| summary | ≤ 2,000, plain text + limited inline (no HTML; sanitised Markdown subset) |
| location | structured: country (ISO 3166-1 alpha-2), region, city; coarse display by default |
| links | ≤ 10, `https` only, host not in private ranges, normalised |
| pronouns / name pronunciation | ≤ 20 / ≤ 80 chars, optional |
| photo | JPEG/PNG/WebP ≤ 5 MB, scanned (BR-T003), shown only after clean scan |
| skills | references to canonical skills only (BR-T006 analogue: FEAT-04-02) |
| field visibility | each of: `private` · `applications` (only inside submitted application snapshots) · `discoverable` (recruiter search with `search.discoverable`) · `public` |

### 3.2 Consent scopes (FEAT-22-01)
The scope ids, defaults, grain, expiry and revocation effects are defined only in `00_CONTROL_CENTRE/CONSENT_SCOPE_CATALOGUE.md` (CSC). This table is the candidate-facing view; the former `CS-*` ids map to canonical ids in CSC section 4.

| Scope | Purpose text (versioned) | Grantee | Default | Effect |
|---|---|---|---|---|
| `search.discoverable` (was `CS-DISCOVER`) | "Let recruiters find my profile summary in search" | all verified orgs | off | appears in index; honours blocklist |
| `outreach.recruiter_contact` (was `CS-CONTACT`) | "Let recruiters send me first-contact requests" | all verified orgs | off | enables DT-08 row 6 |
| `evidence.share_summary` (was `CS-EVID-SUMMARY`) | "Show evidence titles, skills and strength to recruiters who find me" | all verified orgs | off | summary visible in search (needs `search.discoverable`) |
| `evidence.share_artefact` (was `CS-EVID-ARTEFACT`) | "Let this employer open my evidence files" | **specific org**, optionally one evidence item | off | per-employer grant; optional expiry (default {12 months}) |
| `profile.share_contact` (was `CS-CONTACT-DETAILS`) | "Share my email/phone with this employer" | specific org | off | optional expiry (default {12 months}) [OPEN-CS-05] |
| `alumni.share_outcomes` (was `CS-ALUMNI`) | "Share outcomes with my institution" | specific institution, chosen fields | off | FEAT-18-07 |
| `profile.public_view` | "Make my profile visible to anyone with its public page" | anyone | off | public page and `public` fields |
| `matching.recommend` | "Use my profile and evidence to recommend jobs and explain matches to me" | none | off | recommendations, match explanations |
| `evidence.share_institution` | "Include my work in my institution's cohort reports" | specific institution | off | cohort reads and aggregates (BR-T100) |
| `ai.assist.process` | "Send my content, redacted, to AI providers to get suggestions" | none (processor) | off | AI endpoints; INV-T06..T09 |
| `analytics.product` | "Help improve the product with usage analytics" | none | off | client and server analytics |
| `comms.marketing_email` | "Send me tips and product news by email" | none | off | marketing sends (DT-07 row 8) |
| `data.research_aggregate` | "Include my data in anonymised research" | none | off | hidden until OPEN-B10 is decided |
`application.share_snapshot` (was `CS-APPLICATION`) is implicit per application and is not a toggle (BR-T062); it is written as a ledger row in the apply transaction. Each grant stores: scope, scope-text version, grantee (all verified orgs / org id / institution id), target (evidence or application id, optional), optional `field_set` (alumni only), granted_at, expires_at, source (UI/API/application), and appends to an immutable ledger (INV-T35).

### 3.3 Rules and calculations
1. Visibility changes that imply a scope (e.g. setting a field `discoverable`) **call the consent API**; there is a single source of truth, not two flags.
2. **Completeness guidance (03-01.1):** score = Σ weights of present items {headline, ≥3 skills, ≥1 work claim, ≥1 evidence at rung ≥ artifact-backed, visibility chosen}; displayed as a checklist of next actions, never as a rank or "profile strength" shown to recruiters.
3. **Slug (03-06.1):** 3–30 chars `[a-z0-9-]`, no leading/trailing hyphen, not in reserved list, unique; change ≤ 1 per 30 days; old slug redirects 90 d.
4. **Share link (03-06.2):** ≥ 128-bit random token stored hashed, selected evidence set, expiry ≤ 90 d (default 14 d), revocable, view count, `noindex`.
5. **Public profile SEO (03-06.3):** `noindex` by default; candidate may opt in.
6. **Blocklist (03-09.3):** ≤ 200 orgs; applied in search, shortlist suggestions and outreach (INV-T40); candidate remains free to apply to a blocked org (explicit action clears block for that org with confirm).
7. **Draft conflicts (03-08.1):** profile reads return `ETag`; writes use `If-Match`; mismatch ⇒ `412` with current server representation.

### 3.4 Side effects & postconditions
`profile.updated`, `consent.changed` events (outbox). On `consent.changed` the search indexer and cache invalidator run (BR-T063). Access logging for recruiter reads feeds FEAT-22-04. Postcondition: DT-01 evaluated afresh on every read; no cached allow outlives 60 s.

## 4. User interaction
| Screen | Behaviour |
|---|---|
| SCR-PROFILE-EDIT | sectioned form, autosave per section (debounced 1.5 s) with "Saved" status; offline edits queued with "will sync" badge (FEAT-03-08.2); conflict dialog shows field-level diff (mine/theirs) |
| SCR-VISIBILITY | table "who can see what", presets (Private · Apply-only · Discoverable summary); **Preview as recruiter** (FEAT-03-02.2) renders DT-01 row 5 |
| SCR-CONSENTS | per-scope list with purpose text, grantee, date, version; revoke button; per-employer grants listed by org name; history tab |
| SCR-SHARE | create/revoke links, expiry picker, evidence selector |
| SCR-BLOCKLIST | search orgs; list |
Plain-language consent copy (reading grade ≤ 9), no pre-ticked boxes, no dark patterns. A11y: switch controls have programmatic names and live-region confirmation.

## 5. Backend behavior
`PATCH /me/profile` (If-Match) → validate → persist new version → outbox `profile.updated` (only on change). `PUT /me/consents/{scope}` with body `{granted, policyVersion, granteeType?, granteeId?, targetType?, targetId?, fieldSet?, expiresAt?}` (shape validated against the scope's grain, CSC section 2; `granted:false` revokes, matching the OpenAPI contract) → ledger append → derived `consent_current` projection updated in the same transaction. Read paths: `GET /profiles/{slug}`, `GET /share/{token}`, recruiter reads go through POL `can(principal,"profile:read",resource)` which evaluates DT-01 using `consent_current`. Worker: re-confirmation prompts for `search.discoverable` every {12 months}; expiry sweeper for per-employer grants (notify 14 d before).

## 6. Data
| Entity | Fields (key) | Notes |
|---|---|---|
| `profile` | account_id, version, display_name, headline, summary, location, links[], photo_ref, visibility map, slug, updated_at | one per account |
| `profile_history` | profile_id, version, diff, changed_at | FEAT-03-10 later |
| `consent_ledger` | id, account_id, scope, scope_text_version, grantee_type, grantee_id, action (`grant`/`revoke`), expires_at, source, at | append-only (INV-T35) |
| `consent_current` | derived projection per (account, scope, grantee) | rebuildable from ledger |
| `share_link` | id, account_id, token_hash, evidence_ids[], expires_at, revoked_at, views | |
| `blocked_org` | account_id, org_id, at | |
| `consent_text` | scope, version, text, effective_at | versioned copy |

## 7. States and transitions
Profile has no lifecycle SM beyond account state (SM-ACCOUNT: hidden when `deactivated`/`pending_erasure`/`suspended`). Consent grants: `granted → revoked | expired` (terminal; re-grant creates a new row).

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | profile read p95 ≤ 150 ms; consent change visible to POL ≤ 60 s; index removal ≤ 15 min p95 |
| Privacy | purpose-bound, versioned, revocable (INV-T15); minimal default exposure |
| Security | IDOR tests on every profile/consent endpoint (INV-T02); no recruiter read without DT-01 allow |
| Accessibility | WCAG 2.2 AA; consent text readable by screen readers |
| Offline | read cache of own profile; queued edits only (ADR-T10); server revalidates |
| i18n | consent text translated per locale **with version parity** (translation updates are new versions) |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Concurrent edit on two devices | second writer gets `412` and a merge dialog; no silent overwrite |
| Revoke during recruiter session | recruiter's next read denied (≤ 60 s); previously exported data not recalled (stated in copy) |
| Indexer lag | search may show stale entry ≤ 15 min p95, but profile **fetch** is denied immediately |
| Consent text updated | existing grants stay bound to old version; new purposes need fresh consent |
| Photo scan fails | photo hidden; owner informed; profile otherwise saved |
| Slug race | unique constraint decides; loser gets `409 slug_taken` |
| Offline queued edit applies to deleted account | `410`; queue discarded with notice |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-03-01-01 | valid profile payload | save | `200`, new ETag, one `profile.updated` | Happy |
| AC-03-01-02 | headline of 120 and 121 chars | save | 120 ok; 121 ⇒ `422` | Boundary |
| AC-03-01-03 | link `javascript:alert(1)` or private-range host | save | `422` | Negative/Security |
| AC-03-01-04 | uploaded photo fails scan | view profile | photo not shown to anyone; owner notified | Negative |
| AC-03-02-01 | new account | recruiter searches / anonymous opens profile URL | not found / `404` (private by default) | Negative |
| AC-03-02-02 | set field to `discoverable` | save | `search.discoverable` ledger row exists; indexer notified | Happy |
| AC-03-02-03 | preview as recruiter | open | output equals DT-01 row 5 result for the same data | Consistency |
| AC-22-01-01 | grant `search.discoverable` | complete | ledger row with scope, text version, ts; `consent.changed`; visible in search ≤ 15 min p95 | Happy |
| AC-22-01-02 | revoke `search.discoverable` | recruiter next fetch | denied on the first read after the revoke commits (no consent cache, CSC section 6; test timeout 60 s); removed from index ≤ 15 min | Happy/Timing |
| AC-22-01-03 | `evidence.share_artefact` granted to Org A | Org B recruiter opens artefact URL | `403`/`404`; no existence leak | Negative/IDOR |
| AC-22-01-04 | scope text v2 published | existing v1 grant | still active as v1; re-confirm prompt only for new purposes | Happy |
| AC-22-01-05 | attempt `UPDATE consent_ledger` as app role | execute | denied by DB | Security |
| AC-22-01-06 | per-employer grant with expiry in 12 months | day 349 | notification sent; day 365 grant `expired`, access denied | Time |
| AC-03-06-01 | slug `Admin`, `-ab`, `ab`, 31 chars, taken | set | each `422/409`; valid unique slug ok | Boundary |
| AC-03-06-02 | share link expired vs never existed | open both | identical `404` | Negative/Enumeration |
| AC-03-06-03 | revoke share link | open within 60 s | denied | Happy |
| AC-03-06-04 | new public profile | crawl headers | `X-Robots-Tag: noindex` unless opted in | Default |
| AC-03-08-01 | two devices edit headline | second saves stale | `412` + server version; UI shows diff; neither edit lost | Concurrency |
| AC-03-08-02 | offline edit, then reconnect with newer server version | sync | conflict dialog; no overwrite (BR-T117) | Recovery |
| AC-03-09-01 | candidate blocks Org X | Org X recruiter searches / lists shortlist suggestions | candidate absent (INV-T40) | Negative |
| AC-03-09-02 | 200 blocked orgs | add 201st | `422` | Boundary |

## 11. Testing
Policy matrix test generated from DT-01 (one case per row). IDOR suite across profile/consent/share endpoints. Ledger immutability test. Timing tests with controllable clock for revocation propagation. Cross-tenant canary (FF-05) for recruiter reads. E2E: grant→appear in search→revoke→disappear. Content test: consent copy renders in each launched locale with the right version.

## 12. Developer guidance
Implement `consent_current` as a pure fold of the ledger and test equivalence (PROP). Put DT-01 in `packages/policy` only; the search query builder must call the same predicate (do not reimplement in SQL by hand — generate the SQL filter from the same rule definition or test both against the matrix). Pitfall: caching recruiter reads at CDN level; set `private, no-store` on all consented endpoints. Decision pending: **OPEN-07** persona validation of default presets; **OPEN-08** retention of ledger after erasure (ledger rows for the subject are not rewritten or deleted by erasure: they hold an opaque `subject_ref`, and erasure deletes the identity mapping so they no longer resolve; DB-02 §4.1).

## 13. Related
`DECISION_TABLES.md` DT-01 · `STATE_MACHINES.md` SM-ACCOUNT · `BUSINESS_RULES_REGISTRY.md` BR-T061…T063, T069 · `PRODUCT_INVARIANT_REGISTRY.md` INV-T29, T35, T40 · SPEC-03 (evidence sharing), SPEC-09 (application snapshot), SPEC-13 (export/erasure).

## Contract links (patch 2026-10-27)

Evidence label: PROPOSED mapping. Every id below was grepped in its owner file on 2026-10-27; ids marked "none" do not exist and are OPEN. Owners: ACT-ATOM-nn in 07 ACTION_REGISTRY; FLD-* in 07 SCREEN_SPECIFICATIONS_KEY; EDG-nn in 06 BUSINESS_PROCESS_INVENTORY; XT-nn in 06 SSOT_WORKFLOW_CROSSWALK; UXH-nn in 07 PROGRESSIVE_UX_AND_FEEDBACK; audit.* in 14 SECURITY_ARCHITECTURE and 07; TEST-ACT-nnn in 07 ACTION_REGISTRY (not yet in TEST_CATALOG, OPEN-P04).

| SPEC | ACT-ATOM | Base ACT without atom | FLD | EDG | XT | UXH | audit events | TEST | Contract gap |
|---|---|---|---|---|---|---|---|---|---|
| SPEC-01 (FEAT-01-01..01-06, 01-13) | ACT-ATOM-01 (sign in with `next`) | ACT-AUTH-01, -02, -05, -09, -11, -14; ACT-ACC-04, -05 | FLD-AUTH-01, FLD-AUTH-02, FLD-AUTH-03 | EDG-01, EDG-03, EDG-11 | none | UXH-07 | `audit.auth.login_succeeded`, `audit.auth.login_failed`, `audit.auth.passkey_changed`, `audit.session.revoked`, `audit.session.refresh_reuse_detected` | TEST-ACT-001 | OPEN-F01: registration, confirm, passkey, refresh and revoke have no atomic contract |
| SPEC-02 (FEAT-03-01, 03-02, 03-06, 03-08, 03-09, 22-01) | none | ACT-PRO-01, -03, -04; ACT-PRV-01, -02 | FLD-PRO-01, FLD-PRO-02, FLD-PRO-03 | EDG-01, EDG-06 | none | UXH-07 | `audit.consent.granted` (no consent-withdrawn name exists, see OPEN-X06) | none | OPEN-F02: profile save, visibility and consent grant/withdraw have no atomic contract or TEST
