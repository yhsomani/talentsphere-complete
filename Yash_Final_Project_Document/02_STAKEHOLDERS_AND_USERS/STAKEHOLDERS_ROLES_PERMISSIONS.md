# Stakeholders, Personas, Roles & Permission Matrix

Doc ID: USR-01 · Owner: Product Director + Security Architect · Version 1.0 · Status: Under Review · Relates: DOM-01, DOM-02, ADR-T07

> **Revision 2 folded in (2026-10-27)** from `PERMISSION_MATRIX_REV2.md`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.
Personas below are **hypothetical** (no real research conducted) — validate via OPEN-07.

## 1. Stakeholder registry
| Stakeholder | Interest | Influence | Notes |
|---|---|---|---|
| Candidate/learner | Prove skills, get hired | High (supply side) | Dignity-first rules |
| Recruiter / hiring manager | Fast trustworthy screening | High (demand side) | Seat payer |
| Org admin | Control seats, policy, data | Medium | Tenant owner |
| Institution admin/faculty | Cohort outcomes | Medium | B2B2C |
| Instructor | Reach, income | Medium | Content supply |
| Referee | Attest work history cheaply | Low but critical | Non-account, tokenised |
| Moderator / support / admin | Safety, service | Internal | Least privilege, audited |
| Regulators / auditors | Compliance, fairness | External | Evidence on request |
| Payment/email/AI vendors | Integration | External | Port-isolated |

## 2. Personas (hypothetical)
- **P1 Asha, career-switcher (ROLE-CAND):** mobile-first, patchy data, needs proof beyond a bootcamp certificate.
- **P2 Marcus, recruiter (ROLE-REC):** 40 open reqs, wants an explained shortlist; desktop-first.
- **P3 Dr. Lin, faculty (ROLE-FAC):** wants cohort skill coverage without seeing private job-search data.
- **P4 Priya, referee (ROLE-REFEREE):** gets an emailed link on her phone; must finish in <3 minutes with no account.
- **P5 Sam, support operator (ROLE-SUP):** needs scoped, time-boxed access to a user's data with audit.

## 3. Role model
**[TARGET, OPEN-44]** Roles are proposed as scoped grants: `(principal, role, scope)` where scope ∈ {platform, org:<id>, institution:<id>, self}. A principal may hold several grants. Org roles: `org_owner`, `org_admin`, `recruiter`, `hiring_manager`, `viewer`. Institution roles: `inst_admin`, `faculty`, `proctor`. Platform roles: `moderator`, `support`, `admin`, `auditor`.

**Authority and implementation reconciliation:** root `SSOT.md` v6.0 §§5–7 specifies Tier-1 `ROLE_USER`, `ROLE_RECRUITER`, and `ROLE_ADMIN` plus 24 contextual roles and a resolution order. The inspected implementation instead defines a 10-value `Role` union in `packages/domain/src/core.ts`; it does not evidence the SSOT hierarchy or this target scoped-grant model. No owner-approved mapping between these models is recorded. The SSOT remains protected canonical intent; this scoped-grant design remains a proposal pending OPEN-44. Do not treat UI visibility or the role union alone as authorization evidence.

## 4. Permission matrix
Legend: C create · R read · U update · D delete/withdraw · A approve/act · `*` own only · `O` within own org/institution · `S` scoped, time-boxed, reason-coded, audited · `—` none. Columns: ANON, CAND, INST (instructor), REC, HM, ORGADM, INSTADM, FAC, MOD, SUP, ADM, AUD.

| Resource | ANON | CAND | INST | REC | HM | ORGADM | INSTADM | FAC | MOD | SUP | ADM | AUD |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Public profile (visible fields) | R | R | R | R | R | R | R | R | R | R | R | R |
| Own profile / portfolio | — | CRUD* | CRUD* | — | — | — | — | — | — | S(R) | S(R) | S(R) |
| Evidence items | — | CRUD* (cannot self-verify) | CRUD* | R (only with live consent scope, DT-01) | R (only with live consent scope, DT-01) | — (no individual evidence reads) | R aggregate only (k≥5) + institution-issued credential records (BR-T100) | R aggregate only (k≥5) + institution-issued credential records | R(flagged) | S(R) | S(R) | R |
| Verification actions | — | — | A (own course evidence) | — | — | — | A (institution credentials) | A | A (disputes) | — | A | R |
| Job postings | R (public) | R | R | CRU(O) | RU(O) | CRUD(O) | — | — | R, A(takedown) | R | R | R |
| Applications | — | CRU*, withdraw* | — | R (job team of that job), U stage | R, U stage (assigned job team) | R recruiter-activity metadata only; content only if on the job team (SPEC-G4) | — (BR-T105) | — (BR-T105) | R(flagged) | S(R) | S(R) | R |
| Messaging | — | CR (consented threads) | CR | CR (outreach quota) | CR | R(O) metadata | — | CR (cohort) | R(flagged) | S(R) | S(R) | — |
| Courses | R | R, enrol | CRUD* | — | — | — | CRUD(O) | R(O) | A(takedown) | R | CRUD | R |
| Assessments & attempts | — | CR* | R (own course) | — | — | — | R aggregate (k≥5); individual only for institution-run courses (BR-T100) | R aggregate (k≥5); individual only for institution-run courses | — | S(R) | R | R |
| Org members & roles | — | — | — | — | — | CRUD(O) | CRUD(inst) | — | — | S(R) | R | R |
| Billing / entitlements | — | R* | R* | — | — | CRU(O) | CRU(O) | — | — | S(R) | R | R |
| Audit log | — | R* (own access log) | — | — | — | R(O) | R(O) | — | — | S(R) | R | R |
| Feature flags / config | — | — | — | — | — | — | — | — | — | — | CRUD | R |
| Moderation queue | — | — | — | — | — | — | — | — | CRUD | R | CRUD | R |
| Data-rights requests | — | CR* | CR* | — | — | — (org-owned data via org settings, not personal DSR) | — | — | — | A (assist) | A | R |

