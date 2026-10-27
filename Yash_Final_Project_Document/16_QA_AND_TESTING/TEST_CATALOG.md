# Test Catalog

Doc ID: QA-CAT · Owner: QA Architect · Version 1.0 · Status: Draft for Review · Relates: QA-STRAT, QA-AC, CC-INV (INV-T01…T20, FF-01…FF-10), OPS-FMEA, DOM-00, ID_REGISTRY

> **Revision 2 folded in (2026-10-27)** from `TEST_CATALOG.md#record-test-catalog-rev2`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.

## 1. How to read this catalog

- **TEST-ID scheme:** `TEST-<CAT>-NNN`. Categories: SEC security/authz, TEN tenancy, EVD evidence/verification, ASM assessment/AI, HIR hiring/matching, API contracts/events/state, FED federation, PWA service worker/offline, BIL billing, PRV privacy, DAT data/migration, REL resilience, PER performance/load, A11 accessibility, MOB device, DEP deployment/release, REC recovery, OBS observability, MSG messaging/moderation/institutions, SRC search.
- **Level codes:** U unit · C component · I integration · K contract · E end-to-end · S security · A accessibility · P performance · L load · R resilience · O offline · M mobile device · F federation · D deployment · G migration · V recovery · X static/lint.
- **Automation:** `A1` automated on every PR · `A2` automated nightly or pre-release · `A3` automated against deployed environment (staging/prod synthetic) · `S` scripted with human judgement · `M` manual or device-lab.
- **Links:** `AC-<DOM>-<NN>-<NN>` acceptance criteria (scheme in QA-AC), `FEAT-*`, `INV-T*`, `BR-T*`, `FF-*`, `ADR-T*`.
- **Links to feature acceptance criteria:** `AC-<DOM>-<NN>-<NN>` ids are the real ids defined in `05_FEATURE_SPECIFICATIONS/SPEC_G1…G4` (reconciled 2026-10-25). Where the feature exists in `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` but no AC has been written yet, the link reads `FEAT-xx-yy (AC pending)` — each is a **specification gap** to close (listed in §15). `AC-00-*` are platform (cross-cutting) criteria defined in QA-AC §9. Links to INV/FF/BR/ADR are canonical.
- **Statuses:** all tests are *specified*, none implemented. This catalog does not claim any test exists in code. Reference-project tests are [REF] only.
- **Conditional tags (REVW-07, REVW-24):** **[COND-FED]** = runs only once federated runtime is activated (`MF_MODE=federated`, ADR-T03a: OPEN-03 closed with at least 3 named independent frontend teams and a recorded WP-FED-SPIKE result). In the default `bundled` mode these tests are not run and do not gate Phase 1 exit. **[COND-OUTBOX]** = runs only once the offline outbox subsystem is activated on the ADR-T10 trigger (telemetry or research shows need); Phase 1 offline is read cache plus local unsent drafts, no outbox (TEST-PWA-013).
- **Special verifications (mandatory):** tagged `★` and indexed in §14.

## 2. Security and authorization (SEC)

| TEST-ID | Verifies (Given / When / Then) | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-SEC-001 | Given a route registered without a policy action, when CI runs the route-registry lint, then the build fails | X | FF-01, INV-T01 | A1 |
| TEST-SEC-002 | Given no/invalid credentials, when every protected route is called, then 401 problem+json and no data; unregistered action is denied | I | AC-00-01-01, INV-T01 | A1 |
| TEST-SEC-003 | Given the role × resource matrix in USR-01, when generated tests call each verb as each role, then results equal the matrix (allow and deny) | I | AC-02-03-01, FEAT-02-03, INV-T01, INV-T02 | A1 |
| TEST-SEC-NEG-01 | Negative control (REVW-01): when INSTADM or FAC (or ORGADM not on the job team) request an individual evidence item, application content or individual attempt, then access is denied; test fails if the generated matrix ever allows it | I | INV-T41, BR-T100, BR-T105, DT-01 |
| TEST-SEC-004 ★IDOR | Given candidate A and B's application id, when A GETs/PUTs/DELETEs it, then 404 (no existence leak) and no state change | I | AC-10-14-04, AC-10-05-05, FEAT-10-02, INV-T02 | A1 |
| TEST-SEC-005 ★IDOR | Given evidence owned by B, when A reads/updates/deletes/downloads it, then denied | I | AC-05-07-01, AC-22-01-03, INV-T02, INV-T29 | A1 |
| TEST-SEC-006 ★IDOR | Given a conversation A is not part of, when A lists/reads/posts, then denied | I | FEAT-13-01 (AC pending), INV-T02 | A1 |
| TEST-SEC-007 ★IDOR | Given a signed download URL minted for B, when A uses it or alters the object key, then denied; URLs expire and bind to principal/object | I | AC-05-12-01, INV-T02, INV-T14 | A1 |
| TEST-SEC-008 ★IDOR | Given list endpoints with filter/sort/cursor params, when ids or cursors are tampered or enumerated, then no foreign records appear and invalid cursors are rejected | I | AC-00-01-02, AC-11-01-06, AC-09-01-05, INV-T02 | A1 |
| TEST-SEC-009 | Given a recruiter and a candidate, when consent scope is absent, present, then revoked, then evidence read (`evidence.share_artefact` for that org) is denied/allowed/denied on the first read after each change commits (no consent cache; test timeout 60 s; CSC section 6) | I | AC-22-01-02, AC-22-01-03, INV-T15, INV-T29 | A1 |
| TEST-SEC-010 | Given login, when cookies are inspected, then session cookie is httpOnly, Secure, SameSite=Lax; no token in localStorage/sessionStorage/JS-readable storage | E | AC-01-02-01, ADR-T06, INV-T14 | A1 |
| TEST-SEC-011 | Given a refresh token used twice, when reuse is detected, then the whole family is revoked; concurrent-tab rotation race is tolerated within the grace rule | I | AC-01-04-02, BR-T050 | A1 |
| TEST-SEC-012 ★ | Given a remote's code, when it attempts to read cookies/tokens/storage or import another remote, then static scan fails the build and the runtime probe finds no credential access | X/E | INV-T16, FF-03 | A1 |
| TEST-SEC-013 | **[COND-FED]** Given a remote asset with wrong SRI/hash or violating CSP, when loaded, then it is blocked and the shell falls back to last-known-good | F | ADR-T19, FF-04 | A2 |
| TEST-SEC-014 | **[COND-FED]** Given a tampered or unsigned manifest, when the shell fetches it, then it is rejected; a rotated signing key works during the dual-key window | F | ADR-T19 | A2 |
| TEST-SEC-015 | Given repository, build artefacts and client bundles, when secret scanning runs, then no secrets are found; canary secret in env never appears in output | X | INV-T14 | A1 |
| TEST-SEC-016 | Given canary PII/secret strings in requests, when logs, traces and error reports are searched, then none appear unredacted | I | AC-00-01-03, AC-06-01-01, INV-T14, INV-T43 | A1 |
| TEST-SEC-017 | Given cookie auth, when a cross-site request mutates state without the CSRF defence, then it is rejected | S | AC-00-01-08, ADR-T06 | A1 |
| TEST-SEC-018 | Given features that fetch URLs, when pointed at internal/metadata/link-local/redirecting addresses, then blocked (SSRF) | S | AC-05-01-06, AC-03-01-03, INV-T14 | A2 |
| TEST-SEC-019 | Given the EICAR test file, when uploaded, then quarantined, never visible or downloadable by others; clean files become visible after scan | I | AC-05-12-01, AC-05-12-02, BR-T003, INV-T23 | A1 |
| TEST-SEC-020 | Given uploads with spoofed type, oversize, polyglot or archive-bomb content, when submitted, then rejected with problem+json | S | AC-05-01-04 | A2 |
| TEST-SEC-021 | Given repeated attempts on login, verification-code and referee-token endpoints, when thresholds are crossed, then limits/lockouts apply and the limiter fails closed on store failure | I | AC-01-01-07, AC-01-02-02, AC-06-01-04 | A1 |
| TEST-SEC-022 | Given a support grant, when requested without reason, longer than 4 h, or expired, then denied/auto-expired and audited | I | FEAT-20-02 (AC pending), BR-T041, INV-T18 | A1 |
| TEST-SEC-023 | Given a support operator without grant, when reading a user's personal data, then denied and the attempt is audited | I | FEAT-20-02 (AC pending), INV-T18 | A1 |
| TEST-SEC-024 | Given SSO, when state/nonce are replayed or SAML signatures altered, then rejected; IdP outage uses audited break-glass path | I | FEAT-01-08 (AC pending), ADR-T06 | A2 |
| TEST-SEC-025 | Given a release candidate, when dependency/vulnerability scan and SBOM generation run, then no unwaived critical findings and SBOM + signature attach to the artefact | D | OPS-REL §6 | A1 |
| TEST-SEC-026 | Given request bodies containing `verified`, `role`, `org_id`, `owner_id`, when posted, then the server ignores/rejects them (mass assignment) | I | AC-05-01-03, AC-05-02-02, INV-T04, INV-T02 | A1 |
| TEST-SEC-027 | Given HTTP responses, when headers are inspected, then CSP, HSTS, frame-ancestors, referrer, X-Content-Type-Options and `Cache-Control: private/no-store` for authenticated data are present | S | INV-T14, ADR-T19 | A1 |
| TEST-SEC-028 | Given unsafe input in profile/message/job text, when rendered in shell and remotes, then output is escaped; no stored XSS via markdown/HTML sanitiser bypass | S | AC-00-01-09, AC-03-01-03 | A2 |

## 3. Tenancy (TEN)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-TEN-001 ★ | Given seeded tenant B canary rows in every tenant table, when a tenant-A principal calls every generated list/get endpoint, then no B data is returned | I | FEAT-02-07 (AC pending), FF-05, INV-T03 | A1 |
| TEST-TEN-002 | Given the app DB role without tenant context set, when queried directly, then RLS returns zero rows and writes fail | I | FEAT-02-07 (AC pending), INV-T03 | A1 |
| TEST-TEN-003 | Given a job/event payload carrying another tenant's ids, when the worker processes it, then it cannot read or write outside its tenant | I | INV-T03, ADR-T09 | A1 |
| TEST-TEN-004 | Given search and recommendation indices and caches, when tenant A searches, then keys/filters isolate tenant data (no B document or snippet) | I | FEAT-11-05 (AC pending), INV-T03 | A1 |
| TEST-TEN-005 | Given exports, analytics and institution reports, when run by a tenant principal, then only that tenant's rows appear and small-cell suppression applies | I | FEAT-18-04 (AC pending), INV-T03, INV-T41 | A2 |
| TEST-TEN-006 | Given CDN and HTTP caches, when two tenants request the same URL path, then authenticated responses are never shared (Vary/private) | S | INV-T03, INV-T14 | A3 |
| TEST-TEN-007 | Given org-role changes, when a member is removed, then access ends immediately for new requests and existing sessions' org grants are re-evaluated | I | AC-02-03-01, INV-T02 | A1 |

## 4. Evidence and verification (EVD)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-EVD-001 | Given SM-EVIDENCE, when every (state, event) pair is applied, then only declared transitions succeed; terminal states are immutable | U | AC-05-05-05, AC-05-05-06, INV-T04, INV-T11 | A1 |
| TEST-EVD-002 | Given an evidence create call with `source=ai`, when posted, then rejected by schema | I | AC-05-01-03, INV-T08 | A1 |
| TEST-EVD-003 | Given a candidate, when they call any API to mark their own evidence verified, then denied; only the server-side verification transition raises the rung | I | AC-05-02-02, INV-T04 | A1 |
| TEST-EVD-004 | Given verification codes/tokens, when stored, then only hashes exist; use is single-use, expiring, bound to one request, never in any response to the verified person | I | AC-06-01-01, AC-06-01-03, INV-T05, INV-T43 | A1 |
| TEST-EVD-005 | Given a referee token, when reused, expired, or presented for another request, then rejected without revealing validity details | I | AC-06-02-02, AC-06-10-02, INV-T05, INV-T24 | A1 |
| TEST-EVD-006 | Given reference requests, when day 14 passes or reminders exceed 2, then the request expires/reminders stop | I | AC-06-02-06, AC-06-10-01, BR-T004 | A2 |
| TEST-EVD-007 | Given evidence revoked, when processed, then dependent skill confidence and match explanations are recomputed asynchronously and audited | I | AC-05-05-03, AC-11-07-01, BR-T005 | A1 |
| TEST-EVD-008 | Given each ladder rung (claimed, artifact-backed, peer-attested, authority-verified), when rendered in every surface, then wording/badge matches rung and a claim is never labelled verified | C | AC-05-02-04, AC-06-04-01, INV-T04, ADR-T14 | A1 |
| TEST-EVD-009 ★ | Given upload success but evidence-row creation failure (and the reverse), when the operation partially fails, then no visible orphan exists, the reaper cleans the object, and the user sees a retryable state | I | AC-05-12-03, AC-00-01-10, INV-T10 | A1 |
| TEST-EVD-010 | Given the requester of verification, when they call any endpoint, then they cannot obtain the verification code or referee token | I | AC-06-01-01, INV-T05 | A1 |
| TEST-EVD-011 | Given a candidate with concurrent verification requests for the same claim, when both are submitted, then one active request exists (natural key) | I | FEAT-06-01 (AC pending: concurrent requests), INV-T10 | A1 |

