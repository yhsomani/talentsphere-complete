# Target blueprint 01: Executive And Strategy

> **Status.** Archive: proposal, not ratified. A greenfield redesign blueprint written in October 2026. Every area was Draft, Under Review or Revision Required (its own document status) and no test was run against it. Its content was mined into `docs/blueprint/`; `SSOT.md` remains the source of intent. Module federation described here was not adopted: the built system is a modular monolith (`ARCHITECTURE.md`).
>
> **What this file holds.** All files of the former `Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/` folder, in order.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

| Section | Former file |
|---|---|
| Legacy Product Requirements (prior PRD v6.0) merged into the target strategy | `Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/LEGACY_PRD_PRODUCT_REQUIREMENTS.md` |
| Product Vision, Business Model & Success Measures | `Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_AND_BUSINESS_MODEL.md` |
| Product Vision, Goals Revision 2 (STR-01 REV2: goal wording and thresholds) | `Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_GOALS_REV2.md` |

## Legacy Product Requirements (prior PRD v6.0) merged into the target strategy

_Former file: `Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/LEGACY_PRD_PRODUCT_REQUIREMENTS.md`._

Doc ID: STR-LEG-01 · Owner: CPO (with Product Director) · Version 1.0 · Status: Draft for Review · Relates: `PRODUCT_VISION_AND_BUSINESS_MODEL.md` (STR-01, GOAL-01..08), `PRODUCT_VISION_AND_BUSINESS_MODEL.md#record-product-vision-goals-rev2`, `../20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md` (OPEN-51), `../03_BUSINESS_DOMAINS/LEGACY_BRAIN_CONCEPTUAL_MODEL.md`, `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

### Merged from legacy: `31_LEGACY_ARCHIVE/docs/product/PRD.md` (v6.0)

### 0. Frame

**Nothing is implemented.** The prior PRD described a career platform for a prior attempt; it pointed to a root SSOT for system rules and to a feature registry for the 173 features. Everything below is a **requirement candidate carried forward**; where it differs from `PRODUCT_VISION_AND_BUSINESS_MODEL.md` both versions are kept and the difference is registered in section 10.

### 1. Product definition (legacy)

TalentSphere is a **PWA-first Career Operating System** centred on a **Talent Graph and Evidence Graph**. Its purpose is to connect career goals, learning, proof, verification, opportunities, hiring and outcomes.

#### North-star loop (legacy wording, 12 stages)

```text
GOAL -> GAP -> LEARN -> PRACTICE -> PROVE -> VERIFY
-> DISCOVER -> MATCH -> APPLY -> INTERVIEW -> OUTCOME
-> NEW EVIDENCE -> NEXT ACTION
```

Target loop (`PRODUCT_VISION_AND_BUSINESS_MODEL.md` section 2): Learn, Prove, Showcase, Match, Apply, Hire, Grow, back to Learn. Approximate alignment: GOAL/GAP/LEARN/PRACTICE map to Learn; PROVE/VERIFY to Prove and Showcase; DISCOVER/MATCH to Match; APPLY/INTERVIEW/OUTCOME to Apply and Hire; NEW EVIDENCE/NEXT ACTION to Grow. The legacy loop makes **goal and gap analysis explicit first steps** and **outcome feedback** an explicit last step; the target loop has no named Goal or Gap stage. Decision: OPEN-LGA-09.

### 2. Problem (legacy)

Career information is fragmented across profiles, learning systems, job boards, assessments, portfolios, networking tools and employer workflows. Users repeatedly translate the same experience into claims without a unified evidence trail. TalentSphere treats evidence and outcomes as first-class objects. (Compare target problem statement in STR-01 section 1: claims are expensive to check; same direction.)

### 3. Target users (legacy list)

Candidate/learner, career switcher, professional, recruiter, hiring manager, employer admin, instructor/course author, institution admin/faculty, mentor/expert, moderator, verification operator, support, finance, platform admin (14 roles). Target customer segments are in STR-01 section 4 (5 segments); target roles in `../02_STAKEHOLDERS_AND_USERS/STAKEHOLDERS_ROLES_PERMISSIONS.md`. Legacy "career switcher", "mentor/expert", "finance" and "verification operator" have no dedicated target segment row; see OPEN-LGA-08.

### 4. Core jobs-to-be-done (legacy; carried over)

| Persona     | Job                                                         |
| ----------- | ----------------------------------------------------------- |
| Candidate   | Understand readiness for a goal.                            |
| Candidate   | Identify gaps.                                              |
| Candidate   | Learn what matters.                                         |
| Candidate   | Produce evidence.                                           |
| Candidate   | Discover relevant opportunities.                            |
| Candidate   | Apply with stronger proof.                                  |
| Candidate   | Learn from outcomes.                                        |
| Recruiter   | Find candidates using relevant capability/evidence signals. |
| Recruiter   | Understand why a candidate matches.                         |
| Recruiter   | Communicate, interview and decide efficiently.              |
| Recruiter   | Preserve an auditable hiring workflow.                      |
| Instructor  | Deliver learning.                                           |
| Instructor  | Assess progress.                                            |
| Instructor  | Generate trustworthy achievement evidence.                  |
| Institution | Manage cohorts and permissions.                             |
| Institution | Connect learning outcomes to employability.                 |
| Institution | Preserve learner privacy and lifecycle.                     |

Target comparison: GOAL-01..GOAL-06 cover candidate evidence, recruiter speed, fairness, learning conversion and institution graduation; the legacy candidate jobs "understand readiness", "identify gaps" and "learn from outcomes" are covered functionally by UJ-07 and legacy J-06 / J-26 but are not stated as measurable goals.

### 5. Value proposition (legacy)

The strongest product promise is not "more features". It is **a coherent evidence-backed career loop** where every meaningful action can improve future career decisions.

### 6. Goals (legacy, 6) and target mapping

| #   | Legacy goal                                                         | Nearest target goal                                                      |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | Create a trusted career identity.                                   | GOAL-01                                                                  |
| 2   | Turn activity into attributable evidence.                           | GOAL-01                                                                  |
| 3   | Connect learning to opportunities.                                  | GOAL-04                                                                  |
| 4   | Improve the quality and explainability of matching.                 | GOAL-03                                                                  |
| 5   | Close the feedback loop from application outcomes to future action. | none explicit (see legacy J-02, feature F-122 Application Feedback Loop) |
| 6   | Preserve privacy and human control.                                 | GOAL-06 (security, privacy, accessibility)                               |

Target GOAL-02 (recruiter speed), GOAL-05 (institutions), GOAL-07 (sustainability) and GOAL-08 (graceful degradation) have no legacy counterpart. Legacy goal 5 has no explicit target goal (OPEN-LGA-09).

### 7. Non-goals (legacy; carried over)

- General social-media clone.
- General HR/payroll suite.
- Autonomous hiring engine.
- Guaranteed jobs or salary outcomes.
- General non-career services marketplace.
- Hardware/OS platform.
- Mandatory dependency on LinkedIn, Udemy, Coursera, Glassdoor or HackerRank.

Target comparison (STR-01 section 6 out-of-scope): social-media clone, ad network, payroll/HRIS, crypto/blockchain credentials, autonomous hiring decisions, runtime dependency on competitor platforms. Differences: the target adds **ad network** and **crypto/blockchain credentials**; the legacy adds **guaranteed jobs or salary outcomes**, **non-career services marketplace** and **hardware/OS platform**. Note the legacy registry itself contained "OS Shell and Workbench" (F-48) and "Automation and Agents" (F-49) at low priority (P=4), which sits uneasily with "hardware/OS platform" as a non-goal (OS here means an in-app workbench). All non-goals from both lists should be kept (OPEN-LGA-09).

### 8. GA scope (legacy; carried over)

GA requires the platform foundations plus a **complete trusted career loop**. The 173-feature portfolio is **not** a requirement to ship all 173 features before validating the core product.

```text
Identity
-> Profile + Goals
-> Skills + Evidence
-> Learning
-> Assessment/Practice
-> Portfolio/Proof
-> Jobs
-> Applications
-> Recruiter Review
-> Communication
-> Outcome
-> Career Graph
```

Target comparison: roadmap Phase 2 is the "complete-loop GA candidate" (`../22_IMPLEMENTATION_ROADMAP/ROADMAP.md` section 5.3). The legacy GA path includes **Learning, Assessment/Practice and Career Graph** inside GA; confirm these are inside target Phase 2 or explicitly deferred (OPEN-LGA-09).

### 9. Product metrics (legacy; carried over)

| Class      | Metrics                                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primary    | **Verifiable Career Progress**                                                                                                                                                                               |
| Supporting | activation; goal creation; skill coverage; evidence creation; verified evidence; learning completion; assessment improvement; qualified applications; interviews; offers; hires; outcome feedback; retention |
| Business   | paid conversion; recurring revenue; gross margin; infrastructure cost; AI cost by capability; enterprise expansion; support burden                                                                           |

Conflict (already registered as **OPEN-51**): the target north star is Evidence-Backed Hiring Conversations per week (MET-001); the legacy primary metric is Verifiable Career Progress, which has no formula in the legacy PRD. Neither is approved. The supporting and business lists above are mostly present as MET-* entries; legacy items **goal creation, skill coverage, assessment improvement, offers, outcome feedback and enterprise expansion** should be checked against `METRICS_CATALOG.md` (OPEN-LGA-10). Reading `METRICS_CATALOG.md` MET-001..MET-055 at merge time: activation (MET-002), verified evidence (MET-004, MET-005), learning completion (MET-017), qualified applications (MET-009), interviews (MET-011), hires (MET-012), retention (MET-022, MET-023), paid conversion, recurring revenue, gross margin, infra cost, AI cost and support burden (MET-026..MET-030, MET-033) have counterparts; **no dedicated metric was found for goal creation, skill coverage, offers extended/accepted, outcome-feedback delivery, or enterprise expansion** (MET-031 net revenue retention is the nearest).

### 10. Product rules (legacy; carried over)

1. Evidence is stronger than unsupported self-claims.
2. Matching is explainable.
3. AI is governed.
4. Assessment AI restrictions are enforceable server-side.
5. Free users do not create unplanned paid AI cost.
6. Privacy is purpose-bound.
7. Popularity is not professional credibility.
8. Anomalies require review, not automatic guilt.

Target alignment: 1 (evidence ladder), 2 (GOAL-03), 3 and 4 (AI policy; ADR-T13 / INV-T09), 5 (INV-T07), 6 (consent scopes, INV-T15), 8 (product constitution: no autonomous adverse decision). Rule 7 "Popularity is not professional credibility" has no named target invariant; it maps to the legacy reputation rules BR-164..BR-168 (reputation derived, skill-specific, time-decayed) and the prior design principle "evidence over popularity" that the target already retains in STR-01 section 7.

### 11. Feature portfolio and acceptance (legacy)

- The canonical 173-feature register and status/dependency metadata lived in the feature registry; feature-specific contracts lived with feature/domain artifacts. See `../04_PRODUCT_CAPABILITIES/LEGACY_FEATURE_REGISTRY_F01_F173.md`.
- Product acceptance: see `../05_FEATURE_SPECIFICATIONS/LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md` section 3.

### 12. Open items raised here

| ID          | Item                                                                                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OPEN-LGA-08 | Reconcile legacy 14 user roles / 19 personas with target segments and roles.                                                                                   |
| OPEN-LGA-09 | Decide whether the legacy 13-stage loop, 6 goals, non-goals and GA path add anything to STR-01 (explicit Goal/Gap stage; feedback-loop goal; extra non-goals). |
| OPEN-LGA-10 | Check legacy supporting/business metrics against `METRICS_CATALOG.md`; add the missing ones or record why not.                                                 |
| OPEN-51     | Primary north-star metric (existing).                                                                                                                          |

## Product Vision, Business Model & Success Measures

_Former file: `Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_AND_BUSINESS_MODEL.md`._

Doc ID: STR-01 · Owner: CPO · Version 1.0 · Status: Under Review · Relates: GOAL-01…GOAL-08, ADR-T01

> **Revision 2 folded in (2026-10-27)** from `PRODUCT_VISION_AND_BUSINESS_MODEL.md#record-product-vision-goals-rev2`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.

