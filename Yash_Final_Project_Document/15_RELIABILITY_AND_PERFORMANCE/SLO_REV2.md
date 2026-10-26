# SLO Revision 2: Synthetic-Only Client SLIs, Budget Alignment, Capacity Note

Doc ID: OPS-SLO-R2 - Owner: SRE Lead with Performance Engineer - Version 1.0 - Status: Draft for Review - Date 2026-10-25 - Relates: OPS-SLO, OPS-CAP, OPS-OBS, FEA-01 section 14, ADR-T03, ADR-T10, REVW-07, REVW-23, REVW-31, REVW-39, REVW-41, OPEN-08, OPEN-15, OPEN-FE-30

**Relationship statement:** this file supersedes nothing. It is an additive revision record to `SLO_AND_PERFORMANCE_TARGETS.md` (OPS-SLO). Where a section below conflicts with OPS-SLO, the section below is the proposed correction and the OPS-SLO owner must adopt it or reject it in the next change-controlled edit (OPS-SLO section 10). Every number is a [TARGET] hypothesis calibrated only after `WP-LOADBASE` and `WP-FED-SPIKE`; nothing is measured.

## 1. Telemetry classes (REVW-31)

OPS-SLO section 2 treats real user monitoring (RUM) as "sampled, consented", but `analytics.product` is consent-gated (PRIVACY PUR-14) and operational telemetry is not separated from analytics. The two classes below are defined here.

| Class | Content | Basis | Consent gate | Used for |
|---|---|---|---|---|
| Operational telemetry | Server request metrics, error rates, version and build identifiers, chunk and asset request outcomes at the edge, queue ages, aggregate session counts, synthetic probe results | Strictly necessary for security and availability; classification **to be confirmed with counsel (OPEN-08)** until then treated as the narrowest allowlist | None, but allowlisted fields only: no user id, no free text, no device fingerprint (TEST-OBS-008) | Server SLOs (SLO-01, 04, 05, 06, 20 to 25), synthetic client SLIs, sampling-coverage denominator |
| Product analytics and field RUM | Web-vitals field samples by route and device class, funnels, UX events | Consent (`analytics.product`) | Required; no event for a user who declines (TEST-OBS-007) | Informational client metrics; never the sole basis of an SLO until the coverage rule in section 3 is met |

## 2. Synthetic-only SLIs for client SLOs

Until the coverage rule in section 3 holds, the SLI of record for each client SLO is synthetic: scripted journeys and lab runs from at least three vantage points outside the network, on the reference mobile profile RMP-1, at a fixed cadence [TARGET param]. RUM (consented) is reported next to it as an informational cross-check.

| SLO | SLI of record (synthetic) | Operational-telemetry cross-check | Consented RUM role | Note |
|---|---|---|---|---|
| SLO-02 shell boot | Unchanged: external synthetic journey success | Edge availability of shell assets | none | Already synthetic |
| SLO-03 remote activation | Synthetic mount of every module route: success / attempts, per module. Default `bundled` mode: the module is a lazy chunk; a failed chunk fetch counts as a failed activation | Edge log ratio of chunk request success (2xx and 304 / all) per module, no user identity | `remote.activated` and `remote.failed` events, informational | In federated mode (conditional) the manifest and remote-entry requests are added to the same two sources |
| SLO-13 LCP | p75 of synthetic LCP on RMP-1 for the public and candidate-home routes | none available | Field LCP p75, informational | The lab measurement is *not* field data; the document must say "synthetic p75" wherever it reports this |
| SLO-14 INP | Lab proxy of record: scripted interaction traces (long-task assertion, Total Blocking Time) on RMP-1 | none | Field INP p75, informational | INP is interaction-driven and cannot be measured by a passive probe; the proxy is an approximation |
| SLO-15 CLS | Synthetic CLS on RMP-1 per route, including the module-mount slot | none | informational | |
| SLO-16 TBT | Lighthouse-class TBT on RMP-1 (unchanged) | none | none | Already lab |
| SLO-17 federation overhead | Conditional on federated activation: A/B of the same routes built bundled and federated, delta of synthetic LCP | Edge request waterfall depth | informational | Not evaluated at all in the default `bundled` mode |
| SLO-18 warm re-visit | Synthetic repeat-view run with a warm service worker | none | informational | |

