# ID Registry (canonical — all documents MUST use these IDs)

Doc ID: CC-ID · Owner: Documentation Architect · Version 1.0 · Status: Under Review

Classification tags used everywhere: **[REF]** reference, **[CONF]** confirmed requirement, **[TARGET]** target design decision, **[OPEN]** open assumption.

## Domains (DOM)

| ID | Domain | Class | Remote / Owner module |
|---|---|---|---|
| DOM-01 | Identity, Sessions & Access | Core-enabling | shell + `api/identity` |
| DOM-02 | Organizations, Tenancy & Roles | Core-enabling | `mf-hiring`, `mf-admin` + `api/orgs` |
| DOM-03 | Profile, Portfolio & Resume | Core | `mf-candidate` + `api/profile` |
| DOM-04 | Skills Graph & Taxonomy | Core | `api/skills` (read by all) |
| DOM-05 | Evidence & Credentials | Core | `mf-candidate` + `api/evidence` |
| DOM-06 | Verification & Trust (work history, references, certificates) | Core | `mf-candidate`, `mf-hiring` + `api/verification` |
| DOM-07 | Assessment, Challenges & Integrity | Core | `mf-learning` + `api/assessment` |
| DOM-08 | Learning (courses, paths, instructors) | Core | `mf-learning` + `api/learning` |
| DOM-09 | Opportunities (jobs, templates, alerts) | Core | `mf-opportunities`, `mf-hiring` + `api/jobs` |
| DOM-10 | Applications & Hiring Pipeline (ATS, interviews) | Core | `mf-opportunities`, `mf-hiring` + `api/applications` |
| DOM-11 | Matching, Search & Recommendations | Core | `api/search`, `api/matching` |
| DOM-12 | Career Intelligence (readiness, transitions, salary) | Supporting | `mf-candidate` + `api/careerintel` |
| DOM-13 | Messaging & Collaboration | Supporting | `mf-messaging` + `api/messaging` |
| DOM-14 | Networking & Community | Supporting/Conditional | `mf-messaging` + `api/network` |
| DOM-15 | Notifications & Engagement | Supporting | `mf-messaging` + `api/notify` |
| DOM-16 | Billing, Plans & Entitlements | Supporting | `mf-account` + `api/billing` |
| DOM-17 | AI Gateway & Governance | Enabling | `api/ai` |
| DOM-18 | Institutions (B2B2C) | Conditional | `mf-admin` (institution workspace) + `api/institutions` |
| DOM-19 | Trust, Safety & Moderation | Supporting | `mf-admin` + `api/safety` |
| DOM-20 | Administration, Support & Back Office | Supporting | `mf-admin` + `api/admin` |
| DOM-21 | Analytics & Reporting | Supporting | `api/analytics` |
| DOM-22 | Privacy, Consent & Data Rights | Core-enabling | `mf-account` + `api/privacy` |
| DOM-23 | Integrations & Developer Platform | Conditional | `api/integrations` |
| DOM-24 | Platform (flags, media, jobs queue, observability) | Enabling | `api/platform`, `apps/worker` |

## Frontend modules (MOD)

| ID | Module | Kind | Route prefix |
|---|---|---|---|
| MOD-SHELL | Host shell | host | `/`, `/login`, `/signup`, public pages |
| MOD-CAND | `mf-candidate` | remote | `/me/*` (profile, portfolio, evidence, resumes, career) |
| MOD-LRN | `mf-learning` | remote | `/learn/*` (courses, assessments, challenges, instructor studio) |
| MOD-OPP | `mf-opportunities` | remote | `/jobs/*`, `/applications/*` |
| MOD-HIR | `mf-hiring` | remote | `/hiring/*` |
| MOD-MSG | `mf-messaging` | remote | `/messages/*`, `/network/*`, `/notifications` |
| MOD-ACC | `mf-account` | remote | `/settings/*`, `/billing/*`, `/privacy/*` |
| MOD-ADM | `mf-admin` | remote | `/admin/*`, `/institution/*` |

Backend modules (BMOD) use the `api/<name>` names in the table above, plus `apps/worker` (BMOD-WORKER) and `packages/policy` (BMOD-POLICY).

## Roles (ROLE)

ROLE-CAND candidate/learner · ROLE-INST instructor · ROLE-REC recruiter · ROLE-HM hiring manager · ROLE-ORGADM org admin · ROLE-INSTADM institution admin · ROLE-FAC faculty · ROLE-REFEREE referee (tokenised, non-account) · ROLE-MENTOR mentor · ROLE-MOD moderator · ROLE-SUP support operator · ROLE-ADM platform admin · ROLE-AUD auditor (read-only) · ROLE-SVC service/integration account · ROLE-ANON anonymous.

## Identifier prefixes

GOAL, DOM, CAP, MOD, FEAT (`FEAT-<DOM>-NN`), FR, NFR, RULE (`BR-T###`), INV (`INV-T##`), UJ, UI (screens `SCR-*`), ACT (`ACT-*`), API (`API-*`), EVT (`EVT-*`), DATA (`DATA-*`), AC, TEST, ADR (`ADR-T01…`), RISK (`RISK-NN`), OPEN (`OPEN-NN`), SM (state machine `SM-*`).

Existing-project IDs (`F-01…`, `BR-001…`, `INVARIANT-001…`) are **[REF]** only.

## Consent scope IDs (CSC)

Consent scopes use dotted ids `<area>.<purpose>` (regex `^[a-z]+\.[a-z_]+(\.[a-z_]+)?$`, the third segment used only by `ai.assist.process`; for example `evidence.share_artefact`). The only list of valid ids, their grain, defaults, expiry, revocation effects and the old-to-canonical crosswalk is [CONSENT_SCOPE_CATALOGUE](CONSENT_SCOPE_CATALOGUE.md) (14 scopes; enforced by FF-12). Legacy `CS-*` ids (`CS-DISCOVER` etc.) and `evidence.share_recruiter` are retired and must not be used in new text. Related families: `PUR-##` (processing purposes, PRIVACY design section 2; PUR-21..23 added for the split scopes), `OPEN-CS-##` (open items of the catalogue).
