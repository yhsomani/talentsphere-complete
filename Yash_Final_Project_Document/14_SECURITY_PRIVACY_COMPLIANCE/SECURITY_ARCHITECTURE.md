# Security Architecture

Doc ID: SEC-02 · Owner: Security Architect · Version 1.0 · Status: Under Review · Relates: ADR-T06, T07, T12, T19, T21 · INV-T01..T20 · FF-01..FF-10 · BR-T041, BR-T050 · Companions: SEC-01 `THREAT_MODEL.md`, SEC-03, SEC-04, BE-01, API-STD, INT-01, DB-02

> **Revision 2 folded in (2026-10-27)** from `SECURITY_ARCHITECTURE.md#record-security-rev2`: changed sections replaced in place or appended under "Revision 2 additions". Status unchanged; proposals still need ownership ratification.

Tags: **[TARGET]** design · **[OPEN]** open · **[REF]** reference. Numeric parameters are starting values with rationale and require review against current guidance and measured hardware before implementation. **OWASP ASVS, OWASP Top 10, NIST publications and similar are used here as guidance/checklists only; this document makes no claim of conformance, certification or compliance.**

## 1. Principles
1. **Server is the authority.** Authentication, authorisation, consent, entitlements, verification and AI restrictions are enforced server-side; client checks are hints (INV-T01, INV-T13).
2. **Assume breach of any single layer.** Policy in app + RLS in DB + column privileges + audit; remotes in a shared realm cannot hold secrets (ADR-T19).
3. **Minimise standing power.** No standing human access to personal data; time-boxed, reason-coded, audited grants (INV-T18, BR-T041); service identities are workload-scoped.
4. **Secure defaults, explicit exceptions.** Deny-by-default routes (FF-01); strict schemas; private-by-default visibility; opt-in consent.
5. **Evidence over assertion.** Security controls ship with tests, lints or monitors (fitness functions), not documentation alone.

## 2. Authentication (ADR-T06)
### 2.1 Methods
| Method | Design |
|---|---|
| **Passkeys (WebAuthn)** preferred | Discoverable credentials; `userVerification: required` for login and step-up, `preferred` for registration; attestation `none` (no device allowlists, privacy); store credential id, public key, sign counter, transports, backup eligibility/state; sign-counter regression is a risk signal (not an automatic lockout since synced passkeys may report 0); at least two credentials or recovery codes encouraged before removing the last password (`409` on removing last credential) |
| **Password** | Argon2id (§2.2); NFKC-normalised; length 12-128; no composition rules and no periodic rotation (guidance direction of NIST SP 800-63B); reject known-breached/common passwords via local denylist plus optional k-anonymity range check (fail-open, OPEN-B8); show strength guidance; paste allowed |
| **Second factor (password users)** | TOTP optional; **required for org_owner, org_admin, support, admin, moderator** roles at launch [OPEN-B48]; passkey with user verification satisfies it; SMS is not offered (SIM-swap, cost; deferred per ADR-T20) |
| **Account recovery** | Email link (hash-only single-use token, 1 h expiry [TARGET]) for password users; passkey-only accounts recover via a second registered passkey or recovery codes; a recovery path that falls back to email alone triggers a 24 h delay and alerts on all channels [TARGET]; recovery revokes all sessions |
| **SSO (orgs)** | OIDC (code+PKCE) / SAML per INT-01 §10; org-enforced SSO disables password login for that org's domain members |
| **Service accounts** | Client-credentials, short-lived scoped tokens; secrets Argon2id/HMAC-hashed at rest; shown once |
| **Referee / capability tokens** | Not authentication of an account; single-use capability bound to one request (INV-T05) |

### 2.2 Password hashing — Argon2id parameters and rationale
| Item | Value [TARGET] | Rationale |
|---|---|---|
| Algorithm | Argon2id (RFC 9106) | Memory-hard; resistant to GPU/ASIC cracking and side channels (hybrid) |
| Floor | OWASP Password Storage Cheat Sheet minimum class of settings (for example 19 MiB memory, 2 iterations, parallelism 1, or an equivalent trade-off) | Published guidance sets a minimum; the project never goes below it |
| Starting point | memory 64 MiB, iterations 3, parallelism 1, salt 16 bytes random, output 32 bytes | Comfortably above the floor while keeping per-hash memory moderate; parallelism 1 avoids multiplying memory under concurrent logins |
| Calibration | Benchmark on production hardware so one verification takes roughly 250-500 ms of CPU under idle load, then fix parameters; re-evaluate yearly | A latency target (not a magic number) balances attacker cost and login latency; exact values need hardware measurement (OPEN-B2) |
| Capacity safeguard | Hash operations run in a bounded worker pool with a semaphore; queue overflow returns `429`; login rate limits (RL-AUTH) apply before hashing | Memory-hard hashing is itself a DoS vector |
| Storage | PHC string (`$argon2id$v=19$m=...,t=...,p=...$salt$hash`) so parameters travel with the hash | Enables **lazy rehash on login** when parameters rise or when migrating legacy PBKDF2 hashes (MIG-DATA-01) |
| Pepper | Optional HMAC-SHA256 pre-hash with a KMS-held pepper [OPEN-B49]; if adopted, it is versioned in the PHC string comment field | Protects against DB-only leaks; adds rotation complexity, so decision deferred |
| Legacy | PBKDF2-SHA512 hashes from the reference system verified once then replaced | See MIG-DATA-01 |

### 2.3 Sessions and tokens
| Aspect | Design |
|---|---|
| Access token | Signed JWS (EdDSA/Ed25519 preferred; `kid` header), 15 min (ADR-T06), claims: `sub`, `sid`, `amr`, `iat`, `exp`, `grants_version`, `recent_auth_at`; no PII, no roles list beyond version (grants are loaded/cached server-side) |
| Delivery | Cookie `__Host-ts_at` (`HttpOnly; Secure; SameSite=Lax; Path=/`; `__Host-` prefix forbids `Domain` and requires `Path=/`). The cookie's own lifetime is the refresh window, not the 15 min JWT `exp`: after `exp` the cookie still carries the signed JWT, which every route rejects as expired but which the refresh route reads for its `sid` (signature checked, `exp` ignored on that route only) |
| Refresh | Opaque 256-bit random value, SHA-256 hashed at rest; cookie `__Secure-ts_rt` with `Path=/api/v1/auth/refresh` (the `__Host-` prefix cannot be path-scoped, so `__Secure-` is used) `HttpOnly; Secure; SameSite=Strict` [TARGET]; **rotates on every use**; presenting an already-rotated token revokes the entire family (BR-T050) and raises an alert. **Bound to the session id (REVW-32):** the refresh row stores `session_id`; `POST /auth/refresh` succeeds only when that id equals the `sid` in the `__Host-ts_at` cookie sent with it. A `__Secure-` cookie, unlike a `__Host-` cookie, can be set or overwritten from a sibling subdomain ("cookie tossing"); the `__Host-` cookie cannot, so a tossed refresh value from another session fails the binding, is rejected without rotation, and raises a `refresh-binding-mismatch` alert. Duplicate `ts_rt` cookies in one request are treated as tossing: clear both, reject, alert |
| Lifetimes | Refresh idle and absolute lifetimes, the "shared device" absolute cap and the refresh-reuse leeway are defined **only** in the BR constants table in `06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md` (BR-T056, BR-T050; REVW-18). This document cites that table and carries no number of its own, so the three earlier values (14/30 d, 30/90 d, "not fixed") cannot drift apart again. Rationale kept here: PWA users expect to stay signed in; the absolute cap bounds stolen-token value. [pending: the product agent creates the constants table; until it exists no value is authoritative] |
| Revocation | Session rows set `revoked_at`; revoked `sid` values are cached in a denylist for the access-token TTL (bounded exposure <= 15 min); password change/reset, MFA change, role downgrade, and erasure revoke sessions; user can revoke sessions/devices |
| Step-up | `recent_auth_at` freshness window as set in the BR constants table (BR-T057; REVW-18; no number is repeated here) required for: password/passkey/MFA change, data export, erasure request, SSO config, API client creation, role changes, support-grant approval; unmet -> `403 step-up-required` |
| CSRF | Per-session CSRF token (HMAC of `sid` with server key) returned by login/`GET /me`, sent as `X-CSRF-Token`; plus `Origin`/`Sec-Fetch-Site` validation on unsafe methods |
| Key management | Signing keys rotate every 90 days with a 24 h overlap (JWKS-style key set internal to API replicas); compromise runbook can revoke a `kid` immediately |
| Remotes | Cannot read httpOnly cookies. The CSRF token is readable by shell JS by necessity; remotes obtain it only through the shell's fetch wrapper API (INV-T16). Residual: a compromised remote can still *act* as the user (RR-1), so sensitive actions need step-up |

