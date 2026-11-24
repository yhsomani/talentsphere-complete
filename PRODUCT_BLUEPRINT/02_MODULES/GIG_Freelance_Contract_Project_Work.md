# GIG — Freelance, Contract & Project Work

Module code: `GIG` · Group: OS expansion · Release tier: R6 (OS expansion); the learning-project slice could ship earlier with LRN.

**Scope status: PROPOSED expansion module, narrow by design.** The stakeholder goal is an "operating system" for the whole career domain. SSOT carries a Freelance Marketplace (F-130, Ph7, priority 3), a Project Marketplace infrastructure (F-124 / S-14, "escrow via Stripe"), apprenticeship matching (F-131) and volunteer matching (F-133). SSOT §4.2 also lists "general-purpose marketplace" and "generic HR/payroll system" as non-goals. This module is therefore specified as **evidence-based project work**: scoped projects whose accepted deliverables become verified work evidence on the freelancer's profile. It is not a general gig marketplace, staffing agency, payroll or EOR service. Everything is gated behind `OD-GIG-01` (is the module in scope, and which minimal slice) per `DEC-002`, with separate decision gates for escrow (`OD-GIG-02`) and time tracking (`OD-GIG-03`). Nothing here claims that anything is built.

## 1. Purpose, outcomes and boundaries

### 1.1 Purpose

GIG lets a person turn on freelancer mode on their TalentSphere profile, find or be invited to bounded projects, agree contracts with milestones, deliver work, get paid, and keep the result as verifiable evidence of what they did. Clients are employers (and, if `OD-GIG-07` allows, individuals) who need a defined piece of work done. [SRC: SSOT F-130, F-124, S-14, F-131] · [PROP]

### 1.2 Outcomes

| Outcome | How the system knows |
|---|---|
| A freelancer is eligible, discoverable and can get paid | Freelancer state `active` (SM-GIG-01) with payout onboarding complete |
| Clients publish well-scoped projects inside the allowed categories | Listing `published` (SM-GIG-02) after the scope guard |
| Work is agreed in writing with acceptance criteria | Contract `active` (SM-GIG-04) with at least one milestone |
| Delivered work is reviewed and paid under clear rules | Milestones `accepted` then `paid` (SM-GIG-05) |
| Disputes are resolved without trapping either side | Dispute reaches a terminal state (SM-GIG-07) |
| Completed projects strengthen the freelancer's verified record | Client-confirmed evidence records created (FR-GIG-023) |
| Tax, classification and cross-border rules are respected | Tax documents on file before payout; classification flags reviewed |

### 1.3 Boundaries

**In scope (owned):** freelancer mode and profile extension; freelancer eligibility; project listings and the scope guard; discovery and invitations; proposals and limits; shortlisting and award; contracts, terms, milestones, deliverables, reviews, change requests, completion and termination; escrow decision-gate mechanics; time tracking decision-gate mechanics; tax document collection and classification guard; cross-border constraints; disputes; reputation metrics; circumvention controls; IP and confidentiality terms; hire conversion; learning and apprenticeship projects; dashboards.

**Out of scope (owned elsewhere):**

| Capability | Owner | Relationship |
|---|---|---|
| Money movement: charges, fees, refunds, payouts, tax computation, 1099-style reporting by the provider | BIL (this batch) | GIG creates orders and earning events (FR-BIL-028, FR-BIL-029) |
| Profile, portfolio, resume | PRF (planned) | GIG adds freelancer fields and writes accepted projects to the portfolio with consent |
| Evidence records and verification ladder | EVD, BGV (planned) | GIG submits client-confirmed work evidence |
| Messaging and attachments | MSG (planned) | Per-project threads |
| Job postings for employees | JOB (planned) | Hire conversion links to JOB |
| Moderation and enforcement | TSF (planned) | GIG raises reports |
| Notifications | NTF (planned) | GIG emits events |
| Employer organization and verification | EMP (planned) | Client identity |
| Payroll, benefits, employer-of-record, staffing, workforce management | Out of product (SSOT §4.2) | Never offered |
| Learning content | LRN, STU (planned) | Learning projects reuse assignments |

**Non-goal brushes (SSOT §4.2):** (1) *General marketplace*: categories are an allowlist of skill-based professional project work (BR-GIG-002). (2) *HR/payroll*: no hours-based employment features, no benefits, no payroll; classification guard (BR-GIG-014). (3) *Pay-to-rank*: no proposal boosting or paid freelancer placement (BR-GIG-011). (4) *Ad network*: no sponsored listings. Recorded as `OD-GIG-01`, `OD-GIG-09`, `OD-GIG-04`.

### 1.4 Owned versus consumed

Owned entities: `ENT-GIG-01` to `ENT-GIG-21` (section 8). Consumed: user, organization, profile, evidence, order, payout, message thread, tax document references.

## 2. Roles and permission matrix

`FRL` is a `CAN` with freelancer mode on. A "client" is a user acting for an organization as `EAD` or `REC`/`HMG` with the project-posting permission (granted by `EAD`), or an individual client if `OD-GIG-07` allows.

Legend: C create, R read, U update, A approve or act, `own` own record, `—` none.

| Capability | CAN | FRL | Client (EAD, REC, HMG) | IAD / PLO | FIN | MOD | PAD | SUP |
|---|---|---|---|---|---|---|---|---|
| Turn on freelancer mode | U own | U own | — | — | — | — | — | — |
| Edit freelancer profile | — | U own | — | — | — | — | override (audit) | — |
| Browse listings | R | R | R | R | — | R | R | R |
| Create, edit, close listing | — | — | C, U own org | C, U (learning projects) | — | — | override | — |
| Approve listing (review queue) | — | — | — | — | — | A | A | R |
| Invite freelancer | — | — | C | — | — | — | — | — |
| Submit, edit, withdraw proposal | — | C, U own | R own org | — | — | — | — | — |
| Shortlist, award | — | — | A | — | — | — | — | — |
| Accept contract | — | A own | A own org | — | — | — | — | — |
| Fund milestone (if escrow) | — | — | C | — | R | — | — | — |
| Submit deliverable | — | C own | R | — | — | — | — | — |
| Accept, request revision on milestone | — | — | A | — | — | — | — | — |
| Request change, terminate contract | — | C, U | C, U | — | — | — | override | assist |
| Open dispute | — | C | C | — | — | — | — | assist |
| Decide dispute | — | — | — | — | A (money) | A (conduct) | A (appeal) | — |
| Review counterparty | — | C own | C own | — | — | R, remove | R | R |
| Tax documents, payout | — | C own | — | — | R, A | — | R | — |
| View earnings and spend | — | R own | R org | R (own institution learning projects: none) | R | — | R | — |

Notes: `REC` and `HMG` can post projects only if the organization's `EAD` enabled project posting. `IAD` and `PLO` handle only learning and apprenticeship projects (FR-GIG-031). Freelancer contract data is never visible to employers who evaluate the same person as a job candidate unless the freelancer shares it (BR-GIG-027).

## 3. Sub-module map

| Code | Sub-module | Features |
|---|---|---|
| A | Freelancer mode and profile | FR-GIG-001 to 003 |
| B | Project listings and discovery | FR-GIG-004 to 007 |
| C | Proposals and award | FR-GIG-008 to 011 |
| D | Contracts, milestones and deliverables | FR-GIG-012 to 017 |
| E | Money: escrow gate, time tracking gate, payment | FR-GIG-018 to 020 |
| F | Compliance: tax, classification, cross-border | FR-GIG-021 to 023 |
| G | Trust: reviews, disputes, reputation, circumvention, IP | FR-GIG-024 to 029 |
| H | Conversion, learning projects, dashboards | FR-GIG-030 to 032 |

## 4. Feature specifications

### A. Freelancer mode and profile

### FR-GIG-001 — Freelancer mode activation

