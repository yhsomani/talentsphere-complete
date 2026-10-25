# Acceptance Criteria Guide and Definition of Done

Doc ID: QA-AC · Owner: QA Architect with Product Director · Version 1.0 · Status: Draft for Review · Relates: QA-CAT, QA-STRAT, ID_REGISTRY (FEAT, AC, TEST), `05_FEATURE_SPECIFICATIONS`, CC-INV, OPEN-29

## 1. ID scheme

| Item | Format | Example | Rule |
|---|---|---|---|
| Feature | `FEAT-<DOM>-NN` (registry; hierarchy in `04_PRODUCT_CAPABILITIES`) | FEAT-10-02 (Application submit) | `<DOM>` is the two-digit domain number of DOM-xx |
| Acceptance criterion | `AC-<DOM>-<NN>-<NN>` = `AC-<FEAT without "FEAT-">-<seq>` | AC-10-02-05 | Sequence is stable; never renumber; retire with status `withdrawn`. This is the scheme already used in `05_FEATURE_SPECIFICATIONS` |
| Cross-cutting (platform) criterion | `AC-00-<area>-<seq>` | AC-00-01-04 | Areas: 01 API conventions, 02 federation, 03 observability, 04 PWA/offline, 05 analytics privacy, 06 performance, 07 accessibility; register in section 9 |
| Test | `TEST-<CAT>-NNN` | TEST-SEC-004 | A test may cover several AC; each AC must have at least one test |
| Non-functional | AC whose `Given` states load/profile | AC-00-06-01 | NFR ACs cite SLO-IDs |
| Missing AC | `FEAT-xx-yy (AC pending)` in a test link | n/a | Marks a specification gap; the owner writes the AC; the TEST id stays |

Format note: the feature specifications record ACs as table rows `Given | When | Then | Type` (Type tags: Happy, Negative, Boundary, Idempotency, Concurrency, Recovery, Time, Security, Fairness, Honesty, Privacy, Offline, Accessibility). The Given/When/Then block below is the equivalent long form for reviews and platform ACs; both carry the same ID.

## 2. Writing format (Given / When / Then)

```
AC-10-14-04  [R1] [MUST]   (registry form: recruiter of other org requests snapshot id | GET | 404 | IDOR)
Given   a recruiter of Org B is authenticated and evidence snapshot X belongs to an application to Org A
When    the recruiter requests GET /api/v1/applications/.../snapshot/X
Then    the response is 404 problem+json with no information that X exists
And     no state changes, and an access-denied event is logged without PII
Trace   FEAT-10-14 · INV-T02 · INV-T29 · TEST-SEC-004
```

Conventions:

| Rule | Why |
|---|---|
| One behaviour per AC; one observable `Then` (extra `And` only for the same outcome) | Testable and independently failing |
| State actor and scope in `Given` using ROLE-* and tenant | Prevents "authenticated is enough" (INV-T02) |
| `Then` states **observable** results (status, UI text key, event, DB state via API) not implementation | Survives refactors |
| Every happy-path AC has at least one negative AC (denied, invalid, duplicate, expired) | Abuse cases are requirements |
| State rule priority with `[MUST]` `[SHOULD]` `[COULD]` and risk class R1–R4 (QA-STRAT §8) | Drives test level |
| Quantities refer to a named constant (BR-T*, SLO-*, config key) not literals | Single source of truth |
| Use ubiquitous terms from DOM-00 and ID_REGISTRY (e.g. "evidence rung" not "verification level") | Consistent language |
| Never write an AC that requires the client to enforce a security rule | INV-T01 |
| Time-dependent ACs name the clock source ("server time") | Skew-safe |

## 3. Mandatory AC patterns (checklists each feature must consider)

| Pattern | AC must exist if the feature… |
|---|---|
| Authorization | exposes any endpoint: owner allowed, other user denied, other tenant denied, role without permission denied (INV-T01/T02/T03) |
| Idempotency/duplicate | has an unsafe mutation: replay with same key returns same result; different body → 422 (FF-07) |
| Concurrency | edits a shared resource: `If-Match` mismatch → 412; no lost update |
| Partial failure | spans more than one write or an external call: final state consistent, retry safe |
| Offline | is queued-write eligible (ADR-T10) or explicitly online-only with message |
| Failure containment | depends on a remote, third party or AI: degraded behaviour defined |
| Accessibility | adds UI: keyboard, labels, focus, error announcement, 24 px minimum target (44 px design standard) |
| Privacy | stores or shows personal data: consent scope, retention, export/erasure coverage |
| Audit | performs a consequential action: audit event with actor, resource, reason |
| Observability | adds a flow: trace span names, business metric, log redaction check |
| Explainability | produces a score/match/flag: rationale and uncertainty visible, human decision path (INV-T09, INV-T19, INV-T20) |
| Honesty | shows any trust indicator: states exactly what is proven; unverified is never labelled verified (INV-T04) |

## 4. Worked examples (real ids unless marked platform)

