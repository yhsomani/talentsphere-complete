# Legacy Merge B-11b: Prior-Attempt "Architecture as Implemented" - Topology, Owners, Invariants, Async and Decision Register

Doc ID: LGM-B-11B · Owner: Backend Architecture Team · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: BE-01, BE-01-R2, INV-T01..T20, ADR-T04..T09, OPEN-52 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

## 0. Frame

- **Nothing is implemented in this project.** This file records what the repository-root `ARCHITECTURE.md` (source cross-check `431c425a`, 2026-10-23, 393 lines, 28 sections) reported about an *earlier attempt*. It is a catalogue of lessons, constraints and gaps to design against - never a status report. Root `ARCHITECTURE.md` is not edited by this work.
- Evidence vocabulary the prior attempt used (kept because it prevents over-claiming): **implemented** = source presence; **partial** = incomplete contract coverage; **planned** = explicit future scope; **not implemented** = absent from inspected sources; **unverified** = missing proof. Runtime or production claims need separately recorded execution evidence. For this project the only state is *specified / designed / not built*.
- Companion: `LEGACY_MERGE_ARCHITECTURE_RULES_AND_ADRS.md` (target architecture v6.0, TRD, code style, ADR-015). Diagrams: `../25_DIAGRAM_LIBRARY/LEGACY_MERGE_DIAGRAMS.md`.

## 1. Purpose, authority and precedence (prior attempt)

The prior document gave maintainers topology, ownership, extension points and risks "without copying product requirements or dated audit results". Code won a factual conflict; changing intended behaviour followed the SSOT and `AGENTS.md` authority. Requirements were explicitly separated from enforcement gaps.

**Target requires:** the same separation in this blueprint - `SSOT.md` = intent, blueprint = design, code (when it exists) = fact. Already implied by `../00_CONTROL_CENTRE/PROJECT_SCOPE.md`; no new decision needed.

## 2. Architecture at a glance (prior attempt)

One React browser app, one Fastify API writer per database, and a PostgreSQL-backed worker formed a pnpm modular monolith. Most routes shared a single `buildApp` closure in one very large server file; Stripe routes used an injected dependency interface. Domain modules provided pure business functions; the API owned orchestration, authorization wiring, read models, persistence and integrations.

Diagram (Mermaid) is in `../25_DIAGRAM_LIBRARY/LEGACY_MERGE_DIAGRAMS.md` section 2. Lesson: a single closure holding ~270 routes and ~150 in-memory maps made the file very hard to audit; **target requires** module-per-domain route registration (BE-01) with the policy module (ADR-T07).

## 3. System boundary table (prior attempt - area, boundary, limit)

| Area        | Implemented boundary                                                                           | Limit                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Identity    | Email/password, HMAC sessions, password change and session revocation                          | No Supabase Auth, OAuth or password-reset email flow                     |
| Persistence | PostgreSQL core plus dedicated stores; explicit memory mode                                    | Many long-tail features are ephemeral                                    |
| Billing     | Stripe Checkout/Portal/SDK callback, durable subscription/invoice/event records                | Disabled by default; live acceptance unverified                          |
| Email       | Opt-in Brevo (provider-independent service) for work-email verification and reference requests | Provider acceptance is not mailbox delivery; no push/SMS                 |
| AI          | Local heuristic and simpler assistant scaffold                                                 | No remote model execution; saved BYO keys are not integration            |
| Search      | In-process matching/ranking over available data                                                | No PostgreSQL FTS runtime integration                                    |
| Browser     | React routes, API fetch helpers, PWA manifest/capability detection                             | No implemented offline synchronization/service-worker installation       |
| Hosting     | Oracle container/Compose/proxy/backup assets exist                                             | Configuration is not proof of deployment or restore                      |
| Supabase    | SQL history and hosted adapter assets                                                          | Custom API identity remains distinct; live applied state unverified here |

**Target requires:** each "Limit" cell is a deliberate gap to close in the first release or an explicit non-goal: no OAuth / password-reset email flow (target has account recovery per SEC-02), no remote model execution (ADR-T12 gateway), search without FTS (ADR-T11 requires FTS + trigram + pgvector), no offline sync (ADR-T10), hosting assets are not proof of deployment (OPEN-14).

