# Capability Map & Feature Hierarchy

Doc ID: PCAP-01 · Owner: Product Director (Functional Spec) · Version 1.0 · Status: Under Review · Relates: DOM-01…DOM-24, MOD-*, ADR-T01, ADR-T14, ADR-T22, INV-T01…INV-T20

> **Revision 2 folded in (2026-10-27)** from `CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md#record-capability-map-phase-reconciliation-rev2`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.

All rows are **[TARGET]** unless tagged. Disposition is judged against the reference product (**[REF]**: the existing repo; used only for lessons, never inherited). A disposition of *Keep* means "the idea survives"; nothing here claims anything is implemented. Priority and phase are product intent, not delivery commitments.

## 0. How to read this document

**Hierarchy:** Domain (DOM) → Capability (CAP-DD-n) → Module (owner: frontend `MOD-*` · backend `api/<name>`, per `ID_REGISTRY.md`) → Feature (`FEAT-DD-NN`) → Micro-feature (`FEAT-DD-NN.k`).

**Micro-feature IDs** extend the parent: `FEAT-03-04.1` is micro-feature 1 of `FEAT-03-04`. Specs may cite either level.

**Disposition legend:** Keep · Improve (same idea, better) · Redesign (new shape) · Merge (absorbs ≥2 reference features) · Split · Replace (different mechanism) · Remove (deliberately not built; reason recorded) · Introduce (no reference equivalent) · Defer (wanted, later, gated by a trigger).

**Priority:** P0 loop cannot function / safety-critical; P1 important; P2 nice or later. **Phase:** these Ph0-Ph4 tags are proposed product sequencing, not the canonical SSOT phase numbers or release approval. Ph1 is a pre-GA pilot; Ph2 is the complete-loop GA candidate. The feature-to-work-package crosswalk remains open under REVW-10 and OPEN-42. `-` phase = not built.

**Phase-1 note [PROPOSED]:** Phase 1 includes a minimum candidate path and job/application foundation, but not the full hiring workflow. It is pre-GA and any production exposure is a bounded pilot only. Phase 2 must add human interview and outcome recording plus candidate-controlled new evidence before GA; feature-to-WP phase reconciliation and owner review remain open (OPEN-42).

**Portfolio identity [OPEN]:** root `SSOT.md` section 7 defines 173 canonical `F-*` feature identities. This document's 253 `FEAT-*` rows are a separate, more decomposed hierarchy and are not a one-to-one replacement. A candidate, owner-unapproved mapping is in [SSOT_FEATURE_CROSSWALK](../28_TRACEABILITY_AND_COVERAGE/SSOT_FEATURE_CROSSWALK.md); it explicitly records unmatched items and partial overlaps. Do not report the crosswalk as approved or 253 as the canonical portfolio count. Reconcile stable IDs and traceability before claiming portfolio coverage (REVW-17/36; OPEN-41).

Backend names: `api/identity`, `api/orgs`, `api/profile`, `api/skills`, `api/evidence`, `api/verification`, `api/assessment`, `api/learning`, `api/jobs`, `api/applications`, `api/search`, `api/matching`, `api/careerintel`, `api/messaging`, `api/network`, `api/notify`, `api/billing`, `api/ai`, `api/institutions`, `api/safety`, `api/admin`, `api/analytics`, `api/privacy`, `api/integrations`, `api/platform`, `apps/worker` (BMOD-WORKER), `packages/policy` (BMOD-POLICY).

## 1. Business capability map

| CAP | Domain | Capability | Outcome the business needs |
|---|---|---|---|
| CAP-01-1 | DOM-01 | Account lifecycle | A person can exist on the platform safely and leave it cleanly |
| CAP-01-2 | DOM-01 | Authentication | Only the account holder can sign in; phishing-resistant option exists |
| CAP-01-3 | DOM-01 | Session & device control | Sessions are short-lived, revocable, and visible to the holder |
| CAP-01-4 | DOM-01 | Account recovery | Locked-out holders recover without weakening security |
| CAP-01-5 | DOM-01 | Access context | UI knows what a principal may do (hints only) and can switch scope |
| CAP-02-1 | DOM-02 | Organization lifecycle | Employers/institutions become verified tenants |
| CAP-02-2 | DOM-02 | Membership & role administration | Org owners control who can do what |
| CAP-02-3 | DOM-02 | Tenant isolation & policy | No cross-tenant exposure; org-level policy knobs |
| CAP-02-4 | DOM-02 | Employer presence | Candidates see who they are dealing with |
| CAP-03-1 | DOM-03 | Profile presentation | A candidate presents themselves truthfully and completely |
| CAP-03-2 | DOM-03 | Career history claims | Work and education are captured as claims ready for verification |
| CAP-03-3 | DOM-03 | Portfolio & resume | Candidate assembles shareable artefacts and tailored résumés |
| CAP-03-4 | DOM-03 | Visibility & preferences | Candidate decides who sees what and what they want next |
| CAP-03-5 | DOM-03 | Draft integrity | Edits are never lost or silently overwritten |
| CAP-04-1 | DOM-04 | Taxonomy stewardship | One canonical skill vocabulary |
| CAP-04-2 | DOM-04 | Skill assertion | Every skill reference resolves to a canonical skill |
| CAP-04-3 | DOM-04 | Skill confidence | Skill strength is derived from evidence, not typed in |
| CAP-04-4 | DOM-04 | Competency mapping | Skills map to roles, frameworks, curricula |
| CAP-05-1 | DOM-05 | Evidence capture | Artefacts and claims become structured evidence |
| CAP-05-2 | DOM-05 | Evidence grading | Every item sits on the evidence ladder with provenance |
| CAP-05-3 | DOM-05 | Credential custody | Certificates and credentials are held with verification links |
| CAP-05-4 | DOM-05 | Evidence lifecycle & revocation | Withdrawn/invalid evidence stops counting everywhere |
| CAP-05-5 | DOM-05 | Evidence disclosure | Evidence is shared only within consent |
| CAP-06-1 | DOM-06 | Work-history verification | Employment claims can be proven cheaply |
| CAP-06-2 | DOM-06 | Reference collection | Referees attest in <3 minutes without an account |
| CAP-06-3 | DOM-06 | Trust presentation | Verification status is honest and explainable |
| CAP-06-4 | DOM-06 | Verification integrity & disputes | Gaming is detected; disputes are human-resolved |
| CAP-06-5 | DOM-06 | Third-party verification services | Orgs/issuers verify at scale (later) |
| CAP-07-1 | DOM-07 | Assessment catalogue & authoring | One assessment engine for quizzes, challenges, certifications |
| CAP-07-2 | DOM-07 | Attempt delivery | Fair, resumable, time-bounded attempts |
| CAP-07-3 | DOM-07 | Grading & result | Honest scoring; no simulated passes |
| CAP-07-4 | DOM-07 | Integrity governance | Anomaly ≠ guilt; human review and appeal |
| CAP-07-5 | DOM-07 | Practice & employer screening | Safe practice; employer-set screens |
| CAP-08-1 | DOM-08 | Course discovery & enrolment | Learner finds and joins courses |
| CAP-08-2 | DOM-08 | Learning delivery | Lessons, progress, accessibility, offline reading |
| CAP-08-3 | DOM-08 | Completion & credentialing | Completion produces evidence |
| CAP-08-4 | DOM-08 | Instructor operations | Instructors author, publish, get paid |
| CAP-08-5 | DOM-08 | Learner community & mentoring | Peer and mentor support (later) |
| CAP-09-1 | DOM-09 | Job authoring & publishing | Employers create quality postings |
| CAP-09-2 | DOM-09 | Job lifecycle | Postings open, pause, fill, expire predictably |
| CAP-09-3 | DOM-09 | Job discovery surface | Candidates browse, save and track jobs |
| CAP-09-4 | DOM-09 | Job quality & compliance | Misleading/unsafe postings are caught |
| CAP-09-5 | DOM-09 | Distribution | Jobs reach candidates beyond the app |
| CAP-10-1 | DOM-10 | Application submission | Candidate applies once, safely, offline-tolerant |
| CAP-10-2 | DOM-10 | Candidate tracking | Candidate always knows status and why |
| CAP-10-3 | DOM-10 | Pipeline management | Hiring teams move candidates through stages |
| CAP-10-4 | DOM-10 | Interview & fit assessment | Structured interviews and feedback |
| CAP-10-5 | DOM-10 | Offer & outcome | Offers and hires are recorded, feeding Grow |
| CAP-10-6 | DOM-10 | Talent re-engagement | Past candidates are reusable with consent |
| CAP-11-1 | DOM-11 | Job search | Fast, filterable job discovery |
| CAP-11-2 | DOM-11 | Explainable matching | Every match shows why, with uncertainty |
| CAP-11-3 | DOM-11 | Candidate discovery | Recruiters find consented, evidenced candidates |
| CAP-11-4 | DOM-11 | Fairness & quality assurance | Matching is audited for adverse impact |
| CAP-11-5 | DOM-11 | Recommendations | Proactive suggestions, never pay-ranked |
| CAP-12-1 | DOM-12 | Readiness & gap insight | Candidate sees distance to a target role |
| CAP-12-2 | DOM-12 | Pathways | Next best learning/evidence step |
| CAP-12-3 | DOM-12 | Market intelligence | Aggregated, privacy-safe market data |
| CAP-12-4 | DOM-12 | Post-hire growth | Career continues after hire |
| CAP-13-1 | DOM-13 | Consented conversations | Two-party threads with consent |
| CAP-13-2 | DOM-13 | Outreach governance | Recruiter outreach is quota-bound and candidate-controlled |
| CAP-13-3 | DOM-13 | Messaging safety | Block, report, mute |
| CAP-13-4 | DOM-13 | Delivery & sync | Messages arrive, offline compose is safe |
| CAP-14-1 | DOM-14 | Connections & referrals | Light professional graph (later) |
| CAP-14-2 | DOM-14 | Community spaces | Groups/events/articles (later) |
| CAP-14-3 | DOM-14 | Mentorship | Mentor-mentee (later) |
| CAP-15-1 | DOM-15 | In-app notifications | Central inbox of what matters |
| CAP-15-2 | DOM-15 | Preferences & consent | User controls categories, channels, quiet hours |
| CAP-15-3 | DOM-15 | Multichannel delivery | Email/push delivered, tracked, retried |
| CAP-15-4 | DOM-15 | Engagement nudges | Digest and nudges within caps |
| CAP-16-1 | DOM-16 | Catalogue & checkout | Buyers pick a plan and pay |
| CAP-16-2 | DOM-16 | Subscription state | Subscription truth mirrors the processor |
| CAP-16-3 | DOM-16 | Entitlement & metering | Features gated by derived entitlements and quotas |
| CAP-16-4 | DOM-16 | Financial operations | Invoices, dunning, refunds |
| CAP-16-5 | DOM-16 | Commerce for courses & institutions | One-off and licence billing |
| CAP-17-1 | DOM-17 | Gateway & guardrails | Single path to models with policy blocks |
| CAP-17-2 | DOM-17 | Cost governance | Budgets; free users never cause paid inference |
| CAP-17-3 | DOM-17 | Assistive experiences | Drafting help, human-confirmed |
| CAP-17-4 | DOM-17 | AI transparency & quality | Users can see AI use; models evaluated |
| CAP-18-1 | DOM-18 | Institution onboarding | Institutions become tenants |
| CAP-18-2 | DOM-18 | Cohort management | Rosters, invitations, claims |
| CAP-18-3 | DOM-18 | Institutional credentialing | Institution issues verifiable credentials |
| CAP-18-4 | DOM-18 | Outcomes insight | Aggregate skill coverage and placement |
| CAP-18-5 | DOM-18 | Graduation transition | Learner keeps identity after graduation |
| CAP-19-1 | DOM-19 | Report & triage | Anyone can report; queue is worked |
| CAP-19-2 | DOM-19 | Enforcement | Human-decided takedown/sanction with notice |
| CAP-19-3 | DOM-19 | Appeals & transparency | Decisions are appealable |
| CAP-19-4 | DOM-19 | Abuse prevention | Spam/scam throttled |
| CAP-20-1 | DOM-20 | Back-office console | Staff operate the platform |
| CAP-20-2 | DOM-20 | Privileged access | Time-boxed, reason-coded access |
| CAP-20-3 | DOM-20 | Audit | Every sensitive action is recorded |
| CAP-20-4 | DOM-20 | Support operations | Users get help without data over-exposure |
| CAP-20-5 | DOM-20 | Platform configuration | Flags, banners, curation |
| CAP-21-1 | DOM-21 | Telemetry | Consent-respecting product events |
| CAP-21-2 | DOM-21 | Persona analytics | Candidates and recruiters see their own funnels |
| CAP-21-3 | DOM-21 | Platform KPIs | Leadership sees activation, retention, cost |
| CAP-21-4 | DOM-21 | Experimentation | Controlled tests (later) |
| CAP-22-1 | DOM-22 | Consent management | Purpose-bound, versioned, revocable consent |
| CAP-22-2 | DOM-22 | Data subject rights | Export, erasure, rectification, restriction |
| CAP-22-3 | DOM-22 | Transparency | Users see who accessed their data |
| CAP-22-4 | DOM-22 | Retention & legal hold | Retention schedule; holds [OPEN-08] |
| CAP-23-1 | DOM-23 | Scheduling integrations | Calendar links/invites |
| CAP-23-2 | DOM-23 | Data interchange | Import/export adapters; no runtime dependency on competitors |
| CAP-23-3 | DOM-23 | Developer platform | Public API, webhooks (later) |
| CAP-24-1 | DOM-24 | Reliable async processing | Outbox, jobs, scheduler |
| CAP-24-2 | DOM-24 | Request safety | Idempotency, rate limits, ETags |
| CAP-24-3 | DOM-24 | Client platform (PWA) | Install, offline read, safe sync |
| CAP-24-4 | DOM-24 | Operability | Traces, logs, migrations, compatibility |
| CAP-24-5 | DOM-24 | Search infrastructure & storage | Index and object storage |

