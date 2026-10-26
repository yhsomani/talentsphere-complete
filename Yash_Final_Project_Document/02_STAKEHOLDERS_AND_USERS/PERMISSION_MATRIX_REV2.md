# Roles and Permission Matrix, Revision 2 (USR-01 REV2)

Doc ID: USR-01-R2 · Owner: Product Director + Security Architect · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-28 (and the role parts of REVW-01 residue, REVW-12) · Relates: USR-01 (`STAKEHOLDERS_ROLES_PERMISSIONS.md`), DT-01, BR-T100, BR-T105, INV-T41, ID_REGISTRY roles, OpenAPI `Grant.role`, FEAT-02-03, FEAT-02-06, SM-DSR

**Relationship (no original file was edited).** This file **supersedes, once accepted**, USR-01 section 3 (role model), the table in section 4 (the matrix), and the "Org members & roles" and "Data-rights requests" rows of that table, **only where they differ from the text below**. The normative note of USR-01 stands: DT-01, BR-T100, BR-T105 and INV-T41 win over this table, and `packages/policy` holds the matrix as data derived from DT-01. Personas and USR-01 sections 1, 2, 5 and 6 stand. Governance should link this file from `00_CONTROL_CENTRE/MASTER_INDEX.md`. All content **[TARGET]**.

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
