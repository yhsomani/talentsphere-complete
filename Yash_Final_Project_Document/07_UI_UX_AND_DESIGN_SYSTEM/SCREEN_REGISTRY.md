# Screen Registry — 130 screens across MOD-SHELL and seven remotes

Doc ID: UI-02 · Owner: Interaction Design Lead · Version 1.0 · Status: Under Review · Relates: UI-01 `NAVIGATION_ARCHITECTURE.md`, UI-03 `SCREEN_SPECIFICATIONS_KEY.md`, UI-04 `ACTION_REGISTRY.md`, UI-05, UI-06, UI-07, USR-01, DOM-00, ID registry

Supersedes nothing; linked from the folder index and `MASTER_INDEX`. Everything is **[TARGET]** design. `[REF]` means the page name is merely terminologically informed by the existing project's page list (`apps/web/src/pages`); no reference screen was copied. **API ids are placeholders** of the form `API-<module>-<verb>` (module = backend module name from the ID registry); real operation ids will be fixed by the API contract documents and must be reconciled [OPEN-UX-22]. Screens belong to the remote that owns their route prefix; the "Roles" column lists who may *reach* the screen (server-authorized per record, INV-T01/T02), not what nav shows.

## 0. Legend

**Roles:** ANON, CAND, INST (instructor), REC, HM, ORGADM, INSTADM, FAC, MOD, SUP, ADM, AUD, REFEREE (token), MENTOR [OPEN-UX-17]. `own` = record owner; `O` = within own org/institution; `S` = scoped time-boxed grant.

**Standard states (every screen inherits unless a row says otherwise):**
`L` loading = shape-matched skeleton after 150 ms (UI-07 §1) · `E` empty = reason + primary action (UI-07 §2) · `X` error = plain cause + Retry + trace id · `OK` success = content · `403/404` = in-place forbidden or neutral not-found (UI-01 RD-08/09) · Offline mode per screen: **O-c** read-only saved copy of owner data labelled with time (INV-T13) · **O-q** queued writes allowed (ADR-T10 set only) · **O-x** online-only, controls disabled with reason · **O-n** not available offline, explains.

**Responsive codes (UI-05 §6):** R1 table→card list, "Load more" · R2 single-column form with sticky ActionBar · R3 master–detail (split ≥ xl, push < xl) · R4 board→column tabs / list view default < lg · R5 dashboard 12→1 col reflow · R6 focus layout, no nav · R7 reading/content page · R8 wizard (Stepper routes) · R9 dense admin table with card fallback < md.

**Accessibility codes (UI-06):** A1 list/table (caption, sort, selection announcements) · A2 form (summary, labels, autocomplete, 3.3.7) · A3 wizard (step heading focus, progress text) · A4 board/grid (non-drag path 2.5.7, APG keys) · A5 media (captions, transcript, no autoplay) · A6 dialog route (focus trap/restore) · A7 dashboard (landmarks per widget, headings) · A8 timed (timers, accommodations, 2.2.1 exception) · A9 public token page (no account, 3.3.8, zoom 400 %) · A10 high-risk admin (persistent banner, coarse live updates, confirm) · A11 chat/live (polite live regions, no focus steal) · A12 chart + table alternative.

**Shell-level actions** available on every authenticated screen and therefore not repeated per row: ACT-SYS-01 (command palette), ACT-SYS-06 (resolve edit conflict), ACT-SYS-07 (dismiss install prompt), ACT-SYS-08 (extend session), ACT-SYS-10 (help).

**Verification vocabulary:** rungs per DESIGN_SYSTEM §7.8 — Claimed · Backed by artifact · Peer-attested · Verified by `<authority>`. Application statuses shown via `StatusBadge` map in §9.

## 1. MOD-SHELL — host shell, public and token pages (19)

