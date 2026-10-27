# Architecture Decision Register (target design)

Doc ID: DEC-ADR · Owner: Architecture Review Board · Version 1.0 · Status: Under Review

> **Revision 2 folded in (2026-10-27)** from `GOVERNANCE_REGISTRATIONS_REV2.md`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.
All decisions are **[TARGET]**. "Challenge" records the strongest counter-argument raised by the review council. Existing-project decisions (ADR-001…016 in `ARCHITECTURE.md`) are **[REF]** and are not inherited automatically.

| ID | Decision | Rationale | Challenge / alternative rejected | Revisit trigger |
|---|---|---|---|---|
| ADR-T01 | Product = **verified career-evidence platform** (Learn→Prove→Showcase→Match→Apply→Hire→Grow). Non-goals: generic social network, ad network, payroll, crypto credentials. | Evidence is the differentiator; every capability must strengthen the loop. | Broad "career OS" rejected: dilutes focus, raises cost. | Two quarters of retention data contradict loop usage. |
| ADR-T02 | **PWA-first**; no store packaging at launch. Evaluate TWA/Capacitor wrapper only when a verified store-distribution or iOS push-reach need exists. | Single codebase; installability; iOS web push works only for Home-Screen installs (secondary sources, see research). | Native apps rejected: ~3× cost, no confirmed requirement. | >15% iOS users blocked by push/install friction. |
| ADR-T03 | **Proposed amendment ADR-T23:** use typed domain-module contracts with `MF_MODE=bundled` as the initial delivery baseline; keep Module Federation as an optional runtime for independently owned modules. Do not treat client-code visibility as a security boundary. | No evidence establishes three independent frontend teams or a need for separate release cadence. Bundled route chunks avoid remote-registry, signing, compatibility and partial-deployment machinery while preserving a migration path. | Federation may be justified by named independent teams and measured deployment benefit. A typed contract keeps the option open; server-side authorization remains authoritative in either mode. | ARB may activate federation only after OPEN-03 evidence and WP-FED-SPIKE passes compatibility, rollback, integrity and performance gates. |
| ADR-T04 | **Modular monolith backend** (Fastify/Node, TypeScript) with enforced module boundaries + separate worker process. Extract a service only on a documented trigger. | Team size, transactional consistency, ops cost. | Microservices rejected: no independent-scale evidence. | Module needs independent scaling/SLA, distinct residency, or team contention. |
| ADR-T05 | **PostgreSQL is the single system of record**; all reads/writes via SQL (no in-process Map read model); RLS as defence-in-depth; **transactional outbox** for events. | Removes single-writer limit and stale reads; enables horizontal API replicas. | Keep boot-time hydration rejected. | n/a |
| ADR-T06 | **Sessions:** httpOnly, Secure, SameSite=Lax cookie via same-origin `/api/v1/auth/*` routes (single cookie contract: `__Host-ts_at` Path=/, `__Secure-ts_rt` Path=/api/v1/auth/refresh, `X-CSRF-Token`; canonical in SEC-02 §2.3); 15-min access + rotating refresh with reuse detection; passkeys (WebAuthn) + password; optional OIDC/SAML SSO for organizations; **remotes never read tokens**. | Removes XSS-readable localStorage token; remotes need no credential access. | Keep localStorage bearer rejected. | n/a |
| ADR-T07 | **Authorization = central policy module** (`packages/policy`): org-role RBAC + resource-level ABAC, deny by default, server-side; UI hints derived from `GET /me/capabilities`. | Reference design had inline/inconsistent org-role checks. | Per-handler ad-hoc checks rejected. | n/a |
| ADR-T08 | **API:** REST `/api/v1`, OpenAPI 3.1 generated from Zod contracts, RFC 9457 problem+json errors, cursor pagination, `Idempotency-Key` on unsafe mutations, ETag/`If-Match` for concurrent edits. | Testable contracts; safe retries. | GraphQL rejected: authz/caching complexity, no multi-client need. | Third-party API demand. |
| ADR-T09 | **Events:** outbox → worker dispatcher; at-least-once; consumer dedupe by `event_id`; AsyncAPI documents events; **fenced leases** (claim generation) for jobs. | Fixes duplicate-execution risk of unfenced leases. | Broker (Kafka/NATS) deferred. | Outbox throughput exceeds Postgres budget or services extracted. |
| ADR-T10 | **Offline tiers:** read-cache of owner data; queued writes only for application drafts, profile edits, message compose, notes; everything consequential is online-only. Server revalidates every queued write. | Honest scope; iOS lacks reliable background sync. | Full offline-first rejected: conflict surface, no requirement. | Research shows low-connectivity core use. |
| ADR-T11 | **Search:** Postgres FTS + `pg_trgm` + `pgvector` behind a `SearchPort`. | Cost, ops simplicity. | OpenSearch now rejected. | p95 search >400 ms at target corpus or proven relevance gap. |
| ADR-T12 | **AI gateway** is the only path to models; human-gated (no autonomous consequential action); per-user/org budgets; blocked server-side in `AI_PROHIBITED` assessment sessions; AI memory never counts as evidence. | Safety, cost, assessment integrity. | Direct provider calls rejected. | n/a |
| ADR-T13 | **Assessment honesty:** code-execution assessments run only in an isolated, network-less sandbox runner. Until it exists, submissions are `unverified` and never mint verified evidence. | Reference design could return a simulated pass. | Simulated scoring rejected. | Runner shipped. |
| ADR-T14 | **Evidence ladder:** `claimed → artifact-backed → peer-attested → authority-verified`; each rung carries provenance; verified status only via server-side verification transition. | *Verified over claimed.* | Single boolean flag rejected. | n/a |
| ADR-T15 | **Billing:** Stripe-only; entitlements derived server-side from subscription state; redirect success grants nothing; signed webhook authoritative. | Single processor, reduced PCI scope. | Multi-processor rejected for launch. | New-market payment need. |
| ADR-T16 | **Observability:** OpenTelemetry with W3C trace-context propagated shell → remote → API → worker; Pino with redaction. | End-to-end correlation across federation boundary. | Vendor-specific agents rejected. | n/a |
| ADR-T17 | **[PROPOSED QUALIFICATION — ADR-T23 pending]** Keep the pnpm monorepo, affected-only CI and semver'd contract packages; per-remote build/deploy pipelines apply only after federation activation, while bundled modules ship with the shell. | Atomic contract change; independent deploy artifacts only where independently deployed. | Multi-repo rejected: contract drift. | >5 teams; federated mode requires ADR-T23 gates. |
| ADR-T18 | **Compatibility:** shell exposes a versioned *Host Contract* (semver). In federated mode, each remote manifest declares `hostContract` range, `apiRange`, `dataSchema`; shell rejects incompatible remotes and falls back to pinned last-known-good. | Independent deploys must not rely on assumptions. | Lockstep releases rejected. | n/a |
| ADR-T19 | **Federation ≠ security isolation.** Remotes share a JS realm; when federated, signed manifests + SRI supplement CSP; no secrets client-side; server enforces all authz. Iframe/sandbox only for untrusted third-party content. | Honest threat model. | Treating remotes as trust boundaries rejected. | Third-party remotes. |
| ADR-T20 | **Email via provider port** (Brevo default); push via Web Push (VAPID) for installed PWAs; SMS deferred. | Vendor independence. | n/a | n/a |
| ADR-T21 | **Multi-tenancy:** row-level `org_id` scoping with RLS; organizations and institutions are tenants; cross-tenant read = Sev-1. | Isolation at acceptable cost. | Schema-per-tenant rejected. | Regulated customer needing dedicated DB. |
| ADR-T22 | **Matching is explainable, uncertainty-aware, never pay-to-rank**; candidates see why they matched; no autonomous reject. | Candidate dignity; fairness. | Opaque ranking rejected. | n/a |
| ADR-T23 | **[PROPOSED — pending ARB ratification] Bundled delivery is the initial baseline; federation requires an explicit activation decision.** Keep the shared module contract. Require at least three named independent frontend teams, an independently deployable ownership need, and a passing WP-FED-SPIKE before activation. Asset confidentiality is not a security property; server authorization protects data and actions. | Current project evidence does not establish the staffing or deployment need that justifies federation's registry, signing, compatibility, rollback and operations cost. Bundled dynamic route chunks are the simpler initial architecture. | Defer or reject federation if the measurable release/ownership benefit does not exceed its added operational burden. No module is a security boundary. | OPEN-03 closure by ARB, named teams, measured benefit, and spike results; revisit before any federated production release. |