**Normative target:** this table is a summary. Where it differs from DT-01 (`06_BUSINESS_PROCESSES/DECISION_TABLES.md`), BR-T100/BR-T105 or INV-T41, those target contracts govern after OPEN-44 is resolved. The target policy package is proposed to derive its matrix from DT-01; it is not present in the inspected workspace. A negative-control test is specified to fail if INSTADM/FAC can read an individual evidence item (REVW-01); test execution is not asserted here.

Rules: deny by default (INV-T01); candidate **consent scopes** gate every recruiter read of evidence; support/admin access to personal data is **time-boxed, reason-coded, logged** (BR-T041). Referee permissions exist only as a single-use, expiring token bound to one request (INV-T05).

## 5. Target capability endpoint
**[TARGET, OPEN-44; not observed as implemented]** `GET /api/v1/me/capabilities` is proposed to return the evaluated permission set for the current principal/scope; UI uses it for visibility only, never enforcement (INV-T01). A read-only inspection found no `packages/policy` directory or matching `/api/v1/me/capabilities` route in the inspected workspace. The endpoint and policy package are target requirements, not current implementation claims.

## 6. Access reviews
Org owners review member roles quarterly (prompted); platform privileged roles reviewed monthly by Security; dormant privileged grants auto-expire after 60 days.

# Revision 2 additions (folded 2026-10-27 from `PERMISSION_MATRIX_REV2.md`)

## 1. Role model: one mapping from grants to matrix columns

A grant is `(principal, role, scope)` with scope ∈ {platform, org:id, institution:id, self}. The matrix columns are the **role families** below. Every role named in the OpenAPI `Grant.role` enum or in the ID registry maps to exactly one column or is stated as absent.

| Grant role (API / registry) | Scope | Matrix column | Notes |
|---|---|---|---|
| `candidate` (ROLE-CAND) | self | CAND | |
| `instructor` (ROLE-INST) | self (own courses) | INST | |
| `org_owner` | org | ORGOWN (new column) | Everything ORGADM can do, plus ownership transfer, org closure, billing owner, grant and revoke of `org_admin` (FEAT-02-03, FEAT-02-08). At least one per org (last-owner rule) |
| `org_admin` (ROLE-ORGADM) | org | ORGADM | Members, roles other than owner, org settings, job templates, billing view; **no** candidate content unless also on the job team |
| `recruiter` (ROLE-REC) | org | REC | Jobs and applications of jobs where the principal is on the hiring team; search within consent; outreach within quota |
| `hiring_manager` (ROLE-HM) | org | HM | **Only jobs assigned to the principal's hiring team** (FEAT-02-06, DT-01 row 9) |
| `viewer` | org | VIEW (new column) | Read-only on jobs and pipeline counts of jobs on which the principal is placed; no candidate evidence or contact details; no messaging |
| `inst_admin` (ROLE-INSTADM) | institution | INSTADM | |
| `faculty` (ROLE-FAC) | institution (assigned cohorts) | FAC | |
| `proctor` | institution | PROCT (new column, Phase 4; absent from Phases 1 to 3) | Invigilation of institution-run assessments only (FEAT-18-10); no learner profile access |
| `moderator` (ROLE-MOD) | platform | MOD | |
| `support` (ROLE-SUP) | platform | SUP | |
| `admin` (ROLE-ADM) | platform | ADM | |
| `auditor` (ROLE-AUD) | platform | AUD | |
| ROLE-REFEREE | none: a single-use token bound to one request | **REFEREE (new column)** | No account and no grant; see section 3 |
| ROLE-MENTOR | self | **MENTOR (new column)** | Phase 4 (FEAT-08-11, FEAT-14-06); absent from Phases 1 to 3. No access to a learner's evidence unless the learner shares it through a consent scope |
| ROLE-SVC | platform or org (API key) | **SVC (new column)** | Phase 4 (FEAT-23-07). Scoped by key; no access to personal data unless the key's scope names it and the subject consented; never a human actor for U6 |