### 1. Problem (first principles)

Hiring and career progression run on **claims** (résumés, profiles, certificates) that are expensive to check. Candidates cannot cheaply prove skill or work history; recruiters cannot cheaply trust it; learners get credentials that do not translate to outcomes; institutions cannot show what graduates can do. The cost sits in screening time, bad hires, and unfair filtering.

### 2. Vision [TARGET]

One ecosystem where a person's skills and work history are **backed by evidence of graded strength**, and every step — learn, prove, showcase, match, apply, hire, grow — consumes and produces that evidence. The product's durable asset is the connected **Talent Graph + Evidence Graph**: capabilities, goals, experience, proof, learning, opportunities, and outcomes remain attributable and user-controlled. This preserves the root SSOT's product framing while leaving detailed model boundaries to the domain and data specifications.

Loop: **Learn → Prove → Showcase → Match → Apply → Hire → Grow → (Learn)**.

### 3. Goals (GOAL)

| ID      | Goal                                                        | Measure                                                               |
| ------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| GOAL-01 | Candidates can prove skills with graded, auditable evidence | % active candidates with ≥3 evidence items at rung ≥ artifact-backed  |
| GOAL-02 | Recruiters screen faster using trustworthy signals          | median time-to-shortlist; shortlist-to-interview rate                 |
| GOAL-03 | Matching is explainable and fair                            | 100% of matches show rationale; adverse-impact audit passes quarterly |
| GOAL-04 | Learning converts to evidence and outcomes                  | course-completion→evidence rate; learning-to-interview rate           |
| GOAL-05 | Institutions graduate learners into the career loop         | graduating-cohort activation rate                                     |
| GOAL-06 | Platform is secure, private, accessible                     | zero cross-tenant incidents; WCAG 2.2 AA audit pass                   |
| GOAL-07 | Business is sustainable                                     | gross margin ≥ target (OPEN-05), AI cost/MAU within budget            |
| GOAL-08 | Product degrades gracefully                                 | availability and per-remote fault containment targets met (see 15_*)  |

