# SLO and Performance Targets

Doc ID: OPS-SLO · Owner: SRE Lead (with Performance Engineer) · Version 1.0 · Status: Draft for Review · Relates: GOAL-08, GOAL-06, ADR-T03, ADR-T04, ADR-T05, ADR-T09, ADR-T11, ADR-T16, ADR-T18, INV-T13, BR-T060, OPEN-12, OPEN-14, OPEN-15, OPEN-23, 16_QA_AND_TESTING/TEST_CATALOG.md, 17_DEVOPS_AND_INFRASTRUCTURE/OBSERVABILITY_DESIGN.md

Tags: **[TARGET]** proposed, binding only after calibration; **[CONF]** confirmed by a canonical document; **[OPEN]** unresolved; **[REF]** reference-system fact (not inherited). Documentation status is not implementation status; nothing here claims the system exists.

## 1. Ground rules

1. **No number is a measurement.** Every value below is a starting hypothesis derived from a stated rationale and assumption. It becomes a commitment only after `WP-LOADBASE` (22_*) produces a baseline and the owner signs a calibration note (OPEN-15).
2. Each SLO has: SLI definition (good events / valid events), target, window, rationale, assumption, measurement method, and the alert that protects it (see OPS-OBS burn-rate rules).
3. Internal SLOs are **not** customer SLAs. Any contractual commitment is separate and needs legal/commercial review (OPEN-31).
4. Error budget policy: when a budget is exhausted, feature releases touching that surface pause and reliability work takes priority (owner: SRE Lead; exceptions need Incident Commander + Product Director approval).
5. Arithmetic used throughout: a 30-day window has 43,200 minutes. Budget = (1 − target) × 43,200 min. 99.9% gives 43.2 min; 99.5% gives 216 min; 99.95% gives 21.6 min.

## 2. Measurement stack (summary)

| Source | What it gives | Used for |
|---|---|---|
| Ingress/LB + API server metrics (OpenTelemetry) | server-side success and latency per route class | SLO-01…SLO-06 and the §5 latency classes (authoritative for server SLIs) |
| Synthetic probes from outside the network (scripted user journeys) | black-box availability, cert/DNS, remote activation | SLO-02, SLO-03, catches failures where no request reaches the server |
| Real User Monitoring (RUM; `web-vitals` style field data, sampled, consented) | LCP, INP, CLS by route, device class, remote | SLO-13…SLO-16 (authoritative for field vitals) |
| Lab runs (Lighthouse CI on reference mobile profile, Playwright traces) | regression guard per PR | release gates, never a substitute for field data |
| Worker/outbox instrumentation | enqueue-to-start age, attempts, DLQ depth | SLO-20…SLO-25 |
| Restore/failover drills | measured RPO/RTO | SLO-30…SLO-33 |

## 3. Reference mobile profile (used by every client-side target)

| Profile | Definition | Purpose | Status |
|---|---|---|---|
| RMP-1 (lab) | Lighthouse default mobile emulation: small-viewport phone, 4× CPU slowdown, simulated Slow-4G ≈ 1.6 Mbit/s down, ≈ 150 ms RTT. Pin the exact Lighthouse version in CI because defaults change. | Deterministic per-PR regression guard | [TARGET] — confirm constants when pinning |
| RMP-2 (device) | One low-tier Android phone and one oldest-supported iPhone on a throttled real network, via `WP-IOS-DEVICE-LAB` | Catch what emulation misses (memory pressure, WebKit behaviour) | [OPEN-12] device list |
| RMP-3 (field) | RUM p75 segmented by device class (low/mid/high by `deviceMemory`/cores where available) and connection type | Ground truth | [TARGET] |

