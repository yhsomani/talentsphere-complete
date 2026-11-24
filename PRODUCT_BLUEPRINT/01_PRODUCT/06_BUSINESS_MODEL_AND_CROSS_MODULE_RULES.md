# 06 — Business Model and Cross-Module Rules

Monetization options, the entitlement philosophy, and the cross-cutting business rules (`BR-XCT-nnn`) that every module must obey. Module rules (`BR-<MOD>-nnn`) may refine but never contradict a `BR-XCT` rule; a contradiction is resolved by the precedence in §5 and recorded as an `OD-`. **No price, fee, percentage, quota value or revenue figure is decided here**; where a number is needed, a parameter name and a [PROP] default are given, or the value is left to an `OD-PRD-` decision. [SRC: SSOT Appendix E V61-09; COMMERCIAL_OPERATIONS preamble]

## 1. Monetization options

### 1.1 Streams

| Stream | Payer | Unit options | Value delivered | Guardrails (rules) | Active when | Tier |
|---|---|---|---|---|---|---|
| Employer subscription | Employer org | Per seat; per active job slot; hybrid of seats plus slot and quota bundles | Seats, active jobs, verified-search and outreach quotas, ATS depth, SSO, audit export | `BR-XCT-020`, `BR-XCT-043`, `BR-XCT-045` | `OD-PRD-06`, `OD-PRD-08` close | R2 |
| Free employer tier | — | Limited active jobs and seats | Lets small employers post and close the loop for candidates | Same ranking treatment as paid jobs | `OD-PRD-06` (free posting policy) | R1 |
| Institution licence | Institution | Per provisioned seat; per cohort; campus licence | Cohorts, licensed content, analytics, credentials, placement | `BR-XCT-001`, `BR-XCT-029` | `OD-PRD-07` | R3 |
| Candidate premium | Candidate | Monthly or yearly subscription | Tools: extra résumé variants above the free count, advanced personal analytics, higher AI quota | `BR-XCT-027`, `BR-XCT-047`, `BR-XCT-039` | `OD-PRD-05` | R5 |
| First-party course sales | Learner | Per course; per path; course bundle | Paid catalog content sold by the platform | `BR-XCT-044`, `BR-XCT-049` | `OD-PRD-04` | R5 |
| Third-party marketplace commission | Seller (instructor, mentor, freelancer, event organizer) or buyer | Percentage commission; fixed fee per transaction; listing fee | Reach, payments, dispute handling | `BR-XCT-048`, `BR-XCT-049` | `OD-PRD-04` plus module admission `OD-PRD-02` | R6 |
| Enterprise talent | Enterprise org | Per employee per period | Skills inventory, internal mobility, mandated learning, HRIS sync | `BR-XCT-001`, `OD-PRD-20` | `OD-PRD-02`, `OD-PRD-20` | R6 |
| Verification services | Employer org | Per check | Background checks, bulk employment verification | `BR-XCT-012`, `BR-XCT-021` | `OD-PRD-19` | R4 |
| Public API | Partner or org | Included in top employer and institution tiers; metered calls | Integrations | `BR-XCT-055` | `OD-PRD-23` | R5 |
| Aggregate insights | Employer, institution | Subscription add-on | k-anonymous salary and skills-demand benchmarks | `BR-XCT-029` | `OD-PRD-29`, `OD-PRD-12` | R6 |
| Promoted job placement | Employer org | Per placement period | Labelled visibility in separate slots | `BR-XCT-020` | `OD-PRD-18` (default: not offered) | R5 |

### 1.2 Streams excluded

| Excluded stream | Reason | Source |
|---|---|---|
| Advertising network, display ads, sponsored feed posts | Non-goal; degrades trust and fairness | [SRC: SSOT §4.2, OD-32] |
| Selling or licensing person-level data | Breaks consent model | [SRC: SSOT §4.2] |
| Pay-to-apply, pay-to-be-seen, paid "verified" badge | Core loop must be free; verification must be earned | [SRC: COMMERCIAL_OPERATIONS §1] |
| Pay-to-rank candidates or jobs in organic results | Fairness | [SRC: ADR-T22] |
| Paid unlock of contact details of non-consenting people | Consent | [DER] |
| Cryptocurrency or token rewards | Excluded scope | [SRC: SSOT §3.3] |

### 1.3 Commercial parameters (names only)