Supersession policy: a superseding ADR names the replaced ID and updates affected docs in the same change.

# Revision 2 additions (folded 2026-10-27 from `GOVERNANCE_REGISTRATIONS_REV2.md`)

## 1. ADR amendments / new ADRs
| ID | Proposal | Source |
|---|---|---|
| ADR-T03a | Default `MF_MODE=bundled`; federated runtime is an activation option once OPEN-03 (≥3 named teams) and the spike close; 8 remotes after MOD-ADM/MOD-INS split | REVIEW_RESOLUTION_DECISIONS; FEDERATION_REVIEW_FIXES |
| ADR-T05a / T06a / T09a | Write-budget and batch anchoring; cookie contract (`__Host-ts_at`, `__Secure-ts_rt`, `X-CSRF-Token`); in-process consumers and fenced job engine details | BACKEND/SECURITY REV2 |
| ADR-T10a | Ph1 offline = read cache + local unsent drafts; assessment answers online-only; lesson progress queued; outbox on trigger | OFFLINE_AND_SYNC_DESIGN_REV2 |
| ADR-T14a | `authority_verified` carries mandatory `issuer_class`; instructor ≠ learner | BR/DT/INV REV2 |
| ADR-T23 | Bundled lazy modules as baseline; federation conditional (referenced by research log R1) | FEDERATION_REVIEW_FIXES |
| ADR-T24 | Edge prerender of public job/profile pages + sitemap | FRONTEND_ARCHITECTURE_REV2 |
| ADR-T25 (number proposed) | Third-party course marketplace money flow (Ph3) | MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL |
| FD-14 | How the edge learns `admin.console` | FEDERATION_REVIEW_FIXES |