## 2. Feature hierarchy by domain

Column key: **Feature (micro-features)** lists `.k` micro-features inline. **Owner** = frontend · backend. **P** priority. **Ph** phase.

### DOM-01 Identity, Sessions & Access

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-01-01 | 01-1 | Registration with email verification — .1 hashed single-use verification code .2 breached-password check .3 age/guardian gate [OPEN-09] .4 enumeration-safe response | MOD-SHELL · api/identity | Redesign | Reference stored weak session; verification must be hashed/expiring (INV-T05) | P0 | 1 |
| FEAT-01-02 | 01-2 | Password login — .1 progressive lockout/backoff .2 new-device login notice .3 remember-me bounded lifetime | MOD-SHELL · api/identity | Redesign | Cookie session via BFF replaces bearer in localStorage (ADR-T06) | P0 | 1 |
| FEAT-01-03 | 01-2 | Passkey (WebAuthn) registration & login — .1 enrol passkey .2 conditional-UI passkey login .3 manage (rename/remove) .4 unsupported-device fallback | MOD-SHELL · api/identity | Introduce | Phishing-resistant; required by ADR-T06 | P1 | 1 |
| FEAT-01-04 | 01-3 | Session lifecycle: 15-min access, rotating refresh — .1 silent refresh .2 reuse detection revokes family (BR-T050) .3 idle & absolute timeouts | MOD-SHELL · api/identity | Replace | Replaces long-lived bearer token | P0 | 1 |
| FEAT-01-05 | 01-3 | Session & device management — .1 revoke other sessions on password change .2 revoke single device .3 sign out everywhere | MOD-ACC · api/identity | Introduce | Holder visibility and control | P1 | 1 |
| FEAT-01-06 | 01-4 | Password reset & recovery — .1 hashed single-use reset token .2 recovery notification to old sessions .3 passkey-based recovery | MOD-SHELL · api/identity | Improve | Safe, non-enumerating recovery | P0 | 1 |
| FEAT-01-07 | 01-2 | Multi-factor TOTP — .1 user opt-in enrol .2 mandatory for ROLE-ADM/SUP/MOD and org owners .3 recovery codes | MOD-ACC · api/identity | Introduce | Privileged access hardening | P1 | 2 |
| FEAT-01-08 | 01-2 | Organization SSO (OIDC/SAML) — .1 domain-bound SSO config .2 JIT provisioning with role mapping .3 enforce-SSO org policy | MOD-ADM · api/identity | Introduce | Enterprise buyers (ADR-T06) | P2 | 3 |
| FEAT-01-09 | 01-5 | Capability endpoint `GET /me/capabilities` — .1 per-scope capability set .2 cache-busting on grant change | MOD-SHELL · packages/policy | Introduce | UI hints only (INV-T01) | P0 | 1 |
| FEAT-01-10 | 01-1 | Account deactivation / closure initiation — .1 reversible deactivation (retention window OPEN) .2 hand-off to erasure (FEAT-22-03) | MOD-ACC · api/identity | Improve | Reversible exit before irreversible erasure | P1 | 1 |
| FEAT-01-11 | 01-2 | Social login (e.g. Google OIDC) | MOD-SHELL · api/identity | Defer | No requirement yet; adds account-linking risk [OPEN] | P2 | 4 |
| FEAT-01-12 | 01-5 | Context switcher for multi-grant principals — .1 remembered last scope .2 scope-tagged UI chrome | MOD-SHELL · packages/policy | Introduce | Principals hold several scoped grants | P1 | 2 |
| FEAT-01-13 | 01-1 | Terms & policy version acceptance at signup | MOD-SHELL · api/identity | Introduce | Versioned consent trail (links FEAT-22-06) | P0 | 1 |

### DOM-02 Organizations, Tenancy & Roles

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-02-01 | 02-1 | Organization creation & domain verification — .1 DNS/email-domain proof .2 pending-org limited mode | MOD-HIR · api/orgs | Redesign | Employer identity must be proven before verifying others | P0 | 1 |
| FEAT-02-02 | 02-2 | Member invitation & acceptance — .1 invite expiry 7 days .2 bulk invite CSV .3 revoke pending invite | MOD-HIR · api/orgs | Improve | Controlled onboarding of team | P0 | 1 |
| FEAT-02-03 | 02-2 | Role grants: owner/admin/recruiter/hiring_manager/viewer — .1 last-owner protection .2 role change audit | MOD-HIR · packages/policy | Redesign | Central scoped-grant model (ADR-T07) | P0 | 1 |
| FEAT-02-04 | 02-2 | Quarterly access review prompt | MOD-ADM · api/orgs | Introduce | USR-01 §6 | P2 | 3 |
| FEAT-02-05 | 02-4 | Employer brand page — .1 logo/about .2 open jobs list | MOD-HIR · api/orgs | Improve | Candidate trust in who is hiring | P1 | 2 |
| FEAT-02-06 | 02-2 | Teams & job-scope assignment — .1 team membership .2 per-job hiring-team assignment | MOD-HIR · api/orgs | Introduce | HM sees only assigned jobs | P1 | 2 |
| FEAT-02-07 | 02-3 | Tenant isolation (RLS + canary suite) — .1 org_id on all tenant tables .2 cross-tenant canary CI | api/platform · api/orgs | Introduce | INV-T03, ADR-T21 | P0 | 1 |
| FEAT-02-08 | 02-1 | Ownership transfer & org closure | MOD-ADM · api/orgs | Introduce | Prevents orphaned tenants | P2 | 3 |
| FEAT-02-09 | 02-3 | Org policy settings — .1 retention defaults .2 enforce SSO/MFA .3 default sharing of notes | MOD-ADM · api/orgs | Introduce | Enterprise control | P2 | 3 |

### DOM-03 Profile, Portfolio & Resume

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-03-01 | 03-1 | Profile core — .1 evidence-oriented completeness guidance .2 name pronunciation/pronouns .3 profile photo (scanned) | MOD-CAND · api/profile | Improve | Completeness steers to evidence, not vanity | P0 | 1 |
| FEAT-03-02 | 03-4 | Field-level visibility controls — .1 visibility presets .2 recruiter-view preview | MOD-CAND · api/profile | Introduce | Candidate controls exposure (INV-T15) | P0 | 1 |
| FEAT-03-03 | 03-3 | Portfolio projects — .1 artefacts linked to evidence .2 featured ordering | MOD-CAND · api/profile | Improve | Showcase step of the loop | P1 | 1 |
| FEAT-03-04 | 03-3 | Resume variants & export — .1 variant per target role .2 accessible tagged PDF export .3 variant skill/evidence selection | MOD-CAND · api/profile | Improve | Tailored résumés from verified data | P1 | 1 |
| FEAT-03-05 | 03-3 | Resume import → draft profile — .1 file parse .2 per-field confirm before save | MOD-CAND · api/ai | Introduce | AI draft only, human-confirmed (INV-T08) | P2 | 2 |
| FEAT-03-06 | 03-1 | Public profile page & share links — .1 vanity slug .2 expiring share link .3 noindex toggle | MOD-SHELL · api/profile | Improve | Showcase beyond platform | P1 | 1 |
| FEAT-03-07 | 03-2 | Work-history & education claims — .1 employment type .2 date validation .3 link to verification request | MOD-CAND · api/profile | Improve | Claims become verifiable (FEAT-06-01) | P0 | 1 |
| FEAT-03-08 | 03-5 | Draft autosave & conflict handling — .1 draft conflict resolution via ETag .2 offline queued profile edit | MOD-CAND · api/profile | Introduce | ADR-T08/T10 | P1 | 1 |
| FEAT-03-09 | 03-4 | Job preferences & availability — .1 private salary expectation .2 work-mode/relocation .3 blocked employers list | MOD-CAND · api/profile | Improve | Match inputs under candidate control | P1 | 1 |
| FEAT-03-10 | 03-1 | Profile change history view | MOD-CAND · api/profile | Introduce | Transparency and recovery | P2 | 2 |

### DOM-04 Skills Graph & Taxonomy

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-04-01 | 04-1 | Canonical skill taxonomy — .1 aliases/synonyms .2 deprecate & merge skill .3 categories | MOD-ADM · api/skills | Improve | One vocabulary for tags, jobs, courses | P0 | 1 |
| FEAT-04-02 | 04-2 | Skill tagging on any entity — .1 tag picker with typeahead .2 reject free-text skills | all MOD · api/skills | Keep | Every tag references a canonical skill [REF: BR-144] | P0 | 1 |
| FEAT-04-03 | 04-1 | Skill relations (adjacent/prerequisite) | MOD-ADM · api/skills | Improve | Drives gap analysis and recs | P1 | 2 |
| FEAT-04-04 | 04-3 | Skill confidence computation — .1 recency decay .2 recompute on revocation (BR-T005) .3 uncertainty interval shown | api/skills · apps/worker | Redesign | Confidence derived from evidence rungs, never self-set | P0 | 1 |
| FEAT-04-05 | 04-1 | Skill proposal & curation queue | MOD-ADM · api/skills | Introduce | Controlled vocabulary growth | P2 | 2 |
| FEAT-04-06 | 04-4 | Competency frameworks (role-level, curriculum mapping) | MOD-ADM · api/skills | Introduce | Institutions map curricula (DOM-18) | P2 | 3 |
| FEAT-04-07 | 04-4 | External taxonomy mapping (ESCO/O*NET-style crosswalk) | api/skills | Defer | Needs licence/scope review [OPEN] | P2 | 4 |

