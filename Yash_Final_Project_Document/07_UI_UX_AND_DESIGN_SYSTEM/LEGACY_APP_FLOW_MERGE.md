# Legacy Application Flow (routes, navigation model, request flow, recovery) merged

Doc ID: UI-LEG-01 · Owner: Frontend Architect (with UX Lead) · Version 1.0 · Status: Draft for Review · Relates: `NAVIGATION_ARCHITECTURE.md`, `SCREEN_REGISTRY.md`, `ACTION_REGISTRY.md` (section 0 global failure classes), `PROGRESSIVE_UX_AND_FEEDBACK.md`, `../02_STAKEHOLDERS_AND_USERS/LEGACY_JOURNEY_REGISTRY_J01_J28.md`, `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## Merged from legacy: `31_LEGACY_ARCHIVE/docs/experience/APP_FLOW.md` (v6.0)

## 0. Frame

**Nothing is implemented.** The prior attempt's APP_FLOW had two parts: a table of routes it *reported* as mounted in a prior web shell, and a set of numbered flow sections it described as "intended journey model, not acceptance claims". Here, both are **requirement candidates**. The target route model is `NAVIGATION_ARCHITECTURE.md` (route trees per remote, role workspaces); where the legacy route names differ they are listed so that no name is lost, and the difference is for owner review (OPEN-LGA-14). Nothing below states that a route exists.

## 1. Prior attempt's reported browser routes (reference only)

The prior attempt wrapped authenticated workspaces in a guard that checked **token presence only**, loaded the current user/profile/memberships from the API in a session provider, and left every protected decision to the server. A missing token redirected to `/login?return=...`; the login helper validated that the return path was local.

| Prior routes | UI access / purpose reported |
|---|---|
| `/`, `/login`, `/signup` | Public landing and credentials |
| `/jobs`, `/jobs/:id` | Public browsing; application needs authentication |
| `/reference/:id` | Public shell; emailed token authorises referee access/submission |
| `/verify/:hash` | Public proof verification |
| `/checkout`, `/privacy`, `/terms` | Public shells; purchase/account calls need a session; legal text was draft |
| `/dashboard`, `/profile`, `/settings` | Guarded account workspaces |
| `/applications`, `/evidence`, `/assessments` | Guarded application/evidence/challenge workflows |
| `/portfolio`, `/resumes`, `/network` | Guarded, with ephemeral feature state |
| `/learning`, `/learning/:id`, `/career` | Guarded course and career views; durable journey incomplete |
| `/notifications`, `/messages`, `/messages/:id` | Guarded messaging and notifications |
| `/hiring`, `/hiring/jobs/:id`, `/admin` | Guarded shells; API role/ownership checks remain essential |
| `*` | NotFoundPage |

Lessons stated by the prior attempt, kept as target requirements:

1. A client-side guard that checks only for a token is a **usability aid**, never an authorisation control; the server decides every protected action (matches ADR / INV deny-by-default).
2. The return-intent parameter must be validated as a **local path** (open-redirect protection). Target: `NAVIGATION_ARCHITECTURE.md` section 7 (redirect and guard rules) should state this explicitly (OPEN-LGA-14).
3. Public shells that depend on an emailed token (`/reference/:id`) and public proof verification (`/verify/:hash`) exist as distinct public surfaces (target equivalents: referee flow UJ-17; public credential verification, legacy rule BR-150 "every credential has a public verification URL, no PII exposed").
4. Backend endpoints with similar names do not make browser pages exist. (Prior conflict C-18: about 30 documented routes were not mounted.)

## 2. Planned routes named by the prior attempt (not mounted there either)

| Group | Prior route names |
|---|---|
| Public | `/`, `/login`, `/register`, `/verify/:hash` |
| Authenticated core | `/dashboard`, `/profile`, `/jobs`, `/applications`, `/courses`, `/challenges`, `/messages`, `/notifications`, `/settings` |
| Career intelligence | `/career/readiness`, `/career/transition`, `/career/benchmarks`, `/salaries` |
| Recruiter | `/recruiter/search`, `/recruiter/pools`, `/recruiter/analytics`, `/hm/dashboard` |
| Learning | `/paths`, `/teach/*`, `/cart`, `/checkout`, `/orders` |
| Social | `/feed`, `/posts/:id`, `/articles/:id`, `/communities`, `/events` |
| Institutional | `/institution/*` |

Differences to resolve against the target route trees: `/register` vs `/signup`; `/courses` vs `/learning`; `/challenges` vs `/assessments`; `/recruiter/*` and `/hm/dashboard` vs `/hiring`; `/institution/*`. Social routes (`/feed`, `/communities`, `/events`) correspond to legacy features F-53..F-57 (legacy Ph8) which the target treats as late-phase or optional. All names are kept here as aliases until the owner decides the canonical route vocabulary (OPEN-LGA-14).

## 3. Universal request flow (legacy; carried over)

```text
User action
-> UI validation
-> API request
-> AuthN
-> AuthZ + purpose policy
-> domain validation
-> transaction
-> event/audit
-> response
-> query/cache update
-> user feedback
```

Target comparison: matches the layered request path (policy, domain, transaction, outbox event, audit). The legacy step "AuthZ + purpose policy" (purpose-bound authorisation) is the more explicit statement of INV-T15 and should be kept in the backend request-lifecycle diagram.

## 4. Role flows (legacy; carried over)

### Candidate core flow

```text
Landing -> Sign up / Sign in -> Onboarding -> Career goal -> Skill profile
-> Gap analysis -> Learning -> Practice -> Evidence -> Career profile
-> Job discovery -> Match explanation -> Application -> Interview
-> Outcome -> Feedback -> Next action
```

### Recruiter flow

```text
Organization setup -> Job creation -> Publish readiness -> Candidate discovery
-> Evidence-aware review -> Shortlist -> Communication -> Interview
-> Scorecard -> Decision -> Outcome record
```

### Institution flow

```text
Create tenant -> Configure programs -> Manage seats/users -> Assign learning
-> Track progress -> Assess -> Credential -> Employer transition
-> Graduation / independence
```

Target comparison: UJ-01..UJ-09 (candidate), UJ-11..UJ-13 (recruiter, hiring manager), UJ-16 (institution). The legacy candidate flow has **Career goal** and **Gap analysis** as onboarding steps and **Feedback / Next action** at the end; the target UJ-02 onboarding does not name goal-setting (OPEN-LGA-09). The legacy institution flow ends with **Graduation / independence** (legacy rule BR-076: retain verified signals, sever FERPA-restricted records).

## 5. Recovery, state preservation and error screens (legacy; carried over)

Recovery pattern:

```text
Failure -> Explain what failed -> Preserve user work -> Retry safely
-> Offer alternate path -> Confirm final state
```

State preservation: refresh, back/forward and mobile interruption must not cause silent data loss.

| Status | Required behaviour |
|---|---|
| 401 | Session expired: reauthenticate **without losing return intent**. |
| 403 | Explain access scope; do not leak existence-sensitive information. |
| 404 | Safe not-found experience. |
| 409 | Concurrency/idempotency conflict: show current state and recovery. |
| 429 | Rate limit: show retry timing. |
| 5xx | Generic user message plus request ID plus retry. |
| Maintenance | Explain scope and retry path. |

Target comparison: global failure classes already live in `ACTION_REGISTRY.md` section 0 and `PROGRESSIVE_UX_AND_FEEDBACK.md`; the target uses 412 for ETag conflicts (ADR-T08) in addition to 409 for idempotency. Keep both; the legacy statement "request ID on 5xx" should be checked against the error-envelope specification (OPEN-LGA-14).

## 6. Assessment flow (legacy; carried over)

```text
Start assessment -> bind session/policy -> load protected content -> answer
-> autosave -> warning checkpoints -> submit -> server validation -> score -> result
```

Rule: no AI candidate assistance during `AI_PROHIBITED`. Target: ADR-T13 and SPEC-05 (assessment attempt).

## 7. Evidence flow (legacy; carried over)

```text
Evidence created -> provenance recorded -> validation
-> verification (when required) -> status -> capability update
-> matching/recommendation recalculation -> audit
```

Target comparison: SM-EVIDENCE and SPEC-03. The legacy step "capability update then matching/recommendation recalculation" makes the **downstream recompute** explicit; confirm it is an event-driven, asynchronous step in the target design, not part of the evidence write transaction.

## 8. Pointer to the behavioural corpus

The prior APP_FLOW pointed the 28 journeys to its journey registry, and the 66 workflows, integrity traces and state machines to a retired workflows document (content later consolidated into a prior consolidated-documentation set). In this project: journeys are in `../02_STAKEHOLDERS_AND_USERS/LEGACY_JOURNEY_REGISTRY_J01_J28.md`; state machines in `../06_BUSINESS_PROCESSES/STATE_MACHINES.md`. The "66 workflows" register itself is **not** in this merge's source group; the prior file was retired on 2026-10-26 and its disposition is described in `../30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` Appendix A/B (OPEN-LGA-15: confirm it is covered by `SSOT_WORKFLOW_CROSSWALK` / `BUSINESS_PROCESS_INVENTORY`).

## 9. Open items

| ID | Item |
|---|---|
| OPEN-LGA-14 | Canonical route vocabulary and guard/redirect/error-ID rules (aliases in sections 1, 2 and 5). |
| OPEN-LGA-15 | Confirm the 66-workflow register is represented in `06_BUSINESS_PROCESSES`. |
