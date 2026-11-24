# TalentSphere Product Blueprint

The complete, from-scratch definition of the intended product: a career operating system covering identity, learning, assessment, evidence, hiring, networking, institutions and adjacent career services. It is written so a development team can build the product without inventing features or business rules.

**Status.** Everything here is intended product definition. Nothing in this folder claims anything is built. What is built is recorded only in [`ARCHITECTURE.md`](../../ARCHITECTURE.md) and [`docs/reports/`](../../docs/reports/). Existing documents (`SSOT.md`, `docs/`, `Yash_Final_Project_Document/`) were used as inputs and are not changed; see [legacy disposition](../11_LEGACY_DISPOSITION/DISPOSITION_PLAN.md).

**Not decided here.** Business objectives, prices, volumes, targets, dates, headcount and legal positions are not invented. Every unknown is an open decision (`OD-`) in the [register](../09_REGISTERS/OPEN_DECISIONS_REGISTER.md) with options and a default proposal. Compliance content needs counsel review; it is not legal advice.

## Where to start

| If you want to                         | Read                                                                                                                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Understand the product in five minutes | [Master mind map](../10_MINDMAPS/00_MASTER_MINDMAP.md), then [vision and strategy](../01_PRODUCT/01_VISION_AND_STRATEGY.md)                                                       |
| Know who uses it and what they can do  | [Personas and roles](../01_PRODUCT/03_PERSONAS_AND_ROLES.md), [permission matrix](../01_PRODUCT/04_PERMISSION_MATRIX.md), [journeys](../01_PRODUCT/05_USER_JOURNEYS.md)           |
| Build or review one feature area       | The module file in [`02_MODULES`](../02_MODULES/) (table below)                                                                                                                   |
| Decide what is still open              | [Stakeholder decisions](../01_PRODUCT/08_STAKEHOLDER_DECISIONS_NEEDED.md), [open decisions register](../09_REGISTERS/OPEN_DECISIONS_REGISTER.md)                                  |
| Plan the build                         | [Lifecycle roadmap](../08_ROADMAP/01_LIFECYCLE_ROADMAP.md), [tier plan](../08_ROADMAP/02_TIER_PLAN.md), [technical index](../04_ARCHITECTURE/08_TECHNICAL_SPECIFICATION_INDEX.md) |
| Check consistency                      | [Integrity report](../09_REGISTERS/INTEGRITY_REPORT.md), [acceptance coverage](../09_REGISTERS/ACCEPTANCE_CRITERIA_COVERAGE.md)                                                   |
| Learn the notation                     | [Conventions](CONVENTIONS.md), [glossary](GLOSSARY.md)                                                                                                                            |

## Contents

| Folder                                                         | Contents                                                                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`00_START_HERE`](.)                                           | This index, conventions, glossary                                                                                                |
| [`01_PRODUCT`](../01_PRODUCT/)                                 | Vision, scope, personas, permissions, journeys, business model and cross-module rules, module map, decisions needed              |
| [`02_MODULES`](../02_MODULES/)                                 | 30 module specifications: features, rules, state machines, screens, entities, events, metrics, decisions, risks                  |
| [`03_EXPERIENCE`](../03_EXPERIENCE/)                           | Information architecture, design system, interaction patterns, accessibility, responsive and PWA UX, microcopy, screen checklist |
| [`04_ARCHITECTURE`](../04_ARCHITECTURE/)                       | System architecture, data model, API, events, integrations, AI, search and media, technical index                                |
| [`05_SECURITY_PRIVACY`](../05_SECURITY_PRIVACY/)               | Security architecture, privacy and data governance, compliance map, AI fairness                                                  |
| [`06_QUALITY_AND_PERFORMANCE`](../06_QUALITY_AND_PERFORMANCE/) | Non-functional requirements, QA strategy, engineering standards                                                                  |
| [`07_DEVOPS_AND_OPERATIONS`](../07_DEVOPS_AND_OPERATIONS/)     | Infrastructure and deployment, operations and support, maintenance                                                               |
| [`08_ROADMAP`](../08_ROADMAP/)                                 | Lifecycle roadmap, tier plan, decision gates and critical path                                                                   |
| [`09_REGISTERS`](../09_REGISTERS/)                             | Generated registers: features, rules, decisions, risks, dependencies, screens, events, entities, NFRs                            |
| [`10_MINDMAPS`](../10_MINDMAPS/)                               | Master mind map and detailed maps per domain                                                                                     |
| [`11_LEGACY_DISPOSITION`](../11_LEGACY_DISPOSITION/)           | What happens to the older documents; legacy feature coverage                                                                     |

## Modules