## 3. Authorisation
| Layer | Control |
|---|---|
| Route | Every route declares a policy action; `packages/policy` evaluates `can(principal, action, resource)`; deny by default; resource loaded then authorised (INV-T01/T02); registry lint (FF-01) |
| Function-level | Admin/support/moderator actions require platform role grants **and** step-up/MFA. Client-side route or chunk visibility is not an authorization control; APIs enforce role and resource permissions. |
| Object-level | Owner/org/institution/participant/consent relations in the policy; non-visible objects return 404 |
| Tenant | `org_id`/`institution_id` on tenant rows, RLS FORCE, tenant context per transaction, worker tenant pinning (INV-T03, DB-02 §5-6) |
| Consent | `require_consent` obligations resolved before data leaves the module (INV-T15) |
| Privileged access | Support grants (<= 4 h, reason code, scope, approver where broader), RLS P6, audit, subject-visible access log (INV-T18) |
| Field level | Masking obligations; protected columns not writable by app role (DB-02 §4) |
| Separation of duties | Requester != approver for grants; moderators cannot read billing; auditors read-only; platform admins cannot read message bodies without a grant |
| Reviews | Quarterly org role reviews; monthly platform-privilege review; auto-expiry of dormant privileged grants after 60 days (USR-01 §6) |
| Testing | Matrix-generated allow/deny tests; IDOR suite; FF-05 canaries (application and DB level) |

## 4. Cryptography and key management
| Purpose | Mechanism | Key location | Rotation / notes |
|---|---|---|---|
| Transport | TLS 1.2+ (1.3 preferred), modern cipher suites, HSTS (`max-age` >= 1 year, `includeSubDomains`), automatic certificate management; internal service-to-service mTLS for runner and (optionally) worker->API | Cert manager | Auto-renew; certificate transparency monitoring |
| Data at rest | Volume/storage encryption on DB, backups, object store (provider-managed keys with customer-managed key option [OPEN-B51]) | Cloud KMS | Provider schedule |
| Field-level (C3: referee/employer emails, push endpoints, idempotency bodies for C2+) | AES-256-GCM envelope: per-purpose data-encryption key (DEK) wrapped by a KMS key-encryption key (KEK); ciphertext format `v1.keyId.nonce.ct.tag`; unique 96-bit nonces (random with per-key usage budget, or counter) | KEK in KMS (non-exportable); DEK cached in memory with TTL | KEK annual (or on compromise); DEK rotated on schedule via re-wrap/re-encrypt job; algorithm agility via version prefix |
| Blind indexes (`*_hash`) | HMAC-SHA256 over normalised value | Separate KMS-held index key (never the encryption key) | Rotation requires reindex job; documented |
| Token storage | SHA-256 of 256-bit random tokens (high entropy so fast hash is adequate) | n/a | n/a |
| Short codes (email challenge) | HMAC-SHA256(server key, code ‖ challengeId) + attempt limit | KMS-held HMAC key | Rotate with overlap |
| Access-token signing | EdDSA (Ed25519) | KMS or sealed signing service; public keys distributed internally | 90 days + overlap |
| CSRF / cursor signing | HMAC-SHA256 | App secret (KMS-derived) | 90 days + overlap |
| Webhooks (outbound) | HMAC-SHA256 per-endpoint secret | Encrypted (`secret_enc`) | Customer-driven with dual secrets |
| Audit chain | SHA-256 | n/a | n/a |
| Randomness | OS CSPRNG only for secrets/tokens; UUIDv7 is an identifier, never a secret | n/a | Lint bans `Math.random` in server code |
Governance: key access by IAM role per service (workload identity), no human key export, dual control for KEK deletion/disable, key usage logged, break-glass procedure, documented compromise response (revoke -> rotate -> re-encrypt -> notify per IR plan). Backups of key material are managed by the KMS provider; the repository never contains keys.

## 5. Secrets management
Secrets exist only in the secret manager and in process memory; injected via workload identity at startup (INV-T14); never in images, repo, client bundle, logs, events or error messages. CI uses short-lived OIDC-federated credentials, not static cloud keys; CI secrets are scoped per environment and masked; pre-commit and CI secret scanners block commits; rotation runbooks exist per secret class (DB, Stripe, email, AI keys, signing, webhook, VAPID); production secrets are not available to developer machines or non-production environments; **non-production environments use synthetic or irreversibly anonymised data only**.

## 6. Browser and API-edge security
### 6.1 Content Security Policy (starting policy; reviewed per release)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';                      /* remotes and shell are same-origin, content-hashed files; no inline, no eval */
  style-src 'self' 'nonce-<per-response>'; /* nonce for framework-injected styles; 'unsafe-inline' not used */
  img-src 'self' data: https://<ugc-domain>;
  media-src 'self' https://<ugc-domain>;
  font-src 'self';
  connect-src 'self';
  frame-src 'none'; object-src 'none';
  base-uri 'none'; form-action 'self' https://checkout.stripe.com;  /* [TARGET] verify current Stripe domains */
  frame-ancestors 'none';
  require-trusted-types-for 'script'; trusted-types default;   /* [OPEN-B45] */
  upgrade-insecure-requests;
  report-to csp-endpoint;