Transfer-time formula for budgets: `t_transfer = bytes × 8 / throughput`. At 1.6 Mbit/s, 100 KB (compressed) takes 0.5 s. Critical-path budget `B ≈ (T_target − T_ttfb − T_cpu) × throughput / 8`. With T_target = 2.5 s, T_ttfb ≈ 3 × RTT = 0.45 s (DNS+TCP+TLS+request, repeat visits less), T_cpu allocated 1.0 s, B ≈ (2.5 − 0.45 − 1.0) × 1.6e6 / 8 ≈ 210 KB. This is an **illustration of the method**; the per-route budget is set from RMP-1 measurements (OPEN-15).

## 4. Availability SLOs

| ID | SLI (good / valid) | Target (30-day) | Budget | Rationale | Assumption | Measurement | Alert protecting |
|---|---|---|---|---|---|---|---|
| SLO-01 | Core API: non-5xx responses within deadline / valid requests (4xx from client errors excluded; 429 caused by our own load shedding counts as bad) | 99.9% [TARGET] | 43.2 min | Stateless API replicas (ADR-T05) + HA Postgres can plausibly reach three nines in one region; higher needs multi-region (OPEN-23) | Single region, ≥2 API replicas, HA DB | Ingress + server metrics; cross-check with synthetic | Multi-window burn rate on SLO-01 |
| SLO-02 | Shell boot: synthetic journey "load `/`, shell interactive, capabilities fetched" success / attempts | 99.9% [TARGET] | 43.2 min | Shell is the single point through which every remote loads; it must be at least as available as the API | Shell served from CDN with origin fallback | External synthetic every N min [TARGET param] from ≥3 vantage points | Synthetic fail ≥ 2 consecutive |
| SLO-03 | Remote activation: successful mount of each remote / activation attempts (per remote) | 99.5% per remote [TARGET] | 216 min | A remote failure is contained by fallback (ADR-T03/T18) so tolerance is lower than the shell; user impact is partial | Last-known-good fallback available | RUM event `remote.activated` vs `remote.failed` + synthetic per remote | Per-remote error ratio alert |
| SLO-04 | Auth: successful login/refresh/session-validate / valid attempts (excludes wrong credentials) | 99.9% [TARGET] | 43.2 min | Auth outage blocks all authenticated use; refresh failures log users out | Cookie BFF routes (ADR-T06) | Server metrics on `/auth/*` | Burn rate |
| SLO-05 | Background pipeline health: share of 5-min windows where outbox oldest-event age ≤ SLO-20 | 99% [TARGET] | 432 min | Asynchronous work tolerates longer disruption than interactive paths | Worker count ≥ 2 | Outbox age gauge | Age threshold alert |
| SLO-06 | Billing webhook ingestion: verified webhooks processed within 5 min / received | 99.9% [TARGET] | 43.2 min | Entitlements depend only on webhooks (INV-T17); late processing leaves paid users locked or lapsed users entitled | Stripe retries with backoff | Webhook handler metrics + Stripe event delivery dashboard | Lag alert |

Exclusions (declared up front, to prevent post-hoc redefinition): announced maintenance windows per PROC-11 (capped per month by policy [OPEN-15]), failures originating in the user's network, and abusive traffic blocked by rate limiting. Excluded minutes are still reported.

## 5. API latency targets by class

Server-side latency measured at ingress from request received to last byte sent. Network RTT on RMP-1 (≈ 150 ms) is **additional** and counted in the client-side journey targets (§6).

