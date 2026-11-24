# Non-Functional Requirements

Status: intended complete product. No value here is a measured result. Security, privacy and AI requirements are in [01_SECURITY_ARCHITECTURE.md](../05_SECURITY_PRIVACY/01_SECURITY_ARCHITECTURE.md) (NFR-SEC), [02_PRIVACY_AND_DATA_GOVERNANCE.md](../05_SECURITY_PRIVACY/02_PRIVACY_AND_DATA_GOVERNANCE.md) (NFR-PRV) and [04_FAIRNESS_AND_AI_GOVERNANCE.md](../05_SECURITY_PRIVACY/04_FAIRNESS_AND_AI_GOVERNANCE.md) (NFR-AIG).

Owner roles: SRE lead (performance, reliability, availability, observability, DR), engineering lead (maintainability, compatibility), design lead (accessibility, internationalization).

| Namespace | Range |
|---|---|
| `NFR-PERF` | 001..024 |
| `NFR-SCL` | 001..012 |
| `NFR-REL` | 001..016 |
| `NFR-AVL` | 001..010 |
| `NFR-A11Y` | 001..020 |
| `NFR-OBS` | 001..016 |
| `NFR-MNT` | 001..014 |
| `NFR-I18N` | 001..012 |
| `NFR-COMPAT` | 001..012 |
| `NFR-DR` | 001..010 |
| `OD-NFR` | 01..14 |
| `RSK-NFR` | 01..08 |

## 1. Ground rules

1. Every requirement states an SLI (what is counted), a window, a percentile where latency is involved, a measurement source, and a threshold. A requirement missing any of these is not testable and cannot be used as completion evidence [SRC: SSOT §21.2, §20.8 note].
2. Thresholds are `[PROP]` defaults unless tagged `[SRC]`. A business-dependent threshold also names its `OD-NFR`. No threshold is a commitment until the OD is decided.
3. Latency percentiles are computed over a rolling 28-day window [PROP] unless stated; server latency is measured at API ingress from request received to last byte sent; client metrics on reference profiles (§2).
4. Where SSOT values conflict with each other, both are recorded and neither replaces the other until decided [SRC: SSOT §20.9, §20.11 conflict notes].
5. "Valid request" excludes requests rejected with 4xx because of client error, except `429` caused by the platform's own load shedding, which counts as bad [SRC: Yash 15/SLO SLO-01].

## 2. Measurement stack and reference profiles

| Profile | Definition | Use | Source |
|---|---|---|---|
| RMP-1 (lab) | Lighthouse mobile emulation: small phone viewport, 4× CPU slowdown, simulated slow 4G about 1.6 Mbit/s down and 150 ms RTT; Lighthouse version pinned in CI | Per-pull-request regression gate | [SRC: Yash 15/SLO §3] |
| RMP-2 (device) | One low-tier Android phone and the oldest supported iPhone on a throttled real network | Release gate for critical journeys | [SRC: same; device list OD-NFR-02] |
| RMP-3 (field) | Real-user monitoring p75 by route template and device class, collected as operational telemetry without user identity | Ground truth, informational until OD-PRV-07 | [SRC: same] |
| Desktop lab | Lighthouse desktop preset | Desktop targets | [PROP] |
| Server | Ingress histograms per route template and class; traces | API SLIs | [DER] |
| Synthetic | External probes of critical journeys every 1 min from at least 2 locations [PROP] | Availability SLIs | [SRC: Yash 15/SLO SLO-02] |

Critical journeys (used by availability, performance and degradation sections): `J-SIGNIN` sign in; `J-SEARCH` search jobs; `J-APPLY` submit an application; `J-PIPELINE` recruiter moves an applicant; `J-EVIDENCE` add evidence with a file; `J-LEARN` resume a lesson; `J-ASSESS` take and submit an assessment; `J-MSG` send a message; `J-INTERVIEW` join a scheduled interview; `J-CHECKOUT` buy a plan.

## 3. NFR catalogue

### 3.1 Performance (NFR-PERF)

| ID | Requirement | SLI and window | Measurement | Default threshold | OD |
|---|---|---|---|---|---|
| NFR-PERF-001 | Point reads (C1: `GET /me`, a single application, a profile) are fast | Server latency p95 / p99, 28 days | Ingress histogram per route | p95 ≤ 200 ms, p99 ≤ 500 ms [SRC: Yash 15/SLO §5]; SSOT list endpoints p95 < 200 ms [SRC: SSOT §20.11] | — |
| NFR-PERF-002 | List and read-heavy endpoints (C2: job lists, pipeline, notifications) | Same | Same | p95 ≤ 350 ms, p99 ≤ 800 ms [SRC: Yash]; conflicts with SSOT list p95 < 200 ms | OD-NFR-01 |
| NFR-PERF-003 | Writes (C3: create application, update profile, stage change) including audit and outbox in one transaction | Same | Same | p95 ≤ 400 ms, p99 ≤ 1,000 ms | — |
| NFR-PERF-004 | Authentication (C4) excluding password-hash cost | Same, hash timed separately | Same plus hash span | p95 ≤ 300 ms, p99 ≤ 800 ms; hash 250..500 ms (security doc §7.2) | — |
| NFR-PERF-005 | Search (C5: job search, candidate search) at target corpus size | Same | Search load test at corpus size from OD-NFR-05 | p95 ≤ 300 ms [SRC: SSOT §20.11] vs ≤ 400 ms [SRC: Yash] vs F-92 ≤ 500 ms [SRC: SSOT §20.11 conflict] | OD-NFR-01 |
| NFR-PERF-006 | Compute-on-demand (C6: match explanation, readiness score) | Same | Span histogram | p95 ≤ 800 ms, p99 ≤ 2,000 ms; progress UI shown after 1 s | — |
| NFR-PERF-007 | Upload initiation and signed URL issue (C7) | Same | Same | p95 ≤ 300 ms | — |
| NFR-PERF-008 | AI-assisted features (C8) | Time to first token or first progress event | Gateway spans | ≤ 2 s p95; completion asynchronous; never blocks other classes | — |
| NFR-PERF-009 | Webhook acknowledgment (C9) | Server latency | Handler histogram | p95 ≤ 300 ms (persist then acknowledge) | — |
| NFR-PERF-010 | Dashboard and aggregate endpoints served from rollups | Server latency | Ingress histogram | p95 ≤ 400 ms [SRC: SSOT §20.11] vs F-102 ≤ 800 ms | OD-NFR-01 |
| NFR-PERF-011 | Largest Contentful Paint on public and candidate home routes | LCP p75 | RMP-1 lab (of record); RMP-3 field informational | ≤ 2.5 s mobile, ≤ 2.0 s desktop [SRC: SSOT §20.8]; per-route values §4.1 | OD-NFR-03 |
| NFR-PERF-012 | Interaction to Next Paint | INP p75 | Field RMP-3; lab proxy Total Blocking Time ≤ 200 ms on RMP-1 | ≤ 200 ms [SRC: SSOT §20.8] | OD-NFR-03 |
| NFR-PERF-013 | Cumulative Layout Shift | CLS p75 | RMP-1 and RMP-3 | ≤ 0.1 [SRC: SSOT §20.8] | — |
| NFR-PERF-014 | Time to First Byte and First Contentful Paint | p75 | RMP-1 | TTFB ≤ 800 ms; FCP ≤ 1.8 s mobile, ≤ 1.5 s desktop [SRC: SSOT §20.8] | — |
| NFR-PERF-015 | Per-route JavaScript budget | Compressed critical-path JS and CSS bytes (shell plus route chunk) | CI bundle-size check | Per §4.2 table | OD-NFR-04 |
| NFR-PERF-016 | Warm revisit of the installed PWA | Time to interactive shell from service-worker cache with no network | Lighthouse repeat view on RMP-1 | ≤ 1 s [SRC: Yash SLO-18] | — |
| NFR-PERF-017 | Main-thread long tasks during interactions | Count of tasks > 50 ms in scripted interaction traces | Playwright trace on RMP-1 | 0 tasks > 200 ms; ≤ 2 tasks > 50 ms per interaction [PROP] | — |
| NFR-PERF-018 | Outbox dispatch latency | Oldest undispatched event age | Gauge | p99 ≤ 5 s [SRC: Yash SLO-20] | — |
| NFR-PERF-019 | Transactional email jobs start promptly | Enqueue to start | Job metrics by class | p95 ≤ 30 s [SRC: Yash SLO-21] | — |
| NFR-PERF-020 | Virus scan upload-to-visible | Time | Scan job age | p95 ≤ 60 s for files ≤ 25 MiB [SRC: Yash SLO-22] | — |
| NFR-PERF-021 | Dependent recompute after evidence revocation | Revocation to recompute complete | Job age | p95 ≤ 5 min [SRC: Yash SLO-23] | — |
| NFR-PERF-022 | Real-time message delivery | Send accepted to delivered to an online recipient | Server timestamps on both ends | p95 ≤ 1 s; alert at 2 s [SRC: SSOT §20.4 realtime latency > 2 s] | — |
| NFR-PERF-023 | No N+1 query patterns on list endpoints | Queries per request as a function of page size | Query-count assertion in integration tests | Constant query count independent of page size | — |
| NFR-PERF-024 | Media playback start for course video | Play pressed to first frame | Player telemetry, RMP-1 | p75 ≤ 2 s on RMP-1 [PROP]; adaptive bitrate | OD-NFR-03 |