| ID | Route | Roles | Purpose | Primary ACT | Secondary ACT | Data (API) | States beyond Std | Responsive · A11y notes |
|---|---|---|---|---|---|---|---|---|
| SCR-SHELL-01 | `/` | ANON (authed → RD-03) | Landing: promise, how the evidence ladder works, featured jobs | ACT-AUTH-01 | ACT-JOB-01, ACT-SYS-10 | API-jobs-list (public), API-platform-get-status | O-c static shell; no E | R7 · rung explainer as text list + icons, one `h1` |
| SCR-SHELL-02 | `/login` | ANON | Sign in with passkey, password or SSO | ACT-AUTH-04, ACT-AUTH-05 | ACT-AUTH-07, ACT-AUTH-12, ACT-AUTH-01 | API-identity-login, API-identity-passkey-options, API-orgs-sso-discover | rate-limited (generic text), SSO-enforced, account paused (RD-16), locked; O-n | R2 · A2; 3.3.8 (paste, autofill, no puzzle); full spec UI-03 §1 |
| SCR-SHELL-03 | `/signup` | ANON | Create account (email + password or passkey) | ACT-AUTH-01 | ACT-AUTH-12 | API-identity-register | email-in-use shown neutrally ("check your email"); age gate [OPEN-09]; O-n | R2 · A2 |
| SCR-SHELL-04 | `/signup/confirm` | ANON, CAND (pending) | Confirm email by code or link | ACT-AUTH-02 | ACT-AUTH-03 | API-identity-confirm-email, API-identity-resend-code | code expired, attempts exceeded, already confirmed | R2 · A2 `OtpField`, resend cooldown as text |
| SCR-SHELL-05 | `/login/forgot` | ANON | Request password reset | ACT-AUTH-07 | — | API-identity-request-reset | always neutral confirmation | R2 · A2 |
| SCR-SHELL-06 | `/login/reset/:resetId` | ANON (token) | Set new password | ACT-AUTH-08 | — | API-identity-reset-password | link used/expired → request new; policy hints | R2 · A2; password rules shown up-front |
| SCR-SHELL-07 | `/login/challenge` | CAND, REC, … (partial session) | Step-up / second factor (passkey or emailed code) | ACT-AUTH-06 | ACT-AUTH-13 | API-identity-challenge-options, API-identity-challenge-verify | attempts exceeded; fallback options | R2 · A2; 3.3.8 |
| SCR-SHELL-08 | `/p/:handle` | ANON, all | Public profile (only owner-published fields) with per-rung evidence counts | ACT-AUTH-01 (anon) / ACT-MSG-06 (REC) | ACT-PRO-14 | API-profile-get-public, API-evidence-list-public-summary | not published/private → neutral 404; hidden-by-consent for restricted items | R7 · A12; badges not colour-only; no "% verified" |
| SCR-SHELL-09 | `/r/:requestId` | REFEREE (token) | Referee confirms/declines a work-history claim in < 3 minutes, no account | ACT-REF-02 | ACT-REF-01, ACT-REF-03, ACT-REF-04, ACT-REF-06 | API-verification-get-request-public, API-verification-submit-attestation | expired, already used, cancelled, wrong-device code entry, language switch; O-n with draft preserved | R6/R2 · A9; full spec UI-03 §11 |
| SCR-SHELL-10 | `/r/:requestId/done` | REFEREE | Thanks / declined / expired / reported-misuse confirmation | ACT-REF-05 (if expired) | ACT-SYS-10 | API-verification-get-request-status | states: submitted, declined, expired, reported | R7 · A9; neutral copy, no requester disclosure |
| SCR-SHELL-11 | `/c/:credentialId` | ANON, all | Public credential check: rung, issuer, date, status (revoked/expired) — no private data | — | ACT-PRO-14 | API-evidence-get-public-credential | revoked/expired shown prominently; unknown → neutral 404 | R7 · A12; text states "Verified by X on date" only for L4 |
| SCR-SHELL-12 | `/invite/:inviteId` | ANON, any (token) | Accept org/institution/instructor invitation | ACT-AUTH-10 | ACT-AUTH-01 | API-orgs-get-invite, API-orgs-accept-invite | expired/revoked/wrong account | R2 · A2 |
| SCR-SHELL-13 | `/workspaces` | any authed with ≥ 2 grants | Choose workspace (role + scope) | ACT-SYS-02 | — | API-identity-get-capabilities | single grant skips screen | R7 · A1 list of workspaces with role text |
| SCR-SHELL-14 | `/error/:kind` (in place) | any | Forbidden, not found, remote unavailable, maintenance states | ACT-SYS-03 | ACT-SYS-04, ACT-SYS-02 | API-platform-get-status | kinds: forbidden (+request access / switch workspace), not-found, remote-unavailable, maintenance | R7 · focus on `h1`; assertive announce once |
| SCR-SHELL-15 | `/offline` | any | Offline fallback: list of saved areas, queued changes | ACT-SYS-05 | ACT-SYS-03 | (local cache only) | cached areas empty | R7 · A1 |
| SCR-SHELL-16 | `/legal/:doc` | ANON, all | Terms, privacy notice, cookies, accessibility statement | — | ACT-PRV-09 | API-platform-get-legal-doc | version/date shown; locale | R7 · headings/TOC; plain-language summary [OPEN-08] |
| SCR-SHELL-17 | `/help` , `/help/sitemap` | ANON, all | Help center, contact, status, accessibility feedback | ACT-SYS-04 | ACT-SYS-10 | API-platform-list-help | contact form offline queued? no → O-x | R7 · A2 |
| SCR-SHELL-18 | (overlay) re-auth | any authed | Re-authenticate in place without losing work | ACT-AUTH-14 | ACT-AUTH-09 | API-identity-reauth | refresh reuse → full logout (BR-T050) | Dialog · A6; focus restore |
| SCR-SHELL-19 | `/auth/callback` | ANON | SSO/OIDC return handler (transient) | ACT-AUTH-12 | — | API-identity-sso-callback | error → back to login with reason | R7 · polite status "Signing you in…" |

## 2. MOD-CAND — candidate workspace `/me/*` (19)

| ID | Route | Roles | Purpose | Primary ACT | Secondary ACT | Data (API) | States beyond Std | Responsive · A11y notes |
|---|---|---|---|---|---|---|---|---|
| SCR-CAND-01 | `/me` | CAND (INST) | Role-adaptive home: next step, evidence strength summary, applications, recommended jobs, pending verifications, consent requests | ACT-EVD-01 | ACT-JOB-01, ACT-PRV-01 | API-careerintel-get-next-steps, API-evidence-list, API-applications-list, API-matching-list-recommendations, API-privacy-list-requests | per-widget L/E/X; O-c | R5 · A7; no single "trust score" |
| SCR-CAND-02 | `/me/onboarding[/:step]` | CAND | Short guided setup: goal, skills, optional résumé import, visibility defaults, first evidence | ACT-ONB-06 | ACT-ONB-01, ACT-ONB-02, ACT-ONB-03, ACT-ONB-04, ACT-ONB-05 | API-profile-update, API-skills-search, API-ai-parse-resume, API-privacy-set-defaults | resume at last step; every step skippable; import progress indeterminate; O-q for text steps only | R8/R2 · A3; full spec UI-03 §2 |
| SCR-CAND-03 | `/me/profile` | CAND, INST | Edit profile (headline, summary, location, links, skills, languages) | ACT-PRO-01 | ACT-PRO-02, ACT-PRO-03, ACT-PRO-05, ACT-PRO-12, ACT-PRO-13 | API-profile-get, API-profile-update, API-skills-search | pending-sync on fields; conflict dialog; O-q | R2 · A2; full spec UI-03 §5 |
| SCR-CAND-04 | `/me/profile/visibility` | CAND | Control what is public/discoverable/shared; preview as public/recruiter | ACT-PRO-04 | ACT-PRO-03, ACT-PRO-13, ACT-PRV-01 | API-profile-get-visibility, API-profile-update-visibility, API-privacy-list-consents | unpublished default; O-x | R3 · A2; preview region labelled "Preview" |
| SCR-CAND-05 | `/me/portfolio` | CAND | Showcase of projects linked to evidence | ACT-PRO-07 | ACT-PRO-08 | API-profile-list-portfolio | E "Add a project"; O-c | R1 grid · A1, reorder non-drag |
| SCR-CAND-06 | `/me/portfolio/:itemId` | CAND | Edit portfolio item, attach evidence | ACT-PRO-07 | ACT-EVD-10, ACT-EVD-02 | API-profile-get-portfolio-item, API-profile-update-portfolio-item | scanning artifacts; O-q (text) | R2 · A2 |
| SCR-CAND-07 | `/me/evidence` | CAND, INST | Evidence library with rung filter, status, skill filter | ACT-EVD-01 | ACT-EVD-06, ACT-EVD-10 | API-evidence-list, API-skills-list | E "Add first item" + explainer; filters; O-c | R1 · A1; rung filter as checkbox group |
| SCR-CAND-08 | `/me/evidence/new` | CAND, INST | Create evidence item: type, claim, skills, artifacts, optional attestation request | ACT-EVD-01 | ACT-EVD-02, ACT-EVD-03, ACT-EVD-04, ACT-EVD-08, ACT-EVD-09, ACT-PRO-12 | API-evidence-create, API-evidence-upload-init, API-skills-search | upload/scan states; local unsent draft; O-x submit; AI-suggestion panel | R8/R2 · A2/A3; full spec UI-03 §3 |
| SCR-CAND-09 | `/me/evidence/:evidenceId` | CAND own; REC/HM/FAC (consented, via other routes) | Evidence detail: claim, rung, provenance, artifacts, attestations, history, who can see | ACT-EVD-04 | ACT-EVD-05, ACT-EVD-06, ACT-EVD-07, ACT-EVD-11, ACT-EVD-12 | API-evidence-get, API-evidence-list-history, API-verification-list-for-evidence, API-privacy-list-grants-for-evidence | revoked/expired/under-review modifiers; scanning; O-c | R3 · A12 for history; full spec UI-03 §4 |
| SCR-CAND-10 | `/me/work-history` | CAND | Work history entries (claims) with verification status per entry | ACT-PRO-09 | ACT-VER-01 | API-profile-list-work-history | E "Add a role"; O-q for edits | R1 · A1 |
| SCR-CAND-11 | `/me/work-history/:claimId` | CAND | One role: details, evidence, reference/verification requests and their states | ACT-VER-02 | ACT-VER-03, ACT-VER-04, ACT-VER-05, ACT-VER-06, ACT-VER-08 | API-verification-get-claim, API-verification-list-requests | request states: requested, opened, submitted, declined, expired (BR-T004 14 d, max 2 reminders) | R3 · A1; timeline `ol` |
| SCR-CAND-12 | `/me/work-history/:claimId/references/new` | CAND | Compose reference request to a named referee | ACT-VER-02 | — | API-verification-create-reference-request | referee email validation; duplicate request; rate cap | Dialog route · A6, A2 |
| SCR-CAND-13 | `/me/verifications` | CAND | Inbox of all verification requests/disputes and their statuses | ACT-VER-03 | ACT-VER-07, ACT-VER-04 | API-verification-list-mine | E "Nothing pending" | R1 · A1 |
| SCR-CAND-14 | `/me/skills` | CAND | Skill map: each skill with confidence derived from evidence, gaps | ACT-PRO-05 | ACT-PRO-06, ACT-EVD-10 | API-skills-list-mine, API-matching-get-skill-confidence | confidence recalculating (BR-T005); uncertainty text | R5 + table alt · A12 |
| SCR-CAND-15 | `/me/resumes` | CAND | Résumé variants list (free tier limit shown) | ACT-PRO-10 | ACT-PRO-11 | API-profile-list-resumes, API-billing-get-entitlements | limit reached → plan explainer (no dark pattern) | R1 · A1 |
| SCR-CAND-16 | `/me/resumes/:resumeId` | CAND | Edit/preview résumé variant generated from profile + chosen evidence | ACT-PRO-11 | ACT-PRO-12 | API-profile-get-resume, API-profile-update-resume, API-ai-suggest | AI suggestions labelled; export progress indeterminate | R3 · A2 |
| SCR-CAND-17 | `/me/career` | CAND | Career readiness summary and recommended next learning/evidence | ACT-LRN-01 | ACT-EVD-01 | API-careerintel-get-readiness | "Not enough data" state; explanation of inputs | R5 · A12 |
| SCR-CAND-18 | `/me/career/transitions` | CAND | Explore role transitions with required skills and own gaps | ACT-JOB-01 | ACT-LRN-10 | API-careerintel-list-transitions | uncertainty ranges; table alternative | R5 · A12 |
| SCR-CAND-19 | `/me/career/salary` | CAND | Salary ranges by role/location with sample size and source caveats | — | ACT-JOB-01 | API-careerintel-get-salary | insufficient sample → hidden; premium gating per plan (core stays free) | R5 · A12 |

