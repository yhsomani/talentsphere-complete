# Frontend Architecture - Revision 2 (review fixes)

Doc ID: FEA-01-REV2 · Owner: Frontend/Platform Architecture · Version 2.0 · Status: Under Review
Relates: ADR-T02, ADR-T03 (amended by ADR-T23, proposed), ADR-T10a (proposed), ADR-T24 (proposed here) · REVW-07, REVW-13, REVW-14, REVW-23 · REV-RES · FEA-01, MFA-01, MFA-01-REV2 (`09_MODULE_FEDERATION/FEDERATION_REVIEW_FIXES.md`), OFF-01-REV2, OPS-SLO

Tags: [CONF] [TARGET] [OPEN] [FED] (federated option only). This file is **additive**: `FRONTEND_ARCHITECTURE.md` (FEA-01) is unchanged. Where this revision differs, it governs; section 9 lists what it supersedes. Supersession is a relationship, not a deletion. Scores are architect judgement against stated criteria, not measurements. Budgets are hypotheses with a formula and a measurement method.

## 1. Delivery mode (REVW-07)
FEA-01 sections 2, 3, 15 and 16 describe React 19 + Vite "federated by `@module-federation/vite`". Read them as follows: **the default is `MF_MODE=bundled`** (one shell build, every module a lazy route-chunk group behind the same typed module contract, per-route error boundaries); the federated runtime is an activation option gated by MFA-01 section 11.1. Consequences for this document:

| FEA-01 place | Read as |
|---|---|
| Section 2 decision FD-F1 "federated by ..." | React 19 + TypeScript SPA/PWA built with Vite; modules are bundled lazy chunk groups; federation is [FED] |
| Section 3 rows "Shell/Remote federation config", "Output path /mf/...", "MF_MODE" | [FED]. In bundled mode: `build.rollupOptions` route chunking, module packages under `apps/mf-*` are workspace packages imported by `modules.bundled.ts`; output under `/assets/`, back-office chunks under `/assets/bo/` (gated, FD-14) |
| Section 11 telemetry spans `mf.registry.*`, `mf.remote.*` | [FED]. Bundled mode emits `module.load` (chunk load) with `source=bundled` |
| Section 14 B7, B8, B9, B16 | [FED] rows (see section 4) |
| Section 15 layout | Add `apps/mf-institution/` (MOD-INS). `apps/mf-admin/` is MOD-ADM back-office only |
| Section 16 stage 5 and 7 | Stage 5 builds **bundled on every release**; the federated build is a scheduled non-release job (weekly). Stage 7 runs the full e2e on the bundled build; the federated smoke runs with the scheduled job. Stage 9 (publish, sign, canary registry) runs only after activation |
| Section 4 router `patchRoutesOnNavigation`, section 3 plugin option names | See section 6 (unverified) |

Remote count is **eight** (MOD-ADM back-office, MOD-INS institution). The instructor studio is a lazy chunk group outside MOD-LRN's initial JS (MFA-01 section 4).

## 2. SEO and public pages (REVW-13)
### 2.1 Re-scoring FEA-01 section 2
FEA-01 section 2 weights federation fit at 5 for option A while rivals are scored 2 or 3 as "not evaluated here", and weights SEO at 2 although public job pages are an acquisition surface (SPEC-G4 FEAT-09-05.1, P0 Phase 1). Recomputed from FEA-01's own per-criterion scores (script, totals checked):

Criteria and scores (A React+Vite SPA, B Next.js, C React Router 7 framework mode, D SolidJS, E Vue+Nuxt, F Angular), in the order Federation, Continuity, SW/PWA control, Migration, Runtime perf, SEO, a11y: A 5,5,5,5,3,2,5 · B 2,4,3,2,4,5,5 · C 2,5,3,4,4,4,5 · D 3,1,4,1,5,3,2 · E 3,2,4,1,4,4,3 · F 3,2,4,1,3,4,4.