## 5. Assessment and AI (ASM)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-ASM-001 | Given an `AI_PROHIBITED` assessment session, when any caller (UI, API, service account) invokes the AI gateway, then blocked server-side | I | AC-07-05-01, INV-T06 | A1 |
| TEST-ASM-002 | Given a code assessment while no sandbox runner exists, when submitted, then status is `unverified` and no verified evidence is minted; no simulated pass | I | AC-07-04-01, ADR-T13 | A1 |
| TEST-ASM-003 | Given the sandbox runner, when submitted code attempts network, host-file, or privilege-escalation access, then denied and logged | S | AC-07-03-01, ADR-T13 | A2 |
| TEST-ASM-004 | Given an integrity anomaly, when raised, then it routes to human review, no automatic sanction, and an appeal path exists | E | AC-07-07-01, AC-07-07-03, INV-T20, INV-T09 | A2 |
| TEST-ASM-005 | Given a free-tier user without budget flag, when invoking AI, then no paid inference occurs; with flag, quota applies | I | AC-09-01-06, FEAT-17-02 (AC pending), INV-T07 | A1 |
| TEST-ASM-006 | Given parallel AI calls from one user/org at the quota edge, when executed concurrently, then total spend never exceeds the budget | I | FEAT-17-02 (AC pending), INV-T07 | A2 |
| TEST-ASM-007 | Given AI output or AI "memory", when saved, then it is never stored as evidence or profile truth | I | AC-05-01-03, INV-T08 | A1 |
| TEST-ASM-008 | Given resumes/messages containing prompt-injection text, when processed by AI features, then gateway policy, tools and budgets are unchanged | S | FEAT-17-01 (AC pending), ADR-T12 | A2 |
| TEST-ASM-009 | Given an AI provider outage or timeout, when features are used, then breaker opens and non-AI path remains functional | R | FEAT-17-01 (AC pending), FM-42 | A2 |
| TEST-ASM-010 | Given an attempt submit double-click or retry, when sent twice with one key, then one attempt is recorded | I | AC-07-02-03, INV-T10 | A1 |
| TEST-ASM-011 | Given an assessment result, when scored, then the same inputs give the same result and the score's provenance is stored (no simulated scoring) | U | AC-07-06-01, AC-07-06-02, ADR-T13 | A1 |

## 6. Hiring, matching and pipelines (HIR)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-HIR-001 ★ | Given N parallel apply requests by one candidate to one job, when processed, then exactly one active application exists (BR-T001) and others return the existing one | I | AC-10-02-05, AC-10-02-04, BR-T001, INV-T21 | A1 |
| TEST-HIR-002 | Given SM-APPLICATION, when every (stage, event) pair is applied, then illegal transitions are rejected and terminal states immutable | U | AC-10-05-03, AC-10-05-04, BR-T002, INV-T11 | A1 |
| TEST-HIR-003 ★ | Given two recruiters changing one application stage simultaneously, when both submit with `If-Match`, then one succeeds and the other gets 412 with fresh state | I | AC-10-05-02, ADR-T08 | A1 |
| TEST-HIR-004 | Given any code path, when searched/tested, then no transition to rejected/ranked-out/flagged occurs without a human actor id | I | AC-10-06-01, AC-10-06-03, INV-T09 | A1 |
| TEST-HIR-005 | Given match results, when listed, then 100% carry rationale and uncertainty indication | C/I | AC-11-02-01, INV-T19, GOAL-03 | A1 |
| TEST-HIR-006 | Given ranking code, when its inputs are enumerated, then billing/entitlement/payment data is not among them (allowlist test) | U | AC-11-01-05, AC-11-03-01, INV-T19 | A1 |
| TEST-HIR-007 | Given a seeded demographic-balanced dataset, when the adverse-impact report job runs, then it produces metrics and flags threshold breaches for human review | I | FEAT-11-09 (AC pending), GOAL-03 | A2 |
| TEST-HIR-008 ★ | Given a POST with an `Idempotency-Key`, when replayed (network retry), then the same response returns and no duplicate effect | I | AC-10-02-02, INV-T10, FF-07 | A1 |
| TEST-HIR-009 | Given an `Idempotency-Key` reused with a different body, when posted, then 422 problem+json | I | AC-10-02-03, FF-07 | A1 |
| TEST-HIR-010 | Given a job closed while applications are in flight, when a candidate applies after close, then rejected with a clear error and in-flight drafts preserved | I | AC-10-02-06, AC-09-03-04, BR-T001 | A1 |
| TEST-HIR-011 | Given candidates viewing the explanation, when evidence is revoked, then the explanation updates (links BR-T005) | E | AC-11-07-01, BR-T005 | A2 |

## 7. API, contracts, events and state (API)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-API-001 | Given an OpenAPI change, when diffed against the released version, then breaking changes fail unless the major version bumps | K | FF-06, ADR-T08 | A1 |
| TEST-API-002 ★ | Given each remote's recorded API expectations, when run against the API candidate (and the reverse), then incompatible pairs fail the compatibility gate | K | FF-08, ADR-T18 | A1 |
| TEST-API-003 | Given every unsafe-mutation route, when linted, then it accepts `Idempotency-Key` or declares a natural key (REVW-14, FF-07 as reworded) | X | FF-07 | A1 |
| TEST-API-004 | Given all error paths, when triggered, then responses are RFC 9457 problem+json with stable `type` codes | K | AC-00-01-04, ADR-T08 | A1 |
| TEST-API-005 | Given cursor pagination under concurrent inserts/deletes, when paged, then no duplicates/gaps within contract and tampered cursors are rejected | I | AC-00-01-05, AC-11-01-06, ADR-T08 | A1 |
| TEST-API-006 | Given import graph, when a module imports another module's internals, then dependency-cruiser fails | X | FF-02 | A1 |
| TEST-API-007 | Given AsyncAPI event schemas, when a producer adds/changes fields, then compatibility check enforces additive-only for consumers | K | ADR-T09 | A1 |
| TEST-API-008 | Given a failure injected after state change but before dispatch (and a rollback), when inspected, then the outbox event exists iff the transaction committed | I | INV-T12 | A1 |
| TEST-API-009 | Given an event delivered twice, when consumed, then exactly one effect occurs (dedupe by `event_id`) | I | ADR-T09, INV-T10, INV-T37 | A1 |
| TEST-API-010 ★ | Given a stale worker whose lease expired and was re-claimed, when it tries to commit, then the fencing check rejects it | I | ADR-T09, FM-36 | A1 |
| TEST-API-011 ★ | Given a multi-step operation (apply + attach evidence + notify) failing mid-way at each step, when retried, then final state is consistent and compensation runs where external effects occurred | I | AC-00-01-10, AC-10-02-08, INV-T10, INV-T12 | A1 |
| TEST-API-012 | Given each declared SM-*, when exhaustively tested (table-driven), then only declared transitions pass | U | INV-T11 | A1 |
| TEST-API-013 | Given consequential side effects, when performed, then an audit event with actor, resource, reason and request id is written | I | INV-T10, AC-00-01-06, INV-T36 | A1 |
| TEST-API-014 | Given `GET /me/capabilities`, when compared with server enforcement for every action, then UI hints never exceed server allowance | I | FEAT-01-09 (AC pending), INV-T01 | A1 |
| TEST-API-015 | Given the route registry, when linted, then every unsafe mutation route either accepts `Idempotency-Key` or declares a natural key; queued-operation routes retain idempotency records for at least the outbox TTL (14 d) | X/I | FF-07, REVW-14, BR-T114 | A1 |
| TEST-API-016 | Given the state vocabulary, when linted, then every state name used in OpenAPI, AsyncAPI, SQL enums and UI maps comes from `STATE_MACHINES.md` | X | FF-11 | A1 |

## 8. Federation (FED)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-FED-001 ★ | **[COND-FED]** Given a remote returning 404 or timing out, when its route is opened, then a fallback panel appears; shell navigation and other remotes keep working | F/E | AC-00-02-01, ADR-T03, FM-01 | A2 |
| TEST-FED-002 | **[COND-FED]** Given a slow remote entry, when the load timeout elapses, then last-known-good is used and the user is informed | F | AC-00-02-02, ADR-T18 | A2 |
| TEST-FED-003 ★ | **[COND-FED]** Given a remote whose `hostContract` range excludes the shell version, when activated, then it is rejected and last-known-good pinned | F | AC-00-02-03, ADR-T18, FF-08 | A1 |
| TEST-FED-004 | **[COND-FED]** Given a remote whose `apiRange` excludes the deployed API, when activated, then it is not mounted | F | AC-00-02-04, ADR-T18 | A1 |
| TEST-FED-005 ★ | **[COND-FED]** Given two remotes requiring conflicting versions of a singleton dependency, when validated in CI and at runtime, then the build/promotion fails or the offending remote is not mounted | F | FF-04, FM-03 | A1 |
| TEST-FED-006 | **[COND-FED]** Given a federation dependency graph with a cycle, when validated, then CI fails | X | FF-04 | A1 |
| TEST-FED-007 | **[COND-FED]** Given a remote importing another remote's source, when linted, then CI fails | X | FF-03 | A1 |
| TEST-FED-008 | **[COND-FED]** Given a remote throwing during render, when mounted, then its error boundary contains it and shell state survives | C/E | AC-00-02-05, FM-04 | A1 |
| TEST-FED-009 ★ | **[COND-FED]** Given a deploy of a new remote version while old tabs are open, when new navigation occurs, then new version loads without breaking old sessions and manifest TTL is honoured | F/E | ADR-T18, FM-05 | A2 |
| TEST-FED-010 | Given the default `MF_MODE=bundled`, when the critical e2e suite runs, then it passes in bundled mode on every PR (this is the Phase 1 gate); **[COND-FED]** once federated runtime is activated, results must also equal federated mode | E | ADR-T03a, REVW-07, OPEN-03 | A1 |
| TEST-FED-011 | Given a user action in a remote, when it reaches API and worker, then one W3C trace spans shell → remote → API → worker | I | ADR-T16, AC-00-03-01 | A3 |
| TEST-FED-012 | **[COND-FED]** Given a build, when remote asset paths are inspected, then they sit under immutable `/mf/<name>/<version>/` paths with content-hashed files, are served `immutable`, and only the signed registry document is mutable | D | OPS-DEP §3 | A1 |
| TEST-FED-013 ★ | **[COND-FED]** Given a shared/third-party dependency or its CDN unavailable, when the app loads, then critical path still functions or fails into the documented fallback | F/R | FM-11, AC-00-02-06 | A2 |
| TEST-FED-014 | **[COND-FED]** Given a rollback of remote A (higher-sequence entry or `rollbackTo`), when performed, then remote B and the shell are unaffected, anti-rollback is not violated, and no data migration is required | D | OPS-REL §10, ADR-T18 | A2 |
| TEST-FED-015 | **[COND-FED]** Given a remote slot, when the remote mounts, then layout shift stays within the CLS budget (reserved space) | P | SLO-15 | A1 |
| TEST-FED-016 | Given the default `MF_MODE=bundled` build, when artefacts are inspected, then each of the 8 modules is a lazily loaded chunk behind the typed module contract, the contract and boundary lint (FF-03) pass, and back-office chunks (MOD-ADM) are served only behind the authenticated edge rule so customer sessions cannot download them | D | REVW-07, REVW-08, FD-09, FF-03 | A1 |
| TEST-FED-017 | Given a production release candidate with `MF_MODE=federated`, when the release lint runs, then it fails unless an activation record exists (OPEN-03 closed with at least 3 named independent frontend teams and a recorded WP-FED-SPIKE result) | D/X | REVW-07, ADR-T03a, OPEN-03 | A1 |

## 9. PWA, service worker and offline (PWA)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-PWA-001 ★ | Given an old service worker controlling open tabs when a new shell+remotes deploy, then update prompt appears, no mixed old-shell/new-remote mount occurs, and drafts persist | O/E | AC-00-04-01, ADR-T18, FM-06 | A2 |
| TEST-PWA-002 | Given user A logged out and user B logged in on one device, when B browses, then no cached response from A's session is ever served | O | AC-00-04-02, INV-T13, INV-T14 | A1 |
| TEST-PWA-003 | Given logout, when it completes, then caches and IndexedDB owner data are cleared | O | AC-00-04-05, INV-T14 | A1 |
| TEST-PWA-004 | Given offline mode, when cached data is shown, then it is labelled stale and no consequential state (e.g. verified) is asserted from cache | O | AC-00-04-03, INV-T13 | A1 |
| TEST-PWA-005 ★ | **[COND-OUTBOX]** Given a queued profile edit and a newer server version, when reconnected, then an ETag conflict is shown and nothing is overwritten silently | O | AC-03-08-02, AC-03-08-01, ADR-T10 | A2 |
| TEST-PWA-006 | **[COND-OUTBOX]** Given a queued draft whose permission was revoked while offline, when replayed, then the server rejects it and the user is told | O | AC-10-01-03, INV-T13 | A2 |
| TEST-PWA-007 | Given offline mode, when the user tries a consequential action (submit application, withdraw, pay), then it is blocked with explanation | O | AC-10-02-11, AC-00-04-04, ADR-T10 | A1 |
| TEST-PWA-008 ★ | **[COND-OUTBOX]** Given a queued message sent twice on reconnect, when replayed, then one message results (idempotent) | O | FEAT-13-03 (AC pending), INV-T10 | A2 |
| TEST-PWA-009 | Given the SW kill-switch flag, when set, then clients unregister the SW and clear caches on next load | O/D | RB-09, FM-06 | A3 |
| TEST-PWA-010 | Given each PWA capability, when run in WebKit, then a feature-detected fallback works and is listed in the platform matrix | E | FF-09 | A1 |
| TEST-PWA-011 | Given iOS, when requesting push permission, then it is requested only after a user gesture in an installed app | M | FEAT-15-04 (AC pending), ADR-T02, OPEN-12 | M |
| TEST-PWA-012 | Given simulated storage eviction, when the app starts, then it recovers from the network without errors | O | AC-24-07-01, FM-09, ADR-T10 | A2 |
| TEST-PWA-013 | Given Phase 1 offline scope (REVW-24), when a user types an unsent draft and goes offline or reloads, then the draft is restored locally, is never auto-submitted, must be reviewed and sent online, and the IndexedDB schema contains no outbox store | O | REVW-24, ADR-T10, OFF-01 | A1 |
| TEST-PWA-014 **[COND-OUTBOX]** | Given lesson progress queued while offline, when replayed after reconnect, then it is accepted idempotently with conflict resolution by max sequence, and entries past the single expiry in the OFF-01 table are dropped with notice | O | AC-08-03-03, REVW-15, ADR-T10 | A2 |
| TEST-PWA-015 | Given an assessment attempt, when the network drops, then no item or answer is stored in the service-worker cache, IndexedDB or any web storage, submission is blocked with an explanation, and nothing is replayed on reconnect (assessment answers are online-only) | O | REVW-15, ADR-T10, OFF-01, AC-00-04-04 | A1 |

