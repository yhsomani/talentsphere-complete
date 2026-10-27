# Domain Architecture, Bounded Contexts & Coverage

Doc ID: DOM-00 · Owner: Enterprise Architect · Version 1.0 · Status: Under Review · IDs per `00_CONTROL_CENTRE/ID_REGISTRY.md`

## 1. Method
Domains were derived from the value stream (Learn→Prove→Showcase→Match→Apply→Hire→Grow), actor goals, and the 24 domain families of the mission brief, then **cross-checked against** (not copied from) the reference code layout. Each family was classified Core / Supporting / Enabling / Conditional / Exploratory / Not applicable.

## 2. Context map
```mermaid
flowchart LR
  ID[DOM-01 Identity] --> ORG[DOM-02 Orgs & Roles]
  ID --> PROF[DOM-03 Profile]
  SK[DOM-04 Skills Graph] --> EV[DOM-05 Evidence]
  PROF --> EV
  EV --> VER[DOM-06 Verification]
  LRN[DOM-08 Learning] --> EV
  ASM[DOM-07 Assessment] --> EV
  EV --> MATCH[DOM-11 Matching/Search]
  OPP[DOM-09 Opportunities] --> MATCH
  MATCH --> APP[DOM-10 Applications/ATS]
  APP --> MSG[DOM-13 Messaging]
  APP --> NOTIF[DOM-15 Notifications]
  EV --> CI[DOM-12 Career Intel]
  AI[DOM-17 AI Gateway] -.assist.-> PROF
  AI -.assist.-> LRN
  AI -.assist.-> APP
  AI -.assist.-> CI
  BILL[DOM-16 Billing/Entitlements] -.gates.-> OPP
  BILL -.gates.-> AI
  BILL -.gates.-> MATCH
  PRIV[DOM-22 Privacy/Consent] -.gates.-> EV
  PRIV -.gates.-> MATCH
  PRIV -.gates.-> APP
  SAFE[DOM-19 Safety] -.reviews.-> PROF
  SAFE -.reviews.-> MSG
  SAFE -.reviews.-> OPP
  INST[DOM-18 Institutions] --> LRN
  INST --> ASM
  INST --> EV
  ADMIN[DOM-20 Admin/Support] -.audited access.-> ID
  AN[DOM-21 Analytics] -.reads events.-> APP
```
Integration style: synchronous calls only through each module's **public service interface** (`api/<module>/index.ts`); cross-domain reactions via **outbox events** (ADR-T05/T09). No module reads another module's tables (fitness function FF-02).

**Source-boundary reconciliation (OPEN-47):** root `SSOT.md` §§12 and 21 describes a domain-oriented modular monolith with explicit cross-domain interfaces and no direct table coupling. This target context map consolidates and repartitions some of those source domains and the target frontend retains optional runtime federation. The boundary changes are proposed, not owner-approved supersessions; reconcile ownership, synchronous interfaces, event boundaries, and release coupling before architecture readiness is claimed.

## 3. Context ownership summary
| Context | Aggregate roots | Publishes (examples) | Consumes |
|---|---|---|---|
| Identity | Account, Session, Passkey, Device | `account.registered`, `session.revoked` | — |
| Orgs | Organization, Membership, RoleGrant | `org.member.added` | `account.*` |
| Profile | Profile, Portfolio, ResumeVariant | `profile.updated` | — |
| Skills | Skill, SkillRelation, Competency | `skill.merged` | — |
| Evidence | EvidenceItem, Credential | `evidence.created/verified/revoked` | `assessment.passed`, `course.completed` |
| Verification | VerificationRequest, ReferenceRequest, WorkClaim | `verification.completed` | `evidence.created` |
| Assessment | Assessment, Attempt, IntegritySession | `assessment.passed` | — |
| Learning | Course, Enrollment, Path | `course.completed` | — |
| Opportunities | Job, JobTemplate, SavedSearch | `job.published`, `job.closed` | `org.*` |
| Applications | Application, Pipeline, Interview | `application.submitted`, `application.stage.changed` | `job.*`, `evidence.*` |
| Matching/Search | MatchExplanation (derived), SearchIndex | — | `job.*`, `evidence.*`, `profile.*` |
| Messaging | Conversation, Message | `message.sent` | `application.*` |
| Notifications | Notification, Preference, Delivery | `notification.delivered` | all domain events |
| Billing | Subscription, Entitlement, Invoice | `entitlement.changed` | Stripe webhooks |
| Privacy | ConsentRecord, DataRightsRequest | `consent.changed`, `erasure.completed` | — |
| Safety | Report, ModerationCase | `case.resolved` | content events |
| Admin | SupportAccessGrant, AuditEvent, FeatureFlag | — | all |