### 3.2 Scalability (NFR-SCL)

| ID | Requirement | SLI | Measurement | Default threshold | OD |
|---|---|---|---|---|---|
| NFR-SCL-001 | API instances are stateless and horizontally scalable | Throughput scales with instance count | Load test at 1, 2 and 4 instances | ≥ 80% linear scaling to 4 instances [PROP] | — |
| NFR-SCL-002 | System sustains planned peak with headroom | Sustained RPS at SLO latency | Load test at 2× forecast peak [SRC: SSOT PROD-009 "VER-006 at 2×"] | Meets NFR-PERF-001..010 at 2× `RPS_peak` | OD-NFR-05 |
| NFR-SCL-003 | Worker capacity scales with job arrival rate | Queue age stays within SLO as arrival rate doubles | Load test with synthetic jobs | NFR-PERF-018..021 met at 2× forecast job rate | OD-NFR-05 |
| NFR-SCL-004 | All list endpoints are paginated with cursors | Maximum page size | Contract test | Default 25, maximum 100 [PROP]; offset pagination forbidden beyond 1,000 rows | — |
| NFR-SCL-005 | Search result depth is capped | Maximum reachable result position | Contract test | 1,000 results per query [PROP] | — |
| NFR-SCL-006 | Tenant fairness: one tenant cannot consume more than its share of shared queues and search | Share of worker time and search QPS per tenant during contention | Load test with a noisy tenant | No tenant above 25% of shared capacity under contention unless capacity is idle [PROP] | OD-NFR-06 |
| NFR-SCL-007 | Database connections stay within pooler limits | Connections used / limit | Gauge | ≤ 80% [SRC: SSOT §20.4] | — |
| NFR-SCL-008 | Bulk operations (pipeline bulk moves, imports, exports, notification fan-out) run as batched jobs | Synchronous request duration for bulk endpoints | Contract test | Bulk endpoints return `202` with a job id; no request processes more than 100 items synchronously [PROP] | — |
| NFR-SCL-009 | Search index can be rebuilt from the database | Rebuild time at target corpus | Rebuild drill | ≤ 1 h [SRC: Yash SLO-34] | OD-NFR-05 |
| NFR-SCL-010 | Storage growth is forecast monthly | Forecast error | Capacity review | Forecast within ±25% over 3 months [PROP] | — |
| NFR-SCL-011 | Real-time connections per instance are bounded | Concurrent connections | Gauge | Defined per instance after baseline; alert at 80% | OD-NFR-05 |
| NFR-SCL-012 | Architecture evolution triggers are defined for 10, 100, 1K, 10K, 100K and 1M+ users | Trigger metrics documented and monitored | Capacity review | §5.3 triggers present for each stage [SRC: SSOT §20 intro] | — |

### 3.3 Reliability (NFR-REL)

| ID | Requirement | SLI | Measurement | Default threshold | OD |
|---|---|---|---|---|---|
| NFR-REL-001 | Every mutating endpoint that a client may retry accepts an `Idempotency-Key` and replays the first result for `IDEMPOTENCY_KEY_RETENTION` | Duplicate side effects under retry | Fault-injection test sending each request twice | 0 duplicates | — |
| NFR-REL-002 | Every outbound call has a timeout, bounded retries with jittered backoff, and a circuit breaker | Calls without timeout | Static check of the egress client usage | 0 calls bypass the client | — |
| NFR-REL-003 | Per-request deadline propagates to dependencies | Dependency calls exceeding the remaining deadline | Trace analysis | `deadline = min(client budget, class p99 × 2)` [SRC: Yash 15/SLO §5] | — |
| NFR-REL-004 | Side effects of a transaction are published through a transactional outbox | Events lost or published for rolled-back transactions | Fault-injection test killing the process mid-commit | 0 | — |
| NFR-REL-005 | Event consumers are idempotent and tolerate reordering | Duplicate or out-of-order delivery effects | Replay test | 0 incorrect states | — |
| NFR-REL-006 | Jobs have bounded attempts and a dead-letter queue | Oldest dead-letter item age | Gauge | Reviewed ≤ 1 business day [SRC: Yash SLO-25] | OD-NFR-07 |
| NFR-REL-007 | Workers claim jobs safely with concurrent workers | Jobs processed twice | Concurrency test with `FOR UPDATE SKIP LOCKED` claims | 0 double processing [SRC: CLAUDE.md worker] | — |
| NFR-REL-008 | Graceful shutdown drains in-flight work | Requests failed during deploy | Rolling deploy test under load | 0 failed requests caused by shutdown; drain deadline below the container grace period [SRC: SSOT §20.1 open item] | — |
| NFR-REL-009 | Health checks separate liveness and readiness; readiness reaches the database and reports worker heartbeat freshness | False ready states | Fault-injection (database down) | Readiness fails within 10 s of database loss; liveness unaffected [SRC: ARCHITECTURE.md §21] | — |
| NFR-REL-010 | Concurrent edits do not silently overwrite | Lost updates | Optimistic concurrency test (entity version) | 0; second writer receives `409 VERSION_CONFLICT` | — |
| NFR-REL-011 | Offline-queued PWA writes sync with operation ids and entity versions | Lost or duplicated offline writes | PWA sync test | 0 [SRC: SSOT §19.3] | — |
| NFR-REL-012 | Assessment autosave and submission survive network loss | Answers lost after reconnect | Network-drop test during `J-ASSESS` | 0 answers lost; submission idempotent [SRC: SSOT §17.4] | — |
| NFR-REL-013 | Billing state reconciles with the payment provider daily | Drift count | Reconciliation job | 0 unresolved drift older than 24 h | — |
| NFR-REL-014 | Migrations are backward compatible across one release (expand and contract) | Failed deploys due to schema mismatch | Migration round-trip and mixed-version test | 0 [SRC: SSOT §22.3 open item] | — |
| NFR-REL-015 | Data integrity constraints are enforced in the database (foreign keys, checks, uniqueness) for every business invariant that can be expressed there | Invariants enforced only in code | Schema review checklist | 0 expressible invariants without a constraint | — |
| NFR-REL-016 | Persistence honesty: a module labelled durable never loses acknowledged writes on restart; ephemeral modules are labelled in the UI and API | Acknowledged writes lost | `persistence-honesty` test suite | 0 [SRC: CLAUDE.md Rules] | — |

