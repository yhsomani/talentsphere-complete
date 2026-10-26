# Product Vision, Goals Revision 2 (STR-01 REV2: goal wording and thresholds)

Doc ID: STR-01-R2 · Owner: CPO · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-39 · Relates: STR-01 (`PRODUCT_VISION_AND_BUSINESS_MODEL.md` section 3), MET-013, MET-014, BR-T077, BR-T126, OPS-SLO, OPEN-05, OPEN-08, OPEN-37

**Relationship (no original file was edited).** This file **supersedes, once accepted**, the "Measure" column of the GOAL table in section 3 of `PRODUCT_VISION_AND_BUSINESS_MODEL.md` (and the "target 100% by design" wording of MET-013 in the analytics catalogue, which is outside this review's folders). The goal statements themselves, the vision, segments and business model stand. Folder 01 was not assigned to this fix pass's owner list; this file is written there because REVW-39 targets it, and the folder owner should confirm. Governance should link it from `00_CONTROL_CENTRE/MASTER_INDEX.md`.

Reading rule for this table: a **target** is a value the product aims for and measures. It is not a statement that a legal, regulatory or audit standard is met, and it is not a claim that any feature exists. A target without a value is marked **[OPEN]** with an owner; it becomes a commitment only after the baseline of WP-LOADBASE or the pilot has produced a number.

| ID | Goal (unchanged) | Measure and target (replaces the old "Measure" cell) | Value status |
|---|---|---|---|
| GOAL-01 | Candidates can prove skills with graded, auditable evidence | Share of **active candidates** (defined: signed in within 30 days **[OPEN]**) holding at least 3 evidence items at rung `artifact_backed` or higher. Target value after the pilot baseline | Value [OPEN], owner Trust PM |
| GOAL-02 | Recruiters screen faster using trustworthy signals | Median time from application `submitted` to first human review (`in_review`); share of applications that reach `interviewing`. Target values after the pilot baseline | Values [OPEN], owner Hiring PM |
| GOAL-03 | Matching is explainable and fair | (a) **Explanation coverage**: every match result shown carries its rationale and uncertainty (MET-013). The design target is 100% and any shown result without a rationale is a defect, not a compliance statement. (b) **Quarterly adverse-impact review**: the review runs on voluntarily supplied audit-only attributes, ROLE-AUD records the result, and a ratio below the review threshold opens a human review (BR-T077, MET-014). The threshold value is set with counsel or an advisor and is not asserted here. "Passes" does not mean legal or regulatory compliance | (a) target set; (b) threshold [OPEN-08], owner Responsible-AI Lead |
| GOAL-04 | Learning converts to evidence and outcomes | Course-completion-to-evidence rate; learning-to-interview rate. Target values after the pilot baseline | Values [OPEN], owner Learning PM |
| GOAL-05 | Institutions graduate learners into the career loop | Graduating-cohort activation rate (learners who keep an active account within 30 days of graduation, k ≥ 5 cohorts only, BR-T100) | Value [OPEN], owner Institutions PM |
| GOAL-06 | Platform is secure, private, accessible | (a) **Confirmed cross-tenant data exposures: target zero**, measured through the incident register and the cross-tenant canary suite (FF-05) staying green. Zero incidents is a target and an outcome measure; it does not prove absence of defects. (b) **Accessibility**: target conformance to WCAG 2.2 AA for the core flows; an independent audit is scheduled (OPEN-37). No conformance is claimed until an audit report exists | (a) target set; (b) audit [OPEN-37], owner Security Lead and Design System Lead |
| GOAL-07 | Business is sustainable | Gross margin at or above the target of OPEN-05; AI cost per monthly active user within the budget policy. No number exists yet; the cost-envelope structure (REVW-16) must be filled with vendor quotes before Phase 0 exit | Values [OPEN-05], owner Finance Lead |
| GOAL-08 | Product degrades gracefully | Availability and fault-containment targets of OPS-SLO, each labelled a hypothesis until WP-LOADBASE produces a baseline (OPEN-15); a published target becomes a commitment only after calibration | Values calibrated after WP-LOADBASE, owner SRE Lead |

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