- **Sub-module:** A. Freelancer mode and profile
- **Priority / tier:** Must · R6
- **Source:** [SRC: SSOT F-130; canonical role `FRL` in CONVENTIONS] · [PROP] activation mechanics
- **Purpose and outcome:** A candidate opts in to take project work without changing how they appear as a job seeker. Known by freelancer state moving from `inactive` to `pending_requirements` or `active`.
- **Roles and permissions:** `CAN: turn on, pause, turn off` · `PAD: suspend` · `SUP: read`
- **Preconditions and entry points:** Signed-in adult user (18 or the age of majority, BR-GIG-021) with a verified email and a profile with headline. `/freelance/start`, profile menu "Offer freelance services".
- **User interactions and actions:** 1. Read what freelancer mode is and what changes (new profile section, new inbox type, tax and payout steps). 2. Choose service categories from the allowlist. 3. Accept freelancer terms (versioned) and the code of conduct. 4. Click "Turn on freelancer mode". 5. See the requirements checklist (FR-GIG-003). 6. Pause or turn off at any time.
- **System behaviour:** Creates `ENT-GIG-01` in `pending_requirements`; becomes `active` when eligibility is satisfied. Freelancer mode is off by default and independent of job-seeker visibility settings (BR-GIG-001, BR-GIG-027). Turning it off hides the freelancer section and stops new proposals; active contracts continue until completed or terminated. Pausing hides the listing and declines new invitations with an auto-message.
- **UI elements and controls:** Explainer cards, category chips, terms checkbox (unchecked), "Turn on freelancer mode" button, requirements checklist, pause toggle.
- **Configuration options:** User: pause until a date, auto-decline message text. Platform: category allowlist.
- **Business rules:** BR-GIG-001, BR-GIG-002, BR-GIG-021, BR-GIG-027
- **Validation:** At least one and at most 5 categories; terms version current; age rule met.
- **Inputs and outputs:** In: categories, acceptance. Out: freelancer record and checklist.
- **Filters, sorting, search:** n/a — single-user settings.
- **Notifications and communication:** `gig.freelancer.requirements` reminder at 3 and 14 days (opt-out class: onboarding).
- **Error handling and edge cases:** Underage: blocked with explanation. Turning off with an active contract: confirm dialog listing contracts; contracts remain. Account suspended: mode forced `suspended`.
- **Dependencies:** PRF, IDN (planned), FR-GIG-003; `ENT-GIG-01`.
- **Security and privacy:** Mode flag is private until the listing is published.
- **Acceptance criteria:**
  - Given an eligible adult, when they turn on the mode, then state is `pending_requirements` and the checklist appears.
  - Given freelancer mode on, when an employer views the person as a job candidate, then no freelancer data appears unless shared.
  - Given an underage account, when starting, then activation is refused.

### FR-GIG-002 — Freelancer profile, services and portfolio evidence

- **Sub-module:** A. Freelancer mode and profile
- **Priority / tier:** Must · R6
- **Source:** [PROP]; [SRC: SSOT F-84 skills graph, PRF portfolio, EVD evidence]
- **Purpose and outcome:** A freelancer presents services backed by evidence. Known by a published freelancer page with linked evidence.
- **Roles and permissions:** `FRL: edit own` · `GUE, CAN, client: view published fields` · `MOD: remove content`
- **Preconditions and entry points:** Freelancer mode on. `/freelance/profile`.
- **User interactions and actions:** 1. Write a service headline and description (up to 1500 chars). 2. Add services as packages or capabilities (title, what is included, typical timeline, starting price as a stated range or "quote on request"). 3. Link skills from the taxonomy. 4. Attach portfolio items and verified evidence from the profile (EVD planned) and past completed projects. 5. Set availability (open, limited, unavailable until date) and preferred project size. 6. Set rate display preference (hide, show range). 7. Publish.
- **System behaviour:** Verified evidence is shown with its verification level; self-claimed items are labeled. Past completed GIG projects appear automatically as client-confirmed items if the client confirmed (FR-GIG-024). NDA-limited items appear only as "Confidential project, verified" without client name unless the client consented (BR-GIG-017). The page has no search ranking boost for any plan (BR-GIG-011). Content is scanned for contact details and off-platform handles (BR-GIG-012).
- **UI elements and controls:** Editor sections, evidence picker, availability radio, price range inputs, "Preview" and "Publish".
- **Configuration options:** Per user: show rate range, show earnings summary (default off).
- **Business rules:** BR-GIG-011, BR-GIG-012, BR-GIG-017, BR-GIG-019
- **Validation:** Headline 10-120 chars; services up to 10; price ranges numeric and min at most max; no contact data in text.
- **Inputs and outputs:** In: profile fields. Out: published freelancer page.
- **Filters, sorting, search:** n/a — editor.
- **Notifications and communication:** None.
- **Error handling and edge cases:** Evidence revoked later: item shows "Verification withdrawn" and the page updates. Contact info in text: field error. Mode paused: page hidden.
- **Dependencies:** PRF, EVD (planned), FR-GIG-024; `ENT-GIG-01`.
- **Security and privacy:** Public fields only on publish; earnings never shown unless chosen.
- **Acceptance criteria:**
  - Given a verified evidence item, when linked, then the page shows its level.
  - Given a phone number in the description, when saving, then it is rejected.
  - Given an NDA project, when displayed, then the client name is hidden.

### FR-GIG-003 — Freelancer eligibility: identity, payout and tax readiness

- **Sub-module:** A. Freelancer mode and profile
- **Priority / tier:** Must · R6
- **Source:** [PROP]; [SRC: BR-BIL-024, BR-BIL-028 payout onboarding]
- **Purpose and outcome:** A freelancer can only take paid work once identity, payout account and tax information are complete. Known by state `active`.
- **Roles and permissions:** `FRL: complete` · `FIN: review exceptions` · `PAD: override with audit`
- **Preconditions and entry points:** Mode pending. Checklist at `/freelance/requirements`.
- **User interactions and actions:** 1. Verify identity (IDN or BGV). 2. Complete payout onboarding (BIL provider-hosted). 3. Submit tax residency and tax form where required (FR-GIG-021). 4. Confirm country of work. 5. Accept the independent-contractor acknowledgement.
- **System behaviour:** Each item has a status; when all pass the state becomes `active`. A freelancer in a country not supported for payouts or on a sanctions restriction cannot become active (BR-GIG-015); the page explains. Expiring documents (tax forms, identity) move the account to `pending_requirements` with 30 days' notice and no new contracts until renewed; running contracts continue with payouts held when tax data is invalid.
- **UI elements and controls:** Checklist with status icons, action buttons per item, help text.
- **Configuration options:** Platform: supported countries, required documents per country.
- **Business rules:** BR-GIG-013, BR-GIG-015, BR-GIG-021
- **Validation:** Per document type.
- **Inputs and outputs:** In: documents. Out: eligibility status.
- **Filters, sorting, search:** n/a — checklist.
- **Notifications and communication:** `gig.eligibility.expiring`, `gig.eligibility.active`.
- **Error handling and edge cases:** Identity fails: retry path and support link. Country changes: re-evaluate. Tax form rejected by provider: message with fix instructions.
- **Dependencies:** BIL FR-BIL-029, BGV, IDN, FR-GIG-021; `ENT-GIG-02`.
- **Security and privacy:** Documents held by the provider or encrypted; minimal references stored.
- **Acceptance criteria:**
  - Given all items complete, when evaluated, then state becomes `active`.
  - Given an unsupported country, when evaluated, then activation is refused with the reason.
  - Given an expired tax form, when the date passes, then new contracts are blocked.

### B. Project listings and discovery

### FR-GIG-004 — Project brief creation

