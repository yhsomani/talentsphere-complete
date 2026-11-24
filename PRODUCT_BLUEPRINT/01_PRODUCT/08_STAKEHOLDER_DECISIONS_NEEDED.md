# 08 — Stakeholder Decisions Needed

High-level decisions only the owner can make (`OD-PRD-nn`), and the decisions already recorded (`DEC-nnn`). Module-level open decisions live in each module file as `OD-<MOD>-nn`; they are escalated here only when they change product scope, money, law or trust. Nothing here is resolved by this blueprint: each item gives options, a **default proposal** marked [PROP] that stands only until the owner decides, the impact, and the urgency expressed as what it blocks. No deadlines are set. [SRC: CONVENTIONS §2, §3]

## 1. Urgency classes

| Class | Meaning                                                                            |
| ----- | ---------------------------------------------------------------------------------- |
| U1    | Blocks R0 or R1 (foundations or the core loop); decide before building those tiers |
| U2    | Blocks R2 or R3 (hiring marketplace, institutions and instructors)                 |
| U3    | Blocks R4 or R5 (intelligence, trust at scale, commercial scale)                   |
| U4    | Blocks R6 (OS expansion) only                                                      |

## 2. Recorded decisions

### DEC-001 — The new from-scratch blueprint lives in PRODUCT_BLUEPRINT

| Field          | Detail                                                                                                                                                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision       | The complete intended product is specified from first principles in `PRODUCT_BLUEPRINT/`. `SSOT.md`, `docs/` and `Yash_Final_Project_Document/` are inputs, never limits; they are not edited by this work. Existing code is not assumed to implement anything.                         |
| Decided by     | Owner, relayed by the orchestrating agent [SRC: COMMON_BRIEF; CONVENTIONS §1]                                                                                                                                                                                                           |
| Recorded       | 2026-11-23                                                                                                                                                                                                                                                                              |
| Status         | Recorded                                                                                                                                                                                                                                                                                |
| Consequences   | Ids in the blueprint use new namespaces (`FR-`, `BR-<MOD>-`, `BR-XCT-`, `OD-PRD-`, `JRN-`); legacy ids (`F-`, `BR-001…248`, `J-`, `OD-01…53`) remain separate and are cited, not renumbered. A disposition of the legacy documents and code is still needed (`OD-PRD-30`, `OD-PRD-31`). |
| Conflict noted | `SSOT.md` calls itself the source of truth; the blueprint does not supersede it until `OD-PRD-31` defines ratification. Until then both exist: SSOT as founder intent of record, the blueprint as the proposed complete product.                                                        |

### DEC-002 — Scope widened to a career operating system (conflicts with SSOT §4.2)