```
`<ugc-domain>` is a **separate registrable domain** (not a subdomain of the product apex; REVW-32, REV-RES). A sibling subdomain of the apex shares the apex's cookie scope and can toss cookies into the app; a different registrable domain cannot. The concrete domain name is an [OPEN] procurement item (OPEN-B57) and must not be on the Public Suffix List-sharing hosting of a third party.

Notes: federation (when activated; default is `MF_MODE=bundled`, REV-RES REVW-07) is configured so remote entries load from the same origin (path-routed, immutable hashed assets) rather than cross-origin hosts, so `script-src 'self'` suffices and no remote origin allowlist can be abused. Signed manifest + SRI protect the *integrity* of what is loaded (ADR-T19). Stripe uses redirects to its hosted pages, so no third-party scripts are embedded. CSP runs in report-only first on each release channel. No third-party analytics/tag-manager scripts at launch.

### 6.2 Other headers and policies
| Control | Setting |
|---|---|
| HSTS | `max-age=31536000; includeSubDomains; preload` (preload only after review) |
| `X-Content-Type-Options` | `nosniff` everywhere |
| `Referrer-Policy` | `strict-origin-when-cross-origin`; `no-referrer` on token routes |
| `Permissions-Policy` | Deny camera/mic/geolocation/payment/USB by default; enable only where a feature requires (e.g. camera for future proctoring behind flag) |
| COOP/CORP | `Cross-Origin-Opener-Policy: same-origin`; `Cross-Origin-Resource-Policy: same-origin` (user-content origin: `cross-origin` only for images where needed) |
| Cache-Control | `no-store` on authenticated sensitive responses (API-STD §10) |
| CORS | None for the product API (same origin); strict allowlist only for any documented integrator route |
| Cookies | `__Host-`/`__Secure-` prefixes, `Secure`, `HttpOnly`, SameSite per §2.3; no JS-set auth cookies |
| User content | Served from a **separate registrable domain** (`<ugc-domain>`, cookieless; never a sibling subdomain of the app apex, REVW-32); `Content-Disposition: attachment` for non-images; sandboxed CSP. The app apex sets `HSTS includeSubDomains`; every apex subdomain is first-party-controlled, with subdomain-takeover monitoring (dangling DNS check in the SRE runbook) |
| Service worker | Scope-limited; caches allowlisted GETs of owner data only; SW file served with hash-pinned integrity and `Cache-Control: no-cache`; update flow forces version check; logout/revocation posts a clear-cache message |
| Rendering | React escaping; no HTML injection of user data; markdown via allowlist sanitiser; URL scheme allowlist; link `rel="noopener noreferrer"` |
| Anti-phishing UX | Verification badges rendered from server-provided rung with explanatory wording; the ladder names never imply authority a claim does not have (INV-T04) |

## 7. Rate limiting, abuse and bot control
Rate classes and values: API-STD §9; implementation: BE-01 §16. Additional controls: progressive delays and temporary lock on repeated login failure (never permanent lockout by attackers: lock applies to an authentication path, with recovery); bot challenge on registration and after risk signals; email verification gating for outreach and publishing; per-recipient caps on any third-party-facing email (referee requests, invitations); abuse reporting (`POST /reports`) feeding moderation; velocity rules for new accounts (e.g. outreach quotas rise with account age/verification) [TARGET]; honeypot/canary profiles and tenants to detect scraping and cross-tenant reads.

## 8. Audit, logging and detection
| Topic | Design |
|---|---|
| Audited actions | Authentication events, session/credential changes, role/grant changes, support grants and reads, consent changes, evidence status transitions, verification decisions, application stage transitions, billing state changes, data export/erasure steps, admin job actions, flag changes, AI denials, policy denials of privileged actions |
| Record | `audit_event`: actor, on-behalf-of grant, action, resource, outcome, reason, request/trace ids, truncated IP, changed **field names only** for C3+ data; people held as opaque `subject_ref` tokens, never account ids or emails (erasure deletes the mapping, history is not rewritten); per-row hash sealed into KMS-signed Merkle batch anchors written by a single off-path job and verified daily, anchors exported to a write-once archive (no inline chain lock; DB-02 §4.1-4.2); append-only privileges (DB-02 §4). Anchor signing keys are a KMS key class with rotation and separate administration from the database |
| Access to audit | `auditor` and `admin` roles; subjects see their own "who accessed" log (`GET /me/access-log`) |
| Logs | Structured JSON (Pino), redaction paths for credentials, tokens, emails, bodies (INV-T14, CI test); correlation by W3C trace id; retention 30 d logs / 7 d traces [TARGET] |
| Detections (alerts) | Refresh-token reuse; login-failure spike per account/IP/ASN; password-reset volume; CSRF/Origin rejection spike; cross-tenant canary read (page, Sev-1); support grants outside business pattern; webhook signature failures; SSRF blocks; CSP violation spikes or manifest hash mismatches; role grants to privileged roles; dead-lettered erasure/billing jobs; scan backlog; DB privilege changes; unexpected egress |
| Time sync | Servers on NTP; audit uses DB time (`now()`) as authority |

## 9. Vulnerability and supply-chain management
| Area | Control |
|---|---|
| Dependencies | Lockfile with integrity hashes (CI refuses installs that change it), automated update PRs, `npm audit`/advisory scanning, license scan, install scripts disabled by default (allowlist), registry scoping for internal packages (anti dependency-confusion), review of new transitive dependencies for security-critical packages |
| Build integrity | Hermetic CI builds, pinned action/tool versions (by digest), build provenance/attestations and artifact signing (SLSA-style guidance), SBOM published per release, remotes signed with per-remote keys, manifests verified by the shell |
| Code | SAST on PRs, secret scanning, lint rules for security (no `eval`, no unsanitised HTML, `Math.random` ban), dependency-cruiser for boundaries, code owners for `packages/policy`, crypto, migrations, auth |
| Runtime | Image scanning, minimal base images, non-root, read-only filesystems, egress control, patching cadence |
| SLAs [TARGET] | Remediate (or mitigate and track) within: Critical 72 h, High 14 days, Medium 60 days, Low backlog — based on common practice; adjust after exposure analysis (exploitability, reachability). Emergency path for actively exploited issues |
| Testing | Authorisation suites each build; independent penetration test before external launch and after major architectural change; periodic supply-chain/rollback drills |
| Disclosure | `security.txt`, coordinated disclosure policy; bug bounty is an [OPEN-B52] decision |

## 10. Secure development lifecycle
Threat-model update (SEC-01) for any change that adds a trust boundary, data class C3+, new provider, or new auth path; security review required for `packages/policy`, auth/session, crypto, RLS and migrations touching privileges; two-person review on security-critical code; protected branches with signed commits/tags; production deploys by pipeline only with audit trail; separation of environments and credentials; feature flags cannot disable security controls (BE-01 §17).

## 11. Incident response outline
| Phase | Key actions |
|---|---|
| Prepare | On-call rota; runbooks; contact tree incl. privacy lead and counsel; pre-authorised containment levers; log/audit access prepared; tabletop at least semi-annually [TARGET] |
| Detect | Alerts (§8), user reports, provider notices, researcher disclosure |
| Triage | Assign severity, incident commander, scribe; open private channel; preserve evidence (snapshots, logs, audit export) |
| Contain | Levers: revoke sessions (user/family/all), disable account/org, flip kill flags, roll back remote manifest, pause webhooks/emails/AI, rotate secrets/keys, tighten WAF, isolate worker/runner, restrict DB roles, enable read-only mode |
| Eradicate / Recover | Remove root cause, restore integrity from audit and backups (with erasure-ledger replay), verify with canaries, staged return to service |
| Notify | Privacy lead and counsel assess whether regulators, customers or individuals must be notified and by when; **no deadline is asserted in this document**; internal target: complete the initial assessment within 24 h of confirming personal-data impact [TARGET] |
| Learn | Blameless review within 5 working days, action items tracked in `24_*`, update threat model/tests |

| Severity | Examples | Response expectation [TARGET] |
|---|---|---|
| Sev-1 | **Cross-tenant data read** (ADR-T21), credential/key compromise, mass account takeover, verified-status integrity breach, active data exfiltration | Immediate page, all-hands, containment within 1 h |
| Sev-2 | Privilege escalation without confirmed exfil, large-scale scraping, runner escape attempt, payment fraud pattern | Page, containment within 4 h |
| Sev-3 | Contained vulnerabilities, limited abuse, provider incident with workaround | Same-day triage |
| Sev-4 | Hardening gaps, low-risk findings | Backlog |

## 12. Infrastructure baseline
Private networking for DB/worker/runner; no public DB endpoints; egress allowlisting with a dedicated egress proxy for user-influenced fetches; separate accounts/projects per environment; IAM least privilege and no long-lived human keys; admin access via SSO + MFA with just-in-time elevation; immutable, versioned infrastructure as code with policy checks; encrypted, access-restricted, tested backups; tamper-evident log storage; runner in a separate network segment with deny-all egress.

## 13. Guidance references and mapping (no conformance claimed)
| Guidance | Used for | Where addressed |
|---|---|---|
| OWASP ASVS (version to be pinned, OPEN-B50) | Verification checklist for authentication, session, access control, validation, crypto, errors/logging, data protection, communications, files, API | §2-§9, SEC-01 §6, test plan |
| OWASP Top 10 and API Security Top 10 | Threat prioritisation | SEC-01 AC-01..AC-34 (BOLA, auth, property-level authz, resource consumption, SSRF, misconfig, inventory, unsafe API consumption) |
| OWASP Cheat Sheets (Password Storage, Session Management, CSRF, SSRF, File Upload, Content Security Policy) | Parameter and pattern choices | §2, §6, INT-01 §7, BE-01 §12 |
| NIST SP 800-63B | Authenticator and session guidance direction | §2 |
| NIST SSDF (SP 800-218), SLSA | Secure development and provenance vocabulary | §9-§10 |
| NIST CSF vocabulary | Organising incident response and governance | §11 |
| CIS Benchmarks | Infrastructure hardening baselines | §12 |

## 14. Open items
| ID | Item |
|---|---|
| OPEN-B49 | Password pepper adoption |
| OPEN-B50 | ASVS version and target level to use as checklist |
| OPEN-B51 | Customer-managed encryption keys for storage |
| OPEN-B52 | Bug bounty / VDP model |
| OPEN-B48 | MFA requirement scope (see SEC-01) |

# Revision 2 additions (folded 2026-10-27)

## 1. Session constants: one table, cited (REVW-18)

SEC-02 section 2.3 carries **no session number of its own**. Every value is a citation:

| Value needed | Source | SEC-02 v1.0 text it retires |
|---|---|---|
| Access token lifetime | CONST-S01 | "15 min" stays, now cited |
| Refresh idle and absolute lifetime, "remember me", privileged-role caps | CONST-S02, S03, S04, S05 (BR-T056, BR-T044) | "idle 30 days sliding, absolute 90 days" |
| Step-up freshness (`recent_auth_at`) | CONST-S06 (BR-T057) | "within 10 min" (and ACTION_REGISTRY's 15 min, PWA-01's open items) |
| Refresh reuse leeway | CONST-S07 (BR-T050, INV-T33) | PWA-01's "grace <= 10 s" |
| Email code, reset token, referee token, export link | CONST-S08 to S11 | any restated TTL |
| Idempotency retention | CONST-S12 | BE-01 section 8 "24 h / 7 d" |
| Consent revocation effect | CONST-S13 | "within 1 minute", "cache TTL" |

Duplicate numbers are removed from SEC-02 and from any document that restates them; PWA-01 (frontend) and ACTION_REGISTRY must cite `CONST-Sxx` and close OPEN-FE-08 and OPEN-FE-10 (listed for governance). A lint that greps the doc set for the retired literals is added to the doc review gate.

## 2. Cookie scope, refresh binding and user-content domain (REVW-32)

| Control | Design |
|---|---|
| User content on a **separate registrable domain** | Served from `<ugc-domain>`, a registrable domain different from the app apex, cookieless; never a subdomain of the apex. CSP `img-src` and `media-src` name `https://<ugc-domain>`. Reason: any host under the apex shares its cookie scope and can set cookies into the app (cookie tossing); a different registrable domain cannot. SEC-02 section 6.1 (CSP) and PWA-01 section 12 now agree. The concrete domain is **OPEN-B57** and must not sit on a public-suffix hosting where other tenants share the registrable domain |
| `__Host-ts_at` kept for the refresh window | The access cookie's `Max-Age` is the refresh window (CONST-S02/S03), not the 15 min of the JWT inside it. After the JWT `exp`, every route rejects it as expired, but the refresh route reads its `sid` (signature verified, `exp` ignored on that route only) |
| Refresh bound to the session id | The refresh row stores `session_id`. `POST /auth/refresh` succeeds only when it equals the `sid` in the `__Host-ts_at` cookie sent with it. `__Host-` cookies cannot carry `Domain` and cannot be set from a sibling host; the path-scoped `__Secure-ts_rt` can (tossing). A tossed refresh value from another session therefore fails the binding, is rejected **without rotation** and raises `refresh-binding-mismatch` |
| Duplicate cookie names | Two `ts_rt` (or any security cookie) in one request is treated as tossing: both are cleared in the response, the request is rejected, an alert is raised |
| Apex hygiene | Only first-party hosts exist under the apex; `HSTS includeSubDomains`; subdomain-takeover monitoring (dangling DNS check in the SRE runbook) |

