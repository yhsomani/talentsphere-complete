# Fault Isolation Matrix

Doc ID: FIM-01 · Owner: Frontend/Platform Architecture · Version 1.0 · Status: Under Review
Relates: ADR-T03, ADR-T05, ADR-T10, ADR-T16, ADR-T18, ADR-T19 · INV-T13, INV-T14, INV-T16 · BR-T050 · MFA-01, HC-01, VCD-01, PWA-01, OFF-01, FEA-01

Tags: [CONF] [TARGET] [OPEN]. Thresholds for alerts are [TARGET] starting points, tuned from baseline telemetry; they are not benchmarks. "Verification" names the test that must exist before the scenario is claimed handled.

Blast-radius legend: **R** = one remote area · **P** = whole shell/page · **U** = all users (server/CDN) · **D** = one device/browser profile. Shared-dependency legend: SH = shell, SW = service worker, QC = QueryClient, RT = router, UI = `@ts/ui`, REACT = React singleton, IDB = IndexedDB, API = backend, CDN = edge/object storage, REG = registry.

## 1. Scenarios — cause, scope, detection
| ID | Scenario | Source | Blast radius | Shared deps involved | Detection |
|---|---|---|---|---|---|
| FI-01 | Remote entry/chunk **404** | Missed upload, CDN replica lag, bad `publicPath` | R (all users of that build) | CDN, REG | MF `loadEntryError`/`errorLoadRemote`; `mf.remote.load_error{status=404}`; healthcheck asset-reachability pre-publish |
| FI-02 | Remote **slow** / timeout | Slow network, large chunk, CDN degradation | R, user-perceived P (spinner) | CDN, SW | Load timer > 10 s; `mf.remote.load_ms` p75/p99 vs budget; Web Vitals by route |
| FI-03 | Remote **runtime crash at init** (import or `activate` throws, `selfCheck` fails) | Bad build, contract misuse | R | REACT, SH | `activate` rejection/timeout (1 s); error boundary at slot; `mf.remote.fallback` |
| FI-04 | Remote **render error** (exception in React tree) | Component bug, bad data | R (one route subtree) | REACT, UI | Slot/route `ErrorBoundary` → `errors.report`; JS error rate by `ts.module` |
| FI-05 | **Shared-dependency conflict** (duplicate React, range unsatisfied, `@ts/ui` major skew) | Bad publish bypassing gate, stale shell vs new remote | R (if gate holds) → P (if duplicate singleton leaks) | REACT, RT, QC, UI | CI FF-04; runtime range check; MF `errorLoadShare`/strict-version error; singleton identity probe at boot |
| FI-06 | **Registry/manifest corrupt** (invalid JSON, schema violation, truncated) | Publisher bug, partial write, CDN corruption | P (all remotes) if unhandled; contained to the invalid entry otherwise | REG, SH | JSON parse/Schema validation in shell; `registry.invalid`; per-entry validation |
| FI-07 | Entry **signature invalid / tampered / replayed (lower sequence)** | Registry-store compromise, MITM on non-TLS path, replay | R per entry (attack) | REG, trust anchors | Signature/sequence check; `registry.signature_failed` (page-worthy, security signal) |
| FI-08 | **Registry unreachable** (offline, 5xx, DNS) | Network, edge | P (boot) | REG, SW | Fetch timeout 2.5 s; SW NetworkFirst fallback; `registry.fetch_failed` |
| FI-09 | **Single-domain API 5xx** (e.g., `api/jobs`) | Backend module fault | R (screens calling it) | API | `api.error_rate{module}`; ApiError 5xx; trace error spans |
| FI-10 | **API-wide outage / 5xx storm** | Backend/gateway/DB failure | U (every online-only flow) | API, QC | Error ratio across modules; synthetic probe; circuit breaker opens (OFF-01 §8.3) |
| FI-11 | **Database outage / degraded read** (server) | Postgres failover, saturation (ADR-T05) | U | API | API returns `503` problem `type:/problems/degraded` with `Retry-After`; capability endpoint reports degraded domains |
| FI-12 | **Outbox queue stall** | Poison op blocking an aggregate; flusher lock held; clock/session problems; item stuck `retry-wait` | D (one device/account) | IDB, SH, API | `outbox.oldest_age_s` > 15 min online; Sync Center "Needs attention"; per-op attempt counters |
| FI-13 | **Third-party outage — Stripe** (Checkout/Portal/webhook delay) | Stripe or network to Stripe | R (MOD-ACC billing paths) | API (webhook), ext. | Redirect failure/timeouts; entitlement polling timeout; billing error metrics |
| FI-14 | **Bad shell deploy** (broken HTML/JS, bad route table, bad SW) | Release defect | P → U | SH, SW, CDN | Post-deploy smoke + SLO guard; JS error spike; boot success ratio `shell.boot_ok`; RUM FCP |
| FI-15 | **Bad remote deploy that passes health** (functional/UX/perf regression) | Release defect | R (cohort during canary, then all) | CDN, REG | Canary SLO guard (errors, INP, remote load, domain KPIs); user-reported; `mf.remote.error_rate` delta vs stable |
| FI-16 | **Regional CDN/edge outage** or lagging replication | Provider incident | U in region | CDN, REG, SW | Synthetic probes per region; `edge.fetch_failed` by country/colo; load errors by region |
| FI-17 | **Incompatible remote** (Host Contract/minShell/dataSchema mismatch) | Stale shell (clients) or drift | R for affected clients | SH, REG | Shell selection logic; `mf.remote.incompatible{reason}` |
| FI-18 | **Stale client vs newer API** (426 / schema drift) | Long-unopened PWA | D | API, SH | `426 client-outdated`; `api.426_count`; client version histogram |
| FI-19 | **Broken or stuck service worker** (bad precache, handler bug, update never activates) | SW defect | D → U (each client on that SW) | SW | Boot probe `sw.version` vs expected; precache install failures; `sw.controllerchange_loops`; support reports |
| FI-20 | **IndexedDB unavailable / quota exceeded / corrupted** | Private mode, eviction, disk full, bug | D | IDB, SH | Open/transaction probe at boot; `QuotaExceededError` handler; `storage.quota_exceeded` |
| FI-21 | **Session expiry or refresh race mid-flow** (multi-tab, reuse detection BR-T050) | Cookie expiry, concurrent refresh, remote revocation | D (all tabs of one session) | SH, API | 401 handler; `session.refresh_failed`; `session.reuse_revoked` (server) |
| FI-22 | **Long task / memory leak / infinite loop in one remote** | Remote code defect | **P** (main thread shared) | main thread, REACT | Long Tasks / INP by route; memory growth sampling; watchdog timer in shell (`shell.longtask_over_5s`) |
| FI-23 | **CSS/global style leakage or token conflict** | Remote global CSS, UI version skew | P (visual) | UI, DOM | Visual regression CI; CSS lint (no global selectors in remotes); RUM CLS spikes |
| FI-24 | **Event-bus handler throws / event flood** | Subscriber bug, loop (A emits B emits A) | R (subscriber) or P (flood) | SH bus | Handler try/catch; rate limiter per topic (e.g., > 50/s); `bus.handler_error`, `bus.flood` |
| FI-25 | **Feature-flag or capabilities endpoint down** | Flag service/`/me/capabilities` failure | U (online) | API, SH | Fetch failure; stale-snapshot age metric |
| FI-26 | **Telemetry pipeline down** (OTLP proxy/collector) | Observability outage | none for users; blind ops | SH telemetry | Exporter failure counters; synthetic span |
| FI-27 | **Push delivery failure** (APNs/FCM/Web Push service) | Provider outage, expired subscriptions | D / U for push only | SW, API/worker | Delivery receipts/410s; `push.send_failure_rate`; click-through gaps |
| FI-28 | **Compromised or malicious remote/shared-package code (supply chain / XSS)** | Dependency compromise, injected script | **P/U** — not isolated | everything same-origin | CSP violation reports, SRI/SW mismatch, anomaly in network egress, dependency scanning (SCA), signature failures |
| FI-29 | **Regional backend outage (cloud region)** | Provider region failure | U in region/all | API, DB | Regional health, synthetic probes, error ratio by region |
| FI-30 | **Realtime channel (SSE/WebSocket) down** | Proxy/idle timeout, backend | R (MOD-MSG live updates) | API | `msg.sse_reconnects`, heartbeat misses |