## 3. MOD-LRN — learning, assessment, instructor studio `/learn/*` (18)

| ID | Route | Roles | Purpose | Primary ACT | Secondary ACT | Data (API) | States beyond Std | Responsive · A11y notes |
|---|---|---|---|---|---|---|---|---|
| SCR-LRN-01 | `/learn` | CAND, INST | Learning home: continue, recommended, paths, upcoming assessments | ACT-LRN-02 | ACT-LRN-01 | API-learning-get-home | per-widget states | R5 · A7 |
| SCR-LRN-02 | `/learn/courses` | ANON, all | Course catalogue with search and filters | ACT-LRN-01 | ACT-JOB-01 | API-learning-list-courses, API-search-courses | filtered-empty; price shown incl. currency | R1 · A1 |
| SCR-LRN-03 | `/learn/courses/:courseId` | ANON, all | Course detail: syllabus, outcomes, instructor, evidence earned on completion, price, reviews | ACT-LRN-01 | ACT-LRN-07, ACT-LRN-09, ACT-LRN-11 | API-learning-get-course | purchase required; enrolled; unpublished (404) | R7 · A1 syllabus as nested list |
| SCR-LRN-04 | `/learn/courses/:courseId/lessons/:lessonId` | CAND (enrolled) | Course player: video/text/quiz lesson with transcript and notes | ACT-LRN-05 | ACT-LRN-02, ACT-LRN-03, ACT-LRN-04 | API-learning-get-lesson, API-learning-record-progress | caption/transcript missing → lesson blocked from publish; resume point; offline O-n (video) with text O-c | R6 · A5; full spec UI-03 §12 |
| SCR-LRN-05 | `/learn/my` | CAND | My courses, paths, certificates/evidence earned | ACT-LRN-02 | ACT-LRN-06, ACT-LRN-08 | API-learning-list-enrollments | E "Find a course" | R1 · A1 |
| SCR-LRN-06 | `/learn/paths/:pathId` | CAND | Learning path steps, prerequisites, evidence targets | ACT-LRN-10 | ACT-LRN-01 | API-learning-get-path | locked steps with reason | R7 · A1 |
| SCR-LRN-07 | `/learn/assessments` | CAND | Available/upcoming/completed assessments | ACT-ASM-01 | ACT-ASM-07 | API-assessment-list | E; vendor-gated proctoring tag | R1 · A1 |
| SCR-LRN-08 | `/learn/assessments/:id` | CAND | Assessment intro: rules, duration, AI policy (`AI_PROHIBITED`), integrity monitoring, accommodations | ACT-ASM-01 | ACT-ASM-09 | API-assessment-get | unmet prerequisite; accommodation pending; code-runner unavailable → "results stay unverified" notice (ADR-T13) | R7 · A8; policy in plain language |
| SCR-LRN-09 | `/learn/assessments/:id/attempts/:attemptId` | CAND | Assessment runner: questions, timer, autosave, flag, submit | ACT-ASM-05 | ACT-ASM-02, ACT-ASM-03, ACT-ASM-04, ACT-ASM-06 | API-assessment-get-attempt, API-assessment-save-answer, API-assessment-submit-attempt | connection loss (autosave queue limited, server timer authoritative), time expired auto-submit, runner unavailable; O-x for submit | R6 · A8; full spec UI-03 §13 |
| SCR-LRN-10 | `/learn/assessments/:id/attempts/:attemptId/result` | CAND own | Result with breakdown, evidence outcome, next steps | ACT-ASM-10 | ACT-ASM-08, ACT-LRN-01 | API-assessment-get-result | `unverified` (runner pending), review requested, passed with evidence offered | R7 · A12 |
| SCR-LRN-11 | `/learn/assessments/:id/attempts/:attemptId/review` | CAND own; MOD (via ADM) | Integrity review notice and appeal ("Review requested") | ACT-ASM-08 | ACT-PRV-08 | API-assessment-get-review, API-assessment-create-appeal | anomaly≠guilt copy; decision pending/decided | R2 · A2 |
| SCR-LRN-12 | `/learn/challenges` | CAND | Practice/contest challenges (same assessment engine) | ACT-ASM-01 | — | API-assessment-list-challenges | leaderboard optional [OPEN] | R1 · A1 |
| SCR-LRN-13 | `/learn/studio` | INST, INSTADM | Studio home: courses, drafts, learner attention items | ACT-STU-01 | ACT-STU-06 | API-learning-list-authored | E "Create your first course" | R5 · A7 |
| SCR-LRN-14 | `/learn/studio/courses/:courseId` | INST own, INSTADM O | Course authoring: outline, pricing, evidence mapping, publish checklist | ACT-STU-04 | ACT-STU-01, ACT-STU-05 | API-learning-get-authored-course, API-learning-update-course | publish checklist failing (captions, evidence mapping); conflict dialog | R3 · A2 |
| SCR-LRN-15 | `/learn/studio/courses/:courseId/lessons/:lessonId` | INST own | Lesson editor with media upload and captions | ACT-STU-02 | ACT-STU-03 | API-learning-get-lesson-draft, API-learning-update-lesson, API-platform-upload-init | upload + scan; caption required; O-q none | R2 · A2, A5 |
| SCR-LRN-16 | `/learn/studio/assessments/:id` | INST own, INSTADM O | Assessment authoring (questions, rubric, AI policy, runner type) | ACT-STU-06 | — | API-assessment-get-authored, API-assessment-update | AI policy locked after first attempt; runner-unavailable warning | R3 · A2 |
| SCR-LRN-17 | `/learn/studio/courses/:courseId/learners` | INST own | Learner roster, progress, outcomes; attest outcomes (issue evidence) | ACT-STU-07 | ACT-STU-08 | API-learning-list-learners, API-evidence-issue-course-evidence | consent-limited fields; bulk attest via op status | R1 · A1 |
| SCR-LRN-18 | `/learn/studio/earnings` | INST | Earnings, payouts (revenue share) [OPEN-06] | — | — | API-billing-get-instructor-earnings | feature hidden until OPEN-06 resolved | R1 · A1 |

