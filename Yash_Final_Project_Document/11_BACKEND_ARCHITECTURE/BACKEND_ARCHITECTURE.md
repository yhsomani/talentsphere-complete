# Backend Architecture (Target)

Doc ID: BE-01 · Owner: Backend Architecture Team · Version 1.0 · Status: Under Review · Relates: ADR-T04..T09, T11..T15, T20, T21 · DOM-01..24 · INV-T01..T20 · FF-01, FF-02, FF-05, FF-07 · Companions: `12_DATA_AND_DATABASE/*`, `13_API_EVENTS_AND_INTEGRATIONS/*`, `14_SECURITY_PRIVACY_COMPLIANCE/*`

> **Revision 2 folded in (2026-10-27)** from `BACKEND_ARCHITECTURE.md#record-backend-architecture-rev2`: changed sections replaced in place or appended under "Revision 2 additions". Status unchanged; proposals still need ownership ratification.

Tags: **[CONF]** confirmed requirement · **[TARGET]** design decision · **[OPEN]** open assumption · **[REF]** reference-project observation (read-only evidence, not inherited). Numeric values marked **[TARGET]** are starting defaults with stated rationale; none is a measured benchmark. Calibration is tracked as OPEN-B2.

## 1. Scope, reference lessons and design stance

Greenfield backend for a PWA career-evidence platform. The reference project (`ARCHITECTURE.md`, `docs/engineering/DATABASE.md`, `supabase/migrations`) is read for lessons only.

| # | Reference weakness [REF] | Target design response | Where |
|---|---|---|---|
| L1 | In-process `Map` read model hydrated at boot; single writer; stale reads (ADR-T05 rejects it) | Every read/write is SQL; API replicas are stateless | §3, §7 |
| L2 | Job leases not fenced: a slow worker can finish after lease expiry and double-execute | `lease_generation` fencing token checked in every completion/side-effect write | §6 |
| L3 | Bearer token in `localStorage` | httpOnly cookies (`__Host-ts_at`, `__Secure-ts_rt`) via same-origin `/api/v1/auth/*` routes; remotes never see tokens (ADR-T06, INV-T16) | §4, SEC-02 |
| L4 | Assessment "pass" simulated for code challenges | Sandbox runner or `unverified`; never mints verified evidence (ADR-T13) | §14 |
| L5 | Org-role checks inline in handlers | Central `packages/policy`; route registry requires a policy action (FF-01) | §5 |
| L6 | No idempotency keys, no pagination | Idempotency middleware (FF-07); cursor pagination mandatory on list routes | §8, API-STD |
| L7 | Long-tail modules in memory labelled `ephemeral` | No ephemeral modules: a capability is persisted or not shipped | §3 |
| L8 | Reference referee `token` stored plaintext; referee email plaintext | Hash-only tokens (INV-T05); field-level encryption for referee/employer emails | §11, DB-02 |
| L9 | PBKDF2-SHA512 password hashes | Argon2id with lazy rehash on login | MIG-DATA-01 |

## 2. Runtime topology

```mermaid
flowchart LR
  subgraph Browser
    SH[MOD-SHELL host] --- R[Remotes MOD-CAND/LRN/OPP/HIR/MSG/ACC/ADM]
    SW[Service Worker: owner-data read cache only]
  end
  Browser -- "same-origin HTTPS, cookies" --> EDGE[CDN/WAF + static host]
  EDGE --> API["apps/api (Fastify, N stateless replicas)"]
  API --> PG[(PostgreSQL primary)]
  API --> OBJ[(Object store: quarantine + clean prefixes)]
  WRK["apps/worker (N replicas)"] --> PG
  WRK --> OBJ
  WRK --> EXT[Stripe / Brevo / Web Push / AI providers / IdPs]
  WRK -- "signed job spec" --> RUN["apps/runner (sandbox, no egress)"]
  API --> EXT
  EXT -- "signed webhooks" --> API
  PG --- RO[(Read replica: optional, analytics only)]
```

| Deployable | Role | State | Scaling unit |
|---|---|---|---|
| `apps/api` (BMOD per DOM table) | HTTP: BFF cookie routes, REST `/api/v1`, webhook receivers | none (stateless; no in-process read model) | replicas behind LB |
| `apps/worker` (BMOD-WORKER, DOM-24) | Outbox dispatcher, job engine, schedulers, projections | none | replicas; concurrency per job kind |
| `apps/runner` [TARGET] | Isolated code-assessment execution only | ephemeral per run | pool sized by assessment demand |
| `packages/policy` (BMOD-POLICY) | `can()` + capability set; pure | none | library |
| `packages/domain` | Business rules, state machines (SM-*) | none | library |
| `packages/contracts` | Zod schemas -> OpenAPI/AsyncAPI/JSON Schema | none | library |

Postgres is the only required stateful dependency besides the object store (ADR-T05). No Redis/broker at launch (ADR-T09); rate-limit store decision is OPEN-B1 (§16).

## 3. Module layout and public-interface rule

Modules are `api/<name>` for each backend DOM (ID_REGISTRY). A module is a directory with a fixed anatomy:

```
apps/api/src/modules/<name>/
  index.ts            # ONLY public surface: service interface type, factory, event types, error codes
  http/               # routes + Zod request/response binding (adapter layer)
  app/                # use cases: transaction boundary, orchestration, calls policy + domain
  domain/             # re-exports/adapters of packages/domain rules (no I/O)
  data/               # repositories (SQL only); owns this module's tables exclusively
  events/             # producer helpers (outbox) + consumers (inbox-deduped)
  jobs/               # job handlers registered with the worker
  ports/              # interfaces for outbound dependencies (EmailPort, ...)
  adapters/           # concrete implementations of ports
```

**Public-interface rule (FF-02, DOM-00 §2).** (1) Another module may import only `api/<name>/index.ts`. (2) A module never reads or writes another module's tables; cross-module reads go through the owner's service interface; cross-module reactions go through events. (3) The service interface is the unit of future extraction (§18) so it takes and returns plain DTOs (no repository types, no `pg` clients, no request objects). (4) Every public method takes an explicit `Actor` (`{principal, requestId, traceId}`) and an optional `Tx` handle; it never reads ambient request state. (5) `dependency-cruiser` enforces (1)-(2) in CI; a table-ownership manifest (`module -> tables`) is checked by a SQL-parsing lint against repository files.

Module dependency direction (acyclic, enforced by FF-02 plus a cycle check):

```mermaid
flowchart TD
  platform[api/platform] --> identity[api/identity]
  identity --> orgs[api/orgs]
  orgs --> policy[packages/policy]
  privacy[api/privacy] --> policy
  skills[api/skills]
  evidence[api/evidence] --> skills
  evidence --> platform
  verification[api/verification] --> evidence
  assessment[api/assessment] --> evidence
  learning[api/learning] --> evidence
  jobs[api/jobs] --> skills
  applications[api/applications] --> jobs
  applications --> evidence
  applications --> privacy
  search[api/search] -. events .-> jobs
  matching[api/matching] -. events .-> evidence
  billing[api/billing] -. events .-> orgs
  ai[api/ai] --> privacy
  notify[api/notify] -. events .-> applications
```
Solid arrows are synchronous interface calls; dotted are event subscriptions. Where DOM-00 lists a flow in both directions (e.g. evidence <-> verification), the synchronous direction is one-way and the return path is an event (`verification.completed` -> evidence), which keeps the call graph acyclic.

## 4. Layers and request lifecycle

| Layer | Responsibility | May call | Must not |
|---|---|---|---|
| HTTP adapter (`http/`) | Parse + validate (Zod), authenticate, bind policy action, idempotency, ETag, map errors to problem+json | app layer | contain business rules (BR-*), SQL |
| Application service (`app/`) | One use case = one transaction; load resource, call `policy.can`, call domain rules, write state + outbox + audit | domain, repositories, other modules' `index.ts`, ports | open its own pool connection outside the passed `Tx` |
| Domain (`packages/domain`) | Pure rules and state-machine tables (SM-*) | nothing external | do I/O, read clock directly (clock injected) |
| Repository (`data/`) | Parameterised SQL; sets tenant context; optimistic-lock updates | `Tx` | contain authz decisions, call other modules |
| Ports/adapters | Email, push, AI, scan, runner, object store, payments, search | provider SDKs | leak provider types upward (anti-corruption, INT-01) |

```mermaid
sequenceDiagram
  participant C as Client (remote via shell fetch)
  participant H as HTTP adapter
  participant I as Idempotency mw
  participant P as policy.can
  participant A as App service
  participant D as Domain rules
  participant DB as Postgres (tx)
  C->>H: POST /api/v1/... (cookie, CSRF hdr, Idempotency-Key, If-Match)
  H->>H: authn (session cookie), rate limit, Zod validate
  H->>I: reserve (principal,key,request_hash)
  I-->>H: new | replay stored response | 409 in-flight | 422 key reuse
  H->>A: execute(actor, input)
  A->>DB: BEGIN; set_config(app.*) ; load resource FOR UPDATE (if mutating)
  A->>P: can(principal, action, resource)
  P-->>A: Decision{allow|deny, obligations}
  A->>D: apply rule / SM transition
  A->>DB: UPDATE (version check) + INSERT outbox_event + INSERT audit_event
  A->>DB: COMMIT
  A-->>H: result DTO
  H->>I: complete(store status+body hash)
  H-->>C: 2xx + ETag + RateLimit headers
```

Rules: `Tx` is created by the app layer (`withTx(actor, {isolation}, fn)`), which executes `SET LOCAL` of `app.account_id`, `app.org_ids`, `app.platform_roles`, `app.grants_version` (RLS inputs, DB-02 §RLS) and commits only after outbox and audit rows are written (INV-T10, INV-T12). The audit insert is **lock-free**: the repository computes `row_hash` for the row alone and writes a person as the opaque `subject_ref`, never an account id or email; tamper-evidence comes from the off-path `audit.anchor` job (DB-02 §4.1-4.2), and the rows and locks each P0 use case takes are tracked in the write-budget table (DB-02 §17, REVW-06). Reads for list endpoints use the same helper with `READ ONLY`. Errors thrown by domain/app are typed `DomainError(code)`; the adapter maps codes to problem types in the API-STD catalogue; unknown errors become `500 internal` with a `traceId`, never a stack.

## 5. Policy module (`packages/policy`, ADR-T07, INV-T01/T02)

```ts
type Principal = { accountId: string|null; kind: 'user'|'service'|'referee_token'|'anonymous';
                   grants: Grant[]; grantsVersion: number; supportGrantId?: string; amr: string[]; recentAuthAt?: Date };
type Grant = { role: RoleName; scope: {type:'platform'}|{type:'org',id:string}|{type:'institution',id:string}|{type:'self'} };
type Decision = { allow: boolean; reason: ReasonCode; obligations: Obligation[] };
// Obligation: field_mask(fields) | require_consent(scope,{grantee,target}) | require_step_up | audit(level) | time_box(expiresAt)
function can(principal: Principal, action: ActionId, resource: ResourceRef, ctx?: Ctx): Decision
```