| Parameter | Meaning | Default proposal | Decision |
|---|---|---|---|
| `plan.catalog_version` | Immutable version of each plan and price | Versioned; never edited in place [PROP] | `OD-PRD-06` |
| `bil.grace_period_days` | Days of full entitlements while `past_due` | Set by owner | `OD-PRD-06` |
| `bil.refund_window_days` | Days in which a refund is granted by rule | SSOT recommends 30 days, pro-rated after 20 percent consumption [SRC: SSOT OD-29]; not adopted | `OD-PRD-04`, `OD-PRD-05` |
| `bil.refund_dual_control_threshold` | Amount above which a second `FIN` approves | One billing period of the plan [PROP] | Finance setting |
| `mkt.commission_rate` | Marketplace commission | SSOT recommends 70/30 revenue share for courses [SRC: SSOT OD-28]; not adopted | `OD-PRD-04` |
| `ai.free_daily_quota` | Free AI usage | Zero paid inference unless cost policy (`BR-XCT-039`) | `OD-PRD-21` |
| `msg.outreach_quota_per_period` | First-contact requests per recruiter per period | SSOT carries 20 (Pro) and 50 (Team) per week [SRC: SSOT BR-130]; not adopted | `OD-PRD-06` |
| `job.free_active_slots` | Active jobs on the free employer tier | Set by owner | `OD-PRD-06` |

## 2. Entitlement philosophy

1. **Charge for tools, scale and convenience; never for trust, rank or access to the core loop.** Entitlements may gate quotas (seats, active jobs, outreach requests, AI requests, résumé variants) and tools (SSO, audit export, API, advanced analytics). They may never gate: evidence creation and verification, applying, messaging in consented threads, consent and privacy controls, data export, accessibility features, or safety reporting. [SRC: COMMERCIAL_OPERATIONS §1; STR-01 §5]
2. **Entitlements are computed server-side from verified billing state.** The client and the checkout redirect grant nothing. [SRC: INV-T17]
3. **Entitlements never enter ranking.** Search, matching and suggested order read no billing field; tests assert that changing a plan leaves ranking output unchanged. (`BR-XCT-020`)
4. **Losing an entitlement never deletes data.** Over-limit items become read-only or stop accepting new activity; the owner chooses what to keep active. (`BR-XCT-045`)
5. **Entitlement holder is explicit.** In an org context, the org subscription is the default holder; whether a member's personal plan can add org quota is `OD-PRD-08`. [SRC: docs/PRICING.md review notes]
6. **Quotas are visible before they bite.** Every quota shows usage and reset time; hitting a quota returns `402 entitlement-required` with what is still free.
7. **Gated modules are off, not hidden-but-reachable.** A capability gated by an `OD-` returns `404 feature-unavailable` from the server; UI hiding is not enforcement. (04 §2 step 4)
8. **Institution and enterprise sponsorship.** An institution or enterprise may sponsor entitlements for its learners or employees; sponsorship ends with the seat and the person keeps all data. (`BR-XCT-001`)

### 2.1 Entitlement dimensions

| Dimension | Applies to | Kind | Free floor |
|---|---|---|---|
| `seats` | Employer org, institution | Count | Owner decides (`OD-PRD-06`, `OD-PRD-07`) |
| `active_job_slots` | Employer org | Count | `job.free_active_slots` |
| `outreach_requests` | Recruiter in an org | Per period | Zero or owner-set |
| `verified_search_views` | Recruiter in an org | Per period | Owner-set |
| `resume_variants` | Candidate | Count | A free count is always available (value `OD-PRD-05`) |
| `ai_requests` | Any role | Per period | `ai.free_daily_quota` |
| `sso_scim` | Org, institution | Boolean | No |
| `audit_export` | Org, institution | Boolean | No |
| `api_access` | Org, institution | Boolean plus rate | No |
| `advanced_analytics` | Org, institution, candidate | Boolean | No |
| `cohort_analytics` | Institution | Boolean | Basic always |
| `branding` | Org, institution | Level (none, co-brand, white-label) | None (`OD-PRD-24`) |

## 3. Cross-cutting business rules

"Enforced where" names the owning module or shared service that enforces the rule; every other module calls it rather than restating it.

### 3.1 Ownership and identity