### DOM-05 Evidence & Credentials

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-05-01 | 05-1 | Evidence item creation — .1 artefact upload .2 external link with liveness check .3 auto-created from course/assessment .4 skill tags .5 save as draft | MOD-CAND · api/evidence | Redesign | Core of the product; rejects `source=ai` (INV-T08) | P0 | 1 |
| FEAT-05-02 | 05-2 | Evidence ladder & provenance — .1 rung computation .2 provenance record per transition .3 rung explainer UI | MOD-CAND · api/evidence | Redesign | ADR-T14 replaces boolean verified flag | P0 | 1 |
| FEAT-05-03 | 05-2 | Peer attestation — .1 attester invite .2 attester eligibility checks | MOD-CAND · api/evidence | Introduce | Rung peer-attested | P1 | 2 |
| FEAT-05-04 | 05-2 | Authority verification — .1 platform-course issuer .2 assessment-runner issuer .3 institution issuer (Ph3) | api/evidence · api/verification | Introduce | Only server-side transitions set verified (INV-T04) | P0 | 1 |
| FEAT-05-05 | 05-4 | Evidence revocation & downstream impact — .1 reason codes .2 dependent recompute (skills, matches) .3 holder notified .4 appeal path | api/evidence · apps/worker | Introduce | BR-T005; honest status | P0 | 1 |
| FEAT-05-06 | 05-3 | Credential wallet (external certificates) — .1 verify-URL check .2 issuer record | MOD-CAND · api/evidence | Improve | Held as artifact-backed until verified | P1 | 2 |
| FEAT-05-07 | 05-5 | Evidence sharing under consent — .1 per-employer grant link .2 view-time consent check | MOD-CAND · api/privacy | Introduce | INV-T15 | P0 | 1 |
| FEAT-05-08 | 05-1 | Evidence portfolio view — .1 ladder filter .2 gap hints | MOD-CAND · api/evidence | Improve | Candidate sees strength distribution | P1 | 1 |
| FEAT-05-09 | 05-4 | Evidence expiry & renewal | api/evidence | Introduce | Time-limited certificates | P2 | 3 |
| FEAT-05-10 | 05-4 | Evidence dispute (report a claim) | MOD-CAND · api/safety | Introduce | Route to human review | P1 | 2 |
| FEAT-05-11 | 05-3 | Open-badge / verifiable-credential export | api/evidence | Defer | Standards review [OPEN] | P2 | 4 |
| FEAT-05-12 | 05-1 | Artefact storage & scanning — .1 quarantine until scan clean (BR-T003) .2 type/size allowlist .3 preview thumbnails | api/evidence · api/platform | Introduce | No unscanned file becomes visible | P0 | 1 |

### DOM-06 Verification & Trust

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-06-01 | 06-1 | Work-history verification by employer-email proof — .1 code sent to employer-domain address .2 attempt cap .3 resend limits | MOD-CAND · api/verification | Redesign | Proof of control, hashed code (INV-T05) [REF: proof-of-control audit] | P0 | 1 |
| FEAT-06-02 | 06-2 | Referee request (tokenised, no account) — .1 token issue (hashed) .2 sub-3-minute referee flow .3 reminders (max 2) .4 referee decline / "do not know" .5 referee consent to be named | MOD-CAND · api/verification | Introduce | First-class referee flow (DOM-00 §6) | P0 | 1 |
| FEAT-06-03 | 06-2 | Referee response outcomes & rung effect — .1 confirm .2 dispute .3 decline .4 expiry | api/verification · api/evidence | Introduce | DT-04 outcome table | P0 | 1 |
| FEAT-06-04 | 06-3 | Verification badges & provenance display — .1 "what this means" popover .2 never-verified-by-default rule | MOD-CAND, MOD-HIR · api/evidence | Redesign | Product constitution: no claim shown as verified | P0 | 1 |
| FEAT-06-05 | 06-4 | Verification dispute & appeal | MOD-CAND · api/safety | Introduce | Human resolution of conflicting attestations | P1 | 2 |
| FEAT-06-06 | 06-5 | Bulk employment verification service for orgs | MOD-HIR · api/verification | Defer | Revenue stream later; consent-bound | P2 | 4 |
| FEAT-06-07 | 06-5 | Education credential verification by institutions | MOD-ADM · api/verification | Introduce | Authority rung from institutions | P1 | 3 |
| FEAT-06-08 | 06-1 | Government-ID identity verification | api/verification | Defer | Vendor, privacy cost [OPEN-10] | P2 | 4 |
| FEAT-06-09 | 06-4 | Verification abuse detection — .1 colluding-referee signals → human review .2 free-mail referee warning | api/verification · api/safety | Introduce | Anomaly ≠ guilt (INV-T20) | P1 | 2 |
| FEAT-06-10 | 06-2 | Verification reminders & expiry jobs — .1 reminder schedule .2 token expiry sweep | apps/worker · api/verification | Introduce | BR-T004 | P0 | 1 |

### DOM-07 Assessment, Challenges & Integrity

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-07-01 | 07-1 | Assessment catalogue & detail — .1 mode badges (auto-graded/code/manual) .2 AI policy label shown before start | MOD-LRN · api/assessment | Merge | Merges challenges + skill certification + contests | P0 | 2 |
| FEAT-07-02 | 07-2 | Assessment attempt — .1 answer autosave .2 server-authoritative timer .3 resume interrupted attempt .4 accommodation (extra time) | MOD-LRN · api/assessment | Redesign | Fair delivery; no client-trusted time | P0 | 2 |
| FEAT-07-03 | 07-3 | Code sandbox runner — .1 network-less isolation .2 resource/time limits .3 deterministic test harness | api/assessment · apps/worker | Introduce | ADR-T13 | P0 | 2 |
| FEAT-07-04 | 07-3 | Unverified-submission fallback — .1 `unverified` label .2 no verified evidence minted .3 re-grade when runner available | api/assessment | Introduce | Replaces simulated pass [REF] | P0 | 2 |
| FEAT-07-05 | 07-2 | AI_PROHIBITED session policy — .1 gateway block header .2 UI banner .3 violation log | api/assessment · api/ai | Introduce | INV-T06 | P0 | 1 |
| FEAT-07-06 | 07-3 | Scoring, pass threshold & evidence minting — .1 rubric scoring .2 pass threshold .3 evidence mint on pass | api/assessment · api/evidence | Redesign | Pass → authority-verified only when auto-graded | P0 | 2 |
| FEAT-07-07 | 07-4 | Integrity signals & human review — .1 disclosed signals (focus loss, paste) .2 reviewer queue .3 appeal | MOD-ADM · api/safety | Introduce | INV-T20 | P1 | 2 |
| FEAT-07-08 | 07-2 | Retake policy — .1 cooldown .2 attempt cap per window | api/assessment | Introduce | Anti-gaming | P1 | 2 |
| FEAT-07-09 | 07-1 | Question bank & assessment authoring | MOD-LRN · api/assessment | Improve | Instructors/orgs author | P1 | 2 |
| FEAT-07-10 | 07-5 | Employer-set screening assessment on a job | MOD-HIR · api/assessment | Introduce | Opt-in, never auto-reject | P2 | 3 |
| FEAT-07-11 | 07-5 | Practice mode (non-evidence) | MOD-LRN · api/assessment | Keep | Safe rehearsal | P2 | 1 |
| FEAT-07-12 | 07-4 | Remote proctoring | api/assessment | Defer | Vendor-gated | P2 | 4 |
| FEAT-07-13 | 07-5 | Contests & leaderboards | MOD-LRN · api/assessment | Defer | Community feature, no loop impact | P2 | 4 |

### DOM-08 Learning

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-08-01 | 08-1 | Course catalogue & discovery — .1 filters by skill/level .2 prerequisite display | MOD-LRN · api/learning | Improve | Entry to Learn | P0 | 1 |
| FEAT-08-02 | 08-1 | Course enrolment (free & paid) — .1 enrol idempotency .2 paid → pending_payment .3 prerequisite lock check | MOD-LRN · api/learning | Redesign | Idempotent; entitlement-aware | P0 | 1 |
| FEAT-08-03 | 08-2 | Lesson player & progress — .1 resume lesson position .2 offline lesson cache (read-only) .3 captions/transcripts required .4 progress sync conflict | MOD-LRN · api/learning | Improve | A11y and ADR-T10 offline tier | P0 | 1 |
| FEAT-08-04 | 08-3 | Course completion → evidence — .1 completion rule engine .2 evidence mint on completion .3 instructor sign-off option | api/learning · api/evidence | Introduce | Learn→Prove link | P0 | 1 |
| FEAT-08-05 | 08-1 | Learning paths | MOD-LRN · api/learning | Improve | Sequenced skills toward target role | P1 | 2 |
| FEAT-08-06 | 08-4 | Instructor studio (create, version, publish) — .1 draft/versioning .2 media upload scanned .3 publish checklist | MOD-LRN · api/learning | Improve | Content supply | P1 | 2 |
| FEAT-08-07 | 08-1 | Course ratings & reviews (enrolled only) | MOD-LRN · api/learning | Improve | Prevent fake reviews | P2 | 2 |
| FEAT-08-08 | 08-1 | Course lock / prerequisite state [REF: course lock logic] | api/learning | Keep | Gate by prerequisite or plan | P1 | 2 |
| FEAT-08-09 | 08-4 | Instructor revenue share & payouts | api/billing | Defer | Terms OPEN-06 | P2 | 4 |
| FEAT-08-10 | 08-3 | Course refund & dispute handling | MOD-ACC · api/billing | Introduce | Required for course commerce | P1 | 2 |
| FEAT-08-11 | 08-5 | Mentor matching & sessions | api/network | Defer | Community phase | P2 | 4 |
| FEAT-08-12 | 08-5 | Course Q&A / discussion | MOD-LRN · api/learning | Defer | Moderation burden | P2 | 4 |

### DOM-09 Opportunities

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-09-01 | 09-1 | Job authoring (draft) — .1 canonical skill requirements .2 pay-range disclosure fields .3 start from template .4 AI-assisted draft (human-confirmed) .5 inclusive-language check | MOD-HIR · api/jobs | Improve | Quality input drives match quality | P0 | 1 |
| FEAT-09-02 | 09-1 | Job publishing & approval — .1 entitlement (job-slot) gate .2 pre-publish moderation check .3 scheduled publish .4 optional approver step | MOD-HIR · api/jobs | Redesign | Server-validated publish, auditable | P0 | 1 |
| FEAT-09-03 | 09-2 | Job lifecycle (pause, close, filled, expire, clone, reopen-as-clone) — .1 auto-expire .2 closed-job applicant notice | MOD-HIR · api/jobs | Improve | Predictable states (SM-JOB) | P0 | 1 |
| FEAT-09-04 | 09-1 | Job templates | MOD-HIR · api/jobs | Keep | Speeds authoring | P2 | 2 |
| FEAT-09-05 | 09-3 | Job detail page (public, indexable) — .1 structured data markup .2 apply CTA state (applied/closed) | MOD-SHELL, MOD-OPP · api/jobs | Improve | Discovery and SEO | P0 | 1 |
| FEAT-09-06 | 09-3 | Saved searches & job alerts — .1 saved search alert .2 alert frequency .3 alert dedupe | MOD-OPP · api/jobs | Merge | Merges saved searches + job alerts | P1 | 2 |
| FEAT-09-07 | 09-3 | Save/bookmark job | MOD-OPP · api/jobs | Keep | Low-cost engagement | P1 | 1 |
| FEAT-09-08 | 09-4 | Posting quality & policy checks — .1 configurable discriminatory-term lint .2 scam-pattern flags to human review | api/jobs · api/safety | Introduce | No legal claims; configurable policy | P1 | 2 |
| FEAT-09-09 | 09-5 | Job import / external feeds | api/integrations | Defer | Not on loop | P2 | 4 |
| FEAT-09-10 | 09-5 | Job share & referral link | MOD-OPP · api/jobs | Improve | Organic reach | P2 | 3 |
| FEAT-09-11 | 09-5 | Sponsored / promoted jobs | — | Remove | Pay-to-rank forbidden (ADR-T22) | P2 | — |

