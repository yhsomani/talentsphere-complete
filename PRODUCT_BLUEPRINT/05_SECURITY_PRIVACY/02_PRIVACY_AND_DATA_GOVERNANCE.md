# Privacy and Data Governance

Status: intended complete product. Nothing here claims a control is built or that TalentSphere complies with any law. Legal characterizations (lawful basis, controller or processor role, deadlines) are candidates for counsel to confirm; see [03_COMPLIANCE_MAP.md](03_COMPLIANCE_MAP.md). This is not legal advice.

Owner role: privacy lead (a function, not a headcount claim), with `SAD` and counsel. Settings surfaces are owned by module SET; this file sets the rules SET and every other module implement.

| Namespace | Meaning | Range in this file |
|---|---|---|
| `NFR-PRV-nnn` | Testable privacy requirement | NFR-PRV-001..NFR-PRV-048 (§16) |
| `OD-PRV-nn` | Privacy decision | OD-PRV-01..OD-PRV-16 (§17) |
| `RSK-PRV-nn` | Privacy risk | RSK-PRV-01..RSK-PRV-10 (§18) |
| `PUR-nn`, `RET-<name>`, `C0`..`C4`, scope ids `x.y` | Document-local labels: purposes, retention parameters, classes, consent scopes | — |

## 1. Principles and roles

| # | Principle | Rule |
|---|---|---|
| PP1 | Purpose first | Every collected field maps to at least one `PUR-` purpose; a field with no purpose is not collected [SRC: Yash 14/PRIVACY §2] |
| PP2 | Privacy by default | All optional consent scopes are off for new accounts; profiles start private; no pre-ticked boxes [SRC: Yash 14/PRIVACY §3] |
| PP3 | Contextual visibility | Each item has a visibility level: `private`, `connections`, `recruiters` (consented search), `named_org`, `institution`, `public` [SRC: SSOT §15.2] |
| PP4 | Check at use time | Consent and visibility are evaluated when data is read or sent, never from a cache [SRC: Yash CONST-S13] |
| PP5 | Separation of stores | AI conversation memory, user profile, talent graph and verified evidence are separate stores with separate rules [SRC: SSOT §16.6] |
| PP6 | Provable lifecycle | Collection, sharing, retention and deletion each leave an auditable record |
| PP7 | Equal effort | Withdrawing consent or leaving takes no more steps than granting or joining |

Controller and processor roles (candidates; counsel confirms per OD-SEC-18):

| Processing | TalentSphere role (candidate) | Counterparty role |
|---|---|---|
| Candidate accounts, profiles, evidence, learning, community, marketplace discovery | Controller | n/a |
| An employer's own hiring pipeline in ATS (applications to its jobs, scorecards, notes, interviews) | Processor for the employer, or joint controller for marketplace-originated applications | Employer is controller |
| Institution-provisioned student accounts and cohort reporting | Processor for the institution for managed learning; controller for the student's own career profile | Institution is controller (education records) |
| Enterprise internal mobility and L&D (ENT) | Processor | Enterprise is controller (employee data) |
| Payments | Controller for billing records; payment provider acts per its terms | Payment provider |

## 2. Data classification

| Class | Name | Definition | Examples | Handling minimum |
|---|---|---|---|---|
| C0 | Public | Intended for anyone | Published job posts, public course pages, profiles the user set public | Integrity controls only |
| C1 | Internal | Non-personal operational data | Feature flags, aggregate metrics above `min_cohort_k`, build metadata | Access by staff role |
| C2 | Personal | Identifies or relates to a person; ordinary sensitivity | Name, headline, skills, evidence metadata, application status, messages metadata | Purpose-bound, access-controlled, exportable, erasable |
| C3 | Confidential personal | Harm likely if disclosed | Contact details, resume text, messages bodies, scorecards, interview notes, recordings, assessment attempts, salary reports, date of birth, location history | C2 plus field encryption where listed, access logging for third-party reads |
| C4 | Restricted | Special-category, financial, credential or legally regulated | Fairness self-identification (race, ethnicity, sex, disability, veteran status), accommodation requests, government ids, background-check reports, tax ids, payout details, credentials, minors' data flagged as such | C3 plus separate key, separate store or schema, no AI egress, named-role access only |

Derived data inherits the highest class of its inputs unless it is aggregated above `min_cohort_k` and reviewed as non-personal [DER].

## 3. PII inventory by module

`Subjects`: CAN candidate, STD student, REF referee or other non-account person, EMPL employee of a tenant, STF staff, ORG contact person of an organization.