## 4. MOD-OPP — jobs and applications `/jobs/*`, `/applications/*` (10)

| ID | Route | Roles | Purpose | Primary ACT | Secondary ACT | Data (API) | States beyond Std | Responsive · A11y notes |
|---|---|---|---|---|---|---|---|---|
| SCR-OPP-01 | `/jobs` | ANON, CAND, all | Job search with filters, sort, saved search | ACT-JOB-01 | ACT-JOB-02, ACT-JOB-03, ACT-JOB-04, ACT-JOB-07, ACT-JOB-08 | API-search-jobs, API-matching-explain-summary | filtered-empty (clear filters/save search), anon (no match info), offline O-c last results; cursor pagination | R1+filter drawer · A1; full spec UI-03 §6 |
| SCR-OPP-02 | `/jobs/:jobId` | ANON, all | Job detail + "Why this matched" explanation (strengths, gaps, uncertainty) | ACT-APP-01 | ACT-JOB-05, ACT-JOB-06, ACT-JOB-07, ACT-JOB-09, ACT-JOB-11 | API-jobs-get, API-matching-explain, API-applications-get-mine-for-job | closed/paused job; already applied (BR-T001) → "View application"; match unavailable (insufficient info) | R7 split · A12; full spec UI-03 §7 |
| SCR-OPP-03 | `/jobs/saved` | CAND | Saved jobs and saved searches | ACT-JOB-01 | ACT-JOB-07, ACT-JOB-10 | API-jobs-list-saved, API-search-list-saved-searches | E; closed jobs marked | R1 · A1 |
| SCR-OPP-04 | `/jobs/alerts` | CAND | Manage job alerts (frequency, channel) | ACT-JOB-04 | ACT-JOB-10, ACT-NTF-03 | API-notify-list-alerts | push requires installed PWA explainer | R2 · A2 |
| SCR-OPP-05 | `/jobs/companies/:slug` | ANON, all | Company page: about, open roles, employer-branding accent (contrast-checked) | ACT-JOB-11 | ACT-JOB-01 | API-orgs-get-public, API-jobs-list-by-org | unverified-org notice (what this means) | R7 · A1 |
| SCR-OPP-06 | `/applications/new/:jobId` | CAND | Application form: résumé variant, evidence to attach, screening questions, consent for evidence sharing, review & submit | ACT-APP-03 | ACT-APP-02, ACT-APP-09, ACT-APP-10, ACT-PRV-01 | API-applications-create-draft, API-applications-submit, API-jobs-get, API-privacy-list-consents | draft restored; job closed meanwhile; duplicate (BR-T001); O-q draft, O-x submit | R6/R2 · A2/A3; full spec UI-03 §8 |
| SCR-OPP-07 | `/applications` | CAND | My applications with status, next step, deadlines | ACT-APP-04 | ACT-JOB-01 | API-applications-list-mine | filters by status; O-c | R1 · A1 |
| SCR-OPP-08 | `/applications/:applicationId` | CAND own | Application detail: timeline, stage (human-set), messages, what was shared | ACT-APP-04 | ACT-MSG-01, ACT-PRV-08 | API-applications-get, API-applications-list-events | stage "Not moving forward" with reason category; withdrawn terminal | R3 · A1 timeline |
| SCR-OPP-09 | `/applications/:applicationId/interview` | CAND own | Choose or propose interview slot, join info, prep notes | ACT-APP-05 | ACT-APP-06 | API-applications-list-slots, API-applications-select-slot | slot taken (conflict), time-zone clarity, cancelled | R7 · A1 slot list + grid |
| SCR-OPP-10 | `/applications/:applicationId/offer` | CAND own | Review and accept/decline offer; deadline | ACT-APP-07 | ACT-APP-08, ACT-MSG-01 | API-applications-get-offer, API-applications-respond-offer | expired, withdrawn by employer; step-up before accept | R7 · A2 |

## 5. MOD-HIR — hiring workspace `/hiring/*` (20)