### DOM-10 Applications & Hiring Pipeline

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-10-01 | 10-1 | Application draft & autosave — .1 offline draft queue .2 draft conflict handling .3 draft expiry 30 days | MOD-OPP · api/applications | Introduce | ADR-T10 queued-write tier | P0 | 1 |
| FEAT-10-02 | 10-1 | Application submit (idempotent, one-active rule) — .1 pre-submit checklist .2 duplicate-click protection .3 confirmation receipt | MOD-OPP · api/applications | Redesign | BR-T001, INV-T10 | P0 | 1 |
| FEAT-10-03 | 10-1 | Withdraw & re-apply policy | MOD-OPP · api/applications | Improve | Candidate agency | P0 | 1 |
| FEAT-10-04 | 10-2 | Application status tracker — .1 stage timeline .2 plain-language reason | MOD-OPP · api/applications | Improve | Transparency | P0 | 2 |
| FEAT-10-05 | 10-3 | Pipeline board & stage change — .1 optimistic concurrency (If-Match) .2 stage reason note .3 move audit | MOD-HIR · api/applications | Redesign | SM-APPLICATION only (BR-T002) | P0 | 2 |
| FEAT-10-06 | 10-3 | Rejection with human confirmation & feedback template — .1 two-step confirm .2 optional feedback to candidate | MOD-HIR · api/applications | Introduce | INV-T09 | P0 | 2 |
| FEAT-10-07 | 10-4 | Interview scheduling — .1 slot proposal .2 reschedule .3 cancel .4 calendar invite (ICS) .5 timezone-safe display | MOD-HIR, MOD-OPP · api/applications | Redesign | Concurrency-safe slots | P1 | 2 |
| FEAT-10-08 | 10-4 | Scorecards & structured feedback — .1 criteria templates .2 blind-until-submitted | MOD-HIR · api/applications | Introduce | Reduces bias | P1 | 2 |
| FEAT-10-09 | 10-3 | Hiring-team notes & mentions | MOD-HIR · api/applications | Improve | Collaboration, never visible to candidate | P1 | 2 |
| FEAT-10-10 | 10-5 | Offer record (extended/accepted/declined) | MOD-HIR · api/applications | Introduce | Record only; no payroll | P1 | 2 |
| FEAT-10-11 | 10-3 | Bulk actions & saved pipeline views | MOD-HIR · api/applications | Improve | Throughput; bulk reject still needs confirm | P2 | 3 |
| FEAT-10-12 | 10-3 | Custom pipeline templates | MOD-HIR · api/applications | Improve | Org-specific stages mapped to canonical states | P2 | 3 |
| FEAT-10-13 | 10-6 | Talent pool / past candidates (consent-bound) | MOD-HIR · api/applications | Introduce | Reuse with consent | P2 | 3 |
| FEAT-10-14 | 10-1 | Application evidence snapshot — .1 immutable view-set at submit .2 consent-scope record | api/applications · api/privacy | Introduce | Recruiter sees only what was shared | P0 | 1 |
| FEAT-10-15 | 10-5 | Hire outcome recording & handoff to Grow | MOD-HIR · api/applications | Introduce | Closes the loop | P1 | 2 |
| FEAT-10-16 | 10-4 | Video interview recording + AI feedback | — | Defer | Privacy/bias risk | P2 | 4 |
| FEAT-10-17 | 10-3 | Automatic reject on score | — | Remove | Violates INV-T09 | P0 | — |

### DOM-11 Matching, Search & Recommendations

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-11-01 | 11-1 | Job search (FTS + trigram + filters) — .1 typeahead/spell tolerance .2 facet filters .3 sort (relevance/date) .4 search history (local) | MOD-OPP · api/search | Improve | ADR-T11 | P0 | 1 |
| FEAT-11-02 | 11-2 | Explainable match — .1 matched/missing skills .2 evidence-rung weights shown .3 uncertainty band .4 "why" panel | MOD-OPP, MOD-HIR · api/matching | Redesign | ADR-T22, INV-T19 | P0 | 1 |
| FEAT-11-03 | 11-4 | Scoring-input allowlist & fairness guard — .1 allowlist validator .2 protected-attribute exclusion tests | api/matching | Introduce | DT-03; payment never an input | P0 | 1 |
| FEAT-11-04 | 11-5 | Job recommendations feed | MOD-OPP · api/matching | Improve | Daily relevance | P1 | 2 |
| FEAT-11-05 | 11-3 | Candidate search for recruiters (verified-search quota) — .1 consent-scope filter .2 quota counter | MOD-HIR · api/search | Redesign | Only consenting, shareable profiles | P1 | 2 |
| FEAT-11-06 | 11-1 | Semantic search (pgvector) | api/search | Introduce | Recall for paraphrased skills | P2 | 3 |
| FEAT-11-07 | 11-2 | Match recompute on evidence change — .1 async recompute .2 explanation refresh .3 audit entry | apps/worker · api/matching | Introduce | BR-T005 | P0 | 1 |
| FEAT-11-08 | 11-2 | Gap-to-qualify guidance | MOD-OPP · api/matching | Introduce | Candidate dignity: "what would change this" | P1 | 2 |
| FEAT-11-09 | 11-4 | Adverse-impact audit reports | MOD-ADM · api/analytics | Introduce | GOAL-03 quarterly | P1 | 3 |
| FEAT-11-10 | 11-3 | Suggested shortlist per job (human-gated) | MOD-HIR · api/matching | Introduce | Time-to-shortlist; INV-T09 | P1 | 2 |
| FEAT-11-11 | 11-1 | Relevance telemetry & tuning | api/search | Introduce | Evidence for OpenSearch trigger (ADR-T11) | P2 | 3 |

### DOM-12 Career Intelligence

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-12-01 | 12-1 | Readiness for target role (evidence-based) — .1 target role selector .2 readiness with uncertainty | MOD-CAND · api/careerintel | Redesign | Derived from evidence, not self-rating | P1 | 2 |
| FEAT-12-02 | 12-2 | Skill-gap analysis & next-evidence suggestions | MOD-CAND · api/careerintel | Improve | Feeds Learn | P1 | 2 |
| FEAT-12-03 | 12-2 | Role transition explorer | MOD-CAND · api/careerintel | Improve | Career switchers (P1 Asha) | P2 | 3 |
| FEAT-12-04 | 12-3 | Salary insights (aggregated, k-anonymity) | MOD-CAND · api/careerintel | Improve | Privacy-safe aggregates | P2 | 3 |
| FEAT-12-05 | 12-2 | Career goals & plan | MOD-CAND · api/careerintel | Improve | Goal-linked suggestions | P2 | 3 |
| FEAT-12-06 | 12-4 | Post-hire growth plan | MOD-CAND · api/careerintel | Introduce | Grow step | P2 | 4 |
| FEAT-12-07 | 12-3 | Market demand snapshot | MOD-CAND · api/careerintel | Introduce | Aggregated postings | P2 | 3 |

### DOM-13 Messaging & Collaboration

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-13-01 | 13-1 | Conversations (consented threads) — .1 application-linked thread .2 thread list & unread | MOD-MSG · api/messaging | Redesign | Single messaging path | P0 | 2 |
| FEAT-13-02 | 13-2 | Recruiter outreach with quota — .1 quota counter display .2 per-candidate cooldown .3 outreach template | MOD-MSG, MOD-HIR · api/messaging | Introduce | Anti-spam; candidate agency | P0 | 2 |
| FEAT-13-03 | 13-4 | Offline compose queue — .1 queued send with idempotency key .2 stale-thread revalidation | MOD-MSG · api/messaging | Improve | ADR-T10 | P1 | 2 |
| FEAT-13-04 | 13-1 | Message attachments (scanned) | MOD-MSG · api/messaging | Improve | Reuses scan pipeline | P2 | 3 |
| FEAT-13-05 | 13-3 | Block, report & mute — .1 block user/org .2 mute thread .3 report with context snapshot | MOD-MSG · api/safety | Introduce | Safety baseline | P0 | 2 |
| FEAT-13-06 | 13-2 | First-contact acceptance (accept/decline outreach) — .1 decline silent to sender-visible reason code | MOD-MSG · api/messaging | Introduce | Candidate consent to be contacted | P0 | 2 |
| FEAT-13-07 | 13-4 | Read receipts & typing indicators | MOD-MSG · api/messaging | Defer | Low value, privacy cost | P2 | 4 |
| FEAT-13-08 | 13-1 | Legacy chat service | — | Remove | Stub in reference [REF] | P2 | — |
| FEAT-13-09 | 13-2 | Recruiter message templates | MOD-MSG · api/messaging | Introduce | Consistent, auditable outreach | P2 | 3 |
| FEAT-13-10 | 13-4 | Live delivery (SSE with poll fallback) | MOD-MSG · api/messaging | Improve | Works under proxies; PWA-safe | P1 | 2 |

### DOM-14 Networking & Community

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-14-01 | 14-1 | Connections | MOD-MSG · api/network | Defer | Not required for loop | P2 | 4 |
| FEAT-14-02 | 14-2 | Groups | MOD-MSG · api/network | Defer | Moderation cost | P2 | 4 |
| FEAT-14-03 | 14-2 | Events | MOD-MSG · api/network | Defer | Community phase | P2 | 4 |
| FEAT-14-04 | 14-2 | Articles | MOD-MSG · api/network | Defer | Content moderation | P2 | 4 |
| FEAT-14-05 | 14-2 | General social feed / likes | — | Remove | Non-goal "generic social network" (ADR-T01) | P2 | — |
| FEAT-14-06 | 14-3 | Mentorship programme | MOD-MSG · api/network | Defer | Needs supply; Phase 4 | P2 | 4 |
| FEAT-14-07 | 14-1 | Employee/peer referrals — .1 referral link .2 referrer-visible status (consented) | MOD-OPP · api/network | Improve | Cold-start growth lever | P2 | 3 |
| FEAT-14-08 | 14-2 | Sponsored content | — | Remove | Ad network is a non-goal | P2 | — |
| FEAT-14-09 | 14-1 | Business-development graph | — | Remove | Out of scope [REF] | P2 | — |

### DOM-15 Notifications & Engagement

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-15-01 | 15-1 | Notification centre — .1 unread badge .2 mark-all-read .3 deep links | MOD-MSG · api/notify | Improve | Central inbox | P0 | 1 |
| FEAT-15-02 | 15-2 | Preferences by category & channel — .1 quiet hours .2 mandatory transactional categories .3 digest frequency | MOD-ACC · api/notify | Redesign | User control within safety floor | P0 | 1 |
| FEAT-15-03 | 15-3 | Email delivery via provider port — .1 template rendering .2 provider webhooks (bounce/complaint) | api/notify · apps/worker | Improve | ADR-T20 | P0 | 1 |
| FEAT-15-04 | 15-3 | Web Push (VAPID) for installed PWAs — .1 permission pre-prompt .2 subscription refresh | MOD-MSG · api/notify | Introduce | ADR-T02/T20 | P1 | 2 |
| FEAT-15-05 | 15-4 | Digest & nudges — .1 nudge frequency cap .2 digest dedupe | api/notify · apps/worker | Merge | Merges notifications + digest + nudges | P1 | 2 |
| FEAT-15-06 | 15-3 | Delivery tracking & retry — .1 backoff schedule .2 dead-letter | apps/worker · api/notify | Introduce | SM-NOTIFY | P0 | 1 |
| FEAT-15-07 | 15-2 | Unsubscribe & suppression list — .1 one-click unsubscribe .2 hard-bounce suppression | api/notify | Introduce | Deliverability, trust | P0 | 1 |
| FEAT-15-08 | 15-1 | In-app announcements | MOD-SHELL · api/notify | Introduce | Product comms | P2 | 3 |
| FEAT-15-09 | 15-3 | SMS channel | api/notify | Defer | ADR-T20 | P2 | 4 |
| FEAT-15-10 | 15-3 | Template management & localisation | MOD-ADM · api/notify | Introduce | Versioned copy | P1 | 2 |