## 4. Component responsibilities (prior attempt)

| Location                                                   | Responsibility                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `apps/api/src/index.ts`                                    | Load environment, validate deployed configuration, build and listen                  |
| `apps/api/src/server.ts`                                   | `buildApp`, hooks/errors, route orchestration, authorization, read models, `persist` |
| `apps/api/src/storage/`                                    | Core and dedicated SQL/memory implementations                                        |
| `apps/api/src/billing-stripe.ts`, `stripe-gateway.ts`      | Billing orchestration and the only Stripe SDK boundary                               |
| `apps/worker/src/index.ts`, `claim.ts`, `mail-provider.ts` | Durable claims, event acknowledgements and transactional email                       |
| `apps/web/src/App.tsx`, `pages/`, `components/`, `lib/`    | Routes, UI, session state and HTTP helpers                                           |
| `packages/domain/src/`                                     | State machines, scoring, policy and auth primitives; injected-query job store        |
| `packages/contracts/src/index.ts`                          | Zod request schemas, validation helpers and error envelope                           |
| `packages/config/src/env.ts`                               | Server environment schema and deployment/Stripe refusal checks                       |
| `packages/observability/src/`                              | Pino logger/redaction and separate audit interface                                   |
| `packages/ui/src/`                                         | Design tokens; components remain in the web app                                      |
| `packages/testing/src/`                                    | Shared mock factories                                                                |
| `supabase/`, `scripts/`, `tests/`                          | SQL, operational tools and executable checks                                         |

## 5. Responsibility owners ("reuse, do not duplicate") - preserved rules

- Authentication reuse: `hashPassword`/`verifyPassword`, `createSessionToken`/`verifySessionToken`; API identity via `extractUser`/`resolveSession`. Resource checks sit beside domain predicates and existing route authorization.
- Application transitions use one table (`ALLOWED_APPLICATION_TRANSITIONS`); evidence rules live in one module; billing plans in one constant (`PLATFORM_PLANS`) with Stripe normalization and reconciliation in their adapters/domain module. Request shapes belong in contracts; errors in the global handler.
- Core writes go through one `persist` + core store; dedicated stores own their own transactions; one claim loop (`runClaimCycle`) owns job processing, not the unused in-memory queue engine.
- Browser: one session provider and `lib/session` own session state; one `apiJson` owns common request/error behaviour; shared web components use existing UI primitives.
- Dependency direction: Browser -> API -> contracts/domain -> storage/provider adapter. The worker uses the injected-query job store and its own mail adapter; it cannot see API process memory. Domain business functions never import Fastify, Zod or provider SDKs. Contracts stay independent of domain. Never put privileged credentials or database clients in the browser; UI checks never authoritative; no parallel auth helpers, error envelopes, queues, audit stores or component libraries. "Some authorization remained inline" (see the route-authorization findings).

**Target requires:** one owner per concern is an anti-duplication principle; map to INV-T01 (server-side authz), INV-T02 (single domain definition) and ADR-T07 (central policy module). Record "no second queue / audit store / UI kit" as a review checklist item for pull requests (`../29_DEVELOPER_IMPLEMENTATION_GUIDE`).

## 6. Decision rationale (prior attempt)

- Monolith avoids premature independent services; pure domain functions make business logic testable without Fastify; HMAC sessions avoid an external identity provider but need stable signing keys and explicit revocation; Zod plus one error handler avoids divergent boundary validation/error formats; local heuristic AI avoids external inference cost but is not an LLM.
- ADR-015 kept core Map reads to avoid rewriting every route while adding transactional writes; trade-off: boot-time hydration, single-writer scope, stale reads after external SQL changes. Pending owner ratification. Historical "memory-only", "unconnected worker" and "SQL-as-text migration" descriptions were superseded.
- **Target position:** the blueprint prefers cookie sessions through the API (ADR-T06) over self-issued bearer tokens kept in `localStorage`; see section 8.

