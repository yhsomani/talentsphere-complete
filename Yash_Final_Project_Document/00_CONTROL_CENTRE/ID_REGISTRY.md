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
| MOD-SHELL | Host shell | host | `/`, `/auth`, `/login`, `/signup`, `/workspaces`, `/help`, `/legal`, `/offline`, `/error`, `/invite`, `/c` (public credential), `/p` (public profile), `/r` (referee request); source: SCREEN_REGISTRY SCR-SHELL-* (REVW-35) |
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

GOAL, DOM, CAP, MOD, FEAT (`FEAT-<DOM>-NN`), FR, NFR, RULE (`BR-T###`), INV (`INV-T##`), UJ, UI (screens `SCR-*`), ACT (`ACT-*`), API (`API-*`), EVT (`EVT-*`), DATA (`DATA-*`), AC, TEST, ADR (`ADR-T01…`; ADR-T23 is proposed and pending ratification), RISK (`RISK-NN`), OPEN (`OPEN-NN`), SM (state machine `SM-*`).

Root `SSOT.md` `F-01…F-173` IDs are the canonical product-portfolio identities; this blueprint's `FEAT-*` rows are a separate decomposition pending the one-to-many crosswalk in OPEN-41. Existing-project rule/state IDs such as legacy `BR-*` and `INVARIANT-001…` are **[REF]** only; proposed target rules use the independent `BR-T###` namespace. See the [legacy rule crosswalk](../06_BUSINESS_PROCESSES/LEGACY_RULE_CROSSWALK.md); numeric similarity does not imply equivalence.

## Consent scope IDs (CSC)

Consent scopes use dotted ids `<area>.<purpose>` (regex `^[a-z]+\.[a-z_]+(\.[a-z_]+)?$`, the third segment used only by `ai.assist.process`; for example `evidence.share_artefact`). The only list of valid ids, their grain, defaults, expiry, revocation effects and the old-to-canonical crosswalk is [CONSENT_SCOPE_CATALOGUE](CONSENT_SCOPE_CATALOGUE.md) (14 scopes; enforced by FF-12). Legacy `CS-*` ids (`CS-DISCOVER` etc.) and `evidence.share_recruiter` are retired and must not be used in new text. Related families: `PUR-##` (processing purposes, PRIVACY design section 2; PUR-21..23 added for the split scopes), `OPEN-CS-##` (open items of the catalogue).

## Preservation evidence IDs

`DOC-000001` onward identifies source inventory rows in `KNOWLEDGE_PRESERVATION_MANIFEST.csv`. `EVD-000001` through `EVD-000204` are the source-document evidence pointers in that inventory. `EVD-000205` through `EVD-000242` are row-level evidence pointers in `28_TRACEABILITY_AND_COVERAGE/OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK.csv`. Each row retains its source DOC/EVD pointer, path, revision, hash and anchor. Assign subsequent IDs from the next unused number; never recycle an ID. The `TRC-*` document IDs identify traceability artifacts; TRC-07 is the observed implementation control crosswalk. `EVD-000243` through `EVD-000490` link the 248 historical business-rule audit records in `docs/reports/AUDIT_EVIDENCE_2026-10-21.json` to the corresponding `BR-*` rows in `06_BUSINESS_PROCESSES/LEGACY_RULE_CROSSWALK.csv`; full excerpts remain in the source JSON. `EVD-000491` through `EVD-000518` link the 28 historical audit journey records to source-registry lines and candidate `UJ-*` rows; the mapping remains unapproved under OPEN-50. `TRC-08` identifies this candidate journey evidence map. `EVD-000519` through `EVD-000796` provide row-level source pointers for the 278 routes compared with the target API catalog in `13_API_EVENTS_AND_INTEGRATIONS/OBSERVED_ROUTE_TARGET_CROSSWALK.csv`; the map is path/method-level only and remains under OPEN-46/50. `TRC-09` identifies the candidate route crosswalk. `EVD-000797` through `EVD-000847` point to the 51 migration records in the 2026-10-21 audit JSON; hashes match the checkout, while applied state remains unknown. `TRC-10` identifies the historical migration evidence crosswalk. `EVD-000848` through `EVD-002019` point to the 1,172 historical audit test assertions; statuses are dated memory-mode claims, and feature IDs are candidates only. `TRC-11` identifies the historical test evidence crosswalk. `EVD-002020` through `EVD-002021` point to the two historical synthetic probe records; they are not verification passes. `TRC-12` identifies the probe crosswalk. `EVD-002022` through `EVD-002054` point to 9 PR snapshots, 7 issue snapshots, and 17 issue comments in the audit JSON; external states remain historical and current status was not checked. `TRC-13` identifies the external issue crosswalk. `EVD-002055` through `EVD-002328` point to the 274 historical audit route records joined by exact method/path to the observed reference API inventory; the join is not a semantic contract match. `TRC-14` identifies the audit route evidence crosswalk. `EVD-002329` through `EVD-003012` point to the 684 historical audit inventory rows with current path/hash comparison; source coverage says inventoried, not necessarily inspected. No content-level disposition is implied. `TRC-15` identifies the audit inventory crosswalk. `EVD-003013` through `EVD-003058` map the 46 historical documentation cross-check rows to manifest DOC IDs; EVD-003059 through EVD-003060 retain the two absent deliverable-path claims. `TRC-16` identifies the audit documentation cross-check map.