### DOM-16 Billing, Plans & Entitlements

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-16-01 | 16-1 | Plan & price catalogue — .1 plan comparison page .2 plan versioning | MOD-ACC · api/billing | Redesign | Price values OPEN | P0 | 2 |
| FEAT-16-02 | 16-1 | Checkout (Stripe Checkout) — .1 create session idempotently .2 return-URL status page (informational only) | MOD-ACC · api/billing | Improve | ADR-T15; redirect grants nothing | P0 | 2 |
| FEAT-16-03 | 16-2 | Signed webhook processing — .1 signature verify .2 event dedupe .3 out-of-order handling | api/billing | Improve | INV-T17 | P0 | 2 |
| FEAT-16-04 | 16-3 | Entitlement derivation & gates — .1 derive from subscription state .2 grace handling .3 entitlement cache invalidation | api/billing · packages/policy | Redesign | Server-derived only | P0 | 2 |
| FEAT-16-05 | 16-2 | Customer portal (manage/cancel) | MOD-ACC · api/billing | Keep | Processor-hosted | P1 | 2 |
| FEAT-16-06 | 16-4 | Invoices & receipts | MOD-ACC · api/billing | Improve | Self-serve finance | P1 | 2 |
| FEAT-16-07 | 16-4 | Dunning & past-due grace — .1 grace window .2 degrade-not-delete | api/billing · apps/worker | Introduce | No data loss on payment failure | P1 | 2 |
| FEAT-16-08 | 16-3 | Seat management — .1 assign/unassign seat .2 seat-limit enforcement | MOD-ACC · api/billing | Introduce | Employer revenue model | P1 | 2 |
| FEAT-16-09 | 16-5 | Course purchase (one-off) | MOD-LRN · api/billing | Improve | Course commerce | P1 | 2 |
| FEAT-16-10 | 16-4 | Refunds & dispute handling | MOD-ADM · api/billing | Introduce | Required for commerce | P1 | 2 |
| FEAT-16-11 | 16-3 | Usage meters & quotas — .1 AI quota .2 outreach quota .3 verified-search quota | api/billing · api/ai | Introduce | Cost control, INV-T07 | P0 | 2 |
| FEAT-16-12 | 16-4 | Tax/VAT handling | api/billing | Defer | Jurisdiction review [OPEN] | P2 | 3 |
| FEAT-16-13 | 16-5 | Institution licence invoicing | MOD-ADM · api/billing | Introduce | B2B2C revenue | P2 | 3 |
| FEAT-16-14 | 16-1 | Promo codes / coupons | api/billing | Defer | Not needed early | P2 | 4 |

### DOM-17 AI Gateway & Governance

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-17-01 | 17-1 | Gateway single path & routing — .1 model routing .2 request/response redaction | api/ai | Introduce | ADR-T12 | P0 | 0 |
| FEAT-17-02 | 17-2 | Budget & quota enforcement — .1 per-user/org budget .2 free-tier hard block | api/ai · api/billing | Introduce | INV-T07 | P0 | 0 |
| FEAT-17-03 | 17-1 | Policy blocks (AI_PROHIBITED etc.) | api/ai | Introduce | INV-T06 | P0 | 0 |
| FEAT-17-04 | 17-3 | Profile/resume suggestions (draft only) — .1 per-field accept/reject | MOD-CAND · api/ai | Improve | Human gate (INV-T09) | P1 | 2 |
| FEAT-17-05 | 17-3 | Job-description drafting assist | MOD-HIR · api/ai | Improve | Efficiency; recruiter confirms | P2 | 2 |
| FEAT-17-06 | 17-3 | Career coach chat | MOD-CAND · api/ai | Improve | Output never evidence (INV-T08) | P2 | 3 |
| FEAT-17-07 | 17-4 | AI-use transparency — .1 "AI assisted" marker .2 user-visible usage log | MOD-ACC · api/ai | Introduce | Trust | P1 | 2 |
| FEAT-17-08 | 17-4 | Prompt/model registry & evaluation | api/ai | Introduce | Regression control | P1 | 2 |
| FEAT-17-09 | 17-3 | Persistent AI memory | api/ai | Defer | Risk of truth contamination; non-evidence only | P2 | 4 |
| FEAT-17-10 | 17-3 | Mock interview practice (text) | MOD-CAND · api/ai | Defer | Needs budget proof | P2 | 4 |

### DOM-18 Institutions (B2B2C)

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-18-01 | 18-1 | Institution onboarding & workspace — .1 institution verification .2 admin bootstrap | MOD-ADM · api/institutions | Introduce | Tenant for B2B2C | P1 | 3 |
| FEAT-18-02 | 18-2 | Cohort creation & roster import — .1 CSV import dedupe .2 dry-run preview .3 roster size limit | MOD-ADM · api/institutions | Introduce | Cohort-first onboarding | P1 | 3 |
| FEAT-18-03 | 18-2 | Cohort invitation & learner claim — .1 invite token (hashed) .2 existing-account link .3 learner may decline | MOD-ADM, MOD-SHELL · api/institutions | Introduce | Learner owns identity | P1 | 3 |
| FEAT-18-04 | 18-4 | Cohort skill-coverage dashboard (aggregate) — .1 k-anonymity floor .2 no job-search data | MOD-ADM · api/institutions | Introduce | P3 Dr. Lin persona | P1 | 3 |
| FEAT-18-05 | 18-2 | Faculty roles & course assignment | MOD-ADM · api/institutions | Introduce | Delegated administration | P1 | 3 |
| FEAT-18-06 | 18-3 | Institution-issued credential verification | MOD-ADM · api/verification | Introduce | Authority rung | P1 | 3 |
| FEAT-18-07 | 18-5 | Graduation & alumni transition — .1 graduation event .2 institution access sunset .3 learner opt-in to alumni sharing | MOD-ADM · api/institutions | Introduce | Learner keeps career identity | P1 | 3 |
| FEAT-18-08 | 18-1 | Seat-licence management | MOD-ADM · api/institutions | Introduce | Entitlement of seats | P2 | 3 |
| FEAT-18-09 | 18-4 | Placement outcomes reporting (consented) | MOD-ADM · api/institutions | Introduce | Institutional ROI | P2 | 3 |
| FEAT-18-10 | 18-2 | Proctor role / invigilated assessment | MOD-ADM · api/institutions | Defer | Vendor-gated | P2 | 4 |
| FEAT-18-11 | 18-1 | Minor-learner handling | api/institutions | Defer | [OPEN-09] needs legal review | P2 | 4 |

### DOM-19 Trust, Safety & Moderation

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-19-01 | 19-1 | Report content/user — .1 context snapshot attach .2 report category | all MOD · api/safety | Improve | Entry to safety loop | P0 | 2 |
| FEAT-19-02 | 19-1 | Moderation queue & case management — .1 triage priority .2 SLA timers .3 case notes | MOD-ADM · api/safety | Redesign | SM-MODCASE | P0 | 2 |
| FEAT-19-03 | 19-2 | Takedown with notice & appeal (jobs, courses, profiles) | MOD-ADM · api/safety | Introduce | Due process | P1 | 2 |
| FEAT-19-04 | 19-4 | Scam/fraud signals → human review | api/safety | Introduce | Flags only (INV-T09) | P1 | 2 |
| FEAT-19-05 | 19-2 | Integrity-case review (assessment anomalies) | MOD-ADM · api/safety | Introduce | INV-T20 | P1 | 2 |
| FEAT-19-06 | 19-3 | Appeals handling | MOD-ADM · api/safety | Introduce | Reversibility | P1 | 2 |
| FEAT-19-07 | 19-2 | User sanctions (warn/suspend) — human only | MOD-ADM · api/safety | Introduce | INV-T09 | P1 | 2 |
| FEAT-19-08 | 19-4 | Abuse throttles & spam limits | api/safety · api/platform | Introduce | Baseline protection | P0 | 1 |
| FEAT-19-09 | 19-3 | Transparency report | MOD-ADM · api/safety | Defer | After volume | P2 | 4 |
| FEAT-19-10 | 19-1 | Content classifier auto-queueing (flag-only) | api/safety | Introduce | Triage assist, never action | P2 | 3 |

### DOM-20 Administration, Support & Back Office

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-20-01 | 20-1 | Admin console shell & RBAC | MOD-ADM · api/admin | Redesign | Policy-driven nav | P0 | 1 |
| FEAT-20-02 | 20-2 | Support access grants — .1 reason code .2 ≤4 h expiry (BR-T041) .3 user notification | MOD-ADM · api/admin | Introduce | INV-T18 | P0 | 1 |
| FEAT-20-03 | 20-3 | Audit log viewer & export — .1 tamper-evident chain .2 filter by subject | MOD-ADM · api/admin | Introduce | Accountability | P0 | 1 |
| FEAT-20-04 | 20-5 | Feature-flag management | MOD-ADM · api/admin | Introduce | Safe rollout, kill-switches | P1 | 1 |
| FEAT-20-05 | 20-4 | User lookup & support case tooling | MOD-ADM · api/admin | Improve | Scoped views only | P1 | 2 |
| FEAT-20-06 | 20-5 | Taxonomy & content curation tools | MOD-ADM · api/admin | Improve | Stewardship | P1 | 2 |
| FEAT-20-07 | 20-2 | Impersonation / log-in-as-user | — | Remove | Replaced by read-only scoped view under grant | P0 | — |
| FEAT-20-08 | 20-2 | Privileged-role access review | MOD-ADM · api/admin | Introduce | Monthly review; 60-day dormancy expiry | P1 | 2 |
| FEAT-20-09 | 20-4 | Customer-success health dashboards | MOD-ADM · api/analytics | Defer | After scale | P2 | 4 |
| FEAT-20-10 | 20-5 | Maintenance banner & status messages | MOD-SHELL · api/admin | Introduce | Honest degradation | P2 | 2 |

### DOM-21 Analytics & Reporting

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-21-01 | 21-1 | Event taxonomy & product telemetry — .1 event schema registry .2 consent-gated analytics | api/analytics | Introduce | Measure without surveillance | P0 | 1 |
| FEAT-21-02 | 21-2 | Candidate analytics (views, application stats) | MOD-CAND · api/analytics | Improve | Feedback loop for candidates | P1 | 2 |
| FEAT-21-03 | 21-2 | Recruiter funnel analytics (time-to-shortlist) | MOD-HIR · api/analytics | Improve | GOAL-02 | P1 | 2 |
| FEAT-21-04 | 21-2 | Institution analytics | MOD-ADM · api/analytics | Introduce | Aggregates only | P1 | 3 |
| FEAT-21-05 | 21-3 | Platform KPI dashboard | MOD-ADM · api/analytics | Introduce | Activation, retention, AI cost | P1 | 2 |
| FEAT-21-06 | 21-4 | Experimentation framework | api/analytics | Defer | Needs traffic | P2 | 3 |
| FEAT-21-07 | 21-3 | Warehouse export | api/analytics | Defer | No requirement | P2 | 4 |

### DOM-22 Privacy, Consent & Data Rights

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-22-01 | 22-1 | Consent scopes & ledger — .1 scope catalogue .2 grant/revoke .3 consent versioning .4 per-employer grant | MOD-ACC · api/privacy | Introduce | INV-T15 | P0 | 1 |
| FEAT-22-02 | 22-2 | Data export (portable archive) — .1 async build .2 expiring download link .3 re-auth before download | MOD-ACC · api/privacy | Introduce | Data portability | P0 | 1 |
| FEAT-22-03 | 22-2 | Erasure request & execution — .1 cooling-off cancel .2 retention carve-outs .3 completion receipt | MOD-ACC · api/privacy | Introduce | BR-T060 | P0 | 1 |
| FEAT-22-04 | 22-3 | "Who accessed my data" log | MOD-ACC · api/privacy | Introduce | Transparency | P1 | 2 |
| FEAT-22-05 | 22-1 | Cookie & tracking preferences | MOD-SHELL · api/privacy | Improve | Most-private default | P1 | 1 |
| FEAT-22-06 | 22-1 | Policy version acceptance ledger | MOD-SHELL · api/privacy | Introduce | Versioned consent | P0 | 1 |
| FEAT-22-07 | 22-4 | Legal hold & retention schedule | MOD-ADM · api/privacy | Introduce | [OPEN-08] | P1 | 2 |
| FEAT-22-08 | 22-2 | Org-side employee data-rights assistance | MOD-ADM · api/privacy | Introduce | Org admin assists | P2 | 3 |
| FEAT-22-09 | 22-2 | Rectification requests | MOD-ACC · api/privacy | Introduce | Right to correct | P1 | 2 |
| FEAT-22-10 | 22-2 | Restriction / objection (e.g. exclude from search) | MOD-ACC · api/privacy | Introduce | Granular control | P1 | 2 |

