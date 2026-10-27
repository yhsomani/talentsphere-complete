# DevOps and Release Strategy

Doc ID: OPS-REL · Owner: Release Engineering Lead (with Platform Architect) · Version 1.0 · Status: Draft for Review · Relates: ADR-T03, ADR-T05, ADR-T09, ADR-T17, ADR-T18, ADR-T19, FF-01…FF-10, INV-T14, QA-STRAT §9, OPS-DEP, OPS-OBS, OPS-FMEA, OPEN-14, OPEN-21, OPEN-22, OPEN-35, OPEN-36, WP-MONOREPO-CI, WP-IAC-ENVS, WP-CANARY

> **Revision 2 folded in (2026-10-27)** from `FRONTEND_DELIVERY_REVIEW_FIXES.md`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.

All tool names are **options** unless an ADR fixes them. **[REF]** marks reference-system facts: the reference repository is a pnpm monorepo with Fastify API, worker, Vite web app and SQL migrations, deployed to an Oracle VM via Compose and Coolify descriptors, with a documented rule that "build files are read-only for AI agents". The target does not inherit those choices.

## 1. Principles

1. Compatibility-aware delivery: API and worker may deploy independently when contracts allow. Browser domain modules ship together in the proposed bundled baseline; independently deployed remotes require ADR-T23 federation activation and the compatibility gates in MFA-01/VCD-01.
2. Artefacts are built once, signed, and promoted unchanged through environments; configuration varies, binaries do not.
3. Every deployment is reversible or has a documented forward-fix; irreversible steps (contract migrations) are isolated in their own release.
4. Fitness functions are release gates, not advice (FF-01…FF-10 mapped in §9.4).
5. No secret enters a browser bundle, build log or image layer (INV-T14).
6. Production changes are made by pipelines; humans use break-glass paths that are time-boxed and audited (PROC-04).

## 2. Monorepo layout (ADR-T17)

```mermaid
flowchart TB
  root["repo root: pnpm workspace + task graph"]
  root --> apps
  root --> packages
  root --> infra["infra/ (IaC modules, env stacks)"]
  root --> tools["tools/ (lint rules, manifest validator, catalog lint)"]
  root --> docs["docs/ (ADRs, runbooks as code)"]
  apps --> shell["apps/shell (MOD-SHELL host)"]
  apps --> remotes["domain modules (bundled by default; independent remote deploys only if federation is activated)"]
  apps --> api["apps/api (modular monolith)"]
  apps --> worker["apps/worker (BMOD-WORKER)"]
  packages --> contracts["packages/contracts (Zod, OpenAPI, AsyncAPI)"]
  packages --> domain["packages/domain (pure rules, state machines)"]
  packages --> policy["packages/policy (BMOD-POLICY)"]
  packages --> hostc["packages/host-contract (semver Host Contract types)"]
  packages --> ui["packages/ui (design system, tokens)"]
  packages --> obs["packages/observability (OTel, log redaction)"]
  packages --> cfg["packages/config (typed env, validation)"]
```

| Rule | Mechanism |
|---|---|
| Remotes depend on `host-contract`, `contracts`, `ui`, `observability` only — never on each other | dependency-cruiser (FF-03) |
| API modules expose only `index.ts` | dependency-cruiser (FF-02) |
| Contract packages are semver'd; breaking change = major | oasdiff (FF-06) + changeset requirement |
| Bundled mode uses workspace dependency rules; singleton ranges and the manifest validator (FF-04) apply only if federation is activated | workspace checks; FF-04 conditional |
| Code ownership | CODEOWNERS per app/module/package; Security owns `packages/policy` and `infra/` security modules |
| Lockfile and tool versions pinned; renovate-style updates via PR with the full gate set | CI |

## 3. CI/CD pipelines per deployable

The bundled baseline builds domain modules as lazy chunks in the shell release. The separately published remote pipeline below is conditional on ADR-T23 federation activation; it is not a baseline deployable.