| ID | Rule | Rationale | Enforced where | Source |
|---|---|---|---|---|
| BR-XCT-001 | A person owns their career identity: profile, evidence, learning records, applications, consents. No org, institution or enterprise becomes the owner of a person's career identity through employment, enrollment, sponsorship or contract; such parties own only the records they create about their own processes. | Portability and trust | `PRF`, `EVD`, `SET`, contracts | [SRC: STR-01 §5 "Learner owns career identity"] |
| BR-XCT-002 | Every core entity has exactly one owning module; only the owner writes it; others read through the owner's contract or events (see 07 §3). | One semantic model | All modules | [SRC: SSOT §3.1 "One semantic model"; DER] |
| BR-XCT-003 | Org-owned hiring records (jobs, requisitions, notes, scorecards, offers, API keys, integrations) belong to the org and survive a member's departure; offboarding reassigns them. | Continuity | `EMP`, `ATS`, `PLT` | [SRC: USR-01 REV2; DER] |
| BR-XCT-004 | An issuer (platform, institution, employer org, instructor) controls the validity of a credential it issued (issue, correct, revoke with reason); the holder controls whether it is displayed. | Issuer accountability, holder control | `EVD` | [SRC: SSOT §6.3] |
| BR-XCT-005 | Course and content ownership follows the authoring agreement: independent instructors own their courses and license the platform to distribute; institution and enterprise courses are owned by that tenant; first-party courses by the platform. | Clear rights | `STU` | [SRC: COMMERCIAL_OPERATIONS §13; DER] |
| BR-XCT-006 | When a person is erased, records shared with others keep the counterparty's copy: messages show "Deleted user"; reviews they wrote are removed; scorecards about them in an org are handled by the org's retention class; referee responses they gave remain attached to the candidate's evidence with the referee shown as "Former user". | Erasure without destroying others' records | `SET`, owning modules | [SRC: Appendix E V61-19; DER] |
| BR-XCT-080 | One account may hold many grants; every request carries one active context; capabilities are evaluated for that context only and never escalate across contexts. | Multi-role safety | `IDN`, policy service | [SRC: USR-01 REV2 §1; DER] |

### 3.2 Consent

| ID | Rule | Rationale | Enforced where | Source |
|---|---|---|---|---|
| BR-XCT-007 | Consent is purpose-bound, versioned and taken from one catalogue of scope ids; every scope defaults to off, except `application.share_snapshot`, which is granted by the act of applying. | Privacy by purpose | `SET` | [SRC: CONSENT_SCOPE_CATALOGUE] |
| BR-XCT-008 | Revocation takes effect at the first read after the revoking commit; no module caches consent; signed URLs issued under a revoked scope lapse within their short life (at most 5 minutes). | Immediate control | `SET`, `PLT` | [SRC: Appendix E V61-16] |
| BR-XCT-009 | Consent is never bundled with terms of service or made a condition of the core loop, except processing strictly necessary to provide what the person asked for. | Freely given | `SET`, all UI | [DER] |
| BR-XCT-010 | Nobody grants consent on behalf of another person; org admins, institution admins and enterprise admins cannot consent for members or learners. | Autonomy | `SET` | [SRC: USR-01 REV2 §2.1] |
| BR-XCT-011 | Every grant is visible in one consent centre with grantee, date, expiry, last use and a revoke control; receipts are downloadable. | Transparency | `SET` | [DER] |
| BR-XCT-012 | Every read of a person's non-public data by another party requires a live consent scope, an application snapshot, a booking share, or a lawful-basis exception named in the module spec (for example institution-run course work, mandated enterprise learning). | Consent bridge | Policy service, every module | [SRC: USR-01 §4 "consent scopes gate every recruiter read"] |
| BR-XCT-013 | Scopes with an expiry remind the person 14 days before; re-confirmation prompts are not expiries. | Avoid silent lapse | `SET`, `NTF` | [SRC: CONSENT_SCOPE_CATALOGUE] |

### 3.3 Visibility

