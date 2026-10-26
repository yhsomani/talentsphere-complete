# Frontend Delivery - Review Fixes (federation, CDN, registry wording)

Doc ID: OPS-FE-REV2 (covers the frontend delivery parts of DEPLOYMENT_ARCHITECTURE, DEVOPS_AND_RELEASE_STRATEGY and OBSERVABILITY_DESIGN) · Owner: Platform Engineering / Frontend Platform · Version 2.0 · Status: Under Review
Relates: ADR-T23 (proposed), ADR-T24 (proposed in FEA-01-REV2), ADR-T19 · REVW-07, REVW-08, REVW-13 · REV-RES · MFA-01-REV2, FEA-01-REV2, PWA-01-REV2

Tags: [TARGET] [OPEN] [FED]. This file is **additive**; the three original documents in this folder are unchanged by this revision. Another editor already reworded DEPLOYMENT_ARCHITECTURE section 3 and DEVOPS_AND_RELEASE_STRATEGY to a bundled baseline with a conditional federated mode (ADR-T23); that wording stands and is not restated. This file adds only what those edits do not cover. No cost, traffic or capacity number is asserted.

## 1. Edge delivery for the bundled default (complements DEPLOYMENT_ARCHITECTURE section 3)
| Object | Cache-Control / rule |
|---|---|
| `index.html`, `sw.js`, `/version.json` | `no-cache` (unchanged) |
| `/assets/**` hashed JS, CSS, fonts (shell and lazy module chunks) | `public, max-age=31536000, immutable` |
| **`/assets/bo/**` (back-office chunks)** | Edge auth rule FD-14 runs **before** any shared cache; response `private, max-age=31536000, immutable` and `Vary: Cookie`; `404` for sessions without `admin.console` |
| `/mf/**`, `/mf/registry.json` [FED] | As in DEPLOYMENT_ARCHITECTURE section 3; `/mf/mf-admin/**` gets the same FD-14 rule |
| Public page snapshots (section 2) | Short `max-age` plus event-driven purge; `stale-while-revalidate` allowed; never contain per-user data |
| `/sitemap*.xml`, `robots.txt` | Short `max-age` (sitemaps change on publish events) |
| API | `private, no-store` by default (unchanged) |

Release, bundled: one artefact set per release; canary by shell cohort/flag (OPS-REL progressive delivery); rollback = previous artefact set plus new SW version string (VCD-01 section 6.9); kill-switch SW unchanged. The weekly federated build is a scheduled non-release job; no registry store, signing key or KMS custody is provisioned until federation is activated (MFA-01-REV2 section 1).

## 2. Edge rule for privileged chunks (FD-14) - operations view
| Item | Requirement |
|---|---|
| Rule | Valid session and capability `admin.console`, else `404`. Paths `/assets/bo/**` and, if federated, `/mf/mf-admin/**` |
| Order of evaluation | Auth check before cache lookup; gated responses are never stored in a shared cache without the check |
| Capability source | **[OPEN, owner Security Architect]** signed-token verification at the edge versus sub-request to an auth-check endpoint with a short per-session cache (MFA-01-REV2 section 2.4). A shared HMAC secret at the edge is not accepted without a security decision |
| Synthetic probes | Every 5 minutes [TARGET] from outside: anonymous and non-admin fetch of the back-office entry must be `404` (alert on any `200`); admin synthetic must be `200` |
| Release gate | Edge-rule test (anonymous, candidate, admin) and a precache-manifest scan for `bo` paths (PWA-01-REV2 rule R2b) |
| Honesty | Controls who can obtain the code; the bundle is not treated as secret; the server authorises every call (ADR-T19, INV-T01). Failure scenario FIM-01 FI-31 (MFA-01-REV2) |

## 3. Public page prerender hosting (ADR-T24, proposed)
Design is in FEA-01-REV2 section 2.2. Operations view:

| Component | Placement and requirement |
|---|---|
| Snapshot generator | A worker job class (`public-snapshot`) triggered by outbox events `job.published`, `job.updated`, `job.closed`, `job.taken_down`, profile visibility change and erasure; idempotent per entity and version; runs in the existing worker (no new service); retry and dead-letter as other job classes |
| Storage | Object storage prefix for snapshots; versioned; lifecycle rule removes snapshots of closed jobs after the notice period [OPEN] |
| Serving | Edge rule maps public canonical paths to the snapshot with fallback to the SPA shell when missing (never a 5xx); `Cache-Control` short plus purge call on each event |
| Sitemaps and robots | Worker job regenerates sitemap index and child files (at most 50,000 URLs each) on a schedule and on bulk change; `robots.txt` allows public paths and disallows app routes |
| Privacy | Hide/erasure events purge the snapshot and the sitemap entry first; purge SLA [OPEN, Privacy lead]; the privacy notice states that search-engine copies are outside our control |
| Renderer | Template renderer in the API versus headless render in the worker: spike [OPEN]; whichever is chosen runs behind the same job class |
| Observability | `public.snapshot_age_s` (per template), `public.snapshot_missing_total`, `public.purge_latency_s`, sitemap URL count; alert when age exceeds the freshness target [OPEN] or when the fallback rate rises |
| Failure modes | Generator down: pages stay at the last snapshot (stale), jobs closed meanwhile show closed content only after the purge, so purge failures are the priority alert; storage unavailable: edge falls back to SPA shell; renderer bug: previous snapshot retained, new write rejected by a validation check (title, canonical, JSON-LD present) |
| Capacity and cost | Add a row to the cost envelope (21_*): snapshot generation, storage, egress; vendor quotes empty by design (REVW-16) |
| Tests | No-JS fetch of each template; purge test; sitemap URL sample crawl; fallback test with the snapshot deleted |

## 4. Observability and SLO wording
| Place | Read as |
|---|---|
| OBSERVABILITY_DESIGN spans and metrics named `mf.registry.*`, `mf.remote.*` | [FED]. In bundled mode: span `module.load` (chunk load, `source=bundled`) and metric `module.load_error_total`; RUM attribute `ts.mf_mode` (already defined in FEA-01 section 11) distinguishes the modes |
| OPS-SLO SLO-03 (per-remote activation, 216 min/month) and SLO-17 (federation overhead) | Apply only when federated; SLO-17 cannot be met on cold deep links with the corrected budgets without a size trade-off (FEA-01-REV2 section 4.3). Owner of folder 15 to adopt |
| Alerts on `registry.*` and signature failures | [FED]; in bundled mode the equivalents are asset-reachability synthetics and the FD-14 non-admin `200` alert |
| New metrics | `edge.bo_denied_total` (by reason), `edge.bo_allowed_total`, `public.*` (section 3) |

## 5. Items for the governance pass
ADR-T24 and the ADR-T23 scope note (8 remotes, FD-14); OPEN items: edge capability source, purge SLA, freshness target, renderer spike, closed-job status-code policy [UNVERIFIED against current search-engine guidance]; cost envelope row for snapshot generation; FIM-01 FI-31 runbook (RB-nn) to be assigned by operations.

## 6. Supersession map (relationship only)
| This file | Supersedes |
|---|---|
| section 1 | The cache-control summary in DEPLOYMENT_ARCHITECTURE section 3 for the bundled default (adds `/assets/bo/**` and snapshot rows) |
| section 2 | Nothing existing; fills the missing mechanism behind "privileged UI is never delivered" (MFA-01 section 4 original claim) |
| section 3 | Nothing existing; new design for OPEN-FE-17 |
| section 4 | OBSERVABILITY_DESIGN metric names for bundled mode; OPS-SLO applicability (folder 15, relationship only) |