```mermaid
flowchart LR
  PR["Pull request"] --> AFF["Affected-only graph (task runner)"]
  AFF --> S1["Static RG-01"]
  S1 --> T1["Unit, component, integration RG-03"]
  T1 --> C1["Contract and compat RG-02, RG-09"]
  C1 --> B1["Build once"]
  B1 --> SB["SBOM, scan, sign RG-04"]
  SB --> PUB["Publish to artefact store"]
  PUB --> STG["Deploy to staging (auto)"]
  STG --> E2E["E2E, a11y, perf RG-05..07"]
  E2E --> REL["Release candidate record + compat matrix"]
  REL --> CAN["Canary RG-11"]
  CAN --> PROD["Progressive rollout to all"]
```

| Deployable | Build output | Pipeline specifics | Deploy action | Verification |
|---|---|---|---|---|
| Shell (bundled baseline) | Static assets and local lazy module chunks, content-hashed | Host-contract checks; SW generation for shell and local chunks; no runtime registry or trust anchors | Upload hashed assets and switch `index`/SW entry and `/version.json` | TEST-DEP-008, TEST-PWA-001 |
| Federated remote (conditional) | Static assets with content-hashed files at immutable `/mf/<name>/<version>/`, plus a registry entry | Federation validators (FF-04), compat check vs current shell + registry + API range (FF-08), headless contract-smoke against the staging registry, bundle-size budget (MFA-01 release flow) | Only after federation activation: publish immutable assets, then **sign the entry (KMS key, `sequence`+1, `rollbackTo` = current stable) and put the registry document** on the canary channel; promotion to stable is a second signed put | TEST-FED-003, TEST-FED-012 |
| API | OCI image (multi-arch if needed) | OpenAPI diff, authz matrix, tenant canary on ephemeral DB | Rolling/canary replicas; readiness gating | Health/readiness, TEST-DEP-001 |
| Worker | OCI image | Job-handler idempotency tests; fencing tests | Rolling; drain in-flight leases before stop | TEST-REL-005 |
| Migrations | Versioned SQL bundle | Migration lint (FF-10), expand-compat test, lock budget | Run as a separate gated step before API roll-out (expand) / after (contract) | TEST-DAT-002/003 |
| Infra | IaC plan | Policy-as-code checks; plan review | Apply by pipeline after approval | drift detection |

**Affected-only builds:** the task runner computes the affected set from the workspace graph and changed files; changes to `contracts`, `host-contract`, `policy`, `domain` or `ui` rebuild and retest every dependent (TEST-DEP-006). A scheduled full build (nightly) catches graph blind spots.

**Caching:** module build caches keyed by lockfile + source hash; cache poisoning protection by signing cache entries or restricting cache writes to protected branches.

## 4. Environments

| Env | Purpose | Deploy trigger | Config source | Data |
|---|---|---|---|---|
| dev (local) | Development | n/a | `.env.example` with no secrets | synthetic |
| ci | PR checks | PR | CI vars | synthetic |
| preview | Remote-scoped previews against staging API | PR label | staging read-only config | synthetic |
| staging | Pre-production integration, same IaC modules | merge to main | staging secrets | synthetic + tenant canaries |
| production | Real users, canary then progressive | manual approval of RC (or automated after gates, policy [OPEN-15]) | production secrets (secret manager) | real |

Separate cloud accounts/projects (or at least separate credentials and networks) for staging and production. Staging never holds production data or secrets. **[REF]** the reference uses separate secrets per environment and refuses in-memory storage in production/staging — a pattern to keep, as startup config validation (TEST-DEP-007).

## 5. Configuration and secrets

| Topic | Rule |
|---|---|
| Typed config | One typed schema (`packages/config`) validated at boot; invalid or missing production config fails fast |
| Build-time vs run-time | Browser bundles contain only public build-time values; everything else is server-side runtime config. Remote bundles never embed environment-specific secrets (INV-T14) |
| Secret store | A managed secret manager (option set: cloud-native manager, Vault-class, or sealed-secrets with encrypted-at-rest repo) [OPEN-22]; secrets injected at runtime, short-lived where the provider supports it |
| Rotation | Documented rotation for session signing keys, manifest signing keys (dual-key window), DB credentials, provider API keys, webhook secrets (RB-26). Rotation is rehearsed |
| Access | Least privilege; human access to production secrets requires PROC-04 grant |
| Scanning | Pre-commit + CI secret scanning; canary secret test (TEST-SEC-015) |
| Webhook secrets | Per-provider, per-environment; verification code covered by TEST-BIL-002 |