## 10. Billing (BIL)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-BIL-001 | Given a checkout redirect success URL hit without a verified webhook, when entitlements are read, then nothing is granted | I | AC-08-02-04, INV-T17 | A1 |
| TEST-BIL-002 | Given an invalid signature or a replayed webhook event id, when received, then rejected / processed once | I | AC-08-02-05, FEAT-16-03 (AC pending), INV-T17, INV-T10 | A1 |
| TEST-BIL-003 | Given out-of-order webhooks (update before create), when processed, then state converges to the correct entitlement | I | AC-16-09-01, FM-41 | A1 |
| TEST-BIL-004 | Given payment failure and dunning exhaustion, when applied, then paid features are downgraded per policy and no user data is deleted | I | FEAT-16-07 (AC pending) | A2 |
| TEST-BIL-005 | Given a Stripe outage, when users act, then checkout shows a degraded message and existing entitlements persist | R | FEAT-16-02 (AC pending), FM-41 | A2 |
| TEST-BIL-006 | Given induced drift between provider and local state, when the reconciliation job runs, then drift is reported and repaired by audited action | I | FEAT-16-04 (AC pending), INV-T32 | A2 |
| TEST-BIL-007 | Given a refund, when processed, then entitlements change per policy and the event is audited | I | FEAT-16-10 (AC pending) | A2 |

## 11. Privacy and data rights (PRV)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-PRV-001 | Given consent records, when purpose, version and revocation change, then enforcement follows (purpose-bound, versioned, revocable) | I | AC-22-01-01, AC-22-01-04, AC-22-01-06, INV-T15 | A1 |
| TEST-PRV-002 | Given a data export request, when completed, then it contains data from every module that holds the user's personal data and is delivered within the SLA | I | FEAT-22-02 (AC pending) | A2 |
| TEST-PRV-003 | Given an erasure request, when processed, then data is removed across DB, search index, caches and object storage within 30 days except the retention list | I | FEAT-22-03 (AC pending), BR-T060, INV-T38, OPEN-08 | A2 |
| TEST-PRV-004 | Given erasure of a user referenced elsewhere, when done, then referential integrity holds, retained billing records are pseudonymised per policy, and audit/consent/transition history is untouched and no longer resolves to the person | I | FEAT-22-03 (AC pending), INV-T38 | A2 |
| TEST-PRV-005 | Given minors in institution cohorts (if enabled), when rules apply, then the minor-specific gate is enforced | I | OPEN-09 | pending |
| TEST-PRV-006 | Given analytics events, when emitted, then no direct identifiers outside the permitted fields, and consent state is respected | I | AC-00-05-01, FEAT-21-01 (AC pending), INV-T14 | A1 |

## 12. Data and migration (DAT)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-DAT-001 | Given the migrations directory, when linted, then files are append-only, contiguous and each has a rollback/forward-fix note | X | FF-10 | A1 |
| TEST-DAT-002 | Given an expand migration applied, when the previous API version runs against it, then all contract tests pass | G | OPS-REL §8 | A1 |
| TEST-DAT-003 | Given a production-sized dataset copy, when migrations run, then lock waits and duration stay within budget | G | OPS-REL §8, FM-27 | A2 |
| TEST-DAT-004 | Given a backfill interrupted and restarted, when run again, then it is resumable and idempotent | G | FM-28 | A2 |
| TEST-DAT-005 | Given a bad migration, when the rollback or forward-fix path is executed in staging, then service recovers and data is intact | G | FF-10, FM-28 | S |
| TEST-DAT-006 | Given the reference-to-target data migration, when executed on a sanitized copy, then reconciliation counts and invariants (no upgraded evidence rung, INV-T04) match | G | MIG-01 §7 | S |
| TEST-DAT-007 | Given two or more API replicas, when the same user reads after writes through different replicas, then reads are consistent (no in-process authoritative state) | I | ADR-T05 | A1 |
| TEST-DAT-008 | Given concurrent edits with ETag/`If-Match`, when both write, then lost updates are impossible | I | AC-03-08-01, AC-10-01-02, ADR-T08 | A1 |
| TEST-DAT-009 | Given tenant tables, when schema is inspected, then each has `org_id`/`institution_id` and RLS enabled | X | INV-T03 | A1 |

## 13. Resilience, performance, accessibility, device, deployment, recovery, observability, other

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-REL-001 | Given the DB primary is killed, when load runs, then failover occurs within SLO-30 and no committed data is lost | R | FM-24, SLO-30 | A3 |
| TEST-REL-002 | Given pool exhaustion, when injected, then requests shed with 503 + Retry-After and health endpoints remain responsive | R | FM-25 | A2 |
| TEST-REL-003 | Given an email provider outage, when notifications are triggered, then breaker opens, jobs back off, user flows succeed | R | FM-39, AC-01-01-09 | A2 |
| TEST-REL-004 | Given queue backlog and poison jobs, when injected, then P0 class still meets SLO-21, poison jobs reach DLQ, enqueue backpressure applies | R | FM-30, FM-37 | A2 |
| TEST-REL-005 | Given a worker killed mid-job, when its lease expires, then another completes it exactly once in effect | R | FM-35, AC-07-03-06 | A2 |
| TEST-REL-006 | Given an object storage outage, when users upload/download, then graceful messages, no orphan rows, resumed after recovery | R | FM-31 | A2 |
| TEST-REL-007 ★ | Given a shared infrastructure dependency outage (cache, pooler, resolver, secrets manager), when injected, then correctness is preserved and degradation matches OPS-FMEA | R | FM-47 | A2 |
| TEST-REL-008 | Given latency injected into every outbound dependency, when calls run, then each times out within its budget; no call lacks a timeout | R | OPS-FMEA §2 | A1 |
| TEST-REL-009 | Given a slow search or AI dependency, when load is applied, then auth and basic reads keep SLO (bulkhead) | R | FM-14 | A2 |
| TEST-REL-010 | Given clock skew within and beyond tolerance, when tokens/signed URLs are used, then behaviour matches policy | R | FM-20 | A2 |
| TEST-REL-011 | Given a manifest cache invalidation after deploy, when thousands of clients refetch, then jittered refresh keeps origin load bounded | L | OPS-CAP §5 | A3 |
| TEST-REL-012 | Given a scheduled game day, when failure modes are injected, then measured detection/containment/recovery are recorded vs OPS-FMEA | R | OPS-FMEA §9 | S |
| TEST-REL-013 | Given a database failover that truncates the UNLOGGED `rate_limit_bucket`, when a credential-stuffing burst follows, then edge-layer limits still apply and auth-class limits do not reset to full | R | REVW-41, BR-T052, OPEN-B1, FM-24 | A2 |
| TEST-PER-001 | Given baseline load, when run, then each API class meets p95/p99 (OPS-SLO §5) | L | SLO-01, AC-00-06-01 | A2 |
| TEST-PER-002 | Given the target corpus, when searching, then p95 ≤ 400 ms (ADR-T11 trigger) | L | ADR-T11, C5 | A2 |
| TEST-PER-003 | Given each route on RMP-1, when audited, then LCP/TBT/CLS and JS budgets hold | P | SLO-13…SLO-19 | A1 |
| TEST-PER-004 | **[COND-FED]** Given federated vs bundled builds, when measured, then Δ_F ≤ budget (SLO-17) | P | SLO-17, OPEN-03 | A2 |
| TEST-PER-005 | Given a job burst, when run, then queue ages meet SLO-20…25 and tenant fair share holds | L | TP-01, OPS-CAP §4 | A2 |
| TEST-PER-006 | Given a long soak, when completed, then no memory/connection/bloat trend breaches thresholds | L | OPS-CAP §5 | A2 |
| TEST-PER-007 | Given a traffic spike and a noisy tenant, when applied, then shedding/quotas protect core classes and recover | L | FM-13 | A2 |
| TEST-PER-008 | Given production RUM, when evaluated, then INP/LCP p75 per route and device class meet targets and feed alerts | P | SLO-13, SLO-14 | A3 |
| TEST-PER-009 | Given the query set, when EXPLAIN-budget and N+1 detection run in CI, then regressions fail the PR | I | FM-27 | A1 |
| TEST-PER-010 | Write budget under WP-LOADBASE: for each P0 use case in DB-02 §17, rows written, statements and row/advisory locks per transaction are measured and equal or stay under the published budget; with N API replicas committing concurrently there is zero shared/global lock wait on the request path (no month-wide audit lock), and C3 p95 holds while the `audit.anchor` job runs | L | DB-02 §17, SLO C3, REVW-06, OPS-CAP | A2 |
| TEST-A11-001 | Given every route and remote state, when scanned by axe-class tooling, then no WCAG 2.2 AA violations of detectable types | A | GOAL-06, AC-00-07-01 | A1 |
| TEST-A11-002 | Given critical journeys, when run keyboard-only, then fully operable with visible focus | A | AC-00-07-02, AC-08-03-05 | A2 |
| TEST-A11-003 | Given NVDA/VoiceOver/TalkBack, when critical journeys are executed, then names, roles, live regions and errors are announced | A | AC-00-07-03 | M |
| TEST-A11-004 | Given interactive controls, when measured, then targets meet 24×24 CSS px (AA) and the design standard 44 px | A | RES-01 R3, AC-00-07-04 | A1 |
| TEST-A11-005 | Given sticky headers/banners, when focus moves, then focused elements are not obscured (2.4.11) | A | RES-01 R3 | A2 |
| TEST-A11-006 | Given 200% zoom, 320 px reflow, reduced-motion, and high-contrast preferences, when used, then no loss of content or function | A | AC-00-07-05 | A2 |
| TEST-A11-007 | Given a remote swap or fallback panel, when navigation occurs, then focus moves to a sensible target and route change is announced | A | AC-00-07-06, ADR-T03 | A1 |
| TEST-MOB-001 | Given Android Chrome, when installed, then installability, offline shell and push work | M | FEAT-15-04 (AC pending), ADR-T02 | M |
| TEST-MOB-002 | Given iOS Home-Screen install, when used, then install flow, push after gesture, and storage behaviour match the platform matrix | M | OPEN-12, FF-09 | M |
| TEST-MOB-003 | Given iOS storage pressure/eviction, when it occurs, then the app recovers from the server | M | FM-09, OPEN-12 | M |
| TEST-MOB-004 | Given iOS with no background sync, when the app is foregrounded, then queued writes resync | M | ADR-T10, RES-01 R2 | M |
| TEST-MOB-005 | Given a low-tier Android device, when critical journeys run, then INP/LCP stay within RMP-2 budgets | M | RMP-2 | M |
| TEST-MOB-006 | Given camera/file pickers on iOS/Android, when uploading evidence, then upload and permission denial flows work | M | AC-05-01-04 | M |
| TEST-DEP-001 ★ | Given a canary release, when guardrails (errors, INP, latency) breach, then promotion halts and automatic rollback occurs | D | OPS-REL §9, FM-07 | A3 |
| TEST-DEP-002 ★ | Given remote, API and SW released together, when rollback is executed in the documented order, then the system returns to the previous consistent set with no data loss | D | OPS-REL §10, FM-07 | S |
| TEST-DEP-003 | Given a migration failure mid-deploy, when the procedure runs, then forward-fix or rollback completes per the migration's note | D | FF-10 | S |
| TEST-DEP-004 | Given an artefact, when deploy runs, then signature verification and SBOM presence are required | D | OPS-REL §6 | A1 |
| TEST-DEP-005 | Given each feature flag in a release, when its kill-switch is flipped, then the feature is off within the propagation target without redeploy | D | FEAT-20-04 (AC pending) | A3 |
| TEST-DEP-006 | Given a change to a shared contract package, when affected-only build selection runs, then every dependent is rebuilt and tested | D | ADR-T17 | A1 |
| TEST-DEP-007 | Given a missing/invalid required config or secret, when the service starts, then it fails fast with a clear message | D | FM-18, INV-T14 | A1 |
| TEST-DEP-008 | Given a fresh deploy, when post-deploy synthetic smoke runs, then shell, a remote, login and a read flow pass; certificate expiry is checked | D | FM-45 | A3 |
| TEST-REC-001 | Given PITR, when a restore to a timestamp is executed, then RPO/RTO meet SLO-31 and data is verified | V | SLO-31, FM-34 | S |
| TEST-REC-002 | Given the off-site backup, when restored on a separate host, then application starts and workflows verify | V | FM-34 | S |
| TEST-REC-003 | Given object storage versions, when objects are deleted/corrupted, then restore meets SLO-32 | V | SLO-32 | S |
| TEST-REC-004 | Given a DR exercise, when region/zone loss is simulated, then recovery meets SLO-33 (once decided) | V | OPEN-23 | S |
| TEST-REC-005 | Given restore of the DB, when outbox/jobs are replayed, then dedupe prevents duplicate effects | V | ADR-T09, INV-T10 | S |
| TEST-OBS-001 | Given injected SLO burn, when evaluated, then multi-window burn-rate alerts fire to the correct route | D | OPS-OBS §6 | A3 |
| TEST-OBS-002 | Given dashboards and alert rules as code, when linted, then every SLO has a dashboard, alert and runbook link | X | OPS-OBS §5 | A1 |
| TEST-OBS-003 | Given the audit log, when write/update/delete are attempted by the app role, then append-only and tamper-evident behaviour holds | I | INV-T10, INV-T18 | A1 |
| TEST-OBS-004 | Given a remote or CDN outage, when synthetic checks run, then the outage is detected and alerts fire | D | FM-01, FM-10 | A3 |
| TEST-MSG-001 | Given notification preferences, quiet hours and logout, when notifications fire, then they respect preferences and push subscriptions are revoked on logout | I | FEAT-15-02 (AC pending) | A1 |
| TEST-MSG-002 | Given a report, when filed, then a moderation case forms, a human acts, takedowns are audited and appealable | E | FEAT-19-01 (AC pending), FEAT-19-02, INV-T09 | A2 |
| TEST-MSG-003 | Given faculty in an institution cohort, when viewing, then non-consented private job-search data is invisible | I | FEAT-18-04 (AC pending), INV-T15, INV-T03, INV-T41 | A1 |
| TEST-SRC-001 | Given the relevance regression set, when search runs, then quality metrics do not fall below threshold [OPEN-15] | I | AC-11-01-01 | A2 |
| TEST-SRC-002 | Given FTS operators and special characters in queries, when searched, then input is sanitised and no injection or errors occur | S | AC-11-01-07 | A1 |
| TEST-SRC-003 | Given a candidate whose consent is revoked, when a recruiter runs a candidate search before the index entry is removed, then the candidate is absent or masked at query time (authorization at read time, no consent cache) | I | REVW-25, INV-T15, INV-T29, BR-T063 | A1 |