## 3. Sampling bias and the coverage rule

Consented RUM is a self-selected subset. Known directions of bias (unmeasured until the product has users): users who accept analytics are likely more engaged; privacy-conscious users, some browsers and some regions are under-represented; low-end devices and poor networks may be under- or over-represented; installed-PWA users may consent at a different rate from browser users. Field vitals from this subset can look better or worse than the whole population.

Rules:

1. **Coverage ratio** = consented RUM sessions / all sessions counted by the operational server-side session counter, reported monthly with the browser, device-class and country mix of both sets. The counter is operational telemetry (no identity).
2. A distribution gap between the two sets is reported as a bias finding, not corrected silently.
3. RUM may be promoted to an SLI of record for a client SLO only when the coverage ratio is at least a threshold set by the SRE Lead and Privacy Lead [OPEN, value to be set after launch data exists] and the mix comparison shows no gap above a tolerance [OPEN].
4. Release gates never depend on RUM alone.
5. The consent-rate assumption itself is an open item for Product and Privacy (OPEN-FE-30, OPEN-08).

## 4. Budget alignment (REVW-23)

**Status:** this section re-derives the contradiction from OPS-SLO's own formula using the frontend budgets B1 to B16 as currently written in `10_FRONTEND_ARCHITECTURE/FRONTEND_ARCHITECTURE.md` section 14. The frontend owner is re-deriving those budgets from the spike baseline; this section must be re-checked against that revision when it lands and the frontend revision wins on its own numbers. Constants below are the OPS-SLO method constants (RMP-1: 1.6 Mbit/s, 150 ms RTT, TTFB about 3 RTT = 0.45 s, CPU allocation 1.0 s, LCP target 2.5 s, 1 KB = 1000 bytes).

| Quantity | Derivation | Result |
|---|---|---|
| Transfer rate on RMP-1 | 1.6 Mbit/s | 200 KB per second |
| Critical-path JS budget for the first visit to an LCP route | (2.5 - 0.45 - 1.0) s x 200 KB/s (OPS-SLO section 3) | about 210 KB gzip, illustrative |
| B5 shell + B10 one module, as currently written | 150 KB + 120 KB = 270 KB, 1.35 s transfer; 0.45 + 1.35 + 1.0 | 2.80 s before any federation allowance, above the 2.5 s LCP target |
| Largest module chunk that still fits on first visit, bundled | 210 KB - 150 KB shell | about 60 KB gzip for the candidate-home and public routes |
| Extra cost of federation on first visit | SLO-17 allowance 250 ms x 200 KB/s | about 50 KB less budget: shell + route must be about 160 KB to hold 2.5 s |

Proposed alignment (for the OPS-SLO and frontend owners to adopt or reject):

1. **Two budgets, not one.** B10 (120 KB per module) governs *warm-shell* navigation to a module. A separate **first-visit budget `B_first`** governs the LCP routes (public pages and candidate home): shell critical path plus that route's initial chunk must not exceed `B(route)` from the section 3 formula (about 210 KB illustrative). Either B5 shrinks or the home module chunk is held to about 60 KB.
2. **Default mode is bundled** (REVW-07). SLO-17 and B16 apply only after federated activation. When federated, the first-visit budget for LCP routes is reduced by the federation allowance (about 50 KB, or the LCP target is explicitly relaxed for federated routes and the relaxation is recorded as the price of activation, feeding `COST_ENVELOPE.md` and the OPEN-03 decision).
3. **B9 versus SLO-17 are different metrics.** B9 is an absolute cold load of a non-home remote at "4G p75"; SLO-17 is a delta of LCP versus a bundled baseline on RMP-1. They must use the same network profile. Proposed: RMP-1 for both; B9 then applies to non-LCP routes only, and SLO-17 to LCP routes only.
4. **LCP lab versus field.** For the candidate-home and public routes the SLI of record is synthetic p75 on RMP-1 (section 2). Field LCP p75 is informational until the coverage rule is met. For other module routes LCP is not an SLO; the module-load span (B8, B9) is.
5. **Not claimed:** these figures are method illustrations. The numbers become targets only after the baseline from `WP-LOADBASE` and `WP-FED-SPIKE`.