### 4. Customer segments

1. **Candidates/learners** (free core; paid premium tools) — primary value creators.
2. **Employers** (recruiters, hiring managers): subscription per seat + job-slot tiers.
3. **Institutions** (universities, bootcamps): seat licensing + analytics.
4. **Instructors/content creators**: revenue share on paid courses [OPEN-06].
5. **Referees/verifiers**: non-paying, tokenised participants (critical for trust).

### 5. Business model [TARGET, prices OPEN]

| Stream                        | Payer       | Mechanism                                           | Guardrail                                         |
| ----------------------------- | ----------- | --------------------------------------------------- | ------------------------------------------------- |
| Employer subscription         | Org         | Seats + active-job tiers + verified-search quota    | Never pay-to-rank candidates (ADR-T22)            |
| Candidate premium             | Candidate   | Advanced analytics, extra resume variants, AI quota | Core evidence, applying and messaging always free |
| Institution licence           | Institution | Seat licence + cohort analytics                     | Learner owns career identity after graduation     |
| Course commerce               | Learner     | One-off / path purchase; platform fee               | Refund + dispute process required                 |
| Verification services (later) | Org         | Bulk employment verification                        | Consent-bound                                     |

Free users never trigger paid AI inference unless an explicit budget policy allows (INV-T07).

