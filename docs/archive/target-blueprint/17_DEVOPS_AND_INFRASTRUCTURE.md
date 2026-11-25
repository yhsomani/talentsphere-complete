# Target blueprint 17: Devops And Infrastructure

> **Status.** Archive: proposal, not ratified. A greenfield redesign blueprint written in October 2026. Every area was Draft, Under Review or Revision Required (its own document status) and no test was run against it. Its content was mined into `docs/blueprint/`; `SSOT.md` remains the source of intent. Module federation described here was not adopted: the built system is a modular monolith (`ARCHITECTURE.md`).
>
> **What this file holds.** All files of the former `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/` folder, in order.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

| Section | Former file |
|---|---|
| Deployment Architecture | `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/DEPLOYMENT_ARCHITECTURE.md` |
| DevOps and Release Strategy | `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/DEVOPS_AND_RELEASE_STRATEGY.md` |
| Frontend Delivery - Review Fixes (federation, CDN, registry wording) | `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/FRONTEND_DELIVERY_REVIEW_FIXES.md` |
| Legacy Merge B-17: Deployment, Environments, Release Preflight, Backup/Restore Drills and Maintenance Tooling (Prior Attempt) | `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/LEGACY_MERGE_DEVOPS_AND_DEPLOY.md` |
| Observability Design | `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/OBSERVABILITY_DESIGN.md` |

## Deployment Architecture

_Former file: `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/DEPLOYMENT_ARCHITECTURE.md`._

Doc ID: OPS-DEP · Owner: Platform/Infrastructure Architect (with SRE Lead) · Version 1.0 · Status: Draft for Review · Relates: ADR-T03, ADR-T04, ADR-T05, ADR-T09, ADR-T11, ADR-T16, ADR-T18, ADR-T19, ADR-T21, OPS-SLO §8, OPS-CAP, OPS-REL, OPS-OBS, OPS-FMEA, OPEN-14, OPEN-23, OPEN-30, OPEN-36, RISK-12

Logical architecture is a **[TARGET]**; the hosting realisation is **[OPEN-14]**. No vendor, price or size is decided here.

### 1. Logical deployment topology

```mermaid
flowchart TB
  user["Browser / installed PWA"] --> cdn["CDN / edge, same origin: shell and bundled chunks; /mf/** only if federated"]
  user --> lb["Load balancer / WAF / TLS termination"]
  cdn -. cache miss .-> assets["Static origin (object storage bucket)"]
  cdn -. if federation is activated .-> reg["Optional signed registry document per channel (stable, canary)"]
  lb --> api["API replicas x N (stateless modular monolith)"]
  api --> pool["Connection pooler"]
  pool --> pg["Postgres primary"]
  pg --- pgr["Synchronous standby (HA)"]
  pg -.-> rr["Read replica(s) for stale-tolerant reads"]
  pg -. WAL archive .-> arch["Backup / WAL archive (separate failure domain)"]
  api --> obj["Object storage (evidence, resumes, derivatives) with versioning"]
  api --> ai["AI gateway (inside API) -> external model providers"]
  api --> ext["Provider ports: email, push, Stripe, IdP, malware scan"]
  worker["Worker replicas x W (outbox dispatcher + job classes P0..P3)"] --> pool
  worker --> obj
  worker --> ext
  scan["Malware scanner"] --> obj
  runner["Sandbox runner (isolated, no network) [pending WP-ASSESS-RUNNER]"] -.-> api
  subgraph obs["Observability stack"]
    otel["OTel collector"] --> tsdb["Metrics"]
    otel --> traces["Traces"]
    otel --> logs["Logs (redacted)"]
    tsdb --> alerts["Alerting and on-call routing"]
  end
  api --> otel
  worker --> otel
  user -. RUM beacons .-> otel
  synth["Synthetic probes (external)"] --> cdn
  synth --> lb
```

### 2. Components

| Component                              | Role                                                                                                    | Scaling unit                                                     | State                      | HA approach                                                                             | Failure notes (OPS-FMEA) |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------- | ------------------------ |
| CDN / edge                             | Serve shell + bundled chunks; federated remote assets only if activated; cache; WAF optional            | Provider                                                         | none (cache)               | Provider redundancy; origin fallback                                                    | FM-01, FM-10             |
| Static origin                          | Authoritative hashed assets; additive-only                                                              | Bucket                                                           | files                      | Versioned bucket; second copy optional                                                  | FM-01                    |
| Signed registry document (conditional) | In federated mode, maps remote → current entry, `rollbackTo`, channel, kill switches (MFA-01 section 5) | Static object served by the CDN; written by the release pipeline | one JSON per channel       | Not present in bundled baseline; if activated, origin fallback + embedded boot snapshot | FM-05                    |
| Load balancer / WAF                    | TLS, routing, rate limiting, request IDs                                                                | Provider                                                         | none                       | Provider                                                                                | FM-45                    |
| API replicas                           | Policy, domain modules, BFF auth routes                                                                 | Replica count N                                                  | none                       | ≥ 2, spread across zones                                                                | FM-12…FM-23              |
| Worker                                 | Outbox dispatcher, job classes with per-class queues                                                    | Worker count W                                                   | none (fenced leases in DB) | ≥ 2                                                                                     | FM-35…FM-38              |
| Postgres                               | System of record, outbox queue, FTS/trigram/pgvector                                                    | Vertical + read replicas                                         | all durable state          | Primary + synchronous standby, PITR                                                     | FM-24…FM-30              |
| Pooler                                 | Connection multiplexing                                                                                 | 2+                                                               | none                       | redundant                                                                               | FM-25                    |
| Object storage                         | Evidence/resume/media                                                                                   | Provider                                                         | files                      | Versioning, replication                                                                 | FM-31                    |
| Malware scanner                        | Scans uploads before visibility (BR-T003)                                                               | Scanner count                                                    | none                       | ≥ 1, scalable                                                                           | FM-32                    |
| Sandbox runner                         | Isolated code execution, no network (ADR-T13)                                                           | Slot pool                                                        | none                       | Optional until built                                                                    | FM-43                    |
| Observability stack                    | Signals, alerts                                                                                         | Collector + backends                                             | telemetry                  | Separate from app failure domain where feasible                                         | FM-23                    |
| Secret manager / KMS                   | Secrets; federated registry signing keys only if activated                                              | Provider                                                         | secrets                    | Provider HA                                                                             | FM-48                    |

Queue is Postgres (outbox + `background_jobs` style tables, ADR-T05/T09); no separate broker at launch. Revisit trigger: outbox throughput beyond Postgres budget (ADR-T09).

### 3. Frontend delivery: bundled baseline and optional federated mode

The bundled baseline serves local lazy modules with the shell and needs no runtime remote registry. The CDN, immutable remote paths, manifest signing, registry fallback, and per-remote release controls below apply only if ADR-T23 is ratified and federation activation gates pass. When active, MFA-01/VCD-01 govern these federated-mode details.

| Item                            | Design                                                                                                                                                                                                                                                                                                                           | Rationale                                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Hosting origin                  | Shell and remotes are served **same-origin**: remote assets under `/mf/<name>/<version>/…`, registry at `/mf/registry.json` (MFA-01 FD-03)                                                                                                                                                                                       | One CSP origin; SW can serve offline; cookies same-site; no CORS surface                                    |
| Asset immutability              | A published `<name>/<version>` path is never overwritten; files inside carry content hashes; `Cache-Control: public, max-age=31536000, immutable`                                                                                                                                                                                | Old tabs keep working during deploys; rollback needs no rebuild (TEST-FED-009, TEST-FED-012)                |
| Registry document               | One signed JSON per channel (`?ch=stable` or `canary`): per remote `{version, entryUrl, SRI list, hostContract, minShell, apiRange, dataSchema, sequence, notAfter, status, rollbackTo, signature}`; written as a **single atomic put** of the whole document                                                                    | Single control point for promotion, canary, rollback, kill switch; consumers never see a half-published set |
| Signing and trust               | Entries signed with an Ed25519 key held in KMS/HSM-class custody [OPEN-36]; trust anchors are compiled into the shell build (key rotation = ship a shell with both keys, overlap at least one release); monotonic `sequence` gives anti-rollback; `notAfter` about issue + 30 days with at least weekly re-issue (heartbeat job) | A compromised registry store or CDN cannot execute code (ADR-T19)                                           |
| Fallback chain                  | current → `rollbackTo` → client-stored last-known-good (LKG) → embedded boot registry snapshot → "unavailable" screen                                                                                                                                                                                                            | Survives registry or CDN outage (FM-01, FM-05)                                                              |
| Retention                       | Retired remote versions stay on the CDN at least 30 days (VC-11); LKG assets also in SW cache                                                                                                                                                                                                                                    | Rollback and stale clients                                                                                  |
| Registry caching                | `Cache-Control: no-cache` + ETag; SW NetworkFirst with short timeout; re-poll every `ttlSeconds` (at most 300 s [TARGET]) while visible; jittered                                                                                                                                                                                | Fast propagation of rollbacks and kill switches; herd control (TEST-REL-011)                                |
| Service worker                  | `sw.js` and `index.html`: `no-cache`; SW precache **excludes** `/mf/**` (remote releases need no SW update, FD-12); `/version.json` carries `minShell`, `minSw`                                                                                                                                                                  | Independent release trains                                                                                  |
| Canary                          | Shell flag selects `?ch=canary` for a cohort; MFA-01 defaults (5% cohort, 30 min soak) are [TARGET] to be confirmed against baseline traffic (OPEN-15)                                                                                                                                                                           | Progressive delivery (OPS-REL §9.2)                                                                         |
| API responses                   | `Cache-Control: private, no-store` by default; any public caching is explicit per route (TEST-TEN-006)                                                                                                                                                                                                                           | Prevent cross-user leakage                                                                                  |
| Compatibility gate at promotion | Registry-publish step requires the FF-08 compat result (shell × remote × API range) and a headless contract-smoke against the staging registry                                                                                                                                                                                   | Prevent skew                                                                                                |
| Bundled mode                    | `MF_MODE=bundled` produces a single deployable with local lazy modules; no runtime remote registry or signing pipeline is required                                                                                                                                                                                               | Proposed initial baseline under ADR-T23; not yet ARB-ratified                                               |

Cache-control policy summary:

| Object                                               | Cache-Control                                         |
| ---------------------------------------------------- | ----------------------------------------------------- |
| `/mf/<name>/<version>/**` hashed JS/CSS/fonts/images | `public, max-age=31536000, immutable`                 |
| `/mf/registry.json`                                  | `no-cache` + ETag                                     |
| `index.html`, `sw.js`, `/version.json`               | `no-cache` (revalidate every time)                    |
| API                                                  | `private, no-store` unless route declares otherwise   |
| Signed upload/download URLs                          | `private`, short expiry bound to principal and object |

### 4. Network and trust zones

| Zone                                                                                                                                                                                                 | Contents                                                              | Ingress                    | Egress                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| Public edge                                                                                                                                                                                          | CDN, WAF, LB                                                          | Internet                   | To API, origin                                                      |
| App                                                                                                                                                                                                  | API, worker, scanner; registry writer only if federation is activated | From edge/LB only          | To DB, object storage, listed provider endpoints (egress allowlist) |
| Data                                                                                                                                                                                                 | Postgres, pooler, backups                                             | From App only              | WAL archive destination                                             |
| Isolated execution                                                                                                                                                                                   | Sandbox runner                                                        | From API job dispatch only | **None** (ADR-T13)                                                  |
| Ops                                                                                                                                                                                                  | Observability, CI runners, bastion/break-glass                        | Authenticated, audited     | Restricted                                                          |
| All service-to-service credentials are workload identities or short-lived tokens; DB roles: `app` (RLS enforced, no bypass), `migrator`, `readonly-replica`, `support-reader` (time-boxed, PROC-04). |

### 5. Data tier

| Topic         | Design                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| HA            | Primary + synchronous standby (or provider-managed equivalent), automatic failover (SLO-30)                      |
| Backups       | Continuous WAL archiving (PITR) + periodic base backups, encrypted, separate failure domain; retention [OPEN-08] |
| Replicas      | For stale-tolerant reads; authz/consent/entitlement reads on primary                                             |
| Extensions    | pg_trgm, pgvector, pgcrypto-class as required; versions pinned (R: upgrade rehearsal)                            |
| Partitioning  | Time-partition outbox, audit, event tables when volume warrants (OPS-CAP)                                        |
| Upgrades      | Major version via logical replication or provider-managed blue/green, rehearsed in staging                       |
| Multi-tenancy | Row-level (ADR-T21); dedicated DB for a regulated tenant is a revisit trigger (OPEN-30)                          |

### 6. Hosting options evaluated

The reference's current deployment assets are **[REF] options, not decisions**: (A) a single VM running a Compose stack (Caddy edge, API, worker, Postgres 16 container) documented for an Oracle Ampere ARM64 staging host, with backup and restore scripts documented as _not yet executed_; (B) Coolify descriptors for a self-hosted PaaS; (C) SQL assets originating from a Supabase-hosted Postgres workflow (the reference does not use Supabase Auth).

| Option                                                           | Description                                                            | HA Postgres + PITR                                    | API/worker scale-out      | Ops burden            | Cost predictability | Portability / lock-in                                   | CDN/edge integration   | DR capability                                   | Fit as launch target                                |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------- | --------------------- | ------------------- | ------------------------------------------------------- | ---------------------- | ----------------------------------------------- | --------------------------------------------------- |
| A. Single VM + Compose (Oracle) [REF]                            | One host, containers                                                   | L (single node; HA must be self-built)                | L–M (one host)            | M                     | H                   | H                                                       | L (needs separate CDN) | L (needs off-VM backups; single failure domain) | Dev/staging only unless HA and off-VM backup proven |
| B. Coolify-managed VM(s) [REF]                                   | Self-hosted PaaS UI over Docker                                        | L–M (self-built)                                      | M                         | M–H (platform upkeep) | H                   | H                                                       | L                      | L–M                                             | Staging / early beta at best                        |
| C. Supabase-hosted Postgres + separate compute [REF assets]      | Managed Postgres with backups/PITR depending on plan [verify, OPEN-14] | M–H (provider features; verify sync HA and PITR plan) | depends on compute choice | M                     | M                   | M (Postgres standard, but platform features may couple) | depends                | M                                               | Candidate for data tier; compute separate           |
| D. Developer PaaS containers + managed Postgres                  | Fly/Render-class [examples of category only]                           | M–H                                                   | H                         | L–M                   | M                   | M                                                       | M                      | M                                               | Plausible launch target                             |
| E. Managed Kubernetes + managed Postgres                         | Cloud K8s                                                              | H                                                     | H                         | H (cluster ops)       | M                   | M–H                                                     | H                      | H                                               | Over-built until team and scale justify (ADR-T04)   |
| F. Hyperscaler managed containers + managed Postgres + CDN + KMS | ECS/Cloud Run/Container Apps-class                                     | H                                                     | H                         | M                     | M                   | M (IaC modules isolate it)                              | H                      | H                                               | Strong candidate when SLO-30/33 matter              |

Scores are qualitative (H/M/L meaning "meets requirement well/partly/poorly", except Ops burden and lock-in where H = heavy/high). **Decision method [OPEN-14]:** weighted score `S(option) = Σ_i w_i × score_i` with weights `w_i` set by the Architecture Review Board; **mandatory pass/fail criteria** apply before scoring:

| Must-have                                                                | Why                 |
| ------------------------------------------------------------------------ | ------------------- |
| Synchronous or quorum-HA Postgres with PITR to a separate failure domain | SLO-30/31, ADR-T05  |
| ≥ 2 API replicas across failure domains                                  | SLO-01, OPS-CAP N+1 |
| Encrypted off-host backups with a restore drill passed                   | REC-001/002         |
| CDN able to serve immutable assets and short-TTL manifest                | §3                  |
| Egress control for sandbox runner and workloads                          | ADR-T13             |
| Secrets via a secret manager                                             | OPS-REL §5          |
| Residency options matching OPEN-30                                       | ADR-T21             |

Provisional position **[TARGET, not decided]:** use D or F-class managed containers with a managed HA Postgres for production; keep A/B as development and low-cost staging only; treat C as one way to provide the data tier if it passes the must-have list. The first production go-live is blocked on a passed restore drill (RB-29, gate RG-14). Hosting choice is blocking for Ph1 production readiness, not for Ph0 spikes.

### 7. Backup, restore and disaster recovery