## 5. SLO-17 and the federation SLOs are conditional

SLO-03 per-remote wording, SLO-17 and TEST-PER-004 apply as written only when `MF_MODE=federated` is activated (ADR-T03a). In the default `bundled` mode SLO-03 means module-chunk activation (section 2) and SLO-17 is not evaluated. The corresponding tests are tagged `[COND-FED]` in `16_*/TEST_CATALOG_REV2.md`.

## 6. Capacity note: unlogged rate-limit tables (REVW-41)

`BACKEND_ARCHITECTURE` section on rate limiting uses a PostgreSQL `UNLOGGED` table (`rate_limit_bucket`) as the default `RateLimitStore`. Facts that matter for capacity and for SLO-04:

| Property | Consequence | Capacity and SLO treatment |
|---|---|---|
| An unlogged table is truncated after crash recovery | After a primary crash or failover the buckets are empty, so login, verification-code and referee-token throttles reset to full allowance | Failover (SLO-30) opens a window in which credential-stuffing limits are weaker |
| An unlogged table is not written to the WAL and is not replicated | A promoted standby starts with an empty table | Same effect on every HA failover |
| The Redis trigger in OPEN-B1 is reactive | The weakness is only noticed after abuse | Move the trigger earlier for auth classes |

Proposed treatment: (a) put a **first-layer limit at the edge** for the auth classes (login, code verification, referee tokens, password reset), independent of the database, so a failover cannot reset all throttling; (b) the earlier Redis (or equivalent durable-enough store) trigger applies to auth classes at once, not at the general throughput trigger; (c) failover drills (TEST-REL-001) are extended by `TEST-REL-013`; (d) capacity sizing counts the edge limiter and the bucket write rate in the `rate_limit_bucket` row of OPS-CAP section 2. Owner: Backend Architect with SRE Lead; this is a proposal until adopted in OPS-CAP and BE-01.

## 7. Metrics consistency (REVW-39, consistency only)

The product agent defines the goal thresholds in `01_*`. This revision only lists what the metrics side must follow: GOAL-03 "adverse-impact audit passes quarterly" and GOAL-06 "zero cross-tenant incidents / audit pass" are binary and currently have no threshold definition; MET-013 states "target 100% by design" for explanation coverage; BR-T077 keeps its fairness threshold [OPEN]. Until the thresholds exist, METRICS_CATALOG entries tied to these goals read as **targets**, not compliance claims. No threshold is invented here. When `01_*` is revised, `20_*/METRICS_CATALOG.md` MET-013 and the audit metrics must cite the new threshold ids.

## 8. Open items

| Item | Owner | Ref |
|---|---|---|
| Counsel classification of operational telemetry | Privacy Lead, SRE Lead | OPEN-08, OPEN-FE-30 |
| Coverage threshold and mix tolerance for promoting RUM to an SLI of record | SRE Lead, Privacy Lead | section 3 |
| Re-check section 4 against the frontend budget re-derivation | Performance Engineer, Frontend Platform Lead | REVW-23, OPEN-FE-32 |
| Adopt the edge first-layer auth limit and earlier Redis trigger | Backend Architect | REVW-41, OPEN-B1 |
| Goal thresholds | Product Director | REVW-39 |