### 3.4 Availability (NFR-AVL)

| ID | Requirement | SLI | Measurement | Default threshold | OD |
|---|---|---|---|---|---|
| NFR-AVL-001 | Core API availability | Good responses within deadline / valid requests, 28 days | Server metrics | 99.9% (43.2 min budget per 30 days) [SRC: Yash SLO-01] | OD-NFR-08 |
| NFR-AVL-002 | Web shell availability | Synthetic shell load success / attempts | External probes | 99.9% [SRC: Yash SLO-02] | OD-NFR-08 |
| NFR-AVL-003 | Authentication availability | Successful sign-in, refresh and session validation / valid attempts | Server metrics on `/auth/*` | 99.9% [SRC: Yash SLO-04] | OD-NFR-08 |
| NFR-AVL-004 | Critical journeys succeed end to end | Synthetic journey success per `J-` journey | Probes every 5 min [PROP] | 99.5% per journey [PROP] | OD-NFR-08 |
| NFR-AVL-005 | Background pipeline health | Share of 5-min windows where outbox age ≤ NFR-PERF-018 | Gauge | 99% [SRC: Yash SLO-05] | — |
| NFR-AVL-006 | Billing webhook processing | Verified webhooks processed within 5 min / received | Handler metrics | 99.9% [SRC: Yash SLO-06] | — |
| NFR-AVL-007 | Real-time messaging availability | Successful connection and delivery / attempts | Server metrics | 99.5% [PROP] | OD-NFR-08 |
| NFR-AVL-008 | Interview room join success | Joins succeeded / attempts (excluding client permission denials) | Provider and server metrics | 99.5% [PROP] | OD-NFR-08 |
| NFR-AVL-009 | Planned maintenance does not take core read paths offline | Minutes of read unavailability for maintenance | Change records | 0 for reads; writes may enter read-only mode with banner for ≤ 15 min per month [PROP] | — |
| NFR-AVL-010 | Maintenance mode controls request admission, not just diagnostics | Requests admitted during maintenance for blocked classes | Integration test | 0 [SRC: ARCHITECTURE.md §21 gap] | — |

### 3.5 Accessibility (NFR-A11Y)

WCAG 2.2 Level AA is the release requirement [SRC: SSOT §21.3, §21.4]. Conflict recorded: SSOT §21.5 lists six Level A and AA criteria (2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8) as forward targets, which contradicts the AA gate; this catalogue treats them as in scope and only 2.4.13 Focus Appearance (AAA) as a target, pending OD-NFR-09.

| ID | Requirement | Measurement | Threshold |
|---|---|---|---|
| NFR-A11Y-001 | Every route conforms to WCAG 2.2 AA | Per-route conformance matrix (manual audit plus automation) | 100% of routes in scope; exceptions listed in the accessibility statement |
| NFR-A11Y-002 | Automated checks find no critical or serious issues | axe-core in CI on every route template and key states | 0 critical or serious [SRC: SSOT A11Y-002] |
| NFR-A11Y-003 | All functionality operable by keyboard with no traps | Keyboard-only run of every critical journey | 100% of journeys |
| NFR-A11Y-004 | Focus is visible and not obscured (2.4.7, 2.4.11); focus appearance ≥ 2 px with 3:1 contrast as target (2.4.13) | Visual and automated check | 0 failures for 2.4.7 and 2.4.11 |
| NFR-A11Y-005 | Text contrast ≥ 4.5:1, large text and UI components ≥ 3:1, in light and dark themes | Token-level contrast test on `packages/ui/src/tokens.ts` pairs plus page audit | 0 failures |
| NFR-A11Y-006 | Target size at least 24 × 24 CSS px or sufficient spacing (2.5.8) | Automated layout check | 0 failures |
| NFR-A11Y-007 | Dragging has a single-pointer alternative (2.5.7), including the curriculum builder and pipeline board | Manual test | 100% of drag interactions [SRC: SSOT §21.7] |
| NFR-A11Y-008 | Content reflows at 320 CSS px width and 400% zoom without two-dimensional scrolling (except data tables, boards and code editors) | Manual test | 0 failures |
| NFR-A11Y-009 | Forms have programmatic labels, error identification, suggestions and no redundant entry (3.3.1, 3.3.3, 3.3.7) | Automated plus manual | 0 failures |
| NFR-A11Y-010 | Authentication does not require a cognitive function test; password managers and paste work; one-time codes are pasteable (3.3.8) | Manual test of sign-in, MFA, recovery | 0 failures |
| NFR-A11Y-011 | Status messages are announced (4.1.3), including toasts, autosave and upload progress | Screen-reader test | 100% of status patterns |
| NFR-A11Y-012 | Custom components expose name, role, value and state (4.1.2) | Component library audit | 100% of `components/ui` primitives |
| NFR-A11Y-013 | Media has captions; prerecorded video has audio description or transcript; player is keyboard operable | Content check and player test | 100% of platform-produced media; instructors warned when uploading without captions [SRC: SSOT §21.7] |
| NFR-A11Y-014 | Timed assessments announce remaining time and support extended-time accommodations | Screen-reader and accommodation test | 100% of timed assessment types [SRC: SSOT §21.7] |
| NFR-A11Y-015 | Charts and leaderboards have a data-table alternative | Manual test | 100% [SRC: SSOT §21.7] |
| NFR-A11Y-016 | Infinite scroll has a "Load more" alternative and preserves focus | Manual test | 100% [SRC: SSOT §21.7] |
| NFR-A11Y-017 | Motion respects `prefers-reduced-motion` | Automated media-query test | 100% of animations |
| NFR-A11Y-018 | Help is consistently located (3.2.6) | Manual test | 0 failures |
| NFR-A11Y-019 | Critical journeys pass manual screen-reader testing on two combinations (for example NVDA with a desktop browser and VoiceOver on iOS) [PROP] | Test record per release | 0 blockers |
| NFR-A11Y-020 | An accessibility statement and Accessibility Conformance Report are published and updated per release | Content check | Present and dated (OD-SEC-30) |