- **Sub-module:** B. Project listings and discovery
- **Priority / tier:** Must · R6
- **Source:** [SRC: SSOT F-130, F-124] · [PROP] brief structure
- **Purpose and outcome:** A client describes a bounded piece of work clearly enough that freelancers can scope and price it. Known by a brief with outcomes, deliverables and acceptance criteria.
- **Roles and permissions:** `Client (EAD, REC, HMG with permission): create, edit` · `IAD, PLO: learning projects` · `MOD: review`
- **Preconditions and entry points:** Verified employer organization (EMP planned) with a verified payment method (BR-GIG-023). `/projects/new`.
- **User interactions and actions:** 1. Choose category and skills. 2. Write title, background, desired outcomes, deliverables, acceptance criteria, and out-of-scope notes. 3. Set budget type fixed-price with a budget range (hourly only if `OD-GIG-03` allows). 4. Set timeline, preferred start, expected milestones, required skills and experience evidence, location or time-zone preference, language. 5. Mark confidentiality needs (NDA) (FR-GIG-029). 6. Choose visibility (public, invite-only). 7. Save draft or submit for review.
- **System behaviour:** Structure is guided: the editor requires measurable acceptance criteria per deliverable. Scope guard checks (BR-GIG-002, BR-GIG-003, BR-GIG-024): prohibited categories, academic dishonesty, unpaid spec work, requests that look like employment (exclusive, fixed hours, supervision, provided equipment), discriminatory requirements. Findings are blockers or warnings with text. Budget minimum parameter exists (`min_project_budget`, OD-GIG-10).
- **UI elements and controls:** Stepwise form, acceptance-criteria repeater, category and skill pickers, budget inputs with currency, NDA toggle, "Save draft", "Submit".
- **Configuration options:** Platform: allowlist, minimum budget, maximum project duration (default 6 months, `[PROP]`).
- **Business rules:** BR-GIG-002, BR-GIG-003, BR-GIG-005, BR-GIG-014, BR-GIG-023, BR-GIG-024
- **Validation:** Title 10-120 chars; description 100-5000 chars; at least one deliverable with acceptance criteria; budget at least minimum; timeline within maximum.
- **Inputs and outputs:** In: brief. Out: listing draft and scope-guard result.
- **Filters, sorting, search:** n/a — editor.
- **Notifications and communication:** `gig.listing.submitted` (to client; internal to `MOD`).
- **Error handling and edge cases:** Blocker found: submit disabled with explanation. Warnings (for example "requires fixed working hours") need the client to edit or acknowledge, and are logged. Client without verified payment: step blocks at submit.
- **Dependencies:** EMP, BIL, FR-GIG-005; `ENT-GIG-03`.
- **Security and privacy:** Brief visibility per setting; confidential fields hidden until contract when flagged.
- **Acceptance criteria:**
  - Given a brief asking to complete a student's graded assignment, when submitted, then it is blocked under BR-GIG-003.
  - Given a deliverable without acceptance criteria, when submitting, then it fails validation.
  - Given a client without a verified payment method, when submitting, then it is refused.

### FR-GIG-005 — Listing review, publication and scope moderation

- **Sub-module:** B. Project listings and discovery
- **Priority / tier:** Must · R6
- **Source:** [PROP]; [SRC: SSOT TSF planned moderation]
- **Purpose and outcome:** Listings are checked automatically and, where needed, by a human before they go live. Known by SM-GIG-02 state `published`.
- **Roles and permissions:** `MOD: review, approve, reject, request changes` · `Client: respond` · `PAD: appeals`
- **Preconditions and entry points:** Submitted listing. `/admin/projects/review`.
- **User interactions and actions:** Reviewer: 1. See the brief with scope-guard findings. 2. Approve, reject with reason code, or request changes with a message. Client: 3. Receive the decision, edit and resubmit.
- **System behaviour:** New clients' first 3 listings always go to human review; established clients with clean history publish after automated checks only, with random sampling of 10 percent (`[PROP]`). Published listings run for a period (default 30 days, extendable) then expire. Reports from freelancers reopen review. Content edits after publish that change scope materially re-trigger review.
- **UI elements and controls:** Review queue, brief view with finding highlights, decision buttons, message field.
- **Configuration options:** Platform: auto-publish rules, sampling rate, listing duration.
- **Business rules:** BR-GIG-002, BR-GIG-003, BR-GIG-024
- **Validation:** Reject and request-changes need messages.
- **Inputs and outputs:** In: listing. Out: decision.
- **Filters, sorting, search:** Queue by age, client trust level, finding type.
- **Notifications and communication:** `gig.listing.approved`, `gig.listing.rejected`, `gig.listing.changes_requested` (transactional).
- **Error handling and edge cases:** Reviewer backlog: listing stays pending with visible status. Decision reversed on appeal: re-publish. Material edit with active proposals: proposers notified.
- **Dependencies:** TSF, ADM (planned); `ENT-GIG-03`.
- **Security and privacy:** Reviewer access audited.
- **Acceptance criteria:**
  - Given a first listing from a new client, when submitted, then it requires human approval.
  - Given a published listing materially edited, when saved, then it returns to review and proposers are notified.
  - Given an expired listing, when the date passes, then it closes and proposals are declined with notice.

### FR-GIG-006 — Project discovery and search

- **Sub-module:** B. Project listings and discovery
- **Priority / tier:** Must · R6
- **Source:** [PROP]; relates to SRC (planned) search
- **Purpose and outcome:** Freelancers find relevant projects and can see why. Known by relevant results with transparent ordering.
- **Roles and permissions:** `FRL: full` · `CAN: limited` · `GUE: titles only`
- **Preconditions and entry points:** `/projects`.
- **User interactions and actions:** 1. Search by keyword. 2. Filter by category, skills, budget range, timeline, client verification, time zone, language, posted date. 3. Sort by best match, newest, budget. 4. Save a search with alerts. 5. Save a project; hide a project; report a project.
- **System behaviour:** Best match uses skill overlap and evidence, availability and category; never uses plan or payment (BR-GIG-011). Budgets display as stated; client identity shown with verification and spend history summary (hire rate, average review). Saved-search alerts are daily or instant per preference.
- **UI elements and controls:** Search box, filters (collapsible on mobile), result cards, save and hide icons, alert toggle.
- **Configuration options:** Per user: alert frequency.
- **Business rules:** BR-GIG-011
- **Validation:** Budget range min at most max.
- **Inputs and outputs:** In: queries. Out: ranked projects with match reasons.
- **Filters, sorting, search:** As above.
- **Notifications and communication:** `gig.alert.new_projects` (opt-out class: opportunities).
- **Error handling and edge cases:** No results: suggest widening. Listing closes while viewing: banner "Closed".
- **Dependencies:** SRC, FR-GIG-005; `ENT-GIG-03`.
- **Security and privacy:** Confidential fields hidden pre-contract.
- **Acceptance criteria:**
  - Given a freelancer on a paid plan and one on free, when ranked, then plan has no effect.
  - Given a hidden project, when searching, then it does not appear for that user.
  - Given a saved search, when a matching listing publishes, then one alert is sent.

### FR-GIG-007 — Client invitations to freelancers