### DOM-23 Integrations & Developer Platform

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-23-01 | 23-3 | Public API & org API keys | api/integrations | Defer | ADR-T08 trigger | P2 | 4 |
| FEAT-23-02 | 23-3 | Outbound webhooks | api/integrations | Defer | Needs signing/retries | P2 | 4 |
| FEAT-23-03 | 23-1 | Calendar integration — .1 ICS attachments .2 Google/Microsoft calendar link | MOD-HIR · api/integrations | Introduce | Interview scheduling | P1 | 2 |
| FEAT-23-04 | 23-2 | ATS import/export adapters (CSV first) | MOD-HIR · api/integrations | Improve | Migration path for employers | P2 | 3 |
| FEAT-23-05 | 23-2 | Competitor-export import adapters (user-supplied files) | MOD-CAND · api/integrations | Introduce | No runtime dependency | P2 | 3 |
| FEAT-23-06 | 23-1 | Video-conference link provider | api/integrations | Defer | Not on loop | P2 | 4 |
| FEAT-23-07 | 23-3 | Service account management (ROLE-SVC) | MOD-ADM · api/integrations | Introduce | Needed with public API | P2 | 4 |
| FEAT-23-08 | 23-2 | Code-host/portfolio link ingestion as artefacts | MOD-CAND · api/integrations | Improve | Evidence capture | P2 | 3 |

### DOM-24 Platform

| FEAT | CAP | Feature (micro-features) | Owner | Disp | Rationale | P | Ph |
|---|---|---|---|---|---|---|---|
| FEAT-24-01 | 24-1 | Transactional outbox & dispatcher — .1 same-transaction write .2 consumer dedupe | api/platform · apps/worker | Introduce | INV-T12, ADR-T09 | P0 | 1 |
| FEAT-24-02 | 24-1 | Background job queue with fenced leases — .1 claim generation fencing .2 retry/dead-letter | apps/worker | Redesign | Prevent duplicate execution | P0 | 1 |
| FEAT-24-03 | 24-2 | Idempotency-key service — .1 key scope per principal+route .2 replay returns stored result | api/platform | Introduce | INV-T10, FF-07 | P0 | 1 |
| FEAT-24-04 | 24-5 | Object storage & signed URLs | api/platform | Introduce | Artefact custody | P0 | 1 |
| FEAT-24-05 | 24-4 | Observability (trace-context, redacted logs) | api/platform | Introduce | ADR-T16, INV-T14 | P0 | 1 |
| FEAT-24-06 | 24-3 | PWA shell — .1 installability .2 offline read-cache .3 update prompt .4 platform fallback matrix | MOD-SHELL | Introduce | ADR-T02/T10, FF-09 | P0 | 1 |
| FEAT-24-07 | 24-3 | Draft sync & conflict resolution | MOD-SHELL · api/platform | Introduce | INV-T13 | P1 | 1 |
| FEAT-24-08 | 24-2 | Rate limiting | api/platform | Introduce | Abuse and cost control | P0 | 1 |
| FEAT-24-09 | 24-1 | Scheduler (expiry, digests, retention sweeps) | apps/worker | Introduce | Time-based transitions | P0 | 1 |
| FEAT-24-10 | 24-4 | Remote manifest & compatibility registry | MOD-SHELL | Introduce | ADR-T18, FF-08 | P1 | 2 |
| FEAT-24-11 | 24-4 | Migration tooling (append-only, rollback note) | api/platform | Introduce | FF-10 | P0 | 1 |
| FEAT-24-12 | 24-5 | Search indexing pipeline | api/search · apps/worker | Introduce | Keeps index consistent with outbox | P0 | 1 |

## 3. Counts

Counted from the tables above (108 capabilities, 253 local features, 318 micro-features; **571 FEAT + micro-feature addressable items** across 24 domains). Capability rows are counted separately and are not included in the 571 total.

| Dimension | Counts |
|---|---|
| Disposition | Introduce 122 · Improve 56 · Defer 32 · Redesign 26 · Remove 7 · Keep 6 · Merge 3 · Replace 1 · Split 0 (none warranted: no reference feature needs two) |
| Priority | P0 92 · P1 84 · P2 77 |
| Phase | Ph0 3; Ph1 82; Ph2 87; Ph3 42; Ph4 32; not built (Remove) 7 |
| Features per domain | 01:13 · 02:9 · 03:10 · 04:7 · 05:12 · 06:10 · 07:13 · 08:12 · 09:11 · 10:17 · 11:11 · 12:7 · 13:10 · 14:9 · 15:10 · 16:14 · 17:10 · 18:11 · 19:10 · 20:10 · 21:7 · 22:10 · 23:8 · 24:12 |

Reading the numbers: *Introduce* dominates because the reference product lacked the trust machinery (policy, outbox, consent, referee, sandbox). These proposed phase counts include three foundational Ph0 AI-policy features; Ph1/Ph2 counts remain provisional until the feature-to-work-package reconciliation recorded under REVW-10 is complete. That sequencing task is separate from canonical F-to-FEAT mapping under OPEN-41.

## 4. Cross-domain observations

1. **Phase-1 pre-GA pilot spine** (candidate learning/practice, evidence, verification, discovery, match and apply; no full hiring outcome): FEAT-01-01..06, FEAT-03-01/02/07, FEAT-04-01/02/04, FEAT-05-01/02/04/05/07/12, FEAT-06-01/02/03/10, FEAT-07-05/11, FEAT-08-01..04, FEAT-09-01..03/05, FEAT-10-01..03/14, FEAT-11-01..03/07, FEAT-22-01..03, FEAT-24-01..09, FEAT-02-01..03/07. The SSOT-required interview, outcome, and new-evidence closure belongs to the Phase-2 GA gate.
2. **Features removed on principle:** FEAT-09-11 (pay-to-rank), FEAT-10-17 (auto-reject), FEAT-14-05/08/09 (non-goals), FEAT-13-08 (legacy), FEAT-20-07 (impersonation).
3. **Features whose Phase differs from their domain's headline phase** (e.g. billing in Ph2 though DOM-16 is Supporting) are deliberate: Phase 1 is free-tier only; entitlements default to the free plan until FEAT-16-04 ships. **[OPEN-05]** pricing.
4. **Ownership clarity:** every FEAT has exactly one *accountable* backend module (the first backend named); additional backend names are collaborators reached via public interfaces (FF-02) or outbox events.

# Revision 2 additions (folded 2026-10-27 from `CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md#record-capability-map-phase-reconciliation-rev2`)

## 1. Method

1. Baseline: the PCAP-01 phase column as it stands now (it already carries an earlier reconciliation: assessment features in Phase 2, FEAT-17-01..03 in Phase 0 as the policy-only gateway skeleton).
2. Every feature tagged Phase 0 or Phase 1 is assigned to the work package of `ROADMAP.md` that delivers it (section 2). A feature that no Phase 0/1 work package delivers cannot stay in Phase 0/1.
3. A work package that delivers a feature the map tags later, or a binding decision that requires it earlier, moves the feature (section 3).
4. Counts are produced by a script that parses the rows `| FEAT-DD-NN |` and reads the last column (section 4).

## 2. Phase 0 and Phase 1 crosswalk: work package → features

| Work package | Features (current map phase 0 or 1) | Count |
|---|---|---|
| WP-POLICY-CORE (Ph0) | 01-09 | 1 |
| WP-IDENTITY-SESSIONS | 01-01, 01-02, 01-03, 01-04, 01-05, 01-06, 01-10, 01-13 | 8 |
| WP-ORG-TENANCY | 02-01, 02-02, 02-03, 02-07 | 4 |
| WP-PROFILE | 03-01, 03-02, 03-03, 03-04, 03-06, 03-07, 03-08, 03-09 | 8 |
| WP-SKILLS-TAXONOMY | 04-01, 04-02, 04-04 | 3 |
| WP-EVIDENCE-CORE | 05-01, 05-02, 05-04, 05-05, 05-08, 05-12, 24-04 | 7 |
| WP-PRIVACY-CONSENT | 05-07, 22-01, 22-02, 22-03, 22-05, 22-06 | 6 |
| WP-VERIF-REFEREE | 06-01, 06-02, 06-03, 06-04, 06-10 | 5 |
| WP-LEARNING-CORE | 07-05, 07-11, 08-01, 08-02, 08-03, 08-04 | 6 |
| WP-OPP-JOBS | 09-01, 09-02, 09-03, 09-05, 09-07 | 5 |
| WP-APPLY-CORE | 10-01, 10-02, 10-03, 10-14 | 4 |
| WP-SEARCH-BASE | 11-01, 24-12 | 2 |
| WP-MATCH-EXPLAIN | 11-02, 11-03, 11-07 | 3 |
| WP-NOTIFY-EMAIL | 15-01, 15-02, 15-03, 15-06, 15-07 | 5 |
| WP-ADMIN-TOOLING | 20-01, 20-02, 20-03 | 3 |
| WP-FEATURE-FLAGS | 20-04 | 1 |
| WP-ANALYTICS-BASE | 21-01 | 1 |
| WP-WORKER-OUTBOX | 24-01, 24-02, 24-09 | 3 |
| WP-CONTRACTS-OPENAPI (Ph0) | 24-03, 24-08 | 2 |
| WP-OBS-BASE (Ph0) | 24-05 | 1 |
| WP-DB-BASE (Ph0) | 24-11 | 1 |
| WP-PWA-PLATFORM | 24-06, 24-07 | 2 |
| WP-AI-GATEWAY-BASE (Ph0) | 17-01, 17-02, 17-03 | 3 |

Feature ids are shown without the `FEAT-` prefix. FEAT-24-08 (rate limiting) is not named by any work package; it is assigned here to WP-CONTRACTS-OPENAPI (middleware) and the roadmap owner should confirm. FEAT-05-04 (authority verification) delivers the issuer-class mechanism (BR-T118) in Phase 1; the only issuer live in Phase 1 is `platform` (first-party course rule and staff sign-off); the `instructor` class needs the instructor studio (WP-LEARNING-DEPTH, Phase 2).

## 3. Changes to the phase column

| Feature | Title | Current | REV2 | Delivering work package | Reason |
|---|---|---|---|---|---|
| FEAT-01-07 | Multi-factor TOTP | 2 | 1 | WP-IDENTITY-SESSIONS | Privileged roles need MFA (BR-T044) from the first day the Phase 1 admin console exists; scope limited to mandatory TOTP for staff and org owners |
| FEAT-13-01 | Conversations (consented threads) | 2 | 1 | WP-MESSAGING-BASIC (new) | Binding decision REVW-10 puts basic messaging in Phase 1; scope is application-linked threads only |
| FEAT-13-05 | Block, report & mute | 2 | 1 | WP-MESSAGING-BASIC (new) | Messaging without block and report is unsafe; reports go to the admin queue until WP-MODERATION |
| FEAT-16-04 | Entitlement derivation & gates | 2 | 1 | WP-ENTITLEMENT-BASE | The roadmap already schedules the entitlement stub in Phase 1 (BR-T090); the map still said Phase 2 |
| FEAT-19-08 | Abuse throttles & spam limits | 1 | 2 | WP-MODERATION | No Phase 1 work package delivers it; FEAT-24-08 provides platform rate limits in Phase 1 |
| FEAT-11-09 | Adverse-impact audit reports | 3 | 2 | WP-FAIRNESS-AUDIT (moved to Ph2) | Fairness audit gates recruiter-facing ranking and public matching (BR-T126), which are Phase 2 |
| FEAT-14-07 | Employee/peer referrals | 3 | 4 | WP-COMMUNITY | Networking domain DOM-14 is Phase 4 / deferred (REVW-34); referrals live in api/network |