## 13A. Domain-invariant tests (INV-T21 … INV-T45, from `06_BUSINESS_PROCESSES/PRODUCT_INVARIANT_REGISTRY.md`)

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-EVD-012 | Property test: for generated provenance sets, the stored rung equals `computeRung(valid provenance)`; no API path writes a rung | U | AC-05-02-01, AC-05-02-02, INV-T22 | A1 |
| TEST-EVD-013 | Infected-fixture test: an evidence item with an artefact cannot be `active` unless its latest scan verdict is clean (DB check + state machine) | I | AC-05-12-01, AC-05-12-02, INV-T23 | A1 |
| TEST-EVD-014 | Referee token consumed under row lock: concurrent submits store exactly one response; after submit, expiry, cancel or bounce the token authorises nothing | I | AC-06-02-03, AC-06-02-07, INV-T24 | A1 |
| TEST-EVD-015 | Revoke an item, stop the recompute worker, read the item: the displayed rung already reflects the revocation | I | AC-05-05-07, INV-T25 | A1 |
| TEST-EVD-016 | Given a course whose instructor account equals the learner, or shares a session, device or payment-instrument signal with the learner, when the instructor signs off, then the attestation is rejected and no `authority_verified` rung is minted | I | REVW-12, BR-T011, DT-06, ADR-T14 | A1 |
| TEST-EVD-017 | Given an instructor-issued attestation, when the evidence is rendered in the API and each client surface, then `issuer_class` is present and displayed, the badge is never labelled platform-verified, and matching weights differ by class | I | REVW-12, DT-06, ADR-T14 | A1 |
| TEST-EVD-018 | Given an instructor attestation that is revoked (or its issuer fails an independence check), when revocation commits, then the rung drops, dependent matches recompute within SLO-23, and the candidate is notified | I | REVW-12, BR-T005, SLO-23 | A2 |
| TEST-ASM-012 | An attempt in `unverified`, `voided` or `under_review` has no linked `authority_verified` evidence (cross-effects, incl. integrity hold) | I | AC-07-04-01, AC-07-07-02, AC-07-06-05, INV-T26 | A1 |
| TEST-ASM-013 | Replay of the mint job: evidence minted at most once per attempt and only from `passed` attempts | I | AC-07-06-03, AC-07-06-04, INV-T27 | A1 |
| TEST-HIR-012 | Application evidence snapshot is immutable after submit: row-level UPDATE denied; later evidence edits leave the snapshot hash unchanged | I | AC-10-14-01, AC-10-14-02, INV-T28 | A1 |
| TEST-HIR-013 | Two concurrent publishes with one free slot yield exactly one `published` job; unverified org capped at one live job | I | AC-09-02-02, AC-09-02-04, INV-T30 | A1 |
| TEST-HIR-014 | DB constraints: `rejected` applications, `suspended` accounts and moderator revocations require `actor.kind = human` and a reason code | I | AC-10-06-02, AC-10-06-03, INV-T31 | A1 |
| TEST-HIR-015 | Two candidates choosing the same interviewer slot concurrently: exactly one `scheduled`; exclusion constraint prevents overlap | I | AC-10-07-03, AC-10-07-04, INV-T39 | A1 |
| TEST-HIR-016 | A candidate who blocklists an org never appears in that org's search, shortlist suggestions or outreach targeting | I | AC-03-09-01, INV-T40 | A1 |
| TEST-HIR-017 | Submit racing with job pause/close/takedown at the commit instant: no application is created on a non-`published` job | I | AC-10-02-06, INV-T44 | A1 |
| TEST-HIR-018 | Same inputs recompute to the same score and `inputHash`; stored explanation derives from exactly those inputs | I | AC-11-02-02, INV-T45 | A1 |
| TEST-BIL-008 | Property test: entitlements are a pure function of (subscription state, plan version, admin grants); caches are derived and rebuilt equal | U | FEAT-16-04 (AC pending), INV-T32 | A1 |
| TEST-BIL-009 | Given Phase 2, when the course catalogue and checkout are exercised, then only first-party (platform-sold) course SKUs are purchasable; no seller-of-record, payout, connected-account or instructor-pricing code path is reachable | I | REVW-30, ADR-T15, COM-OPS section 13A | A1 |
| TEST-SEC-029 | Concurrent refreshes: at most one valid refresh generation exists per family (plus the unused-successor leeway) | I | AC-01-04-02, INV-T33 | A1 |
| TEST-SEC-030 | Concurrent registrations differing only in case yield one account; unique normalised email among non-erased accounts | I | AC-01-01-08, AC-01-01-02, INV-T34 | A1 |
| TEST-SEC-031 | With fake time, every expiring credential (code, reset token, invite, referee token, export link) is invalid after server-clock expiry; raw values never appear in logs or events | I | AC-01-06-02, AC-06-01-03, AC-06-10-02, INV-T43 | A1 |
| TEST-SEC-032 | Given the deployed configuration (REVW-32), when the user-content origin and the app origin are compared, then they differ in registrable domain (public-suffix aware), the CSP names only the content origin, and no app cookie is scoped to a domain that covers it | S | REVW-32, SEC-02 section 6.1, INV-T14 | A1 |
| TEST-SEC-033 | Given a refresh token and a `__Host-` access cookie carrying a session id, when the refresh is presented with a cookie whose session id differs (or none), then it is rejected, the family is flagged, and no new access cookie is issued | I | REVW-32, BR-T050, SM-SESSION | A1 |
| TEST-SEC-034 | Given a cookie with the same name set from a sibling subdomain (cookie tossing), when the app reads session cookies, then the `__Host-` cookie wins or the request is rejected, and a tossed `__Secure-` cookie never authenticates | S | REVW-32, THREAT_MODEL (cookie-tossing STRIDE row) | A2 |
| TEST-SEC-035 | Given the unauthenticated telemetry proxy (`/otlp`), when flooded, sent oversize or malformed payloads, or sent forged identifiers, then it rate-limits, rejects, stores no attacker-controlled field as an identity, and cannot be used as an open relay | S | REVW-32, THREAT_MODEL (telemetry-endpoint row) | A2 |
| TEST-PRV-007 | Consent ledger is append-only: UPDATE/DELETE denied for the app role; current consent equals the fold of the ledger | I | AC-22-01-05, INV-T35 | A1 |
| TEST-PRV-008 | After erasure, the post-erasure scanner finds no personal data in DB, search, caches or object storage; only tombstone and retained-record list remain | I | FEAT-22-03 (AC pending), INV-T38 | A2 |
| TEST-OBS-005 | The audit anchor verifier job detects a tampered or removed audit row (row hash, Merkle root and row count no longer match the signed anchor) | I | FEAT-20-03 (AC pending), INV-T36 | A2 |
| TEST-OBS-006 | Batch anchor verification: the `audit.anchor` job seals a closed window with a KMS-signed Merkle root and `prev_anchor_root`; the verifier recomputes every root and signature and passes; it fails on (a) a modified row, (b) a deleted row or truncated tail, (c) a row inserted into a sealed window, (d) a missing or altered anchor, compared against the write-once archive copy; a second runner cannot seal the same window | I | DB-02 §4.2, INV-T36, REVW-06 | A2 |
| TEST-OBS-007 | Given a user who declines analytics consent, when client SLOs are evaluated, then SLO-13 to SLO-16 are computed from synthetic probes only; the RUM pipeline emits no event for that user; and the report states the consented-sample coverage and its bias | I | REVW-31, SLO-13, PUR-14 | A3 |
| TEST-OBS-008 | Given operational telemetry (errors, latency, version beacons), when payloads are inspected, then they carry only the allowlisted fields of the operational class (no user id, no free text) and are separable from `analytics.product` events | I | REVW-31, OPEN-08, DATA-033 | A1 |
| TEST-PRV-009 | Erase a fixture subject, then verify the integrity chain: history rows (audit, consent, evidence events, stage transitions) of the subject are byte-identical before and after; the aggregate chains and every `audit_anchor` covering them still verify; the `subject_identity_map` row and wrapped key are gone; the refs no longer resolve to any account; the app role still cannot UPDATE/DELETE the history tables | I | AC-22-03-13, INV-T35, INV-T36, INV-T38, REVW-04 | A2 |
| TEST-PRV-010 | No direct identifiers in append-only tables: schema lint fails on any column in `audit_event`, `consent_record`, `evidence_event`, `stage_transition`, `outbox_event`, `integrity_signal` that is an account-id FK, email, name or unregistered free-text/JSONB; a canary-identifier test (email, name, account id, display name) writes through every use case and finds none of the values in those tables or their JSONB payloads | X/I | DB-02 §4.1, INV-T38, INV-T14, REVW-04 | A1 |
| TEST-PRV-011 | Given an application-scoped consent that reached its end, when the retention job runs, then identifiable candidate data held by the organisation is pseudonymised at consent end (or the documented basis in OPEN-08 is recorded) and no read path returns identifiers afterwards | I | REVW-26, BR-T062, DATA-021, OPEN-08 | A2 |
| TEST-PRV-012 | Given registration, when no self-declared minimum-age attestation is supplied, or the declared age is below the counsel-set value (OPEN-09), then the account is not activated and the attempt is logged without storing the date of birth beyond policy | I | REVW-29, BR-T106, OPEN-09 | A1 |
| TEST-PRV-013 | Given the consent scope vocabulary, when linted, then every scope string in code, OpenAPI and UI comes from `CONSENT_SCOPE_CATALOGUE.md` | X | FF-12 | A1 |
| TEST-MSG-004 | Institution principals can read learner data only as aggregates with k >= 5 or as institution-issued-credential records | I | FEAT-18-04 (AC pending), INV-T41 | A1 |
| TEST-MSG-005 | Outreach quota counter equals the number of first-contact messages in the period (derived, not independently incremented) | I | FEAT-13-02 (AC pending), INV-T42 | A1 |

INV-T37 (idempotent consumers) is covered by TEST-API-009; INV-T21 by TEST-HIR-001; INV-T29 by TEST-SEC-009; INV-T23 also by TEST-SEC-019.

## 14. Index of mandatory special verifications

| Mandatory verification | Tests |
|---|---|
| Remote unavailable | TEST-FED-001, TEST-FED-002, TEST-OBS-004 |
| Version mismatch | TEST-FED-003, TEST-FED-004, TEST-API-002 |
| Shared dependency conflict | TEST-FED-005, TEST-FED-006 |
| Stale service worker | TEST-PWA-001, TEST-PWA-009 |
| Offline conflicts | TEST-PWA-005, TEST-PWA-006, TEST-PWA-008, TEST-DAT-008 |
| Duplicate requests | TEST-HIR-001, TEST-HIR-008, TEST-HIR-009, TEST-ASM-010 |
| Concurrent actions | TEST-HIR-003, TEST-DAT-008 |
| IDOR | TEST-SEC-004 … TEST-SEC-008, TEST-TEN-001 |
| Partial operations | TEST-EVD-009, TEST-API-011 |
| Rollback | TEST-DEP-001, TEST-DEP-002, TEST-DEP-003, TEST-FED-014 |
| Shared dependency outage | TEST-REL-007, TEST-FED-013 |

## 15. Counts and coverage

Counts computed from this document by script: SEC 32, TEN 7, EVD 15, ASM 13, HIR 18, API 14, FED 15, PWA 12, BIL 8, PRV 10, DAT 9, REL 12, PER 10, A11 7, MOB 6, DEP 8, REC 5, OBS 6, MSG 5, SRC 2 = **214 specified tests**, all unique IDs. SEC includes the separate `TEST-SEC-NEG-01` negative control.

Coverage rules planned for catalog lint under `WP-QA-TRACE` (lint is not implemented): manually reported checks say every INV-T01…T45 and FF-01…FF-10 appears in at least one TEST; the AC-link rule is not satisfied yet. The current exact-reference matrix finds 126 of 389 defined ACs directly cited by a catalog test (recounted 2026-10-27: 97 long-form + 29 platform; earlier scan said 125); 263 have no direct AC-ID link. A missing direct link is a traceability gap, not proof that no broader feature/invariant test exists. No TEST without a link and named owners/cadence for M/S automation still need machine-checkable validation.

See [AC_TEST_TRACEABILITY_MATRIX](../28_TRACEABILITY_AND_COVERAGE/AC_TEST_TRACEABILITY_MATRIX.md) for each criterion, its definition source, and any catalog test IDs that explicitly cite it.

**Specification gaps surfaced by this mapping (features with no AC yet in `05_FEATURE_SPECIFICATIONS`, tests linked at FEAT level):** FEAT-01-08, 01-09, 02-07, 06-01 (concurrent verification requests), 11-05, 11-09, 13-01, 13-02, 13-03, 15-02, 15-04, 16-02, 16-03, 16-04, 16-07, 16-10, 17-01, 17-02, 18-04, 19-01, 20-02, 20-03, 20-04, 21-01, 22-02, 22-03. Requirements owners should write ACs; TEST ids do not change (OPEN-29 tracks this).

Known coverage limits: INV-T09 relies on workflow specs still being written for some human-review paths; TEST-PRV-005 waits for OPEN-09; FF-09 depends on OPEN-12 devices.

# Revision 2 additions (folded 2026-10-27 from `TEST_CATALOG.md#record-test-catalog-rev2`)

## 1. New tests for review decisions