**STRIDE and abuse rows (in `THREAT_MODEL.md`, already added in place):** C15 Cookie scope (apex and sibling subdomains); C16 Telemetry ingest; AC-33 cookie tossing and session fixation from a sibling host; AC-34 abuse of the unauthenticated telemetry endpoint; RR-8 compromised first-party sibling host. Tests: refresh with a mismatched `sid` fails and does not rotate; duplicate `ts_rt` rejected; a response never sets a cookie with `Domain=<apex>`.

## 3. Edge-first limits for authentication (REVW-41, security side)

Credential stuffing (AC-04) is stopped in layers: (1) the CDN/WAF applies per-IP and per-ASN limits and bot challenge to all auth routes before the origin sees them; (2) the application keeps **durable** per-account and per-IP+account counters in the logged `auth_throttle` table (DB-02-R2 section 1), so a failover or crash does not reset a throttle (the UNLOGGED table of BE-01 v1.0 did); (3) responses never reveal account existence; (4) the Redis adapter is introduced earlier than before: when `auth_throttle` writes pass 5% of primary write IOPS or limit-check p95 passes 5 ms, after any Sev-2 credential-stuffing incident, and before three API replicas run in production (BE-01-R2 section 5). Non-auth classes are limited at the edge and in process, with no database write.

## 4. Operational telemetry versus analytics (REVW-31)

Problem: client and remote-activation SLIs (OPS-SLO SLO-03, SLO-13 to SLO-16) rest on browser beacons that were all treated as consent-gated, so field SLIs risked resting on a small, self-selected subset, and nothing separated reliability telemetry from analytics.

| Class | Content | Basis | Route |
|---|---|---|---|
| **Operational** (PUR-24) | Server metrics, logs, traces; client beacons limited to route template (never the concrete URL), error class, build and remote version, timing bucket, coarse device class, connection class, remote-activation outcome, and a random per-page-load id that is never stored client-side. No user id, no persistent or cross-session id, no concrete URL or query, no referrer, no full user agent, no free text, no DOM or form content | Legitimate interest for service operation and security, **pending counsel (OPEN-08)** | `/otlp` same-origin proxy: fixed upstream, path allowlist, no redirects, body cap [TARGET 16 KB], schema-validated, rate-limited at the edge first |
| **Product analytics** (PUR-14) | Anything keyed to a person or persistent id: funnels, feature use, cohorts | Consent `analytics.product` | `POST /analytics/events` (API-21-02); the server rejects when consent is absent |

Rules: a beacon type is on the operational allowlist or consent-gated, with no third class; a schema lint fails when an allowlisted field can identify a person; operational beacons cannot carry a user id even if the user consented to analytics, so the streams never join; field SLIs state their **coverage** (sessions with beacons ÷ all sessions, the denominator counted server-side from anonymous request counters) and that field data is self-selected, so no population claim is made from it. **Synthetic-only alternative** if counsel rules that operational beacons also need consent: the client SLIs of record become scheduled real-browser probes from fixed regions on reference device profiles, and consented RUM becomes diagnosis only. The text is in `PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md` section 3.1 and PUR-24.

## 5. Consent without a cache (REVW-25, security side)

Authorization reads consent from the primary at read time (CONST-S13); no layer caches a consent decision. Roles and capabilities are cached per `grants_version` for at most the TTL in BE-01 section 5; consent is not part of that cache. Search and matching filter against the live privacy-owned view `pv_consent_current` in the same SQL statement as the query (DB-02-R2 section 4). Cleanup jobs that delete derived documents are not the control. Tests treat any time bound as a polling timeout only, never as an authorization tolerance.