## 2. Matrix additions and corrections

Legend as USR-01: C create · R read · U update · D delete/withdraw · A approve/act · `*` own only · `O` within own org/institution · `S` scoped, time-boxed, reason-coded, audited · `—` none · `T` job team of that job only · `H` assigned hiring-team jobs only.

### 2.1 Corrected cells (existing columns)

| Resource | Column | USR-01 now | REV2 | Why |
|---|---|---|---|---|
| Job postings | HM | `RU(O)` | **`R, U (H)`** — read and update only jobs assigned to the principal; no read of other org postings | FEAT-02-06, DT-01 row 9 |
| Job postings | REC | `CRU(O)` | `CRU (O)`; publish needs `job:publish` and passes DT-12 | unchanged meaning, stated |
| Data-rights requests | ORGADM | `— (org-owned data via org settings, not personal DSR)` | **`— (cannot file or act on an employee's personal request; the requester must be the subject, SM-DSR t1; org-owned data via org settings)`** | REVW-28 reported "A(O employees)" for this cell; the current USR-01 text is already `—`. This row keeps `—` and records the reason |
| Org members & roles | ORGADM | `CRUD(O)` | `CRUD(O) for roles below org_owner; cannot create, demote or remove an org_owner` | `org_owner` and `org_admin` differ (FEAT-02-03.1) |
| Billing / entitlements | ORGADM | `CRU(O)` | `R(O); CRU only if also org_owner` | Billing owner is the owner |
| Applications | HM | `R, U stage (assigned job team)` | unchanged; stated as `H` | |
| Verification actions | INST | `A (own course evidence)` | **`A (own course evidence, issuer_class instructor only; never platform-verified; instructor ≠ learner; BR-T119)`** | REVW-12 |
| Evidence items | INST | `CRUD*` | unchanged for own evidence; **instructor cannot read learner evidence except within their own course (completion record)** | |

### 2.2 New columns

| Resource | ORGOWN | VIEW | REFEREE | MENTOR | SVC | PROCT |
|---|---|---|---|---|---|---|
| Public profile (visible fields) | R | R | R (request prompt only, not browsing) | R | R (public fields) | — |
| Own profile / portfolio | — | — | — | CRUD* | — | — |
| Evidence items | — (no individual evidence reads) | — | — | — (only via a consent scope granted by the learner) | — | — |
| Verification actions | — | — | **A (submit one response for one request; token valid, unused, referee ≠ candidate)** | — | — | — |
| Job postings | CRUD(O) | R (T, read-only) | — | R | R (key scope) | — |
| Applications | R recruiter-activity metadata only; content only if on the job team | R counts only (T) | — | — | — | — |
| Messaging | R(O) metadata | — | — | CR (own mentoring threads, Phase 4) | — | — |
| Courses | — | — | — | R | R (key scope) | — |
| Assessments & attempts | — | — | — | — | — | A (invigilate institution-run attempts, Phase 4) |
| Org members & roles | CRUD(O) incl. `org_admin` and `org_owner` | R (O, names only) | — | — | — | — |
| Billing / entitlements | CRU(O) | — | — | — | — | — |
| Audit log | R(O) | — | — | — | — | — |
| Data-rights requests | — | — | — | CR* | — | — |
| Moderation queue, feature flags | — | — | — | — | — | — |

## 3. Referee: why a column and not a role grant

A referee has no account and no grant. The only permission is the single-use, expiring token (INV-T05, INV-T24): read the request prompt (claim title, employer, dates, candidate name), submit exactly one response, and nothing else. The REFEREE column makes that explicit so that policy tests cover it: every other action returns `403`/`404` for a request authenticated by a referee token, and a token for request A never opens request B (INV-T02).

## 4. Roles intentionally absent

| Role | Stated reason |
|---|---|
| `proctor`, `mentor`, `svc` in Phases 1 to 3 | Their features are Phase 4 (PCAP-01); their columns are defined now so the policy matrix is complete, and every cell is denied until the owning feature ships (deny by default, INV-T01) |
| An "impersonation" role | Removed on principle (FEAT-20-07) |

## 5. Tests the matrix must generate (additions to the WP-POLICY-CORE definition of done)

1. For every column and resource, one allow or deny test derived from DT-01 and this table (negative controls included).
2. `viewer` cannot read candidate evidence, contact details or messages (AC-02-03-51).
3. `org_admin` cannot create or demote an `org_owner`; the last owner cannot be removed (AC-02-03.1-01).
4. A hiring manager outside the job team gets `403` on the application (DT-01 row 9).
5. A referee token authenticates nothing outside its request (AC-06-02-*).
6. Instructor sign-off cannot target the instructor's own account (AC-05-04-53).