| Scenario (weights Fed/Cont/SW/Mig/Perf/SEO/a11y) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| S0 original (5/4/4/3/3/2/2) | 103 | 76 | 84 | 63 | 68 | 67 |
| S1 bundled default: federation weight 0 (0/4/4/3/3/2/2) | 78 | 66 | 74 | 48 | 53 | 52 |
| S2 S1 with SEO weight 5 (0/4/4/3/3/5/2), A SEO as scored (2) | 84 | 81 | **86** | 57 | 65 | 64 |
| S3 S2 with ADR-T24 adopted: A SEO = 4 (edge prerender covers the public surface) | **94** | 81 | 86 | 57 | 65 | 64 |
| S4 original weights, A SEO = 4 | 107 | 76 | 84 | 63 | 68 | 67 |

Reading: (1) with federation removed from the default and SEO weighted by acquisition value, **A leads only if ADR-T24 is adopted**; without it C leads (S2). (2) The SPA choice therefore depends on ADR-T24 and not on federation. (3) "A SEO = 4" is judgement conditional on the design in 2.2 and must be re-scored after the prerender spike; the federation-fit scores of B, C, D, E, F remain "not evaluated" and are excluded (weight 0) in S1 to S3. (4) Re-run again when OPEN-03 closes. Decision FD-F1 stands (React 19 + Vite SPA/PWA) conditional on ADR-T24; if ADR-T24 is rejected, re-open the choice between A and C.

### 2.2 ADR-T24 (proposed): public pages prerendered at the edge, app routes stay SPA
| Aspect | Design [TARGET] |
|---|---|
| Scope | Public job page (`/jobs/:jobId` public view), landing, help, and public profile (`/p/:handle`, only when the owner made it public) once public profiles ship. App routes (`/me`, `/hiring`, `/admin`, `/institution`, `/learn`, `/applications`, `/messages`, `/settings`, `/billing`, `/privacy`) are SPA, `noindex`, disallowed in `robots.txt` |
| Rendering | A **public-page renderer** produces a complete HTML document (title, meta description, canonical, Open Graph, `JobPosting` or `ProfilePage` JSON-LD, semantic body, and the SPA bootstrap script) from the server-asserted public API representation (the same credential-free data as `X-TS-Cache-Class: public`, PWA-01 R5). Renderer technology (server-side template module in the API versus headless render in a worker) is decided by a short spike [OPEN]; the SPA replaces the body on load rather than hydrating, so no React server rendering dependency is introduced |
| Freshness | Snapshots are generated by a worker job class on outbox events (`job.published`, `job.updated`, `job.closed`, `job.taken_down`, profile visibility change, erasure) and stored in object storage; the edge serves them at the canonical URL with short `Cache-Control` and a purge on each event. If a snapshot is missing the edge falls back to the SPA shell (never a 5xx) |
| Same content for all | Crawlers and users receive the same HTML (no cloaking) |
| Sitemap | Worker-generated `sitemap.xml` index plus child sitemaps (sitemap protocol limit 50,000 URLs per file), only open public jobs and public profiles, `lastmod` from the entity; `robots.txt` references it. Closed or taken-down jobs leave the sitemap and the page shows a closed notice (status code policy [UNVERIFIED against current search-engine guidance, check before build]) |
| Structured data | `JobPosting` fields follow the current search-engine documentation [UNVERIFIED here: fields such as `validThrough` and employer identity requirements must be checked against current docs and against the REVW-22 employer verification badge before launch]; no claim of ranking benefit is made |
| Privacy | A profile snapshot contains only fields the owner set public; hiding a profile or erasure (BR-T060) purges the snapshot and sitemap entry within a purge SLA [OPEN: owner Privacy lead]. Copies already held by search engines are outside our control and the privacy notice says so |
| Phase | Job pages: Phase 1 (SPEC-G4 FEAT-09-05.1). Profile pages: with public profiles |
| Alternatives rejected for Phase 1 | Whole-product SSR (Next.js B or React Router 7 framework mode C): couples the framework choice to the unproven federation decision, high migration cost from the reference stack, and the service-worker/offline model gets harder. Revisit trigger: the public surface grows beyond a handful of templates, or prerender maintenance cost exceeds the SSR migration cost [OPEN threshold] |
| Verification | No-JS fetch test per template (title, canonical, JSON-LD, links present); structured-data validation (manual, rich-results tool); `public.snapshot_age_s` metric and alert; purge test (hide profile, snapshot gone); Lighthouse SEO audit; crawl of sitemap URLs returns 200 |
| Owners | Frontend Architect (templates), Backend (worker job class, renderer API), Platform/edge (routing and purge), Product growth (SEO weight, keyword scope) |
| Hosting detail | See `17_DEVOPS_AND_INFRASTRUCTURE/FRONTEND_DELIVERY_REVIEW_FIXES.md` |

