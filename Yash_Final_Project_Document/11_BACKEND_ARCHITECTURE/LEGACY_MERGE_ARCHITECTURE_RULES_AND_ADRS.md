# Legacy Merge B-11a: Architecture Rules, Import Rules, Legacy ADR Set, TRD Baseline and Code Style

Doc ID: LGM-B-11A · Owner: Backend Architecture Team · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: BE-01, ADR-T04, ADR-T05, OPEN-52, CC-ID · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

## 0. Frame and how to read this file

- **Nothing is implemented in this project.** The project is just starting. Every statement below tagged **prior attempt reported** is a claim made by a legacy document about an *earlier attempt* (snapshot `431c425a`, 2026-10-23). It is reference material, not a fact about this project, and has not been re-verified.
- Every statement tagged **target requires** is a requirement or proposal for this project. It never claims existence.
- Merged from legacy: `31_LEGACY_ARCHIVE/docs/engineering/TARGET_ARCHITECTURE.md`, `.../TRD.md`, `.../CODE_STYLE.md`, `.../adr/ADR-015-core-loop-persistence.md`. Companion files: `LEGACY_MERGE_IMPLEMENTED_TOPOLOGY_LESSONS.md` (root `ARCHITECTURE.md`), `../25_DIAGRAM_LIBRARY/LEGACY_MERGE_DIAGRAMS.md` (the Mermaid diagrams of these sources).
- Source files contain `?` where a non-ASCII character (arrow or dash) was lost in an earlier export; this file restores the obvious meaning in hand-written text and keeps `?` in verbatim blocks.

## 1. Legacy "target architecture v6.0" decision, restated for this project

**Prior attempt's intended decision:** build a *modular monolith first*; it must remain domain-oriented, contract-first, auditable, replaceable at provider boundaries, and capable of later extraction. (Legacy `TARGET_ARCHITECTURE.md` §1.)

**Target requires:** same stance (ADR-T04, modular monolith plus separate worker). No microservices by default. Extraction requires all five of: measurable load/latency evidence, domain ownership, failure-isolation need, operational readiness, and a migration plan (legacy §10). Scale evolution path (legacy TRD §4): `modular monolith -> worker scaling -> cache -> search extraction -> replicas -> selective service extraction`.

### 1.1 Legacy runtime architecture (text form of the diagram)

Browser / installed PWA -> React feature UI -> TanStack Query / client state -> Fastify HTTP API -> application use cases -> {authorization/privacy/AI policy, domain modules}; domain modules -> PostgreSQL (with RLS and grants) and storage; use cases -> Supabase Queues -> worker; use cases -> selective realtime; use cases -> integration adapters -> payment, email, media, AI providers. The Mermaid source is in `../25_DIAGRAM_LIBRARY/LEGACY_MERGE_DIAGRAMS.md` section 1.