## 4. Domain-family coverage (mission families A–X)
| Family | Verdict | Where / rationale |
|---|---|---|
| A Strategy | Core (docs) | 01_* |
| B Identity & accounts | Core-enabling | DOM-01 |
| C Orgs, teams, tenancy | Core-enabling | DOM-02 |
| D Core operations | Core | DOM-05/09/10 |
| E Workflow & automation | Supporting | pipelines (DOM-10), jobs (DOM-24); **no generic workflow engine** (rejected, unjustified) |
| F Search & discovery | Core | DOM-11 |
| G Content & documents | Supporting | evidence artifacts, resumes, course media |
| H Collaboration | Supporting | DOM-13 |
| I Notifications | Supporting | DOM-15 |
| J Billing | Supporting | DOM-16 |
| K Sales/marketing/growth | Supporting (light) | referrals, consented lifecycle email in DOM-15/21; no CRM build |
| L Support & success | Supporting | DOM-20 |
| M Admin & back office | Supporting | DOM-20 |
| N Reporting & analytics | Supporting | DOM-21 |
| O AI | Enabling | DOM-17 |
| P Security, privacy, trust | Core-enabling | 14_*, DOM-19/22 |
| Q Legal & compliance | Conditional | policy hooks only; no legal claims (OPEN-08) |
| R Data governance | Core-enabling | 12_*, DOM-22 |
| S Integrations | Conditional | DOM-23 |
| T Infrastructure & ops | Enabling | 17_*, 18_* |
| U Multi-platform | Core | 08_* |
| V i18n & accessibility | Core | 07_* (English at launch; framework-ready, RTL/locale formats designed) |
| W Quality & release | Enabling | 16_* |
| X Product lifecycle | Supporting | 22_*, 23_* |

## 5. Industry packs
Primary: **HR/recruitment + education marketplace**, B2B SaaS + B2C. Specialised actors: recruiter, hiring manager, referee, instructor, faculty. Regulatory-sensitive: automated employment decisions (human-in-loop), candidate personal data, minors in education (OPEN-09), accessibility. Not applicable: banking, healthcare, logistics, IoT.

## 6. Disposition vs reference (summary)
- **Merge:** challenges + skill certification + contests → one assessment engine (DOM-07); notifications + digest + nudges → DOM-15; saved searches + job alerts.
- **Remove:** legacy chat/stub services, sponsored content, business-development graph.
- **Defer:** groups/events/articles (DOM-14 phase 3), video interview recording + AI feedback, identity verification (OPEN-10), proctoring (vendor-gated).
- **Introduce:** policy module, outbox, referee flow as first-class, consent scopes, capability endpoint, sandbox runner.


# Revision 3 additions (patch 2026-10-27, audit gap closure)

## Cross-cutting product rules: applicability

PROPOSED rules, not implemented. Where a rule applies only to some domains the table says so; elsewhere it is N/A with the reason. Legal effect of any rule (for example date handling in contracts) needs counsel verification.

| Rule | Applies? | PROPOSED rule | Domains | Test |
|---|---|---|---|---|
| Timezone and DST scheduling | **Yes**: interviews, assessment windows, deadlines, notification times, reports | Store instants in **UTC**; store the user's/event's **IANA zone id** (a region/city name, not a fixed offset) next to any human-scheduled time; render in the viewer's zone and show the zone name; recurring items are stored as local wall time + zone and expanded per occurrence so DST shifts keep the intended local hour; nonexistent local times (spring gap) are rejected, ambiguous ones (autumn overlap) are disambiguated explicitly; deadlines state their zone; zone-database updates are a dependency-update task | DOM-10, DOM-07, DOM-09, DOM-15, DOM-21 | TEST-REL-015 |
| Concurrent-edit policy | **Yes**, for shared editable records (job posts, pipeline notes and stages, org settings, profile on several devices incl. offline PWA) | Optimistic concurrency: each editable record carries a version; a write with a stale version is rejected as a conflict and nothing is silently overwritten; the UI offers reload or manual merge; real-time co-editing is N/A in v1 (no evidenced need); offline edits follow INV-T13 and the offline conflict metric MET-045 | DOM-03, DOM-09, DOM-10, DOM-02 | TEST-REL-016 |
| Version history | **Partly** | Yes for evidence, resume versions and consent records (append-only revisions, INV-T11; erasure tombstoning per PRIVACY 6.1); audit trail for org/role/stage changes (events in security doc R3-3). **N/A** for messages (edit/delete policy is a DOM-13 decision) and for general profile fields (current value + audit only) | DOM-05, DOM-03, DOM-22 | existing evidence and consent tests |
| Moderation | **Yes** where user-generated content is visible to others (reported messages, public profile text, course reviews, job posts); **N/A** for private drafts and unshared private evidence | Human decisions only; automated detectors advisory (INV-T09); action ladder, notice with reason, appeal | DOM-19, DOM-13, DOM-14, DOM-09 | existing moderation/appeal tests; PROC-05, PROC-15 in `../18_OPERATIONS_AND_SUPPORT/OPERATIONS_AND_SUPPORT_PROCESSES.md` |

Links: security rules `../14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_ARCHITECTURE.md` R3; tests `../16_QA_AND_TESTING/TEST_CATALOG.md` Revision 3.