| Class | Examples | p95 | p99 | Rationale | Assumption | Measurement |
|---|---|---|---|---|---|---|
| C1 point read | `GET /me`, `GET /applications/:id` | 200 ms [TARGET] | 500 ms | Keeps one round trip well under the ~1 s "flow of thought" threshold (Nielsen usability literature; secondary) even after RTT | Primary-key indexed, cached policy decision | k6 baseline + production histogram per route |
| C2 list/read-heavy | job list, application pipeline, notifications | 350 ms | 800 ms | Paginated cursor queries with bounded page size | Page size ≤ [TARGET param], covering indexes | same |
| C3 write | create application, update profile, stage change | 400 ms | 1,000 ms | Includes outbox insert + audit in one transaction (INV-T12), idempotency lookup | Single-statement-ish transactions; no external call inside txn | same + trace span `db.tx` |
| C4 auth | login, refresh, passkey assertion | 300 ms (excl. password hash cost tuned separately) | 800 ms | Hashing cost is deliberately non-trivial; tune cost so hash is a declared fraction of the budget | Argon2id/bcrypt-class cost parameter owned by Security | server histogram; hash timed separately |
| C5 search | job search, candidate search | 400 ms | 800 ms | **[CONF]** 400 ms p95 is ADR-T11's revisit trigger; p99 ≈ 2× p95 as a working rule | Target corpus per OPEN-15; pgvector + FTS | search-specific load test at target corpus (TEST-PER-002) |
| C6 compute-on-demand | match explanation, readiness score | 800 ms | 2,000 ms | Heavier but user-initiated; must show progress UI past 1 s | Precomputed features where possible | span-level histogram |
| C7 upload init / signed URL | evidence upload start | 300 ms | 700 ms | Metadata only; bytes go direct to object storage | Direct-to-storage upload | server histogram |
| C8 AI-assisted | resume suggestions | time-to-first-token ≤ 2 s; completion async | n/a | Streaming or async job; never blocks other classes (bulkhead) | Provider latency is outside our control; gateway enforces timeout | gateway spans, provider-tagged |
| C9 webhook ack | Stripe, email provider events | 300 ms | 800 ms | Provider timeouts are short; do work asynchronously after signature check | Persist-then-ack | handler histogram |

Per-request deadline propagation: the API sets `deadline = min(client budget, class p99 × 2)` and every outbound call gets a slice (see OPS-FMEA §2).

## 6. Client performance targets (reference mobile profile)

| ID | Metric | Target | Where measured | Rationale | Assumption | Method |
|---|---|---|---|---|---|---|
| SLO-13 | LCP | ≤ 2.5 s at p75 field; lab ≤ 2.5 s on RMP-1 for public + candidate home routes [TARGET] | RUM + Lighthouse CI | **[CONF-external]** Google's published "good" Core Web Vitals threshold (web.dev); add to RES-01 | Critical path budget §3 holds | RUM p75 by route and device class |
| SLO-14 | INP | ≤ 200 ms at p75 field [TARGET] | RUM (lab proxy: Total Blocking Time) | Published "good" threshold (web.dev) | Long tasks < 50 ms rule enforced on interaction handlers | RUM INP attribution; Playwright long-task assertion in CI |
| SLO-15 | CLS | ≤ 0.1 at p75 [TARGET] | RUM + Lighthouse | Published "good" threshold | Reserved space for remote slots (skeletons) to avoid shift on remote mount | RUM + lab |
| SLO-16 | "TTI" substitute | Lab TBT ≤ 200 ms on RMP-1; field INP above [TARGET] | Lighthouse CI | Time-to-Interactive was retired from Lighthouse scoring; TBT is the lab proxy. Verify against current Lighthouse docs at pin time. | — | Lighthouse CI per PR |
| SLO-17 | Remote activation overhead | federated route LCP ≤ bundled-mode baseline + Δ_F, with Δ_F ≤ 10% of LCP budget (250 ms) at p75 [TARGET] | A/B in `WP-FED-SPIKE`, then RUM `remote.activation_ms` | Δ_F is an *allocation policy* (10% of the 2.5 s budget), justified because ADR-T03's counter-argument is "lazy routes give 80% at 20% cost" — if overhead exceeds the budget, MF_MODE=bundled (OPEN-03) | One extra manifest + remote-entry round trip (≈ 1–2 RTT) on first visit; warm via SW | Spike benchmark; RUM thereafter |
| SLO-18 | Warm re-visit shell | interactive from SW cache with no network ≤ [TARGET: 1 s on RMP-1] | Lighthouse (repeat view) + RUM | Installed-PWA value proposition (ADR-T02) | SW precache of shell + current remote entries | Repeat-view lab run |
| SLO-19 | Per-route JS budget | critical-path JS+CSS ≤ B(route) from §3 formula [OPEN-15] | CI bundle-size check | Bytes dominate load time on RMP-1 | Compressed transfer size | CI size gate per remote and shell |

