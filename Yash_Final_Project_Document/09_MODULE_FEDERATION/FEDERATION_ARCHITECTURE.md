# Module Federation Architecture

Doc ID: MFA-01 · Owner: Frontend/Platform Architecture (Module Federation) · Version 1.0 · Status: Under Review
Relates: ADR-T03, ADR-T16, ADR-T17, ADR-T18, ADR-T19 · INV-T13, INV-T16 · FF-03, FF-04, FF-08 · MOD-SHELL, MOD-CAND, MOD-LRN, MOD-OPP, MOD-HIR, MOD-MSG, MOD-ACC, MOD-ADM · HC-01, SCH-01/02, VCD-01, FIM-01, DEP-01, PWA-01, OFF-01, FEA-01 · Research RES-01 R1, RES-02 F11

Tags: [CONF] [TARGET] [OPEN] [REF]. Local decision IDs `FD-nn` are proposals to be registered as ADR-T23+ by the Architecture Review Board; none contradicts ADR-T01…T22.

## 1. Position
ADR-T03 chose Module Federation 2.0, one host shell, seven persona-aligned remotes, Vite + `@module-federation/vite`, manifest-driven runtime registration, and conceded that "plain lazy routes give 80% at 20% cost". This design therefore:
1. Makes federation an **implementation of a typed module contract**, so each remote can be built `federated` or `bundled` (`MF_MODE`) without code change (FD-09).
2. Treats federation as **delivery and fault-containment tooling, not a security boundary** (ADR-T19; §14, FIM-01 §3).
3. Is gated by a spike (WP-FED-SPIKE, §16); RES-02 F11 shows plugin/version claims in sources conflict (RES-01 R1) and SRI is undocumented.

| ID | Decision [TARGET] | Why |
|---|---|---|
| FD-01 | Vite + `@module-federation/vite`; MF runtime API (`registerRemotes`, `loadRemote`, runtime plugins) driven by our registry, not hard-coded remote URLs | ADR-T03; RES-02 F11 |
| FD-02 | Shell is the **only owner** of: router instance, QueryClient, session, outbox/sync engine, telemetry provider, theme/i18n providers | Singletons must be unique; keeps credentials out of remotes (INV-T16) |
| FD-03 | Remotes are served **same-origin** under `/mf/<name>/<version>/` | One CSP origin, SW can serve them offline, cookies same-site, no CORS surface |
| FD-04 | Per-remote registry entries are **Ed25519-signed**, carry monotonic `sequence`, `notAfter`, SRI list; trust anchors embedded in the shell build | Registry-store compromise ≠ code execution; anti-rollback |
| FD-05 | Remotes contribute routes **as data** to the shell-owned router; no remote creates a Router | One history/router singleton; route ownership checkable (FF-03) |
| FD-06 | Cross-remote interaction = typed UI event bus + URL only | No hidden coupling (FF-03/INV-T16) |
| FD-07 | Top-level navigation model is shell-owned data (labels, icons, prefix, capability); a remote contributes secondary nav after it loads | Nav renders before/without remote code (offline, failure) |
| FD-08 | Queued offline operations are **data descriptors** executed by the shell | Flush must not depend on a remote being loadable (OFF-01 §8) |
| FD-09 | `MF_MODE=federated|bundled` per environment | ADR-T03 mitigation; OPEN-03 |
| FD-10 | Singleton deps declared `singleton:true, import:false` in remotes (host provides) | Prevents silent duplicate React/Router copies; load fails loudly instead |
| FD-11 | Shell persists verified **last-known-good (LKG)** entry per remote and falls back to it, then to `rollbackTo`, then to degraded screen | ADR-T18 |
| FD-12 | The service worker is independent of remote releases (remote assets cached by immutable URL) | Remote deploys need no SW update (PWA-01 R3) |
| FD-13 | Generated OpenAPI client code is bundled **per remote**; transport (`host.api`) is host-provided | Client follows API version of the remote, credentials stay in host |