### 3.6 Observability (NFR-OBS)

| ID | Requirement | Measurement | Threshold |
|---|---|---|---|
| NFR-OBS-001 | Every request carries a `request_id` (UUIDv4 accepted from edge or generated) propagated to logs, database (`SET LOCAL app.request_id`), audit, AI provenance, provider calls and the response header | Trace propagation test | 100% of requests [SRC: SSOT §20.3] |
| NFR-OBS-002 | Logs are structured JSON with timestamp, level, service, version, route template, tenant id, request id, trace id, outcome, duration | Log schema validation | 100% of log lines |
| NFR-OBS-003 | Logs contain no personal free text, tokens or secrets | Redaction test (NFR-PRV-039) | 0 findings |
| NFR-OBS-004 | Distributed traces cover API, database, queue, worker and provider spans | Sampled trace completeness | ≥ 95% of sampled traces have all expected spans; sampling 10% baseline, 100% for errors [PROP] |
| NFR-OBS-005 | RED metrics (rate, errors, duration histograms) per route template and job kind | Metric presence check | 100% of routes and job kinds |
| NFR-OBS-006 | USE metrics (utilization, saturation, errors) for CPU, memory, database connections, locks, replication lag, disk, queue depth | Metric presence | 100% of components |
| NFR-OBS-007 | Every SLO in §8 has an SLI dashboard and multi-window burn-rate alerts | Dashboard and alert test | Fast burn (2% budget in 1 h) pages; slow burn (10% in 3 days) tickets [PROP] |
| NFR-OBS-008 | Missing telemetry is an alert, not a healthy state | Alert on absent metrics | Absent-for-5-min alert for every SLI [SRC: SSOT §20.2] |
| NFR-OBS-009 | Alerts have severity, owner, runbook link and are tested | Alert catalogue review | 100% of alerts; P0 acknowledged within 10 min, P1 30 min [SRC: SSOT §20.5] |
| NFR-OBS-010 | Client errors and web vitals are reported as operational beacons (route template, error class, build version, timing bucket) | Beacon schema test | Per NFR-PRV-010 |
| NFR-OBS-011 | Worker heartbeat is written independently of batch length | Heartbeat age during long batch | ≤ 15 s between heartbeats [PROP]; unhealthy above 45 s [SRC: ARCHITECTURE.md §21] |
| NFR-OBS-012 | AI gateway metrics: requests, latency, errors, cost, acceptance rate per capability and provider | Dashboard | Present; alert at error > 5% [SRC: SSOT §20.4] |
| NFR-OBS-013 | Security dashboard: auth failures, step-up failures, RLS denials, rate-limit hits, egress blocks, canary alarms | Dashboard | Present [SRC: SSOT §20.6] |
| NFR-OBS-014 | Business health signals (funnels for critical journeys) are available from consented analytics only | Dashboard | Present; regression > 10% week over week alerts [SRC: SSOT §20.4] |
| NFR-OBS-015 | Telemetry retention follows `RET-OPLOG` | Retention test | Logs 30 days, traces 7 days |
| NFR-OBS-016 | Each deploy emits a change event visible on all dashboards | Dashboard annotation test | 100% of deploys and flag changes |

### 3.7 Maintainability (NFR-MNT)

| ID | Requirement | Measurement | Threshold |
|---|---|---|---|
| NFR-MNT-001 | Business rules live only in `packages/domain`; routes and UI call them | Static dependency check: no rule constants or state transitions defined in `apps/` | 0 violations [SRC: CLAUDE.md Rules] |
| NFR-MNT-002 | Request and response schemas are defined once in `packages/contracts` and used by API and web | Contract import check | 100% of routes |
| NFR-MNT-003 | Every migration has an automated round-trip test and is reversible or explicitly marked irreversible with a recovery plan | `database-migrations` suite | 100% [SRC: CLAUDE.md Rules] |
| NFR-MNT-004 | Type checking passes in strict mode for all packages | `pnpm typecheck` | 0 errors |
| NFR-MNT-005 | Formatting and lint pass | `pnpm lint` | 0 errors |
| NFR-MNT-006 | Test coverage of `packages/domain` | Line and branch coverage | ≥ 90% lines, ≥ 80% branches [PROP] |
| NFR-MNT-007 | Each feature's acceptance criteria map to at least one automated test | Traceability report from FR ids to tests | 100% of Must features before release |
| NFR-MNT-008 | Dependencies are current | Age of direct dependencies behind latest major | No direct dependency more than one major version behind for more than 6 months [PROP] |
| NFR-MNT-009 | Feature flags have an owner and an expiry; stale flags are removed | Flag register | 0 flags past expiry by more than 30 days [PROP] |
| NFR-MNT-010 | Public API changes follow versioning and deprecation policy | Contract diff in CI | Breaking changes only in a new version; deprecation notice ≥ 6 months [PROP] |
| NFR-MNT-011 | Design tokens are used for colors and spacing in feature code | Lint for hard-coded values | 0 violations [SRC: CLAUDE.md Style] |
| NFR-MNT-012 | Build is reproducible from the repository and pinned toolchain | Clean-build comparison | Identical artifact hashes for the same commit [PROP] |
| NFR-MNT-013 | Runbooks exist for every P0 and P1 alert and for every drill in §3.10 | Runbook register | 100% |
| NFR-MNT-014 | CI duration for a pull request stays short enough for frequent integration | p50 pipeline duration | ≤ 15 min [PROP] |

### 3.8 Internationalization (NFR-I18N)

| ID | Requirement | Measurement | Threshold |
|---|---|---|---|
| NFR-I18N-001 | All user-facing strings come from message catalogs with ICU message format (plurals, gender-neutral forms) | Lint for literal strings in components | 0 literals |
| NFR-I18N-002 | Launch locale set is configurable; English (US) is the source locale | Config check | Locale list per OD-NFR-10 |
| NFR-I18N-003 | Dates, times, numbers and currencies are formatted with `Intl` per user locale | Unit tests per formatter | 100% of formatted values |
| NFR-I18N-004 | All timestamps stored in UTC; scheduling uses IANA time zones and handles daylight-saving transitions | Scheduling tests across transitions | 0 wrong slots |
| NFR-I18N-005 | Names and addresses accept any Unicode script; no "first name / last name" requirement (single full-name field plus optional preferred name) | Validation tests with multi-script corpus | 0 rejections of valid names |
| NFR-I18N-006 | Layout supports right-to-left scripts through logical CSS properties | RTL visual test | 0 layout breaks on critical screens (when an RTL locale is enabled) |
| NFR-I18N-007 | Text expansion up to 35% does not truncate controls | Pseudo-localization test | 0 truncations on critical screens |
| NFR-I18N-008 | Search handles diacritics and multiple scripts | Search tests | Accent-insensitive matching for Latin scripts; tokenization for CJK when those locales are enabled |
| NFR-I18N-009 | Prices show currency explicitly; taxes shown per market | BIL tests | 100% of price displays |
| NFR-I18N-010 | Email and notification templates are localized to the recipient's locale | Template tests | 100% of templates for enabled locales |
| NFR-I18N-011 | Locale is selectable by the user and remembered; `Accept-Language` is the initial default | E2E test | Pass |
| NFR-I18N-012 | Skills and job titles taxonomy supports localized labels with a stable language-independent id | Data test | 100% of taxonomy nodes have an id independent of label |