## 7. Background job, event and search throughput

| ID | Class | Target | Rationale | Assumption | Measurement |
|---|---|---|---|---|---|
| SLO-20 | Outbox dispatch: oldest undispatched event age | p99 ≤ 5 s [TARGET] | Downstream effects (notifications, recompute) should feel prompt; Postgres polling/LISTEN is adequate at modest throughput (ADR-T09) | Dispatcher poll interval ≤ 1 s | gauge `outbox.oldest_age_s` |
| SLO-21 | Transactional email/verification jobs: enqueue→start | p95 ≤ 30 s | Users wait on codes and referee links | Provider API p95 outside our control | job metrics by class |
| SLO-22 | Virus scan: upload→visible (BR-T003) | p95 ≤ 60 s | Evidence must not remain pending long enough to frustrate; larger files scale with size | Scanner sidecar capacity per ASM-C-07 | scan job age |
| SLO-23 | Dependent recompute after revocation (BR-T005) | p95 ≤ 5 min | Revoked evidence must stop inflating matches quickly; async and audited | Batched recompute | job age + audit event time delta |
| SLO-24 | Erasure (BR-T060) | completes ≤ 21 days internal target of the 30-day rule [TARGET] | Internal buffer of ~30% before the stated 30-day limit; retention exceptions per OPEN-08 | Backups age out per policy | request state machine timestamps |
| SLO-25 | Dead-letter queue | oldest DLQ item reviewed ≤ 1 business day [TARGET] | Poison jobs must not rot silently | On-call or ops rota exists (OPEN-16, OPEN-39) | DLQ gauge + ticket link |
| TP-01 | Sustained job throughput | `λ_max = W × c / s̄ × u`, W workers, c concurrency per worker, s̄ mean service time, u ≤ 0.6 utilisation cap | Queueing: latency grows non-linearly near saturation; 0.6 leaves burst headroom | s̄ measured per class | load test (TEST-PER-005) |
| TP-02 | Remote load capacity | manifest + remote-entry requests are CDN-cache served; origin sees only cache misses | Content-hashed immutable assets (OPS-DEP §3) | Cache hit ratio target in ASM-C-09 | CDN logs |

## 8. Recovery objectives (RPO / RTO)

| ID | Scenario | RPO | RTO | Rationale | Assumption | Measurement |
|---|---|---|---|---|---|---|
| SLO-30 | Single DB node failure (HA) | ≈ 0 for committed transactions with synchronous replica [TARGET] | ≤ 5 min automatic [TARGET] | Core to SLO-01 budget (43.2 min) | HA mechanism chosen under OPEN-14 supports synchronous/quorum commit | Failover drill (TEST-REL-001) |
| SLO-31 | Logical corruption / bad migration, restore from PITR | ≤ 5 min [TARGET] | ≤ 1 h to a verified restored copy [TARGET] | Point-in-time recovery needs continuous WAL archiving; interval ≤ 5 min bounds loss | WAL archive to separate failure domain; restore tested | PITR drill (TEST-REC-001); record measured vs target |
| SLO-32 | Object storage loss/corruption | RPO ≤ [OPEN-23] with versioning enabled | RTO ≤ [OPEN-23] | Evidence files are irreplaceable user data | Versioning + replica or off-site copy | Restore drill (TEST-REC-003) |
| SLO-33 | Zone/region loss (DR) | [OPEN-23] | [OPEN-23] | Depends on single- vs multi-region decision and cost; DR events can exceed monthly SLO budget and must be declared as such | — | DR exercise (TEST-REC-004) |
| SLO-34 | Search index loss | n/a (derived data) | `reindex_time = corpus_rows / indexing_rate` — must be ≤ [TARGET: 1 h] at target corpus | Index is rebuildable from Postgres (ADR-T11) | Indexing throughput measured | Rebuild drill |
| SLO-35 | Config/secrets loss | n/a | ≤ 30 min to restore from secret manager + IaC [TARGET] | IaC makes environment reproducible | OPEN-21/22 decided | Rebuild-from-scratch drill |

