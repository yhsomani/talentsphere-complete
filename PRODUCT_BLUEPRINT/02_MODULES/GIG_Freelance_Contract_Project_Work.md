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

Notes: `REC` and `HMG` can post projects only if the organization's `EAD` enabled project posting. `IAD` and `PLO` handle only learning and apprenticeship projects (FR-GIG-027). Freelancer contract data is never visible to employers who evaluate the same person as a job candidate unless the freelancer shares it (BR-GIG-027).

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
- **System behaviour:** Offer expires in 7 days. Contract record and terms snapshot are immutable once accepted (changes through FR-GIG-016). Other proposals on a single-hire listing are declined with a "position filled" notice at acceptance; multi-hire listings stay open. Accepting requires eligibility to be current. Contact details are unmasked between the parties only after acceptance, if the contract allows (BR-GIG-012).
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