## 2. Topology
```mermaid
flowchart LR
  U[Browser / installed PWA] -->|HTML, sw.js, shell assets| EDGE[Edge / CDN same origin]
  U -->|/mf/registry.json signed| EDGE
  U -->|/mf/name/version/** immutable| EDGE
  U -->|/api/v1/** cookies| BFF[auth routes + API]
  EDGE --> OBJ[(Object storage: shell + remote artefacts)]
  EDGE --> REGS[(Registry store - write only by release job)]
  CI[Per-remote CI/CD] -->|publish assets, sign entry| OBJ
  CI --> REGS
  KMS[(Signing key in KMS)] --> CI
  subgraph Browser runtime
    SW[Service worker]
    SH[MOD-SHELL: router, session, sync, query, telemetry]
    SH -->|loadRemote| R1[MOD-CAND] & R2[MOD-LRN] & R3[MOD-OPP] & R4[MOD-HIR] & R5[MOD-MSG] & R6[MOD-ACC] & R7[MOD-ADM]
  end
  U --- SW
  SH -->|OTel traceparent| OTLP["/otlp same-origin proxy"]
```

## 3. Shell responsibilities and limits (MOD-SHELL)
| Responsibility | Included | Explicitly NOT in shell |
|---|---|---|
| Boot | Registry fetch/verify, LKG, compat selection, SW registration, update manager (PWA-01 §5) | Any domain screen |
| Identity | BFF session snapshot, login/signup/passkey screens, reauth sheet, logout/purge (OFF-01 §10) | Tokens in JS (none exist, ADR-T06) |
| Routing | Single router, route table from registry, guards (session/capability hints), redirects, 404/offline pages | Remote-internal route trees |
| Layout | Header, primary nav, notification bell/badge slot, connectivity chip, toasts, error-boundary slots | Business widgets |
| Data plumbing | `host.api` (CSRF, `Idempotency-Key`, `If-Match`, traceparent, problem+json), QueryClient, offline persister | Per-domain query hooks (live in remotes) |
| Sync | Outbox, flusher, Sync Center UI, conflict dialog frame | Operation logic (descriptors only) |
| Platform | Install prompt, push enrolment, permissions, badging, storage/quota | Domain notification logic |
| Cross-cutting | Telemetry, feature flags provider, i18n core, theming, a11y live regions, error reporting | Domain translations (bundled per remote) |
| Public pages | Landing, login/signup, tokenised referee/invite/confirm flows (`/r/*`), offline, 404 [OPEN-FE-06] | SEO-critical public job/profile rendering — needs prerender/edge strategy [OPEN-FE-17] |
**Limits:** (a) The shell must boot and render chrome with **zero remotes** (kill-switch, outage). (b) No business rules: UI shows server-provided state, `allowedActions`, reasons (INV-T01, repo rule "business rules live only in packages/domain"). (c) A capability needed by ≥ 2 remotes is promoted to `@ts/ui` or `@ts/host-sdk` through a contract change, not copied. (d) Shell JS budget in FEA-01 §14; each new shell feature must name the budget it spends.

## 4. Remotes and rationale
| Remote | Route prefix (ID_REGISTRY) | Domains | Audience | Why a separate remote |
|---|---|---|---|---|
| MOD-CAND `mf-candidate` | `/me/*` | DOM-03, 05, 06 (candidate side), 12 | ROLE-CAND | Core loop (Showcase/Prove); largest candidate surface; evidence UI is the differentiator and changes weekly |
| MOD-LRN `mf-learning` | `/learn/*` | DOM-07, 08 | ROLE-CAND, ROLE-INST | Heavy, specialised (editors, assessment runner UI, media); instructor studio code must not ship to every candidate; integrity-sensitive release cadence |
| MOD-OPP `mf-opportunities` | `/jobs/*`, `/applications/*` | DOM-09/10/11 (candidate side) | ROLE-CAND | Highest-traffic discovery/apply flows; separate perf budget; match explanations |
| MOD-HIR `mf-hiring` | `/hiring/*` | DOM-02, 09, 10, 06 (review), 11 | ROLE-REC, ROLE-HM, ROLE-ORGADM | Recruiter code must not ship to candidates (ADR-T03a); ATS complexity; different release cadence and org-tenant concerns |
| MOD-MSG `mf-messaging` | `/messages/*`, `/network/*`, `/notifications` | DOM-13, 14, 15 | all authenticated | Realtime/SSE, compose, notification centre; shared by every persona but independent domain |
| MOD-ACC `mf-account` | `/settings/*`, `/billing/*`, `/privacy/*` | DOM-16, 22, 01 (security settings) | all authenticated | Security/billing/consent: strict review, low change rate, Stripe-redirect flows, must stay available when others fail |
| MOD-ADM `mf-admin` | `/admin/*`, `/institution/*` | DOM-18, 19, 20 (+21 reporting views) | ROLE-ADM, ROLE-SUP, ROLE-MOD, ROLE-AUD, ROLE-INSTADM, ROLE-FAC | Privileged UI must never be delivered to non-admins (smaller attack surface; INV-T18); lowest traffic |
Observations the registry does not state (**[OPEN-FE-18]**): (1) ROLE-HM/REC also need MOD-MSG and MOD-ACC, (2) `MOD-ADM` hosts both platform admin and institution workspace — different audiences, may split later (trigger: institution team ≠ back-office team), (3) DOM-21 analytics has no owning remote in the registry; recruiter analytics views are assumed in MOD-HIR and platform analytics in MOD-ADM.
**Split heuristics (when to add/merge a remote):** separate team + separate release cadence + distinct audience or sensitivity + bundle > 150 KB gz attributable. **Merge into bundled mode** if < 3 independent frontend teams exist (ADR-T03, OPEN-03) — nothing else changes.