### 3.9 Compatibility (NFR-COMPAT)

| ID | Requirement | Measurement | Threshold |
|---|---|---|---|
| NFR-COMPAT-001 | Supported browsers: last 2 major versions of Chrome, Edge, Firefox, Safari (macOS and iOS), Samsung Internet [PROP] | Cross-browser E2E on critical journeys | 0 blockers |
| NFR-COMPAT-002 | Oldest supported iOS and Android versions defined and tested on RMP-2 devices | Device lab run | Per OD-NFR-02 |
| NFR-COMPAT-003 | Viewport widths 320 px to 2560 px | Visual regression | 0 layout breaks |
| NFR-COMPAT-004 | PWA installable where the platform supports it; features degrade when capabilities are missing (push, background sync, WebAuthn, camera) | Capability detection tests | Every capability has a fallback path [SRC: SSOT §19.1] |
| NFR-COMPAT-005 | iOS web push and install limitations handled with email fallback | iOS device test | Notifications still delivered by email |
| NFR-COMPAT-006 | Unsupported browsers see a clear message with supported options instead of a broken page | Test with an old user agent | Pass |
| NFR-COMPAT-007 | Public API versioned under `/api/v1`; clients receive `Deprecation` and `Sunset` headers before removal | Contract test | Pass |
| NFR-COMPAT-008 | Calendar integrations: ICS export plus two-way sync with major calendar providers [PROP] | Integration tests | Pass |
| NFR-COMPAT-009 | Exports and imports use open formats (JSON, CSV UTF-8 with BOM option, PDF, ICS, Open Badges or W3C Verifiable Credentials where offered) | Format validation | Pass |
| NFR-COMPAT-010 | Institution integrations support LTI 1.3 and SCIM 2.0 [PROP] | Conformance test | Pass when INS integrations ship |
| NFR-COMPAT-011 | Service worker updates do not break open sessions: a new version activates on next navigation with a prompt | PWA update test | 0 broken sessions |
| NFR-COMPAT-012 | Works with common assistive technologies (screen readers, voice control, switch access) | NFR-A11Y-019 | Pass |

### 3.10 Disaster recovery (NFR-DR)

| ID | Requirement | Measurement | Threshold | OD |
|---|---|---|---|---|
| NFR-DR-001 | Database point-in-time recovery | Data loss window after restore | RPO ≤ 15 min [SRC: SSOT §22.4] vs ≤ 5 min [SRC: Yash SLO-31] | OD-NFR-11 |
| NFR-DR-002 | Database restore to a verified copy | Time to restored, verified copy | RTO ≤ 2 h [SRC: SSOT §22.4] vs ≤ 1 h [SRC: Yash SLO-31] | OD-NFR-11 |
| NFR-DR-003 | Single database node failure | Data loss and failover time | ≈ 0 committed loss with synchronous replica; ≤ 5 min failover [SRC: Yash SLO-30] | OD-NFR-11 |
| NFR-DR-004 | Object storage loss or corruption | Recoverability of evidence files | Versioning plus cross-region or off-site copy; RPO and RTO per OD-NFR-11 | OD-NFR-11 |
| NFR-DR-005 | Region loss | RPO and RTO | Undecided; depends on single vs multi-region [SRC: Yash SLO-33] | OD-NFR-12 |
| NFR-DR-006 | Secrets and configuration recovery | Time to restore | ≤ 30 min from secret manager and infrastructure as code [SRC: Yash SLO-35]; `.env.example` is not a recovery source [SRC: SSOT §22.4 conflict] | — |
| NFR-DR-007 | Restore drills | Drill records | Quarterly database restore and PITR record recovery; quarterly rollback drill (≤ 15 min); semi-annual secrets rotation; annual full DR simulation [SRC: SSOT §22.5] | — |
| NFR-DR-008 | After restore, external systems are reconciled (payments, email suppression, media provider, search index) and erasures re-applied before traffic | Drill checklist | 100% of steps executed in drill [SRC: SSOT §22.5 open item; NFR-PRV-023] | — |
| NFR-DR-009 | Backups are isolated from production credentials | Access review | Separate account or project; deletion protection [PROP] | — |
| NFR-DR-010 | Application rollback | Time to previous stable version | ≤ 15 min [SRC: SSOT §22.3, §22.5] | — |

Conflict recorded: SSOT §22.4 gives Auth data a daily backup with RPO ≤ 24 h while the same database has 15-minute WAL and RPO ≤ 15 min; both cannot hold. Default: one RPO for the whole database (OD-NFR-11).

## 4. Performance budgets

### 4.1 Web vitals per route class

Measured as lab p75 on RMP-1 (of record) with field RMP-3 p75 reported alongside. Values are SSOT per-route budgets [SRC: SSOT §20.9]. Conflict recorded: several exceed the global targets of NFR-PERF-011/012 (LCP up to 3.5 s against < 2.5 s mobile; INP 300 ms against 200 ms). Default proposal: the global target applies to public, candidate-home, search, profile and messaging routes; the looser per-route value applies only to authoring and analytics routes listed as "heavy" below, until OD-NFR-03.

| Route class | Examples | LCP | INP | CLS | Heavy route |
|---|---|---|---|---|---|
| Marketing and public | Landing, public job page, public profile, public course page | ≤ 1.8 s | ≤ 200 ms | ≤ 0.05 | No |
| Search and marketplace | Job search, course catalog, mentor directory | ≤ 2.0 s | ≤ 200 ms | ≤ 0.1 | No |
| Profile and portfolio | Own profile editor, portfolio | ≤ 2.0 s | ≤ 200 ms | ≤ 0.1 | No |
| Messaging | Inbox, conversation | ≤ 2.0 s | ≤ 200 ms | ≤ 0.1 | No |
| Dashboard and ATS | Candidate home, recruiter pipeline | ≤ 2.5 s | ≤ 200 ms | ≤ 0.1 | No |
| Feed first page | Community feed | ≤ 2.5 s | ≤ 300 ms (SSOT) vs 200 ms (global) | ≤ 0.1 | No (conflict) |
| Learning player | Lesson player | ≤ 3.0 s | ≤ 300 ms | ≤ 0.1 | Yes |
| Challenge arena | Code challenge with editor | ≤ 3.0 s | ≤ 300 ms | ≤ 0.1 | Yes |
| Course builder | Instructor studio | ≤ 3.5 s | ≤ 300 ms | ≤ 0.1 | Yes |
| Admin and reporting | Admin console, reports | ≤ 3.5 s | ≤ 300 ms | ≤ 0.1 | Yes |
| Institutional analytics | Cohort dashboards | ≤ 3.5 s | ≤ 300 ms | ≤ 0.1 | Yes |

### 4.2 JavaScript and CSS budgets

