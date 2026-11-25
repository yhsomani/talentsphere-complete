# TalentSphere product blueprint

> **Status.** Intent, not ratified. Nothing here claims anything is built; what is built is in `ARCHITECTURE.md` and `project-mindmap/`. Decision `DEC-001`: this blueprint does not supersede `SSOT.md` until `OD-PRD-31` defines ratification.
>
> **What this file holds.** Entry point, conventions, glossary and final audit of the blueprint.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

| Section | Former file |
|---|---|
| TalentSphere Product Blueprint | `PRODUCT_BLUEPRINT/00_START_HERE/README.md` |
| Blueprint Conventions | `PRODUCT_BLUEPRINT/00_START_HERE/CONVENTIONS.md` |
| Glossary | `PRODUCT_BLUEPRINT/00_START_HERE/GLOSSARY.md` |
| Final Audit Report | `PRODUCT_BLUEPRINT/00_START_HERE/FINAL_AUDIT_REPORT.md` |

## TalentSphere Product Blueprint

_Former file: `PRODUCT_BLUEPRINT/00_START_HERE/README.md`._

The complete, from-scratch definition of the intended product: a career operating system covering identity, learning, assessment, evidence, hiring, networking, institutions and adjacent career services. It is written so a development team can build the product without inventing features or business rules.

