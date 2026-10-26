# Security and Privacy Architecture, Revision 2 (SEC-02 REV2)

Doc ID: SEC-02-R2 · Owner: Security Architect + Privacy Lead · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-18 (security side), REVW-31, REVW-32 · Security part of: REVW-25, REVW-41, REVW-45 · Relates: SEC-02 `SECURITY_ARCHITECTURE.md`, SEC-01 `THREAT_MODEL.md`, PRIV-01 `PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md`, BE-01-R2, DB-02-R2, BR-REG-R2 section 3 (constants CONST-S01 to CONST-S15)

**Relationship (state of supersession only).** Before the additive-only rule, six existing files were edited in place in this fix pass; this file restates those edits as one revision so that readers have one place, and it corrects one pointer. In-place edits: `SECURITY_ARCHITECTURE.md` (session rows of section 2.3, CSP and header rows of section 6, the AC range in section 13), `THREAT_MODEL.md` (rows C15, C16, AC-33, AC-34, RR-8, coverage row, trust-boundary wording), `PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md` (PUR-24, section 3.1, cleanup wording in the revocation table). **Pointer correction:** those edits point to "the BR constants table in `BUSINESS_RULES_REGISTRY.md`"; the table exists as **`BUSINESS_RULES_REGISTRY_REV2.md` section 3 (CONST-S01 to CONST-S15)** and is the target of every such pointer. Where SEC-02 v1.0 text and this file differ, this file wins once accepted; until then SEC-02 v1.0 plus the in-place edits stand. Governance should link this file from `14_SECURITY_PRIVACY_COMPLIANCE/INDEX.md`.

All content is **[TARGET]**. No compliance or certification is claimed.

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