OPEN-FE-17 is answered by this proposal and should be moved to the global register (REVW-33).

## 3. Idempotency in the transport row (REVW-14 c)
FEA-01 section 7 Idempotency row ("Host injects `Idempotency-Key: auto` ... stable across automatic retries") is replaced by: **one mutation-scoped key per user intent** from `host.api.intentKey()` (HC-01), reused on every retry and reload of that intent and stored with the local draft; the host never creates a fresh key per call; an unsafe request with neither a key nor an operation that declares a natural key is rejected in development and reported in production. FF-07 wording: "accepts `Idempotency-Key` or declares a natural key". Queued routes: OFF-01-REV2 section 4.

## 4. Performance budgets re-derived (REVW-23)
### 4.1 Formula and constants (from OPS-SLO section 3, not new numbers)
Lab profile RMP-1: Lighthouse mobile emulation, 4x CPU slowdown, simulated Slow-4G about 1.6 Mbit/s, about 150 ms RTT. `t_transfer = bytes x 8 / throughput`. Critical-path budget `B = (T_target - T_ttfb - T_cpu) x throughput / 8` with `T_target` 2.5 s, `T_ttfb` 0.45 s (3 RTT), `T_cpu` 1.0 s: `B = 1.05 s x 1.6e6 / 8 = 210 KB` gzip for HTML+JS+CSS on the critical path. Illustration of a method, to be replaced by RMP-1 measurements (OPEN-15).

### 4.2 Lab versus field
LCP (B1) applies to **hard navigations (entry routes)**, measured in the field at p75 (target of record) and in the lab on RMP-1 as a regression guard, run twice: cold (first visit, empty cache) and warm (returning installed user). Soft navigations inside the SPA are governed by B11 and INP (B2), not LCP. Entry routes are the candidate home, job list and detail, application detail (email and push deep links), and public pages. Public pages are prerendered (section 2.2), so their LCP content does not wait for JS.

### 4.3 First-visit arithmetic
| Case | Transfer | Total (ttfb 0.45 + transfer + cpu 1.0) | Against LCP 2.5 s |
|---|---|---|---|
| Original budgets: shell B5 150 KB + route B10 120 KB = 270 KB | 1.35 s | 2.80 s | **0.30 s over** (the contradiction in REVW-23) |
| Corrected: shell 150 KB + entry-route initial JS 60 KB = 210 KB | 1.05 s | 2.50 s | at budget |
| Federated option adds SLO-17 overhead 250 ms to the corrected case | 1.05 s + 0.25 s | 2.75 s | 0.25 s over |

Corrected budgets (replace B10 and annotate B5, B9, B16):

| # | Budget [hypothesis unless noted] | Basis |
|---|---|---|
| B5 | Shell critical-path JS <= 150 KB gz (unchanged); it leaves **60 KB** of the 210 KB budget for an entry route | formula 4.1 |
| B10a | **Entry-route initial JS <= 60 KB gz** (candidate home, job list/detail, application detail). Route-level lazy chunks (editor, grid, charts) are not part of the entry cost and load on use | 210 - 150 |
| B10b | Non-entry route chunk group initial JS <= 120 KB gz (reached by soft navigation with the shell already cached; LCP does not apply; B11 applies); lazy heavy chunks <= 250 KB each | unchanged from the original B10 |
| B9 [FED] | Cold remote load, field 4G p75 <= 1.5 s, **decomposed** as extra federation overhead (<= SLO-17 250 ms: manifest + entry round trips) + chunk transfer (R x 8 / throughput; 60 KB at RMP-1 is 0.30 s) + parse and activate allowance. B9 is an absolute ceiling for the whole remote load; SLO-17 is the delta against bundled mode. They nest and no longer conflict. The 4G throughput for field is [OPEN] until RUM data exists |
| B16 [FED] | The 250 ms overhead cannot be added to the corrected first-visit case (2.75 s). Activation (MFA-01 section 11.1) therefore requires the spike to show the entry-route chunk and shell can shrink by about 50 KB (0.25 s) or that preloading hides the overhead; otherwise federation fails the LCP budget on cold deep links. This is an additional reason it is an option and not the default |
| B8 [FED] | Warm remote load <= 500 ms (unchanged). Bundled equivalent: warm chunk load <= 500 ms (same span `module.load`) |
| B13 | SW precache <= 1.5 MB, shell critical path and offline page only (module chunks are runtime-cached, PWA-01-REV2 section 2) |