| ID | Rule | Rationale | Enforced where | Source |
|---|---|---|---|---|
| BR-XCT-014 | Visibility levels are private, connections, discoverable to verified employers, and public; new accounts default to private for evidence and to not public for the profile page. | Safe defaults | `SET`, `PRF` | [SRC: CONSENT_SCOPE_CATALOGUE defaults off] |
| BR-XCT-015 | Email and phone are masked from every other party unless `profile.share_contact` is live for that party or the person shared them in an accepted conversation. | Contact protection | `PRF`, `MSG` | [SRC: CONSENT_SCOPE_CATALOGUE] |
| BR-XCT-016 | Evidence is always displayed with its rung (claimed, artifact-backed, peer-attested, authority-verified) and, for authority-verified, its issuer class; the word "verified" never appears for claimed items, and instructor attestation never displays as platform-verified. | Verified over claimed | `EVD`, all UI | [SRC: Appendix E V61-17] |
| BR-XCT-017 | A block overrides every consent, visibility and discoverability setting: the blocked party cannot view, search, message, refer, review or invite the blocker. | Safety | Policy service | [DER] |
| BR-XCT-018 | Evaluative notes and scorecards about a person are never shown to that person in product; they are disclosed only through a legally required data-subject access response handled by `SUP` with review. | Candid evaluation within law | `ATS`, `INT`, `SET` | [DER] |
| BR-XCT-019 | Profile-view and evidence-view disclosure to the person defaults to semi-anonymous (org class and date, not the viewer's name); stronger or weaker disclosure is an owner decision. | Balance of interests | `PRF`, `EVD` | [SRC: SSOT OD-36] |

### 3.4 Fairness

| ID | Rule | Rationale | Enforced where | Source |
|---|---|---|---|---|
| BR-XCT-020 | No pay-to-rank: no billing field, plan or payment is an input to search ranking, matching, suggested order or recommendations; any paid visibility (if `OD-PRD-18` admits it) is labelled and placed in separate slots. | Fairness | `SRC`, `AIC` | [SRC: ADR-T22; INV-T19] |
| BR-XCT-021 | No autonomous adverse decision: rejection, ranking out, suspension, sanction or adverse background-check action requires a recorded human actor; bulk actions require explicit confirmation by a human. | Human-controlled AI | `ATS`, `TSF`, `BGV`, `AIC` | [SRC: SSOT §3.2; STR-01 §7] |
| BR-XCT-022 | Every match or recommendation shown carries its rationale and an uncertainty statement. | Explainability | `AIC` | [SRC: SSOT §3.2] |
| BR-XCT-023 | Protected attributes are never ranking features; they are collected only voluntarily, for audit-only purposes, stored separately and readable only by the audit role. | Non-discrimination | `AIC`, `ANL` | [SRC: STR-01 REV2 GOAL-03] |
| BR-XCT-024 | An adverse-impact review is held each quarter on audit-only attributes; the result is recorded; a ratio below the counsel-set threshold opens a human review. | Fairness monitoring | `ANL`, `AIC` | [SRC: STR-01 REV2 GOAL-03] |
| BR-XCT-025 | Anomaly is not guilt: integrity, fraud and abuse signals trigger human review and temporary holds, never automatic sanctions beyond rate limiting. | Due process | `TSF`, `ASM`, `BGV` | [SRC: SSOT §3.2] |
| BR-XCT-026 | Rejections use a reason code from a fixed list and send a respectful notice to the candidate on the human's action. | Candidate dignity | `ATS`, `NTF` | [SRC: SSOT §3.1] |
| BR-XCT-027 | The core loop is free and equal for every candidate regardless of plan: creating and verifying evidence, applying, messaging in consented threads, privacy controls and export. | Fair access | `BIL`, all modules | [SRC: STR-01 §5] |
| BR-XCT-028 | Assessment accommodations are available on request and are never disclosed to employers or shown on results. | Accessibility and fairness | `ASM` | [DER] |
| BR-XCT-029 | Aggregates about people (analytics, cohort reports, salary benchmarks, skills inventories) are published only for cells of at least `min_cohort_k` contributors, with complementary suppression against differencing. | Re-identification risk | `ANL`, `MKT`, `INS`, `ENT` | [SRC: SSOT Amendment G; `OD-PRD-12`] |

### 3.5 Retention

| ID | Rule | Rationale | Enforced where | Source |
|---|---|---|---|---|
| BR-XCT-030 | Every entity is assigned one retention class (ephemeral, operational, tenant-configurable, financial, legal-hold-eligible, audit); values are policy configuration. | Predictable lifecycle | Each module's entity table | [SRC: SSOT Amendment G] |
| BR-XCT-031 | Erasure runs on three separate clocks: cancel window, completion deadline and deactivation purge; their values are `OD-PRD-13`. | Clarity | `SET` | [SRC: Appendix E V61-07] |
| BR-XCT-032 | Append-only histories reference a person only through an opaque subject reference; erasure deletes the identity mapping instead of rewriting history. | Erasure with integrity | `SET`, `ADM` | [SRC: Appendix E V61-19] |
| BR-XCT-033 | A legal hold supersedes erasure for the held records only; the person is told which categories are held and why, unless law forbids. | Legal obligations | `SET` | [SRC: COMMERCIAL_OPERATIONS §3 records] |
| BR-XCT-034 | An application snapshot expires at the application's terminal state plus a retention period (default 12 months [SRC: CONSENT_SCOPE_CATALOGUE]); the candidate may withdraw earlier, which tombstones live items. | Bounded employer retention | `JOB`, `SET` | [SRC: CONSENT_SCOPE_CATALOGUE] |
| BR-XCT-035 | Backups age out within the backup retention window; a restore re-applies erasures recorded after the backup point before the data is served. | Erasure survives restore | Platform operations | [DER] |

### 3.6 AI usage

| ID | Rule | Rationale | Enforced where | Source |
|---|---|---|---|---|
| BR-XCT-036 | AI output never becomes evidence or changes a rung; AI-assisted text is labelled in version history; anything a person accepts from AI is their own claim. | Integrity of evidence | `AIC`, `EVD` | [SRC: SSOT Amendment C] |
| BR-XCT-037 | Sending a person's content to an AI provider requires `ai.assist.process`, with redaction of contact details and identifiers. | Privacy | AI gateway (`AIC`) | [SRC: CONSENT_SCOPE_CATALOGUE] |
| BR-XCT-038 | `AI_PROHIBITED` assessment mode is enforced server-side across every TalentSphere AI entry point for the candidate during the attempt window; UI hiding is not enforcement. | Assessment integrity | AI gateway, `ASM` | [SRC: SSOT Amendment D] |
| BR-XCT-039 | Free users cause no paid AI inference unless an explicit, active cost policy allows it. | Cost control | AI gateway, `BIL` | [SRC: SSOT §16.4] |
| BR-XCT-040 | AI memory is separate from profile truth; the person can view and delete it. | Control | `AIC` | [SRC: SSOT §3.2] |
| BR-XCT-041 | No AI-generated message, outreach, job description or feedback is sent without a human reviewing and pressing send. | Accountability | `AIC`, `MSG`, `ATS` | [SRC: SSOT §3.2] |
| BR-XCT-042 | AI in hiring is descriptive and advisory only; candidate-level predictive scores and automated screening-out are excluded unless admitted by `OD-PRD-14`. | Regulatory and fairness risk | `AIC`, `ATS` | [SRC: SSOT Amendment E] |

### 3.7 Payments

| ID | Rule | Rationale | Enforced where | Source |
|---|---|---|---|---|
| BR-XCT-043 | Entitlements derive only from verified billing state (processor webhooks reconciled to the ledger); a redirect, a support action or a client claim grants nothing. | Correctness | `BIL` | [SRC: INV-T17] |
| BR-XCT-044 | Refunds, credits and dispute outcomes follow a published policy, are executed only by `FIN` through `BIL`, and are audited; `SUP` can request but not issue. | Financial control | `BIL`, `ADM` | [SRC: COMMERCIAL_OPERATIONS §5] |
| BR-XCT-045 | Billing state never deletes user or tenant data; downgrade or non-payment limits new activity only. | Trust | `BIL`, all modules | [SRC: COMMERCIAL_OPERATIONS §3] |
| BR-XCT-046 | Plans and prices are immutable catalogue versions; a change creates a new version with an explicit grandfathering rule. | Auditability | `BIL` | [SRC: COMMERCIAL_OPERATIONS §2] |
| BR-XCT-047 | Candidates never pay to apply, to be seen by employers, or to be verified. | Fair access | `BIL`, `JOB`, `EVD` | [SRC: COMMERCIAL_OPERATIONS §1] |
| BR-XCT-048 | Payouts to instructors, mentors, freelancers or organizers require provider-verified payee identity and tax details; funds for open disputes are held. | Fraud and tax | `BIL` | [SRC: Appendix E V61-21] |
| BR-XCT-049 | No third-party money flows into or through the platform until `OD-PRD-04` decides the seller of record, payouts, tax and refunds. | Liability | `BIL`, `STU`, `MEN`, `GIG`, `EVT` | [SRC: Appendix E V61-21] |

### 3.8 Moderation

| ID | Rule | Rationale | Enforced where | Source |
|---|---|---|---|---|
| BR-XCT-050 | Enforcement sources take precedence in this order: legal obligation or court order; safety emergency; platform policy; tenant policy (org or institution community rules); the person's own settings. | Predictable outcomes | `TSF` | [DER] |
| BR-XCT-051 | Every moderation action carries a reason code, a notice to the affected person and an appeal path, except where law forbids notice or the content is spam. | Due process | `TSF`, `NTF` | [SRC: UJ-19] |
| BR-XCT-052 | An appeal is decided by a moderator other than the one who took the action. | Independence | `TSF` | [SRC: SSOT §5.9] |
| BR-XCT-053 | Reported content stays visible until decided unless its severity class meets the interim-hide threshold. | Avoid weaponized reporting | `TSF` | [DER] |
| BR-XCT-054 | Taken-down content is preserved under hold for the appeal period plus any legal requirement, then deleted. | Appeals and law | `TSF` | [DER] |

### 3.9 Tenancy, separation of duties, delegation, break-glass

| ID | Rule | Rationale | Enforced where | Source |
|---|---|---|---|---|
| BR-XCT-055 | The tenant of every request is derived from the server-side grant; cross-tenant reads occur only across consent bridges; API keys are bound to one tenant with explicit scopes and need subject consent for personal data. | Cross-tenant exposure is critical | Policy service, `PLT` | [SRC: SSOT §3.2, §5.1] |
| BR-XCT-056 | One screen or response holds one context's data; the personal inbox and calendar may aggregate with per-item context badges. | No blending | All UI, API | [DER] |
| BR-XCT-057 | Agency recruiters see client data only inside an accepted engagement and only for candidates they submitted with consent; the first valid consented submission owns the candidacy for a configurable window (default 180 days [PROP]). | Agency isolation | `EMP`, `ATS`, `JOB` | [SRC: SSOT J-10; DER] |
| BR-XCT-058 | No self-approval: the requester of a requisition, offer, refund, payout, privileged grant, course review or break-glass cannot approve it. | Separation of duties | Policy service | [DER] |
| BR-XCT-059 | Conflict-of-interest exclusions: instructors cannot attest their own evidence or review their own course; referees cannot be the candidate; moderators cannot act on content they are party to or connected with; org admins cannot review their own org; judges cannot score teams with a connection; applicants are removed from their own application's hiring team. | Integrity | Policy service | [SRC: SSOT §5.9; USR-01 REV2] |
| BR-XCT-060 | Platform staff roles live on staff accounts separate from personal accounts; staff tooling refuses actions on the staff member's own personal account. | Insider risk | `IDN`, `ADM` | [PROP] |
| BR-XCT-061 | Finance dual control: refunds above the threshold and every payout batch need a second `FIN`. | Fraud | `BIL` | [DER] |
| BR-XCT-062 | Privileged grants (`MOD`, `SUP`, `FIN`, `PAD`, `SAD`) need two approvers other than the grantee and requester; reviewed monthly; dormant grants expire after 60 days. | Least privilege | `ADM`, `IDN` | [SRC: USR-01 §6] |
| BR-XCT-063 | Delegation is limited to capabilities the delegator holds, in the same scope, time-bounded, revocable, audited, and not re-delegable. | Controlled flexibility | Policy service | [PROP] |
| BR-XCT-064 | Ownership transfer, consent, data-rights requests, break-glass, privileged grants, credential issuance, refunds, payouts and appeal decisions are not delegable. | High-risk actions | Policy service | [PROP] |
| BR-XCT-065 | Break-glass is available only to `SAD` with an incident or legal-case id, second-`SAD` approval, named scope, auto-expiry, full audit, post-incident review and notice where law requires. | Accountable emergency access | `ADM` | [PROP] |

### 3.10 Communication, evidence, minors, accessibility, operations

| ID | Rule | Rationale | Enforced where | Source |
|---|---|---|---|---|
| BR-XCT-066 | Notifications are classed as security, transactional, or marketing; security notices cannot be turned off; marketing requires `comms.marketing_email`. | Lawful communication | `NTF` | [SRC: CONSENT_SCOPE_CATALOGUE] |
| BR-XCT-067 | Non-security notifications respect quiet hours, digests and a per-class frequency cap (parameter `ntf.max_nudges_per_day`, default 1 for reminders [PROP]). | Respect attention | `NTF` | [DER] |
| BR-XCT-068 | Evidence rung transitions happen only server-side through the ladder: claimed → artifact-backed → peer-attested → authority-verified; only defined verification events or case decisions move a rung. | Verified over claimed | `EVD` | [SRC: Appendix E V61-17] |
| BR-XCT-069 | Corrections create a new version; revocations are visible with a reason category; applications whose snapshot contains a revoked or superseded item show a flag to the hiring team. | Lineage | `EVD`, `JOB` | [SRC: SSOT Amendment F] |
| BR-XCT-070 | A credential export is labelled with a portable standard only after the export is validated against that standard. | Honesty | `EVD` | [SRC: SSOT Amendment F] |
| BR-XCT-071 | People below the minimum age cannot register; managed learners who are minors have discoverability, outreach and marketplace features locked off. | Protection of minors | `IDN`, `SET` | [SRC: Appendix E V61-24; `OD-PRD-11`] |
| BR-XCT-072 | Every journey is completable with keyboard and screen reader; no gate relies on an inaccessible challenge (for example a visual-only CAPTCHA). | Accessible by default | All UI | [SRC: SSOT §21] |
| BR-XCT-073 | Reputation is contextual: popularity measures (followers, likes, views) are never displayed or used as credibility. | Evidence over popularity | `REP`, `SRC`, `AIC` | [SRC: SSOT §3.2] |
| BR-XCT-074 | No core function depends at runtime on a competitor platform; external platforms are import or syndication adapters only. | Independence | `PLT` | [SRC: SSOT §4.3] |
| BR-XCT-075 | Recruiter first contact is a request that needs `outreach.recruiter_contact` and quota; the candidate accepts, declines or blocks before any free messaging. | Consent and dignity | `MSG` | [SRC: CONSENT_SCOPE_CATALOGUE] |
| BR-XCT-076 | Every consequential side effect is idempotent and audited, including the acting principal and, under delegation, the delegator. | Integrity | All modules, `ADM` | [SRC: SSOT §3.2] |
| BR-XCT-077 | An application with no human action for `ats.stale_days` (default 14 [PROP]) shows the candidate an honest "No update yet" and nudges the hiring team; employers can set automatic closure notices but never automatic rejection without a human. | No ghosting by design | `ATS`, `JOB`, `NTF` | [SRC: SSOT §3.1 candidate dignity; DER] |
| BR-XCT-078 | Offline caches are never authoritative: server-authoritative actions (submit application, take assessment, pay, change consent) require a connection; only drafts and messages queue. | Correctness | `PWA` | [SRC: SSOT §3.2, §19] |
| BR-XCT-079 | Interview and session recording is off by default and requires the consent of every participant before it starts. | Privacy | `INT`, `MEN` | [SRC: SSOT OD-48] |

Rule count: 80 (`BR-XCT-001` to `BR-XCT-080`).

## 4. Rule-to-module enforcement map

| Rule group | Enforced by (single implementation) | Called by |
|---|---|---|
| Consent `BR-XCT-007` to `BR-XCT-013` | `SET` consent service | Every module reading another person's data |
| Policy and tenancy `BR-XCT-055` to `BR-XCT-065`, `BR-XCT-017`, `BR-XCT-080` | Policy decision service (shared service, owned by `IDN`) | Every API route |
| Evidence display and ladder `BR-XCT-016`, `BR-XCT-068`, `BR-XCT-069` | `EVD` | `PRF`, `JOB`, `ATS`, `SRC`, `AIC`, `INS`, `MEN`, `GIG` |
| Fairness in ranking `BR-XCT-020`, `BR-XCT-022`, `BR-XCT-023` | `AIC` matching and `SRC` ranking | `JOB`, `ATS`, `NET`, `LRN` |
| AI `BR-XCT-036` to `BR-XCT-042` | AI gateway (`AIC`) | Every module with AI features |
| Payments `BR-XCT-043` to `BR-XCT-049` | `BIL` | All commercial features |
| Moderation `BR-XCT-050` to `BR-XCT-054` | `TSF` | All UGC modules |
| Aggregates `BR-XCT-029` | `ANL` aggregation service | `INS`, `MKT`, `ENT`, `EMP` |
| Notifications `BR-XCT-066`, `BR-XCT-067` | `NTF` | All |
| Audit `BR-XCT-076` | `ADM` audit service | All |

## 5. Conflict-resolution precedence

When two rules, settings or requests conflict, the higher level wins. The losing party is told what happened where that is safe; the conflict is logged. [DER, consistent with SSOT §3.1 ordering and `BR-XCT-050`]

| Level | Source of the rule or request | Examples |
|---|---|---|
| 1 | Law, court order, legal hold | Retention of invoices; lawful takedown; legal hold over erasure |
| 2 | Safety and security | Break-glass during an incident; emergency takedown; account suspension for takeover |
| 3 | The person's control over their own data: consent, block, erasure, visibility | Revocation, block, deletion |
| 4 | Platform invariants: fairness, human control, evidence integrity, accessibility | No pay-to-rank; no autonomous rejection; no AI evidence |
| 5 | Tenant policy (org, institution, enterprise) | Approval chains, community rules, retention within bounds |
| 6 | Commercial entitlements | Quotas, plan limits |
| 7 | Personal preferences and product defaults | Digest timing, sort orders |
| 8 | Engagement or growth optimization | Nudges, recommendations of features |

Tie-break within a level: the more restrictive outcome for disclosure of personal data wins; for access to one's own data, the more permissive outcome wins. [DER]

### 5.1 Worked conflicts

| Conflict | Winner | Resolution |
|---|---|---|
| Learner revokes `alumni.share_outcomes`; institution contract requires outcome reporting | Level 3 over 5 | Learner excluded from the next report; report states coverage; institution contract cannot override (`BR-XCT-001`) |
| Erasure request; invoice records must be kept | Level 1 over 3 | Invoices kept under financial retention with identity minimized; person told |
| Employer on top plan asks for its jobs to rank first | Level 4 over 6 | Refused; promoted slots only if `OD-PRD-18` admits them, labelled and separate |
| Candidate blocks an org; the org's recruiter holds a valid application snapshot | Level 3 | Existing application remains readable by the hiring team for the process the candidate started (snapshot is the candidate's own act); new outreach, search and referrals blocked; the candidate may withdraw to end it |
| Moderator takes down a project that is evidence in live applications | Level 2 or platform policy over 7 | Artifact hidden in snapshots with "Removed for policy"; hiring teams flagged (`BR-XCT-069`) |
| Institution policy forbids students applying outside drives; student wants to apply | Level 5 vs `OD-PRD-37` | Until decided: application allowed only if the institution permits (cell `P`); the student is told the institution rule |
| Instructor wants to attest a learner who is their colleague's child | Level 4 (`BR-XCT-059`) | Allowed only without other conflict flags; known relationships declared by the instructor block attestation |
| Security incident needs reading private messages | Level 2 over 3 | Break-glass with scope and audit; notice afterwards unless law forbids |
| Recruiter quota exhausted mid-campaign; candidate already accepted contact | Level 3 over 6 | Accepted threads continue; quota applies only to new first-contact requests |
| AI-prohibited attempt in progress; candidate's paid plan includes AI assistance | Level 4 over 6 | AI blocked for the attempt window |
| Org retention says delete applications after 6 months; candidate's snapshot expiry is 12 months | Level 5 bounded by 3 | The shorter, more privacy-protective period applies to the org's copy |

## 6. Open decisions referenced

`OD-PRD-04` to `OD-PRD-08`, `OD-PRD-12`, `OD-PRD-13`, `OD-PRD-14`, `OD-PRD-18`, `OD-PRD-19`, `OD-PRD-21`, `OD-PRD-29`, `OD-PRD-37` (see [08](08_STAKEHOLDER_DECISIONS_NEEDED.md)).

## 7. Legacy source trace

| Source | Used for | Dropped or changed |
|---|---|---|
| `SSOT.md` §3, Amendments C to G, §5.9, OD-28, OD-29, OD-36, OD-48, BR-130 | Invariants, numeric recommendations | Numeric values listed as recommendations only, not adopted |
| `Yash_Final_Project_Document/19_BUSINESS_AND_COMMERCIAL_OPERATIONS/COMMERCIAL_OPERATIONS.md` | Guardrails, packaging dimensions, billing states, refunds | All prices open |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/CONSENT_SCOPE_CATALOGUE.md` | Scope ids, defaults, revocation behavior | — |
| `docs/PRICING.md` | Evidence that coded prices are unapproved recommendations; entitlement-holder question | Coded prices not adopted |
| Legacy `BR-001` to `BR-248` | Separate namespace; not renumbered | `BR-XCT` is new |