## 2. Scenarios — response
| ID | Containment | Fallback | User-visible behaviour | Recovery | Monitoring / alert | Verification |
|---|---|---|---|---|---|---|
| FI-01 | Slot-level failure; other remotes and chrome unaffected | 2 retries (500/1500 ms) → `rollbackTo` entry → LKG | Skeleton then "This area is updating — Retry / Go home" | Registry rollback; CDN fix; assets are immutable so re-upload same path is idempotent | Alert: remote 404 ratio > 1% over 5 min [TARGET] | e2e network fault injection; pre-publish multi-region reachability gate |
| FI-02 | Timeout bounded (10 s; reconciled with Host Contract, see HOST_CONTRACT_AND_REMOTE_CONTRACTS.md "Timer reconciliation") so no infinite spinner | Skeleton → timeout → retry chain | Progress skeleton, then retry/unavailable | Retry; prefetch on idle reduces recurrence | `mf.remote.load_ms` p75 > budget; p99 > 10 s | e2e throttled (slow-4G profile) |
| FI-03 | `activate` guarded (1 s timeout, try/catch); failure marks build bad for 24 h on this client | `rollbackTo` → LKG | "This area is unavailable" | Auto rollback by SLO guard; operator publish | Alert on `mf.remote.fallback` > 0.5% of loads [TARGET] | contract test: `activate` throws; unit shell |
| FI-04 | Route/slot ErrorBoundary resets on navigation; sibling routes live | Retry button re-mounts subtree | Inline error panel with Retry; rest of app usable | Fix + new build; boundary reset | Error rate by module + release; Sentry-like grouping | Component tests; chaos route that throws |
| FI-05 | Pre-load range check; strict versions fail load instead of dual instance | Fallback chain; if shell itself broken see FI-14 | Unavailable area | Rebuild remote with compatible ranges; widen→flip→narrow train for majors (VCD-01 §6.6) | `mf.remote.incompatible{shared}`; singleton identity probe fail = page | CI FF-04 negative tests; e2e with deliberately skewed remote |
| FI-06 | Validation per entry; invalid entry skipped; boot snapshot + LKG used | Embedded snapshot → LKG | Usually none; stale versions possible | Republish registry (atomic put) | `registry.invalid` page-worthy | Fuzz tests on registry parser; schema CI on publish |
| FI-07 | Entry dropped; others unaffected; security event | Next candidate (rollbackTo/LKG) | None or "unavailable" for that area | Investigate key/store compromise; rotate keys via shell release | Page security on-call | Unit tamper/replay (VCD-01 T5/T6) |
| FI-08 | Boot never blocks on registry (> 2.5 s) | IDB LKG → embedded snapshot | None; offline banner if offline | Auto on next poll | `registry.fetch_failed` ratio | e2e offline boot |
| FI-09 | Per-query errors surface in that screen only; QC retry policy (limited, backoff) | Cached RO data labelled "as of" if class allows; otherwise inline error | Section-level error with Retry; rest of page fine | Backend fix | `api.error_rate{module}` > baseline [TARGET 2% sustained 5 min] | Integration fault injection; e2e |
| FI-10 | Client circuit breaker (60 s) stops hammering; no retry storms (jitter) | RO cached screens; queued writes keep queuing | Global "Service temporarily unavailable" banner; online-only actions disabled with reason | Backend recovery; queue flushes automatically | Sev incident; synthetic failing; error ratio | e2e mock 503; load test with retries |
| FI-11 | Backend returns explicit `degraded` problem; shell consumes capability `degraded` list | Read-only mode for affected domains; online-only mutations blocked | "Some features are read-only right now" | DB failover (17_*) | DB/API SLO alerts | Integration with fault proxy |
| FI-12 | Ordered per aggregate; other aggregates keep flowing; Web Lock released on tab death | "Needs attention" tray; user can retry/discard/export | Item shows reason; app otherwise normal | User resolves; support export (JSON) | `outbox.oldest_age_s` p95 across devices; stuck-item rate | Unit/integration: poison op, dead lock holder |
| FI-13 | Billing paths isolated in MOD-ACC; success redirect grants nothing (INV-T17) | Entitlement shown from server state only; support link | "Payment page is unavailable — try later"; entitlements unchanged until webhook state | Stripe recovery; webhook replay | Stripe webhook lag, checkout error rate | e2e with stubbed Stripe failure; webhook-delay test |
| FI-14 | Staged rollout; SW and HTML cache-busting; previous shell stays in clients' SW until update applied | Rollback pipeline; kill-switch SW if SW broken; `MF_MODE=bundled` as alternative build | Possible blank/broken app for updated clients until rollback | Re-publish previous build with new SW version string | `shell.boot_ok` < 99.5% [TARGET] page; JS error spike | Pre-release smoke on production-like env; rollback drill each quarter |
| FI-15 | Canary cohort (5%) with SLO guard; per-remote rollback independent of others | Auto-rollback to `rollbackTo`; kill switch | Degraded area for canary cohort only | Registry flip (≤ 300 s TTL) | Canary guard metrics; support tickets | Canary rehearsal in staging; synthetic journeys per remote |
| FI-16 | Multi-region object storage + CDN failover; immutable URLs cache widely | SW cache serves already-seen versions; app shell offline | Cached users unaffected; new users in region see error page | Provider failover; DNS/CDN steering | Synthetic probes per region; edge error rate | Game-day: block region |
| FI-17 | Strict VC-02 rule; no partial mount | `rollbackTo` → LKG → "Update required" if shell is the stale party | "Update required" (reload) or "area updating" | Client update; remote republishes lower bound if mistake | `mf.remote.incompatible{reason}` > 1% [TARGET] | VCD-01 T1–T3, T9 |
| FI-18 | Server floor + client header; force-update flow | Read-only until update; outbox preserved | Blocking "Update required" modal (offline: banner + read-only) | Update SW; outbox translators | `api.426_count`, client age distribution | VCD-01 T11 |
| FI-19 | Kill-switch SW unregisters itself and clears `ts-*` caches; SW code has no business logic | Online-only plain SPA (no SW) | Possibly one extra reload; offline unavailable temporarily | Fix SW, redeploy with new version string | `sw.controllerchange_loops`; precache failure rate | SW test harness: broken-install simulation; kill-switch drill |
| FI-20 | Boot probe → online-only mode; quota handler per OFF-01 §6; no crash | In-memory forms; clear message; no outbox | Banner "Offline features unavailable" or "Storage full" | User frees storage / retry; cache rebuild | `storage.quota_exceeded`, `idb.open_failed` rates by platform | Unit with mocked IDB errors; Safari private-mode manual |
| FI-21 | Single-flight refresh via Web Locks across tabs; shell owns refresh; remotes cannot refresh | Reauth sheet; queued writes preserved under same-account rule | "Sign in again" sheet, no data loss | Reauth; if reuse-revoke, full sign-in | `session.refresh_failed`, server `reuse_revoked` | Integration with 3 tabs + token family (BR-T050) |
| FI-22 | **Not contained.** Mitigate: per-remote perf budgets; code-splitting; watchdog reports offending module; long-task attribution; kill-switch | Rollback/kill-switch the offending remote | Janky/frozen tab | Rollback; browser "wait/kill" | Long-task/INP alerts by module | Perf CI (Lighthouse CI) + soak test with memory sampling |
| FI-23 | CSS lint forbids global selectors in remotes; tokens via `@ts/ui`; CSS Layers/ scoping convention | Rollback remote | Visual glitches | Fix and republish | Visual regression diff; CLS | Visual regression suite across remotes together |
| FI-24 | Bus wraps handlers in try/catch; per-topic rate limit; loop detection (emit depth) | Drop events beyond limit; subscribers refetch on next focus | Possibly stale UI part | Fix subscriber | `bus.handler_error`, `bus.flood` | Unit: throwing handler, flood |
| FI-25 | Flags default to safe values; capabilities snapshot (age-labelled) used; server remains authority | Stale snapshot; hide nothing that API would deny | Maybe missing/extra UI affordances; API still denies | Service recovery | Snapshot age gauge | e2e with endpoint failing |
| FI-26 | Exporter async, bounded buffer, drops on overflow; never blocks UI | Local error console + `sendBeacon` best-effort | None | Fix collector | Synthetic span lag | Unit: exporter failure |
| FI-27 | Push is never the only channel for consequential events | In-app centre + email (ADR-T20) | Missed OS notification; in-app item present | Provider recovery; prune dead subscriptions | send failure rate; 410 pruning | Worker integration with push stub |
| FI-28 | **Not isolated by federation.** Reduce likelihood/impact: strict CSP, Trusted Types, signed entries + SRI/SW verify, SCA & lockfile policy, minimal data cached, no tokens in JS, server-enforced authz | Kill switch + key rotation + rollback; server-side session revocation (BR-T050) | Depends on attack; may include data exposure | Incident response (19_*): revoke sessions, rotate keys, republish | CSP reports, signature failures, SCA alerts, anomalous API patterns | Security tests: CSP header tests, SRI/signature tamper tests, dependency policy gate |
| FI-29 | Multi-region failover (infra docs); client unaffected by region beyond latency | RO caches; queue | Same as FI-10 for failover duration | Failover | Regional SLO | Game-day |
| FI-30 | Reconnect with backoff + jitter, polling fallback | Poll every 30 s while visible [TARGET] | Slight delay in new messages | Auto | `msg.sse_reconnects` | e2e: server closes stream |