| TEST-ID | Verifies (Given / When / Then) | Lvl | Links | Auto |
|---|---|---|---|---|
| **Negative control and security (REVW-01 already in catalog as TEST-SEC-NEG-01; REVW-32)** | | | | |
| TEST-SEC-032 | Given the deployed configuration (REVW-32), when the user-content origin and the app origin are compared, then they differ in registrable domain (public-suffix aware), the CSP names only the content origin, and no app cookie is scoped to a domain that covers it | S | REVW-32, SEC-02 section 6.1, INV-T14 | A1 |
| TEST-SEC-033 | Given a refresh token and a `__Host-` access cookie carrying a session id, when the refresh is presented with a cookie whose session id differs (or none), then it is rejected, the family is flagged, and no new access cookie is issued | I | REVW-32, BR-T050, SM-SESSION | A1 |
| TEST-SEC-034 | Given a cookie with the same name set from a sibling subdomain (cookie tossing), when the app reads session cookies, then the `__Host-` cookie wins or the request is rejected, and a tossed `__Secure-` cookie never authenticates | S | REVW-32, THREAT_MODEL (cookie-tossing STRIDE row) | A2 |
| TEST-SEC-035 | Given the unauthenticated telemetry proxy (`/otlp`), when flooded, sent oversize or malformed payloads, or sent forged identifiers, then it rate-limits, rejects, stores no attacker-controlled field as an identity, and cannot be used as an open relay | S | REVW-32, THREAT_MODEL (telemetry-endpoint row) | A2 |
| **Instructor is not the learner; issuer class shown (REVW-12)** | | | | |
| TEST-EVD-016 | Given a course whose instructor account equals the learner, or shares a session, device or payment-instrument signal with the learner, when the instructor signs off, then the attestation is rejected and no `authority_verified` rung is minted | I | REVW-12, BR-T011, DT-06, ADR-T14 | A1 |
| TEST-EVD-017 | Given an instructor-issued attestation, when the evidence is rendered in the API and each client surface, then `issuer_class` is present and displayed, the badge is never labelled platform-verified, and matching weights differ by class | I | REVW-12, DT-06, ADR-T14 | A1 |
| TEST-EVD-018 | Given an instructor attestation that is revoked (or its issuer fails an independence check), when revocation commits, then the rung drops, dependent matches recompute within SLO-23, and the candidate is notified | I | REVW-12, BR-T005, SLO-23 | A2 |
| **Idempotency and vocabulary lint (REVW-14, FF-07, FF-11)** | | | | |
| TEST-API-015 | Given the route registry, when linted, then every unsafe mutation route either accepts `Idempotency-Key` or declares a natural key; queued-operation routes retain idempotency records for at least the outbox TTL (14 d) | X/I | FF-07, REVW-14, BR-T114 | A1 |
| TEST-API-016 | Given the state vocabulary, when linted, then every state name used in OpenAPI, AsyncAPI, SQL enums and UI maps comes from `STATE_MACHINES.md` | X | FF-11 | A1 |
| **Privacy: retention, minimum age, consent vocabulary (REVW-26, REVW-29, FF-12)** | | | | |
| TEST-PRV-011 | Given an application-scoped consent that reached its end, when the retention job runs, then identifiable candidate data held by the organisation is pseudonymised at consent end (or the documented basis in OPEN-08 is recorded) and no read path returns identifiers afterwards | I | REVW-26, BR-T062, DATA-021, OPEN-08 | A2 |
| TEST-PRV-012 | Given registration, when no self-declared minimum-age attestation is supplied, or the declared age is below the counsel-set value (OPEN-09), then the account is not activated and the attempt is logged without storing the date of birth beyond policy | I | REVW-29, BR-T106, OPEN-09 | A1 |
| TEST-PRV-013 | Given the consent scope vocabulary, when linted, then every scope string in code, OpenAPI and UI comes from `CONSENT_SCOPE_CATALOGUE.md` | X | FF-12 | A1 |
| **No consent cache at read time (REVW-25)** | | | | |
| TEST-SRC-003 | Given a candidate whose consent is revoked, when a recruiter runs a candidate search before the index entry is removed, then the candidate is absent or masked at query time (authorization at read time, no consent cache) | I | REVW-25, INV-T15, INV-T29, BR-T063 | A1 |
| **Resilience (REVW-41)** | | | | |
| TEST-REL-013 | Given a database failover that truncates the UNLOGGED `rate_limit_bucket`, when a credential-stuffing burst follows, then edge-layer limits still apply and auth-class limits do not reset to full | R | REVW-41, BR-T052, OPEN-B1, FM-24 | A2 |
| **First-party courses only in Ph2 (REVW-30)** | | | | |
| TEST-BIL-009 | Given Phase 2, when the course catalogue and checkout are exercised, then only first-party (platform-sold) course SKUs are purchasable; no seller-of-record, payout, connected-account or instructor-pricing code path is reachable | I | REVW-30, ADR-T15, COM-OPS section 13A | A1 |
| **Synthetic-only client SLIs and operational telemetry class (REVW-31)** | | | | |
| TEST-OBS-007 | Given a user who declines analytics consent, when client SLOs are evaluated, then SLO-13 to SLO-16 are computed from synthetic probes only; the RUM pipeline emits no event for that user; and the report states the consented-sample coverage and its bias | I | REVW-31, SLO-13, PUR-14 | A3 |
| TEST-OBS-008 | Given operational telemetry (errors, latency, version beacons), when payloads are inspected, then they carry only the allowlisted fields of the operational class (no user id, no free text) and are separable from `analytics.product` events | I | REVW-31, OPEN-08, DATA-033 | A1 |
| **Offline scope: drafts only in Ph1, lesson progress conditional, assessment answers online-only (REVW-24, REVW-15)** | | | | |
| TEST-PWA-013 | Given Phase 1 offline scope (REVW-24), when a user types an unsent draft and goes offline or reloads, then the draft is restored locally, is never auto-submitted, must be reviewed and sent online, and the IndexedDB schema contains no outbox store | O | REVW-24, ADR-T10, OFF-01 | A1 |
| TEST-PWA-014 **[COND-OUTBOX]** | Given lesson progress queued while offline, when replayed after reconnect, then it is accepted idempotently with conflict resolution by max sequence, and entries past the single expiry in the OFF-01 table are dropped with notice | O | AC-08-03-03, REVW-15, ADR-T10 | A2 |
| TEST-PWA-015 | Given an assessment attempt, when the network drops, then no item or answer is stored in the service-worker cache, IndexedDB or any web storage, submission is blocked with an explanation, and nothing is replayed on reconnect (assessment answers are online-only) | O | REVW-15, ADR-T10, OFF-01, AC-00-04-04 | A1 |
| **Bundled default and federated activation gate (REVW-07, REVW-08)** | | | | |
| TEST-FED-016 | Given the default `MF_MODE=bundled` build, when artefacts are inspected, then each of the 8 modules is a lazily loaded chunk behind the typed module contract, the contract and boundary lint (FF-03) pass, and back-office chunks (MOD-ADM) are served only behind the authenticated edge rule so customer sessions cannot download them | D | REVW-07, REVW-08, FD-09, FF-03 | A1 |
| TEST-FED-017 | Given a production release candidate with `MF_MODE=federated`, when the release lint runs, then it fails unless an activation record exists (OPEN-03 closed with at least 3 named independent frontend teams and a recorded WP-FED-SPIKE result) | D/X | REVW-07, ADR-T03a, OPEN-03 | A1 |

## 2. Conditional tests (REVW-07, REVW-15, REVW-24)

`[COND-FED]` = runs only once federated runtime is activated (`MF_MODE=federated`; ADR-T03a: OPEN-03 closed with at least 3 named independent frontend teams and a recorded `WP-FED-SPIKE` result). In the default `bundled` mode they are not run and do not gate Phase 1 exit. `[COND-OUTBOX]` = runs only once the offline outbox subsystem is activated on the ADR-T10 trigger (telemetry or research shows need). Phase 1 offline is read cache plus local unsent drafts, no outbox (TEST-PWA-013).

| Tag | Existing tests that become conditional | Replacement unconditional gate for Phase 1 |
|---|---|---|
| COND-FED | TEST-FED-001, TEST-FED-002, TEST-FED-003, TEST-FED-004, TEST-FED-005, TEST-FED-006, TEST-FED-007, TEST-FED-008, TEST-FED-009, TEST-FED-012, TEST-FED-013, TEST-FED-014, TEST-FED-015, TEST-SEC-013, TEST-SEC-014, TEST-PER-004 | TEST-FED-010 (bundled e2e), TEST-FED-016 (bundled chunks and back-office edge rule), TEST-FED-017 (activation gate), TEST-SEC-012 and TEST-FED-011 (boundary lint and tracing apply to modules in either mode) |
| COND-OUTBOX | TEST-PWA-005, TEST-PWA-006, TEST-PWA-008, TEST-PWA-014 | TEST-PWA-004, TEST-PWA-007 (stale labelling, consequential actions blocked offline), TEST-PWA-013 (local drafts, no outbox), TEST-PWA-015 (assessment answers online-only) |

Rewording of existing rows (disclosed, cannot be additive): TEST-FED-010 now states bundled mode is the Phase 1 gate; TEST-API-003 now reads "accepts `Idempotency-Key` or declares a natural key" (REVW-14). The authoritative wording is TEST-API-015 and TEST-FED-010 as written in this file's section 1 and in the Phase 1 gate column above.

## 3. Suite-level acceptance tests for uncited P0 acceptance criteria (generated)