Proposed new work packages are specified in `ROADMAP.md#record-roadmap-rev2`. No feature is added or removed.

## 4. Counts (method: script over the feature tables)

| Dimension | Current PCAP-01 | REV2 |
|---|---|---|
| Phase | Ph0 3 · Ph1 82 · Ph2 87 · Ph3 42 · Ph4 32 · not built 7 | Ph0 3 · Ph1 85 · Ph2 85 · Ph3 40 · Ph4 33 · not built 7 |
| Features | 253 | 253 |
| Priority | P0 92 · P1 84 · P2 77 | unchanged |

Reproduced counts, other headline figures: 253 features; 108 `CAP-` rows (the "97 capabilities" figure in PCAP-01 and PROJECT_MASTER does not reproduce; REVW-36); 318 micro-features (PCAP-01 figure, not re-derived here); 571 = 253 + 318.

## 5. Features without an acceptance criterion (REVW-17)

Method: a feature "has an AC" when some `AC-DD-NN-xx` (with optional `.k` micro-feature part) with its own domain and feature number appears in `05_FEATURE_SPECIFICATIONS` or `16_QA_AND_TESTING`. Features covered only by cross-cutting `AC-00-*` criteria count as having none. Indirect coverage is not assumed.

| Dimension | Count |
|---|---|
| Features with no AC of their own (all phases) | 158 of 253 |
| of which REV2 phase 0 | 3 (P0: 3) |
| of which REV2 phase 1 | 27 (P0: 21) |
| of which REV2 phase 2 | 54 (P0: 4) |
| of which REV2 phase 3 | 34 (P0: 0) |
| of which REV2 phase 4 | 33 (P0: 0) |

The figure "26 features without ACs" in TEST_CATALOG section 15, TRC-01 and PROJECT_MASTER does not reproduce under this method; REVW-17 reported 158 and this script finds 158.

**P0 features in Phase 0 or 1 with no AC (blockers to Ready until each has one):**

| Feature | Title | Resolution |
|---|---|---|
| FEAT-17-01 | Gateway single path & routing | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-17-02 | Budget & quota enforcement | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-17-03 | Policy blocks (AI_PROHIBITED etc.) | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-01-09 | Capability endpoint `GET /me/capabilities` | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-02-01 | Organization creation & domain verification | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-02-07 | Tenant isolation (RLS + canary suite) | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-04-01 | Canonical skill taxonomy | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-04-02 | Skill tagging on any entity | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-08-01 | Course catalogue & discovery | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-15-01 | Notification centre | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-15-03 | Email delivery via provider port | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-15-06 | Delivery tracking & retry | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-15-07 | Unsubscribe & suppression list | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-20-01 | Admin console shell & RBAC | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-20-03 | Audit log viewer & export | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-21-01 | Event taxonomy & product telemetry | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-22-06 | Policy version acceptance ledger | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-01 | Transactional outbox & dispatcher | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-02 | Background job queue with fenced leases | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-04 | Object storage & signed URLs | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-05 | Observability (trace-context, redacted logs) | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-08 | Rate limiting | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-09 | Scheduler (expiry, digests, retention sweeps) | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-11 | Migration tooling (append-only, rollback note) | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |

P1/P2 features in Phase 0 or 1 with no AC: 01-07, 03-03, 07-11, 09-07, 20-04, 22-05. They are not blockers to Ready but must be written before their work package exits.

P0 features in Phase 2 with no AC (blocker to the Phase 2 work packages that deliver them): 07-01, 16-01, 19-02, 19-08.

## 6. Phase 1 gaps this reconciliation exposes

| # | Gap | Proposed handling |
|---|---|---|
| G1 | FEAT-06-03 (referee outcomes, Phase 1) can produce `dispute`, but dispute handling FEAT-06-05 and the moderation queue FEAT-19-02 are Phase 2 | In Phase 1 a `dispute` outcome is recorded with no automatic effect (DT-04 row 4a) and is reviewed through the WP-ADMIN-TOOLING queue by two staff; SM-DISPUTE t1 to t4 run on that queue |
| G2 | Jobs, applications and messaging are live in Phase 1 while the moderation queue is Phase 2 | Pilot exposure only (RDM-01 section 5.2); mandatory organization verification (BR-T035); admin takedown through WP-ADMIN-TOOLING with reason code and second person (BR-T045); registered as RISK-51 in `RISK_REGISTER.md#record-risk-register-rev2` |
| G3 | Recruiter stage movement and rejection (FEAT-10-05/06) are Phase 2 | A Phase 1 hiring team can read the application snapshot (DT-01 row 4) and message the candidate; it cannot move stages. This matches the roadmap statement that Phase 1 is not GA |
| G4 | FEAT-01-07 is Phase 2 while staff sign in to the Phase 1 admin console | Moved to Phase 1 (section 3) |

## 7. Networking and public API phases (REVW-34)

Decision: DOM-14 networking is **Phase 4 / deferred** (FEAT-14-01 to 14-09 all Phase 4 or removed; FEAT-14-07 moved from Phase 3). The public API (FEAT-23-01, 23-02, 23-07) is **Phase 4**, and WP-INTEGRATIONS-API already sits in Phase 4 in the current roadmap. FEAT-23-03 (calendar integration, Phase 2) and FEAT-23-04/05/08 (Phase 3) are unaffected.

**List for the backend, API and UI registry owners (not edited here; these belong to other folders):**

| Where | Item | Action |
|---|---|---|
| `03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md` section 6 | "DOM-14 phase 3" | Change to Phase 4 / deferred |
| `13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md` | DOM-14 header "phase 3"; API-14-01 `GET /network/connections`, API-14-02 `POST /network/connection-requests`, API-14-03 `POST /network/connection-requests/{requestId}/response` | Mark Phase 4 and remove from the launch contract (`openapi.yaml`) and launch registries |
| `13_.../EVENT_CATALOG.md`, `asyncapi.yaml` | `connection.*` events | Mark Phase 4; do not publish in Phase 1/2 |
| `07_UI_UX_AND_DESIGN_SYSTEM/SCREEN_REGISTRY.md`, `NAVIGATION_ARCHITECTURE.md` | `/network/*` routes and any `ACT-NET-*` actions | Remove from the launch registries; keep as Phase 4 backlog |
| `12_DATA_AND_DATABASE` | `connection` table (DATA-E1401) | Mark Phase 4; do not create in the Phase 1 migrations |
| `13_.../API_CATALOG.md` | DOM-23 endpoints for FEAT-23-01/02/07 | Mark Phase 4 |

## 8. Phase-1 spine (replacement for PCAP-01 section 4, item 1)

One candidate completes Prove → Showcase → Apply with job search and an explained, advisory match, and one hiring team receives and reads the application: 01-01, 01-02, 01-04, 01-06, 01-09, 01-13, 02-01, 02-02, 02-03, 02-07, 03-01, 03-02, 03-07, 04-01, 04-02, 04-04, 05-01, 05-02, 05-04, 05-05, 05-07, 05-12, 06-01, 06-02, 06-03, 06-04, 06-10, 07-05, 08-01, 08-02, 08-03, 08-04, 09-01, 09-02, 09-03, 09-05, 10-01, 10-02, 10-03, 10-14, 11-01, 11-02, 11-03, 11-07, 13-01, 13-05, 15-01, 15-02, 15-03, 15-06, 15-07, 16-04, 17-01, 17-02, 17-03, 20-01, 20-02, 20-03, 21-01, 22-01, 22-02, 22-03, 22-06, 24-01, 24-02, 24-03, 24-04, 24-05, 24-06, 24-08, 24-09, 24-11, 24-12 (all P0 features in Phase 0 or 1 after this reconciliation).

First-party learning (FEAT-08-01..04) and practice (FEAT-07-11) remain in Phase 1 in the current roadmap. The binding decision for REVW-10 demotes learning *depth*, not the minimum first-party path, so the two are consistent; if the ARB reads the decision more strictly, move FEAT-07-05, 07-11 and 08-01..04 to Phase 2 and WP-LEARNING-CORE with them (Phase 1 would then have 79 features). **[OPEN-42, owner: Program Director]**


---

<a id="record-capability-map-phase-reconciliation-rev2"></a>
## Preserved source record: CAPABILITY_MAP_PHASE_RECONCILIATION_REV2

> Consolidated on 2026-10-27. The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. Approval conditions and authority remain unchanged: this move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_PHASE_RECONCILIATION_REV2.md -->
<a id="record-capability-map-phase-reconciliation-rev2--capability-map-phase-reconciliation-revision-2-pcap-01-rev2"></a>
# Capability Map Phase Reconciliation, Revision 2 (PCAP-01 REV2)

Doc ID: PCAP-01-R2 · Owner: Product Director · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-10, REVW-34 (phases), REVW-36 (counts), REVW-17 (feature/AC gap list); proposes the resolution of OPEN-42 · Relates: PCAP-01, RDM-01 and RDM-01-R2, BR-REG-R2

> **Folded into `CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` on 2026-10-27.** Change record only; edit the original.

**Relationship (no original file was edited).** This file **supersedes, once accepted**, the "Ph" column of the feature tables, the "Counts" section (section 3) and the "Phase-1 spine" item of `CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` (PCAP-01) **where they differ from the tables below**. All other content of PCAP-01 stands. The roadmap `22_IMPLEMENTATION_ROADMAP/ROADMAP.md` stays the authority for phases (REVW-10): a feature has the phase of the first work package that delivers it. This file records that crosswalk, which PCAP-01 flags as open (OPEN-42). Governance should link it from `00_CONTROL_CENTRE/MASTER_INDEX.md`.

Nothing here claims any feature is built. Phase tags are product sequencing, not delivery commitments. Phase 1 is the pre-GA pilot of RDM-01 section 5.2.

<a id="record-capability-map-phase-reconciliation-rev2--1-method"></a>
## 1. Method

1. Baseline: the PCAP-01 phase column as it stands now (it already carries an earlier reconciliation: assessment features in Phase 2, FEAT-17-01..03 in Phase 0 as the policy-only gateway skeleton).
2. Every feature tagged Phase 0 or Phase 1 is assigned to the work package of `ROADMAP.md` that delivers it (section 2). A feature that no Phase 0/1 work package delivers cannot stay in Phase 0/1.
3. A work package that delivers a feature the map tags later, or a binding decision that requires it earlier, moves the feature (section 3).
4. Counts are produced by a script that parses the rows `| FEAT-DD-NN |` and reads the last column (section 4).

<a id="record-capability-map-phase-reconciliation-rev2--2-phase-0-and-phase-1-crosswalk-work-package--features"></a>
## 2. Phase 0 and Phase 1 crosswalk: work package → features

| Work package | Features (current map phase 0 or 1) | Count |
|---|---|---|
| WP-POLICY-CORE (Ph0) | 01-09 | 1 |
| WP-IDENTITY-SESSIONS | 01-01, 01-02, 01-03, 01-04, 01-05, 01-06, 01-10, 01-13 | 8 |
| WP-ORG-TENANCY | 02-01, 02-02, 02-03, 02-07 | 4 |
| WP-PROFILE | 03-01, 03-02, 03-03, 03-04, 03-06, 03-07, 03-08, 03-09 | 8 |
| WP-SKILLS-TAXONOMY | 04-01, 04-02, 04-04 | 3 |
| WP-EVIDENCE-CORE | 05-01, 05-02, 05-04, 05-05, 05-08, 05-12, 24-04 | 7 |
| WP-PRIVACY-CONSENT | 05-07, 22-01, 22-02, 22-03, 22-05, 22-06 | 6 |
| WP-VERIF-REFEREE | 06-01, 06-02, 06-03, 06-04, 06-10 | 5 |
| WP-LEARNING-CORE | 07-05, 07-11, 08-01, 08-02, 08-03, 08-04 | 6 |
| WP-OPP-JOBS | 09-01, 09-02, 09-03, 09-05, 09-07 | 5 |
| WP-APPLY-CORE | 10-01, 10-02, 10-03, 10-14 | 4 |
| WP-SEARCH-BASE | 11-01, 24-12 | 2 |
| WP-MATCH-EXPLAIN | 11-02, 11-03, 11-07 | 3 |
| WP-NOTIFY-EMAIL | 15-01, 15-02, 15-03, 15-06, 15-07 | 5 |
| WP-ADMIN-TOOLING | 20-01, 20-02, 20-03 | 3 |
| WP-FEATURE-FLAGS | 20-04 | 1 |
| WP-ANALYTICS-BASE | 21-01 | 1 |
| WP-WORKER-OUTBOX | 24-01, 24-02, 24-09 | 3 |
| WP-CONTRACTS-OPENAPI (Ph0) | 24-03, 24-08 | 2 |
| WP-OBS-BASE (Ph0) | 24-05 | 1 |
| WP-DB-BASE (Ph0) | 24-11 | 1 |
| WP-PWA-PLATFORM | 24-06, 24-07 | 2 |
| WP-AI-GATEWAY-BASE (Ph0) | 17-01, 17-02, 17-03 | 3 |