**Status.** Everything here is intended product definition. Nothing in this folder claims anything is built. What is built is recorded only in [`ARCHITECTURE.md`](../../ARCHITECTURE.md) and [`docs/reports/`](../reports). Existing documents (`SSOT.md`, `docs/`, `Yash_Final_Project_Document/`) were used as inputs and are not changed; see [legacy disposition](11_LEGACY_DISPOSITION.md#legacy-documentation-disposition-plan).

**Not decided here.** Business objectives, prices, volumes, targets, dates, headcount and legal positions are not invented. Every unknown is an open decision (`OD-`) in the [register](09_REGISTERS/OPEN_DECISIONS_REGISTER.md) with options and a default proposal. Compliance content needs counsel review; it is not legal advice.

### Where to start

| If you want to                         | Read                                                                                                                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Understand the product in five minutes | [Master mind map](10_MINDMAPS.md#00_master_mindmapmd), then [vision and strategy](01_PRODUCT.md#01--vision-and-strategy)                                                       |
| Know who uses it and what they can do  | [Personas and roles](01_PRODUCT.md#03--personas-and-roles), [permission matrix](01_PRODUCT.md#04--permission-matrix), [journeys](01_PRODUCT.md#05--user-journeys)           |
| Build or review one feature area       | The module file in [`02_MODULES`](02_MODULES/) (table below)                                                                                                                   |
| Decide what is still open              | [Stakeholder decisions](01_PRODUCT.md#08--stakeholder-decisions-needed), [open decisions register](09_REGISTERS/OPEN_DECISIONS_REGISTER.md)                                  |
| Plan the build                         | [Lifecycle roadmap](08_ROADMAP.md#lifecycle-roadmap), [tier plan](08_ROADMAP.md#tier-plan-r0-to-r6), [technical index](04_ARCHITECTURE.md#08--technical-specification-index) |
| Check consistency                      | [Final audit report](#final-audit-report), [integrity report](09_REGISTERS/OTHER_REGISTERS.md#integrity_reportmd), [acceptance coverage](09_REGISTERS/OTHER_REGISTERS.md#acceptance_criteria_coveragemd)      |
| Learn the notation                     | [Conventions](#blueprint-conventions), [glossary](#glossary)                                                                                                                            |

### Contents

| Folder                                                         | Contents                                                                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`00_START_HERE`](#)                                           | This index, conventions, glossary                                                                                                |
| [`01_PRODUCT`](01_PRODUCT.md)                                 | Vision, scope, personas, permissions, journeys, business model and cross-module rules, module map, decisions needed              |
| [`02_MODULES`](02_MODULES/)                                 | 30 module specifications: features, rules, state machines, screens, entities, events, metrics, decisions, risks                  |
| [`03_EXPERIENCE`](03_EXPERIENCE.md)                           | Information architecture, design system, interaction patterns, accessibility, responsive and PWA UX, microcopy, screen checklist |
| [`04_ARCHITECTURE`](04_ARCHITECTURE.md)                       | System architecture, data model, API, events, integrations, AI, search and media, technical index                                |
| [`05_SECURITY_PRIVACY`](05_SECURITY_PRIVACY.md)               | Security architecture, privacy and data governance, compliance map, AI fairness                                                  |
| [`06_QUALITY_AND_PERFORMANCE`](06_QUALITY_AND_PERFORMANCE.md) | Non-functional requirements, QA strategy, engineering standards                                                                  |
| [`07_DEVOPS_AND_OPERATIONS`](07_DEVOPS_AND_OPERATIONS.md)     | Infrastructure and deployment, operations and support, maintenance                                                               |
| [`08_ROADMAP`](08_ROADMAP.md)                                 | Lifecycle roadmap, tier plan, decision gates and critical path                                                                   |
| [`09_REGISTERS`](09_REGISTERS/)                             | Generated registers: features, rules, decisions, risks, dependencies, screens, events, entities, NFRs                            |
| [`10_MINDMAPS`](10_MINDMAPS.md)                               | Master mind map and detailed maps per domain                                                                                     |
| [`11_LEGACY_DISPOSITION`](11_LEGACY_DISPOSITION.md)           | What happens to the older documents; legacy feature coverage                                                                     |

### Modules

| Code | Module                                                           | Specification                                                             |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| IDN  | Identity, Authentication and Account                             | [file](02_MODULES/IDN_Identity_Authentication_Account.md)              |
| SET  | Settings, Privacy, Consent and Data Rights                       | [file](02_MODULES/SET_Settings_Privacy_Consent.md)                     |
| NTF  | Notifications and Communication Channels                         | [file](02_MODULES/NTF_Notifications_Communication.md)                  |
| REP  | Gamification, Reputation and Recognition                         | [file](02_MODULES/REP_Gamification_Reputation.md)                      |
| PRF  | Profile, Resume and Portfolio                                    | [file](02_MODULES/PRF_Profile_Resume_Portfolio.md)                     |
| EVD  | Evidence, Work History and Credentials                           | [file](02_MODULES/EVD_Evidence_Work_History_Credentials.md)            |
| BGV  | Verification and Background Checks                               | [file](02_MODULES/BGV_Verification_Background_Checks.md)               |
| SRC  | Search and Discovery                                             | [file](02_MODULES/SRC_Search_Discovery.md)                             |
| LRN  | Learning and Course Experience                                   | [file](02_MODULES/LRN_Learning_Course_Experience.md)                   |
| STU  | Instructor Studio and Content Production                         | [file](02_MODULES/STU_Instructor_Studio_Content_Production.md)         |
| ASM  | Assessments, Challenges and Integrity                            | [file](02_MODULES/ASM_Assessments_Challenges_Integrity.md)             |
| JOB  | Job Marketplace and Candidate Applications                       | [file](02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md)       |
| ATS  | Recruiter Workspace and Hiring Pipeline                          | [file](02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md)          |
| INT  | Interviews and Scheduling                                        | [file](02_MODULES/INT_Interviews_Scheduling.md)                        |
| EMP  | Employer Organisation, Teams and Brand                           | [file](02_MODULES/EMP_Employer_Organisation_Teams_Brand.md)            |
| NET  | Networking, Community and Referrals                              | [file](02_MODULES/NET_Networking_Community_Referrals.md)               |
| MSG  | Messaging and Real-time Communication                            | [file](02_MODULES/MSG_Messaging_Realtime_Communication.md)             |
| AIC  | AI Career Assistant, Matching and Recommendations                | [file](02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md) |
| TSF  | Trust, Safety and Moderation                                     | [file](02_MODULES/TSF_Trust_Safety_Moderation.md)                      |
| INS  | Institutions and Managed Learning                                | [file](02_MODULES/INS_Institutions_Managed_Learning.md)                |
| BIL  | Billing, Plans and Entitlements                                  | [file](02_MODULES/BIL_Billing_Plans_Entitlements.md)                   |
| MEN  | Mentorship, Coaching and Career Services (expansion)             | [file](02_MODULES/MEN_Mentorship_Coaching_Career_Services.md)          |
| GIG  | Freelance, Contract and Project Work (expansion)                 | [file](02_MODULES/GIG_Freelance_Contract_Project_Work.md)              |
| EVT  | Events, Hackathons and Community Programmes (expansion)          | [file](02_MODULES/EVT_Events_Hackathons_Community_Programmes.md)       |
| MKT  | Market Intelligence and Career Pathing (expansion)               | [file](02_MODULES/MKT_Market_Intelligence_Career_Pathing.md)           |
| ENT  | Enterprise Talent: Internal Mobility, Skills and L&D (expansion) | [file](02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md)          |
| ANL  | Analytics, Reporting and Insights                                | [file](02_MODULES/ANL_Analytics_Reporting_Insights.md)                 |
| ADM  | Admin Console, Support and Operations                            | [file](02_MODULES/ADM_Admin_Console_Support_Operations.md)             |
| PWA  | PWA, Offline, Mobile and Browser Extension                       | [file](02_MODULES/PWA_PWA_Offline_Mobile_Extension.md)                 |
| PLT  | Platform: Public API, Webhooks, Integrations, Media and Files    | [file](02_MODULES/PLT_Platform_API_Integrations_Media_Files.md)        |

### At a glance

Counts are extracted from the specs by the register generator (see [integrity report](09_REGISTERS/OTHER_REGISTERS.md#integrity_reportmd)); they change when specs change.

| Item                                               | Count                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| Modules                                            | 30 (25 core, 5 OS-expansion)                                                 |
| Features (`FR-`)                                   | 1,144                                                                        |
| Business rules (`BR-`)                             | 1,273                                                                        |
| State machines (`SM-`)                             | 224                                                                          |
| Screens (`SCR-`)                                   | 930                                                                          |
| Domain events (`EVT-`)                             | 900                                                                          |
| Data entities (`ENT-`)                             | 707                                                                          |
| Non-functional requirements (`NFR-`)               | 511                                                                          |
| User journeys (`JRN-`)                             | 78                                                                           |
| Open decisions (`OD-`)                             | 598                                                                          |
| Risks (`RSK-`)                                     | 428                                                                          |
| Recorded decisions (`DEC-`)                        | 27                                                                           |
| Legacy features accounted for                      | 173 of 173 ([coverage](11_LEGACY_DISPOSITION.md#legacy-feature-coverage-f-01-to-f-173)) |
| Specification text (excluding generated registers) | about 68,976 lines                                                           |

### Known limits of this blueprint

- It is a specification, not a verified design: no usability test, legal review, load test, vendor evaluation or prototype has been done. Each of those is a roadmap activity.
- Business decisions are open by design: see the [open decisions register](09_REGISTERS/OPEN_DECISIONS_REGISTER.md). A team can start R0 only after the U1 decisions close ([decision gates](08_ROADMAP.md#decision-gates-and-critical-path)).
- The 14 features added to close legacy gaps have no screen rows yet ([coverage file §7](11_LEGACY_DISPOSITION.md#legacy-feature-coverage-f-01-to-f-173)).
- Cross-module overlaps were found while writing and are recorded as open decisions, not resolved: skills taxonomy owner, organization entities, coupons (STU and BIL), event-name prefixes, the shared suppression rule (ANL and MKT), and session model. The integrity report lists dangling ids (currently only the template placeholder).
- Mermaid diagrams were written to GitHub's renderer rules but not rendered in this environment.

### Authority and precedence

1. **What exists today:** the code, then `ARCHITECTURE.md`. Nothing in this folder overrides them.
2. **What the product should be:** this blueprint, once ratified (`OD-PRD-31`). Until then it is the proposed complete definition and `SSOT.md` remains the founder intent of record.
3. **Conflicts** between the blueprint and legacy documents are never resolved silently; each is an `OD-` or a `DEC-` entry.

### Keeping it current

The registers in [`09_REGISTERS`](09_REGISTERS/) and the mind maps in [`10_MINDMAPS`](10_MINDMAPS.md) are generated from the specs; edit the specs, then regenerate. Rules for ids, evidence tags and the feature template are in [CONVENTIONS](#blueprint-conventions). Change control is in the [lifecycle roadmap](08_ROADMAP.md#lifecycle-roadmap) §4.

## Blueprint Conventions

_Former file: `PRODUCT_BLUEPRINT/00_START_HERE/CONVENTIONS.md`._

Rules every document in `PRODUCT_BLUEPRINT/` follows. They exist so independently written files stay consistent and so the registries can be generated from the specs instead of hand-copied.

### 1. Status of everything in this folder

Everything here describes the **intended complete product**. Nothing in this folder is a claim that anything is built. Existing source code and the legacy documents (`SSOT.md`, `docs/`, `Yash_Final_Project_Document/`) are **inputs**, never limits. What is actually built is recorded only in `ARCHITECTURE.md` and `docs/reports/`.

### 2. Evidence tags

Every non-obvious statement carries one tag:

| Tag         | Meaning                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------- |
| `[SRC]`     | Taken from a legacy document or the code. Cite it: `[SRC: SSOT §9.7]`.                                                |
| `[DER]`     | Derived: a logical consequence of sourced intent plus standard practice for this kind of product.                     |
| `[PROP]`    | Proposed: a capability a complete product should have that no source mentions. Stands until a stakeholder rejects it. |
| `[DEC-REQ]` | Needs a stakeholder decision. Always paired with an `OD-` id. Never silently resolved.                                |

Do not invent business objectives, prices, targets, volumes, deadlines or headcount. When a number is needed and unknown, write the parameter name, give a **default proposal** marked `[PROP]`, and open an `OD-`.

### 3. Identifier scheme

| Prefix | Meaning                                                         | Format                                          | Example        |
| ------ | --------------------------------------------------------------- | ----------------------------------------------- | -------------- |
| Module | Product module                                                  | 3-letter code (table in §4)                     | `LRN`          |
| `FR-`  | Feature                                                         | `FR-<MOD>-<nnn>`                                | `FR-LRN-014`   |
| `BR-`  | Business rule (new namespace; legacy `BR-001…248` are separate) | `BR-<MOD>-<nnn>`                                | `BR-LRN-007`   |
| `SM-`  | State machine                                                   | `SM-<MOD>-<nn>`                                 | `SM-LRN-02`    |
| `SCR-` | Screen                                                          | `SCR-<MOD>-<nnn>`                               | `SCR-LRN-011`  |
| `EVT-` | Domain event                                                    | `EVT-<MOD>-<nnn>` (name `module.entity.action`) | `EVT-LRN-003`  |
| `ENT-` | Data entity                                                     | `ENT-<MOD>-<nn>`                                | `ENT-LRN-04`   |
| `JRN-` | User journey                                                    | `JRN-<ROLE>-<nn>`                               | `JRN-CAN-03`   |
| `NFR-` | Non-functional requirement                                      | `NFR-<AREA>-<nnn>`                              | `NFR-PERF-004` |
| `OD-`  | Open decision (stakeholder input)                               | `OD-<MOD or AREA>-<nn>`                         | `OD-LRN-02`    |
| `RSK-` | Risk                                                            | `RSK-<MOD or AREA>-<nn>`                        | `RSK-ASM-01`   |
| `DEC-` | Recorded decision                                               | `DEC-<nnn>`                                     | `DEC-001`      |
| `API-` | API capability group                                            | `API-<MOD>-<nn>`                                | `API-JOB-03`   |

Ids are never reused. A removed item keeps its id with status `Withdrawn`.

### 4. Module codes

| Code | Module                                                      | Group           |
| ---- | ----------------------------------------------------------- | --------------- |
| IDN  | Identity, Authentication & Account                          | Foundation      |
| SET  | Settings, Privacy, Consent & Data Rights                    | Foundation      |
| NTF  | Notifications & Communication Channels                      | Foundation      |
| REP  | Gamification, Reputation & Recognition                      | Engagement      |
| PRF  | Profile, Resume & Portfolio                                 | Career identity |
| EVD  | Evidence, Work History & Credentials                        | Career identity |
| BGV  | Verification & Background Checks                            | Career identity |
| SRC  | Search & Discovery                                          | Platform        |
| LRN  | Learning & Course Experience                                | Learning        |
| STU  | Instructor Studio & Content Production                      | Learning        |
| ASM  | Assessments, Challenges & Integrity                         | Learning        |
| JOB  | Job Marketplace & Candidate Applications                    | Hiring          |
| ATS  | Recruiter Workspace & Hiring Pipeline                       | Hiring          |
| INT  | Interviews & Scheduling                                     | Hiring          |
| EMP  | Employer Organisation, Teams & Brand                        | Hiring          |
| NET  | Networking, Community & Referrals                           | Social          |
| MSG  | Messaging & Real-time Communication                         | Social          |
| AIC  | AI Career Assistant, Matching & Recommendations             | Intelligence    |
| TSF  | Trust, Safety & Moderation                                  | Governance      |
| INS  | Institutions & Managed Learning                             | Institutions    |
| BIL  | Billing, Plans & Entitlements                               | Commercial      |
| MEN  | Mentorship, Coaching & Career Services                      | OS expansion    |
| GIG  | Freelance, Contract & Project Work                          | OS expansion    |
| EVT  | Events, Hackathons & Community Programmes                   | OS expansion    |
| MKT  | Market Intelligence & Career Pathing                        | OS expansion    |
| ENT  | Enterprise Talent: Internal Mobility, Skills & L&D          | OS expansion    |
| ANL  | Analytics, Reporting & Insights                             | Platform        |
| ADM  | Admin Console, Support & Operations                         | Governance      |
| PWA  | PWA, Offline, Mobile & Browser Extension                    | Platform        |
| PLT  | Platform: Public API, Webhooks, Integrations, Media & Files | Platform        |

"OS expansion" modules are **proposed scope** (the stakeholder goal is an "operating system" for the whole career domain, which exceeds `SSOT.md` §4.2). They are specified fully but gated by `DEC-002` / an `OD-` before any build.

### 5. Roles (canonical short codes)

`GUE` Guest · `CAN` Candidate / Professional · `STD` Student (candidate attached to an institution) · `INS` Instructor · `MNT` Mentor / Coach · `FRL` Freelancer (a Candidate with gig mode) · `REC` Recruiter · `HMG` Hiring Manager · `EAD` Employer Admin · `IAD` Institution Admin · `PLO` Placement Officer · `EXA` Enterprise Talent / L&D Admin · `MOD` Moderator · `SUP` Support Agent · `FIN` Finance Operator · `PAD` Platform Admin · `SAD` Super Admin / Security Officer · `API` Integration / Service Principal.

Permissions are written as `role: action` pairs, never as vague "admins can manage".

### 6. Release tiers (dependency-based, no dates)

`R0` foundations · `R1` core career loop · `R2` hiring marketplace · `R3` institutions and instructors · `R4` intelligence and trust at scale · `R5` commercial scale · `R6` OS expansion. A feature's tier follows its dependencies, not a calendar. Priority is MoSCoW (`Must` / `Should` / `Could` / `Won't-now`).

### 7. Feature specification template (mandatory)

Each feature is a level-3 heading `### FR-<MOD>-<nnn> — <Name>` followed by exactly these fields, in this order. Fields that genuinely do not apply say `n/a — <why>`; they are never omitted.

```markdown
### FR-XXX-000 — Feature name

- **Sub-module:** …
- **Priority / tier:** Must|Should|Could|Won't-now · R0–R6
- **Source:** [SRC: …] | [DER] | [PROP]
- **Purpose and outcome:** one or two sentences: what the user achieves and how the system knows.
- **Roles and permissions:** `CAN: view, create` · `REC: view` · `PAD: override with audit`
- **Preconditions and entry points:** where the user starts; what must be true.
- **User interactions and actions:** numbered, observable steps (click, type, drag, keyboard).
- **System behaviour:** what the system does in response, including side effects, async work, idempotency.
- **UI elements and controls:** each control by name and type, default, states.
- **Configuration options:** user, org and platform level settings, with defaults.
- **Business rules:** `BR-XXX-000` ids with the rule text defined in the module's rule table.
- **Validation:** field-by-field constraints (type, length, format, range, required, uniqueness).
- **Inputs and outputs:** data in; data and system responses out (success payload shape in words).
- **Filters, sorting, search:** or `n/a — <why>`.
- **Notifications and communication:** trigger, channel, recipient, template name, opt-out class.
- **Error handling and edge cases:** each failure and boundary condition with the exact system response.
- **Dependencies:** `FR-…`, `ENT-…`, external services.
- **Security and privacy:** authz, data classification, audit, abuse controls.
- **Acceptance criteria:** at least three Given/When/Then lines including one negative case.
```

### 8. Module file structure (mandatory)

`02_MODULES/<CODE>_<Name>.md`:

1. Purpose, outcomes and boundaries (in scope / out of scope / owned vs consumed)
2. Roles and permission matrix (role × capability table)
3. Sub-module map
4. Feature specifications (template §7), grouped by sub-module
5. Business rule table (`BR-`: id, rule, rationale, enforced where, source tag)
6. State machines (`SM-`: states, transitions, guards, triggers, terminal states) with a Mermaid `stateDiagram-v2`
7. Screen inventory (`SCR-`: name, route proposal, roles, purpose, key states)
8. Data entities owned (`ENT-`: name, key attributes, relationships, retention class)
9. Events emitted and consumed (`EVT-`)
10. Integrations and external dependencies
11. Cross-module dependencies (table: depends on / depended on by)
12. Module-level metrics (definition, formula, owner role)
13. Open decisions (`OD-`: question, options, default proposal, who decides, blocking what)
14. Risks (`RSK-`)
15. Legacy source trace (which legacy files informed this; what was dropped and why)

Registers are generated from these headings and tables, so the heading and id formats are exact.

### 9. Mermaid rules

Mermaid renders on GitHub. Use `flowchart`, `stateDiagram-v2`, `erDiagram`, `sequenceDiagram`, `mindmap`. In `mindmap` nodes avoid parentheses, brackets, colons, quotes and `&`; use plain words. Quote flowchart labels that contain punctuation: `A["Apply (draft)"]`.

### 10. Links and style

Relative links only. British or American spelling consistently: **American**. Plain language, no marketing tone, no emoji. Tables for matrices; numbered steps for procedures. Files are Prettier-formatted Markdown.

## Glossary

_Former file: `PRODUCT_BLUEPRINT/00_START_HERE/GLOSSARY.md`._

One meaning per term, used the same way in every blueprint file. Terms carried from `SSOT.md` §26 keep their sense; where this blueprint sharpens or changes a term, the note says so.

### Product terms

| Term                                    | Definition                                                                                                                                                                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Career operating system**             | The product goal: one platform covering the whole career domain (identity, learning, assessment, evidence, hiring, networking, institutions and adjacent career services). It is a breadth metaphor, not a device-level operating system (`DEC-002`; `SSOT.md` §4.1). |
| **Candidate** (`CAN`)                   | An individual professional using the product to build a career. The default role.                                                                                                                                                                                     |
| **Student** (`STD`)                     | A candidate attached to an institution; may be a managed learner.                                                                                                                                                                                                     |
| **Managed learner**                     | A user whose learning is provisioned and visible to an institution within the scope the institution agreement and consent allow.                                                                                                                                      |
| **Graduation transition**               | The process by which a managed learner becomes an independent candidate, keeping the credentials earned.                                                                                                                                                              |
| **Evidence**                            | Proof attached to a claim (skill, work history, credential), with an issuer, a source and a verification level. A claim without evidence is a claim, not proof.                                                                                                       |
| **Evidence ladder**                     | The ordered verification levels that evidence climbs (self-asserted up to independently verified). Defined in the `EVD` module.                                                                                                                                       |
| **Credential**                          | An issued recognition (certificate, badge, attestation) with an explicit lifecycle: issued, valid, expired, revoked.                                                                                                                                                  |
| **Verifiable credential**               | A credential that a third party can check without contacting the platform, using an open standard. Optional per `OD-EVD-*`.                                                                                                                                           |
| **Verified signal**                     | A credential or evidence item earned on the platform, as opposed to imported or self-declared.                                                                                                                                                                        |
| **Skill**                               | A node in the skills taxonomy with a stable `SK-` id. The taxonomy owner is an open decision (`OD-ARC-07`).                                                                                                                                                           |
| **Skills graph**                        | Relationships among skills (synonyms, parents, prerequisites, adjacency).                                                                                                                                                                                             |
| **Requisition**                         | An employer's authorized request to fill a role; one requisition can produce one or more job postings.                                                                                                                                                                |
| **Posting / listing**                   | `ATS` owns the posting; `JOB` owns the candidate-facing listing projection and applications.                                                                                                                                                                          |
| **Application**                         | A candidate's submission to a listing, with a snapshot of what they submitted.                                                                                                                                                                                        |
| **Pipeline**                            | The ordered stages through which applications move.                                                                                                                                                                                                                   |
| **Scorecard**                           | A structured, criteria-based interview evaluation.                                                                                                                                                                                                                    |
| **Human in the loop**                   | AI may assist but never takes a consequential decision alone; a named human is recorded on every such decision.                                                                                                                                                       |
| **Consequential decision**              | A decision that materially affects a person's access to work, learning, money or standing (reject, rank for removal, sanction, certify, pay).                                                                                                                         |
| **Consent scope**                       | A named purpose a person grants or withdraws permission for. The catalogue is owned by `SET`.                                                                                                                                                                         |
| **Cohort suppression (`min_cohort_k`)** | The minimum group size below which an aggregate is not shown, to prevent re-identification. Value is `OD-PRD-12`.                                                                                                                                                     |
| **Entitlement**                         | A capability a plan, license or grant gives an account. Enforced server-side; owned by `BIL`.                                                                                                                                                                         |
| **Seat pool**                           | A purchased set of seats an institution or organization assigns to people.                                                                                                                                                                                            |
| **OS-expansion module**                 | A module beyond the SSOT scope (`MEN`, `GIG`, `EVT`, `MKT`, `ENT`). Fully specified, denied by policy until admitted (`OD-PRD-02`).                                                                                                                                   |

### Blueprint terms

| Term                           | Definition                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Module**                     | A bounded area of the product with a three-letter code (see [CONVENTIONS](#blueprint-conventions) §4).      |
| **Sub-module**                 | A grouping of related features inside a module (lettered A, B, C in the module file).               |
| **Feature (`FR-`)**            | One specified capability with the full template.                                                    |
| **Business rule (`BR-`)**      | A rule the system enforces, with rationale and enforcement point.                                   |
| **State machine (`SM-`)**      | A lifecycle with states, transitions, guards and triggers.                                          |
| **Open decision (`OD-`)**      | A question needing stakeholder input, with options and a default proposal. Never silently resolved. |
| **Recorded decision (`DEC-`)** | A decision already taken, with who decided and when.                                                |
| **Release tier (`R0`-`R6`)**   | A dependency-based grouping of features; not a date.                                                |
| **Evidence tags**              | `[SRC]` sourced, `[DER]` derived, `[PROP]` proposed, `[DEC-REQ]` needs a decision.                  |
| **As-built**                   | What the repository's code does today, recorded only in `ARCHITECTURE.md` and `docs/reports/`.      |
| **Intended**                   | What this blueprint says the product should be.                                                     |

### Technical terms

| Term                 | Definition                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Modular monolith** | One deployable application organized into modules with enforced boundaries; the starting architecture.                                                       |
| **Outbox**           | A table written in the same transaction as a state change; a dispatcher publishes its rows as events, so no change is lost or announced without being saved. |
| **Idempotency key**  | A client-supplied token that makes a repeated request produce one effect.                                                                                    |
| **Tenant**           | The ownership boundary for data: a user, employer organization, institution or enterprise workspace.                                                         |
| **RLS**              | Row-level security: database policies that restrict rows by tenant and principal.                                                                            |
| **Adapter / port**   | A provider-neutral interface (port) and a vendor-specific implementation (adapter) so vendors can be swapped.                                                |
| **DSAR**             | Data subject access request: a person exercising privacy rights (access, export, correction, erasure).                                                       |
| **DPIA**             | Data protection impact assessment.                                                                                                                           |
| **SLO / SLI**        | Service level objective / indicator: a measurable reliability target and the measurement behind it.                                                          |
| **PWA**              | Progressive web app: installable web application with offline support.                                                                                       |
| **RPO / RTO**        | Recovery point / time objective: tolerated data loss / downtime after a failure.                                                                             |
| **SSRF**             | Server-side request forgery: tricking the server into fetching an internal resource.                                                                         |
| **MoSCoW**           | Must, Should, Could, Won't-now priority classes.                                                                                                             |

## Final Audit Report

_Former file: `PRODUCT_BLUEPRINT/00_START_HERE/FINAL_AUDIT_REPORT.md`._

Audit of the `PRODUCT_BLUEPRINT/` documentation set as of the commit that adds this file. It states what exists, what was checked, what was not, and what is still open. It does not claim completeness beyond the evidence below.

### 1. Scope of the work

Documentation only. No application source, configuration, dependency, migration, build file or infrastructure was changed. The 126-commit history shows the blueprint was added in `PRODUCT_BLUEPRINT/` and legacy documents were left untouched.

### 2. What exists

| Area                                                            | Location                     | Size       |
| --------------------------------------------------------------- | ---------------------------- | ---------- |
| Product vision, scope, personas, permissions, journeys, rules   | `01_PRODUCT`                 | 8 files    |
| Module specifications                                           | `02_MODULES`                 | 30 modules |
| Experience (IA, design system, interaction, a11y, PWA, content) | `03_EXPERIENCE`              | 7 files    |
| Architecture (system, data, API, events, integrations, AI)      | `04_ARCHITECTURE`            | 8 files    |
| Security, privacy, compliance map, AI fairness                  | `05_SECURITY_PRIVACY`        | 4 files    |
| NFRs, QA strategy, engineering standards                        | `06_QUALITY_AND_PERFORMANCE` | 3 files    |
| Infrastructure, operations, maintenance                         | `07_DEVOPS_AND_OPERATIONS`   | 3 files    |
| Lifecycle roadmap, tier plan, decision gates                    | `08_ROADMAP`                 | 3 files    |
| Registers                                                       | `09_REGISTERS`               | 15 files   |
| Mind maps (master plus 17 domain and technical maps, Mermaid)   | `10_MINDMAPS`                | 19 files   |
| Legacy disposition and coverage                                 | `11_LEGACY_DISPOSITION`      | 2 files    |

Totals (from the generated registers): 1,144 features, 1,273 business rules, 707 data entities, 900 events, 930 screens, 224 state machines, 511 NFRs, 428 risks, 598 open decisions, 27 recorded decisions, 78 user journeys. The set is 106 Markdown files and about 78,000 lines.

### 3. What was checked in this audit

| Check                                                    | Result                                                                                                                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blueprint present on `main`                              | Yes. `main` and the working branch were identical at commit `a048509`.                                                                                                          |
| Integrity report                                         | 6,821 defined ids, 0 duplicates, 2 dangling references; both are the placeholder examples `BR-XXX-000` and `SCR-XXX-000` in the conventions and screen checklist, not real ids. |
| Acceptance coverage                                      | Every one of the 1,144 features has at least three acceptance cases and 17 or more complete fields, per the generated coverage table.                                           |
| Legacy features `F-01…F-173` accounted for               | 173 of 173: 143 covered, 12 merged, 14 gap-closed, 4 deprecated-dropped (`LEGACY_FEATURE_COVERAGE.md`).                                                                         |
| Journey register                                         | **Defect found and fixed in this audit.** The generator matched `J-` headings while the journeys use `JRN-` ids, so the register said 0. It now lists all 78 journeys.          |
| Application code or config modified by blueprint commits | None.                                                                                                                                                                           |

### 4. What was not checked

- This audit did not re-read all 78,000 lines. The consistency claims come from the generated registers and the earlier integrity pass, not from a fresh line-by-line review.
- Mermaid diagrams were not rendered. One diagram block exists in each mind map file; syntax validity is unverified.
- Intra-document links were not machine-checked in this audit.
- Compliance content is a map for counsel to review, not legal advice.
- Nothing in the blueprint was validated against stakeholders. Business objectives, prices, volumes, targets and dates are deliberately not invented; they are open decisions.

### 5. Migration and deletion

**No legacy document was deleted.** The owner asked that old documents be deleted once their need is complete. That need is not complete, for reasons that can each be checked (detail in [`DISPOSITION_PLAN.md`](11_LEGACY_DISPOSITION.md#legacy-documentation-disposition-plan)):

1. The blueprint does not supersede `SSOT.md` until `OD-PRD-31` defines ratification (`DEC-001`).
2. Tests read `docs/PRICING.md` and `docs/system-model/06-route-authorization.md`. Deleting them fails the suite.
3. `CLAUDE.md`, `AGENTS.md`, source comments, migrations, `.prettierignore` and the CI workflow reference `SSOT.md` or `docs/`. Several are protected build files that need explicit owner approval to edit.
4. `ARCHITECTURE.md` and `docs/reports/` are the as-built record and are not superseded by an intended-product blueprint.

The deletion is specified as a seven-step gated procedure. It is recoverable from git history either way. `Yash_Final_Project_Document/` (12 MB) and the superseded `docs/` classes are the candidates once the owner closes `OD-PRD-30` and `OD-PRD-31`.

### 6. Unresolved and needing approval

- 598 open decisions in [`OPEN_DECISIONS_REGISTER.md`](09_REGISTERS/OPEN_DECISIONS_REGISTER.md); the ones that gate the roadmap are in [`08_ROADMAP/03_DECISION_GATES_AND_CRITICAL_PATH.md`](08_ROADMAP.md#decision-gates-and-critical-path).
- Ratification of the blueprint as the baseline (`OD-PRD-31`) and the fate of the prior-implementation reference (`OD-PRD-30`).
- Scope of the operating-system ambition: modules gated by `OD-PRD-02` and `OD-PRD-03` (mentorship, freelance and gig work) are specified but not approved.
- Areas needing primary research: salary and market data sources, background-check vendors per jurisdiction, assessment-integrity tooling, and AI fairness evaluation methods.

### 7. Repository status

- Branch `main` CI has been failing since 2026-10-26, before the blueprint. The run for the blueprint commit (`a048509`, run 264) also failed. This audit did not diagnose the cause and did not touch application code, as the assignment forbids it. The failure should be investigated separately; it is not evidence that the blueprint is faulty, and it is not evidence that it is fine.
- Git status: see the commit that adds this file.