## 5. Runtime discovery and manifest registry
```mermaid
sequenceDiagram
  participant SW as Service worker
  participant S as Shell boot
  participant IDB as ts-meta (LKG)
  participant E as /mf/registry.json
  participant R as Remote (MF runtime)
  S->>S: load embedded boot registry (signed snapshot from shell build) + trust anchors
  S->>IDB: read LKG entries + lastSequence per remote
  S->>E: GET (NetworkFirst 2.5 s via SW) ?ch=stable|canary
  alt fetched
    E-->>S: registry document
  else timeout / offline
    S->>S: use IDB LKG, then embedded snapshot
  end
  S->>S: per remote: verify Ed25519 signature, notAfter, sequence >= lastSequence, status != disabled, killSwitch
  S->>S: compatibility: hostContract, apiRange, dataSchema, shared deps, minShell (VCD-01 s4)
  S->>S: choose entry: current -> rollbackTo -> LKG -> unavailable
  S->>R: registerRemotes([{name, entry: manifestUrl}], {force:true})
  Note over S,R: loadRemote('mf_candidate/module') happens lazily on route match
  S->>IDB: after successful remote mount: store entry as LKG (verified + loaded OK)
  S->>S: re-poll registry every ttlSeconds while visible (only applied to NEXT load of that remote)
```
| Aspect | Design |
|---|---|
| Trust anchors | Ed25519 public keys (`keyId`→key, validity window) compiled into the shell build; not fetched. Key rotation = ship new shell with both keys (overlap ≥ 1 release), then retire. Registry document carries no keys (SCH-02). |
| Per-entry signature | Over RFC 8785 JCS canonical JSON of the entry minus `signature` (SCH-01). Validated example in `REMOTE_REGISTRY.example.json` (example key only; verified by script during authoring). |
| Anti-rollback | Shell stores highest verified `sequence` per remote. Lower sequence is accepted **only** if referenced by `rollbackTo` of a currently valid higher-sequence entry and its `entryIntegrity` matches. |
| Expiry | `notAfter` ≈ issue + 30 d; the release pipeline re-issues (heartbeat) at least weekly. Expired entries are treated as stale: usable as LKG for ≤ 14 d grace with `registry.entry_expired` telemetry, never as "current". Avoids total outage if the heartbeat job fails. |
| Caching | `registry.json`: `Cache-Control: no-cache` + ETag; SW NetworkFirst 2.5 s (PWA-01 R4). Remote assets: immutable. |
| Atomic publish | Registry store write is a single put of the whole document; consumers never see a half-published set. |
| Per-remote independence | Each entry is verified and chosen independently; one bad entry never blocks others (FIM-01 FI-06/07). |
| Mid-session changes | New registry content affects only the **next** load of a not-yet-loaded remote; already mounted remotes are never swapped under the user, except `critical`/kill-switch which triggers the update flow (PWA-01 §5). |
| Integrity of assets | Layered SRI/SW verification; unresolved gaps [OPEN-FE-03]. |
| Offline | Registry from LKG; assets from SW cache; remote versions not cached are unavailable offline → "This area isn't available offline" screen (not blank). |