### 6. Positioning & boundaries

In scope: evidence, credentials, learning, assessment, jobs, ATS, matching, career intelligence, messaging, institutional workspace.
Out of scope: generic social-media clone, ad network, payroll/HRIS, crypto/blockchain credentials, autonomous hiring decisions, runtime dependency on competitor platforms (import adapters only).

### 7. Product constitution (must-never list)

- Never present an unverified claim as verified.
- Never make an autonomous adverse decision about a person (reject, rank-out, flag) without human review.
- Never let AI output become evidence.
- Never expose a person's data across tenants or beyond consent.
- Never rank by payment.
- Never require native install to use core functions.

**Design principles retained from the root SSOT as target guidance:** progressive disclosure; one shared semantic model; observable behavior; accessibility by default; simplicity before scale; evidence over popularity; contextual rather than universal reputation; and no deterministic career promises. These are design principles, not measured outcomes or implementation claims.

### 8. Success measures (definitions in `20_ANALYTICS_AND_MEASUREMENT`)

Activation (first evidence item within 7 days), evidence quality, qualified applications, interview rate, hire rate, retention (W4/W12), employer time-to-shortlist, support tickets per 1k MAU, AI cost per MAU, availability, accessibility defects.

### 9. Strategic risks (excerpt; full register in 24_*)