Compressed transfer size of the critical path (shell plus route chunk, JS plus CSS). SSOT forbids route bundles above 200 KB gzipped [SRC: SSOT §20.10] while §20.9 allows up to 400 KB; the budget method (bytes that fit the LCP target on RMP-1) gives about 210 KB for a 2.5 s target [SRC: Yash 15/SLO §3]. Default proposal pending OD-NFR-04:

| Route class | Critical-path budget (compressed) | Lazy-loaded allowance after interaction |
|---|---|---|
| Marketing and public | ≤ 120 KB [SRC: SSOT §20.9] | ≤ 80 KB |
| Search, profile, messaging, dashboard, ATS, feed | ≤ 200 KB [SRC: SSOT §20.10] | ≤ 150 KB |
| Heavy routes (player, arena, builder, admin, analytics) | ≤ 200 KB for first render; editors and charts loaded on demand | ≤ 400 KB total [SRC: SSOT §20.9 upper values] |

Other budgets [PROP]: images served in modern formats with explicit dimensions and responsive sizes; hero image ≤ 100 KB on mobile; web fonts ≤ 2 families, subset, `font-display: swap`; third-party scripts on authenticated routes: none except payment and video providers on their own routes; API responses for list endpoints ≤ 100 KB compressed per page.

### 4.3 API latency classes (summary of NFR-PERF-001..010)

| Class | p95 | p99 | Notes |
|---|---|---|---|
| C1 point read | 200 ms | 500 ms | |
| C2 list | 350 ms (Yash) / 200 ms (SSOT) | 800 ms | OD-NFR-01 |
| C3 write | 400 ms | 1,000 ms | No external call inside the transaction |
| C4 auth | 300 ms plus hash | 800 ms plus hash | |
| C5 search | 300 ms (SSOT) / 400 ms (Yash) / 500 ms (F-92) | 800 ms | OD-NFR-01 |
| C6 compute on demand | 800 ms | 2,000 ms | Progress UI after 1 s |
| C7 upload initiation | 300 ms | 700 ms | Bytes go direct to storage |
| C8 AI | First token ≤ 2 s | n/a | Asynchronous completion, bulkhead |
| C9 webhook acknowledgment | 300 ms | 800 ms | Persist then acknowledge |
| Aggregates and dashboards | 400 ms (SSOT) / 800 ms (F-102) | 1,000 ms | From rollups; OD-NFR-01 |

## 5. Scalability model and capacity planning

### 5.1 Parameters (all values unknown until forecast and baseline load test; none assumed)

| Parameter | Meaning | Source or owner |
|---|---|---|
| `MAU_role` | Monthly active users per role (CAN, REC, INS, IAD, EXA, others) | Product and finance forecast (OD-NFR-05) |
| `a` | Daily active / monthly active ratio | Analytics once live |
| `s` | Sessions per daily active user per day | Analytics |
| `r_c` | API requests per session by class C1..C9 | Trace sampling, load model |
| `p` | Peak-to-average factor (hour of day, application deadlines, semester starts, hiring events) | Observed traffic profile |
| `b_k` | Background jobs per active user per day by job kind | Worker metrics |
| `f` | Mean upload size and uploads per active candidate per month | Storage metrics |
| `v` | Video minutes uploaded per instructor per month and viewed per learner | Media metrics |
| `q` | Concurrent real-time connections per daily active user | Real-time metrics |
| `N_corpus` | Search corpus sizes (jobs, discoverable candidates, courses) | Data growth model |
| `h` | CDN cache hit ratio for static assets and public pages | CDN logs |

### 5.2 Formulas [SRC: Yash 15/SLO §9]

- Peak request rate: `RPS_peak = Σ_role MAU_role × a × s × Σ_c r_c × p / 86,400`.
- API instances: `N_api = ceil(RPS_peak × cpu_seconds_per_request / (cores_per_instance × u_target)) + N_spare`, with `u_target ≤ 0.6` and `N_spare ≥ 1` (survive loss of one instance).
- Workers: `N_worker = ceil(Σ_k λ_k × service_time_k / (concurrency_per_worker × u_target))`, with `λ_k` the job arrival rate per kind.
- Database connections: `conns = N_api × pool_per_instance + N_worker × pool_per_worker + admin_reserve ≤ 0.8 × pooler_limit`.
- Storage growth per month: `ΔS = MAU_CAN × uploads_per_month × f + video_minutes × bytes_per_minute + database_growth`.
- Search reindex time: `reindex_time = N_corpus / indexing_rate ≤ 1 h` (NFR-SCL-009).
- Real-time capacity: `connections_peak = DAU × q × p`; instances sized so each stays below 80% of its tested connection limit.

### 5.3 Architecture evolution triggers

| Stage (active users) | Expected shape [DER] | Trigger to move to the next shape |
|---|---|---|
| 10 to 100 | One API instance plus one worker, managed PostgreSQL, CDN | Need for zero-downtime deploys or any SLO burn caused by single instance |
| 100 to 1K | Two or more API instances, two workers, connection pooler | Database CPU > 60% at peak, or pooler saturation > 80% |
| 1K to 10K | Read replica for reporting and search reads, rollup tables for dashboards, dedicated search engine if PostgreSQL full-text search p95 exceeds C5 | Search p95 over target at forecast corpus [SRC: Yash ADR-T11 revisit trigger 400 ms] |
| 10K to 100K | Separate queues per job class with tenant fairness, shared cache (for rate-limit counters, sessions denylist), media pipeline offloaded | Rate-limit counter writes > 5% of primary write IOPS or check p95 > 5 ms [SRC: Yash Rev2 §3] |
| 100K to 1M+ | Partitioned hot tables (events, notifications, audit), regional deployment for residency, possibly service extraction for real-time and search | Region requirements (OD-SEC-24) or single-primary write saturation |

### 5.4 Capacity review

Monthly review of utilization against forecast; re-forecast when a trigger fires, before a large tenant onboards (institution semester start, enterprise rollout), or before a planned campaign. Headroom rule: provisioned capacity ≥ 2× observed peak for interactive paths [SRC: SSOT PROD-009].

## 6. Load profile questions (must be answered to set OD-NFR-05)

1. How many users per role are expected at launch, at 12 months and at 36 months?
2. What share of candidates are active daily versus only during a job search?
3. When are peaks: weekday mornings in which time zones, semester starts, campus placement seasons, application deadlines of large employers, hackathon submission deadlines?
4. What is the largest single tenant (recruiters, applicants per job, students per institution, employees per enterprise)?
5. How many applications can a single job receive in its first 24 hours (high-volume hiring)?
6. How many recruiters search concurrently, and how large is the discoverable candidate corpus?
7. How many concurrent assessment takers can one scheduled assessment have (campus drives)?
8. How many concurrent interviews and real-time conversations at peak?
9. What volume of video is uploaded and streamed per month?
10. What is the expected AI request mix per active user, and the cost policy per plan?
11. What notification fan-out occurs at peak (job alerts, digests)?
12. Which regions must be served and with what latency expectation?
13. Which integrations push or pull data in bulk (ATS imports, LMS sync, HRIS), and how often?

## 7. Caching and queueing strategy

### 7.1 Caching