- **Sub-module:** B. Project listings and discovery
- **Priority / tier:** Should · R6
- **Source:** [PROP]; [SRC: SSOT F-59 outreach credits limits pattern]
- **Purpose and outcome:** A client invites specific freelancers to a listing. Known by invitations responded to.
- **Roles and permissions:** `Client: invite` · `FRL: accept, decline`
- **Preconditions and entry points:** Published or invite-only listing. Freelancer page "Invite to project".
- **User interactions and actions:** 1. Pick a listing. 2. Write a short message. 3. Send (limit per day). 4. Freelancer reviews the brief and accepts (opens the proposal form) or declines with a reason template.
- **System behaviour:** Invitation limit per client per week from entitlements (`gig.invites_per_week`, BIL). Invitations to paused or unavailable freelancers are blocked. Declined freelancers cannot be re-invited to the same listing. Invitation messages are scanned for contact details (BR-GIG-012).
- **UI elements and controls:** Invite dialog with listing select, message area, send button; freelancer inbox with accept and decline.
- **Configuration options:** Platform: weekly limit by plan (parameter).
- **Business rules:** BR-GIG-011, BR-GIG-012
- **Validation:** Message up to 600 chars.
- **Inputs and outputs:** In: invitation. Out: invitation record.
- **Filters, sorting, search:** Inbox by status.
- **Notifications and communication:** `gig.invitation.received`.
- **Error handling and edge cases:** Limit reached: dialog (BIL). Listing closed: invitation voided. Freelancer already proposed: invitation not needed message.
- **Dependencies:** BIL FR-BIL-022; `ENT-GIG-04`.
- **Security and privacy:** Freelancer sees client verification summary.
- **Acceptance criteria:**
  - Given the weekly limit reached, when sending, then it is refused with the limit dialog.
  - Given a declined invitation, when the client invites again, then it is blocked.
  - Given contact details in the message, when sent, then it is masked.

### C. Proposals and award

### FR-GIG-008 — Submit and manage a proposal

- **Sub-module:** C. Proposals and award
- **Priority / tier:** Must · R6
- **Source:** [SRC: SSOT F-130] · [PROP]
- **Purpose and outcome:** A freelancer offers to do the work with a plan, price and timeline. Known by a proposal `submitted`.
- **Roles and permissions:** `FRL: create, edit, withdraw` · `Client: read` · `MOD: read on report`
- **Preconditions and entry points:** Active freelancer; listing published; within proposal quota (FR-GIG-009). `/projects/:id/propose`.
- **User interactions and actions:** 1. Write a cover note tailored to the brief (200-3000 chars). 2. Propose milestones (title, deliverable, amount, due date) summing to the total, or accept the client's milestones. 3. Attach relevant evidence and work samples. 4. Answer the client's screening questions. 5. Submit. 6. Edit until viewed, withdraw any time.
- **System behaviour:** Shows the fee preview (what the client pays, what the freelancer receives). Duplicate proposals per listing are blocked. Cover-note scan for contact details and plagiarism similarity warning against the freelancer's own prior proposals (mass copy). Editing after the client viewed requires a visible "edited" marker and notifies the client. Total may not be below the client's stated minimum if one is set.
- **UI elements and controls:** Cover note editor, milestone repeater with running total, evidence picker, question fields, fee preview panel, "Submit".
- **Configuration options:** Platform: milestone count limits (1-20).
- **Business rules:** BR-GIG-005, BR-GIG-010, BR-GIG-012, BR-GIG-025
- **Validation:** Milestone amounts positive integers in the listing currency; sum equals total; due dates after expected start; total within platform limits.
- **Inputs and outputs:** In: proposal. Out: proposal record.
- **Filters, sorting, search:** My proposals by status.
- **Notifications and communication:** `gig.proposal.received` to client; `gig.proposal.viewed` to freelancer (in-app).
- **Error handling and edge cases:** Listing closed mid-edit: save blocked with explanation. Quota exhausted: limit dialog. Currency mismatch: forced to the listing currency.
- **Dependencies:** FR-GIG-004, FR-GIG-009; `ENT-GIG-05`.
- **Security and privacy:** Proposal visible to the client and moderators only.
- **Acceptance criteria:**
  - Given milestone amounts not summing to the total, when submitting, then it fails.
  - Given a second proposal to the same listing, when submitting, then it is refused.
  - Given an edit after viewing, when saved, then the client is notified.

### FR-GIG-009 — Proposal quotas and anti-spam

- **Sub-module:** C. Proposals and award
- **Priority / tier:** Must · R6
- **Source:** [SRC: SSOT F-59 outreach credits, BR-130 caps pattern] · [PROP]
- **Purpose and outcome:** Freelancers have a fair number of proposals and clients are not flooded. Known by quota enforcement and spam signals.
- **Roles and permissions:** `FRL: consume` · `FIN: configure plans` · `MOD: act on spam`
- **Preconditions and entry points:** Any proposal submission.
- **User interactions and actions:** 1. Freelancer sees remaining proposals. 2. At limit, sees upgrade or wait options (FR-BIL-023). 3. Clients can mark proposals as spam.
- **System behaviour:** Entitlement key `gig.proposals_per_month` from the freelancer's plan (BIL; default free allowance is a parameter, OD-GIG-11). Quota is spent on submission and refunded if the listing is cancelled by the client within 48 hours or rejected by moderation. Paid plans raise capacity only; they never place a proposal higher (BR-GIG-011). Repeated spam flags reduce the quota or suspend proposing pending review.
- **UI elements and controls:** Quota meter, limit dialog, "Mark as spam" client action.
- **Configuration options:** Platform: quota values per plan, refund window.
- **Business rules:** BR-GIG-011, BR-GIG-025
- **Validation:** Atomic quota consumption.
- **Inputs and outputs:** In: submission intent. Out: allow or limit.
- **Filters, sorting, search:** Usage view.
- **Notifications and communication:** `bil.usage.threshold`.
- **Error handling and edge cases:** Concurrent submissions at 1 left: one wins. Refund path failing: retried.
- **Dependencies:** BIL FR-BIL-003, FR-BIL-022; `ENT-GIG-05`.
- **Security and privacy:** Counters hold no content.
- **Acceptance criteria:**
  - Given a quota of 1 left, when two proposals submit simultaneously, then one succeeds.
  - Given a listing cancelled within 48 hours, when processed, then the quota is refunded.
  - Given a paid and free freelancer with equal match, when the client sees the list, then order is unaffected by plan.

### FR-GIG-010 — Shortlisting, comparison and pre-award conversation

- **Sub-module:** C. Proposals and award
- **Priority / tier:** Must · R6
- **Source:** [PROP]; relates to ATS shortlist patterns
- **Purpose and outcome:** A client compares proposals fairly and asks questions before choosing. Known by a shortlist and decision.
- **Roles and permissions:** `Client: view, shortlist, decline, message` · `FRL: reply`
- **Preconditions and entry points:** Proposals received. `/projects/:id/proposals`.
- **User interactions and actions:** 1. View proposals as a comparison table (price, timeline, milestones, evidence, ratings). 2. Sort and filter. 3. Shortlist, decline with a template reason (optional note), or message. 4. Schedule an optional intro call (INT planned). 5. Award (FR-GIG-011).
- **System behaviour:** Default order is relevance (match and evidence), not price or plan. Messages are in-platform threads; contact details masked until a contract exists (BR-GIG-012). Declines are sent with reasons from a list. Freelancer evidence is shown with verification level. The client can share the shortlist with a colleague in the same organization.
- **UI elements and controls:** Comparison table, shortlist star, decline dialog, message panel, "Award" button.
- **Configuration options:** Per listing: screening questions.
- **Business rules:** BR-GIG-011, BR-GIG-012
- **Validation:** Decline reason required from list.
- **Inputs and outputs:** In: decisions. Out: proposal states.
- **Filters, sorting, search:** By price, timeline, rating, evidence level.
- **Notifications and communication:** `gig.proposal.shortlisted`, `gig.proposal.declined`.
- **Error handling and edge cases:** Client inactive 30 days after proposals: freelancers can withdraw with quota refund. Duplicate decline: idempotent.
- **Dependencies:** MSG, INT (planned); `ENT-GIG-05`.
- **Security and privacy:** Proposals not shared outside the client organization.
- **Acceptance criteria:**
  - Given a shortlist, when the client declines another proposal, then it receives a templated reason.
  - Given a phone number in a message before award, when sent, then it is masked.
  - Given an inactive client for 30 days, when a freelancer withdraws, then quota refunds.

### FR-GIG-011 — Award and contract offer

