# TalentSphere — SSOT.md v6.3

## Final Product, UX, Architecture, Engineering & Operations Source of Truth

> **v6.3 status banner.** v6.3 (22 November 2026) is a second review pass over v6.2. Five reviewers covered the ten specialist roles, an independent editor cross-checked their edits, and the §27.10 open issues were worked; v6.3 adds neutral notes that record open issues and corrects citations, and decides no owner question (§27.11). v6.2: This file is the founder-intent SSOT **v6.0**, unchanged in intent except where a contradiction is resolved under an Appendix E item (for example the cohort minimum, V61-04). v6.2 renumbers every heading cleanly and rewrites every internal cross-reference to the new numbers, resolves the v6.1 contradictions in the text itself, renames Appendix F to [Appendix E — v6.1 Amendments and Reconciliation](#appendix-e--v61-amendments-and-reconciliation) with items `V61-01` … `V61-31`, and adds Part VIII (Multi-Agent Evaluation) as a dated evaluation record. Nothing in this file is assumed implemented: a capability's status comes only from executable evidence (V61-29), and the delivered state of `main` is recorded as dated history in Part VIII. Target blueprint: [`PROJECT_MASTER_BLUEPRINT.md`](docs/archive/target-blueprint/99_FINAL_MASTER_BLUEPRINT.md#talentsphere--project-master-blueprint-target-design); navigation: [`MASTER_INDEX.md`](docs/archive/target-blueprint/00_CONTROL_CENTRE.md#master-index).

**Date:** 24 September 2026 (v6.0 founder intent) · v6.2 edition 21 November 2026 · v6.3 edition 22 November 2026  
**Implementation reality:** **PARTIALLY IMPLEMENTED; RELEASE READINESS NOT ESTABLISHED**. A partial implementation exists on `main`; its evidence is recorded as dated history in Part VIII (Multi-Agent Evaluation) and in `docs/reports/FEATURE_STATUS_2026-10-21.md`. Counts are not maintained here (V61-01).  
**Status:** Canonical specification (intent). Implementation status is not recorded in this file.  
**Authority:** This file is the authoritative definition of intended product/system behavior. Executable code, tests, migrations, runtime evidence and production evidence determine actual implementation status.

### How to read this file

The [system map](#system-map--mind-map-and-flowchart-in-one-diagram) directly below shows every part in one diagram. The parts appear in this order:

1. **Part I — Founder amendments** (A–H). They prevail over the body where the two differ.
2. **Part II — Product foundation** (§1–§5).
3. **Part III — Feature model** (§6–§9).
4. **Part IV — Workflows & state** (§10).
5. **Part V — Technical architecture** (§11–§13).
6. **Part VI — Quality & operations** (§14–§22).
7. **Part VII — Execution** (§23–§26).
8. **Appendices A–E** (Appendix E holds the v6.1 reconciliation items `V61-01` … `V61-31`).
9. **Part VIII — Multi-Agent Evaluation** (dated history about `main` and a feature branch cut from it, not status for this branch).
10. **Current external research basis**.
11. **Canonical end state**.

A line `> v6.1 amendment: see Appendix E, item V61-nn` under a heading points to the reconciliation record for that section. Items marked Proposed in Appendix E are not ratified: until they are, the text in the body is the founder intent.

> **Founder directive:** Preserve valid capabilities and intent, not obsolete wording or weak technical choices. This document supersedes prior TalentSphere SSOT editions as an active specification. Older documents remain historical evidence only.

### Reality separation

```text
DOCUMENTED ≠ IMPLEMENTED
IMPLEMENTED ≠ VERIFIED
VERIFIED ≠ PRODUCTION-READY
```

A feature cannot be promoted in status because documentation says it exists.

### Evidence classes

`FACT` · `DOCUMENTED REQUIREMENT` · `IMPLEMENTED BEHAVIOR` · `EXTERNAL RESEARCH` · `FOUNDER DECISION` · `INFERENCE` · `OPEN QUESTION`

---

## System map — mind map and flowchart in one diagram

This diagram is the one-page view of the whole specification. Read it in two directions:

- **Flow (centre, solid arrows):** the canonical GA career loop of Amendment B, from a candidate's goal to new evidence that starts the next cycle. Each step names the features (`F-xx`) and sections that specify it.
- **Mind map (outer branches, dotted arrows):** every Part of this file, its sections, and what each one contributes to the loop. Dotted arrows show which branch governs or serves which step.

Colour key: **loop steps** (blue), **people** (green), **product foundation and features** (purple), **architecture** (orange), **quality and safety gates** (red), **execution and governance** (grey). Every node is **Planned** on this branch (no application code exists on this branch; V61-29).

```mermaid
flowchart LR
  ROOT(("TalentSphere SSOT v6.3<br/>trust-first, evidence-backed<br/>Career Operating System"))

  subgraph LOOP["Canonical GA loop — Amendment B (flow)"]
    direction TB
    L1["1 Goal<br/>F-12 profile, F-95 transition plan"] --> L2["2 Gap<br/>F-84 Skills Graph, F-91 readiness"]
    L2 --> L3["3 Learn<br/>F-07 LMS, F-114 impact"]
    L3 --> L4["4 Practice<br/>F-08 Challenges Arena"]
    L4 --> L5["5 Prove<br/>F-96 evidence and credentials"]
    L5 --> L6["6 Verify<br/>F-94 work history, F-110 endorsements"]
    L6 --> L7["7 Discover<br/>F-92 recruiter search, F-147 search"]
    L7 --> L8["8 Match<br/>F-145 recommendations, §18"]
    L8 --> L9["9 Apply<br/>F-04 jobs, F-06 pipeline"]
    L9 --> L10["10 Interview<br/>F-88 interview assessment"]
    L10 --> L11["11 Outcome<br/>F-122 feedback loop"]
    L11 --> L12["12 New evidence<br/>F-85 career graph update"]
    L12 -->|next cycle| L1
  end

  subgraph PEOPLE["Users and roles — §5"]
    direction TB
    P1["Candidate"]
    P2["Recruiter and hiring manager<br/>F-102 portal"]
    P3["Institution admin and instructor"]
    P4["Platform admin and moderator"]
    P5["Two-tier authorization §5.4<br/>deny by default: SSOT ADR-003, §14.6"]
  end

  subgraph FOUND["Parts I–III — intent and feature model"]
    direction TB
    A1["Part I founder amendments A–H<br/>prevail over the body"]
    A2["§1–§4 summary, vision,<br/>constitution, scope"]
    A3["§6 ontology: evidence semantics,<br/>skill ontology, revocation"]
    A4["§7 inventory: 173 features F-01…F-173"]
    A5["§8 foundational systems S-xx"]
    A6["§9 specifications:<br/>9.1 foundation · 9.2 Tier 1<br/>9.3 Tier 2 · 9.4 Tier 3–4"]
  end

  subgraph WORK["Part IV — workflows and state, §10"]
    direction TB
    W1["Journeys J-01…J-28"]
    W2["Workflows WF-01…WF-66<br/>integrity traces WIT-001…025"]
    W3["State machines<br/>lower snake_case names"]
    W4["Business rules BR-01…BR-248"]
  end

  subgraph ARCH["Part V — technical architecture, §11–§13"]
    direction TB
    T1["§11 UX/UI and design system<br/>Appendix D: 100 micro-patterns"]
    T2["§12 web PWA → API → domain rules<br/>bounded contexts, SSOT ADR-001…013"]
    T3["§13 API, events, integrations,<br/>queues, realtime, media"]
    T4["Transactional email behind a provider port"]
  end

  subgraph QUAL["Part VI — quality, safety and operations, §14–§22"]
    direction TB
    Q1["§14 data architecture and lifecycle"]
    Q2["§15 security, privacy, compliance<br/>erasure: cancel window, completion<br/>deadline, deactivation purge"]
    Q3["§16 AI gateway · §15.10 AI safety<br/>no paid inference for free users"]
    Q4["§17 assessment integrity<br/>AI modes"]
    Q5["§19 PWA offline: cache never authoritative"]
    Q6["§20 performance and observability<br/>§21 testing and WCAG 2.2 AA<br/>§22 deployment and DR"]
    Q7["Aggregates: min_cohort_k, default k ≥ 10"]
  end

  subgraph EXEC["Part VII, appendices, Part VIII — execution and evidence"]
    direction TB
    E1["§23 roadmap: SSOT capability phases Ph0–Ph10"]
    E2["§24 gaps, risks, open decisions,<br/>locked registers §24.8"]
    E3["§25 governance and traceability<br/>DOCUMENTED ≠ IMPLEMENTED"]
    E4["Appendices A–C adjudications,<br/>register corrections, zero-trust"]
    E5["Appendix E v6.1 reconciliation<br/>V61-01…V61-31"]
    E6["Part VIII multi-agent evaluation<br/>of main @ 781866f, SSOT-AMD-01…28;<br/>second pass §27.11"]
    E7["Owner decisions pending ratification"]
  end

  ROOT --- LOOP
  ROOT --- PEOPLE
  ROOT --- FOUND
  ROOT --- WORK
  ROOT --- ARCH
  ROOT --- QUAL
  ROOT --- EXEC

  P1 -.-> L1
  P1 -.-> L9
  P2 -.-> L7
  P2 -.-> L10
  P3 -.-> L3
  P3 -.-> L6
  P5 -.-> L7
  A1 -.->|defines| LOOP
  A6 -.->|specifies| L5
  W1 -.->|J-02 apply, track, hire| L9
  W3 -.->|application states| L11
  W4 -.->|BR-149…156 verification| L6
  T2 -.-> L8
  T3 -.->|events and queues| L12
  T4 -.-> L6
  Q2 -.->|consent and erasure| L5
  Q3 -.->|human gate| L8
  Q4 -.->|integrity| L4
  Q7 -.->|salary and benchmarks| L2
  E1 -.->|Ph gates| LOOP
  E5 -.-> E7
  E6 -.-> E7

  classDef loop fill:#e8f0fe,stroke:#1a56db,color:#0b1f4d;
  classDef people fill:#e6f4ea,stroke:#2e7d32,color:#0d3b16;
  classDef found fill:#f3e8fd,stroke:#7b1fa2,color:#3b0a52;
  classDef arch fill:#fff4e5,stroke:#b26a00,color:#4a2c00;
  classDef qual fill:#fdecea,stroke:#c62828,color:#4d0b0b;
  classDef exec fill:#eceff1,stroke:#546e7a,color:#1c2b33;
  classDef root fill:#0b1f4d,stroke:#0b1f4d,color:#ffffff;
  class L1,L2,L3,L4,L5,L6,L7,L8,L9,L10,L11,L12 loop;
  class P1,P2,P3,P4,P5 people;
  class A1,A2,A3,A4,A5,A6,W1,W2,W3,W4 found;
  class T1,T2,T3,T4 arch;
  class Q1,Q2,Q3,Q4,Q5,Q6,Q7 qual;
  class E1,E2,E3,E4,E5,E6,E7 exec;
  class ROOT root;
```

---

# PART I — CANONICAL V6 FOUNDER AMENDMENTS

This section is deliberately short and authoritative. It records only decisions that materially change or clarify the inherited detailed corpus.

## A. Architecture

> v6.1 amendment: see Appendix E, items V61-14 and V61-15

1. **Initial application architecture:** React + TypeScript + Vite PWA, Node.js + Fastify + TypeScript modular monolith, PostgreSQL/Supabase.
2. **API authority:** Browser domain mutations go through the application API. RLS protects database access; it is not the sole business-logic boundary.
3. **Async:** Supabase Queues + dedicated workers for durable/heavy processing; Edge Functions for webhooks, short-lived HTTP work and bounded AI orchestration.
4. **Search:** PostgreSQL FTS/trigram until measured query/scale evidence justifies extraction.
5. **Realtime:** advisory UX transport only; persistence/state remains authoritative.
6. **Caching:** start with browser/application caching and TanStack Query; add distributed cache only when measured need exists.
7. **Shared kernel:** keep it deliberately small. AI, automation, media, analytics, trust and domain logic do not become an indiscriminate shared kernel.

## B. Product scope

> v6.1 amendment: see Appendix E, item V61-03

- The 173-feature portfolio is preserved for capability traceability.
- Initial GA is not defined by building all 173 features.
- GA must first prove the trusted career loop: **Goal → Gap → Learn → Practice → Prove → Verify → Discover → Match → Apply → Interview → Outcome → New Evidence.**
- This is the **canonical GA loop**. The §1.1 core loop, the §2.1 vision loop, the §2.3 career flywheel, the Ph1 exit (§23.1) and the MVP exit criteria (§23.3) are views or subsets of it, not competing definitions. The target's use of the flywheel as the product loop (ADR-T01) is Proposed (V61-03).
- Marketplace, advanced OS-like capabilities, broad social parity, proctoring, and advanced enterprise expansion remain staged.

## C. AI

> v6.1 amendment: see Appendix E, item V61-09

- AI Gateway/Orchestrator is foundational infrastructure, not a late-phase add-on.
- One user-facing **My AI** configuration governs eligible AI experiences.
- Provider authorization is distinct from TalentSphere subscription/entitlement.
- A consumer AI subscription does not automatically give TalentSphere API rights.
- Free users cannot trigger paid TalentSphere inference without an active explicit cost policy. No price, AI quota or allowance is decided in this file; this rule and §16.4 are the binding AI-cost rules (V61-09).
- Local/on-device AI is capability-detected and optional.
- AI outputs never silently become verified evidence.

## D. Assessment integrity

During `AI_PROHIBITED`, the policy must propagate across every TalentSphere AI entry point. UI hiding is not enforcement.

## E. Hiring intelligence

Any candidate-level predictive/automated hiring decision capability is excluded from GA unless a separate governance, validation, fairness, human-control and legal review explicitly admits it. Descriptive benchmarking remains permissible.

## F. Evidence and credentials

Evidence lineage is append-only in meaning: corrections produce new versions/events. Credentials have lifecycle and provenance. Portable credential standards are optional and must not be misrepresented.

## G. Privacy

> v6.1 amendment: see Appendix E, items V61-04 and V61-07

Retention, cohort thresholds, compensation rules and similar values are policy configuration, not universal architectural constants. Cohort and small-cell minimums are one policy parameter, `min_cohort_k`, with default **k ≥ 10** for public and sensitive cells (BR-178; what k counts, distinct people or reports, is open, §27.8 item 18); stricter feature values are overrides, and any value below the default needs an owner and counsel decision (V61-04). Erasure uses three separate clocks (cancel window, completion deadline, deactivation purge); a 30-day cancel window and a 30-day completion deadline cannot both hold from the same start, which is an open owner decision (DOR-017); see V61-07. India privacy implementation must be mapped to the applicable DPDP legal timeline and actual controls before compliance is claimed.

## H. Production readiness

> v6.1 amendment: see Appendix E, item V61-29

Specification-complete is never equivalent to software production-ready. Production readiness requires executable evidence across security, data integrity, tests, accessibility, performance, reliability, backup/restore, operations, privacy and rollback.

---

# PART II — PRODUCT FOUNDATION

## 1. Executive Summary

TalentSphere is a **PWA-first Career Operating System** built around a **Talent Graph + Evidence Graph**. It connects learning, skills, proof, verification, networking, opportunities, hiring, reputation, and career intelligence into one reinforcing lifecycle.

### 1.1 Core loop

> v6.1 amendment: see Appendix E, item V61-03

This loop is a descriptive view of the career lifecycle (after Match it shows Work and Build experience where Amendment B has Apply, Interview and Outcome); the canonical GA loop is Amendment B.

```text
CAREER GOAL
→ UNDERSTAND GAP
→ LEARN
→ PRACTICE
→ PROVE
→ VERIFY
→ DISCOVER
→ MATCH
→ WORK
→ BUILD EXPERIENCE
→ CREATE NEW EVIDENCE
→ UPDATE CAREER GRAPH
```

### 1.2 Product objective

The durable product asset is not a profile page or job board; it is the **evidence-backed career graph** that connects capability, proof, learning, experience, opportunities, and outcomes while keeping user control, explainability, privacy, and trust at the center.

---

## 2. Product Vision, Mission & Strategy

### 2.1 Vision

Make career growth transparent, verifiable, and accessible through one ecosystem where **Learn → Prove → Showcase → Match → Apply → Hire → Grow** forms a continuous loop. This vision loop is a summary view of the canonical GA loop in Amendment B (V61-03).

### 2.2 Product class

TalentSphere combines capabilities commonly distributed across learning platforms, professional networks, employer-insight products, assessment platforms, and institutional career systems, while remaining functionally independent of external competitor platforms. LinkedIn may be an optional import/syndication path; it is not a runtime foundation.

### 2.3 Flywheels

> v6.1 amendment: see Appendix E, item V61-03

- **Career:** learn → prove → showcase → match → apply → hire → grow → learn. This flywheel is a summary view of the canonical GA loop in Amendment B; the target's adoption of it as the product loop (ADR-T01) is Proposed (V61-03).
- **Evidence:** more valid evidence → stronger matching/recommendation → better outcomes → more verified evidence.
- **B2B2C:** institution-managed learning → verified signals → transition to independent career identity → opportunity participation → outcome evidence.
- **Content/community:** publish/participate → useful engagement → reputation → opportunity discovery → more contribution.

### 2.4 Success metrics

> v6.1 amendment: see Appendix E, item V61-28

Primary product outcome: **career progress with verifiable evidence**. Supporting measures include verified skills, evidence quality/freshness, learning progression, assessment improvement, qualified applications, interviews, offers, hires, retention, and learning-to-outcome signals. Business metrics cover activation, retention, conversion, revenue, gross margin, AI cost, operational cost, and enterprise expansion separately.

### 2.5 Strategic discipline

Every capability must support user value, business value, technical leverage, or strategic defensibility. Avoid feature accumulation that does not strengthen the core career loop.

---

## 3. Product Constitution & Non-Negotiable Invariants

### 3.1 Principles

1. Verified over claimed.
2. Candidate dignity first.
3. Human-controlled AI.
4. Progressive disclosure.
5. One semantic model.
6. Defense in depth.
7. Observable by default.
8. Accessibility by default.
9. Monetization follows value.
10. Simplicity before scale.
11. Evidence over popularity.
12. No deterministic career promises.

Measured: 12 principles are listed here; §24.8.1 locks the P count at 11, and no P- ids are defined in this file (V61-06). Neither figure is edited; reconciling them is a C3 change (§24.8.3) for the owner.

### 3.2 Invariants

- RLS is a database security boundary, with application authorization layered above it.
- Direct client database writes are forbidden for domain mutations; writes go through server-authoritative application logic.
- No autonomous consequential AI action.
- Assessment AI restrictions are enforced server-side and cannot be bypassed via another feature/provider.
- Free users do not cause paid TalentSphere AI inference unless an explicit active cost policy permits it.
- Secrets remain server-side.
- Cross-tenant exposure is a critical incident.
- AI memory is not profile truth or verified evidence.
- Evidence and credential lifecycle changes remain auditable.
- Offline cache is never authoritative for sensitive/server-authoritative decisions.
- Recommender/matching outputs are explainable and uncertainty-aware.
- Reputation is contextual; popularity alone is not credibility.
- Anomaly is not guilt.
- Every consequential side effect is idempotent and auditable.
- The final SSOT contains one authoritative answer per material concept.

Measured: 15 unnumbered invariants are listed here; §24.8.1 locks the INV count at 16, and no INV- ids are defined in this file (V61-06). Deny-by-default is stated in SSOT ADR-003 (§12.12) and §14.6 but not listed here; nothing records whether it is the uncounted invariant. Reconciling the counts is a C3 change (§24.8.3) for the owner.

### 3.3 Scope exclusions / gates

Cryptocurrency/token products, blockchain-backed credentials, general-purpose non-career marketplaces, autonomous consequential AI, native apps as a prerequisite, unrestricted hardware integration, and runtime dependence on LinkedIn/Udemy/Coursera/Glassdoor/HackerRank are excluded. Proctoring, premium candidate features, and other explicitly gated capabilities require a ratified decision before implementation.

---

## 4. Scope, Non-Goals & Product Boundaries

### 4.1 Scope guardrails

The product is a browser/PWA career platform, not a general operating system. “OS” describes the breadth of the career workflow, not kernel-level or unrestricted device functionality.

### 4.2 Explicit non-goals

Do not turn TalentSphere into a sales-prospecting suite, self-serve advertising network, general-purpose marketplace, social-media clone, or generic HR/payroll system. Avoid opaque pay-to-rank hiring, ungoverned autonomous AI decisions, and unnecessary realtime/live-streaming infrastructure.

### 4.3 External ecosystem stance

External platforms may be adapters or import sources. TalentSphere remains independently functional and stores its own canonical user, job, learning, evidence, reputation, and outcome state.

---

## 5. Users, Roles, Permissions & Journey System

> v6.1 amendment: see Appendix E, item V61-05

Primary actor groups include candidates/learners, instructors/course authors, recruiters, hiring managers, employers/organizations, institution administrators/faculty/proctors, mentors/experts, moderators, verification staff, support operators, and platform administrators. These groups map onto the two-tier role vocabulary of §5.4, which is the role model of record for this file; a group without a §5.4 role has no defined permissions (V61-05). Feature specs also name actors with no §5.4 role: Analyst (F-85, F-86, F-114), Exam Administrator (F-115) and Employer (F-08, F-96); until mapped they have no permissions (open, V61-05).

### 5.1 Authorization chain

```text
IDENTITY
→ ROLE
→ PERMISSION
→ RESOURCE OWNERSHIP
→ TENANT / WORKSPACE
→ PURPOSE / CONTEXT
→ POLICY DECISION
```

Never trust client-supplied role, tenant, or ownership identifiers.

### 5.2 Journey contract

```text
ENTRY → DISCOVERY → ONBOARDING → SETUP → FIRST VALUE → CORE WORKFLOW → SUCCESS → FOLLOW-UP → RETENTION
```

### 5.3 Recovery contract

```text
ERROR → DETECTION → EXPLANATION → RECOVERY OPTION → RETRY / ALTERNATIVE → RESOLUTION
```

Every journey accounts for incomplete data, mistakes, permission denial, offline/intermittent network, duplicate action, race conditions, timeouts, partial completion, service failure, abandonment, and returning later.

### 5.4 Two-Tier Authorization

> v6.1 amendment: see Appendix E, items V61-05, V61-13 and V61-14

**Tier 1 (JWT, Supabase Auth):** `ROLE_USER` · `ROLE_RECRUITER` · `ROLE_ADMIN`.

**Tier 2 (24 contextual roles, workspace-scoped):**

Candidate · Recruiter · Hiring Manager · Interviewer · Org Admin · Agency Recruiter · Finance Admin · Support Agent · Moderator · Platform Admin · Service Account · Instructor · Mentor · Course Author · Institution Admin · Department Admin · Faculty/Proctor · Managed Learner · Billing/Procurement Manager · Student · Peer Reviewer · Contest Participant · Content Author · Company Reviewer.

**Resolution (highest wins):** `ROLE_ADMIN` platform override (audited) → workspace contextual grants → `ROLE_RECRUITER` (requires valid `org_id` membership; how the role is granted, what makes a membership valid and which membership roles carry hiring rights are not specified — open, §27.8 item 8) → `ROLE_USER` base.

Authorization is **deny-by-default**: an actor gets a capability only through a role actually granted to it for that resource, workspace and purpose, decided server-side (§3.2 server-authoritative mutations; deny-by-default as stated in SSOT ADR-003, §12.12, and the RLS policy model, §14.6; §5.1). "Highest wins" orders only the roles an actor has been granted; it never adds a capability that no granted role carries. The target's scoped-grant model (15 roles as scoped, deny-by-default grants) is Proposed and its mapping from this two-tier model is open (V61-05, OPEN-44).

### 5.5 Personas

| ID  | Name                            | Segment                 | Primary Journeys |
| --- | ------------------------------- | ----------------------- | ---------------- |
| P-A | Aisha — Early-Career Candidate  | 22, CS grad             | J-01, J-02       |
| P-B | Rohan — Mid-Career Professional | 31, backend→AI/ML       | J-01, J-06       |
| P-C | Priya — Recruiter at Startup    | 29, 2-person TA         | J-03             |
| P-D | Dev — Platform Administrator    | 34, platform ops        | WF-08            |
| P-E | Elena — Hiring Manager          | 38, product director    | J-03, J-27       |
| P-F | Farid — Agency Recruiter        | 40, agency lead         | J-10             |
| P-G | Grace — Course Creator          | 35, ex-ML engineer      | J-07, J-18       |
| P-H | Hugo — Mentor                   | 45, principal engineer  | J-08             |
| P-I | Ivy — Institutional Partner     | 33, career counsellor   | J-09             |
| P-J | Dr. Rao — Department Head       | 52, faculty admin       | J-14, J-15       |
| P-K | Meera — Faculty/Proctor         | 34, assistant professor | J-15             |
| P-L | Tomas — Corporate L&D           | 41, enterprise training | J-16             |
| P-M | Sam — Self-Paced Learner        | 27, career switcher     | J-19             |
| P-N | Nina — Content Creator          | 30, thought leader      | J-23             |
| P-O | Omar — Job Researcher           | 28, comparison shopper  | J-22             |
| P-Q | Quinn — Competitive Programmer  | 24, ranked coder        | J-21             |
| P-R | Ravi — Career Switcher          | 34, finance→product     | J-26             |
| P-S | Sara — Hiring Manager           | 42, engineering manager | J-03, J-27       |
| P-T | Tara — Skills Analyst           | 38, corporate L&D       | J-16, J-28       |

Ids run P-A…P-T without P-P; no source defines a P-P persona, so this is a numbering gap, not a lost persona. P-D's entry is a workflow, not a journey. Where this column names a journey whose §10.2 Persona column omits the persona (P-E for J-27, P-J for J-15), the two disagree (open, see §10.2).

### 5.6 Personas → Journeys Coverage

```mermaid
flowchart LR
    PA[P-A] --> J01[J-01] & J02[J-02]
    PB[P-B] --> J01 & J06[J-06]
    PC[P-C] --> J03[J-03]
    PE[P-E] --> J03 & J27[J-27]
    PG[P-G] --> J07[J-07] & J18[J-18]
    PI[P-I] --> J09[J-09]
    PJ[P-J] --> J14[J-14] & J15[J-15]
    PM[P-M] --> J19[J-19]
    PR[P-R] --> J26[J-26]
    PS[P-S] --> J03 & J27
    PT[P-T] --> J16[J-16] & J28[J-28]
    PD[P-D] --> WF08[WF-08 workflow]
    PF[P-F] --> J10[J-10]
    PH[P-H] --> J08[J-08]
    PK[P-K] --> J15
    PL[P-L] --> J16
    PN[P-N] --> J23[J-23]
    PO[P-O] --> J22[J-22]
    PQ[P-Q] --> J21[J-21]
```

### 5.7 Lifecycles

> v6.1 amendment: see Appendix E, items V61-11 and V61-18

**Account:** registered → unverified → verified → active ⇄ suspended → deactivated → deleted | terminated. State sets differ between this lifecycle (starts at `registered`) and the F-01 diagram in §9.1 (no `registered` state; starts at `unverified`; `suspended → deleted` and no `suspended → deactivated`; `terminated` only from `active`) — see V61-11. Neither defines an exit for an account that never verifies, a reactivation from `deactivated`, or an appeal from `suspended` (open, owner decision).

**Managed learner:** provisioned → invited → claimed → active_managed → graduation_pending → independent | revoked → archived.

**Instructor:** applicant → under_review → approved → active ⇄ suspended → retired.

**Course (authoring):** draft → submitted_for_review → under_review → approved → published → updating → archived | unpublished.

**Contest:** draft → scheduled → registration_open → active → ended → results_published → archived.

---

### 5.8 Master Permission Matrix

> v6.1 amendment: see Appendix E, item V61-05

This matrix is **illustrative for the capabilities it lists only**. It covers 10 of the Tier-2 roles and 12 course, content and review capabilities; it does not define permissions for other roles (for example Candidate or Recruiter) or other capabilities. Anything not granted here or elsewhere is denied (§5.4).

Legend: ✅ full · ✅* consent/context-scoped · ⛔ denied.

| Capability                     | Student | Instructor   | Course Author | Peer Reviewer | Content Author | Company Reviewer | Faculty      | Inst Admin  | Moderator | Platform Admin      |
| ------------------------------ | ------- | ------------ | ------------- | ------------- | -------------- | ---------------- | ------------ | ----------- | --------- | ------------------- |
| Publish own course             | ⛔      | ✅(assigned) | ✅            | ⛔            | ⛔             | ⛔               | ⛔           | ✅(inst)    | ⛔        | ✅                  |
| Approve course for marketplace | ⛔      | ⛔           | ⛔            | ⛔            | ⛔             | ⛔               | ⛔           | ⛔          | ✅        | ✅                  |
| Grade assignments              | ⛔      | ✅(own)      | ✅(own)       | ✅(rubric)    | ⛔             | ⛔               | ✅(assigned) | ⛔          | ⛔        | ✅                  |
| Peer-review submissions        | ⛔      | ⛔           | ⛔            | ✅(assigned)  | ⛔             | ⛔               | ⛔           | ⛔          | ⛔        | ✅                  |
| Create posts/articles          | ✅      | ✅           | ✅            | ✅            | ✅             | ⛔               | ✅           | ✅          | ✅        | ✅                  |
| Moderate UGC                   | ⛔      | own          | own           | ⛔            | own            | ⛔               | ⛔           | inst-scoped | ✅        | ✅                  |
| Write company review           | ✅      | ✅           | ✅            | ✅            | ✅             | ✅               | ✅           | ⛔(own org) | ✅        | ✅                  |
| Submit salary report           | ✅      | ✅           | ✅            | ✅            | ✅             | ✅               | ✅           | ⛔          | ⛔        | ✅                  |
| Create/grade contest           | ⛔      | ✅(own)      | ✅(own)       | ⛔            | ⛔             | ⛔               | ⛔           | ✅(inst)    | ⛔        | ✅                  |
| Manage coupons/pricing         | ⛔      | ⛔           | ✅(bounded)   | ⛔            | ⛔             | ⛔               | ⛔           | ✅(inst)    | ⛔        | ✅                  |
| View instructor earnings       | ⛔      | ⛔           | ✅(own)       | ⛔            | ⛔             | ⛔               | ⛔           | ⛔          | ⛔        | ✅                  |
| Refunds                        | ⛔      | ⛔           | ⛔            | ⛔            | ⛔             | ⛔               | ⛔           | ⛔          | ⛔        | ✅ (+Finance Admin) |

Open: the Instructor column denies "View instructor earnings", although BR-101 defines instructor earnings and J-18 pays creators. The legend's ✅* is used by no cell, and the cell values `own` and `inst-scoped` are not in the legend.

### 5.9 Boundary Principles

> [!IMPORTANT]
>
> - No cross-user mutation without consent/legal basis
> - Recruiter access is application-scoped
> - Moderation escalations are quorum-based
> - Faculty scoped to assigned batches
> - Managed learners cannot self-enrol outside license pool nor apply pre-graduation
> - Peer reviewers see only the submission under review, never reviewer identity (double-blind)
> - Anonymous company reviews hide identity from employer/public, never from Platform Admin/legal
> - Instructors cannot review or rate their own courses

---

# PART III — FEATURE MODEL

---

## 6. Canonical Domain Ontology

> v6.1 amendment: see Appendix E, item V61-16 (consent scope catalogue, Proposed)

| Concept                  | Meaning                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| User / Account           | Authenticated person or service identity.                                                                    |
| Organization             | Employer/business entity with members and scoped permissions.                                                |
| Institution              | Education/training entity with managed learners and institutional policies.                                  |
| Profile                  | User-controlled professional representation and preferences.                                                 |
| Skill                    | Canonical capability concept in the governed skill ontology.                                                 |
| Competency               | Structured group of related skills and proficiency expectations.                                             |
| Capability               | Evidence-informed representation of what a person can perform in context.                                    |
| Goal                     | Target career/development objective with desired outcomes.                                                   |
| Experience               | Attributable period/body of work.                                                                            |
| Evidence                 | Artifact or observation supporting a claim, capability, credential, or outcome.                              |
| Credential               | Formal attestation issued by an issuer with scope and lifecycle.                                             |
| Verification             | Auditable act validating authenticity/correctness.                                                           |
| Reputation               | Contextual trust representation derived from governed signals.                                               |
| Opportunity              | Career-related opportunity such as job, project, apprenticeship, scholarship, volunteer work, or mentorship. |
| Assessment               | Governed evaluation with tasks, policy, attempts, scoring, and integrity rules.                              |
| Learning Resource / Path | Course, lesson, activity, or ordered learning program.                                                       |
| Application              | Structured submission to an opportunity with lifecycle and feedback.                                         |
| Recommendation           | Explainable suggested action/content/opportunity with evidence and freshness.                                |
| Contribution             | Attributable work/community action that may create evidence.                                                 |
| Consent                  | Purpose-bound, versioned permission/acknowledgement.                                                         |
| Entitlement              | Access state derived from subscription/policy/organization licensing.                                        |
| Audit Event              | Record of consequential activity and context.                                                                |
| Trust Signal             | Bounded signal used for integrity/confidence analysis.                                                       |

### 6.1 Evidence semantics

> v6.1 amendment: see Appendix E, item V61-17

A claim is not verified evidence. Evidence records provenance, source reliability, directness, verification level, recency, lifecycle state, visibility, conflicts, and downstream impact. Confidence is multidimensional rather than an unexplained universal score.

### 6.2 Skill ontology

Skills are versioned and governed with stable identifiers, aliases, parent/child and related-skill relationships, prerequisites, industry mappings, lifecycle status, and provenance. Ontology changes require downstream migration/recalculation rules.

### 6.3 Evidence conflicts and revocation

Conflicting authoritative evidence becomes explicitly disputed. Revocation triggers downstream capability/matching/recommendation impact analysis and preserves an auditable chain rather than silently rewriting history.

---

## 7. Canonical Feature Inventory — 173 Unique Features

**Authority:** the following register is the one active feature identity and priority/dependency index. Alternate or duplicate historical IDs are not active definitions.

> **Authority:** every feature from every edition is preserved. The three sub-tables below are the single canonical register. Priority `P` and `Phase` here GOVERN any priority-band list elsewhere (the tier blocks §9.2–§9.4), the roadmap (§23.1 Phases) and the dependency-aware build order (§23.2). Renumbering history: the note on §7.3 (F-144 … F-173, former F-121 … F-150) and Appendix B (Register Corrections); register counts are locked by §24.8.3.

> v6.1 amendment: see Appendix E, items V61-02 (the `Phase` column uses the SSOT capability-phase scale; do not equate it with other phase scales) and V61-30 (SSOT `F-*` ids are a separate namespace from target `CAP-*` and `FEAT-*` ids)

### 7.1 Baseline & Core Features (F-01 … F-120)

| ID    | Feature                                      | Category       | P   | Phase   | Key dependencies                    |
| ----- | -------------------------------------------- | -------------- | --- | ------- | ----------------------------------- |
| F-01  | Authentication & Session                     | Identity       | 10  | Ph0     | –                                   |
| F-02  | Landing Page                                 | Shell          | 3   | Ph0     | –                                   |
| F-03  | Dashboard (Role-Adaptive)                    | Shell          | 10  | Ph0     | F-01                                |
| F-04  | Job Marketplace                              | Marketplace    | 9   | Ph2     | F-01, F-12                          |
| F-05  | Post Job Studio                              | Marketplace    | 8   | Ph2     | F-04                                |
| F-06  | ATS / Candidate Pipeline                     | Recruiting     | 9   | Ph2–3   | F-04, F-05                          |
| F-07  | Learning Management System                   | Learning       | 9   | Ph1     | F-01, F-12                          |
| F-08  | Challenges Arena                             | Assessment     | 9   | Ph1     | F-01, F-12                          |
| F-09  | Professional Networking                      | Social         | 8   | Ph2     | F-12                                |
| F-10  | Direct Messaging                             | Communication  | 10  | Ph0     | F-01                                |
| F-11  | AI Career Assistant (Basic)                  | AI             | 8   | Ph1/Ph4 | F-12                                |
| F-12  | Profile Management                           | Identity       | 10  | Ph0     | F-01                                |
| F-13  | Resume Builder                               | Identity       | 7   | Ph1     | F-12                                |
| F-14  | Notification Center                          | Communication  | 10  | Ph0     | F-01                                |
| F-15  | Settings                                     | Shell          | 10  | Ph0     | F-01                                |
| F-16  | Billing & Subscriptions                      | Monetization   | 7   | Ph5     | F-01                                |
| F-17  | Admin Console                                | Governance     | 10  | Ph0     | F-01                                |
| F-18  | Chrome Extension Companion                   | Edge           | 5   | Ph2     | F-01                                |
| F-19  | Product Analytics                            | Telemetry      | 7   | Ph1     | F-01                                |
| F-20  | Command Search (⌘K)                          | Shell          | 7   | Ph2     | F-01                                |
| F-21  | Error Recovery & Resilience                  | Shell          | 10  | Ph0     | F-01                                |
| F-22  | Gamification & XP Ledger                     | Engagement     | 8   | Ph1     | F-07, F-08                          |
| F-23  | Leaderboard & Badges                         | Engagement     | 7   | Ph2     | F-22                                |
| F-24  | Trust, Safety & Moderation                   | Safety         | 8   | Ph2     | F-01                                |
| F-25  | Job Detail View                              | Marketplace    | 7   | Ph2     | F-04                                |
| F-26  | Portfolio Showcase                           | Identity       | 8   | Ph1     | F-12                                |
| F-27  | Local Resume Match Preview                   | Edge           | 6   | Ph2     | F-18                                |
| F-28  | External Job Page Scanner                    | Edge           | 6   | Ph2     | F-18                                |
| F-29  | Scheduled Notification Digest                | Communication  | 7   | Ph2     | F-14                                |
| F-30  | Networking Stale-Request Nudges              | Engagement     | 6   | Ph2     | F-09                                |
| F-31  | KPI Aggregation & Rollups                    | Analytics      | 6   | Ph2     | F-19                                |
| F-32  | Saved Searches & Job Alerts                  | Candidate      | 7   | Ph2     | F-04                                |
| F-33  | Video Interview Rooms                        | Communication  | 8   | Ph3     | F-10                                |
| F-34  | Multi-Entity Backend Search                  | Platform       | 7   | Ph2     | F-04, F-07                          |
| F-35  | Feature Flag Console                         | Administration | 6   | Ph2     | F-17                                |
| F-36  | Application Draft Autosave                   | Candidate      | 7   | Ph1     | F-04                                |
| F-37  | Job Templates                                | Recruiting     | 6   | Ph2     | F-05                                |
| F-38  | Legacy Chat Service (DEPRECATED)             | Communication  | 0   | –       | –                                   |
| F-39  | Unified Backend Stub (DEPRECATED)            | Platform       | 0   | –       | –                                   |
| F-40  | Institutional Managed Learning               | Institutions   | 8   | Ph3     | F-01, F-07                          |
| F-41  | Procurement & Seat Licensing                 | Institutions   | 6   | Ph6     | F-40, F-16                          |
| F-42  | Provider-Agnostic Media Engine               | Platform       | 8   | Ph2     | F-07                                |
| F-43  | B2B2C Graduation Flywheel                    | Institutions   | 6   | Ph3     | F-40                                |
| F-44  | AI Media Enrichment                          | Learning       | 6   | Ph4     | F-42, F-11                          |
| F-45  | Proctoring (Third-Party, vendor-gated OD-35) | Learning       | 4   | Ph10    | F-40, F-115                         |
| F-46  | Institutional Analytics                      | Institutions   | 6   | Ph3     | F-40                                |
| F-47  | Faculty Dashboard                            | Institutions   | 6   | Ph3     | F-40                                |
| F-48  | OS Shell & Workbench                         | OS             | 4   | Ph2+    | F-01, F-03                          |
| F-49  | Automation & Agents                          | OS             | 4   | Ph3+    | F-48                                |
| F-50  | Institutional Course Marketplace             | Institutions   | 6   | Ph3     | F-40, F-42                          |
| F-51  | Media Health Monitoring                      | Platform       | 6   | Ph4     | F-42                                |
| F-52  | Certificate Verification                     | Verification   | 8   | Ph3     | F-07                                |
| F-53  | Professional Social Graph & Feed             | Networking     | 5   | Ph8     | F-12                                |
| F-54  | Content Publishing                           | Networking     | 5   | Ph8     | F-12                                |
| F-55  | Groups & Communities                         | Community      | 5   | Ph8     | F-53                                |
| F-56  | Organization & Institution Pages             | Recruiting     | 5   | Ph8     | F-12, F-40                          |
| F-57  | Events & Webinars                            | Community      | 5   | Ph8     | F-53                                |
| F-58  | Written Recommendations                      | Networking     | 6   | Ph8     | F-53                                |
| F-59  | Outreach Credits (TalentMail)                | Recruiting     | 5   | Ph8     | F-10                                |
| F-60  | Profile Views & Privacy Controls             | Networking     | 6   | Ph8     | F-12                                |
| F-61  | Premium Candidate Tier (OD-34 gated)         | Business       | 4   | Ph10+   | F-60                                |
| F-62  | Sponsored Content (NOT RECOMMENDED)          | Business       | 0   | Ph10+   | –                                   |
| F-63  | Business-Development Graph (NOT RECOMMENDED) | Intelligence   | 0   | Ph10+   | –                                   |
| F-64  | LinkedIn Migration Engine                    | Integration    | 5   | Ph1/2   | F-12                                |
| F-65  | LinkedIn Decoupling & Independence           | Foundation     | 8   | Ph1/2   | F-64                                |
| F-66  | Course Creation Studio                       | Learning       | 8   | Ph7     | F-07, F-42                          |
| F-67  | Categories, Discovery & Comparison           | Learning       | 6   | Ph7     | F-07, F-145                         |
| F-68  | Quizzes, Practice Tests & Final Exams        | Learning       | 8   | Ph7     | F-07                                |
| F-69  | Assignments & Peer Review                    | Learning       | 8   | Ph7     | F-07                                |
| F-70  | Learning Paths, Programs & Specializations   | Learning       | 8   | Ph7     | F-07, F-66                          |
| F-71  | Course Q&A, Discussions, Notes               | Learning       | 6   | Ph7     | F-07                                |
| F-72  | Course Reviews & Ratings                     | Learning       | 6   | Ph7     | F-07                                |
| F-73  | Course Commerce                              | Learning       | 6   | Ph7     | F-07, F-16                          |
| F-74  | Instructor Platform                          | Learning       | 6   | Ph7     | F-07, F-66                          |
| F-75  | Employer Insights                            | Intelligence   | 7   | Ph9     | F-12, F-56                          |
| F-76  | Coding Contests & Live Leaderboards          | Assessment     | 5   | Ph9     | F-08                                |
| F-77  | Skill Certification Exams                    | Assessment     | 8   | Ph3     | F-08                                |
| F-78  | Practice Sets & Interview Prep               | Learning       | 5   | Ph9     | F-08                                |
| F-79  | Articles & Newsletters                       | Networking     | 5   | Ph8     | F-54                                |
| F-80  | Profile Enhancements                         | Profile        | 6   | Ph1/Ph8 | F-12                                |
| F-81  | Identity Verification                        | Verification   | 3   | Ph9     | F-12                                |
| F-82  | Student Learning Analytics                   | Analytics      | 6   | Ph7     | F-07                                |
| F-83  | Admin Platform Expansion                     | Administration | 3   | Ph8     | F-17                                |
| F-84  | Skills Graph & Taxonomy                      | Platform       | 10  | Ph1–2   | F-12, F-07, F-08                    |
| F-85  | Career Graph & Progression                   | Intelligence   | 9   | Ph3     | F-12, F-04, F-06, F-84              |
| F-86  | Salary Intelligence                          | Intelligence   | 9   | Ph3     | F-04, F-06, F-56                    |
| F-87  | Interview Experience Repository              | Candidate      | 7   | Ph4     | F-04, F-56, F-88                    |
| F-88  | Technical Interview Platform                 | Hiring         | 9   | Ph3     | F-08, F-33, F-06                    |
| F-89  | Contribution Verification System             | Verification   | 5   | Ph8     | F-26, F-12                          |
| F-90  | Peer Mentorship & Advisor Network            | Community      | 5   | Ph4     | F-12, F-10, F-55                    |
| F-91  | Career Readiness Assessment                  | Career         | 9   | Ph2     | F-84, F-08, F-12                    |
| F-92  | Advanced Recruiter Search                    | Recruiting     | 9   | Ph3     | F-12, F-34, F-08, F-96              |
| F-93  | Interview Video Recording & AI Feedback      | Hiring         | 7   | Ph4     | F-33, F-06, F-88                    |
| F-94  | Verified Work History & References           | Verification   | 7   | Ph3     | F-12, F-58                          |
| F-95  | Career Transition Planning                   | Career         | 7   | Ph4     | F-84, F-91, F-07                    |
| F-96  | Skill Evidence & Digital Credentials         | Verification   | 10  | Ph2     | F-12, F-26                          |
| F-97  | Real-Time Job Market Analytics               | Intelligence   | 5   | Ph4     | F-04, F-06                          |
| F-98  | Employer Equity & Compensation Intelligence  | Intelligence   | 7   | Ph3     | F-56, F-86                          |
| F-99  | AI Career Coach (Enhanced)                   | AI             | 7   | Ph4     | F-12, F-84, F-91, F-07              |
| F-100 | Peer Project Collaboration                   | Learning       | 4   | Ph5     | F-07, F-69, F-10                    |
| F-101 | Badge Marketplace & Recognition              | Gamification   | 4   | Ph8     | F-23, F-26                          |
| F-102 | Hiring Manager Portal                        | Recruiting     | 8   | Ph3     | F-06, F-88                          |
| F-103 | Candidate Comparison & Rubric                | Recruiting     | 6   | Ph3     | F-06, F-92                          |
| F-104 | Pre-Hire Assessment Customization            | Hiring         | 7   | Ph3     | F-06, F-08, F-88                    |
| F-105 | Post-Hire Analytics & ROI Tracking           | Analytics      | 4   | Ph4     | F-102, F-93                         |
| F-106 | Skill Prerequisite Engine                    | Learning       | 7   | Ph5     | F-07, F-70, F-84                    |
| F-107 | Live Q&A with Instructors                    | Learning       | 6   | Ph5     | F-07, F-71, F-10                    |
| F-108 | Expert Network Matching                      | Networking     | 4   | Ph7     | F-09, F-12, F-10                    |
| F-109 | Salary Negotiation Guidance                  | Career         | 5   | Ph8     | F-86, F-98                          |
| F-110 | Verified Skill Endorsements                  | Verification   | 7   | Ph8     | F-96, F-12, F-58                    |
| F-111 | Industry-Specific Learning Hubs              | Learning       | 4   | Ph8     | F-07, F-55                          |
| F-112 | Resume Parsing & Optimization                | Candidate      | 6   | Ph8     | F-13, F-12                          |
| F-113 | Recruiter Outreach Analytics                 | Recruiting     | 6   | Ph8     | F-59, F-06                          |
| F-114 | Learning Impact Tracking                     | Analytics      | 9   | Ph4     | F-07, F-04, F-06                    |
| F-115 | Certification Exam Platform                  | Assessment     | 9   | Ph3     | F-77, F-45 (optional; F-45 is Ph10) |
| F-116 | Accessibility & Inclusive Learning           | Platform       | 7   | Ph8     | F-07, F-44                          |
| F-117 | Mobile-First Job Application                 | Candidate      | 5   | Ph8     | F-04, F-33                          |
| F-118 | Emerging Skills Detection                    | Intelligence   | 4   | Ph8     | F-84                                |
| F-119 | Diversity & Inclusion Analytics              | Hiring         | 4   | Ph8     | F-06                                |
| F-120 | API & Integration Platform                   | Platform       | 2   | Ph10    | F-01, F-34                          |

### 7.2 v2.1 Integration Family (F-121 … F-143) — preserved numbering

| ID    | Feature                                 | Category     | P   | Phase | Key dependencies        |
| ----- | --------------------------------------- | ------------ | --- | ----- | ----------------------- |
| F-121 | Warm Introduction Paths                 | Networking   | 8   | Ph4   | F-09, F-12, F-56, F-125 |
| F-122 | Application Feedback Loop               | Jobs         | 9   | Ph3   | F-06, F-04              |
| F-123 | Skill Decay Tracking (Freshness Engine) | Verification | 9   | Ph3   | F-84, F-96              |
| F-124 | Project Marketplace                     | Learning     | 5   | Ph5   | F-07, F-26, F-100       |
| F-125 | Alumni Networks                         | Networking   | 7   | Ph4   | F-12, F-09, F-40        |
| F-126 | Interview Prep Marketplace              | Careers      | 5   | Ph4   | F-87, F-90, F-88        |
| F-127 | Company Culture Assessment              | Companies    | 4   | Ph5   | F-56, F-75              |
| F-128 | Offer Comparison Tool                   | Careers      | 7   | Ph4   | F-86, F-98, F-109       |
| F-129 | Leadership Development                  | Learning     | 3   | Ph5   | F-07, F-84              |
| F-130 | Freelance Marketplace                   | Jobs         | 3   | Ph7   | F-04, F-100, F-124      |
| F-131 | Apprenticeship Matching                 | Jobs         | 3   | Ph6   | F-04, F-40              |
| F-132 | Scholarship Discovery                   | Learning     | 3   | Ph6   | F-40, F-07              |
| F-133 | Volunteer Matching                      | Community    | 2   | Ph7   | F-26, F-100             |
| F-134 | Code Review Practice                    | Skills       | 4   | Ph5   | F-08, F-26              |
| F-135 | System Design Practice                  | Skills       | 4   | Ph5   | F-88, F-08              |
| F-136 | Micro-Learning                          | Learning     | 2   | Ph4   | F-07, F-42              |
| F-137 | Spaced Repetition                       | Learning     | 2   | Ph6   | F-07, F-68              |
| F-138 | Study Accountability Partners           | Learning     | 3   | Ph6   | F-07, F-55              |
| F-139 | Local Communities & Meetups             | Networking   | 3   | Ph7   | F-09, F-55, F-57        |
| F-140 | Affinity Groups                         | Community    | 3   | Ph7   | F-55, F-09              |
| F-141 | Onboarding Preparation                  | Careers      | 1   | Ph8   | F-06, F-33              |
| F-142 | Referral Request System                 | Jobs         | 8   | Ph4   | F-09, F-04              |
| F-143 | OSS Contribution Discovery              | Portfolio    | 4   | Ph8   | F-89, F-26              |

### 7.3 Gap-Analysis Family (F-144 … F-173) — renumbered (former F-121 … F-150)

Amendment E excludes candidate-level predictive or automated hiring-decision capability from GA unless a separate review admits it, and §15.10.2 prohibits predictive performance scoring. F-154 (Interview Prediction & Benchmarking) and F-168 (Hiring Prediction & Success Modeling) carry no such gate in this table; whether they fall under it or are limited to descriptive benchmarking is open (owner decision).

| ID    | Feature                                      | Category        | P   | Phase | Key dependencies   |
| ----- | -------------------------------------------- | --------------- | --- | ----- | ------------------ |
| F-144 | Reputation Engine (multi-context)            | Platform        | 9   | Ph2   | F-96, F-58, F-72   |
| F-145 | Recommendation Engine Core                   | Platform        | 8   | Ph2–3 | F-84, F-144        |
| F-146 | Activity & Contribution Tracking             | Platform        | 7   | Ph3   | F-123, F-84, F-144 |
| F-147 | Unified Search & Discovery                   | Platform        | 8   | Ph2   | F-84, F-145        |
| F-148 | Instructor Reputation System                 | Reputation      | 8   | Ph7   | F-72, F-144        |
| F-149 | Employer Reputation & Brand System           | Reputation      | 7   | Ph8   | F-75, F-56, F-144  |
| F-150 | Peer Credibility Networks                    | Reputation      | 7   | Ph8   | F-110, F-144       |
| F-151 | Skill Supply/Demand Forecasting              | Intelligence    | 7   | Ph4   | F-84, F-86, F-97   |
| F-152 | Career Trajectory Analysis                   | Intelligence    | 7   | Ph4   | F-85, F-86, F-93   |
| F-153 | Learning Impact Dashboard (Enhanced)         | Intelligence    | 7   | Ph4   | F-114, F-85, F-86  |
| F-154 | Interview Prediction & Benchmarking          | Intelligence    | 6   | Ph4   | F-88, F-102, F-105 |
| F-155 | Adaptive Learning System                     | Personalization | 6   | Ph5   | F-07, F-84, F-145  |
| F-156 | Professional Development Plan System         | Career          | 6   | Ph4–5 | F-91, F-95, F-145  |
| F-157 | Skills Co-Learning Path Optimizer            | Learning        | 4   | Ph5   | F-84, F-114, F-07  |
| F-158 | Talent Pool Intelligence & Analytics         | Recruiting      | 6   | Ph3   | F-92, F-84, F-144  |
| F-159 | Behavioral Talent Discovery                  | Discovery       | 6   | Ph4   | F-123, F-84, F-144 |
| F-160 | Talent Segmentation & Classification         | Analytics       | 5   | Ph4   | F-84, F-85, F-144  |
| F-161 | Internal Mobility & Succession Platform      | Enterprise      | 3   | Ph6–7 | F-84, F-91, F-132  |
| F-162 | Verified Work History Network & Graph        | Verification    | 5   | Ph4   | F-94, F-84         |
| F-163 | Credential Wallet & Portability              | Credential      | 3   | Ph5   | F-96               |
| F-164 | Skills Evidence Narrative & Storytelling     | Credential      | 4   | Ph5   | F-96, F-26         |
| F-165 | Diversity, Equity & Inclusion Data System    | Analytics       | 3   | Ph8   | F-119              |
| F-166 | Interview Performance Benchmarking           | Analytics       | 5   | Ph4   | F-88, F-102        |
| F-167 | Candidate Comparison & Rubric (Enhanced)     | Hiring          | 5   | Ph3   | F-88, F-103        |
| F-168 | Hiring Prediction & Success Modeling         | Analytics       | 3   | Ph5   | F-88, F-105        |
| F-169 | Community Contribution Scoring & Recognition | Community       | 5   | Ph7   | F-55, F-144        |
| F-170 | Expert Network (Enhanced)                    | Community       | 4   | Ph7   | F-144, F-90        |
| F-171 | Employer Brand Management System             | Company         | 3   | Ph8   | F-56, F-75, F-149  |
| F-172 | Advanced Compensation Intelligence           | Analytics       | 4   | Ph8   | F-86, F-98, F-109  |
| F-173 | Company-to-Skills Mapping                    | Intelligence    | 3   | Ph4   | F-84, F-04         |

### 7.4 Distribution Summary

| P         | Count   |
| --------- | ------- |
| 10        | 10      |
| 9         | 14      |
| 8         | 22      |
| 7         | 29      |
| 6         | 31      |
| 5         | 23      |
| 4         | 19      |
| 3         | 16      |
| 2         | 4       |
| 1         | 1       |
| 0         | 4       |
| **Total** | **173** |

---

## 8. Foundational Systems & Dependency Model

The foundational systems below are cross-feature primitives. They are not competing features; they are reusable platform capabilities.

> The fourteen systems below carry the canonical implementation detail (see §9 Detailed Feature Specifications: F-84 and F-96 in §9.1, the others in §9.2–§9.3; S-14 (F-124) has no detailed specification in this file). Nearly every other feature consumes or feeds one of them. System IDs are stable and referenced throughout.

> v6.1 amendment: see Appendix E, item V61-04 (one cohort-minimum policy parameter for S-07 and S-08)

| System | Name                             | Primary feature | Role                                                                                                                                                                                                                                                                                                             |
| ------ | -------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-01   | Skills Graph & Taxonomy          | F-84            | Canonical, admin-curated skill taxonomy + semantic edges; foundation of matching, learning, forecasting                                                                                                                                                                                                          |
| S-02   | Verification & Credentials       | F-96            | Append-only verifiable credential store; SHA-256 + `/verify/:hash`; credential issuance                                                                                                                                                                                                                          |
| S-03   | Reputation Engine                | F-144           | Unified multi-context reputation; candidate/instructor/employer/peer; feeds matching & discovery                                                                                                                                                                                                                 |
| S-04   | Recommendation Engine Core       | F-145           | Hybrid collaborative + content-based recs with explanation layer; powers jobs/courses/mentors/content                                                                                                                                                                                                            |
| S-05   | Career Graph & Progression       | F-85            | Verified career transitions + outcomes; powers market analytics, trajectory, readiness                                                                                                                                                                                                                           |
| S-06   | Technical Interview Platform     | F-88            | Structured, fair, recordable interviews; scorer rubrics; human-in-the-loop verdicts                                                                                                                                                                                                                              |
| S-07   | Salary Intelligence              | F-86            | Transparent comp; aggregation under the cohort minimum `min_cohort_k` (default k ≥ 10 for public and sensitive cells, BR-178; the k ≥ 5 formerly stated here is an override below the default — needs owner and counsel decision; the default applies until then); negotiation + employer insight consumers      |
| S-08   | Learning Impact Tracking         | F-114           | Correlational outcome evidence linking learning to hiring/salary/retention; cohort minimum `min_cohort_k` (default k ≥ 10; F-114 sets a stricter feature override of k ≥ 30; the k ≥ 5 formerly stated here is an override below the default — needs owner and counsel decision; the default applies until then) |
| S-09   | Activity & Contribution Tracking | F-146           | Time-series behavioral signals; discovery, engagement, early-adopter detection, expertise ID                                                                                                                                                                                                                     |
| S-10   | Unified Search & Discovery       | F-147           | One discovery surface for people/jobs/courses/companies/projects/discussions; RLS-safe                                                                                                                                                                                                                           |
| S-11   | Warm Intro & Referral Network    | F-121 + F-142   | Dignified warm introductions and referral requests with tracking delivery                                                                                                                                                                                                                                        |
| S-12   | Application Feedback Loop        | F-122           | Every application receives feedback (subject to the candidate right-to-feedback setting in F-122 step 5, which allows "None" — open); #1 differentiator (P-02)                                                                                                                                                   |
| S-13   | Skill Freshness Engine           | F-123           | Decay stale skill evidence so current proof weighs more; refresher resets decay                                                                                                                                                                                                                                  |
| S-14   | Project Marketplace Infra        | F-124           | Infrastructure for project-based learning, freelance & apprenticeship; escrow via Stripe                                                                                                                                                                                                                         |

---

### 8.1 Dependency rule

Feature work must declare blocking dependencies, shared primitives, policy prerequisites, external dependencies, data prerequisites, and verification prerequisites. Circular dependencies are prohibited unless deliberately mediated by events/contracts. The §7 "Key dependencies" column is the dependency of record; where the "Feature Dependencies" and "Blocks" lines in §9 differ from it, §7 governs (measured 2026-11-22: 14 of the 15 Blocks lists that name features differ from §7; only F-115's matches). Adding a missing dependency to §7 is an owner decision.

---

## 9. Detailed Feature Specifications

The detailed records below cover the highest-leverage features first. The 173-feature register in §7 remains the complete inventory; this section supplies deeper canonical behavior for priority foundation/core features without redefining their identities. Where a §9 heading's title differs from the §7 name (F-06, F-84, F-85, F-88, F-92, F-99, F-123, F-144, F-158), the §7 name is the feature's identity.

### 9.1 Foundation Feature Specifications

#### F-01 Authentication & Session

> v6.1 amendment: see Appendix E, items V61-05 (roles), V61-07 (erasure clocks), V61-08 (email provider), V61-11 and V61-18 (state names), V61-13 (session model), V61-14 (Supabase as one candidate host) and V61-24 (age gate)

| Attribute               | Value                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feature ID**          | F-01                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Priority**            | 10                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Phase**               | Ph0                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Purpose**             | Establish and maintain authenticated user sessions with role claims                                                                                                                                                                                                                                                                                                                                                               |
| **Business Objective**  | Enable secure identity for all platform interactions                                                                                                                                                                                                                                                                                                                                                                              |
| **User Problem Solved** | Users need a secure, frictionless way to access the platform                                                                                                                                                                                                                                                                                                                                                                      |
| **Actors**              | Anonymous visitor (no session); Tier 1 roles `ROLE_USER`, `ROLE_RECRUITER`, `ROLE_ADMIN`; Tier 2 contextual roles Candidate, Recruiter, Platform Admin, Institution Admin (§5.4 Two-Tier Authorization). Authorization is deny-by-default (SSOT ADR-003, §12.12; §14.6 RLS Policy Model; §5.4); the §5.4 "highest wins" resolution applies only among roles already granted. The scoped-grant model is Proposed (V61-05, OPEN-44) |
| **Preconditions**       | Supabase Auth configured; RLS baseline migrations applied                                                                                                                                                                                                                                                                                                                                                                         |
| **Postconditions**      | Authenticated session with normalized role claims                                                                                                                                                                                                                                                                                                                                                                                 |

**Core Behavior (Step-by-Step):**

1. **Registration** — User submits email + password (or OAuth via Google/GitHub). Server validates: unique email (`auth.users.email`), password strength (zxcvbn ≥3), age gate (DOB ≥16 years), no banned email domain. On success: `auth.users` row created → trigger `on_auth_user_created` inserts `profiles` + `user_settings` → verification email sent through the transactional email provider port → user lands on onboarding wizard.
2. **Email Verification** — User clicks tokenized link (TTL 24h, single-use). `profiles.email_verified_at` set. Account state → `verified`.
3. **Login** — User submits credentials. Rate limit enforced (10/min/IP for login; 5/min/IP for password reset). On success: Supabase Auth issues JWT (1h access, 30-day sliding refresh) + refresh token. Session cookie set: `sb-access-token` (HttpOnly, Secure, SameSite=Lax).
4. **Role Normalization** — Edge middleware reads JWT `app_metadata.role` and normalizes to `ROLE_USER` / `ROLE_RECRUITER` / `ROLE_ADMIN`. Missing/invalid role → default `ROLE_USER`.
5. **Session Restore** — On page load, the client asks the server for the session (script cannot read the HttpOnly cookie of step 3). If expired, silent refresh attempt. If refresh fails, redirect to `/login` with `?return=` param; unsaved long-form input is kept as a local draft and offered for recovery after sign-in (Appendix D M-24). Partial session cleared on fatal auth error.
6. **Logout** — Server revokes JWT via `jti` denylist. Cookie cleared. Redirect to `/`.
7. **Password Reset** — User submits email → rate limited (5/min/IP). Tokenized link sent (TTL 30 min, single-use). On submission: new password validated → session revoked globally → user re-authenticated.
8. **OAuth Flow** — Google/GitHub: PKCE exchange → Supabase Auth callback → profile merged with existing email if match (no silent account takeover; consent prompt if email collision). What proof of control links the accounts is not stated; merging into an existing account whose email is unverified would allow a pre-registration takeover (open).

**Business Rules:** BR-001 (auth required), BR-002 (role separation), AUTH-001..017 (§10.14 prints these ids as BR-01 and BR-02, and BR-01's text there is "Only `ROLE_RECRUITER`/`ROLE_ADMIN` may create/edit job postings", not "auth required"; the gloss is unreconciled — open)

**Permissions:** Public: register/login/reset · Authenticated: logout/refresh/change password · Admin: revoke any session. Re-authentication before erasure, data export, or a password or email change is not specified in this file; an amendment recorded in Part VIII (SSOT-AMD-01) requires it for erasure, and the target proposes step-up for these actions (Under Review). Open (owner).

**Data Dependencies:** `auth.users` (Supabase-managed), `profiles`, `user_settings`, `audit_logs`

**API Dependencies:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/reset-password`, `POST /api/v1/auth/logout` (SCI-04 — but SCI-04 in §13.1 is "Submit challenge"; no authentication service contract is registered there — open)

**UI Dependencies:** `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`

**External Dependencies:** Supabase Auth (GoTrue), transactional email provider behind a provider port (for example Resend; the target's Brevo default is Proposed, V61-08), Google OAuth, GitHub OAuth

**Security Requirements:** HDN-008 (rate limits, lockout, jti denylist; lockout threshold, duration, unlock and per-recipient caps on reset email are not specified, and §5.3 requires a recovery path for every denial — open, DOR-007) · HDN-014 (TLS, no plaintext credentials) · MFA readiness (AUTH-008) · age gate (AUTH-017)

**Failure Modes:**

- OAuth provider unavailable → fallback to email/password login (visible message)
- Email provider down → queue verification email; show "pending" state
- Supabase Auth outage → redirect to maintenance page with honest status

**Edge Cases:**

- Multi-tab session collision → last-write-wins with warning toast
- JWT clock skew >30s → reject with "check your system clock"
- Duplicate OAuth email (GitHub vs Google) → merge prompt, never silent

**Analytics Events:** EVT-001 `user_registered`, EVT-002 `session_active`

**Notifications:** Welcome email (immediate) · Verification email (immediate) · Password reset email (immediate) · Suspicious login alert (immediate, post-MVP)

**State Machine:**

```mermaid
stateDiagram-v2
    [*] --> unverified: register
    unverified --> verified: email verified
    verified --> active: first login
    active --> suspended: admin action
    active --> deactivated: user action
    suspended --> active: admin restore
    deactivated --> deleted: deactivation purge (30 days)
    active --> terminated: severe/legal
    suspended --> deleted: purge after 30 days
    deleted --> [*]
    terminated --> [*]
```

State names are lower `snake_case` (spelling normalisation only, V61-11). The account machine has no row in the §10.9 index, and the target account vocabulary differs (V61-18).

**Erasure clocks (V61-07).** Three clocks apply and must not be read as one "30 days": the **cancel window** (time in which the holder may cancel an erasure request; SSOT intent 30 days, unratified), the **completion deadline** (erasure completed within 30 days of the request) and the **deactivation purge** (`deactivated → deleted` after 30 days, shown above; the diagram applies the same 30-day value to `suspended → deleted`). A 30-day cancel window and a 30-day completion deadline cannot both hold from the same start; this is an open owner decision (DOR-017; the target proposes a 7-day cooling-off, V61-07). The diagram has no erasure-request state and no edge out of `deactivated` except `deleted`, so a cancel window of any length cannot be exercised. `suspended → deleted` also purges an account its holder did not ask to delete, which conflicts with evidence preservation during an incident (§15.3). Both are open (DOR-017; §27.8 item 5). On deletion, data referenced by aggregates or legally retained is anonymized and everything else is deleted.

**Acceptance Criteria:**

- Login p95 latency <300ms
- 100% duplicate email rejection
- 100% weak password rejection
- Zero plaintext secrets in client bundle
- Rate limits enforced at edge
- Age gate blocks <16

**Test Requirements:** Unit (password policy, email normalization) · Integration (register→verify→login E2E) · RLS (own-row isolation) · Security (rate limits, lockout) · Accessibility (form keyboard nav)

**Feature Dependencies:** None (foundation)

---

#### F-12 Profile Management

> v6.1 amendment: see Appendix E, items V61-14 (Supabase Storage is one candidate host) and V61-27 (data residency region undecided)

| Attribute          | Value                                            |
| ------------------ | ------------------------------------------------ |
| **Feature ID**     | F-12                                             |
| **Priority**       | 10                                               |
| **Phase**          | Ph0                                              |
| **Purpose**        | Canonical professional identity record           |
| **Problem Solved** | No single source of truth for candidate identity |
| **Actors**         | Candidate, Recruiter, Admin                      |

**Core Behavior (Step-by-Step):**

1. **Profile Auto-creation** — On `auth.users` insert, trigger creates `profiles` row with `id` (FK to auth.users), `email`, `role` (from JWT), `created_at`.
2. **Basic Info Edit** — User navigates to `/profile`. Form fields: `full_name` (required, ≤120 chars), `headline` (≤120), `summary` (≤2000, sanitized markdown), `location` (city-level), `avatar_url` (upload ≤4MB, JPEG/PNG/WebP, MIME sniffed, EXIF stripped), `phone_number` (encrypted at rest AES-256-GCM, masked on public view).
3. **Skills Management** — User adds skills via typeahead from canonical skills taxonomy (F-84). Each entry: `skill_id`, `proficiency` (Beginner/Intermediate/Advanced/Expert), `years` (optional), `self_reported` (boolean — becomes verified upon platform signal).
4. **Experience** — CRUD on `profile_experience` rows: `role`, `company`, `start_date`, `end_date` (nullable for current), `description` (≤2000 sanitized markdown), `location`. Company name validated against `organizations` table when possible.
5. **Education** — CRUD on `profile_education`: `institution`, `degree`, `field_of_study`, `start_year`, `end_year`, `grade` (optional). Institution matched against known list when possible.
6. **Certifications** — CRUD on `profile_certifications`: `title`, `issuer`, `issue_date`, `expiry_date` (optional), `credential_id`, `credential_url` (HTTPS-only). Verification status flag.
7. **Portfolio** — CRUD on `profile_portfolios`: `title`, `description`, `demo_url`, `repo_url`, `media_assets` (images/PDFs ≤50MB), `tech_stack` (canonical skills). Public visibility toggle.
8. **Completeness Score** — Recomputed on every edit. Formula: weighted sum of filled sections (basic 20%, skills 15%, experience 20%, education 15%, certifications 10%, portfolio 10%, summary 10%). Score 0–100.
9. **Visibility Toggles** — Per-section control: `public` / `connections_only` / `recruiters_only` / `private`.
10. **Public View** — `/profile/:userId` renders public-safe columns only. PII columns (`phone_number`, `tax_id`) never exposed.
11. **Data Residency** — `data_residency_region` set at signup from locale (US/EU). Gates AI routing.

**Business Rules:** BR-005 (own-edit only), BR-061 (≥70% completeness for job applications), PROFILE-001..035

**Permissions:** Own-row edit only. Admin can edit any. Public read of public-safe columns.

**Data Dependencies:** `profiles`, `profile_skills`, `profile_experience`, `profile_education`, `profile_portfolios`, `profile_certifications`, `profile_media`, `career_signals`, `user_settings`

**API Dependencies:** `GET /api/v1/profile`, `PUT /api/v1/profile`, `POST /api/v1/profile/resume/parse`, `POST /api/v1/profile/portfolio`, `GET /api/v1/profile/{userId}/public`

**UI Dependencies:** `/profile`, `/profile/:userId`, resume upload drawer, portfolio gallery, skills taxonomy typeahead

**External Dependencies:** Supabase Storage, HaveIBeenPwned (password breach check), AI service (resume parsing)

**Security Requirements:** RLS own-row + public-safe view · Field-level encryption (phone_number, tax_id) · XSS sanitization on rich text · Upload pipeline

**Failure Modes:**

- Resume parse failure → manual entry fallback with error toast
- File upload failure → retry with resume, no partial save
- Public view permission denied → 404-equivalent (no existence leak)

**Edge Cases:**

- Concurrent edit collision → optimistic concurrency via `version` column; 409 on conflict
- Empty profile on first login → onboarding wizard with guided steps
- Deleted company in experience → graceful degradation, keep text
- Vanity slug collision → suggest alternatives, block reserved words

**Analytics Events:** EVT-003 `profile_completed`, EVT-004 `resume_uploaded`, EVT-005 `verified_signal_added`

**Notifications:** Profile completeness nudges (weekly digest if <70%) · Verification badge unlocked (immediate)

**State Machine:** (Profile itself is stateful only for visibility)

```mermaid
stateDiagram-v2
    [*] --> draft: created
    draft --> published: user publishes
    published --> hidden: user hides
    hidden --> published: user unhides
    published --> archived: user archives
    archived --> [*]
```

State names are lower `snake_case` (spelling normalisation only, V61-11). The profile machine has no row in the §10.9 index.

**Acceptance Criteria:**

- Profile save p95 <250ms
- Public view never exposes PII columns
- Completeness score 100% reproducible
- Avatar upload succeeds for supported formats only
- Concurrent edit returns 409 with clear message

**Test Requirements:** Unit (validation, completeness formula) · Integration (CRUD + RLS) · E2E (J-01 profile build) · Contract (resume parser adapter) · A11y (form keyboard, screen reader)

**Feature Dependencies:** F-01 · **Blocks:** All domain features

---

#### F-84 Skills Graph & Taxonomy System ★

| Attribute          | Value                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Feature ID**     | F-84                                                                                                          |
| **Priority**       | 10                                                                                                            |
| **Phase**          | Ph1–2                                                                                                         |
| **Purpose**        | Canonical semantic model of skills: relationships, prerequisites, correlations, market demand                 |
| **Problem Solved** | Recommendations, matching, and career guidance are impossible without understanding skill relationships       |
| **Actors**         | Platform Admin (taxonomy curation), all users (read), recommendation engine (read), instructors (tag content) |
| **Preconditions**  | Profile (F-12), LMS (F-07), Arena (F-08) exist                                                                |
| **Postconditions** | Every course, challenge, job, and profile references canonical skills                                         |

**Core Behavior (Step-by-Step):**

1. **Taxonomy Curation (Admin)** — Platform Admin manages the canonical `skills` table: create, edit, deprecate, merge (with redirect map). Each skill: `id`, `canonical_name`, `slug`, `category` (nested ≤3 levels), `description`, `aliases` (array), `status` (active/deprecated), `created_at`. Target: 2,000+ skills at scale.
2. **Skill Relationships (Admin + Computed)** — `skill_relationships` table edges:
   - `prerequisite_of` — directional, acyclic (validated at write)
   - `subskill_of` — hierarchical decomposition
   - `supersedes` — replacement (deprecated → current)
   - `complements` — bidirectional co-occurrence
   - `correlates_with` — bidirectional, computed statistically (never manual)
3. **Content Tagging** — Every course, module, lesson, challenge, job, portfolio project, and user skill entry references a canonical `skill_id`. No freeform skill strings allowed (BR-144).
4. **Market Signal Collection** — Daily job aggregation: `skill_market_signals` table tracks per skill: `demand_index`, `salary_premium`, `growth_rate`, `region`, `window_start`, `window_end`. Aggregated from job postings, salary reports, and hiring outcomes.
5. **Graph Traversal** — Read operations:
   - **Skill gap** — Given target skill, traverse `prerequisite_of` backwards to find unmet prerequisites
   - **Related skills** — Given skill, traverse `correlates_with` edges (top N by weight)
   - **Role readiness** — Given role (job family), aggregate required skills; compute candidate overlap
   - **Path suggestion** — Dijkstra-style shortest path from candidate's skills → target role's required skills
6. **Emerging Skills Detection** — Weekly computation (F-118 dependency): new skill candidates from job postings with `occurrence_count ≥5` in the last 30 days but not in taxonomy → candidate queue for admin review.
7. **Search & Typeahead** — Full-text search over `canonical_name` + `aliases`. Used in profile, course, job, and challenge forms.
8. **Public API** — `GET /api/v1/skills/{id}` returns skill + relationships + market signals (public read). `GET /api/v1/skills/search?q=` for typeahead.
9. **Caching** — Read-heavy; cache hot skills (top 500 by traversal count) in memory with 15-min TTL. Invalidation on taxonomy write.

**Business Rules:** BR-141..BR-148

- BR-141: Curated by Platform Admin; no user creation of canonical skills
- BR-142: Relationships directional
- BR-143: Correlations computed, not manual
- BR-144: All tagging references canonical skill
- BR-145: Market signals update daily
- BR-146: Traversal depth bounded (max 5 hops)
- BR-147: `prerequisite_of` acyclic (validated)
- BR-148: Emerging skills require ≥5 independent signals before promotion

**Permissions:** Public read. Admin write. Instructor/Course Author can propose skill tags (subject to moderation).

**Data Dependencies:** `skills`, `skill_relationships`, `skill_market_signals`, `course_skills`, `challenge_skills`, `job_skills`, `profile_skills`, `portfolio_skills`

**API Dependencies:** SCI-35 (Skill CRUD, relationship CRUD, market signal query, traversal), SCI-45 (emerging skill proposal), SCI-46 (relationship validation)

**UI Dependencies:** Admin taxonomy manager · Typeahead components · Skill detail card (shows relationships, market signals) · Skill gap visualizer

**External Dependencies:** None required. Optional: licensed market data feed (OD-46).

**Security Requirements:** Public read of taxonomy · Admin-only writes · No PII in graph · RLS enforced on tagging tables · Rate limits on search API

**Failure Modes:**

- Taxonomy read failure → fallback to cached top 500
- Traversal cycle detected (data corruption) → alert + refuse traversal, log incident
- Market signal computation fails → serve last-known-good data with staleness banner

**Edge Cases:**

- Admin merges two skills → all references updated transactionally, redirect map retained
- Skill deprecated mid-course → course continues, skill tag shows "deprecated" badge
- Path traversal exceeds depth → return partial result with caveat
- Correlated skill with low sample count → hide until minimum threshold

**Analytics Events:** `skill_searched`, `skill_relationship_traversed`, `skill_tagged`, `emerging_skill_promoted`, `skill_merged`

**Notifications:** Admin digest of emerging skills (weekly) · Taxonomy change alerts to instructors with affected courses

**State Machine (Skill):**

```mermaid
stateDiagram-v2
    [*] --> proposed: candidate detected
    proposed --> under_review: admin review
    under_review --> active: approved
    under_review --> rejected: rejected
    active --> deprecated: superseded
    deprecated --> merged: merged into successor
    merged --> [*]
    rejected --> [*]
```

Step 1 lets an admin create and merge skills, and the edge cases merge two skills, but this diagram has no entry for an admin-created skill and merges only from `deprecated` (open).

State names are lower `snake_case` (spelling normalisation only, V61-11). Terminal sets differ between the §10.9 index (Skill (F-84): `merged` only) and this diagram (`merged`, `rejected`) — see V61-11.

**Acceptance Criteria:**

- Skill search p95 <100ms (cached)
- Traversal p95 <200ms for depth ≤3
- 100% of course/challenge/job skill tags reference canonical skills
- Zero cycles in `prerequisite_of` graph
- Market signal updates daily (measure via scheduler)
- Typeahead returns relevant results for common typos

**Test Requirements:**

- Unit: traversal algorithms, cycle detection, merge logic
- Integration: CRUD, RLS on tagging tables, market signal computation
- E2E: admin curates taxonomy → instructor tags course → learner typeahead shows skill
- Contract: skill API schema, adapter pattern
- Performance: traversal under load (10k concurrent)
- Data: graph integrity checks (cycles, orphans, unreferenced skills)

**Feature Dependencies:** F-12, F-07, F-08 · **Blocks:** F-91, F-95, F-99, F-106, F-114, F-118

---

#### F-96 Skill Evidence & Digital Credentials ★

> v6.1 amendment: see Appendix E, items V61-07 (erasure clocks), V61-17 (verification ladder), V61-19 (erasure through an opaque subject reference) and V61-22 (target proposal: no verified `challenge_pass` before the isolated runner decision)

| Attribute          | Value                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| **Feature ID**     | F-96                                                                                                    |
| **Priority**       | 10                                                                                                      |
| **Phase**          | Ph2                                                                                                     |
| **Purpose**        | Cryptographic, auditable proof of skill via projects, assessments, work history, peer review            |
| **Problem Solved** | LinkedIn endorsements are gamed; platform needs verified evidence                                       |
| **Actors**         | Candidate (evidence contributor), Instructor/Peer (verifier), Recruiter (verifier), Employer (consumer) |

**Core Behavior (Step-by-Step):**

1. **Evidence Types** — Every credential belongs to one of:
   - `course_completion` — from LMS with ≥70% final grade
   - `challenge_pass` — from Arena with verified score
   - `certification` — from exam platform (F-115)
   - `project_submission` — from portfolio with peer/instructor review
   - `work_history` — employer-confirmed
   - `endorsement` — peer skill verification (weighted by endorser credibility)
   - `contribution` — GitHub/GitLab commit verification (F-89)
2. **Credential Issuance** — When an evidence source triggers (e.g., course completion event), the system:
   - Creates `verified_credentials` row: `id`, `user_id`, `skill_id`, `evidence_type`, `evidence_source_id`, `issued_at`, `verification_hash` (SHA-256), `status` (issued)
   - Creates `credential_evidence` rows linking to underlying artifacts (course enrollment, submission, etc.)
   - Publishes public verification URL: `/verify/{hash}`
   - Updates `profiles.xp_balance` if applicable
   - Emits `EVT-005 verified_signal_added` (if first signal)
3. **Credential Verification (Public)** — `GET /verify/{hash}` returns: holder name (first name + last initial for privacy), skill, evidence type, issuer, issue date, status. Never exposes full profile or PII. A partial name is still personal data, so this step and BR-150 ("no PII") disagree. Whether the page shows a name, and whether a credential's public URL respects the holder's profile visibility (step 2 publishes every credential), are open.
4. **Credential Revocation** — Admin-only action (academic integrity violation, employer retraction, etc.). Revocation creates a new record with `revoked_at` + `revocation_reason`. Original row retained (append-only). Public URL shows "INVALID" state. XP clawback logged.
5. **Endorsement Weighting** — When a peer endorses a skill:
   - Endorser's credential weight = `min(their_verified_reputation_score, 1.0)`
   - Relationship proximity boost: +0.2 if direct connection, +0.1 if 2nd degree (BR-131 and the Permissions line allow endorsements only between connected users, so the 2nd-degree boost is unreachable — open)
   - Final weight stored in `endorsement_weights`
   - Endorsements from unverified users (no reputation) count as 0.1 (weak signal)
6. **Evidence Display** — On profile: "Verified by TalentSphere" badge on each skill with ≥1 credential. Click expands evidence list (course, challenge, or endorsement).
7. **Portable Export** — User can export all credentials as JSON (DSR Art. 20). Export includes verification URLs.
8. **Privacy-Preserving Proof** — Optional privacy-preserving credential presentation. Do not label a hash commitment as zero-knowledge. Where portable cryptographic credentials are adopted, target stable W3C Verifiable Credentials Data Model 2.0 semantics and evaluate later revisions separately.

**Business Rules:** BR-149..BR-156

- BR-149: Append-only; revocation creates new record
- BR-150: Public verification URL, no PII
- BR-151: Evidence links immutable once issued
- BR-152: Endorsement weights from reputation + proximity
- BR-153: Anonymous endorsements prohibited
- BR-154: Appeal path with ≤7-day SLA
- BR-155: Privacy-preserving proofs allowed
- BR-156: Credential requires platform-verified achievement

**Permissions:** User: issue (via achievement), view own, export. Public: verify via hash. Admin: revoke. Peer: endorse connected users. Who may see revocation and dispute reasons, and who disputed, revoked or verified a record, is not specified; BR-150 bars PII on the public URL (open).

**Data Dependencies:** `verified_credentials`, `credential_evidence`, `endorsement_weights`, `profiles`, `xp_transactions`, `skill_endorsements`

**API Dependencies:** SCI-42 (credential CRUD, verification, revocation, endorsement), SCI-17 (certificate issue/verify from media)

**UI Dependencies:** `/verify/{hash}` public page · Profile evidence drawer · Endorsement UI · Credential export in settings

**Security Requirements:** SHA-256 hashing · Public verify endpoint rate-limited (60/min/IP) · No PII in verify response · RLS own-row for full credential list · Append-only enforcement at DB layer

**Failure Modes:**

- Hash collision (astronomically unlikely) → reject issuance, alert
- Verification endpoint unavailable → cached verification for 24h
- Endorsement spam → rate limit + reputation threshold for endorsers

**Edge Cases:**

- Credential issued, then course retroactively revoked → credential revoked with reason
- User deletes account → credentials anonymized (holder name removed), verification URL shows "deleted user". Erasure clocks and anonymize-vs-delete: see F-01 (Erasure clocks, V61-07); the target's opaque-subject-reference design is Proposed (V61-19). Anonymizing endorsements the erased person gave would create anonymous endorsements, which BR-153 prohibits; their disposition is open
- Dispute: "I didn't endorse this skill" → endorsement revocable by endorser within 30 days
- Recruiter needs bulk verification → API with rate limit + audit

**Analytics Events:** `credential_issued`, `credential_verified`, `credential_revoked`, `endorsement_added`, `endorsement_withdrawn`, `evidence_exported`

**Notifications:**

- Credential issued (learner, immediate)
- Credential verified by recruiter (learner, immediate, opt-in)
- Endorsement received (learner, immediate)
- Credential revoked (learner, immediate, with appeal link)

**State Machine (Credential):**

```mermaid
stateDiagram-v2
    [*] --> issued: achievement verified
    issued --> verified: public lookup succeeds
    issued --> disputed: user or admin disputes
    disputed --> upheld: dispute rejected
    disputed --> revoked: dispute upheld
    verified --> expired: validity window passed
    verified --> revoked: integrity violation
    upheld --> issued: dispute closed
    revoked --> [*]
    expired --> [*]
```

State-machine gaps: see §10.10 Credential (F-96) (open).

**Acceptance Criteria:**

- Credential issuance <500ms
- Public verify <200ms (cached)
- Zero PII exposure in public verify
- 100% append-only enforcement (DB grants)
- Endorsement weight computation deterministic
- Appeal resolved within 7 days SLA

**Test Requirements:**

- Unit: hash generation, weight computation, appeal logic
- Integration: issuance from each evidence source, revocation, RLS
- E2E: complete course → credential issued → recruiter verifies
- Security: hash tamper detection, PII leakage scan on verify endpoint
- Contract: verification URL schema

**Feature Dependencies:** F-12, F-26 · **Blocks:** F-89, F-92, F-94, F-110, F-115

---

### 9.2 Tier 1 Core Intelligence Features (Priority 9)

§7 `P` governs this tier (§7 authority note): F-102 and F-145 below are P8 in §7.

#### F-04 Job Marketplace

> v6.1 amendment: see Appendix E, items V61-18, V61-20 and V61-23

| Attribute          | Value                                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| **Feature ID**     | F-04                                                                        |
| **Priority**       | 9                                                                           |
| **Phase**          | Ph2                                                                         |
| **Purpose**        | Two-sided job discovery and matching                                        |
| **Problem Solved** | Candidates need to find relevant jobs; recruiters need qualified candidates |
| **Actors**         | Candidate, Recruiter, Org Admin                                             |

**Core Behavior:**

1. **Search** — Candidate navigates `/jobs`. Faceted filters: keyword, location, work mode (Remote/Hybrid/On-site), job type (Full-time/Part-time/Contract/Internship), level (Entry/Mid/Senior/Lead/Principal), salary range, skills (multi-select from F-84), company, posted-within. Filters are URL-encoded (shareable). Cursor-based pagination (20/page default, 100 max).
2. **Ranking** — Default sort: relevance (candidate skill match × job requirements). Weights: 0.45 skill + 0.20 experience + 0.10 location + 0.10 title + 0.10 org_rating + 0.05 recency. Transparency: "Why am I seeing this?" disclosure on each card.
3. **Job Detail** — `/jobs/:jobId` shows: title, company (linked), location, work mode, salary (min-max with "hide pay" recruiter toggle), description (sanitized markdown), requirements, benefits, skills required, company overview, similar jobs, apply CTA. If job closed → the API answers 410 Gone and the page shows the "closed" banner (see Edge Cases) with a "similar jobs" recommendation.
4. **Apply** — Multi-step modal: select resume (or attach new), optional cover letter (≤5000 chars), confirm profile completeness (≥70% gate). Autosave draft every 5s to localStorage and every 30s to `application_drafts` (server) (BR-18; Appendix D M-24). On submit: `job_applications` row created (status `submitted`), `application_status_events` append, `EVT-017 application_submitted`, recruiter notified, candidate receives confirmation.
5. **Duplicate Prevention** — Partial unique constraint `UNIQUE(applicant_id, job_id) WHERE status NOT IN ('rejected','withdrawn','archived')`. If duplicate → 409 with "You've already applied" message.
6. **Saved Jobs** — Candidate saves jobs to `saved_jobs`. View in `/jobs/saved`.
7. **Saved Searches** — Candidate saves filter combination to `saved_searches`. Job alert emails sent when new matches appear (new-only, no backfill).
8. **Bookmarks & Hide** — Hide jobs (client-preference, reversible).
9. **Similar Jobs** — Recommendation engine (F-145) suggests 5 similar roles.

**Business Rules:** BR-010 (publish-readiness), BR-011 (lifecycle), BR-013 (hidden reversible), BR-015 (no duplicate active applications + 90-day cooldown; the target proposes a shorter post-withdrawal cooldown — see V61-23), BR-016 (no applications to closed jobs), JOB-001..020

**Permissions:** Public read of published jobs · Authenticated apply · Recruiter/Admin post

**Data Dependencies:** `jobs`, `job_skills`, `organizations`, `job_applications`, `application_status_events`, `saved_jobs`, `saved_searches`, `job_alerts`, `job_views`, `job_fit`

**API Dependencies:** SCI-01 (create job), SCI-02 (apply)

**Security Requirements:** RLS public read of published · Own-row for applications · Rate limit apply (5/hour/candidate) · Salary transparency enforced

**Failure Modes:**

- Job closed during application → block submission with actionable error
- Duplicate application detection race → DB unique constraint is authority
- Search index down → fallback to DB query (slower, degraded badge)

**Edge Cases:**

- Candidate applies then withdraws → 90-day cooldown before re-apply
- Job expired → soft-archive, still accessible via direct link with "closed" banner
- Employer deletes job → applications preserved, candidate notified

**Analytics Events:** EVT-014 `job_created`, EVT-015 `job_search_performed`, EVT-016 `job_viewed`, EVT-017 `application_submitted`

**Notifications:** Application confirmation (candidate, immediate) · New application (recruiter, immediate) · New matching jobs (candidate, digest)

**State Machine (Job):** State names are intent-level; the target renames or drops several of them (for example `pending_approval` → `pending_review`) — see V61-18.

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> pending_approval: submit
    pending_approval --> approved: admin approves
    pending_approval --> rejected_by_moderation: admin rejects
    approved --> scheduled: set publish date
    approved --> published: immediate publish
    scheduled --> published: date reached
    published --> paused: recruiter pauses
    paused --> published: recruiter resumes
    published --> closed: close or expiry
    closed --> archived: archival
    rejected_by_moderation --> draft: revise
    archived --> [*]
```

**Acceptance Criteria:**

- Search p95 <300ms for 100k jobs
- Apply submission <500ms
- Zero duplicate active applications
- Salary transparency enforced (100%)
- Cursor pagination stable across pages

**Test Requirements:** Unit (filters, ranking) · Integration (search + RLS) · E2E (J-02 apply flow) · Contract (job schema) · Performance (search under load)

**Feature Dependencies:** F-01, F-12 · **Blocks:** F-05, F-25, F-32, F-36, F-85, F-86

---

#### F-06 Candidate Review Pipeline (ATS)

> v6.1 amendment: see Appendix E, items V61-11 and V61-18

| Attribute      | Value                                  |
| -------------- | -------------------------------------- |
| **Feature ID** | F-06                                   |
| **Priority**   | 9                                      |
| **Phase**      | Ph2–3                                  |
| **Purpose**    | Full applicant tracking system         |
| **Actors**     | Recruiter, Hiring Manager, Interviewer |

**Core Behavior:**

1. **Pipeline View** — Kanban: submitted → under_review → shortlisted → interview → assessment → offer → hired. Bulk actions.
2. **Application Detail** — Candidate profile, verified signals, resume drawer, cover letter, timeline, notes, scorecards.
3. **Stage Transitions** — Server-owned. Invalid transitions blocked. Each writes `application_status_events` (append-only).
4. **Scorecards** — Structured rubric (technical, communication, problem-solving, culture): 1–5 each + recommendation + notes. Private to hiring team.
5. **Interview Scheduling** — Calendar integration (Phase 3+; OD-09 recommends manual scheduling at MVP and integration at SSOT Ph6 — open). Video room auto-provisioned (F-33).
6. **Offer Management** — Draft → negotiate → accept/decline. Single active offer per application.
7. **Rejection** — Template-based feedback (F-122 integration).
8. **Collaboration** — Internal comments, @-mentions, hiring team visibility.

**Business Rules:** BR-017, BR-019, BR-020, BR-042, APPL-001..015

**Data Dependencies:** `job_applications`, `application_status_events`, `scorecards`, `offers`, `interviews`, `application_drafts`

**API Dependencies:** SCI-02 (apply), SCI-07 (moderate)

**State Machine:** See the Application state machine in §10.10 (Canonical State Machines). Terminal sets differ between the §10.9 index and the §10.10 diagram — see V61-11; the target renames several stages (for example `under_review` → `in_review`) — see V61-18.

**Acceptance Criteria:** Kanban sync <200ms · 0 duplicate prevention failures · 0 cross-tenant access · audit 100%

**Feature Dependencies:** F-04, F-05 · **Blocks:** F-88, F-92, F-102, F-103

---

#### F-07 Learning Management System

> v6.1 amendment: see Appendix E, items V61-20 and V61-21

| Attribute      | Value                                                           |
| -------------- | --------------------------------------------------------------- |
| **Feature ID** | F-07                                                            |
| **Priority**   | 9                                                               |
| **Phase**      | Ph1                                                             |
| **Purpose**    | Core learning platform with courses, modules, lessons, progress |

**Core Behavior:**

1. **Catalog Browse** — `/courses` shows published courses with filters: category, difficulty, duration, rating, price (free/paid), language, instructor. Sort: relevance, rating, newest, most enrolled, price.
2. **Course Detail** — `/courses/:id` shows syllabus preview (public modules/lessons), instructor bio, reviews, prerequisites (from F-84), learning objectives, estimated duration, enrollment CTA.
3. **Enrollment** — `POST /api/v1/courses/{id}/enroll`. Checks: prerequisites satisfied (F-106), entitlement (free/paid/Pro/Team/institutional license; plan prices and allowances are not decided in this file — see V61-09), no active duplicate enrollment. On success: `course_enrollments` row (status `active`), `EVT-006 enrollment_created`, welcome notification.
4. **Learning Player** — `/courses/:id/learn` immersive layout: video player (via F-42 media engine), curriculum drawer, lesson checklist, notes panel, Q&A panel, progress bar. Video player supports: play/pause/seek, captions (if provided), transcript, playback speed, PiP, fullscreen, resume-from-last-position.
5. **Lesson Progress** — Each lesson has content_items (VIDEO, ARTICLE, PDF, QUIZ, ASSIGNMENT). Completion tracked in `module_progress` (idempotent — UNIQUE(enrollment_id, module_id)). Video completion per provider capability.
6. **Quizzes** — Inline quizzes between lessons. Configurable: time limit, passing score, attempts. Graded quiz contributes to course grade. Results page shows per-question explanations.
7. **Prerequisites** — Gated by F-106. Attempting to enroll without prerequisites → soft block with "Complete X and Y first" + link.
8. **Completion** — Course complete when: all required modules done + final assessment ≥70% (BR-048). On completion: certificate issued (F-52), XP awarded (BR-023: 200 bonus + module XP), `EVT-008 course_completed`, celebration UI.
9. **Certificate Verification** — Public `/verify/{hash}` page (via F-96 infrastructure).
10. **Learning History** — `/courses/my-learning`: enrolled courses, in-progress, completed, dropped. "Continue learning" widget on dashboard.

**Business Rules:** BR-021 (idempotent completion), BR-022 (prerequisites gate), BR-023 (completion → certificate + XP), BR-046 (unique active enrollment), BR-047 (sequential module progress), BR-048 (final assessment ≥70%), COURSE-001..005, LMS-001..014

**Data Dependencies:** `courses`, `course_modules`, `course_enrollments`, `module_progress`, `content_items`, `media_sources`, `media_progress`, `certificates`, `quizzes`, `quiz_attempts`

**API Dependencies:** SCI-08 (enroll), SCI-16 (playback progress), SCI-17 (certificate issue)

**Security Requirements:** RLS enrollment-gated lesson access · Time-limited media tokens · Certificate SHA-256 hash · Zero unauthorized content access

**Failure Modes:** Video provider down → fallback link · Progress save fails → retry queue · Certificate generation fails → alert, retry

**Edge Cases:** Learner drops mid-course → progress frozen · Instructor deletes course → enrolled students retain access (BR-114) · Concurrent enrollment → idempotent

**Analytics Events:** EVT-006 `enrollment_created`, EVT-007 `lesson_completed`, EVT-008 `course_completed`, EVT-009 `certificate_issued`

**Notifications:** Enrollment confirmation · Module completion celebration · Course completion + certificate · Drop-off reminder (7d, 14d, 30d)

**State Machine (Enrollment):**

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> active: entitlement confirmed
    pending --> expired: window elapsed
    pending --> dropped: self-drop
    active --> completed: all modules + final
    active --> dropped: self-drop
    active --> expired: cohort end
    completed --> [*]
    dropped --> [*]
    expired --> [*]
```

**Acceptance Criteria:** Lesson completion <150ms · Certificate hash reproducible · Zero unauthorized content access · Video start <3s · Progress survives refresh/crash

**Feature Dependencies:** F-01, F-12 · **Blocks:** F-22, F-42, F-66..F-74

---

#### F-08 Challenges Arena

> v6.1 amendment: see Appendix E, items V61-06, V61-20 and V61-22

| Attribute      | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| **Feature ID** | F-08                                                       |
| **Priority**   | 9                                                          |
| **Phase**      | Ph1                                                        |
| **Purpose**    | Sandboxed coding challenge platform for skill verification |
| **Actors**     | Candidate, Instructor, Employer                            |

**Core Behavior:**

1. **Browse Challenges** — `/challenges` shows challenges by category, difficulty, skill tags. Filters: language, difficulty, completion status.
2. **Attempt UI** — `/challenges/:id/attempt`: Monaco editor with language selector (Python 3.12, JS/Node 20, TypeScript 5, Java 17, C++17, C, Go 1.22, Rust 1.75, SQL). Problem statement panel, test cases panel, run button, submit button, timer (if timed challenge).
3. **Run (Draft Test)** — `POST /api/v1/challenges/{id}/run` executes against public test cases only. Returns structured output (stdout, stderr, exit code, duration). Does not consume submission slot. Rate limit 30/min.
4. **Submit (Judged)** — `POST /api/v1/challenges/{id}/submit`. Sandbox execution:
   - Ephemeral container per submission
   - 30s CPU timeout, 512MB RAM, 1GB disk
   - Zero network egress
   - seccomp syscall filtering
   - Read-only root filesystem
   - Runs hidden test cases
5. **Async Judging** — Submission enqueued to `background_jobs` (kind `challenge.judge`). Status transitions: `queued → running → passed|failed|error`. Client polls status endpoint every 2s (up to 60s); what the user sees when 60s pass without a terminal status is not specified (open; see Appendix D M-06).
6. **Scoring** — Score = (passed / total) × difficulty_weight × time_bonus. Normalized to 0–100. Pass threshold: ≥70%.
7. **XP Award** — On pass: XP awarded (20–100 by difficulty) via idempotent ledger. `UNIQUE(user_id, reference_type='challenge.passed', reference_id=challenge_id)` — one award lifetime.
8. **Anti-cheat** — Async plagiarism detection (AST comparison against corpus) + behavioral timing analysis. Flags suspicious submissions for review.
9. **Leaderboard** — Post-MVP. Weekly + all-time tabs.
10. **Practice Mode** — Post-MVP. Unlimited retries, no XP, hints available.
11. **AI In-Editor Assist** — Post-MVP (CHALL-013). Provides hints, debugging, explanations inline via embedded Gemini assistant. Draft-only — never edits or executes user code.

**Business Rules:** BR-024 (language allowlist + execution limits), BR-049 (sandbox isolation), BR-050 (hard resource limits), BR-051 (public vs hidden tests), BR-052 (async plagiarism), BR-025 (XP idempotent, no award until pass), TD-05 (sandbox spec; decision text not in this file — treat as open), CHALL-001..016

**Data Dependencies:** `challenges`, `challenge_submissions`, `challenge_test_cases`, `xp_transactions`

**API Dependencies:** SCI-04 (submit challenge)

**Security Requirements:** TD-05 sandbox (30s/512MB/1GB/no-network/seccomp; TD-05 decision text not in this file — treat as open) · Rate limit 10 sub/min/user · Hidden test cases RLS-protected · Zero code execution outside sandbox

**Failure Modes:**

- Sandbox provider down → queue submissions, honest "queued" state
- Timeout → return `timed_out` status with partial results
- Compile error → surface as `error` with compiler output

**Edge Cases:**

- Infinite loop → killed at 30s
- Memory bomb → killed at 512MB
- Network attempt → blocked, flagged as suspicious
- Race: two tabs submit simultaneously → idempotency key prevents duplicate

**Analytics Events:** EVT-010 `challenge_started`, EVT-011 `challenge_submitted`, EVT-012 `challenge_scored`, EVT-013 `xp_awarded`

**State Machine (Submission):** Step 5 (`queued`, `running`), the failure modes (`timed_out`) and this diagram (`pending`, `evaluating`) name the non-terminal states differently, and the failure modes add a `timed_out` status that is in neither the diagram nor the §10.9 index — see V61-11. The target proposes that, until an isolated, network-less runner exists, a pass is not verified evidence (Proposed, V61-22).

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> evaluating: worker claims
    evaluating --> passed: score >= 70
    evaluating --> failed: score < 70
    evaluating --> error: sandbox error
    passed --> [*]
    failed --> [*]
    error --> [*]
```

**Acceptance Criteria:** Submission → result <3s typical · 100% sandbox containment (no escape) · Deterministic scoring · No XP until pass confirmed · Rate limit enforced

**Feature Dependencies:** F-01, F-12 · **Blocks:** F-22, F-76, F-88

---

#### F-85 Career Graph & Progression Benchmarks

> v6.1 amendment: see Appendix E, items V61-04 and V61-16

| Attribute          | Value                                                              |
| ------------------ | ------------------------------------------------------------------ |
| **Feature ID**     | F-85                                                               |
| **Priority**       | 9                                                                  |
| **Phase**          | Ph3                                                                |
| **Purpose**        | Database of career transitions, outcomes, and progression patterns |
| **Problem Solved** | "What's my next role?" — answerable only with historical data      |
| **Actors**         | Candidate (readiness), Recruiter (benchmarks), Analyst             |

**Core Behavior:**

1. **Data Collection** — Career transitions captured from: opt-in user reporting, ATS hire events (with consent), profile updates, employer confirmations (via F-94).
2. **Aggregation** — `career_transitions` rows: `user_id`, `from_role_id`, `to_role_id`, `from_company_id`, `to_company_id`, `transition_date`, `salary_delta`, `time_in_role_months`, `consent_flag`.
3. **Benchmark Computation** — Nightly job aggregates: `progression_benchmarks`: by role, location, level, industry — median time-to-promotion, typical next roles, salary delta. Requires ≥20 data points per cell (BR-160) — a feature override stricter than the `min_cohort_k` default of k ≥ 10 (V61-04).
4. **Readiness Scoring** — For candidate: given target role, compute readiness = overlap of candidate's skills vs. role's typical prerequisite skills + experience years + education.
5. **Progression Prediction** — Given candidate's current role, suggest likely next roles (from transitions data) with expected time-to-transition.
6. **Display** — Public career path viz: "Engineers like you typically move to Senior in 2.5 years." Benchmarks shown with sample count + confidence interval.
7. **Consent** — Every user data point requires opt-in. Opt-out removes individual data but preserves aggregate.
8. **Anonymization** — k-anonymity: cell-level data never shown if <20 samples (BR-160 override of `min_cohort_k`). Individual transitions never exposed.
9. **Integration with F-91** — Career readiness uses benchmark data to calibrate score.

**Business Rules:** BR-157..BR-163

**Data Dependencies:** `career_transitions`, `career_outcomes`, `progression_benchmarks`, `profiles`, `jobs`, `job_applications`, `offers`

**API Dependencies:** SCI-36 (career graph query, benchmark query, opt-in management)

**Security Requirements:** Opt-in enforced · k-anonymity enforced · Individual data RLS-scoped · Aggregates public-safe

**Failure Modes:** Insufficient data → "not enough data yet" state, no fake benchmarks · Aggregation job failure → serve last-good with staleness banner · User opts out → data removed within 24h

**Edge Cases:** User reports non-typical transition → included but flagged as outlier · Cell drops below 20 samples (opt-outs) → benchmark hidden until threshold restored · Conflicting data (user reports vs. ATS) → prefer verified (ATS) with consent

**Analytics Events:** `career_transition_recorded`, `benchmark_viewed`, `readiness_computed`, `transition_opt_in`

**Acceptance Criteria:** Benchmark query <400ms · k-anonymity always enforced · opt-out removes data within 24h · Benchmarks only shown with ≥20 samples (feature override of `min_cohort_k`, V61-04) · Consent captured before any data collection

**Feature Dependencies:** F-12, F-04, F-06, F-84 · **Blocks:** F-95, F-97, F-105, F-114

---

#### F-86 Salary Intelligence

> v6.1 amendment: see Appendix E, items V61-04 and V61-16

| Attribute      | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| **Feature ID** | F-86                                                         |
| **Priority**   | 9                                                            |
| **Phase**      | Ph3                                                          |
| **Purpose**    | Market salary benchmarks and compensation intelligence       |
| **Actors**     | Candidate (research), Recruiter (offer calibration), Analyst |

**Core Behavior:**

1. **Salary Submission** — User submits: role, level, location, currency, base salary, bonus (optional), equity (optional), years of experience, company (optional), industry. Submission verified via: self-reported (weight 0.5) or employment-verified (via F-94, weight 1.0).
2. **Aggregation** — Nightly job: group by (role, level, location, company_size, industry), compute median, p25, p75, p90. Currency normalization to USD (ISO-4217). Minimum cohort per cell is the policy parameter `min_cohort_k`, default k ≥ 10 for public and sensitive cells (BR-178).
3. **Display** — On `/salaries` and job pages: percentile bands (p25-p50-p75) with sample count, trend over time (YoY growth), comparison to national/regional median, methodology disclosure.
4. **Job Page Integration** — Job detail shows: "Typical salary for this role: $X–$Y (based on N reports)"
5. **Recruiter Offer Calibration** — Recruiter sees benchmark when creating offer. Helps avoid lowballing.
6. **Equity Intelligence (F-98)** — Separate aggregation for equity grants, vesting schedules, ESOP education.
7. **Data Quality** — Outlier detection (±3σ from median) → flagged for review. Spam submissions blocked (rate limit 5/day/user).
8. **Withdrawal** — User can withdraw their submission at any time (BR-181). Aggregate recomputed.

**Business Rules:** BR-177..BR-183

**Data Dependencies:** `salary_reports`, `salary_aggregates`, `compensation_benchmarks`, `equity_norms`

**API Dependencies:** SCI-37 (salary submission, aggregate query, withdrawal)

**Security Requirements:** Strict anonymization · No PII in aggregates · k-anonymity enforced · Rate limit submissions

**Failure Modes:** Insufficient data → "not enough reports" state · Currency conversion failure → show original currency · Outlier detected → flag, don't count in aggregate

**Edge Cases:** User submits then deletes account → aggregate recomputed, no leak · Company identified by <3 reports → hidden (BR-180; k ≥ 3 is an override below the `min_cohort_k` default — needs owner and counsel decision; the default applies until then) · Multiple submissions from same user → flagged, deduplicated

**Analytics Events:** `salary_report_submitted`, `salary_aggregate_viewed`, `salary_report_withdrawn`

**State Machine (Salary Report):**

```mermaid
stateDiagram-v2
    [*] --> submitted
    submitted --> validating
    validating --> verified
    validating --> rejected: outlier/spam
    verified --> aggregated
    aggregated --> withdrawn: user action
    rejected --> [*]
    withdrawn --> [*]
```

**Acceptance Criteria:** Aggregate query <400ms · minimum cohort `min_cohort_k` enforced by policy (default k ≥ 10 for public and sensitive aggregates) · No PII in aggregates · Outliers excluded from computation · Withdrawal effective within 24h

**Feature Dependencies:** F-04, F-06, F-56 · **Blocks:** F-97, F-98, F-109

---

#### F-88 Technical Interview Assessment Platform

> v6.1 amendment: see Appendix E, item V61-06

| Attribute      | Value                                                  |
| -------------- | ------------------------------------------------------ |
| **Feature ID** | F-88                                                   |
| **Priority**   | 9                                                      |
| **Phase**      | Ph3                                                    |
| **Purpose**    | Live coding + video + structured assessment for hiring |
| **Actors**     | Recruiter, Interviewer, Candidate                      |

**Core Behavior:**

1. **Assessment Creation** — Recruiter/Interviewer defines: title, role, skills tested (from F-84), difficulty, duration, question bank selection, rubric definition.
2. **Question Bank** — Company-scoped. Questions: text, code, design, behavioral. Each has: statement, examples, hidden test cases, time estimate, expected competencies.
3. **Scheduling** — Invite candidate via `interview_assessments` with: `scheduled_at`, `duration`, `interviewer_id`, `assessment_id`, meeting link (Jitsi/Zoom embed).
4. **Pre-Assessment** — Candidate receives: calendar invite (ICS), pre-join device check (mic/camera/browser), instructions. Consent for video recording (opt-in; default off).
5. **Live Session** — Video call + collaborative code editor (Monaco) + whiteboard. Interviewer can: assign problem from bank, observe code in real-time, send hints (recorded in transcript), run code against public tests, end session.
6. **Scoring** — Interviewer completes rubric post-session: technical correctness (1–5), communication (1–5), problem-solving (1–5), code quality (1–5), overall recommendation (Strong Yes / Yes / Neutral / No / Strong No), notes (private).
7. **AI Feedback (Optional)** — Post-session analysis: communication signals (speaking pace, filler words, clarity), technical correctness commentary, comparison to benchmark. **Never** emotion/sentiment analysis (prohibited). Who sees this feedback is not specified; if recruiters or hiring managers see it, AI-derived delivery signals become a screening input, which Amendment E and §15.10.2 restrict (open, owner).
8. **Recording** — Optional. Requires dual consent. Encrypted at rest. Retention ≤90 days unless explicitly extended (who may extend, the maximum, and whether both parties consent are open). Never used for model training without consent.
9. **Results** — Candidate receives: pass/fail, high-level feedback, areas for improvement. Interviewer/recruiter see full scorecard.
10. **Integration with ATS** — Assessment score attached to `job_applications` record. Feeds into F-102 Hiring Manager Portal.

**Business Rules:** BR-169..BR-176

**Data Dependencies:** `interview_assessments`, `interview_recordings`, `interview_scores`, `interview_questions` (name collision: §14.5 lists `interview_questions` under Employer insights for F-87's crowdsourced, published questions; this confidential, company-scoped bank with hidden test cases cannot share rows with it without a separation rule; whether it is a separate table, and its name, are open), `assessment_templates`, `job_applications`, `interviews`

**API Dependencies:** SCI-38 (assessment lifecycle), SCI-39 (recording)

**Security Requirements:** Room-scoped JWT tokens · Dual-consent for recording · Encryption at rest · Recording access audited · HDN-024 (peer-review fairness analog for interviews)

**Failure Modes:** Video provider down → fallback to audio + code-only mode · Sandbox down → queue code execution · Recording fails → session continues, alert · Candidate drops → interviewer can resume within 10 min window

**Edge Cases:** Candidate has no camera → audio-only mode · Network instability → reconnection within 5 min · Interviewer needs to extend → both parties confirm

**Analytics Events:** `interview_assessment_created`, `interview_started`, `interview_completed`, `interview_scored`, `recording_created`, `ai_feedback_generated`

**State Machine (Interview Assessment):**

```mermaid
stateDiagram-v2
    [*] --> scheduled
    scheduled --> in_progress: T-15 min join enabled
    in_progress --> completed: session ends
    in_progress --> cancelled: cancellation
    in_progress --> no_show: candidate/interviewer absent
    completed --> scored: rubric filled
    scored --> reviewed: HM review
    reviewed --> [*]
    cancelled --> [*]
    no_show --> [*]
```

**Acceptance Criteria:** Session join <3s · Code execution reuses TD-05 sandbox (decision text not in this file — treat as open) · Recording dual-consent enforced (100%) · AI feedback excludes protected attributes · Score append-only

**Feature Dependencies:** F-08, F-33, F-06 · **Blocks:** F-93, F-102, F-104, F-105

---

#### F-91 Career Readiness Assessment

| Attribute      | Value                                        |
| -------------- | -------------------------------------------- |
| **Feature ID** | F-91                                         |
| **Priority**   | 9                                            |
| **Phase**      | Ph2                                          |
| **Purpose**    | Personalized readiness score per target role |
| **Actors**     | Candidate                                    |

**Core Behavior:**

1. **Target Selection** — Candidate selects target role (from job taxonomy) or enters custom role.
2. **Assessment Computation** — Readiness = weighted composite:
   - **Skill overlap** (40%): candidate's verified skills ∩ role's required skills / total required
   - **Experience** (25%): years in related roles / typical years
   - **Education** (10%): degree level match
   - **Verified signals** (15%): credentials, certifications, challenges
   - **Market fit** (10%): candidate profile vs. typical successful applicants (from F-85)
3. **Gap Analysis** — For each gap, surface: missing skills → suggest courses (F-07); missing experience → suggest side projects (F-26); missing credentials → suggest certifications (F-77/F-115).
4. **Display** — Radial readiness score (0–100), color-coded (red <50, amber 50–75, green >75), breakdown by dimension.
5. **Action Plan** — Generated plan: prioritized list of actions (learn X, build Y, complete Z) with estimated time.
6. **Recalculation** — On profile update (new skill, completed course, new credential) → readiness recomputed.
7. **Recruiter View** — Optional candidate consent to share readiness with recruiters on applications.

**Business Rules:** BR-163 (disclose sources), BR-185 (transparent factors), READY-001..010

**Data Dependencies:** Derived from `profile_skills`, `profile_experience`, `profile_education`, `verified_credentials`, `course_enrollments`, `jobs`, `career_transitions`

**API Dependencies:** SCI-40 (readiness computation, gap analysis)

**Security Requirements:** Own-row only · AI computation transparent (factors shown) · No protected attributes in scoring

**Acceptance Criteria:** Readiness computed <500ms · Factors disclosed on every score · Zero protected attributes in model · Recalculation triggers within 60s of profile change

**Feature Dependencies:** F-84, F-08, F-12 · **Blocks:** F-95, F-99, F-92

---

#### F-92 Advanced Recruiter Search & Talent Pooling

> v6.1 amendment: see Appendix E, item V61-16

| Attribute      | Value                                                   |
| -------------- | ------------------------------------------------------- |
| **Feature ID** | F-92                                                    |
| **Priority**   | 9                                                       |
| **Phase**      | Ph3                                                     |
| **Purpose**    | Advanced candidate discovery and talent pool management |
| **Actors**     | Recruiter, Org Admin, Agency Recruiter                  |

**Core Behavior:**

1. **Search UI** — `/recruiter/search`. Filters: skills (multi-select from F-84, with proficiency + verification filter), location (with radius), years of experience, availability status (open to work, passive), assessment scores (min threshold), credential types, education level, willingness to relocate, salary expectations.
2. **Ranking** — Default: relevance (verified signals + skill match + reputation score). Sort options: relevance, recent activity, readiness score.
3. **Talent Pools** — Recruiter creates named pools. Add candidates via search. Bulk actions: tag, note, add to pipeline, outreach.
4. **Do-Not-Contact Lists** — Recruiter-managed. Candidates can also opt out globally from recruiter outreach.
5. **Outreach** — Send to candidate via TalentMail (F-59). Consumes credit if not a connection (credit allowances are not decided in this file — see V61-09).
6. **Analytics** — `/recruiter/analytics`: search volume, candidate views, outreach response rate, time-to-hire by source.
7. **Privacy** — Only candidates with: public profile OR applied to one of recruiter's jobs OR explicitly opted into recruiter search.
8. **Stealth Mode** — Candidates can hide from recruiter search while still applying.

**Business Rules:** BR-064 (recruiter sees verified signals), RECTOOL-001..012

**Data Dependencies:** Derived from `profiles`, `profile_skills`, `verified_credentials`, `candidate_reputation`, `course_enrollments`, `challenge_submissions`

**API Dependencies:** SCI-41 (search, pool CRUD)

**Security Requirements:** RLS org-scoped · Candidate privacy controls enforced · Zero stealth-mode leakage · Bulk operations audited

**Acceptance Criteria:** Search p95 <500ms for 1M candidates · Zero stealth-mode leakage · Candidate consent revocation <24h · Bulk operations stable under load

**Feature Dependencies:** F-12, F-34, F-08, F-96 · **Blocks:** F-103

---

#### F-102 Hiring Manager Portal

| Attribute      | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| **Feature ID** | F-102                                                             |
| **Priority**   | 9                                                                 |
| **Phase**      | Ph3                                                               |
| **Purpose**    | Team-lead dashboard for interviews, feedback, and hiring outcomes |
| **Actors**     | Hiring Manager, Org Admin                                         |

**Core Behavior:**

1. **Dashboard** — `/hm/dashboard`. Widgets: open requisitions (own team), candidates in pipeline (by stage), pending scorecards (interviews awaiting feedback), recent decisions, team hiring velocity.
2. **Requisition View** — Per-requisition: candidates, stage distribution, time-in-stage, blockers.
3. **Interview Feedback Queue** — List of interviews conducted by team; pending scorecards.
4. **Decision Making** — View aggregated scorecards, comparison, recommendation. Approve/reject with reason.
5. **Post-Hire Tracking** — For hires, view outcome signals (if consented): retention, promotion, salary progression.
6. **Team Analytics** — Time-to-fill, offer acceptance rate, source mix, quality-of-hire.

**Data Dependencies:** `job_applications`, `scorecards`, `interviews`, `offers`, `interview_scores`, `career_outcomes`

**Security Requirements:** RLS team-scoped · Aggregated team view only for HM · Org Admin sees all

**Acceptance Criteria:** Dashboard p95 <800ms · Scorecard queue accurate · Zero cross-team leakage

**Feature Dependencies:** F-06, F-88 · **Blocks:** F-105

---

#### F-114 Learning Impact Tracking

> v6.1 amendment: see Appendix E, item V61-04

| Attribute      | Value                                         |
| -------------- | --------------------------------------------- |
| **Feature ID** | F-114                                         |
| **Priority**   | 9                                             |
| **Phase**      | Ph4                                           |
| **Purpose**    | Correlate learning paths with hiring outcomes |
| **Actors**     | Platform Admin, Instructor, Analyst           |

**Core Behavior:**

1. **Data Collection** — Nightly job: for each course: enrolled → completed → hired within 12 months. For each skill: learned → used in job → hired for role. For each assessment: passed → hired → retained.
2. **Correlation Analysis** — Compute: course completion → hire rate (per cohort), skill acquisition → hire rate (by role), assessment score → performance correlation (where post-hire data available), time-to-competency → success rate.
3. **Course Quality Score** — Derived score: composite of completion rate, learner satisfaction, hire rate, engagement.
4. **Instructor Analytics** — Instructor sees: which of their courses lead to hires, learner outcomes (aggregated).
5. **Platform Analytics** — Admin sees: overall learning→hiring pipeline, top-performing courses, course recommendations refinement.
6. **Recommendation Feed** — F-11 (AI assistant) uses correlation data: "Learners who took this course were 2.3× more likely to get hired for X role."
7. **Privacy** — Aggregate-only. Individual learner outcomes never exposed without consent (BR-190).
8. **Causation Disclosure** — All outcome claims labelled as correlational (BR-193).

**Business Rules:** BR-189..BR-193

**Data Dependencies:** `learning_outcomes`, `outcome_correlations`, `course_enrollments`, `module_progress`, `job_applications`, `offers`, `hires`, `career_outcomes`

**API Dependencies:** SCI-43 (correlation query, instructor analytics)

**Security Requirements:** Aggregate-only · k ≥30 threshold (BR-189; a feature override stricter than the `min_cohort_k` default of k ≥ 10) · RLS instructor-scoped

**Acceptance Criteria:** Correlation job completes nightly · k ≥30 enforced (feature override of `min_cohort_k`, V61-04) · Instructor sees only own course data · All claims labelled correlational

**Feature Dependencies:** F-07, F-04, F-06, Analytics · **Blocks:** F-105, F-118

---

#### F-115 Certification Exam Platform

| Attribute      | Value                                                  |
| -------------- | ------------------------------------------------------ |
| **Feature ID** | F-115                                                  |
| **Priority**   | 9                                                      |
| **Phase**      | Ph3                                                    |
| **Purpose**    | Formal exam infrastructure for skill certifications    |
| **Actors**     | Candidate, Exam Administrator, Proctor (Ph10, §7 F-45) |

**Core Behavior:**

1. **Certification Definition** — Admin defines: title, skill, difficulty, exam format (MCQ / coding / mixed), duration, pass threshold, retake policy, proctoring level.
2. **Question Bank** — Exam-scoped. MCQ, multi-select, coding, essay. Each has: stem, options, correct answer (encrypted server-side; §17.4, VER-024), explanation, difficulty, discrimination index (computed post-hoc).
3. **Exam Registration** — Candidate registers. Prerequisites: course completion, minimum XP, or explicit eligibility.
4. **Attempt** — Timed exam. Server-authoritative clock. Questions served one at a time (or in batches, configurable). No client-side answer key.
5. **Proctoring (optional; Ph10, F-45)** — Third-party vendor. Identity verification, browser lockdown, AI proctoring.
6. **Auto-Grading** — MCQ/multi-select auto-graded. Coding via sandbox (F-08). Essay manual grading queue.
7. **Results** — Pass/fail with score. Per-section breakdown. Explanations for wrong answers (post-exam).
8. **Certification Issuance** — On pass: `skill_certifications` row, credential issued (F-96), badge displayed on profile, XP awarded.
9. **Retake** — Cooldown 7 days (configurable per exam). Failed attempts logged.
10. **Item Analysis** — Post-exam: difficulty index, discrimination index per question. Low-performing questions flagged for review.
11. **Appeal** — Grade dispute path. SLA 7 days.

**Business Rules:** BR-140 (single-attempt pass, retake configurable), answer keys server-side encrypted (no BR row states this; BR-124 is a feed rule — §17.4), VER-024 (key leakage test)

**Data Dependencies:** `skill_certifications`, `certification_attempts`, `questions`, `question_banks`, `assessment_attempts`

**API Dependencies:** SCI-32 (attempt), SCI-44 (exam CRUD)

**Security Requirements:** Answer keys encrypted · Never sent to client before grading · Server-authoritative timer · Per-attempt question randomization

**Failure Modes:** Timer expires → auto-submit with partial grading · Sandbox down (coding questions) → queue, honest status · Proctor unavailable (when proctoring is enabled, Ph10) → exam postponed

**Edge Cases:** Candidate disconnects → session resumable within 5 min · Browser crashes → auto-save progress every 30s, resumable · Question edited mid-exam → version pinned at exam start

**Analytics Events:** `certification_attempt_started`, `certification_attempt_submitted`, `certification_passed`, `certification_failed`

**State Machine (Certification Attempt):**

```mermaid
stateDiagram-v2
    [*] --> registered
    registered --> in_progress: start
    in_progress --> submitted: submit or timeout
    submitted --> graded
    graded --> passed
    graded --> failed
    passed --> certified
    failed --> cooldown: 7 days
    cooldown --> registered: retake
    certified --> [*]
```

**Acceptance Criteria:** Server-authoritative timer (±100ms) · Answer keys never in client payload · Auto-grading <500ms · Exam submission idempotent · Item analysis computed within 24h

**Feature Dependencies:** F-77; F-45 optional (proctoring, Ph10 in §7) · **Blocks:** F-45. Step 8 issues an F-96 credential, but §7 lists no F-96 dependency (open).

---

#### F-122 Application Feedback Loop

> v6.1 amendment: see Appendix E, item V61-04

| Attribute          | Value                                                                  |
| ------------------ | ---------------------------------------------------------------------- |
| **Feature ID**     | F-122                                                                  |
| **Priority**       | 9                                                                      |
| **Phase**          | Ph3                                                                    |
| **Purpose**        | Provide candidates with structured feedback at every application stage |
| **Problem Solved** | Candidates never know why they were rejected; black holes violate P-02 |
| **Actors**         | Candidate, Recruiter, Hiring Manager                                   |

**Core Behavior:**

1. **Feedback Templates (Admin/Org)** — Platform admins and org admins define templates: stage (screening, interview, offer), reason category (skills gap, experience gap, culture fit, overqualified, position filled, no response, other), structured fields (what went well, what didn't, what to improve), optional freeform note.
2. **Feedback Capture (Recruiter)** — On stage change (shortlist→reject, interview→reject), recruiter prompted: optional quick feedback via template, or skip the detailed feedback (records "no feedback provided"). A minimum reason category is required on every rejection, even when the detailed feedback is skipped (BR-217).
3. **Feedback Delivery (Candidate)** — On rejection, candidate receives: notification with high-level feedback, link to feedback detail page, aggregate insights, suggested actions (skills to develop, courses to consider).
4. **Anonymized Aggregate Insights** — Platform-wide: "60% of rejections at this stage cite skills gap", "Candidates who completed course X were 2.3× more likely to pass screening". Only aggregate, never individual.
5. **Candidate Right to Feedback** — Configurable: Full / Opt-in / Aggregate-only / None.
6. **AI-Assisted Feedback** — Post-MVP: AI drafts feedback from interviewer notes + stage data. Human (recruiter) reviews and edits before sending. Never sent autonomously.
7. **Feedback Analytics** — For recruiters: feedback provision rate, feedback timing, candidate satisfaction with feedback.
8. **Learning Loop** — For candidate: feedback feeds F-91 (Career Readiness) recalculation, suggested courses (F-07) based on skill gaps, optional "Would you like to see jobs where you're a stronger fit?"

**Business Rules:** BR-217..BR-224

**Data Dependencies:** `application_feedback`, `feedback_templates`, `feedback_requests`, `job_applications`, `application_status_events`

**API Dependencies:** SCI-49 (feedback CRUD), SCI-50 (feedback request)

**Security Requirements:** RLS own-row for candidates · Org-scoped for recruiters · Feedback immutable once delivered · Audit trail for all feedback

**Failure Modes:** Recruiter skips feedback → candidate sees "feedback pending" then "no feedback provided" · Template unavailable → fallback to freeform · Candidate requests feedback after 30-day window → politely declined

**Edge Cases:** Candidate rejects offer → feedback on why declined (candidate-provided) · Multiple applications to same company → separate feedback per application · Feedback contains PII → automated scan + block · Candidate deletes account → feedback anonymized

**Analytics Events:** `feedback_provided`, `feedback_viewed`, `feedback_requested`, `feedback_rated`

**State Machine:**

```mermaid
stateDiagram-v2
    [*] --> pending: rejection decision
    pending --> provided: recruiter submits
    pending --> skipped: no feedback 7 days
    provided --> viewed: candidate views
    provided --> requested: candidate requests more
    requested --> responded: recruiter responds
    requested --> no_response: no response 14 days
    viewed --> [*]
    responded --> [*]
    no_response --> [*]
    skipped --> [*]
```

BR-222 lets a candidate request feedback that was not provided (30-day window), but `skipped` is terminal here, so the request has no transition (open).

**Acceptance Criteria:** Feedback delivery within 7 days of decision (when provided) · Zero PII leakage in feedback · Aggregate insights always meet `min_cohort_k` (default k ≥ 10; BR-220) · Candidate can request feedback (30-day window enforced) · Recruiter feedback rate >60% (target metric)

**Feature Dependencies:** F-06, F-04 · **Blocks:** None

---

#### F-123 Skill Decay Tracking

| Attribute          | Value                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| **Feature ID**     | F-123                                                                 |
| **Priority**       | 9                                                                     |
| **Phase**          | Ph3                                                                   |
| **Purpose**        | Track skill verification freshness and prompt re-verification         |
| **Problem Solved** | Verified skills become meaningless over time without freshness signal |
| **Actors**         | Candidate, Recruiter, Admin                                           |

**Core Behavior:**

1. **Freshness Score Computation** — Nightly job computes for each verified skill: `days_since_verification` (from F-96 credential issue date), `market_demand_trend` (from F-84 market signals), `decay_curve` (per skill category: fast-changing 18-month half-life, moderate 36-month, stable 60-month, foundational minimal), composite `freshness_score` (0–100).
2. **Freshness Bands** — Displayed on profile: Fresh (80–100), Current (60–79), Aging (40–59), Stale (20–39), Expired (0–19).
3. **Re-verification Prompts** — Triggered when: freshness <60 for a high-demand skill → candidate notified; freshness <40 → recruiter-facing badge shows "aging"; freshness <20 → skill demoted to "self-reported" unless re-verified.
4. **Re-verification Paths** — Multiple ways to refresh: new challenge pass (F-08), new course completion (F-07), new certification (F-115), new project with same skill (F-26), peer endorsement (F-110) if skill is endorsable, self-attestation (weak signal — half credit).
5. **Market Drift Alerts** — When a skill's market demand changes significantly: rising → "Python is trending up 20% — good time to re-verify"; falling → "Flash is declining — consider related skills".
6. **Recruiter Visibility** — On candidate search (F-92), recruiter sees: freshness score per skill, filter by minimum freshness (only fresh skills), preference for fresh candidates in ranking.
7. **Freshness Analytics** — Platform-wide: average freshness by skill category, re-verification rate, skill half-life accuracy (validated against market data).

**Business Rules:** BR-225..BR-232

**Data Dependencies:** `skill_freshness`, `reverification_prompts`, `skill_currency_scores`, `verified_credentials`, `skill_market_signals`

**API Dependencies:** SCI-51 (freshness query), SCI-52 (re-verification)

**Security Requirements:** Own-row RLS for freshness data · Recruiter visibility gated by consent or application context

**Failure Modes:** Decay curve missing for skill → default to moderate · Market signal unavailable → freshness = time-only

**Edge Cases:** Skill deprecated → freshness irrelevant, marked "deprecated" · Candidate disputes freshness → manual review (30-day SLA) · Multiple credentials for same skill → most recent counts

**Analytics Events:** `freshness_computed`, `reverification_prompted`, `reverification_completed`, `freshness_demoted`, `market_drift_detected`

**State Machine:**

```mermaid
stateDiagram-v2
    [*] --> fresh: verification
    fresh --> current: 12 months
    current --> aging: 24 months
    aging --> stale: 36 months
    stale --> expired: 60 months
    aging --> fresh: re-verified
    stale --> fresh: re-verified
    expired --> fresh: re-verified
    expired --> demoted: no re-verification
    demoted --> fresh: re-verified
    fresh --> [*]
    demoted --> [*]
```

**Acceptance Criteria:** Freshness computed nightly for all verified skills · Decay curves validated against market data (quarterly review) · Re-verification restores freshness within 24h · Zero freshness leakage without consent · Market drift alerts accurate (measure false positive rate)

**Feature Dependencies:** F-84, F-96 · **Blocks:** None

---

#### F-144 Reputation Engine

| Attribute      | Value                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| **Feature ID** | F-144                                                                               |
| **Priority**   | 9                                                                                   |
| **Phase**      | Ph2                                                                                 |
| **Purpose**    | Multi-context reputation (candidate, instructor, employer, peer, community, mentor) |
| **Actors**     | All authenticated users                                                             |

**Core Behavior:**

1. **Signal Aggregation** — Credentials + endorsements + reviews + contributions + peer feedback.
2. **Context-Specific Scoring** — Separate reputation per role context (instructor, employer, peer, community).
3. **Domain-Specific Reputation** — "Expert in Python" vs "expert in leadership."
4. **Weighting** — Weight by source credibility, difficulty, relationship proximity.
5. **Time Decay** — Recent signals matter more (configurable half-life).
6. **Reputation Recovery** — Path to rebuild after mistakes.
7. **Privacy-Preserving** — Never expose individual signals without consent.
8. **Derived Scores** — Overall reputation + per-domain breakdown.

**Business Rules:** BR-247..BR-254

**Data Dependencies:** `reputation_scores`, `reputation_signals`, `reputation_history`, `reputation_config`

**API Dependencies:** SCI-55 (reputation query; outside the SCI-01..SCI-54 register of §13.1, not defined)

**Security Requirements:** RLS own-row + aggregate public

**Acceptance Criteria:** Reputation computation nightly · Deterministic weighting · Zero individual signal leakage · Recovery path functional

**Feature Dependencies:** F-96, F-58, F-72 · **Blocks:** F-148, F-149, F-150

---

#### F-145 Recommendation Engine Core

| Attribute      | Value                                                                           |
| -------------- | ------------------------------------------------------------------------------- |
| **Feature ID** | F-145                                                                           |
| **Priority**   | 9                                                                               |
| **Phase**      | Ph2–3                                                                           |
| **Purpose**    | Unified recommendation architecture for jobs, courses, people, content, mentors |
| **Actors**     | All authenticated users                                                         |

**Core Behavior:**

1. **Collaborative Filtering** — Users like me want what?
2. **Content-Based Filtering** — Similar profiles, similar skills.
3. **Hybrid Approach** — Combine signals (skill match + peer signals + market demand) with weights.
4. **Confidence Calibration** — Only recommend when confident.
5. **Explanation Layer** — Why is this recommended? (mandatory for trust)
6. **Cold-Start Strategy** — New users get best-guess recommendations from demographics + signals.
7. **Diversity Injection** — Some serendipity, not pure relevance.
8. **Feedback Loop** — Learn from acceptances/rejections.
9. **Recommendation Types:** Jobs, courses, people, mentors, articles, communities, events, projects.
10. **Reasons Exposed:** Every recommendation displays contributing factors.

**Business Rules:** BR-255..BR-262

**Data Dependencies:** `recommendation_signals`, `user_preferences`, `recommendation_history`

**API Dependencies:** SCI-56 (recommendations; outside the SCI-01..SCI-54 register of §13.1, not defined)

**Security Requirements:** RLS-scoped · No protected attributes (FAIR-001)

**Acceptance Criteria:** Recommendation p95 <500ms · Confidence threshold enforced · Explanations always present · Diversity injection active

**Feature Dependencies:** F-84, F-144 · **Blocks:** All personalization

---

### 9.3 Tier 2 Competitive Features (Priority 8)

§7 `P` governs this tier (§7 authority note): F-146 and F-150 below are P7 in §7.

_(Due to length, Priority 8–3 feature specifications follow the same template as Priority 9–10 features; this file calls it a 24-field template but does not list the fields. Full specifications for all 173 features are said to be maintained in the canonical source, which this file does not identify; §7 remains the complete inventory. Representative specifications below.)_

#### F-121 Warm Introduction Paths

**Purpose:** Compute and facilitate warm introduction routes between users and target contacts.

**Core Behavior:** Path discovery (depth 1–4), path scoring (mutual strength + alumni + skills + companies + interactions), path ranking (top 3), introduction request (target, purpose, context ≤500 chars, optional resume), introducer notification (approve/decline/request info), warm intro delivery (three-way message via F-10), path privacy (opt-in introducer status), ethical guardrails (max 10/week; block specific users; target can block all), success tracking.

**Business Rules:** BR-209..BR-216

**Data:** `introduction_paths` (derived), `introduction_requests`, `introduction_consents`

**API:** SCI-47 (path discovery), SCI-48 (request lifecycle)

**Acceptance:** Path p95 <500ms depth ≤3 · 0 unauthorized path exposure · introducer consent DB-enforced · rate limit 10/week · delivery <5s

---

#### F-142 Referral Request System

**Purpose:** Structured referral asks via network.

**Core Behavior:** Eligibility (target job + ≥1 connection at company + ≥70% skill match + <3 requests/30 days), referrer selection (works at company ≤6 months, direct preferred, relevant role), request (target job, pitch ≤300 chars, optional resume, specific ask), notification (who, which job, pitch, resume; actions: Refer/Forward/Decline/Ignore), delivery (structured referral to recruiter via F-06; application tagged "referred"), rewards (org-configurable: XP, monetary bounty, recognition), analytics, anti-abuse (max 3/30d; block user; disable globally).

**Business Rules:** BR-233..BR-240

**Data:** `referral_requests`, `referral_outcomes`, `referral_rewards`, `job_applications`, `connections`, `xp_transactions`

**API:** SCI-53 (referral lifecycle)

**Acceptance:** Delivery <5s · 100% employment verification · rate limits enforced · attribution 12mo · anti-abuse active

---

#### F-146 Activity & Contribution Tracking

**Purpose:** Track user activity and contributions across the platform.

**Core Behavior:** Contribution tracking (posts, answers, projects, code, content), engagement scoring (active vs. passive users), learning activity (courses started, challenges solved, assessments taken), social activity (follows, connections, recommendations given), content creation activity (posts, articles, courses created), collaboration activity (team projects, peer reviews, mentoring), time-series tracking (how activity changes over time).

**Data:** `activity_events`, `contribution_scores`

**Acceptance:** Activity tracked real-time · engagement scores deterministic · contributions feed F-159 Behavioral Talent Discovery

---

#### F-147 Unified Search & Discovery

**Purpose:** Cross-domain unified search across all entities.

**Core Behavior:** Unified index (people, jobs, courses, companies, projects, discussions, articles, events), multi-faceted filtering (skills, roles, locations, levels, reputations), ranking (relevance + recency + engagement + quality), personalization (based on user history), autocomplete & spell correction, search analytics, RLS scoping, search maturity roadmap (Postgres FTS → hybrid → dedicated engine).

**Business Rules:** BR-263..BR-268

**Data:** `search_index` (derived)

**API:** SCI-57 (search; outside the SCI-01..SCI-54 register of §13.1, not defined)

**Acceptance:** Search p95 <300ms · 0 RLS leakage · autocomplete <100ms · typo tolerance active

---

#### F-148 Instructor Reputation System

**Purpose:** Instructor credibility signals beyond course reviews.

**Core Metrics:** Course quality (reviews, completion rates, learning outcomes), teaching effectiveness (student ratings), currency (are courses kept up-to-date?), responsiveness (Q&A response time), community standing (endorsements from other instructors).

**Data:** Extends `reputation_scores`

**Dependencies:** F-72, F-144

**Acceptance:** Instructor reputation computed nightly · transparent factor breakdown · no individual review manipulation

---

#### F-150 Peer Credibility Networks

**Purpose:** Weight endorsements by endorser's own credibility.

**Core Components:** Endorser credibility (weight endorsements by endorser's reputation), network distance (first-degree endorsements stronger than fifth-degree), specialization (endorser is expert in this skill), track record (have endorser's recommendations proven accurate?).

**Data:** Extends `endorsement_weights`

**Dependencies:** F-110, F-144

**Acceptance:** Endorsement weight computation deterministic · network distance calculated correctly · zero gaming vectors

---

### 9.4 Tier 3-4 Features (Priority 7-4)

_(Priority 7–4 features follow the same detailed specification template. Full specifications are said to be available in source, which this file does not identify; §7 remains the complete inventory. Representative examples below.)_

#### F-13 Resume Builder (Priority 7)

Profile-based resume generation. Templates, PDF export, ATS-friendly. Prefill from profile.

**Business Rules:** RESUME-001..003

**Data:** `resumes`

**Acceptance:** Resume generation <2s · PDF renders correctly · ATS parse-compatible

#### F-16 Billing & Subscriptions (Priority 7)

> v6.1 amendment: see Appendix E, item V61-09

Stripe subscriptions (Free, Pro, Team, Enterprise). Webhook-owned state. Demo-guard until credentials. Entitlements enforced. This file fixes no price, AI quota, allowance or cap for these plans; every such number is undecided (V61-09).

**Business Rules:** BILL-001..014

**Data:** `subscriptions`, `invoices`, `entitlements`, `payment_methods`, `billing_events`

**Acceptance:** Webhook idempotency 100% · entitlement enforcement server-side · zero double-billing

#### F-75 Employer Insights (Priority 7)

> v6.1 amendment: see Appendix E, item V61-04

Company reviews (structure + categories), anonymous, CEO approval, salary reports with aggregation, interview experiences, question database, benefits reviews, company responses, moderation.

**Business Rules:** GLASS-001..017, BR-135..138

**Data:** `company_reviews`, `salary_reports`, `interview_experiences`, `interview_questions`, `company_responses`

**Acceptance:** Salary aggregation k ≥5 (BR-135; an override below the `min_cohort_k` default of k ≥ 10 — needs owner and counsel decision; the default applies until then) · anonymity protection 100% · moderation SLA <24h

#### F-87 Interview Experience Repository (Priority 7)

> v6.1 amendment: see Appendix E, item V61-04

Crowdsourced interview reports (questions, difficulty, tips, outcomes). Moderation. Aggregated view (k ≥3; an override below the `min_cohort_k` default of k ≥ 10 — needs owner and counsel decision; the default applies until then).

**Data:** `interview_experiences`, `interview_questions`

**Acceptance:** Aggregation k ≥3 (override below the `min_cohort_k` default; see above) · moderation before display · zero interviewer PII

#### F-93 Interview Video Recording & AI Feedback (Priority 7)

Optional recording (dual consent). Post-session AI analysis: communication signals, technical correctness, benchmark comparison. Never emotion/sentiment. Encrypted, ≤90 days.

**Business Rules:** BR-169..BR-176

**Data:** `interview_recordings`, `interview_feedback`

**Acceptance:** Dual consent 100% · encryption at rest · retention ≤90d · no emotion analysis

#### F-94 Verified Work History & References (Priority 7)

> v6.1 amendment: see Appendix E, items V61-17 and V61-20

Employment history with company email verification. Referee system: structured recommendations. Who may act as a referee is not specified (for example, a referee address distinct from the candidate's own and from other referees on the role); open (§27.8 item 7). Employment dates, title, achievements verified.

**Data:** `verified_work_history`, `references`

**Acceptance:** Employment verification <7d · reference structured · zero resume fraud

#### F-95 Career Transition Planning (Priority 7)

Target role selection. Transition readiness. Learning plan (skill gap → courses, experience gap → projects, credential gap → certifications). Timeline. Progress tracking.

**Data:** Derived from F-84, F-85, F-91, F-07

**Dependencies:** F-84, F-91, F-07

**Acceptance:** Plan generated <1s · progress tracked server-side

#### F-98 Employer Equity & Compensation Intelligence (Priority 7)

> v6.1 amendment: see Appendix E, item V61-04

Equity data (RSU, options, ESOP). Vesting schedule, grant value. Aggregated by company/role/level. ESOP education. Separate from salary (BR-183).

**Data:** `equity_norms`, `equity_reports`

**Acceptance:** Separate from salary · aggregation k ≥5 · company-specific with ≥3 reports (both are overrides below the `min_cohort_k` default of k ≥ 10 — need owner and counsel decision; the default applies until then)

#### F-99 AI Career Coach (Priority 7)

All F-11 capabilities plus: resume review, interview prep, skill recommendations, career roadmap, real-time Q&A. Full platform context. Draft-only.

**Business Rules:** AI-001..011

**Acceptance:** Capability-specific evidence/quality gate · human review where required · no autonomous consequential action

#### F-104 Pre-Hire Assessment Customization (Priority 7)

Recruiter creates custom assessment: questions, rubric, time limit. Deploy to candidates. Auto-grading + manual review. Admin approval before deploy.

**Data:** `custom_assessments`, `custom_assessment_attempts`

**Acceptance:** Admin approval required · assessment results feed ATS

#### F-106 Skill Prerequisite Engine (Priority 7)

Course prerequisites (from F-84). Enrollment gate: check verified skills. Suggest prereq courses. Auto-unlock on completion.

**Business Rules:** BR-022

**Data:** Derived from F-84

**Acceptance:** Prereq check <100ms · auto-unlock on completion

#### F-110 Verified Skill Endorsements (Priority 7)

Peer endorses skill (must be connected). Weight from reputation + proximity. Display: "Verified by 5 peers". Weighted endorsement strengthens signal.

**Business Rules:** BR-131, BR-152

**Data:** `skill_endorsements`, `endorsement_weights`

**Acceptance:** Endorsement weight deterministic · endorsement revocable within 30d

#### F-116 Accessibility & Inclusive Learning (Priority 7)

WCAG 2.2 AA for all content. Captions/transcripts. Screen-reader-optimized UI. Customizable UI. Multiple formats (video, article, audio-only).

**Acceptance:** WCAG 2.2 AA conformance · axe 0 critical/serious

#### F-125 Alumni Networks (Priority 7)

Institution-based networking. Affiliation verification (email domain or institutional seat). Alumni discovery. Alumni hiring. Mentor matching within alumni.

**Data:** `alumni_affiliations`, `alumni_groups`, `alumni_group_members`, `alumni_hiring`, `alumni_mentorship`

**Acceptance:** Affiliation verified · cross-institution isolation 100% · discovery p95 <500ms

#### F-149 Employer Reputation & Brand System (Priority 7)

Brand perception scoring. Hiring quality. Culture signals. Growth signals. Reliability. Transparency.

**Data:** Extends `reputation_scores`

**Dependencies:** F-75, F-56, F-144

**Acceptance:** Multi-dimensional scoring · transparent factors · review-derived ratings shown only for cohorts that meet `min_cohort_k` (Amendment G) · reviewer identity never in public or employer views (§5.9)

#### F-151 Skill Supply/Demand Forecasting (Priority 7)

Skill demand trajectory. Skill supply availability. Salary trend prediction. Geographic heat maps. Industry shifts. Time-to-marketability.

**Implementation:** Time-series models (ARIMA, Prophet) + ML on historical data.

**Data:** Extends `skill_market_signals`

**Acceptance:** Forecast accuracy tracked · 12-month horizon · confidence intervals disclosed

#### F-152 Career Trajectory Analysis (Priority 7)

> v6.1 amendment: see Appendix E, item V61-04

Common career paths. Success factors. Risks. Salary impact. Retention. Time patterns.

**Data:** Derived from F-85

**Acceptance:** Pattern detection statistically valid · k ≥20 per cell (a feature override stricter than the `min_cohort_k` default of k ≥ 10)

#### F-153 Learning Impact Dashboard (Enhanced) (Priority 7)

> v6.1 amendment: see Appendix E, item V61-04

Course completion → hire rate. Course completion → salary impact. Course completion → job satisfaction. Course completion → retention. Course completion → advancement. Skills learned → actual use. Path effectiveness.

**Data:** Extends F-114

**Acceptance:** Correlation not causation · k ≥30 (a feature override stricter than the `min_cohort_k` default of k ≥ 10) · all claims labelled

#### F-158 Talent Pool Intelligence (Priority 6)

Pool skill composition. Pool gaps. Pool diversity. Pipeline health. Time-to-hire by source. Conversion rates. Talent retention. Cost-per-hire.

**Data:** Derived from F-92

**Acceptance:** Pool analytics computed on-demand · diversity metrics anonymized and suppressed below `min_cohort_k` (default k ≥ 10, Amendment G)

#### F-159 Behavioral Talent Discovery (Priority 6)

Contributor ranking. Engagement scoring. Project activity. Learning trajectory. Community standing. Emerging expertise. Peer endorsements.

**Data:** Derived from F-146

**Acceptance:** Discovery based on real activity · no gaming vectors

---

# PART IV — WORKFLOWS & STATE

---

## 10. Journeys, Workflows, State Machines & Business Rules

The following is the canonical behavioral corpus for end-to-end journeys, workflow integrity, state transitions, and business rules. Repeated definitions elsewhere should reference these records rather than recreate them.

### 10.1 Journey Identity Rule

The canonical journey registry contains **28 journeys (J-01..J-28)**. Historical references to larger counts do not create additional canonical journeys. Measured: the register in §10.2 has 28 rows, J-01..J-28, with no gaps or duplicates; this matches §24.8.1.

### 10.2 Complete Journey Register (J-01..J-28)

| ID   | Name                                               | Persona           | Terminal                         |
| ---- | -------------------------------------------------- | ----------------- | -------------------------------- |
| J-01 | Learn → Prove → Showcase                           | P-A, P-B          | Portfolio with verified signals  |
| J-02 | Apply → Track → Hire                               | P-A, P-B          | Offer accepted                   |
| J-03 | Post → Source → Hire                               | P-C, P-E, P-S     | Offer extended                   |
| J-04 | Org Setup → Team → Launch                          | P-C, P-E          | First hire                       |
| J-05 | Profile → Network → Referral                       | P-A, P-B          | Referred hire                    |
| J-06 | AI Career Path: Gap → Plan → Execute               | P-B               | Gaps addressed                   |
| J-07 | Creator: Author → Publish → Monetize               | P-G               | Revenue                          |
| J-08 | Mentor: Match → Guide → Impact                     | P-H               | Impact measured                  |
| J-09 | Institution: Cohort → Place → Track                | P-I               | Placement reported               |
| J-10 | Agency: Multi-Org → Pipeline → Bill                | P-F               | Client invoice                   |
| J-11 | Extension: Install → Local-First → Sync            | P-A               | Profile diff applied             |
| J-12 | B2B2C Graduation Flywheel                          | P-I, ML           | Independent candidate            |
| J-13 | Institutional Media Authoring                      | P-G, P-K          | Course assigned to batch         |
| J-14 | Institutional Procurement & Licensing              | P-J               | Seats provisioned                |
| J-15 | Faculty: Teach → Monitor → Intervene               | P-K               | At-risk students intervened      |
| J-16 | Corporate L&D: Mandate → Track → Certify           | P-L, P-T          | Certification + HRIS sync        |
| J-17 | LinkedIn Migration On-ramp                         | New user          | Native account complete          |
| J-18 | Creator: Author → Publish → Sell → Payout          | P-G               | Monthly settlement               |
| J-19 | Self-Paced Learner: Discover → Certify             | P-M               | Path enrolled                    |
| J-20 | Learner: Path → Courses → Capstone → Cert          | P-M               | Program certificate              |
| J-21 | Contestant: Register → Compete → Rank → Certify    | P-Q               | Certification badge              |
| J-22 | Researcher: Company → Reviews → Compare → Apply    | P-O               | Apply started                    |
| J-23 | Author: Post → Engage → Article → Newsletter       | P-N               | Audience established             |
| J-24 | Reviewer: Write → Moderate → Publish → Response    | Any verified user | Published review                 |
| J-25 | Peer Reviewer: Assigned → Rubric Review → Feedback | Student           | Grade finalized                  |
| J-26 | Career Switcher: Assess → Plan → Transition        | P-R               | Role transition confirmed        |
| J-27 | Hiring Manager: Define → Assess → Hire → Track     | P-S               | Post-hire outcome recorded       |
| J-28 | Skills Analyst: Analyze → Recommend → Measure      | P-T               | Learning program impact reported |

Open (owner decisions): (1) J-11 ends with a sync ("Profile diff applied"), while BR-30 (§10.18) keeps extension data in `chrome.storage.local` with no sync, fetch or network; one of the two must change (OPEN-LGA-07). (2) The Persona column disagrees with §5.5 for J-15 (§5.5 also gives P-J) and J-27 (§5.5 also gives P-E). `ML` (J-12), "New user" (J-17), "Any verified user" (J-24) and "Student" (J-25) are not §5.5 personas, and `ML` is defined nowhere. (3) Only J-02 and J-26 have detail (§10.3, §10.4); no other journey records its §5.2 stages, §5.3 recovery paths, workflows, routes or place in the Amendment B loop.

### 10.3 J-02 Apply → Track → Hire (Detailed)

```mermaid
journey
    title J-02 Apply → Track → Hire
    section Discovery
      Browse jobs: 5: Candidate
      Filter results: 4: Candidate
      View detail: 5: Candidate
    section Application
      Click Apply: 5: Candidate
      Completeness gate: 3: System
      Autosave draft: 4: System
      Submit: 5: Candidate
      Recruiter notified: 5: System
    section Review
      Recruiter screens: 3: Recruiter
      Shortlist: 4: Recruiter
      Schedule interview: 4: Recruiter
      Interview: 4: Both
      Scorecard: 3: Interviewer
    section Decision
      HM review: 4: Hiring Manager
      Offer: 5: Recruiter
      Accept: 5: Candidate
      Hire recorded: 5: System
```

### 10.4 J-26 Career Switcher (Detailed)

```mermaid
flowchart LR
    A[Target role identified] --> B[F-91 Career Readiness]
    B --> C{Skills gap?}
    C -->|Yes| D[F-95 Career Transition Plan]
    D --> E[F-84 suggests learning]
    E --> F[F-07 enroll courses]
    F --> G[F-08 challenges + F-69 assignments]
    G --> H[F-96 Skill Evidence]
    H --> I[F-85 Career Graph comparison]
    I --> J{Ready?}
    J -->|Yes| K[Apply via F-04]
    J -->|No| D
    K --> L[F-88 Interview Platform]
    L --> M[Hired + outcome tracked]
```

---

### 10.5 Workflows & Integrity Traces

This heading groups §10.6 and §10.7 below.

### 10.6 Complete Workflow Register (WF-01..WF-66)

| ID    | Workflow                                         | Terminal                          |
| ----- | ------------------------------------------------ | --------------------------------- |
| WF-01 | Candidate Discovery → Application                | Application submitted             |
| WF-02 | Recruiter Sourcing Pipeline                      | Shortlist confirmed               |
| WF-03 | Course Enrollment & Completion                   | Certificate + XP                  |
| WF-04 | Challenge Participation & Scoring                | Score recorded                    |
| WF-05 | Application Review & Decision                    | Hired / rejected                  |
| WF-06 | Offer Management & Negotiation                   | Offer accepted / expired          |
| WF-07 | AI Career Assistant Conversation                 | User-accepted action              |
| WF-08 | Content Moderation & Enforcement                 | Resolution logged                 |
| WF-09 | Subscription Purchase & Upgrade                  | Active entitlement                |
| WF-10 | Messaging Thread & Response                      | Message persisted + ack           |
| WF-11 | XP Earning & Level Progression                   | Ledger row + level                |
| WF-12 | Onboarding & First-Experience                    | First meaningful action           |
| WF-13 | Reported Content Review                          | Action logged + appeal window     |
| WF-14 | Invitation & Team Growth                         | Membership active                 |
| WF-15 | Employer Brand Profile Setup                     | Profile published + verified      |
| WF-16 | Institutional License Purchase                   | Pool active + invoice reconciled  |
| WF-17 | Bulk Student Import                              | Students provisioned + report     |
| WF-18 | Batch Course Assignment                          | Batch enrolled + seats exact      |
| WF-19 | Media Ingestion & Validation                     | Media validated + ready           |
| WF-20 | License Revocation & Seat Reassignment           | Seat returned + reassigned        |
| WF-21 | Graduation Transition (B2B2C)                    | Independent profile active        |
| WF-22 | Institutional Renewal                            | Renewal confirmed                 |
| WF-23 | Purchase Approval                                | Purchase approved + PO issued     |
| WF-24 | Course Publish Review                            | Approved / rejected with feedback |
| WF-25 | Course Purchase & Enrolment                      | Enrolled                          |
| WF-26 | Coupon Redemption                                | Discount applied                  |
| WF-27 | Refund Request → Review → Refund/Deny            | Refunded / denied                 |
| WF-28 | Instructor Payout Settlement                     | Payout paid                       |
| WF-29 | Quiz Attempt & Grading                           | Grade recorded                    |
| WF-30 | Assignment Submit → Grade / Peer Review          | Grade finalized                   |
| WF-31 | Path Enrolment & Progression                     | Path completed                    |
| WF-32 | Contest Lifecycle                                | Results published                 |
| WF-33 | Certification Exam Attempt                       | Pass / fail / expired             |
| WF-34 | Post Publish → Feed Distribution                 | Post visible in feed              |
| WF-35 | Newsletter Issue Send                            | Sent / paused                     |
| WF-36 | Company Review Moderation                        | Published / removed               |
| WF-37 | Salary Report Aggregation                        | Aggregated                        |
| WF-38 | Recommendation Request → Give → Accept → Display | Displayed / declined              |
| WF-39 | Outreach Credit Send → Reply → Refund            | Replied / expired                 |
| WF-40 | Profile View Logging                             | Logged per privacy mode           |
| WF-41 | LinkedIn Migration Import                        | Native account complete           |
| WF-42 | Skill Gap Assessment → Learning Plan             | Learning plan activated           |
| WF-43 | Career Readiness Evaluation                      | Readiness score computed          |
| WF-44 | Salary Data Submission → Aggregation             | Aggregated                        |
| WF-45 | Technical Interview Assessment                   | Assessment completed              |
| WF-46 | Interview Recording + AI Feedback                | Feedback report generated         |
| WF-47 | Skill Evidence Issuance                          | Credential verified               |
| WF-48 | Contribution Verification                        | Commit impact verified            |
| WF-49 | Peer Mentorship Match → Session                  | Session completed                 |
| WF-50 | Expert Network Call Request                      | Call concluded                    |
| WF-51 | Custom Assessment Creation → Deployment          | Assessment live                   |
| WF-52 | Post-Hire Outcome Tracking                       | Outcome recorded                  |
| WF-53 | Certification Exam Attempt                       | Pass/fail/expired                 |
| WF-54 | Emerging Skill Detection → Publication           | New skill added to taxonomy       |
| WF-55 | Warm Introduction Request → Delivery             | Intro delivered                   |
| WF-56 | Application Feedback → Learning Loop             | Improvement action                |
| WF-57 | Skill Freshness → Re-verification                | Freshness restored                |
| WF-58 | Referral Request → Hire                          | Referral outcome                  |
| WF-59 | Alumni Network Join → Connect                    | Alumni connection                 |
| WF-60 | Reputation Signal → Score Update                 | Score recomputed                  |
| WF-61 | Recommendation → Acceptance → Learning           | Feedback loop                     |
| WF-62 | Activity Tracking → Discovery                    | Behavioral signal                 |
| WF-63 | Interview Prep → Session → Feedback              | Prep completed                    |
| WF-64 | Adaptive Learning → Mastery                      | Skill mastered                    |
| WF-65 | PDP Goal → Milestone → Achievement               | Goal achieved                     |
| WF-66 | Internal Mobility Match → Transition             | Internal move                     |

Measured: 66 rows, WF-01..WF-66; this matches §24.8.1. WF-33 and WF-53 carry the same name (Certification Exam Attempt) and the same terminal; both ids are kept. Whether they are one workflow or two is an owner decision (the target crosswalk `06_BUSINESS_PROCESSES/SSOT_WORKFLOW_CROSSWALK.md` keeps both pending owner review). Their terminal `expired` is not reachable in the §10.10 Certification Attempt diagram, whose only terminal is `certified` (V61-11).

### 10.7 Workflow Integrity Traces (WIT-001..WIT-025)

Traces exist for WF-01..WF-25 only (25 rows); WF-26..WF-66 have no integrity trace in this file.

| WF    | Name                                   | Trace   | Terminal Exit                             | Primary Guard                                      |
| ----- | -------------------------------------- | ------- | ----------------------------------------- | -------------------------------------------------- |
| WF-01 | Candidate Discovery → Application      | WIT-001 | Application submitted + confirmation      | Idempotency-Key + draft restore                    |
| WF-02 | Recruiter Sourcing Pipeline            | WIT-002 | Shortlist confirmed + invite sent         | Tenant-scoped RLS + optimistic locking             |
| WF-03 | Course Enrollment & Completion         | WIT-003 | Enrollment completed + certificate + XP   | Unique enrollment guard + idempotent XP            |
| WF-04 | Challenge Participation & Scoring      | WIT-004 | Scored (≥70%) + XP                        | Sandbox ≤30s + idempotent score                    |
| WF-05 | Application Review & Decision          | WIT-005 | Terminal hired/rejected + event           | Mandatory scorecard precondition                   |
| WF-06 | Offer Management & Negotiation         | WIT-006 | Offer accepted or expired                 | Single active offer constraint                     |
| WF-07 | AI Career Assistant Conversation       | WIT-007 | User-accepted action (or dismissal)       | `<user_content>` sanitization + heuristic fallback |
| WF-08 | Content Moderation & Enforcement       | WIT-008 | Resolution logged + notice sent           | Append-only queue + two-human review on bans       |
| WF-09 | Subscription Purchase & Upgrade        | WIT-009 | Active entitlement reconciled with Stripe | Webhook signature + idempotent credit              |
| WF-10 | Messaging Thread & Response            | WIT-010 | Message persisted + delivery ack          | clientMessageId dedupe + Realtime RLS              |
| WF-11 | XP Earning & Level Progression         | WIT-011 | XP ledger row + recomputed level          | UNIQUE(user_id, reference_type, reference_id)      |
| WF-12 | Onboarding & First-Experience          | WIT-012 | First meaningful action complete          | Resumable onboarding + email verify retry          |
| WF-13 | Reported Content Review                | WIT-013 | Admin action logged + appeal window open  | Severity SLA escalation + immutable audit          |
| WF-14 | Invitation & Team Growth               | WIT-014 | Membership active with mapped role        | Unique crypto token + 7-day TTL                    |
| WF-15 | Employer Brand Profile Setup           | WIT-015 | Profile published & verified              | Domain verification gate                           |
| WF-16 | Institutional License Purchase         | WIT-016 | Pool active + invoice reconciled          | Idempotency (PO number + Stripe event.id)          |
| WF-17 | Bulk Student Import                    | WIT-017 | Students provisioned + error report       | Validate-then-commit                               |
| WF-18 | Batch Course Assignment                | WIT-018 | Batch enrolled + seats consumed exactly N | Row lock + CHECK used≤total                        |
| WF-19 | Media Ingestion & Validation           | WIT-019 | Media validated + asset ready             | Validation states + SSRF allow-list                |
| WF-20 | License Revocation & Seat Reassignment | WIT-020 | Seat returned + reassigned exactly once   | Row lock + progress retained                       |
| WF-21 | Graduation Transition (B2B2C)          | WIT-021 | Independent profile active                | Never auto-convert + transactional                 |
| WF-22 | Institutional Renewal                  | WIT-022 | Renewal confirmed or graceful expiry path | Expiry scan job + grace period                     |
| WF-23 | Purchase Approval                      | WIT-023 | Purchase approved + PO issued             | Configurable chain + RBAC per level                |
| WF-24 | Course Publish Review                  | WIT-024 | Approved / rejected with feedback         | Admin review SLA ≤72h + max 3 rejections           |
| WF-25 | Course Purchase & Enrolment            | WIT-025 | Enrolled                                  | Webhook-owned fulfillment                          |

---

### 10.8 State Machines

This heading groups §10.9 to §10.11 below.

### 10.9 Complete State Machine Index

> v6.1 amendment: see Appendix E, items V61-11 and V61-18

Measured: this index has 45 rows and §10.10 draws 7 canonical diagrams; §24.8.1 locks the state-machine count at 53 (see Appendix E, item V61-10). Certification Attempt appears twice (a generic row and an F-115 row) with different terminal sets. Several rows list a state that later moves on, which §10.11 ("Terminal states are irreversible without a new entity") does not allow for a terminal state: Organization `active` and Instructor `active`, Course Version `current` (superseded by SCI-19), Course (authoring) `published` (BR-114), Certificate `verified` (the Credential machine revokes and expires verified items), Job `closed`, Contest `results_published`, Course Order `enrolled`, and Skill Freshness `demoted` (its F-123 diagram has `demoted --> fresh`). Until OPEN-45 closes, read this column as terminal or long-lived resting states. State names are written in lower `snake_case`; where a terminal set below differs from the §10.10 diagram for the same entity, the difference is recorded under that diagram and is not resolved here (V61-11).

| Entity                        | Terminal States                                                     |
| ----------------------------- | ------------------------------------------------------------------- |
| Application                   | hired, rejected, withdrawn, stale_withdrawn, candidate_unresponsive |
| Job                           | closed, archived                                                    |
| Offer                         | hired, closed                                                       |
| Enrollment                    | completed, dropped, expired                                         |
| Organization                  | active, archived                                                    |
| Interview                     | completed, cancelled                                                |
| Mentor Relationship           | completed, cancelled                                                |
| Certificate                   | verified, revoked, expired                                          |
| Moderation                    | approved, rejected                                                  |
| Challenge Submission          | passed, failed, error                                               |
| Background Job                | succeeded, dead                                                     |
| License/Seat                  | expired, revoked, returned                                          |
| Managed Learner               | independent, archived                                               |
| Media Asset                   | ready, failed, archived                                             |
| Purchase Request              | purchased, cancelled                                                |
| Course (authoring)            | published, archived, unpublished                                    |
| Course Version                | current, superseded                                                 |
| Quiz Attempt                  | graded                                                              |
| Assignment                    | graded, returned                                                    |
| Peer Review                   | completed                                                           |
| Learning Path Enrollment      | completed, dropped                                                  |
| Course Order                  | enrolled, cancelled, refunded                                       |
| Coupon                        | exhausted, expired, revoked                                         |
| Payout                        | paid, failed                                                        |
| Company Review                | published, removed                                                  |
| Salary Report                 | aggregated                                                          |
| Interview Question            | published, rejected                                                 |
| Contest                       | results_published, archived                                         |
| Certification Attempt         | passed, failed, expired                                             |
| Post                          | deleted, hidden_by_moderation                                       |
| Comment                       | deleted, removed_by_moderation                                      |
| Newsletter Issue              | sent, failed                                                        |
| Recommendation                | displayed, declined, withdrawn                                      |
| Outreach Message              | replied, expired                                                    |
| Group Membership              | left, removed                                                       |
| Event                         | completed, cancelled                                                |
| Migration Job                 | completed, failed, cancelled                                        |
| Instructor                    | active, retired                                                     |
| Skill (F-84)                  | merged                                                              |
| Credential (F-96)             | revoked, expired                                                    |
| Interview Assessment (F-88)   | reviewed, cancelled, no_show                                        |
| Career Readiness (F-91)       | completed, abandoned                                                |
| Mentorship Session (F-90)     | rated, declined, cancelled                                          |
| Certification Attempt (F-115) | certified                                                           |
| Skill Freshness (F-123)       | demoted                                                             |

### 10.10 Canonical State Machines

#### Application

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> submitted
    submitted --> under_review
    submitted --> withdrawn
    submitted --> archived
    under_review --> shortlisted
    under_review --> rejected
    under_review --> archived
    shortlisted --> interview
    shortlisted --> rejected
    shortlisted --> archived
    interview --> assessment
    interview --> offer
    interview --> rejected
    assessment --> offer
    assessment --> rejected
    offer --> hired
    offer --> rejected
    hired --> [*]
    rejected --> [*]
    withdrawn --> [*]
    archived --> [*]
```

Terminal sets differ between the §10.9 index (hired, rejected, withdrawn, stale_withdrawn, candidate_unresponsive) and this diagram (hired, rejected, withdrawn, archived); the index also lists Offer as a separate machine (hired, closed) while this diagram treats `offer` as an Application state — see V61-11. Target renames (`under_review` → `in_review`, `interview` → `interviewing`, `offer` → `offer_extended`) are Proposed — see V61-18. Further gaps (open, owner decision; OPEN-45): `stale_withdrawn` is the target of BR-069 (auto-transition after 14 days) but is not a state of this diagram, and F-04 step 5's partial unique index does not exclude it, so an application moved there would block re-application to that job (BR-15). `candidate_unresponsive` appears in no rule or transition. Withdrawal is drawn only from `submitted`. Offer outcomes are named three ways (the §10.9 Offer row: hired, closed; WF-06: accepted, expired; this diagram: `offer` → hired, rejected), none has an expiry or a candidate-declined state, and J-02 ends at "Offer accepted" with no candidate-side offer action or route specified.

#### Job

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> pending_approval
    pending_approval --> approved
    pending_approval --> rejected_by_moderation
    rejected_by_moderation --> draft: revise
    approved --> scheduled
    approved --> published
    scheduled --> published
    published --> paused
    paused --> published
    published --> closed
    closed --> archived
    archived --> [*]
```

Terminal sets differ between the §10.9 index (closed, archived) and this diagram (archived only; `closed` leads to `archived`) — see V61-11. Both cannot hold under §10.11: either `closed` is terminal and archiving is a flag rather than a state (the target's reading, Proposed under V61-18), or `closed` is non-terminal as drawn (owner decision, OPEN-45). Target renames and removed states for Job are Proposed — see V61-18.

#### Credential (F-96)

```mermaid
stateDiagram-v2
    [*] --> issued
    issued --> verified
    issued --> disputed
    disputed --> upheld
    disputed --> revoked
    verified --> expired
    verified --> revoked
    upheld --> issued
    revoked --> [*]
    expired --> [*]
```

State-machine gaps (open): an `issued` credential reaches `revoked` only through `disputed`, although F-96 step 4 lets an admin revoke; a `verified` credential cannot be disputed; F-96 has `issued → verified` fire on an anonymous public lookup, so a public read changes state and, under §10.11, writes an audit record; and no state represents anonymization on erasure.

#### Certification Attempt (F-115)

```mermaid
stateDiagram-v2
    [*] --> registered
    registered --> in_progress
    in_progress --> submitted
    submitted --> graded
    graded --> passed
    graded --> failed
    passed --> certified
    failed --> cooldown
    cooldown --> registered: 7 days
    certified --> [*]
```

This diagram matches the §10.9 F-115 row (certified). SCI-32 keys an attempt by (certification, user, attempt_no), so a retake is a new attempt; the `cooldown --> registered` loop instead reuses one attempt, and the F-115 state diagram (§9.2) places the 7 days on `failed --> cooldown` while this diagram places it on `cooldown --> registered`. Reading `failed` as terminal per attempt, with the cooldown as a precondition of the next registration, would match SCI-32 and the generic row (owner decision, OPEN-45). The generic §10.9 Certification Attempt row lists passed, failed, expired; terminal sets differ between §10.9 index and diagram — see V61-11.

#### Interview Assessment (F-88)

```mermaid
stateDiagram-v2
    [*] --> scheduled
    scheduled --> in_progress
    in_progress --> completed
    in_progress --> cancelled
    in_progress --> no_show
    completed --> scored
    scored --> reviewed
    reviewed --> [*]
    cancelled --> [*]
    no_show --> [*]
```

The machine enters `in_progress` when the join window opens (F-88: T-15 min) and its only exit from `scheduled` is `in_progress`, so an interview cannot be cancelled or rescheduled before then (open).

#### Course Order

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> paid
    pending --> cancelled
    paid --> enrolled
    enrolled --> completed
    enrolled --> refund_requested
    refund_requested --> refund_approved
    refund_requested --> refund_denied
    refund_approved --> refunded
    refund_denied --> enrolled
    refunded --> [*]
    cancelled --> [*]
    completed --> [*]
```

Terminal sets differ between the §10.9 index (enrolled, cancelled, refunded) and this diagram (refunded, cancelled, completed; `enrolled` is not terminal) — see V61-11. WF-27 and BR-100 (30-day refund window) move an enrolled order to `refund_requested`, so under §10.11 `enrolled` cannot be terminal; changing the index row is an owner decision (OPEN-45).

#### Contest

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> scheduled
    scheduled --> registration_open
    registration_open --> active
    active --> ended
    ended --> results_published
    results_published --> archived
    archived --> [*]
```

Terminal sets differ between the §10.9 index (results_published, archived) and this diagram (archived only) — see V61-11. Under §10.11 `results_published` cannot be terminal while it leads to `archived`. The diagram has no cancellation path before `active` (open).

### 10.11 Invariants Across All State Machines

> [!IMPORTANT]
>
> - No state may be skipped
> - Every transition writes an audit record
> - Terminal states are irreversible without a new entity
> - Server is authoritative (client optimism is UI-only)
> - **INV-TERMINAL:** Every state machine has an acyclic path to an explicit terminal state

> v6.1 amendment: see Appendix E, item V61-18 (the target SM-APPLICATION t11 allows two named forward skips, Proposed, which differs from "No state may be skipped").

---

### 10.12 Canonical Business Rules (BR-01..BR-248 consolidated)

This heading groups §10.13 to §10.40 below.

### 10.13 Canonical Business Rule Identity

The canonical behavioral registry contains **BR-001 through BR-248** with no gaps in the numbered rule set. Measured: 248 distinct ids, each defined by exactly one row in §10.14–§10.40, plus MIG-01..MIG-08 in §10.26; this matches §24.8.1. Ids 1–35 are printed with two digits (BR-01 is BR-001). Any `BR-*` references outside that range in historical feature prose are treated as stale prose references and do not create new canonical rules. Four pairs state the same rule twice: BR-037/BR-061 (profile ≥70% gate), BR-25/BR-060 (XP idempotency key), BR-15/BR-039 (no duplicate active application) and BR-16/BR-038 (no application to a closed job); BR-17, BR-20 and BR-041 overlap (application lifecycle). Both ids of each pair stay, one test covers each pair, and the extra clause in the longer row (BR-25's daily cap, BR-15's cooldown) is part of the rule. Consolidating them is an owner decision (OPEN-LGA-02 in `docs/archive/target-blueprint/24_RISKS_AND_DECISIONS.md`).

### 10.14 Access Control Rules (BR-01..BR-09)

| ID    | Rule                                                                                                                                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-01 | Only `ROLE_RECRUITER`/`ROLE_ADMIN` may create/edit job postings                                                                                                                                                                                           |
| BR-02 | Only `ROLE_USER` may submit applications; recruiters may not apply                                                                                                                                                                                        |
| BR-03 | Candidates review own applications only; recruiters all for their companies                                                                                                                                                                               |
| BR-04 | Only recruiters/admins create scorecards and notes                                                                                                                                                                                                        |
| BR-05 | User edits own profile only; admin any                                                                                                                                                                                                                    |
| BR-06 | Flags, audit, settings, user mgmt, moderation are admin-only                                                                                                                                                                                              |
| BR-07 | Billing actions available to recruiters, not users/admins (conflicts with learner course purchase, SCI-26, BR-115 and the §10.10 Course Order machine, and with Platform Admin and Finance Admin refunds in §5.8; plan audience is open — owner decision) |
| BR-08 | Route-level RBAC matches shared route registry                                                                                                                                                                                                            |
| BR-09 | Domain-level authorization backs state-changing commands                                                                                                                                                                                                  |

### 10.15 Job Rules (BR-10..BR-14)

| ID    | Rule                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| BR-10 | Job publish-readiness rule server-validated                                                                                          |
| BR-11 | Job lifecycle: draft→pending_approval→approved→scheduled→published→paused→closed→archived (target renames are Proposed — see V61-18) |
| BR-12 | Recruiters update/publish/archive only own-company jobs                                                                              |
| BR-13 | Hidden jobs are client-preference; reversible                                                                                        |
| BR-14 | Saved-search digest runs as service-owned/audited scheduler                                                                          |

### 10.16 Application Rules (BR-15..BR-20)

> v6.1 amendment: see Appendix E, item V61-23 (BR-15 re-application cooldown: target proposes a different rule; the 90-day value stands until the product owner decides)

| ID    | Rule                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------- |
| BR-15 | No duplicate ACTIVE application per user per job (partial UNIQUE + 90-day cooldown post-terminal) |
| BR-16 | No applications to closed/unavailable jobs                                                        |
| BR-17 | Application lifecycle server-owned append-only                                                    |
| BR-18 | Application drafts autosave 30s; recoverable; versions retained                                   |
| BR-19 | Candidate notes/scorecards recruiter-scoped; never candidate-visible                              |
| BR-20 | Status-event history append-only                                                                  |

### 10.17 Learning & Challenge Rules (BR-21..BR-25)

| ID    | Rule                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------- |
| BR-21 | Lesson completion idempotent                                                                              |
| BR-22 | Lesson prerequisites gate progression                                                                     |
| BR-23 | Course completion → certificate + XP bonus                                                                |
| BR-24 | Challenge language allowlist; execution limits per TD-05 (decision text not in this file — treat as open) |
| BR-25 | XP idempotent UNIQUE(user_id, reference_type, reference_id); daily cap **200 XP/day**                     |

### 10.18 Data Governance Rules (BR-26..BR-35)

| ID    | Rule                                                                |
| ----- | ------------------------------------------------------------------- |
| BR-26 | Resume exports append-only; artifact soft-delete                    |
| BR-27 | Analytics metadata whitelist-only; no raw text/tokens/secrets       |
| BR-28 | Admin status distinguishes live/inferred/degraded/not-configured    |
| BR-29 | Admin actions: confirmation + audit + rollback                      |
| BR-30 | Extension data stays in chrome.storage.local; no sync/fetch/network |
| BR-31 | Schedulers dry-run default; idempotent delivery keys                |
| BR-32 | Subscription state webhook-owned                                    |
| BR-33 | AI drafts never auto-commit to records                              |
| BR-34 | T&S report lifecycle pending→under_review→resolved/dismissed        |
| BR-35 | SUPERSEDED — closures cited in §10.19                               |

### 10.19 Expanded Rules (BR-036..BR-071)

| ID     | Rule                                                                                                                               |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| BR-036 | Jobs require approved org + verified owner                                                                                         |
| BR-037 | Applications require ≥70% profile                                                                                                  |
| BR-038 | Candidates may apply only to open jobs                                                                                             |
| BR-039 | Duplicate applications prevented (DB + app)                                                                                        |
| BR-040 | Recruiters access only their org's applications                                                                                    |
| BR-041 | Strict application state machine                                                                                                   |
| BR-042 | Offers require completed HM-scoped scorecard review                                                                                |
| BR-043 | Resumes are scanned for viruses before text extraction                                                                             |
| BR-044 | Extracted resume text encrypted at rest                                                                                            |
| BR-045 | Rejection emails sent with configurable delay (default 24h)                                                                        |
| BR-046 | Course enrollments unique per (user, course) for active status                                                                     |
| BR-047 | Module progress strictly sequential                                                                                                |
| BR-048 | Course completion requires passing final assessment (≥70%)                                                                         |
| BR-049 | Challenge submissions run in isolated sandbox                                                                                      |
| BR-050 | Sandbox execution has hard resource limits (30s CPU, 512MB RAM, 1GB disk)                                                          |
| BR-051 | Challenge test cases split: public + hidden                                                                                        |
| BR-052 | Plagiarism detection runs asynchronously                                                                                           |
| BR-053 | Badges minted only upon verified milestone completion                                                                              |
| BR-054 | Referral rewards pay out after referred candidate's first verified hire                                                            |
| BR-055 | Subscription changes apply at period boundary (or prorated)                                                                        |
| BR-056 | Entitlements derive from active subscription only                                                                                  |
| BR-057 | Jobs auto-close after expiry (configurable, default 60 days)                                                                       |
| BR-058 | Applications auto-archive after 90 days in submitted                                                                               |
| BR-059 | Moderation flags expire after 7 days if not actioned                                                                               |
| BR-060 | XP transactions unique per (user, reference_type, reference_id)                                                                    |
| BR-061 | Profile completeness ≥70% gate for job applications                                                                                |
| BR-062 | Verified organizations receive accelerated job approval                                                                            |
| BR-063 | Candidates may request data export; delivered within 30 days                                                                       |
| BR-064 | Recruiters see verified signals on candidate profiles                                                                              |
| BR-065 | AI output presentation follows capability-specific evaluation and uncertainty policy; no universal confidence threshold is assumed |
| BR-066 | AI outputs that fail the capability-specific quality/evaluation gate are suppressed or routed to human/non-AI fallback             |
| BR-067 | All admin actions are audit-logged                                                                                                 |
| BR-068 | Account termination requires Platform Admin dual approval                                                                          |
| BR-069 | Interviewer inactivity auto-escalation: 7 business days → HM escalation; 14 days → auto-transition stale_withdrawn                 |
| BR-070 | Candidate non-response auto-release: 5 business days → reminders; 8 days → candidate_unresponsive                                  |
| BR-071 | Abandoned requisition protection: >21 calendar days → review; 30 days → auto-pause + billing credit                                |

### 10.20 Institutional Rules (BR-072..BR-082)

| ID     | Rule                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| BR-072 | Managed learners access course only while org holds unexpired assigned seat              |
| BR-073 | Seat revocation triggers 7-day grace; in-progress assessments never interrupted          |
| BR-074 | Seat consumption atomic; last-seat concurrency never oversells                           |
| BR-075 | Revoked seat returns to pool; learner progress and certificates retained                 |
| BR-076 | Graduation transition retains all verified signals and severs FERPA-restricted records   |
| BR-077 | Bulk imports require dry-run validation preview; no silent partial imports               |
| BR-078 | Faculty/Proctor hold no org-level billing, licensing, or user-management privileges      |
| BR-079 | Employer-facing student showcases require recorded, revocable consent                    |
| BR-080 | Every org-owned record scoped by `organization_id`; cross-tenant reads prohibited        |
| BR-081 | Institutional pricing tiers configurable per course/package; never hard-coded            |
| BR-082 | Course-access authorization server-side: org + learner + license + enrollment + validity |

### 10.21 Media Rules (BR-083..BR-090)

| ID     | Rule                                                                                  |
| ------ | ------------------------------------------------------------------------------------- |
| BR-083 | External media validated before publication; invalid/private/embed-blocked rejected   |
| BR-084 | Provider embedding restrictions never bypassed; protected content never downloaded    |
| BR-085 | Provider capabilities determine available playback/completion settings                |
| BR-086 | Broken external provider isolated to affected content item; course remains functional |
| BR-087 | Platform stores learner progress even for externally hosted playback where trackable  |
| BR-088 | Unsupported providers produce explicit errors, never silent broken embeds             |
| BR-089 | Authors attest right to use external content before publication                       |
| BR-090 | Org provider allowlists enforced server-side                                          |

### 10.22 Learning Marketplace Rules (BR-091..BR-115)

| ID     | Rule                                                                              |
| ------ | --------------------------------------------------------------------------------- |
| BR-091 | Course submission requires ≥5 lessons and ≥30 min total content                   |
| BR-092 | Course requires ≥1 video or text lesson (no quiz-only courses)                    |
| BR-093 | Structural edits to a published course require a new version                      |
| BR-094 | Free-preview lessons ≤20% of course content                                       |
| BR-095 | Rating requires ≥20% course progress and verified enrolment                       |
| BR-096 | Category assignment required before submission                                    |
| BR-097 | Instructor must have an approved profile before publishing                        |
| BR-098 | Course image ≥750×422, ≤4MB                                                       |
| BR-099 | Coupon cannot reduce price below platform minimum                                 |
| BR-100 | Refund window 30 days from purchase (configurable), pro-rated after               |
| BR-101 | Instructor earnings = 70% of net revenue after platform commission (configurable) |
| BR-102 | Course announcements limited to 1/day/course                                      |
| BR-103 | Peer review requires ≥2 completed reviews per submission                          |
| BR-104 | Instructor cannot review or rate own course                                       |
| BR-105 | Course version preserves existing student progress                                |
| BR-106 | Learning-path courses complete in declared order when sequenced                   |
| BR-107 | Quiz attempts bounded by configured max; practice quizzes unlimited               |
| BR-108 | Graded quiz contributes to course grade; passing score configurable               |
| BR-109 | Final exam cumulative; required for course completion when configured             |
| BR-110 | Program certificate issued only when all required path courses complete           |
| BR-111 | Assignment late submission flagged, graded per instructor policy                  |
| BR-112 | Auto-grading for code assignments reuses the challenge sandbox                    |
| BR-113 | Question-bank reuse preserves per-attempt snapshots (no retroactive edits)        |
| BR-114 | Course archive/unpublish preserves enrolled-student access per policy             |
| BR-115 | All course purchases are idempotent and webhook-owned                             |

### 10.23 Social/Content Rules (BR-116..BR-128)

| ID     | Rule                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| BR-116 | One reaction per user per target; changeable, never additive                     |
| BR-117 | One repost per user per post                                                     |
| BR-118 | Post edits retain an "edited" marker and version history                         |
| BR-119 | Comment authors and post authors may moderate; authors may disable comments      |
| BR-120 | Mentions notify only if the recipient allows mentions                            |
| BR-121 | Follows unique; blocked/muted targets cannot be followed                         |
| BR-122 | Post visibility enforced server-side (public/connections/org/private)            |
| BR-123 | Newsletter subscriptions opt-in only; one-click unsubscribe (RFC 8058)           |
| BR-124 | Feed must always offer a chronological view; ranking factors disclosed on demand |
| BR-125 | UGC passes pre-publish abuse scan; post rate limits per actor                    |
| BR-126 | Sponsored content labelled as sponsored; never undisclosed in organic ranking    |
| BR-127 | Mute hides content without unfollowing and without notifying the muted party     |
| BR-128 | Minors (16+) get private-by-default profiles and restricted outreach             |

### 10.24 Outreach, Recommendations, Privacy (BR-129..BR-134)

| ID     | Rule                                                                                                                                                                                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-129 | Outreach credit consumed on send to a non-connection; refunded on reply within 7 days                                                                                                        |
| BR-130 | Outreach weekly caps: 20 (Pro), 50 (Team), custom (Enterprise). These caps are stated by this file; no plan price, AI quota or other allowance is decided here — see Appendix E, item V61-09 |
| BR-131 | Endorsements require an existing connection                                                                                                                                                  |
| BR-132 | Written recommendations display only after recipient acceptance                                                                                                                              |
| BR-133 | Profile-view logging honours the viewer's privacy mode                                                                                                                                       |
| BR-134 | Identity-verification badges only via approved partners; failure never blocks core use                                                                                                       |

### 10.25 Employer Insights Rules (BR-135..BR-138)

| ID     | Rule                                                                                                                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BR-135 | Salary aggregates displayed only with ≥5 reports for a role/location cell. The ≥5 value is an override below the `min_cohort_k` default (k ≥ 10, BR-178) — needs owner and counsel decision; the default applies until then (V61-04) |
| BR-136 | Anonymous reviews hide identity from employer and public, never from Platform Admin/legal                                                                                                                                            |
| BR-137 | Company responses are appended, never edit the original review                                                                                                                                                                       |
| BR-138 | Interview questions require moderation before public display                                                                                                                                                                         |

### 10.26 Contests/Certification & Migration Rules (BR-139..BR-140 + MIG-01..08)

| ID     | Rule                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------ |
| BR-139 | Contest submissions locked at server-authoritative end time; clock skew never extends                  |
| BR-140 | Certification exam pass requires the configured score in a single attempt (retake policy configurable) |
| MIG-01 | Imported data becomes project-owned; user may edit/delete/replace/export                               |
| MIG-02 | Migration is one-way and user-initiated; no continuous sync by default                                 |
| MIG-03 | Migration never auto-publishes; imported posts land as drafts                                          |
| MIG-04 | Imported skills are self-reported until natively verified                                              |
| MIG-05 | Connection graphs are never imported; hashed-email mutual-consent discovery only, hashes TTL-bound     |
| MIG-06 | Provider tokens server-side, short-lived, revocable; disconnect purges tokens + raw archive            |
| MIG-07 | External provider IDs are never primary keys, auth claims, URLs, or analytics keys                     |
| MIG-08 | Every provider surface is feature-flagged and removable without core schema change                     |

### 10.27 Skills Graph Rules (BR-141..BR-148)

| ID     | Rule                                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| BR-141 | Skills taxonomy curated by Platform Admin; no user can create canonical skills         |
| BR-142 | Skill relationships are directional: `prerequisite_of`, `subskill_of`, `supersedes`    |
| BR-143 | Correlations (`correlates_with`) are bidirectional and computed statistically          |
| BR-144 | Every course, challenge, job, and candidate skill tag MUST reference a canonical skill |
| BR-145 | Skill market signals update daily from aggregated data                                 |
| BR-146 | Skill graph traversal depth bounded (max 5 hops)                                       |
| BR-147 | Skill relationships must be acyclic for `prerequisite_of` (validated at write time)    |
| BR-148 | Emerging skills require minimum 5 independent signals before taxonomy promotion        |

### 10.28 Verification Rules (BR-149..BR-156)

| ID     | Rule                                                                                    |
| ------ | --------------------------------------------------------------------------------------- |
| BR-149 | Credentials are append-only; revocation creates a new record with `revoked_at`          |
| BR-150 | Every credential has a public verification URL (no PII exposed)                         |
| BR-151 | Credential evidence links are immutable once issued                                     |
| BR-152 | Endorsement weights derive from endorser's verified reputation + relationship proximity |
| BR-153 | Anonymous endorsements are not permitted (P-01)                                         |
| BR-154 | Appeal path exists for disputed credentials; SLA ≤7 days                                |
| BR-155 | Privacy-preserving proofs allow skill verification without revealing full profile       |
| BR-156 | Credential issue requires underlying achievement verified by platform activity          |

### 10.29 Career Graph Rules (BR-157..BR-163)

| ID     | Rule                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-157 | Career outcome tracking requires explicit user opt-in                                                                                         |
| BR-158 | Sensitive aggregate career analytics require policy-defined minimum cohort `min_cohort_k`; k ≥ 10 default for public/sensitive cells (V61-04) |
| BR-159 | Individual career transitions visible only to the user                                                                                        |
| BR-160 | Progression benchmarks by role require ≥20 data points to publish (feature override, stricter than the `min_cohort_k` default k ≥ 10; V61-04) |
| BR-161 | Salary progression tracked separately from base salary                                                                                        |
| BR-162 | Career graph updates do not retroactively alter historical benchmarks                                                                         |
| BR-163 | Career path recommendations must disclose data sources and confidence intervals                                                               |

### 10.30 Reputation Rules (BR-164..BR-168)

| ID     | Rule                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------- |
| BR-164 | Reputation score is derived, never manually set                                                         |
| BR-165 | Reputation is skill-specific                                                                            |
| BR-166 | Time-decay: signals older than 24 months count less                                                     |
| BR-167 | Reputation is private by default; recruiter visibility requires candidate consent or active application |
| BR-168 | Reputation signals are auditable                                                                        |

### 10.31 Interview Platform Rules (BR-169..BR-176)

| ID     | Rule                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| BR-169 | Interview recording requires dual consent                                           |
| BR-170 | Recordings encrypted at rest; retention ≤90 days unless extended                    |
| BR-171 | AI feedback is advisory; never a hiring decision input without human review         |
| BR-172 | AI analysis excludes protected attributes                                           |
| BR-173 | Interview questions are company-scoped; not visible to candidates before assessment |
| BR-174 | Assessment scores are append-only; changes are compensating entries                 |
| BR-175 | Live coding environment reuses the challenge sandbox                                |
| BR-176 | Comparison across candidates uses structured rubrics, never free-form scores        |

### 10.32 Salary Intelligence Rules (BR-177..BR-183)

| ID     | Rule                                                                                                                                                                                                                                                                                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-177 | Salary reports require verification: self-reported (0.5) or verified via employment (1.0)                                                                                                                                                                                                                                                                         |
| BR-178 | Aggregated salary data requires policy-defined minimum cohort: one policy parameter `min_cohort_k`, default k ≥ 10 for public and sensitive cells. Stricter feature values stay as feature overrides; lower values need an owner and counsel decision (V61-04)                                                                                                    |
| BR-179 | Salary data displayed in minor units + ISO-4217 currency                                                                                                                                                                                                                                                                                                          |
| BR-180 | Company-specific salary data shown only if company has ≥3 reports OR opted in. The ≥3 value is an override below the `min_cohort_k` default (k ≥ 10, BR-178) — needs owner and counsel decision; the default applies until then (V61-04). Whether an employer's opt-in can lower the minimum that protects the people who report is also open (owner and counsel) |
| BR-181 | Users may withdraw their salary submission at any time                                                                                                                                                                                                                                                                                                            |
| BR-182 | Salary intelligence updates quarterly; historical data versioned (F-86 step 2 and the §13.6 `salary.aggregate` job run nightly — cadence open)                                                                                                                                                                                                                    |
| BR-183 | Equity data (F-98) separately aggregated from salary                                                                                                                                                                                                                                                                                                              |

### 10.33 Recommendation Rules (BR-184..BR-188)

| ID     | Rule                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| BR-184 | Recommendation factors must be disclosed ("why am I seeing this?")                  |
| BR-185 | Recommendations never use protected attributes                                      |
| BR-186 | Users can dismiss recommendations; dismissals train the model                       |
| BR-187 | Recommendations may not include promoted content without explicit "sponsored" label |
| BR-188 | Recommendation engine must be replaceable without breaking downstream features      |

### 10.34 Learning Impact Rules (BR-189..BR-193)

| ID     | Rule                                                                                                                                                           |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-189 | Course outcome correlation requires ≥30 enrolled learners with measurable outcomes (feature override, stricter than the `min_cohort_k` default k ≥ 10; V61-04) |
| BR-190 | Individual learner outcomes are never exposed without consent                                                                                                  |
| BR-191 | Course quality scores derived from outcomes visible to instructors, not publicly ranked                                                                        |
| BR-192 | Learning impact analytics do not create incentives to lower standards                                                                                          |
| BR-193 | Correlation is not causation — all outcome claims labelled as correlational                                                                                    |

### 10.35 Feature-Specific Rules (BR-194..BR-208)

| ID     | Rule                                                                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-194 | Peer mentorship sessions have a 30-day inactivity auto-close                                                                                                                     |
| BR-195 | Expert network calls may be paid; platform takes a transparent fee                                                                                                               |
| BR-196 | Industry hubs must have ≥3 active contributors to display                                                                                                                        |
| BR-197 | Resume parsing never auto-applies changes without user review                                                                                                                    |
| BR-198 | Custom assessments must be approved by Platform Admin before deployment                                                                                                          |
| BR-199 | Candidate comparison requires verified profiles only                                                                                                                             |
| BR-200 | DE&I analytics use aggregated data only; individual demographic data never stored                                                                                                |
| BR-201 | Post-hire analytics require employer consent and are aggregate-only                                                                                                              |
| BR-202 | Badge marketplace prohibits paid badges; all badges earned                                                                                                                       |
| BR-203 | Mobile-first application must maintain feature parity with desktop                                                                                                               |
| BR-204 | Accessibility is a release gate; WCAG 2.2 AA mandatory                                                                                                                           |
| BR-205 | API access requires enterprise tier; rate-limited per CON-006                                                                                                                    |
| BR-206 | Emerging skills require platform-wide adoption before taxonomy promotion (no measurable test; BR-148 and F-84 step 6 state a measurable one; which governs is an owner decision) |
| BR-207 | Job market analytics require k ≥ 10 data points per geographic cell (`min_cohort_k` default, BR-178; V61-04)                                                                     |
| BR-208 | All new AI-powered features inherit AI safety rules §15.10 (AI Safety)                                                                                                           |

### 10.36 Warm Introduction Rules (BR-209..BR-216)

| ID     | Rule                                              |
| ------ | ------------------------------------------------- |
| BR-209 | Introducer consent required for each introduction |
| BR-210 | Max path depth = 4                                |
| BR-211 | Max 10 intro requests/week/user                   |
| BR-212 | Introducer can opt out of intro services          |
| BR-213 | Target can block all intro requests               |
| BR-214 | Introduction messages separate from cold outreach |
| BR-215 | Paths visible only to requester                   |
| BR-216 | No path suggestion for blocked users              |

### 10.37 Application Feedback Rules (BR-217..BR-224)

| ID     | Rule                                                                   |
| ------ | ---------------------------------------------------------------------- |
| BR-217 | Minimum reason category required on rejection                          |
| BR-218 | Feedback delivered within 7 days of decision                           |
| BR-219 | Feedback visible only to candidate                                     |
| BR-220 | Aggregate insights use k ≥ 10 (`min_cohort_k` default, BR-178; V61-04) |
| BR-221 | AI drafts require human review before sending                          |
| BR-222 | Candidate can request feedback if not provided (30-day window)         |
| BR-223 | Negative feedback must include actionable element                      |
| BR-224 | Feedback templates org-configurable                                    |

### 10.38 Skill Decay Rules (BR-225..BR-232)

| ID     | Rule                                                                       |
| ------ | -------------------------------------------------------------------------- |
| BR-225 | Freshness score computed nightly, immutable per day                        |
| BR-226 | Decay curves per skill category, admin-configurable                        |
| BR-227 | Freshness <20 demotes to self-reported                                     |
| BR-228 | Re-verification restores freshness to 100                                  |
| BR-229 | Self-attestation counts 0.5×                                               |
| BR-230 | Freshness visible to candidate always; recruiter-visible only with consent |
| BR-231 | Market drift alerts opt-in                                                 |
| BR-232 | Freshness stored historically (time-series)                                |

### 10.39 Referral Rules (BR-233..BR-240)

| ID     | Rule                                                |
| ------ | --------------------------------------------------- |
| BR-233 | Max 3 referral requests per 30 days per candidate   |
| BR-234 | Referrer consent required per request               |
| BR-235 | Referral tag visible to recruiter (priority signal) |
| BR-236 | Referral rewards follow org policy; XP default      |
| BR-237 | System verifies referrer's employment               |
| BR-238 | No referral request from blocked user               |
| BR-239 | Referrer max 20 referrals/quarter                   |
| BR-240 | Referral attribution tracked 12 months              |

### 10.40 Alumni Rules (BR-241..BR-248)

| ID     | Rule                                                      |
| ------ | --------------------------------------------------------- |
| BR-241 | Affiliation verified (email domain or institutional seat) |
| BR-242 | Alumni discovery respects privacy settings                |
| BR-243 | Alumni group default-join, opt-out allowed                |
| BR-244 | Alumni job postings must be from verified alumni          |
| BR-245 | Alumni mentorship opt-in                                  |
| BR-246 | No cross-institution data leakage                         |
| BR-247 | Graduated students retain alumni status                   |
| BR-248 | Alumni networks public or private (institution choice)    |

---

# PART V — TECHNICAL ARCHITECTURE

---

## 11. UX/UI, Design System & Micro-Interaction Architecture

### 11.1 UX principles

- Mobile-first, PWA-native composition; do not merely shrink a desktop UI.
- Progressive disclosure and consistent interaction patterns.
- Honest loading, guided empty states, actionable errors, and recoverable workflows.
- Trust through transparency: expose why something happened and what the user can do next.
- Keyboard-first support and accessible touch targets.
- Dark mode is first-class.
- Motion communicates state and respects `prefers-reduced-motion`.

### 11.2 Canonical UI states

```text
idle · hover · focus · pressed · loading · success · error · empty · disabled · validation · partial · offline · syncing · permission_denied · restricted
```

Domain lifecycle states include pending, processing, verified, rejected, expired, revoked, disputed, archived, and deleted/anonymized.

### 11.3 Interaction contract

```text
USER ACTION → SYSTEM STATE CHANGE → IMMEDIATE FEEDBACK → RESULT → NEXT BEST ACTION
```

Important actions such as saving, uploading, evidence submission, assessment autosave/submission, AI streaming, applications, matching explanations, messaging, notifications, offline sync, destructive actions, and errors must specify feedback, reversibility, and recovery.

### 11.4 Design system

The Aura/TalentSphere design system is the sole source for color, spacing, typography, elevation, radius, motion, focus, validation, and component states. Avoid raw visual values in feature code. Components expose accessible semantics and predictable state machines.

### 11.5 Component behavior

Buttons, inputs, forms, cards, data tables, dialogs, drawers, tabs, search, filters, pagination, tooltips, toasts, uploaders, editors, timers, progress indicators, and media controls must have explicit state and accessibility behavior. Critical information cannot be conveyed by color or animation alone.

---

## 12. Canonical Application Architecture

### 12.1 Initial architecture

Use a **modular monolith** with explicit domain boundaries and extraction points. Avoid premature microservices, Kubernetes, service meshes, or large event platforms until measured requirements justify them.

### 12.2 Canonical stack

> v6.1 amendment: see Appendix E, items V61-14 and V61-15

| Layer                  | Decision                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Frontend               | React + TypeScript + Vite PWA                                                           |
| Routing                | React Router                                                                            |
| Server state           | TanStack Query                                                                          |
| UI                     | Aura/TalentSphere design system                                                         |
| Backend                | Node.js + Fastify + TypeScript modular monolith                                         |
| Database               | PostgreSQL via Supabase                                                                 |
| Auth                   | Supabase Auth or replaceable equivalent                                                 |
| Storage                | Supabase Storage initially                                                              |
| Short-lived serverless | Supabase Edge Functions for webhooks, small HTTP functions and bounded AI orchestration |
| Heavy async            | Supabase Queues + dedicated workers                                                     |
| Search                 | PostgreSQL FTS/trigram initially                                                        |
| Realtime               | Selective, never correctness-critical                                                   |
| Hosting                | Managed infrastructure selected for cost/reliability/region                             |

Supabase rows state SSOT intent; the target reads Supabase as one candidate host behind plain PostgreSQL, an outbox and a fenced-lease worker (Proposed, V61-14). Module federation is not part of this stack; the target's bundled-modules baseline and conditional federation are Proposed (V61-15).

### 12.3 Logical architecture

```text
PWA UI
→ Feature/Application Layer
→ Domain Modules
→ Policy / Authorization / Privacy / AI Governance
→ Repositories / Transactions
→ PostgreSQL / Storage / Queues / Events
→ External Providers / AI Adapters
```

### 12.4 Domain boundaries

Identity & Access; Profiles; Skills & Ontology; Evidence & Verification; Learning; Assessments; Credentials; Jobs & Opportunities; Applications & Hiring; Interviews; Matching; Recommendations; Networking; Messaging; Organizations; Institutions; Reputation; Notifications; Billing & Entitlements; Analytics; Moderation/Trust & Safety; AI; Integrations; Administration; Audit.

### 12.5 Data and change ownership

Each domain owns its invariants and application contracts. Cross-domain behavior uses explicit APIs/events rather than direct table coupling. Database constraints remain authoritative for data integrity.

### 12.6 System Context — Updated

> v6.1 amendment: see Appendix E, items V61-08 and V61-14

Vendor names in the External group are examples. Transactional email sits behind a provider port (a Brevo default is Proposed, V61-08).

```mermaid
flowchart TB
    subgraph Users
        C[Candidates]
        R[Recruiters]
        I[Institution Admins]
        F[Faculty]
        A[Admins]
    end

    subgraph Frontend
        WEB[React/Vite PWA]
        EXT[Chrome Extension]
        PWA[PWA]
    end

    subgraph Edge
        MW[HTTP/API Boundary]
        SA[HTTP application APIs]
        EH[Webhook / Small Functions]
    end

    subgraph Core
        DOM[Domain Modules]
        CW[Career Workspace / OS layer]
        AI[AI Gateway / Orchestrator]
        Q[Queue]
    end

    subgraph Data
        AUTH[Supabase Auth]
        PG[(PostgreSQL)]
        RLS[RLS Policies]
        RT[Realtime]
        ST[Storage]
    end

    subgraph External
        STRIPE[Stripe]
        EMAIL[Transactional email provider port]
        LLM[Gemini/Claude]
        MEDIA[Mux/CF Stream]
        LI[LinkedIn optional]
    end

    C & R & I & F & A --> WEB
    C --> EXT
    C --> PWA
    WEB --> MW
    EXT --> MW
    MW --> SA
    MW --> EH
    SA --> DOM
    DOM --> CW
    DOM --> AI
    DOM --> Q
    DOM --> PG
    PG --- RLS
    MW --> AUTH
    DOM --> RT
    DOM --> ST
    EH --> STRIPE
    EH --> EMAIL
    AI --> LLM
    Q --> MEDIA
    DOM -.-> LI
```

### 12.7 Logical Architecture

> v6.1 amendment: see Appendix E, item V61-14

| Layer          | Contents                                                 | Technology                                                |
| -------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| Presentation   | Web app, extension, PWA, admin                           | React + TypeScript + Vite PWA, React 18+, Tailwind, Radix |
| Application    | HTTP application APIs, route handlers, use cases         | TypeScript strict                                         |
| Domain         | Aggregates, entities, VOs, domain events, business rules | Pure TS                                                   |
| Infrastructure | Repositories, adapters, integrations                     | Supabase, Stripe, providers                               |
| Data           | PostgreSQL with RLS, storage buckets, realtime channels  | Supabase                                                  |
| External       | AI providers, payment, media, email, IDV                 | Integration Layer                                         |

### 12.8 Authentication Flow

> v6.1 amendment: see Appendix E, items V61-13 and V61-14

This diagram is SSOT intent (SSOT ADR-001: Supabase Auth issues the JWT). The target's first-party cookie sessions through same-origin `/api/v1/auth/*` (ADR-T06) are Proposed and not ratified (V61-13). V61-13 also records that no browser-readable (`localStorage`) bearer token is permitted. The "Edge Middleware" participant is the HTTP/API boundary of §12.6 and §12.18.

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant S as Supabase Auth
    participant MW as Edge Middleware
    participant D as Database

    U->>W: Credentials / OAuth
    W->>S: Authenticate
    S-->>W: JWT + refresh token
    W->>MW: Request with JWT
    MW->>MW: Verify + normalize role claims
    MW->>D: Set local app.user_id
    D->>D: Apply RLS policies
    D-->>W: Authorized data
    W-->>U: Rendered page
```

### 12.9 AI Safety Flow

```mermaid
flowchart TD
    A[User Input] --> B[PII Detection]
    B --> C[Redaction]
    C --> D[Prompt Construction + canary + user_content fencing]
    D --> E[AI Provider]
    E --> F[Output Validation Zod]
    F --> G{Canary leaked?}
    G -->|Yes| H[Drop response + alert + flag account]
    G -->|No| I{Confidence}
    I --> J{Capability evaluation gate}
    J -->|Fail| K[Suppress / Fallback]
    J -->|Pass with limitations| L[Show with uncertainty]
    J -->|Pass with evidence| M[Show with supporting evidence]
    K --> HR{Human review required?}
    L --> HR
    M --> HR
    HR -->|Yes| N[Human Gate]
    HR -->|No| O[User sees draft]
    N --> O
```

---

### 12.10 Bounded Contexts — Refined

The high-level contexts remain, but the previous oversized shared kernel is reduced. Domain modules own their invariants; the shared layer contains only genuine cross-cutting primitives. Measured: §12.4 lists 25 domain boundaries; this table gives no context to Skills & Ontology, Matching, Recommendations, Reputation or AI, and splits Evidence & Verification and Credentials between `governance` and `learning`. Their owning context is open; Amendment A.7 bars AI and trust logic from becoming an indiscriminate shared kernel.

| Context           | Contents                                                                                                                                            | Aggregates                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `identity`        | Auth, profiles, orgs, tenancy, managed learners, instructor approval                                                                                | User, Profile, Organization, Membership          |
| `marketplace`     | Jobs, requisitions, applications, offers, interviews, employer insights                                                                             | Job, Application, Offer, CompanyReview           |
| `learning`        | Courses, lessons/content items, media, enrolments, progress, quizzes, assignments, paths, certificates, XP/gamification, contests, certifications   | Course, Enrolment, Assessment, XPLedger, Contest |
| `community`       | Connections, follows, posts/articles/newsletters, comments/reactions/reposts, groups, events, messaging, notifications                              | Thread, Post, Community                          |
| `billing`         | Subscriptions, entitlements, course commerce, coupons, orders, refunds, licence pools, procurement, payouts                                         | Subscription, Order, LicencePool, Payout         |
| `governance`      | Admin, moderation, trust, audit, flags, verification                                                                                                | Report, ModerationAction, FeatureFlag            |
| `analytics`       | Event tracking, KPIs, dashboards, experimentation                                                                                                   | AnalyticsEvent, KPISnapshot                      |
| **Shared kernel** | Core domain primitives, event envelope, authorization primitives, provider adapter interfaces, common types, UI primitives, observability contracts | DomainEvent, ProviderAdapter                     |

### 12.11 Domain Boundary Rules

- Domain layer pure TS (ARCH-013)
- Application layer orchestrates; HTTP application APIs are thin adapters (ARCH-014)
- Infrastructure implements domain ports (ARCH-015)
- Cross-feature imports via `index.ts` barrels only (ARCH-016)
- Atomic promotion rule (ARCH-017)
- Cross-context via events or application-service interfaces (ARCH-018)
- Zero circular dependencies (ARCH-019)
- Routes are thin composition (ARCH-020)

ARCH-001…ARCH-012 do not appear in this file, and ARCH is not a register in §24.8.1; ARCH-013…ARCH-020 are defined only by the lines above.

### 12.12 Architecture decisions — Refined

> v6.1 amendment: see Appendix E, items V61-13, V61-14, V61-15 and V61-30

These are the SSOT's own decisions, SSOT ADR-001..ADR-013. They are a different namespace from the target register's `ADR-T*` ids: cite "SSOT ADR-001" whenever an SSOT decision is contrasted with a target one (V61-30). Proposed target changes, none ratified: SSOT ADR-001 vs ADR-T06 (V61-13); SSOT ADR-001 and SSOT ADR-009 vs ADR-T04, ADR-T05 and ADR-T09 (V61-14); SSOT ADR-012 vs ADR-T03, ADR-T19 and ADR-T23 (V61-15).

| ID      | Decision                                                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ADR-001 | Supabase Auth is the initial identity/session authority behind an application-facing identity abstraction                          |
| ADR-002 | React/Vite PWA + Node.js/Fastify TypeScript modular monolith + PostgreSQL/Supabase + managed infrastructure                        |
| ADR-003 | Baseline relational tables + operational extensions, all protected by appropriate RLS/grants and tested deny-by-default boundaries |
| ADR-004 | Realtime is optional for live UX; database/application state remains authoritative                                                 |
| ADR-005 | Stripe webhook idempotency + demo stubs                                                                                            |
| ADR-006 | Chrome extension local-first                                                                                                       |
| ADR-007 | Provider-agnostic media                                                                                                            |
| ADR-008 | Institutional tenancy                                                                                                              |
| ADR-009 | Durable queue + dedicated worker for heavy jobs; Edge Functions for short-lived integration/webhook work                           |
| ADR-010 | RLS policy template generator                                                                                                      |
| ADR-011 | Media model is authority for lesson content                                                                                        |
| ADR-012 | DDD domain boundaries + feature-oriented frontend + reusable design-system primitives                                              |
| ADR-013 | Cross-domain via events or application-service interfaces only                                                                     |

---

### 12.13 Aura Design System

**Zero raw hex values.** Tokens exposed as CSS variables + TS constants from one generated source.

**Light theme:** `--aura-bg-base` #FFFFFF · `--aura-bg-raised` #F8FAFC · `--aura-bg-sunken` #F1F5F9 · `--aura-text-primary` #0F172A · `--aura-text-secondary` #475569 · `--aura-brand-600` #2563EB · `--aura-success-500` #16A34A · `--aura-warning-500` #F59E0B · `--aura-danger-500` #DC2626 · `--aura-border` #E2E8F0 · `--aura-border-focus` #2563EB.

**Dark theme:** `--aura-bg-base` #0F172A · `--aura-bg-raised` #1E293B · `--aura-bg-sunken` #334155 · `--aura-text-primary` #F8FAFC · `--aura-brand-600` #3B82F6 · `--aura-border` #334155.

**Spacing:** 4px base (0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192px).
**Radius:** 6/10/16/50%.
**Motion:** 120/200/320ms + reduced-motion. Appendix D M-19 (hover ≤80ms), M-73 (utility motion ≤150ms) and M-77 (step slide 80–120ms) use values that are not these tokens, although §11.4 makes the design system the sole motion source (open, owner decision; the target design system proposes 80/150/240/400ms, not ratified).
**Typography:** xs..4xl ramp.
**Z-index:** dropdown 30, modal 40, toast 50, palette 60.

### 12.14 Atomic Design Mapping

| Level               | Contents                                                                                                                                                                                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Atoms (14+)**     | Button, Input, Badge, Icon, Avatar, Skeleton, Spinner, Text, Divider, SourceStatusBadge, Checkbox, Radio, Toggle, Tag                                                                                                                                                                                                   |
| **Molecules (12+)** | SearchField, FormField, Pagination, Toast, Dropdown, Tabs, Modal, EmptyState, SelectField, FileInput, DateRangePicker, ConfirmationDialog                                                                                                                                                                               |
| **Organisms (20+)** | DataTable, NavigationSidebar, TopBar, CommandPalette, NotificationBell, FileUploader, CourseCard, JobCard, ProfileCard, QuizPanel, MediaSourceForm, LicenseUtilizationChart, SixStateRenderer, UnifiedPlayer, ObjectPreviewCard, PostComposer, PostCard, CommentThread, ReviewSummary, CurriculumTree, LeaderboardTable |
| **Templates (8)**   | DashboardLayout, AuthLayout, SettingsLayout, AdminLayout, InstitutionLayout, LearningLayout, CourseBuilderLayout, FeedLayout                                                                                                                                                                                            |
| **Pages**           | Live inside features (`domains/<ctx>/features/<f>/pages/`)                                                                                                                                                                                                                                                              |

**Promotion rule:** Components used by only one feature stay in that feature; promotion to `shared/ui/` happens on second use, never preemptively.

### 12.15 Route Registry

Route parameters use React Router `:param` syntax (§12.2). `/verify/:hash` appears under Core and Verification routes; it is one route.

**Core Routes:**

| Route                                                       | Access            | Page                    |
| ----------------------------------------------------------- | ----------------- | ----------------------- |
| `/`                                                         | Public            | Landing                 |
| `/login`, `/register`                                       | Public            | Auth                    |
| `/verify/:hash`                                             | Public            | Credential verification |
| `/dashboard`                                                | Auth              | Role-adaptive           |
| `/profile`, `/profile/:userId`                              | Auth (RLS)        | Profile                 |
| `/jobs`, `/jobs/:jobId`                                     | Auth              | Jobs                    |
| `/jobs/new`                                                 | Recruiter+        | Post job                |
| `/applications`, `/applications/:applicationId`             | Auth (RLS)        | Applications            |
| `/courses`, `/courses/:id`, `/courses/:id/learn`            | Auth              | Courses                 |
| `/challenges`, `/challenges/:id`, `/challenges/:id/attempt` | Auth              | Challenges              |
| `/messages`, `/notifications`, `/leaderboard`               | Auth              | Communication           |
| `/settings`, `/settings/billing`                            | Auth / Org Admin+ | Settings                |
| `/admin/*`                                                  | Platform Admin    | Admin                   |

Not in this registry although features or journeys need them (open): `/forgot-password`, `/reset-password` and `/verify-email` (F-01), the onboarding wizard (F-01 step 1, WF-12), `/jobs/saved` (F-04), privacy and account deletion (§15.9), and participant routes for J-08, J-10, J-17, J-21, J-23 and J-24. Access levels conflict (owner decision): `/jobs` is "Auth" here but F-04 grants public read of published jobs; `/profile/:userId` is "Auth (RLS)" here but F-12 grants public read of public-safe columns.

**Career Intelligence Routes:** `/career/readiness`, `/career/transition`, `/career/benchmarks`, `/salaries`, `/salaries/:role`, `/companies/:slug/salaries`

**Verification Routes:** `/verify/:hash`, `/credentials`, `/credentials/export`

**Interview Routes:** `/interviews/:id`, `/interviews/:id/results`, `/assessments/:id`

**Recruiter Routes:** `/recruiter/search`, `/recruiter/pools`, `/recruiter/analytics`, `/hm/dashboard`

**Learning Routes:** `/paths`, `/paths/:id`, `/teach/*`, `/cart`, `/checkout`, `/orders`

**Social Routes:** `/feed`, `/posts/:id`, `/articles/:id`, `/communities`, `/events`

**Institutional Routes:** `/institution/*` (13 paths)

**Admin Extension Routes:** `/admin/courses`, `/admin/instructors`, `/admin/reviews`, `/admin/orders`, `/admin/revenue`, `/admin/certificates`, `/admin/contests`

**OS Routes (Tier-gated):** `/workspace`, `/command`, `/automations`, `/agents`

**Intro/Referral Routes:** `/intro/request`, `/intro/inbox`, `/referrals`, `/referrals/request`

### 12.16 Repository Layout

> v6.1 amendment: see Appendix E, items V61-08, V61-14 and V61-15

```text
src/
├── app/                      # React/Vite router: thin shell only
│   └── (auth)/ (platform)/       # page groups only; /api/v1 and health are served by Fastify (§12.18)
├── domains/
│   └── identity/ marketplace/ learning/ community/ billing/ governance/ analytics/
│       ├── domain/{entities,value-objects,aggregates,events,rules,repositories}
│       ├── application/{use-cases,services}
│       ├── infrastructure/{repositories,adapters}
│       └── features/<feature>/{index.ts,pages,components,hooks,services,api,models,validators,tests}
├── shared/
│   ├── platform/{events,object-model,graph,automation,agents,healing,liquidity,data-quality,health}
│   ├── infrastructure/{supabase,media,integrations/{linkedin,stripe,resend,oauth,hris},ai,jobs,heavy-jobs,email}
│   ├── ui/{tokens,atoms,molecules,organisms,templates,patterns,index.ts}
│   └── types/  utilities/
└── config/{routes.ts,roles.ts,env.ts,feature-flags.ts}
```

The seven `domains/` folders are the bounded contexts of §12.10. Vendor-named folders (`supabase`, `stripe`, `resend`) hold example adapters behind ports (V61-08, V61-14). `/api/v1` and the health endpoint are served by the Fastify application layer (Amendment A.1–A.2, §12.2, §12.18, SSOT ADR-002), so they are not folders of the React/Vite shell. This layout does not show the Fastify server entry point or the dedicated worker process (§13.5), and does not say which folders may be bundled for the browser (open). Server-only folders (`domains/*/infrastructure`, `shared/infrastructure`) hold provider secrets and stay out of the browser bundle (§13.4 "Server-side only for secrets"; §15.4 "No secrets in bundle"). The layout assumes one bundled frontend; module federation is not part of the SSOT (V61-15). Amendment A.7 says AI, automation, media, analytics, trust and domain logic must not become an indiscriminate shared kernel, yet this layout places `shared/platform/{automation,agents,healing,liquidity,data-quality,…}` and `shared/infrastructure/{ai,media}` under `shared/`. Whether each folder is a deliberate shared primitive or belongs to an owning context is open.

### 12.17 UX State Matrix

**Six-State Standard:** Every data surface implements:

| State     | Requirement                                               |
| --------- | --------------------------------------------------------- |
| Idle      | Default pre-fetch state                                   |
| Loading   | Skeleton ≤400ms; `aria-busy="true"`                       |
| Populated | Data rendered                                             |
| Empty     | Actionable CTA; never blank                               |
| Error     | Friendly message + retry + correlation ID; `role="alert"` |
| Stale     | Cached banner + refresh option                            |

The six-state names (`populated`, `stale`) and the UXC state names below (`degraded`, `not_found`, `timeout` and others) are not in the §11.2 canonical UI state list, and the three vocabularies are not reconciled (open). "Skeleton ≤400ms" conflicts with Appendix D M-01 ("Skeleton appears <100ms") (open).

**Surface Matrix:**

| ID      | Surface                  | Required States                                                                         |
| ------- | ------------------------ | --------------------------------------------------------------------------------------- |
| UXC-001 | Public auth              | loading, error, validation, success, degraded                                           |
| UXC-002 | Dashboard                | loading, empty, error, partial, degraded                                                |
| UXC-003 | Profile                  | loading, empty, error, permission_denied, success                                       |
| UXC-004 | List/search              | loading, empty, error, partial, offline                                                 |
| UXC-005 | Detail                   | loading, not_found, error, permission_denied, deleted                                   |
| UXC-006 | Long-running             | loading, running, partial, timeout, error, success, cancelled                           |
| UXC-007 | Realtime                 | loading, empty, error, degraded, reconnecting, offline                                  |
| UXC-008 | Notifications            | loading, empty, error, unread, read, degraded                                           |
| UXC-009 | Settings/billing         | loading, error, saving, saved, payment_pending, degraded                                |
| UXC-010 | Admin                    | loading, empty, error, permission_denied, destructive_confirm, audit_success            |
| UXC-011 | OS routes                | loading, empty, error, degraded, permission_scoped, success                             |
| UXC-012 | Destructive actions      | confirm, in_progress, success, failure, undo                                            |
| UXC-013 | Bulk import              | upload, parsing, validating, preview, committing, partial, failed                       |
| UXC-014 | Course builder           | autosaving, saved, save_failed, empty, media_validating, media_invalid, publish_blocked |
| UXC-015 | License management       | loading, empty, assigned, low_availability, expiring_soon, expired, grace_period        |
| UXC-016 | Quiz attempt             | in_progress, time_warning, submitted, graded, timed_out                                 |
| UXC-017 | Checkout                 | cart, processing, paid, failed, refunded                                                |
| UXC-018 | Contest                  | pre_start, live, ended, results                                                         |
| UXC-019 | Migration wizard         | upload, parsing, preview, conflicts, committing, partial, failed                        |
| UXC-020 | Review composition       | draft, submitting, pending_moderation, published, removed                               |
| UXC-021 | Skills graph             | loading, empty, error, populated, stale                                                 |
| UXC-022 | Credential               | loading, empty, error, verified, revoked, expired                                       |
| UXC-023 | Career readiness         | loading, computing, ready, insufficient_data, error                                     |
| UXC-024 | Interview session        | scheduled, joining, in_progress, reconnecting, completed, cancelled, no_show            |
| UXC-025 | Salary insight           | loading, insufficient_data, populated, error                                            |
| UXC-026 | Certification attempt    | registered, in_progress, time_warning, submitted, passed, failed, expired               |
| UXC-027 | Recruiter search         | loading, empty, error, populated, rate_limited                                          |
| UXC-028 | Salary report submission | idle, validating, submitted, rejected, error                                            |

---

### 12.18 API Architecture

> v6.1 amendment: see Appendix E, items V61-14 and V61-25

**Canonical API boundary:**

| Channel                  | Pattern                        | Authority                 | Guardrails                                             |
| ------------------------ | ------------------------------ | ------------------------- | ------------------------------------------------------ |
| Browser/PWA              | `/api/v1/...` REST/JSON        | Fastify application layer | AuthZ, Zod validation, rate limits, idempotency, audit |
| Provider webhooks        | Edge Function/webhook adapter  | Integration boundary      | Signature verification, replay protection, idempotency |
| Internal worker commands | Application/service interfaces | Domain/application layer  | Auth context, policy, idempotency                      |

**Direct browser-to-table writes are prohibited for domain-critical mutations.** RLS remains a database boundary, not the business-logic API. Not yet specified (open): an endpoint contract for the health checks required by §20.2 (path, authentication, rate-limit exemption; semantics in §20.1), and an accepted-then-poll response for long-running requests such as imports, exports and judging (UXC-006; F-08 step 5 polls a status endpoint).

**Deprecation Policy:** ≥6-month lifecycle with Sunset + Deprecation headers. Additive changes within a major version require no bump. The target's minimum 90-day window is Proposed and open (V61-25).

### 12.19 Response Envelope

> v6.1 amendment: see Appendix E, item V61-25

SSOT intent: success envelope `{success, data, meta}` with cursor pagination (CON-003). The target's list shape `{items, page}` with default limit 25 is Proposed; neither is adopted until OPEN-46 closes (V61-25). Errors use RFC 9457 (CON-001) with either success shape.

```json
{
  "success": true,
  "data": {},
  "meta": { "cursor": "…", "has_more": true, "limit": 20 }
}
```

### 12.20 Interface Contracts (CON-001..CON-016)

| ID      | Contract                                                                                    |
| ------- | ------------------------------------------------------------------------------------------- |
| CON-001 | Error contract: RFC 9457                                                                    |
| CON-002 | API versioning: path-versioned; additive within major                                       |
| CON-003 | Pagination: cursor-based; limit default 20, max 100 (target default 25 is Proposed, V61-25) |
| CON-004 | Filtering & sorting: allow-listed; sort keys indexed                                        |
| CON-005 | Idempotency: `Idempotency-Key` on non-idempotent writes; 24h replay                         |
| CON-006 | Rate limiting: per-class budgets; 429 + Retry-After                                         |
| CON-007 | Webhooks: HMAC signed; timestamp + replay window                                            |
| CON-008 | Retry / timeout: 10s default (AI 30s); exponential backoff                                  |
| CON-009 | Time: UTC; ISO-8601 with offset                                                             |
| CON-010 | Money: integer minor units + ISO-4217                                                       |
| CON-011 | Files / uploads: allow-list + MIME sniff + size caps + AV                                   |
| CON-012 | Concurrency: optimistic locking; stale write → 409                                          |
| CON-013 | Migrations: forward-only in production                                                      |
| CON-014 | Caching: only derived reads; keys include tenant + actor                                    |
| CON-015 | Data lifecycle: retention windows; erasure propagates                                       |
| CON-016 | Logging / telemetry: structured JSON; redacted                                              |

CON-001, CON-003/CON-004, CON-005, CON-006, CON-009 and CON-012 state intent at headline level; their detailed contracts are the open pre-implementation blockers DOR-001, DOR-008, DOR-009, DOR-007, DOR-010 and DOR-018 (§24.7). Still unstated: how an `Idempotency-Key` is scoped (actor, route), what a reused key with a different body returns, what a request returns while the same key is in flight, and whether a failed (5xx) response is replayed for 24h (CON-005); the rate-limit classes and their numbers (CON-006); how a client sends the expected version for a stale-write check (CON-012).

### 12.21 Service Contracts (SCI-01..SCI-54)

_(See §13.1 for the complete service contract register.)_

---

## 13. API, Event, Integration, Queue, Realtime & Media Contracts

All external and cross-domain interfaces are contract-first. Public API behavior must not accidentally mirror internal tables. Every mutation specifies authorization, validation, idempotency, rate limits, errors, audit, and observability.

### 13.1 Complete Service Contract Register (SCI-01..SCI-54)

This register gives operation, actor and idempotency only. The authorization, validation, rate-limit, error, audit and observability fields that the §13 preamble requires for every mutation are not given per contract (open; DOR-001, DOR-007, DOR-009). Rows marked `—` include mutations (SCI-35 skill CRUD, SCI-36 opt-in, SCI-41 pool CRUD, SCI-44 exam CRUD, SCI-45, SCI-46), for which CON-005 requires an idempotency mechanism. SCI-01 and SCI-03 name body fields (`jobIdempotencyKey`, `clientMessageId`) where CON-005 names the `Idempotency-Key` header. SCI-42's `UNIQUE(enrollment)` fits only `course_completion` credentials; F-96 step 1 issues credentials from six other sources, and revocation and endorsement are not enrollment-keyed.

| ID     | Operation                                             | Actor                  | Idempotency                                |
| ------ | ----------------------------------------------------- | ---------------------- | ------------------------------------------ |
| SCI-01 | Create job                                            | Org recruiter          | Client `jobIdempotencyKey`                 |
| SCI-02 | Apply to job                                          | Candidate              | Natural (unique job+applicant)             |
| SCI-03 | Send message                                          | Participant            | `clientMessageId`                          |
| SCI-04 | Submit challenge                                      | Candidate              | Submission idempotency key                 |
| SCI-05 | AI suggest                                            | Authed user            | Deterministic heuristic                    |
| SCI-06 | Payment webhook                                       | Stripe                 | Stripe `event.id`                          |
| SCI-07 | Moderate content                                      | Moderator/Admin        | Action key                                 |
| SCI-08 | Enroll in course                                      | Learner                | Partial unique active                      |
| SCI-09 | Purchase license pool                                 | Institution Admin      | PO + Stripe event ID                       |
| SCI-10 | Bulk import students                                  | Institution Admin      | import_batch_id + row hash                 |
| SCI-11 | Batch course assignment                               | Institution Admin      | (pool_id, batch_id)                        |
| SCI-12 | Seat assign/revoke/reassign                           | Institution Admin      | (pool_id, learner_id)                      |
| SCI-13 | Add media source                                      | Course Author          | (content_item_id, provider, external_id)   |
| SCI-14 | Import playlist                                       | Course Author          | (playlist_source_id, import_run_id)        |
| SCI-15 | Reorder content                                       | Course Author          | Client operation ID                        |
| SCI-16 | Record playback progress                              | Learner                | (learner_id, content_item_id)              |
| SCI-17 | Certificate issue / verify                            | System / Public        | UNIQUE(enrollment_id)                      |
| SCI-18 | Graduate learner                                      | System / Learner       | (learner_id, transition_id)                |
| SCI-19 | Create course version                                 | Course Author          | Version key                                |
| SCI-20 | Submit course for review                              | Course Author          | Submission id                              |
| SCI-21 | Attempt quiz                                          | Learner                | (quiz, user, attempt_no)                   |
| SCI-22 | Submit assignment                                     | Learner                | (assignment, learner, attempt_no)          |
| SCI-23 | Assign peer review                                    | System                 | (submission, reviewer)                     |
| SCI-24 | Enrol in path                                         | Learner                | (path, user) active                        |
| SCI-25 | Abort / rollback migration                            | System / User          | (migration_id, stage)                      |
| SCI-26 | Purchase course                                       | Learner                | PaymentIntent id                           |
| SCI-27 | Submit payout settlement                              | System                 | (period, creator)                          |
| SCI-28 | Q&A post / accept answer                              | Learner / Instructor   | Client post id                             |
| SCI-29 | Create contest                                        | Instructor / Org       | Contest key                                |
| SCI-30 | Register for contest                                  | Learner                | (contest, user)                            |
| SCI-31 | Submit contest entry                                  | Learner                | (contest, challenge, user, submission_key) |
| SCI-32 | Attempt certification                                 | Learner                | (certification, user, attempt_no)          |
| SCI-33 | Publish post                                          | Author                 | Client post id                             |
| SCI-34 | Send newsletter issue                                 | Author                 | Issue key                                  |
| SCI-35 | Skill CRUD / relationship / market signal / traversal | Admin / Public         | —                                          |
| SCI-36 | Career graph query / benchmark / opt-in               | Candidate              | —                                          |
| SCI-37 | Salary submission / aggregate / withdrawal            | Candidate              | Submission key                             |
| SCI-38 | Assessment lifecycle                                  | Recruiter/Interviewer  | Assessment id                              |
| SCI-39 | Recording lifecycle                                   | Recruiter/Interviewer  | Recording id                               |
| SCI-40 | Readiness computation / gap analysis                  | Candidate              | Recompute key                              |
| SCI-41 | Recruiter search / pool CRUD                          | Recruiter              | —                                          |
| SCI-42 | Credential issue / verify / revoke / endorse          | System / Public / Peer | UNIQUE(enrollment)                         |
| SCI-43 | Correlation query / instructor analytics              | Instructor / Admin     | —                                          |
| SCI-44 | Exam CRUD                                             | Admin                  | —                                          |
| SCI-45 | Emerging skill proposal                               | System                 | —                                          |
| SCI-46 | Relationship validation                               | System                 | —                                          |
| SCI-47 | Introduction path discovery                           | Candidate              | —                                          |
| SCI-48 | Introduction request lifecycle                        | Candidate              | (path_id, requester)                       |
| SCI-49 | Feedback CRUD                                         | Recruiter              | Feedback key                               |
| SCI-50 | Feedback request                                      | Candidate              | Request key                                |
| SCI-51 | Freshness query                                       | Candidate              | —                                          |
| SCI-52 | Re-verification                                       | Candidate              | Verification key                           |
| SCI-53 | Referral request lifecycle                            | Candidate              | (job_id, referrer_id)                      |
| SCI-54 | Alumni affiliation / group lifecycle                  | User                   | Affiliation key                            |

### 13.2 Error Taxonomy

| Error Class                | HTTP                 | Client-Visible Behavior                       |
| -------------------------- | -------------------- | --------------------------------------------- |
| Validation                 | 422                  | Field-level actionable messages               |
| Authentication             | 401                  | "Sign in to continue"                         |
| Authorization / RLS denial | 403 / 404-equivalent | Generic "not permitted"; no existence leakage |
| Not found                  | 404                  | RLS-masked                                    |
| Conflict                   | 409                  | "Changed since you loaded it — refresh"       |
| Rate limit                 | 429                  | Retry-After respected                         |
| Dependency failure         | 503 / degraded       | Never a false success                         |
| Timeout                    | 504                  | Idempotent resume                             |
| Realtime failure           | RPC error            | Resubscribe + reconcile/poll                  |
| AI failure                 | 503                  | Heuristic fallback + badge                    |
| Billing failure            | 503                  | Entitlements unchanged                        |
| Scheduler failure          | Retry / DLQ          | Skip reason surfaced                          |

Not covered by this table (open; DOR-001): whether a malformed or schema-invalid request and a domain-rule or illegal state transition share the 422 row; which status a payment or entitlement denial (§16.4, F-16), an oversized payload (CON-011) or an unexpected server error returns; F-04's 410 Gone for a closed job; when a denial is 403 and when it is 404; the machine-readable error codes (`error_code_catalog` is cited in Appendix D but not defined); and whether the RFC 9457 body carries the correlation ID that §20.3 sends as `x-request-id`.

---

### 13.3 Integration Register

> v6.1 amendment: see Appendix E, items V61-08 and V61-14

Vendor names are examples. Transactional email is a provider behind a provider port; the SSOT names several candidates (here, in §9 F-01 and in OD-10, §24.5) and decides none, and the target's Brevo default is Proposed (V61-08). Supabase rows state SSOT intent (V61-14).

| Integration                                                                      | Direction        | Purpose                                                                                                                 | Phase                  |
| -------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Supabase (Auth/DB/Storage/Realtime/Edge)                                         | Core             | Platform substrate                                                                                                      | MVP                    |
| Stripe                                                                           | Bidirectional    | Billing, webhooks, metering, invoicing                                                                                  | MVP (demo-guard)       |
| Google / GitHub OAuth                                                            | Inbound          | Social login                                                                                                            | MVP                    |
| Transactional email provider behind a provider port (examples: Resend, Postmark) | Outbound         | Transactional email                                                                                                     | MVP                    |
| Gemini / Claude                                                                  | Outbound         | AI via the AI gateway (`lib/ai/service.ts`; §12.16 places AI adapters under `shared/infrastructure/ai/`)                | MVP heuristic; LLM Ph4 |
| User-authorized AI provider                                                      | Outbound         | Provider-supported authorization/delegation where available; no assumption that consumer subscriptions grant API access | Foundation/AI          |
| Managed hosting provider                                                         | Deploy           | Hosting/edge                                                                                                            | MVP                    |
| Sentry / hosting-provider analytics / PostHog                                    | Outbound         | Observability                                                                                                           | MVP                    |
| HaveIBeenPwned                                                                   | Outbound         | Breached-password check                                                                                                 | MVP                    |
| Mux / Cloudflare Stream                                                          | Outbound         | Transcode + CDN                                                                                                         | Ph2 (OD-14)            |
| Kaltura / Panopto / MS Stream                                                    | Outbound         | Enterprise video gateways                                                                                               | Ph6                    |
| MS Entra / Google Workspace / Okta SSO                                           | Inbound          | Institutional SSO                                                                                                       | Ph6                    |
| Workday / SAP / BambooHR                                                         | Bidirectional    | HRIS sync                                                                                                               | Ph6                    |
| Moodle / Canvas / Blackboard / SIS                                               | Bidirectional    | LMS interop                                                                                                             | Ph6                    |
| LinkedIn                                                                         | Outbound/inbound | Job cross-post, extension scan, OIDC bootstrap, migration source                                                        | Post-MVP               |
| Slack / Cal.com                                                                  | Outbound         | Notifications/scheduling                                                                                                | Post-MVP               |
| IDV vendor                                                                       | Outbound         | Identity verification                                                                                                   | Ph9 (OD-27)            |
| Proctoring vendor                                                                | Outbound         | Exam proctoring                                                                                                         | Ph10 (OD-35)           |
| Zapier / Make                                                                    | Outbound         | Automation                                                                                                              | Future                 |

### 13.4 Integration Layer Doctrine (ADR-009)

> v6.1 amendment: see Appendix E, item V61-26

This heading cites SSOT ADR-009 for its second clause (Edge Functions for short-lived integration and webhook work, §12.12); §13.5 cites the same ADR for its queue clause. The adapter rules below rest on the shared-kernel `ProviderAdapter` interface (§12.10) and, for media providers, on SSOT ADR-007. The heading text is kept so that existing anchors resolve.

```text
Core Domain ← Integration Layer (ProviderAdapter + anti-corruption mappers) ← Provider Adapters
```

**Rules:**

- Server-side only for secrets
- Idempotency keys on webhook-triggered operations
- Circuit breakers with degraded modes
- Status visible in admin health
- Every dependency has an owner and documented degraded mode
- Removal drill (VER-021) gates every integration-touching release (SSOT value; V61-26 keeps the SSOT and target release and recovery targets side by side until measured)

---

### 13.5 Dual-Queue Boundary (ADR-009)

> v6.1 amendment: see Appendix E, item V61-14

SSOT intent (SSOT ADR-009). The target replaces Supabase Queues with a transactional outbox and a worker with fenced leases (ADR-T05, ADR-T09); Proposed (V61-14).

| Queue         | Infra                                         | Workloads                                                                             | SLA                                                 |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Transactional | Postgres `background_jobs` (SKIP LOCKED)      | XP settle, notifications, webhooks, digests, rollups, retention purge, search reindex | Enqueue <10ms; process <5s                          |
| Heavy async   | Supabase Queues + dedicated workers initially | Video transcode, AI enrichment, large imports/exports, embeddings                     | Durable queue; bounded retries; DLQ/repair workflow |

Measured against §13.6–§13.7: `media.healthcheck`, `feed.fanout`, `earnings.settle`, `coupon.expiry_scan` and `migration.purge-archive` are heavy kinds outside the heavy workload list; exports (including the DSR data export, BR-063) and embeddings have no kind; the §13.6 nightly or weekly compute kinds (`skill.market_signal_update`, `career.benchmark_compute`, `salary.aggregate`, `learning.outcome_correlation`, `emerging_skill.detect`) are not in the transactional workload list and are not shown to fit its <5s processing SLA. Jobs named elsewhere have no catalog row: `challenge.judge` (F-08 step 5), nightly reputation (F-144, F-148) and skill freshness (F-123, BR-225), the WF-22 expiry scan, and verification email for F-94. The rule that assigns a kind to a queue is not stated (open).

### 13.6 Transactional Job Catalog

| Kind                           | Cadence            | Retries |
| ------------------------------ | ------------------ | ------- |
| `notification.digest`          | Daily 07:30        | 5       |
| `notification.fanout`          | On event           | 5       |
| `xp.settle`                    | Event or hourly    | 3       |
| `streak.rollover`              | Daily 00:05        | 5       |
| `leaderboard.rebuild`          | Daily off-peak     | 3       |
| `metrics.rollup`               | Hourly/daily       | 5       |
| `retention.purge`              | Daily 02:00        | 5       |
| `stripe.sync`                  | On backlog         | 5       |
| `search.reindex`               | On write + nightly | 3       |
| `skill.market_signal_update`   | Daily              | 3       |
| `career.benchmark_compute`     | Nightly            | 3       |
| `salary.aggregate`             | Nightly            | 3       |
| `learning.outcome_correlation` | Nightly            | 3       |
| `emerging_skill.detect`        | Weekly             | 3       |

Cadence times (07:30, 00:05, 02:00) carry no time zone. CON-009 makes API time UTC, but whether `notification.digest` and `streak.rollover` follow UTC or the user's local day is not stated (open; DOR-010).

### 13.7 Heavy Job Catalog

| Kind                                             | Cadence               | Retries |
| ------------------------------------------------ | --------------------- | ------- |
| `media.transcode`                                | On upload             | 3 → DLQ |
| `media.enrich`                                   | On transcode complete | 3 → DLQ |
| `media.healthcheck`                              | Periodic              | 3       |
| `institutional.import`                           | On request            | 3       |
| `migration.parse` / `.commit` / `.purge-archive` | On request            | 3       |
| `feed.fanout`                                    | On post publish       | 3       |
| `earnings.settle`                                | Monthly               | 5       |
| `coupon.expiry_scan`                             | Daily                 | 3       |
| `interview.ai_analysis`                          | On session complete   | 3       |

### 13.8 Job Schema

```text
id UUID · kind · payload jsonb · status (queued/running/succeeded/failed/dead/cancelled)
attempts · run_after · lock_expires_at · last_error (≤4KB)
idempotency_key UNIQUE(kind, idempotency_key) · created_at · updated_at
```

The §10.9 Background Job row lists `succeeded` and `dead` as terminal; this list adds `failed` and `cancelled` and does not say whether `failed` is retry-pending or final, or whether `cancelled` is terminal (terminal sets differ — see V61-11). Also not specified (open, owner decision): a per-job maximum of attempts, a lease owner or fencing token, and the rule for a job whose lease expires after its last allowed attempt (`dead` has no entry rule; §13.6–§13.7 give retries per kind).

Also open: whether a job is enqueued in the same transaction as the state change that triggers it; lease renewal and stale-lease recovery for `lock_expires_at`; and what `payload` may hold (whether tokens, codes or addresses may be stored, when they are removed, and whether erasure covers payloads that name a person; §3.2, §15.9.1). The target proposes an outbox and a worker with fenced leases (V61-14, Proposed).

---

### 13.9 Realtime vs Polling Boundary

| Surface                  | Mechanism            |
| ------------------------ | -------------------- |
| Direct messaging         | Supabase Realtime    |
| Notification badges      | Supabase Realtime    |
| Presence (workspace)     | Supabase Realtime    |
| Feed                     | Cursor polling (30s) |
| Job listings             | Cursor polling       |
| Community posts          | Cursor polling       |
| Leaderboards             | Polling + optimistic |
| Contest live leaderboard | Realtime (bounded)   |

### 13.10 Channel Contract

- Payload ≤4KB `{type, entity, id, ts}` + monotonic cursor
- No raw rows; server RLS projection
- JWT-authenticated channels; RLS applied before event body (the target's cookie sessions, Proposed under V61-13, would change how channels authenticate)
- Channel registry `<channelType>:<boundedId>`

### 13.11 Resilience

- Reconnect backoff 1s → 8s
- More than 3 failures → polling path with cursor resync
- Server cap 50 events/s/channel
- Overflow → `refresh` signal
- Launch capacity target ≤2,500 concurrent / 40 topics

---

### 13.12 Unified Content Model

```text
Course → Section → ContentItem (VIDEO | PLAYLIST | ARTICLE | PDF | QUIZ | ASSIGNMENT | EXTERNAL_LINK)
                → MediaSource
                → ProviderAdapter
                → ProviderPlayer
```

### 13.13 Delivery Modes

| Mode                | Description                                         | Storage         | Playback          |
| ------------------- | --------------------------------------------------- | --------------- | ----------------- |
| A — Upload          | File uploaded, validated, transcoded, CDN-delivered | Platform        | Platform player   |
| B — External video  | URL normalized, validated, metadata fetched         | Provider-hosted | Provider embed    |
| C — Playlist embed  | External playlist embedded                          | Provider-hosted | Provider playlist |
| D — Playlist import | Items imported as individual content items          | Reference only  | Provider players  |
| E — External link   | Provider prohibits embedding                        | N/A             | External link     |

### 13.14 Provider Capability System

Each provider declares: `canEmbed`, `canPlayPlaylist`, `canTrackPlayback`, `canTrackProgress`, `supportsCaptions`, `supportsSubtitles`, `supportsTranscript`, `supportsPlaybackSpeed`, `supportsStartTime`, `supportsEndTime`, `supportsFullscreen`, `supportsPictureInPicture`, `supportsThumbnail`, `supportsMetadataLookup`, `supportsOAuth`.

### 13.15 Media Pipeline

```mermaid
flowchart LR
    U[Upload] --> V[Validation]
    V --> A[AV Scan]
    A --> T[Transcode]
    T --> H[HLS renditions]
    H --> TH[Thumbnail]
    TH --> C[Caption/transcript]
    C --> CDN[CDN publish]
    CDN --> R[ready]
    T -.->|failure| F[failed]
```

### 13.16 Media Security

> [!WARNING]
> No arbitrary HTML/JS from authors. Provider-specific renderers only. Domain allowlist in CSP `frame-src`. Reject `javascript:`, `data:`, unknown iframes. SSRF allow-list on server fetches. iframe sandboxing where compatible. Never download protected third-party content.

---

# PART VI — QUALITY & OPERATIONS

---

## 14. Data Architecture & Lifecycle

PostgreSQL is the system of record. The physical table count is not a product invariant; domain ownership, migrations, constraints, indexes, lifecycle rules, and RLS policies are.

### 14.1 Data integrity requirements

Use foreign keys, appropriate uniqueness, transactions, state constraints, timestamps, versioning, migration parity checks, idempotency records, audit history, and lifecycle states. Derived data must retain provenance and be rebuildable when practical. No personal-data inventory (per table: subject key, erasure disposition, export inclusion) drives erasure (§15.9.1), export and CON-015 (open; enhancement).

### 14.2 RLS and access

RLS is a database-level boundary for applicable tables. Policies are tested for allowed and denied paths. Application authorization remains required; RLS is not a license to expose arbitrary data endpoints.

### 14.3 Evidence and credential lifecycle

Evidence and credentials support issuance, active use, expiration, renewal, suspension, revocation, replacement, dispute, and archival semantics with downstream impact handling.

### 14.4 Canonical logical core schema + operational extensions — LOCKED

| #   | Table                       | Domain        |
| --- | --------------------------- | ------------- |
| 1   | `profiles`                  | Profile       |
| 2   | `profile_skills`            | Profile       |
| 2a  | `user_profiles`             | Profile (1:1) |
| 2b  | `user_settings`             | Profile (1:1) |
| 3   | `profile_experience`        | Profile       |
| 4   | `profile_education`         | Profile       |
| 5   | `profile_portfolios`        | Profile       |
| 6   | `resumes`                   | Profile       |
| 7   | `organizations`             | Organizations |
| 8   | `org_memberships`           | Organizations |
| 9   | `jobs`                      | Jobs          |
| 10  | `job_skills`                | Jobs          |
| 11  | `job_applications`          | Applications  |
| 12  | `application_status_events` | Applications  |
| 13  | `scorecards`                | Applications  |
| 14  | `offers`                    | Applications  |
| 15  | `requisitions`              | Jobs          |
| 16  | `courses`                   | Learning      |
| 17  | `course_modules`            | Learning      |
| 18  | `course_enrollments`        | Learning      |
| 19  | `module_progress`           | Learning      |
| 20  | `course_reviews`            | Learning      |
| 21  | `challenges`                | Assessment    |
| 22  | `challenge_submissions`     | Assessment    |
| 23  | `badges`                    | Gamification  |
| 24  | `user_badges`               | Gamification  |
| 25  | `xp_transactions`           | Gamification  |
| 26  | `leaderboards`              | Gamification  |
| 27  | `messages`                  | Messaging     |
| 28  | `message_threads`           | Messaging     |
| 29  | `thread_participants`       | Messaging     |
| 30  | `connections`               | Social        |
| 31  | `feed_activities`           | Social        |
| 32  | `notifications`             | Messaging     |
| 33  | `subscriptions`             | Billing       |
| 34  | `invoices`                  | Billing       |
| 35  | `entitlements`              | Billing       |
| 36  | `payment_methods`           | Billing       |
| 37  | `billing_events`            | Billing       |
| 38  | `reports`                   | Moderation    |
| 39  | `moderation_flags`          | Moderation    |
| 40  | `audit_logs`                | Admin         |
| 41  | `feature_flags`             | Admin         |
| 42  | `platform_config`           | Admin         |
| 43  | `ai_audit_log`              | Admin         |
| 44  | `saved_jobs`                | Marketplace   |
| 45  | `saved_searches`            | Marketplace   |
| 46  | `job_alerts`                | Marketplace   |
| 47  | `email_templates`           | Admin         |
| 48  | `system_announcements`      | Admin         |
| 49  | `mentorship_relationships`  | Social        |
| 50  | `course_cohorts`            | Learning      |

**Canonical invariants:** Every table has RLS enabled · UUID primary keys · `created_at`/`updated_at` audit columns · soft delete where applicable. Open: whether person-owned rows reference the account id or `profiles.id`, and how `profiles` and `user_profiles` (2a) divide profile data; the §14.6 patterns assume `user_id`. §14.2 says RLS applies to "applicable tables", while this line says every table.

### 14.5 Operational Clusters (Non-Canonical, ~185 tables)

> v6.1 amendment: see Appendix E, item V61-10. Counts disagree and are quoted here as measured, without changing the locked figure: the heading says ~185; the stated cluster counts below sum to 168 (measured); the OS layer row names 28 + 4 = 32 tables against its stated 27+4, so 169 names are listed; §24.8.1 locks Operational Tables at ~220. Check a count before copying it into a plan or test.

| Cluster                        | Count | Examples                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Journey                        | 20    | connection_requests, skill_endorsements, job_referrals, career_roadmaps, cohorts, cohort_members, cohort_curriculum, payout_profiles, creator_payouts, mentor_profiles, mentorship_sessions, mentorship_notes, mentor_reviews, institutional_showcases, agency_client_contracts, agency_placements, agency_invoices, job_trackers, course_challenges, talent_pool (read as `talent_pools`, listed under Recommendations/outreach/pools; the legacy schema reference has `talent_pools` and `talent_pool_members`; read this way, the cluster counts include the table twice) |
| OS layer                       | 27+4  | workspaces, saved_workspace_layouts, workspace_widgets, user_tasks, os_objects, os_object_links, os_tags, os_bookmarks, os_favorites, os_history, knowledge_graph_nodes, knowledge_graph_edges, domain_events, event_subscriptions, workbench_boards, automation_rules, automation_runs, journey_instances, interventions, liquidity_signals, data_quality_findings, agents, agent_runs, agent_memory, device_trust, session_risk_scores, fraud_cases, audit_findings + os_clipboard_items, os_undo_log, os_mentions, notification_center_events                             |
| Institutional                  | 12    | departments, batches, batch_memberships, license_pools, license_assignments, purchase_requests, procurement_orders, institutional_courses, certificates, organization_invitations, import_batches, student_consent_records                                                                                                                                                                                                                                                                                                                                                   |
| Media                          | 10    | content_items, media_sources, media_assets, media_versions, playlist_sources, playlist_items, media_progress, media_events, media_provider_configs, media_health_checks                                                                                                                                                                                                                                                                                                                                                                                                      |
| Migration/LinkedIn             | 5     | migration_jobs, migration_import_batches, imported_records, migration_consents, external_identity_references                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Learning marketplace           | 27    | course_categories, course_versions, lessons, lesson_resources, quizzes, quiz_questions, quiz_attempts, assignments, assignment_submissions, peer_reviews, course_qna, course_qna_replies, course_discussions, course_discussion_replies, lesson_notes, lesson_bookmarks, course_wishlist, course_announcements, learning_paths, learning_path_courses, learning_path_enrollments, path_progress, course_pricing, coupons, coupon_redemptions, course_orders, instructor_earnings                                                                                             |
| Social/content                 | 24    | follows, posts, post_media, comments, reactions, reposts, bookmarks, hashtags, post_hashtags, mentions, polls, poll_votes, articles, article_versions, newsletters, newsletter_issues, newsletter_subscriptions, post_analytics, feed_ranking_signals, muted_accounts, communities, community_memberships, community_moderation_log, profile_views                                                                                                                                                                                                                           |
| Profile expansion              | 11    | profile_media, career_signals, profile_certifications, profile_achievements, profile_publications, profile_test_scores, profile_volunteer, profile_languages, profile_interests, experience_media, identity_verifications                                                                                                                                                                                                                                                                                                                                                    |
| Recommendations/outreach/pools | 5     | written_recommendations, outreach_credits, outreach_messages, talent_pools, talent_pool_members                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Pages/events                   | 6     | organization_pages, showcase_pages, events, event_speakers, event_rsvps, event_updates                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Employer insights              | 6     | company_reviews, company_review_ratings, salary_reports, interview_experiences, interview_questions, company_responses                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Contests/certification         | 9     | coding_contests, contest_problems, contest_registrations, contest_submissions, contest_leaderboard, skill_certifications, certification_attempts, practice_problems, problem_discussions                                                                                                                                                                                                                                                                                                                                                                                     |
| Commerce ops                   | 2     | refunds, instructor_payouts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

**Effective schema ≈ 220 tables** (measured: 52 canonical rows in §14.4, counting 2a and 2b, plus 168 from the stated cluster counts = 220). The "50 canonical" lock refers only to the baseline cluster; count is fixed by migrations and verified by VER-002. Measured: 64 table names used in feature data dependencies appear in neither §14.4 nor §14.5, among them `skills` (referenced by `profile_skills` and `job_skills`), `verified_credentials`, `credential_evidence`, `endorsement_weights`, `interview_assessments`, `interview_recordings`, `interviews`, `salary_aggregates`, `reputation_scores`, `application_drafts`, `verified_work_history` and `references` (an SQL reserved word); `background_jobs` (§13.8) and the idempotency records of §14.1 are not listed either. Placing them is open (C3); the locked figures are unchanged.

### 14.6 RLS Policy Model (ADR-010)

**Policy Categories:**

| Category           | Pattern                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Own-row            | `auth.uid() = user_id`                                                                                                                                                         |
| Org-scoped         | Membership subquery on `org_memberships`                                                                                                                                       |
| Application-scoped | `auth.uid() = applicant_id OR recruiter_for_job(job_id)`                                                                                                                       |
| Public-read        | Always true for SELECT on published records; F-12 step 10 and the fuzz gate below limit this to public-safe views, not base tables with PII, private sections or stealth flags |
| Admin-all          | `auth_is_admin()`; Supabase binding `auth.jwt()->'app_metadata'->>'role' = 'ROLE_ADMIN'` (the claim F-01 step 4 reads; the top-level `role` claim is the database role)        |
| Deny-by-default    | No matching policy → access denied                                                                                                                                             |

The categories do not yet express institution and batch scope (§5.9, HDN-018), team scope (F-102), consent-gated disclosure (HDN-019, HDN-028) or double-blind peer review (§5.9, HDN-024); each needs a policy pattern before those features are built (open; V61-05, OPEN-44).

**Generator Model:**

```
generate_tenant_rls_policy(table, tenant_column, owner_column, is_public_read)
```

Creates admin-override, owner, org-member, and optional public-read policies. Helpers: `auth_is_admin()`, `auth_is_org_member(org)`, `auth_is_owner(user)`. Policies call these helpers; the `auth.uid()` and `auth.jwt()` patterns in the table above are their Supabase Auth binding (SSOT ADR-001: identity behind an application-facing abstraction). HDN-001 makes RLS the final boundary, which holds only if API requests made for a user run under a database role that RLS applies to, with the acting user bound; this file does not say how, and the binding for any other identity provider is open (V61-13, V61-14).

**RLS Fuzzing (CI Gate):** On every migration: create Tenant A/B users + orgs, seed rows, assert cross-tenant SELECT returns 0 rows, cross-tenant UPDATE/DELETE fails, owner-only tables deny non-owners, public-read tables expose no PII. Blocks merge on any failure.

---

---

## 15. Security, Privacy & Data Protection Architecture

Security is defense in depth: authentication, authorization, RLS, validation, secure transport, secrets management, rate limiting, audit, file controls, webhook verification, abuse detection, and operational response.

### 15.1 Sensitive file controls

Validate type and size; isolate storage; use policy-controlled access and signed URLs; scan where the threat model requires it; define retention and deletion; never expose raw object paths as an authorization mechanism.

### 15.2 Privacy by purpose

Data visibility is contextual: private, public profile, connections, recruiters, specific employer, institution, evaluator, AI, and admin/operations. Consent is versioned, timestamped, purpose-bound, auditable, and revocable where applicable.

> v6.1 amendment: see Appendix E, item V61-16 (proposed consent scope catalogue and ledger; not ratified).

### 15.3 Incident handling

Cross-tenant access, credential compromise, assessment leakage, and material integrity violations require containment, evidence preservation, credential rotation where relevant, notification according to applicable obligations, and post-incident review.

### 15.4 Defense in Depth (5 Layers)

```
LAYER 1 — CLIENT
  Input validation (Zod) · XSS prevention · CSRF tokens · No secrets in bundle

LAYER 2 — EDGE / MIDDLEWARE
  JWT verification · Rate limiting · Path guards · Request size limits · CORS

LAYER 3 — APPLICATION / API
  Server-side role resolution · Input sanitization · Business rule validation
  Output encoding · Audit logging

LAYER 4 — DATABASE (RLS — FINAL BOUNDARY)
  Generated policies · FK constraints · Check constraints · Unique constraints

LAYER 5 — INFRASTRUCTURE
  managed hosting provider DDoS/WAF/TLS · Supabase SSL · AES-256 at rest · Automated backups
```

### 15.5 Field-Level PII Encryption (AES-256-GCM)

| Column                     | Sensitivity          | Key         |
| -------------------------- | -------------------- | ----------- |
| `profiles.phone_number`    | Confidential PII     | KMS_PII_KEY |
| `profiles.tax_id` / SSN    | Restricted Financial | KMS_FIN_KEY |
| `resumes.raw_text_content` | Confidential         | KMS_PII_KEY |
| `billing_events.payload`   | PCI-adjacent         | KMS_FIN_KEY |
| `user_settings.byo_ai_key` | Restricted           | KMS_PII_KEY |

Open: the table omits salary reports (F-86), interview recordings (BR-170), identity verifications (§14.5), date of birth for the age gate (F-01) and the EEOC accommodation field (§15.9.2). `byo_ai_key` is a credential, not PII. `tax_id`/SSN sits on `profiles` although only payouts (HDN-023) need it.

### 15.6 Security Headers

| Header                       | Value                                                                                                                                                                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Strict-Transport-Security    | `max-age=63072000; includeSubDomains; preload`                                                                                                                                                                                                                                                                           |
| Content-Security-Policy      | `default-src 'self'; script-src 'self' 'wasm-unsafe-eval' [CDN]; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss://*.supabase.co; frame-src 'self' https://www.youtube.com https://player.vimeo.com [approved media]; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` |
| X-Content-Type-Options       | `nosniff`                                                                                                                                                                                                                                                                                                                |
| Referrer-Policy              | `strict-origin-when-cross-origin`                                                                                                                                                                                                                                                                                        |
| Permissions-Policy           | `camera=(), geolocation=(), microphone=(), payment=()`                                                                                                                                                                                                                                                                   |
| Cross-Origin-Opener-Policy   | `same-origin`                                                                                                                                                                                                                                                                                                            |
| Cross-Origin-Resource-Policy | `same-site`                                                                                                                                                                                                                                                                                                              |

`camera=()` and `microphone=()` also disable these for the app's own origin, which conflicts with features that need them (§19.1 capability detection; interview platform, §10.31, and HDN-027). Routes that use capture would need it enabled for `self` on those routes only; the exact policy is open (owner decision). Two constraints bound it. (1) In the Vite SPA (§12.2) a response header applies to the whole document and cannot differ by client-side route, so per-route enablement needs the interview room to load as its own document. (2) The F-88 meeting embed (step 3) also needs the provider's origin in `frame-src` and in the Permissions-Policy allowlist, with a matching iframe `allow` attribute; the CSP above lists neither. The target security design proposes deny-by-default with per-feature enablement and HSTS `preload` only after review ([`SECURITY_ARCHITECTURE.md`](docs/archive/target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md#security-architecture), Under Review).

### 15.7 Hardening Controls (HDN-001..HDN-032)

Measured: 28 rows are listed (HDN-001..HDN-028); HDN-029..HDN-032 are counted in §24.8.1 (locked at 32) but not defined in this file or in any reference document on this branch (searched 2026-11-22); their text needs the owner.

| ID      | Control                                                                                                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HDN-001 | DB-enforced authorization (RLS final)                                                                                                                                                                                                                                    |
| HDN-002 | Service-role confinement (server-only)                                                                                                                                                                                                                                   |
| HDN-003 | Object-level OS checks                                                                                                                                                                                                                                                   |
| HDN-004 | SSRF guard (allow-listed hosts/schemes)                                                                                                                                                                                                                                  |
| HDN-005 | Webhook hardening (signature + replay window + idempotency)                                                                                                                                                                                                              |
| HDN-006 | Upload safety (MIME sniff + AV + private buckets)                                                                                                                                                                                                                        |
| HDN-007 | Prompt-injection & PII-leak defense                                                                                                                                                                                                                                      |
| HDN-008 | Authentication hardening (rate limits, lockout, jti denylist)                                                                                                                                                                                                            |
| HDN-009 | Tamper-evident audit (append-only hash-chained)                                                                                                                                                                                                                          |
| HDN-010 | Non-leaky errors (generic + correlation id)                                                                                                                                                                                                                              |
| HDN-011 | Supply-chain hygiene (pinned deps, CVE scan, SBOM)                                                                                                                                                                                                                       |
| HDN-012 | Delegated-token care                                                                                                                                                                                                                                                     |
| HDN-013 | Insider-abuse detection                                                                                                                                                                                                                                                  |
| HDN-014 | Crypto & key management                                                                                                                                                                                                                                                  |
| HDN-015 | Least-privilege automation                                                                                                                                                                                                                                               |
| HDN-016 | Data-subject rights end-to-end                                                                                                                                                                                                                                           |
| HDN-017 | Media embed & SSRF guardrails                                                                                                                                                                                                                                            |
| HDN-018 | Institutional tenant boundary enforcement                                                                                                                                                                                                                                |
| HDN-019 | Consent-gated disclosure                                                                                                                                                                                                                                                 |
| HDN-020 | Quiz/answer confidentiality (keys encrypted)                                                                                                                                                                                                                             |
| HDN-021 | Contest integrity (server clock + sandbox + AST)                                                                                                                                                                                                                         |
| HDN-022 | Payment/commerce hardening (price re-validation + coupon atomicity + refund dual-control)                                                                                                                                                                                |
| HDN-023 | Instructor payout security (KYC + append-only + dual approval)                                                                                                                                                                                                           |
| HDN-024 | Peer-review fairness (double-blind + rubric-bound)                                                                                                                                                                                                                       |
| HDN-025 | Skills graph write protection (admin-only; audit-logged)                                                                                                                                                                                                                 |
| HDN-026 | Salary data anonymization and small-cell suppression enforced at query/policy layer; one policy parameter `min_cohort_k`, default k ≥ 10 for public and sensitive cells (stricter feature values may override; lower values need an owner and counsel decision — V61-04) |
| HDN-027 | Interview recording dual-consent (block if not recorded)                                                                                                                                                                                                                 |
| HDN-028 | Post-hire data consent (employer + candidate both opt-in)                                                                                                                                                                                                                |

### 15.8 Vulnerability SLAs

| Severity       | Response                              |
| -------------- | ------------------------------------- |
| SEV-1 Critical | <24h mitigation + 72h patch           |
| SEV-2 High     | <72h patch / 7d with blocking control |
| SEV-3 Medium   | <14d                                  |
| SEV-4 Low      | Next release                          |

SEV-1..SEV-4 grade vulnerabilities; operational alerts use P0–P3 (§20.5).

> v6.1 amendment: see Appendix E, item V61-26 (target remediation hypotheses differ; both sets are kept, neither is ratified).

---

### 15.9 Privacy & Compliance

#### 15.9.1 GDPR Matrix

> v6.1 amendment: see Appendix E, items V61-07 and V61-19

| Article | Requirement                        | Implementation                                                                                                                                                                                                                                                                                                |
| ------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5(1)(a) | Lawfulness, fairness, transparency | Privacy policy; explicit consent at sign-up                                                                                                                                                                                                                                                                   |
| 5(1)(b) | Purpose limitation                 | Data collected only for stated purposes                                                                                                                                                                                                                                                                       |
| 5(1)(c) | Data minimization                  | Only required fields collected                                                                                                                                                                                                                                                                                |
| 5(1)(d) | Accuracy                           | Users can edit data                                                                                                                                                                                                                                                                                           |
| 5(1)(e) | Storage limitation                 | Retention schedule; automated cleanup                                                                                                                                                                                                                                                                         |
| 5(1)(f) | Integrity and confidentiality      | RLS, encryption, access controls, audit                                                                                                                                                                                                                                                                       |
| 15      | Right of access                    | Settings export; admin-assisted full export                                                                                                                                                                                                                                                                   |
| 17      | Right to erasure                   | Account deletion with three separate clocks: **cancel window** (SSOT intent 30 days, unratified), **completion deadline** (30 days from request), **deactivation purge** (30 days). Data referenced by aggregates or legally retained is anonymized; everything else is deleted. See the note below the table |
| 20      | Data portability                   | JSON export                                                                                                                                                                                                                                                                                                   |
| 22      | Automated decision-making          | AI never makes consequential decisions                                                                                                                                                                                                                                                                        |
| 33      | Breach notification                | 72-hour notification                                                                                                                                                                                                                                                                                          |
| 35      | DPIA                               | Required before launch                                                                                                                                                                                                                                                                                        |

Erasure clocks: a 30-day cancel window and a 30-day completion deadline cannot both hold from the same start. This is an open owner decision (DOR-017, §24.7); the target proposes a 7-day cancellable cooling-off with completion within 30 days of the request (V61-07, not ratified). The target's opaque `subject_ref` erasure design (V61-19) is also Proposed. Until it is decided, erasure conflicts with HDN-009: audit rows that carry a person's id cannot be anonymized in place without breaking the hash chain. Backups and PITR (§22.4) also keep erased data; their retention, and re-applying completed erasures after a restore, are not specified (open, DOR-017).

#### 15.9.2 Other Frameworks

- **EEOC:** No discriminatory screening · accommodation field · quarterly adverse-impact monitoring · 2-year decision retention. Adverse-impact monitoring needs demographic data that no table, consent scope or access rule in this file holds; how it is collected, consented and kept apart from matching and AI (§15.10) is open (owner and counsel).
- **CCPA/CPRA:** Right to know, right to delete, no sale of personal data, non-discrimination
- **FERPA:** Protected educational records · explicit opt-in showcase consent · perpetual inspection + revocation right

#### 15.9.3 Data Residency

- Primary: US-East (Supabase + managed hosting provider)
- EU sovereign partition (SSOT Ph3 target): PII and resume embeddings tagged `data_residency_region='EU'`
- AI egress enforcement: EU tenancies route to EU LLM endpoints only; no EU endpoint → heuristic fallback
- Cross-border: EU-US DPF + SCCs

> v6.1 amendment: see Appendix E, items V61-27 (region, vendor and DR scope undecided in the target) and V61-14 (Supabase read as one candidate host).

#### 15.9.4 FERPA Severance Pattern (Logical Anonymization)

On graduation transition:

1. `student_consent_records` rows rewritten to anonymized form (hash student id, `status='severed'`)
2. Relational links retained so `xp_transactions`/`certificates` remain intact and verifiable
3. **Never hard-delete rows referenced by aggregates**
4. Preserves audit trail + verified signals while severing PII linkage

Graduation severance is a disposition distinct from account erasure (§15.9.1, three clocks). It anonymizes rather than deletes because the rows are referenced by aggregates and verified signals.

> v6.1 amendment: see Appendix E, items V61-07, V61-19 and V61-27 (the target replaces in-place anonymization with an opaque `subject_ref` for erasure and keeps graduation severance as a separate disposition; Proposed).

#### 15.9.5 DSR Queue (DSR-001..012)

Access and portability (30d) · erasure (completion deadline 30d from request; cancel window and deactivation purge are separate clocks, §15.9.1; open under DOR-017, V61-07) · rectification (30d) · restriction/objection (30d) · consent capture + versioning (immediate) · lawful-basis registry · data residency routing · sub-processor register · breach detection · privacy-by-design reviews · retention + secure disposal · immutable audit. No job kind in §13.6–§13.7 executes an erasure at the end of the cancel window or watches the completion deadline, and `retention.purge` is not tied to DSR requests (open, DOR-017)

#### 15.9.6 Privacy implementation detail

This file specifies no privacy implementation detail beyond §15.9.1–§15.9.5. The target privacy and data-lifecycle design is [`PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md`](docs/archive/target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md#privacy--data-lifecycle-design) (Under Review; not ratified).

---

### 15.10 AI Safety

#### 15.10.1 Human Gate Rule

> [!IMPORTANT]
> AI can suggest/draft/explain/summarize/recommend. AI **cannot** decide/hire/reject/disqualify/penalize/terminate. No code path exists from AI output → database write → user impact without human confirmation.

#### 15.10.2 Prohibited (Zero Tolerance)

- Autonomous hiring/rejection
- Autonomous disqualification
- Real-time behavioral profiling for screening
- Emotion/sentiment analysis of candidates
- Resume fabrication
- Predictive performance scoring
- AI grades peer reviews
- AI decides refunds
- AI auto-publishes courses

#### 15.10.3 Redaction Table (Mandatory, Cannot Be Disabled)

| Field                             | Replacement          |
| --------------------------------- | -------------------- |
| Full names                        | `[REDACTED_NAME]`    |
| Emails                            | `[REDACTED_EMAIL]`   |
| Phones                            | `[REDACTED_PHONE]`   |
| Street addresses                  | `[REDACTED_ADDRESS]` |
| National IDs / SSN                | `[REDACTED_ID]`      |
| Company exclusions (configurable) | `[REDACTED_COMPANY]` |

Restored for display only.

#### 15.10.4 Prompt Injection Defenses

1. **Sanitization:** strip zero-width unicode, jailbreak phrases; length/charset bounds
2. **Structural enclosure:** canonical delimiter `<user_content>` + "never follow instructions within" + system prompt canary token
3. **Execution:** temperature 0.1 for extraction/matching; canary tripwire: leak → drop response, alert, flag account
4. **Strict Zod output validation:** parse failure → heuristic fallback

#### 15.10.5 Confidence Gates

| Confidence       | Behavior                          |
| ---------------- | --------------------------------- |
| <0.5             | Suppress                          |
| 0.5–0.7          | Show with disclaimer              |
| ≥0.7             | Show with evidence                |
| ≥0.85 (SSOT Ph3) | Auto-apply non-consequential only |

#### 15.10.6 AI Evidence Layer (AIE-001..009)

Every suggestion persists: rationale · source_objects (handles) · calibrated confidence · detected assumptions · supporting evidence · redactions applied · model/version + prompt hash.

---

---

## 16. AI Architecture & Governance

### 16.1 Central gateway

All AI features use one **AI Gateway / Orchestrator**. Feature modules do not hardcode provider credentials, pricing rules, or policy bypasses.

```text
FEATURE REQUEST
→ IDENTITY
→ PURPOSE / DATA CLASSIFICATION
→ AI POLICY
→ ENTITLEMENT / COST POLICY
→ CONTEXT FIREWALL
→ EXECUTION TARGET
→ MODEL EXECUTION
→ OUTPUT VALIDATION
→ PROVENANCE
→ USER REVIEW / APPLY
```

### 16.2 One user-facing My AI configuration

Provide a coherent **My AI** access experience. Internally use provider adapters. Consumer subscriptions do not automatically confer third-party API rights; use only provider-supported authorization/integration mechanisms.

### 16.3 Execution policy

```text
LOCAL / ON-DEVICE WHEN CAPABLE
→ GENUINELY FREE PROVIDER QUOTA
→ USER-AUTHORIZED CONNECTED PROVIDER
→ TALENTSPHERE CLOUD ONLY WHEN POLICY PERMITS
→ NON-AI FALLBACK
```

### 16.4 Free-user cost invariant

TalentSphere must not incur paid third-party inference cost for a free user unless an explicit active cost policy permits it. No silent paid fallback.

No AI quota, allowance, price or cap is decided in this file; this invariant is the only binding AI-cost rule (V61-09).

### 16.5 AI data boundary

Classify input as PUBLIC, INTERNAL, PRIVATE, SENSITIVE, RESTRICTED, or NEVER-EXTERNAL. Minimize context and preserve provenance.

### 16.6 Memory separation

```text
AI CONVERSATION MEMORY ≠ USER PROFILE ≠ TALENT GRAPH ≠ VERIFIED EVIDENCE
```

AI suggestions cannot silently alter verified state. Consequential changes require explicit user/authorized workflow acceptance.

### 16.7 Output impact

INFORMATION, DRAFT, RECOMMENDATION, ANALYSIS, DECISION SUPPORT, and CONSEQUENTIAL DECISION are governed differently. Autonomous consequential decisions are prohibited.

### 16.8 Provenance and evaluation

AI outputs retain request ID, capability, provider/model, execution mode, timestamp, data classification, context references, policy decision, applicable sources, output, and user modifications. Evaluate correctness, groundedness, relevance, safety, privacy, consistency, latency, reliability, cost, and domain-specific quality.

---

## 17. Assessment & Exam Integrity

> v6.1 amendment: see Appendix E, item V61-22

### 17.1 AI modes

`AI_PROHIBITED`, `AI_RESTRICTED`, `AI_ALLOWED`, `POST_ASSESSMENT_ONLY`.

### 17.2 AI-prohibited contract

While an AI-prohibited assessment is active, TalentSphere must not provide answers, materially solving hints, generated code, debugging, screenshot-to-answer assistance, alternative solution paths, or indirect help through another TalentSphere feature/provider.

### 17.3 Enforcement

Assessment context is carried server-side into the AI policy layer. Hiding buttons is insufficient. Provider adapters cannot override assessment policy.

### 17.4 Integrity controls

Server-authoritative timer; attempt limits; session/device binding where justified; protected questions/answers; randomized questions/options; no answer-key exposure; autosave and submission idempotency; replay resistance; appropriate copy/paste/focus/device signals; suspicious-event logs; plagiarism/code similarity where relevant; human review and appeals.

Behavioral and AI-detection signals are indicators for review, not definitive proof of cheating.

---

## 18. Matching, Recommendations, Reputation & Career Intelligence

### 18.1 Matching pipeline

```text
HARD CONSTRAINTS
→ ELIGIBILITY
→ REQUIRED CAPABILITIES
→ EVIDENCE QUALITY
→ EXPERIENCE
→ RECENCY
→ TRANSFERABLE SKILLS
→ PREFERENCES
→ UNCERTAINTY
→ EXPLAINABLE RESULT
```

Do not present an opaque universal Talent Score. Any fit indicator must expose the meaningful dimensions and limitations.

### 18.2 Recommendations

Important recommendations preserve what, why, evidence/inputs, expected benefit, confidence/uncertainty, alternatives, freshness/expiry, and user feedback.

### 18.3 Reputation and trust

Reputation is contextual and multi-dimensional. Resist fake projects, credentials, endorsement rings, review manipulation, assessment farming, duplicate identities, suspicious evidence, and misleading AI-generated work. Anomaly is not guilt. Consequential restrictions require governed review and appeal.

### 18.4 Career intelligence

Provide decision support: goals, gaps, possible paths, trade-offs, actions, and evidence. Forecasts are conditional and time-bounded. Market data includes source, collection time, geography, population, coverage, methodology, freshness, and limitations.

---

## 19. PWA, Offline & Synchronization

TalentSphere is a real PWA with progressive enhancement across Android, iOS/iPadOS, and desktop browsers. Do not assume identical browser capabilities.

### 19.1 Capability abstraction

Detect installability, push/notifications, camera/microphone, sharing, filesystem, background behavior, secure authentication/WebAuthn, offline storage, and local AI capability.

### 19.2 Per-feature offline contract

```text
READ_OFFLINE?
WRITE_OFFLINE?
QUEUE?
SYNC_STRATEGY?
CONFLICT_STRATEGY?
SERVER_REQUIRED?
SENSITIVE_DATA?
```

The service worker/cache is never the business source of truth. Sensitive assessments, authoritative submissions, payments, and privileged actions use server authority. No feature in this file fills in the contract above, so which actions may be read, written or queued offline is undefined (open); Appendix D M-42 (queued posts, messages, form submissions and comments) and the local drafts of F-04 and M-24 are subject to this rule. Installability, service-worker updates, push permission and clearing local data on logout are not specified (open).

### 19.3 Sync

Use operation IDs, entity versions, device context, timestamps, mutation type, and bounded retries where needed. Conflicts follow entity-specific policy; material concurrent changes are not silently overwritten.

---

## 20. Performance, Reliability & Observability

Design for 10, 100, 1K, 10K, 100K, and 1M+ users by identifying the trigger for architecture evolution rather than overbuilding from day one.

### 20.1 Reliability

Every retry is bounded and idempotent. Integrations define timeouts, retry policy, circuit behavior, outage handling, and reconciliation. Major workflows degrade gracefully when a dependency fails.

Open (owner decision): this file does not define health-check semantics (liveness versus readiness, and which dependencies a readiness check must reach), graceful shutdown (stop accepting work, drain in-flight work, and a deadline set against the container grace period and the longest bounded dependency timeout, CON-008), process topology (one writer or several stateless instances), the connection-pooler mode that topology allows, or where rate-limit and lockout counters (HDN-008, DOR-007) are kept across restarts and instances. Target proposals: BE-01 §19, FM-12 and FM-25 (Proposed). See Part VIII, SSOT-AMD-09, AMD-13 and AMD-14.

### 20.2 Observability

```text
REQUEST → USER → TENANT / PURPOSE → FEATURE → API → DB / QUEUE → PROVIDER → RESULT
```

Provide structured logs, correlation IDs, metrics, traces, audit events, health checks, SLOs/SLIs, alerts, dashboards, runbooks, and incident recovery. Unknown telemetry is not silently treated as healthy.

### 20.3 Trace Propagation

```
Client → Edge middleware (inject/validate x-request-id UUIDv4)
      → Fastify API handler (structured log; §12.18)
      → PostgreSQL (SET LOCAL app.request_id; captured in audit_logs)
      → AI SDK (metadata: {request_id}; captured in ai_audit_log)
      → Stripe (client_reference_id)
      → Response header + Sentry context
```

### 20.4 Monitoring Triad

| Realm        | Tool                               | Alert On                                |
| ------------ | ---------------------------------- | --------------------------------------- |
| Errors       | Sentry                             | 5+ in 5 min                             |
| Web Vitals   | managed hosting provider Analytics | Budget regression                       |
| Database     | Supabase Dashboard                 | Query >1s; RLS spikes; connections >80% |
| Realtime     | Supabase Realtime metrics          | Latency >2s                             |
| AI           | `ai_audit_log`                     | Error >5%; acceptance <30%              |
| Stripe       | Stripe dashboard                   | Webhook error >2%                       |
| Business     | PostHog                            | Funnel regression >10% WoW              |
| Availability | Uptime monitor                     | 3 consecutive failures                  |

### 20.5 Alert Severity

| Severity    | Response       | Escalation            |
| ----------- | -------------- | --------------------- |
| P0 Critical | 10 min         | Phone + Slack + email |
| P1 High     | 30 min         | Slack + email         |
| P2 Medium   | 4h             | Ticket                |
| P3 Low      | 1 business day | Ticket                |

### 20.6 Dashboards

- **Platform Health** (availability, latency, error rates, queue depths, health score)
- **Business Health** (WAU, conversions, funnel, MRR)
- **AI Health** (requests, latencies, acceptance, cost)
- **Security Health** (auth events, RLS denials, threat detections)
- **Learning Ecosystem Health** (course enrollments, completions, revenue)
- **UGC Health** (posts, moderation queue, SLA)
- **Institutional Health** (tenant activity, seat utilization, renewal)

---

### 20.7 Performance detail

§20.8–§20.11 carry the performance detail.

> v6.1 amendment: see Appendix E, item V61-26 (target latency and bundle hypotheses differ; both sets are kept, neither is ratified).

### 20.8 Core Web Vitals

LCP <2.5s mobile / <2.0s desktop · INP <200ms · CLS <0.1 · TTFB <800ms · FCP <1.8s / <1.5s

The percentile and the measurement source (field data or a named lab profile) are not stated here or in §20.9, so these targets cannot be tested as written. The reference SLO document proposes field p75 and the lab profile RMP-1 (Proposed). Open (owner decision).

### 20.9 Per-Route Budgets

| Route Class             | LCP   | JS     | CLS   | INP    |
| ----------------------- | ----- | ------ | ----- | ------ |
| Marketing               | ≤1.8s | ≤120KB | ≤0.05 | ≤200ms |
| Search/marketplace      | ≤2.0s | ≤200KB | ≤0.1  | ≤200ms |
| Dashboard/ATS           | ≤2.5s | ≤250KB | ≤0.1  | ≤200ms |
| LMS player              | ≤3.0s | ≤300KB | ≤0.1  | ≤300ms |
| Challenge arena         | ≤3.0s | ≤400KB | ≤0.1  | ≤300ms |
| Messaging               | ≤2.0s | ≤220KB | ≤0.1  | ≤200ms |
| Admin/reporting         | ≤3.5s | ≤350KB | ≤0.1  | ≤300ms |
| Profile/portfolio       | ≤2.0s | ≤180KB | ≤0.1  | ≤200ms |
| Course builder          | ≤3.5s | ≤400KB | ≤0.1  | ≤300ms |
| Institutional analytics | ≤3.5s | ≤350KB | ≤0.1  | ≤300ms |
| Feed first page         | ≤2.5s | ≤220KB | ≤0.1  | ≤300ms |

Conflict to resolve (owner decision): several route budgets exceed the §20.8 targets (LCP up to 3.5s against <2.5s mobile; INP ≤300ms against <200ms), and JS budgets above 200KB conflict with the §20.10 anti-pattern "Route bundles >200KB gzipped". Until decided, neither value replaces the other. The JS column also does not say whether its sizes are compressed, or whether they cover the route chunk alone or the shell plus the route; §20.10 and M-100 say gzipped. The reference SLO document measures compressed critical-path bytes and leaves the budget open (SLO-19, OPEN-15; Proposed).

### 20.10 Forbidden Anti-Patterns

- Route bundles >200KB gzipped
- N+1 queries
- Client-side fetching for SSR pages (the Amendment A.1 stack is a client-rendered Vite PWA with no server-side rendering; prerendering public pages is the target proposal ADR-T24, Proposed)
- Unbounded client lists
- Synchronous heavy render operations
- Missing cache headers

### 20.11 Performance Hot-Paths (PERF-001..PERF-013)

List endpoints p95 <200ms · search p95 <300ms · detail LCP <2.5s · dashboard aggregates p95 <400ms · bounded Realtime subscriptions · zero N+1 · bundle budgets · long tasks never block request path · media lazy + transformed + sized · background jobs batched/idempotent · UnifiedPlayer lazy init, single active instance · institutional drill-down p95 <400ms via rollups · discovery surfaces p95 <300ms via rollups (ISR does not exist in the Amendment A.1 client-rendered Vite PWA; how public discovery pages are rendered is open)

Conflict (owner decision): some feature acceptance criteria set looser values for the same kind of path: F-92 search p95 <500ms against search p95 <300ms here; F-102 dashboard p95 <800ms against dashboard aggregates p95 <400ms; F-121 path, F-125 discovery and F-145 recommendation p95 <500ms against discovery surfaces p95 <300ms. This file states no precedence between §20.11 and a feature's own criteria; until decided, both values stand.

---

---

## 21. Testing, Accessibility & Quality Engineering

### 21.1 Test layers

```text
UNIT → COMPONENT → INTEGRATION → API/CONTRACT → E2E → SECURITY → ACCESSIBILITY → PERFORMANCE → DATA INTEGRITY → REGRESSION → FAILURE/RECOVERY
```

### 21.2 Completion evidence

A feature is complete only when behavior, permissions, data integrity, security/privacy, accessibility, observability, analytics, recovery, tests, and acceptance criteria all pass.

Measured: §9 specifies 46 of the 173 features; 26 of those give a one-line Acceptance list, and only 5 (F-01, F-04, F-12, F-84, F-96) give test requirements. Several criteria state no observable pass condition (for example F-84 "relevant results for common typos", F-145 "Diversity injection active", F-150 and F-159 "no gaming vectors", F-94 "zero resume fraud", F-13 "PDF renders correctly"). Until a criterion names an observable result and a threshold, it cannot serve as completion evidence. Open (owner decision).

### 21.3 Accessibility gate

WCAG 2.2 AA is a release requirement. Verify keyboard navigation, visible focus, semantic structure, labels/errors, contrast, touch targets, zoom/reflow, reduced motion, captions/transcripts, accessible charts/timers/editors/dialogs, and alternatives to gesture-only interactions.

### 21.4 WCAG 2.2 AA Conformance (Release Gate)

| Principle      | Requirements                                                                       |
| -------------- | ---------------------------------------------------------------------------------- |
| Perceivable    | Text alternatives; color never sole indicator; contrast ≥4.5:1 text, ≥3:1 large/UI |
| Operable       | Full keyboard; no traps; skip nav; visible focus                                   |
| Understandable | Language declared; consistent nav; input assistance; error identification          |
| Robust         | Valid HTML; name/role/value on custom components; status messages                  |

### 21.5 WCAG 2.2 Forward-Alignment Targets

- 2.4.11 Focus Not Obscured
- 2.4.13 Focus Appearance (≥2px, 3:1)
- 2.5.7 Dragging Movements (single-pointer alternative)
- 2.5.8 Target Size (24×24px min)
- 3.2.6 Consistent Help
- 3.3.7 Redundant Entry
- 3.3.8 Accessible Authentication (password-manager fill; pasteable TOTP)

Conflict (owner decision): under the WCAG 2.2 AA release gate (§21.4), 2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7 and 3.3.8 are Level A or AA criteria, so listing them as forward targets conflicts with the gate; only 2.4.13 Focus Appearance (Level AAA) is clearly a target. Until decided, the list above is unchanged. BR-204, §21.3 and Appendix A D-21 already make WCAG 2.2 AA mandatory at release, which would place the six Level A and AA criteria inside the gate and leave only 2.4.13 as a forward target; the owner has not confirmed this reading.

### 21.6 Accessibility Evidence (A11Y-001..010)

Per-route conformance matrix · CI axe 0 critical/serious · manual SR testing on critical journeys · keyboard-only operability · focus management evidence · contrast + target-size audit · accessible auth evidence · reduced-motion tests · DoD/regression inclusion · published statement/VPAT

### 21.7 Added Accessibility Requirements

- Quiz timers announce remaining time and support extended-time accommodations
- Contest leaderboards expose a data-table alternative
- Media player keyboard-operable with caption toggle
- Feed infinite scroll has a "load more" non-scroll alternative
- Drag-drop curriculum builder has a mandatory keyboard reorder path

---

---

## 22. Deployment, Disaster Recovery & Release Operations

The project begins with managed infrastructure and reproducible environments. No deployment artifact is considered production-ready until security, tests, migrations, observability, rollback, backup/restore, and operational ownership are proven.

### 22.1 Environments

| Env     | Purpose                         | Data                          | Secrets                              |
| ------- | ------------------------------- | ----------------------------- | ------------------------------------ |
| local   | Developer loop                  | Seeded synthetic              | `.env.local`; anon key only          |
| CI      | Automated gates V0–V4           | Ephemeral Postgres + fixtures | CI-scoped                            |
| staging | Pre-production verification/UAT | Anonymized/synthetic at scale | Vault staging                        |
| prod    | Live                            | Real                          | Vault production scope with rotation |

The CI gates V0–V4 named in the table above are not defined in this file.

### 22.2 CI/CD Pipeline

```
Code Push
  → Lint + Type Check
  → Unit Tests
  → Build
  → Preview Deploy (managed hosting provider PR)
  → E2E Tests (critical journeys)
  → Migration Round-Trip
  → RLS Fuzzing
  → QA Sign-Off (staging)
  → Production Deploy
```

Open (owner decision): the pipeline is strictly sequential, so a failure in its first step stops every later gate, and the lint scope (source only, or also documentation) is not stated. The supply-chain scan (HDN-011), the CI axe gate (A11Y-002) and the bundle budgets (§20.9–§20.10) are required elsewhere but have no stage here, and Migration Round-Trip runs after the preview deploy and E2E that need a migrated database. See Part VIII, A10-001.

### 22.3 Progressive Rollout

| Stage  | %    | Window | Validation                     |
| ------ | ---- | ------ | ------------------------------ |
| Canary | 5%   | 24h    | Error rate + CWV within budget |
| Beta   | 25%  | 72h    | Business metrics stable        |
| Wide   | 50%  | 72h    | All external SLAs met          |
| GA     | 100% | Locked | Flag remains as kill switch    |

**Automated rollback:** p95 degrades >20% or 5xx >0.1% → traffic to previous stable within 15s.

Open (owner decision): if the percentages split traffic between deployments rather than feature-flag cohorts (the GA row's kill switch suggests flags), a rollout with automated rollback needs at least two application versions serving the same database at once, which requires more than one instance and backward-compatible (expand/contract) migrations; neither is stated in this file (see §20.1).

> v6.1 amendment: see Appendix E, item V61-26 (target proposes a statistical canary; not ratified).

### 22.4 Backup & DR

| Data                                | Mechanism                  | Frequency          | RPO       | RTO  |
| ----------------------------------- | -------------------------- | ------------------ | --------- | ---- |
| PostgreSQL                          | Supabase automated + PITR  | Daily + 15-min WAL | ≤15m      | ≤2h  |
| Storage                             | Managed with retention     | Continuous         | Near-zero | ≤4h  |
| Auth                                | Included in DB backup      | Daily              | ≤24h      | ≤2h  |
| managed hosting provider deployment | Reproducible from git      | Per deploy         | n/a       | ≤15m |
| Env vars                            | `.env.example` + dashboard | As changed         | n/a       | ≤1h  |

Conflict (owner decision): the Auth row is "included in DB backup" yet states a daily frequency and RPO ≤24h, while the PostgreSQL row gives 15-minute WAL and RPO ≤15m; both cannot hold for data in the same database. The Env vars row recovers from `.env.example` and a dashboard, but `.env.example` holds no secret values and §22.1 keeps secrets in a vault; the recovery source for secrets is not stated. Until decided, the rows are unchanged.

> v6.1 amendment: see Appendix E, items V61-14 (Supabase read as one candidate host), V61-26 (target RPO/RTO hypotheses) and V61-27 (DR scope undecided). None is ratified.

### 22.5 Recovery Testing

- Quarterly DB restore to staging
- Quarterly PITR record recovery
- Quarterly rollback drill (<15m)
- Semi-annual secrets rotation drill
- Annual full DR simulation

Open (owner decision; enhancement): no drill or step reconciles external systems (payments, email, media providers) whose state is newer than a restored database.

### 22.6 Go-Live Gates (PROD-001..PROD-024)

Measured: VER-002, VER-006, VER-008, VER-010, VER-013, VER-017 and VER-023 are cited as evidence below, but no VER- row is defined in this file (§24.8.1 locks VER at 27; V61-06). Until their texts are recovered or written, PROD-003, PROD-008, PROD-009, PROD-011, PROD-013, PROD-019 and PROD-021 have no stated pass condition.

| ID       | Gate                              | Evidence                                                                                          |
| -------- | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| PROD-001 | Code freeze & change control      | Freeze record + manifest                                                                          |
| PROD-002 | CI fully green                    | CI run link                                                                                       |
| PROD-003 | Migrations applied & reversible   | VER-002                                                                                           |
| PROD-004 | Secrets provisioned & rotatable   | Secret manifest + rotation test                                                                   |
| PROD-005 | Observability live                | Dashboard + alert test                                                                            |
| PROD-006 | Runbooks & on-call                | Drill log                                                                                         |
| PROD-007 | Backup verified                   | Restore report                                                                                    |
| PROD-008 | DR targets proven                 | VER-010                                                                                           |
| PROD-009 | Load headroom                     | VER-006 at 2×                                                                                     |
| PROD-010 | Security sign-off                 | Pen-test letter                                                                                   |
| PROD-011 | Accessibility sign-off            | VER-008                                                                                           |
| PROD-012 | Privacy/compliance sign-off       | DPA + retention + erasure (three clocks, §15.9.1; open under DOR-017) + EEOC + FERPA legal review |
| PROD-013 | Billing verified                  | VER-013                                                                                           |
| PROD-014 | Flags default-safe                | Flag registry audit                                                                               |
| PROD-015 | Rollback/canary plan              | Rehearsed                                                                                         |
| PROD-016 | Incident response                 | IR plan + drill                                                                                   |
| PROD-017 | Cost guardrails                   | Budget alerts + kill switches                                                                     |
| PROD-018 | Post-launch verification          | Hypercare plan                                                                                    |
| PROD-019 | Institutional tenant isolation    | VER-017                                                                                           |
| PROD-020 | Media provider allowlist verified | CSP scan + config review                                                                          |
| PROD-021 | Course commerce production proof  | GAP-021 cutover + VER-023 + refund drill + coupon abuse suite                                     |
| PROD-022 | UGC moderation live               | SLA dashboard                                                                                     |
| PROD-023 | Contest infra load-proven         | Load test report                                                                                  |
| PROD-024 | Migration engine privacy-proven   | Privacy scan + TTL purge proof                                                                    |

---

# PART VII — EXECUTION

---

## 23. Implementation Roadmap & Dependency-Aware Build Order

> v6.1 amendment: see Appendix E, items V61-01 and V61-29

A partial implementation exists on `main`; its evidence is recorded as dated history in Part VIII (Multi-Agent Evaluation) and in `docs/reports/FEATURE_STATUS_2026-10-21.md`. Every capability in this roadmap that those records do not evidence is **Planned**.

**Phase scale.** Unless a sentence names another scale, "Ph0–Ph10" and "Phase n" in Part VII mean the **SSOT capability phases** of §23.1. They are not the IP founder execution phases 0–10 or the RDM delivery phases Ph0–Ph4 of the target roadmap; matching numbers across scales do not mean the same scope (V61-02; [`PHASE_GATE_GOVERNANCE_CROSSWALK.md`](docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#phase_gate_governance_crosswalkmd)).

The roadmap is capability-driven; phases can shift when dependencies or validated business priorities change, but no phase may bypass foundational security, authorization, data integrity, or testing controls.

### 23.1 Phases (0–10)

> v6.1 amendment: see Appendix E, items V61-02, V61-03, V61-14, V61-20 and V61-21

Scale: SSOT capability phases Ph0–Ph10. The canonical GA loop is Amendment B (Goal → Gap → Learn → Practice → Prove → Verify → Discover → Match → Apply → Interview → Outcome → New Evidence); the Ph1 exit loop below is a view of it, not a competing definition (V61-03). "Supabase setup" in Ph0 names one candidate host (V61-14). Where a scope cell below names a capability whose §7 `Phase` differs (for example messaging in Ph3, F-10 is Ph0; licence pools in Ph3, F-41 is Ph6; communities, pages and events in Ph3, F-55–F-57 are Ph8; F-111 in Ph5, §7 Ph8; proctoring in Ph6, F-45 is Ph10), the §7 phase governs (§7 authority note); reconciling the cells is open (OPEN-LGA-05).

| SSOT phase | Title                                                               | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Exit Criteria                                                                                                                          |
| ---------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Ph0**    | Foundation                                                          | Supabase setup, React/Vite skeleton (ADR-012 structure), Aura tokens, auth, RLS baseline, CI/CD, test harness                                                                                                                                                                                                                                                                                                                                                                                                                      | Registration + login working; RLS verified allow+deny; CI green                                                                        |
| **Ph1**    | Candidate Core + Skills Graph Foundation                            | Profile + resume + portfolio, courses, challenge arena, XP + levels, profile depth, **F-84 Skills Graph foundation**, Migration Center v1                                                                                                                                                                                                                                                                                                                                                                                          | Candidate completes Learn→Prove→Showcase loop (a view of the Amendment B loop); skills graph operational; migration import idempotent  |
| **Ph2**    | Marketplace + Media + Social v1 + Skill Evidence + Career Readiness | Job posting/search, application pipeline, media engine foundations, course builder, social graph + feed v1, extension, command search, **F-96 Skill Evidence**, **F-91 Career Readiness**                                                                                                                                                                                                                                                                                                                                          | Recruiter posts → candidate applies → recruiter processes; mixed-media course publishes; credentials issued; readiness scores computed |
| **Ph3**    | Recruiter Suite + Institutional + Career Intelligence               | Scorecards, interviews, messaging, offers, org admin, institutional tenancy/hierarchy, bulk import, license pools, batches, branded certificates, graduation flywheel, communities, pages, events, assignments, programs, instructor console, **F-85 Career Graph**, **F-86 Salary Intel**, **F-88 Interview Platform**, **F-92 Advanced Recruiter Search**, **F-94 Work History**, **F-102 HM Portal**, **F-103 Comparison**, **F-104 Custom Assessment**, **F-115 Exam Platform**, **F-122 App Feedback**, **F-123 Skill Decay** | Full 5-stage hiring pipeline; 5 institutional MVP exits; career intelligence operational                                               |
| **Ph4**    | AI Copilot + Media Expansion + Learning Impact + Career Transition  | LLM copilot, AI enrichment, playlists/Vimeo, feed ranking v2, articles, newsletters, recommendations, **F-87 Interview Repo**, **F-90 Mentorship**, **F-93 Video + AI Feedback**, **F-95 Career Transition**, **F-97 Job Market Analytics**, **F-99 AI Coach**, **F-105 Post-Hire Analytics**, **F-114 Learning Impact**, **F-121 Warm Intros**, **F-125 Alumni**, **F-128 Offer Comparison**, **F-142 Referrals**                                                                                                                 | AI live with confidence thresholds; learning outcomes correlated; career transition planning operational                               |
| **Ph5**    | Trust & Scale + Peer Learning                                       | Moderation at scale, admin dashboard, analytics, observability hardening, **F-100 Peer Projects**, **F-106 Prerequisites**, **F-107 Live Q&A**, **F-111 Industry Hubs**, **F-155 Adaptive Learning**, **F-156 PDP**                                                                                                                                                                                                                                                                                                                | Admin console live; 50k-user load verification; peer learning operational                                                              |
| **Ph6**    | Enterprise Expansion                                                | SSO/SAML, public API, webhooks, HRIS/SIS/LMS integrations, enterprise video, white-label, proctoring (F-45), **F-131 Apprenticeship**, **F-132 Scholarship**, **F-137 Spaced Repetition**, **F-138 Study Accountability**                                                                                                                                                                                                                                                                                                          | Enterprise contract fulfillment                                                                                                        |
| **Ph7**    | Learning Marketplace + Expert Network                               | Course Studio, categories/discovery, quizzes/exams, assignments/peer review, paths/programs, course community, reviews, course commerce, instructor platform, student analytics, **F-108 Expert Network**, **F-130 Freelance**, **F-133 Volunteer**, **F-139 Local**, **F-140 Affinity**                                                                                                                                                                                                                                           | Full learning marketplace operational                                                                                                  |
| **Ph8**    | Social Parity + Verification Depth                                  | Feed, publishing, articles, newsletters, groups, pages, events, recommendations, outreach, profile views, IDV, **F-89 Contribution Verification**, **F-101 Badge Marketplace**, **F-109 Negotiation**, **F-110 Verified Endorsements**, **F-112 Resume Parsing**, **F-113 Recruiter Analytics**, **F-116 Accessibility**, **F-117 Mobile-First**, **F-118 Emerging Skills**, **F-119 DE&I Analytics**                                                                                                                              | Feed + content + community stack operational; verification depth complete                                                              |
| **Ph9**    | Insights & Assessment                                               | Company reviews, salaries, interviews, benefits, contests, certifications, practice sets, admin expansion                                                                                                                                                                                                                                                                                                                                                                                                                          | Insights + assessment stack operational                                                                                                |
| **Ph10**   | Decision-Gated & Future                                             | Premium Candidate (OD-34), approved enterprise expansion, advanced automation/agents and optional integrations; sponsored content/BD graph remain excluded unless re-admitted                                                                                                                                                                                                                                                                                                                                                      | Founder-gated                                                                                                                          |

### 23.2 Dependency-Aware Build Order

Scale: the labels W0–W10 are read as SSOT capability phases Ph0–Ph10 of §23.1 (Wn = Phn); they are not a separate scale.

```mermaid
flowchart LR
    A[W0 Foundation<br/>Auth + RLS + Shell] --> B[W1 Candidate Core<br/>+ Skills Graph F-84]
    B --> C[W2 Skill Evidence F-96<br/>+ Career Readiness F-91]
    C --> D[W3 Career Graph F-85<br/>+ Salary F-86 + Interview F-88]
    D --> E[W3 Advanced Recruiter<br/>F-92 + F-102 + F-103]
    E --> F[W4 Learning Impact F-114<br/>+ AI Coach F-99]
    F --> G[W5 Community<br/>+ Peer Learning]
    G --> H[W6 Enterprise<br/>+ Integrations]
    H --> I[W7 Learning Marketplace]
    I --> J[W8 Social Parity<br/>+ Verification Depth]
    J --> K[W9 Insights + Assessment]
    K --> L[W10 Decision-Gated]
```

### 23.3 MVP Exit Criteria (7)

> v6.1 amendment: see Appendix E, items V61-03 and V61-20

Scale: the MVP exit sits on the SSOT capability phases of §23.1; it is not the target Ph1 pilot or GA gate (RDM delivery phases, V61-20). Criterion 1 is a view of the Amendment B GA loop (V61-03), not a separate loop definition.

1. Candidate full loop (a view of Amendment B): enroll → complete course → attempt challenge → earn XP → apply → track
2. Recruiter full loop: create org → verify → post job → review → shortlist → message → offer
3. RLS verification suite: 100% of policies tested with allow + deny assertions (application authorization, which §3.2 layers above RLS, has no equivalent route-coverage criterion; open, owner decision)
4. Accessibility: axe scan 0 critical on all MVP routes (A11Y-002 and F-116 require 0 critical/serious; which applies at MVP is an owner decision)
5. Performance: Core Web Vitals within budgets on mobile 4G (whether §20.8 or §20.9 applies, and at which percentile, is open; see §20.8 and §20.9)
6. Reliability: 5 consecutive green staging deploys
7. Security: external penetration test with 0 critical/high findings

### 23.4 Institutional MVP Exit Criteria (5)

Scale: SSOT capability phases; these are the "5 institutional MVP exits" of the Ph3 row in §23.1.

1. Tenant + departments + batches + ≥500-student bulk import with dry-run preview
2. License pool purchase + atomic batch assignment (seats never oversold; F-41 is Ph6 and F-16 is Ph5 in §7, so purchase at the Ph3 exit is open — owner decision)
3. Managed learner completes course + branded certificate with working public verification URL
4. Seat revoke + reassign exact (progress retained)
5. Cross-tenant isolation tests pass for all institutional tables

---

---

## 24. Gap Closure, Weak Decisions, Risks & Open Decisions

Every material problem follows: **identify → understand → validate → classify → root cause → options → selected solution → implementation → failure/recovery → tests → acceptance criteria**.

### 24.1 Resolved Gaps

> v6.1 amendment: see Appendix E, items V61-06, V61-08 and V61-09

The Class letters (A–R) in §24.1 and §24.2 have no legend in this file. FC, TD and MVD decision texts are not in this file (V61-06): a gap recorded as resolved or closed by one of those ids stays open until its decision text is recovered or re-decided. No price, AI quota, allowance or cap is decided by these rows (V61-09).

| ID      | Class | Gap                                   | Disposition                                                                                                                             |
| ------- | ----- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| GAP-001 | D, N  | Salary-range representation           | Recorded as resolved by FC-01, whose text is missing — open                                                                             |
| GAP-002 | O     | Currency display policy               | Recorded as resolved by FC-02, whose text is missing — open                                                                             |
| GAP-003 | Q     | Course-video hosting                  | Recorded as closed by TD-01, whose text is missing — open                                                                               |
| GAP-004 | Q     | Final LLM provider selection          | Recorded as resolved by MVD-01, whose text is missing — open                                                                            |
| GAP-005 | P     | Moderation automation level           | Recorded as resolved by FC-13, whose text is missing — open                                                                             |
| GAP-006 | N     | Leaderboard reset period              | Recorded as resolved by FC-10, whose text is missing — open                                                                             |
| GAP-007 | O, Q  | AI quota & provider paths             | Recorded as resolved by FC-03, whose text is missing — open; DOR-019 dual fallback                                                      |
| GAP-008 | R, N  | Job-alert retroactivity               | Recorded as resolved by FC-14, whose text is missing — open                                                                             |
| GAP-009 | Q, K  | Calendar/meeting scheduling           | DEFERRED · POST-MVP                                                                                                                     |
| GAP-010 | Q     | Transactional email provider          | Recorded as resolved by FC-11, whose text is missing — open; contract is a transactional email provider behind a provider port (V61-08) |
| GAP-011 | Q     | Product-analytics stack               | Recorded as resolved by FC-12, whose text is missing — open                                                                             |
| GAP-012 | D, F  | Storage bucket layout                 | Recorded as closed by TD-01, whose text is missing — open                                                                               |
| GAP-013 | L     | Backup cadence & PITR window          | Recorded as resolved by FC-15, whose text is missing — open                                                                             |
| GAP-014 | O     | Free-tier course limits               | Recorded as resolved by FC-04, whose text is missing — open                                                                             |
| GAP-015 | A     | AI scope at MVP                       | Recorded as resolved by FC-06, whose text is missing — open                                                                             |
| GAP-016 | B, N  | Candidate:employer ratio target       | Recorded as resolved by FC-07, whose text is missing — open                                                                             |
| GAP-017 | O     | Enterprise contract billing           | Recorded as resolved by FC-08, whose text is missing — open                                                                             |
| GAP-018 | J, R  | First additional languages            | Recorded as resolved by FC-09, whose text is missing — open                                                                             |
| GAP-019 | A     | Gamification intensity                | DEFERRED · POST-MVP                                                                                                                     |
| GAP-020 | H, C  | Sandbox execution limits              | Recorded as resolved by FC-16/TD-05, whose text is missing — open                                                                       |
| GAP-021 | K     | Production checkout                   | DEFERRED · POST-MVP (with cutover criteria)                                                                                             |
| GAP-022 | Q     | Provider abstraction runtime contract | UNVERIFIED (no live model integration)                                                                                                  |
| GAP-023 | D, Q  | Resume storage provider               | Recorded as closed by TD-01, whose text is missing — open                                                                               |
| GAP-024 | G     | File/avatar size & type limits        | Recorded as closed by TD-02, whose text is missing — open                                                                               |
| GAP-025 | I, L  | Retention periods                     | Recorded as resolved by FC-17/TD-03, whose text is missing — open                                                                       |
| GAP-026 | N     | Digest frequency/limits               | Recorded as closed by TD-04, whose text is missing — open                                                                               |
| GAP-027 | D, C  | Scorecard naming divergence           | RESOLVED — canonical `scorecards`                                                                                                       |
| GAP-028 | A, D  | Citus sharding proposal               | Recorded as closed by TD-06, whose text is missing — open                                                                               |
| GAP-029 | F, M  | RLS runtime enforcement unverified    | UNVERIFIED — SSOT Ph0 harness specified                                                                                                 |
| GAP-030 | J     | WCAG conformance untested             | UNVERIFIED — CI axe-core gate specified                                                                                                 |

### 24.2 Expansion Gaps (GAP-031..038)

| ID      | Class | Gap                                           | Disposition                                                                                                                                                                                                      |
| ------- | ----- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GAP-031 | B, Q  | Migration engine missing from baseline        | Specified Module 29 + SCI-19..25                                                                                                                                                                                 |
| GAP-032 | D     | Native social graph & content cluster missing | Specified Modules 25–26                                                                                                                                                                                          |
| GAP-033 | D, A  | Structured profile depth missing              | Specified PROFILE-011..021                                                                                                                                                                                       |
| GAP-034 | A     | Events/communities promotion                  | Promoted to Module 27                                                                                                                                                                                            |
| GAP-035 | Q     | LinkedIn job cross-post dependency            | RE-SCOPED — fallback chain (LIN-010)                                                                                                                                                                             |
| GAP-036 | A, Q  | Optional LinkedIn OIDC login                  | Specified AUTH-016                                                                                                                                                                                               |
| GAP-037 | K     | Feed fan-out strategy at scale                | Hybrid fan-out spec (FEED-003)                                                                                                                                                                                   |
| GAP-038 | I     | Connection-email handling legal basis         | Hash-match only (MIG-05, §10.26: hashed-email mutual-consent discovery only, hashes TTL-bound; the earlier citation BR-096 is a course-category rule and does not apply). The legal basis is not recorded (open) |

### 24.3 Schema Gaps (All Closed)

| Gap    | Table                               | Status                                                                                |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------------- |
| GAP-T1 | `organization_invitations`          | CLOSED — §14.4–§14.5                                                                  |
| GAP-T2 | `interviews`                        | Recorded CLOSED — §14.4–§14.5, but `interviews` is not listed there (measured) — open |
| GAP-T3 | `certificates`                      | CLOSED — §14.4–§14.5                                                                  |
| GAP-T4 | `api_keys`, `webhook_subscriptions` | Recorded CLOSED — §14.4–§14.5, but neither table is listed there (measured) — open    |
| GAP-T5 | Org domain events                   | CLOSED — EVT-076..078                                                                 |
| GAP-T6 | `requisitions` relationship         | CLOSED — §14.4–§14.5                                                                  |
| GAP-T7 | Various operational tables          | CLOSED — §14.4–§14.5                                                                  |
| GAP-T8 | `cohorts` vs `course_cohorts`       | RESOLVED — distinct entities                                                          |

---

### 24.4 Open decisions and blockers

This group comprises the OD register (§24.5), the structural decisions (§24.6) and the pre-implementation blockers (§24.7). Phase values in these tables use the SSOT capability phases of §23.1 (V61-02).

### 24.5 Complete OD Register (OD-01..OD-53)

> v6.1 amendment: see Appendix E, items V61-04, V61-06, V61-08, V61-09 and V61-10

Count: this table has 53 rows (measured: 53 rows, OD-01..OD-53); the locked inventory in §24.8.1 states 58 and is not edited here (V61-10). "Recommended" values are recommendations, not decisions; no price, AI quota, allowance or cap is decided beyond the figures this file states (V61-09).

| ID    | Decision                             | Recommended                                                                                                                       | Owner                 | Blocks (SSOT phase) |
| ----- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------- |
| OD-01 | Workspace primary metric             | Active learners                                                                                                                   | Founder               | Ph1                 |
| OD-02 | Curriculum structure depth           | Module → Lesson (2-level)                                                                                                         | Founder               | Ph1                 |
| OD-03 | Video hosting                        | Mux                                                                                                                               | Founder               | Ph2                 |
| OD-04 | AI primary engine                    | Hybrid (MVD-01; decision text not in this file — treat as open)                                                                   | Founder               | Ph4                 |
| OD-05 | Moderation automation                | AI-triage for spam; human for bans                                                                                                | Founder               | Ph5                 |
| OD-06 | Leaderboard reset                    | Weekly + all-time tabs                                                                                                            | Founder               | Ph2                 |
| OD-07 | AI quota & paths                     | Hybrid (FC-03; decision text not in this file — treat as open); no numeric quota decided (V61-09)                                 | Founder               | Ph4                 |
| OD-08 | Job alert retroactivity              | New-only                                                                                                                          | Founder               | Ph2                 |
| OD-09 | Interview scheduling                 | Manual at MVP; integration SSOT Ph6                                                                                               | Founder               | Ph3                 |
| OD-10 | Email provider                       | Transactional email provider behind a provider port; examples: Resend primary, SendGrid failover (Brevo default Proposed, V61-08) | Founder               | Ph1                 |
| OD-11 | Analytics stack                      | PostHog self-managed                                                                                                              | Founder               | Ph2                 |
| OD-12 | Storage buckets                      | Per-entity with RLS                                                                                                               | Founder               | Ph1                 |
| OD-13 | Backup cadence                       | Daily + 15-min PITR                                                                                                               | Founder               | Ph1                 |
| OD-14 | Video transcoding                    | Mux                                                                                                                               | Founder               | Ph2                 |
| OD-15 | Institutional pricing                | Volume-tier per-seat                                                                                                              | Founder               | Ph3                 |
| OD-16 | Institutional SSO timing             | SSOT Ph6                                                                                                                          | Founder               | Ph6                 |
| OD-17 | Provider allowlist defaults          | Upload+YouTube MVP; Vimeo SSOT Ph2; others SSOT Ph3+                                                                              | Founder               | Ph2                 |
| OD-18 | Certificate validity                 | Perpetual default; configurable                                                                                                   | Founder               | Ph3                 |
| OD-19 | Institutional data retention         | 7y default                                                                                                                        | Legal                 | Ph3                 |
| OD-20 | White-label scope                    | Co-branded first; full enterprise-only                                                                                            | Founder               | Ph10                |
| OD-21 | Import row limit                     | 5k per batch, chunked                                                                                                             | Eng                   | Ph3                 |
| OD-22 | Media analytics attribution          | Hybrid with labels                                                                                                                | Product               | Ph4                 |
| OD-23 | Faculty certificate issuance         | Configurable per faculty                                                                                                          | Product               | Ph3                 |
| OD-24 | Archive max size                     | 50MB                                                                                                                              | Eng                   | Ph1                 |
| OD-25 | Migration rollback window            | 30 days                                                                                                                           | Product               | Ph1                 |
| OD-26 | Contact-hash TTL                     | 30 days                                                                                                                           | Legal                 | Ph1                 |
| OD-27 | Instructor verification              | Optional badge at launch                                                                                                          | Product               | Ph7                 |
| OD-28 | Course revenue share                 | 70/30 default; tiered later                                                                                                       | Founder               | Ph7                 |
| OD-29 | Refund window/policy                 | 30 days; pro-rated after 20%                                                                                                      | Founder               | Ph7                 |
| OD-30 | Quiz attempt defaults                | 3 graded, unlimited practice                                                                                                      | Product               | Ph7                 |
| OD-31 | BD graph                             | Exclude (SCOPE-003; decision text not in this file — treat as open) unless ratified                                               | Founder               | Ph10                |
| OD-32 | Sponsored content                    | Excluded from core; requires separate trust/UX/monetization admission decision                                                    | Founder               | Ph10                |
| OD-33 | Live video                           | Defer; vendor evaluate                                                                                                            | Founder               | Ph10                |
| OD-34 | Premium Candidate tier               | Profile views + outreach + insights; price TBD                                                                                    | Founder               | Ph10                |
| OD-35 | Proctoring                           | Vendor at SSOT Ph10                                                                                                               | Founder               | Ph10                |
| OD-36 | Default profile-view privacy         | Semi-anonymous default                                                                                                            | Product               | Ph8                 |
| OD-37 | Peer-review minimum                  | 2                                                                                                                                 | Product               | Ph7                 |
| OD-38 | Salary aggregation minimum           | Configurable policy parameter `min_cohort_k`; default k ≥ 10 for sensitive demographic/salary cells (V61-04)                      | Legal                 | Ph9                 |
| OD-39 | Certification retake policy          | Cooldown 7d, configurable                                                                                                         | Product               | Ph9                 |
| OD-40 | Numeric targets for new metrics      | Set after 90 days of data                                                                                                         | Product               | Analytics           |
| OD-41 | `module_progress` retirement date    | After SSOT Ph7 verification                                                                                                       | Eng                   | Data cleanup        |
| OD-42 | Course publish review SLA            | 72 hours                                                                                                                          | Ops                   | Ph7                 |
| OD-43 | Coupon max discount bound            | 75%                                                                                                                               | Finance               | Ph7                 |
| OD-44 | Contest infrastructure               | Reuse sandbox with separate pool                                                                                                  | Eng                   | Ph9                 |
| OD-45 | Anonymous reviews allowed?           | Yes with credibility badge                                                                                                        | Legal                 | Ph9                 |
| OD-46 | Skills graph — build vs. license     | Build internally; external licensed market signals are adapters                                                                   | Founder               | Ph1                 |
| OD-47 | Salary data source                   | User submissions + licensed market data                                                                                           | Founder               | Ph3                 |
| OD-48 | Interview recording default          | Off by default (opt-in per interview)                                                                                             | Legal + Product       | Ph3                 |
| OD-49 | AI feedback scope in interviews      | Communication signals only                                                                                                        | Legal + AI governance | Ph4                 |
| OD-50 | Expert network — free vs. paid       | Hybrid (free tier + paid premium calls)                                                                                           | Founder               | Ph7                 |
| OD-51 | Learning impact — causal claim scope | Correlational unless causal methodology is separately validated                                                                   | Legal                 | Ph4                 |
| OD-52 | DE&I analytics — aggregate minimum   | `min_cohort_k` default k ≥ 10 with suppression/aggregation rules (V61-04)                                                         | Legal                 | Ph8                 |
| OD-53 | API pricing tier                     | Enterprise-only at launch                                                                                                         | Founder               | Ph10                |

### 24.6 Structural Decisions

| ID   | Decision                     | Recommended                                  | Owner   |
| ---- | ---------------------------- | -------------------------------------------- | ------- |
| D-01 | Bounded context count        | 7 consolidated                               | Founder |
| D-02 | Realtime vs polling boundary | Confirm §13.9 (Realtime vs Polling Boundary) | Founder |
| D-03 | Dual-queue implementation    | Postgres + dedicated worker (ADR-009)        | Founder |
| D-04 | Atomic Design adoption       | Full                                         | Founder |
| D-05 | FERPA severance mechanism    | Logical anonymization                        | Founder |

### 24.7 Pre-Implementation Blockers (DOR-001..DOR-026)

| ID      | Blocker                                                                                                                                                                                                                                                                                                                                                                                                                     | Gate                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| DOR-001 | API error contract                                                                                                                                                                                                                                                                                                                                                                                                          | Before MVP                         |
| DOR-002 | Versioning/deprecation policy                                                                                                                                                                                                                                                                                                                                                                                               | Before MVP                         |
| DOR-003 | Migration order/ownership                                                                                                                                                                                                                                                                                                                                                                                                   | Before MVP                         |
| DOR-004 | Seed/fixture strategy                                                                                                                                                                                                                                                                                                                                                                                                       | Before MVP                         |
| DOR-005 | Environment ladder                                                                                                                                                                                                                                                                                                                                                                                                          | Before MVP                         |
| DOR-006 | Secret provisioning                                                                                                                                                                                                                                                                                                                                                                                                         | Before MVP                         |
| DOR-007 | Rate-limit numbers                                                                                                                                                                                                                                                                                                                                                                                                          | Before MVP                         |
| DOR-008 | Pagination/filter/sort                                                                                                                                                                                                                                                                                                                                                                                                      | Before MVP                         |
| DOR-009 | Idempotency-key contract                                                                                                                                                                                                                                                                                                                                                                                                    | Before MVP                         |
| DOR-010 | Time/timezone                                                                                                                                                                                                                                                                                                                                                                                                               | Before MVP                         |
| DOR-011 | Money/currency                                                                                                                                                                                                                                                                                                                                                                                                              | Before MVP                         |
| DOR-012 | Upload limits                                                                                                                                                                                                                                                                                                                                                                                                               | Before MVP                         |
| DOR-013 | Feature-flag lifecycle                                                                                                                                                                                                                                                                                                                                                                                                      | Before MVP                         |
| DOR-014 | Migration rollback                                                                                                                                                                                                                                                                                                                                                                                                          | Before MVP                         |
| DOR-015 | Local onboarding                                                                                                                                                                                                                                                                                                                                                                                                            | Before MVP                         |
| DOR-016 | DoR/DoD gate                                                                                                                                                                                                                                                                                                                                                                                                                | Before build                       |
| DOR-017 | Retention/erasure SLAs — three clocks: cancel window (SSOT intent 30 days, unratified), completion deadline (30 days from request), deactivation purge (30 days). A 30-day cancel window and a 30-day completion deadline cannot both hold from the same start; open owner decision (target proposes a 7-day cooling-off, V61-07). Data referenced by aggregates or legally retained is anonymized, everything else deleted | Before prod                        |
| DOR-018 | Concurrency/conflict rule                                                                                                                                                                                                                                                                                                                                                                                                   | Before MVP                         |
| DOR-019 | Consumer OAuth delegated billing                                                                                                                                                                                                                                                                                                                                                                                            | Before MVP                         |
| DOR-020 | Institutional controller/processor split                                                                                                                                                                                                                                                                                                                                                                                    | Before institutional contract      |
| DOR-021 | Media provider ToS review                                                                                                                                                                                                                                                                                                                                                                                                   | Before SSOT Ph2 media              |
| DOR-022 | Transcode/CDN provider selection                                                                                                                                                                                                                                                                                                                                                                                            | Before SSOT Ph2 media              |
| DOR-023 | Institutional pricing validation                                                                                                                                                                                                                                                                                                                                                                                            | Before institutional GA            |
| DOR-024 | FERPA compliance review                                                                                                                                                                                                                                                                                                                                                                                                     | Before institutional launch        |
| DOR-025 | Skills graph build vs. license decision                                                                                                                                                                                                                                                                                                                                                                                     | Before SSOT Ph1 skills graph       |
| DOR-026 | Interview recording legal review (dual consent)                                                                                                                                                                                                                                                                                                                                                                             | Before SSOT Ph3 interview platform |

---

### 24.8 Registers

#### 24.8.1 Locked Register Inventory

> v6.1 amendment: see Appendix E, items V61-06 and V61-10

This inventory is locked (§24.8.3) and is not edited. Where a table elsewhere in this file has a different measured count, the measured count is quoted at that table (V61-10). Several families counted here (for example FC- and TD-) have no rows in this file; their decision texts are treated as open (V61-06).

| Register            | Prefix  | Count                       | Purpose                          |
| ------------------- | ------- | --------------------------- | -------------------------------- |
| Features            | F-*     | **173**                     | Feature register                 |
| Business Rules      | BR-*    | **248** + 8 MIG             | Canonical business-rule registry |
| Journeys            | J-*     | **28**                      | Canonical user-journey registry  |
| Workflows           | WF-*    | **66**                      | Workflows                        |
| State Machines      | —       | **53**                      | State machines                   |
| Product Principles  | P-*     | **11**                      | Immutable principles             |
| UX Principles       | U-*     | **12**                      | UX principles                    |
| Invariants          | INV-*   | **16**                      | Non-negotiable invariants        |
| Scope Guardrails    | SCOPE-* | **8**                       | Scope limits                     |
| Analytics Events    | EVT-*   | **72 locked + 20 proposed** | Event dictionary                 |
| Service Contracts   | SCI-*   | **54**                      | Service contracts                |
| Interface Contracts | CON-*   | **16**                      | Interface contracts              |
| ADRs                | ADR-*   | **13**                      | Architecture decisions           |
| Technical Defaults  | TD-*    | **26**                      | Technical defaults               |
| Founder Decisions   | FC-*    | **23**                      | Ratified decisions               |
| Open Decisions      | OD-*    | **58**                      | Open decisions                   |
| Blockers            | DOR-*   | **26**                      | Pre-implementation blockers      |
| Verification Gates  | VER-*   | **27**                      | Verification gates               |
| Production Gates    | PROD-*  | **24**                      | Go-live gates                    |
| Runbooks            | R-*     | **24**                      | Operational runbooks             |
| Hardening Controls  | HDN-*   | **32**                      | Security controls                |
| Failure/Edge Cases  | FEC-*   | **32**                      | Failure register                 |
| Edge Cases          | EC-*    | **48**                      | Edge-case matrix                 |
| UX States           | UXC-*   | **28**                      | UX completeness                  |
| NFRs                | NFR-*   | **21**                      | Non-functional requirements      |
| Modules             | —       | **52**                      | Functional modules               |
| Operational Tables  | —       | **~220**                    | Non-canonical tables             |

#### 24.8.2 Change Classes (C1–C7)

| Class            | Examples               | Approval                               |
| ---------------- | ---------------------- | -------------------------------------- |
| C1 Trivial       | Typo, copy             | Auto-merge on CI green                 |
| C2 Code change   | Feature PR, fix        | One approving review                   |
| C3 Schema/data   | Migration, RLS policy  | Two approvals; Founder for destructive |
| C4 Dependency    | New dep, major upgrade | Two approvals                          |
| C5 Config/secret | Env var, provider key  | Founder for secrets                    |
| C6 Architecture  | Stack, provider        | Founder sign-off (formal ADR)          |
| C7 Commercial    | Pricing, entitlement   | Founder sign-off only                  |

#### 24.8.3 Register-Integrity Invariant

> [!IMPORTANT]
> No register count may be modified, reordered, or deleted without a ratified C3 change. Additive families only. Any change to a locked register is a C3 change and must be recorded in the governance ledger.

---

---

## 25. Governance, Traceability & SSOT Maintenance

### 25.1 One canonical definition

Features, roles, journeys, business rules, APIs, entities, architectural decisions, metrics, and terminology each have one authoritative definition. Other sections reference it instead of re-defining it.

### 25.2 Traceability

```text
BUSINESS OUTCOME → USER NEED → JOURNEY → FEATURE → REQUIREMENT → DATA/API/EVENT → IMPLEMENTATION → TEST → RELEASE GATE
```

Cross-cutting traceability includes permission, privacy, security, observability, and analytics.

### 25.3 Change discipline

Material changes must update dependencies, tests, analytics, migrations, operational controls, and documentation. Deprecated decisions remain only as history/provenance, not active architecture.

**Section renumbering (2026-11-21).** On 2026-11-21 the owner decided to renumber this file's headings cleanly (v6.2) and to rewrite every internal cross-reference to the new numbers, with no legacy-number aliases. Section numbers therefore changed; register ids (F-, BR-, J-, WF-, OD-, DOR-, GAP-, D- and the others in §24.8.1) did not. Section numbers from v6.0 and v6.1 (for example `38.1`, `§42` or the tier tags `§13-T1`, `§14-T2`, `§15-T3`) are no longer valid for citation; cite the v6.2 number, with the heading text where it helps. This supersedes the v6.1 "no renumbering" reading of V61-12.

### 25.4 Completion gate

A feature may be labeled implemented only when current executable evidence supports it. Specification completeness is separate from implementation completion.

> v6.1 amendment: see Appendix E, item V61-31

Every `Proposed` item in Appendix E needs the approval of its change class (§24.8.2) before it alters v6.0 intent (V61-31).

---

## 26. Canonical Glossary

| Term                      | Definition                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **ATS**                   | Applicant Tracking System                                                                                  |
| **ADR**                   | Architecture Decision Record                                                                               |
| **B2B2C Flywheel**        | Institution → independent candidate pipeline                                                               |
| **BYO AI Key**            | User-supplied AI provider key                                                                              |
| **ContentItem**           | Polymorphic lesson container                                                                               |
| **Credential**            | Issued recognition/attestation with explicit lifecycle; portable verifiable-credential support is optional |
| **Domain Event**          | Immutable `<aggregate>.<past_tense>` outbox record                                                         |
| **Emerging Skill**        | New skill with growing market signals (F-118)                                                              |
| **Expert Network**        | Verified advisors for consultation (F-108)                                                                 |
| **FERPA**                 | US Family Educational Rights and Privacy Act                                                               |
| **Graduation Transition** | Managed learner → independent candidate                                                                    |
| **Human-in-the-Loop**     | AI never acts alone on consequential decisions                                                             |
| **Interview Assessment**  | Structured technical/behavioral evaluation (F-88)                                                          |
| **License Pool**          | Institutional purchase of N seats                                                                          |
| **Managed Learner**       | Institutional tenant user                                                                                  |
| **MediaSource**           | Provider-agnostic media reference                                                                          |
| **PII**                   | Personally Identifiable Information                                                                        |
| **Provider Adapter**      | Plugin for one media provider                                                                              |
| **Readiness Score**       | Per-role score of candidate readiness (F-91)                                                               |
| **Reputation Engine**     | Multi-context reputation system (F-144)                                                                    |
| **RLS**                   | Row Level Security                                                                                         |
| **Salary Aggregate**      | k-anonymized benchmark (F-86)                                                                              |
| **Skill Evidence**        | Verified proof of skill (F-96)                                                                             |
| **Skills Graph**          | Semantic model of skills (F-84)                                                                            |
| **SSOT**                  | Single Source of Truth — this document                                                                     |
| **Tenant Isolation Tier** | T1/T2/T3/T4                                                                                                |
| **TIG**                   | Talent Intelligence Graph                                                                                  |
| **UOM**                   | Universal Object Model                                                                                     |
| **Verified Signal**       | Platform-earned credential                                                                                 |
| **Warm Introduction**     | Intro via mutual connection (F-121)                                                                        |
| **Web OS / Talent OS**    | Application-architecture metaphor                                                                          |
| **XP**                    | Experience Points                                                                                          |

---

---

# APPENDICES

Appendices A–E sit outside the numbered sections. Their item ids (D-nn, M-nn, V61-nn) are stable.

## Appendix A — Conflict Adjudications

> v6.1 amendment: see Appendix E, items V61-02, V61-06, V61-18, V61-21 and V61-23

D-2 (job expiry) is contested by the target state machine (V61-18), D-3 (re-application cooldown) by V61-23 and D-33 (course commerce) by V61-21; these target proposals are not ratified and the adjudications below stand as SSOT intent.

| ID   | Conflict                                                                                                                                    | Adjudication                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| D-1  | Daily XP cap 200 vs 5,000                                                                                                                   | 200 XP/day canonical                                                                                                         |
| D-2  | Job expiry 45d vs 60d                                                                                                                       | Configurable, default 60 days                                                                                                |
| D-3  | Duplicate application lifetime vs 90-day                                                                                                    | Partial UNIQUE over ACTIVE + 90-day cooldown                                                                                 |
| D-4  | Referral reward on completion vs hire                                                                                                       | Two distinct milestones                                                                                                      |
| D-5  | SCOPE count 10 vs 8                                                                                                                         | 8 canonical                                                                                                                  |
| D-6  | Register count divergence                                                                                                                   | Locked at §24.8.1 counts (measured counts differ for some registers — see Appendix B and V61-10)                             |
| D-7  | BR-091+ double-assignment                                                                                                                   | Independence BR-091..105; parity BR-106..121 (the §10.22 and §10.23 headings group BR-091..BR-115 and BR-116..BR-128 — open) |
| D-8  | EVT double-assignment                                                                                                                       | Locked ranges retained                                                                                                       |
| D-9  | Module 25/26 triple-definition                                                                                                              | Single numbering                                                                                                             |
| D-10 | F-53+ double-assignment                                                                                                                     | S-12 governs                                                                                                                 |
| D-11 | SCI-09+ double-assignment                                                                                                                   | Migration renumbered SCI-19..25                                                                                              |
| D-12 | Operational-table name drift                                                                                                                | Canonical names per §14.5 (Operational Clusters)                                                                             |
| D-13 | AUTH-019 phantom                                                                                                                            | AUTH-016 in register                                                                                                         |
| D-14 | VER-ID-001 collision                                                                                                                        | Folded into IDV-001..002                                                                                                     |
| D-15 | FC-19 "Phase 3" vs "Phase 6" (FC-19 decision text not in this file — treat as open; phase scale not stated, read as SSOT capability phases) | SSOT Ph6 governs; cannot be checked while FC-19 is missing (V61-02, V61-06)                                                  |
| D-16 | Non-negotiable rule #11 collision                                                                                                           | LinkedIn rule = #16                                                                                                          |
| D-17 | Parity/migration phase placement                                                                                                            | Harmonized                                                                                                                   |
| D-18 | S-15 gap IDs vs S-12 families                                                                                                               | GAP-031..038                                                                                                                 |
| D-19 | OD register double-definition                                                                                                               | Recovered; OD-01..053 (measured: 53 rows in §24.5; §24.8.1 locks 58 — V61-10)                                                |
| D-20 | Seat-revocation grace vs licence-expiry grace                                                                                               | Distinct                                                                                                                     |
| D-21 | WCAG 2.1 vs 2.2                                                                                                                             | 2.2 AA canonical                                                                                                             |
| D-22 | Early FC-18 (decision text not in this file — treat as open) patch counts vs expanded                                                       | Expanded govern                                                                                                              |
| D-23 | `proctoring_sessions` dropped                                                                                                               | Retained (SSOT Ph10, F-45; the §23.1 Ph6 row also lists proctoring, but §7 governs — see the §23.1 note)                     |
| D-24 | `b2b_invoices` vs canonical                                                                                                                 | Folded                                                                                                                       |
| D-25 | XP dual-value retained vs 5,000                                                                                                             | 200/day single cap                                                                                                           |
| D-26 | F-62/F-63 gap analysis says NOT RECOMMENDED                                                                                                 | Confirmed decision-gated                                                                                                     |
| D-27 | F-99 vs F-11                                                                                                                                | F-11 base; F-99 SSOT Ph4 enhancement                                                                                         |
| D-28 | F-115 vs F-77                                                                                                                               | Both retained; F-115 extends F-77                                                                                            |
| D-29 | F-116 vs §21.4 (WCAG 2.2 AA Conformance, Release Gate)                                                                                      | F-116 = feature entry; §21.4 = platform-wide gate                                                                            |
| D-30 | New operational tables → canonical lock                                                                                                     | All new non-canonical; 50+2 unchanged                                                                                        |
| D-31 | F-89 contribution verification scope                                                                                                        | GitHub/GitLab only; no scraping                                                                                              |
| D-32 | Q&A gets dedicated tables vs reuse posts                                                                                                    | Dedicated tables                                                                                                             |
| D-33 | Course commerce extends BILL                                                                                                                | Extends; no new stack                                                                                                        |
| D-34 | Programs vs roadmaps vs cohorts vs batches                                                                                                  | Each has distinct role                                                                                                       |
| D-35 | "No shadows" vs focus ring                                                                                                                  | Focus ring retained; decorative shadows deprecated                                                                           |
| D-36 | "One color" vs semantic hues                                                                                                                | Indigo sole accent; muted semantic icons                                                                                     |
| D-37 | "<150ms" vs 320ms emphasis                                                                                                                  | 80/120/150ms; emphasis deprecated                                                                                            |
| D-38 | "13px/32px" vs mobile 44px                                                                                                                  | Scoped to ≥1024px                                                                                                            |
| D-39 | Single-key shortcuts vs WCAG 2.1.4                                                                                                          | Context-focus only; remappable; disableable                                                                                  |

---

## Appendix B — Register Corrections

> v6.1 amendment: see Appendix E, item V61-10

The corrected value is the historical correction; where it differs from the locked inventory (§24.8.1) or from a measured count, both are quoted and neither is edited (V61-10).

| Register | Correction                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------- |
| SCOPE    | 10 → 8 (corrected)                                                                                   |
| HDN      | 16 → 32                                                                                              |
| FEC      | 14 → 32                                                                                              |
| EC       | 17 → 48                                                                                              |
| UXC      | 15 → 28                                                                                              |
| VER      | 20 → 27                                                                                              |
| PROD     | 20 → 24                                                                                              |
| R        | 15 → 24                                                                                              |
| DOR      | 19 → 26                                                                                              |
| TD       | 18 → 26                                                                                              |
| FC       | 17 → 23                                                                                              |
| ADR      | 8 → 13                                                                                               |
| BR       | 90 → 246 (§24.8.1 locks 248 + 8 MIG; measured: 248 distinct ids + 8 MIG)                             |
| F        | 65 → 173                                                                                             |
| Modules  | 24 → 52                                                                                              |
| J        | 17 → 31 (§24.8.1 locks 28; measured: 28 rows in §10.2)                                               |
| WF       | 23 → 66                                                                                              |
| EVT      | 48 → 72 (32 locked + 40 proposed) (§24.8.1 states "72 locked + 20 proposed" — split differs, V61-10) |
| SCI      | 18 → 54                                                                                              |
| NFR      | 7 → 21                                                                                               |
| Q        | 19 → 34 (no Q register in §24.8.1; register not defined in this file)                                |

---

## Appendix C — Zero-Trust Rules

> v6.1 amendment: see Appendix E, item V61-29

No assumption of implementation for: 26 microservices · 846 tests · 28 E2E specs · 50 tables · 119 RLS policies · `routeRegistry.ts` · Aura tokens · Supabase Auth config · Stripe webhooks · email delivery · AI service contract · any table/RLS policy · Realtime delivery · Chrome extension · JWT role claims · managed hosting provider ISR · file uploads · accessibility · GDPR flows · webhook idempotency · **documentation is reality**. Truth is: code → tests → migrations → served behavior.

---

---

## Appendix D — UX Micro-Interaction Register (100 Patterns)

The following patterns are a single canonical micro-interaction reference. Apply them to the feature specifications rather than copying their text into individual features.

A candidate row-level comparison of M-01 … M-100 with the target UX design is in [UX_PATTERN_SOURCE_CROSSWALK.csv](docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#ux_pattern_source_crosswalkcsv); it is not approved and does not change these patterns (OPEN-50).

### D.1 §UX-MICRO-01 — Loading & Waiting

_The video's topic. Waiting is the single most common UX failure because it's the one designers forget to design._

#### M-01 · The Spinner Tax

**Symptom:** A generic rotating circle appears where content should be. User has no idea what's coming, how big it will be, or whether the page is even working.
**Cost:** Perceived load time increases by 30–50% vs. skeleton screens (Nielsen Norman Group). Users abandon when they can't predict what's coming.
**Fix:** Replace every content-area spinner with a **skeleton screen** that mirrors the final layout — same number of rows, same approximate widths, same image blocks. Spinner is reserved only for _sub-200ms_ operations where a skeleton would flash.
**Applies to:** Job list, course catalog, profile view, feed, application list, notification center, admin tables, institutional analytics.
**Acceptance:** Every content surface in UXC-004 through UXC-028 (§12.17 UX State Matrix) has a defined skeleton state. Zero spinners in content areas. Skeleton appears <100ms, disappears <50ms after data arrives.

---

#### M-02 · The 100ms Rule

**Symptom:** User clicks "Apply" or "Submit" or "Save." Nothing happens for 400ms. They click again. Now the form submits twice, or the button state is ambiguous.
**Cost:** Double-submissions, duplicate records, user anxiety, and support tickets.
**Fix:** Every button that triggers a mutation must give **visual feedback within 100ms** (Miller's response-time threshold) — a pressed state, a spinner _inside the button_, or an immediate state change — then **disable itself** until the response returns. Never rely on the round-trip to provide feedback.
**Applies to:** Apply, Submit, Save, Post, Publish, Enroll, Purchase, Send, Follow, Connect, Report, Refund, Approve, Reject.
**Acceptance:** `<Button>` component has a mandatory `pending` prop. Lint rule blocks mutation buttons without a pending state. 100ms verified via synthetic click test.

---

#### M-03 · Layout Shift

**Symptom:** User goes to click "Apply," but a late-loading banner pushes the button down 40px, and their click lands on "Save Job" or an ad. They didn't get what they clicked.
**Cost:** Frustration, accidental actions, ad-click fraud (in the video's example), broken trust.
**Fix:** **Reserve space** for every late-loading element. Banners, images, video players, embedded content, and third-party widgets must declare their dimensions in layout before content arrives. Use `aspect-ratio`, `min-height`, or explicit skeleton heights.
**Applies to:** Job detail (salary widget, company logo), course player (video frame), profile (avatar, banner), feed (media, link previews), institutional dashboard (charts).
**Acceptance:** Cumulative Layout Shift (CLS) <0.1 on every route class (§20.9 Per-Route Budgets). Zero post-click element displacement in E2E tests.

---

#### M-04 · Real Progress

**Symptom:** A progress bar shows "Loading…" with no percentage, no step, no ETA. User has no idea if this will take 5 seconds or 5 minutes.
**Cost:** Abandonment on long operations; duplicate submission attempts; support tickets asking "is it stuck?"
**Fix:** For any operation >2 seconds, show **three things simultaneously**: percentage complete, current step name, and estimated time remaining. For operations with defined steps (bulk import, migration, media transcode), show a **stepper** with completed/current/pending states.
**Applies to:** Bulk student import, migration engine, media transcode, large exports, institutional reports, contest scoring.
**Acceptance:** Operations >2s show all three metrics. Step names come from a centralized registry. ETA accuracy tracked post-launch (target ±30%).

---

#### M-05 · Stream It

**Symptom:** User opens the jobs page. One slow query (e.g., company logos) freezes the entire page. The whole screen is blank for 3 seconds, then everything pops in at once.
**Cost:** Perceived load time = slowest request. Users blame the whole page for one slow part.
**Fix:** **Render the shell immediately** (navigation, page header, static chrome), then **fill regions independently** as their data arrives. Use React route-level code splitting and Suspense boundaries. Regions that fail to load show their own error state without affecting neighbors.
**Applies to:** Dashboard, profile, job detail, course detail, admin console, institutional analytics.
**Acceptance:** Every page has a defined shell + ≥2 independently streamed regions. One region failing never blanks the page. TTFB <800ms for the shell.

---

#### M-06 · The Forever Spinner

**Symptom:** The spinner spins. And spins. And spins. There is no timeout, no error, no retry. The user closes the tab.
**Cost:** This is the one that loses the customer. No error, no exit — they just leave. Highest-severity UX defect.
**Fix:** **Every async operation needs a terminal state.** After 10 seconds, show "Taking longer than expected…" with a cancel option. After 30 seconds, fail with a specific error, correlation ID, and a retry button. Never leave a spinner spinning indefinitely.
**Applies to:** Every async operation in the platform — no exceptions. The 30-second failure conflicts with operations that run longer by design (F-08 judging, bulk import, media processing, timed exams; UXC-006; §13.2 Timeout "idempotent resume"); whether these follow M-04 progress tracking instead is open (owner decision).
**Acceptance:** Every `useQuery`/`useMutation`/fetch has a timeout. `error_code_catalog` (not defined in this file — treat as open; §13.2 defines error classes, not codes) contains a timeout entry. The R-003 runbook (not defined in this file — treat as open) covers mass-timeout incidents. Zero infinite spinners in staging soak test.

---

#### M-07 · Optimistic Update With Rollback

**Symptom:** User clicks "Like" on a post. The heart fills instantly, then 400ms later it unfills because the server rejected it. No explanation.
**Cost:** User distrust; second-guessing whether their action "took"; abandonment of low-stakes interactions.
**Fix:** Optimistic updates must ship with a **visible rollback path**: on failure, show a small inline error ("Couldn't save. Retry?") _near the element_, not just a global toast. For high-stakes actions (Apply, Purchase, Submit), do NOT use optimistic UI — show explicit loading state and confirmation.
**Applies to:** Reactions, follows, bookmarks, saves, mutes, dismissals (optimistic OK). Applications, purchases, submissions (never optimistic).
**Acceptance:** Optimistic patterns documented per action type. Rollback UX tested with forced 500 response.

---

#### M-08 · The Cold Start Problem

**Symptom:** First-time user lands on the dashboard. Everything is empty. No guidance, no next step. Just "No data" in six panels.
**Cost:** 40%+ of new users abandon within 2 minutes when the first screen is a void.
**Fix:** First-time users get a **guided empty state** — never a blank dashboard. Show 2–3 clearly labeled actions ("Complete your profile", "Take your first challenge", "Browse open roles"). Track which one they click. Adapt the second session based on their first action.
**Applies to:** Dashboard, jobs, courses, applications, portfolio, notifications, feed, institutional admin.
**Acceptance:** Every empty state has a primary CTA. First-session funnel instrumented (EVT-001 → first meaningful action). Target: 40% complete first action within 24h.

---

#### M-09 · Stale-While-Revalidate

**Symptom:** User navigates back to a page they saw 5 minutes ago. It shows a spinner and re-fetches everything, even though nothing changed.
**Cost:** Perceived slowness on repeat visits; wasted bandwidth; unnecessary server load.
**Fix:** Show **cached data immediately** with a subtle "Refreshing…" indicator in the corner. Only escalate to a full skeleton if cache is >24h old or explicitly invalidated.
**Applies to:** Profile, feed, notifications, job list, course list, saved searches.
**Acceptance:** Repeat navigation within 5 minutes uses cache. Stale indicator appears only when revalidating. Manual refresh always available.

---

#### M-10 · The Prefetch Whisper

**Symptom:** User hovers over a job card, clicks, waits 800ms for the detail page.
**Cost:** Every click feels 800ms slower than it needs to be.
**Fix:** Prefetch the **most likely next page** on hover (desktop) or on viewport entry (mobile). Prefetch budget: ≤2 pages per session, ≤100KB per prefetch. Do not prefetch on metered connections.
**Applies to:** Job cards → job detail; course cards → course detail; profile avatars → profile; notification items → target.
**Acceptance:** Prefetch hit rate >60% on desktop. Prefetch budget enforced. `navigator.connection.saveData` respected.

---

### D.2 §UX-MICRO-02 — Interaction Feedback

#### M-11 · The Ghost Button

**Symptom:** User clicks a button. It does something, but there's no visual change. Did it work? Did I misclick?
**Cost:** User clicks again, or gives up.
**Fix:** Every interactive element has **four distinct visual states**: default, hover, active (pressed), focus. The active state must be _visually different_ from default (not just a cursor change). Focus state must be ≥2px with 3:1 contrast. The AA criteria in the §21.4 gate are 2.4.7 Focus Visible and 1.4.11 Non-text Contrast; 2.4.13 Focus Appearance, which the 2px size follows, is Level AAA (a §21.5 forward target).
**Applies to:** Every button, link, tab, card, menu item.
**Acceptance:** Aura `<Button>`, `<Link>`, `<Card>` components have all four states. Contrast measured. Zero elements missing states.

---

#### M-12 · The Dead Zone

**Symptom:** User clicks the edge of a button, misses by 2px, nothing happens.
**Cost:** Micro-frustration repeated hundreds of times per session.
**Fix:** Every clickable element has a **minimum 44×44px tap target** on touch, **24×24px** on desktop (24×24px is WCAG 2.5.8, AA; 44×44px follows WCAG 2.5.5, AAA, as a design target). Use padding, not visual size, to expand the hit area when the visual is smaller.
**Applies to:** Icon buttons, close buttons, checkbox labels, table row actions, mobile nav items.
**Acceptance:** Automated audit reports zero violations on all routes. Manual spot-check on mobile.

---

#### M-13 · Focus Never Lost

**Symptom:** User tabs through a form, a modal opens, and focus drops to the top of the page. Now they have to tab 40 times to get back.
**Cost:** Keyboard users abandon forms. Accessibility violation.
**Fix:** Modal opens → focus moves to the first focusable element. Modal closes → focus returns to the trigger. Content updates dynamically → focus stays anchored. Never silently move focus.
**Applies to:** Every modal, dialog, dropdown, drawer, popover.
**Acceptance:** `focus-return` test on every modal component. Keyboard-only sweep per release.

---

#### M-14 · The Keyboard Shortcut Whisper

**Symptom:** User sees a button. It's fast to click. But there's a faster way they'll never discover.
**Cost:** Power users don't become power users; every action is mouse-dependent.
**Fix:** Show the shortcut **in the tooltip or as an inline kbd chip** on hover for common actions. `⌘K` for command palette, `Esc` to dismiss, `↑↓` for list navigation, `Enter` to open, `/` to focus search.
**Applies to:** Command palette, modals, list navigation, form submission, notification panel.
**Acceptance:** Every shortcut discoverable via tooltip or `/help`. WCAG 2.1.4 compliant (context-scoped, remappable, disableable).

---

#### M-15 · The Tooltip That Never Comes

**Symptom:** User hovers over an icon-only button (e.g., "flag", "archive"). They wait. Nothing. They click. It does something unexpected.
**Cost:** Users avoid icon-only actions; features go unused.
**Fix:** Every icon-only button has a **tooltip within 300ms of hover** with a label (not a description). Add `aria-label` regardless of tooltip.
**Applies to:** All icon buttons: edit, delete, flag, share, mute, archive, filter, sort.
**Acceptance:** Zero icon-only buttons without `aria-label` or tooltip. Tooltip delay ≤300ms.

---

#### M-16 · The Silent Success

**Symptom:** User saves their profile. Nothing happens. No toast, no state change, no confirmation.
**Cost:** User re-saves; refresh reveals it worked; trust eroded.
**Fix:** Every mutation has **explicit success feedback** — either a state change (button → "Saved ✓"), a toast, or an inline message. For major actions (application submitted, course enrolled, offer accepted), use a **full-screen or modal confirmation** with a clear next step.
**Applies to:** Every mutation.
**Acceptance:** Every `useMutation` has success UI. Toast duration ≥4s for info, ≥6s for actions requiring acknowledgment (conflicts with M-47: info ≥6s, action toasts never auto-dismiss — open).

---

#### M-17 · The Confirmation Circus

**Symptom:** User tries to delete a comment. Modal: "Are you sure?" Yes. Modal: "This cannot be undone." Yes. Modal: "Really?" Yes. User gives up.
**Cost:** Destructive actions feel hostile; users hesitate on everything.
**Fix:** **One confirmation** for reversible actions, **two** for irreversible ones. Use **soft delete with undo** for anything that can be recovered (comments, posts, drafts, saved items). Reserve hard confirms for truly irreversible ops (account deletion, license revocation, payout).
**Applies to:** Delete, archive, revoke, cancel, unsubscribe, leave.
**Acceptance:** Audit of all destructive actions. Reversible actions use undo toast. Hard confirms limited to a documented list (the list is not in this file — treat as open; offer, hire and reject in F-06 have no confirmation rule).

---

#### M-18 · The Optimistic Disable

**Symptom:** User clicks "Enroll." Button grays out. 800ms later it un-grays with an error. But the button _still says "Enroll"_ — did it work or not?
**Cost:** Ambiguity; user retries; duplicate enrollment attempts.
**Fix:** Disabled state must show **what's happening**, not just gray out. Change the label ("Enrolling…") or add an inline spinner _inside_ the button. Never leave a disabled button with its original label.
**Applies to:** Every async button.
**Acceptance:** No disabled button retains its original label. `pendingLabel` prop enforced in `<Button>`.

---

#### M-19 · The Hover Heavy

**Symptom:** User moves the mouse across a dense list. Every row triggers a 200ms shadow animation. The screen vibrates.
**Cost:** Visual noise; users lose track of their cursor; motion-sensitive users feel ill.
**Fix:** Hover feedback must be **subtle and fast** (≤80ms per the Dense Profile — not defined in this file, treat as open; compare §12.13 Aura Design System motion tokens), not a 200–300ms shadow choreography. Change surface value, not shadow. No bounce, no spring. Honor `prefers-reduced-motion`.
**Applies to:** Table rows, list items, cards, menu items.
**Acceptance:** Every hover ≤80ms. Zero hover shadows on dense surfaces. Reduced-motion collapses to 0ms.

---

#### M-20 · The Right-Click Menace

**Symptom:** User right-clicks a table row expecting native context menu. Gets nothing, or gets a truncated custom menu that fights the OS.
**Cost:** Platform-inconsistent feel; lost productivity; power-user frustration.
**Fix:** Do not **override** the native context menu unless you have a _richer_ one (multiple typed actions the user needs). If you do, replicate expected items (Copy, Open in new tab) and label them clearly. If you don't have richer, leave native behavior alone.
**Applies to:** Table rows, list items, editable cells, code editors (where the arena uses Monaco's native menu).
**Acceptance:** Zero custom context menus without native-behavior parity. Right-click on Monaco uses Monaco's menu.

---

### D.3 §UX-MICRO-03 — Forms & Validation

#### M-21 · The Silent Invalid

**Symptom:** User fills a form, clicks Submit. Nothing happens. No error, no highlight, no scroll. They can't find what's wrong.
**Cost:** Form abandonment; rage-submit; support tickets.
**Fix:** On submit failure, **scroll to the first invalid field**, **focus it**, and show an inline error. Add an **error summary** at the top of the form with anchor links to each invalid field.
**Applies to:** Every form with >3 fields.
**Acceptance:** Error summary present on every multi-field form. Focus moves to first invalid field on submit failure.

---

#### M-22 · The Late Validation

**Symptom:** User types an email. On every keystroke: "Invalid email." They haven't finished.
**Cost:** Users feel scolded; validation feels hostile; users stop typing mid-form.
**Fix:** Validate on **blur**, not on keystroke. Re-validate on keystroke **only after the first error** (to clear the error as they fix it). Never show an error before the user has finished interacting with the field.
**Applies to:** Every text input, email, password, phone.
**Acceptance:** Zod schema wraps blur/change events distinctly. Zero keystroke-validated fields on first entry.

---

#### M-23 · The Password Purgatory

**Symptom:** User types a password. Rule: "Must contain 8+ chars, 1 uppercase, 1 number, 1 symbol, no dictionary words, no repeats." No indication of which rule they've satisfied.
**Cost:** Password creation takes 4× longer; users pick weak passwords out of frustration.
**Fix:** **Live rule checklist** as the user types — each rule ticks off in real-time as satisfied. Show the checker _before_ submission, not after. Never use CAPTCHA (use rate limiting per §15.7, HDN-008).
**Applies to:** Registration, password reset, password change.
**Acceptance:** Real-time password rule checklist on every password field. zxcvbn score shown as strength bar.

---

#### M-24 · The Autosave Void

**Symptom:** User writes a long post/article/application. They assume it's saved. They close the tab. It's gone.
**Cost:** Catastrophic — user loses hours of work; never returns.
**Fix:** Autosave with **visible status** — "Saved 2s ago", "Saving…", "Saved draft". For long-form content (posts, articles, applications, course descriptions), autosave every 5s to localStorage + every 30s to server. On return, prompt: "We found a saved draft. Recover?"
**Applies to:** Post composer, article editor, application form, course builder, assignment submission, Q&A drafts.
**Acceptance:** Autosave status visible in every long-form editor. Draft recovery prompt tested for each surface.

---

#### M-25 · The Required Field Mystery

**Symptom:** User fills out a form. Submits. Error: "field X is required." Wait — it was never marked required.
**Cost:** User feels tricked; trust eroded.
**Fix:** Mark all required fields with a **visible indicator** (asterisk or "required" label). If most fields are required, invert: mark _optional_ fields and say "All fields required unless marked optional." Never surprise.
**Applies to:** Every form.
**Acceptance:** Zero required fields without visual marker. Screen readers announce required state.

---

#### M-26 · The Dropdown Dump

**Symptom:** User opens a "Country" dropdown with 195 options. No search. They scroll.
**Cost:** Form completion time × 10; abandonment on long lists.
**Fix:** Any list >15 options gets a **searchable combobox**. Country, language, skill, category, industry, company — all searchable. Alphabetical or frequency-sorted. Keyboard-navigable.
**Applies to:** Country, city, skill, category, industry, language, currency, company, org.
**Acceptance:** Every select >15 options is a combobox with search. Combobox a11y conformance verified.

---

#### M-27 · The Focus Trap Escape

**Symptom:** User opens a modal, tabs through it, and focus escapes to the background page. Now the modal is still open, but the user is interacting with the hidden page behind.
**Cost:** Accessibility failure; keyboard users lose their place.
**Fix:** Modals must **trap focus** until closed. Tab from last element → first element (wrap). Shift+Tab from first → last. Escape closes. Focus returns to trigger.
**Applies to:** Every modal, dialog, drawer, sheet.
**Acceptance:** Focus trap test on every modal component. Zero escape in automated test.

---

#### M-28 · The Field Re-Entry

**Symptom:** User enters shipping/billing info. Next step: "Re-enter your address."
**Cost:** WCAG 3.3.7 violation (Redundant Entry); user frustration.
**Fix:** Never ask for the same information twice. Prefill from profile, previous entry, or saved data. If a "different billing address" case exists, default to "same as above" with an opt-in to change.
**Applies to:** Application forms, checkout, institutional import, event registration.
**Acceptance:** Zero redundant fields across multi-step forms. WCAG 3.3.7 conformance evidence.

---

#### M-29 · The Destructive Default

**Symptom:** User opens a "Clear filters" dropdown. The default highlighted option is "Reset all". They hit Enter.
**Cost:** Accidental data loss; user has to rebuild their filters.
**Fix:** The **safe option is the default**. Destructive actions are never the default-focused element. Confirm destructive actions explicitly. Provide undo where possible.
**Applies to:** Filter reset, form reset, bulk actions, leave-without-save.
**Acceptance:** Default-focus audit of every dropdown and menu. Zero destructive defaults.

---

#### M-30 · The Copy-Paste Punishment

**Symptom:** User's password manager tries to fill the password field. It's blocked. Or they paste a TOTP code and it doesn't work.
**Cost:** WCAG 3.3.8 violation (Accessible Authentication); user cannot use their tools.
**Fix:** **Allow paste** in all fields. Never block paste. Never block password managers. Never require CAPTCHA as a gate. TOTP fields accept pasted codes (and handle spaces).
**Applies to:** Login, registration, TOTP, recovery codes, any input.
**Acceptance:** `onPaste` never prevented. Password manager autofill works. TOTP accepts paste.

---

### D.4 §UX-MICRO-04 — Empty States

#### M-31 · The Empty Void

**Symptom:** User goes to "Saved Jobs." Blank page. No text, no CTA. "Is this broken?"
**Cost:** User assumes the feature doesn't work; doesn't discover the feature.
**Fix:** Every empty state has: **illustration or icon**, **one-sentence explanation**, **primary CTA** to the next action. Never blank. Never just "No data."
**Applies to:** Every list, every table, every dashboard panel.
**Acceptance:** Every list has a designed empty state. Empty state CTA is a primary button.

---

#### M-32 · The Empty Dashboard

**Symptom:** New user logs in for the first time. Dashboard shows 6 empty widgets, no guidance, no next step.
**Cost:** 40%+ abandon within 2 minutes.
**Fix:** **First-session dashboard is different** from the steady-state dashboard. Show 3 guided actions with progress indicators. Adapt the second session based on what they did first.
**Applies to:** Candidate dashboard, recruiter dashboard, institution dashboard, admin console.
**Acceptance:** First-session variant defined per role. Tracked via `first_meaningful_action` event.

---

#### M-33 · The Search That Finds Nothing

**Symptom:** User searches "React developer remote." Zero results. Blank screen. No suggestion.
**Cost:** User assumes no jobs exist; leaves.
**Fix:** Zero-result searches get **recovery UX**: "No matches for [query]. Try: [related term 1], [related term 2], [relax this filter]." Suggest relaxed filters, related skills, broader locations.
**Applies to:** Job search, course search, people search, company search, salary search.
**Acceptance:** Zero-result state has ≥2 recovery options. Search analytics track query→zero-result rate (target <10%).

---

#### M-34 · The Permission Denied Void

**Symptom:** User navigates to a page they don't have access to. 404, or worse, a blank screen.
**Cost:** User thinks the platform is broken, not that they lack access.
**Fix:** Permission-denied is **explicit and actionable**: "You don't have access to this page. [Request access] or [Return to dashboard]." Never 404 on a permission issue. Never blank. This conflicts with §13.2 and F-12, which answer an object-level authorization denial with a 404-equivalent so that existence does not leak; whether this pattern applies only to route- and role-level denial is open (owner decision).
**Applies to:** Admin routes, institutional routes, recruiter-only views, org-scoped resources.
**Acceptance:** Zero 404s on permission-denied. Every denied state has a contact/request path.

---

#### M-35 · The "Coming Soon" Black Hole

**Symptom:** User clicks a menu item. "Coming soon." No timeline, no alternative.
**Cost:** User perceives the product as incomplete; trust erodes.
**Fix:** Either **hide** the feature entirely (cleaner), or show a **waitlist/notify-me** option with a realistic timeline. Never show "Coming soon" without a way to be notified.
**Applies to:** Deferred features, OD-gated items, SSOT Ph8+ surfaces.
**Acceptance:** Zero "coming soon" without an email capture. Feature flags hide deferred surfaces by default.

---

#### M-36 · The Draft Graveyard

**Symptom:** User wrote a post draft months ago. It's still there, halfway done, cluttering their drafts list.
**Cost:** Clutter; user feels bad about "unfinished work"; abandonment of the composer.
**Fix:** Auto-archive drafts after 30 days of no edit. Send a "Still working on this?" nudge at day 25. Draft archived, not deleted — one-click restore.
**Applies to:** Post drafts, article drafts, application drafts, migration imports.
**Acceptance:** Auto-archive job runs daily. Nudge at day 25. Restore path tested.

---

#### M-37 · The Emptied Notification Center

**Symptom:** User clears all notifications. Blank screen. No satisfaction, no direction.
**Cost:** Missed opportunity to re-engage; user leaves the page.
**Fix:** "You're all caught up" with a **suggested next action** — recent jobs matching your profile, new courses, unread messages, pending tasks. Empty notifications ≠ dead end.
**Applies to:** Notifications, messages inbox, task lists.
**Acceptance:** Every "all caught up" state has ≥1 next-action suggestion.

---

### D.5 §UX-MICRO-05 — Error Handling

#### M-38 · The Blame-Free Error

**Symptom:** Error message: "Invalid input." What input? Which field? Why?
**Cost:** User cannot recover; abandons.
**Fix:** Every error message must: **(1) say what happened**, **(2) say why**, **(3) say what to do**. Never blame the user. Never use system jargon. Never expose a stack trace or correlation ID without explanation.
**Applies to:** Every user-facing error.
**Acceptance:** Error message audit per release. `error_code_catalog` (not defined in this file — treat as open; §13.2 gives class-level messages) maps every code to a human-readable message + action.

---

#### M-39 · The Correlation ID Whisper

**Symptom:** Error: "Something went wrong. Reference: abc-123." User has no idea what to do with that.
**Cost:** User cannot self-recover; support ticket volume increases.
**Fix:** Every error page shows a **correlation ID** with a **copy button** and the text "Quote this ID if you contact support." Pair with a **retry button** and a link to support. Never show a raw ID without context.
**Applies to:** All error pages (500-class, timeout, dependency failure).
**Acceptance:** Every error surface has copy-ID button + retry + support link.

---

#### M-40 · The Retry That Doesn't

**Symptom:** Error page says "Try again." User clicks. Same error, immediately, with no additional info.
**Cost:** User loses trust in the retry affordance; abandons.
**Fix:** Retry must **have a chance of succeeding**. If the underlying dependency is down, retry waits (backoff) or explains ("Our payment provider is temporarily unavailable"). Never offer retry on a non-retryable error.
**Applies to:** Dependency failures, timeouts, 5xx.
**Acceptance:** Retry button only on retryable errors. Non-retryable errors offer alternate paths.

---

#### M-41 · The Hostile Validation

**Symptom:** Error: "Username already taken." User rage-quits because they spent 5 minutes crafting a username.
**Cost:** Form abandonment; user feels unwelcome.
**Fix:** Validation errors are **constructive, not accusatory**. For taken usernames, suggest alternatives ("Try: raj_2026, raj_dev, raj.codes"). For weak passwords, show what's missing, not just "too weak". For invalid emails, say "This doesn't look like an email address. Check for typos."
**Applies to:** Every validation error.
**Acceptance:** Zero errors that only state "invalid" or "taken." Every error offers a next step.

---

#### M-42 · The Offline Blame

**Symptom:** User is on a train. They try to post. Error: "Something went wrong." No indication that they're offline.
**Cost:** User blames the platform; doesn't understand why posting failed.
**Fix:** Detect `navigator.onLine`. When offline, show explicit "You're offline. We'll send this when you're back." Queue the action. When back online, execute automatically.
**Applies to:** Post composer, message send, form submission, comment.
**Acceptance:** Offline banner visible. Offline actions queued. Auto-retry on reconnection.

---

#### M-43 · The Partial Failure

**Symptom:** User bulk-imports 500 students. 487 succeed, 13 fail. The screen says "Import complete." The 13 failures are invisible.
**Cost:** Silent data loss; user doesn't know which records to fix.
**Fix:** Bulk operations report **explicit partial-success state**: "487 of 500 imported. 13 failed. [Download error report]." Never say "complete" when partial. Never hide failures.
**Applies to:** Bulk import, bulk actions, migration, batch assignment, bulk exports.
**Acceptance:** Every bulk operation has a partial-success UI state. Error report downloadable as CSV.

---

#### M-44 · The Cascading Failure

**Symptom:** User tries to view a job. The page errors because the _salary widget_ failed. The whole job detail is gone.
**Cost:** One failure breaks everything; user can't access the primary content.
**Fix:** **Isolate failures per region.** The job description should still render even if the salary widget fails. Each region has its own error boundary with a degraded state.
**Applies to:** Any page with multiple data sources.
**Acceptance:** Every page has ≥2 error boundaries. Region failure never blanks the page.

---

#### M-45 · The Angry Error Color

**Symptom:** A minor warning (e.g., "This job posting expires in 3 days") is shown in the same red as a fatal error. User panics.
**Cost:** Users can't distinguish severity; real errors get lost in the noise.
**Fix:** **Severity-appropriate color.** Error (red, danger) for blocking failures. Warning (amber) for attention-needed. Info (blue/neutral) for context. Success (green) for confirmations. Never use red for non-errors.
**Applies to:** All messaging surfaces.
**Acceptance:** Severity-color mapping enforced in Aura tokens. Zero red non-errors.

---

#### M-46 · The Error Without Exit

**Symptom:** User hits a 403. Page shows error. No navigation, no back button visible, no link to home.
**Cost:** User is trapped; closes tab.
**Fix:** Every error page has **≥2 exit paths**: back, home, contact support, retry, or an alternative action. Never a dead-end error.
**Applies to:** 403, 404, 500, timeout, dependency-failure pages.
**Acceptance:** Zero dead-end error pages. Every error has exit paths.

---

#### M-47 · The Auto-Dismiss Surprise

**Symptom:** User is reading a toast. It disappears in 3 seconds before they can read it. Or worse, the toast contains the only "Undo" button.
**Cost:** Missed critical info; missed undo; accidental deletion.
**Fix:** Info toasts auto-dismiss after ≥6s. Action toasts (with Undo) **never auto-dismiss** — they require explicit dismissal. Critical errors never auto-dismiss. Hovering a toast pauses its timer.
**Applies to:** All toasts.
**Acceptance:** Action toasts require manual dismiss. Hover pauses timer. No auto-dismissal for errors.

---

#### M-48 · The Silent Failure

**Symptom:** User clicks something. Nothing happens. No error, no loading, no state change. Just nothing.
**Cost:** User cannot determine if it worked; retries; double-submits; loses trust.
**Fix:** **Every click produces visible feedback within 100ms** (see M-02). If the click did nothing, either disable the element or remove it. Never a silent no-op.
**Applies to:** Every interactive element.
**Acceptance:** Automated click test on every button verifies state change within 100ms.

---

### D.6 §UX-MICRO-06 — Notifications & Toasts

#### M-49 · The Toast Avalanche

**Symptom:** User performs a bulk action. 47 toasts cascade down the screen, each stacking on top of the last.
**Cost:** Visual chaos; important messages buried; users dismiss without reading.
**Fix:** **Group related toasts.** "47 items archived" — one toast with a "View details" link. Max 3 concurrent toasts. Queue the rest. Never stack more than 3 visually.
**Applies to:** Bulk actions, batch operations, multi-item processes.
**Acceptance:** Toast grouping implemented. Max 3 concurrent. Queue accessible.

---

#### M-50 · The Toast That Blocks

**Symptom:** User is about to click "Submit" but a toast is covering the button.
**Cost:** Accidental toast dismissal; missed submission.
**Fix:** Toasts appear in a **non-blocking position** — bottom-right or top-right, never over primary CTAs. Never full-width. Never center-screen. Respect safe zones.
**Applies to:** All toasts.
**Acceptance:** Toast position never overlaps primary actions. Verified by screenshot test.

---

#### M-51 · The Notification Flood

**Symptom:** User gets 12 notifications in 5 minutes. Follow, comment, mention, reaction, follow, comment…
**Cost:** Notification fatigue; user disables notifications entirely.
**Fix:** **Group and coalesce** (NTF-012; not defined in this file — treat as open). "3 people reacted to your post." "2 new comments." "5 new followers." Digest when >5 events in 15 minutes. Never one notification per event when events cluster.
**Applies to:** Social notifications, community notifications, course announcements.
**Acceptance:** Grouping rules per event type. Digest threshold configurable. Verified in staging.

---

#### M-52 · The Email That Never Arrives

**Symptom:** User requests a password reset. Nothing arrives. They check spam — nothing.
**Cost:** User cannot access account; support ticket; potential churn.
**Fix:** After sending, show **explicit confirmation**: "We sent a reset link to raj@example.com. Check your spam folder if it doesn't arrive within 2 minutes." Add a "Resend" button (rate-limited) after 30 seconds.
**Applies to:** Password reset, verification email, job alert email, digest.
**Acceptance:** Every email-triggering action shows recipient + spam guidance + resend. Whether registration and password-reset responses must be identical for known and unknown addresses is not specified (F-01 requires duplicate-email rejection) — open.

---

#### M-53 · The Unsubscribe Maze

**Symptom:** User wants to unsubscribe from emails. Link goes to a "preferences" page requiring login, then a settings page, then a modal.
**Cost:** User marks as spam; sender reputation damaged; legal compliance risk.
**Fix:** **One-click unsubscribe** (RFC 8058). Link in email footer directly unsubscribes without login. Confirm on-page. Offer "Adjust preferences" as optional next step, never as required.
**Applies to:** Newsletters, digests, marketing, job alerts.
**Acceptance:** One-click unsubscribe per email. RFC 8058 compliance verified.

---

#### M-54 · The Silent Notification

**Symptom:** User receives an important notification (offer received, application rejected) but there's no visual or audible signal. They miss it.
**Cost:** Missed opportunities; user blames platform.
**Fix:** Critical notifications (application status, offer, hire, message) get **in-app toast + email + optional push**. Ambient notifications (reactions, follows) get in-app only. Never silent for time-sensitive items.
**Applies to:** Application status, offers, messages, mentorship requests, license expiry.
**Acceptance:** Notification matrix (not defined in this file — treat as open; see F-14 Notification Center, §7.1). Critical = multi-channel; ambient = in-app only.

---

#### M-55 · The Badge That Lies

**Symptom:** Notification badge shows "3" but opening the panel shows "0 new". Or badge shows "0" but there's an unread message.
**Cost:** User loses trust in the badge; ignores notifications.
**Fix:** Badge count **must match actual unread**. Reconcile on every panel open. Server-authoritative count. Never optimistic count that can drift.
**Applies to:** Notification bell, messages badge, unread count anywhere.
**Acceptance:** Badge-count reconciliation test. Zero drift in soak test.

---

### D.7 §UX-MICRO-07 — Navigation & Wayfinding

#### M-56 · The Unsaved Warning

**Symptom:** User has a half-filled application form. They click a nav link. Form is gone. No warning.
**Cost:** Data loss; user rage-quits.
**Fix:** Before navigating away from a dirty form, show a **confirmation dialog**: "You have unsaved changes. Leave anyway?" This applies to back button, nav clicks, external link clicks, and refresh (beforeunload).
**Applies to:** Application forms, course builder, post composer, profile edits, migration wizard.
**Acceptance:** Dirty-form guard on every form with >5 fields. Back/refresh/nav all intercepted.

---

#### M-57 · The Breadcrumb Void

**Symptom:** User navigates deep: Jobs → Senior Engineer at Acme → Apply. They want to go back to the job detail. No breadcrumb.
**Cost:** User clicks browser back repeatedly; loses context.
**Fix:** Every page deeper than 2 levels shows a **breadcrumb**. Even better: a "Back to [parent]" link near the page title.
**Applies to:** Job detail, course detail, application detail, profile detail, admin detail pages.
**Acceptance:** Breadcrumb on every detail page. Parent link tested.

---

#### M-58 · The Modal Inception

**Symptom:** User opens a modal. Inside it, a link opens another modal. Inside that, another.
**Cost:** User loses context; cannot close; UX trap.
**Fix:** **Modals never open other modals.** If a flow needs multiple steps, use a single modal with a stepper, or navigate to a full page. Escape always closes the _current_ thing.
**Applies to:** Every modal.
**Acceptance:** Zero nested modals. Escape handling tested.

---

#### M-59 · The Back Button Betrayal

**Symptom:** User clicks browser back. Instead of going to the previous page, they get logged out, or land on the login page, or the app redirects them to the dashboard.
**Cost:** User loses their place; breaks browser expectations.
**Fix:** Back button must **respect browser history**. Never intercept back to redirect. If a user is on a page they shouldn't be on (e.g., logged out), back takes them to the previous valid page, not home.
**Applies to:** All routes.
**Acceptance:** Browser back behavior tested per route. No forced redirects.

---

#### M-60 · The Deep Link Surprise

**Symptom:** User shares a job link on WhatsApp. Friend clicks it. Gets "You must log in." Logs in. Lands on the dashboard, not the job.
**Cost:** Broken sharing; lost viral loop.
**Fix:** Deep links **preserve destination**. Login page accepts `?return=` param. Post-login redirect honors it. Never drop the destination.
**Applies to:** Jobs, courses, profiles, posts, articles, events.
**Acceptance:** Deep-link login flow tested. `return` param preserved. How `return` is validated (for example, same-origin relative paths only, against open redirect, CWE-601) and whether it survives sign-up are not specified (open, owner decision).

---

#### M-61 · The Mobile Menu Maze

**Symptom:** On mobile, user taps the hamburger. 40-item menu drops down. They can't find anything.
**Cost:** Mobile usability collapses; feature discovery dies.
**Fix:** Mobile nav shows **5 primary items max** (bottom tab bar). Everything else lives in a "More" sheet or search. Group by task, not by module.
**Applies to:** Mobile navigation for all roles.
**Acceptance:** Bottom nav ≤5 items on mobile. All major flows reachable in ≤3 taps.

---

#### M-62 · The Active State Amnesia

**Symptom:** User is on the "Jobs" page but the sidebar shows "Dashboard" as active. They're lost.
**Cost:** User can't tell where they are.
**Fix:** Active state matches the **current page**, not the last clicked link. Sub-routes activate their parent (`/jobs/:jobId` → "Jobs" active). Persistent across reloads.
**Applies to:** Sidebar, top nav, tab bars.
**Acceptance:** Active state test on every route. Sub-route parent activation verified.

---

#### M-63 · The Search Bar Disappearing Act

**Symptom:** User is on a list page. They scroll down. The search bar scrolls away. They have to scroll up to search again.
**Cost:** Repeated scrolling; frustration on long lists.
**Fix:** Search bar **sticky at top** on list pages. Same for filter controls. The controls stick; the content scrolls.
**Applies to:** Job list, course list, application list, people search, admin tables.
**Acceptance:** Sticky search/filters on every list page. Sticky behavior tested.

---

#### M-64 · The Modal Escape

**Symptom:** User opens a modal, presses Escape, nothing happens. Or it closes the wrong thing.
**Cost:** Users feel trapped in modals.
**Fix:** **Escape always closes the topmost dismissible layer.** This is universal. Escape on a modal closes the modal. Escape on a dropdown closes the dropdown. Escape on a form with a dirty state shows the confirmation. Never let Escape do nothing.
**Applies to:** Every dismissible layer.
**Acceptance:** Escape handler on every modal, dropdown, drawer. Tested via keyboard-only sweep.

---

### D.8 §UX-MICRO-08 — Data Freshness & Concurrency

#### M-65 · The Stale Data Trap

**Symptom:** User has the jobs page open in one tab. Recruiter changes salary in another. User applies at old salary. Contract disputes.
**Cost:** Legal risk; user distrust.
**Fix:** Re-validate critical fields **at submission time**. If salary/role/dates have changed since the user last loaded the page, show a diff and require re-confirmation.
**Applies to:** Applications, purchases, offers, contract acceptance.
**Acceptance:** Pre-submit re-validation on every high-stakes form. Diff UI tested.

---

#### M-66 · The Concurrent Edit Conflict

**Symptom:** Two admins edit the same course. Both save. Second save silently overwrites the first.
**Cost:** Silent data loss; user distrust.
**Fix:** **Optimistic concurrency** on every multi-user editable resource. On conflict, return 409 with a diff ("Someone else changed this. Review changes before saving."). Never silent overwrite.
**Applies to:** Course builder, org profile, institutional settings, admin config, job posting.
**Acceptance:** Version column on every concurrency-sensitive table. 409 on stale save.

---

#### M-67 · The Stale Badge

**Symptom:** User's dashboard shows "5 new applications" but it was last refreshed 2 hours ago and there are actually 12.
**Cost:** User acts on stale information; trusts numbers less.
**Fix:** Any live-updating surface shows **last-updated timestamp** + a subtle refresh button. Never present stale data as fresh.
**Applies to:** Dashboard widgets, admin metrics, analytics, recruiter pipeline.
**Acceptance:** Every stale-able surface has last-updated timestamp. Manual refresh available.

---

#### M-68 · The Refresh That Loses State

**Symptom:** User has filters applied, page 3 selected, sorted by date. They refresh. All filters reset.
**Cost:** User has to re-apply every filter; frustration.
**Fix:** Filters, sort, and pagination persist in **URL params**. Refresh preserves everything. Shareable via URL.
**Applies to:** Every list, search, and filterable surface.
**Acceptance:** All filter state in URL. Refresh preserves state. Shareable links work.

---

#### M-69 · The Optimistic Avatar

**Symptom:** User uploads a new avatar. It shows immediately. 10 seconds later, it reverts because the server rejected it (bad format). No error.
**Cost:** User confused; thinks the avatar feature is broken.
**Fix:** Optimistic image uploads **require visible upload progress + success/failure feedback**. Show the new avatar as a _preview_ (with a "processing" badge) until the server confirms. On failure, revert to old and show error.
**Applies to:** Avatar, cover, portfolio images, post media, course thumbnails.
**Acceptance:** Upload progress visible. Preview state shown until server confirm. Failure reverts.

---

#### M-70 · The Save That Doesn't

**Symptom:** User clicks "Save" on a settings change. Button says "Saved ✓". User comes back tomorrow. The setting is back to default.
**Cost:** Silent data loss; trust collapse.
**Fix:** "Saved" means **server-confirmed**. Never show a success state until the server has acknowledged the write. If the write later fails (rare), retry silently and only surface to the user if retries exhaust.
**Applies to:** Every save action.
**Acceptance:** Success state only after server 200. Retry logic for transient failures.

---

#### M-71 · The Optimistic Follow

**Symptom:** User follows someone. The button flips to "Following". 3 seconds later, it flips back. No explanation.
**Cost:** User doesn't know if they're following; may follow again; confuses the followed person.
**Fix:** Low-stakes optimistic updates (follow, react, bookmark) are OK, **but must show rollback**. A tiny inline "Couldn't follow. Try again." near the button. Never silent rollback.
**Applies to:** Follow, react, bookmark, save, mute, hide.
**Acceptance:** Silent-rollback audit. Every optimistic pattern has visible rollback.

---

### D.9 §UX-MICRO-09 — Motion & Transition

#### M-72 · The Motion Sickness

**Symptom:** User has `prefers-reduced-motion: reduce` set. Page still plays a 400ms slide-in animation.
**Cost:** Accessibility violation; users with vestibular disorders experience nausea.
**Fix:** Honor `prefers-reduced-motion` **everywhere**. Collapse animations to 0ms or a simple opacity fade. Never override user preference.
**Applies to:** Every animation, transition, parallax, auto-play video.
**Acceptance:** Reduced-motion verification on every animated surface. Automated test enforces.

---

#### M-73 · The Slow Fade

**Symptom:** User clicks a tab. Content takes 400ms to fade in. Feels sluggish.
**Cost:** Every interaction feels 400ms slower than it is.
**Fix:** **Motion is ≤150ms** (Dense Profile — not defined in this file, treat as open; compare §12.13 Aura Design System motion tokens). Hover 80ms. Transitions 120–150ms. Never 300ms+ for utility interactions. Motion is for orientation, not decoration.
**Applies to:** Tabs, dropdowns, modals, page transitions, list updates.
**Acceptance:** Motion audit. All utility motion ≤150ms.

---

#### M-74 · The Bouncy Button

**Symptom:** User clicks a button. It bounces. It overshoots. It settles. Adorable. Slow.
**Cost:** Playful ≠ professional. Reads as toys, not tools.
**Fix:** **No bounce, no spring, no overshoot.** Ease-out. Fast in, fast out. Motion conveys causality, not personality.
**Applies to:** Every interactive element.
**Acceptance:** Motion library audit. Zero spring/overshoot on utility transitions.

---

#### M-75 · The Flash of Unstyled Content

**Symptom:** User loads the page. For 200ms, raw HTML with no CSS is visible. Then the stylesheet kicks in.
**Cost:** Perceived as broken/slow; trust damaged.
**Fix:** **Inline critical CSS** in the initial HTML. Load the rest asynchronously. Never let raw HTML flash. Server-render above-the-fold styles (the §12.2 stack is a client-rendered Vite PWA with no server rendering; read as critical styles in the static HTML shell until decided).
**Applies to:** Every page load.
**Acceptance:** Zero FOUC in Lighthouse CI. Critical CSS inlined.

---

#### M-76 · The Jumpy Scroll

**Symptom:** User scrolls a list. New items load. The scroll position jumps up 200px because content was inserted above.
**Cost:** User loses their place; scrolls back down; frustration.
**Fix:** Never insert content **above** the current scroll position without compensating. Infinite scroll appends **below**. If content must be prepended, use scroll anchoring.
**Applies to:** Infinite lists, feeds, message threads, comments.
**Acceptance:** Scroll anchoring verified on every infinite list.

---

#### M-77 · The Silent Transition

**Symptom:** User clicks "Next" in a multi-step form. The form changes. But there's no transition indicator — did it advance? Did it fail?
**Cost:** User hesitates; double-clicks; loses place.
**Fix:** Step transitions use a **subtle directional slide** (80–120ms) to communicate forward vs. backward motion. Progress bar updates. Never a hard cut.
**Applies to:** Multi-step forms, wizards, onboarding, checkout.
**Acceptance:** Directional transitions on every step-based flow.

---

#### M-78 · The Autoplay Ambush

**Symptom:** User opens a course player. Video auto-plays at full volume.
**Cost:** Startles user; often mutes and never unmutes; dark pattern.
**Fix:** Video **never auto-plays with sound**. If autoplay is enabled (course player), it's **muted**. User opts into sound. No exceptions.
**Applies to:** Course player, interview recordings, event streams.
**Acceptance:** Autoplay muted-only. Unmute requires explicit user action.

---

### D.10 §UX-MICRO-10 — Mobile-Specific

#### M-79 · The Tap Target Trap

**Symptom:** User taps a small "×" to close a modal. Misses. Taps again. Misses. Modal stays open.
**Cost:** Mobile usability collapses; users rage-close the app.
**Fix:** **44×44px minimum** for every tappable element on mobile. Use padding, not visual size. Close buttons in particular are often too small.
**Applies to:** Every tap target on every mobile surface.
**Acceptance:** Automated mobile a11y audit. Zero violations.

---

#### M-80 · The Keyboard Cover

**Symptom:** User taps a text input near the bottom of the screen. The keyboard covers the input. They type blind.
**Cost:** Cannot complete the form; abandonment.
**Fix:** Scroll the focused input into view **above the keyboard**. Reserve space with `scroll-padding-bottom`. Never let the keyboard cover the active input.
**Applies to:** Every form on mobile.
**Acceptance:** Keyboard-cover test on iOS Safari + Android Chrome.

---

#### M-81 · The Swipe Back Surprise

**Symptom:** On iOS, user swipes from left edge to go back. Instead of navigating back, they trigger a horizontal carousel or a menu drawer.
**Cost:** Breaks OS expectations; user confusion.
**Fix:** **Never intercept edge-swipe-back** unless the screen is a modal or full-screen sheet. Carousels start after 20px inset. Respect OS gestures.
**Applies to:** Every mobile screen.
**Acceptance:** Edge-swipe-back works on all non-modal screens.

---

#### M-82 · The Slow Tap

**Symptom:** User taps a button. Nothing happens for 300ms. They tap again. Now two actions fire.
**Cost:** Double-actions; incorrect state.
**Fix:** On tap, **immediately** disable the button and show a pressed state. Don't wait for the API. 100ms rule (M-02) applies on mobile too.
**Applies to:** Every tappable action on mobile.
**Acceptance:** Mobile tap test on every action.

---

#### M-83 · The Pull-to-Refresh Fight

**Symptom:** User pulls down to refresh. Instead of refreshing, they scroll up slightly and the page bounces.
**Cost:** Broken muscle memory; frustration.
**Fix:** Implement **pull-to-refresh** on every list surface. Match OS behavior — resistance curve, threshold, spring release.
**Applies to:** Job list, course list, feed, notifications, messages.
**Acceptance:** Pull-to-refresh on every list. Behavior matches native.

---

#### M-84 · The Bottom Sheet Trap

**Symptom:** User opens a bottom sheet. Taps outside to dismiss. Sheet stays. Taps again. Nothing.
**Cost:** User feels trapped; closes the app.
**Fix:** Bottom sheets dismiss on **tap-outside + swipe-down + Esc**. Always. Even if the sheet has unsaved data, prompt before dismiss.
**Applies to:** Every bottom sheet, action sheet, half-modal.
**Acceptance:** Dismiss behavior tested on every sheet.

---

#### M-85 · The Landscape Lobotomy

**Symptom:** User rotates phone to landscape. The layout breaks — elements overlap, buttons vanish, content is cut off.
**Cost:** Unusable in landscape; accessibility issue (users who can only use landscape).
**Fix:** Every screen **works in both orientations**. Or explicitly lock to portrait with a clear reason. Never silently break. WCAG 1.3.4 Orientation (AA, inside the §21.4 gate) allows a lock only where one orientation is essential, which is narrower than "a clear reason" (open, owner decision).
**Applies to:** Every screen (or documented portrait-lock list).
**Acceptance:** Landscape audit on every critical screen.

---

### D.11 §UX-MICRO-11 — Accessibility Micro-Details

#### M-86 · The Invisible Focus Ring

**Symptom:** User tabs through a page. They can't see where focus is. Every element looks the same.
**Cost:** Keyboard users cannot navigate; accessibility failure.
**Fix:** **Visible focus ring on every focusable element** (2px solid, ≥3:1 contrast — WCAG 2.4.7 and 1.4.11 at AA; the 2px size follows 2.4.13, Level AAA). Never `outline: none` without replacement. Never a subtle 1px ring.
**Applies to:** Every focusable element.
**Acceptance:** Focus-visible audit. Contrast measured. Zero missing focus rings.

---

#### M-87 · The Screen Reader Silence

**Symptom:** A toast appears. Screen reader says nothing. Content updates. Screen reader doesn't announce.
**Cost:** SR users miss all dynamic content.
**Fix:** Dynamic updates use `role="status"` (polite) or `role="alert"` (assertive). Toasts, validation errors, and loading completions all announce.
**Applies to:** Toasts, errors, loading completions, dynamic list updates.
**Acceptance:** SR announcement test on every dynamic surface. NVDA + VoiceOver.

---

#### M-88 · The Heading Hierarchy Chaos

**Symptom:** Screen reader user navigates by heading. Page has h1, then h4, then h2. Confusing structure.
**Cost:** SR users cannot build mental model of the page.
**Fix:** **Logical heading hierarchy** on every page. One h1. No skipped levels. Every section has a heading.
**Applies to:** Every page.
**Acceptance:** Heading audit per release. Zero skips.

---

#### M-89 · The Alt Text Void

**Symptom:** SR user lands on a page with 12 images. All say "image". No context.
**Cost:** Critical information inaccessible.
**Fix:** **Descriptive alt text** on every meaningful image. `alt=""` for purely decorative. Never `alt="image"`.
**Applies to:** Every image.
**Acceptance:** Alt-text audit. Zero unlabeled meaningful images.

---

#### M-90 · The Form Label Void

**Symptom:** SR user tabs to an input. It says "edit text". No label. They don't know what to type.
**Cost:** Form unusable via SR.
**Fix:** Every input has a **programmatically associated label** (`<label for>`). Placeholders are not labels. ARIA labels for icon-only inputs.
**Applies to:** Every form input.
**Acceptance:** Label audit. Zero unlabeled inputs.

---

#### M-91 · The Color-Only Cue

**Symptom:** Form error is shown by red border only. Colorblind user cannot see it.
**Cost:** WCAG 1.4.1 violation; form unusable.
**Fix:** Errors use **color + icon + text**. Never color alone. Same for success, warnings, and status indicators.
**Applies to:** Every status indicator, error, validation.
**Acceptance:** Color-only audit. Zero color-only indicators.

---

#### M-92 · The Invisible Loading

**Symptom:** User clicks "Load more". Nothing visible changes. SR user doesn't know content is loading.
**Cost:** User thinks nothing happened; retries; confusion.
**Fix:** Loading states announce via `aria-live` or `aria-busy`. The button changes to "Loading…" with visible state.
**Applies to:** Load-more buttons, infinite scroll, async content.
**Acceptance:** Loading states announced. Verified via NVDA/VoiceOver.

---

#### M-93 · The Skip Nav Absence

**Symptom:** Keyboard user lands on a page with 40 nav items. They have to tab through all of them to reach content.
**Cost:** Keyboard users take 40 tabs to reach main content.
**Fix:** **Skip-to-main-content link** is the first focusable element. Visible on focus.
**Applies to:** Every page.
**Acceptance:** Skip-nav present + working on every page.

---

#### M-94 · The Reduced-Motion Ignore

**Symptom:** User has `prefers-reduced-motion` enabled. Progress bar still animates. Spinner still spins.
**Cost:** Motion-sensitive users feel ill.
**Fix:** Honor reduced-motion **everywhere**. Even spinners get a static "Loading…" text alternative.
**Applies to:** Every animated element.
**Acceptance:** Reduced-motion verification.

---

#### M-95 · The Zoom Blocker

**Symptom:** User pinch-zooms to read text. Page doesn't zoom because `user-scalable=no`.
**Cost:** WCAG 1.4.4 violation.
**Fix:** **Never disable pinch zoom.** Never `user-scalable=no`. Never `maximum-scale=1`. Users have the right to zoom.
**Applies to:** Every page's viewport meta.
**Acceptance:** Viewport audit. Zero zoom-blocked pages.

---

### D.12 §UX-MICRO-12 — Performance Perception

#### M-96 · The Perceived Speed Trick

**Symptom:** User waits for actual data to load. The page feels slow even if it's technically fast.
**Cost:** Perceived speed drives satisfaction more than actual speed.
**Fix:** **Prioritize perceived speed.** Skeleton first, then real content. Primary content above-the-fold loads first. Secondary content streams after. The user perceives the page as fast.
**Applies to:** Every content-heavy page.
**Acceptance:** Perceived-load-time measurement post-launch. Target: perceived <1.5s on 4G.

---

#### M-97 · The Above-the-Fold First

**Symptom:** Page loads all content at once. Above-the-fold is delayed by below-the-fold.
**Cost:** User waits longer for what they see first.
**Fix:** **Above-the-fold content loads first, below-the-fold lazily.** Images below fold use lazy loading. Charts render only when scrolled into view.
**Applies to:** All long pages.
**Acceptance:** LCP <2.5s on mobile. Lazy loading verified.

---

#### M-98 · The Image Optimization Gap

**Symptom:** User loads a page with 20 images. Each is a 4MB PNG.
**Cost:** Slow load; excessive bandwidth; higher bounce.
**Fix:** Images served in **WebP/AVIF** with responsive `srcset`. Lazy-loaded below fold. Compressed. CDN-served. Never serve a 4MB PNG for a 200×200 avatar.
**Applies to:** Every image.
**Acceptance:** Image audit. LCP image <200KB. All images modern format.

---

#### M-99 · The Font Blink

**Symptom:** Page loads. Font flashes from system font to custom font. Text jumps.
**Cost:** Visual jank; perceived as broken.
**Fix:** Use `font-display: swap` and **preload critical fonts**. Subset fonts. Never load 12 weights of a variable font.
**Applies to:** Every custom font.
**Acceptance:** Zero font flash. Font preload verified.

---

#### M-100 · The Bundle Bloat

**Symptom:** User loads the login page. They download 2MB of JavaScript for the entire app.
**Cost:** Slow load; wasted bandwidth; high bounce.
**Fix:** **Route-based code splitting**. Each route loads only its code. Shared code is cached. Never load the whole app on the first page.
**Applies to:** Every route.
**Acceptance:** Route bundles ≤200KB gzipped (§20.10 Forbidden Anti-Patterns; §20.9 Per-Route Budgets allows up to 400KB for some route classes, see the conflict note there). No shared bundle >150KB.

---

## Appendix E — v6.1 Amendments and Reconciliation

**Purpose.** This appendix is the record of the v6.1 reconciliation items V61-01 … V61-31 and of how v6.2 handled each of them. v6.1 recorded, without editing any v6.0 sentence, (a) contradictions inside this file that were verified by re-reading it, (b) decisions that the target blueprint in `Yash_Final_Project_Document/` proposes to change, and (c) standing rules for reading both. In v6.2 (owner decisions of 2026-11-21) the file was renumbered, the contradictions in E.1 were resolved in the body text or recorded there as open owner decisions, the proposals in E.2 were left unratified with a pointer at each affected place, and the rules in E.3 were applied. The column **v6.2 handling** says what was done for each item; the column **Status** keeps the v6.1 assessment. Affected places carry the pointer `> v6.1 amendment: see Appendix E, item V61-nn`. The items were labelled F-01 … F-31 in v6.1; they are renamed V61-01 … V61-31 because the old labels clashed with the feature ids F-01 … F-31. Until the named owner ratifies a Proposed change, the SSOT text stays the founder-intent record.

**Reality line.** Nothing in this file or in this appendix is assumed implemented. Every capability, table, route, job, integration and decision named here is **Planned** unless Part VIII or `docs/reports/FEATURE_STATUS_2026-10-21.md` records executable evidence for it (V61-29).

**Status values.** `Confirmed` means the discrepancy or rule exists as stated, checked by re-reading the cited SSOT text and the cited source. `Proposed` means a target-blueprint decision or recommendation that no Architecture Review Board (ARB) or product owner has ratified; as of 2026-11-21 none is recorded as ratified in `24_RISKS_AND_DECISIONS/ADR_REGISTER.md`. `Confirmed; fix Proposed` means the discrepancy is verified and the stated resolution is a proposal. `Proposed (open)` means the owner decision is still open. `UNVERIFIED` marks anything not checked in the v6.1 pass.

**Evidence paths** are relative to `Yash_Final_Project_Document/` unless they begin with `SSOT.md`; each was checked to exist on this branch on 2026-11-21, except where a row says otherwise. Target documents are designs whose own status is Draft, Under Review or Proposed; overall readiness is "Revision Required" (`99_FINAL_MASTER_BLUEPRINT/IMPLEMENTATION_READINESS.md`). Counts below are the v6.1 re-counts of SSOT.md v6.0 unless marked UNVERIFIED. Entries from `30_PRIOR_IMPLEMENTATION_REFERENCE/` (the K-nn conflict table in `08-ROADMAP-AND-DECISIONS.md`) and `31_LEGACY_ARCHIVE/` are historical records of an earlier attempt, not status.

**Section citations.** Every section citation in this appendix uses the v6.2 numbers. The v6.0 and v6.1 printed numbers are not valid for citation (§25.3); where the v6.1 text cited one, it has been rewritten to the v6.2 number. The "SSOT section" columns name places in the v6.2 file; the "What changes" column describes the v6.0 text as v6.1 found it.

### E.1 Contradictions and gaps inside SSOT v6.0 (verified by re-reading)

| ID     | SSOT section (v6.2 numbering)                                                                                                                                                                                                                           | What changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Why                                                                                                                                                                                                   | Evidence                                                                                                                                                                                                                                                                                                                 | v6.2 handling                                                                                                                                                                                                                             | Status                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| V61-01 | Header block ("Implementation reality", "Status"); §23 intro; closing "CANONICAL END STATE" status line                                                                                                                                                 | Implementation status was stated three ways: the header said counts are "not maintained here", the §23 intro said implementation "started from the greenfield baseline (2026-09-24)", and the closing line printed "16 features implemented, 78 partial, 75 not started (code-checked 2026-10-21)". Read all three as historical. For this branch every capability is **Planned** and the closing counts must not be quoted as status. The cited `docs/reports/FEATURE_STATUS_2026-10-21.md` is not on this branch, and no archived copy exists under `31_LEGACY_ARCHIVE/` either (checked 2026-11-21; the v6.1 text wrongly named one at `31_LEGACY_ARCHIVE/docs/reports/`)                                                                                                             | No source code exists on this branch; "Reality separation" and Appendix C already forbid promoting status from documentation. The prior reference records at least four incompatible maturity tallies | `99_FINAL_MASTER_BLUEPRINT/PROJECT_MASTER_BLUEPRINT.md` (opening paragraph); `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` K-01                                                                                                                                                                        | Resolved in text: header, §23 intro and Canonical End State now state Planned and point to Part VIII for `main` history; report path marked "(not on this branch)"                                                                        | Confirmed                         |
| V61-02 | §23.1 (Phases (0–10)); per-feature "Phase" attributes; Appendix A D-15                                                                                                                                                                                  | SSOT "Ph0–Ph10" are the **SSOT capability phases**. Other phase scales exist: the founder implementation-plan phases 0–10 (different titles for the same numbers), release stages A–F, epic and sprint codes X-nn and S0–S6 (all recorded in the prior reference; source files UNVERIFIED here), and the target roadmap Ph0–Ph4. Always name the scale, never equate numbers across scales, and treat the mapping as a candidate crosswalk. D-15 ("FC-19 'Phase 3' vs 'Phase 6' → Phase 6 governs") cannot be checked because FC-19 is undefined (V61-06)                                                                                                                                                                                                                                | Readers map "Ph1" to different scopes; the target states that phase numbers must not be equated                                                                                                       | `28_TRACEABILITY_AND_COVERAGE/PHASE_GATE_GOVERNANCE_CROSSWALK.md`; `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` §2.3, K-06; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-42, OPEN-50                                                                                                               | Resolved in text: scales named in §23 and §23.1–§23.4, Part VII and §24 tables write "SSOT Phn"; elsewhere an unscaled phase value is read as an SSOT capability phase (§23.1); crosswalk linked; D-15 still unverifiable (FC-19 missing) | Confirmed                         |
| V61-03 | §1.1 Core loop; Amendment B; §2.3 (Flywheels); §23.1 (Ph1 exit); §23.3 (MVP exit 1)                                                                                                                                                                     | Five loop formulations: §1.1 (career goal to update career graph, 12 steps, including Work and Build experience); Amendment B (Goal, Gap, Learn, Practice, Prove, Verify, Discover, Match, Apply, Interview, Outcome, New Evidence); §2.3 career flywheel (learn, prove, showcase, match, apply, hire, grow); Ph1 exit (Learn, Prove, Showcase); MVP exit 1 (enroll, complete course, attempt challenge, earn XP, apply, track). Proposed reading: Amendment B is the GA loop, the §2.3 flywheel is the product loop adopted by the target (ADR-T01), and the others are descriptive views, not competing definitions                                                                                                                                                                    | Different documents gate scope on different loops                                                                                                                                                     | `24_RISKS_AND_DECISIONS/ADR_REGISTER.md` ADR-T01; `99_FINAL_MASTER_BLUEPRINT/PROJECT_MASTER_BLUEPRINT.md` §1                                                                                                                                                                                                             | Resolved in text: Amendment B is the canonical GA loop; §1.1, §2.3, Ph1 exit and MVP exit named as views or subsets; flywheel-as-product-loop (ADR-T01) stays Proposed                                                                    | Confirmed; reading Proposed       |
| V61-04 | §8 (S-07, S-08); §9.2 F-85, F-86, F-114, F-122; §9.4 F-75, F-87, F-98, F-152, F-153; §10 (§10.25 BR-135; §10.29 BR-158, BR-160; §10.32 BR-178, BR-180; §10.34 BR-189; §10.35 BR-207; §10.37 BR-220); §15.7 (HDN-026); §24.5 (OD-38, OD-52); Amendment G | Cohort and small-cell minimums take five different values: k≥3 (F-87, BR-180), k≥5 (S-07, S-08, F-75, F-98, BR-135, and F-86 step 2, which cites BR-178), k≥10 (F-86 acceptance, F-122, BR-158, BR-178, BR-207, BR-220, HDN-026, OD-38, OD-52), ≥20 (F-85, BR-160, F-152) and ≥30 (F-114, F-153, BR-189). BR-178 itself says "policy-defined minimum cohort; k≥10 default", so F-86 step 2 ("k ≥5 threshold per cell (BR-178)") contradicts its own cited rule. Treat every value as a setting of one policy parameter (Amendment G), not an architectural constant. Proposed: k≥10 stays the default for public and sensitive cells, as the rules that already use policy wording (BR-158, BR-178, HDN-026, OD-38, OD-52) say; lower values need an explicit owner and counsel decision | Amendment G says thresholds are policy configuration; no single value is authoritative. The target rule BR-T100 carries a {5} placeholder and the minimum k is open under OPEN-25                     | `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-25; `06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md` BR-T100; `20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md` P2; `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` K-08                                                                               | Resolved in text: one parameter `min_cohort_k` (default k ≥ 10) in Amendment G and BR-178; F-86 step 2 fixed; ≥20 and ≥30 kept as feature overrides; owner and counsel decision open for the k ≥ 3 and k ≥ 5 overrides                    | Confirmed; default Proposed       |
| V61-05 | §5.4 (Two-Tier Authorization); §5.8 (Master Permission Matrix); §9.1 F-01 "Actors"                                                                                                                                                                      | Three role vocabularies coexist: Tier 1 JWT roles (3), Tier 2 contextual roles (24 by count), and a permission matrix with only 10 role columns and 12 course and social capabilities (neither Candidate nor Recruiter is a column). F-01 lists a further actor set (Anonymous visitor, Candidate, Recruiter, Admin, Institution Admin). The target proposes 15 roles as scoped, deny-by-default grants with server-side policy and a capabilities endpoint; the mapping from the 3+24 model is unapproved. Read the §5.8 matrix as illustrative for its listed capabilities only, and derive authorization from the scoped-grant model once OPEN-44 closes                                                                                                                              | The "highest wins" resolution in §5.4 is not a deny-by-default policy, and the matrix cannot answer candidate or recruiter permissions                                                                | `02_STAKEHOLDERS_AND_USERS/STAKEHOLDERS_ROLES_PERMISSIONS.md`; `02_STAKEHOLDERS_AND_USERS/STAKEHOLDERS_ROLES_PERMISSIONS.md#record-permission-matrix-rev2`; `24_RISKS_AND_DECISIONS/ADR_REGISTER.md` ADR-T07; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-44                                                         | Resolved in text: deny-by-default stated and "highest wins" limited to granted roles (§5.4); §5.8 matrix marked illustrative; F-01 actors use the Tier 1/Tier 2 vocabulary; scoped-grant model Proposed (OPEN-44)                         | Confirmed; model Proposed         |
| V61-06 | §24.8.1 (Locked Register Inventory); §24.1 (Resolved Gaps); Appendix A D-15, D-22; §3.1, §3.2; OD-07, OD-31 (§24.5)                                                                                                                                     | Identifiers cited but not defined anywhere in this file: FC ids up to FC-19 (FC-05 is not cited), TD-01..TD-06 and MVD-01 (23 of the 30 rows of §24.1 cite an FC, TD or MVD id; D-15, D-22 and OD-07 cite FC ids; TD-05 is also cited in F-08 and F-88) and SCOPE-003 (OD-31). The families P-, U-, INV-, SCOPE-, FC-, TD-, VER-, NFR-, FEC-, EC-, R- and EVT- have no table rows; §3.1 lists 12 principles and §3.2 lists 15 unnumbered invariants where §24.8.1 counts P 11 and INV 16. FC-20..FC-23 and TD-07..TD-26 are counted but never cited. Treat the values behind any FC, TD or MVD id as **Unknown**. A GAP row marked "RESOLVED (FC-nn)" is unresolved until the decision text is recovered or re-decided. Do not mint new FC or TD ids                                     | A decision that cannot be read is not a decision; closing a gap by reference to missing text hides open scope                                                                                         | `28_TRACEABILITY_AND_COVERAGE/SSOT_RECONCILIATION_AUDIT.md` ("Conflicting counts"); `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` K-22; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-50                                                                                                             | Recorded in text; decision text still missing: FC, TD, MVD and SCOPE-003 citations marked "treat as open", 23 §24.1 GAP rows recorded as open; no ids minted; P/INV count mismatch unchanged                                              | Confirmed                         |
| V61-07 | §15.9.1 (GDPR Matrix, Art. 17); §15.9.4 (FERPA Severance Pattern); §15.9.5 (DSR Queue); §9.1 F-01 state diagram; F-96 edge cases; §24.7 (DOR-017)                                                                                                       | "Account deletion with 30-day grace + anonymization" (§15.9.1), "erasure (30d)" as the DSR deadline (§15.9.5), "DEACTIVATED → DELETED: 30-day purge" and "SUSPENDED → DELETED: purge after 30d" (F-01), "credentials anonymized" (F-96) and "never hard-delete rows referenced by aggregates" (§15.9.4) use "30 days" for different clocks and mix anonymization with deletion. DOR-017 (retention and erasure SLAs) is an open pre-production blocker. Read three clocks separately: cancel window, completion deadline, deactivation purge. Target proposal: a 7-day cancellable cooling-off, completion within 30 days of the request (BR-T060), legally retained records excepted (retention list OPEN-08). Any 30-day cancel window needs an explicit owner decision                | An implementer cannot tell whether the user may cancel for 7 or 30 days, or whether data is deleted or anonymized                                                                                     | `06_BUSINESS_PROCESSES/STATE_MACHINES.md` SM-ACCOUNT t7-t9, SM-DSR; `00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md` BR-T060; `14_SECURITY_PRIVACY_COMPLIANCE/PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md`; `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` K-07; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-08 | Recorded in text; owner decision open: three clocks named in Amendment G, F-01, F-96, §15.9.1, §15.9.5 and DOR-017; cancel-window vs completion-deadline conflict open (DOR-017)                                                          | Confirmed; fix Proposed           |
| V61-08 | §9.1 F-01 (step 1, External Dependencies); §12.6 (System Context); §13.3 (Integration Register); §24.5 (OD-10); §24.1 (GAP-010)                                                                                                                         | Transactional email names three different provider sets: Resend (F-01, §12.6), "Resend / Postmark" (§13.3) and "Resend primary; SendGrid failover" (OD-10). GAP-010 closes the choice through FC-11, which is undefined (V61-06). Read vendor names as examples; the contract is "transactional email behind a provider port". The target proposes Brevo as the default behind a provider-independent port and leaves the wider email stack open                                                                                                                                                                                                                                                                                                                                         | Vendor choice is an architecture and configuration decision (§24.8.2 C5, C6) and the SSOT has no readable decision text                                                                               | `24_RISKS_AND_DECISIONS/ADR_REGISTER.md` ADR-T20; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-26; `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` K-04                                                                                                                                               | Resolved in text: "transactional email provider behind a provider port" in F-01, §12.6, §13.3, OD-10 and GAP-010; vendors kept as examples; Brevo default Proposed                                                                        | Confirmed; Brevo default Proposed |
| V61-09 | §9.4 F-16 (plans Free, Pro, Team, Enterprise; no prices); §10.24 (BR-130); §16.3, §16.4; §24.5 (OD-07, OD-28, OD-29, OD-34); §24.1 (GAP-007, GAP-014, GAP-017)                                                                                          | This file fixes **no price and no numeric AI quota**. Numbers it does carry: outreach caps of 20 (Pro) and 50 (Team) per week (BR-130), a 70/30 default revenue share (OD-28) and a 30-day refund window pro-rated after 20% (OD-29). AI quota, free-tier course limits and enterprise billing are closed by reference to FC-03, FC-04 and FC-08 (undefined, V61-06), and the OD-34 price is "TBD". Prior-implementation text prints conflicting free-AI-quota and Candidate Pro price figures (UNVERIFIED here: those source documents are not on this branch). Treat every price, quota, allowance and cap as undecided. The only binding AI-cost rule is §16.4 and Amendment C: no paid inference for a free user without an explicit active cost policy                              | Numeric commercial parameters need Finance and product input and cost evidence; the target keeps them open                                                                                            | `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-05, OPEN-19, OPEN-24; `06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md` BR-T081, BR-T095; `00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md` INV-T07; `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` K-12                                                     | Resolved in text: "no price, AI quota, allowance or cap decided" stated at Amendment C, F-16, F-07, F-92, BR-130, §16.4, OD-07 and §24.1; stated numbers kept                                                                             | Confirmed; fix Proposed           |
| V61-10 | §24.8.1 (Locked Register Inventory); §24.8.3; Appendix B; §10.2 (Complete Journey Register); §10.9 (State Machine Index); §14.5 (Operational Clusters)                                                                                                  | Re-counted in v6.0: BR 248 distinct ids plus 8 MIG (matches §24.8.1; Appendix B says "BR 90 → 246"); J 28 (matches §24.8.1; Appendix B says "J 17 → 31"); the OD table has 53 rows (§24.8.1 says 58); the §10.9 state-machine index has 45 rows (§24.8.1 says 53; target audits cite 40, not reproduced); EVT is "72 locked + 20 proposed" in §24.8.1 but "72 (32 locked + 40 proposed)" in Appendix B; operational tables: the §14.5 heading says "~185", the cluster counts listed sum to 168, §24.8.1 says "~220" and §14.5 closes with "Effective schema ≈ 220" (D-30: 50+2 canonical, plus 168). Do not edit §24.8.1: §24.8.3 locks register counts (a C3 change). Quote the measured counts here when they matter                                                                  | Counts in different places disagree, and one number must not be copied into plans or tests without checking                                                                                           | `28_TRACEABILITY_AND_COVERAGE/SSOT_RECONCILIATION_AUDIT.md` ("Conflicting counts"); `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` K-22                                                                                                                                                                 | Resolved in text: §24.8.1 unchanged; measured counts quoted beside stated ones in §10.1–§10.13, §14.5, §15.7, §24.5, Appendix A D-19 and Appendix B                                                                                       | Confirmed                         |
| V61-11 | §10.9 (Complete State Machine Index); §10.10 (Canonical State Machines); §10.11; §9.1 F-01 state diagram                                                                                                                                                | State naming differs inside the file. The Application row of §10.9 lists terminal states hired, rejected, withdrawn, stale_withdrawn and candidate_unresponsive, but the §10.10 diagram ends in hired, rejected, withdrawn and archived (no stale_withdrawn, no candidate_unresponsive). §10.9 treats Offer as its own machine (terminals hired, closed) while §10.10 makes `offer` a state of Application. F-01 wrote account states in UPPERCASE (first state `UNVERIFIED`, last `TERMINATED`) while §10.10 uses lower-case snake_case. Read the §10.9–§10.11 names as intent-level; the machine-readable vocabulary is V61-18                                                                                                                                                         | Enums and tests cannot be generated from two spellings                                                                                                                                                | `06_BUSINESS_PROCESSES/STATE_MACHINES.md` (Vocabulary authority); `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-45                                                                                                                                                                                                     | Spelling resolved in text (lower `snake_case` everywhere); owner decision open: differing terminal sets noted at §10.9, §10.10 and feature diagrams, none chosen (OPEN-45)                                                                | Confirmed                         |
| V61-12 | Heading structure (whole file)                                                                                                                                                                                                                          | In v6.0 and v6.1 printed numbers were not unique. Sub-numbers 6.1–6.3 occurred under two parents (now §5.4–§5.6 and §6.1–§6.3), as did 7.1–7.2 (now §5.8–§5.9 and §7.1–§7.2) and 16.1–16.3 (now §10.2–§10.4 and §16.1–§16.3); the three feature-tier blocks (now §9.2–§9.4) reused the numbers of the API, Data and Security sections (§13–§15). Sub-numbers such as 20.x–38.x came from earlier editions and sat under different parents (for example, the old 38.1 is now §23.1). v6.1 made no renumbering, to keep stable references, and cited by heading text plus printed number                                                                                                                                                                                                   | Stable citations are needed for traceability (SSOT §25) and for the target crosswalks                                                                                                                 | SSOT.md heading outline (`grep '^#'`)                                                                                                                                                                                                                                                                                    | Superseded: owner decision 2026-11-21 to renumber cleanly, recorded in §25.3; every internal citation rewritten; register ids unchanged                                                                                                   | Confirmed                         |

### E.2 Decisions the target blueprint changes (all pending ratification)

| ID     | SSOT section (v6.2 numbering)                                                                                                                         | What changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Why                                                                                                                                               | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                              | v6.2 handling                                                                                                                                       | Status          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| V61-13 | §9.1 F-01 (steps 3, 5, 6); §12.8 (Authentication Flow); §12.12 (SSOT ADR-001)                                                                         | SSOT: Supabase Auth issues the JWT (1 h access, 30-day sliding refresh), the session cookie is `sb-access-token` (HttpOnly, Secure, SameSite=Lax) and logout uses a `jti` denylist. Target: first-party cookie sessions through same-origin `/api/v1/auth/*` with `__Host-ts_at`, `__Secure-ts_rt` (Path `/api/v1/auth/refresh`) and an `X-CSRF-Token` header; 15-minute access token; rotating refresh with reuse detection (reuse revokes the token family); refresh idle {14 d} and absolute {30 d} as proposed constants; passkeys and password; optional OIDC and SAML; remotes never read tokens. No browser-readable (localStorage) bearer token is permitted. SSOT never specified one (its only localStorage use is draft autosave, F-04 step 4 and M-24), but the earlier implementation attempt used one. Browser behaviour is not yet tested                                                                                                                                                                                                                                                                                                                                                                              | Removes XSS-readable tokens and keeps credentials away from remotes                                                                               | `24_RISKS_AND_DECISIONS/ADR_REGISTER.md` ADR-T06; `06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md#record-business-rules-registry-rev2` CONST-S01..S03; `00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md` INV-T16, BR-T050; `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` K-19                                                                                                                                           | Proposed — not ratified; pointer at §5.4, F-01, §12.8, §12.12                                                                                       | Proposed        |
| V61-14 | Amendments A.1, A.3; §9.1 F-01; §12.12 (SSOT ADR-001, ADR-009); §12.18 (API Architecture); §22.4 (Backup & DR)                                        | SSOT names Supabase for identity, queues, edge functions and backups. Target: plain PostgreSQL as the single system of record behind the API; a transactional outbox plus a worker with fenced leases instead of Supabase Queues and Edge Functions; nothing depends on Supabase Auth or PostgREST; the managed-Postgres vendor and hosting option are undecided. Read Supabase as one candidate host. Consistent and unchanged: API authority (A.2) and TanStack Query (A.6)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Reduces vendor lock-in and removes the duplicate-job risk of unfenced leases                                                                      | `24_RISKS_AND_DECISIONS/ADR_REGISTER.md` ADR-T04, ADR-T05, ADR-T09; `12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md` (opening paragraph); `17_DEVOPS_AND_INFRASTRUCTURE/DEPLOYMENT_ARCHITECTURE.md`; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-14                                                                                                                                                                                      | Proposed — not ratified; pointer at Amendment A, §5.4, F-01, F-12, §12.2, §12.6, §12.8, §12.12, §12.16, §12.18, §13.3, §13.5, §15.9.3, §22.4, §23.1 | Proposed        |
| V61-15 | Amendment A.1; §12.16 (Repository Layout); §12.12 (SSOT ADR-012)                                                                                      | This file never mentions module federation (a case-insensitive search finds no occurrence). Target: typed host and module contracts with bundled, lazily loaded modules (`MF_MODE=bundled`) as the initial baseline. Runtime federation is optional and may be activated only after the ARB ratifies ADR-T23, with at least three named independent frontend teams, a demonstrated independent-release need and a passing WP-FED-SPIKE. Federation is fault containment, not a security boundary (ADR-T19). Eight remotes are proposed if activated; `ID_REGISTRY` is not yet updated. Do not read federation into the SSOT                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Staffing and release evidence does not yet justify the registry, signing and compatibility cost                                                   | `24_RISKS_AND_DECISIONS/ADR_REGISTER.md` ADR-T03, ADR-T19, ADR-T23; `27_INDEPENDENT_REVIEWS/REVIEW_RESOLUTION_DECISIONS.md` REVW-07, REVW-08; `09_MODULE_FEDERATION/FEDERATION_REVIEW_FIXES.md`; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-03, OPEN-11, OPEN-47                                                                                                                                                                 | Proposed — not ratified; pointer at Amendment A, §12.2, §12.12, §12.16                                                                              | Proposed        |
| V61-16 | §6 (Consent row); §9.2 F-85, F-86, F-92; §15.2 (Privacy by purpose); Amendment G                                                                      | SSOT defines consent only as "purpose-bound, versioned permission" and states consent per feature; it has no scope catalogue. Several features set 24-hour windows (F-92 "Candidate consent revocation <24h"; F-85 opt-out and F-86 withdrawal "within 24h"). Target: one catalogue of 14 dotted scope ids (for example `search.discoverable`, `evidence.share_artefact`, `application.share_snapshot`, `ai.assist.process`), an append-only consent ledger with a grain model and optional expiry, legacy `CS-*` ids and `evidence.share_recruiter` retired, and revocation enforced at the first read after the revoking commit with no consent cache. The target is stricter than the SSOT windows                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | One shared vocabulary lets the database, API, policy and tests agree (lint FF-12)                                                                 | `00_CONTROL_CENTRE/CONSENT_SCOPE_CATALOGUE.md` §§1–4, 8; `00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md` INV-T15, FF-12; `06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md#record-business-rules-registry-rev2` CONST-S13                                                                                                                                                                                                                 | Proposed — not ratified; pointer at §6, F-85, F-86, F-92, §15.2                                                                                     | Proposed        |
| V61-17 | §6.1 (Evidence semantics); §9.1 F-96 (evidence types, step 6); §10.28 (BR-149..BR-156); §9.4 F-94 (pointer added in v6.2; company-email verification) | SSOT: evidence carries a "verification level" that is never defined; F-96 shows one "Verified by TalentSphere" badge per skill with at least one credential, lists Instructor, Peer and Recruiter as verifiers and weights endorsements. Target: a four-rung ladder (claimed, artifact-backed, peer-attested, authority-verified); verified status only through a server-side transition (INV-T04); the `authority_verified` rung carries a mandatory `issuer_class` (platform, institution, employer_org, instructor) that the UI shows and matching weights differently; instructor attestations need instructor ≠ learner plus independence checks and are revocable; instructor sign-off never counts as platform-verified; employer-domain proof reaches artifact-backed only when the domain is bound to a verified employer organization                                                                                                                                                                                                                                                                                                                                                                                       | A single "verified" flag lets an instructor mint the top rung for a learner; the ladder keeps SSOT principle §3.1 "Verified over claimed" honest  | `24_RISKS_AND_DECISIONS/ADR_REGISTER.md` ADR-T14; `27_INDEPENDENT_REVIEWS/REVIEW_RESOLUTION_DECISIONS.md` REVW-12, REVW-22; `06_BUSINESS_PROCESSES/STATE_MACHINES.md#record-state-machines-rev2` §§2.2–2.3; `00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md` INV-T04. ADR-T14a is not yet in the ADR register, and the original BR-T011 and DT-06 still carry the pre-fix text (`27_INDEPENDENT_REVIEWS/SECOND_REVIEW_REPORT.md` REVW2-03) | Proposed — not ratified; pointer at §6.1, F-96, F-94                                                                                                | Proposed        |
| V61-18 | §10.9, §10.10, §10.11; §9.1 F-01 state diagram; Appendix A D-2                                                                                        | One state vocabulary: SM-00 is the only place a state name is defined, and database CHECKs, OpenAPI and AsyncAPI enums and UI status labels derive from it; an enum-vs-SM lint (FF-11) fails on any difference. SM-00 v1.1 is the text of record and the REV2 amendments are Proposed. Known renames from the SSOT diagrams: Application `under_review` → `in_review`, `interview` → `interviewing`, `offer` → `offer_extended` (plus new `offer_declined`; `assessment`, `archived`, `stale_withdrawn` and `candidate_unresponsive` have no SM-APPLICATION state and their disposition is open under OPEN-45); Job `pending_approval` → `pending_review`, while `approved`, `rejected_by_moderation` and `archived` are not states (the target adds `taken_down` and treats `expired` as a close reason); Account: the F-01 states (UPPERCASE in v6.0) are replaced by `pending_verification`, `active`, `suspended`, `deactivated`, `pending_erasure`, `erased` and `purged`; `terminated` has no counterpart and lockout is a timestamp, not a state. §10.11 "No state may be skipped" differs from SM-APPLICATION t11, which allows two named forward skips. Job default expiry: D-2 says 60 days, SM-JOB t8 shows 45 days [OPEN] | The same state must not be spelled differently across database, API, UI and events                                                                | `06_BUSINESS_PROCESSES/STATE_MACHINES.md` (Vocabulary authority, SM-ACCOUNT, SM-JOB, SM-APPLICATION); `06_BUSINESS_PROCESSES/STATE_MACHINES.md#record-state-machines-rev2`; `00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md` FF-11; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-45                                                                                                                                                     | Proposed — not ratified; pointer at §5.7, F-01, F-04, F-06, §10.9, §10.10 (Application, Job), §10.11, §10.15 (BR-11), Appendix A                    | Proposed        |
| V61-19 | §15.9.1 (Art. 17 row); §15.9.4 (FERPA Severance Pattern); §15.9.5 (DSR Queue); §9.1 F-96 edge cases                                                   | Target erasure design: a person appears in append-only history (audit, consent, evidence events, stage transitions, outbox) only as a random 128-bit opaque `subject_ref`. `subject_identity_map` is the single link to the account and erasure deletes that row, so tamper-evident history is never rewritten or pseudonymised by UPDATE. Mutable records are hard-deleted or tombstoned, backups age out, and a post-erasure sweep checks for residual identifiers. This replaces the SSOT idea of anonymizing rows in place ("hash student id", `status='severed'` (`'SEVERED'` in v6.0) in §15.9.4; "credentials anonymized" in F-96). The graduation (FERPA) severance remains a distinct disposition to preserve                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Resolves the conflict between append-only audit and erasure. Whether skeleton records count as anonymous data is a legal question that stays open | `12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md` §4.1; `14_SECURITY_PRIVACY_COMPLIANCE/PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md`; `27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md` REVW-04; `28_TRACEABILITY_AND_COVERAGE/SSOT_RECONCILIATION_AUDIT.md`; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-08                                                                                                                                       | Proposed — not ratified; pointer at F-96, §15.9.1, §15.9.4                                                                                          | Proposed        |
| V61-20 | §23.1 (Ph1 and Ph2 rows); §23.3 (MVP Exit Criteria); §9.2 F-07, F-08 (Ph1), F-04 (Ph2); §9.4 F-94                                                     | SSOT Ph1 is Candidate Core: profile, resume, portfolio, courses, challenge arena, XP and levels, Skills Graph foundation, Migration Center v1; jobs and applications and F-96 come in Ph2; verified work history and references (F-94) in Ph3. Target proposal for **target Ph1**: the loop **Prove → Showcase → Apply** with search-based (non-AI) matching and explanation, covering identity, profile, evidence with referee verification, jobs, applications, basic application messaging, email notifications, consent and an audited entitlement stub. Moved to target Ph2: AI gateway features, learning depth, assessments beyond unverified attempts and billing checkout. The roadmap labels target Ph1 a bounded pre-GA pilot and gates the full SSOT loop at target Ph2 (GA gate). Contested: `ROADMAP_REV2` and `CAPABILITY_MAP_PHASE_RECONCILIATION_REV2` keep first-party learning and practice in target Ph1 (85 Ph1 features), so Ph1 scope has three descriptions until OPEN-42 closes                                                                                                                                                                                                                              | Brings employer-visible value earlier and defers cost-heavy AI                                                                                    | `27_INDEPENDENT_REVIEWS/REVIEW_RESOLUTION_DECISIONS.md` REVW-10; `22_IMPLEMENTATION_ROADMAP/ROADMAP.md#record-roadmap-rev2`; `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md#record-capability-map-phase-reconciliation-rev2`; `27_INDEPENDENT_REVIEWS/SECOND_REVIEW_REPORT.md` REVW2-30; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-42                                                                         | Proposed — not ratified; pointer at F-04, F-07, F-08, F-94, §23.1, §23.3                                                                            | Proposed        |
| V61-21 | §23.1 (Ph1 and Ph7 rows); §9.2 F-07; §10.22 (Learning Marketplace Rules BR-091..BR-115); §24.5 (OD-28); Appendix A D-33                               | SSOT puts the LMS in Ph1 and the full learning marketplace (Course Studio, course commerce, instructor platform, revenue share) in Ph7. Target proposal: learning commerce in target Ph2 covers **first-party (platform-sold) courses only**. A third-party paid marketplace is deferred to target Ph3 at the earliest and needs its own ADR on seller of record, payouts, tax or VAT, and refunds (number ADR-T25 proposed). The SSOT Ph7 marketplace scope is not cancelled, only gated                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Money-flow, payout, tax and refund liabilities have no design or cost evidence yet                                                                | `27_INDEPENDENT_REVIEWS/REVIEW_RESOLUTION_DECISIONS.md` REVW-30; `22_IMPLEMENTATION_ROADMAP/ROADMAP.md#record-roadmap-rev2` (R5, §3.3); `19_BUSINESS_AND_COMMERCIAL_OPERATIONS/MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL.md`; `24_RISKS_AND_DECISIONS/ADR_REGISTER.md#record-governance-registrations-rev2`; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-06                                                                             | Proposed — not ratified; pointer at F-07, §23.1, Appendix A                                                                                         | Proposed        |
| V61-22 | §17.1 (AI modes); §9.2 F-08; §9.1 F-96 (`challenge_pass`)                                                                                             | SSOT defines four AI modes (`AI_PROHIBITED`, `AI_RESTRICTED`, `AI_ALLOWED`, `POST_ASSESSMENT_ONLY`). Target documents currently carry two (feature spec) or three (data model) and enforce `AI_PROHIBITED` in the AI gateway regardless of caller; the lifecycle contract must be aligned before assessment AI is claimed (OPEN-48). Code-execution assessments run only in an isolated, network-less runner; until it exists, submissions stay `unverified` and never mint verified evidence, so a `challenge_pass` credential with a "verified score" (F-96, F-08) cannot be issued as verified before the runner decision (OPEN-27)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Prevents a simulated score from becoming verified evidence                                                                                        | `24_RISKS_AND_DECISIONS/ADR_REGISTER.md` ADR-T12, ADR-T13; `28_TRACEABILITY_AND_COVERAGE/SSOT_RECONCILIATION_AUDIT.md` ("Security, privacy, and AI controls"); `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-27, OPEN-48                                                                                                                                                                                                            | Proposed — not ratified; pointer at F-08, F-96, §17                                                                                                 | Proposed        |
| V61-23 | §10.16 (BR-15); Appendix A D-3                                                                                                                        | SSOT: no duplicate ACTIVE application per user per job, with a partial UNIQUE index and a 90-day cooldown after a terminal state. Target: one active application per candidate and job (BR-T001); only after `withdrawn` may the candidate re-apply as a new linked application (`reapplied_from`) after a cooldown, placeholder {24 h} [OPEN] (BR-T125, SM-APPLICATION t12); `rejected`, `hired` and `offer_declined` never qualify; a recruiter-invited reconsideration uses `reconsidered_from`. The 90-day SSOT value conflicts until the product owner chooses                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Re-application after withdrawal was an unresolved gap (OPEN-B20, closed on paper only)                                                            | `06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md#record-business-rules-registry-rev2` BR-T125, CONST-S14; `06_BUSINESS_PROCESSES/STATE_MACHINES.md#record-state-machines-rev2` §2.5; `27_INDEPENDENT_REVIEWS/REVIEW_RESOLUTION_DECISIONS.md` REVW-27                                                                                                                                                                                 | Proposed — not ratified; pointer at F-04, §10.16, Appendix A; 90-day value stands until the owner decides                                           | Proposed        |
| V61-24 | §9.1 F-01 (step 1, acceptance criteria "Age gate blocks <16", AUTH-017)                                                                               | SSOT fixes the age gate at date of birth ≥16. Target: the minimum-age value is open for counsel; prefer an attestation (checkbox, timestamp, policy version) and collect a date of birth only if counsel requires it (BR-T120). Treat 16 as a provisional value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Minimum age is a legal parameter that varies by jurisdiction and is not yet reviewed                                                              | `06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md#record-business-rules-registry-rev2` BR-T120; `27_INDEPENDENT_REVIEWS/REVIEW_FIX_STATUS.md` row 29; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-08                                                                                                                                                                                                                              | Proposed — not ratified; pointer at F-01                                                                                                            | Proposed        |
| V61-25 | §12.18 (API Architecture); §12.19 (Response Envelope)                                                                                                 | SSOT: success envelope `{success,data,meta}`, cursor pagination with default limit 20, deprecation lifecycle of at least 6 months. Target standard: list responses `{items,page}` with default limit 25 (maximum 100) and a minimum 90-day deprecation window; errors as RFC 9457 problem+json, which can coexist with either success shape. Neither is adopted until OPEN-46 closes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Installed PWAs update lazily, so the target argues for its own window; the SSOT value is the founder baseline                                     | `13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md` (opening reconciliation note, pagination and deprecation rows); `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-46                                                                                                                                                                                                                                                           | Proposed — not ratified; pointer at §12.18, §12.19, §12.20 (CON-003)                                                                                | Proposed (open) |
| V61-26 | §15.8 (Vulnerability SLAs); §20.9 (Per-Route Budgets); §22.3, §22.4, §22.5; §13.4 (VER-021)                                                           | SSOT: critical <24 h mitigation plus 72 h patch, high <72 h or 7 d with a blocking control, medium <14 d; route JS budgets of 120–400 KB (search ≤200 KB); rollout 5/25/50 % with automated rollback within 15 s; PostgreSQL RPO ≤15 min and RTO ≤2 h with quarterly drills; an integration-removal drill for every integration-touching release. Target hypotheses: critical 72 h, high 14 d, medium 60 d; PITR RPO ≤5 min and RTO ≤1 h to a verified restored copy; list and search latency of 350/400 ms, route bundles of 220–400 KB (from `SSOT_RECONCILIATION_AUDIT.md`; the target frontend document instead proposes, as hypotheses, a shell of at most 150 KB gzip, entry-route JS of at most 60 KB gzip and lazy heavy chunks of at most 250 KB each), a statistical canary and semiannual game days (the latency, bundle, canary and game-day values are taken from the audit and are UNVERIFIED against the SLO documents). Both sets are kept; neither replaces the other until measured and chosen. Do not report both as one target                                                                                                                                                                                    | Targets differ by evidence and design phase                                                                                                       | `28_TRACEABILITY_AND_COVERAGE/SSOT_RECONCILIATION_AUDIT.md` ("Security, privacy, and AI controls", "Reliability, release, and service operations"); `14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_ARCHITECTURE.md`; `15_RELIABILITY_AND_PERFORMANCE/SLO_AND_PERFORMANCE_TARGETS.md` SLO-31; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-49                                                                                             | Proposed — not ratified; pointer at §13.4, §15.8, §20.7 (covers §20.9), §22.3, §22.4                                                                | Proposed (open) |
| V61-27 | §15.9.3 (Data Residency); §22.4 (Backup & DR)                                                                                                         | SSOT fixes primary residency at US-East with an EU partition as a Ph3 target and EU-only AI egress. The target treats the region, the managed-Postgres vendor and the DR scope as undecided, and wants the graduation (FERPA) severance kept as a separate disposition. The v6.0 value stays as founder intent; the target does not adopt it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Region depends on hosting (OPEN-14), counsel (OPEN-08) and customer needs (OPEN-30)                                                               | `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-14, OPEN-23, OPEN-30; `28_TRACEABILITY_AND_COVERAGE/SSOT_RECONCILIATION_AUDIT.md`                                                                                                                                                                                                                                                                                                     | Proposed — not ratified; pointer at F-12, §15.9.3, §15.9.4, §22.4                                                                                   | Proposed (open) |
| V61-28 | §2.4 (Success metrics)                                                                                                                                | SSOT names the primary outcome as "career progress with verifiable evidence". The target metrics catalog proposes "Evidence-Backed Hiring Conversations" as the north star. Select one, or define an owner-approved hierarchy, before baselining or making success claims                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | A single primary metric is needed before outcome claims                                                                                           | `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` OPEN-51; `20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md`; `28_TRACEABILITY_AND_COVERAGE/SSOT_RECONCILIATION_AUDIT.md`                                                                                                                                                                                                                                                                    | Proposed — not ratified; pointer at §2.4                                                                                                            | Proposed (open) |

### E.3 Standing rules

| ID     | SSOT section (v6.2 numbering)                                                         | What changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Why                                                                                                                                                                                                            | Evidence                                                                                                                                                                                                         | v6.2 handling                                                                                                                                                                            | Status    |
| ------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| V61-29 | Header "Reality separation"; Amendment H; Appendix C; §23 intro                       | Every capability, table, route, job, integration, state machine, scope id and decision in SSOT.md, in `Yash_Final_Project_Document/` and in the archived references stays labelled **Planned** until executable evidence exists in this repository for the branch being described (code, passing tests, migrations, served behaviour). Documentation labels (Draft, Under Review, Proposed, Ratified) never imply implementation. Counts in `30_PRIOR_IMPLEMENTATION_REFERENCE/` and `31_LEGACY_ARCHIVE/` are history, not status. Closing a documentation contradiction is not evidence that a generator, test or runtime behaviour exists                       | Prevents the DOCUMENTED ≠ IMPLEMENTED confusion behind V61-01                                                                                                                                                  | `99_FINAL_MASTER_BLUEPRINT/IMPLEMENTATION_READINESS.md`; `99_FINAL_MASTER_BLUEPRINT/PROJECT_MASTER_BLUEPRINT.md` §11                                                                                             | Standing rule, applied: header, Amendment H, §23 intro and Canonical End State say Planned; Appendix C carries the pointer (its zero-trust list already forbids assuming implementation) | Confirmed |
| V61-30 | §7 (F-\* register); §10 (BR-\*); §12.12 (SSOT ADR-001..ADR-013); §24.5 (OD-\*); §24.8 | Identity namespaces coexist and are not interchangeable: SSOT `F-*` (173), `BR-*` (248 + 8 MIG), `ADR-001..013` and `OD-*` against target `CAP-*` (108), `FEAT-*` (253), `BR-T*`, `INV-T*`, `ADR-T*`, `SM-*`, `OPEN-*` and `REVW-*`. The crosswalks are candidate maps awaiting owner approval (OPEN-41, 43, 45, 46, 50) and their row counts are not coverage. SSOT register rows are never renumbered or deleted (§24.8.3). Cite "SSOT ADR-001" and "ADR-T06" explicitly: the SSOT's ADR-001 ("Supabase Auth is the initial identity/session authority") is a different decision from the target's ADR-T06                                                      | Prevents silent loss or double counting of source requirements                                                                                                                                                 | `28_TRACEABILITY_AND_COVERAGE/SSOT_FEATURE_CROSSWALK.md`; `06_BUSINESS_PROCESSES/LEGACY_RULE_CROSSWALK.md`; `99_FINAL_MASTER_BLUEPRINT/PROJECT_MASTER_BLUEPRINT.md` §3; `24_RISKS_AND_DECISIONS/ADR_REGISTER.md` | Standing rule, applied: §12.12 contrasts written "SSOT ADR-00n vs ADR-Tnn"; register ids unchanged by the renumbering                                                                    | Confirmed |
| V61-31 | §24.8.2 (Change Classes); §24.8.3 (Register-Integrity Invariant); §25                 | Every `Proposed` item needs the approval its change class requires before it alters SSOT intent. Indicative classes (the classification is UNVERIFIED): C6 architecture or provider for V61-13, V61-14, V61-15 and V61-08; C7 commercial for V61-09 and V61-21; C3 schema or data for V61-16 to V61-19. This appendix changes no locked register count. v6.2 edited body text to renumber headings and citations (V61-12), to resolve or record the E.1 contradictions, to add pointers for E.2, and to record further open issues inline (listed in §27.10); until ratified, read the SSOT text as founder intent and this appendix as the reconciliation record | §24.8.2 assigns approval rights; target ADRs remain Under Review and no ARB or founder ratification is recorded. The review notes that the "binding" wording in some target files overstates governance status | SSOT.md §24.8; `24_RISKS_AND_DECISIONS/ADR_REGISTER.md`; `27_INDEPENDENT_REVIEWS/REVIEW_RESOLUTION_DECISIONS.md`; `27_INDEPENDENT_REVIEWS/SECOND_REVIEW_REPORT.md` REVW2-07                                      | Standing rule, applied: pointer at §25.4; no Proposed item adopted                                                                                                                       | Confirmed |

### E.4 Checked and consistent at headline level (not line-checked)

- Amendment A.2 (the API is the authority for domain mutations; RLS is defence in depth) agrees with ADR-T05, ADR-T07 and INV-T01 to INV-T03.
- Amendment A.6 (TanStack Query) agrees with the target frontend decision FD-F2 in `10_FRONTEND_ARCHITECTURE/FRONTEND_ARCHITECTURE.md`.
- Amendments C, D and E and §15.10, §16 and §17 agree with ADR-T12, INV-T06 to INV-T09 and INV-T19.
- §19 (the offline cache is never authoritative) agrees with ADR-T10. The target is narrower: Ph1 offline is a read cache plus local unsent drafts, and assessment answers are online-only (REVW-15, REVW-24).

### E.5 Not verified in this pass

- Source documents cited only through the prior reference (implementation plan, release scope, feature plan, PRD, pricing, Stripe and E2E audits) are not on this branch; V61-02 and V61-09 rely on the reference's own statements and are UNVERIFIED against those sources.
- v6.1 pass: SSOT.md was read in portions plus targeted searches. Read: the heading outline, the amendments, §§1–7, F-01, F-96, the §9.4 excerpt, the §10 state machines and rules §10.16, §10.18 and §10.28, §12 (§12.8, §12.12, §12.18–§12.19), §14.5, §§16–17, §19, §22 (§22.3–§22.5), §23, §24.1, §15.9, §24.8, Appendices A–C and the closing lines. Checked by search only: F-85, F-86, F-114, F-122 and the other threshold rows listed in V61-04. Not read in full: §11, most of §13–§14 and §18, §20–§21, §25–§26, the remaining feature specifications and Appendix D, so further contradictions may exist.
- The count of 45 rows in the §10.9 index differs from the figure of 40 in the target audits; the 40 is not reproduced here.
- The proposed eight remotes (V61-15) and the target latency, bundle, canary and game-day values (V61-26) were not checked against `00_CONTROL_CENTRE/ID_REGISTRY.md` or the SLO documents.
- No test, build or schema check was run in the v6.1 pass; Mermaid diagrams were not rendered.
- v6.2 pass: the edits were made by section editors working in parallel, each on one part of the file, against one shared set of rulings; the "v6.2 handling" column summarises their logs and was not re-checked line by line against the assembled file. Mermaid blocks were syntax-parsed with mermaid@11 (headless) only where the lead ran that check; other blocks were checked by reading. No diagram was rendered.

---

# PART VIII — MULTI-AGENT EVALUATION, IMPROVEMENTS, AND VALIDATION SUMMARY

## 27. Multi-Agent Evaluation, Improvements, and Validation Summary

**Evaluation date:** 20–21 November 2026 · **Code evaluated:** `main` at `781866f` (PR #77) · **Evidence class:** `FACT` where a command was executed or a line was read; `INFERENCE` where marked.

> [!NOTE]
> **Dated record.** This Part records three passes. §27.1–§27.9 record the multi-agent evaluation of the partial implementation that exists on `main` at `781866f`; every file path, line number and test result in them refers to `main` on the date recorded in each section, and status is only what executable evidence supports (V61-29). The SSOT-AMD-01…28 amendments in §27.5 were approved for `main`; they are not merged into §1–§26 of this file, and whether they bind the specification is an open owner decision. The record was first merged to `main` in PR #78 (merged 2026-11-20 UTC) and is carried here unchanged in substance. §27.10 records the v6.2 documentation fix of this file, and §27.11 records the second pass on the code (feature branch `feat/integrate-audit-fixes-2026-11-21`, merged to `main` as PR #80) and on this file. Section numbers inside §27.1–§27.9 that point into this specification have been rewritten to the v6.2 numbering.

> [!IMPORTANT]
> **Owner instruction (21 Nov 2026): no change to application code in the codebase.** Later that day the owner asked for the work to be committed and pushed, which ended this instruction only for the code integrated on a feature branch (§27.11); for `main` it still describes the status. Every improvement below is specified here as an implementation-ready requirement. None of it is applied to the codebase. A local, unapplied reference implementation was produced and tested in a sandbox before that instruction. It is kept outside the repository as four patch files so the owner can review, adopt or discard it (§27.6). In this part, "Implemented" means **implemented in that unapplied patch only**. The codebase status of every item is **Not implemented**.

### 27.1 Method

| Stage                    | What was done                                                                                                                                                             | Evidence                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Independent evaluation   | Ten specialist agents ran in parallel, each on its own area, from the same brief and rules (read-only, `path:line` evidence, confidence labels, no invented requirements) | 10 reports, 169 findings                                                                                                                                     |
| Cross-review             | Two fresh reviewer agents, who had not taken part in the evaluation, re-verified 29 consolidated candidates against the code and arbitrated disagreements between agents  | 2 review records; 0 rejected; 27 approved (5 as drafted, 22 with corrected specifications, several with owner-only sub-parts split out); 2 left to the owner |
| Consolidation            | The lead merged duplicates, applied the review verdicts and fixed an approved scope with named owners                                                                     | Approved plan: 28 work items in 4 groups                                                                                                                     |
| Reference implementation | Four implementer agents, each in an isolated git worktree and branch, implemented their group with tests                                                                  | 4 unmerged branches, 33 commits, all automated checks green per branch                                                                                       |
| Owner stop               | The owner instructed that no code change enter the codebase; integration stopped                                                                                          | On `main`, this record was the only repository change                                                                                                        |

Every agent's output was checked against the code by a different agent before approval. Agents worked independently: they were not shown each other's findings during evaluation.

**Baseline measured on `781866f` (sandbox, authorised install and build, nothing committed):**

| Check                                  | Result                                                                                                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build`                           | Pass. The web app ships as one JS chunk of 492 KB (143.6 KB gzip).                                                                                                                                                                                |
| `pnpm typecheck`                       | Pass                                                                                                                                                                                                                                              |
| `pnpm lint`                            | **Fail** on 182 files that predate this evaluation (155 `Yash_Final_Project_Document/`, 21 `.omc/`, 3 `deploy/`, 1 each in `tests/`, `apps/`, `.claude/`). Because `ci.yml` stops at the first failed step, CI runs nothing after lint (A10-001). |
| `pnpm test` (Vitest)                   | 130 files / 1,357 tests pass                                                                                                                                                                                                                      |
| `pnpm test:pg` (fresh Postgres 16)     | 13 files / 58 tests pass                                                                                                                                                                                                                          |
| `pnpm test:e2e` (Playwright, Chromium) | 256 pass, **1 fail**: `tests/e2e/responsive.spec.ts:233` finds 11 px text on `/` at every viewport. Cause: `apps/web/src/components/LandingArt.tsx:392` sets `fontSize="11"` (A04-001).                                                           |

### 27.2 Mind map of the evaluation

```mermaid
mindmap
  root((TalentSphere evaluation 2026-11-20))
    Trust and verification
      Self-made gold badge (A01-001, A03-003)
      Course clicks mint authority evidence (A01-002)
      Alumni domain self-verify (A08-003)
      Institution verify by any instructor (C-27, owner)
    Privacy and erasure
      Erasure on bearer token alone (A06-001, A08-006)
      In-memory leftovers after erasure (A05-004, A08-007, MISS-3)
      No grace-period executor (G-09)
      Inert privacy settings (G-11, G-12)
    Access and accounts
      Restricted users see session error (G-24)
      No password reset or email verification (A02-001)
      Per-account sign-in throttle missing (A08-011)
      Activity score readable by anyone (A08-017)
    Reliability
      No SIGTERM handling (A09-001)
      Lease loss gives permanent 503 (A09-002)
      Health ignores database (G-19)
      Anonymous analytics memory growth (A07-002, A09-004)
      Worker livelock past max attempts (A07-011)
    Delivery and quality
      CI stops at lint (A10-001)
      Landing text 11 px (A04-001)
      Injection tests certify unused guards (A10-002)
      8 routes untested (A10-003)
    Architecture
      13.4k-line route file (A05-006)
      Three hiring-role checks (A05-003, CF-16, CF-20)
      Durable data pointing at ephemeral data (A05-001)
```

#### Flowchart: evaluation process and status of each amendment

```mermaid
flowchart TD
  A[main @ 781866f] --> B[10 independent specialist agents]
  B --> C[169 findings with path:line evidence]
  C --> D[Lead consolidation: 29 candidates]
  D --> E[2 fresh cross-reviewers verify against code]
  E -->|27 approved| F[Approved plan: 28 work items, 4 owners]
  E -->|2 owner| O[Owner decisions §27.8]
  F --> G[Reference implementation in isolated worktrees]
  G --> H[Per-branch build, typecheck, unit, Postgres tests: pass]
  H --> I{Owner: change code in codebase?}
  I -->|No, 21 Nov 2026| J[Specified here as SSOT-AMD-01..28; patches kept outside repo]
  I -->|Future yes| K[Apply patches, run combined e2e + browser checks]
  K --> L[Verified]

  classDef done fill:#e6f4ea,stroke:#2e7d32;
  classDef pending fill:#fff4e5,stroke:#b26a00;
  class B,C,D,E,F,G,H,J done;
  class K,L,O pending;
```

Status ladder for every amendment: `Recommended → Approved → Implemented (unapplied patch) → Tested (automated, per branch) → Verified (e2e + browser)`. The current state of all 28 is **Tested in patch, Not implemented in codebase, Not verified**.

#### Flowchart: approved account-deletion flow (SSOT-AMD-01, SSOT-AMD-02)

```mermaid
flowchart TD
  U[Profile → Delete account] --> T{Typed DELETE and entered current password?}
  T -->|No| X[Delete button stays disabled]
  T -->|Yes| R[POST /settings/erasure/execute]
  R --> P{More than 10 calls for this account in 15 min?}
  P -->|Yes| Z[429 Too many attempts]
  P -->|No| Q{Resuming an interrupted erasure?}
  Q -->|Yes| E[Continue erasure]
  Q -->|No| V{Password correct?}
  V -->|Missing| M[400 VALIDATION_FAILED]
  V -->|Wrong| W["422 details.field = currentPassword"]
  V -->|Correct| E
  E --> D[Delete durable records]
  D --> N["Delete own in-memory records: salary reports, alumni affiliations,<br/>warm intros, connections, endorsements, referrals"]
  N --> S[Sign out, account gone]
  G[30-day grace period and executor] -.->|owner decision, §27.8 item 5| R
```

### 27.3 Agent evaluation summary

| Agent                               | Responsibility                                     | Areas examined                                                                                | Findings (P0/P1/P2/P3)  | Most important findings                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 Product & business logic        | Purpose, core loop, business rules vs register     | SSOT core loop, PRD, BUSINESS_RULE_REGISTRY vs `packages/domain`, billing plans, module value | 16 (0/6/8/2)            | A candidate can earn the "verified" badge alone: the web never sends `companyId`, so the employer-domain check never runs, and referees are any email typed (A01-001). Course completion mints `authority_verified` evidence from lesson clicks, with no assessment (BR-048), and the code allows 3 lessons where BR-091 says 5 (A01-002). Rejections store an invented reason, and the outcome loop never closes (A01-003/005). Paid plan cards list features that are not built (A01-008). Module keep/gate/cut table (A01-013). |
| A02 Functional completeness         | Feature-by-feature UI→API→domain→storage           | 30 modules with a web UI                                                                      | 15 (0/6/8/1)            | Restricted accounts are locked out of their options (G-24). No password reset or email verification exists (A02-001). Jobs cannot be edited (A02-003). Erasure is immediate, and the 30-day path has no UI or executor (A02-004). Most settings do nothing (A02-005). Every web call reaches an existing route with the right method.                                                                                                                                                                                              |
| A03 Micro-features & edge cases     | Validation, state guards, idempotency, UI states   | Core-loop contracts, domain transitions, pages                                                | 24 (0/5/10/9)           | One mailbox can supply every reference, including the role's own work email, which yields score 100 and gold (A03-003). Work-email codes re-issue without limit (A03-004). A double checkout can create two paid subscriptions (A03-016). `mark-read {}` marks everything (A03-001). Revoked evidence is re-stamped on repeat revoke and accepted in applications (A03-011/013).                                                                                                                                                   |
| A04 UX/UI & journeys                | Navigation, journeys, consistency, a11y, feedback  | `App.tsx` route map, pages, components, tokens, JOURNEY_REGISTRY                              | 18 (0/4/10/4)           | Root cause of the e2e failure (A04-001). The responsive test reads computed size, so it misses landing SVG text drawn at about 8 px on a 320 px screen. Restricted session error, and no appeal page (A04-002). No password reset (A04-003). Dark theme, "Nobody can message me" and push do nothing, and the `connections_only` help text is false (A04-005). The Challenges page is live but unlinked (G-16 changed).                                                                                                            |
| A05 Architecture                    | Boundaries, coupling, durability strategy          | `server.ts`, storage, durability labels, packages, worker, config                             | 14 (0/4/3/7)            | Durable evidence points at ephemeral courses and certificates, so it cannot be revoked after a restart. Stealth flags are lost and consent defaults to true after a restart (A05-001/002). Three conflicting "who is hiring" checks live in routes, none in the domain (A05-003, CF-16/20 open). Erasure leaves in-memory personal data (A05-004). `TOKEN_SECRET` is read before `.env` loads (A05-007, CF-21 changed). `buildApp` is about 12.9k lines with no module boundaries (A05-006).                                       |
| A06 Database & data                 | Schema, constraints, RLS, transactions, lifecycle  | 55 migrations, `storage/*`, DATABASE.md                                                       | 16 (0/4/8/4)            | Irreversible erasure on a bearer token. Grace-period requests never run (A06-001, G-09). Erasure leaves personal data and deletes billing records that may need retention (A06-002). Evidence history is overwritten (A06-004, G-21 open). Admin audit is now durable (G-07 partly fixed), but 44 user-level audit writes go to an array nothing reads, and admin audit rows are written outside the action's transaction (A06-005).                                                                                               |
| A07 API & integrations              | Validation, envelopes, Stripe, email, worker       | Routes vs contracts, `billing-stripe.ts`, `apps/worker/src/email`, claim/queue                | 15 (1/5/5/4)            | Staging compose passes `EMAIL_FROM=""` and the old `RESEND_API_KEY`, never `BREVO_API_KEY`. The empty string fails env validation, so the API should refuse to boot (A07-001, P0, `deploy/` is protected). Anonymous analytics grows without limit (A07-002). `/health` ignores the DB, and lease loss gives a permanent 503 (A07-008). Stripe events applied by arrival order within one second (A07-007). Worker double execution (D-02) is fixed; retry gaps remain (A07-011).                                                  |
| A08 Security, privacy & permissions | OWASP/CWE, authz across routes, secrets, privacy   | auth.ts, every route's object-level checks, helmet/CORS, webhooks, k-anonymity                | 17 (0/8/5/4)            | Core auth holds: signing, expiry, revocation, hashing, reference tokens and webhooks. Erasure lacks re-authentication (A08-006, CWE-306). Erasure leaves salary reports and alumni affiliations public (A08-007, CWE-359). Alumni domain verification trusts unverified emails (A08-003, CWE-287). Self-chosen recruiter role privileges (A08-001/002). Per-account login throttle missing (A08-011, CWE-307). Prior fixes G-03, G-25, G-27, G-30 and G-31 hold. G-01 is partly fixed.                                             |
| A09 Performance & reliability       | Startup, memory, shutdown, leases, pooling, bundle | entry points, storage, limiter, worker, bundle                                                | 18 (0/4/9/5)            | No SIGTERM handling in API or worker (A09-001). Lease loss gives 503 forever, and there is no healthcheck (A09-002). Production config accepts a transaction-mode pooler, which breaks the writer lock (A09-003). Anonymous analytics can exhaust the heap (A09-004). There is no route-level code splitting (one chunk of 492 KB raw and 143.6 KB gzip, measured in §27.1, against the §20.9 per-route budgets, whose compression basis is not stated). G-17 and G-23 are still open.                                             |
| A10 Testing & QA                    | Suites, CI, assertion strength, coverage           | 5 suites, configs, CI, TESTING.md                                                             | 16 (1/6/5/3; 1 unrated) | CI fails at its first step, so nothing after it has run on GitHub (A10-001, P0, protected files). SQLi, XSS and SSRF tests certify guard functions that no production code calls (A10-002). 8 of 278 routes are untested, and no suite checks authentication on every route (A10-003/005). `canViewProfile` is untested (A10-004).                                                                                                                                                                                                 |

**Totals:** 169 findings. P0 2, P1 52, P2 71, P3 43, 1 unrated, by the agents' own ratings, before deduplication.

**Prior registers re-verified.** G-01 partly fixed. G-20 changed (wrong ids fixed; omissions remain). G-04 cited as fixed in code comments but not re-verified. G-02, G-03, G-25, G-26, G-27, G-28 (apart from the self-chosen recruiter role), G-30 and G-31 fixed. G-07 partly fixed. G-06 narrowed to 8 routes. G-16 changed. G-19 partly fixed. G-08, G-09, G-11, G-12, G-13, G-15, G-17, G-21, G-23 and G-24 still open. CF-14, CF-15, CF-16, CF-20, CF-22, CF-33, CF-37, CF-41 and CF-45 open; CF-21, CF-25 and CF-28 changed.

### 27.4 Consolidated findings and decisions

#### Overlaps (one root cause, several agents)

| Consolidated                          | Agents                        | Root cause                                                          |
| ------------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| Restricted accounts locked out (G-24) | A02, A03, A04                 | `GET /api/v1/auth/session` missing from `RESTRICTED_SESSION_ROUTES` |
| Erasure without re-authentication     | A02, A03, A06, A08            | Destructive route gated by bearer token only                        |
| Erasure leaves in-memory data         | A05, A06, A08, R1 (MISS-3)    | No per-module erasure, and wrong-key deletes                        |
| Anonymous memory growth               | A07, A09, R1 (MISS-1, MISS-2) | Unbounded arrays, no metadata bounds, no route body limits          |
| Inert settings                        | A02, A03, A04                 | Settings stored and returned but never read                         |
| Readiness and lease loss              | A07, A09                      | Liveness-only health; the process keeps serving 503                 |

#### Conflicting recommendations and how they were resolved

| Topic                  | Positions                                                                                    | Decision and reason                                                                                                                                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-20 course evidence   | A01: safe to fix now. A05: owner decision                                                    | **Split.** Lowering the level to `unverified` is safe: it only removes a claim the code cannot back. Durability, BR-048, BR-091 and the CF-41 cascade are owner decisions.                                                                                                                                        |
| C-29 settings          | A02: enforce DM and connection settings now. A03/A04: hide vs implement is an owner decision | **Split.** Enforce `allowConnectionRequests`: one meaning, no exemption question. Make `connections_only` true using the existing portfolio `isConnected` rule. Hide controls that do nothing. DM semantics are an owner decision, because "Nobody" collides with recruiter↔applicant messaging in the core loop. |
| C-07 lease loss        | A09: exit. Others: re-acquire the lease in process                                           | **Exit(1)** from the entry point. Re-acquiring in process cannot prove that no other writer took over.                                                                                                                                                                                                            |
| C-06 code attempts     | A03: carry attempts across resends. R1: drop that                                            | **Drop it.** It contradicts the server's own message and locks out real users. Cooldown and issuance caps cover the abuse.                                                                                                                                                                                        |
| C-14 empty env         | Blanket strip vs optional-only                                                               | **Optional-only.** A blanket rule would turn `NODE_ENV=""` into `development`, which fails open.                                                                                                                                                                                                                  |
| C-23 throttle          | Per account and per IP                                                                       | **Per-account failures only.** The code deliberately avoids address-only keys (NAT). Changing that is security architecture.                                                                                                                                                                                      |
| C-26 activity score    | Owner/admin only vs profile rules                                                            | **`canViewProfile` + `showActivity`.** Owner-only would break a tested recruiter feature.                                                                                                                                                                                                                         |
| C-21 checkout          | A03: everything is an owner decision. A07: client key is safe                                | **Split.** Client key, subscription re-fetch and logging are mechanism, not pricing. One open session per user needs Stripe test-mode verification. Refund policy is an owner decision.                                                                                                                           |
| C-11 secret load order | Inject config vs load `.env` first                                                           | **Load `.env` first.** Injection adds a global mutable key with a wide test blast radius.                                                                                                                                                                                                                         |

#### Rejected or deferred recommendations

- **Rejected:** carry attempts across resends (C-06); a blanket empty-env strip (C-14); a per-IP-across-emails login bucket (C-23); in-process lease re-acquisition (C-07); "owner/admin only" activity score (C-26); a runtime `pg_backend_pid()` pooler probe (C-09: it cannot prove session affinity).
- **Not approved now, owner decisions (§27.8):** C-27 (institution-verify authority) and C-28 (job edit).

### 27.5 Approved improvements: implementation-ready specification

Each requirement below is **Approved**. **Codebase status: Not implemented.** The "Ref. patch" column gives the state of the unapplied reference implementation (§27.6). Acceptance criteria are the tests that implemented and passed in that patch.

#### Group A: Security, privacy and erasure

| ID                         | Requirement (normative)                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Acceptance criteria                                                                                                                                                         | Ref. patch                                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| SSOT-AMD-01 (C-04)         | `POST /settings/erasure/execute` requires `currentPassword` for a fresh erasure. Missing → 400 `VALIDATION_FAILED`. Wrong → 422 with `details.field='currentPassword'`. At most 10 checks per account per 15 min → 429. A resumed, interrupted erasure does not ask again. The Profile "Delete account" dialog asks for the current password and enables "Delete permanently" only when the box says DELETE and a password is entered. The 30-day grace model stays an owner decision. | No body → 400, the account is intact and the old password still signs in. Wrong password → 422. 11th attempt → 429. Resume path unaffected.                                 | Implemented, tested                                                                                                                            |
| SSOT-AMD-02 (C-05, MISS-3) | Erasure removes the person's own records from every in-memory module: salary reports, alumni affiliations (both indexes), warm introductions they requested, connections, received endorsements and referral requests. The deletes use the keys each map is actually indexed by. Records owned by third parties follow per-domain retention (owner).                                                                                                                                   | Salary benchmark count drops. The affiliation leaves the directory, and verify returns 404. Endorsements, referrals and connections are gone. Each test fails on `781866f`. | Implemented, tested. Also fixed three more wrong-key deletes the reviewer missed.                                                              |
| SSOT-AMD-03 (C-16)         | The alumni `email_domain` method is refused (422) while account emails are unverified, both at `/verify` and for auto-verification at creation. The domain match refuses look-alike suffixes such as `stanford.edu.evil.example`.                                                                                                                                                                                                                                                      | Creating with a matching domain gives `unverified`. Verify with `email_domain` → 422. The matcher unit tests pass.                                                          | Implemented, tested. **Behaviour change: closes self-serve alumni verification until email verification exists. Needs owner acknowledgement.** |
| SSOT-AMD-04 (C-23)         | Sign-in keeps a per-account window of **failed** attempts: 15 min, `AUTH_ACCOUNT_FAILURE_MAX`, default 50. Unknown emails are treated identically, so the throttle reveals nothing about which accounts exist. Above the cap → 429. Bystander accounts are unaffected.                                                                                                                                                                                                                 | Many-address guessing → 401… then 429. The same sequence for an unknown email. Another account unaffected.                                                                  | Implemented, tested                                                                                                                            |
| SSOT-AMD-05 (C-26)         | Reading another person's activity score applies `canViewProfile` (403 as for `/profile/:id`) and the target's `showActivity` (403 unless owner, admin or moderator). Unknown user → 404. `claim-activity` is unchanged (owner).                                                                                                                                                                                                                                                        | A peer reads a public profile → 200, then 403 after `recruiters_only`. A recruiter → 403 after `showActivity:false`. The owner → 200.                                       | Implemented, tested                                                                                                                            |
| SSOT-AMD-06 (C-06)         | Work-email codes: 60 s re-issue cooldown, kept across restarts through the durable challenge's `createdAt`. At most 5 issues per account per hour and 10 per address per day. At most 10 reference requests per account per hour. Above a limit → 429. The web disables "Send a new code" for 60 s and says why. Attempts are **not** carried across re-issues.                                                                                                                        | Cooldown → 429 with exactly one outbox job. 6th issue per hour → 429. 11th code to one address across 3 accounts → 429. 11th reference → 429.                               | Implemented, tested                                                                                                                            |

#### Group B: Reliability, configuration and integrations

| ID                                 | Requirement                                                                                                                                                                                                                                                                                                                                                                 | Acceptance criteria                                                                                                                    | Ref. patch                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| SSOT-AMD-07 (C-14)                 | Empty strings count as unset **only** for optional variables without a default. `NODE_ENV=""` still fails validation.                                                                                                                                                                                                                                                       | `EMAIL_FROM=""` boots. `NODE_ENV=""` fails.                                                                                            | Implemented, tested                                                     |
| SSOT-AMD-08 (C-11)                 | `.env` is loaded by a side-effect module imported before anything reads `TOKEN_SECRET`                                                                                                                                                                                                                                                                                      | The secret from `.env` signs tokens in a non-container run                                                                             | Implemented, tested                                                     |
| SSOT-AMD-09 (C-09)                 | Deployed config refuses port 6543 on any Supabase host and `pgbouncer=true` on any host, with or without `SUPABASE_PROJECT_REF`. Session pooler and direct connections on port 5432, and self-hosted 6543, are accepted.                                                                                                                                                    | 5 config cases                                                                                                                         | Implemented, tested                                                     |
| SSOT-AMD-10 (C-15)                 | Booleans in query and env are parsed strictly: `true/false/1/0` in any case, trimmed. Anything else → 400, or a boot failure for env.                                                                                                                                                                                                                                       | `includeUnverified=false` hides unverified roles. `maybe` → 400.                                                                       | Implemented, tested                                                     |
| SSOT-AMD-11 (C-03, MISS-1, MISS-2) | Anonymous analytics: 64 KB body limit, 60 requests per 60 s, retained events in a bounded ring buffer, metadata bounded in size and depth including array elements (BR-27), and responses never contain `ipHash` or `userAgent`. `POST /activity/events` gets the same metadata bounds, a body limit, a per-route rate limit and a cap of 1,000 retained events per user.   | Unit bound tests. Oversized body → 413. Sanitised arrays. Response fields.                                                             | Implemented, tested                                                     |
| SSOT-AMD-12 (C-10)                 | The telemetry route reads the durable `showActivity` setting, so an explicit opt-out survives a restart. The default-consent model is unchanged (owner).                                                                                                                                                                                                                    | Postgres test: after a restart, an opted-out user's event is anonymised and a bystander's is attributed                                | Implemented, tested                                                     |
| SSOT-AMD-13 (C-07)                 | Unauthenticated root `GET /ready`: 200 `{status:'ready'}` or 503 `{status:'not_ready'}` after a database round trip with a 2 s limit, exempt from the rate limiter. On writer-lease loss the process exits 1 from the entry point. In memory mode `/ready` reports ready.                                                                                                   | Lifecycle unit tests. `/ready` integration tests.                                                                                      | Implemented, tested                                                     |
| SSOT-AMD-14 (C-08)                 | API and worker handle SIGTERM and SIGINT: stop accepting work, finish in-flight work, exit 0 within 8 s (under Docker's 10 s default) or exit after the deadline                                                                                                                                                                                                            | SIGTERM → close then exit 0. A hanging close → exit after 8 s. A second signal is ignored.                                             | Implemented, tested                                                     |
| SSOT-AMD-15 (C-22)                 | The worker dead-letters a job at claim time once it is past max attempts. The lease is measured with the worker's own clock from the moment it asked for the claim.                                                                                                                                                                                                         | Max-attempt and skewed-clock tests. One existing test that asserted the livelock was rewritten to the correct behaviour, not weakened. | Implemented, tested                                                     |
| SSOT-AMD-16 (C-21 a, b, d)         | `PaidPlans` sends a stable `idempotencyKey` for each plan and cycle. `customer.subscription.*` events apply the subscription re-fetched from the provider, and a provider failure → 503 so Stripe redelivers. A second live subscription is logged at error level with both ids. One open checkout session per user (c) and the refund policy (d) are **not approved now**. | A same-second older event delivered last does not undo `active`. Provider failure → 503. Normalisation keeps the event time.           | Implemented, tested (fake gateway only; Stripe test mode not exercised) |

#### Group C: Functional, domain and UX

| ID                      | Requirement                                                                                                                                                                                                                                                                                                                                          | Acceptance criteria                                                                                                                                                            | Ref. patch                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| SSOT-AMD-17 (C-01)      | Restricted (suspended or banned) accounts can call `GET /api/v1/auth/session`. Every other non-allow-listed route still returns 403.                                                                                                                                                                                                                 | Automated: a suspended account's `/auth/session` → 200 while e.g. `/evidence/mine` stays 403. Browser check (not run): `/dashboard` shows `restricted-notice` and export works | Implemented, tested                   |
| SSOT-AMD-18 (C-02)      | Landing SVG captions are at least 12 px. The fix goes in the art, never the test threshold.                                                                                                                                                                                                                                                          | `responsive.spec.ts:233` passes                                                                                                                                                | Implemented; e2e not run on the patch |
| SSOT-AMD-19 (C-12)      | Revoking or disputing again → 409. Applying with revoked evidence → 422. The pipeline response strips evidence metadata (`disputeReason`, `revokedBy`, …).                                                                                                                                                                                           | Domain and integration tests                                                                                                                                                   | Implemented, tested                   |
| SSOT-AMD-20 (C-13)      | `POST /notifications/mark-read` requires explicit ids or `all:true` → otherwise 422. The web caller already sends explicit ids or `all:true` (no change needed).                                                                                                                                                                                     | `{}` → 422. Mark-all and mark-one still work.                                                                                                                                  | Implemented, tested                   |
| SSOT-AMD-21 (C-17)      | A reference is refused (409) when the referee email equals the candidate's account email, the role's work email, or an existing reference on the same role. A stronger independence policy remains an owner decision (A01-001).                                                                                                                      | 409 cases. The score is not inflated by a single mailbox.                                                                                                                      | Implemented, tested                   |
| SSOT-AMD-22 (C-18)      | A rejection without a reason stores no reason, and none is fabricated. BR-217 categories remain an owner decision.                                                                                                                                                                                                                                   | Automated: no stored or returned reason. Browser check (not run): no reason line shown                                                                                         | Implemented, tested                   |
| SSOT-AMD-23 (C-19)      | The career assistant uses the caller's own skills or says they have none. It never uses hard-coded skills.                                                                                                                                                                                                                                           | Unit and integration tests                                                                                                                                                     | Implemented, tested                   |
| SSOT-AMD-24 (C-20)      | Course-completion evidence is created `unverified` / `pending`, labelled "not assessed"                                                                                                                                                                                                                                                              | The LMS test was rewritten because it encoded the defect                                                                                                                       | Implemented, tested                   |
| SSOT-AMD-25 (C-25)      | Profile `privacy` and settings `profileVisibility` are one value, offered identically on both pages                                                                                                                                                                                                                                                  | Both pages show the same value                                                                                                                                                 | Implemented, tested                   |
| SSOT-AMD-26 (C-29)      | `allowConnectionRequests:false` → 403 on connection requests. `connections_only` profiles are visible to accepted connections (an optional `isConnected` on `canViewProfile`), so after a restart they fail closed to private. Settings controls that do nothing are hidden, while API fields still round-trip. DM enforcement is an owner decision. | `canViewProfile` visibility matrix. Connection 403/201. A connected peer sees the profile, a stranger does not.                                                                | Implemented, tested                   |
| SSOT-AMD-27 (PLAN-COPY) | Plan cards list only built features. The AI-quota lines are kept. Prices, caps and entitlements are unchanged.                                                                                                                                                                                                                                       | `plan-limits-domain` test still passes                                                                                                                                         | Implemented, tested                   |

#### Group D: Test coverage

| ID                 | Requirement                                                                                                                                                                                                                           | Acceptance criteria       | Ref. patch                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------- |
| SSOT-AMD-28 (C-24) | A route authorization sweep: every `/api/v1` route not in an explicit public set (49, each with a reason) returns 401 for no token, a tampered token, a wrong-secret token and garbage. Tests cover the 8 previously untested routes. | 228 routes × 4 cases pass | Implemented, tested (tests only) |

**New findings from Group D (not yet approved):**

- **I-D-01 (Low):** `GET /evidence/subject/:subjectId` returns the oldest records first, unlike `/evidence/mine` (`server.ts:1480`).
- **I-D-02:** `GET /skills/endorsements/recipients/:id` is anonymous (`server.ts:7298`), but `docs/system-model/06-route-authorization.md` says it needs sign-in. That document has further mismatches with the code (3–4, depending on how they are counted). An owner must decide which one is right.

### 27.6 Implementation summary

| Group | Branch (sandbox only, not pushed as of 21 Nov 2026) | Commits | Files              | Items     |
| ----- | --------------------------------------------------- | ------- | ------------------ | --------- |
| A     | `impl/a-security`                                   | 7       | 33 (+1,552 / −293) | AMD-01…06 |
| B     | `impl/b-reliability`                                | 10      | 39 (+2,091 / −193) | AMD-07…16 |
| C     | `impl/c-functional`                                 | 13      | 40 (+1,244 / −171) | AMD-17…27 |
| D     | `impl/d-tests`                                      | 3       | 6 (+903)           | AMD-28    |

- **New features introduced:** readiness probe (AMD-13), graceful shutdown (AMD-14), route authorization sweep (AMD-28).
- **Existing features enhanced:** AMD-01…12 and AMD-15…27.
- **Features replaced or removed:** inert Settings controls hidden (AMD-26); unbuilt plan copy removed (AMD-27).
- **Affected modules:** auth/session, settings/erasure, evidence, work history/references, notifications, connections/profile visibility, alumni, analytics/activity, LMS completion, AI assistant, billing/Stripe, config, worker, landing page, Settings/Profile/Evidence/Hiring pages.
- **Protected build files touched:** none. **Migrations added:** none.

**Codebase status of every item (as of 21 Nov 2026): Not implemented, by owner instruction.** To adopt any group, apply its patch on a branch, run the §27.7 checks, run the e2e and browser checks that were not done (§27.7), and review the owner acknowledgements (§27.8).

### 27.7 Validation summary

| Check                          | Group A                | Group B          | Group C     | Group D                                    | C + D merged (lead) |
| ------------------------------ | ---------------------- | ---------------- | ----------- | ------------------------------------------ | ------------------- |
| `pnpm build`                   | Pass                   | Pass             | Pass        | Pass                                       | Pass                |
| `pnpm typecheck`               | Pass                   | Pass             | Pass        | Pass                                       | Pass                |
| `pnpm test`                    | 133 files / 1,390 pass | 135 / 1,414 pass | 1,423 pass  | 133 / 1,378 pass (1 expected fail, I-D-01) | 137 / 1,444 pass    |
| `pnpm test:pg`                 | 13 / 58 pass           | 15 / 62 pass     | 58 pass     | 13 / 59 pass                               | not run             |
| Prettier on changed files      | Clean                  | Clean            | Clean       | Clean                                      | —                   |
| `pnpm test:e2e`                | **Not run**            | **Not run**      | **Not run** | **Not run**                                | **Not run**         |
| Browser verification (Reticle) | **Not run**            | **Not run**      | **Not run** | —                                          | —                   |

- **Regressions:** none found in the automated suites of any branch. Existing tests that encoded a defect were rewritten to the correct behaviour: the C-22 worker clock test (named in its commit), the C-20 LMS level assertion, the C-16 alumni integration test (it asserted the bypass) and the C-17 removal fixtures; the latter three are recorded in the implementer reports, not in commit messages. The implementers report that no assertion was loosened; this was not independently audited line by line.
- **Edge cases covered:** empty and invalid input (AMD-07, 10, 20), repeated actions (AMD-19), limits (AMD-04, 06, 11), restart behaviour (AMD-06, 12), signals and deadlines (AMD-14), clock skew (AMD-15), same-second event ordering (AMD-16).
- **Not validated:**
  - All four groups together: A and B were never merged with C and D.
  - E2E for any change, including the e2e specs edited in the patches (`checkout-idempotency.spec.ts`, `alumni-networks.spec.ts`).
  - Browser checks of the Delete-account dialog, the resend button, Settings and the landing page.
  - Stripe test mode.
  - Any deployed environment.
- **Outstanding failures in the codebase:** the 182-file lint failure (A10-001) and the 11 px landing text (A04-001) remain, because no code was changed.

**Status key used in this part:** Recommended → Approved → Implemented (unapplied patch) → Tested (automated, per branch) → Verified (end-to-end and browser). **No item has reached Verified, and no item is implemented in the codebase.**

### 27.8 Decisions that require the owner

| #   | Decision                                                                                                                                                           | Why it is the owner's                     | Source                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------ |
| 1   | Adopt the reference patches (any of A–D), or keep them as specification only                                                                                       | Owner instruction, 21 Nov 2026            | §27.6                          |
| 2   | Accept that AMD-03 closes self-serve alumni verification until email verification exists                                                                           | Behaviour removal                         | A08-003, C-16                  |
| 3   | CI: exclude non-source docs from lint (`.prettierignore`) or reformat them. CI currently runs nothing after lint.                                                  | Protected build files                     | A10-001 (P0)                   |
| 4   | Staging compose: `RESEND_API_KEY` → `BREVO_API_KEY`, no empty `EMAIL_FROM`, healthcheck on `/ready`, `stop_grace_period`                                           | Protected `deploy/`                       | A07-001 (P0), A08-016, A09-002 |
| 5   | Erasure model: 30-day grace and executor (G-09), whether a suspended account may self-erase, billing record retention, third-party records that mention the person | Privacy policy, legal retention           | A06-001/002                    |
| 6   | Password reset and email verification (needs live email)                                                                                                           | New security flows                        | A02-001, A04-003               |
| 7   | Verification trust model: referee independence, employer domain via `companyId`, gold/verified thresholds, cleanup of inflated historic scores                     | Consequential trust logic                 | A01-001, A03-003, A08-004      |
| 8   | Self-registered recruiter privileges, org membership semantics and `recruiters_only` visibility                                                                    | Security architecture                     | A08-001/002, CF-14/16/20       |
| 9   | Who may institution-verify evidence (no issuer link in the data model)                                                                                             | Trust rule and migration                  | C-27, A08-005                  |
| 10  | DM permission semantics (applicant exemption, re-check per message, post-rejection window)                                                                         | Product rule colliding with the core loop | A03-008, C-29                  |
| 11  | LMS: durability, BR-048 final assessment, BR-091 (code 3 vs register 5), CF-41 certificate→evidence cascade                                                        | Register/code conflict                    | A01-002, C-20                  |
| 12  | Job edit, approval, scheduling and applicant notice on close (BR-11, G-08, CF-15)                                                                                  | State-machine design                      | A02-003, A01-006/007           |
| 13  | Rejection reason categories (BR-217) and candidate-facing feedback                                                                                                 | Product rule                              | A01-003/004                    |
| 14  | Consent default for users who never saved settings, `showActivity` as telemetry consent, stealth persistence                                                       | Consent model                             | A05-001/002, C-10              |
| 15  | `claim-activity` XP and self-reported events in recruiter-visible scores                                                                                           | Gamification and ranking design           | C-26, MISS-1                   |
| 16  | Pricing and caps (a paid recruiter plan caps postings while free is unlimited)                                                                                     | Pricing                                   | A01-008, A02-013               |
| 17  | Append-only evidence events (BR-149, G-21) and audit written inside each action's transaction (G-07)                                                               | Schema design                             | A06-004/005                    |
| 18  | Salary k-anonymity counted by distinct people                                                                                                                      | Privacy rule                              | A08-008                        |
| 19  | Gating or cutting ephemeral modules; extracting modules from `server.ts`; route-level code splitting                                                               | Big refactor, scope                       | A01-010…013, A05-006, A09      |
| 20  | CSP and HSTS on the web origin; token storage (G-15)                                                                                                               | Security architecture, hosting            | A08, G-15                      |
| 21  | Which is right for `/skills/endorsements/recipients/:id` and three other doc-06 mismatches                                                                         | Spec vs code                              | I-D-02                         |
| 22  | Stripe: one open checkout session per user (needs test mode), duplicate-subscription refund policy                                                                 | Billing policy                            | C-21 c/d                       |

### 27.9 Remaining limitations of this evaluation

- Static review was supplemented by automated suites only. There was no penetration test, load test or deployed-environment check. The rendered UI was checked only through the existing Playwright baseline.
- Agent findings carry their own confidence labels. Items marked _Suspected_ in the agent reports and not listed in §27.5 have not been verified.
- Two process incidents occurred, and neither left a trace in the codebase:
  1. An evaluation agent wrote scratch analysis files into the lead's sandbox copy. They were deleted.
  2. `git stash` is shared across worktrees, so one implementer popped another's stash. It was detected, reverted, and the affected work was confirmed intact.
- §27.1–§27.9 record evaluation evidence as of 21 Nov 2026; §27.11 records the later passes. This Part does not change §1–§26 intent, and SSOT-AMD-01…28 were approved as requirements for `main` and are pending there as implementation; whether they bind this branch is an open owner decision (see the note at the start of this Part).

---

### 27.10 v6.2 documentation fix of this file (21 November 2026)

**Request.** On 2026-11-21 the owner asked for the complete SSOT to be fixed from start to end, with one diagram that combines a mind map and a flowchart. All documents on this branch were to serve as reference, and application code was out of scope. The owner then made four decisions:

1. Fix the file on this docs-only branch.
2. Renumber the headings cleanly and rewrite every internal cross-reference, with no legacy aliases.
3. Put the diagram inside `SSOT.md` only.
4. Leave application code unchanged.

**Method.**

| Stage              | What was done                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Evidence                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Rulings            | The lead set 19 rulings (R-01…R-19), one resolution per cross-cutting contradiction, applied identically everywhere: core loop = Amendment B; `min_cohort_k` default k ≥ 10; deny-by-default with an illustrative role matrix; three named erasure clocks; email vendor-neutral behind a port; no undecided commercial numbers; locked counts untouched; lower `snake_case` state names; undefined FC, TD and MVD ids treated as open; V61-13…V61-28 kept as unratified proposals                                                                        | Rulings record kept with the edit logs, outside the repository |
| Renumbering        | A deterministic script assigned every heading a unique number (342 headings mapped, 341 changed; 131 legacy numbers mapped) and inserted Part II and the §9.1 parent                                                                                                                                                                                                                                                                                                                                                                                     | Old→new heading map                                            |
| Section edits      | Nine editor agents worked in parallel, each owning one part of the file: header and §1–§5 · §6–§9.1 · §9.2–§9.4 · §10 · §11–§13 · §14–§22 · §23–§26 and Appendices A–C · Appendix D, research basis and end state · Appendix E. Each fixed its part against the rulings, the branch's reference documents and the other parts, and kept a change log.                                                                                                                                                                                                    | Nine change logs                                               |
| Assembly           | The lead added the system map and this Part, moved Appendix E before Part VIII, added the Appendices heading, aligned Part VIII's levels with the rest of the file, and renamed Part VIII's MISS-1…MISS-3 (formerly M-1…M-3, which looked like Appendix D's M-01…M-100)                                                                                                                                                                                                                                                                                  | This file                                                      |
| Mechanical checks  | All results are for the assembled file: section citations resolve to a heading (except deliberate mentions of old numbers in the change record); 0 missing in-page anchors; 0 missing relative paths on this branch; 0 table column mismatches; 31 of 31 Mermaid blocks parse with `mermaid@11` (headless parse, not a visual render); no citation artefacts; none of the 1,022 register ids in v6.1 is missing                                                                                                                                          | Commands run by the lead, 2026-11-21                           |
| Independent review | Two reviewer agents, who had not edited the file, compared v6.2 with v6.1 section by section. They found 28 defects (2 must-fix, 13 should-fix, 13 nits), and all 28 were fixed before this version was committed. Examples: a note stated an unratified target proposal as a rule; a note decided an open WCAG question; this record miscounted research facts marked for re-verification. They confirmed that no table row or register id was lost, checked about 130 rewritten citations against their target headings, and fetched 8 research links. | Review record kept with the edit logs                          |

**What changed, by kind.**

- **Structure:** unique numbers for every section. Parts now run I → VII, followed by the appendices, Part VIII, the research basis and the end state. Embedded legacy sections have been placed under their real parents (feature tiers §9.2–§9.4, privacy §15.9, AI safety §15.10, registers §24.8). Appendix F is now Appendix E, and its items are V61-01…V61-31, because the F-nn labels clashed with the feature ids.
- **Contradictions:** the twelve verified v6.1 contradictions (V61-01…V61-12) are resolved in the text, or recorded in the text with the owner decision they need. Appendix E's "v6.2 handling" column records each case.
- **Reality:**
  - no sentence states current implementation status for this branch;
  - links to files missing from this branch are marked;
  - the external research facts carry primary-source links, with the original date and the 2026-11-21 re-verification date (one fact, the DPDP stage dates, is marked for re-verification).
- **Diagrams:** the system map is new, two Mermaid diagrams were repaired in §12, and state names are normalised.
- **Unchanged:** founder intent, every register id and every locked count (§24.8.1). Measured counts appear next to wrong figures rather than replacing them.

**Open issues found during the fix.** v6.2 listed these issues as needing an owner decision or source text. The v6.3 editorial pass resolved some by the file's own precedence rules or by citation fixes; the rest stay open. Every issue still open is noted inline where it occurs, except the phase-inversion count, which is recorded only here.

| Area              | Issue                                                                                         | v6.3 status                                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §5                | Persona P-P missing from the sequence                                                         | Still open as a fact, explained inline under §5.5: no source defines P-P, so it is a numbering gap.                                                                                                                       |
| §5                | §5.6 coverage diagram shows 11 of 19 personas                                                 | Resolved: the 8 missing personas were added from the §5.5 Primary Journeys column.                                                                                                                                        |
| §5                | §5.7 lifecycle states (`registered`) differ from F-01's (`unverified`)                        | Still open (V61-11; owner): the §5.7 note now lists the full difference and the missing exits.                                                                                                                            |
| §5                | §3.2 has no literal deny-by-default invariant                                                 | Still open (owner, C3): noted under §3.2 with the measured INV count.                                                                                                                                                     |
| §7–§9             | Dependency cycle F-45 ↔ F-115                                                                 | Resolved in this file by §7 precedence: F-45 is Ph10, so F-115 (Ph3) treats it as optional and blocks it; the reference register still lists the cycle under OPEN-LGA-05. The missing F-115 → F-96 dependency stays open. |
| §7–§9             | Features depending on a feature in a later SSOT capability phase                              | Still open (owner, OPEN-LGA-05). Measured count corrected: 24 dependency edges across 21 features.                                                                                                                        |
| §7–§9             | "Blocks" lists disagree with dependency rows                                                  | Resolved by precedence: §8.1 now states that §7 governs. Adding missing dependencies to §7 stays open.                                                                                                                    |
| §7–§9             | Priority and title mismatches (F-102, F-145, F-146, F-150, F-158, F-159); §9.4 "Priority 7–4" | Resolved: notes under §9.2 and §9.3, F-158 and F-159 headings corrected to Priority 6, title note in the §9 intro. The §9.4 title is consistent with its entries.                                                         |
| §7–§9             | F-01 cites SCI-04 and BR-001 incorrectly                                                      | Still open (owner): no authentication contract exists in the locked SCI register; noted inline in F-01.                                                                                                                   |
| §7–§9             | F-84's merge edge case is not allowed by its state diagram                                    | Still open (owner): noted under the F-84 diagram.                                                                                                                                                                         |
| §10               | Two Certification Attempt state rows                                                          | Still open (OPEN-45): the §10.10 note now records the SCI-32 per-attempt key that a resolution would follow.                                                                                                              |
| §10               | WF-33 duplicates WF-53                                                                        | Still open (owner; both ids locked): noted inline, with the unreachable `expired` terminal.                                                                                                                               |
| §10               | J-11 (local-first sync) contradicts BR-30                                                     | Still open (owner, OPEN-LGA-07): now noted under §10.2.                                                                                                                                                                   |
| §10               | BR-148 and BR-206 give different emerging-skill criteria                                      | Still open (owner, OPEN-LGA-02): noted at BR-206.                                                                                                                                                                         |
| §10               | Duplicated rules BR-037/BR-061, BR-25/BR-060, BR-15/BR-039                                    | Still open (owner consolidates): §10.13 records these pairs, BR-16/BR-038 and the BR-17/BR-20/BR-041 overlap; both ids stay and one test covers each pair.                                                                |
| §10               | Terminal state sets differ in five machines (V61-11)                                          | Still open (OPEN-45): §10.9 and §10.10 notes now record that the index conflicts with §10.11 more widely, and name the consistent options.                                                                                |
| §12–§13           | Repository layout puts `api/v1` inside the web shell                                          | Resolved by precedence (Part I A.1–A.2, §12.18): the layout no longer shows API folders. Server and worker location and the bundle boundary stay open.                                                                    |
| §12–§13           | Two headings cite SSOT ADR-009 for different subjects                                         | Resolved: a §13.4 note explains the two clauses of ADR-009; heading kept for anchors.                                                                                                                                     |
| §12–§13           | The heavy-queue workload list is incomplete                                                   | Still open (owner): the missing kinds are now listed under §13.5; the rule that assigns a kind to a queue is not stated.                                                                                                  |
| §14–§22           | `talent_pool` vs `talent_pools`                                                               | Resolved in text: `talent_pool` is read as `talent_pools`, as in the legacy schema reference.                                                                                                                             |
| §14–§22           | SSR and ISR wording sits in a Vite SPA                                                        | Resolved by precedence (Amendment A.1): §20.10, §20.11 and M-75 are annotated (§20.3's trace now names the Fastify handler); how public pages are rendered stays open.                                                    |
| §14–§22           | The RLS model assumes Supabase Auth (V61-13/V61-14)                                           | Partly resolved: §14.6 states that policies call identity helpers and that the `auth.*` patterns are their Supabase binding. The binding for other providers and the API's database identity stay open.                   |
| §14–§22           | Permissions-Policy blocks the camera and microphone that interviews need                      | Still open (owner): §15.6 now records the two constraints that bound the choice.                                                                                                                                          |
| §14–§22           | Route budgets exceed the §20.10 200 KB rule                                                   | Still open (V61-26): §20.9 also records that its JS column has no compression basis; M-100's citation corrected.                                                                                                          |
| §14–§22           | WCAG 2.2 AA criteria are listed as forward targets                                            | Still open (owner): §21.5 records that BR-204, §21.3 and D-21 would place them inside the gate.                                                                                                                           |
| §14–§22           | HDN-029…HDN-032 are counted but not defined                                                   | Still open (source text): no reference document on this branch defines them.                                                                                                                                              |
| §23–§24, App. A–B | GAP-038 cites BR-096                                                                          | Resolved: the citation is MIG-05; the legal basis stays open.                                                                                                                                                             |
| §23–§24, App. A–B | The D-7 BR ranges disagree with §10 headings                                                  | Still open: noted in the D-7 row.                                                                                                                                                                                         |
| §23–§24, App. A–B | Proctoring is in Ph6 in §23.1 but Ph10 in D-23 and OD-35                                      | Resolved by §7 precedence: a §23.1 note states that §7 phases govern the scope cells; reconciling the cells stays open (OPEN-LGA-05).                                                                                     |
| §23–§24, App. A–B | §24.4 is an empty parent                                                                      | Description corrected: §24.4 has a scope sentence, but §24.5–§24.7 are numbered as its siblings, not its children. Renumbering is optional (owner).                                                                       |
| §23–§24, App. A–B | Appendix B's "Q" register is undefined                                                        | Still open (source text); the GAP Class letters A–R also have no legend, now noted under §24.1.                                                                                                                           |
| §23–§24, App. A–B | §3.1 lists 12 principles against P 11; §3.2 lists 15 against INV 16                           | Still open (owner, C3): measured counts now noted under §3.1 and §3.2.                                                                                                                                                    |
| App. D            | "Dense Profile" (5.4.1) and notification matrix (2.6) do not exist                            | Still open (source text): noted inline.                                                                                                                                                                                   |
| App. D            | Motion timings conflict with §12.13 tokens                                                    | Still open (owner): now also noted at the §12.13 motion tokens.                                                                                                                                                           |
| App. D            | M-11 cites WCAG 2.4.13 (AAA), while §21 sets AA                                               | Resolved: M-11 and M-86 cite the AA criteria (2.4.7, 1.4.11) and label 2.4.13 as AAA; the 2px and 3:1 values are unchanged.                                                                                               |
| App. D            | NTF-012, R-003 and `error_code_catalog` are cited but not defined                             | Still open (source text): each is marked inline.                                                                                                                                                                          |

**Status of this pass (§27.6–§27.7 vocabulary):** documentation only. **Implemented:** the v6.2 text of this file. **Verified:** the mechanical checks above. No application code, test or runtime behaviour was created or changed, and closing a documentation contradiction is not evidence of implementation (V61-29).

### 27.11 Second pass (21–22 November 2026)

Later on 21 Nov 2026 the owner asked for all work to be committed and pushed, and the four reference branches of §27.6 were pushed. That ended the "no code change" status of §27.1–§27.9 for the code delivered on branch `feat/integrate-audit-fixes-2026-11-21`, and for no other branch. The owner then asked for the full brief to be run a second time, on the code and on this specification. This section records both. Status is only what the executable evidence in §27.11.1 supports (V61-29).

#### 27.11.1 Code pass (dated history; delivered to `main` in PR #80)

| Stage            | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Where recorded                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Integration      | The four reference branches from §27.6 were merged onto `main` @ `6b36d20`. The first combined run, on `50d9861`, gave: build and typecheck pass; Vitest 1,534 pass; Postgres 63 pass; Playwright 258 passed, 0 failed.                                                                                                                                                                                                                                                                                                                                                    | That branch's `SSOT.md` §27.11 |
| Re-evaluation    | Ten fresh specialist agents (the §27.3 roles) re-checked pass-1 findings, reviewed the integration diff and reported 97 new findings (by the agents' own counts). Two cross-reviewers verified 22 candidates: 17 approved, 1 rejected and replaced, 4 left to the owner.                                                                                                                                                                                                                                                                                                   | As above                       |
| Implementation   | Three implementers built the approved items (written "pass-2 K-01…K-21" here, because a reference document, `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md`, has its own K-nn table; that branch's §27.11 calls them K-01…K-21) in 22 commits. Highlights: referee independence enforced at request, work-email verification and scoring; evidence and employer-review reads no longer leak internals; race-free limiters; a flood-safe `/ready`; Stripe idempotency-key renewal after failure; an honest restricted-account interface; new browser tests. | As above                       |
| Final validation | On `2cb736a`: build and typecheck pass; Vitest 146 files / 1,571 pass; Postgres 15 files / 66 pass; Playwright (Chromium) 265 passed, 0 failed. Reticle did not run (no tools in the session), so "verified in a browser" means Playwright only.                                                                                                                                                                                                                                                                                                                           | As above                       |
| Delivery         | Pull request #80, merged to `main` on 22 Nov 2026 as `abc2326`. The results above were measured on branch tip `2cb736a` before the merge and were not re-run on the merge commit. CI stops at `pnpm lint` on 182 pre-existing non-source files, the same as on `main` (§27.8 item 3).                                                                                                                                                                                                                                                                                                                                                                                                                     | PR #80                         |

PR #80 merged on 22 Nov 2026, so the SSOT-AMD items and the approved pass-2 K items it carries are **Implemented** on `main`; **Tested** only as far as the pre-merge results above go; **Verified** is not claimed (no Reticle run, no deployed environment). K-18, K-20, K-22 and parts of K-14 and K-19 are owner decisions and are not implemented on any branch.

#### 27.11.2 Specification pass (this file, v6.2 → v6.3)

| Stage                        | What was done                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Independent review           | Five reviewers, each combining two of the ten roles, reviewed v6.2 against itself, the reference documents and (for silence only) what `main`'s implementation had to decide. They were: product and functional; micro-features and UX; architecture and API; data and security; performance and testing. They worked the §27.10 open issues and proposed exact edits. |
| Cross-review and application | An editor who wrote none of the edits checked each one against its evidence and against the rulings. It applied only justified edits, merged overlaps, turned owner questions into neutral "open — needs owner decision" notes, and logged every decision with its reason.                                                                                             |
| Checks                       | The lead's mechanical checks (citations, anchors, paths, tables, Mermaid parse, register ids, Prettier) and an independent final review — results in §27.11.3.                                                                                                                                                                                                         |

#### 27.11.3 Results of the specification pass

| Measure                                        | Result                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Review output                                  | About 121 findings and 172 proposed exact edits from the five reviewers                                                                                                                                                                                                                                                                                                                   |
| Editor decisions                               | 112 applied · 50 applied with changes (overlaps merged, wording narrowed) · 8 rejected · 2 left to the owner · plus one editor note merging three proposals (§13.8)                                                                                                                                                                                                                       |
| Examples of rejections                         | An edit that would have decided the open WCAG target question (owner, §21.5) · an edit that changed a terminal-state set (V61-11, OPEN-45) · edits that depended on this record, which the lead wrote instead                                                                                                                                                                             |
| Mechanical checks on the assembled file (lead) | Every `§` citation resolves, except the deliberate old-number mention in the §25.3 renumbering record · 0 missing in-page anchors · 0 missing relative paths on this branch · 0 table column mismatches · 31 of 31 Mermaid blocks parse with `mermaid@11` (headless parse, not a visual render) · Prettier clean                                                                          |
| Register ids                                   | No id present in v6.1 or v6.2 is missing. New ids cited: `A11Y-002` (the A11Y-001..010 range of §21.6); `OPEN-15`, `OPEN-LGA-02`, `OPEN-LGA-05`, `OPEN-LGA-07`, `BE-01`, `FM-12`, `FM-25`, `SLO-19` and `RMP-1` (reference documents on this branch); `K-01…K-21` (pass-2 items, §27.11.1); `CWE-601` (external). `ARCH-001…ARCH-012` are named only as absent. No register id is minted. |
| Independent final review                       | Reviewer RV-C, who neither proposed nor applied any edit, checked all 146 changed hunks and found 23 defects (3 must-fix, 11 should-fix, 9 nits). All were fixed before commit, apart from two layout-only readability nits left as they are.                                                                                                                                             |

Owner decisions raised in this pass are recorded inline as "open — needs owner decision" where they occur; §27.10's table covers only the issues v6.2 listed. Among them: the 64 tables the specification uses but the locked schema lacks; the API's database identity and the admin RLS claim; recruiter role grant and lockout recovery; the erasure cancel window and executor; the reliability contract (§20); untestable acceptance criteria and missing VER texts; and terminal-state sets.

---

# CURRENT EXTERNAL RESEARCH BASIS — 24 SEPTEMBER 2026 (RE-VERIFIED 21 NOVEMBER 2026)

The following external facts were first recorded on 24 September 2026. On 21 November 2026 each was re-checked against the primary source linked after it; the original citation markers were unusable and have been replaced by these links. Where a fact could not be fully confirmed, it is marked "(source to be re-verified)".

- Supabase documents PostgreSQL RLS as a granular database authorization mechanism and advises enabling RLS on every exposed table, setting appropriate grants, and testing allow/deny behavior. ([Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security))
- Supabase currently provides durable Postgres-native queues and documents exactly-once message delivery within its queue visibility model. Application side effects still require idempotent consumers. ([Supabase Queues](https://supabase.com/docs/guides/queues))
- Supabase Edge Functions are server-side TypeScript functions suited to webhooks and bounded HTTP/orchestration work; Supabase documents resource limits and recommends background workers for heavy work. ([Supabase: Edge Functions](https://supabase.com/docs/guides/functions); [Supabase: Edge Function limits](https://supabase.com/docs/guides/functions/limits))
- W3C continues to maintain WCAG 2.2 as the current WCAG baseline; W3C's September 2026 changelog also notes that the 2026 version of EN 301 549 uses WCAG 2.2. ([W3C: WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/); [W3C: WCAG 2 changelog, entry of 17 September 2026](https://www.w3.org/WAI/standards-guidelines/wcag/changelog/))
- W3C's Verifiable Credentials Data Model 2.0 is a Recommendation from May 2025; VCDM 2.1 is a Working Draft dated 20 September 2026. TalentSphere should target the stable 2.0 model first and monitor 2.1 rather than depending on a draft. ([W3C news, 15 May 2025: VC 2.0 family published as Recommendations](https://www.w3.org/news/2025/the-verifiable-credentials-2-0-family-of-specifications-is-now-a-w3c-recommendation); [W3C: VCDM 2.1 Working Draft, 20 September 2026](https://www.w3.org/TR/2026/WD-vc-data-model-2.1-20260920/)) On 21 November 2026 the latest published 2.1 version is a later Working Draft dated 22 October 2026 ([W3C: VCDM 2.1, latest version](https://www.w3.org/TR/vc-data-model-2.1/)); 2.1 is still a draft.
- India's MeitY has published the DPDP Rules 2025 and an enforcement timeline with staged commencement dates. TalentSphere must map privacy controls to the applicable stage and should not claim compliance from documentation alone. ([PIB explainer, 17 November 2025](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf): the Rules were notified on 14 November 2025 with an eighteen-month period for phased compliance.) The individual stage dates and the MeitY timeline document were not re-checked (source to be re-verified).

These facts are external dependencies, not substitutes for implementation evidence.

---

# CANONICAL END STATE

**TalentSphere is specified as a trust-first, evidence-backed Career Operating System with a PWA-first experience, modular architecture, governed intelligence, strong privacy/security boundaries, and an evidence-driven implementation program.**

**Implementation status:** Partially implemented on `main`; release readiness is not established. Evidence is recorded as dated history in Part VIII (Multi-Agent Evaluation) and in `docs/reports/FEATURE_STATUS_2026-10-21.md` (Appendix E, items V61-01 and V61-29).

---