## 6A. Essential transaction boundaries (prior attempt, root architecture section 8) and the rule "failures are not uniformly atomic"

1. Login parsed credentials, checked the password against the account read model, optionally upgraded the hash, issued a token; subsequent requests re-resolved current account roles/status and session revocation/cutoff.
2. Evidence creation validated skills, computed domain state and committed evidence plus skill links **before** updating the in-memory maps; verification used guarded transitions.
3. Job applications validated job/evidence/actor, applied domain rules and committed; a partial database unique index arbitrated duplicate active applications.
4. Work-history email verification stored a hashed, expiring challenge and queued delivery; reference requests stored a token hash; submission consumed the token and updated work-history trust; references expired after 30 days in API checks.
5. Checkout redirected to the payment provider; signed provider events reconciled local billing; redirect success alone granted nothing; billing state and event recording shared a transaction, but subsequent background dispatch did not.
6. API effects usually committed inline before `dispatchJob`; the worker recorded most events and executed only the two transactional mail kinds.

"Failures are not uniformly atomic across these steps. See database erasure limits, worker lease risks and billing retry semantics." **Target requires:** every one of the six flows is a single transaction plus outbox event (INV-T12); the list is reused as an acceptance checklist of "state change + event + side-effect" atomicity per flow in BE-01.

Also reported in the prior document's rules section: "Server-side ownership, evidence provenance, secret handling and assessment policy cannot be weakened to make a test pass. Known violations stay visible" - the same non-weakening rule applies to this project's test and gate suites (`../16_QA_AND_TESTING/`).

## 7. Extension points (prior attempt)

| Change                    | Existing home                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Domain rule/state machine | Owning `packages/domain/src/<context>.ts` and unit tests                                  |
| API route                 | Existing context in `server.ts`, or existing injected billing module                      |
| Payload                   | Contracts schema and route parsing                                                        |
| Persistent record         | Owning storage interface/implementation; additive migration if approved                   |
| Async effect              | Dispatch-kind registry plus worker handler; do not acknowledge undelivered work           |
| Notification              | Domain notification type/preferences; transactional core notification op where applicable |
| Browser page/component    | `pages`, `App.tsx`, existing navigation and `components/ui`                               |
| Session/data errors       | `SessionProvider`, `lib/session.ts`, `apiFetch`/`apiJson`                                 |
| Environment               | `packages/config/src/env.ts` and documented example, subject to build-file restriction    |
| Provider                  | Existing adapter boundary or an explicitly approved new integration                       |

Escalation rule (prior attempt, preserved): schema-breaking design, security architecture, provider/AI entitlement, pricing, major API versioning and consequential decisions are escalated to the owner with affected owners identified and a concrete bounded change proposed; ordinary fixes within established boundaries need no extra approval; protected build files stay read-only without explicit authorization. **Target requires:** map to the ARB process in `../24_RISKS_AND_DECISIONS/ADR_REGISTER.md`; no new decision.

## 8. Authentication, data, API and frontend facts reported (design lessons)