| Code | Module                                                           | Specification                                                             |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| IDN  | Identity, Authentication and Account                             | [file](../02_MODULES/IDN_Identity_Authentication_Account.md)              |
| SET  | Settings, Privacy, Consent and Data Rights                       | [file](../02_MODULES/SET_Settings_Privacy_Consent.md)                     |
| NTF  | Notifications and Communication Channels                         | [file](../02_MODULES/NTF_Notifications_Communication.md)                  |
| REP  | Gamification, Reputation and Recognition                         | [file](../02_MODULES/REP_Gamification_Reputation.md)                      |
| PRF  | Profile, Resume and Portfolio                                    | [file](../02_MODULES/PRF_Profile_Resume_Portfolio.md)                     |
| EVD  | Evidence, Work History and Credentials                           | [file](../02_MODULES/EVD_Evidence_Work_History_Credentials.md)            |
| BGV  | Verification and Background Checks                               | [file](../02_MODULES/BGV_Verification_Background_Checks.md)               |
| SRC  | Search and Discovery                                             | [file](../02_MODULES/SRC_Search_Discovery.md)                             |
| LRN  | Learning and Course Experience                                   | [file](../02_MODULES/LRN_Learning_Course_Experience.md)                   |
| STU  | Instructor Studio and Content Production                         | [file](../02_MODULES/STU_Instructor_Studio_Content_Production.md)         |
| ASM  | Assessments, Challenges and Integrity                            | [file](../02_MODULES/ASM_Assessments_Challenges_Integrity.md)             |
| JOB  | Job Marketplace and Candidate Applications                       | [file](../02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md)       |
| ATS  | Recruiter Workspace and Hiring Pipeline                          | [file](../02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md)          |
| INT  | Interviews and Scheduling                                        | [file](../02_MODULES/INT_Interviews_Scheduling.md)                        |
| EMP  | Employer Organisation, Teams and Brand                           | [file](../02_MODULES/EMP_Employer_Organisation_Teams_Brand.md)            |
| NET  | Networking, Community and Referrals                              | [file](../02_MODULES/NET_Networking_Community_Referrals.md)               |
| MSG  | Messaging and Real-time Communication                            | [file](../02_MODULES/MSG_Messaging_Realtime_Communication.md)             |
| AIC  | AI Career Assistant, Matching and Recommendations                | [file](../02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md) |
| TSF  | Trust, Safety and Moderation                                     | [file](../02_MODULES/TSF_Trust_Safety_Moderation.md)                      |
| INS  | Institutions and Managed Learning                                | [file](../02_MODULES/INS_Institutions_Managed_Learning.md)                |
| BIL  | Billing, Plans and Entitlements                                  | [file](../02_MODULES/BIL_Billing_Plans_Entitlements.md)                   |
| MEN  | Mentorship, Coaching and Career Services (expansion)             | [file](../02_MODULES/MEN_Mentorship_Coaching_Career_Services.md)          |
| GIG  | Freelance, Contract and Project Work (expansion)                 | [file](../02_MODULES/GIG_Freelance_Contract_Project_Work.md)              |
| EVT  | Events, Hackathons and Community Programmes (expansion)          | [file](../02_MODULES/EVT_Events_Hackathons_Community_Programmes.md)       |
| MKT  | Market Intelligence and Career Pathing (expansion)               | [file](../02_MODULES/MKT_Market_Intelligence_Career_Pathing.md)           |
| ENT  | Enterprise Talent: Internal Mobility, Skills and L&D (expansion) | [file](../02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md)          |
| ANL  | Analytics, Reporting and Insights                                | [file](../02_MODULES/ANL_Analytics_Reporting_Insights.md)                 |
| ADM  | Admin Console, Support and Operations                            | [file](../02_MODULES/ADM_Admin_Console_Support_Operations.md)             |
| PWA  | PWA, Offline, Mobile and Browser Extension                       | [file](../02_MODULES/PWA_PWA_Offline_Mobile_Extension.md)                 |
| PLT  | Platform: Public API, Webhooks, Integrations, Media and Files    | [file](../02_MODULES/PLT_Platform_API_Integrations_Media_Files.md)        |

## At a glance

Counts are extracted from the specs by the register generator (see [integrity report](../09_REGISTERS/INTEGRITY_REPORT.md)); they change when specs change.

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
| Legacy features accounted for                      | 173 of 173 ([coverage](../11_LEGACY_DISPOSITION/LEGACY_FEATURE_COVERAGE.md)) |
| Specification text (excluding generated registers) | about 68,976 lines                                                           |

## Known limits of this blueprint

- It is a specification, not a verified design: no usability test, legal review, load test, vendor evaluation or prototype has been done. Each of those is a roadmap activity.
- Business decisions are open by design: see the [open decisions register](../09_REGISTERS/OPEN_DECISIONS_REGISTER.md). A team can start R0 only after the U1 decisions close ([decision gates](../08_ROADMAP/03_DECISION_GATES_AND_CRITICAL_PATH.md)).
- The 14 features added to close legacy gaps have no screen rows yet ([coverage file §7](../11_LEGACY_DISPOSITION/LEGACY_FEATURE_COVERAGE.md)).
- Cross-module overlaps were found while writing and are recorded as open decisions, not resolved: skills taxonomy owner, organization entities, coupons (STU and BIL), event-name prefixes, the shared suppression rule (ANL and MKT), and session model. The integrity report lists dangling ids (currently only the template placeholder).
- Mermaid diagrams were written to GitHub's renderer rules but not rendered in this environment.

## Authority and precedence

1. **What exists today:** the code, then `ARCHITECTURE.md`. Nothing in this folder overrides them.
2. **What the product should be:** this blueprint, once ratified (`OD-PRD-31`). Until then it is the proposed complete definition and `SSOT.md` remains the founder intent of record.
3. **Conflicts** between the blueprint and legacy documents are never resolved silently; each is an `OD-` or a `DEC-` entry.

## Keeping it current

The registers in [`09_REGISTERS`](../09_REGISTERS/) and the mind maps in [`10_MINDMAPS`](../10_MINDMAPS/) are generated from the specs; edit the specs, then regenerate. Rules for ids, evidence tags and the feature template are in [CONVENTIONS](CONVENTIONS.md). Change control is in the [lifecycle roadmap](../08_ROADMAP/01_LIFECYCLE_ROADMAP.md) §4.
