# Feature Specifications — Group 4: Jobs, Search & Match, Applications, Pipeline

Doc ID: SPEC-G4 · Owner: Product Director + Hiring/Matching leads · Version 1.0 · Status: Under Review · Relates: DOM-09, DOM-10, DOM-11, FEAT-09-01…09-03, FEAT-09-05, FEAT-09-08, FEAT-10-01…10-08, FEAT-10-14, FEAT-11-01…11-03, FEAT-11-07, FEAT-11-08, FEAT-23-03, FEAT-24-12, SM-JOB, SM-APPLICATION, SM-INTERVIEW, DT-03, DT-05, DT-12, BR-T001, BR-T002, BR-T035…T040, BR-T070…T077, INV-T09, INV-T19, INV-T21, INV-T28, INV-T30, INV-T39, INV-T44, INV-T45

Conventions: see `README.md`. Endpoints provisional under `/api/v1`. All **[TARGET]**; `{…}` **[OPEN]**; numeric scoring constants are illustrative defaults to be calibrated against GOAL-03 audits.

---

# SPEC-07 Job Posting & Publishing

**Metadata:** Doc ID SPEC-07 · Owner: Opportunities PM · Version 1.0 · Status Under Review · Phase 1 (minimal) / Phase 2 (teams, approvals, templates) · Priority P0 · Features: FEAT-09-01, FEAT-09-02, FEAT-09-03, FEAT-09-05, FEAT-09-08, FEAT-02-03 · Modules: MOD-HIR, MOD-OPP, MOD-SHELL · `api/jobs`, `api/orgs`, `api/billing`, `api/safety`, `apps/worker` · Relates: SM-JOB, DT-12, BR-T035…T037, BR-T093, INV-T30, INV-T44, ADR-T22

## 1. Business purpose
Employers create postings whose structure (canonical skills, disclosed pay, clear location) drives match quality and candidate trust, and publish them under entitlement and safety checks. Value: supply side of the marketplace (GOAL-02), source data for explainable matching (GOAL-03).

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-REC | create/edit/publish/pause/close jobs of own org | `job:write:org` |
| ROLE-HM | edit assigned jobs; request publish; approve if designated | `job:write:assigned`, `job:approve` |
| ROLE-ORGADM | all of the above + assign teams + view billing gates | `job:admin:org` |
| ROLE-MOD | review flagged jobs; take down | `job:review`, `job:takedown` |
| ROLE-ANON / ROLE-CAND | read published jobs | `job:read:public` |
| ROLE-SUP/ADM | read under grant | `job:read:granted` |
Org membership is checked per record (INV-T02/T03): a recruiter of Org A cannot read or write a draft of Org B.

## 3. Functional behavior
### 3.1 Inputs and validation
| Field | Rule |
|---|---|
| title | 5–100 chars |
| description | 200–10,000 chars; sanitised rich text subset; no scripts |
| employmentType | `full_time`, `part_time`, `contract`, `internship`, `temporary` |
| workMode | `onsite`, `hybrid`, `remote` |
| locations | 1–5 `{country (ISO), region?, city?}`; remote may carry allowed countries |
| requiredSkills | 1–15 canonical skills; optional `minLevel` |
| preferredSkills | 0–15 canonical, no overlap with required |
| experienceLevel | `entry`, `mid`, `senior`, `lead` |
| pay | `{currency (ISO 4217), min, max, period ∈ {hour, month, year}, disclosed}`; `0 ≤ min ≤ max`; max ≤ {20}× min (sanity); if `disclosed=false` allowed unless org policy or jurisdiction rule requires disclosure **[OPEN-08]** |
| applicationQuestions | 0–10: `text` (≤ 500), `yes_no`, `single_select` (≤ 10 options); no questions on protected attributes (lint) |
| closesOn | optional, ≤ 90 d from publish |
| hiringTeam | 1–10 org members (default: author) |
| `Idempotency-Key` | required on create and publish |