- **Tokens:** contain user ID, email, roles, issuance/expiry and a session ID; lifetime 24 h; account roles/status re-read from the account store override signed role snapshots on every request. Password change and "sign out other devices" advance an issuance cutoff; individual sign-out persists a revoked session. Non-active accounts keep restricted access to appeals and data rights; an erased credential is denied. Memory-mode tests accepted signed identities with no account row; durable mode refused them.
- **Weaknesses reported:** tokens live in browser `localStorage` (XSS-readable); no refresh-token flow; resource authorization per handler instead of a global middleware; several organization actions accepted any membership without checking the membership role (a policy gap, not an intended tenancy model).
- **Target requires:** httpOnly cookie sessions + CSRF token (ADR-T06), refresh rotation, central policy (ADR-T07), organization-role RBAC (OPEN-44 defines the role model).
- **Frontend facts:** `main.tsx` mounts React; `App.tsx` uses BrowserRouter and a shared Layout; guards check only token presence (UX only; API authoritative); state is React hooks + SessionContext (no TanStack Query/Redux); `apiFetch` attaches the token and clears/redirects on a 401 when a token exists, keeps the session on 403, handles login bad-credentials separately; `apiJson` adds a default 20 s timeout, JSON/error parsing, throttle timing and server-error masking; a route error boundary handles render failures; PWA manifest and `pwa.ts` only report capabilities - offline readiness was detected from an existing service-worker controller, not implemented. See `../10_FRONTEND_ARCHITECTURE/LEGACY_MERGE_FRONTEND_AND_UI_QUALITY.md`.
- **API facts:** hooks provided Helmet, CORS, rate limiting, request IDs and one global error envelope; handlers invoked authorization and domain validation; no generated OpenAPI; no universal pagination/idempotency layer. See `../13_API_EVENTS_AND_INTEGRATIONS/LEGACY_MERGE_API_CONTRACTS.md`.
- **Data facts:** core Map reads authoritative only within the single writer; table existence and durability headers cannot establish whole-feature durability; dedicated billing/settings/audit stores were not part of every core transaction. See `../12_DATA_AND_DATABASE/LEGACY_MERGE_DATABASE_REFERENCE.md`.

## 9. Backend startup, integrations, async behaviour, errors (prior attempt facts and target lessons)

### 9.1 Startup

The entry file loaded environment and checked production-config problems; `buildApp` validated configuration, created storage, checked health, acquired the writer lease and hydrated core records before returning. `STORAGE=memory` was explicit for non-durable development/tests and refused in deployed entry checks. The worker read its own environment and checked delivery prerequisites; it did not run the whole API environment validator. **Target requires:** one shared config-validation package used by API **and** worker at boot (closes conflict CF-21 follow-up "confirm validate runs at every boot including the worker").

### 9.2 Integrations

Stripe SDK calls lived in one gateway module; normalized snapshots kept provider objects out of business rules. Email went through a provider-independent service: logical template ids and variable validation (`templates.ts`), a vendor-free contract (`types.ts`), one provider registry (`service.ts`), the only Brevo code (`brevo.ts`, native fetch, 20 s timeout) and the worker's single env reader (`config.ts`). **To add a provider:** write an adapter that passes the shared provider-contract test (`tests/unit/email/provider-contract.ts`), add it to `buildProvider` and `SUPPORTED_EMAIL_PROVIDERS`, set `EMAIL_PROVIDER`; call sites do not change. Development mail goes to a labelled log outbox. Unimplemented targets: Supabase Auth/Storage/Realtime/Queues, Mux, OAuth, LinkedIn, external LLM adapters. **Target requires:** same port/adapter + shared contract-test pattern for every provider (ADR-T20 email port; INT-01).

### 9.3 Asynchronous behaviour (important operational constants and defects)

- `runClaimCycle` claimed up to **10 jobs** under a **60-second lease**, ran handlers sequentially with a **30-second** `Promise.race` timeout; default maximum attempts **3**; exponential backoff with jitter and a cap; unknown handlers dead-letter; permanent errors fail; transient failures retry or become dead; cancellation is cooperative at acknowledgement and does not undo effects.
- Defects reported: a timeout does not abort the underlying promise; batch waiting can consume later jobs' leases; expired leases can be reclaimed and execution duplicated; completion is not fenced by claim generation; no exactly-once delivery; most handlers only record events; no digest/rollup scheduler or heavy queue; an unused in-memory `JobQueueEngine` stayed in the tree; in memory mode the standalone worker idled because it could not see API Maps.
- **Target requires:** fenced leases with claim generation (ADR-T09), abortable handlers (AbortSignal) with per-handler budgets, heartbeat extension for long handlers, reclaim path that checks `attempts` (closes CF-24), at-least-once with consumer dedupe by `event_id`, no unused second scheduler. Test hooks: duplicate-execution probe, lease-expiry reclaim probe (`../16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md`).

### 9.4 Error handling