| ID | Route | Roles | Purpose | Primary ACT | Secondary ACT | Data (API) | States beyond Std | Responsive · A11y notes |
|---|---|---|---|---|---|---|---|---|
| SCR-HIR-01 | `/hiring` | REC, HM, ORGADM, viewer | Role-adaptive hiring home (decisions needed, jobs, interviews) | ACT-HIRE-01 | ACT-PIPE-15 | API-applications-get-hiring-home, API-analytics-get-org-summary | per-widget states | R5 · A7 |
| SCR-HIR-02 | `/hiring/jobs` | REC, HM (assigned), ORGADM | Jobs list with status and pipeline counts | ACT-HIRE-01 | ACT-HIRE-04, ACT-HIRE-05, ACT-HIRE-06, ACT-HIRE-09 | API-jobs-list-org | E; filters; bulk close via op | R1 · A1 |
| SCR-HIR-03 | `/hiring/jobs/:jobId/edit` | REC, ORGADM | Job editor: description, requirements as skills, screening questions, visibility, review before publish | ACT-HIRE-03 | ACT-HIRE-02, ACT-HIRE-07, ACT-HIRE-08, ACT-HIRE-10 | API-jobs-get, API-jobs-update, API-skills-search | validation incl. discriminatory-language lint warning (advisory, human decides); 412 conflict; flagged for moderation | R2 · A2; ranking-input allowlist note: payment never affects ranking |
| SCR-HIR-04 | `/hiring/templates` | REC, ORGADM | Job templates library | ACT-HIRE-07 | ACT-HIRE-10 | API-jobs-list-templates | E | R1 · A1 |
| SCR-HIR-05 | `/hiring/jobs/:jobId/pipeline` | REC, HM (assigned), ORGADM (O) | Pipeline board/list by stage with filters and bulk selection | ACT-PIPE-02 | ACT-PIPE-01, ACT-PIPE-03, ACT-PIPE-04, ACT-PIPE-05, ACT-PIPE-06, ACT-PIPE-13, ACT-PIPE-17 | API-applications-list-by-job, API-applications-move-stage | stale stage conflict, per-column load more, consent-hidden evidence, live updates throttled | R4 · A4; full spec UI-03 §9 |
| SCR-HIR-06 | `/hiring/jobs/:jobId/applications/:applicationId` | REC, HM (assigned), ORGADM | Candidate review: application, evidence by rung (consented), match explanation, notes, scorecards, timeline | ACT-PIPE-02 | ACT-PIPE-08, ACT-PIPE-09, ACT-PIPE-14, ACT-PIPE-16, ACT-PIPE-07 | API-applications-get, API-evidence-list-consented, API-matching-explain, API-applications-list-notes | evidence hidden by consent (request access), withdrawn application, decision lock | R3 · A12; full spec UI-03 §10 |
| SCR-HIR-07 | `/hiring/search` | REC, ORGADM | Verified-candidate search with filters (skills, rung, location) and explained results | ACT-PIPE-15 | ACT-PIPE-13, ACT-MSG-06 | API-search-candidates, API-matching-explain | only candidates opted-in as discoverable; quota; explanation + uncertainty; no payment ranking | R3 · A1 |
| SCR-HIR-08 | `/hiring/shortlists` | REC, HM | Shortlists / talent pools | ACT-PIPE-13 | ACT-MSG-06 | API-applications-list-shortlists | consent expiry flags | R1 · A1 |
| SCR-HIR-09 | `/hiring/interviews` | REC, HM, ORGADM | Interview calendar and scheduling | ACT-PIPE-07 | ACT-PIPE-09 | API-applications-list-interviews | time zones; conflicts | R1/R3 · A1, grid + list |
| SCR-HIR-10 | `/hiring/interviews/:interviewId/scorecard` | REC, HM (panel) | Structured scorecard (criteria tied to job skills) | ACT-PIPE-09 | — | API-applications-get-scorecard, API-applications-submit-scorecard | blind-until-submitted option; submitted immutable | R2 · A2 |
| SCR-HIR-11 | `/hiring/jobs/:jobId/applications/:applicationId/offer` | REC, ORGADM | Compose and send offer (human-confirmed) | ACT-PIPE-11 | ACT-PIPE-10, ACT-PIPE-12 | API-applications-create-offer, API-applications-send-offer | approval chain [OPEN]; expired/withdrawn | R2 · A2; review step 3.3.4 |
| SCR-HIR-12 | `/hiring/jobs/:jobId/bulk/:opId` | initiator, REC, ORGADM | Bulk operation status with per-item results | ACT-PIPE-19 | ACT-PIPE-18 | API-platform-get-operation, API-platform-list-operation-items | running/partial/done/cancelled | R9 · A1 live region cadence |
| SCR-HIR-13 | `/hiring/outreach` | REC, ORGADM | Outreach messages/sequences with quota and consent status | ACT-MSG-06 | ACT-PIPE-04 | API-messaging-list-outreach, API-messaging-get-quota | quota exhausted; candidate not contactable | R1 · A2 |
| SCR-HIR-14 | `/hiring/jobs/:jobId/compare` | REC, HM | Side-by-side candidate comparison on job criteria (no total score) | ACT-PIPE-17 | ACT-PIPE-08 | API-applications-compare, API-matching-explain | max 4 candidates; consent-hidden columns | R1 stacked · A1 table with row headers |
| SCR-HIR-15 | `/hiring/org/members` | ORGADM | Members, roles, invitations, seats | ACT-ORG-01 | ACT-ORG-02, ACT-ORG-03, ACT-ORG-05, ACT-ORG-07 | API-orgs-list-members, API-orgs-update-member | last owner protection; pending invites; seat limit | R9 · A1 |
| SCR-HIR-16 | `/hiring/org/settings` | ORGADM | Org profile, branding, SSO, data retention | ACT-ORG-04 | ACT-ORG-08 | API-orgs-get, API-orgs-update, API-identity-sso-config | SSO test connection; branding contrast check | R2 · A2 |
| SCR-HIR-17 | `/hiring/org/audit` | ORGADM, AUD | Org-scoped audit log | ACT-ORG-06 | — | API-admin-list-audit-org | large result sets paged; export job | R9 · A1 |
| SCR-HIR-18 | `/hiring/analytics` | REC (own), ORGADM, viewer | Hiring funnel, time-to-shortlist; adverse-impact indicators where available [OPEN] | ACT-PIPE-18 | — | API-analytics-get-hiring | insufficient data; definitions linked | R5 · A12 |
| SCR-HIR-19 | `/hiring/org/data-rights` | ORGADM | Handle employees' data-rights requests (matrix: A (O employees)) | ACT-ORG-09 | — | API-privacy-list-org-requests, API-privacy-update-request | SLA clock; legal-hold flag [OPEN-08] | R9 · A1 |
| SCR-HIR-20 | `/hiring/onboarding` | REC, ORGADM (new) | First-run: org details, invite team, first job, ranking-fairness explainer | ACT-HIRE-01 | ACT-ORG-01 | API-orgs-create, API-orgs-invite | skippable steps | R8 · A3 |