- **Sub-module:** C. Proposals and award
- **Priority / tier:** Must · R6
- **Source:** [PROP]
- **Purpose and outcome:** The client turns a proposal into a contract offer and the freelancer accepts. Known by contract `active` (SM-GIG-04).
- **Roles and permissions:** `Client: award` · `FRL: accept, decline`
- **Preconditions and entry points:** Shortlisted proposal. "Award" button.
- **User interactions and actions:** 1. Client reviews final terms (FR-GIG-012), adjusts milestones, selects payment mode (per gates), and sends the offer. 2. Freelancer reviews and accepts or counters once. 3. On acceptance, both receive the signed terms and the first milestone starts.
- **System behaviour:** Offer expires in 7 days. Contract record and terms snapshot are immutable once accepted (changes through FR-GIG-015). Other proposals on a single-hire listing are declined with a "position filled" notice at acceptance; multi-hire listings stay open. Accepting requires eligibility to be current. Contact details are unmasked between the parties only after acceptance, if the contract allows (BR-GIG-012).
- **UI elements and controls:** Offer summary, terms viewer, "Send offer", "Accept offer", "Counter once".
- **Configuration options:** Per listing: single or multi-hire.
- **Business rules:** BR-GIG-004, BR-GIG-005, BR-GIG-012, BR-GIG-023
- **Validation:** Offer terms complete; freelancer eligible; client payment method valid.
- **Inputs and outputs:** In: offer. Out: contract.
- **Filters, sorting, search:** n/a — single flow.
- **Notifications and communication:** `gig.offer.sent`, `gig.offer.accepted`, `gig.offer.expired`.
- **Error handling and edge cases:** Offer expires: proposal returns to shortlist. Freelancer eligibility lapsed: acceptance blocked with fix steps. Client payment method fails at start: contract stays `offered`.
- **Dependencies:** FR-GIG-012, FR-GIG-018; `ENT-GIG-06`.
- **Security and privacy:** Signed terms stored with hash and timestamps.
- **Acceptance criteria:**
  - Given an accepted offer, when processed, then the contract is `active` and terms are immutable.
  - Given an expired offer, when the freelancer tries to accept, then it fails.
  - Given a single-hire listing, when the offer is accepted, then other proposers are notified.

### D. Contracts, milestones and deliverables

### FR-GIG-012 — Contract terms and templates

- **Sub-module:** D. Contracts, milestones and deliverables
- **Priority / tier:** Must · R6
- **Source:** [PROP]; [SRC: SSOT S-14 project marketplace infrastructure]
- **Purpose and outcome:** Every engagement has written terms both sides accept. Known by an accepted, hashed terms snapshot.
- **Roles and permissions:** `Client: propose terms` · `FRL: review, accept` · `PAD: manage templates` · `SUP: read (audited)`
- **Preconditions and entry points:** Award step (FR-GIG-011).
- **User interactions and actions:** 1. Start from a platform template (fixed-price project, retainer-free; hourly only if gated on). 2. Review sections: parties, scope and deliverables, milestones and amounts, acceptance criteria, review window, revision limits, payment mode, IP ownership, confidentiality, termination, governing law and dispute path, tax responsibilities, independent-contractor acknowledgement. 3. Edit permitted fields; locked sections show why. 4. Both accept with typed name and timestamp.
- **System behaviour:** Template clauses are versioned and reviewed by counsel. Editable fields are limited; free-text custom clauses are allowed in one "additional terms" block that is screened for prohibited content (off-platform payment, exclusivity, fixed hours) (BR-GIG-014). IP default: assigned to the client on payment in full of the relevant milestone, with the freelancer keeping pre-existing tools and a portfolio display right (BR-GIG-016). The platform is not a party (BR-GIG-004). Governing law defaults from the client's country and can be set by contract within platform rules (OD-GIG-04).
- **UI elements and controls:** Terms viewer with section navigation, editable fields, additional terms box, acceptance form, version indicator.
- **Configuration options:** Platform: template set, locked clauses, review window default (7 days), revision limit default (2).
- **Business rules:** BR-GIG-004, BR-GIG-005, BR-GIG-008, BR-GIG-009, BR-GIG-014, BR-GIG-016
- **Validation:** All required sections present; milestone sum equals contract total; review window 3-30 days; revision count 0-5.
- **Inputs and outputs:** In: terms. Out: immutable terms snapshot (`ENT-GIG-07`).
- **Filters, sorting, search:** n/a — document.
- **Notifications and communication:** `gig.terms.updated`.
- **Error handling and edge cases:** Custom clause flagged: blocked or warned with reasons. One side edits after the other accepted: acceptance resets. Template updated: running contracts keep their version.
- **Dependencies:** FR-GIG-011; `ENT-GIG-07`.
- **Security and privacy:** Terms visible to parties and authorized staff; hashed for integrity.
- **Acceptance criteria:**
  - Given an edit after one acceptance, when saved, then acceptance resets.
  - Given a custom clause requiring payment outside the platform, when saved, then it is blocked.
  - Given a template update, when a contract is running, then the contract keeps its version.

### FR-GIG-013 — Milestones and deliverable submission

- **Sub-module:** D. Contracts, milestones and deliverables
- **Priority / tier:** Must · R6
- **Source:** [PROP]
- **Purpose and outcome:** The freelancer submits work against a milestone with evidence of completion. Known by milestone state `submitted` and attached deliverables.
- **Roles and permissions:** `FRL: submit` · `Client: view` · `PAD: read on dispute`
- **Preconditions and entry points:** Contract `active`; milestone `in_progress`. `/contracts/:id/milestones/:mid`.
- **User interactions and actions:** 1. Upload files (up to size limits) or add links (repository, design file, document) with access notes. 2. Write a delivery note mapping to each acceptance criterion. 3. Click "Submit for review".
- **System behaviour:** Files are virus scanned and stored for the contract term plus retention (PLT planned). Links are recorded with a snapshot hash where possible (for example a commit id). Submission starts the client's review window (default 7 days, BR-GIG-008). A milestone can be submitted only once per review cycle. Partial delivery is allowed only if the milestone is split by amendment (FR-GIG-015).
- **UI elements and controls:** File dropzone with progress, link entries with type select, criteria checklist with notes per criterion, "Submit for review".
- **Configuration options:** Platform: maximum file size (default 500 MB per file, 5 GB per contract), allowed link hosts.
- **Business rules:** BR-GIG-005, BR-GIG-008
- **Validation:** At least one file or link; each criterion has a note; allowed file types (executables flagged for review).
- **Inputs and outputs:** In: deliverables. Out: submission record and client prompt.
- **Filters, sorting, search:** Milestone list by state.
- **Notifications and communication:** `gig.milestone.submitted` to client with review deadline (transactional).
- **Error handling and edge cases:** Upload fails: resumable. Malware detected: file quarantined and freelancer told. Submit after due date: allowed, with a "late" marker, no penalty unless terms say so.
- **Dependencies:** PLT (planned), FR-GIG-014; `ENT-GIG-08`, `ENT-GIG-09`.
- **Security and privacy:** Deliverables visible to the parties only; NDA clauses apply.
- **Acceptance criteria:**
  - Given a submission, when sent, then the review window starts and the client is notified.
  - Given a malware file, when uploaded, then it is quarantined and cannot be submitted.
  - Given a second submission during the same cycle, when attempted, then it is blocked.

### FR-GIG-014 — Milestone review: accept, request revision, reject