Domain and validation errors went through one central HTTP mapper; plugin status codes preserved; unexpected deployed errors masked; rejected 4xx logged at info, 5xx at error (alert on error-level); provider adapters translated failures without exposing secrets; no general client retry framework or distributed transaction. **Target requires:** RFC 9457 problem+json (ADR-T08) instead of the legacy `{error:{code,message,request_id,details}}` envelope; keep the 4xx-info / 5xx-error logging split and request-ID propagation (see 13_ legacy file for the envelope).

## 10. Security boundaries and limits reported

PBKDF2-SHA512 (default 210,000 iterations), HMAC sessions with revocation, refusals for unsafe deployed configuration, request validation, role/resource checks, rate limiting, CORS/Helmet, hashed trust credentials and log redaction existed. Limits: hashes do not prove credential delivery or employer identity; the API's database connection could bypass RLS so policies needed separate tests; cohort suppression alone is not differential privacy. Open gaps listed: assessment submission did not execute code yet could return simulated `passed`/100 while storing unverified evidence (`executed:false`); interview execution simulated and refused in staging/production; course completion could mint authority-verified evidence without the final assessment; AI chat enforced a free quota but a second assistant-query path skipped it; saved consent not universally enforced.

**Target requires** (traceable to existing ADRs): ADR-T13 (no verified evidence from simulated execution), ADR-T14 (evidence ladder with server-side verification transition), ADR-T12 (one AI gateway; inherited `AI_PROHIBITED`), OPEN-27 sandbox. Details in `../14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_SECURITY_CONTROLS.md`.

## 11. Observability, testing, deployment facts reported

- Pino logs and request IDs; SQL admin audit; admin health diagnostics. Liveness alone did not prove database reachability or job completion. Worker heartbeat written between claim cycles when 10 s elapsed (long batches could delay it); API treated a heartbeat older than 45 s as unhealthy. Maintenance mode only changed diagnostics, not request admission. No deployed metrics/tracing/alert backend established.
- Testing architecture: unit tests often imported source while the API imported *built* workspace packages, so stale `dist` produced misleading passes or failures; shared test signing keys kept copies compatible but did not prove matching source; PostgreSQL tests exercised durability/RLS; Playwright used built API/web. **Target requires:** tests run against source or against a freshly built artifact in the same job (never stale build output); see QA file.
- Deployment: root build built packages before apps; CI on Node 24; package manager pinned in the manifest; Oracle container/Compose/proxy/recovery assets existed; local migrations used a custom runner while hosted Supabase used a separate gated manual adapter; `supabase db push` was not a substitute for the repository workflow. See `../17_DEVOPS_AND_INFRASTRUCTURE/LEGACY_MERGE_DEVOPS_AND_DEPLOY.md`.

## 12. Prior-attempt risks and unresolved decisions (R-/U- ids preserved)

| ID | Statement (prior attempt) | Target handling |
|---|---|---|
| R-2 | Inline/duplicated authorization and organization-role inconsistencies | ADR-T07 central policy; OPEN-44 role model |
| R-3 | UI tokens and web primitives are distinct owners; no second UI kit | `../07_UI_UX_AND_DESIGN_SYSTEM` single design system |
| R-4 | AI tier hardcoded free despite billing entitlements; consent/quotas differ between assistant paths; entitlement changes need owner decision | ADR-T12, OPEN-19, OPEN-24 |
| R-6 | SQL admin audit and the observability audit interface differ; cross-system coverage/retention not established | one audit sink (OPS-OBS) |
| (unnumbered) | Long-tail persistence, worker leases/timeouts, erasure recovery, certificate assessment/revocation and billing concurrency are material release risks | `../24_RISKS_AND_DECISIONS/RISK_REGISTER.md` |
| U-1/U-2 | Deployment assets and local proxies exist; deployed topology, gateway, restore and runtime acceptance unverified | OPEN-14, RG-14 restore drill |
| U-3 | Tenant/membership permissions need explicit policy reconciliation | OPEN-44 |

Finding ids (CF-01..CF-45) are kept in `../23_MIGRATION_AND_EVOLUTION/LEGACY_MERGE_CONFLICT_REGISTER.md` and `../14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_ROUTE_AUTHORIZATION_FINDINGS.md`.

