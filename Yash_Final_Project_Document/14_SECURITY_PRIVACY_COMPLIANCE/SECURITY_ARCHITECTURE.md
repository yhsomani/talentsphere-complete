# Security Architecture

Doc ID: SEC-02 · Owner: Security Architect · Version 1.0 · Status: Under Review · Relates: ADR-T06, T07, T12, T19, T21 · INV-T01..T20 · FF-01..FF-10 · BR-T041, BR-T050 · Companions: SEC-01 `THREAT_MODEL.md`, SEC-03, SEC-04, BE-01, API-STD, INT-01, DB-02

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
| Function-level | Admin/support/moderator actions require platform role grants **and** step-up/MFA; admin remote is not delivered to non-admin sessions (defence in depth) |
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