| Module | Data categories | Highest class | Subjects | Purposes | Notes |
|---|---|---|---|---|---|
| IDN | Email, phone, password hash, passkeys, MFA secrets, sessions (device, IP prefix, coarse location), date of birth or age band | C4 (credentials) | all | PUR-01 | IP stored as prefix in audit; full IP in security logs only for `RET-SECLOG` |
| SET | Consent records, privacy settings, rights requests, notification preferences | C2 | all | PUR-19, PUR-12 | Consent rows keyed by `subject_ref` |
| NTF | Delivery addresses, push endpoints, delivery logs | C2 | all | PUR-12, PUR-13 | Email bodies not stored after send beyond `RET-NOTIFY` |
| REP | Badges, points, endorsements, reputation signals | C2 | CAN | PUR-02, PUR-15 | Reputation is contextual; no universal score [SRC: SSOT §18.1] |
| PRF | Name, headline, photo, location (city level), work history, education, skills, resume files and text, portfolio, links, preferences (salary expectation, work authorization, relocation) | C3 | CAN, STD | PUR-02, PUR-21, PUR-22 | Work authorization and salary expectation are C3 and never public |
| EVD | Evidence items, artifacts, referee contact details, attestations, credentials | C3 | CAN, REF | PUR-03, PUR-04 | Referee data minimized to name, email, relationship, organization |
| BGV | Identity-verification results, background-check authorizations and reports, adverse-action notices | C4 | CAN | PUR-25 | Provider-held documents preferred; regulated (FCRA-type) |
| SRC | Search queries, saved searches, search documents of discoverable candidates | C2 | CAN, REC | PUR-21, PUR-06 | Candidate search documents exist only with `search.discoverable` |
| LRN | Enrollments, progress, notes, quiz attempts, certificates | C2 | CAN, STD | PUR-08 | Institution-managed learning may be an education record |
| STU | Instructor identity, payout details, tax forms, course content | C4 (payout) | INS | PUR-11, PUR-26 | Payout and tax data provider-held where possible |
| ASM | Attempts, answers, code submissions, timing, integrity signals, proctoring media if enabled | C3 (C4 if biometric) | CAN, STD | PUR-08, PUR-09 | Proctoring with face or voice analysis is a DPIA trigger and EU AI Act review item |
| JOB | Applications, answers to screening questions, cover letters, application snapshots, accommodation requests | C3 (C4 accommodation) | CAN | PUR-05, PUR-27 | Accommodation request visible only to its handler |
| ATS | Pipeline stages, scorecards, interviewer notes, rejection reasons, offers | C3 | CAN, EMPL | PUR-27 | Employer is controller (candidate role in §1) |
| INT | Availability, calendar tokens, interview schedules, recordings, transcripts | C3 | CAN, EMPL | PUR-27 | Recording only with all-party consent [SRC: SSOT HDN-027] |
| EMP | Org profile, members, employer reviews (anonymous), interview experiences | C2 (reviewer identity C3) | ORG, CAN | PUR-28 | Anonymous reviewer identity hidden from employer [SRC: SSOT BR-136] |
| NET | Connections, follows, posts, comments, referrals, recommendations | C2 | CAN | PUR-29 | Recommendations shown only after recipient acceptance [SRC: SSOT BR-132] |
| MSG | Message bodies, attachments, read receipts | C3 | all | PUR-29, PUR-07 | Staff read only reported messages or under a specific grant |
| AIC | Prompts, conversation memory, match explanations, embeddings, AI provenance | C3 | CAN, REC | PUR-06, PUR-10 | Memory separate from profile; user can view and delete memory |
| TSF | Reports, moderation decisions, appeals, fraud signals | C3 | all | PUR-15, PUR-16 | Reporter identity hidden from reported user |
| INS | Student roster, cohort membership, placement outcomes, institution consents | C3 | STD | PUR-18, PUR-23 | Minors possible (§10) |
| BIL | Billing contact, invoices, subscription state, provider ids, tax location | C3 | CAN, ORG | PUR-11 | No card data stored |
| MEN | Mentor profiles, session bookings, session notes, coaching goals | C3 | CAN, MNT | PUR-30 | Session notes private to the participants who wrote them |
| GIG | Contracts, milestones, deliverables, payments, disputes, ratings | C3 (C4 payout) | FRL, ORG | PUR-31 | Tax forms provider-held |
| EVT | Registrations, attendance, team membership, submissions, judging scores | C2 | CAN | PUR-32 | Attendee list visibility opt-in |
| MKT | Salary reports, career-path aggregates | C3 (raw), C0 (aggregates above k) | CAN | PUR-33 | `min_cohort_k` suppression |
| ENT | Employee skills, internal applications, L&D assignments | C3 | EMPL | PUR-34 | Employer is controller; external job search never visible to employer |
| ANL | Product analytics events, rollups | C2 (pseudonymous) | all | PUR-14 | Consent-gated; operational telemetry separate (PUR-24) |
| ADM | Support tickets, staff actions, grants | C3 | all, STF | PUR-17 | Ticket attachments scanned and retained per `RET-SUPPORT` |
| PWA | Device cache of owner data, push subscriptions | C2/C3 | all | PUR-01, PUR-12 | Never authoritative; purged on sign-out |
| PLT | Files, media, webhook delivery logs, OAuth grants | C3 | all | PUR-35 | Webhook logs store status, not payload bodies |
| (cross-cutting) | Fairness self-identification | C4 | CAN | PUR-36 | Separate store, audit job only (fairness doc §4) |