## 3. What federation does NOT isolate (honest scope, ADR-T19)
| # | Not isolated | Consequence | Mitigation / where handled |
|---|---|---|---|
| 1 | **JS realm and DOM** — all remotes run in the same window, same prototypes, same globals | One compromised or buggy remote can read/modify anything the user can in the page; can monkey-patch `fetch`, DOM, React internals | CSP + Trusted Types, signed registry, lint `no-restricted-globals`, dependency policy; sandboxed iframes only for untrusted third-party content (ADR-T19). Tag: not a security boundary. |
| 2 | **Origin storage** (IndexedDB, Cache Storage, localStorage, SW) | Any remote can read the account DB and caches | Minimise cached data, short TTL, purge on logout (OFF-01); `host.storage.scoped` is convention |
| 3 | **Authority of cookies** | Browser attaches session cookies to same-origin calls from any remote code | Server authz for every request (INV-T01/T02), CSRF header policy, short access token, anomaly detection |
| 4 | **Main thread CPU / memory / event loop** | FI-22: one remote can freeze the page | Budgets, splitting, watchdog, rollback; Worker offload where justified |
| 5 | **Global CSS cascade and layout** | FI-23 style bleed | CSS lint, tokens, visual regression |
| 6 | **Shared singletons** (React, router, QueryClient, `@ts/ui`, `@ts/host-sdk`) | A bug or breaking change affects every remote | Strict ranges, widen→flip→narrow, canary |
| 7 | **The shell and service worker** | Single point of failure for boot/offline for everyone (FI-14, FI-19) | Small shell, SW without business logic, kill-switch SW, bundled-mode fallback |
| 8 | **Backend, database, API, auth** | Federation does nothing for server outages (FI-09…FI-11, FI-29) | Backend resilience (17_*/18_*), degraded-mode contracts, caches, circuit breaker |
| 9 | **Network / CDN / DNS / TLS** | Same-origin hosting concentrates risk at the edge (FI-16) | Multi-region, immutable assets, SW caches |
| 10 | **Supply chain of shared packages and build tooling** | Compromise of `@ts/*` or a transitive dependency reaches all modules that bundle it | Lockfile, SCA, provenance, reviews, build isolation |
| 11 | **Telemetry and flags** | Shared providers; their failure affects visibility/behaviour everywhere | Fail-open, bounded buffers (FI-25/26) |
| 12 | **Release coordination on contract changes** | Host Contract/shared-dep majors couple all teams | VCD-01 trains and windows |
| 13 | **Data correctness** | A remote can send wrong requests; only the server prevents harm | Server validation/state machines/policy; INV-T10/T11 |
| 14 | **Accessibility and UX consistency** | Independent teams can diverge | `@ts/ui`, a11y CI, design reviews |
Net: federation buys **independent delivery, smaller per-persona bundles, per-remote rollback and failure containment for *render and load* faults** (FI-01…FI-04, FI-15, FI-17). It does not buy security isolation or protection from shared-resource and platform faults.