## 6. Where the rest of the finding set lands

| Finding part | Document |
|---|---|
| Module dependency graph, complete and generated from imports, including the privacy-consumer edges and `ai` to `assessment` | BE-01-R2 section 2 |
| SQL transition rules generated from the SM table plus a parity test (protects the column-privilege guard of INV-T04 and INV-T11 from drift) | DB-02-R2 section 5; wording for FF-11 in BE-01-R2 section 9 |
| Issuer class, issuer independence and `instructor` revocation | DB-02-R2 section 6; INV-T46, INV-T47 in INV-REG-R2 |
| Idempotency retention class and the natural-key declaration | BE-01-R2 section 4 |

## 7. Amendments and open items for governance

| Item | Needed |
|---|---|
| OPEN-B57 | Concrete user-content registrable domain |
| OPEN-08 (counsel) | Operational-telemetry basis; if refused, the synthetic-only alternative of section 4 applies |
| PWA-01, ACTION_REGISTRY | Cite CONST-S02/S03/S06/S07; close OPEN-FE-08, OPEN-FE-10; retire "15 min" and "grace <= 10 s" |
| ADR-T06 amendment | Refresh bound to the `__Host-` session id; `__Host-ts_at` lifetime = refresh window; duplicate-cookie rejection |
| FF additions | Cookie-scope tests (mismatched `sid`, duplicate cookie, no `Domain=<apex>`), beacon-schema lint, retired-literal doc lint |
| SEC-01 | AC-33, AC-34, C15, C16, RR-8 (present in the file already) |

# Revision 3 additions (patch 2026-10-27, audit gap closure)

Status of everything below: **PROPOSED** design for review; nothing is implemented or verified, and no test named here has been executed. Legal applicability of any item needs counsel verification (OPEN-08). New open decisions use the scoped prefix `OPEN-X##` (listed in R3-10) pending registration by governance in `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md`. Other-team consumers: UX uses R3-1, R3-2 and R3-3 (`../07_UI_UX_AND_DESIGN_SYSTEM/`); the platform team owns the cache partition design (`../11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE.md`, `../12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md`); this document only states the isolation requirement.

## R3-1. Identity and organisation lifecycle rules

| Topic | PROPOSED rule | Test |
|---|---|---|
| Org switching (user with several memberships) | Exactly one **active org context** per request, held server-side (`org_id` chosen by an explicit switch, never inferred from a URL or client header alone). What the user sees: org name and role in the shell; page data reloads under the new context; lists, caches, drafts, notifications and search results from the previous org are cleared client-side. Candidate-owned (personal) data is its own context, not an org. Each switch emits `audit.session.org_context_switched` | TEST-SEC-040 |
| In-flight operations at switch | A mutating request is bound to the org context it was **issued under** (idempotency key + `org_id`); it completes or fails under that org, never under the new one. Unsent drafts are kept per org and never auto-submitted after a switch. Long jobs keep their original tenant pin (INV-T03). The UI shows a pending result against the org it belongs to | TEST-SEC-040 |
| Device trust ("trusted device" skips MFA) | **Out of scope for v1.** Rationale: it adds a long-lived bypass credential and a device-binding store with no evidenced need; step-up (CONST-S06) and the "shared device" session cap already cover the risk. Revisit only with a recorded need and threat review (OPEN-X01). Users still see and revoke their session list | N/A |
| Org offboarding: export and handover | Org owner (with step-up) requests an **org export** (members, job posts, pipeline records the org owns, audit extract) via PROC-02/PROC-09; delivered as a time-limited owner-only link (CONST-S11). **Handover** to another admin precedes closure; an org cannot close with zero owners. Candidate-owned content is **not** exported to the org beyond what the candidate consented to. Retention after close follows R3-6; legal hold overrides deletion. Events: `audit.org.export_requested/delivered`, `audit.org.ownership_transferred`, `audit.org.offboarded` | TEST-TEN-012 |
| Collaborator removed mid-workflow | Access ends for **new requests** on the next permission check (R3-2 bounds). Items assigned to the removed member (stage assignments, interview slots, pending approvals) move to a **needs-reassignment** state visible to org admins; nothing is silently dropped or auto-approved. Drafts and comments authored by the member remain, attributed to a tombstoned display name. A pending approval cannot be completed by the removed user | TEST-TEN-007 (existing), TEST-TEN-013 |
| Notification when a recipient's access changes | Org admins are notified when a member is removed or downgraded and items need reassignment. The affected member is told of the removal (in-app/email per preference). Where a candidate shared a document **to** a user whose access later ends, the candidate's share list shows that recipient as "no longer has access"; nothing is re-sent. Events: `audit.org.member_removed`, `audit.share.recipient_access_ended` | TEST-TEN-013 |

## R3-2. Permission cache staleness and revocation timing

Existing design (section 2.3, BE-01): grants cached per account by `grants_version` (TTL <= 15 s [TARGET]); revoked `sid` denylist for the access-token TTL (<= 15 min); consent never cached (CONST-S13). R3 extends this to **every** cache holding an authorization-relevant fact.

| Cache / fact | PROPOSED maximum staleness | Rationale | Fail mode |
|---|---|---|---|
| Role/grants per account (`grants_version`) | <= 15 s (keeps BE-01 [TARGET]) | Removal feels immediate; absorbs read load | Version mismatch forces DB reload |
| Org membership and org role | <= 15 s, same cache entry as grants | Removing a collaborator is a security event | Reload from primary on mismatch |
| Session revocation (`sid` denylist) | Checked on every request; denylist propagation target <= 5 s; hard outer bound stays the 15 min token TTL | The 15 min figure is a ceiling, not the goal | Denylist store unreachable: **fail closed** for step-up-gated and admin actions; fall back to DB lookup for others |
| Entitlement / plan | <= 60 s for read-only feature gating; **0 s (primary read)** for any action that spends money or quota or exports data | Billing webhooks lag; server must not over-grant on spend | Primary read; deny if unavailable |
| Feature flags | <= 60 s | Flags are not an authorization source | Last known good |
| Search/index ACL | Visibility re-checked at query time against live relations; index entries carry `org_id`, not decision results | Avoid stale visibility in results | Drop the hit if the re-check fails |
| Support/privileged grants | **0 s** (primary read on each use); expiry enforced server-side | Time-boxed access must end on time (INV-T18) | Deny |
| Consent | 0 s (CONST-S13, unchanged) | Existing rule | Deny |
| Client caches (browser, PWA, service worker) | Never authoritative (INV-T13); authenticated API responses `Cache-Control: private, no-store` unless an ADR says otherwise | Offline/back-button replay must not expose revoked data | Re-fetch on focus; 401/403 clears local caches |

**Revocation propagation (design targets UX may quote, not guarantees):** role/org removal effective for new requests within 15 s; session revoke typically within 5 s, worst case 15 min; consent and privileged-grant revocation on the next read. Values to be confirmed by load tests (OPEN-X02). **Test for stale permission cache:** TEST-SEC-036 (R3-9).

## R3-3. Audit event names per critical action (reference list for UX and support)

Pattern follows existing `audit.<domain>.<verb>` names in OPS-PROC. All carry actor, resource, outcome, reason code, request/trace id (section 8). Names are PROPOSED unless already in OPS-PROC.