- **Sub-module:** D. Contracts, milestones and deliverables
- **Priority / tier:** Must · R6
- **Source:** [PROP]
- **Purpose and outcome:** The client decides on each milestone within a fixed window, with fair handling of silence. Known by SM-GIG-05 terminal outcomes.
- **Roles and permissions:** `Client: accept, request revision, reject` · `FRL: respond, escalate` · `SUP: assist`
- **Preconditions and entry points:** Milestone `submitted`.
- **User interactions and actions:** 1. Client opens the deliverables and criteria checklist. 2. Marks each criterion met or not met with comments. 3. Chooses Accept, Request revision (must cite unmet criteria), or Reject (opens a dispute path). 4. Freelancer receives the decision and resubmits if revision.
- **System behaviour:** Revisions are limited per milestone (default 2); further revisions need a change request (FR-GIG-015). If the client does not respond within the review window plus a 3-day reminder period, the milestone is auto-accepted with notices (BR-GIG-008); the client can still dispute within 7 days with evidence. Rejection without unmet criteria is not allowed. Acceptance triggers payment release (FR-GIG-020) and a work-evidence candidate (FR-GIG-024).
- **UI elements and controls:** Criteria checklist with comments, decision buttons, countdown showing the review deadline, "Escalate to support" link.
- **Configuration options:** Per contract: review window, revision limit.
- **Business rules:** BR-GIG-008, BR-GIG-009, BR-GIG-020, BR-GIG-030
- **Validation:** Revision and reject require at least one unmet criterion and a comment (20-2000 chars).
- **Inputs and outputs:** In: decision. Out: state change, payment event.
- **Filters, sorting, search:** Client review queue by deadline.
- **Notifications and communication:** `gig.review.reminder` at 3 days and 1 day before the deadline, `gig.milestone.auto_accepted`, `gig.milestone.revision_requested`.
- **Error handling and edge cases:** Client account suspended during window: clock pauses and `SUP` assigned. Freelancer misses revision deadline: milestone `late` rather than auto-failing. Auto-accept on a contested deliverable: dispute allowed.
- **Dependencies:** FR-GIG-013, FR-GIG-020, FR-GIG-025; `ENT-GIG-08`.
- **Security and privacy:** Decisions audited.
- **Acceptance criteria:**
  - Given no client response at the end of the window plus reminder period, when the job runs, then the milestone auto-accepts and both are notified.
  - Given a revision request citing no criterion, when submitted, then it is rejected.
  - Given a third revision on a limit of 2, when requested, then a change request is required.

### FR-GIG-015 — Change requests and scope amendments

- **Sub-module:** D. Contracts, milestones and deliverables
- **Priority / tier:** Should · R6
- **Source:** [PROP]
- **Purpose and outcome:** Scope, price, schedule or milestones change by mutual written agreement. Known by SM-GIG-06 `agreed` and a new terms version.
- **Roles and permissions:** `Client, FRL: propose, accept, decline`
- **Preconditions and entry points:** Active contract. "Request change".
- **User interactions and actions:** 1. Either side proposes: add or edit a milestone, change due dates, change amount, extend scope, add revisions. 2. The other reviews and accepts, declines, or counters. 3. On agreement a new terms version is created.
- **System behaviour:** Amount increases require the client's funding or authorization before work (per payment mode). Amount decreases on funded milestones follow refund rules. Changes cannot lower an already accepted milestone. Unanswered requests expire in 7 days. All versions are kept.
- **UI elements and controls:** Change form with before and after diff, accept and decline buttons.
- **Configuration options:** Platform: expiry days.
- **Business rules:** BR-GIG-005, BR-GIG-006
- **Validation:** Totals consistent; effective dates in future.
- **Inputs and outputs:** In: change. Out: amended terms.
- **Filters, sorting, search:** By state.
- **Notifications and communication:** `gig.change.requested`, `gig.change.agreed`, `gig.change.expired`.
- **Error handling and edge cases:** Concurrent proposals: only one open at a time. Funding fails: change stays pending.
- **Dependencies:** FR-GIG-012, FR-GIG-018; `ENT-GIG-10`.
- **Security and privacy:** Parties only.
- **Acceptance criteria:**
  - Given an agreed change, when applied, then a new version exists and the old one is retained.
  - Given an attempt to reduce an accepted milestone, when proposed, then it is rejected.
  - Given an unanswered request, when 7 days pass, then it expires.

### FR-GIG-016 — Contract completion, cancellation and termination

- **Sub-module:** D. Contracts, milestones and deliverables
- **Priority / tier:** Must · R6
- **Source:** [PROP]
- **Purpose and outcome:** A contract ends cleanly for any reason. Known by SM-GIG-04 terminal state with all money settled.
- **Roles and permissions:** `Client, FRL: complete, cancel, terminate` · `PAD: force-end with audit`
- **Preconditions and entry points:** Contract page.
- **User interactions and actions:** 1. Complete: all milestones paid or cancelled, either party confirms completion. 2. Mutual cancellation: both agree with settlement terms. 3. Unilateral termination: choose a reason, see consequences (unpaid accepted milestones remain due; in-progress milestone handling per terms), confirm.
- **System behaviour:** Completion triggers reviews (FR-GIG-024) and evidence creation. For in-progress work on termination, the system proposes a settlement calculator (percentage complete per freelancer, per client) and moves to negotiation; no resolution within 7 days opens a dispute (FR-GIG-025). Held funds (if escrow) are not released or refunded until the settlement or decision. Contracts unaffected by a party's account suspension continue per protocol: client suspended means freelancer can submit and funds stay held; freelancer suspended means client may reassign or cancel with refund of unreleased funds.
- **UI elements and controls:** Completion button, termination dialog with consequences list, settlement calculator.
- **Configuration options:** Platform: negotiation window (7 days).
- **Business rules:** BR-GIG-005, BR-GIG-020, BR-GIG-022
- **Validation:** Reason required; settlement amounts within contract remaining value.
- **Inputs and outputs:** In: action. Out: end state, settlement.
- **Filters, sorting, search:** Contracts by state.
- **Notifications and communication:** `gig.contract.completed`, `gig.contract.terminated`.
- **Error handling and edge cases:** Both sides unresponsive: contract auto-closes after 60 days of inactivity with reviews disabled and funds handled per FR-GIG-018. Unpaid accepted milestone at termination: payment still released.
- **Dependencies:** FR-GIG-018, FR-GIG-020, FR-GIG-024, FR-GIG-025; `ENT-GIG-06`.
- **Security and privacy:** Audit.
- **Acceptance criteria:**
  - Given all milestones paid, when both confirm, then the contract is `completed` and review prompts go out.
  - Given termination mid-milestone, when confirmed, then a settlement negotiation opens and funds are not released.
  - Given a suspended freelancer, when the contract is processed, then the client is offered cancellation with refund of unreleased funds.

### FR-GIG-017 — Project workroom: messages, files and status

- **Sub-module:** D. Contracts, milestones and deliverables
- **Priority / tier:** Should · R6
- **Source:** [PROP]; [SRC: SSOT MSG planned]
- **Purpose and outcome:** Parties collaborate in one place with a record that can serve in disputes. Known by a single timeline per contract.
- **Roles and permissions:** `Client, FRL: participate` · `SUP, PAD: read on dispute or report (audited)`
- **Preconditions and entry points:** Contract `offered` or `active`. `/contracts/:id`.
- **User interactions and actions:** 1. Send messages and attachments. 2. Post status updates (percent done, blockers). 3. Share files. 4. Mention team members of the client organization. 5. Pin decisions.
- **System behaviour:** Timeline includes system events (milestone states, changes, payments). Contact details are unmasked between the parties after contract acceptance unless the contract forbids (BR-GIG-012). Messages are retained for the retention period and are the evidence base for disputes. The workroom is not a general chat product: no public channels, no feeds.
- **UI elements and controls:** Timeline, composer with attachments, status update form, pin icon, member list.
- **Configuration options:** Per contract: client team members added.
- **Business rules:** BR-GIG-012, BR-GIG-029
- **Validation:** Attachment limits per PLT.
- **Inputs and outputs:** In: messages. Out: timeline.
- **Filters, sorting, search:** Search within contract; filter by type.
- **Notifications and communication:** `gig.message.new` (opt-out class: messages).
- **Error handling and edge cases:** Harassment: report path. Party offline: digest. Client team member leaves the organization: access removed.
- **Dependencies:** MSG, PLT (planned), EMP; `ENT-GIG-06`.
- **Security and privacy:** Contract-scoped access; encryption in transit and at rest.
- **Acceptance criteria:**
  - Given a client team member removed from the organization, when they open the workroom, then access is denied.
  - Given a dispute, when `SUP` reads messages, then the access is audited.
  - Given a pre-contract message with a phone number, when sent, then it is masked.