### 3.2 Rules
1. **Draft** is private to the hiring team. Autosave with `ETag` (`If-Match`); conflicting edits ⇒ `412` + diff.
2. **Publish gate = DT-12** evaluated inside one transaction: permission → org verification state (unverified org ⇒ at most one live job) → validation (BR-T035) → **slot reservation** (row lock on the org's entitlement counter, derived per DT-02/BR-T093) → policy checks (§3.3) → target state. Failure returns the first failing row's code.
3. **Publishing effects:** state `published` (or `scheduled`/`pending_review`), `job.published` event, search indexing ≤ 60 s p95 (FEAT-24-12), alert fan-out job for saved searches (FEAT-09-06), employer page update.
4. **Post-publish edits:** *safe fields* (typos in description, `closesOn`, hiring team, questions not yet answered) editable freely; *material fields* (title, skills, pay, locations, workMode) editable but recorded as a revision; if applications exist, candidates see "Updated <date>"; existing applications are not altered.
5. **Lifecycle (FEAT-09-03):** `pause` (hidden from search, existing apps continue), `resume`, `close` with reason (`filled`, `cancelled`) or auto `expired` at 45 d (BR-T036; reminder 7 d before expiry; extend by publisher up to 90 d). Closed jobs cannot reopen — **clone** to a new draft (`cloned_from`); open applicants are notified within 24 h if closed unfilled (BR-T037).
6. **Templates (09-01.3):** copy-on-create; changing a template never alters existing jobs.
7. **AI-assisted draft (09-01.4, FEAT-17-05):** only through the AI gateway, only a draft that the recruiter edits and confirms (INV-T09 spirit); orgs without AI entitlement get deterministic template fill, no paid inference (INV-T07).
8. **Inclusive-language lint (09-01.5):** configurable term lists produce warnings; hard-blocking only for terms on an admin-maintained "never allowed" list (e.g. explicit discriminatory phrases) — no legal claim is made about completeness.

### 3.3 Safety checks (FEAT-09-08)
Signals: payment requested from applicant; contact via off-platform messenger or free-mail only; pay > {5}× median for title; copied description hash seen in other orgs within 24 h; org created < 24 h ago with first posting; links to non-https or URL shorteners. Any signal ⇒ `pending_review` with the signal list shown to the moderator; nothing is auto-rejected; the recruiter is told "a reviewer will check this posting" (SLA {1 business day}).

### 3.4 Side effects and postconditions
Events: `job.created`, `job.published`, `job.paused`, `job.closed`, `job.revised`, `job.taken_down`. Audit on every transition. Postconditions: INV-T30 (verified org, ≤ 1 slot), INV-T44 (closed ⇒ no new applications).

## 4. User interaction
SCR-JOB-EDIT (sections: basics, skills picker with typeahead and required/preferred toggle, location, pay with disclosure explainer, questions, team, preview as candidate); live validation per field; "Publish" opens a summary modal listing slot usage and warnings; SCR-JOB-LIST (filters by state, owner; bulk pause/close with confirm); SCR-JOB-REVIEW for moderators. Mobile: recruiter drafts on phone are possible but publishing requires online confirmation. Accessibility: error summary; skills picker keyboard-operable; preview uses same components as candidate view. Pay-range wording is neutral and includes currency/period.

## 5. Backend behavior
`api/jobs` owns jobs, revisions, questions, slot reservations; it calls `billing.getEntitlements(org)` (public interface) and `safety.precheck(job)`; never reads their tables (FF-02). Worker jobs: publish-at, expiry sweep, reminder, alert fan-out, index sync. Idempotency: publish keyed `(job_id, version)`.

| Endpoint (provisional) | Method |
|---|---|
| `/orgs/{org}/jobs` | POST create / GET list |
| `/jobs/{id}` | GET (role-aware) / PATCH (If-Match) |
| `/jobs/{id}/publish` | POST (Idempotency-Key) |
| `/jobs/{id}/pause`, `/resume`, `/close`, `/clone`, `/extend` | POST |
| `/jobs/{id}/review/approve`, `/request-changes` | POST (approver/moderator) |
| `/public/jobs/{slug}` | GET public detail |

## 6. Data
| Entity | Key fields |
|---|---|
| `job` | id, org_id, state (SM-JOB), version, title, slug, description, type, work_mode, level, pay jsonb, closes_on, published_at, expires_at, cloned_from |
| `job_skill` | job_id, skill_id, kind (required/preferred), min_level |
| `job_location` | job_id, country, region, city |
| `job_question` | id, job_id, type, prompt, options, required |
| `job_revision` | job_id, version, changed_fields, at, by |
| `job_team` | job_id, member_id, role (owner/hm/viewer) |
| `slot_reservation` | org_id, job_id, state (held/consumed/released), at |
| `precheck_result` | job_id, signals[], outcome, reviewer_id |
All tenant tables carry `org_id` + RLS (INV-T03).

## 7. States and transitions
SM-JOB t1–t10. Forbidden: `closed → *`; `draft → paused`; publish without slot.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | publish p95 ≤ 500 ms (excluding async index); public detail p95 ≤ 200 ms cached |
| SEO | public pages SSR/prerender with structured data (FEAT-09-05.1); closed jobs return a proper "closed" page, not 404 for 30 d |
| Security | per-record org authz; HTML sanitisation; no unsafe URLs; audit |
| Accessibility | WCAG 2.2 AA both editor and public page |
| Concurrency | slot reservation serialised per org |
| Fairness | pay disclosure encouraged; lint warnings logged for audit |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Two recruiters publish with one free slot | one succeeds; other `409 entitlement_exhausted` and keeps a draft |
| Publish retried after network error | idempotent; one `job.published` |
| Subscription lapses between schedule and execution | scheduled job re-checks entitlement; fails to `draft` with notification (U7) |
| Indexer down | job is `published` but search lag; alert; repair job reconciles |
| Moderator takes down job with applicants | applications continue for existing applicants; new applications blocked; notice to org |
| Draft edited by two people | `412` merge dialog |
| Org loses verification | live jobs stay up 7 d with banner then pause **[OPEN]** |
| Description paste includes script tags | sanitised; stored without them |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-09-01-01 | description of 199 and 200 chars | publish | 199 ⇒ `422`; 200 passes | Boundary |
| AC-09-01-02 | 0 or 16 required skills; free-text skill | save | `422` | Negative |
| AC-09-01-03 | pay min 100 > max 50 | save | `422` | Negative |
| AC-09-01-04 | question asking about age or marital status | save | rejected by lint with reason | Negative/Fairness |
| AC-09-01-05 | recruiter of Org A requests Org B draft | GET | `404` (no existence leak) | IDOR |
| AC-09-01-06 | free org requests AI draft | click | deterministic template offered; no paid inference (INV-T07) | Cost |
| AC-09-02-01 | entitled org, valid draft | publish | `published`; indexed ≤ 60 s p95; `job.published` once | Happy |
| AC-09-02-02 | one free slot, two concurrent publishes | submit | exactly one `published` | Concurrency |
| AC-09-02-03 | same publish request replayed | submit | same response; no second slot used | Idempotency |
| AC-09-02-04 | unverified org with 1 live job | publish second | `409 org_verification_required` | Negative |
| AC-09-02-05 | scam signals present | publish | `pending_review`; moderator sees signals; not rejected automatically | Safety |
| AC-09-02-06 | `publish_at` future; subscription lapsed before time | scheduler | job returns to `draft`; owner notified | Recovery |
| AC-09-02-07 | org policy requires approver; author = approver | publish | `pending_review` for a different approver | Process |
| AC-09-03-01 | published job, day 38 | sweep | reminder sent; day 45 `closed(expired)` | Time |
| AC-09-03-02 | closed job | reopen attempt | `409`; clone endpoint offered | Negative |
| AC-09-03-03 | close unfilled with 12 applicants | close | each notified ≤ 24 h | Happy |
| AC-09-03-04 | paused job | search | not returned; direct link shows "not accepting applications" | Happy |
| AC-09-03-05 | material edit with applicants | save | revision recorded; "Updated" marker; applications unchanged | Consistency |
| AC-09-05-01 | published job | crawl page | structured data present; canonical URL; no PII | SEO |
| AC-09-08-01 | description asks for payment to apply | publish | held for review with signal "payment_requested" | Safety |
| AC-02-03-01 | HM not assigned to job | edit | `403`; assigned HM can edit | Negative |

## 11. Testing
SM-JOB matrix; DT-12 row tests; concurrency test for slot lock (parallel publishes); scheduler tests with clock control; sanitiser fuzzing; cross-tenant canary on every job endpoint; E2E recruiter journey from draft to candidate-visible page; accessibility audit of editor.

## 12. Developer guidance
Order: draft model → validation → publish gate (DT-12) → public page → lifecycle jobs → safety checks → templates. Implement DT-12 as a pure function plus a transactional wrapper. Pitfalls: counting drafts as slots (BR-T093 counts published + paused only), reading entitlements from a client-supplied header, indexing before commit (use outbox). Decisions pending: pay disclosure duty (OPEN-08), org-verification mechanics, slot semantics for paused jobs.

## 13. Related
`STATE_MACHINES.md` SM-JOB · `DECISION_TABLES.md` DT-12, DT-02 · `BUSINESS_RULES_REGISTRY.md` BR-T035…T037, T093 · SPEC-08, SPEC-09, SPEC-12.

---

# SPEC-08 Job Search & Explainable Match

**Metadata:** Doc ID SPEC-08 · Owner: Matching PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-11-01, FEAT-11-02, FEAT-11-03, FEAT-11-07, FEAT-11-08, FEAT-24-12, FEAT-09-05 · Modules: MOD-OPP, MOD-HIR · `api/search`, `api/matching`, `api/skills`, `apps/worker` · Relates: ADR-T11, ADR-T22, INV-T19, INV-T25, INV-T45, BR-T070…T076, DT-03

## 1. Business purpose
Let candidates find relevant jobs quickly and understand **why** a job matches or not, using evidence strength as a first-class signal, while guaranteeing the ranking cannot be bought and cannot use protected attributes. Value: GOAL-03 (100 % of matches with rationale; audits pass), conversion from search to qualified application.

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-ANON | search public jobs (no match scores) | `search:jobs:public` |
| ROLE-CAND | search, see own match explanations, hide categories | `search:jobs`, `match:read:own` |
| ROLE-REC / ROLE-HM | see match explanations for applicants to their jobs | `match:read:applicant` |
| ROLE-AUD / ROLE-ADM | read audit aggregates | `match:audit` |
| System | index, compute | worker |

## 3. Functional behavior
### 3.1 Search inputs (FEAT-11-01)
| Parameter | Rule |
|---|---|
| `q` | ≤ 200 chars, Unicode-normalised, treated as data (never as query syntax) |
| filters | `country`, `region`, `city`, `radiusKm` ≤ 200 (when geo available), `workMode[]`, `employmentType[]`, `level[]`, `skills[]` (+ `skillsMode=any|all`), `payMin` (only jobs with `disclosed=true`), `postedWithin ∈ {1d,7d,30d}`, `org`, `eligibleOnly` (hides jobs failing declared eligibility filters) |
| `sort` | `relevance` (default), `date`; there is no "sponsored" or "featured" sort (FEAT-09-11 removed) |
| pagination | opaque cursor; `limit` 20 default, 50 max; stable ordering within a cursor session |
Relevance = weighted FTS rank (title 3, skills 2, description 1) + trigram similarity on title for typo tolerance + freshness decay; **no organisation plan, payment, or engagement input** (INV-T19, DT-03). Results show `postedAt`, org, location, work mode, disclosed pay, and — if signed in — `MatchSummary`.
Recent searches stored on device only; account-level search history is not retained beyond anonymised aggregate telemetry (consent-gated).

### 3.2 Match computation (FEAT-11-02, 11-03)
Inputs are **only** the DT-03 allowlist. For job `J` and candidate `C`:
1. For each skill `s` in `J`: weight `w_s` = 1.0 (required) or 0.4 (preferred).
2. **Skill confidence** `conf_s(C) ∈ [0,1]` from FEAT-04-04: `1 − Π_i (1 − r_i × d_i)` over active evidence items tagged `s`, where `r_i` = rung weight {claimed 0.15, artifact_backed 0.45, peer_attested 0.70, authority_verified 1.00} and `d_i = exp(−age_years_i / τ)` with `τ = 3` (recency decay).
3. `coverage_s = min(1, conf_s / target_s)` with `target_s = 0.8` by default (`minLevel` can raise it).
4. `score = 100 × Σ w_s × coverage_s / Σ w_s`.
5. **Uncertainty:** `verifiedShare = Σ w_s × coverage_s computed from rungs ≥ artifact_backed / Σ w_s × coverage_s`; `uncertainty = 1 − verifiedShare`; band ∈ {`low` < 0.25, `medium` < 0.60, `high`}. Displayed score is a **range** `[score − δ, score + δ]` with `δ = 4 / 8 / 14` for low/medium/high, clamped to 0–100 (tunable).
6. **Eligibility** (work mode, location, availability, declared work-authorisation) is evaluated separately and shown as pass/fail chips; it never lowers `score`.
7. **Label bands (copy):** ≥ 75 "Strong", 50–74 "Possible", < 50 "Stretch"; wording never says "unqualified" or "reject".
`MatchResult = {jobId, accountId, scoreRange, band, uncertainty, matched[{skill, rung, weightShare}], missing[{skill, w}], eligibility[], computedAt, inputHash, explanationVersion}`. `inputHash` covers all inputs used (INV-T45).

### 3.3 "Why" and "what would change this" (FEAT-11-02.4, 11-08)
The panel lists matched skills with rung chips ("SQL — verified by assessment"), missing skills, eligibility results, uncertainty text ("Most of this match rests on self-reported skills"), and up to 3 **actions** ranked by `Δscore` (e.g. "Complete the SQL assessment: about +8"), each linking to a real action (assessment, course, evidence form). Actions never claim a guaranteed outcome. Candidates may hide a recommendation category ("not interested in this role family"); this affects only their own feed.

### 3.4 Recompute & freshness (FEAT-11-07)
Triggers: `evidence.created/verified/revoked`, `skill.merged`, `job.revised`, `profile.updated` (preferences). Worker recomputes affected `(candidate, job)` pairs lazily (only for jobs the candidate viewed/applied/saved, plus top-N feed) within 15 min p95 (BR-T076). Reads compare stored `inputHash` with current inputs; mismatch ⇒ shows "updating" and recomputes on demand (≤ 1 s budget) rather than showing stale as fresh.

### 3.5 Recruiter view
For applicants, recruiters see the **same** `MatchResult` the candidate sees (symmetry), labelled advisory; order of applicants defaults to application date with optional sort by score; no applicant is hidden by score (BR-T072). Recruiter-initiated candidate search/shortlists are specified with FEAT-11-05/11-10 (Phase 2).

### 3.6 Indexing (FEAT-24-12)
Outbox → indexer: `job.published/revised/closed/paused/taken_down` update the search table (FTS vector, trigram, skills array, geo). Visible ≤ 60 s p95; removal on close/pause/takedown ≤ 60 s. Reindex job is idempotent; drift detector compares counts hourly.

### 3.7 Side effects & postconditions
Events: `match.computed` (internal, proposed), telemetry `search.performed` (consent-gated, no query text unless consented). Postconditions: every displayed match has rationale (BR-T071); no stored score without `inputHash`.

## 4. User interaction
SCR-JOB-SEARCH: query box with typeahead (skills/titles), filter drawer (mobile bottom sheet), result cards with match chip and rung hints, empty state with suggestions ("remove filter X", "see similar roles"); SCR-JOB-DETAIL with "Why this match" panel (expandable, keyboard accessible, plain language, no jargon), eligibility chips, "Gap to qualify" actions. Candidates with no evidence see guidance ("Add your first evidence to see a match") rather than a zero. Offline: last results cached read-only, labelled with time. Accessibility: result list semantics, filter state announced, chips not colour-only, charts have text equivalents.

## 5. Backend behavior
`api/search` serves queries from Postgres (FTS + `pg_trgm`; `pgvector` Phase 3) behind `SearchPort` (ADR-T11). `api/matching` exposes `getMatch(candidate, job)`; calls `skills.getConfidence(candidate)` through public interfaces. Scorer config validated at boot against the DT-03 allowlist; unknown input ⇒ startup failure. Telemetry for tuning is anonymised.

| Endpoint (provisional) | Method |
|---|---|
| `/jobs/search` | GET (cursor) |
| `/jobs/{id}/match` | GET (own) |
| `/jobs/{id}/match/actions` | GET |
| `/me/recommendations` | GET (Phase 2) |
| `/applications/{id}/match` | GET (job team) |

## 6. Data
| Entity | Key fields |
|---|---|
| `job_search_doc` | job_id, fts vector, title trigram, skills[], geo, work_mode, pay_min, posted_at, state |
| `skill_confidence` | account_id, skill_id, value, computed_at, input_hash |
| `match_result` | account_id, job_id, score_low, score_high, band, uncertainty, matched jsonb, missing jsonb, eligibility jsonb, computed_at, input_hash, explanation_version |
| `scorer_config` | version, weights, allowlist_hash, approved_by, effective_at |
| `fairness_sample` | period, group_ref (audit-only), outcomes (aggregate) |

## 7. States and transitions
No SM of its own; depends on SM-JOB (indexable states: `published` only), SM-EVIDENCE (`active` only), SM-ACCOUNT (`active`, not restricted).

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | search p95 ≤ 400 ms at target corpus {1 M jobs-equivalent rows}; `getMatch` cached ≤ 50 ms, recompute ≤ 1 s |
| Fairness | allowlist enforced in code; quarterly adverse-impact audit (FEAT-11-09); changes need ADR |
| Explainability | rationale generated from the same inputs as score (INV-T45) |
| Privacy | no personal data in search logs; telemetry consent-gated |
| Availability | search degrades to cached/last-known with banner, never to unranked "random" |
| Accessibility | WCAG 2.2 AA; filters operable by keyboard/screen reader |
| i18n | multilingual stemming deferred; English at launch **[OPEN]** |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Index lag | recently published job missing ≤ 60 s p95; alert at > 5 min |
| Closed job still in index | detail page shows closed state; indexer reconciliation purges |
| Evidence revoked while viewing | next fetch recomputes; UI shows "updated" note |
| Taxonomy merge changes skill ids | `skill.merged` triggers recompute; old ids resolved by alias |
| Scorer config contains disallowed input | process refuses to start; CI test fails |
| Search outage | friendly error; saved searches and applications unaffected |
| Candidate with only claimed evidence | match shown with wide range and "mostly self-reported" text, not suppressed |
| Query contains operators/injection | treated as plain text; no error leak |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-11-01-01 | job "Data Analyst" | search "data analist" | job returned (typo tolerance) | Happy |
| AC-11-01-02 | filters workMode=remote + skills=[SQL] mode=all | search | only jobs satisfying both | Happy |
| AC-11-01-03 | payMin=50000 | search | only jobs with disclosed pay ≥ 50,000 | Boundary |
| AC-11-01-04 | job paused, closed, taken down | search ≤ 60 s later | absent | Happy |
| AC-11-01-05 | two orgs identical posts; one has premium plan | search | order identical; swapping plans does not change order (INV-T19) | Fairness |
| AC-11-01-06 | cursor request after new jobs published | page 2 | no duplicates/skips within session | Consistency |
| AC-11-01-07 | `q` = `'; DROP TABLE jobs;--` | search | treated as text; normal results | Security |
| AC-11-01-08 | limit=51 | search | `422` or clamped to 50 per contract | Boundary |
| AC-11-02-01 | signed-in candidate | open result | every match shows rationale, computedAt, uncertainty band | Happy |
| AC-11-02-02 | stored match | recompute with same inputs | identical score and `inputHash` (reproducible) | Consistency |
| AC-11-02-03 | candidate skills only `claimed` | view match | range wide; text "mostly self-reported" | Honesty |
| AC-11-02-04 | recruiter opens applicant | match view | same result as candidate sees; no extra hidden fields | Symmetry |
| AC-11-02-05 | applicants with low scores | recruiter lists | all applicants visible; no auto-hide | Fairness |
| AC-11-02-06 | candidate has zero evidence | view match | guidance state, not "0 %" shaming | UX |
| AC-11-03-01 | scorer config adds `age` or `plan` input | boot/CI | rejected | Fairness |
| AC-11-03-02 | profile photo or name changed | recompute | score unchanged | Fairness |
| AC-11-07-01 | evidence revoked | recompute | match and skill confidence updated ≤ 15 min p95 | Happy |
| AC-11-07-02 | recompute worker down | open match | `inputHash` mismatch ⇒ on-demand recompute or "updating" label | Recovery |
| AC-11-08-01 | missing skill with assessment available | open panel | action listed with estimated Δscore and link | Happy |
| AC-24-12-01 | indexer redelivers event | process | idempotent; one row | Idempotency |
| AC-24-12-02 | drift between jobs table and index | hourly check | alert + repair job | Recovery |

## 11. Testing
Property tests: score monotonic in evidence rung and in number of matched skills; clamps; reproducibility. Allowlist/fairness tests (swap protected attributes ⇒ identical output; plan swap ⇒ identical ranking). Relevance regression suite with labelled queries. Index consistency tests via outbox replay. Load test at target corpus. Quarterly adverse-impact job (BP-35). Accessibility testing of explanation panel.

## 12. Developer guidance
Implement the scorer as a pure function in `packages/domain`, versioned (`explanation_version`) so old explanations remain interpretable. Store rationale with the score, never regenerate it with different logic. Pitfalls: leaking `Δscore` as a promise; caching match per candidate without `inputHash`; letting the search ranker read `org.plan`. Decisions pending: calibration of constants against real outcomes (needs data; until then mark as heuristic in the UI copy), languages, geo provider.

## 13. Related
`ADR_REGISTER.md` ADR-T11, T22 · `DECISION_TABLES.md` DT-03 · `BUSINESS_RULES_REGISTRY.md` BR-T070…T077 · SPEC-03 (rungs) · SPEC-07 · SPEC-09.

---

# SPEC-09 Application Submit (Idempotent, Draft Autosave, One-Active Rule)

**Metadata:** Doc ID SPEC-09 · Owner: Applications PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-10-01, FEAT-10-02, FEAT-10-03, FEAT-10-04, FEAT-10-14, FEAT-24-03, FEAT-24-07 · Modules: MOD-OPP, MOD-SHELL · `api/applications`, `api/privacy`, `api/platform`, `apps/worker` · Relates: SM-APPLICATION, DT-05, DT-01, BR-T001, BR-T038, BR-T039, BR-T062, BR-T114, BR-T117, INV-T10, INV-T13, INV-T21, INV-T28, INV-T44

## 1. Business purpose
Applying is the moment evidence becomes a hiring decision input. It must be effortless on a bad mobile connection, impossible to duplicate, and precise about what the employer will see. Value: qualified applications (success measure), candidate trust (consent snapshot), recruiter data quality.

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-CAND | create/edit draft, submit, withdraw, view own applications | `application:write:own` |
| ROLE-REC / ROLE-HM (job team) | read submitted applications of own jobs (snapshot) | `application:read:job` |
| ROLE-ORGADM | read within org (metadata; content only if on job team) | `application:read:org` |
| ROLE-SUP | grant-based | `application:read:granted` |
Drafts are visible to the candidate only.

## 3. Functional behavior
### 3.1 Draft (FEAT-10-01)
Creation: `POST /jobs/{id}/applications` (Idempotency-Key) creates a `draft` if none exists for (candidate, job) (INV-T21); an existing active application is returned instead. Autosave: `PUT /me/applications/{id}/draft` with `If-Match`; fields: `answers[]`, `evidenceIds[]` (≤ 20, active only), `coverNote` ≤ 2,000, `resumeVariantId?`, `contactVisibility ∈ {platform_messages_only (default), share_email}`. Draft expires 30 d after last edit (notice at 23 d); if the job closes mid-draft, draft is retained 7 d with a banner "This job is no longer accepting applications" (BR-T038).
**Offline (ADR-T10):** edits queue locally with client sequence and `baseVersion`; on reconnect each is replayed through the same PUT; a `412` shows the conflict UI with both versions (BR-T117). Submit is **never** queued: the Submit button is disabled offline with an explanation.

### 3.2 Pre-submit checklist & consent (FEAT-10-02.1)
The UI computes and the server enforces DT-05. The checklist shows: required answers, minimum profile (display name, headline, ≥ 1 skill), selected evidence with rung chips, each work claim and its verification label, and the **exact list of what the employer will see** (the preview *is* the snapshot render). Evidence not selected is not shared; no default pre-selection beyond "strongest 3 relevant to this job" suggestions the candidate must confirm. Truthfulness attestation: "I confirm the information I submit is accurate" (logged). Optional `CS-*` upgrades (e.g. let this employer open artefact files) are separate, unticked toggles that create per-employer grants (SPEC-02).

### 3.3 Submit (FEAT-10-02) — idempotent
`POST /me/applications/{id}/submit` with `Idempotency-Key`. In one transaction:
1. Replay check: same key+payload ⇒ return stored response; same key different payload ⇒ `422` (BR-T114).
2. DT-05 rows 3–9 evaluated under a **share lock on the job row** (INV-T44) and the unique-index guard (INV-T21).
3. Build **snapshot** (§3.4); set state `draft → submitted` (SM-APPLICATION t1); write audit; outbox `application.submitted`.
4. Return `201` with receipt `{applicationId, submittedAt, snapshotId, nextSteps}`.
Duplicate clicks and two devices racing resolve to one submission; the loser receives the same or `409 already_submitted` carrying the winner's id.
After commit: notify hiring team (in-app + email per prefs), notify candidate (receipt), trigger match compute for the pair (SPEC-08), index for recruiter queue.

### 3.4 Evidence snapshot (FEAT-10-14)
Immutable record (INV-T28) of: profile fields visible to applications, selected evidence items (title, description, skills, **rung and provenance summary at submit**, artefact references), work claims with verification states, résumé variant rendered to PDF at submit time, answers, cover note, `MatchResult` at submit, consent scopes applied, policy versions. At read time the viewer sees the snapshot **plus overlays**: current status of each evidence item (`revoked`/`withdrawn` markers; BR-T039) and live items only if consent still live (DT-01 row 4). Retention: while application active + {12 months} after terminal state (BR-T062, OPEN-08), then deleted or anonymised per org policy.

### 3.5 Withdraw & re-apply (FEAT-10-03)
`POST /me/applications/{id}/withdraw` (optional reason): allowed from any non-terminal state including `draft`; cancels open interviews, notifies the team, ends team access to live items (snapshot stays until retention end unless the candidate also requests erasure). Re-apply to the same job after `withdrawn` is allowed while the job is `published` (creates a new application linked `previous_application_id`); after `rejected` it is not allowed except via recruiter invitation (BR-T001 exception).

### 3.6 Status tracker (FEAT-10-04)
Candidate sees a timeline from SM-APPLICATION events: submitted → in review → shortlisted → interviewing → offer → outcome, with the org's stage label next to the canonical state and a plain-language note for rejections (reason category and optional recruiter feedback). If `stale` (no activity 45 d) the candidate may "ask for an update" (1 per 14 d), which notifies the team. No state changes automatically (INV-T09).

### 3.7 Postconditions
Exactly one active application per (candidate, job); snapshot exists iff state ≠ `draft`; every state change has audit + outbox; submit response replays identical bytes for the same key.

## 4. User interaction
SCR-APPLY (stepper: questions → evidence → review & consent → submit): autosave status ("Saved"/"Saved on this device — will sync"), keyboard-first, one task per screen on mobile, progress retained on refresh; SCR-APPLY-RECEIPT; SCR-MY-APPLICATIONS (tabs: active/closed, filters, sort by last update); SCR-APPLICATION-DETAIL (timeline, messages link, interview items, withdraw with confirm). Error handling: field-level errors with focus; duplicate-application error links to the existing one. Accessibility: confirmation dialogs focus-trapped; timeline has text alternatives.

## 5. Backend behavior
`api/applications` public interface: `applications.submit`, `applications.getForViewer(principal, id)` (applies DT-01 + overlays). Dependencies via interfaces: `evidence.getForViewer`, `profile.getApplicationView`, `privacy.recordApplicationConsent`, `matching.getMatch`. Idempotency middleware (FEAT-24-03) stores `(principal, route, key) → response` for 24 h. Partial unique index: `UNIQUE (candidate_id, job_id) WHERE state IN ('draft','submitted','in_review','shortlisted','interviewing','offer_extended')`.

| Endpoint (provisional) | Method |
|---|---|
| `/jobs/{id}/applications` | POST (create-or-get draft) |
| `/me/applications` | GET list |
| `/me/applications/{id}` | GET |
| `/me/applications/{id}/draft` | PUT (If-Match) |
| `/me/applications/{id}/submit` | POST (Idempotency-Key) |
| `/me/applications/{id}/withdraw` | POST |
| `/me/applications/{id}/nudge` | POST |

## 6. Data
| Entity | Key fields |
|---|---|
| `application` | id, candidate_id, job_id, org_id, state, version, org_stage_id, submitted_at, previous_application_id, stale, terminal_at |
| `application_draft` | application_id, answers, evidence_ids, cover_note, resume_variant_id, contact_visibility, base_version, updated_at |
| `application_snapshot` | id, application_id, payload (encrypted), payload_hash, created_at |
| `application_event` | application_id, from_state, to_state, actor_id, actor_kind, reason, at |
| `idempotency_record` | principal, route, key, request_hash, response, expires_at |
Retention per BR-T062.

## 7. States and transitions
SM-APPLICATION t1 (submit), t9 (withdraw), plus read-only exposure of later states. Forbidden: edit after submit; submit while job not `published`; reject by system.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | autosave p95 ≤ 150 ms; submit p95 ≤ 600 ms (snapshot + PDF render async-finalised: PDF attached ≤ 30 s later, snapshot hash covers inputs) |
| Reliability | exactly-once visible effect under retries; no lost drafts across offline/online |
| Security | per-record authz; snapshot encrypted at rest; recruiters cannot enumerate other jobs' applications |
| Privacy | only selected evidence shared; consent recorded with versions |
| Accessibility | WCAG 2.2 AA; no timeouts that lose data |
| Offline | draft edits only (ADR-T10) |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Submit request times out, client retries | same key ⇒ same result; no duplicate |
| Two devices submit simultaneously | one `201`, other receives winner's id (`409`/`200` replay) |
| Job closes between page load and submit | `409 job_not_open`; draft retained 7 d |
| Selected evidence revoked before submit | submit blocked with list; candidate removes or replaces |
| Evidence revoked right after submit | snapshot unchanged; recruiter overlay shows revocation |
| Candidate account suspended mid-draft | submit `403`; draft kept |
| PDF render fails | snapshot still valid; PDF retried; recruiter sees HTML résumé until ready |
| Offline edit conflicts with newer server draft | conflict UI; user chooses per field |
| Idempotency store unavailable | fail closed for submit (`503`), drafts continue locally |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-10-01-01 | no application exists | create | one `draft`; second create returns same draft | Idempotency |
| AC-10-01-02 | edit on device A saved; device B edits stale | PUT with old ETag | `412` + server version | Concurrency |
| AC-10-01-03 | offline edits queued, then online with newer server draft | sync | conflict UI; nothing silently overwritten | Recovery |
| AC-10-01-04 | draft idle 22 d / 23 d / 30 d | sweeper | no action / notice / deleted at 30 d | Time |
| AC-10-01-05 | job closes while draft open | candidate opens | banner; submit disabled; draft retained until +7 d | Edge |
| AC-10-02-01 | complete draft, job published | submit | `201`; state `submitted`; snapshot; events; receipt | Happy |
| AC-10-02-02 | same submit repeated with same key | submit | identical response; one snapshot | Idempotency |
| AC-10-02-03 | same key, different body | submit | `422 idempotency_conflict` | Negative |
| AC-10-02-04 | existing active application for (candidate, job) | create/submit another | `409 already_applied` with link | Negative |
| AC-10-02-05 | 10 parallel submits from 2 devices | race | exactly one submitted application | Concurrency |
| AC-10-02-06 | job `paused`/`closed` | submit | `409 job_not_open` | Negative |
| AC-10-02-07 | 21 evidence items selected | submit | `422` | Boundary |
| AC-10-02-08 | selected evidence revoked pre-submit | submit | blocked, list of items | Negative |
| AC-10-02-09 | required job question unanswered | submit | `422` with question ids | Negative |
| AC-10-02-10 | candidate selects no evidence | submit | allowed (profile-only) if job doesn't require; recruiter sees "no evidence shared" | Edge |
| AC-10-02-11 | offline | open Review step | Submit disabled with explanation | Offline |
| AC-10-14-01 | submitted application | candidate edits evidence title | snapshot unchanged (hash equal) | Immutability |
| AC-10-14-02 | evidence revoked after submit | recruiter opens | overlay "Revoked on <date>" on that item | Consistency |
| AC-10-14-03 | candidate revokes consent to Org after submit | recruiter opens | snapshot visible per BR-T062 but live artefacts denied | Privacy |
| AC-10-14-04 | recruiter of other org requests snapshot id | GET | `404` | IDOR |
| AC-10-03-01 | withdraw from `interviewing` | withdraw | state `withdrawn`; interviews cancelled; team notified | Happy |
| AC-10-03-02 | re-apply after `withdrawn` while job published | create | new application with `previous_application_id` | Happy |
| AC-10-03-03 | re-apply after `rejected` | create | `409 rejected_no_reapply` unless invited | Negative |
| AC-10-04-01 | no activity 45 d | sweeper | `stale=true`; prompt; no state change | Fairness |
| AC-10-04-02 | candidate nudges twice in 14 d | second nudge | `429` | Boundary |
| AC-24-03-01 | idempotency record older than 24 h | replay | treated as new request (and DT-05 row 5 may then apply) | Boundary |
| AC-24-07-01 | queued drafts exceed local storage quota | save | user warned; no silent loss | Recovery |

## 11. Testing
Concurrency tests (parallel submits across connections), idempotency replay tests, snapshot immutability trigger test, overlay consistency tests, offline conflict e2e (Playwright with network emulation), cross-tenant canary on recruiter endpoints, consent-revocation timing tests, load test on submit bursts after a popular job posts. Visual check that preview equals snapshot render (golden snapshot).

## 12. Developer guidance
Build order: draft model → idempotency middleware → DT-05 → snapshot → submit → withdraw → tracker → offline queue. The preview and the snapshot must use the same render function. Pitfalls: building the snapshot from live data after commit; using application `state` without the partial unique index; treating `409` on duplicate as an error screen instead of a link to the existing application. Decisions pending: retention (OPEN-08), PDF rendering approach, whether to allow multiple concurrent applications to different jobs of one org (allowed by default).

## 13. Related
`STATE_MACHINES.md` SM-APPLICATION · `DECISION_TABLES.md` DT-05, DT-01 · `BUSINESS_RULES_REGISTRY.md` BR-T001, T038, T039, T062, T114, T117 · SPEC-02, SPEC-03, SPEC-08, SPEC-10.

---

# SPEC-10 Pipeline Stage Change & Interview Scheduling

**Metadata:** Doc ID SPEC-10 · Owner: Hiring PM · Version 1.0 · Status Under Review · Phase 1 (stage moves, rejection) / Phase 2 (interviews, scorecards) · Priority P0 / P1 · Features: FEAT-10-05, FEAT-10-06, FEAT-10-07, FEAT-10-08, FEAT-23-03, FEAT-02-06 · Modules: MOD-HIR, MOD-OPP · `api/applications`, `api/integrations`, `apps/worker`, `api/notify` · Relates: SM-APPLICATION, SM-INTERVIEW, BR-T002, BR-T040, INV-T09, INV-T11, INV-T39

## 1. Business purpose
Give hiring teams a fast, auditable way to move candidates through stages and schedule interviews without double-bookings, while preserving candidate dignity: no automated rejection, clear communication, and recoverable mistakes. Value: GOAL-02 (time-to-shortlist), candidate response time, reduced no-shows.

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-REC | move stages, reject, propose/cancel interviews, add notes/scorecards for jobs they belong to | `application:transition`, `interview:manage` |
| ROLE-HM | same for assigned jobs; offer permission per org setting | `application:transition:assigned` |
| ROLE-ORGADM | configure stages, view all org pipelines | `pipeline:configure` |
| viewer (org) | read only | `application:read:job` |
| ROLE-CAND | choose/decline slots, request reschedule, contest no-show | `interview:respond:own` |
| System | reminders, expiry, ICS dispatch | worker |
| Service accounts (ROLE-SVC) | **cannot** perform `reject` (INV-T09) | — |

## 3. Functional behavior
### 3.1 Pipeline model
An org (or job) pipeline is an ordered list of **stages**; each stage has a `label` and maps to one **canonical state** of SM-APPLICATION (`in_review`, `shortlisted`, `interviewing`, `offer_extended`). Several stages may map to the same canonical state. Defaults: Screening→`in_review`, Shortlist→`shortlisted`, Interview→`interviewing`, Offer→`offer_extended`. Custom stage lists arrive in Phase 3 (FEAT-10-12); Phase 1 uses defaults.

### 3.2 Stage change (FEAT-10-05)
`POST /applications/{id}/transition` body `{toStageId, reason?, expectedVersion}` with `If-Match`/Idempotency-Key.
1. Authorize (job team membership, INV-T02).
2. Map `toStageId` to canonical target; check SM-APPLICATION (allowed forward moves, skips t11, corrections t10 with `reason`); `hired` only via offer acceptance.
3. Version check: stale ⇒ `409 stale_version` + current state.
4. Write transition, audit (actor, reason, from/to stage), outbox `application.stage.changed`.
5. Notifications: candidate is notified for `interviewing`, `offer_extended`, `rejected`, `hired`; for `shortlisted` per org setting (default on); other moves silent. Notification copy is templated by canonical state to avoid inconsistent promises.
Bulk moves (FEAT-10-11, Phase 3) apply the same checks per item with a per-item result list.

### 3.3 Rejection (FEAT-10-06)
Two-step: `POST …/reject/preview` returns what will happen (candidate notification text, effects on interviews) and a short-lived `confirmToken` (5 min); `POST …/reject/confirm` with `{confirmToken, reasonCode, feedbackTemplateId?, message?}`.
`reasonCode` ∈ {`skills_not_matched`, `position_filled`, `eligibility`, `candidate_unresponsive`, `role_cancelled`, `other`}. `message` ≤ 1,000 chars, linted against protected-attribute terms (blocked with explanation). Actor must be `human` with permission; API tokens of service accounts get `403`. Effects: state `rejected`, open interviews cancelled, candidate notified ≤ 24 h with optional feedback and standard wording, hiring-team notes untouched. Bulk reject ≤ 50 per action with a summary confirm; each item individually audited (BR-T040). No automatic rejection exists anywhere, including "auto-close on job fill": closing a job notifies applicants but does not change application states (INV-T09; recruiters are prompted to resolve each).

### 3.4 Interview scheduling (FEAT-10-07)
**Propose:** `POST /applications/{id}/interviews` `{slots[1..5] {start, durationMin 15–240}, interviewerIds[1..5], mode ∈ {video, phone, onsite}, location/link?, note?}`. Validation: application in `in_review`, `shortlisted` or `interviewing` (in_review → interviewing is an allowed skip, SM-APPLICATION t11); each slot starts ≥ 2 h from now and ≤ 60 d ahead; interviewers are job-team members; **no overlap** with the interviewer's other `scheduled` interviews (exclusion constraint, INV-T39) or the candidate's. Creating the first interview moves application to `interviewing` (SM-APPLICATION t4). Proposed slots are held 72 h (SM-INTERVIEW t1/t3).
**Choose:** candidate picks a slot; transaction re-checks overlap; success ⇒ `scheduled` (t2), ICS invites (METHOD:REQUEST, stable UID, SEQUENCE 0) to candidate and interviewers via email and calendar integration (FEAT-23-03), reminders 24 h and 1 h before (BR-T086: time-critical, ignore quiet hours). If a slot was taken, `409 slot_unavailable` with remaining alternatives.
**Reschedule** (either side, ≥ 2 h before start): creates a new `proposed` interview with `reschedule_of`, marks the old `rescheduled` (t4); ICS update with SEQUENCE+1 or CANCEL for the old UID as applicable.
**Cancel:** `scheduled/proposed → cancelled` with reason; ICS METHOD:CANCEL; counterpart notified.
**Complete:** after end time the scheduler marks `completed` unless a human marked `no_show`; triggers scorecard prompts.
**No-show:** marked only by a human within 48 h of start; the other party is notified and may contest (opens moderation-lite review for the org admin; no penalty automation).
**Time zones:** all times stored as UTC + IANA zone of the organiser; displayed in each viewer's zone with explicit offset; DST transitions handled by storing the instant, not wall time; slot picker warns when a slot falls outside the candidate's declared working hours.
**Calendar integrations (FEAT-23-03):** Phase 2 baseline = ICS attachment/links; direct Google/Microsoft calendar write is **[OPEN]**.

### 3.5 Scorecards (FEAT-10-08)
Per interview, each interviewer completes a scorecard from a template (3–8 criteria, rating 1–4, comment ≤ 500, overall recommendation `strong_yes|yes|no|strong_no` — advisory only). **Blind until all required interviewers submit or 48 h pass**; editable 1 h after submit; never visible to candidates; no auto-ranking from scores (INV-T09).

### 3.6 Side effects & postconditions
Events: `application.stage.changed`, `application.rejected`, `interview.proposed/scheduled/rescheduled/cancelled/completed/no_show`, `scorecard.submitted`. Postconditions: every state change auditable with actor and reason; no overlapping scheduled interviews for any person; terminal applications cannot receive new interviews.

## 4. User interaction
SCR-PIPELINE (Kanban columns per stage + list view; drag-and-drop with a keyboard alternative "Move to…" menu; card shows candidate, match band (advisory), days in stage, stale flag, next interview); move errors shown inline with refresh action; SCR-REJECT-CONFIRM (summary, reason, optional feedback, preview of candidate message); SCR-INTERVIEW-PROPOSE (calendar view of interviewer availability, drag to choose up to 5 slots, tz indicator); candidate SCR-INTERVIEW-CHOOSE (slots in local time with offset, add to calendar); SCR-SCORECARD. Mobile: recruiters can triage and confirm on phone; scheduling grid is list-based on narrow screens. Accessibility: drag-drop alternative, status changes announced, timezone text always visible.

## 5. Backend behavior
`api/applications` owns pipelines, applications, interviews, scorecards. Transition endpoint is the only writer of application state. Interview overlap enforced by a Postgres exclusion constraint on `(person_id, tstzrange)` for `scheduled` rows (hence INV-T39) plus transaction retry on serialization failure. ICS generation in `api/integrations`; dispatch via notify. Scheduler jobs: proposal expiry, reminders, auto-complete, stale flag, scorecard unblinding.

| Endpoint (provisional) | Method |
|---|---|
| `/jobs/{id}/pipeline` | GET / PUT (Phase 3 customisation) |
| `/jobs/{id}/applications` | GET (job team; filters, sort) |
| `/applications/{id}/transition` | POST |
| `/applications/{id}/reject/preview`, `/reject/confirm` | POST |
| `/applications/{id}/interviews` | POST / GET |
| `/interviews/{id}/choose`, `/reschedule`, `/cancel`, `/no-show`, `/contest` | POST |
| `/interviews/{id}/scorecards` | POST / GET |

## 6. Data
| Entity | Key fields |
|---|---|
| `pipeline`, `pipeline_stage` | id, org/job, ordinal, label, canonical_state |
| `application` (see SPEC-09) | + stage_id, version |
| `interview` | id, application_id, state (SM-INTERVIEW), start_utc, end_utc, tz, mode, location, uid, sequence, reschedule_of, created_by |
| `interview_slot` | interview_id, start_utc, end_utc, held_until, chosen |
| `interview_participant` | interview_id, person_id, role (candidate/interviewer), response |
| `scorecard` | interview_id, interviewer_id, ratings, comment, recommendation, submitted_at, visible_at |
| `application_note` | application_id, author_id, body, mentions[] (team-only) |
Exclusion constraint: `EXCLUDE USING gist (person_id WITH =, tstzrange(start_utc, end_utc) WITH &&) WHERE state = 'scheduled'`.

## 7. States and transitions
SM-APPLICATION t2–t11; SM-INTERVIEW t1–t7. Forbidden: jump to `hired`; moves on terminal applications; scheduling in the past; overlapping interviews.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | transition p95 ≤ 250 ms; pipeline board load p95 ≤ 600 ms for 500 applications; interview choose p95 ≤ 400 ms |
| Concurrency | optimistic locking on applications; exclusion constraint for slots |
| Security | job-team scoped; IDOR tests; no candidate access to notes/scorecards |
| Audit | every transition and decision logged with actor kind |
| Reliability | reminders and ICS dispatch idempotent per `(interview, kind)` |
| Accessibility | WCAG 2.2 AA; DnD alternative; time zone clarity |
| i18n | date/time formatting per locale; ICS with locale-neutral content |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Two recruiters move same card | second gets `409 stale_version`; UI refreshes with current stage |
| Candidate chooses slot that was just taken | `409 slot_unavailable`; alternatives shown |
| Interviewer double-booked via another system | cannot be detected externally; platform conflict only; calendar integration (Phase 2) warns **[OPEN]** |
| ICS delivery bounces | in-app invite remains; recruiter alerted |
| DST change between proposal and interview | instant stored in UTC; display adjusts; reminder times computed from instant |
| Job closed while interview pending | interview proceeds; application remains; recruiter prompted to resolve |
| Candidate withdraws with scheduled interview | interview cancelled with CANCEL ICS; interviewers notified |
| Rejection notification fails | retried (SM-NOTIFY); rejection stands; failure surfaced to recruiter if dead-lettered |
| Bulk reject partially fails | per-item result list; no all-or-nothing hiding |
| No-show contested | org admin reviews; outcome recorded; status changed by human |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-10-05-01 | application `in_review`, version 3 | recruiter moves to Shortlist with version 3 | `shortlisted`; audit; event; candidate notified per setting | Happy |
| AC-10-05-02 | version 3 stale (actual 4) | move | `409 stale_version` | Concurrency |
| AC-10-05-03 | move `shortlisted → submitted` | POST | `409 invalid_transition` | Negative |
| AC-10-05-04 | move `in_review → hired` | POST | `409 invalid_transition` | Negative |
| AC-10-05-05 | HM not on job's team | move | `403`/`404` | IDOR |
| AC-10-05-06 | terminal application | move | `409` | Negative |
| AC-10-05-07 | `offer_extended → interviewing` without reason | POST | `422 reason_required` | Negative |
| AC-10-06-01 | recruiter requests reject preview | then confirm within 5 min with reason | `rejected`; candidate notified ≤ 24 h; interviews cancelled | Happy |
| AC-10-06-02 | confirm without preview token or after 5 min | confirm | `409 confirm_required` | Negative |
| AC-10-06-03 | service-account token calls confirm | POST | `403` | Security (INV-T09) |
| AC-10-06-04 | message contains protected-attribute term | confirm | blocked with explanation | Fairness |
| AC-10-06-05 | bulk reject of 50 vs 51 | submit | 50 accepted with summary confirm; 51 ⇒ `422` | Boundary |
| AC-10-06-06 | job closes as filled | system | applicants notified; no application state changes automatically | Fairness |
| AC-10-07-01 | `shortlisted` application, 3 valid slots | propose | interview `proposed`; application `interviewing`; candidate notified | Happy |
| AC-10-07-02 | slot starting in 90 minutes | propose | `422 slot_too_soon`; 2 h exactly accepted | Boundary |
| AC-10-07-03 | slot overlaps interviewer's scheduled interview | candidate chooses | `409 slot_unavailable`; no double booking | Concurrency |
| AC-10-07-04 | two candidates choose same interviewer slot simultaneously | race | exactly one `scheduled` | Concurrency |
| AC-10-07-05 | scheduled | invites | ICS has stable UID, correct UTC time, organiser, METHOD:REQUEST | Happy |
| AC-10-07-06 | reschedule 3 h before start | request | old `rescheduled`, new `proposed`, ICS SEQUENCE+1 | Happy |
| AC-10-07-07 | reschedule 1 h before start | request | `409 too_late` (contact organiser) | Boundary |
| AC-10-07-08 | proposal unanswered 72 h | sweep | `expired`; recruiter notified | Time |
| AC-10-07-09 | interview crosses DST change | view in candidate zone | correct local time and offset | Edge |
| AC-10-07-10 | recruiter marks candidate no-show 49 h after start | POST | `409 window_closed` | Boundary |
| AC-10-07-11 | candidate contests no-show | POST | review opened; no automatic penalty | Fairness |
| AC-10-07-12 | candidate withdraws application | interview scheduled | interview `cancelled` + CANCEL ICS | Consistency |
| AC-10-08-01 | two interviewers, one has submitted | other interviewer views peer scorecard | hidden until both submit or 48 h | Process |
| AC-10-08-02 | candidate requests scorecard | GET | `403` | Privacy |
| AC-23-03-01 | ICS bounce | worker | in-app invite stays; recruiter alerted | Recovery |

## 11. Testing
Full SM-APPLICATION and SM-INTERVIEW matrices incl. forbidden pairs; concurrency tests for stale version and slot races with real DB; ICS conformance tests with common calendar parsers; time-zone/DST property tests; IDOR/cross-tenant canary; process test that no code path outside the transition service writes `state`; bulk-operation tests; accessibility tests for the board.

## 12. Developer guidance
Order: transition service + audit → pipeline UI → rejection flow → interview propose/choose with exclusion constraint → reminders/ICS → scorecards. Lint rule: only `applications.transition()` may update `application.state`. Pitfalls: storing wall-clock times without zone; treating drag-and-drop as the only way to move cards; sending ICS with changing UIDs; making "job filled" bulk-update applications. Decisions pending: external calendar sync scope, no-show policy window, whether HMs can reject (default: yes with confirm; org setting may restrict).

## 13. Related
`STATE_MACHINES.md` SM-APPLICATION, SM-INTERVIEW · `BUSINESS_RULES_REGISTRY.md` BR-T002, T040, T086 · `PRODUCT_INVARIANT_REGISTRY.md` INV-T39 · SPEC-09, SPEC-11 (messaging), SPEC-12 (entitlements for scheduling features).