## 6. MOD-MSG — messages, notifications, network (7)

| ID | Route | Roles | Purpose | Primary ACT | Secondary ACT | Data (API) | States beyond Std | Responsive · A11y notes |
|---|---|---|---|---|---|---|---|---|
| SCR-MSG-01 | `/messages` | CAND, REC, HM, FAC, INST | Inbox with filters (unread, applications, outreach) | ACT-MSG-01 | ACT-MSG-02, ACT-MSG-03, ACT-MSG-04 | API-messaging-list-threads | E; muted; O-c | R3 · A1, A11 |
| SCR-MSG-02 | `/messages/:threadId` | participants only; ORGADM metadata | Conversation thread with application context | ACT-MSG-01 | ACT-MSG-05, ACT-MSG-07 | API-messaging-get-thread, API-messaging-send | queued "Not sent yet"; blocked/consent withdrawn; moderated message | R3 · A11 |
| SCR-MSG-03 | `/messages/new` | CAND (consented), REC, FAC | Start a conversation (recipient picker respecting consent/quotas) | ACT-MSG-01 | ACT-MSG-06 | API-messaging-create-thread, API-messaging-get-quota | recipient not contactable; quota | R2 · A2 |
| SCR-MSG-04 | `/notifications` | all authed | Notification center with filters and actions | ACT-NTF-02 | ACT-NTF-01, ACT-NTF-03 | API-notify-list | E; O-c | R1 · A1, A11 |
| SCR-MSG-05 | `/network` | CAND [phase 3, flag] | Network home (deferred per DOM-00) | ACT-NET-01 | — | API-network-get-home | feature off → hidden route (404) | R5 · A7 |
| SCR-MSG-06 | `/network/connections` | CAND [flag] | Connections and requests | ACT-NET-02 | ACT-NET-01 | API-network-list-connections | E | R1 · A1 |
| SCR-MSG-07 | `/network/mentors` | CAND, MENTOR [flag, OPEN-UX-17] | Find/offer mentoring | ACT-NET-03 | — | API-network-list-mentors | permissions undefined → blocked until OPEN-UX-17 | R1 · A1 |

## 7. MOD-ACC — settings, billing, privacy `/settings/*`, `/billing/*`, `/privacy/*` (15)

| ID | Route | Roles | Purpose | Primary ACT | Secondary ACT | Data (API) | States beyond Std | Responsive · A11y notes |
|---|---|---|---|---|---|---|---|---|
| SCR-ACC-01 | `/settings` | all authed | Settings hub | — | ACT-ACC-06 | API-identity-get-account | — | R7 · A1 |
| SCR-ACC-02 | `/settings/security` | all authed | Password, passkeys, email change, step-up | ACT-ACC-02 | ACT-AUTH-11, ACT-ACC-01, ACT-ACC-03 | API-identity-get-security, API-identity-change-password | step-up required for changes | R2 · A2 |
| SCR-ACC-03 | `/settings/security/sessions` | all authed | Active sessions/devices, revoke | ACT-ACC-04 | ACT-ACC-05 | API-identity-list-sessions, API-identity-revoke-session | current session marked; O-x | R1 · A1 |
| SCR-ACC-04 | `/settings/notifications` | all authed | Per-category, per-channel preferences, quiet hours, push | ACT-NTF-03 | ACT-NTF-04, ACT-NTF-05 | API-notify-get-preferences, API-notify-update-preferences | push unsupported/not installed (iOS) explained; O-q? no → O-x | R2 · A2; switches with text state |
| SCR-ACC-05 | `/settings/display` | all (incl. anon device-local) | Language, theme, contrast, motion, density, keyboard shortcuts | ACT-ACC-06 | ACT-SYS-09 | API-identity-update-preferences | device-local fallback | R2 · A2 |
| SCR-ACC-06 | `/settings/app` | all authed | Install app, offline data on device, clear cache, storage used | ACT-ACC-08 | ACT-ACC-07 | (local) API-notify-register-push | iOS instructions; storage estimate API-unavailable → text | R2 · A2 |
| SCR-ACC-07 | `/billing` | CAND (own), ORGADM, INSTADM, INST | Plan, usage, entitlements, payment status | ACT-BIL-01 | ACT-BIL-03, ACT-BIL-04, ACT-BIL-05 | API-billing-get-subscription, API-billing-get-entitlements | billing disabled mode (no plans); past-due; webhook-pending | R5 · A7 |
| SCR-ACC-08 | `/billing/plans` | CAND, ORGADM, INSTADM | Compare plans; "core evidence, applying and messaging always free" statement | ACT-BIL-01 | — | API-billing-list-plans | currency/region; no dark patterns | R1 cards · A1 |
| SCR-ACC-09 | `/privacy/consents` | CAND, INST (own) | Consent manager: purposes, recipients, scopes, versions, revoke, requests | ACT-PRV-01 | ACT-PRV-02, ACT-PRV-03, ACT-PRV-09 | API-privacy-list-consents, API-privacy-grant, API-privacy-revoke | pending request from org; version change re-consent; O-x | R3 · A2; full spec UI-03 §14 |
| SCR-ACC-10 | `/privacy/access-log` | CAND own, ORGADM (O) | Who accessed my data and why (incl. support grants, recruiter views) | ACT-PRV-03 | ACT-PRV-08 | API-privacy-list-access-log | E "Nobody has viewed"; support grant highlighted | R1 · A1 |
| SCR-ACC-11 | `/privacy/data` | CAND, INST | Data export, pause, erasure (BR-T060), status of requests | ACT-PRV-04 | ACT-PRV-05, ACT-PRV-06, ACT-PRV-07 | API-privacy-create-export, API-privacy-create-erasure, API-privacy-list-requests | export building (indeterminate), expired link, erasure in grace window, retained-records notice [OPEN-08] | R2 · A2; typed confirmation |
| SCR-ACC-12 | `/billing/invoices` | ORGADM, CAND, INSTADM | Invoices and Stripe portal link | ACT-BIL-06 | ACT-BIL-03 | API-billing-list-invoices | E | R9 · A1 |
| SCR-ACC-13 | `/billing/return` | purchaser | Post-checkout confirmation: "confirming payment…" until webhook state | ACT-BIL-02 | — | API-billing-get-checkout-status | pending beyond 60 s; failed/cancelled; **redirect success grants nothing** (INV-T17) | R7 · A11 polite status |
| SCR-ACC-14 | `/settings/integrations` | CAND, ORGADM | Connected accounts and imports (calendar, résumé import); adapters only | ACT-ACC-09 | — | API-integrations-list, API-integrations-connect | conditional DOM-23; consent screen per provider | R1 · A1 |
| SCR-ACC-15 | `/settings/account` | CAND, all | Pause, reactivate, delete account entry; displays status | ACT-ACC-10 | ACT-ACC-11, ACT-PRV-06 | API-identity-get-account-status, API-identity-pause | paused, pending-erasure, reactivation window | R2 · A2 |