## 2. Fitness-function wording (CANONICAL_INVARIANTS not edited)
FF-07: "accepts `Idempotency-Key` or declares a natural key". FF-02: complete module graph generated from imports. FF-11 (enum-vs-SM lint) and FF-12 (consent-catalogue generation) are already defined in `CANONICAL_INVARIANTS.md`.

## 3. OPEN-item consolidation rule
A single global register is **not built yet**. Proposed rule: keep global `OPEN-nn`; map `OPEN-FE-*`, `OPEN-UX-*`, `OPEN-B*`, `OPEN-CS-*` to a new global id with owner, phase, blocking flag; close answered items. Dispositions reported by agents: OPEN-B20 closed (re-apply as linked application); OPEN-FE-08 and OPEN-FE-10 closed by the CONST-S table; OPEN-FE-17/18 and OPEN-UX-14 to renumber; OPEN-06 re-tag Ph3. New: OPEN-42 (phase reconciliation), OPEN-B57/58/59, operational-telemetry classification, RUM coverage threshold, edge limiter, minimum-age value (counsel), retention basis (OPEN-08).

## 4. Route prefixes / ID registry additions (ID_REGISTRY not edited)
Add MOD-INS (`/institution/*`); shell prefixes `/r/*`, `/invite/*`, `/p/*`, `/login/callback`, `/offline`, `/help`; screen aliases SCR-INS-01..06 for SCR-ADM-17..22.

## 5. New files to link from the master index
See [MASTER_INDEX_V9_ADDENDUM_2](../00_CONTROL_CENTRE/MASTER_INDEX_V9_ADDENDUM_2.md).

# Decision analysis (PATCH 2026-10-27, PROPOSED; closes audit gap on option analysis)
Expands ADR-T04, T05, T02/T03, T19 and rendering ADR-T24 with drivers, options, cost, operations demand and residual risk. Cost is relative (L/M/H), not a quote. Nothing here is measured; assumptions need ARB ratification and, where noted, external verification. Microservices are analysed and not adopted for now, on stated re-evaluation conditions.

## D-01 Modular monolith vs services (ADR-T04)
| Item | Analysis |
|---|---|
| Drivers | Small team; strong transactional needs (evidence, applications, billing); outbox correctness; low ops budget; trust-critical consistency. |
| Options | A. Modular monolith + worker (chosen). B. Monolith plus a few extracted services (sandbox, AI gateway, search). C. Full microservices. |
| Tradeoffs | A: simplest transactions and testing, one failure domain. B: isolates risky or differently scaled parts, adds network contracts and tracing. C: independent scale and teams, distributed transactions, high cost. |
| Cost | A low, B medium, C high. |
| Ops demand | A one deployable plus worker; B 2-4 services with own SLOs; C needs a platform team. |
| Residual risk (A) | Shared fate (FMEA SF-02, SF-03); boundary erosion; one module's load affects all. Controlled by FF-02 import graph and pool slices. |
| Re-evaluation trigger | A module needs independent scaling/SLA, distinct residency or isolation (sandbox, AI), release contention between teams, or p95 targets unmet after tuning. First candidate step is B. |