| Aspect | Design |
|---|---|
| Action ids | `<module>.<resource>.<verb>` (e.g. `evidence.item.read`, `applications.stage.transition`); registry in `packages/policy/actions.ts` generated from route registry |
| Evaluation | Pure function over (grants, resource attributes incl. owner/org/institution/participants/state, context). Resource attributes are loaded by the module's repository via a `ResourceLoader` bound to the action; policy never queries the DB itself, except through the injected `ConsentPort` for `require_consent` |
| Default | Deny. A missing rule, missing resource, or unknown action denies (INV-T01). Existence disclosure: for resources the principal cannot see, return 404 not 403 (avoid IDOR oracle) unless the principal can see the container |
| Consent | `evidence.item.read` by ROLE-REC/HM/ORGADM returns allow + `require_consent(scope, {grantee, target})` with the scope chosen by the read context, using canonical ids from the Consent Scope Catalogue: inside an application `require_consent('application.share_snapshot', {grantee: {org: orgId}, target: {application: appId}})`; outside one `require_consent('evidence.share_artefact', {grantee: {org: orgId}, target: {evidence: id}})` (search summaries add `search.discoverable` and `evidence.share_summary`; contact details `profile.share_contact`). The app layer resolves the obligation through `privacy` (live scope read from the primary at read time, no consent cache, INV-T15; CSC section 6) and masks if absent |
| Support/admin | Personal-data actions require a live `support_access_grant` (<=4 h, reason-coded, BR-T041); decision carries `audit('privileged')` and `time_box` |
| Capabilities | `GET /me/capabilities` runs `can` over the action catalogue for a scope and returns actions + flags; UI hints only (INV-T01). Cached per `grantsVersion` |
| Grants freshness | Grants are embedded in the access token with `grants_version`; a role change bumps `account.grants_version`, and the API compares the token's version to a cached per-account version (TTL <=15 s [TARGET]); mismatch forces reload from DB. Bounded staleness = min(token TTL 15 min, cache TTL) |
| Testing | The permission matrix (USR-01 §4) is the source for a table-driven test generator (`role x action x resource-relationship`); FF-05 canary suite is generated from the same registry |

Route registration (FF-01, FF-07): `registerRoute({method, path, action, authn, rateClass, idempotent, ifMatch, req, res})`. The CI lint fails when `action` is absent, when an unsafe method lacks `idempotent` (or an explicit `idempotent:'natural'` justification), or when a list route lacks `pagination: 'cursor'`.

## 6. Transactions, outbox and consumers (ADR-T05, T09, INV-T10..T12)

**Transactional outbox.** `withOutbox(tx).emit(event)` inserts into `outbox_event` in the caller's transaction (no dual write). Columns: `id` (UUIDv7 = `event_id`), `aggregate_type`, `aggregate_id`, `aggregate_seq` (per-aggregate monotonic counter maintained by the repository from the aggregate's `version`), `type`, `version`, `tenant jsonb`, `payload jsonb`, `trace_id`, `occurred_at`, `available_at`, `published_at`.

```mermaid
flowchart LR
  UC[Use case tx] -->|INSERT same tx| OB[(outbox_event)]
  OB --> DSP[Dispatcher job: SKIP LOCKED batch]
  DSP -->|per subscriber: enqueue idempotent job evt:consumer, key=event_id| BJ[(background_job)]
  BJ --> W[Worker runs consumer handler]
  W --> IN[(consumer_inbox PK consumer,event_id)]
  W --> UC2[Consumer use case tx: state + own outbox]
```

| Concern | Rule |
|---|---|
| Delivery | At-least-once. Dispatcher selects `published_at IS NULL AND available_at <= now()` with `FOR UPDATE SKIP LOCKED`, enqueues one `evt:<consumer>` job per registered subscriber with `idempotency_key = event_id` (unique with kind), then sets `published_at`. Crash between the two steps re-enqueues harmlessly (unique key) |
| Dedupe | Consumer handler first `INSERT INTO consumer_inbox(consumer,event_id) ON CONFLICT DO NOTHING`; zero rows -> already applied -> ack. Insert and consumer state change share one transaction |
| Ordering | Total order is not promised. Per-aggregate order is best-effort via `aggregate_seq`. Order-sensitive consumers (search index, skill confidence, entitlement projection) keep `last_seq` per aggregate: `seq <= last` skip; `seq > last+1` defer (retry later, bounded) then fall back to rebuilding from the owner's interface. Every projection must be rebuildable from source tables (no projection is a system of record) |
| Poison events | After max attempts the consumer job goes `dead` (§7); the dispatcher does not block other events; alert fires; admin replay (`POST /admin/jobs/{id}/retry`) re-runs the same job (idempotent) |
| Schema evolution | `version` integer per event type; additive changes keep the version; breaking = new version published in parallel for one deprecation window; consumers declare accepted versions (AsyncAPI) |
| Retention | Published outbox rows purged after 14 days [TARGET]; table partitioned monthly (DB-02) so purge is `DROP PARTITION` |

**Isolation per operation** is tabulated in DB-02 §8; the default is `READ COMMITTED` with explicit row locks or unique constraints, escalating to `SERIALIZABLE` (with bounded retry) only where listed.

## 7. Worker and job engine (DOM-24)

### 7.1 Job table contract
`background_job(id, kind, payload, status, priority, run_after, attempts, max_attempts, lease_token, lease_generation, leased_by, lease_expires_at, heartbeat_at, cancel_requested_at, idempotency_key, last_error_class, last_error, dead_at, created_at, updated_at)`; `UNIQUE(kind, idempotency_key)`; status in `queued | claimed | running | retry_wait | succeeded | dead | cancelled` (vocabulary owned by SM-BGJOB in `06_BUSINESS_PROCESSES/STATE_MACHINES.md`; attempt limits and backoff below diverge from SM-BGJOB and are tracked as REVW-19). Attempt history in `background_job_attempt` (partitioned monthly).

### 7.2 Fenced leases (fixes L2)
```mermaid
stateDiagram-v2
  [*] --> queued
  queued --> claimed: claim (generation += 1, lease_token new)
  claimed --> running: handler start
  running --> succeeded: complete WHERE generation = mine
  running --> retry_wait: fail WHERE generation = mine and attempts < max
  running --> dead: fail WHERE generation = mine and attempts >= max
  claimed --> queued: lease expired (reaper) generation unchanged until next claim
  running --> queued: lease expired (reaper) generation unchanged until next claim
  running --> cancelled: cancel_requested and handler honoured abort
  queued --> cancelled: cancel before claim
  retry_wait --> queued: run_after reached
  dead --> queued: admin retry (audited)
```

| Step | SQL/behaviour |
|---|---|
| Claim | `UPDATE background_job SET status='claimed', lease_generation=lease_generation+1, lease_token=$new, leased_by=$w, lease_expires_at=now()+$lease, attempts=attempts+1 WHERE id IN (SELECT id FROM background_job WHERE status IN ('queued','retry_wait') AND run_after<=now() AND kind = ANY($kinds) ORDER BY priority DESC, run_after LIMIT $n FOR UPDATE SKIP LOCKED) RETURNING id, lease_generation, lease_token, payload` |
| Heartbeat | Every lease/3: `UPDATE ... SET lease_expires_at=..., heartbeat_at=now() WHERE id=$id AND lease_generation=$g RETURNING cancel_requested_at`. Zero rows = lease lost: handler's `AbortSignal` fires; the worker stops and discards results |
| Complete/fail | Always `WHERE id=$id AND lease_generation=$g AND status='running'`. Zero rows = a newer claim exists; the stale worker does nothing further |
| Side effects | The fencing token (`job_id`, `lease_generation`) is passed to every handler; external calls use `job_id`-derived idempotency keys (Stripe key, email `idempotencyKey`, push topic) so a zombie worker that already acted is harmless to the new run; DB writes inside the handler carry `WHERE lease_generation = $g` via the shared `fencedTx` helper |
| Reaper | Scheduler job every 30 s [TARGET] returns expired leases to `queued` (no generation change; the next claim increments). Lease length per kind (default 60 s, runner/export 5 min) with heartbeat so long jobs do not expire |
| Liveness | `worker_heartbeat(worker_id, kinds, last_seen)`; `/readyz` of worker fails if no claim loop tick for 3x poll interval |