Backups must be encrypted and stored off the primary host. **[REF]** The reference runbook states its backup scripts "are not yet executed" and has no established RPO/RTO — a known gap, so the target must prove drills before any real-user launch.

## 9. Demand and capacity model (condensed; sizing in OPS-CAP)

Variables and assumptions (all values [OPEN] until `WP-LOADBASE` and launch forecasts; no number is assumed here):

| ID | Symbol | Meaning | Source / owner |
|---|---|---|---|
| ASM-C-01 | MAU | monthly active users by persona (candidate, recruiter, instructor, institution) | Product/Finance forecast |
| ASM-C-02 | a | DAU/MAU ratio | RUM/analytics once live; proxy from comparable products |
| ASM-C-03 | s | sessions per DAU per day | analytics |
| ASM-C-04 | r | API requests per session (by class mix m_c) | trace sampling, load model |
| ASM-C-05 | p | peak-to-average factor | observed hourly profile |
| ASM-C-06 | b | background jobs per DAU-day by class | worker metrics |
| ASM-C-07 | f | mean evidence file size and uploads per active candidate | storage metrics |
| ASM-C-08 | k | DB rows written per request by class | trace sampling |
| ASM-C-09 | h | CDN cache hit ratio for remote assets | CDN logs |

Peak request rate: `RPS_peak = MAU × a × s × r × p / 86,400` (seconds in a day). Required API replicas: `N = ceil(RPS_peak × s̄_cpu / (cores_per_replica × u_target)) + N_spare`, with `u_target ≤ 0.6` and `N_spare ≥ 1` (survive one replica loss; N+1). DB connections: `conns = N × pool_per_replica + workers × pool_per_worker + admin`; must be ≤ pooler limit × 0.8. Storage growth: `ΔGB/month = uploads_per_month × f / 1e9 × replication_factor`. See OPS-CAP for the scaling triggers.

```mermaid
flowchart LR
  A["Forecast: MAU, a, s, r, p"] --> B["RPS_peak"]
  B --> C["Replica count N = f(CPU per request, u_target)"]
  B --> D["DB connections and IOPS"]
  A --> E["Job rate lambda per class"]
  E --> F["Worker count W = lambda x service_time / (c x u)"]
  C --> G["Cost model (21_COST_AND_FINOPS)"]
  D --> G
  F --> G
  H["WP-LOADBASE measurements"] -. calibrate .-> C
  H -. calibrate .-> D
  H -. calibrate .-> F
```

## 10. Error-budget and review cadence

| Item | Rule | Owner |
|---|---|---|
| Budget report | Monthly SLO review: burn per SLO, top contributors, actions | SRE Lead |
| Freeze trigger | Budget exhausted → release freeze for the affected surface except reliability/security fixes | Release Manager + SRE Lead |
| Recalibration | After baseline (WP-LOADBASE), after launch, and after any ADR revisit trigger fires | SRE + Product |
| SLO change control | Changing a target requires a note in this document and the dashboard config in the same change | SRE Lead |

## 11. Contradictions and dependencies noted

- Targets here refer to ADR-T11's 400 ms p95 search trigger and to ADR-T03's `MF_MODE` fallback; both are consistent with those ADRs.
- SLO-30 assumes synchronous replication; if OPEN-14 selects a hosting option that cannot offer it, SLO-30 RPO changes and Risk RISK-12 applies.
- External thresholds (Core Web Vitals, Lighthouse constants) are not yet in RES-01; Research team should add them (OPEN-13).