OPS-SLO owner action: SLO-17 and SLO-03 apply only to the federated option (SLO-03's 216 min/month per remote is lower than the API allowance); SLO-13 states lab versus field per section 4.2. Not edited here (folder 15).

## 5. Session and security wording leftovers (REVW-05)
FEA-01 section 12 "Credentials" row: read as `__Host-ts_at` (`HttpOnly; Secure; SameSite=Lax; Path=/`) and `__Secure-ts_rt` (`SameSite=Strict`, `Path=/api/v1/auth/refresh`) per SEC-02 section 2.3; "via BFF" means the `/api/v1` auth routes, not a separate namespace. The CSRF row already says `X-CSRF-Token` and is correct. User-generated content on a separate registrable domain (REVW-32) is governed by SEC-02; FEA-01's "separate registrable origin" row stands.

## 6. Claims marked unverified (router, build tooling)
| Claim in FEA-01 / MFA-01 / DEP-01 | Status |
|---|---|
| `patchRoutesOnNavigation` lazy route discovery in react-router v7 data routers (FEA-01 section 4) | **Unverified**: name and stability not confirmed against the pinned version; fallback in FEA-01 section 4 applies; confirm in the spike or first routing task |
| `react-router` v7 package layout, `createBrowserRouter` data mode with the reference's `react-router-dom` | **Unverified** (OPEN-FE-19) |
| `@module-federation/vite` options `manifest: true`, `registerRemotes`, `loadRemote`, `errorLoadRemote`, `loadEntryError`, `createScript` | **Unverified** until WP-FED-SPIKE [FED] |
| dependency-cruiser rule syntax with `$1` back-references in DEP-01 section 4 (`pathNot: '^apps/$1/'`) | **Unverified syntax**; the intent (no remote-to-remote imports) is the requirement, not the exact rule text |
| `openapi-react-query` maturity; `vite-plugin-pwa` injectManifest coexistence | Already marked "if mature" / spike items; stay unverified |
| Trusted Types availability and CSP directives list | Sourced to RES-02 F13; not re-verified here |

## 7. Repository layout addition
`apps/mf-institution/` (MOD-INS) beside `apps/mf-admin/` (MOD-ADM). Module packages are workspace packages in bundled mode. Back-office build output is emitted under a distinct path prefix (`/assets/bo/`) through the build's chunk naming so the edge rule (FD-14) and the SW exclusion (PWA-01-REV2 section 2 rule R2b) can match it; the build config is a build file and is not changed by this documentation.

## 8. Remaining open items
OPEN-FE-17 (answered by ADR-T24 once ratified), OPEN-FE-19, OPEN-FE-32 (budget re-base after the spike baseline), OPEN-15 (RMP-1 calibration). New: renderer technology spike for ADR-T24; purge SLA; status-code policy for closed jobs.

## 9. Supersession map (relationship only)
| This revision | Supersedes (in FEA-01) |
|---|---|
| section 1 | sections 2 (decision wording), 3 (federation rows), 15, 16 (stage 5, 7, 9 timing) |
| section 2 | section 2 totals sentence "103 ... most sensitive to federation-fit weight", and the SEO row note; OPEN-FE-17 |
| section 3 | section 7 Idempotency row |
| section 4 | section 14 rows B5 (annotation), B9, B10, B16; method paragraph unchanged |
| section 5 | section 12 Credentials row wording |
| section 6 | section 4 Remote routes row, section 3 build row, DEP-01 section 4 example rule |