**Conflict L-B11-01 (legacy intent vs this blueprint):** the legacy diagram names TanStack Query, Supabase Queues, Supabase Auth and selective realtime as intended parts. This blueprint chose a transactional outbox plus worker (ADR-T09), cookie sessions through the API (ADR-T06) and SQL-only reads/writes (ADR-T05). Decisions: outbox and sessions already decided (ADR-T09, ADR-T06); the client server-state library is decided as TanStack Query v5 (FD-F2 in FEA-01, which weighed it against SWR, RTK Query, Apollo and the prior attempt's plain fetch + context), so the legacy TRD row is consistent with the blueprint; the prior attempt's as-built plain-`fetch` helper is a lesson only (see `../10_FRONTEND_ARCHITECTURE/LEGACY_MERGE_FRONTEND_AND_UI_QUALITY.md` section 4). Realtime scope remains OPEN-49.

### 1.2 Legacy repository layout (intended)

```text
/
|-- apps/
|   |-- web/    src/{app,features,pages,shared,pwa,config}
|   |-- api/    src/{modules,routes,middleware,policies,adapters}, server.ts
|   `-- worker/ src/{jobs,consumers}, worker.ts
|-- packages/   ui, contracts, domain, observability, config, testing
|-- supabase/   migrations, functions, tests, seed
|-- scripts/ tests/ docs/ .github/ package.json SSOT.md
```

**Target requires:** a pnpm monorepo of this shape is the starting point (ADR-T17 qualifies per-remote pipelines until federation is activated). Prior attempt's tree is a layout idea only; no code exists.

### 1.3 Legacy core domains (29)

`identity, profile, ontology, evidence, verification, learning, assessment, credential, opportunity, application, hiring, interview, matching, recommendation, career, networking, messaging, organization, institution, reputation, notification, billing, analytics, moderation, trust, ai, integration, admin, audit`.

**Target requires:** reconcile with the 24 target domains DOM-01..DOM-24 (`../00_CONTROL_CENTRE/ID_REGISTRY.md`) without silently renaming; OPEN-47 already tracks the domain-boundary reconciliation. Mapping hint: opportunity -> DOM-09, application+hiring+interview -> DOM-10, ontology -> DOM-04, credential+verification -> DOM-05/06, trust+moderation -> DOM-19, admin+audit -> DOM-20, integration -> platform ports (ADR-T20).

## 2. Import and dependency rules (legacy, preserved)

```text
UI -> application API
Application -> domain
Infrastructure -> ports
Domain -> no framework/provider dependency
Feature -> own local components first
Cross-domain -> application interface/event
```

- Circular dependencies are prohibited.
- Legacy bounded-context rules (ARCH-013..ARCH-020), quoted in full in section 4.2.

### 2.1 Intra-package barrel-cycle rule (full text; unique to legacy)

`packages/domain/src/index.ts` is a **barrel only**: it re-exports sibling modules and declares nothing. A module inside a package must never import that package's own barrel (`from './index.js'`), because the barrel re-exports the importing module and the edge becomes a cycle (`auth.ts -> index.ts -> auth.ts`).

Rule: intra-package imports target the module that **declares** the symbol.

- `core.ts` is the leaf foundation and must never import anything. It holds shared primitives with no owning feature module: `Role`, `User`, `UserStatus`, `Profile`, `ProfilePrivacy`, `Evidence`, `EvidenceType`, `VerificationLevel`, `EvidenceStatus`, `ApplicationState`, `ALLOWED_APPLICATION_TRANSITIONS`, `canTransitionApplication`, `AssessmentPolicyMode`, `AssessmentSession`, `isAIAssistanceAllowed`, `DomainErrorCode`, `DomainError`.
- Feature modules import from `core.ts` for the above, and from the specific sibling that owns anything else (example: `gamification.ts -> assessment.js` for `XpTransaction`; `instructor-reputation.ts -> reputation-engine.js` for `ReputationBand`).
- Consumers outside the package (`apps/*`, `tests/*`) import the public surface via `@talentsphere/domain`. The public API is unchanged by this layering.
- **Enforcement (prior attempt):** `tsc` does not detect cycles; the rule was checked by review plus a dependency-graph scan. Any new `from './index.js'` inside `packages/domain/src/` is a regression.

**Target requires (proposed, not yet an ADR):** the same leaf-foundation + declaring-module rule for every shared package, **plus** an automated cycle check in CI (for example an import-boundary lint or dependency-graph tool) because review-only enforcement is weak. Record as a gate under `../17_DEVOPS_AND_INFRASTRUCTURE` RG-01 when a tool is selected.

## 3. Persistence, API boundary, async and realtime rules (legacy §6-§9)

- Postgres is authoritative for relational state. Storage is authoritative for binary objects. **Queue state is operational state, not business truth.**
- Browser calls application APIs. Direct table access is not the primary application contract.
- Use a queue for: file processing, media processing, notification fan-out, recommendation refresh, analytics aggregation, plagiarism/similarity, credential propagation, scheduled maintenance.
- Use realtime for: messaging, presence, non-critical live progress, selected dashboards.
- Never use realtime as the *only* path for: payment state, authorization, assessment scoring, credential issuance, audit persistence.

**Target requires:** these four constraints are retained verbatim as design rules (they align with ADR-T05/T09/T12/T15). The queue-use list is a candidate input to `../13_API_EVENTS_AND_INTEGRATIONS/EVENT_CATALOG.md`; the realtime exclusions are inputs to OPEN-49.

## 4. Legacy "source-derived architecture corpus" (TARGET_ARCHITECTURE section 11)

### 4.1 Logical architecture layers

| Layer | Contents | Technology (legacy) |
|---|---|---|
| Presentation | Web app, extension, PWA, admin | React + TypeScript + Vite PWA, React 18+, Tailwind, Radix |
| Application | HTTP application APIs, route handlers, use cases | TypeScript strict |
| Domain | Aggregates, entities, VOs, domain events, business rules | Pure TS |
| Infrastructure | Repositories, adapters, integrations | Supabase, Stripe, providers |
| Data | PostgreSQL with RLS, storage buckets, realtime channels | Supabase |
| External | AI providers, payment, media, email, IDV | Integration layer |

### 4.2 Bounded contexts (7 + shared kernel) and domain boundary rules

| Context | Contents | Aggregates |
|---|---|---|
| identity | Auth, profiles, orgs, tenancy, managed learners, instructor approval | User, Profile, Organization, Membership |
| marketplace | Jobs, requisitions, applications, offers, interviews, employer insights | Job, Application, Offer, CompanyReview |
| learning | Courses, lessons/content items, media, enrolments, progress, quizzes, assignments, paths, certificates, XP/gamification, contests, certifications | Course, Enrolment, Assessment, XPLedger, Contest |
| community | Connections, follows, posts/articles/newsletters, comments/reactions/reposts, groups, events, messaging, notifications | Thread, Post, Community |
| billing | Subscriptions, entitlements, course commerce, coupons, orders, refunds, licence pools, procurement, payouts | Subscription, Order, LicencePool, Payout |
| governance | Admin, moderation, trust, audit, flags, verification | Report, ModerationAction, FeatureFlag |
| analytics | Event tracking, KPIs, dashboards, experimentation | AnalyticsEvent, KPISnapshot |
| Shared kernel | Event backbone, UOM, TIG, automation, agents, healing, liquidity, DQ, health, media engine, integrations, AI service, UI kit, types, utilities | DomainEvent, MediaSource, ProviderAdapter |

Domain boundary rules (legacy IDs preserved):

- ARCH-013 Domain layer is pure TypeScript.
- ARCH-014 Application layer orchestrates; HTTP application APIs are thin adapters.
- ARCH-015 Infrastructure implements domain ports.
- ARCH-016 Cross-feature imports via `index.ts` barrels only.
- ARCH-017 Atomic promotion rule.
- ARCH-018 Cross-context via events or application-service interfaces.
- ARCH-019 Zero circular dependencies.
- ARCH-020 Routes are thin composition.

**Legacy-internal conflict L-B11-02:** ARCH-016 ("cross-feature imports via `index.ts` barrels only") and the intra-package rule in section 2.1 ("never import your own package barrel") are compatible only if read as *cross-feature* vs *intra-package*. A future implementer must keep both readings explicit. **Decision needed:** adopt ARCH-013..ARCH-020 as target IDs or map them to `INV-T01..T20`; owner Backend Architecture Team; track with OPEN-47.

**Note on "atomic promotion rule" (ARCH-017):** the legacy text states only the name. Its meaning is not defined in the inspected sources. Treat as **unknown**; do not invent semantics.

### 4.3 Legacy ADR set ("locked at 13") - SSOT-aligned numbering

| ID | Decision (legacy) |
|---|---|
| ADR-001 | Supabase Auth sole session authority |
| ADR-002 | Modular monolith (React/Vite + Supabase + managed hosting provider) |
| ADR-003 | 50 canonical tables + RLS deny-by-default |
| ADR-004 | Supabase Realtime messaging authority |
| ADR-005 | Stripe webhook idempotency + demo stubs |
| ADR-006 | Chrome extension local-first |
| ADR-007 | Provider-agnostic media |
| ADR-008 | Institutional tenancy |
| ADR-009 | Dual-queue boundary |
| ADR-010 | RLS policy template generator |
| ADR-011 | Media model is authority for lesson content |
| ADR-012 | DDD + Feature-Based + Atomic Design combination |
| ADR-013 | Cross-domain via events or application-service interfaces only |

**Numbering conflict L-B11-03 (kept visible):** three ADR numbering namespaces exist across the legacy corpus: (a) the list above (SSOT-aligned; ADR-001..013); (b) root `ARCHITECTURE.md` section 26 (implemented architecture; ADR-001..011, 015, 016) - see `LEGACY_MERGE_IMPLEMENTED_TOPOLOGY_LESSONS.md` section 9; (c) this blueprint's `ADR-T01..T23`. Collisions: legacy (a) ADR-001 = "Supabase Auth sole session authority" while (b) ADR-001 = "Fastify modular monolith" and (c) ADR-T06 = cookie sessions through the API. Legacy ADR-014 is unassigned. **Decision needed:** ARB secretary to retire (a) and (b) as historical, keep only ADR-T## going forward. Until then every citation of a legacy ADR must carry its namespace (for example "legacy-SSOT ADR-001").

### 4.4 Legacy "V6 corrections" to the historical architecture (verbatim intent)

- Browser/PWA domain mutations use the Fastify application API.
- Supabase RLS remains the database authorization boundary, not the complete business authorization model.
- `shared/platform` remains intentionally small; no business domain moves into a generic shared kernel merely to avoid imports.
- The previous "Web OS" concept is represented as a Career Workspace feature boundary.
- AI is accessed through the central AI Gateway/Orchestrator.
- Search/realtime/cache infrastructure remains measurement-gated.

Legacy overlap warning (2026-10-21, preserved): 118 of 144 unique lines of that corpus also appear in legacy SSOT Part VI; the remaining were older diagram labels ("Edge Middleware", "AI Router", "Web OS Layer") later replaced; its ADR list was not in SSOT and needed an owner decision (legacy `GAP_ANALYSIS.md` C-13).

## 5. Legacy TRD v6.0 (technical requirements) - preserved and reconciled

### 5.1 Technical baseline table (legacy "standard") vs this blueprint

| Area | Legacy TRD standard | Prior attempt reported (as built) | This blueprint |
|---|---|---|---|
| Frontend | React + TypeScript + Vite | same | same (FEA-01) |
| PWA | Service Worker + offline capability layer | no service worker registered | PWA-01 / ADR-T10 |
| Routing | React Router | react-router-dom | open (FEA-01) |
| Server state | TanStack Query | plain React state + `fetch` helper | FD-F2: TanStack Query v5 |
| Backend | Node.js + Fastify + TypeScript | same | ADR-T04 |
| Validation | Zod | same | ADR-T08 |
| API | REST/JSON + OpenAPI 3.1 | no generated OpenAPI | ADR-T08 (generate from Zod) |
| Database | PostgreSQL | same | ADR-T05 |
| Platform | Supabase | Supabase assets only for SQL history | OPEN-14 |
| Auth | Supabase Auth behind an application identity boundary | self-issued HMAC tokens | ADR-T06 (cookie sessions) |
| Storage | Supabase Storage | none | object storage port |
| Queue | Supabase Queues | Postgres `background_jobs` | ADR-T09 outbox + worker |
| Workers | Dedicated worker process | yes | ADR-T04 |
| Search | PostgreSQL FTS + trigram initially | in-process matching | ADR-T11 |
| Realtime | Selective | none | OPEN-49 |
| Telemetry | OpenTelemetry-compatible | Pino logs only | ADR-T16 |
| Product analytics | Event pipeline with privacy controls | in-memory | 20_ANALYTICS |
| AI | Central AI Gateway / Orchestrator | local heuristic | ADR-T12 |
| Tests | Vitest / React Testing Library / Playwright-compatible | Vitest + Playwright | 16_ |

Legacy TRD open question: "Open question: GAP_ANALYSIS conflict C-5" (target stack vs built stack). **Decision needed:** none for the stack table - every row is closed by ADR-T04..T16 or FD-F2; only hosting (`Platform` row) stays open as OPEN-14.

### 5.2 Architecture requirements (legacy TRD §3), preserved

- **Frontend:** feature-oriented modules; shared UI only after demonstrated reuse; no domain mutation directly from presentation components; server state separated from UI state; URL state for shareable filters/search.
- **Backend:** thin routes; use-case/application services; domain invariants in the domain layer; repository ports at the domain/application boundary; infrastructure adapters implement ports; no duplicated business logic across controllers.
- **Database:** SQL migrations authoritative; FK, unique/check constraints and transaction boundaries explicit; RLS mandatory where Supabase/Data API exposure exists; sensitive tables deny-by-default; important lifecycle history auditable.
- **API:** consistent error contract; idempotency on retriable side effects; cursor pagination; allow-listed filters/sorts; rate limiting; request/trace IDs.

### 5.3 Non-functional requirements (legacy TRD §4)

- Security: no critical unresolved security findings at release; server-side authorization for every protected mutation; tenant isolation tests required.
- Accessibility: WCAG 2.2 AA target.
- Reliability: service-specific SLOs; explicit retry/timeout policies; provider outage fallback.
- Performance: measure real p75/p95/p99; define route-specific budgets only after baseline measurement; avoid false precision before measurement.
- Scalability: evolution path in section 1.

### 5.4 Data rules, AI, assessment, offline and release requirements (legacy TRD §5-§9)

- Data: UTC timestamps; integer minor units for money + ISO 4217; opaque external identifiers; optimistic concurrency for high-value editable records; append-only audit/event semantics where required.
- AI technical pipeline: `Feature -> Identity -> Entitlement -> Data classification -> Policy -> Assessment context -> Provider selection -> Execution -> Output validation -> Provenance`. No paid free-user cloud inference outside policy.
- Assessment: an active assessment session must carry policy context; the AI gateway checks that context on every AI invocation.
- Offline: each feature declares `READ_OFFLINE`, `WRITE_OFFLINE`, `QUEUE`, `SYNC`, `CONFLICT`, `SERVER_REQUIRED`. No secure assessment or other server-authoritative decision relies on offline authority.
- Release: CI must run lint/format, typecheck, unit/component, build, migration checks, authorization/RLS tests, API contract tests, security scans, critical E2E, accessibility smoke, performance checks for release-critical paths.

**Target requires:** the six-flag offline declaration per feature is a template input for `../08_PWA_AND_MOBILE/OFFLINE_AND_SYNC_DESIGN.md#record-offline-and-sync-design-rev2`; check that document already uses these or equivalent tiers (ADR-T10) and add the flag names to the feature template if not.

## 6. Legacy CODE_STYLE v6.0 (full text, preserved)

1. **TypeScript:** strict mode; explicit public types; avoid `any`; prefer discriminated unions for domain states; no implicit `undefined` assumptions; validate external input.
2. **Naming:** `camelCase` variables/functions; `PascalCase` components/classes/types; `UPPER_SNAKE_CASE` true constants only; IDs use stable prefixes (`F-`, `J-`, `BR-`, etc.); filenames `kebab-case` or the repository-standard convention, consistently.
3. **Structure:** routes are thin; use cases contain application orchestration; domain contains business rules; repositories hide persistence; adapters hide providers.
4. **React:** functional components; hooks for behavior; no business rules buried in JSX; accessible semantics; explicit loading/error/empty states.
5. **Errors:** typed/canonical error codes; do not throw strings; preserve request IDs through error paths.
6. **Async:** timeout external calls; bounded retries; idempotency for retriable side effects; abort/cancel when relevant.
7. **Database:** migrations are reviewed; constraints preferred over application-only assumptions; no ad hoc production schema edits; RLS policy tests accompany policy migrations.
8. **Security - never:** commit secrets; log tokens/passwords; trust client role flags; expose raw DB errors; pass unrestricted user content to external providers.
9. **Abstraction rule:** do not create an abstraction before a real reuse or boundary need exists. Shared abstractions require ownership and tests.
10. **PR rule:** a PR changing behavior must update affected tests, analytics, docs, migration, feature status, and the ADR/decision record where material.

Project-level additions recorded in the repository instructions of the prior attempt (relevant to the PR rule): use design tokens rather than hard-coded colours/spacing; business rules live only in the domain package and routes never restate them; no weakening of auth, RLS, rate limits or honesty/migration tests; do not call a feature "implemented" from documentation alone.

**Target requires:** this style guide is adopted as the starting `29_DEVELOPER_IMPLEMENTATION_GUIDE` code-style baseline (owner: Documentation Architect to link). Prior-attempt enforcement facts worth keeping: `noUnusedLocals` and `noUnusedParameters` enabled in every tsconfig so dead code fails the typecheck; intentionally-unused parameters take a leading underscore (see `../16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md`).

## 7. ADR-015 - "Persist the core career loop; keep the API's Maps as a read model" (verbatim prior-attempt record)

**Why this is kept in full:** ADR-015 is a *reference ADR*. It documents a hybrid (SQL write path + in-memory read model) that this blueprint **rejects** in ADR-T05 (SQL-only reads and writes). The conflict is tracked as OPEN-52 and TRC-18 and must stay visible. Status in the prior attempt: accepted for that branch, pending owner ratification; nothing about it is a decision for this project.

- **Status:** Accepted for this branch, **pending owner ratification** (it changes the schema — see "Escalation").
- **Date:** 2026-10-10
- **Supersedes:** ADR-003 in `ARCHITECTURE.md` §26 ("in-memory Maps as runtime persistence") for the entities listed below.
- **Numbering:** `SSOT.md` uses ADR-001…013 for intended architecture and `ARCHITECTURE.md` §26 uses ADR-001…011 for the implemented one. ADR-014 is unassigned.

## Context

Until this change every user, organization, job, application, evidence item and work-history record lived in in-process `Map`s inside `buildApp()` and was lost on restart (production audit P0-04). The product's promise — a career record that employers can trust — cannot be kept by a store that forgets. A Postgres schema existed (migrations 00001–00042) and `pg` was already a dependency (durable background jobs, `dbcc2456`), but nothing wrote entity rows.

`apps/api/src/server.ts` has ~270 routes and ~150 Maps. Rewriting every read path to SQL in one step would touch nearly every route and could not be verified in one increment.

## Decision

1. **Write path.** Core-loop entities change only through `persist(...ops: CoreOp[])` (`apps/api/src/server.ts`). In `STORAGE=pg` the ops commit to Postgres in **one transaction** (`PgCoreStore.commit`, `apps/api/src/storage/core-store.ts`); only after `COMMIT` does `applyToReadModel` update the Maps. A failed commit throws before the read model is touched, so the API never acknowledges or serves state it could not save.
2. **Read path.** Reads keep using the Maps, now a read model hydrated from Postgres at boot (before the server accepts traffic).
3. **Scope.** Users, profiles, organizations, memberships, skills, jobs (+ `job_skills`), applications (+ `application_evidence`), evidence (+ `evidence_skills`), verified work history, references and corporate-email challenges; since migration `00044`, notifications and notification preferences, written in the same transaction as the event that causes them; since `00046`, signed-out sessions (`revoked_sessions`); since 2026-10-11, messaging (`message_threads`, `thread_participants`, `messages` from `00006`), each message's notification in its transaction. The routes they serve are listed in `apps/api/src/durability.ts` (`DURABLE_ROUTES`).
4. **Honesty about the rest.** Every other route keeps its state in memory and says so: responses carry `x-talentsphere-durability: ephemeral`, and admin health diagnostics report the split. `tests/security/core-authz.test.ts` checks that every registered route exists and `tests/pg/concurrency.test.ts` checks the header against a real database.
5. **Concurrency (added after adversarial review).** Because a commit is an `await`, two requests can both pass a check before either writes. Update ops carry `base` — the read-model value they were derived from. `persist()` refuses (409 `CONFLICT`, `reason: concurrent_modification`) when another write to the same record is in flight or the record is no longer `base`; Postgres re-checks the decisive columns inside the transaction (`WHERE status = …`, `WHERE attempts = … AND code_hash = …`), so the guarantee also holds against a second writer.
6. **Schema alignment.** Migration `00043_core_persistence_alignment.sql` reconciles schema and domain: missing job/application/evidence columns and CHECKs; BR-15 as a partial unique index (one *active* application per job and candidate, re-applying after withdrawal allowed) instead of a plain `UNIQUE(job_id, candidate_id)`; work-history and reference FKs re-pointed from `profiles(id)` to `users(id)` (the API and the 00041 RLS policies use user ids); reference tokens stored as SHA-256 only (`token_hash`, plaintext column dropped after backfill); a `work_history_email_challenges` table (service-role only); case-insensitive unique emails.

## Consequences

- **Single writer.** The read model makes the API a single writer: run exactly one API process per database. Two replicas would serve diverging state (the database guards in point 5 stop lost updates on the guarded records, not stale reads). A session-level PostgreSQL advisory lock now refuses a second API writer at startup; losing the lock makes the API unhealthy. This still does not permit horizontal scale-out — see `docs/quality/OPERATIONS.md`.
- **Out-of-band changes need a restart.** A row changed directly in SQL (e.g. bootstrapping the first admin) is seen after the API restarts and re-hydrates.
- **Boot time and memory grow with the data.** Hydration reads every core row. Acceptable at pre-launch volume; not at scale.
- **Long-tail modules are still ephemeral** (~220 routes: learning, gamification, interviews, saved searches, connections, billing records, …). They are labelled, not hidden.

## Exit path

Move reads for a module to SQL (repository functions in `apps/api`), delete its Maps, and the single-writer constraint disappears for that module. When no core read uses a Map, the API can run more than one replica. Do this before a second replica is needed, or before core data outgrows comfortable boot-time hydration.

## Verification

- `tests/pg/core-persistence.test.ts` — the whole loop writes real rows; a brand-new process serves identical state after restart; concurrent duplicate sign-ups resolve 201/409/409 with one row; BR-15 re-apply; erasure removes rows and stays erased after restart. Disabling `commit` fails every test (mutation-checked).
- `tests/pg/concurrency.test.ts` — 40 concurrent wrong email codes are all counted (was: recorded as 1, after which the correct code was accepted); a concurrent hire and withdrawal acknowledge exactly one, matching the database. Disabling the guards fails both tests; disabling only the in-process guard (simulating a second writer) still passes — the database guard holds on its own.
- CI runs both files against a `postgres:16` service container (`.github/workflows/ci.yml`), plus a migration-idempotency step.

## Escalation

Schema-changing and constraint-changing (dropping `UNIQUE(job_id, candidate_id)`, dropping `employment_references.token` after hashing it). At adoption no production database was reported; that is not a current deployment claim. The owner should ratify before `00043` is applied to any populated database. `uq_users_email_lower` will fail to build if a database already holds two emails that differ only by case; check first.

### 7.1 Target interpretation of ADR-015 (lessons carried into the blueprint)

| Prior attempt reported | Target requires | Where |
|---|---|---|
| Writes only through one `persist(...ops)` function; one DB transaction; read model updated only after COMMIT | All state changes through a single transactional unit-of-work per use case; no state visible before commit | BE-01, DB-02 |
| Update ops carry `base` (the read-model value they were derived from); 409 `CONFLICT` with `reason: concurrent_modification` when another write is in flight or the record is no longer `base`; DB re-checks decisive columns (`WHERE status = ...`, `WHERE attempts = ... AND code_hash = ...`) | Optimistic concurrency for guarded records using `If-Match`/version column (ADR-T08); decisive-column guards inside SQL for verification attempt counters and state transitions | 13_ API standards |
| Reads served from Maps hydrated at boot; exactly one API process; advisory lock `pg_try_advisory_lock(718201, 1)`; losing the lock makes the API unhealthy | No read model, so no single-writer constraint (ADR-T05); API replicas allowed | OPEN-52 |
| Out-of-band SQL changes need a restart | Not applicable once reads are SQL | - |
| Boot time and memory grow with data | Not applicable once reads are SQL | - |
| Long tail of ~220 routes ephemeral and labelled `x-talentsphere-durability: ephemeral` | Every route durable by default; any exception must be a documented, tested, labelled preview module | 16_ testing: persistence-honesty |
| Migration `00043` aligned schema with domain: BR-15 as partial unique index (one *active* application per job and candidate, re-apply after withdrawal allowed) instead of plain `UNIQUE(job_id, candidate_id)`; FKs re-pointed to `users(id)`; reference tokens stored as SHA-256 (`token_hash`) with plaintext column dropped after backfill; `work_history_email_challenges` table (service-role only); case-insensitive unique emails (`uq_users_email_lower`) | Same constraints belong in the first schema: partial unique index for active applications, hashed verification credentials, citext/lower unique email | `../12_DATA_AND_DATABASE/LEGACY_MERGE_DATABASE_REFERENCE.md` |
| Verification evidence: whole loop writes real rows; fresh process serves identical state after restart; 40 concurrent wrong email codes all counted; concurrent hire and withdrawal acknowledge exactly one; disabling `commit` or the guards fails tests (mutation-checked); CI against a `postgres:16` service container plus a migration-idempotency step | Same test classes are required of the new implementation, mutation-checked where cheap | `../16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` |
| Escalation: schema/constraint-changing; `uq_users_email_lower` fails to build if two emails differ only by case; owner ratifies before applying to a populated DB | Not applicable to a greenfield database; keep the "check duplicates first" rule in any import from a reference database (`../23_MIGRATION_AND_EVOLUTION/REFERENCE_TO_TARGET_DATA_MIGRATION.md`) | OPEN-17 |

**Exit path (prior attempt):** move reads for a module to SQL (repository functions), delete its Maps, and the single-writer constraint disappears for that module; when no core read uses a Map the API can run more than one replica. **Target requires** that exit already be complete at v1.

## 8. Open items raised by this file

| ID | Question | Link |
|---|---|---|
| L-B11-01 | Realtime scope (client server-state library is decided: FD-F2) | OPEN-49 |
| L-B11-02 | Adopt ARCH-013..020 as IDs or map to INV-T01..T20 | OPEN-47 |
| L-B11-03 | Retire legacy ADR numbering namespaces | ARB secretary |
| OPEN-52 | ADR-015 hybrid vs ADR-T05 SQL-only | `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` |


<!-- ledger-D D-09b -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/ARCHITECTURE_DURABILITY_REPORT.md (gap closure D-09b)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: about 118 code/SQL/line-reference tokens (for example `server.ts:12701`, `core-store.ts:803-854`, `EMAIL_CHALLENGE_TTL_MS = 15 * 60 * 1000`, `EMAIL_CHALLENGE_MAX_ATTEMPTS = 5`, `writesInFlight: Set<string>`) and the URL https://api.resend.com/emails; token-bearing lines quoted.

~~~~text
L7: **Repository:** `https://github.com/yhsomani/talentsphere-complete.git`  
[...]
L23: 5. **AI Governance**: `AI_PROHIBITED` is enforced server-side, but relies on an in-memory assessment session map that clears on restart (**SEC-05**). Quota metering hardcodes `userTier: 'free'`, capping paying users at free limits (**SEC-06**). No remote LLMs are integrated; all responses are generated via local heuristic pattern matching.
[...]
L33: - **Write Path**: In `apps/api/src/server.ts:13317-13335`, state mutations pass through `persist(...ops: CoreOp[])`. In `STORAGE=pg`, ops are committed inside a single PostgreSQL transaction (`PgCoreStore.commit` in `apps/api/src/storage/core-store.ts:785-801`). Only after successful transaction `COMMIT` does `applyToReadModel` mutate in-process memory `Map`s. If the transaction aborts, the read model is untouched and the request fails with a 4xx/5xx error.
L34: - **Topological Write Ordering (`WRITE_ORDER`)**: `apps/api/src/storage/core-store.ts:753-778` orders operations topologically:
[...]
L37: - **Boot Hydration**: `apps/api/src/storage/core-store.ts:803-854` (`PgCoreStore.load`) executes 20 parallel `SELECT * FROM table ORDER BY created_at, id` queries to hydrate the in-process Maps prior to accepting traffic.
L38: - **Single-Writer Advisory Lock**: Because reads query in-process Maps, running two API replicas against the same database would cause read-model divergence. To prevent horizontal split-brain, `apps/api/src/storage/index.ts:107-137` acquires a session-level PostgreSQL advisory lock on boot:
[...]
L42:   If a second API replica attempts to start against the database, `acquireWriterLease()` throws:
[...]
L44:   A lost database connection marks `writerLeaseLost = true`, causing `app.addHook('onRequest')` (`apps/api/src/server.ts:523-535`) to fail closed with `503 SERVICE_UNAVAILABLE`.
[...]
L48: To prevent race conditions during the asynchronous `await storage.core.commit(ops)` window:
L49: 1. **In-Flight Write Locks**: `apps/api/src/server.ts:13317-13335` registers record keys in `writesInFlight: Set<string>`. If another concurrent write targets the same record key, it immediately throws `409 CONFLICT` (`concurrent_modification`).
L50: 2. **Read-Model Optimistic Checks**: Updates carry `base`. If `currentRecord(op) !== op.base`, `persist()` rejects with `409 CONFLICT`.
[...]
L52:    - `jobs` (`core-store.ts:354`): `WHERE $14::text IS NULL OR jobs.status::text = $14::text`
L53:    - `job_applications` (`core-store.ts:396`): `WHERE $15::text IS NULL OR job_applications.status::text = $15::text`
L54:    - `evidence` (`core-store.ts:441`): `WHERE $17::text IS NULL OR (evidence.status::text = $17::text AND evidence.verification_level::text = $18::text)`
L55:    - `verified_work_histories` (`core-store.ts:495`): `WHERE $20::boolean IS NOT TRUE OR (verification_score = $21 AND email_verified_at IS NOT DISTINCT FROM $22::timestamptz)`
L56:    - `employment_references` (`core-store.ts:541`): `WHERE $20::text IS NULL OR employment_references.status::text = $20::text`
L57:    - `work_history_email_challenges` (`core-store.ts:577`): `WHERE work_history_id = $1 AND code_hash = $3 AND attempts = $4`
L58:    `assertGuardHeld(expected, result)` throws `DomainError('CONFLICT', 'Record was modified concurrently.')` if `result.rowCount === 0`.
[...]
L62: `apps/api/src/durability.ts` and `apps/api/src/server.ts:574-579` enforce runtime durability disclosure:
[...]
L79: | **LMS & Courses** | ~24 | `POST /api/v1/courses`, `POST /api/v1/courses/:id/enroll`, `POST /api/v1/courses/lessons/:id/progress`, `POST /api/v1/courses/:id/certificate` | All created courses, enrollments, module progress, and issued certificates are deleted. |
L80: | **Code Arena & Assessments** | ~14 | `POST /api/v1/challenges`, `POST /api/v1/challenges/:id/sessions`, `POST /api/v1/challenges/sessions/:id/submit` | Active exam sessions, candidate code submissions, and execution scores are wiped. |
L81: | **Gamification & XP** | ~8 | `GET /api/v1/xp/ledger`, `GET /api/v1/gamification/leaderboard`, `POST /api/v1/gamification/badges/claim` | XP transaction histories and daily cap trackers reset to 0. |
L82: | **Technical Interviews** | ~18 | `POST /api/v1/interviews/sessions`, `POST /api/v1/interviews/sessions/:id/scorecards` | Recruiter scorecards and candidate assessment records are lost. |
L83: | **Reputation & Endorsements** | ~22 | `POST /api/v1/endorsements`, `POST /api/v1/instructors/:id/reviews`, `POST /api/v1/employers/:id/reviews` | Peer credibility endorsements, student reviews, and calculated scores disappear. |
L84: | **Career Trajectory & Forecasts**| ~16 | `POST /api/v1/careers/transitions`, `POST /api/v1/skills/forecast` | Anonymized benchmark transitions and 12-month supply/demand forecasts are wiped. |
[...]
L86: | **Application Drafts & Resumes** | ~14 | `POST /api/v1/applications/drafts`, `POST /api/v1/resumes` | Candidate draft applications and resume documents are deleted. |
[...]
L94:    On every update to a job, application, or evidence record, `PgCoreStore.writeOp` executes:
[...]
L111: Implemented in `apps/api/src/server.ts:12421-12553` across two distinct steps:
[...]
L113:    - `assertCorporateEmailEligible(email, companyDomain)` validates domain matching (`verifyCorporateEmailDomain`) and rejects disposable email providers (`DISPOSABLE_EMAIL_DOMAINS`) or consumer webmail (`CONSUMER_WEBMAIL_DOMAINS`).
L114:    - Generation: `const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');` (6-digit numeric string, $\approx 19.93$ bits of entropy).
[...]
L126:    - TTL: `EMAIL_CHALLENGE_TTL_MS = 15 * 60 * 1000` (15 minutes).
L127:    - Delivery: Enqueued durably via `storage.jobs.enqueue({ kind: 'work_history.email_verification_requested', ... })`. Never returned in HTTP responses.
[...]
L129:    - Compares candidate code against `challenge.codeHash`:
[...]
L131:      if (!safeEqualHex(sha256Hex(`${id}:${body.verificationCode.trim()}`), challenge.codeHash))
[...]
L133:    - Brute-force & Concurrency Defense: `EMAIL_CHALLENGE_MAX_ATTEMPTS = 5`.
L134:      When an incorrect code is submitted, an optimistic update increments `attempts: challenge.attempts + 1` with `base: challenge`. In SQL (`core-store.ts:574-580`):
[...]
L139:    - Single-use Consumption: Upon verification, `emailChallengeDelete` deletes the challenge with `base: challenge`, and `verifyCorporateEmail()` awards verified status.
[...]
L142: - **Severity**: **High** (CWE-328 / CWE-916)
[...]
L148: - **Remediation**: Hash with `crypto.createHmac('sha256', env.TOKEN_SECRET).update(`${id}:${code}`).digest('hex')`.
[...]
L154: Implemented in `apps/api/src/server.ts:12555-12780` and `packages/domain/src/work-history-graph.ts:494-585`:
[...]
L161:    - The token plaintext is stripped from API response payloads (`publicReference` in `server.ts:12366-12369`).
L162:    - Stored in database table `employment_references` as `token_hash CHAR(64)` (`00043_core_persistence_alignment.sql:105`).
[...]
L165:    - The referee accesses `GET /api/v1/references/:refId` passing header `x-reference-token: <token>`.
L166:    - Token is verified using constant-time comparison: `safeEqualHex(sha256Hex(token), reference.tokenHash)`.
L167:    - Candidate details and dates are returned; invalid tokens return generic `404 NOT_FOUND` to prevent ID harvesting (`server.ts:12668`).
[...]
L170:    - Concurrency is guarded by `base: reference` in SQL:
[...]
L176:    - In domain (`work-history-graph.ts:499-507`):
L177:      - `refereeUserId === candidateUserId` $\to$ throws `409 CONFLICT`
L178:      - `refereeEmail === candidateEmail` $\to$ throws `409 CONFLICT`
L179:    - In API route (`server.ts:12701`):
L180:      - `session && session.userId === reference.candidateId` $\to$ throws `403 FORBIDDEN`
[...]
L182:    - `clientRequestId` idempotency key: `referencesByClientRequest` deduplicates retry submissions.
[...]
L189: - **Severity**: **Medium** (CWE-613)
[...]
L192: - **Remediation**: Add `expires_at TIMESTAMPTZ` (30 days TTL) to `employment_references` and validate `Date.now() < Date.parse(reference.expiresAt)` upon lookup and submission.
[...]
L200: Implemented in `packages/domain/src/auth.ts:1-91`:
[...]
L202: - **Iteration Floor**: `PBKDF2_DEFAULT_ITERATIONS = 210_000` (meets OWASP 2023 recommendations).
L203: - **Environment Override Floor**: `configuredPasswordIterations()` enforces a hard minimum floor:
[...]
L208: - **Transparent Re-Hash**: On successful sign-in (`apps/api/src/server.ts:1053-1063`), if `passwordNeedsRehash(user.passwordHash)` is true, the hash is upgraded to 210,000 iterations while the plaintext password is in memory.
[...]
L213: Implemented in `packages/domain/src/auth.ts:94-178` and `apps/api/src/server.ts:860-930, 1159-1210`:
L214: 1. **Token Minting**: HMAC-SHA256 signed JWT-like strings (`base64url(payload).signature`). Signing key fails safe: an unconfigured secret generates a random per-process secret rather than using a default key.
L215: 2. **Session Identification**: Every token contains a unique `sessionId: crypto.randomBytes(16).toString('base64url')`.
[...]
L217:    Created in migration `00046_session_sign_out.sql`. When a user signs out (`POST /api/v1/auth/sign-out`), `{ sessionId, userId, expiresAt }` is persisted to `revoked_sessions`. Opportunistic cleanup purges expired sessions (`DELETE FROM public.revoked_sessions WHERE expires_at <= now()`).
L218: 4. **Runtime Check**: `resolveSession` verifies `!revokedSessions.has(session.sessionId)` on every request.
L219: 5. **Global Cut-Off (`sessions_valid_after`)**: Added in migration `00045_session_revocation.sql`. Triggered on password change or `POST /api/v1/auth/sign-out-others`: sets `users.sessions_valid_after = now() + 1s`. Any token issued prior to this timestamp is rejected with `401 UNAUTHENTICATED`.
[...]
L230: - In `job_applications`: `candidate_id` references `public.profiles(id)` (`00001_core_schema.sql:182`).
L231: - In `verified_work_histories`: `candidate_id` references `public.users(id)` (`00043_core_persistence_alignment.sql:80`).
L232: - In `employment_references`: `candidate_id` references `public.users(id)` (`00043_core_persistence_alignment.sql:91`).
L233: API handlers frequently translate `profilesByUserId.get(session.userId)` to obtain the profile UUID, creating subtle risks of ID confusion.
[...]
L243:    - `packages/domain/src/assessment.ts:33-44`:
[...]
L259:    Active assessment sessions live in `assessmentSessionsByCandidateId = new Map<string, AssessmentSession[]>()`. If the API restarts during an assessment, the in-memory session map is lost. The candidate can immediately access AI assistance for the remainder of the session without server restriction.
[...]
L263: Implemented in `packages/domain/src/ai-gateway.ts:52-172`:
[...]
L266:    In `apps/api/src/server.ts:6097`:
[...]
L271:    `userTier` is **hardcoded to `'free'`**. Even if a user has an active Pro subscription in `subscriptionsByUserId`, they are permanently throttled to 20 requests/day and 5,000 tokens/day. Furthermore, `aiUsageMetersByUserAndDate` is an in-process Map; restarting the server resets all daily quota consumption to 0.
[...]
L274: - **Execution Mode**: `generateCareerAssistantResponse()` executes entirely locally (`executionMode: 'local_heuristic'`) using keyword pattern matching.
[...]
L284: - In `NODE_ENV === 'development'`, emails are logged to console (`DEV OUTBOX`).
L285: - In staging/production, requires `EMAIL_PROVIDER === 'resend'`, `RESEND_API_KEY`, and `EMAIL_FROM`.
L286: - Dispatches HTTP POST to `https://api.resend.com/emails` with `Idempotency-Key: jobId` header (preventing duplicate sends on worker retries).
[...]
L291: - **Payment Processor**: No live Stripe API integration exists. When `BILLING_MODE !== 'simulated'`, paid plans are refused with `503 SERVICE_UNAVAILABLE`.
[...]
L293:   `POST /api/v1/billing/webhook` requires header `x-talentsphere-signature: t=<unix_seconds>,v1=<hex_hmac_sha256>`. Fastify uses a raw string content-type parser to guarantee byte-for-byte HMAC verification against `BILLING_WEBHOOK_SECRET`. Replays older than 5 minutes are rejected.
[...]
L297: - **Architecture**: Multi-arch ARM64 images (`node:24-bookworm-slim`, `postgres:16-bookworm`, `caddy:2-alpine`).
L298: - **Network Isolation**: Three networks (`public`, `egress`, `internal`). `db` is strictly connected to `internal` with **zero published host ports**; `api` is connected to `internal` and `egress` with **zero published host ports**. Only Caddy binds to `80`/`443`.
[...]
L301:   - **Defect OPS-02 (Caddy Health Route)**: `deploy/oracle/Caddyfile` routes only `/api/*` to Fastify. Requests to `https://SITE_DOMAIN/health` are intercepted by Caddy's static file handler, returning `index.html` 200 OK and masking API failure.
[...]
L309: | **SEC-01** | Cryptography | `apps/api/src/server.ts:12440` | Corporate email verification code uses plain SHA-256 with public UUID salt, not HMAC. | Rainbow-table precomputation of 6-digit codes ($10^6$) in $<50$ms upon DB leak. | **High** | Replace with HMAC-SHA256 keyed by server `TOKEN_SECRET`. |
L310: | **SEC-02** | Cryptography | `packages/domain/src/work-history-graph.ts:510` | Referee voucher tokens have no expiration timestamp (TTL). | Emailed voucher links remain valid indefinitely; ex-employees can voucher years later. | **Medium** | Add `expires_at TIMESTAMPTZ` (30 days TTL) to `employment_references` and validate on submit. |
[...]
L313: | **SEC-05** | AI Governance | `apps/api/src/server.ts:4770` | Active assessment session map is in-memory; resets on restart. | Server restart during active exam unblocks AI assistant, bypassing `AI_PROHIBITED`. | **High** | Persist active assessment sessions in PostgreSQL (`00004_challenges_assessment_schema.sql`). |
L314: | **SEC-06** | AI Governance | `apps/api/src/server.ts:6097` | `userTier` hardcoded to `'free'` in `/api/v1/ai/career-assistant/chat`; usage meter is in-memory. | Paid subscribers throttled to free limits; token usage resets on server restart. | **Medium** | Read plan tier from `subscriptionsByUserId`; persist `ai_usage_meters` in PostgreSQL. |
L315: | **OPS-01** | Scalability | `apps/api/src/storage/core-store.ts:803` | Boot hydration reads entire database ($O(N)$ memory/time); single-writer lock blocks scaling. | Scaling ceiling; memory exhaustion and deployment timeouts as data grows. | **High** | Move core reads directly to SQL queries; retire in-memory Maps to unlock multi-replica API scaling. |
L316: | **OPS-02** | Deployment | `deploy/oracle/Caddyfile:7` | Caddy fails to route `/health` to API container. | Synthetic healthchecks return `index.html` 200 OK, masking API crash or outage. | **Low** | Route `/health` and `/api/*` to `api:4000` in `Caddyfile`. |
~~~~