## 13. Architectural invariants reported (INVARIANT-001..015)

These were "constraints to preserve and complete"; they did not assert that gaps were fixed. INVARIANT-007 had a known assistant-scaffold exception; INVARIANT-015 describes stored credentials, not the transient queued delivery payload.

- **INVARIANT-001:** Authorization is enforced server-side on every protected route; client checks are advisory only.
- **INVARIANT-002:** Every business rule/state machine has exactly one definition in `@talentsphere/domain`; routes and UI call it, never restate it.
- **INVARIANT-003:** `packages/domain` never imports frameworks, providers, or performs I/O; `core.ts` never imports anything; no domain module imports its own barrel.
- **INVARIANT-004:** All API failures are expressed as `DomainError`/`ZodError` and rendered solely through the global handler's `ErrorEnvelope` with a `request_id`.
- **INVARIANT-005:** Only `apps/api` (its `storage/` layer) and `apps/worker` may hold a database client; neither `apps/web`, `packages/domain` logic, nor `packages/contracts` ever may. (The domain package's job store takes an injected query function — it holds no client.)
- **INVARIANT-006:** Session tokens are signed with `TOKEN_SECRET` or a random per-process key — never a committed/hardcoded secret.
- **INVARIANT-007:** Free-tier AI usage always passes `assertWithinAIQuota`; paid inference for free users requires the explicit env policy flag plus human approval.
- **INVARIANT-008:** During `AI_PROHIBITED` assessment sessions, every AI entry point is rejected server-side (`ASSESSMENT_AI_PROHIBITED`).
- **INVARIANT-009:** Migration filenames form a contiguous sequence from `00001`; nothing in the repo claims SQL execution that didn't happen (honesty tests are part of the contract).
- **INVARIANT-010:** Application records move only along `ALLOWED_APPLICATION_TRANSITIONS`; terminal states are immutable.
- **INVARIANT-011:** New infrastructure technology (DB driver, broker, provider SDK, auth provider) enters the system only through a recorded human decision (ADR added to §26).
- **INVARIANT-012:** The durable worker claim loop is the current execution path; the in-process `JobQueueEngine` is reserved and not instantiated at runtime. Do not introduce a second scheduler/queue without an architecture decision.
- **INVARIANT-013:** A core-loop entity changes only through `persist()`; an update passes the read-model value it was derived from as `base`. The read model is never mutated before the database commits.
- **INVARIANT-014:** Every route that loads a record by id authorizes the caller against that record (owner, organization, participant, admin); "authenticated" is never sufficient on its own.
- **INVARIANT-015:** A verification credential (email code, referee token) is never returned to the person it verifies and is stored only as a hash.

**Target mapping (suggested, needs owner confirmation - see L-B11-04):**

| Legacy | Closest target invariant / decision (from `CANONICAL_INVARIANTS.md`) |
|---|---|
| INVARIANT-001 server-side authz on every protected route | INV-T01 |
| INVARIANT-002 one definition per business rule in the domain package | no direct INV-T; BE-01 module rules and INV-T11 (declared state machines) are adjacent |
| INVARIANT-003 domain imports nothing from frameworks/providers; `core.ts` imports nothing; no module imports its own barrel | no INV-T equivalent; see rule 2.1 in `LEGACY_MERGE_ARCHITECTURE_RULES_AND_ADRS.md` |
| INVARIANT-004 one global error envelope with request id | ADR-T08 (problem+json); no INV-T |
| INVARIANT-005 only the API storage layer and worker may hold a database client | no equivalent found (candidate new invariant) |
| INVARIANT-006 session tokens signed with a configured secret or per-process random key, never a committed constant | INV-T14 (secrets), ADR-T06, OPEN-22 |
| INVARIANT-007 free-tier AI usage always passes the quota check | INV-T07 |
| INVARIANT-008 AI prohibited sessions reject every AI entry point server-side | INV-T06 |
| INVARIANT-009 contiguous migration sequence; honesty tests | DB-04 migration policy; no INV-T |
| INVARIANT-010 application records move only along the allowed-transition table; terminal states immutable | INV-T11 |
| INVARIANT-011 new infrastructure technology only through a recorded human decision (ADR) | ADR_REGISTER process; no INV-T |
| INVARIANT-012 durable claim loop is the only execution path; no second scheduler | ADR-T09, INV-T12 |
| INVARIANT-013 core entity changes only through `persist()` with `base`; read model never mutated before commit | INV-T12 (outbox in same transaction) and ADR-T05; the read-model half is not applicable to a SQL-only design |
| INVARIANT-014 every route that loads a record by id authorizes the caller against it | INV-T02 |
| INVARIANT-015 verification credentials never returned to the person verified and stored only as a hash | INV-T05 |

**L-B11-04 (open, owner: Architecture Review Board):** `00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md` is the canonical list and is not edited by this work. Legacy INVARIANT-002, -003, -004, -005, -009 and -011 have no INV-T counterpart; decide whether each becomes a new INV-T, a BE-01 rule, or is retired. INVARIANT-013's read-model clause is retired by ADR-T05.

## 14. Prior-attempt decision register (implemented-architecture namespace)

"These IDs belong to the implemented-architecture register; SSOT has a distinct numbering namespace." Preserved:

| ID      | Decision / status                                                                                                | Reason and trade-off / revisit                                                               |
| ------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ADR-001 | Fastify modular monolith                                                                                         | Shared domain boundaries; split only for measured ownership/scale needs                      |
| ADR-002 | Pure domain business functions                                                                                   | Testability and reuse; preserve framework independence                                       |
| ADR-003 | Memory persistence, superseded for core by ADR-015                                                               | Long tail still loses state; migrate deliberately                                            |
| ADR-004 | Self-issued HMAC sessions                                                                                        | No external IdP; stable secret/revocation required; provider adoption is a security decision |
| ADR-005 | Shared Zod contracts                                                                                             | One request-shape owner; large file can be split without duplicate schemas                   |
| ADR-006 | Central error envelope                                                                                           | Consistent clients/logs; extend mappings deliberately                                        |
| ADR-007 | Local heuristic AI                                                                                               | No external inference cost; remote provider needs explicit approval                          |
| ADR-008 | Early memory queue engine, superseded at runtime                                                                 | Durable claim loop now runs; unused engine retained pending removal decision                 |
| ADR-009 | Early SQL-as-text migration guard, superseded                                                                    | Runner now executes SQL; checksum/honesty controls remain                                    |
| ADR-010 | pnpm, packages before apps                                                                                       | Built workspace dependencies are required; toolchain changes respect build-file protection   |
| ADR-011 | Reticle for visible changes                                                                                      | Real flow verdict required; setup alone is not verification                                  |
| ADR-015 | Core persistence/read model, pending owner ratification | One writer and boot hydration; move reads to SQL before scaling                              |
| ADR-016 | Browser UI quality gates                    | Browser evidence, with its documented coverage limits                                        |

Namespace collision with the SSOT-aligned list is recorded as L-B11-03 in `LEGACY_MERGE_ARCHITECTURE_RULES_AND_ADRS.md`.

## 15. Agent quick reference (prior attempt, preserved as a working rule)

Read the agent rules, SSOT, and relevant requirements/contracts/security/testing rules; locate the existing owner before changing code; trace callers, validation, side effects and tests; preserve architecture and the build-file restriction; report contradictions instead of silently changing policy; do not copy demo fallbacks, do not introduce parallel systems, and do not call documentation implemented.

**Target requires:** the same instruction set belongs in `../29_DEVELOPER_IMPLEMENTATION_GUIDE` for AI-assisted implementation. In particular: "do not copy demo fallbacks" - the prior attempt removed seed data that presented invented people and demand as real (see `../23_MIGRATION_AND_EVOLUTION/LEGACY_MERGE_CONFLICT_REGISTER.md` CF-01..CF-04 and `LEGACY_MERGE_INVENTORY_AND_COVERAGE.md` section 5). This blueprint's hard rule: **no fabricated records presented as real, ever.**
