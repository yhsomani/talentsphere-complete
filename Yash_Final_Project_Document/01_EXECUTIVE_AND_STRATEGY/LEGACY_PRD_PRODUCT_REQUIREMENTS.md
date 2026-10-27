# Legacy Product Requirements (prior PRD v6.0) merged into the target strategy

Doc ID: STR-LEG-01 · Owner: CPO (with Product Director) · Version 1.0 · Status: Draft for Review · Relates: `PRODUCT_VISION_AND_BUSINESS_MODEL.md` (STR-01, GOAL-01..08), `PRODUCT_VISION_GOALS_REV2.md`, `../20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md` (OPEN-51), `../03_BUSINESS_DOMAINS/LEGACY_BRAIN_CONCEPTUAL_MODEL.md`, `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## Merged from legacy: `31_LEGACY_ARCHIVE/docs/product/PRD.md` (v6.0)

## 0. Frame

**Nothing is implemented.** The prior PRD described a career platform for a prior attempt; it pointed to a root SSOT for system rules and to a feature registry for the 173 features. Everything below is a **requirement candidate carried forward**; where it differs from `PRODUCT_VISION_AND_BUSINESS_MODEL.md` both versions are kept and the difference is registered in section 10.

## 1. Product definition (legacy)

TalentSphere is a **PWA-first Career Operating System** centred on a **Talent Graph and Evidence Graph**. Its purpose is to connect career goals, learning, proof, verification, opportunities, hiring and outcomes.

### North-star loop (legacy wording, 12 stages)

```text
GOAL -> GAP -> LEARN -> PRACTICE -> PROVE -> VERIFY
-> DISCOVER -> MATCH -> APPLY -> INTERVIEW -> OUTCOME
-> NEW EVIDENCE -> NEXT ACTION
```

Target loop (`PRODUCT_VISION_AND_BUSINESS_MODEL.md` section 2): Learn, Prove, Showcase, Match, Apply, Hire, Grow, back to Learn. Approximate alignment: GOAL/GAP/LEARN/PRACTICE map to Learn; PROVE/VERIFY to Prove and Showcase; DISCOVER/MATCH to Match; APPLY/INTERVIEW/OUTCOME to Apply and Hire; NEW EVIDENCE/NEXT ACTION to Grow. The legacy loop makes **goal and gap analysis explicit first steps** and **outcome feedback** an explicit last step; the target loop has no named Goal or Gap stage. Decision: OPEN-LGA-09.

## 2. Problem (legacy)

Career information is fragmented across profiles, learning systems, job boards, assessments, portfolios, networking tools and employer workflows. Users repeatedly translate the same experience into claims without a unified evidence trail. TalentSphere treats evidence and outcomes as first-class objects. (Compare target problem statement in STR-01 section 1: claims are expensive to check; same direction.)

## 3. Target users (legacy list)

Candidate/learner, career switcher, professional, recruiter, hiring manager, employer admin, instructor/course author, institution admin/faculty, mentor/expert, moderator, verification operator, support, finance, platform admin (14 roles). Target customer segments are in STR-01 section 4 (5 segments); target roles in `../02_STAKEHOLDERS_AND_USERS/STAKEHOLDERS_ROLES_PERMISSIONS.md`. Legacy "career switcher", "mentor/expert", "finance" and "verification operator" have no dedicated target segment row; see OPEN-LGA-08.

## 4. Core jobs-to-be-done (legacy; carried over)

| Persona | Job |
|---|---|
| Candidate | Understand readiness for a goal. |
| Candidate | Identify gaps. |
| Candidate | Learn what matters. |
| Candidate | Produce evidence. |
| Candidate | Discover relevant opportunities. |
| Candidate | Apply with stronger proof. |
| Candidate | Learn from outcomes. |
| Recruiter | Find candidates using relevant capability/evidence signals. |
| Recruiter | Understand why a candidate matches. |
| Recruiter | Communicate, interview and decide efficiently. |
| Recruiter | Preserve an auditable hiring workflow. |
| Instructor | Deliver learning. |
| Instructor | Assess progress. |
| Instructor | Generate trustworthy achievement evidence. |
| Institution | Manage cohorts and permissions. |
| Institution | Connect learning outcomes to employability. |
| Institution | Preserve learner privacy and lifecycle. |

Target comparison: GOAL-01..GOAL-06 cover candidate evidence, recruiter speed, fairness, learning conversion and institution graduation; the legacy candidate jobs "understand readiness", "identify gaps" and "learn from outcomes" are covered functionally by UJ-07 and legacy J-06 / J-26 but are not stated as measurable goals.

## 5. Value proposition (legacy)

The strongest product promise is not "more features". It is **a coherent evidence-backed career loop** where every meaningful action can improve future career decisions.

## 6. Goals (legacy, 6) and target mapping

| # | Legacy goal | Nearest target goal |
|---|---|---|
| 1 | Create a trusted career identity. | GOAL-01 |
| 2 | Turn activity into attributable evidence. | GOAL-01 |
| 3 | Connect learning to opportunities. | GOAL-04 |
| 4 | Improve the quality and explainability of matching. | GOAL-03 |
| 5 | Close the feedback loop from application outcomes to future action. | none explicit (see legacy J-02, feature F-122 Application Feedback Loop) |
| 6 | Preserve privacy and human control. | GOAL-06 (security, privacy, accessibility) |

Target GOAL-02 (recruiter speed), GOAL-05 (institutions), GOAL-07 (sustainability) and GOAL-08 (graceful degradation) have no legacy counterpart. Legacy goal 5 has no explicit target goal (OPEN-LGA-09).

## 7. Non-goals (legacy; carried over)

- General social-media clone.
- General HR/payroll suite.
- Autonomous hiring engine.
- Guaranteed jobs or salary outcomes.
- General non-career services marketplace.
- Hardware/OS platform.
- Mandatory dependency on LinkedIn, Udemy, Coursera, Glassdoor or HackerRank.

Target comparison (STR-01 section 6 out-of-scope): social-media clone, ad network, payroll/HRIS, crypto/blockchain credentials, autonomous hiring decisions, runtime dependency on competitor platforms. Differences: the target adds **ad network** and **crypto/blockchain credentials**; the legacy adds **guaranteed jobs or salary outcomes**, **non-career services marketplace** and **hardware/OS platform**. Note the legacy registry itself contained "OS Shell and Workbench" (F-48) and "Automation and Agents" (F-49) at low priority (P=4), which sits uneasily with "hardware/OS platform" as a non-goal (OS here means an in-app workbench). All non-goals from both lists should be kept (OPEN-LGA-09).

## 8. GA scope (legacy; carried over)

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

## 9. Product metrics (legacy; carried over)

| Class | Metrics |
|---|---|
| Primary | **Verifiable Career Progress** |
| Supporting | activation; goal creation; skill coverage; evidence creation; verified evidence; learning completion; assessment improvement; qualified applications; interviews; offers; hires; outcome feedback; retention |
| Business | paid conversion; recurring revenue; gross margin; infrastructure cost; AI cost by capability; enterprise expansion; support burden |

Conflict (already registered as **OPEN-51**): the target north star is Evidence-Backed Hiring Conversations per week (MET-001); the legacy primary metric is Verifiable Career Progress, which has no formula in the legacy PRD. Neither is approved. The supporting and business lists above are mostly present as MET-* entries; legacy items **goal creation, skill coverage, assessment improvement, offers, outcome feedback and enterprise expansion** should be checked against `METRICS_CATALOG.md` (OPEN-LGA-10). Reading `METRICS_CATALOG.md` MET-001..MET-055 at merge time: activation (MET-002), verified evidence (MET-004, MET-005), learning completion (MET-017), qualified applications (MET-009), interviews (MET-011), hires (MET-012), retention (MET-022, MET-023), paid conversion, recurring revenue, gross margin, infra cost, AI cost and support burden (MET-026..MET-030, MET-033) have counterparts; **no dedicated metric was found for goal creation, skill coverage, offers extended/accepted, outcome-feedback delivery, or enterprise expansion** (MET-031 net revenue retention is the nearest).

## 10. Product rules (legacy; carried over)

1. Evidence is stronger than unsupported self-claims.
2. Matching is explainable.
3. AI is governed.
4. Assessment AI restrictions are enforceable server-side.
5. Free users do not create unplanned paid AI cost.
6. Privacy is purpose-bound.
7. Popularity is not professional credibility.
8. Anomalies require review, not automatic guilt.

Target alignment: 1 (evidence ladder), 2 (GOAL-03), 3 and 4 (AI policy; ADR-T13 / INV-T09), 5 (INV-T07), 6 (consent scopes, INV-T15), 8 (product constitution: no autonomous adverse decision). Rule 7 "Popularity is not professional credibility" has no named target invariant; it maps to the legacy reputation rules BR-164..BR-168 (reputation derived, skill-specific, time-decayed) and the prior design principle "evidence over popularity" that the target already retains in STR-01 section 7.

## 11. Feature portfolio and acceptance (legacy)

- The canonical 173-feature register and status/dependency metadata lived in the feature registry; feature-specific contracts lived with feature/domain artifacts. See `../04_PRODUCT_CAPABILITIES/LEGACY_FEATURE_REGISTRY_F01_F173.md`.
- Product acceptance: see `../05_FEATURE_SPECIFICATIONS/LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md` section 3.

## 12. Open items raised here

| ID | Item |
|---|---|
| OPEN-LGA-08 | Reconcile legacy 14 user roles / 19 personas with target segments and roles. |
| OPEN-LGA-09 | Decide whether the legacy 13-stage loop, 6 goals, non-goals and GA path add anything to STR-01 (explicit Goal/Gap stage; feedback-loop goal; extra non-goals). |
| OPEN-LGA-10 | Check legacy supporting/business metrics against `METRICS_CATALOG.md`; add the missing ones or record why not. |
| OPEN-51 | Primary north-star metric (existing). |
