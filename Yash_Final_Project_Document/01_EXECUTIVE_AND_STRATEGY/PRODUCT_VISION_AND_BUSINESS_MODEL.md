# Product Vision, Business Model & Success Measures

Doc ID: STR-01 · Owner: CPO · Version 1.0 · Status: Under Review · Relates: GOAL-01…GOAL-08, ADR-T01

> **Revision 2 folded in (2026-10-27)** from `PRODUCT_VISION_GOALS_REV2.md`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.

## 1. Problem (first principles)
Hiring and career progression run on **claims** (résumés, profiles, certificates) that are expensive to check. Candidates cannot cheaply prove skill or work history; recruiters cannot cheaply trust it; learners get credentials that do not translate to outcomes; institutions cannot show what graduates can do. The cost sits in screening time, bad hires, and unfair filtering.

## 2. Vision [TARGET]
One ecosystem where a person's skills and work history are **backed by evidence of graded strength**, and every step — learn, prove, showcase, match, apply, hire, grow — consumes and produces that evidence. The product's durable asset is the connected **Talent Graph + Evidence Graph**: capabilities, goals, experience, proof, learning, opportunities, and outcomes remain attributable and user-controlled. This preserves the root SSOT's product framing while leaving detailed model boundaries to the domain and data specifications.

Loop: **Learn → Prove → Showcase → Match → Apply → Hire → Grow → (Learn)**.

## 3. Goals (GOAL)
| ID | Goal | Measure |
|---|---|---|
| GOAL-01 | Candidates can prove skills with graded, auditable evidence | % active candidates with ≥3 evidence items at rung ≥ artifact-backed |
| GOAL-02 | Recruiters screen faster using trustworthy signals | median time-to-shortlist; shortlist-to-interview rate |
| GOAL-03 | Matching is explainable and fair | 100% of matches show rationale; adverse-impact audit passes quarterly |
| GOAL-04 | Learning converts to evidence and outcomes | course-completion→evidence rate; learning-to-interview rate |
| GOAL-05 | Institutions graduate learners into the career loop | graduating-cohort activation rate |
| GOAL-06 | Platform is secure, private, accessible | zero cross-tenant incidents; WCAG 2.2 AA audit pass |
| GOAL-07 | Business is sustainable | gross margin ≥ target (OPEN-05), AI cost/MAU within budget |
| GOAL-08 | Product degrades gracefully | availability and per-remote fault containment targets met (see 15_*) |

## 4. Customer segments
1. **Candidates/learners** (free core; paid premium tools) — primary value creators.
2. **Employers** (recruiters, hiring managers): subscription per seat + job-slot tiers.
3. **Institutions** (universities, bootcamps): seat licensing + analytics.
4. **Instructors/content creators**: revenue share on paid courses [OPEN-06].
5. **Referees/verifiers**: non-paying, tokenised participants (critical for trust).

## 5. Business model [TARGET, prices OPEN]
| Stream | Payer | Mechanism | Guardrail |
|---|---|---|---|
| Employer subscription | Org | Seats + active-job tiers + verified-search quota | Never pay-to-rank candidates (ADR-T22) |
| Candidate premium | Candidate | Advanced analytics, extra resume variants, AI quota | Core evidence, applying and messaging always free |
| Institution licence | Institution | Seat licence + cohort analytics | Learner owns career identity after graduation |
| Course commerce | Learner | One-off / path purchase; platform fee | Refund + dispute process required |
| Verification services (later) | Org | Bulk employment verification | Consent-bound |

Free users never trigger paid AI inference unless an explicit budget policy allows (INV-T07).

## 6. Positioning & boundaries
In scope: evidence, credentials, learning, assessment, jobs, ATS, matching, career intelligence, messaging, institutional workspace.
Out of scope: generic social-media clone, ad network, payroll/HRIS, crypto/blockchain credentials, autonomous hiring decisions, runtime dependency on competitor platforms (import adapters only).

## 7. Product constitution (must-never list)
- Never present an unverified claim as verified.
- Never make an autonomous adverse decision about a person (reject, rank-out, flag) without human review.
- Never let AI output become evidence.
- Never expose a person's data across tenants or beyond consent.
- Never rank by payment.
- Never require native install to use core functions.

**Design principles retained from the root SSOT as target guidance:** progressive disclosure; one shared semantic model; observable behavior; accessibility by default; simplicity before scale; evidence over popularity; contextual rather than universal reputation; and no deterministic career promises. These are design principles, not measured outcomes or implementation claims.

## 8. Success measures (definitions in `20_ANALYTICS_AND_MEASUREMENT`)
Activation (first evidence item within 7 days), evidence quality, qualified applications, interview rate, hire rate, retention (W4/W12), employer time-to-shortlist, support tickets per 1k MAU, AI cost per MAU, availability, accessibility defects.

## 9. Strategic risks (excerpt; full register in 24_*)
Cold-start (two-sided marketplace), referee non-response, evidence gaming, AI cost overrun, regulatory exposure for automated employment decisions, over-scoped feature surface.
Mitigations: seed with institutions, tokenised referee UX, anomaly≠guilt human review, budgets, human-in-the-loop, ADR-T01 scope discipline.

# Revision 2 additions (folded 2026-10-27 from `PRODUCT_VISION_GOALS_REV2.md`)

## Consequential wording changes

| Where | Old wording | New wording |
|---|---|---|
| GOAL-03 | "100% of matches show rationale; adverse-impact audit passes quarterly" | Explanation coverage target 100% as a design target; a quarterly review is held and its result recorded; threshold set with counsel; "passes" retired |
| GOAL-06 | "zero cross-tenant incidents; WCAG 2.2 AA audit pass" | Zero confirmed exposures as a target and outcome measure; target conformance to WCAG 2.2 AA with an independent audit pending (OPEN-37) |
| MET-013 | "100% by design" | "Design target 100%; measures coverage, not compliance" (owner of folder 20 to adopt) |
| STR-01 / GOAL-02 | "shortlist-to-interview rate" | "share of applications reaching `interviewing`" (the advisory view is "Suggested order", never "shortlist", BR-T072) |

## Open items

| Item | Question | Owner |
|---|---|---|
| Active-candidate definition | Window and activity rule for GOAL-01 | Trust PM |
| Review threshold for GOAL-03(b) | Value and method, with counsel (OPEN-08) | Responsible-AI Lead |
| Pilot baselines | When the Phase 1 pilot produces first values for GOAL-01, 02, 04, 05 | Program Director |