## 4. Coverage check
| Mission category | Scenarios |
|---|---|
| Remote 404 / slow / runtime crash / render error | FI-01, 02, 03, 04 |
| Shared-dependency conflict | FI-05 |
| Manifest/registry corrupt, signature | FI-06, 07, 08 |
| API 5xx / database outage | FI-09, 10, 11, 29 |
| Queue stall | FI-12 |
| Third-party outage | FI-13, 27 (and 26) |
| Bad deploy | FI-14, 15 |
| Regional | FI-16, 29 |
| Compatibility / stale | FI-17, 18, 19 |
| Client storage / session | FI-20, 21 |
| Shared-resource faults federation cannot contain | FI-22, 23, 24, 28 |

## 5. Verification program
Game-days (quarterly): block a remote path (FI-01), poison registry (FI-06/07), SW kill-switch (FI-19), API 503 storm (FI-10), region block (FI-16/29). Each scenario's row above is a test requirement; a scenario is "handled" only when its verification exists in CI or the game-day log. Owners: remote cards in HC-01 §7 for R-scoped; Platform Frontend for P/U-scoped.

## 6. Open items
OPEN-FE-24 alert thresholds to be re-based after 4 weeks of production baseline · OPEN-FE-25 watchdog design for FI-22 (what the shell can actually do without killing user state) · OPEN-FE-26 infra-side FI-16/29 runbooks (17_*).
