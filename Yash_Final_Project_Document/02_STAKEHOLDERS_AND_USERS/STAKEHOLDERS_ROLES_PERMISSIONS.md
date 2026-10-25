# Stakeholders, Personas, Roles & Permission Matrix

Doc ID: USR-01 · Owner: Product Director + Security Architect · Version 1.0 · Status: Under Review · Relates: DOM-01, DOM-02, ADR-T07
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
Roles are **scoped grants**: `(principal, role, scope)` where scope ∈ {platform, org:<id>, institution:<id>, self}. A principal may hold several grants. Org roles: `org_owner`, `org_admin`, `recruiter`, `hiring_manager`, `viewer`. Institution roles: `inst_admin`, `faculty`, `proctor`. Platform roles: `moderator`, `support`, `admin`, `auditor`.

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

**Normative source:** this table is a summary. Where it differs from DT-01 (`06_BUSINESS_PROCESSES/DECISION_TABLES.md`), BR-T100/BR-T105 or INV-T41, those win; `packages/policy` holds the matrix as data derived from DT-01, and a negative-control test fails if INSTADM/FAC can read an individual evidence item (REVW-01).

Rules: deny by default (INV-T01); candidate **consent scopes** gate every recruiter read of evidence; support/admin access to personal data is **time-boxed, reason-coded, logged** (BR-T041). Referee permissions exist only as a single-use, expiring token bound to one request (INV-T05).

## 5. Capability endpoint
`GET /api/v1/me/capabilities` returns the evaluated permission set for the current principal/scope; UI uses it for visibility only, never enforcement (INV-T01).

## 6. Access reviews
Org owners review member roles quarterly (prompted); platform privileged roles reviewed monthly by Security; dormant privileged grants auto-expire after 60 days.