| Critical action | Event name(s) |
|---|---|
| Sign-in, MFA/passkey change | `audit.auth.login_succeeded/failed`, `audit.auth.mfa_changed`, `audit.auth.passkey_changed` |
| Session revoke, org switch, refresh reuse | `audit.session.revoked`, `audit.session.org_context_switched`, `audit.session.refresh_reuse_detected` |
| Step-up | `audit.auth.step_up_completed/failed` |
| Role change, member add/remove | `audit.org.role_changed`, `audit.org.member_added/removed` (existing) |
| Support grant | `audit.grant.requested/approved/used/expired/revoked` |
| View-as / impersonation | `audit.impersonation.started/ended/action_blocked` |
| Data export, erasure | `audit.privacy.export_requested/delivered`, `audit.privacy.erasure_requested/completed` |
| Consent | `audit.consent.granted/revoked` |
| Evidence, verification | `audit.evidence.status_changed`, `audit.verification.decided` |
| Application stage | `audit.application.stage_changed` |
| Billing | `audit.billing.plan_changed`, `audit.billing.refund_issued`, `audit.billing.webhook_rejected` |
| Admin job, flag change | `audit.admin.job_run`, `audit.change.flag_changed` (existing) |
| AI output accepted/rejected | `audit.ai.output_accepted/rejected` |
| Regulator or law-enforcement request | `audit.legal.request_received/reviewed/answered/declined` (PROC-16) |
| Org lifecycle | `audit.org.created/offboarded/ownership_transferred/export_requested` |
| Share to recipient ended | `audit.share.recipient_access_ended` |
| Application submit, draft sync (ACT-ATOM-02, 03) PROPOSED | `audit.application.submitted`, `audit.application.draft_synced` |
| Evidence created (ACT-ATOM-04) PROPOSED | `audit.evidence.created` |
| Bulk application move (ACT-ATOM-07) PROPOSED | `audit.application.bulk_move_completed/bulk_move_cancelled` |
| Assessment attempt submit (ACT-ATOM-08) PROPOSED | `audit.assessment.attempt_submitted` |
| Remote rollback (ACT-ATOM-09) PROPOSED | `audit.remote.rollback_executed` |
| Billing checkout confirmed (ACT-ATOM-11) PROPOSED | `audit.billing.subscription_confirmed` |
| Account preferences updated (ACT-ATOM-12) PROPOSED | `audit.account.preferences_updated` |

ACT-ATOM-01, 05, 06 and 10 reuse `audit.auth.login_succeeded/failed`, `audit.session.org_context_switched`, `audit.application.stage_changed` and `audit.org.role_changed` above.

## R3-4. Impersonation safeguards (one table)

Current design has **support grants** (time-boxed, scoped, subject-visible log). "View as user" and write-impersonation are **not specified as built**. PROPOSED safeguards if any view-as capability is added (OPEN-X05):

| Safeguard | Rule |
|---|---|
| Default | **View-as is read-only.** No write impersonation; a needed write is done by the user or as a separate audited admin action |
| Authorisation | Active support grant (PROC-04) + MFA/step-up; requester != approver; scope limited to the ticket's resource |
| Time | Grant <= 4 h (section 3); session ends at grant expiry; dormant grants expire at 60 days |
| Visibility | Persistent banner for the operator; subject sees it in `GET /me/access-log` |
| Blocked actions | No credential/MFA/payment-method changes, messaging, consent changes, export, erasure, or approving own grants; no message bodies without a specific grant |
| Data | Masked fields stay masked; sensitive classes in R3-6 stay denied |
| Audit | `audit.impersonation.started/ended/action_blocked`; tokens carry an on-behalf-of (`act`) claim so downstream logs name the operator |
| Review | Monthly sample review by Security Lead; anomalies alert (section 8) |

Test: TEST-SEC-041.

## R3-5. Tenant isolation matrix

Platform team defines the concrete cache/key partition; this table states the requirement and the test that must exist. No test is executed.

| Layer | Isolation requirement | Mechanism | Test |
|---|---|---|---|
| API | Resource loaded then authorised; non-visible = 404 | `packages/policy`, INV-T01/T02 | TEST-TEN-001 |
| DB | RLS FORCE with per-transaction tenant context; no context = zero rows | INV-T03, DB-02 | TEST-TEN-002 |
| Cache (server) | Keys include `org_id`/principal scope; no shared key for tenant data | PROPOSED, platform team | TEST-TEN-008 |
| HTTP/CDN cache | Authenticated responses private, `Vary` correct | existing | TEST-TEN-006 |
| Search / recommendations | `org_id` filter applied inside the query, not post-filtered | existing | TEST-TEN-004 |
| Jobs / worker | Payload pins tenant; worker cannot read outside it | existing | TEST-TEN-003 |
| Logs / traces | Lines carry tenant id; tenant users cannot query logs; redaction (INV-T14) | PROPOSED tenant-id field | TEST-TEN-009 |
| Object storage | Keys prefixed by tenant; signed URLs bound to object + principal, short expiry; UGC domain cookieless | PROPOSED | TEST-TEN-010 |
| Analytics | Tenant users see own-tenant aggregates; small-cell suppression; no cross-tenant joins in pseudonymous views | existing (ANL-MET section 5) | TEST-TEN-005 |
| ID swap (any layer) | A valid ID of another tenant in path/body/query/header returns 404, no side effect | PROPOSED generated suite | TEST-TEN-011 |

## R3-6. Sensitive data class table

Retention values are not asserted; they are `[OPEN-08]` unless set in `PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md`. Residency is unresolved (OPEN-30). Breach role = who leads response (see `../18_OPERATIONS_AND_SUPPORT/INCIDENT_MANAGEMENT.md` roles).

| Class (examples) | Purpose | Access | Encryption | Retention | Deletion | Export | Residency | Breach role |
|---|---|---|---|---|---|---|---|---|
| Credentials and secrets (password/refresh hashes, API keys) | Authentication | Auth service only; never support | Hashed (Argon2id/SHA-256) or KMS-wrapped; TLS | Account lifetime; revoked rows short [OPEN-08] | Erased with account | Never | [OPEN-30] | Security lead |
| Government/financial identifiers (identity verification deferred, OPEN-10) | Verification/billing | Provider-held where possible; not stored raw | Provider-held; field-level if stored | Minimum, provider rules | On request unless legal duty | Provider receipt only | [OPEN-30] | Security lead + Legal |
| Candidate personal data (profile, resume, contact) | Core service | Owner; consented recruiters; support by grant | At rest by platform; TLS | Account lifetime + [OPEN-08] | PROC-09 erasure | Self-export | [OPEN-30] | Privacy lead |
| Evidence, work history, referee data | Verification | Owner; consented viewers; referee via token | As above | Per evidence lifecycle; history tombstoned (PRIVACY 6.1) | Erasure with tombstoned history | Self-export | [OPEN-30] | Privacy lead |
| Messages and applications | Collaboration/hiring | Participants only; admin needs specific grant | As above | [OPEN-08] | Erasure; legal hold overrides | Participant export | [OPEN-30] | Privacy lead |
| Fairness self-identification (P3) | Fairness audit only | Audit job only; never recruiters | Separate store and key | Purpose-limited [OPEN-08] | On revoke | Self-export | [OPEN-30] | Privacy lead |
| Payment data | Billing | Stripe holds card data; platform holds ids/state | Provider-held; TLS | Financial-record rules via counsel | Legal duty overrides | Invoices only | [OPEN-30] | Finance + Security |
| Audit events | Accountability | Auditor/admin; subject sees own access log | At rest; opaque `subject_ref` | Policy [OPEN-08] | Mapping deleted on erasure; rows kept | Own access log | [OPEN-30] | Security lead |
| Operational telemetry (no person id) | Reliability | Engineers | Redacted | 30 d logs / 7 d traces [TARGET] | Expiry | None | [OPEN-30] | SRE lead |
| Product analytics (P1/P2) | Product decisions | Pseudonymous views | Warehouse encryption | Raw [OPEN-08] | De-identify on erasure | Attributable events | [OPEN-30] | Privacy lead |