Cold-start (two-sided marketplace), referee non-response, evidence gaming, AI cost overrun, regulatory exposure for automated employment decisions, over-scoped feature surface.
Mitigations: seed with institutions, tokenised referee UX, anomaly≠guilt human review, budgets, human-in-the-loop, ADR-T01 scope discipline.

## Revision 2 additions (folded 2026-10-27 from `PRODUCT_VISION_AND_BUSINESS_MODEL.md#record-product-vision-goals-rev2`)

### Consequential wording changes

| Where            | Old wording                                                             | New wording                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| GOAL-03          | "100% of matches show rationale; adverse-impact audit passes quarterly" | Explanation coverage target 100% as a design target; a quarterly review is held and its result recorded; threshold set with counsel; "passes" retired |
| GOAL-06          | "zero cross-tenant incidents; WCAG 2.2 AA audit pass"                   | Zero confirmed exposures as a target and outcome measure; target conformance to WCAG 2.2 AA with an independent audit pending (OPEN-37)               |
| MET-013          | "100% by design"                                                        | "Design target 100%; measures coverage, not compliance" (owner of folder 20 to adopt)                                                                 |
| STR-01 / GOAL-02 | "shortlist-to-interview rate"                                           | "share of applications reaching `interviewing`" (the advisory view is "Suggested order", never "shortlist", BR-T072)                                  |

### Open items

| Item                            | Question                                                             | Owner               |
| ------------------------------- | -------------------------------------------------------------------- | ------------------- |
| Active-candidate definition     | Window and activity rule for GOAL-01                                 | Trust PM            |
| Review threshold for GOAL-03(b) | Value and method, with counsel (OPEN-08)                             | Responsible-AI Lead |
| Pilot baselines                 | When the Phase 1 pilot produces first values for GOAL-01, 02, 04, 05 | Program Director    |

---

<a id="record-product-vision-goals-rev2"></a>

### Preserved source record: PRODUCT_VISION_GOALS_REV2

> Consolidated on 2026-10-27. The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. Approval conditions and authority remain unchanged: this move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_GOALS_REV2.md -->

<a id="record-product-vision-goals-rev2--product-vision-goals-revision-2-str-01-rev2-goal-wording-and-thresholds"></a>

## Product Vision, Goals Revision 2 (STR-01 REV2: goal wording and thresholds)

Doc ID: STR-01-R2 · Owner: CPO · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-39 · Relates: STR-01 (`PRODUCT_VISION_AND_BUSINESS_MODEL.md` section 3), MET-013, MET-014, BR-T077, BR-T126, OPS-SLO, OPEN-05, OPEN-08, OPEN-37