## D-02 Rendering strategy (ADR-T24, frontend)
| Item | Analysis |
|---|---|
| Drivers | Authenticated app behind login; public job/profile pages need SEO and fast first paint; PWA offline shell; small team. |
| Options | A. SPA only. B. SPA plus edge prerender for public pages (proposed). C. Full SSR framework. |
| Tradeoffs | A: simplest, weak SEO. B: SEO for public pages, app stays SPA, adds prerender pipeline and invalidation. C: best first paint, needs server runtime, harder offline/PWA fit, framework migration. |
| Cost | A low, B medium, C high. |
| Ops demand | B needs prerender job, sitemap and invalidation on publish/withdraw. |
| Residual risk | Stale prerendered pages exposing withdrawn data; SEO benefit unverified. |
| Re-evaluation trigger | Measured organic-acquisition or LCP shortfall on public pages; need for personalised SSR. |

## D-03 Database choice (ADR-T05, T11)
| Item | Analysis |
|---|---|
| Drivers | Relational integrity, RLS, transactional outbox, FTS and vector in one place, low ops. |
| Options | A. PostgreSQL only (chosen; FTS + pg_trgm + pgvector). B. Postgres plus dedicated search (OpenSearch). C. Polyglot or document store. |
| Tradeoffs | A: one backup, one consistency model, limits at search scale and write throughput. B: better relevance and scale, dual-write and index lag. C: flexibility but loses constraints and joins central to evidence and tenancy. |
| Cost | A low, B medium-high, C high. |
| Ops demand | A: HA, backups with restore drills, partitioning, pooler. B adds cluster ops. |
| Residual risk | Single system of record (SF-02); search relevance ceiling; managed-provider limits unverified. |
| Re-evaluation trigger | p95 search > 400 ms at target corpus; sustained primary write saturation after tuning; residency need for a dedicated DB (ADR-T21). |

## D-04 PWA wrapper vs native (ADR-T02)
| Item | Analysis |
|---|---|
| Drivers | One codebase, installability, push reach, store-distribution need (unconfirmed), iOS PWA limits. |
| Options | A. PWA only (chosen). B. PWA plus TWA (Android) or Capacitor wrapper. C. Native apps. |
| Tradeoffs | A: cheapest; iOS push needs Home-Screen install; limited storage guarantees. B: store presence and native push, review overhead, bridge code. C: best device access, separate codebases. |
| Cost | A low, B medium, C high. |
| Ops demand | B adds store accounts, signing, release cadence; C needs a mobile team. |
| Residual risk | iOS web push and storage eviction behaviour are secondary-source claims, not device-verified (needs real-device testing). |
| Re-evaluation trigger | >15% iOS users blocked on push/install, confirmed store-distribution requirement, or a needed capability the web lacks. First step is B. |

## D-05 Iframe / worker isolation vs same-runtime remote (ADR-T19, T23)
| Item | Analysis |
|---|---|
| Drivers | Trust level of code; independent team ownership; performance; shared auth and UI context. |
| Options | A. Bundled modules (baseline, no runtime isolation). B. Federated remotes in the same JS realm. C. Sandboxed cross-origin iframe per remote. D. Web Worker for non-UI logic. |
| Tradeoffs | A/B: fast, shared state, no security boundary. C: strong isolation, postMessage contracts, layout/a11y/auth friction, extra load. D: isolates compute only, no DOM. |
| Cost | A low, B medium, C high, D medium. |
| Ops demand | B needs registry, signing, release train (FED-RT-01..10 in `09_MODULE_FEDERATION/VERSION_COMPATIBILITY_DESIGN.md`); C needs per-origin hosting and messaging contracts. |
| Residual risk | B shares fate and trust with the shell (FED-RT-10, SF-01). |
| Re-evaluation trigger | Any third-party or untrusted code, a compromised-remote incident, or a compliance demand for isolation moves that code to C; federation activation follows ADR-T23 criteria. |