Feature ids are shown without the `FEAT-` prefix. FEAT-24-08 (rate limiting) is not named by any work package; it is assigned here to WP-CONTRACTS-OPENAPI (middleware) and the roadmap owner should confirm. FEAT-05-04 (authority verification) delivers the issuer-class mechanism (BR-T118) in Phase 1; the only issuer live in Phase 1 is `platform` (first-party course rule and staff sign-off); the `instructor` class needs the instructor studio (WP-LEARNING-DEPTH, Phase 2).

<a id="record-capability-map-phase-reconciliation-rev2--3-changes-to-the-phase-column"></a>
## 3. Changes to the phase column

| Feature | Title | Current | REV2 | Delivering work package | Reason |
|---|---|---|---|---|---|
| FEAT-01-07 | Multi-factor TOTP | 2 | 1 | WP-IDENTITY-SESSIONS | Privileged roles need MFA (BR-T044) from the first day the Phase 1 admin console exists; scope limited to mandatory TOTP for staff and org owners |
| FEAT-13-01 | Conversations (consented threads) | 2 | 1 | WP-MESSAGING-BASIC (new) | Binding decision REVW-10 puts basic messaging in Phase 1; scope is application-linked threads only |
| FEAT-13-05 | Block, report & mute | 2 | 1 | WP-MESSAGING-BASIC (new) | Messaging without block and report is unsafe; reports go to the admin queue until WP-MODERATION |
| FEAT-16-04 | Entitlement derivation & gates | 2 | 1 | WP-ENTITLEMENT-BASE | The roadmap already schedules the entitlement stub in Phase 1 (BR-T090); the map still said Phase 2 |
| FEAT-19-08 | Abuse throttles & spam limits | 1 | 2 | WP-MODERATION | No Phase 1 work package delivers it; FEAT-24-08 provides platform rate limits in Phase 1 |
| FEAT-11-09 | Adverse-impact audit reports | 3 | 2 | WP-FAIRNESS-AUDIT (moved to Ph2) | Fairness audit gates recruiter-facing ranking and public matching (BR-T126), which are Phase 2 |
| FEAT-14-07 | Employee/peer referrals | 3 | 4 | WP-COMMUNITY | Networking domain DOM-14 is Phase 4 / deferred (REVW-34); referrals live in api/network |

Proposed new work packages are specified in `ROADMAP.md#record-roadmap-rev2`. No feature is added or removed.

<a id="record-capability-map-phase-reconciliation-rev2--4-counts-method-script-over-the-feature-tables"></a>
## 4. Counts (method: script over the feature tables)

| Dimension | Current PCAP-01 | REV2 |
|---|---|---|
| Phase | Ph0 3 · Ph1 82 · Ph2 87 · Ph3 42 · Ph4 32 · not built 7 | Ph0 3 · Ph1 85 · Ph2 85 · Ph3 40 · Ph4 33 · not built 7 |
| Features | 253 | 253 |
| Priority | P0 92 · P1 84 · P2 77 | unchanged |

Reproduced counts, other headline figures: 253 features; 108 `CAP-` rows (the "97 capabilities" figure in PCAP-01 and PROJECT_MASTER does not reproduce; REVW-36); 318 micro-features (PCAP-01 figure, not re-derived here); 571 = 253 + 318.

<a id="record-capability-map-phase-reconciliation-rev2--5-features-without-an-acceptance-criterion-revw-17"></a>
## 5. Features without an acceptance criterion (REVW-17)

Method: a feature "has an AC" when some `AC-DD-NN-xx` (with optional `.k` micro-feature part) with its own domain and feature number appears in `05_FEATURE_SPECIFICATIONS` or `16_QA_AND_TESTING`. Features covered only by cross-cutting `AC-00-*` criteria count as having none. Indirect coverage is not assumed.

| Dimension | Count |
|---|---|
| Features with no AC of their own (all phases) | 158 of 253 |
| of which REV2 phase 0 | 3 (P0: 3) |
| of which REV2 phase 1 | 27 (P0: 21) |
| of which REV2 phase 2 | 54 (P0: 4) |
| of which REV2 phase 3 | 34 (P0: 0) |
| of which REV2 phase 4 | 33 (P0: 0) |

The figure "26 features without ACs" in TEST_CATALOG section 15, TRC-01 and PROJECT_MASTER does not reproduce under this method; REVW-17 reported 158 and this script finds 158.

**P0 features in Phase 0 or 1 with no AC (blockers to Ready until each has one):**

| Feature | Title | Resolution |
|---|---|---|
| FEAT-17-01 | Gateway single path & routing | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-17-02 | Budget & quota enforcement | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-17-03 | Policy blocks (AI_PROHIBITED etc.) | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-01-09 | Capability endpoint `GET /me/capabilities` | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-02-01 | Organization creation & domain verification | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-02-07 | Tenant isolation (RLS + canary suite) | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-04-01 | Canonical skill taxonomy | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-04-02 | Skill tagging on any entity | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-08-01 | Course catalogue & discovery | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-15-01 | Notification centre | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-15-03 | Email delivery via provider port | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-15-06 | Delivery tracking & retry | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-15-07 | Unsubscribe & suppression list | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-20-01 | Admin console shell & RBAC | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-20-03 | Audit log viewer & export | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-21-01 | Event taxonomy & product telemetry | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-22-06 | Policy version acceptance ledger | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-01 | Transactional outbox & dispatcher | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-02 | Background job queue with fenced leases | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-04 | Object storage & signed URLs | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-05 | Observability (trace-context, redacted logs) | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-08 | Rate limiting | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-09 | Scheduler (expiry, digests, retention sweeps) | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |
| FEAT-24-11 | Migration tooling (append-only, rollback note) | AC written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` |

P1/P2 features in Phase 0 or 1 with no AC: 01-07, 03-03, 07-11, 09-07, 20-04, 22-05. They are not blockers to Ready but must be written before their work package exits.

P0 features in Phase 2 with no AC (blocker to the Phase 2 work packages that deliver them): 07-01, 16-01, 19-02, 19-08.

<a id="record-capability-map-phase-reconciliation-rev2--6-phase-1-gaps-this-reconciliation-exposes"></a>
## 6. Phase 1 gaps this reconciliation exposes

| # | Gap | Proposed handling |
|---|---|---|
| G1 | FEAT-06-03 (referee outcomes, Phase 1) can produce `dispute`, but dispute handling FEAT-06-05 and the moderation queue FEAT-19-02 are Phase 2 | In Phase 1 a `dispute` outcome is recorded with no automatic effect (DT-04 row 4a) and is reviewed through the WP-ADMIN-TOOLING queue by two staff; SM-DISPUTE t1 to t4 run on that queue |
| G2 | Jobs, applications and messaging are live in Phase 1 while the moderation queue is Phase 2 | Pilot exposure only (RDM-01 section 5.2); mandatory organization verification (BR-T035); admin takedown through WP-ADMIN-TOOLING with reason code and second person (BR-T045); registered as RISK-51 in `RISK_REGISTER.md#record-risk-register-rev2` |
| G3 | Recruiter stage movement and rejection (FEAT-10-05/06) are Phase 2 | A Phase 1 hiring team can read the application snapshot (DT-01 row 4) and message the candidate; it cannot move stages. This matches the roadmap statement that Phase 1 is not GA |
| G4 | FEAT-01-07 is Phase 2 while staff sign in to the Phase 1 admin console | Moved to Phase 1 (section 3) |

<a id="record-capability-map-phase-reconciliation-rev2--7-networking-and-public-api-phases-revw-34"></a>
## 7. Networking and public API phases (REVW-34)

Decision: DOM-14 networking is **Phase 4 / deferred** (FEAT-14-01 to 14-09 all Phase 4 or removed; FEAT-14-07 moved from Phase 3). The public API (FEAT-23-01, 23-02, 23-07) is **Phase 4**, and WP-INTEGRATIONS-API already sits in Phase 4 in the current roadmap. FEAT-23-03 (calendar integration, Phase 2) and FEAT-23-04/05/08 (Phase 3) are unaffected.

**List for the backend, API and UI registry owners (not edited here; these belong to other folders):**

| Where | Item | Action |
|---|---|---|
| `03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md` section 6 | "DOM-14 phase 3" | Change to Phase 4 / deferred |
| `13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md` | DOM-14 header "phase 3"; API-14-01 `GET /network/connections`, API-14-02 `POST /network/connection-requests`, API-14-03 `POST /network/connection-requests/{requestId}/response` | Mark Phase 4 and remove from the launch contract (`openapi.yaml`) and launch registries |
| `13_.../EVENT_CATALOG.md`, `asyncapi.yaml` | `connection.*` events | Mark Phase 4; do not publish in Phase 1/2 |
| `07_UI_UX_AND_DESIGN_SYSTEM/SCREEN_REGISTRY.md`, `NAVIGATION_ARCHITECTURE.md` | `/network/*` routes and any `ACT-NET-*` actions | Remove from the launch registries; keep as Phase 4 backlog |
| `12_DATA_AND_DATABASE` | `connection` table (DATA-E1401) | Mark Phase 4; do not create in the Phase 1 migrations |
| `13_.../API_CATALOG.md` | DOM-23 endpoints for FEAT-23-01/02/07 | Mark Phase 4 |

<a id="record-capability-map-phase-reconciliation-rev2--8-phase-1-spine-replacement-for-pcap-01-section-4-item-1"></a>
## 8. Phase-1 spine (replacement for PCAP-01 section 4, item 1)

One candidate completes Prove → Showcase → Apply with job search and an explained, advisory match, and one hiring team receives and reads the application: 01-01, 01-02, 01-04, 01-06, 01-09, 01-13, 02-01, 02-02, 02-03, 02-07, 03-01, 03-02, 03-07, 04-01, 04-02, 04-04, 05-01, 05-02, 05-04, 05-05, 05-07, 05-12, 06-01, 06-02, 06-03, 06-04, 06-10, 07-05, 08-01, 08-02, 08-03, 08-04, 09-01, 09-02, 09-03, 09-05, 10-01, 10-02, 10-03, 10-14, 11-01, 11-02, 11-03, 11-07, 13-01, 13-05, 15-01, 15-02, 15-03, 15-06, 15-07, 16-04, 17-01, 17-02, 17-03, 20-01, 20-02, 20-03, 21-01, 22-01, 22-02, 22-03, 22-06, 24-01, 24-02, 24-03, 24-04, 24-05, 24-06, 24-08, 24-09, 24-11, 24-12 (all P0 features in Phase 0 or 1 after this reconciliation).

First-party learning (FEAT-08-01..04) and practice (FEAT-07-11) remain in Phase 1 in the current roadmap. The binding decision for REVW-10 demotes learning *depth*, not the minimum first-party path, so the two are consistent; if the ARB reads the decision more strictly, move FEAT-07-05, 07-11 and 08-01..04 to Phase 2 and WP-LEARNING-CORE with them (Phase 1 would then have 79 features). **[OPEN-42, owner: Program Director]**

<!-- source-record-end: Yash_Final_Project_Document/04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_PHASE_RECONCILIATION_REV2.md -->