### E. Money: escrow gate, time tracking gate, payment

### FR-GIG-018 — Payment modes and the escrow decision gate

- **Sub-module:** E. Money: escrow gate, time tracking gate, payment
- **Priority / tier:** Must (mode A) · R6; escrow modes Won't-now until `OD-GIG-02`
- **Source:** [SRC: SSOT S-14 "escrow via Stripe"] · [PROP]; conflicts with §4.2 non-goal risk and money-handling regulation, hence the gate
- **Purpose and outcome:** Milestone payment protection is offered in the form that is legally and operationally approved. Known by every contract naming exactly one payment mode.
- **Roles and permissions:** `Client: choose mode` · `FRL: accept mode` · `FIN: operate` · `PAD, SAD: enable modes` · `Legal: sign-off (off-system)`
- **Preconditions and entry points:** Contract offer step.
- **User interactions and actions:** 1. Client picks the payment mode (only enabled modes are shown). 2. Freelancer sees what protection exists before accepting. 3. For funding modes, the client funds a milestone and the freelancer sees "Funded".
- **System behaviour:** Modes: **A. Pay on acceptance (default, enabled with the module):** the client has an authorized payment method and a spend limit; when a milestone is accepted, the platform charges the client and credits the freelancer's earnings through BIL (FR-BIL-028, FR-BIL-029). The platform does not hold third-party funds before acceptance; the risk of a failed charge is mitigated by a pre-authorization check at milestone start, client trust limits for new clients (BR-GIG-023) and a client failure policy (suspension plus collection through the provider). **B. Provider-managed funding (gated, `OD-GIG-02`):** the client pays when the milestone starts into a held balance managed by a licensed payment provider or escrow partner; release on acceptance, refund on cancellation, split by decision. **C. Platform escrow (not offered):** the platform never directly holds funds unless an explicit decision and legal structure exist (BR-GIG-006). Mode flags are platform settings; a mode that is not enabled cannot be selected or inferred.
- **UI elements and controls:** Mode selector with plain-language protection summary, funding status chip on milestones, "Fund milestone" button (mode B).
- **Configuration options:** Platform: enabled modes (default A only), new-client spend limit, pre-authorization amount rule.
- **Business rules:** BR-GIG-006, BR-GIG-023, BR-GIG-010
- **Validation:** Mode enabled; client limit not exceeded; funding amount equals milestone total plus fees.
- **Inputs and outputs:** In: mode, funding. Out: payment state per milestone.
- **Filters, sorting, search:** Finance view by mode, state.
- **Notifications and communication:** `gig.milestone.funded` (mode B), `gig.payment.failed`.
- **Error handling and edge cases:** Mode A charge fails at acceptance: payment retried per BIL dunning, freelancer shown "Payment pending" with protection options (client suspension, collections); repeated failures block the client from new contracts. Mode B funding expires: milestone not started. Mode change after offer: new acceptance required.
- **Dependencies:** BIL FR-BIL-028, FR-BIL-029, FR-BIL-016; `ENT-GIG-11`.
- **Security and privacy:** No card data; fund holds recorded only through the provider.
- **Acceptance criteria:**
  - Given mode B not enabled, when a client tries to select it, then it is unavailable and an API request is refused.
  - Given mode A and a failing charge at acceptance, when processed, then the freelancer sees "Payment pending" and the client cannot start new contracts.
  - Given a new client over the new-client limit, when awarding, then the offer is blocked until verification improves.

### FR-GIG-019 — Hourly contracts and time tracking (decision-gated)

- **Sub-module:** E. Money: escrow gate, time tracking gate, payment
- **Priority / tier:** Won't-now until `OD-GIG-03` · R6
- **Source:** [PROP]; tension with SSOT §4.2 (generic HR system) and worker-classification risk
- **Purpose and outcome:** If approved, hourly engagements record time with explicit consent. Known by approved time entries invoiced weekly.
- **Roles and permissions:** `FRL: log time, dispute` · `Client: approve time` · `FIN: operate`
- **Preconditions and entry points:** Feature flag on; contract type hourly. `/contracts/:id/time`.
- **User interactions and actions:** 1. Freelancer logs time manually (date, duration, description) or starts a timer. 2. Optional screenshot capture only if both agreed, freelancer sees and can delete entries before submission (default off). 3. Weekly timesheet is submitted. 4. Client approves or disputes entries within 5 days. 5. Approved time is paid.
- **System behaviour:** Weekly cap and total cap per contract set by the client. No keystroke or mouse logging, no webcam, no covert monitoring ever (BR-GIG-007). Manual time needs a note; entries beyond caps are rejected. Silence leads to auto-approval after the window like milestones. Hourly work raises misclassification risk, so the classification guard (FR-GIG-022) applies with stricter warnings (fixed schedule, exclusivity).
- **UI elements and controls:** Timesheet grid, timer, consent toggles, approve and dispute buttons.
- **Configuration options:** Platform: flag off by default; weekly cap defaults.
- **Business rules:** BR-GIG-007, BR-GIG-008, BR-GIG-014
- **Validation:** Entries at most 12 hours per day; no overlapping entries; description required.
- **Inputs and outputs:** In: time entries. Out: invoices and earning events.
- **Filters, sorting, search:** By week, state.
- **Notifications and communication:** `gig.timesheet.submitted`, `gig.timesheet.auto_approved`.
- **Error handling and edge cases:** Timer left running: auto-stops after 4 hours idle prompts. Dispute: affected entries go to FR-GIG-025. Feature flag off: routes return 404 and UI shows no entry points.
- **Dependencies:** BIL, FR-GIG-022; `ENT-GIG-12`.
- **Security and privacy:** No covert capture; screenshots (if enabled) private to the parties and deleted 30 days after payment.
- **Acceptance criteria:**
  - Given the flag off, when a client creates an hourly contract, then it is not possible.
  - Given a screenshot setting without both consents, when a timer runs, then no capture occurs.
  - Given entries overlapping, when logged, then the second is rejected.

### FR-GIG-020 — Payment release, fees and payouts

- **Sub-module:** E. Money: escrow gate, time tracking gate, payment
- **Priority / tier:** Must · R6
- **Source:** [SRC: BR-101 revenue share default; OD-28] · [PROP]
- **Purpose and outcome:** Accepted work is paid and fees are clear. Known by earning events in BIL and a statement per milestone.
- **Roles and permissions:** `FRL: view earnings` · `Client: view spend, invoices` · `FIN: operate`
- **Preconditions and entry points:** Milestone accepted (FR-GIG-014).
- **User interactions and actions:** 1. Both see a payment breakdown (milestone amount, platform fee, taxes, payout). 2. Client receives an invoice. 3. Freelancer sees the earning with its hold period and payout status.
- **System behaviour:** On acceptance, GIG creates a BIL order (client charge) and an earning event (freelancer share) with idempotency on (milestone id). Fee model is a parameter shown before award: for example a freelancer-side fee percent and a client-side fee percent (OD-GIG-08, no number set here). The same fee table applies to every freelancer; no negotiated per-user hidden fee (BR-GIG-010). Earnings follow BIL's hold and payout rules including clawbacks on refund (FR-BIL-029). Client invoices carry tax per BIL.
- **UI elements and controls:** Payment breakdown panel, invoice link, earnings list with status.
- **Configuration options:** Platform: fee parameters, hold days, minimum milestone amount.
- **Business rules:** BR-GIG-010, BR-GIG-013, BR-GIG-030
- **Validation:** Idempotency per milestone; amounts match accepted terms.
- **Inputs and outputs:** In: acceptance events. Out: orders and earnings.
- **Filters, sorting, search:** Earnings by contract, period.
- **Notifications and communication:** `gig.payment.released`, `gig.payment.paid_out` (transactional).
- **Error handling and edge cases:** Duplicate acceptance event: no double payment. Currency conversion: shown with the rate and fixed at acceptance. Refund after payout: clawback.
- **Dependencies:** BIL (all), FR-GIG-014; `ENT-GIG-11`.
- **Security and privacy:** Earnings private to the freelancer and finance.
- **Acceptance criteria:**
  - Given an accepted milestone, when processed twice, then only one earning event exists.
  - Given the fee table changes mid-contract, when a milestone is accepted, then the fee in the terms snapshot applies.
  - Given a refund after payout, when processed, then a clawback is recorded.