| Layer | What | Policy | Invalidation |
|---|---|---|---|
| CDN | Hashed static assets | `public, max-age=31536000, immutable` | New hash per build |
| CDN | Public pages and public API reads (public jobs, public profiles, course pages) | `public, s-maxage=60, stale-while-revalidate=300` [PROP] | Purge on publish, unpublish, visibility change (within 60 s) |
| Service worker | App shell and static assets precached; owner data with network-first | Never authoritative; purge on sign-out and `401`/`403` [SRC: SSOT §19.2] | Version on each release |
| Server memory | Policy grants (`GRANTS_CACHE_TTL` 15 s), feature flags (60 s), taxonomy (5 min) | Keyed with tenant and principal | Version bump on change |
| Shared cache (when introduced) | Rate-limit counters, session denylist, rollup results | Keys include tenant id | TTL plus explicit invalidation |
| Rollup tables | Dashboards, institution analytics, salary aggregates | Recomputed by jobs; freshness shown in UI | Event-driven or scheduled |
| Never cached | Consent state, support grants, entitlements for spend, assessment answers, authenticated API responses at HTTP level | — | — |

### 7.2 Queueing

| Rule | Detail |
|---|---|
| Queue store | PostgreSQL `background_jobs` with `FOR UPDATE SKIP LOCKED` claims [SRC: CLAUDE.md] until a trigger in §5.3 requires a dedicated broker |
| Classes | `interactive` (emails users wait for, scan, verification), `standard` (recompute, notifications), `bulk` (exports, imports, reindex, digests), `scheduled` (retention, reconciliation) |
| Priority | Workers serve `interactive` first with reserved capacity (at least one worker slot always reserved) [PROP] |
| Tenant fairness | Round-robin across tenants within a class; per-tenant concurrency cap (NFR-SCL-006) |
| Retries | Exponential backoff with jitter, maximum attempts per kind (default 5) [PROP]; then dead-letter |
| Idempotency | Job kinds declare an idempotency key; duplicate enqueues collapse |
| Scheduling | Scheduled jobs are single-run by lock; missed runs execute once on recovery, not once per missed interval |
| Visibility | Queue depth, oldest age, attempts, dead-letter count per class and kind |

## 8. SLO, SLI and error-budget framework

1. Each SLO has: name, SLI definition (good events / valid events), window (rolling 28 days [PROP]), target, owner, dashboard, alert policy.
2. Error budget = `1 − target` over the window. Example: 99.9% over 30 days allows 43.2 min of bad minutes or 0.1% bad requests.
3. Burn-rate alerts: page when 2% of the 30-day budget burns in 1 h (fast burn) and confirmed over 5 min; ticket when 10% burns in 3 days (slow burn) [PROP].
4. Budget policy [SRC: Yash 15/SLO §10]: monthly SLO review by the SRE lead; when a budget is exhausted, releases to the affected surface freeze except reliability and security fixes until the budget recovers or the product owner accepts the risk in writing.
5. Changes to a target require an update to this file and the dashboard configuration in the same change.
6. Declared disasters (region loss) are reported separately and do not silently consume the monthly budget.
7. SLO set (initial): NFR-AVL-001..008 availability, NFR-PERF-001..010 latency (as latency SLOs: share of requests under the p95 threshold ≥ 95%), NFR-PERF-018..021 pipeline freshness, NFR-PERF-011..013 client vitals (synthetic of record).
8. Customer-facing SLAs, if any, are set below internal SLOs and only by commercial decision (OD-NFR-13).

## 9. Degradation modes

| Dependency failure | Behavior | User sees | Journeys kept |
|---|---|---|---|
| AI gateway or model provider down | Non-AI fallback for every capability; AI features show "Unavailable right now" | Banner on AI panels; drafts still editable | All |
| Search engine slow or down | Fallback to simple database query with fewer filters and capped results; recruiter search disabled if consent filters cannot be applied (fail closed) | "Limited search" notice | J-SEARCH reduced |
| Email provider down | Queue and retry; in-app notifications continue; time-critical codes offer alternative factor | "Email delayed" message on code screens | J-SIGNIN with passkey or TOTP |
| Payment provider down | Checkout disabled with message; existing entitlements unchanged; webhooks reconciled later | "Purchases temporarily unavailable" | All except J-CHECKOUT |
| Video or meeting provider down | Interview room shows fallback (phone dial-in or reschedule link) and notifies participants | Reschedule prompt | J-INTERVIEW degraded |
| Antivirus scanner down | Uploads accepted into quarantine and stay pending; nothing becomes visible unscanned | "Processing" status | J-EVIDENCE delayed |
| Object storage degraded | Uploads paused with retry; cached reads continue | Upload retry message | Reads |
| Real-time channel down | Messaging falls back to polling every 15 s [PROP] | "Reconnecting" indicator | J-MSG slower |
| Database primary failover | Writes return `503` with `Retry-After` for up to failover time; reads from replica where safe | Read-only banner | Reads |
| Worker backlog | Interactive class protected; bulk jobs paused automatically when interactive age exceeds its SLO | Delayed digests and exports with dates | All interactive |
| Overload | Load shedding by class: `bulk` and anonymous public API first, then `HEAVY`, never auth refresh or assessment submission | `429` or `503` with `Retry-After` | J-ASSESS, J-SIGNIN protected |
| Offline client | Read cached owner data; queue allowed writes with operation ids; refuse server-required actions (assessments, payments, privileged actions) | Offline banner with queued count | Drafts and reading |

Every mode has a feature flag or automatic trigger, a runbook and a test that forces the failure in staging [DER from SSOT §20.1].

## 10. Observability requirements

### 10.1 Signal chain

`REQUEST → USER (subject_ref) → TENANT / PURPOSE → FEATURE → API ROUTE → DB / QUEUE → PROVIDER → RESULT` [SRC: SSOT §20.2]. Every hop carries `request_id` and `trace_id` (NFR-OBS-001).

### 10.2 Required dashboards

| Dashboard | Panels (minimum) | Owner |
|---|---|---|
| Platform health | Availability per SLO, latency by class, error rate by route, queue depth and age by class, database CPU, connections, replication lag, deploy markers | SRE lead |
| Critical journeys | Synthetic success and duration per `J-` journey | SRE lead |
| Client performance | LCP, INP, CLS per route class (synthetic of record, field informational), bundle size trend | Frontend lead |
| AI health | Requests, latency, errors, cost, acceptance, policy denials, canary trips per capability [SRC: SSOT §20.6] | AIC owner |
| Security health | Auth events, step-up failures, RLS denials, rate-limit hits, egress blocks, canary alarms, refresh-reuse events [SRC: SSOT §20.6] | `SAD` |
| Billing | Webhook success, processing age, reconciliation drift | `FIN` |
| Privacy operations | Rights requests open and overdue, retention job results, consent clean-up age | Privacy lead |
| Trust and safety | Report volume, queue age, moderation SLA, appeal outcomes [SRC: SSOT §20.6 UGC health] | TSF lead |
| Tenant health | Per-tenant usage, errors, throttling, seat use [SRC: SSOT §20.6 institutional health] | Customer success (function) |

### 10.3 Alert rules (minimum)