EVD-003061 through EVD-003072 map 12 major claim groups from the 2026-10-22 architecture durability report DOC-000158 to target blueprint locations and later evidence, preserving historical revision, contradictions and validation limits. TRC-17 identifies this candidate crosswalk; source findings are not promoted as current defects or approved target requirements.

EVD-003073 through EVD-003082 map 10 major claim groups from source ADR-015 (DOC-000133) to target ADR-T05, data/migration design and later evidence. TRC-18 identifies this candidate crosswalk; OPEN-52 records the unresolved persistence bridge and owner/evidence gate.


## Identifier families added by the 2026-10-27 patch round (registered here)

Evidence labels: SOURCE (quoted from a repo source), VERIFIED (checked by a command in this round), TARGET_APPROVED (owner/ARB approved; none yet), PROPOSED (written in the docs, not ratified), OPEN (unresolved). Every row below was confirmed present by `grep` in the named file on 2026-10-27 (VERIFIED for existence only; content is PROPOSED). No ID here is implemented or tested; no test has been executed.

| Family | Range | Defined in | Label | Meaning |
|---|---|---|---|---|
| ACT-ATOM | 01..12 | 07 `ACTION_REGISTRY.md` (patch block "atomic action contracts") | PROPOSED | Atomic action contracts (idempotency, completion criterion, audit event per action) |
| UXH | 01..08 | 07 `PROGRESSIVE_UX_AND_FEEDBACK.md`; cited in 06 BP/SM and 07 ACT/NAV | PROPOSED | UX honesty/feedback rules |
| TEST-UXH | 001..004 | 07 `PROGRESSIVE_UX_AND_FEEDBACK.md` | PROPOSED | Tests for UXH rules (not in TEST_CATALOG yet; OPEN-UX-36 style gap) |
| CSV | 01..12, R1..R5 | 06 `STATE_MACHINES.md` (+ BP, SSOT_WORKFLOW_CROSSWALK) | PROPOSED | Cross-state-machine vocabulary rows and rules. Not a file extension; write `CSV-nn` with the hyphen |
| RD | 19..24 (01..18 older) | 07 `NAVIGATION_ARCHITECTURE.md` | PROPOSED | Route decisions |
| NAV-GRD | 01..05 | 07 `NAVIGATION_ARCHITECTURE.md`, `ACTION_REGISTRY.md` | PROPOSED | Navigation guard rules |
| NAV-FOC | 01..10 | 07 `NAVIGATION_ARCHITECTURE.md` | PROPOSED | Focus-management rules |
| FLD | FLD-AUTH/EVD/ORG/PIPE/PRO/REF/APP/MSG-nn (20 ids found) | 07 `SCREEN_SPECIFICATIONS_KEY.md`, 06 `SSOT_WORKFLOW_CROSSWALK.md` | PROPOSED | Field-level specs |
| DS-N | 01..05 | 07 `DESIGN_SYSTEM.md` | PROPOSED | Design-system numeric/normalisation rules |
| EDG | 01..14 | 06 `BUSINESS_PROCESS_INVENTORY.md` | PROPOSED | Process edge cases |
| XT | 01..06 | 06 `SSOT_WORKFLOW_CROSSWALK.md` | PROPOSED | Workflow crosswalk exceptions |
| TEST-ACT | 001..012 | 07 `ACTION_REGISTRY.md` | PROPOSED | Tests for ACT-ATOM (not in TEST_CATALOG) |
| OPEN-UX | 34..36 (04..33 existing) | 06 `SSOT_WORKFLOW_CROSSWALK.md`, 07 `SCREEN_SPECIFICATIONS_KEY.md` | OPEN | Open UX items; see OPEN_DECISIONS section 6 |
| D (ADR decision records) | D-01..D-05 | 24 `ADR_REGISTER.md` | PROPOSED | Decision records for ADR-T04, T24, T05/T11, T02, T19/T23. Always write `ADR-REG D-nn`; bare `D-nn` is also used for decision-table and ledger labels elsewhere |
| FED-RT | 01..10 | 09 `VERSION_COMPATIBILITY_DESIGN.md`, cited by ADR_REGISTER | PROPOSED | Federation runtime rules. Remote load timeout 10000 ms is PROPOSED (09 `HOST_CONTRACT_AND_REMOTE_CONTRACTS.md`) |
| PWA-PT | 01..10 | 08 `OFFLINE_AND_SYNC_DESIGN.md` | PROPOSED | PWA/offline policy tables |
| DC | 01..10 | 12 `PHYSICAL_DESIGN.md`, 13 `API_DESIGN_STANDARDS.md` | PROPOSED | Data/consistency contracts. DC-05 `GET /api/v1/idempotency/{key}` is PROPOSED and not in OpenAPI (OPEN) |
| SF | 01..10 | 15 `FAILURE_MODE_ANALYSIS.md` section 10, ADR_REGISTER | PROPOSED | Safe-failure rules |
| R3 | 1..10 | 14 `SECURITY_ARCHITECTURE.md` (cited in 03, 16, 18, 19) | PROPOSED | Round-3 security/trust findings |
| PROC | 16 (PROC-16: regulator/law-enforcement requests) | 14, 18 `OPERATIONS_AND_SUPPORT_PROCESSES.md`, `INCIDENT_MANAGEMENT.md` | PROPOSED | Counsel owner not named (OPEN-X04) |
| TEST-SEC | 036..041 | 16 `TEST_CATALOG.md`, 14 | PROPOSED | Security tests |
| TEST-TEN | 008..013 | 16 `TEST_CATALOG.md` | PROPOSED | Tenancy tests |
| TEST-DEP | 009 | 16 `TEST_CATALOG.md` | PROPOSED | Deployment test |
| TEST-BIL | 010 | 16 `TEST_CATALOG.md` | PROPOSED | Billing test |
| TEST-REL | 014..016 | 16 `TEST_CATALOG.md` | PROPOSED | Reliability tests |
| TEST-AI | 001..006 | 16 `TEST_CATALOG.md` | PROPOSED | AI-gateway tests |
| audit.* events | 48 distinct dotted names found (for example `audit.auth.login_succeeded`, `audit.privacy.erasure_requested`, `audit.impersonation.started`) in 07, 14, 16, 18, 19 | 14 `SECURITY_ARCHITECTURE.md` and others | PROPOSED | The task brief said about 17 new events; the grep found 48 distinct names in total, so the new/old split is not verifiable here. A single event list is OPEN (see OPEN-X06 below). The EVENT_CATALOG / AsyncAPI do not yet list them |
| OPEN-X | X01..X05 | 14 `SECURITY_ARCHITECTURE.md` (table), cited in 16, 18 | OPEN | Device trust, cache staleness values, AI log retention, PROC-16 counsel owner, "view as user" |

### Known ID collisions and handling (2026-10-27)

| Collision | Resolution (no renumbering done) |
|---|---|
| `OPEN-UX-nn`, `OPEN-FE-nn`, `OPEN-B*`, `OPEN-CS-nn`, `OPEN-X0n` are separate namespaces from global `OPEN-NN` (01..52) | No numeric collision. All are now listed in one place: `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` section 6 (the single register). Earlier collision `SCENARIO_SIMULATIONS.md` OPEN-14 stays recorded in OPEN_DECISIONS section 1 |
| `D-01..D-05` (ADR decision records) vs `D-nn` in USER_JOURNEYS, ACTION_REGISTRY, NAVIGATION and the "gap closure D-01.." labels of LEGACY_MERGE_LEDGER_D | Qualify as `ADR-REG D-nn` in new text. Not renumbered, because the other uses are in files owned by other groups |
| `CSV-nn` vs the `.csv` file type | Always written with a numeric suffix; no action |
| `R3-n` (single digit, 1..10) vs sorting | Keep as is; cite as `R3-1` .. `R3-10` |
| OPEN numbering gap: `OPEN-01`, `02`, `04` reserved unused | Unchanged; still to be retired or assigned (see OPEN_DECISIONS) |