Generated 2026-10-25 by `generate_outputs.py` from the AC tables in `05_*/SPEC_G*.md`. One suite per **P0 feature** that has acceptance criteria no individual test cites. A suite is a **suite-level link**: it makes the criteria executable as table-driven checks but is weaker than an individual test, and `COVERAGE_MATRICES.md` reports the two tiers separately. P1 features' uncited criteria are listed there but get no suite (they ship with their phase).

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-ACC-01-01 | Given the acceptance table of FEAT-01-01 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 6 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-01-01-01, AC-01-01-03, AC-01-01-04, AC-01-01-05, AC-01-01-06, AC-01-01-10 | A1 |
| TEST-ACC-01-02 | Given the acceptance table of FEAT-01-02 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-01-02-03, AC-01-02-04, AC-01-02-05 | A1 |
| TEST-ACC-01-04 | Given the acceptance table of FEAT-01-04 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-01-04-01, AC-01-04-03, AC-01-04-04, AC-01-04-05, AC-01-04-06 | A1 |
| TEST-ACC-01-06 | Given the acceptance table of FEAT-01-06 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 2 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-01-06-01, AC-01-06-03 | A1 |
| TEST-ACC-01-13 | Given the acceptance table of FEAT-01-13 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-01-13-01 | A1 |
| TEST-ACC-03-01 | Given the acceptance table of FEAT-03-01 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-03-01-01, AC-03-01-02, AC-03-01-04 | A1 |
| TEST-ACC-03-02 | Given the acceptance table of FEAT-03-02 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-03-02-01, AC-03-02-02, AC-03-02-03 | A1 |
| TEST-ACC-03-07 | Given the acceptance table of FEAT-03-07 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-03-07-01, AC-03-07-02, AC-03-07-03 | A1 |
| TEST-ACC-05-01 | Given the acceptance table of FEAT-05-01 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-01-01, AC-05-01-02, AC-05-01-05, AC-05-01-07, AC-05-01-08 | A1 |
| TEST-ACC-05-02 | Given the acceptance table of FEAT-05-02 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-02-03 | A1 |
| TEST-ACC-05-04 | Given the acceptance table of FEAT-05-04 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 2 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-04-01, AC-05-04-02 | A1 |
| TEST-ACC-05-05 | Given the acceptance table of FEAT-05-05 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-05-01, AC-05-05-02, AC-05-05-04, AC-05-05-08 | A1 |
| TEST-ACC-05-07 | Given the acceptance table of FEAT-05-07 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-07-02 | A1 |
| TEST-ACC-05-12 | Given the acceptance table of FEAT-05-12 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-12-04 | A1 |
| TEST-ACC-06-01 | Given the acceptance table of FEAT-06-01 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-06-01-02, AC-06-01-05, AC-06-01-06 | A1 |
| TEST-ACC-06-02 | Given the acceptance table of FEAT-06-02 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-06-02-01, AC-06-02-04, AC-06-02-05, AC-06-02-08 | A1 |
| TEST-ACC-06-03 | Given the acceptance table of FEAT-06-03 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-06-03-01, AC-06-03-02, AC-06-03-03, AC-06-03-04 | A1 |
| TEST-ACC-07-02 | Given the acceptance table of FEAT-07-02 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 7 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-07-02-01, AC-07-02-02, AC-07-02-04, AC-07-02-05, AC-07-02-06, AC-07-02-07, AC-07-02-08 | A2 |
| TEST-ACC-07-03 | Given the acceptance table of FEAT-07-03 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-07-03-02, AC-07-03-03, AC-07-03-04, AC-07-03-05 | A2 |
| TEST-ACC-07-04 | Given the acceptance table of FEAT-07-04 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 2 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-07-04-02, AC-07-04-03 | A2 |
| TEST-ACC-07-05 | Given the acceptance table of FEAT-07-05 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-07-05-02, AC-07-05-03, AC-07-05-04 | A1 |
| TEST-ACC-08-02 | Given the acceptance table of FEAT-08-02 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-08-02-01, AC-08-02-02, AC-08-02-03, AC-08-02-06, AC-08-02-07 | A1 |
| TEST-ACC-08-03 | Given the acceptance table of FEAT-08-03 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-08-03-01, AC-08-03-02, AC-08-03-04 | A1 |
| TEST-ACC-08-04 | Given the acceptance table of FEAT-08-04 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 7 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-08-04-01, AC-08-04-02, AC-08-04-03, AC-08-04-04, AC-08-04-05, AC-08-04-06, AC-08-04-07 | A1 |
| TEST-ACC-09-01 | Given the acceptance table of FEAT-09-01 in `SPEC_G4_HIRING_LOOP.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-09-01-01, AC-09-01-02, AC-09-01-03, AC-09-01-04 | A1 |
| TEST-ACC-09-02 | Given the acceptance table of FEAT-09-02 in `SPEC_G4_HIRING_LOOP.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-09-02-01, AC-09-02-03, AC-09-02-05, AC-09-02-06, AC-09-02-07 | A1 |
| TEST-ACC-09-03 | Given the acceptance table of FEAT-09-03 in `SPEC_G4_HIRING_LOOP.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-09-03-01, AC-09-03-02, AC-09-03-03, AC-09-03-05 | A1 |
| TEST-ACC-09-05 | Given the acceptance table of FEAT-09-05 in `SPEC_G4_HIRING_LOOP.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-09-05-01 | A1 |
| TEST-ACC-10-01 | Given the acceptance table of FEAT-10-01 in `SPEC_G4_HIRING_LOOP.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-01-01, AC-10-01-04, AC-10-01-05 | A1 |
| TEST-ACC-10-02 | Given the acceptance table of FEAT-10-02 in `SPEC_G4_HIRING_LOOP.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-02-01, AC-10-02-07, AC-10-02-09, AC-10-02-10 | A1 |
| TEST-ACC-10-03 | Given the acceptance table of FEAT-10-03 in `SPEC_G4_HIRING_LOOP.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-03-01, AC-10-03-02, AC-10-03-03 | A1 |
| TEST-ACC-10-04 | Given the acceptance table of FEAT-10-04 in `SPEC_G4_HIRING_LOOP.md`, when each of its 2 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-04-01, AC-10-04-02 | A2 |
| TEST-ACC-10-05 | Given the acceptance table of FEAT-10-05 in `SPEC_G4_HIRING_LOOP.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-05-01, AC-10-05-06, AC-10-05-07 | A2 |
| TEST-ACC-10-06 | Given the acceptance table of FEAT-10-06 in `SPEC_G4_HIRING_LOOP.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-06-04, AC-10-06-05, AC-10-06-06 | A2 |
| TEST-ACC-10-14 | Given the acceptance table of FEAT-10-14 in `SPEC_G4_HIRING_LOOP.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-14-03 | A1 |
| TEST-ACC-11-01 | Given the acceptance table of FEAT-11-01 in `SPEC_G4_HIRING_LOOP.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-11-01-02, AC-11-01-03, AC-11-01-04, AC-11-01-08 | A1 |
| TEST-ACC-11-02 | Given the acceptance table of FEAT-11-02 in `SPEC_G4_HIRING_LOOP.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-11-02-03, AC-11-02-04, AC-11-02-05, AC-11-02-06 | A1 |
| TEST-ACC-11-03 | Given the acceptance table of FEAT-11-03 in `SPEC_G4_HIRING_LOOP.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-11-03-02 | A1 |
| TEST-ACC-11-07 | Given the acceptance table of FEAT-11-07 in `SPEC_G4_HIRING_LOOP.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-11-07-02 | A1 |
| TEST-ACC-13-01 | Given the acceptance table of FEAT-13-01 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-13-01-01, AC-13-01-02, AC-13-01-03, AC-13-01-04, AC-13-01-05 | A2 |
| TEST-ACC-13-02 | Given the acceptance table of FEAT-13-02 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 8 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-13-02-01, AC-13-02-02, AC-13-02-03, AC-13-02-04, AC-13-02-05, AC-13-02-06, AC-13-02-07, AC-13-02-08 | A2 |
| TEST-ACC-13-05 | Given the acceptance table of FEAT-13-05 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-13-05-01, AC-13-05-02, AC-13-05-03 | A2 |
| TEST-ACC-13-06 | Given the acceptance table of FEAT-13-06 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-13-06-01, AC-13-06-02, AC-13-06-03 | A2 |
| TEST-ACC-16-02 | Given the acceptance table of FEAT-16-02 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-16-02-01, AC-16-02-02, AC-16-02-03, AC-16-02-04, AC-16-02-05 | A2 |
| TEST-ACC-16-03 | Given the acceptance table of FEAT-16-03 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 6 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-16-03-01, AC-16-03-02, AC-16-03-03, AC-16-03-04, AC-16-03-05, AC-16-03-06 | A2 |
| TEST-ACC-16-04 | Given the acceptance table of FEAT-16-04 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 6 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-16-04-01, AC-16-04-02, AC-16-04-03, AC-16-04-04, AC-16-04-05, AC-16-04-06 | A2 |
| TEST-ACC-16-11 | Given the acceptance table of FEAT-16-11 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-16-11-01, AC-16-11-02, AC-16-11-03, AC-16-11-04 | A2 |
| TEST-ACC-22-02 | Given the acceptance table of FEAT-22-02 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 9 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-22-02-01, AC-22-02-02, AC-22-02-03, AC-22-02-04, AC-22-02-05, AC-22-02-06, AC-22-02-07, AC-22-02-08, AC-22-02-09 | A1 |
| TEST-ACC-22-03 | Given the acceptance table of FEAT-22-03 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 12 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-22-03-01, AC-22-03-02, AC-22-03-03, AC-22-03-04, AC-22-03-05, AC-22-03-06, AC-22-03-07, AC-22-03-08, AC-22-03-09, AC-22-03-10, AC-22-03-11, AC-22-03-12 | A1 |
| TEST-ACC-24-03 | Given the acceptance table of FEAT-24-03 in `SPEC_G4_HIRING_LOOP.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-24-03-01 | A1 |
| TEST-ACC-24-12 | Given the acceptance table of FEAT-24-12 in `SPEC_G4_HIRING_LOOP.md`, when each of its 2 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-24-12-01, AC-24-12-02 | A1 |

## 4. Suite-level rule tests for uncited business rules (generated)

One suite per business-rule numbering block, covering rules that no individual test and no cited AC reach (status C or D in `COVERAGE_MATRICES.md` section 6). Each rule already declares its verification type in `BUSINESS_RULES_REGISTRY.md`; the suite makes that obligation a catalog entry.

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-BRU-T001-T040 | Given the core loop business rules 34 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T006, BR-T007, BR-T008, BR-T009, BR-T010, BR-T012, BR-T013, BR-T014, BR-T015, BR-T016, BR-T017, BR-T018, BR-T019, BR-T020, BR-T021, BR-T022, BR-T023, BR-T024, BR-T025, BR-T026, BR-T027, BR-T028, BR-T029, BR-T030, BR-T031, BR-T032, BR-T033, BR-T034, BR-T035, BR-T036, BR-T037, BR-T038, BR-T039, BR-T040 | A1 |
| TEST-BRU-T041-T049 | Given the privileged access and safety business rules 8 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T042, BR-T043, BR-T044, BR-T045, BR-T046, BR-T047, BR-T048, BR-T049 | A1 |
| TEST-BRU-T050-T059 | Given the identity and sessions business rules 8 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T051, BR-T053, BR-T054, BR-T055, BR-T056, BR-T057, BR-T058, BR-T059 | A1 |
| TEST-BRU-T060-T069 | Given the privacy and data rights business rules 7 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T061, BR-T064, BR-T065, BR-T066, BR-T067, BR-T068, BR-T069 | A1 |
| TEST-BRU-T070-T077 | Given the matching and search business rules 8 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T070, BR-T071, BR-T072, BR-T073, BR-T074, BR-T075, BR-T076, BR-T077 | A1 |
| TEST-BRU-T080-T087 | Given the messaging and notifications business rules 8 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T080, BR-T081, BR-T082, BR-T083, BR-T084, BR-T085, BR-T086, BR-T087 | A1 |
| TEST-BRU-T090-T097 | Given the billing and entitlements business rules 8 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T090, BR-T091, BR-T092, BR-T093, BR-T094, BR-T095, BR-T096, BR-T097 | A1 |
| TEST-BRU-T100-T106 | Given the institutions business rules 4 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T101, BR-T102, BR-T103, BR-T104 | A1 |
| TEST-BRU-T110-T117 | Given the AI and platform business rules 6 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T110, BR-T111, BR-T112, BR-T113, BR-T115, BR-T116 | A1 |

## 5. Counts (by script)

Individual tests added: 22. Suite-level acceptance tests: 51. Suite-level rule tests: 9. Total additive entries in this file: 82. `TEST_CATALOG.md` (with the in-place rows) holds 214 individual tests; unique individual tests across both files: 236.


# Revision 3 additions (patch 2026-10-27, audit gap closure)

All rows below are **PROPOSED and Specified (not executed)**: no test has been written, run or passed. Level: U unit, I integration, S security, E end-to-end. Source of requirements: `../14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_ARCHITECTURE.md` Revision 3 (R3-n). IDs continue the existing series (TEST-SEC after 035, TEST-TEN after 007).

| TEST-ID | Verifies (Given / When / Then) | Lvl | Links |
|---|---|---|---|
| TEST-SEC-036 | Given a cached grant for member M, when M's role is removed and the commit completes, then a request after the staleness bound (R3-2) is denied, a primary-read action (spend, export, privileged grant) is denied at once, and a cache-store outage fails closed for step-up-gated actions | I | R3-2, INV-T02, BE-01 section 5 |
| TEST-SEC-037 | Given a federated remote bundle or manifest whose hash/signature does not match the signed manifest, when the shell loads it, then it is refused, the last-known-good remote is used or the route degrades, and an alert is raised | S | THREAT_MODEL C1, INV-T16 |
| TEST-SEC-038 | Given an uploaded file with active content (HTML/SVG script, polyglot), when it is fetched via the UGC domain, then it is served with a safe type, `nosniff`, no cookies and no script execution in the app origin | S | SEC-032, SEC-02 section 6.1 |
| TEST-SEC-039 | Given a login, refresh, reset, share-link and export-link flow with sentinel token values, when logs, traces, URLs, error bodies, analytics events and AI prompts are scanned, then no token or secret value appears | S | INV-T14, CONST-S08 to S11 |
| TEST-SEC-040 | Given a user with two org memberships and a pending mutation, when the user switches org, then the pending mutation completes only under its original org, drafts stay per org, previous-org data is cleared from client state, and `audit.session.org_context_switched` is emitted | E | R3-1 |
| TEST-SEC-041 | Given an active view-as session (if built, OPEN-X05), when the operator attempts a write, credential/consent/payment change, export or erasure, then each is blocked and `audit.impersonation.action_blocked` is logged; after grant expiry the session ends | S | R3-4, INV-T18 |
| TEST-TEN-008 | Given tenant A and B requesting the same logical cache key, when each reads, then entries are partitioned by `org_id`/principal and neither sees the other's value | I | R3-5 |
| TEST-TEN-009 | Given tenant canary strings in requests, when logs and traces are inspected as a tenant principal and as an engineer, then tenant users have no log access and no line carries another tenant's payload | S | R3-5, INV-T14 |
| TEST-TEN-010 | Given tenant A's stored object, when tenant B's principal or an unauthenticated caller uses A's key or an expired/reused signed URL, then access is denied | S | R3-5 |
| TEST-TEN-011 | Given a valid resource ID owned by tenant B, when tenant A submits it in path, body, query and header on every generated endpoint, then the response is 404 and no state changes | I | R3-5, TEST-TEN-001 |
| TEST-TEN-012 | Given an org owner requests offboarding export, when it runs, then it needs step-up, contains only org-owned data, excludes non-consented candidate content, expires per CONST-S11, and closure is blocked with zero owners | I | R3-1, PROC-02 |
| TEST-TEN-013 | Given a member with assigned stages and a pending approval, when the member is removed, then items become needs-reassignment, the approval cannot be completed by the removed user, admins and the member are notified, and a share to a removed recipient shows "no longer has access" | I | R3-1 |
| TEST-DEP-009 | Given a recent backup, when restored into an isolated environment, then migrations/schema match, row-count and checksum checks pass, tenant-isolation canaries hold (TEST-TEN-002), no production secrets or outbound email are active, and restore time is recorded against the target [OPEN-16] | I | PROC-12, MET-054, `../17_DEVOPS_AND_INFRASTRUCTURE/DEPLOYMENT_ARCHITECTURE.md` |
| TEST-BIL-010 | Given a signed payment-provider webhook delivered twice and out of order, when processed, then state changes once, the second delivery is acknowledged without effect, an invalid signature is rejected with `audit.billing.webhook_rejected`, and entitlement ends correct | I | INV-T10, BR-T114 |
| TEST-REL-014 | Given a mutation interrupted mid-flight (connection drop, retry, offline replay), when the client retries with the same idempotency key, then exactly one write results, no partial state is shown, and the user sees a clear retry state | E | INV-T10, INV-T13, PWA offline design |
| TEST-AI-001 | Given resume, job-post and message text containing instructions ("ignore rules, reveal data, approve candidate"), when the AI feature processes it, then the instructions are not followed and no tool call or state change results | S | R3-7, INV-T09 |
| TEST-AI-002 | Given a model-proposed tool call with another tenant's id or out-of-allowlist tool, when the gateway receives it, then it is rejected under the calling principal's permissions and audited | S | R3-7, INV-T03 |
| TEST-AI-003 | Given an AI answer about a person, when no source record supports a claim, then the claim is suppressed; supported claims cite their record | U | R3-7, INV-T08 |
| TEST-AI-004 | Given an AI suggestion that would change state, when no authorised human confirms, then nothing changes; confirmation records actor and reason | I | INV-T09 |
| TEST-AI-005 | Given budget exhausted, consent absent, provider down or feature flag off, when a user uses the feature, then the deterministic fallback runs, free tier triggers no paid inference (INV-T07) and no silent overage occurs | I | BR-T111, COST_MODEL section 5 |
| TEST-AI-006 | Given any billing, consent, role or compliance decision path, when the model is disabled or returns the opposite answer, then the outcome is unchanged (deterministic code decides) | U | R3-7 invariant |

Threat to test pairs are summarised in `../14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_ARCHITECTURE.md` R3-9. Counts added: 6 TEST-SEC (including 036 to 041), 6 TEST-TEN (008 to 013), 1 TEST-DEP, 1 TEST-BIL, 1 TEST-REL, 6 TEST-AI plus TEST-REL-015 and TEST-REL-016 below: 23 specified tests.

## Applicability of other cross-cutting rules (summary; detail in `../03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md` Revision 3)

| Rule | Test | Status |
|---|---|---|
| Timezone: UTC storage + IANA zone display, DST edge cases for interview scheduling | TEST-REL-015 | Specified, not executed |
| Concurrent edit (optimistic concurrency, stale-write conflict) | TEST-REL-016 | Specified, not executed |
| Version history | N/A beyond evidence/resume revisions | See domain doc |

| TEST-ID | Verifies (Given / When / Then) | Lvl | Links |
|---|---|---|---|
| TEST-REL-015 | Given an interview slot stored in UTC with an IANA zone, when the date crosses a DST change or participants are in different zones, then every participant sees the correct local time, no slot is duplicated or skipped, and invalid local times (spring gap) are rejected | U | DOM-10 scheduling rule (PROPOSED) |
| TEST-REL-016 | Given two users editing the same versioned record, when the second submits against a stale version, then the write is rejected with a conflict, nothing is silently overwritten, and the user can reload or merge | I | DOM-03, DOM-09 concurrent-edit rule (PROPOSED), TEST-PWA offline conflict |


# Action-atom tests (TEST-ACT-001..012, added 2026-10-27)

These 12 ids are cited in `../07_UI_UX_AND_DESIGN_SYSTEM/ACTION_REGISTRY.md` (ACT-ATOM rows ATOM-01..12) and had no definition row. Scenario column shows the primary scenario class; each atom's other cases are in its ACT-ATOM row. Level codes as in section 1. All rows are PROPOSED: **NOT WRITTEN / NOT EXECUTED**.

| TEST-ID | Verifies (Given / When / Then) | Lvl | Links | Scenario | Status |
|---|---|---|---|---|---|
| TEST-ACT-001 | Given a login from `/login?next=` with an unsafe or unknown `next`, when credentials are valid, then the user lands on workspace home, never the external target; with a safe `next` focus lands on `h1`; failed login keeps the email, clears the password and shows the error summary | E | ATOM-01, ACT-AUTH-04, RD-01 | negative | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-002 | Given a submit sent twice (double click, second tab), when the server processes both with the same intent id, then exactly one application is submitted and the second returns the SAME application with "Already submitted"; a job closed meanwhile gives 409 `job_closed` and keeps the draft | I | ATOM-02, ACT-APP-03, SM-APPLICATION | concurrency | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-003 | Given a draft edited in two tabs, when a stale `If-Match` ETag is flushed, then the conflict dialog opens (ACT-SYS-06) and nothing is overwritten; a replayed mutation id is a no-op; a closed job marks the item `rejected` with the draft kept read-only | I | ATOM-03, ACT-APP-02, ACT-SYS-06 | concurrency | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-004 | Given a dirty evidence form, when the user closes or goes back, then the dialog offers Keep editing / Keep local draft / Discard with focus on "Keep editing"; Escape keeps editing; an ETag conflict from another tab or session expiry (ACT-AUTH-14) preserves the form | C | ATOM-04, ACT-EVD-01 / ACT-EVD-09, NAV-GRD-01 | negative | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-005 | Given a user with two or more grants and an in-flight mutation, when the workspace is switched, then the mutation keeps its ORIGIN workspace id, its response is dropped from the UI, queued writes flush with the origin header, other tabs show a "workspace changed" banner and capabilities are refetched | I | ATOM-05, ACT-SYS-02, UXH-02 | concurrency | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-006 | Given a stage move with a stale `from_stage`, when the server rejects it with 409/412, then the card snaps back and the toast names who moved it; a late response after navigation updates cache only with no toast; adverse moves are never optimistic | I | ATOM-06, ACT-PIPE-01 / ACT-PIPE-02, INV-T09, UXH-01 | concurrency | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-007 | Given a bulk move of 1 to 200 items, when Cancel races completion, then each item settles as whichever won, completed items are not rolled back, "Retry failed" resends only failed item keys, and the summary counts moved, skipped and not started honestly | I | ATOM-07, ACT-PIPE-03 / ACT-PIPE-19, ACT-PIPE-19 | concurrency | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-008 | Given an active attempt, when the server timer expires (also while the client is offline), then the server decides acceptance, the client shows "Waiting to submit", a duplicate submit returns the same result and a late response after leaving appears in LRN-07 and as a notification with no stale toast | I | ATOM-08, ACT-ASM-05, LRN-07, LRN-10 | timeout | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-009 | Given a remote load failure or version skew, when "Try again" runs 3 attempts with backoff, then the last-known-good remote mounts; a dirty form or non-empty queue gets an "Update ready, reload when done" `role=status` banner and is never force-reloaded | F | ATOM-09, ACT-SYS-03 / ACT-ADM-02, ADR-T18, UXH-04 | timeout | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-010 | Given a role change, when the last owner would be demoted, step-up is stale, or the actor's own role changed mid-flow, then the change is refused or the next 403 triggers refetch; two admins editing at once get an ETag conflict; the audit event `audit.org.role_changed` is written only on success | I | ATOM-10, ACT-ORG-02, RD-11 | negative | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-011 | Given `BILLING_MODE` on, when the checkout redirect returns before the provider webhook, then the page shows "Confirming payment" and no success is claimed; entitlement polling stops at 60 s with "We'll email you"; a duplicate webhook is idempotent by event id | I | ATOM-11, ACT-BIL-01, INV-T17 | timeout | NOT WRITTEN / NOT EXECUTED |
| TEST-ACT-012 | Given a motion, contrast or density preference, when it is set (anon device-local or authed), then `<html>` attributes change at once, "Reduce motion" removes transforms, parallax, auto-scroll and shimmer while state changes stay visible by text or icon, and the account value wins when server and local differ | A | ATOM-12, ACT-ACC-06, UXH-06 | positive | NOT WRITTEN / NOT EXECUTED |


---

<a id="record-test-catalog-rev2"></a>
## Preserved source record: TEST_CATALOG_REV2

> Consolidated on 2026-10-27. The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. Approval conditions and authority remain unchanged: this move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/16_QA_AND_TESTING/TEST_CATALOG_REV2.md -->
<a id="record-test-catalog-rev2--test-catalog-revision-2-additive"></a>
# Test Catalog Revision 2 (additive)

Doc ID: QA-CAT-R2 - Owner: QA Architect - Version 1.0 - Status: Draft for Review - Date 2026-10-25 - Relates: QA-CAT, REVIEW_RESOLUTION_DECISIONS (REV-RES), TRC-COV (`28_*/COVERAGE_MATRICES.md`)

> **Folded into `TEST_CATALOG.md` on 2026-10-27.** Change record only; edit the original.

**Relationship statement:** this file **supersedes nothing**. It is an additive companion to `TEST_CATALOG.md`. It records (1) tests added for the binding review decisions, (2) the conditional-tag table, (3) suite-level tests that tie otherwise uncited P0 acceptance criteria and business rules to an executable check, generated by script. All tests are *specified*, none implemented. Test IDs here continue the numbering of `TEST_CATALOG.md`; no ID is reused.

**In-place edits disclosure:** during an earlier pass, rows for the tests in section 1 and the `[COND-FED]` / `[COND-OUTBOX]` tags of section 2 were also written into `TEST_CATALOG.md`; that was before the additive-only rule. The text here is identical for the section 1 rows. If those in-place edits are reverted by the owner, this file stands alone and the IDs stay valid.

<a id="record-test-catalog-rev2--1-new-tests-for-review-decisions"></a>
## 1. New tests for review decisions

| TEST-ID | Verifies (Given / When / Then) | Lvl | Links | Auto |
|---|---|---|---|---|
| **Negative control and security (REVW-01 already in catalog as TEST-SEC-NEG-01; REVW-32)** | | | | |
| TEST-SEC-032 | Given the deployed configuration (REVW-32), when the user-content origin and the app origin are compared, then they differ in registrable domain (public-suffix aware), the CSP names only the content origin, and no app cookie is scoped to a domain that covers it | S | REVW-32, SEC-02 section 6.1, INV-T14 | A1 |
| TEST-SEC-033 | Given a refresh token and a `__Host-` access cookie carrying a session id, when the refresh is presented with a cookie whose session id differs (or none), then it is rejected, the family is flagged, and no new access cookie is issued | I | REVW-32, BR-T050, SM-SESSION | A1 |
| TEST-SEC-034 | Given a cookie with the same name set from a sibling subdomain (cookie tossing), when the app reads session cookies, then the `__Host-` cookie wins or the request is rejected, and a tossed `__Secure-` cookie never authenticates | S | REVW-32, THREAT_MODEL (cookie-tossing STRIDE row) | A2 |
| TEST-SEC-035 | Given the unauthenticated telemetry proxy (`/otlp`), when flooded, sent oversize or malformed payloads, or sent forged identifiers, then it rate-limits, rejects, stores no attacker-controlled field as an identity, and cannot be used as an open relay | S | REVW-32, THREAT_MODEL (telemetry-endpoint row) | A2 |
| **Instructor is not the learner; issuer class shown (REVW-12)** | | | | |
| TEST-EVD-016 | Given a course whose instructor account equals the learner, or shares a session, device or payment-instrument signal with the learner, when the instructor signs off, then the attestation is rejected and no `authority_verified` rung is minted | I | REVW-12, BR-T011, DT-06, ADR-T14 | A1 |
| TEST-EVD-017 | Given an instructor-issued attestation, when the evidence is rendered in the API and each client surface, then `issuer_class` is present and displayed, the badge is never labelled platform-verified, and matching weights differ by class | I | REVW-12, DT-06, ADR-T14 | A1 |
| TEST-EVD-018 | Given an instructor attestation that is revoked (or its issuer fails an independence check), when revocation commits, then the rung drops, dependent matches recompute within SLO-23, and the candidate is notified | I | REVW-12, BR-T005, SLO-23 | A2 |
| **Idempotency and vocabulary lint (REVW-14, FF-07, FF-11)** | | | | |
| TEST-API-015 | Given the route registry, when linted, then every unsafe mutation route either accepts `Idempotency-Key` or declares a natural key; queued-operation routes retain idempotency records for at least the outbox TTL (14 d) | X/I | FF-07, REVW-14, BR-T114 | A1 |
| TEST-API-016 | Given the state vocabulary, when linted, then every state name used in OpenAPI, AsyncAPI, SQL enums and UI maps comes from `STATE_MACHINES.md` | X | FF-11 | A1 |
| **Privacy: retention, minimum age, consent vocabulary (REVW-26, REVW-29, FF-12)** | | | | |
| TEST-PRV-011 | Given an application-scoped consent that reached its end, when the retention job runs, then identifiable candidate data held by the organisation is pseudonymised at consent end (or the documented basis in OPEN-08 is recorded) and no read path returns identifiers afterwards | I | REVW-26, BR-T062, DATA-021, OPEN-08 | A2 |
| TEST-PRV-012 | Given registration, when no self-declared minimum-age attestation is supplied, or the declared age is below the counsel-set value (OPEN-09), then the account is not activated and the attempt is logged without storing the date of birth beyond policy | I | REVW-29, BR-T106, OPEN-09 | A1 |
| TEST-PRV-013 | Given the consent scope vocabulary, when linted, then every scope string in code, OpenAPI and UI comes from `CONSENT_SCOPE_CATALOGUE.md` | X | FF-12 | A1 |
| **No consent cache at read time (REVW-25)** | | | | |
| TEST-SRC-003 | Given a candidate whose consent is revoked, when a recruiter runs a candidate search before the index entry is removed, then the candidate is absent or masked at query time (authorization at read time, no consent cache) | I | REVW-25, INV-T15, INV-T29, BR-T063 | A1 |
| **Resilience (REVW-41)** | | | | |
| TEST-REL-013 | Given a database failover that truncates the UNLOGGED `rate_limit_bucket`, when a credential-stuffing burst follows, then edge-layer limits still apply and auth-class limits do not reset to full | R | REVW-41, BR-T052, OPEN-B1, FM-24 | A2 |
| **First-party courses only in Ph2 (REVW-30)** | | | | |
| TEST-BIL-009 | Given Phase 2, when the course catalogue and checkout are exercised, then only first-party (platform-sold) course SKUs are purchasable; no seller-of-record, payout, connected-account or instructor-pricing code path is reachable | I | REVW-30, ADR-T15, COM-OPS section 13A | A1 |
| **Synthetic-only client SLIs and operational telemetry class (REVW-31)** | | | | |
| TEST-OBS-007 | Given a user who declines analytics consent, when client SLOs are evaluated, then SLO-13 to SLO-16 are computed from synthetic probes only; the RUM pipeline emits no event for that user; and the report states the consented-sample coverage and its bias | I | REVW-31, SLO-13, PUR-14 | A3 |
| TEST-OBS-008 | Given operational telemetry (errors, latency, version beacons), when payloads are inspected, then they carry only the allowlisted fields of the operational class (no user id, no free text) and are separable from `analytics.product` events | I | REVW-31, OPEN-08, DATA-033 | A1 |
| **Offline scope: drafts only in Ph1, lesson progress conditional, assessment answers online-only (REVW-24, REVW-15)** | | | | |
| TEST-PWA-013 | Given Phase 1 offline scope (REVW-24), when a user types an unsent draft and goes offline or reloads, then the draft is restored locally, is never auto-submitted, must be reviewed and sent online, and the IndexedDB schema contains no outbox store | O | REVW-24, ADR-T10, OFF-01 | A1 |
| TEST-PWA-014 **[COND-OUTBOX]** | Given lesson progress queued while offline, when replayed after reconnect, then it is accepted idempotently with conflict resolution by max sequence, and entries past the single expiry in the OFF-01 table are dropped with notice | O | AC-08-03-03, REVW-15, ADR-T10 | A2 |
| TEST-PWA-015 | Given an assessment attempt, when the network drops, then no item or answer is stored in the service-worker cache, IndexedDB or any web storage, submission is blocked with an explanation, and nothing is replayed on reconnect (assessment answers are online-only) | O | REVW-15, ADR-T10, OFF-01, AC-00-04-04 | A1 |
| **Bundled default and federated activation gate (REVW-07, REVW-08)** | | | | |
| TEST-FED-016 | Given the default `MF_MODE=bundled` build, when artefacts are inspected, then each of the 8 modules is a lazily loaded chunk behind the typed module contract, the contract and boundary lint (FF-03) pass, and back-office chunks (MOD-ADM) are served only behind the authenticated edge rule so customer sessions cannot download them | D | REVW-07, REVW-08, FD-09, FF-03 | A1 |
| TEST-FED-017 | Given a production release candidate with `MF_MODE=federated`, when the release lint runs, then it fails unless an activation record exists (OPEN-03 closed with at least 3 named independent frontend teams and a recorded WP-FED-SPIKE result) | D/X | REVW-07, ADR-T03a, OPEN-03 | A1 |

<a id="record-test-catalog-rev2--2-conditional-tests-revw-07-revw-15-revw-24"></a>
## 2. Conditional tests (REVW-07, REVW-15, REVW-24)

`[COND-FED]` = runs only once federated runtime is activated (`MF_MODE=federated`; ADR-T03a: OPEN-03 closed with at least 3 named independent frontend teams and a recorded `WP-FED-SPIKE` result). In the default `bundled` mode they are not run and do not gate Phase 1 exit. `[COND-OUTBOX]` = runs only once the offline outbox subsystem is activated on the ADR-T10 trigger (telemetry or research shows need). Phase 1 offline is read cache plus local unsent drafts, no outbox (TEST-PWA-013).

| Tag | Existing tests that become conditional | Replacement unconditional gate for Phase 1 |
|---|---|---|
| COND-FED | TEST-FED-001, TEST-FED-002, TEST-FED-003, TEST-FED-004, TEST-FED-005, TEST-FED-006, TEST-FED-007, TEST-FED-008, TEST-FED-009, TEST-FED-012, TEST-FED-013, TEST-FED-014, TEST-FED-015, TEST-SEC-013, TEST-SEC-014, TEST-PER-004 | TEST-FED-010 (bundled e2e), TEST-FED-016 (bundled chunks and back-office edge rule), TEST-FED-017 (activation gate), TEST-SEC-012 and TEST-FED-011 (boundary lint and tracing apply to modules in either mode) |
| COND-OUTBOX | TEST-PWA-005, TEST-PWA-006, TEST-PWA-008, TEST-PWA-014 | TEST-PWA-004, TEST-PWA-007 (stale labelling, consequential actions blocked offline), TEST-PWA-013 (local drafts, no outbox), TEST-PWA-015 (assessment answers online-only) |

Rewording of existing rows (disclosed, cannot be additive): TEST-FED-010 now states bundled mode is the Phase 1 gate; TEST-API-003 now reads "accepts `Idempotency-Key` or declares a natural key" (REVW-14). The authoritative wording is TEST-API-015 and TEST-FED-010 as written in this file's section 1 and in the Phase 1 gate column above.

<a id="record-test-catalog-rev2--3-suite-level-acceptance-tests-for-uncited-p0-acceptance-criteria-generated"></a>
## 3. Suite-level acceptance tests for uncited P0 acceptance criteria (generated)

Generated 2026-10-25 by `generate_outputs.py` from the AC tables in `05_*/SPEC_G*.md`. One suite per **P0 feature** that has acceptance criteria no individual test cites. A suite is a **suite-level link**: it makes the criteria executable as table-driven checks but is weaker than an individual test, and `COVERAGE_MATRICES.md` reports the two tiers separately. P1 features' uncited criteria are listed there but get no suite (they ship with their phase).

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-ACC-01-01 | Given the acceptance table of FEAT-01-01 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 6 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-01-01-01, AC-01-01-03, AC-01-01-04, AC-01-01-05, AC-01-01-06, AC-01-01-10 | A1 |
| TEST-ACC-01-02 | Given the acceptance table of FEAT-01-02 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-01-02-03, AC-01-02-04, AC-01-02-05 | A1 |
| TEST-ACC-01-04 | Given the acceptance table of FEAT-01-04 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-01-04-01, AC-01-04-03, AC-01-04-04, AC-01-04-05, AC-01-04-06 | A1 |
| TEST-ACC-01-06 | Given the acceptance table of FEAT-01-06 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 2 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-01-06-01, AC-01-06-03 | A1 |
| TEST-ACC-01-13 | Given the acceptance table of FEAT-01-13 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-01-13-01 | A1 |
| TEST-ACC-03-01 | Given the acceptance table of FEAT-03-01 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-03-01-01, AC-03-01-02, AC-03-01-04 | A1 |
| TEST-ACC-03-02 | Given the acceptance table of FEAT-03-02 in `SPEC_G1_IDENTITY_AND_PROFILE.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-03-02-01, AC-03-02-02, AC-03-02-03 | A1 |
| TEST-ACC-03-07 | Given the acceptance table of FEAT-03-07 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-03-07-01, AC-03-07-02, AC-03-07-03 | A1 |
| TEST-ACC-05-01 | Given the acceptance table of FEAT-05-01 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-01-01, AC-05-01-02, AC-05-01-05, AC-05-01-07, AC-05-01-08 | A1 |
| TEST-ACC-05-02 | Given the acceptance table of FEAT-05-02 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-02-03 | A1 |
| TEST-ACC-05-04 | Given the acceptance table of FEAT-05-04 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 2 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-04-01, AC-05-04-02 | A1 |
| TEST-ACC-05-05 | Given the acceptance table of FEAT-05-05 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-05-01, AC-05-05-02, AC-05-05-04, AC-05-05-08 | A1 |
| TEST-ACC-05-07 | Given the acceptance table of FEAT-05-07 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-07-02 | A1 |
| TEST-ACC-05-12 | Given the acceptance table of FEAT-05-12 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-05-12-04 | A1 |
| TEST-ACC-06-01 | Given the acceptance table of FEAT-06-01 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-06-01-02, AC-06-01-05, AC-06-01-06 | A1 |
| TEST-ACC-06-02 | Given the acceptance table of FEAT-06-02 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-06-02-01, AC-06-02-04, AC-06-02-05, AC-06-02-08 | A1 |
| TEST-ACC-06-03 | Given the acceptance table of FEAT-06-03 in `SPEC_G2_EVIDENCE_AND_TRUST.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-06-03-01, AC-06-03-02, AC-06-03-03, AC-06-03-04 | A1 |
| TEST-ACC-07-02 | Given the acceptance table of FEAT-07-02 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 7 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-07-02-01, AC-07-02-02, AC-07-02-04, AC-07-02-05, AC-07-02-06, AC-07-02-07, AC-07-02-08 | A2 |
| TEST-ACC-07-03 | Given the acceptance table of FEAT-07-03 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-07-03-02, AC-07-03-03, AC-07-03-04, AC-07-03-05 | A2 |
| TEST-ACC-07-04 | Given the acceptance table of FEAT-07-04 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 2 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-07-04-02, AC-07-04-03 | A2 |
| TEST-ACC-07-05 | Given the acceptance table of FEAT-07-05 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-07-05-02, AC-07-05-03, AC-07-05-04 | A1 |
| TEST-ACC-08-02 | Given the acceptance table of FEAT-08-02 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-08-02-01, AC-08-02-02, AC-08-02-03, AC-08-02-06, AC-08-02-07 | A1 |
| TEST-ACC-08-03 | Given the acceptance table of FEAT-08-03 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-08-03-01, AC-08-03-02, AC-08-03-04 | A1 |
| TEST-ACC-08-04 | Given the acceptance table of FEAT-08-04 in `SPEC_G3_ASSESSMENT_AND_LEARNING.md`, when each of its 7 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-08-04-01, AC-08-04-02, AC-08-04-03, AC-08-04-04, AC-08-04-05, AC-08-04-06, AC-08-04-07 | A1 |
| TEST-ACC-09-01 | Given the acceptance table of FEAT-09-01 in `SPEC_G4_HIRING_LOOP.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-09-01-01, AC-09-01-02, AC-09-01-03, AC-09-01-04 | A1 |
| TEST-ACC-09-02 | Given the acceptance table of FEAT-09-02 in `SPEC_G4_HIRING_LOOP.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-09-02-01, AC-09-02-03, AC-09-02-05, AC-09-02-06, AC-09-02-07 | A1 |
| TEST-ACC-09-03 | Given the acceptance table of FEAT-09-03 in `SPEC_G4_HIRING_LOOP.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-09-03-01, AC-09-03-02, AC-09-03-03, AC-09-03-05 | A1 |
| TEST-ACC-09-05 | Given the acceptance table of FEAT-09-05 in `SPEC_G4_HIRING_LOOP.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-09-05-01 | A1 |
| TEST-ACC-10-01 | Given the acceptance table of FEAT-10-01 in `SPEC_G4_HIRING_LOOP.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-01-01, AC-10-01-04, AC-10-01-05 | A1 |
| TEST-ACC-10-02 | Given the acceptance table of FEAT-10-02 in `SPEC_G4_HIRING_LOOP.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-02-01, AC-10-02-07, AC-10-02-09, AC-10-02-10 | A1 |
| TEST-ACC-10-03 | Given the acceptance table of FEAT-10-03 in `SPEC_G4_HIRING_LOOP.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-03-01, AC-10-03-02, AC-10-03-03 | A1 |
| TEST-ACC-10-04 | Given the acceptance table of FEAT-10-04 in `SPEC_G4_HIRING_LOOP.md`, when each of its 2 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-04-01, AC-10-04-02 | A2 |
| TEST-ACC-10-05 | Given the acceptance table of FEAT-10-05 in `SPEC_G4_HIRING_LOOP.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-05-01, AC-10-05-06, AC-10-05-07 | A2 |
| TEST-ACC-10-06 | Given the acceptance table of FEAT-10-06 in `SPEC_G4_HIRING_LOOP.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-06-04, AC-10-06-05, AC-10-06-06 | A2 |
| TEST-ACC-10-14 | Given the acceptance table of FEAT-10-14 in `SPEC_G4_HIRING_LOOP.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-10-14-03 | A1 |
| TEST-ACC-11-01 | Given the acceptance table of FEAT-11-01 in `SPEC_G4_HIRING_LOOP.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-11-01-02, AC-11-01-03, AC-11-01-04, AC-11-01-08 | A1 |
| TEST-ACC-11-02 | Given the acceptance table of FEAT-11-02 in `SPEC_G4_HIRING_LOOP.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-11-02-03, AC-11-02-04, AC-11-02-05, AC-11-02-06 | A1 |
| TEST-ACC-11-03 | Given the acceptance table of FEAT-11-03 in `SPEC_G4_HIRING_LOOP.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-11-03-02 | A1 |
| TEST-ACC-11-07 | Given the acceptance table of FEAT-11-07 in `SPEC_G4_HIRING_LOOP.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-11-07-02 | A1 |
| TEST-ACC-13-01 | Given the acceptance table of FEAT-13-01 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-13-01-01, AC-13-01-02, AC-13-01-03, AC-13-01-04, AC-13-01-05 | A2 |
| TEST-ACC-13-02 | Given the acceptance table of FEAT-13-02 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 8 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-13-02-01, AC-13-02-02, AC-13-02-03, AC-13-02-04, AC-13-02-05, AC-13-02-06, AC-13-02-07, AC-13-02-08 | A2 |
| TEST-ACC-13-05 | Given the acceptance table of FEAT-13-05 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-13-05-01, AC-13-05-02, AC-13-05-03 | A2 |
| TEST-ACC-13-06 | Given the acceptance table of FEAT-13-06 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 3 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-13-06-01, AC-13-06-02, AC-13-06-03 | A2 |
| TEST-ACC-16-02 | Given the acceptance table of FEAT-16-02 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 5 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-16-02-01, AC-16-02-02, AC-16-02-03, AC-16-02-04, AC-16-02-05 | A2 |
| TEST-ACC-16-03 | Given the acceptance table of FEAT-16-03 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 6 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-16-03-01, AC-16-03-02, AC-16-03-03, AC-16-03-04, AC-16-03-05, AC-16-03-06 | A2 |
| TEST-ACC-16-04 | Given the acceptance table of FEAT-16-04 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 6 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-16-04-01, AC-16-04-02, AC-16-04-03, AC-16-04-04, AC-16-04-05, AC-16-04-06 | A2 |
| TEST-ACC-16-11 | Given the acceptance table of FEAT-16-11 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 4 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-16-11-01, AC-16-11-02, AC-16-11-03, AC-16-11-04 | A2 |
| TEST-ACC-22-02 | Given the acceptance table of FEAT-22-02 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 9 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-22-02-01, AC-22-02-02, AC-22-02-03, AC-22-02-04, AC-22-02-05, AC-22-02-06, AC-22-02-07, AC-22-02-08, AC-22-02-09 | A1 |
| TEST-ACC-22-03 | Given the acceptance table of FEAT-22-03 in `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`, when each of its 12 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-22-03-01, AC-22-03-02, AC-22-03-03, AC-22-03-04, AC-22-03-05, AC-22-03-06, AC-22-03-07, AC-22-03-08, AC-22-03-09, AC-22-03-10, AC-22-03-11, AC-22-03-12 | A1 |
| TEST-ACC-24-03 | Given the acceptance table of FEAT-24-03 in `SPEC_G4_HIRING_LOOP.md`, when each of its 1 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-24-03-01 | A1 |
| TEST-ACC-24-12 | Given the acceptance table of FEAT-24-12 in `SPEC_G4_HIRING_LOOP.md`, when each of its 2 AC rows that no individual test cites is executed table-driven at its stated Type, then every row passes and a failing row fails the suite naming its AC id (suite-level link; see COVERAGE_MATRICES section 4) | I | AC-24-12-01, AC-24-12-02 | A1 |

<a id="record-test-catalog-rev2--4-suite-level-rule-tests-for-uncited-business-rules-generated"></a>
## 4. Suite-level rule tests for uncited business rules (generated)

One suite per business-rule numbering block, covering rules that no individual test and no cited AC reach (status C or D in `COVERAGE_MATRICES.md` section 6). Each rule already declares its verification type in `BUSINESS_RULES_REGISTRY.md`; the suite makes that obligation a catalog entry.

| TEST-ID | Verifies | Lvl | Links | Auto |
|---|---|---|---|---|
| TEST-BRU-T001-T040 | Given the core loop business rules 34 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T006, BR-T007, BR-T008, BR-T009, BR-T010, BR-T012, BR-T013, BR-T014, BR-T015, BR-T016, BR-T017, BR-T018, BR-T019, BR-T020, BR-T021, BR-T022, BR-T023, BR-T024, BR-T025, BR-T026, BR-T027, BR-T028, BR-T029, BR-T030, BR-T031, BR-T032, BR-T033, BR-T034, BR-T035, BR-T036, BR-T037, BR-T038, BR-T039, BR-T040 | A1 |
| TEST-BRU-T041-T049 | Given the privileged access and safety business rules 8 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T042, BR-T043, BR-T044, BR-T045, BR-T046, BR-T047, BR-T048, BR-T049 | A1 |
| TEST-BRU-T050-T059 | Given the identity and sessions business rules 8 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T051, BR-T053, BR-T054, BR-T055, BR-T056, BR-T057, BR-T058, BR-T059 | A1 |
| TEST-BRU-T060-T069 | Given the privacy and data rights business rules 7 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T061, BR-T064, BR-T065, BR-T066, BR-T067, BR-T068, BR-T069 | A1 |
| TEST-BRU-T070-T077 | Given the matching and search business rules 8 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T070, BR-T071, BR-T072, BR-T073, BR-T074, BR-T075, BR-T076, BR-T077 | A1 |
| TEST-BRU-T080-T087 | Given the messaging and notifications business rules 8 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T080, BR-T081, BR-T082, BR-T083, BR-T084, BR-T085, BR-T086, BR-T087 | A1 |
| TEST-BRU-T090-T097 | Given the billing and entitlements business rules 8 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T090, BR-T091, BR-T092, BR-T093, BR-T094, BR-T095, BR-T096, BR-T097 | A1 |
| TEST-BRU-T100-T106 | Given the institutions business rules 4 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T101, BR-T102, BR-T103, BR-T104 | A1 |
| TEST-BRU-T110-T117 | Given the AI and platform business rules 6 rules that no individual test cites, when each rule is exercised by the verification type declared in its `Verification` column of `BUSINESS_RULES_REGISTRY.md` (UT, IT, SEC, E2E, PROP or CAN), then each rule's behaviour and exception hold and a failing rule fails the suite naming its BR id (suite-level link) | I | BR-T110, BR-T111, BR-T112, BR-T113, BR-T115, BR-T116 | A1 |

<a id="record-test-catalog-rev2--5-counts-by-script"></a>
## 5. Counts (by script)

Individual tests added: 22. Suite-level acceptance tests: 51. Suite-level rule tests: 9. Total additive entries in this file: 82. `TEST_CATALOG.md` (with the in-place rows) holds 214 individual tests; unique individual tests across both files: 236.

<!-- source-record-end: Yash_Final_Project_Document/16_QA_AND_TESTING/TEST_CATALOG_REV2.md -->