## 8. MOD-ADM — platform admin and institution workspace `/admin/*`, `/institution/*` (22)

| ID | Route | Roles | Purpose | Primary ACT | Secondary ACT | Data (API) | States beyond Std | Responsive · A11y notes |
|---|---|---|---|---|---|---|---|---|
| SCR-ADM-01 | `/admin` | MOD, SUP, ADM, AUD | Role-adaptive platform home | ACT-SUP-08 | ACT-MOD-01 | API-admin-get-home | per-widget | R5 · A7, A10 |
| SCR-ADM-02 | `/admin/support` | SUP, ADM; AUD read | Support access console: active grants, request access, case list | ACT-SUP-01 | ACT-SUP-02, ACT-SUP-08 | API-admin-list-grants, API-admin-list-cases | grant expiring; no active grant; O-n | R9 · A10; full spec UI-03 §15 |
| SCR-ADM-03 | `/admin/support/grants/new` | SUP, ADM | Request time-boxed, reason-coded access (≤ 4 h, BR-T041) | ACT-SUP-01 | — | API-admin-create-grant | reason required; duration cap; approval policy [OPEN-UX-23] | R2 · A2, A10 |
| SCR-ADM-04 | `/admin/support/sessions/:grantId` | SUP, ADM (grant holder) | Scoped masked read view of a user's data during an active grant | ACT-SUP-03 | ACT-SUP-04, ACT-SUP-05, ACT-SUP-06, ACT-SUP-07, ACT-SUP-02 | API-admin-get-user-view, API-admin-unmask-field | grant expired mid-view → read blocked, notes retained; read-only (no impersonation) | R9 · A10; persistent banner |
| SCR-ADM-05 | `/admin/moderation` | MOD, ADM; SUP/AUD read | Moderation queue by severity/age | ACT-MOD-01 | — | API-safety-list-cases | E; SLA breach flag | R9 · A1 |
| SCR-ADM-06 | `/admin/moderation/cases/:caseId` | MOD, ADM | Case view: reported content, context, history, decision with reason | ACT-MOD-02 | ACT-MOD-03, ACT-MOD-04, ACT-MOD-07 | API-safety-get-case, API-safety-decide | decision recorded immutable; appeal state; content hidden by default (blur) | R3 · A10 |
| SCR-ADM-07 | `/admin/integrity` | MOD, ADM | Integrity reviews (anomaly≠guilt) | ACT-MOD-05 | ACT-MOD-04 | API-assessment-list-integrity-reviews, API-assessment-resolve-review | appeals due | R9 · A1 |
| SCR-ADM-08 | `/admin/verification-disputes` | MOD, ADM | Verification disputes (matrix: MOD A) | ACT-MOD-06 | ACT-MOD-04 | API-verification-list-disputes, API-verification-resolve-dispute | two-sided evidence view | R3 · A1 |
| SCR-ADM-09 | `/admin/flags` | ADM; AUD read | Feature flags and kill-switches with change history | ACT-ADM-01 | ACT-ADM-09 | API-platform-list-flags, API-platform-update-flag | confirm for production-impacting; audit | R9 · A10 |
| SCR-ADM-10 | `/admin/audit` | ADM, AUD; SUP scoped | Audit explorer (who/what/when/why) with filters and export | ACT-ADM-08 | — | API-admin-list-audit | large paged; export job | R9 · A1 |
| SCR-ADM-11 | `/admin/data-rights` | ADM; SUP assist; AUD read | Data-rights queue (export/erasure) with SLA | ACT-SUP-06 | — | API-privacy-list-all-requests, API-privacy-update-request | SLA 30 d (BR-T060); legal-hold [OPEN-08] | R9 · A1 |
| SCR-ADM-12 | `/admin/directory` | SUP (minimal fields), ADM | Find a user/org (min fields; opening data requires grant) | ACT-SUP-08 | ACT-SUP-01 | API-admin-search-directory | results masked; rate-limited | R9 · A1 |
| SCR-ADM-13 | `/admin/skills` | ADM | Skills taxonomy curation (merge/split) | ACT-ADM-04 | — | API-skills-list-admin, API-skills-merge | merge impact preview; `skill.merged` event | R9 · A1 |
| SCR-ADM-14 | `/admin/content` | MOD, ADM | Course/job content review and takedown | ACT-MOD-03 | ACT-MOD-04 | API-safety-list-content, API-learning-takedown | takedown notice templates | R9 · A1 |
| SCR-ADM-15 | `/admin/platform` | ADM; AUD read | Remote registry: versions, compat status, last-known-good, rollback | ACT-ADM-02 | ACT-ADM-03 | API-platform-list-remotes, API-platform-rollback-remote | incompatible version warnings | R9 · A10 |
| SCR-ADM-16 | `/admin/access-reviews` | ADM; AUD read | Privileged-role access reviews (monthly; 60-day dormancy expiry) | ACT-ADM-07 | ACT-ADM-05, ACT-ADM-06 | API-admin-list-privileged-grants, API-admin-attest-review | overdue; expiring | R9 · A1 |
| SCR-ADM-17 | `/institution` | INSTADM, FAC, proctor | Institution home: aggregate activation, coverage, credentials | ACT-INS-01 | ACT-INS-05 | API-institutions-get-home | small-cell suppression; per-widget | R5 · A7 |
| SCR-ADM-18 | `/institution/cohorts` | INSTADM, FAC (own) | Cohorts list | ACT-INS-01 | ACT-INS-02 | API-institutions-list-cohorts | E | R1 · A1 |
| SCR-ADM-19 | `/institution/cohorts/:cohortId` | INSTADM, FAC | Cohort detail: members, skill coverage (aggregate), consented evidence, notice wording | ACT-INS-05 | ACT-INS-02, ACT-INS-03, ACT-INS-06, ACT-INS-08 | API-institutions-get-cohort, API-institutions-get-coverage | members who withheld consent shown as count only; small cells suppressed | R3 · A12 |
| SCR-ADM-20 | `/institution/credentials` | INSTADM | Issue/revoke institution credentials (authority-verified) | ACT-INS-03 | ACT-INS-04 | API-institutions-list-credentials, API-evidence-issue-credential | bulk via op status; revoke triggers BR-T005 recompute | R9 · A1 |
| SCR-ADM-21 | `/institution/members` | INSTADM | Faculty/proctor/staff management | ACT-INS-07 | ACT-ORG-02 | API-institutions-list-members | last admin protection | R9 · A1 |
| SCR-ADM-22 | `/institution/reports` | INSTADM, FAC (aggregates) | Outcomes reports and exports (aggregate only) | ACT-INS-06 | — | API-analytics-get-institution-report | export job indeterminate; suppression | R5 · A12 |