## 6. Route ownership
| Rule | Detail |
|---|---|
| Single owner | Each top-level prefix has exactly one owner (table §4 = ID_REGISTRY). Registry validator rejects overlap and prefixes not allocated to that `moduleId` (checked by CI and by the shell). |
| Shell-owned | `/`, `/login`, `/signup`, `/login/callback`, `/offline`, `/r/*` (public tokenised), 404 [OPEN-FE-06]. |
| Remote routes | `RemoteModule.routes` returns route objects relative to the prefix; the shell mounts them lazily under `/<prefix>/*` inside the layout, with per-remote `ErrorBoundary` + `Suspense`. |
| Guards | Shell guard: session status + capability hint (`GET /me/capabilities`) hide/deny UI early; **the API is the authority** (INV-T01). A direct hit on a route without capability renders "no access" without loading the remote bundle. |
| Links across remotes | Only via `@ts/host-sdk/routes` typed builders (e.g., `routes.applications.detail({id})`); a breaking path change requires a shell redirect entry in the same Host Contract release (VCD-01). |
| Nav | Shell nav model (FD-07); remote adds in-area secondary nav. |
| Deep link | Hard-load of `/jobs/123` boots shell → resolves registry → loads MOD-OPP → renders (skeleton during). Route data loaders fetch through `host.api`. |
| Not found | Unknown prefix ⇒ shell 404; known prefix but remote unavailable ⇒ remote-unavailable screen with retry and link home. |

## 7. Shared singleton policy
| Package | Policy | Version range | Notes |
|---|---|---|---|
| `react`, `react-dom` | singleton, `strictVersion`, `import:false` | `^19.0.0` | Duplicate React ⇒ hooks break; fail load rather than run (FIM-01 FI-05). Reference uses React 19 [REF]. |
| `react-router` | singleton, strict | `^7.0.0` [TARGET; reference uses react-router-dom — OPEN-FE-19 confirm version] | Router is created by the shell; remotes use hooks/components only |
| `@tanstack/react-query` | singleton, strict | `^5.0.0` | One QueryClient; remotes use via `@ts/host-sdk/data` re-exports |
| `@ts/ui` | singleton, non-strict within major | `^1.0.0` | Design system (07_*); tokens; non-strict allows minor skew; any breaking = major |
| `@ts/host-sdk` | singleton, strict | `^1.0.0` | The contract. Remote declares the range it was built for. |
| `@opentelemetry/api` | singleton (global API by design) | `^1.9` [OPEN: confirm] | Context propagation across remotes; SDK lives in the shell |
| Everything else | **not shared** — bundled per remote | — | Includes date libs, zod, icons, markdown, charts. Adding to the shared list requires a contract-change review (MFA change control) because it creates a coupling and a failure mode. |
CI check (FF-04): manifest validator verifies (a) the six singletons present with `singleton:true`, (b) ranges overlap with the shell's provided versions, (c) no extra undeclared shared packages, (d) dependency graph acyclic (no remote → remote edges). Version ranges are evaluated at publish (FF-08) **and** at runtime (shell, VCD-01 §4).

## 8. State ownership
| State | Owner | Access for remotes | Persisted |
|---|---|---|---|
| Session view (status, account alias, roles, active org) | Shell | `host.session` read-only + `session.changed@1` event | `ts-meta` snapshot (non-secret) |
| Capabilities / entitlement hints | Shell (from `/me/capabilities`) | `host.capabilities.has(key)` | Query cache (7 d) |
| Feature flags | Shell | `host.flags.get(key)` | Snapshot in `ts-meta` |
| Server data (queries) | Shell's QueryClient; **key namespaces owned by remotes** (`[moduleId, …]`) | `useQuery` via host-sdk; reading another module's key is lint-forbidden | Allowlisted classes only (OFF-01 §7) |
| Outbox / drafts / conflicts | Shell | `host.sync.*` | IDB per account |
| URL (route, search params, filters, selected ids) | Router (shell) | `useSearchParams`, route builders | Browser history |
| Form state, UI state, local component state | The remote | n/a | Memory; drafts through `host.sync` only if a queued class |
| Theme, locale, density | Shell | `host.theme`, `host.i18n` | `ts-meta.prefs` |
| Connectivity, install/update state | Shell | `host.lifecycle` | Memory |
| Cross-remote shared mutable state | **None allowed** | — | — |
Remote-local stores (e.g., Zustand) are allowed but private; they are not read by other modules and are reset on logout via `host.lifecycle.onSessionEnd`.