| Control               | Detail                                                                                                                                                                                                            | Verified by                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Backup scope          | Postgres (base + WAL), object storage (versioning + replica/copy), IaC state, secrets (re-creatable), manifest registry if federation is activated (rebuildable from release records), search index (rebuildable) | REC-001…003                |
| Backup monitoring     | "Last successful backup/WAL age" is an SLI with alert; silent failure is FM-34                                                                                                                                    | TEST-OBS-001               |
| Encryption and access | Encrypted at rest with separate key; restore rights restricted; access audited                                                                                                                                    | audit review               |
| Retention             | Per OPEN-08; ties to erasure: erasure applies to live data immediately and to backups by expiry; restores re-apply erasure log (tombstone list) before serving                                                    | TEST-PRV-003, TEST-REC-001 |
| Restore drills        | PITR to timestamp into isolated environment; verify data and workflows; measure vs RPO/RTO                                                                                                                        | TEST-REC-001               |
| Off-site restore      | Restore on a separate host/account from the off-site copy                                                                                                                                                         | TEST-REC-002               |
| Object restore        | Recover deleted/overwritten evidence versions                                                                                                                                                                     | TEST-REC-003               |
| DR exercise           | Simulate zone/region loss; execute RB-31; measure                                                                                                                                                                 | TEST-REC-004               |
| Rebuild from scratch  | IaC + backups + secrets recreation                                                                                                                                                                                | SLO-35                     |
| Outbox replay         | After restore, replay dedupes                                                                                                                                                                                     | TEST-REC-005               |
| Drill cadence         | Policy: before first production launch, after any backup-system change, and on a recurring schedule [OPEN-15]                                                                                                     | drill log                  |
| Post-restore          | Re-apply erasure tombstones; invalidate sessions if compromise suspected; reconcile billing (RB-34)                                                                                                               | runbook                    |

Disaster tiers: T1 component failure (automatic); T2 zone failure (failover, SLO-30/33); T3 region failure (SLO-33, OPEN-23); T4 data corruption (PITR, RB-30); T5 provider or account compromise (rebuild in clean account — requires off-account backups and IaC). Tier T5 is acknowledged as the most demanding; scope decided in OPEN-23.

### 8. Environment topology differences

| Aspect           | Production     | Staging                                                                     | CI/preview |
| ---------------- | -------------- | --------------------------------------------------------------------------- | ---------- |
| Replicas         | N ≥ 2, W ≥ 2   | smaller counts but same shape (≥ 2 API to catch state bugs)                 | 1          |
| DB               | HA + PITR      | non-HA allowed but same version/extensions; HA drills run here periodically | ephemeral  |
| CDN              | Full           | Same config, separate domain                                                | none/local |
| Observability    | Full retention | Reduced                                                                     | minimal    |
| Data             | Real           | Synthetic                                                                   | Synthetic  |
| Egress allowlist | Strict         | Same rules                                                                  | n/a        |

Running ≥ 2 API replicas in staging is mandatory so that hidden in-process state (the reference design's single-process limitation) cannot reappear (TEST-DAT-007).

### 9. Open items

| Item                                                                                                         | Ref     |
| ------------------------------------------------------------------------------------------------------------ | ------- |
| Hosting selection and weights                                                                                | OPEN-14 |
| DR scope, second region                                                                                      | OPEN-23 |
| Dedicated tenant database / residency                                                                        | OPEN-30 |
| CDN provider, manifest key custody                                                                           | OPEN-36 |
| Hosted-plan capabilities (PITR, HA, replicas) must be verified against provider documentation; not in RES-01 | OPEN-13 |

## DevOps and Release Strategy

_Former file: `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/DEVOPS_AND_RELEASE_STRATEGY.md`._

Doc ID: OPS-REL · Owner: Release Engineering Lead (with Platform Architect) · Version 1.0 · Status: Draft for Review · Relates: ADR-T03, ADR-T05, ADR-T09, ADR-T17, ADR-T18, ADR-T19, FF-01…FF-10, INV-T14, QA-STRAT §9, OPS-DEP, OPS-OBS, OPS-FMEA, OPEN-14, OPEN-21, OPEN-22, OPEN-35, OPEN-36, WP-MONOREPO-CI, WP-IAC-ENVS, WP-CANARY

> **Revision 2 folded in (2026-10-27)** from `FRONTEND_DELIVERY_REVIEW_FIXES.md`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.

All tool names are **options** unless an ADR fixes them. **[REF]** marks reference-system facts: the reference repository is a pnpm monorepo with Fastify API, worker, Vite web app and SQL migrations, deployed to an Oracle VM via Compose and Coolify descriptors, with a documented rule that "build files are read-only for AI agents". The target does not inherit those choices.

### 1. Principles

1. Compatibility-aware delivery: API and worker may deploy independently when contracts allow. Browser domain modules ship together in the proposed bundled baseline; independently deployed remotes require ADR-T23 federation activation and the compatibility gates in MFA-01/VCD-01.
2. Artefacts are built once, signed, and promoted unchanged through environments; configuration varies, binaries do not.
3. Every deployment is reversible or has a documented forward-fix; irreversible steps (contract migrations) are isolated in their own release.
4. Fitness functions are release gates, not advice (FF-01…FF-10 mapped in §9.4).
5. No secret enters a browser bundle, build log or image layer (INV-T14).
6. Production changes are made by pipelines; humans use break-glass paths that are time-boxed and audited (PROC-04).

### 2. Monorepo layout (ADR-T17)

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

| Rule                                                                                                                                    | Mechanism                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Remotes depend on `host-contract`, `contracts`, `ui`, `observability` only — never on each other                                        | dependency-cruiser (FF-03)                                                                       |
| API modules expose only `index.ts`                                                                                                      | dependency-cruiser (FF-02)                                                                       |
| Contract packages are semver'd; breaking change = major                                                                                 | oasdiff (FF-06) + changeset requirement                                                          |
| Bundled mode uses workspace dependency rules; singleton ranges and the manifest validator (FF-04) apply only if federation is activated | workspace checks; FF-04 conditional                                                              |
| Code ownership                                                                                                                          | CODEOWNERS per app/module/package; Security owns `packages/policy` and `infra/` security modules |
| Lockfile and tool versions pinned; renovate-style updates via PR with the full gate set                                                 | CI                                                                                               |

### 3. CI/CD pipelines per deployable

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

| Deployable                     | Build output                                                                                        | Pipeline specifics                                                                                                                                                                          | Deploy action                                                                                                                                                                                                                              | Verification                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Shell (bundled baseline)       | Static assets and local lazy module chunks, content-hashed                                          | Host-contract checks; SW generation for shell and local chunks; no runtime registry or trust anchors                                                                                        | Upload hashed assets and switch `index`/SW entry and `/version.json`                                                                                                                                                                       | TEST-DEP-008, TEST-PWA-001     |
| Federated remote (conditional) | Static assets with content-hashed files at immutable `/mf/<name>/<version>/`, plus a registry entry | Federation validators (FF-04), compat check vs current shell + registry + API range (FF-08), headless contract-smoke against the staging registry, bundle-size budget (MFA-01 release flow) | Only after federation activation: publish immutable assets, then **sign the entry (KMS key, `sequence`+1, `rollbackTo` = current stable) and put the registry document** on the canary channel; promotion to stable is a second signed put | TEST-FED-003, TEST-FED-012     |
| API                            | OCI image (multi-arch if needed)                                                                    | OpenAPI diff, authz matrix, tenant canary on ephemeral DB                                                                                                                                   | Rolling/canary replicas; readiness gating                                                                                                                                                                                                  | Health/readiness, TEST-DEP-001 |
| Worker                         | OCI image                                                                                           | Job-handler idempotency tests; fencing tests                                                                                                                                                | Rolling; drain in-flight leases before stop                                                                                                                                                                                                | TEST-REL-005                   |
| Migrations                     | Versioned SQL bundle                                                                                | Migration lint (FF-10), expand-compat test, lock budget                                                                                                                                     | Run as a separate gated step before API roll-out (expand) / after (contract)                                                                                                                                                               | TEST-DAT-002/003               |
| Infra                          | IaC plan                                                                                            | Policy-as-code checks; plan review                                                                                                                                                          | Apply by pipeline after approval                                                                                                                                                                                                           | drift detection                |

**Affected-only builds:** the task runner computes the affected set from the workspace graph and changed files; changes to `contracts`, `host-contract`, `policy`, `domain` or `ui` rebuild and retest every dependent (TEST-DEP-006). A scheduled full build (nightly) catches graph blind spots.

**Caching:** module build caches keyed by lockfile + source hash; cache poisoning protection by signing cache entries or restricting cache writes to protected branches.

### 4. Environments

| Env         | Purpose                                      | Deploy trigger                                                     | Config source                       | Data                        |
| ----------- | -------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------- | --------------------------- |
| dev (local) | Development                                  | n/a                                                                | `.env.example` with no secrets      | synthetic                   |
| ci          | PR checks                                    | PR                                                                 | CI vars                             | synthetic                   |
| preview     | Remote-scoped previews against staging API   | PR label                                                           | staging read-only config            | synthetic                   |
| staging     | Pre-production integration, same IaC modules | merge to main                                                      | staging secrets                     | synthetic + tenant canaries |
| production  | Real users, canary then progressive          | manual approval of RC (or automated after gates, policy [OPEN-15]) | production secrets (secret manager) | real                        |

Separate cloud accounts/projects (or at least separate credentials and networks) for staging and production. Staging never holds production data or secrets. **[REF]** the reference uses separate secrets per environment and refuses in-memory storage in production/staging — a pattern to keep, as startup config validation (TEST-DEP-007).

### 5. Configuration and secrets

| Topic                  | Rule                                                                                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typed config           | One typed schema (`packages/config`) validated at boot; invalid or missing production config fails fast                                                                                                    |
| Build-time vs run-time | Browser bundles contain only public build-time values; everything else is server-side runtime config. Remote bundles never embed environment-specific secrets (INV-T14)                                    |
| Secret store           | A managed secret manager (option set: cloud-native manager, Vault-class, or sealed-secrets with encrypted-at-rest repo) [OPEN-22]; secrets injected at runtime, short-lived where the provider supports it |
| Rotation               | Documented rotation for session signing keys, manifest signing keys (dual-key window), DB credentials, provider API keys, webhook secrets (RB-26). Rotation is rehearsed                                   |
| Access                 | Least privilege; human access to production secrets requires PROC-04 grant                                                                                                                                 |
| Scanning               | Pre-commit + CI secret scanning; canary secret test (TEST-SEC-015)                                                                                                                                         |
| Webhook secrets        | Per-provider, per-environment; verification code covered by TEST-BIL-002                                                                                                                                   |

### 6. Supply chain: signing, SBOM, dependency scanning

| Control             | Approach (options)                                                                                                                                                                         | Gate                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| SBOM                | Generated per artefact (CycloneDX or SPDX) and stored with the release record                                                                                                              | RG-04, TEST-SEC-025 |
| Vulnerability scan  | Dependency scan (lockfile) + container image scan + IaC scan; policy: no unwaived critical/high with a fix available; waivers expire                                                       | RG-04               |
| Signing             | Keyless or key-based artefact signing (Sigstore-class); deploy step verifies signature and provenance (build identity)                                                                     | TEST-DEP-004        |
| Registry signing    | Registry entries signed (Ed25519, key in KMS/HSM-class custody [OPEN-36]); trust anchors compiled into the shell; shell verifies signature, `sequence`, `notAfter` (ADR-T19, MFA-01 FD-04) | TEST-SEC-014        |
| SRI                 | Content-hash integrity attributes on remote entry and critical chunks                                                                                                                      | TEST-SEC-013        |
| Dependency hygiene  | Lockfile-only installs, no install scripts by default for untrusted packages, pinned versions, provenance checks where available, license policy                                           | CI                  |
| Build isolation     | Ephemeral builders, least-privilege tokens, no long-lived credentials in CI                                                                                                                | CI                  |
| Third-party scripts | None on critical path; CSP allowlist                                                                                                                                                       | TEST-SEC-027        |

### 7. Infrastructure as Code

| Topic      | Decision status                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool       | OpenTofu/Terraform-class or Pulumi-class [OPEN-21]                                                                                                 |
| Structure  | Reusable modules (network, db, object storage, cdn, compute, observability, secrets) + per-env stacks; staging and production use the same modules |
| State      | Remote, encrypted, locked; access restricted                                                                                                       |
| Changes    | PR → plan → policy checks → approval → apply by pipeline; drift detection scheduled                                                                |
| Recovery   | Environment reproducible from IaC + backups (SLO-35, TEST-REC-*)                                                                                   |
| Constraint | Hosting choice (OPEN-14) may change module internals but not the logical topology in OPS-DEP                                                       |

### 8. Database migration deployment

| Principle                                                       | Detail                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Append-only, contiguous, each with rollback or forward-fix note | FF-10, TEST-DAT-001                                                                                                                                                                                                                                                                                                                                            |
| Expand → migrate → contract                                     | **Expand** (additive: new nullable columns/tables/indexes created concurrently) ships with or before code that tolerates both shapes; **backfill** is a resumable, idempotent job (TEST-DAT-004); **contract** (drop/rename/tighten) ships in a later release after all running code (including N-1 API, workers and queued jobs) no longer uses the old shape |
| Compatibility window                                            | The currently deployed API (N) and the previous one (N-1) must both work against the schema after an expand (TEST-DAT-002); this is what makes API rollback safe                                                                                                                                                                                               |
| Locking                                                         | `lock_timeout` and `statement_timeout` on migrations; concurrent index builds; large table changes via batches; duration/lock budget tested on a sized copy (TEST-DAT-003)                                                                                                                                                                                     |
| Execution                                                       | A dedicated migration job with its own DB role; runs once (advisory lock); API instances never auto-migrate at boot in production                                                                                                                                                                                                                              |
| RLS                                                             | New tenant tables ship with `org_id` and policies in the same migration (TEST-DAT-009)                                                                                                                                                                                                                                                                         |
| Rollback                                                        | Prefer forward-fix; a down-migration is allowed only when data-safe; destructive steps require a verified backup/PITR marker taken immediately before (FM-28)                                                                                                                                                                                                  |
| Ordering with deploys                                           | expand → deploy API → (flip flag) → backfill → verify → later release: contract                                                                                                                                                                                                                                                                                |
| Data corrections                                                | Never ad-hoc SQL in production; use reviewed, audited scripts via PROC-08                                                                                                                                                                                                                                                                                      |

### 9. Feature flags, progressive delivery and release gates

#### 9.1 Feature flags

| Class        | Purpose                                 | Lifetime                                                          | Example                                                                      |
| ------------ | --------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Release flag | Dark-launch and progressive exposure    | Remove within a defined period after full rollout [OPEN-15 param] | new pipeline view                                                            |
| Kill switch  | Immediate disable of a risky capability | Permanent for R1/R2 features                                      | AI gateway, push, SW (RB-09), search, uploads                                |
| Ops flag     | Degradation ladder controls             | Permanent                                                         | shed P3 jobs, read-only mode                                                 |
| Entitlement  | Business gating (billing)               | Product-driven                                                    | **Not a flag**: entitlements are server-derived from billing state (INV-T17) |
| Experiment   | A/B tests                               | Per experiment                                                    | subject to ANL-MET guardrails                                                |

Rules: flag evaluation is server-side for anything affecting authorization or data; client flags are UX hints only (INV-T01). Flags have owner, expiry, and test (TEST-DEP-005). Flag changes are audited. Platform: build vs buy [OPEN-35].

#### 9.2 Canary and progressive delivery

| Stage            | Exposure                                                                                                | Bake / decision                                    | Auto-halt guardrails                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| S0 Staging soak  | Synthetic traffic                                                                                       | Gate RG-05…RG-10                                   | any gate red                                                                                                                         |
| S1 Internal      | Internal and synthetic test tenants                                                                     | short bake [param]                                 | error ratio, synthetic checks                                                                                                        |
| S2 Canary cohort | Small cohort chosen by stable hash of principal (not by tenant tier, to avoid unfair treatment) [param] | bake long enough to see diurnal peak [param]       | error ratio vs baseline, p95/p99 vs SLO, INP regression, auth failures, business proxy (successful apply rate), log error signatures |
| S3 Majority      | Expanding steps                                                                                         | each step has hold                                 | same + burn rate                                                                                                                     |
| S4 Full          | All                                                                                                     | Post-release verification (synthetic + dashboards) | burn rate                                                                                                                            |

Remote releases use the registry **canary channel** (`?ch=canary`) selected by a shell flag for a cohort (MFA-01 defaults 5% / 30 min are [TARGET] pending baseline); API releases use replica canary with header/cohort routing; worker releases use a canary worker pool handling a subset of job classes. Statistical rules (minimum sample, baseline comparison) are specified in the canary analysis config [OPEN-15].

#### 9.3 Release record

Each release produces: artefact digests, SBOM, signatures, compat matrix (shell × remote × API × schema), gate results, flags touched, migration list, rollback plan, owner, approval, and links to dashboards. Stored immutably; used by incident response.

#### 9.4 Gates and fitness functions

| Gate (QA-STRAT §9) | Fitness functions enforced        |
| ------------------ | --------------------------------- |
| RG-01              | FF-01, FF-02, FF-03, FF-07, FF-10 |
| RG-02              | FF-06, FF-08                      |
| RG-03              | FF-05, INV-T01…T04                |
| RG-04              | INV-T14                           |
| RG-09              | FF-04, FF-03                      |
| RG-13              | FF-09                             |

No gate may be disabled by pipeline configuration without a recorded waiver; changes to gate definitions require review by Release Engineering and Security.

### 10. Rollback sequencing (remote + API + service worker + data)

Compatibility rules that make rollback possible:

| Rule | Statement                                                                                                                                                                                                                                                  |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1  | Within `/api/v1` only additive, oasdiff-clean changes; the server honours clients up to a 90-day floor after a deprecation notice and answers `426 client-outdated` below it (VCD-01 VC-06, [TARGET], measured from the age distribution of active shells) |
| R-2  | A remote declares `apiRange`, `hostContract`, `minShell` and `dataSchema`; the publish step refuses promotion that leaves a gap, and the shell enforces the same at runtime (VC-02)                                                                        |
| R-3  | Schema changes follow expand/contract so API N and N-1 both work                                                                                                                                                                                           |
| R-4  | SW changes are forward-only: a SW cannot be un-installed from a user device by deploy; "rollback" = publish a new SW that restores previous behaviour, or trigger the kill-switch                                                                          |
| R-5  | Worker handlers are backward compatible with queued job payload versions                                                                                                                                                                                   |
| R-6  | The shell supports Host Contract majors N and N-1 for at least 90 days (VC-12), so a shell rollback never strands published remotes                                                                                                                        |
| R-7  | Operator rollback of a remote = publish the previous artefacts as a **new entry with a higher `sequence`** (or rely on the signed `rollbackTo`), never lowering `sequence` (anti-rollback, MFA-01 section 5)                                               |

Scenarios:

| Scenario                                          | Order                                                                                                                                                                                                                       | Notes                                                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Remote-only defect                                | 1) Clients self-heal to `rollbackTo`/LKG; operator publishes the previous version as a new higher-`sequence` entry (or sets `status:"disabled"` as a kill switch) 2) Observe within the registry TTL 3) Fix forward         | Independent of API/shell (TEST-FED-014); propagation bounded by registry TTL (at most 300 s [TARGET]) |
| API-only defect                                   | 1) Roll back replicas to N-1 (schema is expand-compatible) 2) Verify remote compat matrix still green 3) Fix forward                                                                                                        | Fails if a contract migration was done — hence contract is a separate release                         |
| Coordinated change (new field consumed by remote) | Deploy order: schema expand → API (adds field, backward compatible) → remote. Rollback order is the reverse: remote → API → (schema stays)                                                                                  | Never roll API back while a promoted remote requires the new field; remote first                      |
| Shell/Host Contract change                        | 1) New shell built with embedded boot registry and trust anchors 2) Remotes declare ranges supporting both shells 3) Rollback shell: restore previous `index`, SW entry and `/version.json`; remotes still compatible (R-6) | Shell supports Host Contract N and N-1 (VC-12)                                                        |
| Service worker defect                             | 1) Flip SW kill-switch flag (clients unregister on next load) 2) Publish corrected SW 3) Remove flag                                                                                                                        | RB-09, TEST-PWA-009                                                                                   |
| Bad migration                                     | 1) Stop deploy 2) Execute forward-fix or down-migration per note 3) If data damaged: PITR restore to side instance and repair (RB-30)                                                                                       | TEST-DEP-003, TEST-REC-001                                                                            |
| Worker defect                                     | 1) Pause affected queue class 2) Roll back worker 3) Replay safely (dedupe)                                                                                                                                                 | RB-11                                                                                                 |

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

