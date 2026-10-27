# Backend Architecture, Revision 2 (BE-01 REV2)

Doc ID: BE-01-R2 · Owner: Backend Architecture Team · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-06 (remainder), REVW-14(a), REVW-19, REVW-25, REVW-41, REVW-42 · Backend part of: REVW-08, REVW-31, REVW-32, REVW-34, REVW-44, REVW-45 · Relates: BE-01, DB-02-R2 `12_DATA_AND_DATABASE/PHYSICAL_DESIGN_REV2.md`, SEC-02-R2 `14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_REV2.md`, APIC-02 `13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG_ADDENDUM.md`, SM-00-R2, BR-REG-R2

> **Folded into `BACKEND_ARCHITECTURE.md` on 2026-10-27.** Change record only; edit the original.

**Relationship (state of supersession only).** No original file was edited for this revision. Once governance accepts it, this file **supersedes** these parts of `BACKEND_ARCHITECTURE.md` (BE-01 v1.0): in section 3 the paragraph and diagram "Module dependency direction"; in section 6 the diagram and the "Delivery" and "Poison events" rows; in section 7.1 the sentence about divergence from SM-BGJOB; in section 7.3 the "Backoff" and "Max attempts" rows; section 8 (idempotency) as a whole; in section 10 the "Candidate search" row; section 16 (rate limiting) as a whole; in section 12 the "Download" origin wording; in section 22 contradiction (3) and open item OPEN-B1. Everything else in BE-01 stands. Until accepted, BE-01 v1.0 remains the text of record. Governance should link this file from `11_BACKEND_ARCHITECTURE/INDEX.md` and `00_CONTROL_CENTRE/MASTER_INDEX.md`.

Earlier in this fix pass, before the additive-only rule, six existing files were edited in place: `SECURITY_ARCHITECTURE.md`, `THREAT_MODEL.md`, `PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md`, `contracts/schemas/EventEnvelope.schema.json`, `contracts/asyncapi.yaml` and `EVENT_CATALOG.md`. Those edits are additive in effect and are consistent with this revision (SEC-02-R2 restates them); the fix-pass report lists them.

All content is **[TARGET]**. Numbers marked **[TARGET]** are design allocations, not measurements; calibration stays OPEN-B2 and WP-LOADBASE.

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

BE-01 section 7 stays the authority for the job engine, and `STATE_MACHINES_REV2.md` section 2.8 already mirrors it (state set `queued, claimed, running, retry_wait, succeeded, dead, cancelled`; `retry_wait → dead` removed; `running → cancelled` added). Consistency points confirmed here:

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