## 6. Supply chain: signing, SBOM, dependency scanning

| Control | Approach (options) | Gate |
|---|---|---|
| SBOM | Generated per artefact (CycloneDX or SPDX) and stored with the release record | RG-04, TEST-SEC-025 |
| Vulnerability scan | Dependency scan (lockfile) + container image scan + IaC scan; policy: no unwaived critical/high with a fix available; waivers expire | RG-04 |
| Signing | Keyless or key-based artefact signing (Sigstore-class); deploy step verifies signature and provenance (build identity) | TEST-DEP-004 |
| Registry signing | Registry entries signed (Ed25519, key in KMS/HSM-class custody [OPEN-36]); trust anchors compiled into the shell; shell verifies signature, `sequence`, `notAfter` (ADR-T19, MFA-01 FD-04) | TEST-SEC-014 |
| SRI | Content-hash integrity attributes on remote entry and critical chunks | TEST-SEC-013 |
| Dependency hygiene | Lockfile-only installs, no install scripts by default for untrusted packages, pinned versions, provenance checks where available, license policy | CI |
| Build isolation | Ephemeral builders, least-privilege tokens, no long-lived credentials in CI | CI |
| Third-party scripts | None on critical path; CSP allowlist | TEST-SEC-027 |

## 7. Infrastructure as Code

| Topic | Decision status |
|---|---|
| Tool | OpenTofu/Terraform-class or Pulumi-class [OPEN-21] |
| Structure | Reusable modules (network, db, object storage, cdn, compute, observability, secrets) + per-env stacks; staging and production use the same modules |
| State | Remote, encrypted, locked; access restricted |
| Changes | PR → plan → policy checks → approval → apply by pipeline; drift detection scheduled |
| Recovery | Environment reproducible from IaC + backups (SLO-35, TEST-REC-*) |
| Constraint | Hosting choice (OPEN-14) may change module internals but not the logical topology in OPS-DEP |

## 8. Database migration deployment

| Principle | Detail |
|---|---|
| Append-only, contiguous, each with rollback or forward-fix note | FF-10, TEST-DAT-001 |
| Expand → migrate → contract | **Expand** (additive: new nullable columns/tables/indexes created concurrently) ships with or before code that tolerates both shapes; **backfill** is a resumable, idempotent job (TEST-DAT-004); **contract** (drop/rename/tighten) ships in a later release after all running code (including N-1 API, workers and queued jobs) no longer uses the old shape |
| Compatibility window | The currently deployed API (N) and the previous one (N-1) must both work against the schema after an expand (TEST-DAT-002); this is what makes API rollback safe |
| Locking | `lock_timeout` and `statement_timeout` on migrations; concurrent index builds; large table changes via batches; duration/lock budget tested on a sized copy (TEST-DAT-003) |
| Execution | A dedicated migration job with its own DB role; runs once (advisory lock); API instances never auto-migrate at boot in production |
| RLS | New tenant tables ship with `org_id` and policies in the same migration (TEST-DAT-009) |
| Rollback | Prefer forward-fix; a down-migration is allowed only when data-safe; destructive steps require a verified backup/PITR marker taken immediately before (FM-28) |
| Ordering with deploys | expand → deploy API → (flip flag) → backfill → verify → later release: contract |
| Data corrections | Never ad-hoc SQL in production; use reviewed, audited scripts via PROC-08 |

## 9. Feature flags, progressive delivery and release gates

### 9.1 Feature flags