## R3-7. AI governance (DOM-17 gateway and any model use)

Binding sources: INV-T06 to T09, INV-T19, ADR-T12, `../21_COST_AND_FINOPS/COST_MODEL.md` section 5. This section consolidates; it adds no capability.

| Topic | Rule |
|---|---|
| Suitability | AI may assist drafting, summarising, explaining and suggesting. It is not a source of truth for evidence, verification, identity, eligibility or payments (INV-T08). Each AI feature records purpose, data used and a non-AI fallback before launch |
| Prohibited actions | No autonomous consequential decision (hire/reject, exclusionary ranking, suspend, takedown, refund, role change, deletion) (INV-T09); no AI-generated evidence or verification status; no protected or inferred attributes; no provider training on user content; no C3+ or secret data sent to a provider outside consent scope |
| Prompt-injection and grounding defences | User, resume, job-post, message and retrieved text is **data, never instructions**; system and data channels separated; output schema-validated; no model output executed as code or passed as a tool argument unvalidated; grounding only on consented, permission-filtered records fetched by the server for that principal; claims about a person must cite a source record or are suppressed |
| Human approval | Any AI output that changes state, or is shown to a third party about a person, needs explicit confirmation by an authorised user; audited (`audit.ai.output_accepted/rejected`) |
| Tool least privilege | Model-invoked tools are a per-feature allowlist, read-only by default, run with the **calling principal's** permissions (never a service superuser), tenant-pinned, with argument validation and per-call audit; no tool that sends messages, spends money or deletes data |
| Cost and rate limits | Budget and quota enforced at the gateway before the provider call (BR-T111, COST_MODEL section 5); per-principal rate limits; hard stop, no silent overage; circuit breaker on provider errors |
| Non-AI fallback | Each AI feature degrades to a deterministic path (templates, rules, manual entry) when disabled, over budget, consent-denied or the provider is down; core flows never depend on a model |
| Invariant | **AI is never the sole enforcer of a financial, security or legal invariant.** Enforcement is deterministic server code (policy, RLS, billing state machine, consent checks). A model may flag or recommend; it cannot grant, deny, charge, refund or decide compliance |
| Logging | Prompts and outputs kept at the minimum needed, redacted (INV-T14); retention OPEN-X03 |

Tests: TEST-AI-001 to TEST-AI-006 (R3-9).

## R3-8. Regulator and law-enforcement requests

The procedure is **PROC-16** in `../18_OPERATIONS_AND_SUPPORT/OPERATIONS_AND_SUPPORT_PROCESSES.md`. Security requirement: no disclosure path exists outside PROC-16; engineers and support cannot export user data on a request letter; scope-limited extracts are produced only on a counsel-approved, logged instruction.

## R3-9. Threat to test pairs

**None of these tests has been written or executed.** Status is `Specified (not executed)`. Full rows: `../16_QA_AND_TESTING/TEST_CATALOG.md` (Revision 3 additions).

| Threat | TEST id | Key assertion |
|---|---|---|
| Stale permission cache | TEST-SEC-036 | After role removal commit, request past the staleness bound is denied; primary-read actions denied at once |
| Unsafe remote artifact (federated remote or uploaded file) | TEST-SEC-037, TEST-SEC-038 | Hash/signature mismatch refused; uploaded artifact served inert from UGC domain |
| Backup restore | TEST-DEP-009 | Restore into an isolated environment passes integrity and tenant-isolation checks |
| Cross-tenant ID swap | TEST-TEN-011 | Foreign ID returns 404, no side effect |
| Duplicate webhook | TEST-BIL-010 | Replayed event applied once |
| Token leakage | TEST-SEC-039 | Tokens absent from logs, URLs, error bodies, analytics |
| Prompt injection | TEST-AI-001 | Injected instructions inside data are not obeyed |
| Network interruption | TEST-REL-014 | Interrupted mutation retried safely: no duplicate, no lost write |

## R3-10. Open decisions raised

| ID | Decision | Owner role |
|---|---|---|
| OPEN-X01 | Device trust: confirm out of scope for v1 | Security Architect |
| OPEN-X02 | Confirm permission-cache staleness and denylist propagation values against load tests | Security Architect + SRE Lead |
| OPEN-X03 | AI prompt/output log retention | Privacy Lead + AI owner |
| OPEN-X04 | Counsel review owner for regulator/law-enforcement requests (PROC-16) | Executive sponsor (to name) |
| OPEN-X05 | Whether any "view as user" capability is built at all (R3-4) | Product + Security |

OPEN-X01..X05 mirror the entries in OPEN_DECISIONS.md section 6, which is the register of record.


---

<a id="record-security-rev2"></a>
## Preserved source record: SECURITY_REV2

> Consolidated on 2026-10-27. The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. Approval conditions and authority remain unchanged: this move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_REV2.md -->
<a id="record-security-rev2--security-and-privacy-architecture-revision-2-sec-02-rev2"></a>
# Security and Privacy Architecture, Revision 2 (SEC-02 REV2)

Doc ID: SEC-02-R2 · Owner: Security Architect + Privacy Lead · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-18 (security side), REVW-31, REVW-32 · Security part of: REVW-25, REVW-41, REVW-45 · Relates: SEC-02 `SECURITY_ARCHITECTURE.md`, SEC-01 `THREAT_MODEL.md`, PRIV-01 `PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md`, BE-01-R2, DB-02-R2, BR-REG-R2 section 3 (constants CONST-S01 to CONST-S15)

> **Folded into `SECURITY_ARCHITECTURE.md` on 2026-10-27.** Change record only; edit the original.

**Relationship (state of supersession only).** Before the additive-only rule, six existing files were edited in place in this fix pass; this file restates those edits as one revision so that readers have one place, and it corrects one pointer. In-place edits: `SECURITY_ARCHITECTURE.md` (session rows of section 2.3, CSP and header rows of section 6, the AC range in section 13), `THREAT_MODEL.md` (rows C15, C16, AC-33, AC-34, RR-8, coverage row, trust-boundary wording), `PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md` (PUR-24, section 3.1, cleanup wording in the revocation table). **Pointer correction:** those edits point to "the BR constants table in `BUSINESS_RULES_REGISTRY.md`"; the table exists as **`BUSINESS_RULES_REGISTRY.md#record-business-rules-registry-rev2` section 3 (CONST-S01 to CONST-S15)** and is the target of every such pointer. Where SEC-02 v1.0 text and this file differ, this file wins once accepted; until then SEC-02 v1.0 plus the in-place edits stand. Governance should link this file from `14_SECURITY_PRIVACY_COMPLIANCE/INDEX.md`.

All content is **[TARGET]**. No compliance or certification is claimed.

<a id="record-security-rev2--1-session-constants-one-table-cited-revw-18"></a>
## 1. Session constants: one table, cited (REVW-18)

SEC-02 section 2.3 carries **no session number of its own**. Every value is a citation:

| Value needed | Source | SEC-02 v1.0 text it retires |
|---|---|---|
| Access token lifetime | CONST-S01 | "15 min" stays, now cited |
| Refresh idle and absolute lifetime, "remember me", privileged-role caps | CONST-S02, S03, S04, S05 (BR-T056, BR-T044) | "idle 30 days sliding, absolute 90 days" |
| Step-up freshness (`recent_auth_at`) | CONST-S06 (BR-T057) | "within 10 min" (and ACTION_REGISTRY's 15 min, PWA-01's open items) |
| Refresh reuse leeway | CONST-S07 (BR-T050, INV-T33) | PWA-01's "grace <= 10 s" |
| Email code, reset token, referee token, export link | CONST-S08 to S11 | any restated TTL |
| Idempotency retention | CONST-S12 | BE-01 section 8 "24 h / 7 d" |
| Consent revocation effect | CONST-S13 | "within 1 minute", "cache TTL" |