## 9. Cross-remote communication: typed events + URL only (FD-06)
- **UI event bus** (`host.events`): `emit<T extends TopicKey>(topic, payload: Payload[T])`, `on(topic, handler)`. Topics are `domain.noun-verb@major` (e.g., `profile.updated@1`), declared in the emitting remote's manifest (`events.publishes`) and in `@ts/host-sdk/events` types. These are **UI notifications**, not backend domain events (EVT-*, outbox) and never authoritative (INV-T13).
- Rules: payload JSON-serialisable, ≤ 2 KB, no tokens/PII beyond ids; fire-and-forget (no request/response, no return values); handlers isolated (a throwing handler is caught and reported, FI-24); delivery only to currently loaded subscribers; no replay except `session.changed@1` (sticky current value). Schema major bump = new topic name; both emitted during deprecation window.
- **URL**: navigation and shared context across remotes pass through route builders and search params (e.g., `applications.detail({id})`); no hidden channels (globals on `window`, shared singleton stores, `localStorage` mailboxes).
- Forbidden: importing another remote's code (FF-03), `window.__ts_*` globals, `postMessage` between remotes, reading another module's query cache keys, custom DOM events as API.
- Consistency pattern: after a mutation that affects another module, the emitter emits an event; subscribers **invalidate and refetch** — they never trust the payload as data.
- Catalogue of initial topics is in HC-01 §6 and each remote card.

## 10. Dependency rules (full table in DEP-01)
Allowed: shell → remotes (dynamic, via registry only); remotes → `@ts/host-sdk`, `@ts/ui`, shared singletons, own generated API client, own code. Forbidden: remote → remote (any import, FF-03), remote → shell internals (only the published SDK), packages → remotes, circular package graph, remote → `packages/domain` business-rule functions (UI never restates rules), any module reading `document.cookie`/tokens (INV-T16; CSP + lint; not isolation). Enforced by dependency-cruiser + MF config check (FF-03/FF-04) in CI.

## 11. Bundled vs federated (`MF_MODE`, FD-09)
| Aspect | `federated` (production default) | `bundled` |
|---|---|---|
| Remote resolution | Registry → `loadRemote()` over network | Static dynamic `import('@ts/mod-candidate')` of the workspace package |
| Build output | Shell + N remote artefact sets | Single shell build containing all modules as lazy chunks |
| Deploy | Independent per remote | One deploy; one version |
| Compat checks | Runtime registry gate + CI gate | CI gate only (all built together) |
| Contract | Identical `RemoteModule` interface and `HostApi` | Identical |
| Rollback | Registry flip/LKG per remote | Whole-app rollback |
| Use when | ≥ 3 independent frontend teams, need independent cadence | < 3 teams (OPEN-03), local dev, e2e of the whole product, emergency "federation off" |
| Failure modes removed in bundled | Registry, manifest, signature, shared-dep, partial-deploy, remote 404 | — (but a bad module deploy now rolls back everyone) |
Mechanism: each remote package exports `module.ts` (default `RemoteModule`). The federated build exposes `./module`; the bundled build imports it through a generated `modules.bundled.ts`. The shell resolves via a `ModuleLoader` port with two adapters (`FederatedLoader`, `BundledLoader`). CI builds **both** on every release (bundled build is the always-green fallback and the e2e target).

## 12. Independent build and deploy
```mermaid
flowchart LR
  A[PR in remote package] --> B[affected-only CI ADR-T17: lint, types, unit]
  B --> C[contract tests vs MockHost for each supported Host Contract minor]
  C --> D[build federated + bundled]
  D --> E[static gates: FF-03 imports, FF-04 shared singletons, size budgets, SRI list generated]
  E --> F[FF-08 compat gate vs current shell + registry + API OpenAPI range]
  F --> G[publish immutable assets /mf/name/version/]
  G --> H[contract-smoke in headless host against staging registry]
  H --> I[sign entry with KMS key, sequence+1, rollbackTo = current stable]
  I --> J[canary registry channel ?ch=canary]
  J --> K{SLO guard: error rate, JS errors, INP, remote load p75}
  K -- ok --> L[promote: write stable entry]
  K -- breach --> M[auto-rollback: publish rollbackTo target]
```
| Point | Rule |
|---|---|
| Artefacts | Immutable, content-hashed, never overwritten. Retention: current + previous 5 versions + any LKG-eligible within 30 d (clients on stale shells may still request them). |
| Signing | Release job identity only; private key in KMS; two-person approval for key creation/rotation [OPEN-FE-16]. |
| Canary | Shell flag selects `?ch=canary` for a cohort; canary entry has the same schema (`channel:"canary"`). Cohort size and soak time are [TARGET] defaults 5% / 30 min, justified by the need for enough sessions to see an error-rate change — **confirm with baseline traffic**. |
| No cross-remote lockstep | Remotes release independently unless Host Contract has a major change (VCD-01 §6). |
| Shell release | Separate pipeline; must pass a compatibility run against every currently published remote entry (inverse of FF-08). |