> **Folded into `PRODUCT_VISION_AND_BUSINESS_MODEL.md` on 2026-10-27.** Change record only; edit the original.

**Relationship (no original file was edited).** This file **supersedes, once accepted**, the "Measure" column of the GOAL table in section 3 of `PRODUCT_VISION_AND_BUSINESS_MODEL.md` (and the "target 100% by design" wording of MET-013 in the analytics catalogue, which is outside this review's folders). The goal statements themselves, the vision, segments and business model stand. Folder 01 was not assigned to this fix pass's owner list; this file is written there because REVW-39 targets it, and the folder owner should confirm. Governance should link it from `00_CONTROL_CENTRE/MASTER_INDEX.md`.

Reading rule for this table: a **target** is a value the product aims for and measures. It is not a statement that a legal, regulatory or audit standard is met, and it is not a claim that any feature exists. A target without a value is marked **[OPEN]** with an owner; it becomes a commitment only after the baseline of WP-LOADBASE or the pilot has produced a number.

| ID      | Goal (unchanged)                                            | Measure and target (replaces the old "Measure" cell)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Value status                                                                    |
| ------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| GOAL-01 | Candidates can prove skills with graded, auditable evidence | Share of **active candidates** (defined: signed in within 30 days **[OPEN]**) holding at least 3 evidence items at rung `artifact_backed` or higher. Target value after the pilot baseline                                                                                                                                                                                                                                                                                                                                                                                     | Value [OPEN], owner Trust PM                                                    |
| GOAL-02 | Recruiters screen faster using trustworthy signals          | Median time from application `submitted` to first human review (`in_review`); share of applications that reach `interviewing`. Target values after the pilot baseline                                                                                                                                                                                                                                                                                                                                                                                                          | Values [OPEN], owner Hiring PM                                                  |
| GOAL-03 | Matching is explainable and fair                            | (a) **Explanation coverage**: every match result shown carries its rationale and uncertainty (MET-013). The design target is 100% and any shown result without a rationale is a defect, not a compliance statement. (b) **Quarterly adverse-impact review**: the review runs on voluntarily supplied audit-only attributes, ROLE-AUD records the result, and a ratio below the review threshold opens a human review (BR-T077, MET-014). The threshold value is set with counsel or an advisor and is not asserted here. "Passes" does not mean legal or regulatory compliance | (a) target set; (b) threshold [OPEN-08], owner Responsible-AI Lead              |
| GOAL-04 | Learning converts to evidence and outcomes                  | Course-completion-to-evidence rate; learning-to-interview rate. Target values after the pilot baseline                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Values [OPEN], owner Learning PM                                                |
| GOAL-05 | Institutions graduate learners into the career loop         | Graduating-cohort activation rate (learners who keep an active account within 30 days of graduation, k ≥ 5 cohorts only, BR-T100)                                                                                                                                                                                                                                                                                                                                                                                                                                              | Value [OPEN], owner Institutions PM                                             |
| GOAL-06 | Platform is secure, private, accessible                     | (a) **Confirmed cross-tenant data exposures: target zero**, measured through the incident register and the cross-tenant canary suite (FF-05) staying green. Zero incidents is a target and an outcome measure; it does not prove absence of defects. (b) **Accessibility**: target conformance to WCAG 2.2 AA for the core flows; an independent audit is scheduled (OPEN-37). No conformance is claimed until an audit report exists                                                                                                                                          | (a) target set; (b) audit [OPEN-37], owner Security Lead and Design System Lead |
| GOAL-07 | Business is sustainable                                     | Gross margin at or above the target of OPEN-05; AI cost per monthly active user within the budget policy. No number exists yet; the cost-envelope structure (REVW-16) must be filled with vendor quotes before Phase 0 exit                                                                                                                                                                                                                                                                                                                                                    | Values [OPEN-05], owner Finance Lead                                            |
| GOAL-08 | Product degrades gracefully                                 | Availability and fault-containment targets of OPS-SLO, each labelled a hypothesis until WP-LOADBASE produces a baseline (OPEN-15); a published target becomes a commitment only after calibration                                                                                                                                                                                                                                                                                                                                                                              | Values calibrated after WP-LOADBASE, owner SRE Lead                             |

<a id="record-product-vision-goals-rev2--consequential-wording-changes"></a>

### Consequential wording changes

| Where            | Old wording                                                             | New wording                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| GOAL-03          | "100% of matches show rationale; adverse-impact audit passes quarterly" | Explanation coverage target 100% as a design target; a quarterly review is held and its result recorded; threshold set with counsel; "passes" retired |
| GOAL-06          | "zero cross-tenant incidents; WCAG 2.2 AA audit pass"                   | Zero confirmed exposures as a target and outcome measure; target conformance to WCAG 2.2 AA with an independent audit pending (OPEN-37)               |
| MET-013          | "100% by design"                                                        | "Design target 100%; measures coverage, not compliance" (owner of folder 20 to adopt)                                                                 |
| STR-01 / GOAL-02 | "shortlist-to-interview rate"                                           | "share of applications reaching `interviewing`" (the advisory view is "Suggested order", never "shortlist", BR-T072)                                  |

<a id="record-product-vision-goals-rev2--open-items"></a>

### Open items

| Item                            | Question                                                             | Owner               |
| ------------------------------- | -------------------------------------------------------------------- | ------------------- |
| Active-candidate definition     | Window and activity rule for GOAL-01                                 | Trust PM            |
| Review threshold for GOAL-03(b) | Value and method, with counsel (OPEN-08)                             | Responsible-AI Lead |
| Pilot baselines                 | When the Phase 1 pilot produces first values for GOAL-01, 02, 04, 05 | Program Director    |

<!-- source-record-end: Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_GOALS_REV2.md -->

## Change record: Product Vision, Goals Revision 2 (STR-01 REV2: goal wording and thresholds)

_Former file: `Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_GOALS_REV2.md`._

Doc ID: STR-01-R2 · Owner: CPO · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-39 · Relates: STR-01 (`PRODUCT_VISION_AND_BUSINESS_MODEL.md` section 3), MET-013, MET-014, BR-T077, BR-T126, OPS-SLO, OPEN-05, OPEN-08, OPEN-37

**Relationship (no original file was edited).** This file **supersedes, once accepted**, the "Measure" column of the GOAL table in section 3 of `PRODUCT_VISION_AND_BUSINESS_MODEL.md` (and the "target 100% by design" wording of MET-013 in the analytics catalogue, which is outside this review's folders). The goal statements themselves, the vision, segments and business model stand. Folder 01 was not assigned to this fix pass's owner list; this file is written there because REVW-39 targets it, and the folder owner should confirm. Governance should link it from `00_CONTROL_CENTRE/MASTER_INDEX.md`.

Reading rule for this table: a **target** is a value the product aims for and measures. It is not a statement that a legal, regulatory or audit standard is met, and it is not a claim that any feature exists. A target without a value is marked **[OPEN]** with an owner; it becomes a commitment only after the baseline of WP-LOADBASE or the pilot has produced a number.

| ID      | Goal (unchanged)                                            | Measure and target (replaces the old "Measure" cell)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Value status                                                                    |
| ------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| GOAL-01 | Candidates can prove skills with graded, auditable evidence | Share of **active candidates** (defined: signed in within 30 days **[OPEN]**) holding at least 3 evidence items at rung `artifact_backed` or higher. Target value after the pilot baseline                                                                                                                                                                                                                                                                                                                                                                                     | Value [OPEN], owner Trust PM                                                    |
| GOAL-02 | Recruiters screen faster using trustworthy signals          | Median time from application `submitted` to first human review (`in_review`); share of applications that reach `interviewing`. Target values after the pilot baseline                                                                                                                                                                                                                                                                                                                                                                                                          | Values [OPEN], owner Hiring PM                                                  |
| GOAL-03 | Matching is explainable and fair                            | (a) **Explanation coverage**: every match result shown carries its rationale and uncertainty (MET-013). The design target is 100% and any shown result without a rationale is a defect, not a compliance statement. (b) **Quarterly adverse-impact review**: the review runs on voluntarily supplied audit-only attributes, ROLE-AUD records the result, and a ratio below the review threshold opens a human review (BR-T077, MET-014). The threshold value is set with counsel or an advisor and is not asserted here. "Passes" does not mean legal or regulatory compliance | (a) target set; (b) threshold [OPEN-08], owner Responsible-AI Lead              |
| GOAL-04 | Learning converts to evidence and outcomes                  | Course-completion-to-evidence rate; learning-to-interview rate. Target values after the pilot baseline                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Values [OPEN], owner Learning PM                                                |
| GOAL-05 | Institutions graduate learners into the career loop         | Graduating-cohort activation rate (learners who keep an active account within 30 days of graduation, k ≥ 5 cohorts only, BR-T100)                                                                                                                                                                                                                                                                                                                                                                                                                                              | Value [OPEN], owner Institutions PM                                             |
| GOAL-06 | Platform is secure, private, accessible                     | (a) **Confirmed cross-tenant data exposures: target zero**, measured through the incident register and the cross-tenant canary suite (FF-05) staying green. Zero incidents is a target and an outcome measure; it does not prove absence of defects. (b) **Accessibility**: target conformance to WCAG 2.2 AA for the core flows; an independent audit is scheduled (OPEN-37). No conformance is claimed until an audit report exists                                                                                                                                          | (a) target set; (b) audit [OPEN-37], owner Security Lead and Design System Lead |
| GOAL-07 | Business is sustainable                                     | Gross margin at or above the target of OPEN-05; AI cost per monthly active user within the budget policy. No number exists yet; the cost-envelope structure (REVW-16) must be filled with vendor quotes before Phase 0 exit                                                                                                                                                                                                                                                                                                                                                    | Values [OPEN-05], owner Finance Lead                                            |
| GOAL-08 | Product degrades gracefully                                 | Availability and fault-containment targets of OPS-SLO, each labelled a hypothesis until WP-LOADBASE produces a baseline (OPEN-15); a published target becomes a commitment only after calibration                                                                                                                                                                                                                                                                                                                                                                              | Values calibrated after WP-LOADBASE, owner SRE Lead                             |

### Consequential wording changes

| Where            | Old wording                                                             | New wording                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| GOAL-03          | "100% of matches show rationale; adverse-impact audit passes quarterly" | Explanation coverage target 100% as a design target; a quarterly review is held and its result recorded; threshold set with counsel; "passes" retired |
| GOAL-06          | "zero cross-tenant incidents; WCAG 2.2 AA audit pass"                   | Zero confirmed exposures as a target and outcome measure; target conformance to WCAG 2.2 AA with an independent audit pending (OPEN-37)               |
| MET-013          | "100% by design"                                                        | "Design target 100%; measures coverage, not compliance" (owner of folder 20 to adopt)                                                                 |
| STR-01 / GOAL-02 | "shortlist-to-interview rate"                                           | "share of applications reaching `interviewing`" (the advisory view is "Suggested order", never "shortlist", BR-T072)                                  |

### Open items

| Item                            | Question                                                             | Owner               |
| ------------------------------- | -------------------------------------------------------------------- | ------------------- |
| Active-candidate definition     | Window and activity rule for GOAL-01                                 | Trust PM            |
| Review threshold for GOAL-03(b) | Value and method, with counsel (OPEN-08)                             | Responsible-AI Lead |
| Pilot baselines                 | When the Phase 1 pilot produces first values for GOAL-01, 02, 04, 05 | Program Director    |