| Alert | Condition | Severity |
|---|---|---|
| SLO fast burn | §8 rule 3 | P0 for NFR-AVL-001..003, P1 otherwise |
| Error spike | ≥ 5 new errors of one class in 5 min [SRC: SSOT §20.4] | P2, P1 if on a critical journey |
| Slow queries | Any interactive query > 1 s more than 10 times in 5 min [SRC: SSOT §20.4] | P2 |
| Connections | Pool use > 80% for 5 min | P1 |
| Queue age | Interactive class oldest job > 2× its SLO for 5 min | P1 |
| Dead letter | Any new dead-letter item | P3 |
| Webhook errors | Billing webhook failure > 2% in 15 min [SRC: SSOT §20.4] | P1 |
| Synthetic failure | 3 consecutive failures of a journey probe [SRC: SSOT §20.4] | P1 |
| Absent telemetry | SLI metric missing for 5 min | P1 |
| Tenant canary | Any canary-row access | P0 (security) |
| Certificate expiry | < 14 days | P2 |
| Backup failure | Any failed backup or WAL archive gap > 5 min | P1 |

## 11. Open decisions

| ID | Question | Options | Default proposal | Who decides | Blocking |
|---|---|---|---|---|---|
| OD-NFR-01 | Precedence between SSOT §20.11 hot-path values and per-feature criteria (list, search, dashboard latency) | A: tighter value is the target, looser is the alert threshold; B: feature criteria win; C: §20.11 wins | A | Product owner + SRE lead | Latency SLOs, feature acceptance |
| OD-NFR-02 | Device lab list for RMP-2 and oldest supported OS versions | A: one low-tier Android and oldest iPhone receiving security updates; B: broader matrix | A | Engineering lead | NFR-COMPAT-002 |
| OD-NFR-03 | Percentile and source of record for web vitals, and per-route budgets that exceed global targets | A: synthetic p75 on RMP-1 of record, global targets for non-heavy routes (§4.1); B: field p75 of record | A | Product owner + frontend lead | NFR-PERF-011..014, 024 |
| OD-NFR-04 | JavaScript budget per route (200 KB rule vs per-route 250–400 KB) | A: §4.2 split between first render and lazy allowance; B: SSOT §20.9 values | A | Frontend lead | CI size gate |
| OD-NFR-05 | Launch and growth forecast per role and target corpus sizes (§6 answers) | n/a — inputs required | Load test at assumed scenarios until forecasts exist, labelled as scenarios | Product owner + finance | NFR-SCL-002, 003, 009, 011; capacity plan |
| OD-NFR-06 | Tenant fairness cap under contention | A: 25%; B: plan-based shares | A | SRE lead + product owner | NFR-SCL-006 |
| OD-NFR-07 | On-call model and dead-letter review cadence | A: business-hours review with paging for P0/P1; B: 24×7 rotation | A until enterprise contracts require 24×7 | Product owner | NFR-REL-006, alert routing |
| OD-NFR-08 | Availability targets per surface | A: 99.9% core, 99.5% secondary (§3.4); B: 99.95% core with multi-zone | A | Product owner + SRE lead | NFR-AVL-001..008 |
| OD-NFR-09 | WCAG 2.2 forward-target list (SSOT §21.5 conflict) | A: all A and AA criteria in the gate, only 2.4.13 as target; B: keep SSOT list as targets | A | Product owner + design lead | NFR-A11Y-004, 006, 007, 010, 018 |
| OD-NFR-10 | Launch locales | A: English only at launch with full internationalization readiness; B: English plus market languages per OD-SEC-17 | A | Product owner | NFR-I18N-002 |
| OD-NFR-11 | Database and storage RPO/RTO (SSOT ≤ 15 min / ≤ 2 h vs target ≤ 5 min / ≤ 1 h; Auth row conflict) | A: one database RPO ≤ 5 min, RTO ≤ 1 h; B: SSOT values | B until HA and WAL archiving are measured, then A | SRE lead + product owner | NFR-DR-001..004 |
| OD-NFR-12 | Region-loss DR scope | A: single region with cross-region backups (restore in new region, RTO hours); B: warm standby region | A | Product owner + finance | NFR-DR-005 |
| OD-NFR-13 | Customer-facing SLA | A: none at launch; B: enterprise SLA below internal SLO | A | Product owner | Enterprise contracts |
| OD-NFR-14 | Progressive rollout mechanism and automatic rollback thresholds (SSOT §22.3: p95 +20% or 5xx > 0.1%) | A: feature-flag cohorts with those thresholds; B: traffic splitting between deployments (needs multi-instance and expand/contract migrations) | A | SRE lead | Release process |

## 12. Risks

| ID | Risk | Likelihood / impact | Mitigation | Owner |
|---|---|---|---|---|
| RSK-NFR-01 | Targets set without forecasts lead to over- or under-provisioning | High / Medium | OD-NFR-05, scenario-based load tests, triggers in §5.3 | SRE lead |
| RSK-NFR-02 | Field telemetry blocked by consent decisions, leaving client SLOs on synthetic data only | Medium / Medium | Synthetic of record (OD-NFR-03), OD-PRV-07 | SRE lead |
| RSK-NFR-03 | PostgreSQL-backed queue and search saturate before migration work is planned | Medium / High | §5.3 triggers monitored with alerts | Architecture |
| RSK-NFR-04 | Heavy routes (builder, arena) exceed budgets on low-end devices | High / Medium | Lazy loading, RMP-2 testing | Frontend lead |
| RSK-NFR-05 | Single-region outage exceeds the monthly budget | Low / High | OD-NFR-12, declared-disaster reporting | SRE lead |
| RSK-NFR-06 | Restore without reconciling external systems corrupts billing or resurrects erased data | Medium / High | NFR-DR-008 checklist and drills | SRE lead |
| RSK-NFR-07 | Accessibility regressions in rich interactions (drag-and-drop, editors, video) | High / Medium | Per-route matrix, manual screen-reader tests | Design lead |
| RSK-NFR-08 | Requirements reported as met without measurement, repeating SSOT §21.2 gap | High / High | Every NFR names a measurement; release gate checks evidence | Engineering lead |

## 13. Legacy source trace

| Source | Used for | Dropped or changed, and why |
|---|---|---|
| SSOT §20 (20.1–20.11) | Reliability rules, observability chain, monitoring triad, alert severities, dashboards, web vitals, route budgets, anti-patterns, hot paths | Conflicting values kept side by side with OD-NFR-01, 03, 04; ISR references dropped (client-rendered PWA) |
| SSOT §21.3–21.7 | WCAG 2.2 AA gate and added accessibility requirements | Forward-target list conflict recorded (OD-NFR-09) |
| SSOT §22.3–22.5 | Rollout, rollback, backup and DR, drills | Auth backup row conflict recorded (OD-NFR-11); `.env.example` rejected as secrets recovery source |
| Yash 15/SLO_AND_PERFORMANCE_TARGETS | Reference profiles, API classes, SLO-01..35, capacity formulas, error-budget policy | Federation-specific SLOs (remote activation) dropped because the bundled build is the default |
| ARCHITECTURE.md §21 | Current-state gaps (heartbeat, maintenance mode) | Used only to state requirements, not status |