### 11. Versioning and hotfixes

| Topic          | Rule                                                                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API            | URL major `/api/v1`; breaking changes need a new major with a deprecation window (FF-06)                                                                                                |
| Host Contract  | Semver; shell supports current + previous minor for remotes                                                                                                                             |
| Remotes        | Independent semver; manifest records host/api ranges and data schema expectations (ADR-T18)                                                                                             |
| Hotfix         | Branch from the deployed release; reduced but not skipped gates: RG-01…RG-04 + targeted tests + canary; post-hoc full gate run; recorded as change class "emergency" with retrospective |
| Change classes | standard, normal (CAB-less but peer + gate), emergency; high-risk (data/contract/infra) requires an explicit rollback rehearsal                                                         |

### 12. Open items

| Item                                                                      | Ref              |
| ------------------------------------------------------------------------- | ---------------- |
| Hosting/orchestration platform and its HA features                        | OPEN-14          |
| IaC tool, secret manager                                                  | OPEN-21, OPEN-22 |
| Feature-flag platform build vs buy                                        | OPEN-35          |
| CDN provider and manifest signing key custody                             | OPEN-36          |
| Canary statistics and bake parameters                                     | OPEN-15          |
| Whether federation proceeds or MF_MODE=bundled (affects remote pipelines) | OPEN-03, OPEN-11 |

## Revision 2 additions (folded 2026-10-27 from `FRONTEND_DELIVERY_REVIEW_FIXES.md`)

### 1. Edge delivery for the bundled default (complements DEPLOYMENT_ARCHITECTURE section 3)