| ID | Given / When / Then (abridged) | Tests |
|---|---|---|
| AC-05-02-02 [R1][MUST] | Given any client, when it PATCHes `rung`, then 422/405 and the rung is unchanged (INV-T04) | TEST-EVD-003, TEST-SEC-026 |
| AC-10-02-05 [R1][MUST] | Given 10 parallel submits from 2 devices, when they race, then exactly one submitted application exists (BR-T001, INV-T21) | TEST-HIR-001 |
| AC-10-05-02 [R1][MUST] | Given a stale `If-Match` version, when a recruiter moves the stage, then 409 `stale_version` | TEST-HIR-003 |
| AC-07-04-01 [R1][MUST] | Given a code assessment and no runner, when submitted, then state `unverified`, zero evidence rows, no score shown (ADR-T13) | TEST-ASM-002 |
| AC-00-04-01 [R2][MUST] (platform) | Given an old service worker controls an open tab, when a new release is deployed, then the user is prompted to update and no mix of old shell and new remote mounts | TEST-PWA-001 |
| AC-00-02-01 [R2][MUST] (platform) | Given a remote cannot be loaded, when its route is opened, then a fallback panel with retry is shown and other navigation works | TEST-FED-001 |
| FEAT-17-02 (AC pending) | Free-tier user without budget flag must not cause paid inference (INV-T07) | TEST-ASM-005 - the AC itself still has to be written |

## 5. Definition of Ready (story)

| Item | Required |
|---|---|
| Linked FEAT/FR and goals | Yes |
| ACs in G/W/T with negative cases and mandatory patterns considered (§3) | Yes |
| Risk class assigned | Yes |
| Roles/permissions and policy action named (FF-01) | Yes |
| API/contract change listed (FF-06) and event changes (AsyncAPI) | Yes |
| Data changes: migration with expand/contract plan (FF-10) | If data change |
| Failure behaviour and flags/kill switch decided | R1/R2 |
| Design for all states (empty/loading/error/offline/denied) | If UI |
| Telemetry and audit events listed | Yes |
| Test levels per risk class identified | Yes |

## 6. Definition of Done

### 6.1 Story / task DoD

| # | Criterion | Evidence |
|---|---|---|
| 1 | All ACs satisfied; each AC has ≥ 1 automated test at the levels required for its risk class (QA-STRAT §8) | CI report linked to AC ids |
| 2 | Policy action registered; authz/IDOR/tenant tests added or updated (FF-01, FF-05) | Route registry + test list |
| 3 | `Idempotency-Key` support on unsafe mutations (FF-07) and ETag where concurrent edit is possible | Contract + tests |
| 4 | OpenAPI/AsyncAPI updated and diff gate passes (FF-06) | oasdiff result |
| 5 | Migrations follow expand/contract with rollback or forward-fix note (FF-10) | Migration lint |
| 6 | Module boundaries and remote isolation lints pass (FF-02, FF-03) | CI |
| 7 | Accessibility: automated scan clean, keyboard path verified, new interactive elements meet target size | A11y report |
| 8 | Performance budget unchanged or approved (route JS size, API class latency) | Lighthouse/benchmark |
| 9 | Observability: spans, metrics, structured logs with redaction; dashboard/alert updated if new failure mode (OPS-OBS) | Config diff |
| 10 | Audit events emitted for consequential actions | Audit tests |
| 11 | Failure handling documented in OPS-FMEA if a new dependency/failure mode is introduced; runbook updated | Doc diff |
| 12 | Feature flag with kill switch where R1/R2 and rollout is progressive | Flag registry |
| 13 | Privacy: consent/retention/export/erasure coverage assessed (DOM-22) | Checklist |
| 14 | No secrets in code/bundles; PII not logged (INV-T14) | Scans |
| 15 | Documentation and traceability updated (AC→TEST links, doc status labelled honestly) | Trace report |
| 16 | Code reviewed; owner of affected module approves; Security review for R1 | PR |

### 6.2 Feature DoD (adds)

| Criterion |
|---|
| Critical journey E2E exists or is updated (federated and bundled, QA-STRAT §5) |
| Product acceptance by the feature owner on staging with synthetic data |
| Support readiness: help content, support macros, escalation path (PROC-03), known-issues list |
| Analytics events from METRICS_CATALOG implemented and privacy-reviewed |
| Rollback path rehearsed in staging when the feature has data changes |

### 6.3 Release DoD

| Criterion |
|---|
| All release gates RG-01…RG-14 pass or have recorded, permitted waivers (QA-STRAT §9) |
| Canary guardrails satisfied; rollout plan and rollback order confirmed (OPS-REL §10) |
| Runbooks, dashboards and alerts match the release; on-call informed |
| Customer-visible changes communicated per COM-OPS/PROC procedures |
| Compat matrix (shell × remote × API) recorded |

### 6.4 Work-package DoD (referenced by ROADMAP)

Common DoD-WP = story DoD items 1–16 applied to the WP's scope, plus: the WP's acceptance criteria are traced to TEST ids; failure handling is documented; no new [OPEN] item is left implicit (new unknowns are logged in OPEN_DECISIONS).

## 7. Review checklist for AC quality