| Class | Purpose | Lifetime | Example |
|---|---|---|---|
| Release flag | Dark-launch and progressive exposure | Remove within a defined period after full rollout [OPEN-15 param] | new pipeline view |
| Kill switch | Immediate disable of a risky capability | Permanent for R1/R2 features | AI gateway, push, SW (RB-09), search, uploads |
| Ops flag | Degradation ladder controls | Permanent | shed P3 jobs, read-only mode |
| Entitlement | Business gating (billing) | Product-driven | **Not a flag**: entitlements are server-derived from billing state (INV-T17) |
| Experiment | A/B tests | Per experiment | subject to ANL-MET guardrails |

Rules: flag evaluation is server-side for anything affecting authorization or data; client flags are UX hints only (INV-T01). Flags have owner, expiry, and test (TEST-DEP-005). Flag changes are audited. Platform: build vs buy [OPEN-35].

### 9.2 Canary and progressive delivery

| Stage | Exposure | Bake / decision | Auto-halt guardrails |
|---|---|---|---|
| S0 Staging soak | Synthetic traffic | Gate RG-05…RG-10 | any gate red |
| S1 Internal | Internal and synthetic test tenants | short bake [param] | error ratio, synthetic checks |
| S2 Canary cohort | Small cohort chosen by stable hash of principal (not by tenant tier, to avoid unfair treatment) [param] | bake long enough to see diurnal peak [param] | error ratio vs baseline, p95/p99 vs SLO, INP regression, auth failures, business proxy (successful apply rate), log error signatures |
| S3 Majority | Expanding steps | each step has hold | same + burn rate |
| S4 Full | All | Post-release verification (synthetic + dashboards) | burn rate |

Remote releases use the registry **canary channel** (`?ch=canary`) selected by a shell flag for a cohort (MFA-01 defaults 5% / 30 min are [TARGET] pending baseline); API releases use replica canary with header/cohort routing; worker releases use a canary worker pool handling a subset of job classes. Statistical rules (minimum sample, baseline comparison) are specified in the canary analysis config [OPEN-15].

### 9.3 Release record

Each release produces: artefact digests, SBOM, signatures, compat matrix (shell × remote × API × schema), gate results, flags touched, migration list, rollback plan, owner, approval, and links to dashboards. Stored immutably; used by incident response.

### 9.4 Gates and fitness functions

| Gate (QA-STRAT §9) | Fitness functions enforced |
|---|---|
| RG-01 | FF-01, FF-02, FF-03, FF-07, FF-10 |
| RG-02 | FF-06, FF-08 |
| RG-03 | FF-05, INV-T01…T04 |
| RG-04 | INV-T14 |
| RG-09 | FF-04, FF-03 |
| RG-13 | FF-09 |

No gate may be disabled by pipeline configuration without a recorded waiver; changes to gate definitions require review by Release Engineering and Security.

## 10. Rollback sequencing (remote + API + service worker + data)

Compatibility rules that make rollback possible:

| Rule | Statement |
|---|---|
| R-1 | Within `/api/v1` only additive, oasdiff-clean changes; the server honours clients up to a 90-day floor after a deprecation notice and answers `426 client-outdated` below it (VCD-01 VC-06, [TARGET], measured from the age distribution of active shells) |
| R-2 | A remote declares `apiRange`, `hostContract`, `minShell` and `dataSchema`; the publish step refuses promotion that leaves a gap, and the shell enforces the same at runtime (VC-02) |
| R-3 | Schema changes follow expand/contract so API N and N-1 both work |
| R-4 | SW changes are forward-only: a SW cannot be un-installed from a user device by deploy; "rollback" = publish a new SW that restores previous behaviour, or trigger the kill-switch |
| R-5 | Worker handlers are backward compatible with queued job payload versions |
| R-6 | The shell supports Host Contract majors N and N-1 for at least 90 days (VC-12), so a shell rollback never strands published remotes |
| R-7 | Operator rollback of a remote = publish the previous artefacts as a **new entry with a higher `sequence`** (or rely on the signed `rollbackTo`), never lowering `sequence` (anti-rollback, MFA-01 section 5) |

Scenarios:

| Scenario | Order | Notes |
|---|---|---|
| Remote-only defect | 1) Clients self-heal to `rollbackTo`/LKG; operator publishes the previous version as a new higher-`sequence` entry (or sets `status:"disabled"` as a kill switch) 2) Observe within the registry TTL 3) Fix forward | Independent of API/shell (TEST-FED-014); propagation bounded by registry TTL (at most 300 s [TARGET]) |
| API-only defect | 1) Roll back replicas to N-1 (schema is expand-compatible) 2) Verify remote compat matrix still green 3) Fix forward | Fails if a contract migration was done — hence contract is a separate release |
| Coordinated change (new field consumed by remote) | Deploy order: schema expand → API (adds field, backward compatible) → remote. Rollback order is the reverse: remote → API → (schema stays) | Never roll API back while a promoted remote requires the new field; remote first |
| Shell/Host Contract change | 1) New shell built with embedded boot registry and trust anchors 2) Remotes declare ranges supporting both shells 3) Rollback shell: restore previous `index`, SW entry and `/version.json`; remotes still compatible (R-6) | Shell supports Host Contract N and N-1 (VC-12) |
| Service worker defect | 1) Flip SW kill-switch flag (clients unregister on next load) 2) Publish corrected SW 3) Remove flag | RB-09, TEST-PWA-009 |
| Bad migration | 1) Stop deploy 2) Execute forward-fix or down-migration per note 3) If data damaged: PITR restore to side instance and repair (RB-30) | TEST-DEP-003, TEST-REC-001 |
| Worker defect | 1) Pause affected queue class 2) Roll back worker 3) Replay safely (dedupe) | RB-11 |

```mermaid
sequenceDiagram
  participant Ops as Release owner
  participant Reg as Manifest registry
  participant API as API replicas
  participant SW as Service worker flag
  Ops->>Reg: Publish previous version as new entry (higher sequence) or disable remote
  Reg-->>Ops: Registry document live (ETag changed)
  alt API also defective
    Ops->>API: Roll back to N-1 (schema expand-compatible)
    API-->>Ops: Healthy, compat matrix green
  end
  alt stale or bad SW
    Ops->>SW: Enable kill switch
  end
  Ops->>Ops: Verify SLO burn stops and synthetic passes
```

Rollback is rehearsed in staging per release class (TEST-DEP-002) and recorded in the release record.

## 11. Versioning and hotfixes

| Topic | Rule |
|---|---|
| API | URL major `/api/v1`; breaking changes need a new major with a deprecation window (FF-06) |
| Host Contract | Semver; shell supports current + previous minor for remotes |
| Remotes | Independent semver; manifest records host/api ranges and data schema expectations (ADR-T18) |
| Hotfix | Branch from the deployed release; reduced but not skipped gates: RG-01…RG-04 + targeted tests + canary; post-hoc full gate run; recorded as change class "emergency" with retrospective |
| Change classes | standard, normal (CAB-less but peer + gate), emergency; high-risk (data/contract/infra) requires an explicit rollback rehearsal |

## 12. Open items

| Item | Ref |
|---|---|
| Hosting/orchestration platform and its HA features | OPEN-14 |
| IaC tool, secret manager | OPEN-21, OPEN-22 |
| Feature-flag platform build vs buy | OPEN-35 |
| CDN provider and manifest signing key custody | OPEN-36 |
| Canary statistics and bake parameters | OPEN-15 |
| Whether federation proceeds or MF_MODE=bundled (affects remote pipelines) | OPEN-03, OPEN-11 |

# Revision 2 additions (folded 2026-10-27 from `FRONTEND_DELIVERY_REVIEW_FIXES.md`)

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


---

# Revision 3 additions (2026-10-27, gap patch; PROPOSED, nothing executed)