### 7.3 Retries, backoff, dead letter, cancellation
| Policy | Value [TARGET] | Rationale |
|---|---|---|
| Backoff | `delay = min(cap, base * 2^(attempt-1))` with full jitter (`random(0, delay)`); base 5 s, cap 15 min (`email.send`/`webhook.deliver`: base 60 s, cap 6 h; per-kind table in [REV2 §3.2](BACKEND_ARCHITECTURE.md#record-backend-architecture-rev2)) | Avoids synchronised retry storms against a recovering provider |
| Max attempts | default 8; `email.send`/`webhook.deliver` 12 (about 20.5 h worst case with the 60 s / 6 h values; the 5 s / 15 min defaults would span only about 66 min); `ai.*` 3; `assessment.run` 2; `evt:*` 8 | Provider outages of hours should heal without operator action; AI retries cost money |
| Error classes | `transient` (retry), `permanent` (dead immediately: validation, 4xx except 408/429), `rate_limited` (retry honouring `Retry-After`), `cancelled` | Prevents burning attempts on permanent failures |
| Dead letter | `status='dead'`, `dead_at`, error retained; alert when any dead job of a protected kind (billing, erasure, evidence) exists, or dead count > threshold | Erasure/billing must not silently stall |
| Cancel | `POST /admin/jobs/{id}/cancellation` sets `cancel_requested_at`; queued jobs flip to `cancelled`; running jobs observe it at heartbeat and abort at the next checkpoint; handlers must be idempotent on resume | Operator control without kill -9 |
| Scheduling | `job_schedule(kind, cron, next_run_at, last_run_at)` claimed with the same lease protocol (one runner per tick via unique `(kind, idempotency_key = tick_time)`) | Single execution of cron-like work across replicas |
| Concurrency | Per kind max concurrency + per-tenant fairness key (`payload.tenantKey`) so one org's bulk import cannot starve others | Noisy-neighbour control |

### 7.4 Job kinds (registry; owner module registers handler)
`outbox.dispatch`, `evt:<consumer>`, `email.send`, `push.send`, `file.scan`, `file.derive`, `resume.export`, `search.index`, `ai.embed`, `match.recompute`, `verification.reference_sweep` (BR-T004 expiry/reminders), `assessment.run`, `privacy.export.build`, `privacy.erasure.step`, `billing.reconcile`, `webhook.deliver`, `import.run`, `retention.purge`, `retention.replay_erasure` (restore runbook), `audit.anchor` (single runner per slot, seals Merkle batches; DB-02 §4.2), `audit.anchor_verify` (daily), `analytics.rollup`, `job.reaper`.

## 8. Idempotency middleware (INV-T10, FF-07) — Revision 2 text

| Item | Design |
|---|---|
| Scope (FF-07 reworded) | Every unsafe route (`POST`, `PUT`, `PATCH`, `DELETE`) **either accepts `Idempotency-Key` (client UUIDv4/7, 16 to 64 chars) or declares a natural key** in the route registry: `idempotent: 'natural'` with the key named (for example `PUT /me/saved-jobs/{jobId}`: account + job; a single-use token route: token hash), or `idempotent: 'none'` with a stated reason for credential and token-consuming routes. The route-registry lint fails an unsafe route with none of the three. A natural-key route that also receives the header ignores it for dedupe and does not reject it |
| One key per intent | A user intent has exactly one key, reused on every retry and carried through the outbox when the outbox exists. The shell's `host.api` never generates a fresh key per call when the remote passes none (HC-01: `idempotencyKey?: 'auto'` per call defeats retry safety); it requires a mutation-scoped key or a natural-key route |
| Store | `idempotency_key(principal_id, key, method, route_template, request_hash, state, response_status, response_body_ref, locked_until, created_at, expires_at)`, PK `(principal_id, key)`; anonymous routes scope by `ip_hash`. Physically two daily-partitioned tables by retention class, `idempotency_short` and `idempotency_queued` (DB-02-R2 section 7) |
| Write cost: one row, not two | **DB-only operation (the common case):** inside the use-case transaction, `INSERT ... ON CONFLICT DO NOTHING` the finished row with status and body, together with the business writes. A concurrent duplicate blocks on the unique index until the first commits, then replays the stored response. No `in_progress` row, no completion update. **Operation with external effects:** reserve (`in_progress`, `locked_until = now() + 30 s`) then complete after commit: two writes. Conflict with a different hash or route: `422 idempotency-key-reuse`; conflict with unexpired `in_progress`: `409 idempotency-in-flight` plus `Retry-After`; expired `in_progress` (crash): takeover |
| Body | Stored inline only when 8 KB or smaller [TARGET], column-encrypted for `C2+` classes; larger or binary: status plus resource reference and hash, replay returns a fresh representation (API-STD). Smaller and fewer stored bodies are part of the write budget |
| **Retention (CONST-S12)** | **Class `queued`: 14 days = the outbox TTL (OFF-01 section 8.4)** for every route flagged `queuedOp: true`, because a queued write may flush up to 14 days after the user acted and a server that forgot the key after 24 h would run the write twice. **Class `short`: 24 h** for online-only routes, 7 days for payment-adjacent routes (checkout, portal). A route that cannot hold keys 14 days must declare a natural key and the offline queue must send it. Lint: `queuedOp: true` requires class `queued` or `idempotent: 'natural'` |
| Phase note | Ph1 offline is a read cache plus local unsent drafts, no outbox (REV-RES REVW-24), so no route is `queuedOp` in Ph1; the lint and the `queued` table are created when the outbox activates on the ADR-T10 trigger. Lesson progress is the first queued write (REV-RES REVW-15) |
| Layering | Business uniqueness (BR-T001 one active application) is enforced by the partial unique index, not by the key; the key only makes retries cheap and responses stable |
| Existing contract | 25 unsafe operations of `openapi.yaml` carry no header parameter. APIC-02 section 3.4 classifies each as `natural`, `natural` guarded by `If-Match`, or `none` |

## 9. Concurrency control (ETag / If-Match)

| Item | Design |
|---|---|
| Version | Mutable aggregates carry `version bigint` incremented in the same `UPDATE`. Strong ETag = `"<resourceType>-<id>-<version>"` (opaque to clients) |
| Required | `If-Match` is **required** (428 `precondition-required`) on PATCH/PUT and on state-transition POSTs listed in the catalogue (`m` flag): profile, evidence update, job update, application stage transition, verification decision, pipeline/role changes. Mismatch -> `412 precondition-failed` with the current ETag and a pointer to refetch |
| Write | `UPDATE t SET ..., version=version+1 WHERE id=$1 AND version=$2`; zero rows -> 412 (or 404 if not visible) |
| Hot rows | Application stage transitions additionally `SELECT ... FOR UPDATE` so concurrent recruiters serialise; second request sees new version -> 412 |
| Offline queue | Queued writes (ADR-T10) carry the ETag from when edited; on replay a 412 produces a conflict item the user resolves (INV-T13) |

## 10. Search port (DOM-11, ADR-T11)

```ts
interface SearchPort {
  index(doc: SearchDoc): Promise<void>;                 // idempotent upsert by (kind,id,sourceVersion)
  remove(kind: DocKind, id: string): Promise<void>;
  query(q: SearchQuery, scope: SearchScope): Promise<Page<SearchHit>>; // scope carries tenant + consent epoch
  similar(kind: DocKind, id: string, scope: SearchScope): Promise<Page<SearchHit>>;
}
```
| Aspect | Postgres adapter design |
|---|---|
| Lexical | `tsvector` generated columns (weighted: title A, skills B, body C) + GIN; language config per locale |
| Fuzzy | `pg_trgm` GIN on title/skill names for typo tolerance and autocomplete |
| Semantic | `pgvector` column + HNSW index on embeddings from `ai.embed` jobs (derived data; model version stored; rebuildable) |
| Ranking | Weighted blend of lexical rank, trigram similarity, vector similarity, and evidence-rung factors. **Payment is not an input** (INV-T19): the ranking-input allowlist is a typed constant checked by test |
| Candidate search | `search_candidate_doc` contains only candidates with live `matching.recommend` consent, holds only consented visible fields, and carries `consent_epoch`; on `consent.changed` the doc is removed/updated; query applies tenant + entitlement + consent-epoch filters in SQL (not post-filter) |
| Authorisation | Search returns IDs + safe projections; detail reads re-run `policy.can` (INV-T02). Cursor pagination is keyset on `(rank_bucket, id)` with a signed cursor |
| Replacement | OpenSearch adapter implementable against the same port when the ADR-T11 trigger fires (p95 > 400 ms at target corpus or relevance gap). Dual-write via the same events during cutover |

## 11. Ports for email and push (DOM-15, ADR-T20)

| Port | Interface | Adapters | Rules |
|---|---|---|---|
| `EmailPort` | `send({templateId, to, vars, locale, idempotencyKey, category, headers})` -> `{providerMessageId}`; `parseWebhook(req)` | `BrevoAdapter` (default), `DevOutboxAdapter` (dev: labelled outbox table, never sends) | Called only from `email.send` jobs. Templates stored by id + version in repo. Category `transactional` vs `marketing` (marketing requires `comms.marketing_email` consent and one-click unsubscribe, RFC 8058 headers). Suppression list checked before send. Bounce/complaint webhooks (signature-verified) -> `email_suppression` + `email.bounced` event. No secrets/tokens in logs; one-time links carry only the opaque token (hashed at rest, INV-T05) |
| `PushPort` | `send(subscription, payload, {ttl, urgency, topic})`; `generateVapidKeys` out-of-band | `WebPushAdapter` (VAPID, payload encryption per RFC 8291) | Payload is generic ("You have an update") plus deep-link id; sensitive text is fetched after authenticated open. HTTP 404/410 -> delete subscription; 429/5xx -> retry with backoff and `TTL`. Push is opt-in (permission prompt after a user gesture) and capability-detected (FF-09) |

## 12. File upload pipeline (BR-T003, INV-T14)

```mermaid
stateDiagram-v2
  [*] --> intent: POST /files/upload-intents (type, size, sha256 declared)
  intent --> uploaded: client PUT to presigned URL (quarantine prefix)
  uploaded --> verifying: POST completion (server HEAD: size, checksum)
  verifying --> rejected: size/hash mismatch, type not allowlisted, magic-byte mismatch
  verifying --> scanning: file.scan job
  scanning --> clean: AV clean + (image: re-encode; pdf: structure check)
  scanning --> infected: AV positive
  clean --> deleted: owner removal / erasure
  infected --> deleted: purge after retention
```
| Control | Design |
|---|---|
| Intent | Authenticated; purpose-specific allowlist and size cap (e.g. evidence artifact: pdf/png/jpeg/webp/txt/md up to 25 MB [TARGET]; avatar: image up to 5 MB); per-user pending-intent and daily-bytes quotas; random object key `q/<fileId>`; presigned `PUT` with `Content-Length-Range`, content-type, checksum header, expiry 10 min |
| Quarantine | Objects are written to a quarantine prefix that no read path serves; file row state `uploaded`. Evidence artifacts attached to evidence are `pending` and not shown to anyone but the owner (as "scanning") until `clean` |
| Sniffing | Server reads the first bytes (magic numbers) and compares to declared type and allowlist; never trusts extension/`Content-Type`. Archives (zip), executables, SVG, HTML are not allowlisted at launch (script/zip-bomb risk). SVG avatars are rasterised or refused |
| Scan | `ScanPort` (ClamAV-class engine behind a port; vendor OPEN-B3). **Fail-closed**: scanner unavailable -> file stays `scanning`, never visible; backlog alert |
| Sanitise | Images re-encoded (strips EXIF/GPS and polyglot payloads) producing derivative sizes; PDFs structurally validated and flagged if they contain embedded JavaScript/launch actions (rejected at launch) |
| Promote | On clean, copy to the `clean` prefix and flip state; emit `file.scanned` (consumers: evidence/profile/learning) |
| Download | `GET .../download-url` runs `policy.can` then returns a signed URL (<=5 min [TARGET]); served from a separate cookieless user-content origin with `Content-Disposition: attachment` for non-images, `X-Content-Type-Options: nosniff`, restrictive CSP `sandbox`; never from the app origin |
| Erasure | `deleted` state triggers object delete + CDN purge; backups per DB-03 §deletion |
| Resume exports | Generated by `resume.export`, stored as private files with 24 h link validity |

## 13. AI gateway (DOM-17, ADR-T12, INV-T06..T09)

```mermaid
flowchart TD
  REQ[AiGateway.complete purpose,principal,subject,refs] --> P{policy.can ai.suggestion.create}
  P -- deny --> D1[403]
  P -- allow --> M{Active attempt with ai_mode AI_PROHIBITED for subject?}
  M -- yes --> D2[403 ai-prohibited INV-T06 - any caller incl. worker/service]
  M -- no --> C{Consent ai.assist.process live?}
  C -- no --> D3[403 consent-required]
  C -- yes --> B{Budget + entitlement reserve INV-T07}
  B -- insufficient/free tier not allowed --> D4[402 entitlement-required or 429 budget]
  B -- reserved --> R[Redact + minimise context]
  R --> X[Provider call: timeout, breaker]
  X --> V[Validate output vs schema; strip links/markup; injection checks]
  V --> L[(ai_request log: hashes, tokens, cost)]
  L --> S[(ai_suggestion status=proposed)]
  S --> H{Human disposition: accept / edit / reject}
```
| Control | Design |
|---|---|
| Single door | Only `api/ai` imports provider SDKs (FF-02 lint: provider packages restricted to `api/ai/adapters`). Other modules call `ai.complete()` through its `index.ts` |
| Prohibited mode | Before any call the gateway queries `assessment` interface `getActiveAiMode(accountId)`; if an in-progress attempt has `AI_PROHIBITED` (or `AI_RESTRICTED` and purpose not whitelisted) the call is denied **inside the gateway**, regardless of caller, route or role; denial is audited. The attempt's `ai_mode` is snapshotted at start so later edits to the assessment cannot weaken it |
| Budgets (INV-T07) | `ai_budget(scope, scope_key, period, limit_micros, allow_free_inference, hard_stop)`; scopes global > plan > org > account (strictest wins). Reserve-then-settle: `ai_spend.reserved_micros` incremented atomically (`UPDATE ... WHERE spent+reserved+$est <= limit`); settle with actual tokens; release on failure. Free tier: allowed only when the effective policy has `allow_free_inference=true`, and then capped per day. Cost per purpose estimated from max tokens |
| Redaction | Purpose-specific context builders send only allowlisted fields; deterministic redactor replaces emails, phone numbers, government-ID patterns, URLs with tokens, and names of third parties (referees) with placeholders; secrets/tokens, private messages, referee responses and assessment answer keys are never eligible context. Redaction summary (counts only) logged |
| Prompt injection | User/content text is passed only as quoted data in a delimited block; system prompt states it is untrusted; model has **no tools with side effects** in v1; output is schema-validated (JSON mode/Zod), length-capped, stripped of links/HTML, and rendered as text. Output cannot trigger any state transition (INV-T09) |
| Human gate | Result is an `ai_suggestion` in `proposed`; adoption into profile/cover note requires the user to accept or edit (disposition recorded). Evidence creation rejects `source='ai'` (CHECK constraint + schema, INV-T08); AI "memory" features, if ever added, are stored outside evidence/profile tables and are user-viewable/deletable |
| Logging | `ai_request` stores purpose, model, token counts, cost, prompt SHA-256, redaction counts, denial reason, latency; **no raw prompts/outputs** by default (short-lived encrypted debug capture behind an admin flag, 7 days [OPEN-B4]) |
| Embeddings | `ai.embed` jobs go through the same gateway (purpose `embedding`), with consent `matching.recommend` for candidate data; derived vectors are deleted on consent revoke/erasure |
| Failure | Provider failure degrades only the AI feature; core flows never depend on AI. No automatic failover to a second provider at launch (data-processing agreements differ; OPEN-B5) |

## 14. Sandbox assessment runner (ADR-T13)

| Item | Design |
|---|---|
| Position | Separate deployable `apps/runner`, not in the API/worker process or network zone. Worker is the only caller (`assessment.run` job) through `RunnerPort` using mutually authenticated, signed run requests |
| Isolation | One ephemeral sandbox per run (microVM or user-space-kernel container class; technology selection OPEN-B6): read-only root filesystem, **no network egress**, no secrets mounted, non-root, cgroup limits (CPU, memory, pids, disk), wall-clock timeout, output size cap, no host mounts. Candidate code and hidden tests are mounted separately; hidden tests and answer keys are never exposed in output |
| Protocol | Request = `{runId, attemptId, assessmentVersion, artifactRef(hash), limits}`; runner fetches artifact by signed URL, runs, returns `{runId, status, results, durationMs, imageDigest}` signed with a per-deployment key. Worker verifies signature, run-to-attempt binding, and idempotency (`runId` unique) before recording |
| Verification basis | `attempt.verification_basis` in {`auto_graded_objective`, `runner_verified`, `human_graded`, `unverified`}. Code/project assessments with `requires_runner=true` may reach `passed` **only** with `runner_verified` (or `human_graded` by an authorised human). Otherwise the attempt ends `unverified`, `assessment.passed` is **not** emitted, and no evidence is minted (ADR-T13, INV-T04) |
| Feature gate | `assessment.runner.enabled` flag (default off) and a startup check: if the flag is on but runner health/attestation fails, code assessments are not offered |
| Abuse | Per-user and per-tenant run quotas; no outbound network prevents exfiltration and crypto-mining payoff; wall-clock caps; runs are not retained beyond results + hashes (30 days) |
| Integrity | Integrity signals (tab blur, paste, timing) are advisory; they open an `integrity_flag` for human review and never void or fail an attempt automatically (INV-T20) |

## 15. Media

| Asset | Pipeline |
|---|---|
| Avatars/images | Upload pipeline (§12) -> `file.derive` produces re-encoded WebP/AVIF/JPEG derivatives at fixed sizes with cache-busting hashes; served from the user-content origin via CDN |
| Resume/portfolio exports | `resume.export` job renders from structured data (HTML->PDF in an isolated render context, no network), private file, link TTL 24 h |
| Course video/audio | Provider-hosted streaming/transcoding behind a `MediaPort` [OPEN-B7: provider]; the app stores references, captions (WCAG) and signed playback tokens; no self-hosted transcoding at launch |
| Documents | No server-side Office conversion at launch (attack surface); PDFs only |

## 16. Rate limiting (INV-T10 abuse controls) — Revision 2 text

| Layer | Design |
|---|---|
| Edge first | CDN/WAF is the first limiter and the only protection for origin capacity: per-IP and per-ASN limits, bot challenge and managed rules on all auth routes (`RL-AUTH`, `RL-TOKEN`) and on `RL-PUBLIC`/`RL-WEBHOOK` paths; provider OPEN-B47. The application never relies on the edge for per-account protection |
| App: local buckets | `RL-READ`, `RL-WRITE`, `RL-PUBLIC`, `RL-HEAVY`: in-process token bucket per replica keyed by `(rateClass, key)`. **No database write per request.** Configured per-replica limit = cluster limit ÷ replica count; worst-case cluster burst is replicas × per-replica limit and is accepted for these classes. Cost control for expensive features is business budgets (entitlement counters in `billing`, AI budget ledger), not these buckets |
| App: durable counters | Only where exactness matters: login, password reset, email-challenge and token-consume routes (`RL-AUTH`, `RL-TOKEN`; per-account and per-IP+account counters with progressive delay) and the per-recipient caps on third-party mail (BR-T004, BR-T121). Store: `RateLimitStore` port; default adapter a **logged** table `auth_throttle`. The UNLOGGED `rate_limit_bucket` of v1.0 is removed: an unlogged table is truncated by crash recovery and is not replicated, so a failover reset login throttles |
| Redis trigger (earlier) | Introduce the Redis adapter when **any** holds: `auth_throttle` writes exceed 5% of primary write IOPS, or limit-check p95 exceeds 5 ms; a credential-stuffing incident of Sev-2 or higher; before production runs three or more API replicas. The v1.0 trigger (20% of IOPS, all buckets) fired too late and covered the wrong tables |
| Signalling | `RateLimit-Policy`, `RateLimit` and `Retry-After` on 429; limits are configuration |
| Write cost | Ordinary requests: 0 rows. Auth-class requests: 1 `auth_throttle` upsert, on those routes only |

OPEN-B1 is restated: durable counter store, logged Postgres table versus Redis, with the trigger above.

## 17. Configuration and secrets (INV-T14)

| Item | Design |
|---|---|
| Schema | A single Zod `AppConfig` per deployable; validated at boot; missing/invalid -> process exits (fail fast). Typed accessors only (no `process.env` reads elsewhere, lint-enforced) |
| Sources | Environment variables for non-secrets; secret manager (or platform secret store) injected as env at runtime for secrets; no secrets in repo, images, or client bundle (build-time scan, INV-T14) |
| Separation | Distinct DB roles: `ts_migrator` (DDL, owner), `ts_app` (DML; no BYPASSRLS), `ts_worker` (DML on job/outbox + module tables via grants), `ts_readonly` (analytics). Distinct object-store credentials for quarantine write vs clean read |
| Client config | A minimal public config object (API base, feature flag snapshot, VAPID public key, manifest URL); never secrets |
| Flags | Runtime feature flags in `feature_flag` (DOM-20) cached per replica (TTL 30 s [TARGET]); flags gate rollout, never security controls (a security check cannot be disabled by flag except `assessment.runner.enabled` which fails closed) |
| Rotation | Secrets referenced by name+version; dual-key acceptance windows for HMAC/JWT signing keys, webhook secrets, VAPID, field-encryption KEKs (SEC-02) |

## 18. Extraction triggers and service-boundary decisions (ADR-T04)

| Component | Decision [TARGET] | Reason | Extraction / change trigger |
|---|---|---|---|
| All `api/<name>` modules | One deployable `apps/api`, enforced module boundaries | Transactional consistency, team size, ops cost | Module needs independent scaling/SLA, distinct residency, or team contention (ADR-T04) |
| Worker / job engine | Separate process, same repo and DB | Isolates background load from request latency; independent scaling | n/a |
| Sandbox runner | **Separate service from day one when enabled** | Executes untrusted code; network and trust isolation are non-negotiable | n/a |
| AI gateway | Module in monolith; provider calls from API (interactive) or worker (batch) | Needs transactional budget ledger and consent/assessment lookups | Provider latency starving API pool, or regulated-data processor split -> dedicated service |
| Search | Module + Postgres adapter behind `SearchPort` | ADR-T11 | p95 search > 400 ms at target corpus or proven relevance gap -> OpenSearch adapter |
| Matching compute | Worker jobs (`match.recompute`) | Batch/derived, rebuildable | Compute cost/latency requires GPU/vector service |
| Media derivation | Worker jobs | CPU-bound, async | Sustained queue age > SLO -> dedicated media workers (still same code) |
| Notifications/email | Module + worker | Port-isolated | Volume or deliverability needs dedicated pipeline |
| Billing | Module; Stripe webhook receiver in API | Entitlement derivation needs org/identity data | Compliance scope isolation (PCI-adjacent) needs separate deployable |
| Event transport | Outbox -> Postgres-backed jobs (ADR-T09) | Single store, no broker ops | Outbox throughput exceeds Postgres budget, or a service is extracted -> NATS/Kafka adapter behind the dispatcher |
| Analytics | Consent-gated event table + rollup jobs; optional read replica | Minimal footprint | Event volume warrants columnar store |

## 19. Failure, timeout and circuit-breaker policy

Defaults are **[TARGET]** starting values chosen from the interactive-vs-background distinction (interactive paths must fail fast and degrade; background paths may wait and retry), not from benchmarks; calibration under load test is OPEN-B2. A breaker is per dependency per process: *open* when >=5 consecutive failures or >=50% failures over a 30 s window with >=10 calls; *half-open* after 30 s, admitting 3 probes; state exported as a metric.

| Dependency | Connect / total timeout | Retry | Breaker | Behaviour on failure (user-visible) |
|---|---|---|---|---|
| PostgreSQL (API) | pool acquire 2 s; `statement_timeout` 5 s; `idle_in_transaction_session_timeout` 10 s | none in request (except serialization failures: 3 tries) | n/a (pool saturation -> 503 + `Retry-After`) | 503 `upstream-unavailable`; reads of cached owner data continue in PWA read cache (stale label, INV-T13) |
| PostgreSQL (worker) | `statement_timeout` 60 s | per job policy | n/a | jobs retry with backoff |
| Object store | connect 2 s / total 10 s (signing is local) | 2 retries on 5xx/timeouts with jitter | yes | upload start 503; downloads 503 with retry hint; no partial state (state advances only after HEAD verify) |
| Stripe (outbound API) | 3 s / 10 s | up to 2 retries with the same Stripe idempotency key | yes | checkout creation fails with 503 and message; **entitlements never change on outbound failure or redirect** (INV-T17) |
| Stripe (inbound webhook) | respond < 5 s: verify signature, insert `stripe_event_inbox`, enqueue, return 200 | Stripe retries delivery; our processing job retries 8x | n/a | If processing is delayed, plan state is stale until reconcile job (`billing.reconcile`, periodic) heals it |
| Email provider | 3 s / 10 s inside `email.send` job | 12 attempts over ~20.5 h (60 s base, 6 h cap) | yes (pauses sending, queue grows) | Transactional mail delayed; in-app notification still delivered; user can resend verification (rate-limited) |
| Web Push services | 3 s / 5 s | 404/410 delete; 429/5xx retry (<= 4, TTL-bounded) | per-endpoint-host | No push; in-app notification unaffected |
| AI provider | 3 s / 30 s | 1 retry on 5xx/timeout (not on 4xx) | yes | Feature banner "assistant unavailable"; budget reservation released; core flows unaffected |
| Virus scanner | 5 s / 60 s per file (size-scaled) | 5 attempts | yes | **Fail-closed**: file remains "scanning"; nothing becomes visible |
| Sandbox runner | 3 s / assessment limit + 30 s | 2 attempts (new `runId`, same attempt) | yes | Attempt shown "awaiting verification"; ends `unverified` if runner is down beyond SLA; never auto-pass |
| OIDC/SAML IdP | 3 s / 8 s | none | per-IdP | SSO login error; password/passkey fallback only if org policy allows |
| Breached-password API | 1 s | none | n/a | **Fail-open** (log), because blocking registration on a third party is worse than the marginal risk |
| Outbound customer webhooks | 3 s / 5 s; SSRF-guarded resolver | 12 attempts / ~20.5 h, then endpoint auto-paused after sustained failure | per-endpoint | Customer sees delivery log; no impact on core flows |
| Import sources (URL/file) | 3 s / 15 s; size cap | 3 | per-host | Import job fails with report; no partial publish |

Cross-cutting: every outbound call has a timeout and an `AbortSignal`; no unbounded queues in memory; bulkheads via separate pools/concurrency per dependency; graceful shutdown drains in-flight requests and stops claiming jobs; each request has a deadline propagated to calls (`min(request deadline, dependency timeout)`).

## 20. Observability hooks (ADR-T16)
W3C `traceparent` accepted from shell fetch, stored on `outbox_event.trace_id` and `background_job.payload.trace`, and restored by the worker so a trace spans request -> event -> consumer. Pino JSON logs with redaction paths (`*.password`, `*.token`, `*.email` hashed, cookies, `authorization`) enforced by a log test (INV-T14). Metrics: queue age per kind, lease-lost count, outbox lag, dead jobs, breaker state, policy denials by action, idempotency replays.

## 21. Extraction/processing triggers for derived data
| Trigger (event or schedule) | Effect | Idempotency basis |
|---|---|---|
| `evidence.verified/revoked/updated` | recompute `competency` confidence; invalidate `match_explanation`; reindex candidate doc (BR-T005, async + audited) | `(evidenceId, aggregate_seq)` |
| `profile.updated`, `consent.changed` | reindex or remove candidate doc | `(accountId, consent_epoch)` |
| `job.published/updated/closed` | reindex job doc; fan out saved-search alerts | `(jobId, version)` |
| `skill.merged` | remap `evidence_skill`, `job_skill_requirement`, `competency` | `(fromSkillId, intoSkillId)` |
| nightly schedule | `verification.reference_sweep` (expire at 14 d, send <=2 reminders), `retention.purge`, `billing.reconcile`, `analytics.rollup` | tick time |

## 22. Contradictions, assumptions and open items
**Contradictions / gaps found against canonical docs** (none silently resolved): (1) ADR-T04..T22 mention T22 (matching) though the brief enumerated T04..T21; this doc treats T22 as binding. (2) ID_REGISTRY lists `MASTER_INDEX.md` and `99_FINAL_MASTER_BLUEPRINT` as authority, but neither exists yet; this doc is linked from the folder index in `11_BACKEND_ARCHITECTURE` only until MASTER_INDEX is created. (3) resolved (REVW-03): SM-00 (`06_BUSINESS_PROCESSES/STATE_MACHINES.md`) is the single state vocabulary and `12_*`/`13_*` derive from it (FF-11); the job-engine limits in §7 still differ from SM-BGJOB (REVW-19). (4) DOM-00 §2 says "no module reads another module's tables" while DOM-11 search/matching "consume" job/evidence data; resolved here as event-fed projections owned by `api/search`/`api/matching` (no cross-table reads).

| ID | Open item |
|---|---|
| OPEN-B1 | Rate-limit store: Postgres unlogged vs Redis (trigger in §16) |
| OPEN-B2 | Calibrate all timeouts, breaker thresholds, lease lengths, rate limits by load test |
| OPEN-B3 | Virus-scan engine/vendor |
| OPEN-B4 | Whether to keep any raw AI prompt capture (debug) and its retention |
| OPEN-B5 | Multi-provider AI failover (DPA implications) |
| OPEN-B6 | Sandbox isolation technology |
| OPEN-B7 | Course video/transcoding provider |
| OPEN-B8 | Breached-password check adoption |
| OPEN-B9 | PostgreSQL major version (native `uuidv7()` needs PG 18+; otherwise app-generated) |

(Proposed OPEN ids; to be registered in the central OPEN register by the Documentation Architect.)

# Revision 2 additions (folded 2026-10-27)

Sections below override same-topic text above (module graph, job engine backoff, consumer modes, consent, telemetry, SQL transition rules).

## 1. Consumers without a job per subscriber (REVW-06 remainder)

Problem: one outbox event fanned out to one `background_job` row per subscriber (BE-01 section 6), so every business write caused 1 + N further writes, plus one idempotency row per unsafe request and one rate-limit row per request. ADR-T05 claims horizontal API replicas without a single writer; the write path has to match that claim.

### 1.1 Consumer modes

Each consumer registers a mode in the consumer registry (`events/` directory of the owner module). The mode is a property of the consumer, never of the event.

| Mode | For | Runs | Rows written on success | On failure |
|---|---|---|---|---|
| `inline` (default) | Cheap, DB-only reactions that finish well under 50 ms: in-app notification rows, analytics counters, search-document removal on `consent.changed`, cache invalidation, delivery-row creation for `notify` | Directly in the dispatcher process, in its own transaction (inbox insert plus the state change), 2 s timeout | the consumer's own state rows and one `consumer_inbox` row; **no `background_job` row** | one `evt:<consumer>` job for that single (event, consumer) pair, `idempotency_key = event_id`; it then follows section 3.3 |
| `job` | Anything that calls a provider, the AI gateway or the object store; anything slow; anything needing its own retry budget: `email.send`, `push.send`, `webhook.deliver`, `search.index` (with embeddings), `match.recompute`, `privacy.erasure.step`, `billing.reconcile` | A worker job | one job row per event, or one per burst when coalesced (below) | job retry policy |

Coalescing: projection consumers that rebuild from the owner's interface (search documents, match explanations, skill confidence) enqueue **at most one queued job per `(consumer, aggregate_id)`**. A burst of events on one aggregate updates `payload.upto_seq` of the queued job instead of adding rows (partial unique index on `(kind, idempotency_key)` where `status = 'queued'`, key `consumer:aggregate_id`). Non-mergeable consumers (billing, privacy steps, outbound webhooks) get one job per event.

Net effect on the write budget (DB-02-R2 section 17): the happy path of an inline consumer adds an inbox row and its own state, never a job row; job-mode projections add at most one job row per aggregate burst.

### 1.2 LISTEN/NOTIFY

The finding allows `LISTEN/NOTIFY` or direct handlers. Decision: **direct handlers (section 1.1) are the mechanism; `LISTEN/NOTIFY` is not used on the request path.** PostgreSQL serialises the commit of transactions that issued `NOTIFY` behind a database-wide lock **[verify under WP-LOADBASE]**, which would re-create the single commit point that DB-02 section 4.2 removed. The dispatcher polls `outbox_event` with an adaptive interval (250 ms under load, backing off to 2 s idle). An optional wake-up `NOTIFY` may be sent by the dispatcher tick itself, never by a business transaction; it carries no data and nothing depends on it. `LISTEN` needs a session connection, so the dispatcher uses one dedicated non-pooled connection, outside the transaction-mode pooler (DB-02 section 14).

## 2. Module dependency graph (REVW-42)

BE-01 section 3 drew 17 of 24 backend modules and omitted edges that sections 10 and 13 require (`ai` to `assessment` for `getActiveAiMode`; every module that returns consent-guarded data to `privacy`). The cycle check (FF-02) cannot be trusted on an incomplete graph. This table is the **declared baseline** for all backend modules plus `packages/policy`. The deferred networking module (`api/network`, DOM-14, Ph4) is omitted until Ph4 (REVW-34).

"May import" is a synchronous call through the target's `index.ts` only. "Subscribes to" lists event subscriptions: they are not imports and cannot form an import cycle.

| Module | May import (sync, `index.ts` only) | Subscribes to (events) |
|---|---|---|
| `platform` | `identity` | - |
| `identity` | `orgs` | - |
| `orgs` | `policy` | - |
| `policy` | - | - |
| `privacy` | `policy` | - |
| `skills` | - | - |
| `profile` | `skills`, `platform`, `privacy`, `evidence`, `ai` | - |
| `evidence` | `skills`, `platform`, `privacy` | `assessment`, `learning`, `verification` |
| `verification` | `evidence`, `identity` | `evidence` |
| `assessment` | `skills` | - |
| `learning` | `assessment`, `billing`, `ai`, `skills` | - |
| `jobs` | `skills`, `orgs`, `billing`, `privacy` | `orgs`, `billing` |
| `applications` | `jobs`, `evidence`, `privacy`, `orgs`, `ai` | `jobs`, `evidence` |
| `search` | `ai`, `privacy` | `jobs`, `evidence`, `profile`, `privacy`, `billing`, `skills` |
| `matching` | `ai`, `privacy` | `evidence`, `jobs`, `profile`, `privacy`, `skills` |
| `careerintel` | `evidence`, `skills`, `privacy`, `ai` | - |
| `messaging` | `applications`, `orgs`, `privacy` | `applications` |
| `notify` | `identity`, `orgs`, `privacy` | all domain events |
| `billing` | `orgs` | `orgs` |
| `ai` | `privacy`, `assessment`, `billing`, `policy` | - |
| `institutions` | `evidence`, `learning`, `assessment`, `privacy`, `orgs` | - |
| `safety` | `jobs`, `evidence`, `identity`, `messaging`, `profile` | `profile`, `messaging`, `jobs` |
| `admin` | `identity`, `orgs`, `platform`, `privacy`, `policy` | - |
| `analytics` | `privacy` | `applications`, `jobs`, `evidence` |
| `integrations` | `orgs`, `jobs` | `jobs`, `applications`, `evidence` |

Check run on this baseline (Tarjan strongly-connected-components over the 25 nodes, from a script kept outside the repository): 25 nodes, no strongly connected component, no self-import, every module named in ID_REGISTRY appears.

Design rules behind the edges:

1. **Consent.** Any module that returns data under a `require_consent` obligation imports `privacy`; `privacy` imports only `policy`, which defines `ConsentPort`. Search and matching filter at query time through the privacy-owned published view `pv_consent_current` (section 6), which is the only cross-module read the table-ownership lint allows.
2. **Erasure and export.** `privacy` does not call every module (that would put it at the root of a cycle). Each module registers an `ErasureParticipant` and an `ExportParticipant` at the composition root, using port types exported by `privacy`; `privacy.erasure.step` jobs invoke the registered participants.
3. **`notify` is a leaf.** Nobody imports it. Producers emit notification-bearing events (transactional mail for identity, verification, applications), and `notify` resolves contact data through `identity`.
4. **Assessment and learning publish, evidence consumes.** `assessment.passed` and `course.completed` reach `evidence` as events (DOM-00 section 3, SM-00 cross-machine table); BE-01 v1.0 drew `assessment` and `learning` as importing `evidence`, which duplicated the event path.
5. **`ai` is the single door** (FF-02 lint restricts provider SDKs to `api/ai/adapters`). `ai` calls `assessment.getActiveAiMode` (INV-T06) and `billing` for budget and entitlement reserve (INV-T07). Callers of AI features import `ai`.
6. **Two-way flows** (evidence and verification): the synchronous direction is one-way, the return path is an event.

**The table must be generated, not maintained by hand (FF-02 amendment).** CI builds the real graph from imports (`dependency-cruiser --output-type json`), renders the diagram into the docs build, and fails when (a) an actual edge is absent from this baseline, (b) the import graph has a cycle, or (c) a module is missing from the table. A pull request that adds an edge edits this table in the same change. Once the generator exists, this table is replaced by its output.

## 3. Job engine (REVW-19)

### 3.1 Authority and consistency

BE-01 section 7 stays the authority for the job engine, and `STATE_MACHINES.md#record-state-machines-rev2` section 2.8 already mirrors it (state set `queued, claimed, running, retry_wait, succeeded, dead, cancelled`; `retry_wait → dead` removed; `running → cancelled` added). Consistency points confirmed here:

| Point | Rule |
|---|---|
| State set | Equal in SM-BGJOB (SM-00-R2), `background_job.status` CHECK (DB-01) and the `Operation`/`ExportJob` state enums of the OpenAPI addendum; FF-11 compares them |
| Attempts | Every claim, including a re-claim after lease expiry, increments `attempts`; `dead` is reached only from `running` when `attempts >= max_attempts` or the error class is `permanent` |
| Cancel | `cancel_requested_at` set; queued and `retry_wait` jobs go to `cancelled` at once; a `running` job reaches `cancelled` only when the handler honours the abort at its next checkpoint |

### 3.2 Backoff and attempt policy (corrects the "spans about 24 h" claim)

SM-00-R2 flagged an open arithmetic problem for the backend owner: with base 5 s and cap 15 min, 12 attempts do not span about 24 h. Confirmed and corrected here. Worst-case span is the sum of the waits between attempts with no jitter (full jitter halves the expected wait).

| Kind | Max attempts | Base | Cap | Worst-case span (no jitter) | Why |
|---|---|---|---|---|---|
| default (`evt:*` fallback jobs, `search.index`, `file.*`, others) | 8 | 5 s | 15 min | 5+10+20+40+80+160+320 s = 635 s, **about 11 min** | Internal work; an outage longer than this ends in `dead`, an alert and audited replay |
| `email.send`, `webhook.deliver` | 12 | **60 s** | **6 h** | 60 s doubling to 15,360 s, then 21,600 s twice = 73,860 s, **about 20.5 h** | Provider outages of hours should heal without an operator; this matches the ~24 h delivery expectation of the original text. The old values (5 s, 15 min) give 3,975 s, **about 66 min**, as SM-00-R2 computed |
| `push.send` | 4 | 60 s | 15 min | 60+120+240 s = 420 s | TTL-bounded; a late push is useless |
| `ai.*` | 3 | 5 s | 15 min | 15 s | Retries cost money |
| `assessment.run` | 2 | 5 s | 15 min | 5 s | A new `runId` per attempt (section 19) |

Per-kind overrides are configuration (`jobKinds.<kind>.{maxAttempts, baseMs, capMs}`), validated at boot. Formula unchanged: `delay = min(cap, base × 2^(attempt−1))` with full jitter `random(0, delay)`; error classes `transient`, `permanent`, `rate_limited` (honours `Retry-After`) and `cancelled` as in BE-01 section 7.3. **Amendment for SM-00-R2:** its t4 and t7 rows state the default numbers; they should add "per-kind overrides in BE-01-R2 section 3.2".

### 3.3 SM-NOTIFY retry is the job retry

There is **one** retry layer for a delivery, not two. The `notify` consumer creates the delivery row (notification × channel) inline; the `email.send` or `push.send` job it enqueues is the only retry mechanism. Mapping:

| Job (SM-BGJOB) | Delivery row (SM-NOTIFY) |
|---|---|
| `queued`, `claimed`, `running` | `sending` |
| `retry_wait` (SM-BGJOB t4) | `failed_retry` (SM-NOTIFY t6) |
| `dead`, or error class `permanent` (4xx except 408 and 429) | `failed` (SM-NOTIFY t8) |
| `succeeded` | `sent`, then `delivered` or `bounced`/`complained` by provider webhook |
| delivery TTL passed (SM-NOTIFY t10: 72 h time-sensitive, 7 d others) | `expired`; the job is cancelled |

SM-00-R2 section 2.7 already states this; this section adds the table and the TTL link, so that email's 12 attempts and the 72 h time-sensitive TTL cannot disagree: the job span of about 20.5 h is shorter than the shortest delivery TTL.

### 3.4 One name for the 409 state error

SM-00 U2 and several acceptance criteria say `409 invalid_transition`; API-STD section 5 and every OpenAPI response say `state-transition-invalid`. **Canonical: `state-transition-invalid`** (kebab-case, like every other problem type; problem `type` URI `/problems/state-transition-invalid`). SM-00 U2, SPEC-G2 AC-05-05-05 and SPEC-G4 AC-10-05-03 and AC-10-05-04 should adopt it. For the same reason SM-00-R2's `409 reapply_cooldown` becomes `409 reapply-cooldown-active`. API-STD gains that one row (APIC-02 section 3.3).

## 6. Consent: authorization at read time, no cache everywhere (REVW-25, CONST-S13)

Decision (REV-RES, CONST-S13): **a revocation takes effect at the first read after the revoking commit; there is no consent cache.** The four formulations in earlier text (instantly, within 1 minute, within a cache TTL, next API read) collapse into this one.

| Place | Rule |
|---|---|
| Policy (BE-01 section 5) | `require_consent` is resolved by `privacy` against the primary at read time (INV-T15). The `grantsVersion` cache covers **roles and capabilities only**; capabilities are UI hints (INV-T01) |
| Search and matching | The consent predicate joins the live privacy-owned **published view** `pv_consent_current` on the primary in the same SQL statement as the query (never a replica, never a cached copy). `consent_epoch` on a document is a rebuild and cleanup marker only: a document whose epoch no longer matches is excluded the instant the epoch changes, whether or not the cleanup job has run |
| Cleanup | `consent.changed` consumers (inline mode, section 1) delete or recompute derived documents. The "index removal within 15 minutes" of BR-T063 is **cleanup, not enforcement**: the read path already denies |
| Application snapshots | Recruiter reads of `application_evidence` are authorised against the snapshot **and** the live `application.share_snapshot` grant (DB-01); revocation takes the same effect |
| Tests | A TTL appears in a consent test only as a **timeout** (a test may poll up to 60 s for an asynchronous cleanup effect), never as a tolerance for authorization (INV-T25's "cache TTL <= 60 s" and TEST-SEC-009's "within the cache TTL" are retired; scenario S14 reads "the next read") |
| Event | `consent.changed` carries no authorization role; no consumer may be the only enforcement point (EVENT_CATALOG section 2) |

## 7. Telemetry endpoints (REVW-31, backend part)

Two routes are separated by class: operational telemetry (`/otlp` same-origin proxy, fixed upstream, allowlisted schema, no identity accepted from the body) and product analytics (`POST /analytics/events`, API-21-02, rejected server-side when `analytics.product` is not granted). Classification, allowlist, retention and the synthetic-only alternative are in SEC-02-R2 section 4; the abuse controls are in the threat model rows added there.

## 8. Event envelope (REVW-44)

`EventEnvelope.actor` carries `human` (boolean, derived by the producer, never client-supplied) beside `kind`. "Human actor" in SM-00 U6 and INV-T09 means `human = true` and `kind ∈ {user, support}`; a referee is human but never an authorised decider. SM-00 U6 should read "actor is human (envelope `human = true`, `kind` user or support)". Already applied in `EventEnvelope.schema.json`, `asyncapi.yaml` and EVENT_CATALOG section 1 (listed in the fix-pass report).

## 9. SQL transition rules (REVW-45)

DB-02 section 4 keeps `SECURITY DEFINER` transition functions for evidence, attempt and application. Their edge rules are generated from the machine-readable SM table, and a parity test is mandatory; details and the CI rule are in DB-02-R2 section 5. **FF-11 amendment wording:** "SQL transition functions read their allowed edges from a table generated from the SM table; a parity test runs every (state × event) pair through the domain function and the SQL function and fails on any difference in accept/reject or target state."

## 10. Other backend parts

| Finding | Backend change |
|---|---|
| REVW-08 | `api/institutions` and the institution rows of the API catalog name the new consumer remote **MOD-INS**; customer org administration rows name MOD-HIR; MOD-ADM remains the platform back-office consumer (APIC-02 section 3.1). BE-01 section 2 topology lists MOD-INS among the remotes |
| REVW-32 | User content is served from a separate **registrable domain**; the refresh token is bound to the session id of the `__Host-` access cookie (SEC-02-R2). BE-01 section 12 "Download" reads: "served from a separate cookieless user-content registrable domain, never a subdomain of the app apex" |
| REVW-34 | `api/network` and the `/network/*` routes are absent from the Ph1 to Ph3 route registry and OpenAPI; DOM-14 is Ph4 (APIC-02 section 3.2) |
| REVW-12 | `issuer_class` on evidence attestations and credentials; API fields `EvidenceIssuer`, `IssuerClass` (OpenAPI addendum); database part in DB-02-R2 section 6. The `evidence` module's `evidence_apply_transition` rejects an `instructor` record when instructor equals learner or a shared account, device or payment signal exists (INV-T47) |

## 11. Amendments and open items for governance

| Item | Needed |
|---|---|
| ADR-T05 amendment | Add: consumers run inline or as coalesced jobs; `LISTEN/NOTIFY` is not on the request path |
| ADR-T09 amendment | Job-per-subscriber replaced by consumer modes; per-kind backoff overrides; SM-NOTIFY retry is the job retry |
| FF-07 | Reword to "accepts `Idempotency-Key` or declares a natural key" (`idempotent: 'natural'` or `'none'` with reason) |
| FF-02 | Add: module graph generated from imports, fails on cycle and on edges outside the baseline; `pv_*` published views are the only cross-module read |
| FF-11 | Add the SQL edge-table and parity clause (section 9) |
| SM-00-R2 | t4/t7 of SM-BGJOB add per-kind overrides; U6 reads `human`; problem type names (section 3.4) |
| API-STD | Add `reapply-cooldown-active` (409) |
| OPEN-B1 | Restated (section 5) |
| OPEN-B57 | Concrete user-content registrable domain (SEC-02-R2 section 2) |
| OPEN-08 | Counsel: operational telemetry basis (SEC-02-R2 section 4) |


---

<a id="record-backend-architecture-rev2"></a>
## Preserved source record: BACKEND_ARCHITECTURE_REV2

> Consolidated on 2026-10-27. The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. Approval conditions and authority remain unchanged: this move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE_REV2.md -->
<a id="record-backend-architecture-rev2--backend-architecture-revision-2-be-01-rev2"></a>
# Backend Architecture, Revision 2 (BE-01 REV2)

Doc ID: BE-01-R2 · Owner: Backend Architecture Team · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-06 (remainder), REVW-14(a), REVW-19, REVW-25, REVW-41, REVW-42 · Backend part of: REVW-08, REVW-31, REVW-32, REVW-34, REVW-44, REVW-45 · Relates: BE-01, DB-02-R2 `12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md#record-physical-design-rev2`, SEC-02-R2 `14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_ARCHITECTURE.md#record-security-rev2`, APIC-02 `13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md#record-api-catalog-addendum`, SM-00-R2, BR-REG-R2

> **Folded into `BACKEND_ARCHITECTURE.md` on 2026-10-27.** Change record only; edit the original.

**Relationship (state of supersession only).** No original file was edited for this revision. Once governance accepts it, this file **supersedes** these parts of `BACKEND_ARCHITECTURE.md` (BE-01 v1.0): in section 3 the paragraph and diagram "Module dependency direction"; in section 6 the diagram and the "Delivery" and "Poison events" rows; in section 7.1 the sentence about divergence from SM-BGJOB; in section 7.3 the "Backoff" and "Max attempts" rows; section 8 (idempotency) as a whole; in section 10 the "Candidate search" row; section 16 (rate limiting) as a whole; in section 12 the "Download" origin wording; in section 22 contradiction (3) and open item OPEN-B1. Everything else in BE-01 stands. Until accepted, BE-01 v1.0 remains the text of record. Governance should link this file from `11_BACKEND_ARCHITECTURE/INDEX.md` and `00_CONTROL_CENTRE/MASTER_INDEX.md`.

Earlier in this fix pass, before the additive-only rule, six existing files were edited in place: `SECURITY_ARCHITECTURE.md`, `THREAT_MODEL.md`, `PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md`, `contracts/schemas/EventEnvelope.schema.json`, `contracts/asyncapi.yaml` and `EVENT_CATALOG.md`. Those edits are additive in effect and are consistent with this revision (SEC-02-R2 restates them); the fix-pass report lists them.

All content is **[TARGET]**. Numbers marked **[TARGET]** are design allocations, not measurements; calibration stays OPEN-B2 and WP-LOADBASE.

<a id="record-backend-architecture-rev2--1-consumers-without-a-job-per-subscriber-revw-06-remainder"></a>
## 1. Consumers without a job per subscriber (REVW-06 remainder)

Problem: one outbox event fanned out to one `background_job` row per subscriber (BE-01 section 6), so every business write caused 1 + N further writes, plus one idempotency row per unsafe request and one rate-limit row per request. ADR-T05 claims horizontal API replicas without a single writer; the write path has to match that claim.

<a id="record-backend-architecture-rev2--11-consumer-modes"></a>
### 1.1 Consumer modes

Each consumer registers a mode in the consumer registry (`events/` directory of the owner module). The mode is a property of the consumer, never of the event.

| Mode | For | Runs | Rows written on success | On failure |
|---|---|---|---|---|
| `inline` (default) | Cheap, DB-only reactions that finish well under 50 ms: in-app notification rows, analytics counters, search-document removal on `consent.changed`, cache invalidation, delivery-row creation for `notify` | Directly in the dispatcher process, in its own transaction (inbox insert plus the state change), 2 s timeout | the consumer's own state rows and one `consumer_inbox` row; **no `background_job` row** | one `evt:<consumer>` job for that single (event, consumer) pair, `idempotency_key = event_id`; it then follows section 3.3 |
| `job` | Anything that calls a provider, the AI gateway or the object store; anything slow; anything needing its own retry budget: `email.send`, `push.send`, `webhook.deliver`, `search.index` (with embeddings), `match.recompute`, `privacy.erasure.step`, `billing.reconcile` | A worker job | one job row per event, or one per burst when coalesced (below) | job retry policy |

Coalescing: projection consumers that rebuild from the owner's interface (search documents, match explanations, skill confidence) enqueue **at most one queued job per `(consumer, aggregate_id)`**. A burst of events on one aggregate updates `payload.upto_seq` of the queued job instead of adding rows (partial unique index on `(kind, idempotency_key)` where `status = 'queued'`, key `consumer:aggregate_id`). Non-mergeable consumers (billing, privacy steps, outbound webhooks) get one job per event.

Net effect on the write budget (DB-02-R2 section 17): the happy path of an inline consumer adds an inbox row and its own state, never a job row; job-mode projections add at most one job row per aggregate burst.

<a id="record-backend-architecture-rev2--12-listennotify"></a>
### 1.2 LISTEN/NOTIFY

The finding allows `LISTEN/NOTIFY` or direct handlers. Decision: **direct handlers (section 1.1) are the mechanism; `LISTEN/NOTIFY` is not used on the request path.** PostgreSQL serialises the commit of transactions that issued `NOTIFY` behind a database-wide lock **[verify under WP-LOADBASE]**, which would re-create the single commit point that DB-02 section 4.2 removed. The dispatcher polls `outbox_event` with an adaptive interval (250 ms under load, backing off to 2 s idle). An optional wake-up `NOTIFY` may be sent by the dispatcher tick itself, never by a business transaction; it carries no data and nothing depends on it. `LISTEN` needs a session connection, so the dispatcher uses one dedicated non-pooled connection, outside the transaction-mode pooler (DB-02 section 14).

<a id="record-backend-architecture-rev2--2-module-dependency-graph-revw-42"></a>
## 2. Module dependency graph (REVW-42)

BE-01 section 3 drew 17 of 24 backend modules and omitted edges that sections 10 and 13 require (`ai` to `assessment` for `getActiveAiMode`; every module that returns consent-guarded data to `privacy`). The cycle check (FF-02) cannot be trusted on an incomplete graph. This table is the **declared baseline** for all backend modules plus `packages/policy`. The deferred networking module (`api/network`, DOM-14, Ph4) is omitted until Ph4 (REVW-34).

"May import" is a synchronous call through the target's `index.ts` only. "Subscribes to" lists event subscriptions: they are not imports and cannot form an import cycle.

| Module | May import (sync, `index.ts` only) | Subscribes to (events) |
|---|---|---|
| `platform` | `identity` | - |
| `identity` | `orgs` | - |
| `orgs` | `policy` | - |
| `policy` | - | - |
| `privacy` | `policy` | - |
| `skills` | - | - |
| `profile` | `skills`, `platform`, `privacy`, `evidence`, `ai` | - |
| `evidence` | `skills`, `platform`, `privacy` | `assessment`, `learning`, `verification` |
| `verification` | `evidence`, `identity` | `evidence` |
| `assessment` | `skills` | - |
| `learning` | `assessment`, `billing`, `ai`, `skills` | - |
| `jobs` | `skills`, `orgs`, `billing`, `privacy` | `orgs`, `billing` |
| `applications` | `jobs`, `evidence`, `privacy`, `orgs`, `ai` | `jobs`, `evidence` |
| `search` | `ai`, `privacy` | `jobs`, `evidence`, `profile`, `privacy`, `billing`, `skills` |
| `matching` | `ai`, `privacy` | `evidence`, `jobs`, `profile`, `privacy`, `skills` |
| `careerintel` | `evidence`, `skills`, `privacy`, `ai` | - |
| `messaging` | `applications`, `orgs`, `privacy` | `applications` |
| `notify` | `identity`, `orgs`, `privacy` | all domain events |
| `billing` | `orgs` | `orgs` |
| `ai` | `privacy`, `assessment`, `billing`, `policy` | - |
| `institutions` | `evidence`, `learning`, `assessment`, `privacy`, `orgs` | - |
| `safety` | `jobs`, `evidence`, `identity`, `messaging`, `profile` | `profile`, `messaging`, `jobs` |
| `admin` | `identity`, `orgs`, `platform`, `privacy`, `policy` | - |
| `analytics` | `privacy` | `applications`, `jobs`, `evidence` |
| `integrations` | `orgs`, `jobs` | `jobs`, `applications`, `evidence` |

Check run on this baseline (Tarjan strongly-connected-components over the 25 nodes, from a script kept outside the repository): 25 nodes, no strongly connected component, no self-import, every module named in ID_REGISTRY appears.

Design rules behind the edges:

1. **Consent.** Any module that returns data under a `require_consent` obligation imports `privacy`; `privacy` imports only `policy`, which defines `ConsentPort`. Search and matching filter at query time through the privacy-owned published view `pv_consent_current` (section 6), which is the only cross-module read the table-ownership lint allows.
2. **Erasure and export.** `privacy` does not call every module (that would put it at the root of a cycle). Each module registers an `ErasureParticipant` and an `ExportParticipant` at the composition root, using port types exported by `privacy`; `privacy.erasure.step` jobs invoke the registered participants.
3. **`notify` is a leaf.** Nobody imports it. Producers emit notification-bearing events (transactional mail for identity, verification, applications), and `notify` resolves contact data through `identity`.
4. **Assessment and learning publish, evidence consumes.** `assessment.passed` and `course.completed` reach `evidence` as events (DOM-00 section 3, SM-00 cross-machine table); BE-01 v1.0 drew `assessment` and `learning` as importing `evidence`, which duplicated the event path.
5. **`ai` is the single door** (FF-02 lint restricts provider SDKs to `api/ai/adapters`). `ai` calls `assessment.getActiveAiMode` (INV-T06) and `billing` for budget and entitlement reserve (INV-T07). Callers of AI features import `ai`.
6. **Two-way flows** (evidence and verification): the synchronous direction is one-way, the return path is an event.

**The table must be generated, not maintained by hand (FF-02 amendment).** CI builds the real graph from imports (`dependency-cruiser --output-type json`), renders the diagram into the docs build, and fails when (a) an actual edge is absent from this baseline, (b) the import graph has a cycle, or (c) a module is missing from the table. A pull request that adds an edge edits this table in the same change. Once the generator exists, this table is replaced by its output.

<a id="record-backend-architecture-rev2--3-job-engine-revw-19"></a>
## 3. Job engine (REVW-19)

<a id="record-backend-architecture-rev2--31-authority-and-consistency"></a>
### 3.1 Authority and consistency

BE-01 section 7 stays the authority for the job engine, and `STATE_MACHINES.md#record-state-machines-rev2` section 2.8 already mirrors it (state set `queued, claimed, running, retry_wait, succeeded, dead, cancelled`; `retry_wait → dead` removed; `running → cancelled` added). Consistency points confirmed here:

| Point | Rule |
|---|---|
| State set | Equal in SM-BGJOB (SM-00-R2), `background_job.status` CHECK (DB-01) and the `Operation`/`ExportJob` state enums of the OpenAPI addendum; FF-11 compares them |
| Attempts | Every claim, including a re-claim after lease expiry, increments `attempts`; `dead` is reached only from `running` when `attempts >= max_attempts` or the error class is `permanent` |
| Cancel | `cancel_requested_at` set; queued and `retry_wait` jobs go to `cancelled` at once; a `running` job reaches `cancelled` only when the handler honours the abort at its next checkpoint |

<a id="record-backend-architecture-rev2--32-backoff-and-attempt-policy-corrects-the-spans-about-24-h-claim"></a>
### 3.2 Backoff and attempt policy (corrects the "spans about 24 h" claim)

SM-00-R2 flagged an open arithmetic problem for the backend owner: with base 5 s and cap 15 min, 12 attempts do not span about 24 h. Confirmed and corrected here. Worst-case span is the sum of the waits between attempts with no jitter (full jitter halves the expected wait).

| Kind | Max attempts | Base | Cap | Worst-case span (no jitter) | Why |
|---|---|---|---|---|---|
| default (`evt:*` fallback jobs, `search.index`, `file.*`, others) | 8 | 5 s | 15 min | 5+10+20+40+80+160+320 s = 635 s, **about 11 min** | Internal work; an outage longer than this ends in `dead`, an alert and audited replay |
| `email.send`, `webhook.deliver` | 12 | **60 s** | **6 h** | 60 s doubling to 15,360 s, then 21,600 s twice = 73,860 s, **about 20.5 h** | Provider outages of hours should heal without an operator; this matches the ~24 h delivery expectation of the original text. The old values (5 s, 15 min) give 3,975 s, **about 66 min**, as SM-00-R2 computed |
| `push.send` | 4 | 60 s | 15 min | 60+120+240 s = 420 s | TTL-bounded; a late push is useless |
| `ai.*` | 3 | 5 s | 15 min | 15 s | Retries cost money |
| `assessment.run` | 2 | 5 s | 15 min | 5 s | A new `runId` per attempt (section 19) |

Per-kind overrides are configuration (`jobKinds.<kind>.{maxAttempts, baseMs, capMs}`), validated at boot. Formula unchanged: `delay = min(cap, base × 2^(attempt−1))` with full jitter `random(0, delay)`; error classes `transient`, `permanent`, `rate_limited` (honours `Retry-After`) and `cancelled` as in BE-01 section 7.3. **Amendment for SM-00-R2:** its t4 and t7 rows state the default numbers; they should add "per-kind overrides in BE-01-R2 section 3.2".

<a id="record-backend-architecture-rev2--33-sm-notify-retry-is-the-job-retry"></a>
### 3.3 SM-NOTIFY retry is the job retry

There is **one** retry layer for a delivery, not two. The `notify` consumer creates the delivery row (notification × channel) inline; the `email.send` or `push.send` job it enqueues is the only retry mechanism. Mapping:

| Job (SM-BGJOB) | Delivery row (SM-NOTIFY) |
|---|---|
| `queued`, `claimed`, `running` | `sending` |
| `retry_wait` (SM-BGJOB t4) | `failed_retry` (SM-NOTIFY t6) |
| `dead`, or error class `permanent` (4xx except 408 and 429) | `failed` (SM-NOTIFY t8) |
| `succeeded` | `sent`, then `delivered` or `bounced`/`complained` by provider webhook |
| delivery TTL passed (SM-NOTIFY t10: 72 h time-sensitive, 7 d others) | `expired`; the job is cancelled |

SM-00-R2 section 2.7 already states this; this section adds the table and the TTL link, so that email's 12 attempts and the 72 h time-sensitive TTL cannot disagree: the job span of about 20.5 h is shorter than the shortest delivery TTL.

<a id="record-backend-architecture-rev2--34-one-name-for-the-409-state-error"></a>
### 3.4 One name for the 409 state error

SM-00 U2 and several acceptance criteria say `409 invalid_transition`; API-STD section 5 and every OpenAPI response say `state-transition-invalid`. **Canonical: `state-transition-invalid`** (kebab-case, like every other problem type; problem `type` URI `/problems/state-transition-invalid`). SM-00 U2, SPEC-G2 AC-05-05-05 and SPEC-G4 AC-10-05-03 and AC-10-05-04 should adopt it. For the same reason SM-00-R2's `409 reapply_cooldown` becomes `409 reapply-cooldown-active`. API-STD gains that one row (APIC-02 section 3.3).

<a id="record-backend-architecture-rev2--4-idempotency-revw-14a-replaces-be-01-section-8"></a>
## 4. Idempotency (REVW-14(a), replaces BE-01 section 8)

| Item | Design |
|---|---|
| Scope (FF-07 reworded) | Every unsafe route (`POST`, `PUT`, `PATCH`, `DELETE`) **either accepts `Idempotency-Key` (client UUIDv4/7, 16 to 64 chars) or declares a natural key** in the route registry: `idempotent: 'natural'` with the key named (for example `PUT /me/saved-jobs/{jobId}`: account + job; a single-use token route: token hash), or `idempotent: 'none'` with a stated reason for credential and token-consuming routes. The route-registry lint fails an unsafe route with none of the three. A natural-key route that also receives the header ignores it for dedupe and does not reject it |
| One key per intent | A user intent has exactly one key, reused on every retry and carried through the outbox when the outbox exists. The shell's `host.api` never generates a fresh key per call when the remote passes none (HC-01: `idempotencyKey?: 'auto'` per call defeats retry safety); it requires a mutation-scoped key or a natural-key route |
| Store | `idempotency_key(principal_id, key, method, route_template, request_hash, state, response_status, response_body_ref, locked_until, created_at, expires_at)`, PK `(principal_id, key)`; anonymous routes scope by `ip_hash`. Physically two daily-partitioned tables by retention class, `idempotency_short` and `idempotency_queued` (DB-02-R2 section 7) |
| Write cost: one row, not two | **DB-only operation (the common case):** inside the use-case transaction, `INSERT ... ON CONFLICT DO NOTHING` the finished row with status and body, together with the business writes. A concurrent duplicate blocks on the unique index until the first commits, then replays the stored response. No `in_progress` row, no completion update. **Operation with external effects:** reserve (`in_progress`, `locked_until = now() + 30 s`) then complete after commit: two writes. Conflict with a different hash or route: `422 idempotency-key-reuse`; conflict with unexpired `in_progress`: `409 idempotency-in-flight` plus `Retry-After`; expired `in_progress` (crash): takeover |
| Body | Stored inline only when 8 KB or smaller [TARGET], column-encrypted for `C2+` classes; larger or binary: status plus resource reference and hash, replay returns a fresh representation (API-STD). Smaller and fewer stored bodies are part of the write budget |
| **Retention (CONST-S12)** | **Class `queued`: 14 days = the outbox TTL (OFF-01 section 8.4)** for every route flagged `queuedOp: true`, because a queued write may flush up to 14 days after the user acted and a server that forgot the key after 24 h would run the write twice. **Class `short`: 24 h** for online-only routes, 7 days for payment-adjacent routes (checkout, portal). A route that cannot hold keys 14 days must declare a natural key and the offline queue must send it. Lint: `queuedOp: true` requires class `queued` or `idempotent: 'natural'` |
| Phase note | Ph1 offline is a read cache plus local unsent drafts, no outbox (REV-RES REVW-24), so no route is `queuedOp` in Ph1; the lint and the `queued` table are created when the outbox activates on the ADR-T10 trigger. Lesson progress is the first queued write (REV-RES REVW-15) |
| Layering | Business uniqueness (BR-T001 one active application) is enforced by the partial unique index, not by the key; the key only makes retries cheap and responses stable |
| Existing contract | 25 unsafe operations of `openapi.yaml` carry no header parameter. APIC-02 section 3.4 classifies each as `natural`, `natural` guarded by `If-Match`, or `none` |

<a id="record-backend-architecture-rev2--5-rate-limiting-revw-41-and-revw-06-replaces-be-01-section-16"></a>
## 5. Rate limiting (REVW-41 and REVW-06, replaces BE-01 section 16)

| Layer | Design |
|---|---|
| Edge first | CDN/WAF is the first limiter and the only protection for origin capacity: per-IP and per-ASN limits, bot challenge and managed rules on all auth routes (`RL-AUTH`, `RL-TOKEN`) and on `RL-PUBLIC`/`RL-WEBHOOK` paths; provider OPEN-B47. The application never relies on the edge for per-account protection |
| App: local buckets | `RL-READ`, `RL-WRITE`, `RL-PUBLIC`, `RL-HEAVY`: in-process token bucket per replica keyed by `(rateClass, key)`. **No database write per request.** Configured per-replica limit = cluster limit ÷ replica count; worst-case cluster burst is replicas × per-replica limit and is accepted for these classes. Cost control for expensive features is business budgets (entitlement counters in `billing`, AI budget ledger), not these buckets |
| App: durable counters | Only where exactness matters: login, password reset, email-challenge and token-consume routes (`RL-AUTH`, `RL-TOKEN`; per-account and per-IP+account counters with progressive delay) and the per-recipient caps on third-party mail (BR-T004, BR-T121). Store: `RateLimitStore` port; default adapter a **logged** table `auth_throttle`. The UNLOGGED `rate_limit_bucket` of v1.0 is removed: an unlogged table is truncated by crash recovery and is not replicated, so a failover reset login throttles |
| Redis trigger (earlier) | Introduce the Redis adapter when **any** holds: `auth_throttle` writes exceed 5% of primary write IOPS, or limit-check p95 exceeds 5 ms; a credential-stuffing incident of Sev-2 or higher; before production runs three or more API replicas. The v1.0 trigger (20% of IOPS, all buckets) fired too late and covered the wrong tables |
| Signalling | `RateLimit-Policy`, `RateLimit` and `Retry-After` on 429; limits are configuration |
| Write cost | Ordinary requests: 0 rows. Auth-class requests: 1 `auth_throttle` upsert, on those routes only |

OPEN-B1 is restated: durable counter store, logged Postgres table versus Redis, with the trigger above.

<a id="record-backend-architecture-rev2--6-consent-authorization-at-read-time-no-cache-everywhere-revw-25-const-s13"></a>
## 6. Consent: authorization at read time, no cache everywhere (REVW-25, CONST-S13)

Decision (REV-RES, CONST-S13): **a revocation takes effect at the first read after the revoking commit; there is no consent cache.** The four formulations in earlier text (instantly, within 1 minute, within a cache TTL, next API read) collapse into this one.

| Place | Rule |
|---|---|
| Policy (BE-01 section 5) | `require_consent` is resolved by `privacy` against the primary at read time (INV-T15). The `grantsVersion` cache covers **roles and capabilities only**; capabilities are UI hints (INV-T01) |
| Search and matching | The consent predicate joins the live privacy-owned **published view** `pv_consent_current` on the primary in the same SQL statement as the query (never a replica, never a cached copy). `consent_epoch` on a document is a rebuild and cleanup marker only: a document whose epoch no longer matches is excluded the instant the epoch changes, whether or not the cleanup job has run |
| Cleanup | `consent.changed` consumers (inline mode, section 1) delete or recompute derived documents. The "index removal within 15 minutes" of BR-T063 is **cleanup, not enforcement**: the read path already denies |
| Application snapshots | Recruiter reads of `application_evidence` are authorised against the snapshot **and** the live `application.share_snapshot` grant (DB-01); revocation takes the same effect |
| Tests | A TTL appears in a consent test only as a **timeout** (a test may poll up to 60 s for an asynchronous cleanup effect), never as a tolerance for authorization (INV-T25's "cache TTL <= 60 s" and TEST-SEC-009's "within the cache TTL" are retired; scenario S14 reads "the next read") |
| Event | `consent.changed` carries no authorization role; no consumer may be the only enforcement point (EVENT_CATALOG section 2) |

<a id="record-backend-architecture-rev2--7-telemetry-endpoints-revw-31-backend-part"></a>
## 7. Telemetry endpoints (REVW-31, backend part)

Two routes are separated by class: operational telemetry (`/otlp` same-origin proxy, fixed upstream, allowlisted schema, no identity accepted from the body) and product analytics (`POST /analytics/events`, API-21-02, rejected server-side when `analytics.product` is not granted). Classification, allowlist, retention and the synthetic-only alternative are in SEC-02-R2 section 4; the abuse controls are in the threat model rows added there.

<a id="record-backend-architecture-rev2--8-event-envelope-revw-44"></a>
## 8. Event envelope (REVW-44)

`EventEnvelope.actor` carries `human` (boolean, derived by the producer, never client-supplied) beside `kind`. "Human actor" in SM-00 U6 and INV-T09 means `human = true` and `kind ∈ {user, support}`; a referee is human but never an authorised decider. SM-00 U6 should read "actor is human (envelope `human = true`, `kind` user or support)". Already applied in `EventEnvelope.schema.json`, `asyncapi.yaml` and EVENT_CATALOG section 1 (listed in the fix-pass report).

<a id="record-backend-architecture-rev2--9-sql-transition-rules-revw-45"></a>
## 9. SQL transition rules (REVW-45)

DB-02 section 4 keeps `SECURITY DEFINER` transition functions for evidence, attempt and application. Their edge rules are generated from the machine-readable SM table, and a parity test is mandatory; details and the CI rule are in DB-02-R2 section 5. **FF-11 amendment wording:** "SQL transition functions read their allowed edges from a table generated from the SM table; a parity test runs every (state × event) pair through the domain function and the SQL function and fails on any difference in accept/reject or target state."

<a id="record-backend-architecture-rev2--10-other-backend-parts"></a>
## 10. Other backend parts

| Finding | Backend change |
|---|---|
| REVW-08 | `api/institutions` and the institution rows of the API catalog name the new consumer remote **MOD-INS**; customer org administration rows name MOD-HIR; MOD-ADM remains the platform back-office consumer (APIC-02 section 3.1). BE-01 section 2 topology lists MOD-INS among the remotes |
| REVW-32 | User content is served from a separate **registrable domain**; the refresh token is bound to the session id of the `__Host-` access cookie (SEC-02-R2). BE-01 section 12 "Download" reads: "served from a separate cookieless user-content registrable domain, never a subdomain of the app apex" |
| REVW-34 | `api/network` and the `/network/*` routes are absent from the Ph1 to Ph3 route registry and OpenAPI; DOM-14 is Ph4 (APIC-02 section 3.2) |
| REVW-12 | `issuer_class` on evidence attestations and credentials; API fields `EvidenceIssuer`, `IssuerClass` (OpenAPI addendum); database part in DB-02-R2 section 6. The `evidence` module's `evidence_apply_transition` rejects an `instructor` record when instructor equals learner or a shared account, device or payment signal exists (INV-T47) |

<a id="record-backend-architecture-rev2--11-amendments-and-open-items-for-governance"></a>
## 11. Amendments and open items for governance

| Item | Needed |
|---|---|
| ADR-T05 amendment | Add: consumers run inline or as coalesced jobs; `LISTEN/NOTIFY` is not on the request path |
| ADR-T09 amendment | Job-per-subscriber replaced by consumer modes; per-kind backoff overrides; SM-NOTIFY retry is the job retry |
| FF-07 | Reword to "accepts `Idempotency-Key` or declares a natural key" (`idempotent: 'natural'` or `'none'` with reason) |
| FF-02 | Add: module graph generated from imports, fails on cycle and on edges outside the baseline; `pv_*` published views are the only cross-module read |
| FF-11 | Add the SQL edge-table and parity clause (section 9) |
| SM-00-R2 | t4/t7 of SM-BGJOB add per-kind overrides; U6 reads `human`; problem type names (section 3.4) |
| API-STD | Add `reapply-cooldown-active` (409) |
| OPEN-B1 | Restated (section 5) |
| OPEN-B57 | Concrete user-content registrable domain (SEC-02-R2 section 2) |
| OPEN-08 | Counsel: operational telemetry basis (SEC-02-R2 section 4) |

<!-- source-record-end: Yash_Final_Project_Document/11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE_REV2.md -->