| Field                        | Detail                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision                     | The product goal is a complete platform "strong like an operating system" for the whole career domain: identity, learning, assessment, evidence, hiring, networking, institutions, plus adjacent career services.                                                                                                                                                                                   |
| Decided by                   | Owner [SRC: COMMON_BRIEF "Stakeholder goal (confirmed by the owner)"]                                                                                                                                                                                                                                                                                                                               |
| Recorded                     | 2026-11-23                                                                                                                                                                                                                                                                                                                                                                                          |
| Status                       | Recorded; conflict open                                                                                                                                                                                                                                                                                                                                                                             |
| Conflict                     | `SSOT.md` §4.2 lists non-goals: general-purpose marketplace, social-media clone, generic HR/payroll, ad network, sales prospecting. Five OS-expansion modules (`MEN`, `GIG`, `EVT`, `MKT`, `ENT`) and some core capabilities (community posts, company reviews, promoted placements) brush those non-goals ([01 §11.2](01_VISION_AND_STRATEGY.md#112-where-the-owners-os-goal-brushes-a-non-goal)). |
| How the blueprint handles it | Expansion modules are fully specified but gated: every capability is denied until `OD-PRD-02` admits the module. Each brushing capability is specified narrowly and has its own `OD-`. SSOT §4.2 is not edited.                                                                                                                                                                                     |
| Follow-up decisions          | `OD-PRD-02`, `OD-PRD-03`, `OD-PRD-16`, `OD-PRD-17`, `OD-PRD-18`, `OD-PRD-20`, `OD-PRD-29`                                                                                                                                                                                                                                                                                                           |

### DEC-003 — Learning is in scope

| Field       | Detail                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision    | Learning, instructor authoring, assessments and institution-managed learning are part of the product (`LRN`, `STU`, `ASM`, `INS`).                                                                                  |
| Decided by  | Owner [SRC: COMMON_BRIEF "Learning features are IN scope"]                                                                                                                                                          |
| Recorded    | 2026-11-23                                                                                                                                                                                                          |
| Status      | Recorded                                                                                                                                                                                                            |
| Consistency | Consistent with the SSOT GA loop (Learn, Practice in Amendment B). It does not decide paid course commerce or a third-party marketplace (`OD-PRD-04`), proctoring (`OD-PRD-15`) or R1 learning depth (`OD-PRD-09`). |

### DEC-004 — Push to the main branch authorized; CI lint was red at the time

| Field      | Detail                                                                                                                                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision   | The owner authorized pushing this blueprint work to the `main` branch.                                                                                                                                                                                                                                                        |
| Decided by | Owner, relayed by the orchestrating agent [SRC: orchestrator brief for this file]                                                                                                                                                                                                                                             |
| Recorded   | 2026-11-23                                                                                                                                                                                                                                                                                                                    |
| Status     | Recorded                                                                                                                                                                                                                                                                                                                      |
| Context    | At the time of the authorization the CI lint check (Prettier) was failing on `main`. The repository instructions say not to push unless asked; this authorization is that request. The last recorded audit also showed lint failing on pre-existing files [SRC: docs/reports/FEATURE_STATUS_2026-10-21.md §B command ledger]. |
| Risk       | Pushing onto a red check hides whether new files introduce further formatting failures.                                                                                                                                                                                                                                       |
| Follow-up  | `OD-PRD-32` (restore a green gate before further pushes). This blueprint author ran no git command, formatter or build.                                                                                                                                                                                                       |

## 3. Open decisions

### OD-PRD-01 — North-star metric and metric hierarchy

| Field            | Detail                                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Which single north-star metric, or which approved hierarchy, governs success claims?                                                                                                     |
| Options          | A: `ns.career_progress_verified` (SSOT §2.4). B: `ns.evidence_backed_conversations` (target metrics catalogue). C: A as north star, B as the leading indicator.                          |
| Default proposal | C [PROP]: outcome as north star, conversations as leading indicator; all targets set only after a measured baseline. Also define the "active candidate" window (default 30 days [PROP]). |
| Impact           | Analytics design (`ANL`), dashboards, roadmap trade-offs.                                                                                                                                |
| Blocks           | U1: instrumenting R1 metrics.                                                                                                                                                            |
| Source           | [SRC: SSOT Appendix E V61-28; STR-01 REV2 open items]                                                                                                                                    |

### OD-PRD-02 — Admission of each OS-expansion module

| Field            | Detail                                                                                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Which of `MEN`, `GIG`, `EVT`, `MKT`, `ENT` are admitted into the product, and in what order?                                                                                                                                             |
| Options          | Per module: admit, admit narrowed, defer, reject.                                                                                                                                                                                        |
| Default proposal | [PROP] Admit `EVT` (free events, no ticketing) and `MKT` (aggregate career paths) first because they need no money flow; admit `MEN` after `OD-PRD-04`; admit `ENT` only with `OD-PRD-20` boundary; decide `GIG` last after `OD-PRD-03`. |
| Impact           | Five module specs either proceed to build or become `Withdrawn`; marketplace liabilities; positioning.                                                                                                                                   |
| Blocks           | U4.                                                                                                                                                                                                                                      |
| Source           | [SRC: DEC-002; CONVENTIONS §4]                                                                                                                                                                                                           |

### OD-PRD-03 — Freelance marketplace boundary

| Field            | Detail                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | How far does `GIG` go?                                                                                                                  |
| Options          | A: Listing only (offerings and projects, contracts off-platform). B: Managed contracts with milestones and held funds. C: Out of scope. |
| Default proposal | A first [PROP], restricted to career-related professional services, with B only after `OD-PRD-04`.                                      |
| Impact           | Money-flow liability, disputes, KYC, positioning against the general-marketplace non-goal.                                              |
| Blocks           | U4.                                                                                                                                     |
| Source           | [SRC: SSOT §4.2; DEC-002]                                                                                                               |

### OD-PRD-04 — Seller of record and money flow for third-party sales

| Field            | Detail                                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Who is the seller of record for paid courses, mentoring, gigs and event tickets; how are payouts, tax, refunds and disputes handled?                                                                              |
| Options          | A: Platform sells first-party content only; no third-party payouts. B: Merchant-of-record provider handles tax and payouts. C: Marketplace model with connected accounts; platform takes commission.              |
| Default proposal | A until a money-flow ADR is approved [PROP]; then B or C chosen with finance and legal advice. Commission rate and refund window decided then (SSOT recommendations of 70/30 and 30 days are noted, not adopted). |
| Impact           | `BIL`, `STU`, `MEN`, `GIG`, `EVT`; tax registration; fraud exposure.                                                                                                                                              |
| Blocks           | U3 (paid first-party courses), U4 (marketplaces).                                                                                                                                                                 |
| Source           | [SRC: SSOT Appendix E V61-21; OD-28; OD-29; MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL]                                                                                                                                  |

### OD-PRD-05 — Candidate premium tier

| Field            | Detail                                                                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Is there a paid candidate tier, what does it include, at what price?                                                                                             |
| Options          | A: No candidate tier. B: Tools-only tier (variants, analytics, AI quota). C: B plus career services credits.                                                     |
| Default proposal | B [PROP], with the free core loop protected (`BR-XCT-027`); price set by owner with cost data. Coded price recommendations in `docs/PRICING.md` are not adopted. |
| Impact           | Revenue, AI cost, fairness perception.                                                                                                                           |
| Blocks           | U3.                                                                                                                                                              |
| Source           | [SRC: SSOT OD-34; docs/PRICING.md]                                                                                                                               |

### OD-PRD-06 — Employer packaging and free posting policy

| Field            | Detail                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| Question         | Seat, job-slot or hybrid pricing; how many free active jobs; quota values; grace period.                           |
| Options          | A: Per seat. B: Per active job. C: Hybrid seats plus slot bundles. Free tier: none, limited, unlimited.            |
| Default proposal | C with a limited free tier [PROP] so small employers can close the loop for candidates; values set by owner.       |
| Impact           | Supply of jobs for R1, revenue model, quota design in `BIL`.                                                       |
| Blocks           | U1 for the free tier (R1 needs employers), U2 for paid packaging.                                                  |
| Source           | [SRC: COMMERCIAL_OPERATIONS §2; docs/PRICING.md "Free recruiters posting jobs: unlimited today, policy undecided"] |

### OD-PRD-07 — Institution licensing model

| Field            | Detail                                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| Question         | Per seat, per cohort or campus licence; what happens to seats at graduation. |
| Options          | A: Per provisioned seat per term. B: Per cohort. C: Campus licence.          |
| Default proposal | A with seat release at graduation [PROP].                                    |
| Impact           | `INS`, `BIL`; procurement flow.                                              |
| Blocks           | U2.                                                                          |
| Source           | [SRC: SSOT OD-15]                                                            |

### OD-PRD-08 — Billing owner inside organizations

| Field            | Detail                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Question         | Do entitlements in an org context come from the org subscription, the acting user's plan, or both?     |
| Options          | A: Org subscription only. B: Acting user only. C: Org, with personal plans adding personal tools only. |
| Default proposal | C [PROP].                                                                                              |
| Impact           | Every `e` cell for `REC`, `HMG`, `EAD` in [04](04_PERMISSION_MATRIX.md).                               |
| Blocks           | U2.                                                                                                    |
| Source           | [SRC: docs/PRICING.md review notes]                                                                    |

### OD-PRD-09 — R1 pilot scope

| Field            | Detail                                                                                                                                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Which loop does the first pilot prove?                                                                                                                                                                                                                                        |
| Options          | A: Full GA loop including first-party learning and practice. B: Prove → Showcase → Apply with non-AI matching; learning in R1 limited to free first-party courses. C: Narrow beta (identity, profile, evidence verification, jobs, applications, messaging) without learning. |
| Default proposal | B [PROP]: proves evidence and hiring value early while keeping `DEC-003` (learning in scope) with a minimal catalog.                                                                                                                                                          |
| Impact           | R1 contents in [02 §4](02_SCOPE_AND_BOUNDARIES.md#4-release-tier-scope-map-r0-to-r6); a narrower pilot must not redefine GA.                                                                                                                                                  |
| Blocks           | U1.                                                                                                                                                                                                                                                                           |
| Source           | [SRC: SSOT Appendix E V61-20; FEATURE_STATUS_2026-10-21 §A]                                                                                                                                                                                                                   |

### OD-PRD-10 — Launch jurisdictions, data residency and legal regime

| Field            | Detail                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Question         | Which countries at launch; where data is hosted; which privacy and employment laws apply.      |
| Options          | A: Single country first. B: One region (for example one economic area). C: Global from launch. |
| Default proposal | A or B with counsel [PROP]; no compliance claim before mapping (SSOT Amendment G India note).  |
| Impact           | Consent texts, salary-transparency rules on job posts, background checks, erasure clocks, tax. |
| Blocks           | U1.                                                                                            |
| Source           | [SRC: SSOT Appendix E V61-27; Amendment G]                                                     |

### OD-PRD-11 — Minimum age and minors policy

| Field            | Detail                                                                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Minimum age for independent accounts; whether minors can be managed learners; what is locked for them.                                                                            |
| Options          | A: 16 (SSOT provisional). B: 18. C: Jurisdiction-specific with attestation.                                                                                                       |
| Default proposal | C with attestation and no date of birth unless counsel requires it [PROP]; minors only as managed learners with discoverability, outreach and marketplaces locked (`BR-XCT-071`). |
| Impact           | `IDN`, `INS`, `SET`; safeguarding.                                                                                                                                                |
| Blocks           | U1.                                                                                                                                                                               |
| Source           | [SRC: SSOT Appendix E V61-24]                                                                                                                                                     |

### OD-PRD-12 — `min_cohort_k` default and overrides

| Field            | Detail                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Question         | Value of the small-cell threshold; what k counts; permitted overrides.                                                       |
| Options          | Default k of 5, 10 or 20; k counts distinct people or reports.                                                               |
| Default proposal | k ≥ 10 distinct people for public and sensitive cells [SRC: SSOT Amendment G]; lower values need owner and counsel approval. |
| Impact           | `ANL`, `INS`, `MKT`, `ENT` reports; usefulness for small cohorts.                                                            |
| Blocks           | U2 (institution analytics).                                                                                                  |
| Source           | [SRC: SSOT Appendix E V61-04]                                                                                                |

### OD-PRD-13 — Erasure clocks

| Field            | Detail                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| Question         | Cancel window, completion deadline and deactivation purge values.                     |
| Options          | Cancel window 7 or 30 days; completion within 30 days of request or of window end.    |
| Default proposal | 7-day cancel window, completion within 30 days of the request [PROP, target BR-T060]. |
| Impact           | `SET`, every module's erasure handler.                                                |
| Blocks           | U1.                                                                                   |
| Source           | [SRC: SSOT Appendix E V61-07; DOR-017]                                                |

### OD-PRD-14 — Predictive or automated hiring decisions

| Field            | Detail                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Are candidate-level predictive scores or automated screening ever admitted?                                                                          |
| Options          | A: Permanently excluded. B: Excluded from GA; admission only through a governance process with validation, fairness, human control and legal review. |
| Default proposal | B [SRC: SSOT Amendment E]; advisory suggested order with explanation stays allowed.                                                                  |
| Impact           | `AIC`, `ATS`; regulatory exposure.                                                                                                                   |
| Blocks           | U3.                                                                                                                                                  |
| Source           | [SRC: SSOT Amendment E]                                                                                                                              |

### OD-PRD-15 — Proctoring

| Field            | Detail                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Question         | Is remote proctoring offered; vendor or in-house; webcam and screen capture?                                                               |
| Options          | A: No proctoring; integrity by design and review. B: Live human proctoring for institution-run exams only. C: Vendor automated proctoring. |
| Default proposal | A until institution demand is shown, then B [PROP].                                                                                        |
| Impact           | `ASM`, privacy, accessibility.                                                                                                             |
| Blocks           | U3.                                                                                                                                        |
| Source           | [SRC: SSOT OD-35]                                                                                                                          |

### OD-PRD-16 — Community content breadth

| Field            | Detail                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Question         | Posts, articles, groups and newsletters: which are offered?                                                                  |
| Options          | A: None beyond referrals and messaging. B: Topic groups and Q&A only. C: Posts, articles and groups with non-viral ordering. |
| Default proposal | B [PROP].                                                                                                                    |
| Impact           | `NET`, `TSF` load; social-clone non-goal.                                                                                    |
| Blocks           | U2.                                                                                                                          |
| Source           | [SRC: SSOT J-23; §4.2]                                                                                                       |

### OD-PRD-17 — Company reviews and salary reports

| Field            | Detail                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Are company reviews and salary reports allowed; anonymous or not?                                                                            |
| Options          | A: Neither. B: Salary reports (aggregate only) without reviews. C: Both, anonymous to employers and public, with verified-employment signal. |
| Default proposal | B first, C after moderation capacity exists [PROP].                                                                                          |
| Impact           | `EMP`, `MKT`, `TSF`; defamation exposure.                                                                                                    |
| Blocks           | U2 (reviews), U4 (salary).                                                                                                                   |
| Source           | [SRC: SSOT OD-45, OD-47]                                                                                                                     |

### OD-PRD-18 — Promoted placements

| Field            | Detail                                                         |
| ---------------- | -------------------------------------------------------------- |
| Question         | Is any paid visibility offered?                                |
| Options          | A: None. B: Labelled promoted jobs in separate slots only.     |
| Default proposal | A [PROP].                                                      |
| Impact           | Revenue vs fairness perception; `BR-XCT-020` holds either way. |
| Blocks           | U3.                                                            |
| Source           | [SRC: SSOT OD-32]                                              |

### OD-PRD-19 — Background-check scope and vendor model

| Field            | Detail                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Question         | Which checks (employment, education, criminal), which vendor model, which countries?                             |
| Options          | A: None; referee and employer confirmation only. B: Employment and education via vendor. C: Full vendor catalog. |
| Default proposal | A in R1–R3, B in R4 [PROP].                                                                                      |
| Impact           | `BGV`, legal notices, adverse-action process.                                                                    |
| Blocks           | U3.                                                                                                              |
| Source           | [DER]                                                                                                            |

### OD-PRD-20 — Enterprise internal mobility boundary

| Field            | Detail                                                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Where does `ENT` stop relative to HR systems?                                                                                                                         |
| Options          | A: Skills inventory and internal roles only. B: A plus mandated learning and read-only HRIS sync. C: B plus performance data (rejected by default as an HR non-goal). |
| Default proposal | B [PROP]; manager notification on internal application defaults to off.                                                                                               |
| Impact           | `ENT`, privacy of employees.                                                                                                                                          |
| Blocks           | U4.                                                                                                                                                                   |
| Source           | [SRC: SSOT §4.2; J-16, J-28]                                                                                                                                          |

### OD-PRD-21 — AI funding and provider strategy

| Field            | Detail                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Question         | How are AI costs funded for free users; which providers; is bring-your-own-key allowed?                                         |
| Options          | A: No paid inference for free users. B: Small platform-funded quota under a cost policy. C: Bring-your-own-key for power users. |
| Default proposal | A in R1 (non-AI matching), B from R4 with a cost policy [PROP].                                                                 |
| Impact           | `AIC`, margins.                                                                                                                 |
| Blocks           | U3.                                                                                                                             |
| Source           | [SRC: SSOT §16.4; OD-07]                                                                                                        |

### OD-PRD-22 — Real-time video

| Field            | Detail                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Question         | Build, integrate or omit video for interviews, mentoring and events?                         |
| Options          | A: External meeting links only. B: Embedded third-party video. C: First-party media servers. |
| Default proposal | A [PROP].                                                                                    |
| Impact           | `INT`, `MEN`, `EVT`; live-streaming non-goal.                                                |
| Blocks           | U2.                                                                                          |
| Source           | [SRC: SSOT OD-33; §4.2]                                                                      |

### OD-PRD-23 — External integration priorities

| Field            | Detail                                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Which integrations first: LinkedIn data import, calendar, partner ATS, HRIS, SIS/LMS, background-check vendor, public API pricing?                 |
| Options          | Any order; API enterprise-only or metered.                                                                                                         |
| Default proposal | Calendar and résumé/LinkedIn-export import in R1–R2; SIS roster import in R3; ATS and HRIS in R5; API enterprise-only at launch [SRC: SSOT OD-53]. |
| Impact           | `PLT` roadmap.                                                                                                                                     |
| Blocks           | U2.                                                                                                                                                |
| Source           | [SRC: SSOT §13.3, OD-53]                                                                                                                           |

### OD-PRD-24 — White-label and co-branding

| Field            | Detail                                                |
| ---------------- | ----------------------------------------------------- |
| Question         | Can institutions or enterprises brand the experience? |
| Options          | A: None. B: Co-branded pages. C: Full white-label.    |
| Default proposal | B first [SRC: SSOT OD-20].                            |
| Impact           | `EMP`, `INS`, design system.                          |
| Blocks           | U3.                                                   |
| Source           | [SRC: SSOT OD-20]                                     |

### OD-PRD-25 — User research before R1

| Field            | Detail                                                                     |
| ---------------- | -------------------------------------------------------------------------- |
| Question         | Commission research to validate personas and journeys before building R1?  |
| Options          | A: Yes, before R1 build. B: In parallel with R1 build. C: After the pilot. |
| Default proposal | B [PROP].                                                                  |
| Impact           | Personas in [03](03_PERSONAS_AND_ROLES.md) are hypothetical.               |
| Blocks           | U1.                                                                        |
| Source           | [SRC: USR-01 §2 "validate via OPEN-07"]                                    |

### OD-PRD-26 — Government identity verification

| Field            | Detail                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Question         | Is identity-document verification offered or required (for mentors, freelancers, payees, or anyone)?  |
| Options          | A: Never. B: Only where a payment provider requires it. C: Optional for anyone as an evidence signal. |
| Default proposal | B [PROP].                                                                                             |
| Impact           | `BGV`, privacy, cost.                                                                                 |
| Blocks           | U3.                                                                                                   |
| Source           | [DER]                                                                                                 |

### OD-PRD-27 — Monetary referral bonuses

| Field            | Detail                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| Question         | Does the platform track or pay referral bonuses?                                      |
| Options          | A: No. B: Track eligibility only; employers pay outside. C: Pay through the platform. |
| Default proposal | A [PROP].                                                                             |
| Impact           | `NET`, `BIL`.                                                                         |
| Blocks           | U3.                                                                                   |
| Source           | [SRC: SSOT BR-233..BR-240]                                                            |

### OD-PRD-28 — Public gamification

| Field            | Detail                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Question         | Are XP, levels and leaderboards public?                                                         |
| Options          | A: Private only. B: Opt-in public badges, no leaderboards. C: Public leaderboards for contests. |
| Default proposal | B, with C only inside events [PROP].                                                            |
| Impact           | `REP`; evidence over popularity.                                                                |
| Blocks           | U2.                                                                                             |
| Source           | [SRC: SSOT OD-06]                                                                               |

### OD-PRD-29 — Commercial use of aggregate data

| Field            | Detail                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Question         | May k-anonymous aggregates be sold as insights or used for research?                                                   |
| Options          | A: No. B: Inside paid tiers only, never person-level. C: Research partnerships with consent `data.research_aggregate`. |
| Default proposal | B [PROP]; C stays hidden until decided.                                                                                |
| Impact           | `MKT`, `ANL`, trust.                                                                                                   |
| Blocks           | U4.                                                                                                                    |
| Source           | [SRC: CONSENT_SCOPE_CATALOGUE `data.research_aggregate` hidden]                                                        |

### OD-PRD-30 — Legacy code disposition

| Field            | Detail                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Question         | Is the blueprint built by evolving the existing code or by rebuilding?                               |
| Options          | A: Evolve existing modules where they match the blueprint. B: Rebuild. C: Module-by-module decision. |
| Default proposal | C [PROP], recorded in `11_LEGACY_DISPOSITION`.                                                       |
| Impact           | Effort and risk.                                                                                     |
| Blocks           | U1.                                                                                                  |
| Source           | [SRC: DEC-001]                                                                                       |

### OD-PRD-31 — Blueprint ratification governance

| Field            | Detail                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Question         | Who ratifies `[PROP]` items, and when does the blueprint supersede `SSOT.md`?                   |
| Options          | A: Owner ratifies per module. B: Owner ratifies per tier. C: Blueprint supersedes SSOT at once. |
| Default proposal | A [PROP]; SSOT stays founder intent until each module is ratified.                              |
| Impact           | All modules.                                                                                    |
| Blocks           | U1.                                                                                             |
| Source           | [SRC: SSOT Appendix E V61-31]                                                                   |

### OD-PRD-32 — Restore a green CI gate before further pushes

| Field            | Detail                                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question         | Should further pushes to `main` wait until the lint gate is green?                                                                                                            |
| Options          | A: Yes, fix lint first. B: Allow documentation-only pushes while red. C: Keep pushing.                                                                                        |
| Default proposal | A [PROP]. Fixing requires touching files outside this blueprint and possibly Prettier configuration, which is a build file reserved to humans by the repository instructions. |
| Impact           | Release discipline.                                                                                                                                                           |
| Blocks           | U1.                                                                                                                                                                           |
| Source           | [SRC: DEC-004; CLAUDE.md build-file rule]                                                                                                                                     |

### OD-PRD-33 — Accessibility commitment and independent audit

| Field            | Detail                                                           |
| ---------------- | ---------------------------------------------------------------- |
| Question         | Commit to WCAG 2.2 AA conformance and fund an independent audit? |
| Options          | A: Yes before GA. B: Target only, audit later.                   |
| Default proposal | A [PROP]; no conformance claim until an audit report exists.     |
| Impact           | All UI.                                                          |
| Blocks           | U1.                                                              |
| Source           | [SRC: STR-01 REV2 GOAL-06; OPEN-37]                              |

### OD-PRD-34 — Support model

| Field            | Detail                                                             |
| ---------------- | ------------------------------------------------------------------ |
| Question         | Channels, hours, free-user support, support access-session length. |
| Options          | A: Help center and email for all; chat for paid. B: Email for all. |
| Default proposal | A, access sessions 60 minutes [PROP].                              |
| Impact           | `ADM`, cost.                                                       |
| Blocks           | U1.                                                                |
| Source           | [DER]                                                              |

### OD-PRD-35 — Moderation operating model

| Field            | Detail                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Question         | In-house or outsourced moderators; degree of automated triage.                              |
| Options          | A: In-house with automated triage for spam. B: Outsourced first-line with in-house appeals. |
| Default proposal | A [SRC: SSOT OD-05 "AI-triage for spam; human for bans"].                                   |
| Impact           | `TSF`, cost, quality.                                                                       |
| Blocks           | U1.                                                                                         |
| Source           | [SRC: SSOT OD-05]                                                                           |

### OD-PRD-36 — Native apps and browser-extension sync

| Field            | Detail                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| Question         | Are native apps ever built; may the browser extension sync to the server?                         |
| Options          | Extension: local-only (SSOT BR-30) or opt-in sync (J-11). Native: never, later, wrappers.         |
| Default proposal | Extension opt-in sync with explicit consent [PROP]; no native apps until PWA limits are measured. |
| Impact           | `PWA`.                                                                                            |
| Blocks           | U3.                                                                                               |
| Source           | [SRC: SSOT §10.2 note on J-11 vs BR-30]                                                           |

### OD-PRD-37 — Managed learners applying before graduation

| Field            | Detail                                                                |
| ---------------- | --------------------------------------------------------------------- |
| Question         | Can a `STD` apply to jobs outside placement drives before graduation? |
| Options          | A: Never (SSOT §5.9). B: Institution decides per cohort. C: Always.   |
| Default proposal | B [PROP].                                                             |
| Impact           | `JOB.application.submit` STD cell.                                    |
| Blocks           | U2.                                                                   |
| Source           | [SRC: SSOT §5.9]                                                      |

### OD-PRD-38 — Languages and locales at launch

| Field            | Detail                                                           |
| ---------------- | ---------------------------------------------------------------- |
| Question         | Which languages, scripts and currencies are supported at launch? |
| Options          | A: One language. B: A short list tied to `OD-PRD-10`.            |
| Default proposal | B [PROP]; all strings externalized from R0.                      |
| Impact           | All UI, templates, taxonomy labels.                              |
| Blocks           | U1.                                                              |
| Source           | [DER]                                                            |

## 4. Summary by urgency

| Class | Decisions                                                                                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| U1    | `OD-PRD-01`, `OD-PRD-06` (free tier), `OD-PRD-09`, `OD-PRD-10`, `OD-PRD-11`, `OD-PRD-13`, `OD-PRD-25`, `OD-PRD-30`, `OD-PRD-31`, `OD-PRD-32`, `OD-PRD-33`, `OD-PRD-34`, `OD-PRD-35`, `OD-PRD-38` |
| U2    | `OD-PRD-06` (paid), `OD-PRD-07`, `OD-PRD-08`, `OD-PRD-12`, `OD-PRD-16`, `OD-PRD-17` (reviews), `OD-PRD-22`, `OD-PRD-23`, `OD-PRD-28`, `OD-PRD-37`                                                |
| U3    | `OD-PRD-04` (first-party paid courses), `OD-PRD-05`, `OD-PRD-14`, `OD-PRD-15`, `OD-PRD-18`, `OD-PRD-19`, `OD-PRD-21`, `OD-PRD-24`, `OD-PRD-26`, `OD-PRD-27`, `OD-PRD-36`                         |
| U4    | `OD-PRD-02`, `OD-PRD-03`, `OD-PRD-04` (marketplaces), `OD-PRD-17` (salary), `OD-PRD-20`, `OD-PRD-29`                                                                                             |

## 5. Legacy source trace

| Source                         | Used for                                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SSOT.md` §24.5 OD-01 to OD-53 | Recommendations cited as sources (OD-05, OD-06, OD-07, OD-15, OD-20, OD-28, OD-29, OD-32 to OD-36, OD-45, OD-47, OD-53); none adopted as decisions |
| `SSOT.md` Appendix E           | V61-04, V61-07, V61-20, V61-21, V61-24, V61-27, V61-28, V61-31                                                                                     |
| `docs/PRICING.md`              | Unapproved coded prices; free-recruiter and billing-owner questions                                                                                |