| Object                                                            | Cache-Control / rule                                                                                                                                                  |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`, `sw.js`, `/version.json`                            | `no-cache` (unchanged)                                                                                                                                                |
| `/assets/**` hashed JS, CSS, fonts (shell and lazy module chunks) | `public, max-age=31536000, immutable`                                                                                                                                 |
| **`/assets/bo/**` (back-office chunks)**                          | Edge auth rule FD-14 runs **before** any shared cache; response `private, max-age=31536000, immutable` and `Vary: Cookie`; `404` for sessions without `admin.console` |
| `/mf/**`, `/mf/registry.json` [FED]                               | As in DEPLOYMENT_ARCHITECTURE section 3; `/mf/mf-admin/**` gets the same FD-14 rule                                                                                   |
| Public page snapshots (section 2)                                 | Short `max-age` plus event-driven purge; `stale-while-revalidate` allowed; never contain per-user data                                                                |
| `/sitemap*.xml`, `robots.txt`                                     | Short `max-age` (sitemaps change on publish events)                                                                                                                   |
| API                                                               | `private, no-store` by default (unchanged)                                                                                                                            |

Release, bundled: one artefact set per release; canary by shell cohort/flag (OPS-REL progressive delivery); rollback = previous artefact set plus new SW version string (VCD-01 section 6.9); kill-switch SW unchanged. The weekly federated build is a scheduled non-release job; no registry store, signing key or KMS custody is provisioned until federation is activated (MFA-01-REV2 section 1).

### 2. Edge rule for privileged chunks (FD-14) - operations view

| Item                | Requirement                                                                                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rule                | Valid session and capability `admin.console`, else `404`. Paths `/assets/bo/**` and, if federated, `/mf/mf-admin/**`                                                                                                                                           |
| Order of evaluation | Auth check before cache lookup; gated responses are never stored in a shared cache without the check                                                                                                                                                           |
| Capability source   | **[OPEN, owner Security Architect]** signed-token verification at the edge versus sub-request to an auth-check endpoint with a short per-session cache (MFA-01-REV2 section 2.4). A shared HMAC secret at the edge is not accepted without a security decision |
| Synthetic probes    | Every 5 minutes [TARGET] from outside: anonymous and non-admin fetch of the back-office entry must be `404` (alert on any `200`); admin synthetic must be `200`                                                                                                |
| Release gate        | Edge-rule test (anonymous, candidate, admin) and a precache-manifest scan for `bo` paths (PWA-01-REV2 rule R2b)                                                                                                                                                |
| Honesty             | Controls who can obtain the code; the bundle is not treated as secret; the server authorises every call (ADR-T19, INV-T01). Failure scenario FIM-01 FI-31 (MFA-01-REV2)                                                                                        |

### 3. Public page prerender hosting (ADR-T24, proposed)

Design is in FEA-01-REV2 section 2.2. Operations view:

| Component           | Placement and requirement                                                                                                                                                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Snapshot generator  | A worker job class (`public-snapshot`) triggered by outbox events `job.published`, `job.updated`, `job.closed`, `job.taken_down`, profile visibility change and erasure; idempotent per entity and version; runs in the existing worker (no new service); retry and dead-letter as other job classes                                         |
| Storage             | Object storage prefix for snapshots; versioned; lifecycle rule removes snapshots of closed jobs after the notice period [OPEN]                                                                                                                                                                                                               |
| Serving             | Edge rule maps public canonical paths to the snapshot with fallback to the SPA shell when missing (never a 5xx); `Cache-Control` short plus purge call on each event                                                                                                                                                                         |
| Sitemaps and robots | Worker job regenerates sitemap index and child files (at most 50,000 URLs each) on a schedule and on bulk change; `robots.txt` allows public paths and disallows app routes                                                                                                                                                                  |
| Privacy             | Hide/erasure events purge the snapshot and the sitemap entry first; purge SLA [OPEN, Privacy lead]; the privacy notice states that search-engine copies are outside our control                                                                                                                                                              |
| Renderer            | Template renderer in the API versus headless render in the worker: spike [OPEN]; whichever is chosen runs behind the same job class                                                                                                                                                                                                          |
| Observability       | `public.snapshot_age_s` (per template), `public.snapshot_missing_total`, `public.purge_latency_s`, sitemap URL count; alert when age exceeds the freshness target [OPEN] or when the fallback rate rises                                                                                                                                     |
| Failure modes       | Generator down: pages stay at the last snapshot (stale), jobs closed meanwhile show closed content only after the purge, so purge failures are the priority alert; storage unavailable: edge falls back to SPA shell; renderer bug: previous snapshot retained, new write rejected by a validation check (title, canonical, JSON-LD present) |
| Capacity and cost   | Add a row to the cost envelope (21_*): snapshot generation, storage, egress; vendor quotes empty by design (REVW-16)                                                                                                                                                                                                                         |
| Tests               | No-JS fetch of each template; purge test; sitemap URL sample crawl; fallback test with the snapshot deleted                                                                                                                                                                                                                                  |

### 4. Observability and SLO wording

| Place                                                                                  | Read as                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OBSERVABILITY_DESIGN spans and metrics named `mf.registry.*`, `mf.remote.*`            | [FED]. In bundled mode: span `module.load` (chunk load, `source=bundled`) and metric `module.load_error_total`; RUM attribute `ts.mf_mode` (already defined in FEA-01 section 11) distinguishes the modes |
| OPS-SLO SLO-03 (per-remote activation, 216 min/month) and SLO-17 (federation overhead) | Apply only when federated; SLO-17 cannot be met on cold deep links with the corrected budgets without a size trade-off (FEA-01-REV2 section 4.3). Owner of folder 15 to adopt                             |
| Alerts on `registry.*` and signature failures                                          | [FED]; in bundled mode the equivalents are asset-reachability synthetics and the FD-14 non-admin `200` alert                                                                                              |
| New metrics                                                                            | `edge.bo_denied_total` (by reason), `edge.bo_allowed_total`, `public.*` (section 3)                                                                                                                       |

### 5. Items for the governance pass

ADR-T24 and the ADR-T23 scope note (8 remotes, FD-14); OPEN items: edge capability source, purge SLA, freshness target, renderer spike, closed-job status-code policy [UNVERIFIED against current search-engine guidance]; cost envelope row for snapshot generation; FIM-01 FI-31 runbook (RB-nn) to be assigned by operations.

### 6. Supersession map (relationship only)

| This file | Supersedes                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| section 1 | The cache-control summary in DEPLOYMENT_ARCHITECTURE section 3 for the bundled default (adds `/assets/bo/**` and snapshot rows) |
| section 2 | Nothing existing; fills the missing mechanism behind "privileged UI is never delivered" (MFA-01 section 4 original claim)       |
| section 3 | Nothing existing; new design for OPEN-FE-17                                                                                     |
| section 4 | OBSERVABILITY_DESIGN metric names for bundled mode; OPS-SLO applicability (folder 15, relationship only)                        |

---

## Revision 3 additions (2026-10-27, gap patch; PROPOSED, nothing executed)

Adds only what sections 3, 4, 8, 9 and 10 above lack: one operator checklist, explicit rollback triggers, a compat-check list, ordered independent-remote steps and a named environment matrix. Gate definitions stay owned by [TEST_STRATEGY.md](16_QA_AND_TESTING.md#test-strategy) section 9 (RG-01..RG-14); test IDs are in [TEST_CATALOG.md](16_QA_AND_TESTING.md#test-catalog) and [TEST_CATALOG.md#record-test-catalog-rev2](16_QA_AND_TESTING.md#record-test-catalog-rev2). Federation material: [FEDERATION_ARCHITECTURE.md](09_MODULE_FEDERATION.md#module-federation-architecture), [VERSION_COMPATIBILITY_DESIGN.md](09_MODULE_FEDERATION.md#version-compatibility-design), [REMOTE_REGISTRY.schema_REV2.json](09_MODULE_FEDERATION.md#change-record-remote_registryschema_rev2json). Status: PROPOSED. Numeric thresholds are [TARGET] pending baseline (OPEN-15). No hosting is chosen (OPEN-14), so no provider commands appear.

### R3-1 Release-gate checklist (operator view; evidence link required per row)

|   # | Check                                                                                                                 | Gate  | Evidence            | Blocks release                |
| --: | --------------------------------------------------------------------------------------------------------------------- | ----- | ------------------- | ----------------------------- |
|   1 | Lint, types, route registry, module boundaries, idempotency lint, migration lint green                                | RG-01 | CI report           | Yes                           |
|   2 | OpenAPI/AsyncAPI diff clean (oasdiff); no breaking change inside `/api/v1`                                            | RG-02 | Contract report     | Yes                           |
|   3 | Authz matrix, IDOR suite, tenant canary (FF-05), state-machine tests green                                            | RG-03 | Test report         | Yes                           |
|   4 | Secret scan, dependency and container scan clean; SBOM generated; artefacts signed                                    | RG-04 | SBOM + signature    | Yes                           |
|   5 | Critical journeys J1-J14 pass on staging                                                                              | RG-05 | Playwright traces   | Yes                           |
|   6 | Accessibility scan clean; assistive-technology pass if a critical flow changed                                        | RG-06 | A11y report         | Yes                           |
|   7 | Performance budgets met                                                                                               | RG-07 | Lighthouse CI       | Yes                           |
|   8 | Migration and compatibility checks R3-3 complete                                                                      | RG-08 | Migration report    | Yes                           |
|   9 | Federation checks (only if federation is activated)                                                                   | RG-09 | Manifest validation | Conditional                   |
|  10 | Nightly resilience subset green; no open Sev-2 resilience defect                                                      | RG-10 | REL report          | Yes if infra/API core touched |
|  11 | Rollback plan, flags, kill switches, runbook and alert updates, dashboards listed in the release record (section 9.3) | RG-12 | Release checklist   | Yes                           |
|  12 | Device-lab pass if service worker, push or install code changed (device lab is OPEN-12)                               | RG-13 | Device report       | Conditional                   |
|  13 | Restore drill within policy window if schema or storage changed                                                       | RG-14 | Drill record        | Conditional                   |
|  14 | Canary guardrails green for the full bake                                                                             | RG-11 | Canary analysis     | Yes before S3                 |

Waivers follow the rule in section 9.4; none is allowed for FF-01, FF-05, INV-T02 or INV-T03.

### R3-2 Rollback triggers (halt and roll back; values [TARGET], OPEN-15)

| Trigger                         | Condition (parameter)                                      | Action                                                                               | Runbook / test              |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------- |
| Error ratio                     | Canary error ratio above baseline by margin M for window W | Auto-halt, roll back stage                                                           | RG-11                       |
| Latency                         | p95/p99 above SLO for W                                    | Auto-halt, roll back                                                                 | RG-11, OBSERVABILITY_DESIGN |
| INP regression                  | Field INP regression above budget in cohort                | Halt; flag off or roll back                                                          | RG-07, RG-11                |
| Auth failures                   | Auth failure rate above baseline                           | Halt, roll back at once; page security on-call                                       | RG-03                       |
| Business proxy                  | Successful apply rate below baseline                       | Halt, roll back                                                                      | RG-11                       |
| Tenant isolation signal         | Any cross-tenant read in logs or canary                    | Stop all rollout; Sev-1 incident; kill switch; no waiver                             | INV-T02/T03                 |
| Burn rate                       | SLO burn above threshold after S3                          | Pause expansion, roll back                                                           | OBSERVABILITY_DESIGN        |
| Bad migration                   | Lock budget exceeded or data-integrity check fails         | Stop deploy; forward-fix or data-safe down-migration; PITR repair if data damaged    | RB-30, TEST-DEP-003         |
| Service worker defect           | Stale or broken SW detected                                | Enable SW kill switch (R-4); publish corrected SW                                    | RB-09, TEST-PWA-009         |
| Worker defect                   | Dead-letter growth or duplicate effects                    | Pause queue class; roll back worker                                                  | RB-11                       |
| Remote defect (federation only) | Remote error or contract-smoke failure                     | Publish previous version as higher-`sequence` entry or set `status:"disabled"` (R-7) | TEST-FED-014                |

Parameters M, W and thresholds live in the canary analysis config. Until measured they are unset; the release owner sets conservative values per release and records them in the release record.

### R3-3 Migration and compatibility checks (before deploy; complements section 8)

1. Migration lint (FF-10): append-only, contiguous numbering, rollback or forward-fix note present.
2. Classify the change as expand, backfill or contract. A contract change must not share a release with the code that stops using the old shape.
3. Run API N and API N-1 against the post-expand schema (TEST-DAT-002).
4. Measure lock and statement duration on a sized copy against the budget (TEST-DAT-003).
5. Confirm the worker still handles queued job payload versions (R-5).
6. For destructive steps, record a verified backup or PITR marker immediately before (FM-28); confirm RG-14 currency.
7. Compat matrix: shell x API x schema (add remote only if federation is activated), stored in the release record.
8. Hosted databases: apply only through the reviewed migration job; never ad-hoc SQL (PROC-08). The prior implementation's local migration runner must not be used on a hosted database (see [29 guide](29_DEVELOPER_IMPLEMENTATION_GUIDE.md#developer-implementation-guide) section 7).

### R3-4 Independent remote release (CONDITIONAL on ADR-T23 federation activation; not a baseline procedure)

Under the bundled baseline there is no remote release; domain modules ship with the shell. If federation is activated:

1. Build once. Run FF-04 validators, FF-08 compat check against the current shell, registry and API range, headless contract-smoke on the staging registry, and the bundle-size budget.
2. Publish content-hashed assets to immutable `/mf/<name>/<version>/`. Never overwrite.
3. Create the registry entry: `sequence` +1, `rollbackTo` = current stable, declared `apiRange`, `hostContract`, `minShell`, `dataSchema` (R-2). Sign with the KMS key (custody OPEN-36).
4. Put the entry on the canary channel only (`?ch=canary`), for a stable-hash cohort.
5. Watch the R3-2 guardrails for the bake period. Remote errors must not affect the host (see [FAULT_ISOLATION_MATRIX.md](09_MODULE_FEDERATION.md#fault-isolation-matrix)).
6. Promote to stable with a second signed put. Never lower `sequence`.
7. Verify with the synthetic check and dashboards; record in the release record.
8. Rollback: publish previous artefacts as a new, higher-`sequence` entry, or disable the entry. Propagation is bounded by registry TTL (<= 300 s [TARGET]).

### R3-5 Environment matrix (names PROPOSED; provider and domains undecided, OPEN-14)

| Env        | Promotion in      | Config and secrets source                                                | Data                        | Deploy approval             | Gates before leaving       |
| ---------- | ----------------- | ------------------------------------------------------------------------ | --------------------------- | --------------------------- | -------------------------- |
| local      | none              | `.env` copied from `.env.example` (variable names in 29 guide section 7) | synthetic                   | developer                   | none                       |
| ci         | PR                | CI variables; ephemeral DB, same Postgres major                          | synthetic                   | automatic                   | RG-01..RG-05               |
| preview    | PR label          | staging read-only config                                                 | synthetic                   | label                       | RG-05                      |
| staging    | merge to main     | staging secret store (never production values)                           | synthetic + tenant canaries | automatic                   | RG-06..RG-12 as applicable |
| production | release candidate | production secret manager (product OPEN-22)                              | real                        | manual until OPEN-15 policy | RG-11 canary, then S3/S4   |

Promotion path: ci -> staging -> production. The same signed artefact digest moves forward; only configuration differs. Production refuses in-memory storage and test-mode payment keys (SOURCE: comments in root `.env.example`; the startup-validation pattern is kept, TEST-DEP-007).

### R3-6 Open items added

| Item                                                          | Ref     |
| ------------------------------------------------------------- | ------- |
| Canary parameters M, W, thresholds                            | OPEN-15 |
| Secret manager product and environment names                  | OPEN-22 |
| Hosting, hence provider-specific deploy and rollback commands | OPEN-14 |

<a id="record-frontend-delivery-review-fixes"></a>

### Preserved source record: FRONTEND_DELIVERY_REVIEW_FIXES

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/FRONTEND_DELIVERY_REVIEW_FIXES.md -->

<a id="record-frontend-delivery-review-fixes--frontend-delivery---review-fixes-federation-cdn-registry-wording"></a>

## Frontend Delivery - Review Fixes (federation, CDN, registry wording)

Doc ID: OPS-FE-REV2 (covers the frontend delivery parts of DEPLOYMENT_ARCHITECTURE, DEVOPS_AND_RELEASE_STRATEGY and OBSERVABILITY_DESIGN) · Owner: Platform Engineering / Frontend Platform · Version 2.0 · Status: Under Review

> **Folded into `DEVOPS_AND_RELEASE_STRATEGY.md` on 2026-10-27.** Change record only; edit the original.
> Relates: ADR-T23 (proposed), ADR-T24 (proposed in FEA-01-REV2), ADR-T19 · REVW-07, REVW-08, REVW-13 · REV-RES · MFA-01-REV2, FEA-01-REV2, PWA-01-REV2

Tags: [TARGET] [OPEN] [FED]. This file is **additive**; the three original documents in this folder are unchanged by this revision. Another editor already reworded DEPLOYMENT_ARCHITECTURE section 3 and DEVOPS_AND_RELEASE_STRATEGY to a bundled baseline with a conditional federated mode (ADR-T23); that wording stands and is not restated. This file adds only what those edits do not cover. No cost, traffic or capacity number is asserted.

<a id="record-frontend-delivery-review-fixes--1-edge-delivery-for-the-bundled-default-complements-deployment_architecture-section-3"></a>

### 1. Edge delivery for the bundled default (complements DEPLOYMENT_ARCHITECTURE section 3)

| Object                                                            | Cache-Control / rule                                                                                                                                                  |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`, `sw.js`, `/version.json`                            | `no-cache` (unchanged)                                                                                                                                                |
| `/assets/**` hashed JS, CSS, fonts (shell and lazy module chunks) | `public, max-age=31536000, immutable`                                                                                                                                 |
| **`/assets/bo/**` (back-office chunks)**                          | Edge auth rule FD-14 runs **before** any shared cache; response `private, max-age=31536000, immutable` and `Vary: Cookie`; `404` for sessions without `admin.console` |
| `/mf/**`, `/mf/registry.json` [FED]                               | As in DEPLOYMENT_ARCHITECTURE section 3; `/mf/mf-admin/**` gets the same FD-14 rule                                                                                   |
| Public page snapshots (section 2)                                 | Short `max-age` plus event-driven purge; `stale-while-revalidate` allowed; never contain per-user data                                                                |
| `/sitemap*.xml`, `robots.txt`                                     | Short `max-age` (sitemaps change on publish events)                                                                                                                   |
| API                                                               | `private, no-store` by default (unchanged)                                                                                                                            |

Release, bundled: one artefact set per release; canary by shell cohort/flag (OPS-REL progressive delivery); rollback = previous artefact set plus new SW version string (VCD-01 section 6.9); kill-switch SW unchanged. The weekly federated build is a scheduled non-release job; no registry store, signing key or KMS custody is provisioned until federation is activated (MFA-01-REV2 section 1).

<a id="record-frontend-delivery-review-fixes--2-edge-rule-for-privileged-chunks-fd-14---operations-view"></a>

### 2. Edge rule for privileged chunks (FD-14) - operations view

| Item                | Requirement                                                                                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rule                | Valid session and capability `admin.console`, else `404`. Paths `/assets/bo/**` and, if federated, `/mf/mf-admin/**`                                                                                                                                           |
| Order of evaluation | Auth check before cache lookup; gated responses are never stored in a shared cache without the check                                                                                                                                                           |
| Capability source   | **[OPEN, owner Security Architect]** signed-token verification at the edge versus sub-request to an auth-check endpoint with a short per-session cache (MFA-01-REV2 section 2.4). A shared HMAC secret at the edge is not accepted without a security decision |
| Synthetic probes    | Every 5 minutes [TARGET] from outside: anonymous and non-admin fetch of the back-office entry must be `404` (alert on any `200`); admin synthetic must be `200`                                                                                                |
| Release gate        | Edge-rule test (anonymous, candidate, admin) and a precache-manifest scan for `bo` paths (PWA-01-REV2 rule R2b)                                                                                                                                                |
| Honesty             | Controls who can obtain the code; the bundle is not treated as secret; the server authorises every call (ADR-T19, INV-T01). Failure scenario FIM-01 FI-31 (MFA-01-REV2)                                                                                        |

<a id="record-frontend-delivery-review-fixes--3-public-page-prerender-hosting-adr-t24-proposed"></a>

### 3. Public page prerender hosting (ADR-T24, proposed)

Design is in FEA-01-REV2 section 2.2. Operations view:

| Component           | Placement and requirement                                                                                                                                                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Snapshot generator  | A worker job class (`public-snapshot`) triggered by outbox events `job.published`, `job.updated`, `job.closed`, `job.taken_down`, profile visibility change and erasure; idempotent per entity and version; runs in the existing worker (no new service); retry and dead-letter as other job classes                                         |
| Storage             | Object storage prefix for snapshots; versioned; lifecycle rule removes snapshots of closed jobs after the notice period [OPEN]                                                                                                                                                                                                               |
| Serving             | Edge rule maps public canonical paths to the snapshot with fallback to the SPA shell when missing (never a 5xx); `Cache-Control` short plus purge call on each event                                                                                                                                                                         |
| Sitemaps and robots | Worker job regenerates sitemap index and child files (at most 50,000 URLs each) on a schedule and on bulk change; `robots.txt` allows public paths and disallows app routes                                                                                                                                                                  |
| Privacy             | Hide/erasure events purge the snapshot and the sitemap entry first; purge SLA [OPEN, Privacy lead]; the privacy notice states that search-engine copies are outside our control                                                                                                                                                              |
| Renderer            | Template renderer in the API versus headless render in the worker: spike [OPEN]; whichever is chosen runs behind the same job class                                                                                                                                                                                                          |
| Observability       | `public.snapshot_age_s` (per template), `public.snapshot_missing_total`, `public.purge_latency_s`, sitemap URL count; alert when age exceeds the freshness target [OPEN] or when the fallback rate rises                                                                                                                                     |
| Failure modes       | Generator down: pages stay at the last snapshot (stale), jobs closed meanwhile show closed content only after the purge, so purge failures are the priority alert; storage unavailable: edge falls back to SPA shell; renderer bug: previous snapshot retained, new write rejected by a validation check (title, canonical, JSON-LD present) |
| Capacity and cost   | Add a row to the cost envelope (21_*): snapshot generation, storage, egress; vendor quotes empty by design (REVW-16)                                                                                                                                                                                                                         |
| Tests               | No-JS fetch of each template; purge test; sitemap URL sample crawl; fallback test with the snapshot deleted                                                                                                                                                                                                                                  |

<a id="record-frontend-delivery-review-fixes--4-observability-and-slo-wording"></a>

### 4. Observability and SLO wording

| Place                                                                                  | Read as                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OBSERVABILITY_DESIGN spans and metrics named `mf.registry.*`, `mf.remote.*`            | [FED]. In bundled mode: span `module.load` (chunk load, `source=bundled`) and metric `module.load_error_total`; RUM attribute `ts.mf_mode` (already defined in FEA-01 section 11) distinguishes the modes |
| OPS-SLO SLO-03 (per-remote activation, 216 min/month) and SLO-17 (federation overhead) | Apply only when federated; SLO-17 cannot be met on cold deep links with the corrected budgets without a size trade-off (FEA-01-REV2 section 4.3). Owner of folder 15 to adopt                             |
| Alerts on `registry.*` and signature failures                                          | [FED]; in bundled mode the equivalents are asset-reachability synthetics and the FD-14 non-admin `200` alert                                                                                              |
| New metrics                                                                            | `edge.bo_denied_total` (by reason), `edge.bo_allowed_total`, `public.*` (section 3)                                                                                                                       |

<a id="record-frontend-delivery-review-fixes--5-items-for-the-governance-pass"></a>

### 5. Items for the governance pass

ADR-T24 and the ADR-T23 scope note (8 remotes, FD-14); OPEN items: edge capability source, purge SLA, freshness target, renderer spike, closed-job status-code policy [UNVERIFIED against current search-engine guidance]; cost envelope row for snapshot generation; FIM-01 FI-31 runbook (RB-nn) to be assigned by operations.

<a id="record-frontend-delivery-review-fixes--6-supersession-map-relationship-only"></a>

### 6. Supersession map (relationship only)

| This file | Supersedes                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| section 1 | The cache-control summary in DEPLOYMENT_ARCHITECTURE section 3 for the bundled default (adds `/assets/bo/**` and snapshot rows) |
| section 2 | Nothing existing; fills the missing mechanism behind "privileged UI is never delivered" (MFA-01 section 4 original claim)       |
| section 3 | Nothing existing; new design for OPEN-FE-17                                                                                     |
| section 4 | OBSERVABILITY_DESIGN metric names for bundled mode; OPS-SLO applicability (folder 15, relationship only)                        |

<!-- source-record-end: Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/FRONTEND_DELIVERY_REVIEW_FIXES.md -->

## Frontend Delivery - Review Fixes (federation, CDN, registry wording)

_Former file: `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/FRONTEND_DELIVERY_REVIEW_FIXES.md`._

Doc ID: OPS-FE-REV2 (covers the frontend delivery parts of DEPLOYMENT_ARCHITECTURE, DEVOPS_AND_RELEASE_STRATEGY and OBSERVABILITY_DESIGN) · Owner: Platform Engineering / Frontend Platform · Version 2.0 · Status: Under Review
Relates: ADR-T23 (proposed), ADR-T24 (proposed in FEA-01-REV2), ADR-T19 · REVW-07, REVW-08, REVW-13 · REV-RES · MFA-01-REV2, FEA-01-REV2, PWA-01-REV2

Tags: [TARGET] [OPEN] [FED]. This file is **additive**; the three original documents in this folder are unchanged by this revision. Another editor already reworded DEPLOYMENT_ARCHITECTURE section 3 and DEVOPS_AND_RELEASE_STRATEGY to a bundled baseline with a conditional federated mode (ADR-T23); that wording stands and is not restated. This file adds only what those edits do not cover. No cost, traffic or capacity number is asserted.

### 1. Edge delivery for the bundled default (complements DEPLOYMENT_ARCHITECTURE section 3)

| Object                                                            | Cache-Control / rule                                                                                                                                                  |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`, `sw.js`, `/version.json`                            | `no-cache` (unchanged)                                                                                                                                                |
| `/assets/**` hashed JS, CSS, fonts (shell and lazy module chunks) | `public, max-age=31536000, immutable`                                                                                                                                 |
| **`/assets/bo/**` (back-office chunks)**                          | Edge auth rule FD-14 runs **before** any shared cache; response `private, max-age=31536000, immutable` and `Vary: Cookie`; `404` for sessions without `admin.console` |
| `/mf/**`, `/mf/registry.json` [FED]                               | As in DEPLOYMENT_ARCHITECTURE section 3; `/mf/mf-admin/**` gets the same FD-14 rule                                                                                   |
| Public page snapshots (section 2)                                 | Short `max-age` plus event-driven purge; `stale-while-revalidate` allowed; never contain per-user data                                                                |
| `/sitemap*.xml`, `robots.txt`                                     | Short `max-age` (sitemaps change on publish events)                                                                                                                   |
| API                                                               | `private, no-store` by default (unchanged)                                                                                                                            |

Release, bundled: one artefact set per release; canary by shell cohort/flag (OPS-REL progressive delivery); rollback = previous artefact set plus new SW version string (VCD-01 section 6.9); kill-switch SW unchanged. The weekly federated build is a scheduled non-release job; no registry store, signing key or KMS custody is provisioned until federation is activated (MFA-01-REV2 section 1).

### 2. Edge rule for privileged chunks (FD-14) - operations view

| Item                | Requirement                                                                                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rule                | Valid session and capability `admin.console`, else `404`. Paths `/assets/bo/**` and, if federated, `/mf/mf-admin/**`                                                                                                                                           |
| Order of evaluation | Auth check before cache lookup; gated responses are never stored in a shared cache without the check                                                                                                                                                           |
| Capability source   | **[OPEN, owner Security Architect]** signed-token verification at the edge versus sub-request to an auth-check endpoint with a short per-session cache (MFA-01-REV2 section 2.4). A shared HMAC secret at the edge is not accepted without a security decision |
| Synthetic probes    | Every 5 minutes [TARGET] from outside: anonymous and non-admin fetch of the back-office entry must be `404` (alert on any `200`); admin synthetic must be `200`                                                                                                |
| Release gate        | Edge-rule test (anonymous, candidate, admin) and a precache-manifest scan for `bo` paths (PWA-01-REV2 rule R2b)                                                                                                                                                |
| Honesty             | Controls who can obtain the code; the bundle is not treated as secret; the server authorises every call (ADR-T19, INV-T01). Failure scenario FIM-01 FI-31 (MFA-01-REV2)                                                                                        |

### 3. Public page prerender hosting (ADR-T24, proposed)

Design is in FEA-01-REV2 section 2.2. Operations view:

| Component           | Placement and requirement                                                                                                                                                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Snapshot generator  | A worker job class (`public-snapshot`) triggered by outbox events `job.published`, `job.updated`, `job.closed`, `job.taken_down`, profile visibility change and erasure; idempotent per entity and version; runs in the existing worker (no new service); retry and dead-letter as other job classes                                         |
| Storage             | Object storage prefix for snapshots; versioned; lifecycle rule removes snapshots of closed jobs after the notice period [OPEN]                                                                                                                                                                                                               |
| Serving             | Edge rule maps public canonical paths to the snapshot with fallback to the SPA shell when missing (never a 5xx); `Cache-Control` short plus purge call on each event                                                                                                                                                                         |
| Sitemaps and robots | Worker job regenerates sitemap index and child files (at most 50,000 URLs each) on a schedule and on bulk change; `robots.txt` allows public paths and disallows app routes                                                                                                                                                                  |
| Privacy             | Hide/erasure events purge the snapshot and the sitemap entry first; purge SLA [OPEN, Privacy lead]; the privacy notice states that search-engine copies are outside our control                                                                                                                                                              |
| Renderer            | Template renderer in the API versus headless render in the worker: spike [OPEN]; whichever is chosen runs behind the same job class                                                                                                                                                                                                          |
| Observability       | `public.snapshot_age_s` (per template), `public.snapshot_missing_total`, `public.purge_latency_s`, sitemap URL count; alert when age exceeds the freshness target [OPEN] or when the fallback rate rises                                                                                                                                     |
| Failure modes       | Generator down: pages stay at the last snapshot (stale), jobs closed meanwhile show closed content only after the purge, so purge failures are the priority alert; storage unavailable: edge falls back to SPA shell; renderer bug: previous snapshot retained, new write rejected by a validation check (title, canonical, JSON-LD present) |
| Capacity and cost   | Add a row to the cost envelope (21_*): snapshot generation, storage, egress; vendor quotes empty by design (REVW-16)                                                                                                                                                                                                                         |
| Tests               | No-JS fetch of each template; purge test; sitemap URL sample crawl; fallback test with the snapshot deleted                                                                                                                                                                                                                                  |

### 4. Observability and SLO wording

| Place                                                                                  | Read as                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OBSERVABILITY_DESIGN spans and metrics named `mf.registry.*`, `mf.remote.*`            | [FED]. In bundled mode: span `module.load` (chunk load, `source=bundled`) and metric `module.load_error_total`; RUM attribute `ts.mf_mode` (already defined in FEA-01 section 11) distinguishes the modes |
| OPS-SLO SLO-03 (per-remote activation, 216 min/month) and SLO-17 (federation overhead) | Apply only when federated; SLO-17 cannot be met on cold deep links with the corrected budgets without a size trade-off (FEA-01-REV2 section 4.3). Owner of folder 15 to adopt                             |
| Alerts on `registry.*` and signature failures                                          | [FED]; in bundled mode the equivalents are asset-reachability synthetics and the FD-14 non-admin `200` alert                                                                                              |
| New metrics                                                                            | `edge.bo_denied_total` (by reason), `edge.bo_allowed_total`, `public.*` (section 3)                                                                                                                       |

### 5. Items for the governance pass

ADR-T24 and the ADR-T23 scope note (8 remotes, FD-14); OPEN items: edge capability source, purge SLA, freshness target, renderer spike, closed-job status-code policy [UNVERIFIED against current search-engine guidance]; cost envelope row for snapshot generation; FIM-01 FI-31 runbook (RB-nn) to be assigned by operations.

### 6. Supersession map (relationship only)

| This file | Supersedes                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| section 1 | The cache-control summary in DEPLOYMENT_ARCHITECTURE section 3 for the bundled default (adds `/assets/bo/**` and snapshot rows) |
| section 2 | Nothing existing; fills the missing mechanism behind "privileged UI is never delivered" (MFA-01 section 4 original claim)       |
| section 3 | Nothing existing; new design for OPEN-FE-17                                                                                     |
| section 4 | OBSERVABILITY_DESIGN metric names for bundled mode; OPS-SLO applicability (folder 15, relationship only)                        |

## Legacy Merge B-17: Deployment, Environments, Release Preflight, Backup/Restore Drills and Maintenance Tooling (Prior Attempt)

_Former file: `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/LEGACY_MERGE_DEVOPS_AND_DEPLOY.md`._

Doc ID: LGM-B-17 · Owner: Platform/Infrastructure Architect (with SRE Lead) · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: OPS-DEP, OPS-REL, OPS-OBS, OPS-SLO, DB-04, OPEN-14, OPEN-21, OPEN-22, OPEN-23, OPEN-36 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/deploy/README.md`, `.../deploy/NEW_SUPABASE_PROJECT.md`, `.../deploy/RECOVERY.md`, the environment/config/preflight sections of `docs/quality/OPERATIONS.md`, the CI sections of `docs/quality/TESTING.md`, the hosted gate (`docs/engineering/DATABASE.md`, merged in full in `../12_DATA_AND_DATABASE/LEGACY_MERGE_DATABASE_REFERENCE.md` section 6), and `docs/engineering/PROJECT_MAINTENANCE.md`.

### 0. Frame

- **Nothing is deployed and no infrastructure code exists in this project.** The archive holds only the three deploy _markdown_ files; the compose files, proxy config, Dockerfiles and backup scripts they reference (`deploy/oracle/compose.yaml`, `compose.supabase.yaml`, `.env.example`, `backup.sh`, `verify-restore.sh`) are **not in this repository** and were never executed on an Oracle VM by the prior attempt ("This config has not been executed on an Oracle VM"). Treat the documents as an _unverified starting configuration_ for the reference option "A. Single VM + Compose (Oracle)" already recorded in `OPS-DEP` section 6 / OPEN-14.
- "Prior attempt reported" = statements in those documents about the earlier attempt; "Target requires" = requirement here.
- The `.env`-style example values in the verbatim records are placeholders only ("REPLACE_ME", "REPLACE_WITH_A_FRESH_RANDOM_SECRET"); no credential exists in this file. The hosted project reference `qidckctwrkxyiwworchd` (Mumbai, `ap-south-1`) is an identifier, not a secret, and is recorded as a historical reference target only.

### 1. Environment ladder and configuration (prior attempt) - requirements carried over

- Ladder: `local -> CI -> preview -> staging -> production`, each with separate secrets/config. **Target:** matches OPS-REL section 5 environment table.
- Processes: **API** - exactly one process per database in the prior design (single-writer read model); **Worker** - claims jobs with `FOR UPDATE SKIP LOCKED` (does _not_ give exactly-once; multiple workers can reclaim expired batch leases and run a job twice, audit D-02); **Web** - static bundle with build-time contact variables (`VITE_SUPPORT_EMAIL`, `VITE_PRIVACY_EMAIL`, `VITE_SECURITY_EMAIL`) baked in at build time. **Target requires:** API replicas allowed (ADR-T05), fenced leases (ADR-T09); build-time contact variables only for public values.
- Configuration rules the prior attempt enforced at startup (listing preserved because each is a good boot-time refusal for the target):

| Variable                                           | Production rule                                                                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `TOKEN_SECRET`                                     | Required, ≥ 32 random characters. Rotating it signs everyone out.                                                                      |
| `DATABASE_URL`                                     | Required; not the local default.                                                                                                       |
| `STORAGE`                                          | `pg` (default). `memory` is refused in production and staging.                                                                         |
| `CORS_ALLOWED_ORIGINS`                             | The web origin(s); localhost is refused in production.                                                                                 |
| `BILLING_MODE`                                     | `disabled` (default), `simulated` (no payment; refused in production), or `stripe` (configured provider).                              |
| `BILLING_WEBHOOK_SECRET`                           | Unset ⇒ the billing webhook answers 503 to everything.                                                                                 |
| `AUTH_RATE_LIMIT_MAX_REQUESTS`                     | Login attempts per IP+email and sign-ups per IP per window (default 10).                                                               |
| `RATE_LIMIT_MAX_REQUESTS` / `RATE_LIMIT_WINDOW_MS` | Global limiter per signed-in account (per address when anonymous); default 300 per minute.                                             |
| `TRUST_PROXY`                                      | **Required behind a load balancer** (e.g. `1`): otherwise every anonymous client shares the proxy's address and one rate-limit bucket. |

`apps/api/src/index.ts` refuses to start in production when any rule above is broken and
prints which ones (`productionConfigProblems()`). Staging (`NODE_ENV=staging`) gets the
`TOKEN_SECRET`, `DATABASE_URL` and `STORAGE` rules too, but may simulate billing and allow a
localhost origin for testing.

Notes: staging got the secret, database-URL and storage rules but could simulate billing and allow a localhost origin; the API refused to start in production listing every broken rule. **Target requires:** a single typed configuration package validated at boot in API **and** worker; production refuses (a) in-memory/ephemeral storage, (b) secrets shorter than the minimum or equal to published test keys, (c) localhost CORS, (d) any simulated provider mode, (e) provider test-mode keys; `TRUST_PROXY`-style setting documented as mandatory behind a load balancer (otherwise all anonymous clients share one rate-limit bucket). Known prior defect to avoid: AI feature flags parsed with `z.coerce.boolean()` so the string `"false"` enabled them (only strict parsing - e.g. `z.enum(["true","false"])` - is safe); add a config test per boolean flag.

### 2. CI and release gates (prior attempt) - facts to reconcile with OPS-REL

Pipeline order on every push and pull request: install with frozen lockfile; lint; typecheck (project build, then test projects); tests (unit, integration, API, security); build; e2e (with accessibility and performance); PostgreSQL service container for durability tests; migration-idempotency step; migration application to an empty database. CI used Node 24; the package manager was pinned in the root manifest; the root build built packages before apps; API/worker dev commands ran compiled output rather than watchers (so a stale build gave misleading results). Release (legacy target model): "No release without: security gate; critical E2E; accessibility evidence; migration proof; rollback path; observability; business acceptance." **Target mapping:** OPS-REL RG-01..RG-14; conflicts and gaps are in `../16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` (L-B16-01..03).

Local developer commands reported (kept for the developer guide owner): install `pnpm install` (pinned pnpm); dev `pnpm dev`; tests `pnpm test`, `pnpm test:pg` (needs `TEST_DATABASE_URL`), `pnpm test:e2e`; `pnpm lint`; `pnpm typecheck`; `pnpm build`; `pnpm db:migrate`; on Windows the script shim may be blocked by execution policy - use the `.cmd` form or `cmd`.

### 3. Prior-attempt database operations that are deployment prerequisites

- Case-insensitive unique email index on a populated database fails if two emails differ only by case - de-duplicate first.
- Rows changed directly in SQL are seen by the (hybrid) API only after restart - **retired by ADR-T05**.
- Bootstrapping the first platform admin: no API route created one (sign-up offered only candidate and recruiter; role changes required an existing admin); the first admin was added by a direct SQL update of the user's roles followed by an API restart. **Target requires** a documented, audited, one-time bootstrap procedure (a CLI/seed task creating the first admin from a secret-manager value with an audit-log entry, never a hand-run UPDATE) - **L-B17-01**.
- Background-job retention: terminal jobs older than 7 days purged opportunistically; one-time codes and reference tokens stripped from a job's payload on finish. **Target:** DB-03 retention; keep payload scrub.

### 4. Single-writer lease and pooler compatibility

Prior design: a session-level advisory lock (`pg_try_advisory_lock(718201, 1)`) held for the whole API lifetime refused a second API process; losing the lock session returned 503 until restart; a transaction pooler was not compatible with the session lease. **Target:** retired by ADR-T05 (no single-writer constraint), which also removes the pooler restriction; if any component later needs a lease (for example a scheduler), use a leased row with fencing token (ADR-T09), not a session lock.

### 5. Read-only release preflight (prior attempt) - gate design to copy

Run from the repository root with `DATABASE_URL` pointing only at the intended target; output contains check identifiers and counts, never personal records or secrets; nonzero exit blocks promotion:

```sh
# Before applying migration 00043 on an EXISTING populated database:
node scripts/release-preflight.mjs --mode=pre-00043
# After applying all migrations; also run in CI against clean Postgres:
node scripts/release-preflight.mjs --mode=schema
# On staging/production, from an external monitor after the worker is running:
node scripts/release-preflight.mjs --mode=operational
```

- `pre-00043`: detects case-folded email duplicates, active-application collisions and candidate ids with no corresponding user record; conflicts resolved under an approved backfill plan, **not by deleting rows automatically**.
- `schema`: detects changed applied SQL (checksum), missing required migrations, required indexes, foreign-key targets and RLS enablement on sensitive tables; it checks RLS is _enabled_, **not** that grants and policies prove tenant isolation.
- `operational`: also fails on stale worker heartbeat (45 s), queued jobs overdue by five minutes, or terminal job failures within the past hour. The nonzero exit status must be wired to an external monitor - running the script once creates no alerts.
- "These checks do **not** demonstrate an actual populated-database upgrade, backup/point-in-time restore, load or cold-boot performance, HTTPS reverse proxy, multi-replica admission, rolling deploy or incident response. Capture separate staging evidence and operator approval before closing issues #46 or #47."
- **Target requires** (new RG sub-gates, owner Release Engineering): (a) a `schema` preflight in CI on every PR (checksum, contiguity, RLS-enabled, FK targets, required indexes); (b) an `operational` preflight run as a synthetic monitor that pages on stale heartbeat / overdue queue / terminal failures (maps to ALT-* alerts); (c) a `pre-import` data-quality preflight for any reference-data import (MIG-DATA-01) with duplicate-email, orphan-reference and active-application-collision checks; (d) the rule "preflight never deletes data".

### 6. Prior-attempt Oracle staging deployment (verbatim record) - reference option A

**Unverified starting configuration; public launch was blocked until issues #44-#50 had acceptance evidence.** The seven issue references map to: #44 email delivery, #45 privacy/erasure policy, #46 migrations, #47 operations, #48 persistence, #49 interview/session integrity, #50 billing (mapping given in the hosted-project document).

This deployment is an **unverified starting configuration** for Oracle Ampere ARM64.
Public launch is blocked until [issues #44–#50](https://github.com/yhsomani/talentsphere-complete/issues) have appropriate acceptance evidence.

### Host preparation

1. Provision an ARM64 Ubuntu instance in your Oracle home region. Ensure sufficient free RAM/disk, and install supported Docker Engine + Compose plugin from official packages.
2. Configure Oracle VCN security rules and host firewall to accept **only 22/tcp from a trusted management IP, 80/tcp and 443/tcp from intended testers** (and 443/udp only if HTTP/3 is desired). Keep ports 4000 and 5432 private. Prefer SSH keys and disable password SSH.
3. Point SITE_DOMAIN's DNS A/AAAA record to the public IP; verify it resolves before requesting TLS.
4. From repository root, copy `deploy/oracle/.env.example` to `deploy/oracle/.env`. Set a real domain/email, two different strong random secrets, and restrictive file permissions (`chmod 600 deploy/oracle/.env`). Use URL-safe PostgreSQL password characters or percent-encode them in the DATABASE_URL.
5. Review configuration and migrations before deploying. Do NOT run migrations automatically as part of a public service restart.

### Initial deployment (run from repository root)

```sh
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml build
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml up -d db
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml run --rm --no-deps api node scripts/migrate.mjs
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml up -d
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml ps
```

**Do not treat container startup as proof of readiness.** Verify HTTPS, auth, worker heartbeat, migrations, browser journeys, tenant isolation, resource use, and outbound mail (if enabled). Provision a non-public staging account and restrict testers; this compose file does not include an access-control gateway.

### Important limitations

- Exactly **one API instance** is supported per DB. The API uses a PostgreSQL advisory lock and caches read state. Never `--scale api` or turn on multiple replicas.
- The database is intentionally private to the Compose network. The host must have a separate encrypted off-instance backup process; this Compose file **does not implement backups**. Prove a full restore into an isolated database, including migration history and jobs, before accepting real user data.
- Email verification needs provider credentials, domain verification and real deliverability testing. `EMAIL_PROVIDER=none` fails closed.
- Billing is disabled; do not enable simulated billing. Interview scoring and ephemeral modules remain release-gated.
- The image contains build tooling and source for simplicity. Hardening to smaller runtime images, pinned image digests, scans, resource ceilings, service health checks and deployment rollback remain necessary prior to public launch.
- Environment variable interpolation may break with reserved URL characters in POSTGRES_PASSWORD; prefer cryptographically generated URL-safe secrets.
- This config has not been executed on an Oracle VM. Review storage, ARM64 image availability and free-tier limits for the selected tenancy.

#### 6.1 Target interpretation of the Oracle staging limitations

| Prior attempt limitation                                                                                                                                                                                                | Target requires                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Exactly one API instance per DB (never scale)                                                                                                                                                                           | Not applicable under ADR-T05; staging may still be one instance but must not rely on it                                                        |
| Database private to the Compose network; no backups implemented in the compose file                                                                                                                                     | Encrypted off-host backups with a passed restore drill before any real user data (OPS-DEP section 7 REC-001/002)                               |
| Email provider credentials, domain verification and deliverability testing needed; `EMAIL_PROVIDER=none` fails closed                                                                                                   | Same: fail-closed default; SPF/DKIM/DMARC (see operations file)                                                                                |
| Billing disabled; do not enable simulated billing; interview scoring and ephemeral modules release-gated                                                                                                                | No simulated billing; no simulated scoring; no ephemeral modules                                                                               |
| Image contains build tooling and source; hardening to smaller runtime images, pinned image digests, scans, resource ceilings, service health checks and deployment rollback "remain necessary prior to public launch"   | Multi-stage minimal runtime images, digest pinning, SBOM + vulnerability scan + signing (RG-04), resource limits, health checks, rollback path |
| Reserved URL characters in the database password break environment interpolation                                                                                                                                        | Use URL-safe generated secrets or percent-encode; add a config test that parses the connection string                                          |
| Firewall: only 22/tcp from a trusted management IP, 80/tcp and 443/tcp from intended testers (443/udp only if HTTP/3), ports 4000 and 5432 private, SSH keys, no password SSH, DNS A/AAAA resolving before TLS issuance | Adopt as the minimum host-hardening checklist for any single-VM environment                                                                    |
| "This compose file does not include an access-control gateway": provision a non-public staging account and restrict testers                                                                                             | Staging access control (basic auth/VPN/IP allow-list) is a requirement for any internet-reachable staging                                      |
| Do NOT run migrations automatically as part of a public service restart                                                                                                                                                 | Migrations are a separate, gated release step (DB-04 order: expand migrations, then deploy, then backfill, then flags, then contract)          |

### 7. Prior-attempt hosted database project note (verbatim record)

Authoritative hosted project was a managed-Postgres project in the Mumbai region; "No previous projects are configured or supported by this deployment profile." The record also lists the compose-with-hosted-database variant, the STOP notice that the ordinary migration runner must not be run against the hosted project, and a list of release gates. **Target:** the same list is subsumed by the hosted gate in the database file (section 6) and by OPS-DEP; keep this text as the original.

**Authoritative hosted Supabase project:** `qidckctwrkxyiwworchd` (`talentsphere-production`, `ap-south-1`).

No previous Supabase projects are configured or supported by this deployment profile.

### Running on Oracle without another PostgreSQL server

Use `deploy/oracle/compose.supabase.yaml` rather than the older local-database
`compose.yaml`. The API and worker both use exactly the same **server-only**
`DATABASE_URL` supplied from the private deployment environment. The React
bundle does **not** need a Supabase service-role key or PostgreSQL password.
Do not supply either as a Vite environment variable.

Example deployment-specific `deploy/oracle/.env` values (placeholders only):

```dotenv
SITE_DOMAIN=staging.example.com
ACME_EMAIL=operator@example.com
TOKEN_SECRET=REPLACE_WITH_A_FRESH_RANDOM_SECRET
# Obtain the actual URI from the new project's Connect dialog.
# This example is intentionally not a usable credential:
DATABASE_URL=postgresql://postgres:REPLACE_ME@db.qidckctwrkxyiwworchd.supabase.co:5432/postgres?sslmode=verify-full
EMAIL_PROVIDER=none
```

If Oracle's network cannot reach the direct IPv6 database endpoint, use the
appropriate Supabase **session pooler**, with the **actual** hostname and
`postgres.qidckctwrkxyiwworchd` database username provided by Supabase.
The server checks the expected project ID and rejects mismatching database
connection strings. TLS certificate and hostname verification are required.
Store credentials only in protected server-side environment or secret storage.

```sh
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.supabase.yaml config --quiet
```

**STOP:** `pnpm db:migrate` is still blocked on hosted Supabase. The existing
migration runner creates compatibility objects under the provider-managed
`auth` schema and could damage authentication. The reviewed, versioned
hosted-migration adapter and full RLS verification must be completed before
bringing up API/worker traffic. This configuration is not a functioning
application deployment by itself.

### Required release gates

- Review existing schema migrations and migrate application-owned FKs off
  `auth.users` or deliberately select Supabase Auth with an explicit transition.
- Keep one Fastify API instance until its in-memory read model is eliminated.
- Protect all public application tables with least-privilege RLS and GRANTs;
  note Fastify's tokens are **not** Supabase Auth JWTs.
- Test two users and two organizations against SQL authorization **and**
  the API, with direct Data API exposure assessed explicitly.
- Configure and test transactional email for work-history confirmation.
- Approve and implement legal deletion timeframes and scheduled erasure.
- Verify schema migrations, performance, encrypted backups, real restore,
  worker health and rollback on a nonproduction copy.
- Do not enable paid billing or simulated interview scoring.

Issue mapping: #44 email, #45 privacy, #46 migrations, #47 operations,
#48 persistence, #49 interview/session integrity, #50 billing.

### 8. Prior-attempt backup and restore checks (verbatim record)

Run `bash deploy/oracle/backup.sh` on the staging host. By default, dumps land in
`private-backups/` at repository root; this directory must remain private, untracked
and inaccessible from the web. Use `BACKUP_DIR` to select a secure external location.

Run `bash deploy/oracle/verify-restore.sh /path/to/backup.dump` to restore into a
temporary database, verify the migration ledger, and drop the test database. Ensure
adequate database disk space. The live `talentsphere` database is not replaced.

**These scripts are not yet executed in Oracle.** A local dump is insufficient:
configure an encrypted off-VM destination, retention, a scheduler, missed-backup
alerts, a separate-host restore drill, and documented RPO/RTO before real users.
Verify application data and workflows after restoring. Protect backup files as
sensitive personal information. Never commit or upload plaintext dumps publicly.

**Target requires:** backup script + restore-verification script as repeatable, scheduled jobs with: encrypted off-VM destination, retention, missed-backup alert (SLI "last successful backup / WAL age", FM-34), separate-host restore drill, documented RPO/RTO (OPEN-23), and post-restore checks (migration ledger intact, jobs table, application workflow smoke, erasure-tombstone replay). Backup files are personal data: private directory, untracked, never web-accessible, never plaintext in public storage. Both scripts "not yet executed" in the prior attempt - nothing is proven.

### 9. Project maintenance tooling (prior attempt) - developer clean/reinstall utility

A Windows PowerShell utility (batch wrapper plus engine) cleaned generated outputs and dependency directories and optionally reinstalled/rebuilt; it is **not a TalentSphere product requirement** and the prior attempt's own manifest classed its original request and test plan as a separate effort. Its distinct facts are preserved here because they contain safety lessons for any repo-cleanup script:

Source cross-check: `431c425a`, 2026-10-23. The current tool is
clean-reinstall.bat with
clean-reinstall.ps1. The older Bash
`project-maintenance.sh` and its test script are absent. Their unique usage,
requirements and test history are preserved in the
maintenance archive.

### Current execution path

The batch wrapper selects `pwsh.exe` when available, otherwise `powershell.exe`,
forwards arguments to the engine and propagates its exit code. It explicitly
uses process-scoped ExecutionPolicy Bypass; this is source behavior, not an
instruction to bypass a host refusal.

The engine binds PowerShell parameters, validates the root, initializes a log,
discovers projects/workspaces, resolves cleanup candidates, optionally prompts,
then cleans and/or invokes installers/builds. `Get-DiscoveredProjects`,
`Test-SafePathContainment`, `Resolve-ProjectCleanTargets`, `Invoke-SafeClean`,
`Resolve-Executable`, `Invoke-ToolCommand` and `Invoke-ReinstallAndBuild` are the
existing extension points. It recognizes multiple ecosystem manifests and uses
workspace membership to skip redundant member installations. Runtime correctness
for every ecosystem is unverified by this documentation pass.

Use native parameter spelling when inspecting help:

```powershell
powershell.exe -NoProfile -File .\clean-reinstall.ps1 -Help
```

`-DryRun`, `-CleanOnly`, `-InstallOnly`, `-Build`, `-DeepClean`, `-Root`, `-Exclude`,
`-MaxDepth` (default 5), `-ContinueOnError`, `-Yes` and `-VerboseOutput` are declared
parameters. The script also advertises double-dash aliases; cross-shell parsing
was not exercised here.

### Important differences from the historical safety claims

- Dry-run skips cleanup/install execution but **writes a timestamped log** under
  the selected root, falling back to the temporary directory. It is not a
  zero-filesystem-write inspection.
- The confirmation branch applies to an invocation without arguments. Explicit
  operation flags can execute without another confirmation; do not assume every
  mutation prompts or that `-Yes` is always required.
- Cleanup/install/build changes generated outputs and dependency directories.
  Under AGENTS.md, agents cannot run these operations without
  explicit authorization for protected build-file changes.
- Logging redacts selected secret patterns; that is not proof that arbitrary
  installer output cannot contain private data.
- Source contains path-containment/reparse checks and cleanup guards. Historical
  test passes are not certification against races or every filesystem/platform.

### Tests and historical material

`tests/run-tests.ps1` loads four tier files and accepts `-Tier`, `-TestId`,
`-FailFast` and `-VerboseOutput`. Fixtures and stress probes are in `tests/`.
They create/delete files and launch the maintenance engine; they were not run
for this documentation-only change. Review their effects before execution under
the build-file restriction.

The archive retains the original request and the 38-case test report, including
its empty-project-array defect finding. That finding is historical and was not
reproduced here. The duplicate root implementation plan was removed; its exact
copy remains in `.agents/teamwork/orchestrator_1/PROJECT.md`.

**Target requires:** if a clean/reinstall helper is created, it must be dry-run safe (no filesystem writes in dry-run, or document them), always confirm destructive operations, contain path-containment and reparse-point checks with tests for races, redact logs, and be excluded from agent-run commands unless authorized. Original request and 38-case test report of that utility live only in the prior attempt's reports (not in this archive subset); the defect it recorded ("empty project array") is historical and unreproduced.

### 10. Open items raised by this file

| ID       | Question                                                                                                      | Owner                         |
| -------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| L-B17-01 | First-admin bootstrap procedure (audited, no hand-run SQL)                                                    | Security Architect + Platform |
| L-B17-02 | Whether to adopt Oracle single-VM Compose as dev/staging (OPS-DEP option A) given the unexecuted prior config | OPEN-14                       |
| L-B17-03 | Preflight modes (schema, operational, pre-import) as RG sub-gates                                             | Release Engineering           |
| L-B17-04 | Strict boolean parsing for all feature flags                                                                  | Backend (config package)      |

<!-- ledger-D D-17 -->

### Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md (gap closure D-17)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: the 28 missing test-case ids TC-04..TC-37 (all of TC-01..TC-38 with results and timings are quoted in the 16_QA section), ~113 code tokens (flags `--max-depth`, `--approve-cleanup`, ecosystem markers `build.gradle`, `package-lock.json`, `.nuxt`), detected-projects table, per-candidate size tables, menu numbering, per-test timings.

````text
L18: ## Detected projects and installation boundary
L19:
L20: There are ten `package.json` files: one workspace root and nine members. `pnpm-workspace.yaml` includes `apps/*` and `packages/*`; the root `pnpm-lock.yaml` records those importers. The declared and locally available manager is `pnpm@11.7.0`. Local Node is v24.19.0; CI and Docker use Node 24. No separate nested installation boundary or competing lockfile was found outside installed dependencies.
L21:
L22: | Project | Technology / purpose | Shared dependencies | Generated output observed |
L23: |---|---|---|---|
L24: | `.` | pnpm workspace; Vitest, Playwright, Prettier, TypeScript | Installation owner for all members | Root `node_modules`, `test-results` |
L25: | `apps/api` | TypeScript, Node, Fastify HTTP API | config, contracts, domain | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L26: | `apps/web` | TypeScript/TSX, React, React Router, Vite | ui | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L27: | `apps/worker` | TypeScript, Node, PostgreSQL worker | domain, observability | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L28: | `packages/config` | TypeScript, Zod environment validation | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L29: | `packages/contracts` | TypeScript, Zod API contracts | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L30: | `packages/domain` | TypeScript domain logic | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L31: | `packages/observability` | TypeScript, Pino | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L32: | `packages/testing` | TypeScript test helpers | domain | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L33: | `packages/ui` | TypeScript shared UI package | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L34:
L35: Each member's manifest and `tsconfig.json` were found. All member TypeScript configs emit to `./dist`; composite compilation writes incremental metadata. Vite also targets `apps/web/dist`. Root TypeScript references list all nine members. Root build scripts compile shared packages before applications.
L36:
L37: Other languages and infrastructure actually present:
L38:
L39: - JavaScript/MJS: database migration/seed tooling, release checks, icon generation, and E2E server bootstrap.
L40: - Bash: `deploy/oracle/backup.sh` and `deploy/oracle/verify-restore.sh`.
L41: - SQL: PostgreSQL migrations and seed data under `supabase`; not cleanup candidates.
L42: - Python: `.audit/shoot.py`, a Playwright screenshot helper. No `pyproject.toml`, requirements file, virtual environment, or Python lockfile was found. Report it as an auxiliary script with unmanaged dependencies; do not install Python or infer a Python project.
L43: - Docker/Compose/Caddy and GitHub Actions: container build, staging deployment configuration, and CI checks.
L44: - HTML/CSS, webmanifest, fonts, icons, and screenshots are source/static/evidence assets, not automatically regenerable build output.
L45: - No Java/Kotlin, .NET, PHP, Ruby, Go, Rust, C/C++, Android, or iOS project manifest was found. The future scanner should recognize their manifest names and report unsupported projects instead of guessing cleanup or install commands.
L46:
L47: ## Cleanup inventory and classification
L48:
L49: Sizes below are approximate `du -sk` readings in KiB at discovery time, not promised reclaimable space. Linked/shared allocations and concurrent development can change them. No candidate was deleted. A regenerable classification is permission to propose a target, not authorization to delete it.
L50:
L51: | Candidate | Category | Approx. KiB | Classification and evidence |
L52: |---|---|---:|---|
L53: | `apps/api/dist` | Build | 1164 | Regenerable candidate: configured TypeScript outDir |
L54: | `apps/web/dist` | Build | 910 | Regenerable candidate: TypeScript and Vite outDir |
L55: | `apps/worker/dist` | Build | 54 | Regenerable candidate: configured TypeScript outDir |
L56: | `packages/config/dist` | Build | 40 | Regenerable candidate: configured TypeScript outDir |
L57: | `packages/contracts/dist` | Build | 268 | Regenerable candidate: configured TypeScript outDir |
L58: | `packages/domain/dist` | Build | 1330 | Regenerable candidate: configured TypeScript outDir |
L59: | `packages/observability/dist` | Build | 19 | Regenerable candidate: configured TypeScript outDir |
L60: | `packages/testing/dist` | Build | 18 | Regenerable candidate: configured TypeScript outDir |
L61: | `packages/ui/dist` | Build | 21 | Regenerable candidate: configured TypeScript outDir |
L62: | Nine member `tsconfig.tsbuildinfo` files | Build metadata | 480 combined | Regenerable candidate: composite TypeScript metadata; must clean with output to avoid stale incremental state |
L63: | Root plus nine member `node_modules` directories | Dependencies | Root 150632; member readings 30–7177 each | Workspace-owned installations: one root frozen restore, not ten installs; linked/shared allocation is not additive |
L64: | `test-results` | Test output | 11 | Regenerable candidate: Playwright/performance output; warn that diagnostic evidence is lost |
L65: | `.audit` | Mixed source and evidence | 2528 | Prohibited as a cleanup directory: tracked Python source and baseline screenshots |
L66: | `.playwright-cli` | Browser evidence | 178 | Preserve: tracked recordings and current-session evidence |
L67: | `graphify-out/cache` | Tool cache | 764 | Review only: tracked files exist inside despite ignore pattern; no blanket deletion |
L68: | `graphify-out` excluding cache | Analysis artifacts | Not measured | Review only: tracked reports, graphs, manifests and tool state |
L69: | `supabase/.temp` | Tool state | 0 | Review only; no verified regeneration contract |
L70: | `.reticle` and `apps/web/.reticle` | Verification state | Not measured | Preserve recordings, intent, contracts and cloud configuration |
L71: | `TalentSphere` | Obsidian vault | Not measured | Protected user data, including `.obsidian-mcp` transactions, locks and trash |
L72: | `BRAIN` | Project memory | Not measured | Protected documentation and execution history |
L73: | `private-backups` when present | Database backups | Not measured | Always protected; backup scripts may also use an external BACKUP_DIR |
L74:
L75: Git inspection found no tracked `dist` output, `*.tsbuildinfo`, or `test-results` content. The maintenance tool must repeat provenance checks immediately before execution and reject targets containing tracked or staged files, nested repositories, essential data, or symlinks. Ignore rules alone are insufficient evidence of safety.
L76:
L77: Source-adjacent generated JavaScript, declarations, or map files must not be removed by extension alone. Familiar names such as `build`, `dist`, `cache`, `target`, or `vendor` are review-only without a demonstrated project-specific output contract.
L78:
[...]
L99: Compose owns persistent `db_data`, `caddy_data`, and `caddy_config` volumes. These are never local cleanup targets. `.env*`, key material, database dumps, package manifests, lockfiles, configuration, source, migrations and static/public assets must survive every routine operation.
[...]
L105: One root `project-maintenance.sh` contains the reusable Bash functions and interactive menu requested in the brief (scan, build cleanup, dependency removal, cache cleanup, install, clean/reinstall, full maintenance/validation, individual selection, preview, export, exit). The same implementation exposes `--root PATH`, `--scan`, `--dry-run`, and explicit category/check selectors for fixture tests and automation. No shell configuration is sourced or evaluated.
[...]
L145: Run `bash -n` and ShellCheck when available, then fixture tests. Apply `chmod +x project-maintenance.sh` without staging unrelated changes. Perform only read-only `--scan` and `--dry-run` against the real repository and preserve output for review. No actual repository cleanup or reinstall is authorized by this implementation request. Native macOS/Linux behavior needs evidence or must remain a stated limitation when verification is limited to Git Bash on Windows.
[...]
L172: - `../engineering/PROJECT_MAINTENANCE.md` (`../engineering/PROJECT_MAINTENANCE.md`, not present in this tree): launch commands, selection flags, supported technology/configuration dialects, recovery, reporting, exit codes and platform limitations.
L173: - `../superpowers/plans/2026-10-21-project-maintenance.md` (retired 2026-10-26; see `docs/final-project-documentation/08-ROADMAP-AND-DECISIONS.md` Appendix A/B; original in git history): implementation plan based on the approved design.
[...]
L179: | Test-first implementation | Initial fixture invocation failed with `requested project-maintenance.sh is missing`; later safety findings were reproduced in disposable fixtures before fixes |
L180: | Bash syntax | `bash -n project-maintenance.sh` and `bash -n scripts/tests/project-maintenance.test.sh` exit 0 |
L181: | Executable script | `chmod +x` applied; `test -x project-maintenance.sh` passed in Git Bash |
L182: | Fixture safety and behavior | Final fixed-content run: 74 assertions, zero failures, exit 0; raw stdout captured in `MAINTENANCE_FIXTURE_TESTS_2026-10-21.log` |
L183: | Real recursive scan | `--scan` exit 0; ten Node manifests, nine members and one installation owner; raw stdout captured in `MAINTENANCE_SCAN_2026-10-21.log` |
L184: | Real full preview | `--dry-run --operation full` exit 0; 29 proposed removal targets and 15 proposed commands; raw stdout captured in `MAINTENANCE_DRY_RUN_2026-10-21.log` |
[...]
L188: | Native symlink fixtures | Explicitly skipped: this host cannot create native symlinks with the current identity; ordinary Git Bash `ln -s` can silently copy instead |
[...]
L192: The final real scan and dry-run were repeated after the safety fixes and both exited 0. No root `maintenance-reports` directory or maintenance lock was created by these read-only invocations. A preceding expanded test run had one exit-code assertion failure while implementation edits were still occurring; that run was not treated as passing. The script and fixture source were then held fixed for a complete rerun, which passed all 74 assertions. All actual application build/type/test commands in the dry-run remain proposals, not executed validation results.
[...]
L198: A before/after hash/size/mtime comparison sampled 55 protected existing files. It detected concurrent changes in `apps/web/tsconfig.tsbuildinfo`, `apps/web/vite.audit.config.ts`, and `playwright.audit.config.ts` while other work was active. This task only invoked the real maintenance script with scan/dry-run flags; it did not write those paths. The comparison therefore cannot be cited as proof that the entire shared checkout stayed unchanged. Fixture fingerprints and the implementation's separate read-only paths provide the maintenance-specific evidence; other agents' staged/committed work was left untouched.
[...]
L200: Reports produced by the script are timestamped private logs in an excluded `maintenance-reports` directory after confirmation. The raw verification stdout files beside this document are separate audit artifacts captured by the host and may be ignored by the repository's existing `*.log` rule. No credentials or raw package-manager output are stored in them.
[...]
L215: ## Archived Bash usage reference
L216:
L217: The following preserves the unique usage/portability details formerly in the engineering guide. It is historical; the named Bash implementation is absent.
L218:
L219: ### Archived Bash guide
L220:
L221: > **Current checkout correction (2026-10-21, `a771a87b`):** `project-maintenance.sh` and `scripts/tests/project-maintenance.test.sh` are absent from both the working tree and tracked-file inventory. Commands and implementation results below are historical/proposed material, not runnable instructions or a verified deliverable in this checkout. Restoring a maintenance tool that changes build files requires explicit authorization under AGENTS.md; this documentation audit does not restore it.
L222:
L223:
L224: Run from the repository root in Bash:
L225:
L226: ```bash
L227: ./project-maintenance.sh
L228: ```
L229:
L230: If the executable bit was not preserved by the checkout:
L231:
L232: ```bash
L233: chmod +x project-maintenance.sh
L234: ./project-maintenance.sh
L235: ```
L236:
L237: The script opens a menu for scanning, build cleanup, dependency removal, cache cleanup, installation, combined maintenance, individual project selection, dry-run previews and report export. Menu option 11 deletes all recursively discovered *verified* build artifacts and caches; menu option 12 installs frozen dependencies and rebuilds all supported projects. Choosing a mutation shows the exact targets and commands, validates prerequisites, then requires the exact confirmation `APPLY`. Empty input or EOF cancels. Report-only export requires `EXPORT`. Cleanup is irreversible; ignored artifacts have no Git rollback. Stop dev servers/builds before maintenance and keep backups of anything that is not disposable.
L238:
L239: ## Read-only inspection
L240:
L241: ```bash
L242: ./project-maintenance.sh --scan
L243: ./project-maintenance.sh --dry-run --operation full
L244: ./project-maintenance.sh --scan --sizes
L245: ```
L246:
L247: Scanning and dry-run write nothing to the target repository. Disk measurements are opt-in because traversing dependency installations can be slow; readings are not additive in linked workspaces. `--scan`, `--dry-run` and `--execute` are mutually exclusive. No configuration module or arbitrary project command is executed during discovery.
L248:
L249: ## Selecting operations
L250:
L251: ```bash
L252: # Review one member's build cleanup, without changing anything.
L253: ./project-maintenance.sh --dry-run --operation build --project apps/web
L254:
L255: # Restore once at the workspace root, with a fresh confirmation prompt.
L256: ./project-maintenance.sh --execute --operation install --project .
L257:
L258: # Choose validation commands; order is preserved.
L259: ./project-maintenance.sh --dry-run --operation validate --check build --check unit --check integration
L260:
L261: # Exclude an exact subtree; exclusions are literal, not shell globs.
L262: ./project-maintenance.sh --dry-run --operation full --exclude path/to/independent-project
L263:
L264: # Explicitly classify a reviewed, regenerable local cache. Hard protections remain.
L265: ./project-maintenance.sh --dry-run --operation caches --approve-cleanup caches:tools/generated-cache
L266:
L267: # Explicit report export after a scan; requires typing EXPORT.
L268: ./project-maintenance.sh --scan --export-report
L269: ```
L270:
L271: `--root PATH` inspects another explicitly chosen project boundary. Repeat `--project`, `--exclude`, `--approve-cleanup` and `--check` as needed. A selected workspace member cannot remove a shared installation without selecting the workspace owner. A root workspace install installs its members once; a genuinely independent deep project gets its own command. A combined reinstall cleans selected build output and dependency installations before frozen installation; use `--operation rebuild` (menu option 12) to clean verified build/cache output, install frozen dependencies, and rebuild the discovered workspace.
L272:
L273: ## Supported projects
L274:
L275: The script is Bash, with existing Node used only to parse JSON data. Bash 3.2 or newer and standard `find`, Git, `rm`, `mkdir`, `mktemp`, `mv`, `chmod`, `wc`, `date` and `sleep` are required. `du` is optional for `--sizes`. It adds no package dependency.
L276:
L277: - Node projects are discovered recursively outside protected/dependency directories, including independently configured deep subprojects.
L278: - pnpm workspaces use the repository's simple `packages:` YAML list. npm/Yarn workspace arrays and `{packages: [...]}` are recognized. Literal path components and single-component globs work. Unsupported workspace syntax, negative patterns, recursive `**` patterns and overlapping nested workspace definitions block installation rather than guessing ownership. Commands also refuse workspace scopes containing excluded/protected projects or their pruned ancestors.
L279: - Manager declarations and lockfiles must agree. Ambiguous managers, missing lockfiles, symlink manifests/locks, unsupported managers and declared-version mismatches block execution before removal. No lockfile is generated or deleted.
L280: - Frozen restores use `pnpm install --frozen-lockfile --ignore-scripts`, `npm ci --ignore-scripts`, Yarn 1 frozen installs with scripts disabled, or Yarn modern immutable installs with `YARN_ENABLE_SCRIPTS=false`.
L281: - Lifecycle scripts are deliberately disabled during installation. Review any required native-addon/build approvals and run them manually afterwards. This can prevent an application build until those project-specific steps are completed; restore success alone is not application validation.
L282: - TypeScript outputs are eligible when a safely parsed `tsconfig.json` explicitly identifies an in-project `outDir`. Composite metadata is paired with that output. Ambiguous JSONC, inherited/dynamic output configuration and Vite-only output conventions remain review-only instead of executing configuration code.
L283: - Known Playwright `test-results` output is classified when this repository's Playwright config exists. Losing diagnostic output is called out in the plan. Other caches require explicit review/approval.
L284: - Common Python, JVM, .NET, PHP, Ruby, Go, Rust, C/C++, Swift and Deno manifests are reported as unsupported for execution. The actual repository is a Node monorepo; `.audit/shoot.py` is a preserved auxiliary script without a Python dependency manifest. This tool does not install absent language runtimes or speculate about their cleanup conventions.
L285:
L286: Available check selectors are `lint`, `typecheck`, `unit`, `integration`, `security`, `test`, `build`, `smoke` and `e2e`. Missing scripts are reported as skipped. Only inspected command forms run; unknown scripts and pre/post hooks require manual review and are refused. Recursive pnpm builds also inspect member build scripts/hooks. Formatting checks are supported; formatting writes, migrations, seeding, deployment, Docker cleanup, database tests against an inferred target, global cache purges and automatic server termination are excluded.
L287:
L288: In this repository the root typecheck emits output, API/worker/tests import built shared packages, and Playwright needs Chromium and free server ports. A cleanup or dependency restore alone does not prove the app works. Choose builds before dependent checks, and read failed/skipped results.
L289:
L290: ## Safety and reports
L291:
L292: No directory is deletable merely because it is named `dist`, `build`, `cache`, `target` or `vendor`. Candidate rows show the owner, category, evidence, classification and optional size. Only verified/explicitly approved candidates reach the execution plan; every target is checked again immediately before deletion.
L293:
L294: Hard protections cover source/configuration, environment files and credentials, databases/dumps/migrations, original public assets, documentation, user data, nested repositories, tracked/staged files, excluded descendants, Reticle/browser evidence and the Obsidian vault. Dependency cleanup allows installed package source/configuration but still refuses embedded secrets and data. Symlink roots/ancestors are rejected; dependency symlinks are unlinked with their installation and never traversed. Generated declarations/maps/assets inside verified output directories are distinguished from original source/static input.
L295:
L296: A repository-local `.project-maintenance.lock` serializes approved operations. An existing lock is never overridden automatically; investigate whether a run is active before removing a stale lock manually. This does not synchronize external dev servers or defend against a malicious concurrent filesystem writer. Do not run maintenance across bind mounts or other externally managed storage. Installation and selected validation run trusted repository/tooling code after review; this script is not a sandbox for hostile projects.
L297:
L298: Confirmed execution and explicit export create private timestamped logs under `maintenance-reports/`, excluded from scanning and cleanup. Logs record selected operations, paths, classifications, skipped items, commands, exact exit codes, failures, warnings and final status. Raw command stdout/stderr is captured in a mode-600 temporary file, counted and removed; arbitrary output is withheld from logs to avoid publishing credentials. On failure, rerun the displayed command privately for full diagnostics. No environment dump or `.env` contents are logged. A failed restore/build stops dependent commands, and incomplete work is never reported as a pass. Removed space is not asserted from overlapping/shared allocations.
L299:
L300: SIGINT/SIGTERM stop the invocation-owned command process group, remove private capture files and the lock, retain the report and return 130/143. Deleted artifacts stay deleted. Other errors use 1 for partial failures, 2 for invalid arguments, and 3 for fatal safety/prerequisite/discovery/reporting errors. Cancellation/no-op uses 0; interactive invalid input redisplays the menu.
L301:
L302: ## Tests and portability
L303:
L304: ```bash
L305: bash -n project-maintenance.sh
L306: bash -n scripts/tests/project-maintenance.test.sh
L307: bash scripts/tests/project-maintenance.test.sh
L308: shellcheck project-maintenance.sh scripts/tests/project-maintenance.test.sh # if installed
L309: ```
L310:
L311: The tests create disposable temporary repositories, use stub package managers for command outcomes, and never delete real project output or download packages. They cover recursive discovery, spaces, workspace boundaries, dry-run preservation, confirmations, unknown/protected paths, Git provenance, exclusions, restoration failures, hooks, private reports and descendant cancellation. Native symlink and permission-denial checks explicitly skip when the host cannot enforce them.
L312:
L313: The implementation uses portable Bash/Unix forms intended for macOS/Linux; verification in this environment uses Git Bash on Windows. Native macOS/Linux and Bash 3.2 have not been executed here. Git Bash may copy instead of creating native symlinks, and Windows ACLs do not necessarily enforce Unix mode bits. The fixture suite detects these cases instead of presenting a false pass. WSL and ShellCheck are not installed on this host.
L314:
L315: See the repository audit and validation record (`../reports/MAINTENANCE_AUDIT_2026-10-21.md`, not present in this tree) for detected projects, approximate candidate sizes, verification results and remaining limitations. Existing build files and agent instructions are unchanged by this implementation; real cleanup/reinstallation is an operator action requiring review of the exact current plan.
L316:
L317:
[...]
L339: - Remove build outputs, local dependency folders, and temporary caches according to detected technology (e.g., `node_modules`, `.venv`, `__pycache__`, `.pytest_cache`, `.turbo`, `.next`, `.nuxt`, `dist`, `build`, `bin`, `obj`, `target`, `vendor`).
L340: - Strict Guardrails: Never delete source files, configuration (`.env*`, `.git`, IDE settings), manifests (`package.json`, `pom.xml`, etc.), or lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Cargo.lock`, `poetry.lock`, etc.).
[...]
L346: - Respect local wrappers (`mvnw`, `gradlew`) when present; detect installed tools via PATH (`where.exe`) and gracefully warn/skip if a tool/runtime is absent without crashing the entire run.
[...]
L352: - Supported CLI flags: `--dry-run`, `--clean-only`, `--install-only`, `--build`, `--deep-clean`, `--root <path>`, `--exclude <patterns>`, `--max-depth <int>`, `--continue-on-error`, `--verbose`, `--help`.
````

## Observability Design

_Former file: `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/OBSERVABILITY_DESIGN.md`._

Doc ID: OPS-OBS · Owner: SRE Lead (with Security Architect for log/audit policy) · Version 1.0 · Status: Draft for Review · Relates: ADR-T16, ADR-T19, INV-T10, INV-T14, INV-T18, BR-T041, OPS-SLO, OPS-FMEA, OPS-DEP, SUP-RUN, SUP-INC, OPEN-15, OPEN-20, OPEN-39

**[REF]** The reference documents an intended critical trace (request → user → tenant → feature → API → DB/queue → provider → result), structured logs and an alert list, but states SLOs are to be set "after baseline" and that the current build's observability is partial. The target specifies the full design.

### 1. Principles

1. Signals exist to answer three questions fast: _is it broken_ (SLO burn), _where_ (golden signals by tier, remote and tenant-safe dimensions), _why_ (traces and logs correlated by trace id).
2. Alerts are tied to SLOs or to safety/security invariants — not to raw resource graphs (symptom-based paging; cause-based dashboards).
3. Telemetry never carries secrets or direct personal data (INV-T14); this is tested (TEST-SEC-016).
4. Telemetry export must never block or fail user requests (FM-23).
5. Operational logs are not the audit trail; audit is a separate, append-only, access-controlled store (§4.2).

### 2. Signals and instrumentation (OpenTelemetry, ADR-T16)

| Signal   | Source                                            | Instrumentation                                                                                                                         | Notes                            |
| -------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Traces   | Browser (shell + remotes), API, worker, DB client | OTel Web SDK in shell only (remotes receive the tracer through the Host Contract, avoiding duplicate SDKs); OTel Node SDK in API/worker | W3C Trace Context                |
| Metrics  | API, worker, DB, queue, CDN, synthetic            | RED per route class, USE per resource, business counters                                                                                | Exemplars link metrics to traces |
| Logs     | API, worker, shell error reports                  | Structured JSON (Pino) with redaction; trace/span ids in every line                                                                     | Levels with sampling for debug   |
| Events   | Domain events/outbox                              | Event publish/consume metrics: lag, attempts, DLQ                                                                                       | AsyncAPI-aligned                 |
| RUM      | Browser                                           | Web-vitals style field data (LCP, INP, CLS), remote activation timings, SW lifecycle, version beacons                                   | Sampled; consent-aware; no PII   |
| Profiles | API/worker (optional)                             | Continuous profiling when needed                                                                                                        | [OPEN-20]                        |

Resource attributes (all signals): `service.name`, `service.version`, `deployment.environment`, `ts.shell.version`, `ts.remote.name`, `ts.remote.version`, `ts.api.module`, `ts.release.id`. Span/metric attribute allowlist: route template (never raw URL with ids), method, status class, `ts.principal.role`, `ts.tenant.id` (opaque id — acceptable as an operational dimension only in traces/logs, **never as a metric label** to avoid cardinality blow-up), pseudonymous `ts.actor.id` in traces/logs only. Forbidden: email, name, phone, free text, tokens, query strings, request/response bodies.

### 3. Trace propagation across the federation boundary

```mermaid
sequenceDiagram
  participant U as User action in remote
  participant SH as Shell tracer (Host Contract)
  participant RM as Remote component
  participant API as API (BFF + modules)
  participant DB as Postgres
  participant OB as Outbox table
  participant WK as Worker
  U->>SH: user interaction span (route, remote name+version)
  RM->>SH: request tracer from Host Contract (no own SDK)
  SH->>API: fetch with traceparent + tracestate (same-origin)
  API->>DB: db spans (txn: state + outbox + audit)
  API->>OB: insert event with traceparent column
  API-->>SH: response with server-timing/trace id header
  WK->>OB: claim event (fenced lease)
  WK->>WK: process span, LINKED to producer span (async link, new trace segment)
  WK->>API: optional internal calls propagate context
```

| Boundary              | Mechanism                                                                                                                                                             | Rule                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Shell → remote        | Tracer and current context provided by the Host Contract (ADR-T18, HC-01)                                                                                             | Remote cannot create root traces for user actions; keeps one trace per interaction |
| Browser → API         | `traceparent` header on same-origin BFF calls                                                                                                                         | Same-origin avoids CORS preflight problems                                         |
| API → DB              | DB client instrumentation; statement text sanitised (no literals)                                                                                                     | TEST-FED-011                                                                       |
| API → outbox → worker | `traceparent` stored with the event/job row; worker starts a new trace and **links** to the producer (async fan-out can be long)                                      | Preserves causality without unbounded traces                                       |
| API → third parties   | Outgoing spans recorded; **context headers not forwarded** to providers                                                                                               | Prevent leaking internal ids                                                       |
| Errors in remote      | Error boundary reports with remote name+version and trace id                                                                                                          | FM-04                                                                              |
| Sampling              | Head sampling at a low base rate + **tail sampling** that always keeps errors, slow traces (> SLO class p99), authz denials, canary cohort, and incident-tagged flows | Parameters [OPEN-15]; budget in §10                                                |

Correlation key shown to users on error screens: a short support code derived from the trace id (no PII), enabling PROC-03 triage.

### 4. Logging

#### 4.1 Redaction

| Control                       | Detail                                                                                                                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structured only               | JSON lines; no string-concatenated PII                                                                                                                                                                                                       |
| Redaction at source           | Logger configured with path-based redaction for: `authorization`, `cookie`, `set-cookie`, `password`, `token`, `code`, `refreshToken`, `apiKey`, `secret`, webhook signatures, `email`, `phone`, `name`, `address`, `resume`, message bodies |
| Pattern scrub                 | Secondary scrubber at the collector for emails, JWT-like strings, long hex/base64 tokens, card-like numbers                                                                                                                                  |
| Allowlist for request logging | Log route template, status, latency, sizes, ids; **not** bodies                                                                                                                                                                              |
| Verification                  | Canary strings injected in tests must not appear in log, trace or error-report stores (TEST-SEC-016); production sampling scan job alerts on patterns                                                                                        |
| Client error reports          | Scrubbed; URL query stripped; user-entered text excluded                                                                                                                                                                                     |
| Debug logging                 | Cannot be enabled in production without PROC-04 grant; auto-expires                                                                                                                                                                          |

#### 4.2 Audit log vs operational log

| Property   | Operational log                       | Audit log                                                                                                                                                                                                                                                                                   |
| ---------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose    | Debugging, performance                | Accountability: who did what to which resource and why (INV-T10, INV-T18, BR-T041)                                                                                                                                                                                                          |
| Content    | Technical events                      | Actor, role/scope, action, resource, tenant, reason code, request id/trace id, outcome, before/after summary (no secrets)                                                                                                                                                                   |
| Store      | Log backend; sampled; short retention | Append-only table(s) in Postgres + export to write-once archive; per-row hashes sealed in KMS-signed batch anchors (DB-02 §4.2) for tamper evidence; alert on anchor lag (oldest unanchored row) and on any verifier finding; actor and subject stored as opaque `subject_ref` (DB-02 §4.1) |
| Write path | Async, best effort                    | Same transaction as the action (cannot succeed without being recorded)                                                                                                                                                                                                                      |
| Access     | Engineers                             | Restricted: auditors (ROLE-AUD) read-only, org/institution admins see own tenant, users see own-access log                                                                                                                                                                                  |
| Retention  | Short [OPEN-20]                       | Per retention policy [OPEN-08]                                                                                                                                                                                                                                                              |
| Tamper     | n/a                                   | Updates/deletes forbidden for app role (TEST-OBS-003)                                                                                                                                                                                                                                       |
| Alerting   | Error patterns                        | Anomalies: bulk reads, privileged access, role changes, exports                                                                                                                                                                                                                             |

Audit event catalogue is owned by the Security Architect; each process in SUP-PROC lists its audit events.

### 5. Dashboards (golden signals) — as code

Dashboards and alert rules live in the repository (`infra/observability/`) and are linted (TEST-OBS-002): every SLO must have a dashboard panel, an alert and a runbook link.

| ID      | Dashboard                      | Latency                                  | Traffic                        | Errors                                          | Saturation / other                                       |
| ------- | ------------------------------ | ---------------------------------------- | ------------------------------ | ----------------------------------------------- | -------------------------------------------------------- |
| DASH-01 | SLO overview and error budgets | per SLO                                  | —                              | burn rates                                      | budget remaining                                         |
| DASH-02 | Shell and CDN                  | TTFB, asset load                         | requests, hit ratio            | 4xx/5xx at edge                                 | origin load                                              |
| DASH-03 | Remotes health                 | activation ms p50/p95 per remote+version | activations                    | failed/rejected/fallback counts, version mix    | skew detector, SW version mix                            |
| DASH-04 | API by class (C1…C9)           | p50/p95/p99                              | RPS                            | 5xx/429/503                                     | event-loop lag, CPU, memory, in-flight                   |
| DASH-05 | Auth and sessions              | login/refresh latency                    | attempts                       | failures, lockouts, reuse detections            | refresh storms                                           |
| DASH-06 | Postgres                       | query p95, lock waits                    | TPS                            | errors, deadlocks                               | CPU, IOPS, connections, replica lag, WAL, autovacuum     |
| DASH-07 | Worker and outbox              | enqueue→start by class                   | jobs/s                         | failures, DLQ                                   | oldest age, lease expirations, duplicate-effect detector |
| DASH-08 | Third parties                  | provider latency                         | calls                          | errors, breaker state                           | quota/rate limit headroom                                |
| DASH-09 | AI gateway and cost            | TTFT, completion                         | calls                          | blocked (policy), errors                        | spend vs budget, per-tier                                |
| DASH-10 | Billing                        | webhook lag                              | events                         | signature failures                              | drift count, dunning queue                               |
| DASH-11 | Security and tenancy           | —                                        | authz denials                  | cross-tenant canary result, privileged accesses | abnormal bulk reads                                      |
| DASH-12 | Release and canary             | cohort vs baseline                       | —                              | cohort errors                                   | rollout step, flags state                                |
| DASH-13 | Business health                | time-to-shortlist (aggregated)           | applications, evidence created | funnel drop-offs                                | cohort sizes (k-anonymous) — see ANL-MET                 |
| DASH-14 | Support and operations         | ticket first response                    | tickets                        | SLA breaches                                    | backlog by queue (PROC-03)                               |

### 6. Alerts tied to SLOs

**Burn-rate alerting (multi-window, multi-burn-rate):** `burn = error_ratio / (1 − SLO)`; consumption of a 30-day budget over a window = `burn × window / 30 d`. The pattern below follows the published Google SRE Workbook approach; **verify parameters when implementing** (not yet in RES-01; OPEN-13) and tune by OPEN-15.

| Alert               | Condition (all must hold)                  | Budget consumed | Action                                            |
| ------------------- | ------------------------------------------ | --------------- | ------------------------------------------------- |
| ALT-01 fast burn    | burn ≥ 14.4 over 1 h AND ≥ 14.4 over 5 min | ≈ 2% in 1 h     | Page                                              |
| ALT-02 medium burn  | burn ≥ 6 over 6 h AND ≥ 6 over 30 min      | ≈ 5% in 6 h     | Page (or high-priority ticket per OPEN-39 policy) |
| ALT-03 slow burn    | burn ≥ 3 over 24 h AND ≥ 3 over 2 h        | ≈ 10% in 1 day  | Ticket                                            |
| ALT-04 budget watch | burn ≥ 1 over 72 h                         | ≈ 10% in 3 days | Ticket / review                                   |

Apply to SLO-01, 02, 03, 04, 06 and latency SLIs as "good = within class target".

Non-burn alerts (invariant, safety and saturation):

| ID     | Alert                                                                                              | Severity | Route                                 | Runbook       |
| ------ | -------------------------------------------------------------------------------------------------- | -------- | ------------------------------------- | ------------- |
| ALT-10 | Cross-tenant canary probe returns foreign data, or RLS test fails in prod synthetic                | Sev-1    | Page security + SRE                   | RB-01         |
| ALT-11 | Authz allow/deny ratio anomaly (e.g. sudden drop in denials or spike of 403/404 for one principal) | Sev-2    | Page                                  | RB-01 / RB-27 |
| ALT-12 | Outbox oldest age > SLO-20 for hold period                                                         | Sev-2    | Page                                  | RB-12         |
| ALT-13 | DLQ oldest item > SLO-25                                                                           | Sev-3    | Ticket                                | RB-12         |
| ALT-14 | Backup or WAL archive age beyond threshold; restore drill failed                                   | Sev-2    | Page                                  | RB-29         |
| ALT-15 | DB replica lag / connection pool wait / disk growth projection                                     | Sev-2/3  | Page/ticket                           | RB-03         |
| ALT-16 | Certificate / domain expiry within lead time                                                       | Sev-3→2  | Ticket→Page                           | RB-25         |
| ALT-17 | Webhook signature failures spike or webhook lag > SLO-06                                           | Sev-2    | Page                                  | RB-17         |
| ALT-18 | AI spend > soft/hard budget threshold; policy-blocked rate anomaly                                 | Sev-3/2  | Ticket/Page                           | RB-21         |
| ALT-19 | Privileged access grant created/used outside window; grant > 4 h (should be impossible)            | Sev-2    | Page security                         | PROC-04       |
| ALT-20 | Remote version skew: share of sessions with incompatible remote/shell above threshold              | Sev-2    | Page                                  | RB-08         |
| ALT-21 | Telemetry pipeline dark (absent signal heartbeat)                                                  | Sev-3    | Ticket (page if combined with ALT-01) | RB-33         |
| ALT-22 | Malware scan queue age > SLO-22                                                                    | Sev-3    | Ticket                                | RB-19         |
| ALT-23 | Integrity-anomaly flag backlog in human review                                                     | Sev-3    | Ticket                                | RB-23         |
| ALT-24 | Moderation backlog above threshold                                                                 | Sev-3    | Ticket                                | RB-32         |
| ALT-25 | Erasure requests approaching internal deadline (SLO-24)                                            | Sev-3    | Ticket                                | RB-28         |

Every alert must carry: SLO/invariant link, dashboard link, runbook link, owner, severity, and an expected action. Alerts without an action are deleted. Alert quality metrics (precision, pages per on-call shift) are tracked (MET-037 area).

### 7. Synthetic checks and RUM

| ID                                                                                            | Synthetic                                  | Frequency   | Vantage     | Detects                   |
| --------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------- | ----------- | ------------------------- |
| SYN-01                                                                                        | Shell load + capabilities                  | [param]     | ≥ 3         | SLO-02, CDN/LB/TLS issues |
| SYN-02                                                                                        | Each remote mounts (canary account)        | [param]     | ≥ 2         | SLO-03, FM-01/02/05       |
| SYN-03                                                                                        | Login → read → logout with test tenant     | [param]     | ≥ 2         | SLO-04                    |
| SYN-04                                                                                        | Cross-tenant canary probe (read B as A)    | [param]     | internal    | ALT-10                    |
| SYN-05                                                                                        | Apply (test job) idempotent replay         | [param]     | internal    | FM-16                     |
| SYN-06                                                                                        | Upload EICAR → quarantine                  | daily       | internal    | FM-32                     |
| SYN-07                                                                                        | Webhook roundtrip using provider test mode | [param]     | internal    | FM-41                     |
| SYN-08                                                                                        | Certificate and DNS check                  | daily       | ≥ 2         | FM-45                     |
| SYN-09                                                                                        | SW update path (old SW → new release)      | per release | browser lab | FM-06                     |
| SYN-10                                                                                        | Email delivery to seed mailbox             | [param]     | internal    | FM-39                     |
| Synthetic accounts/tenants are flagged and excluded from analytics and billing (QA-STRAT §6). |

RUM collects: LCP/INP/CLS by route, device class, remote name+version, effective connection type; SW state; remote activation outcome; JS error counts. Sampling and consent follow the privacy rules in ANL-MET §6.

### 8. Runbook index linkage

Each alert (§6) and failure mode (OPS-FMEA) maps to a runbook in `18_OPERATIONS_AND_SUPPORT/RUNBOOK_INDEX.md` (RB-01…). Runbooks are stored as code next to dashboards; each has: trigger, first five minutes, diagnosis queries, containment levers (flags), escalation, verification, and post-incident actions. Runbook coverage is a release gate item (RG-12) for new failure modes.

### 9. Backends and retention [OPEN-20]

| Option                                                                                        | Pros                                               | Cons                                                         |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| Self-hosted open-source stack (OTel Collector + metrics/trace/log stores + dashboards/alerts) | Control, lower marginal cost, no vendor lock       | Operations burden; must be separated from app failure domain |
| Managed vendor SaaS                                                                           | Fast, integrated alerting                          | Cost grows with volume, data leaves boundary, lock-in risk   |
| Hybrid (collector + managed backend)                                                          | OTel keeps portability (ADR-T16: no vendor agents) | Needs egress filtering and redaction at collector            |

Retention targets (hot/warm) per signal and the audit archive are [OPEN-20]/[OPEN-08]. Data residency of telemetry follows OPEN-30.

### 10. Cost and cardinality controls

Metric label allowlist (no user/tenant ids); cardinality budget per service enforced in CI; log level sampling; tail-sampling budget; trace attribute truncation; per-service ingest quotas; monthly telemetry cost review in FIN-COST.

### 11. Open items

| Item                                                                   | Ref              |
| ---------------------------------------------------------------------- | ---------------- |
| Backend choice, retention, residency                                   | OPEN-20, OPEN-30 |
| On-call model, paging policy                                           | OPEN-39          |
| Burn-rate parameters, sampling rates                                   | OPEN-15          |
| Verify SRE-workbook parameters and web-vitals constants (research log) | OPEN-13          |