## 13. Rollback (summary; sequencing in VCD-01 §6)
| Level | Mechanism | Time to effect |
|---|---|---|
| Client self-heal | Remote fails to load/initialise ⇒ shell tries `rollbackTo` entry, else LKG, marks bad build for 24 h, reports `mf.remote.fallback` | next load of that remote (seconds) |
| Operator rollback | Publish previous artefacts as a new entry with higher `sequence` (keeps anti-rollback intact) | registry TTL (≤ 300 s) + next load |
| Kill switch | `status:"disabled"` for one remote, or `killSwitch.modules` / `global` | registry TTL |
| Federation off | Deploy bundled build | one deploy |
| Shell rollback | Previous shell + SW; SW kill-switch if SW is the fault | SW update cycle (PWA-01 §5) |

## 14. Security posture (ADR-T19) — what this design does and does not claim
Does: signed registry entries and SRI/SW verification reduce *supply-chain tampering at the registry/CDN layer*; CSP + Trusted Types + no tokens in JS reduce XSS impact; capability checks are server-enforced. Does **not** claim: that remotes are isolated from each other — they share one JS realm, DOM, storage, cookies' send-context and CSP; compromised or buggy remote code can call any same-origin API as the user, read IDB, patch prototypes or `window`. Lint rules "remotes never read tokens/other internals" (INV-T16) are *hygiene guarded by CI*, not a sandbox. Untrusted third-party content, if ever required, goes in sandboxed iframes with a postMessage contract (ADR-T19 trigger). Full list in FIM-01 §3.

## 15. Change control
Adding a shared singleton, changing `HostApi`, removing a topic, changing a route prefix, or changing manifest schema = **contract change**: version bump per VCD-01, compat window, notice to all remote owners, and a contract test added to `@ts/host-sdk/testkit`.

## 16. Spike WP-FED-SPIKE (exit criteria before committing, OPEN-11)
| # | Question | Pass condition |
|---|---|---|
| 1 | Vite plugin version and MF manifest runtime with `registerRemotes` + `loadRemote` work with React 19 + react-router 7 + singletons `import:false` | Host loads two remotes; one React instance (verified by identity check) |
| 2 | Runtime plugin `errorLoadRemote` / `loadEntryError` yields fallback and retry as designed | Forced 404 and thrown init errors reach the error boundary; fallback entry loads |
| 3 | Integrity: can `createScript`/import-map/modulepreload enforce SRI on federated ESM? | Documented behaviour per browser; else SW verification plugin proven (OPEN-FE-03) |
| 4 | `vite-plugin-pwa` (injectManifest) coexists with MF build | SW precache excludes `/mf/**`; builds reproducible (OPEN-FE-07) |
| 5 | Dev experience: remote runs standalone against `MockHost` | Hot reload, tests without shell |
| 6 | Same-origin path hosting with versioned URLs and `publicPath` correctness | No absolute-URL leaks; works from SW cache offline |
| 7 | Build both `federated` and `bundled` from the same sources | Both pass e2e smoke |
If #1 or #2 fail at acceptable effort ⇒ ship `bundled` mode (FD-09) and revisit; no other doc changes.

## 17. Open items
OPEN-03/OPEN-11 (global) · OPEN-FE-03 SRI · OPEN-FE-06 public/tokenised prefixes · OPEN-FE-07 · OPEN-FE-16 signing custody · OPEN-FE-17 SEO/public-page rendering strategy (client SPA is weak for crawlers; edge prerender vs SSR) · OPEN-FE-18 persona coverage gaps · OPEN-FE-19 router version.