Adds only what sections 3, 4, 8, 9 and 10 above lack: one operator checklist, explicit rollback triggers, a compat-check list, ordered independent-remote steps and a named environment matrix. Gate definitions stay owned by [TEST_STRATEGY.md](../16_QA_AND_TESTING/TEST_STRATEGY.md) section 9 (RG-01..RG-14); test IDs are in [TEST_CATALOG.md](../16_QA_AND_TESTING/TEST_CATALOG.md) and [TEST_CATALOG_REV2.md](../16_QA_AND_TESTING/TEST_CATALOG_REV2.md). Federation material: [FEDERATION_ARCHITECTURE.md](../09_MODULE_FEDERATION/FEDERATION_ARCHITECTURE.md), [VERSION_COMPATIBILITY_DESIGN.md](../09_MODULE_FEDERATION/VERSION_COMPATIBILITY_DESIGN.md), [REMOTE_REGISTRY.schema_REV2.json](../09_MODULE_FEDERATION/REMOTE_REGISTRY.schema_REV2.json). Status: PROPOSED. Numeric thresholds are [TARGET] pending baseline (OPEN-15). No hosting is chosen (OPEN-14), so no provider commands appear.

## R3-1 Release-gate checklist (operator view; evidence link required per row)

| # | Check | Gate | Evidence | Blocks release |
|---:|---|---|---|---|
| 1 | Lint, types, route registry, module boundaries, idempotency lint, migration lint green | RG-01 | CI report | Yes |
| 2 | OpenAPI/AsyncAPI diff clean (oasdiff); no breaking change inside `/api/v1` | RG-02 | Contract report | Yes |
| 3 | Authz matrix, IDOR suite, tenant canary (FF-05), state-machine tests green | RG-03 | Test report | Yes |
| 4 | Secret scan, dependency and container scan clean; SBOM generated; artefacts signed | RG-04 | SBOM + signature | Yes |
| 5 | Critical journeys J1-J14 pass on staging | RG-05 | Playwright traces | Yes |
| 6 | Accessibility scan clean; assistive-technology pass if a critical flow changed | RG-06 | A11y report | Yes |
| 7 | Performance budgets met | RG-07 | Lighthouse CI | Yes |
| 8 | Migration and compatibility checks R3-3 complete | RG-08 | Migration report | Yes |
| 9 | Federation checks (only if federation is activated) | RG-09 | Manifest validation | Conditional |
| 10 | Nightly resilience subset green; no open Sev-2 resilience defect | RG-10 | REL report | Yes if infra/API core touched |
| 11 | Rollback plan, flags, kill switches, runbook and alert updates, dashboards listed in the release record (section 9.3) | RG-12 | Release checklist | Yes |
| 12 | Device-lab pass if service worker, push or install code changed (device lab is OPEN-12) | RG-13 | Device report | Conditional |
| 13 | Restore drill within policy window if schema or storage changed | RG-14 | Drill record | Conditional |
| 14 | Canary guardrails green for the full bake | RG-11 | Canary analysis | Yes before S3 |

Waivers follow the rule in section 9.4; none is allowed for FF-01, FF-05, INV-T02 or INV-T03.

## R3-2 Rollback triggers (halt and roll back; values [TARGET], OPEN-15)

| Trigger | Condition (parameter) | Action | Runbook / test |
|---|---|---|---|
| Error ratio | Canary error ratio above baseline by margin M for window W | Auto-halt, roll back stage | RG-11 |
| Latency | p95/p99 above SLO for W | Auto-halt, roll back | RG-11, OBSERVABILITY_DESIGN |
| INP regression | Field INP regression above budget in cohort | Halt; flag off or roll back | RG-07, RG-11 |
| Auth failures | Auth failure rate above baseline | Halt, roll back at once; page security on-call | RG-03 |
| Business proxy | Successful apply rate below baseline | Halt, roll back | RG-11 |
| Tenant isolation signal | Any cross-tenant read in logs or canary | Stop all rollout; Sev-1 incident; kill switch; no waiver | INV-T02/T03 |
| Burn rate | SLO burn above threshold after S3 | Pause expansion, roll back | OBSERVABILITY_DESIGN |
| Bad migration | Lock budget exceeded or data-integrity check fails | Stop deploy; forward-fix or data-safe down-migration; PITR repair if data damaged | RB-30, TEST-DEP-003 |
| Service worker defect | Stale or broken SW detected | Enable SW kill switch (R-4); publish corrected SW | RB-09, TEST-PWA-009 |
| Worker defect | Dead-letter growth or duplicate effects | Pause queue class; roll back worker | RB-11 |
| Remote defect (federation only) | Remote error or contract-smoke failure | Publish previous version as higher-`sequence` entry or set `status:"disabled"` (R-7) | TEST-FED-014 |