### F. Compliance: tax, classification, cross-border

### FR-GIG-021 — Tax documents and reporting constraints

- **Sub-module:** F. Compliance: tax, classification, cross-border
- **Priority / tier:** Must · R6
- **Source:** [PROP] (US W-9, W-8BEN and 1099 reporting thresholds, EU DAC7 marketplace reporting, other regional regimes); approach `OD-GIG-05`
- **Purpose and outcome:** The platform collects the tax information it is legally required to collect and reports where it must, without giving tax advice. Known by payout permitted only with valid tax data.
- **Roles and permissions:** `FRL: submit` · `FIN: review, file via provider` · `SAD: policy`
- **Preconditions and entry points:** Eligibility checklist (FR-GIG-003), before first payout.
- **User interactions and actions:** 1. Choose tax residency and entity type (individual, company). 2. Submit the appropriate form (collected by the payment provider or a tax-form service). 3. View status and renewal dates. 4. Download annual statements of earnings.
- **System behaviour:** Required documents depend on country pair (freelancer residence and client country). Invalid or missing data pauses payouts, not work. Annual summaries and regulatory filings are produced through the provider or tax-reporting vendor where the platform is the reporting entity; thresholds are configuration. The system shows tax responsibilities as information with a "talk to a tax professional" notice and does not compute the freelancer's own taxes. Withholding (for example backup withholding or treaty rates) is applied only if the provider supports and legal approves.
- **UI elements and controls:** Tax form wizard (provider-hosted), status chips, annual statements list.
- **Configuration options:** Platform: country rules and thresholds.
- **Business rules:** BR-GIG-013, BR-GIG-015
- **Validation:** Form validity from the provider; tax id formats.
- **Inputs and outputs:** In: forms. Out: status, statements.
- **Filters, sorting, search:** Statements by year.
- **Notifications and communication:** `gig.tax.required`, `gig.tax.expiring`, `gig.tax.statement_ready`.
- **Error handling and edge cases:** Treaty claim rejected: freelancer informed of the effect. Mid-year residency change: new form. Vendor outage: payouts held with notice.
- **Dependencies:** BIL FR-BIL-014, FR-BIL-029; `ENT-GIG-15`.
- **Security and privacy:** Tax data Restricted; held by the provider.
- **Acceptance criteria:**
  - Given no valid tax form, when a payout is due, then it is held and the freelancer prompted.
  - Given a US client and non-US freelancer, when onboarding, then the correct form type is requested.
  - Given year end, when statements generate, then each freelancer sees their earnings summary.

### FR-GIG-022 — Worker classification guard

- **Sub-module:** F. Compliance: tax, classification, cross-border
- **Priority / tier:** Must · R6
- **Source:** [PROP]; tied to SSOT §4.2 (not an HR or payroll system), `OD-GIG-04`
- **Purpose and outcome:** The platform avoids facilitating disguised employment and warns both sides, without deciding legal status. Known by flags and blocked patterns.
- **Roles and permissions:** `MOD, PAD: review flags` · `Client, FRL: see warnings` · `Legal: policy`
- **Preconditions and entry points:** Brief creation, contract terms, activity patterns.
- **User interactions and actions:** 1. Client sees warnings when terms indicate control: fixed daily hours, required presence, exclusivity, required equipment, training obligations, supervision by named manager. 2. Both can acknowledge or change terms. 3. Flagged patterns (single freelancer working with one client for more than a threshold of months at near full-time hours) prompt a review notice.
- **System behaviour:** Rules are configuration by jurisdiction. Blocked: terms requiring exclusivity and hours-based availability. Warned: others. The system never labels anyone an employee or contractor; messages say the terms resemble employment under some laws and suggest professional advice or using a job listing (JOB) for employees. Long-running pairs get a one-time prompt to consider hire conversion (FR-GIG-030). No payroll, benefits or withholding features exist.
- **UI elements and controls:** Warning banners with explanation, acknowledgment checkbox, link to hire flow.
- **Configuration options:** Platform: rule set per country, long-engagement thresholds.
- **Business rules:** BR-GIG-004, BR-GIG-014
- **Validation:** Warnings logged with acknowledgments.
- **Inputs and outputs:** In: terms and activity. Out: flags.
- **Filters, sorting, search:** Review queue by rule.
- **Notifications and communication:** `gig.classification.notice`.
- **Error handling and edge cases:** False positive: parties acknowledge and proceed unless blocked. Rule updates apply to new terms only.
- **Dependencies:** FR-GIG-012, FR-GIG-030; `ENT-GIG-16`.
- **Security and privacy:** Flags visible to parties and staff.
- **Acceptance criteria:**
  - Given terms requiring exclusivity, when saved, then blocked.
  - Given fixed daily hours, when saved, then a warning requires acknowledgment.
  - Given a long full-time-like engagement, when detected, then a hire conversion prompt appears once.

### FR-GIG-023 — Cross-border, sanctions and currency constraints

- **Sub-module:** F. Compliance: tax, classification, cross-border
- **Priority / tier:** Must · R6
- **Source:** [PROP]; [SRC: CON-010 money minor units; BR-BIL-006, BR-BIL-028]
- **Purpose and outcome:** The platform blocks prohibited cross-border work and handles currencies predictably. Known by contracts that pass compliance checks.
- **Roles and permissions:** `FIN, PAD: manage lists` · `SAD: sanctions list sign-off` · `all users: informed`
- **Preconditions and entry points:** Eligibility, listing and award steps.
- **User interactions and actions:** 1. Users see which countries are supported. 2. At award, the system checks both parties against supported lists and sanctions screening. 3. Users see the contract currency and, if different from payout currency, the conversion rate and fee.
- **System behaviour:** One currency per contract fixed at award. Screening runs on onboarding, award and payout against sanctions lists via a vendor; hits hold the action for manual review without telling the user the screening basis beyond "compliance review". Export-control and prohibited-service rules for categories are configuration. Payments to unsupported countries are never attempted. Any restriction affecting a running contract triggers FR-GIG-016 flows with held funds treated per provider rules.
- **UI elements and controls:** Country support list, currency display with rate and fee, compliance review notice.
- **Configuration options:** Platform: supported countries, blocked categories by country.
- **Business rules:** BR-GIG-015, BR-GIG-013
- **Validation:** Currency in the supported list; screening status clear.
- **Inputs and outputs:** In: parties, currency. Out: pass or hold.
- **Filters, sorting, search:** Review queue by status.
- **Notifications and communication:** `gig.compliance.review` (neutral wording).
- **Error handling and edge cases:** False positive: manual clearance with audit. List update during a contract: re-screen and hold if hit.
- **Dependencies:** BIL, BGV (planned); `ENT-GIG-16`.
- **Security and privacy:** Screening data Restricted; minimal disclosure to users.
- **Acceptance criteria:**
  - Given a party in a blocked country, when awarding, then the offer is refused with the neutral message.
  - Given currency conversion, when shown, then the rate and fee appear before acceptance.
  - Given a screening hit at payout, when processed, then payout is held for review.