## 9. StatusBadge vocabulary (UI labels; underlying state names come from the state-machine docs, SM-*)

State names are those of SM-00 (`06_BUSINESS_PROCESSES/STATE_MACHINES.md`, FF-11); labels below are UI text only. The UI must render the server enum via a lookup table with one label per SM-00 state and show a neutral badge for unknown values [OPEN-UX-24 closed for the machines below; REVW-03].

| Context | UI label | Icon | Notes |
|---|---|---|---|
| Application (SM-APPLICATION) | `draft` Draft · `submitted` Submitted · `in_review` In review · `shortlisted` Shortlisted · `interviewing` Interview · `offer_extended` Offer · `hired` Hired · `rejected` Not moving forward · `withdrawn` Withdrawn · `offer_declined` Offer declined | doc, send, eye, star, calendar, gift, check-circle, minus-circle, undo, x-circle | "Not moving forward" always carries a human actor and reason category (INV-T09) |
| Job (SM-JOB) | `draft` Draft · `pending_review` Pending review · `scheduled` Scheduled · `published` Published · `paused` Paused · `closed` Closed · `taken_down` Taken down | | |
| Reference request (SM-REFERENCE) | `queued`/`sent` Requested · `opened` Opened · `submitted` Submitted (outcome `decline` shows Declined) · `expired` Expired · `cancelled` Cancelled · `bounced` Address problem | | BR-T004 |
| Evidence | rung + modifier (DESIGN_SYSTEM §7.8) | | |
| Assessment attempt (SM-ATTEMPT) | `created` Not started · `in_progress` In progress · `submitted` Submitted · `grading` Scoring · `passed`/`failed` Scored · `unverified` Unverified (runner pending) · `under_review` Review requested · `voided` Voided · `expired` Expired | | Reviewed = leaving `under_review` for `passed`/`failed`/`unverified` |
| Operation item | queued · running · succeeded · failed · skipped · needs-attention | | UI-07 §4 |
| Support grant | Requested · Active · Expiring · Ended · Expired | | |

## 10. Coverage summary

| Remote | Screens | Key specs in UI-03 |
|---|---|---|
| MOD-SHELL | 19 | login (SHELL-02), referee form (SHELL-09) |
| MOD-CAND | 19 | onboarding (02), profile (03), evidence create (08), evidence detail (09) |
| MOD-LRN | 18 | course player (04), assessment runner (09) |
| MOD-OPP | 10 | job search (01), job detail+match (02), application form (06) |
| MOD-HIR | 20 | pipeline board (05), candidate review (06) |
| MOD-MSG | 7 | — |
| MOD-ACC | 15 | consent manager (09) |
| MOD-ADM | 22 | support access console (02) |
| **Total** | **130** | **15** |

Dispositions against canonical docs: all 24 domains have at least one screen except DOM-04 (read by all; curation in SCR-ADM-13), DOM-17 (AI is embedded as labelled suggestion panels, no standalone screen — by design), DOM-21 (surfaces as analytics widgets/reports), DOM-23 (SCR-ACC-14), DOM-24 (SCR-ADM-09/15). Deferred per DOM-00: DOM-14 screens (MSG-05..07), video-interview recording, identity verification (OPEN-10), proctoring (vendor-gated). 

## 11. Open items

| ID | Item |
|---|---|
| OPEN-UX-22 | Reconcile placeholder `API-<module>-<verb>` names with the real API contract catalogue. |
| OPEN-UX-23 | Approval policy for support-access grants (single operator vs two-person); BR-T041 fixes only ≤ 4 h and reason. |
| OPEN-UX-24 | Final state names from the state-machine registry (SM-APPLICATION, SM-JOB, SM-EVIDENCE, SM-VERIFICATION). |




# Patch 2026-10-27: Responsive class matrix (primary screens)

**[TARGET].** Adds the missing responsive-class column for the primary screens without rewriting the section tables above. Classes: **compact** = `xs`/`sm` (under 768 px, bottom nav), **medium** = `md` (768 to 1023, icon rail), **expanded** = `lg`/`xl`/`2xl` (1024 px and up, sidebar, optional detail pane); breakpoints are DESIGN_SYSTEM sec 6. R-codes are the legend codes in section 0 (R1..R7). Behaviour at each class is a design requirement, not a measured result.

| Screen | Compact | Medium | Expanded | R-code |
|---|---|---|---|---|
| SCR-SHELL-02 `/login` | Single column, full-width fields, passkey button first | Centered card 480 px | Same card, optional side panel with no required content | R6 |
| SCR-CAND-02 onboarding | One step per screen, sticky ActionBar, progress text | Same, wider card | Same plus "Why we ask" side panel | R2 |
| SCR-CAND-03 `/me/profile` | Sections stacked, per-section edit | Two-column form | Form plus live preview pane (xl) | R2 |
| SCR-CAND-08 evidence create | Single column, sticky Save, file picker over drag-drop | Single column wide | Form left, rung/consent explainer right | R2 |
| SCR-CAND-09 evidence detail | Stacked; provenance panel collapsed by default | Stacked, panel expanded | Master-detail with ProvenancePanel in pane | R3 |
| SCR-OPP-01 `/jobs` | Card list, filters in full-screen sheet, "Load more" | Card list, filters in drawer | List plus persistent filter column; detail pane at xl | R1, R3 |
| SCR-OPP-02 job detail | Stacked, sticky Apply bar, match panel collapsed | Stacked, match panel expanded | Two-column, Apply in aside | R3 |
| SCR-OPP-06 application form | Stepper as "Step 2 of 5" text, sticky bar | Same | Stepper vertical left | R2 |
| SCR-HIR-05 pipeline | Column tabs or list default; move via menu | Horizontal columns scroll | Full board, drag plus menu | R4 |
| SCR-HIR-06 candidate review | Tabs for evidence, notes, scorecard, timeline | Two columns | Three regions with sticky decision bar | R3 |
| SCR-LRN-09 assessment runner | Focus layout, no nav, timer pinned top | Same | Question left, navigator right | R6 |
| SCR-ACC-08 plans | Stacked plan cards, comparison as accordion | Two-up | Comparison table | R5 |
| SCR-ACC-09 consent manager | List with detail pushed on tap | List plus drawer | Master-detail | R3 |

Rules for all rows: no information or action exists only in one class (the compact class must reach every action); touch targets 44 px or larger on compact and medium; layout survives 320 CSS px reflow and 200 % zoom; orientation never locked; container queries decide card layout inside panes.