| Smell | Fix |
|---|---|
| "Should work correctly" or untestable adjectives | Replace with observable outcome |
| AC mixes several behaviours | Split |
| AC prescribes implementation | Restate as behaviour |
| No negative case | Add denied/invalid/duplicate/expired |
| Literal thresholds | Reference BR/SLO/config |
| Security enforced only in UI | Move to server AC |
| "Verified" used for a claim | Rename and use the evidence ladder (ADR-T14) |
| Ambiguous actor | Use ROLE-* and tenant scope |

## 8. Traceability record (minimum fields)

`AC id · feature · risk class · priority · linked FR · linked INV/FF/BR · tests · status (draft/ready/implemented/verified/withdrawn) · last verified (release id) · owner`. "Verified" means a passing run in the named release's CI, never a statement in documentation.

## 9. Platform (cross-cutting) acceptance criteria register - AC-00-*

These criteria apply to every feature and are verified by platform tests; they are owned by the Platform and QA architects and are not duplicated in feature specs.

| ID | Criterion | Pri | Tests |
|---|---|---|---|
| AC-00-01-01 | Every protected route returns 401 problem+json without valid credentials; an unregistered policy action is denied | MUST | TEST-SEC-002 |
| AC-00-01-02 | List/filter/sort parameters cannot reveal foreign records; invalid ids/cursors are rejected | MUST | TEST-SEC-008 |
| AC-00-01-03 | No secret or direct personal identifier appears unredacted in logs, traces or error reports | MUST | TEST-SEC-016 |
| AC-00-01-04 | All errors are RFC 9457 problem+json with stable `type` codes | MUST | TEST-API-004 |
| AC-00-01-05 | Cursor pagination has no duplicates/gaps within contract; tampered cursors rejected | MUST | TEST-API-005 |
| AC-00-01-06 | Every consequential action writes an audit event (actor, resource, reason, request id) in the same transaction | MUST | TEST-API-013 |
| AC-00-01-07 | Concurrent edits to one resource cannot lose updates (ETag / `If-Match`) | MUST | TEST-DAT-008 |
| AC-00-01-08 | Cookie-authenticated mutating requests without the CSRF defence are rejected | MUST | TEST-SEC-017 |
| AC-00-01-09 | User-supplied text is escaped/sanitised on output in shell and remotes | MUST | TEST-SEC-028 |
| AC-00-01-10 | A multi-step operation that fails mid-way leaves consistent state; retry is safe; compensations run for external effects | MUST | TEST-EVD-009, TEST-API-011 |
| AC-00-02-01 | A remote that is unreachable shows a fallback panel; shell and other remotes keep working | MUST | TEST-FED-001 |
| AC-00-02-02 | A slow remote falls back to last-known-good after a timeout with user notice | MUST | TEST-FED-002 |
| AC-00-02-03 | A remote incompatible with the shell Host Contract is rejected and last-known-good pinned | MUST | TEST-FED-003 |
| AC-00-02-04 | A remote incompatible with the deployed API range is not mounted | MUST | TEST-FED-004 |
| AC-00-02-05 | A remote render crash is contained by its error boundary | MUST | TEST-FED-008 |
| AC-00-02-06 | Loss of a shared/third-party client dependency degrades into the documented fallback | SHOULD | TEST-FED-013 |
| AC-00-03-01 | One W3C trace spans shell, remote, API and worker for a user action | SHOULD | TEST-FED-011 |
| AC-00-04-01 | Service-worker updates never mix incompatible shell and remote versions; drafts persist | MUST | TEST-PWA-001 |
| AC-00-04-02 | After logout and login as another user, no cached response of the previous user is served | MUST | TEST-PWA-002 |
| AC-00-04-03 | Offline data is labelled stale and never asserts consequential state | MUST | TEST-PWA-004 |
| AC-00-04-04 | Consequential actions are blocked offline with an explanation | MUST | TEST-PWA-007 |
| AC-00-04-05 | Logout clears caches and owner-data stores | MUST | TEST-PWA-003 |
| AC-00-05-01 | Analytics events contain no direct identifiers outside the allowlist and respect consent state | MUST | TEST-PRV-006 |
| AC-00-06-01 | API classes meet p95/p99 targets under baseline load (OPS-SLO section 5) | SHOULD | TEST-PER-001 |
| AC-00-07-01 | No automatically detectable WCAG 2.2 AA violations on any route or state | MUST | TEST-A11-001 |
| AC-00-07-02 | Critical journeys are fully keyboard-operable with visible focus | MUST | TEST-A11-002 |
| AC-00-07-03 | Screen readers announce names, roles, live regions and errors on critical journeys | MUST | TEST-A11-003 |
| AC-00-07-04 | Interactive targets meet the 24x24 CSS px minimum (44 px design standard) | MUST | TEST-A11-004 |
| AC-00-07-05 | Content reflows at 320 px and 200% zoom; reduced-motion and contrast preferences honoured | MUST | TEST-A11-006 |
| AC-00-07-06 | Remote swaps and fallback panels manage focus and announce route changes | MUST | TEST-A11-007 |