Parameters M, W and thresholds live in the canary analysis config. Until measured they are unset; the release owner sets conservative values per release and records them in the release record.

## R3-3 Migration and compatibility checks (before deploy; complements section 8)

1. Migration lint (FF-10): append-only, contiguous numbering, rollback or forward-fix note present.
2. Classify the change as expand, backfill or contract. A contract change must not share a release with the code that stops using the old shape.
3. Run API N and API N-1 against the post-expand schema (TEST-DAT-002).
4. Measure lock and statement duration on a sized copy against the budget (TEST-DAT-003).
5. Confirm the worker still handles queued job payload versions (R-5).
6. For destructive steps, record a verified backup or PITR marker immediately before (FM-28); confirm RG-14 currency.
7. Compat matrix: shell x API x schema (add remote only if federation is activated), stored in the release record.
8. Hosted databases: apply only through the reviewed migration job; never ad-hoc SQL (PROC-08). The prior implementation's local migration runner must not be used on a hosted database (see [29 guide](../29_DEVELOPER_IMPLEMENTATION_GUIDE/DEVELOPER_IMPLEMENTATION_GUIDE.md) section 7).

## R3-4 Independent remote release (CONDITIONAL on ADR-T23 federation activation; not a baseline procedure)

Under the bundled baseline there is no remote release; domain modules ship with the shell. If federation is activated:
1. Build once. Run FF-04 validators, FF-08 compat check against the current shell, registry and API range, headless contract-smoke on the staging registry, and the bundle-size budget.
2. Publish content-hashed assets to immutable `/mf/<name>/<version>/`. Never overwrite.
3. Create the registry entry: `sequence` +1, `rollbackTo` = current stable, declared `apiRange`, `hostContract`, `minShell`, `dataSchema` (R-2). Sign with the KMS key (custody OPEN-36).
4. Put the entry on the canary channel only (`?ch=canary`), for a stable-hash cohort.
5. Watch the R3-2 guardrails for the bake period. Remote errors must not affect the host (see [FAULT_ISOLATION_MATRIX.md](../09_MODULE_FEDERATION/FAULT_ISOLATION_MATRIX.md)).
6. Promote to stable with a second signed put. Never lower `sequence`.
7. Verify with the synthetic check and dashboards; record in the release record.
8. Rollback: publish previous artefacts as a new, higher-`sequence` entry, or disable the entry. Propagation is bounded by registry TTL (<= 300 s [TARGET]).

## R3-5 Environment matrix (names PROPOSED; provider and domains undecided, OPEN-14)

| Env | Promotion in | Config and secrets source | Data | Deploy approval | Gates before leaving |
|---|---|---|---|---|---|
| local | none | `.env` copied from `.env.example` (variable names in 29 guide section 7) | synthetic | developer | none |
| ci | PR | CI variables; ephemeral DB, same Postgres major | synthetic | automatic | RG-01..RG-05 |
| preview | PR label | staging read-only config | synthetic | label | RG-05 |
| staging | merge to main | staging secret store (never production values) | synthetic + tenant canaries | automatic | RG-06..RG-12 as applicable |
| production | release candidate | production secret manager (product OPEN-22) | real | manual until OPEN-15 policy | RG-11 canary, then S3/S4 |

Promotion path: ci -> staging -> production. The same signed artefact digest moves forward; only configuration differs. Production refuses in-memory storage and test-mode payment keys (SOURCE: comments in root `.env.example`; the startup-validation pattern is kept, TEST-DEP-007).

## R3-6 Open items added

| Item | Ref |
|---|---|
| Canary parameters M, W, thresholds | OPEN-15 |
| Secret manager product and environment names | OPEN-22 |
| Hosting, hence provider-specific deploy and rollback commands | OPEN-14 |