Duplicate numbers are removed from SEC-02 and from any document that restates them; PWA-01 (frontend) and ACTION_REGISTRY must cite `CONST-Sxx` and close OPEN-FE-08 and OPEN-FE-10 (listed for governance). A lint that greps the doc set for the retired literals is added to the doc review gate.

<a id="record-security-rev2--2-cookie-scope-refresh-binding-and-user-content-domain-revw-32"></a>
## 2. Cookie scope, refresh binding and user-content domain (REVW-32)

| Control | Design |
|---|---|
| User content on a **separate registrable domain** | Served from `<ugc-domain>`, a registrable domain different from the app apex, cookieless; never a subdomain of the apex. CSP `img-src` and `media-src` name `https://<ugc-domain>`. Reason: any host under the apex shares its cookie scope and can set cookies into the app (cookie tossing); a different registrable domain cannot. SEC-02 section 6.1 (CSP) and PWA-01 section 12 now agree. The concrete domain is **OPEN-B57** and must not sit on a public-suffix hosting where other tenants share the registrable domain |
| `__Host-ts_at` kept for the refresh window | The access cookie's `Max-Age` is the refresh window (CONST-S02/S03), not the 15 min of the JWT inside it. After the JWT `exp`, every route rejects it as expired, but the refresh route reads its `sid` (signature verified, `exp` ignored on that route only) |
| Refresh bound to the session id | The refresh row stores `session_id`. `POST /auth/refresh` succeeds only when it equals the `sid` in the `__Host-ts_at` cookie sent with it. `__Host-` cookies cannot carry `Domain` and cannot be set from a sibling host; the path-scoped `__Secure-ts_rt` can (tossing). A tossed refresh value from another session therefore fails the binding, is rejected **without rotation** and raises `refresh-binding-mismatch` |
| Duplicate cookie names | Two `ts_rt` (or any security cookie) in one request is treated as tossing: both are cleared in the response, the request is rejected, an alert is raised |
| Apex hygiene | Only first-party hosts exist under the apex; `HSTS includeSubDomains`; subdomain-takeover monitoring (dangling DNS check in the SRE runbook) |

**STRIDE and abuse rows (in `THREAT_MODEL.md`, already added in place):** C15 Cookie scope (apex and sibling subdomains); C16 Telemetry ingest; AC-33 cookie tossing and session fixation from a sibling host; AC-34 abuse of the unauthenticated telemetry endpoint; RR-8 compromised first-party sibling host. Tests: refresh with a mismatched `sid` fails and does not rotate; duplicate `ts_rt` rejected; a response never sets a cookie with `Domain=<apex>`.

<a id="record-security-rev2--3-edge-first-limits-for-authentication-revw-41-security-side"></a>
## 3. Edge-first limits for authentication (REVW-41, security side)

Credential stuffing (AC-04) is stopped in layers: (1) the CDN/WAF applies per-IP and per-ASN limits and bot challenge to all auth routes before the origin sees them; (2) the application keeps **durable** per-account and per-IP+account counters in the logged `auth_throttle` table (DB-02-R2 section 1), so a failover or crash does not reset a throttle (the UNLOGGED table of BE-01 v1.0 did); (3) responses never reveal account existence; (4) the Redis adapter is introduced earlier than before: when `auth_throttle` writes pass 5% of primary write IOPS or limit-check p95 passes 5 ms, after any Sev-2 credential-stuffing incident, and before three API replicas run in production (BE-01-R2 section 5). Non-auth classes are limited at the edge and in process, with no database write.

<a id="record-security-rev2--4-operational-telemetry-versus-analytics-revw-31"></a>
## 4. Operational telemetry versus analytics (REVW-31)

Problem: client and remote-activation SLIs (OPS-SLO SLO-03, SLO-13 to SLO-16) rest on browser beacons that were all treated as consent-gated, so field SLIs risked resting on a small, self-selected subset, and nothing separated reliability telemetry from analytics.

| Class | Content | Basis | Route |
|---|---|---|---|
| **Operational** (PUR-24) | Server metrics, logs, traces; client beacons limited to route template (never the concrete URL), error class, build and remote version, timing bucket, coarse device class, connection class, remote-activation outcome, and a random per-page-load id that is never stored client-side. No user id, no persistent or cross-session id, no concrete URL or query, no referrer, no full user agent, no free text, no DOM or form content | Legitimate interest for service operation and security, **pending counsel (OPEN-08)** | `/otlp` same-origin proxy: fixed upstream, path allowlist, no redirects, body cap [TARGET 16 KB], schema-validated, rate-limited at the edge first |
| **Product analytics** (PUR-14) | Anything keyed to a person or persistent id: funnels, feature use, cohorts | Consent `analytics.product` | `POST /analytics/events` (API-21-02); the server rejects when consent is absent |

Rules: a beacon type is on the operational allowlist or consent-gated, with no third class; a schema lint fails when an allowlisted field can identify a person; operational beacons cannot carry a user id even if the user consented to analytics, so the streams never join; field SLIs state their **coverage** (sessions with beacons ÷ all sessions, the denominator counted server-side from anonymous request counters) and that field data is self-selected, so no population claim is made from it. **Synthetic-only alternative** if counsel rules that operational beacons also need consent: the client SLIs of record become scheduled real-browser probes from fixed regions on reference device profiles, and consented RUM becomes diagnosis only. The text is in `PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md` section 3.1 and PUR-24.

<a id="record-security-rev2--5-consent-without-a-cache-revw-25-security-side"></a>
## 5. Consent without a cache (REVW-25, security side)

Authorization reads consent from the primary at read time (CONST-S13); no layer caches a consent decision. Roles and capabilities are cached per `grants_version` for at most the TTL in BE-01 section 5; consent is not part of that cache. Search and matching filter against the live privacy-owned view `pv_consent_current` in the same SQL statement as the query (DB-02-R2 section 4). Cleanup jobs that delete derived documents are not the control. Tests treat any time bound as a polling timeout only, never as an authorization tolerance.

<a id="record-security-rev2--6-where-the-rest-of-the-finding-set-lands"></a>
## 6. Where the rest of the finding set lands

| Finding part | Document |
|---|---|
| Module dependency graph, complete and generated from imports, including the privacy-consumer edges and `ai` to `assessment` | BE-01-R2 section 2 |
| SQL transition rules generated from the SM table plus a parity test (protects the column-privilege guard of INV-T04 and INV-T11 from drift) | DB-02-R2 section 5; wording for FF-11 in BE-01-R2 section 9 |
| Issuer class, issuer independence and `instructor` revocation | DB-02-R2 section 6; INV-T46, INV-T47 in INV-REG-R2 |
| Idempotency retention class and the natural-key declaration | BE-01-R2 section 4 |

<a id="record-security-rev2--7-amendments-and-open-items-for-governance"></a>
## 7. Amendments and open items for governance

| Item | Needed |
|---|---|
| OPEN-B57 | Concrete user-content registrable domain |
| OPEN-08 (counsel) | Operational-telemetry basis; if refused, the synthetic-only alternative of section 4 applies |
| PWA-01, ACTION_REGISTRY | Cite CONST-S02/S03/S06/S07; close OPEN-FE-08, OPEN-FE-10; retire "15 min" and "grace <= 10 s" |
| ADR-T06 amendment | Refresh bound to the `__Host-` session id; `__Host-ts_at` lifetime = refresh window; duplicate-cookie rejection |
| FF additions | Cookie-scope tests (mismatched `sid`, duplicate cookie, no `Domain=<apex>`), beacon-schema lint, retired-literal doc lint |
| SEC-01 | AC-33, AC-34, C15, C16, RR-8 (present in the file already) |

<!-- source-record-end: Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_REV2.md -->
