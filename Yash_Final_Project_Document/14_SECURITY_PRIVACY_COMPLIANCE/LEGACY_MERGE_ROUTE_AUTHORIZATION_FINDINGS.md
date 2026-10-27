# Legacy Merge B-14b: Route Authorization Review and Findings CF-31..CF-45 (Prior Attempt) with Target Requirements

Doc ID: LGM-B-14B · Owner: Security Architect · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: TRC-04 (`../28_TRACEABILITY_AND_COVERAGE/ROUTE_AUTHORIZATION_FINDING_CROSSWALK.md`), SEC-01, SEC-02, ADR-T07, INV-T01, INV-T02, OPEN-44, OPEN-48, OPEN-50 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/system-model/06-route-authorization.md` (13.8 KB; second coverage pass of the prior attempt) and the authorization-related rows of `03-conflict-register.md` (CF-10..CF-16, CF-20, CF-27, CF-30, CF-35).

## 0. Frame

- **Nothing here is a finding about this project.** The prior attempt's four read-only investigators reported (with `path:line` evidence from 2026-10-23) who could call each of about 170 routes. These are **lessons and negative-test seeds**: every row below says what the prior attempt got wrong or left undecided, so this blueprint's policy matrix (ADR-T07) and IDOR test suite can be checked against it. Status words in the verbatim block ("Reported", "Fixed", "Tested") describe the prior attempt only.
- TRC-04 already preserves CF-31..CF-45 row for row in a CSV with candidate target documents. This file adds (a) the **complete** route tables and fixed-defect table, (b) the target requirement for each finding, and (c) the cross-cutting patterns.
- Legend used by the legacy tables: Auth = anonymous (anon), signed in (any) or a role; Check = the role or ownership test; **P** = durable in PostgreSQL, **M** = memory only (lost on restart, response carried `x-talentsphere-durability: ephemeral`).

## 1. Cross-cutting patterns to design out

| Pattern seen in prior attempt | Target requirement |
|---|---|
| "Any organization membership" authorized job management, applicant moves, interview questions/scorecards, talent pools (six routes), employer metrics, job templates and referrals; the member's role was never read (CF-14, CF-45) | Organization-role RBAC with an explicit permission matrix (ADR-T07, OPEN-44). Every org-scoped route names the required role; test per route that a member with a lower role gets 403. |
| Route comments said "Admin / Recruiter" or "authorized recruiters" while the handler allowed any signed-in account (forecast generation, market signals, alumni group role) | Route registry lint (FF-01): the policy action must exist and the comment is generated from it, not hand-written. |
| A client-supplied flag trusted as fact (`isVerifiedEmployee`, `isVerifiedEnrollment`, `role: moderator`) | Never accept authority flags from the request body (INV-T01). Derive from server state (membership, enrollment). Contract schemas must not contain such fields; add a schema-lint that flags `is*Verified`-style request properties. |
| Anonymous reads of cross-organization aggregates with low cohort floors (feedback k, salary k 5 and company summary k 3, reputation, instructor reputation returning reviewer ids) | Public surface decided explicitly (OPEN-25 minimum cohort k); cohort counts **distinct people**, not rows (CF-02, CF-37); never expose reviewer identifiers in public lists. |
| Self-award routes (claim-activity with arbitrary reference type and amount) | Every XP/badge award is produced by a server-side event handler on a verified domain event, never by a client "claim" (BR-T for gamification; owner Product Director). |
| Privacy settings ignored by sibling routes (activity-score lookup ignoring `showActivity`; AI consent not checked on any AI route) | Settings are enforced in one policy layer (consent scope INV-T15), not per route; test each read route against each privacy setting. |
| Erasure execute with no grace-period check; maintenance mode that blocks nothing; resumes/connections/etc. offered in UI but memory-only | Behaviour must match what UI and policy promise; every setting/flag has a test that it changes behaviour. |
| Candidate-supplied identifiers not checked for ownership/existence (`resumeId` on referral create, moderation target, endorsement recipient) | Foreign ids in request bodies are validated against the caller's visible set (INV-T02); invalid -> `not-found`. |

## 2. Findings CF-31..CF-45: target requirement and decision owner

(Verbatim source rows are in section 4. "OPEN" ids reuse `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md`; new ids are local to this file.)

| ID | Prior attempt reported | Target requires | Decision needed / owner |
|---|---|---|---|
| CF-31 | Any account could award itself XP/badges via `claim-activity` | No client-claimed awards; awards from server events with idempotent natural key | Product: intended gamification model - OPEN-50 / **L-B14-10** |
| CF-32 | Challenge/course XP used a different cap rule than the per-reference idempotent cap (BR-25) and bypassed the gamification profile read by the leaderboard | One XP ledger with one idempotency rule per reference; leaderboard reads the ledger | Product Director |
| CF-33 | Erasure execute ignored the 30-day grace the UI promised | Grace enforced server-side; separate legal-hold-aware emergency path | OPEN-08 (period, emergency policy) |
| CF-34 | Any signed-in user could read any user's activity score, ignoring `showActivity` | Privacy-setting enforced centrally; scores private by default | Product/Privacy (**L-B14-11**: are scores ever public?) |
| CF-35 | AI consent setting unchecked on all AI routes; tier hard-coded free; assistant-query skipped quota and firewall | One AI gateway; consent + entitlement + quota on every call | OPEN-24, OPEN-19 |
| CF-36 | Anonymous cross-org aggregate reads (feedback insights suppressed under 10; salary benchmark k 5; company summary k 3; reputation; org reviews returned `reviewerId`; instructor reputation) | Explicit public-surface list; k floors from one config; no reviewer ids public | OPEN-25 |
| CF-37 | Salary cohorts fillable by one account; auto-verified unless outlier; self-reported; 5/day; company floor 3 = one person's pay at median of 3; BR-180 sets floor 3 so raising it overrides an approved rule (an attempt was reverted when its test failed) | Distinct-people cohort rule; reports from verified distinct accounts; floor chosen by product | Owner decision on BR-180 (OPEN-43/OPEN-25) |
| CF-38 | `isVerifiedEnrollment` still accepted from request body; instructor reviews unlimited per user; a server-side check was written and reverted because the API exposed no way to test it | Server-derived enrollment flag; one review per user per instructor/course; testable data source | Product + QA |
| CF-39 | Anyone could query warm-intro paths to anyone over the accepted-connection graph; connection requests had no rate limit/block check | Path discovery limited by consent and block list; rate-limited connection requests | Privacy decision (**L-B14-12**) |
| CF-40 | Endorsements ignored the "connected peer" rule and mixed profile/user ids so a specialization bonus never fired | Rule enforced; one id space (see database file) | Product (endorsement rules) |
| CF-41 | Revoking a certificate did not revoke linked evidence (still authority-verified and verifying publicly); completion evidence persisted while certificate/enrollment/XP did not | Revocation cascades through the evidence ladder (ADR-T14); certificate and evidence in one transaction | Product decision on revocation |
| CF-42 | Maintenance mode changed diagnostics only and reset on restart | Maintenance mode persisted, blocks writes (503 + Retry-After) with allow-list for admin/health | Platform/SRE |
| CF-43 | UI offered features whose state was memory-only (resumes, connections, warm intros, portfolio, AI conversations, activity, moderation reports/appeals, analytics, salaries, reputation, interviews, talent pools, alumni, referrals, job templates) | All persisted (ADR-T05); no UI for non-persisted features | none (resolved by ADR-T05) |
| CF-44 | Alumni verification trusted the unverified account email; stealth check read an unconfirmed field (`isStealthMode`); referral create passed `resumeId` without ownership check | Verification via institution-issued seat code or verified domain; stealth as a profile privacy field enforced in the policy layer; ownership checks on all foreign ids | Product + Security (verify each before change) |
| CF-45 | Any membership authorized interview questions/scorecards, talent pools (6 routes), employer metrics, job templates, referrals | Organization role RBAC | OPEN-44 |

Earlier-pass authorization conflicts from `03-conflict-register.md` kept visible here:

| ID | Prior attempt reported | Target requires | Decision owner |
|---|---|---|---|
| CF-12 | Any signed-in account could post a market signal that fed public forecasts (fixed: admin only) | Data inputs to public statistics only from authorized/verified sources | Product ("may a verified external source supply data?") |
| CF-14 | Anyone with any membership could manage jobs and move applicants; docs said "authorized recruiters" | Org-role RBAC | OPEN-44 |
| CF-15 | Job approval: SSOT describes admin approval and a `rejected_by_moderation` state; code let an org recruiter approve their own job, allowed draft->published, and had no moderation state | Decide whether approval is required; implement as a state machine (SM-JOB) with moderation state | **L-B14-13** Product Director |
| CF-16 | An org owner without the `recruiter` role passed the route check but was refused by the domain layer | One role check, one place; organization creator receives an org-level owner role with explicit permissions | OPEN-44 |
| CF-20 | `assertPlatformAdmin` accepted the string `admin`; hiring lists included `employer`; neither was in the Role union (dead branches) | Closed role enumeration; no stringly-typed role checks | none |
| CF-27 | Interview code evaluation simulated (pass/fail from the text of the code; fails closed only in staging/production); challenge submissions had a second placeholder | ADR-T13: sandbox runner or code assessments stay `unverified` and never mint verified evidence | OPEN-27 |
| CF-30 | Concurrent checkout sessions both payable; second subscription ignored but billed; disputes/voided invoices unhandled; webhook shares global rate limit | See `13_API_EVENTS_AND_INTEGRATIONS/LEGACY_MERGE_API_CONTRACTS.md` L-B13-02 | Finance/Legal/Backend |

## 3. Fixed defects of the prior attempt (negative-test seeds)

Each of these must have a regression test in the new implementation (see `../16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md`): unpublished course visible to anyone; forecast generation open to any account; alumni join letting the caller choose `moderator`; endorsement to a non-existent recipient; client-supplied `isVerifiedEmployee`; market-signal posting open to any account. (Verbatim table in section 4.)

## 4. Verbatim prior-attempt record (route authorization and persistence, second coverage pass)

The text below is the legacy file. Words such as "fixed", "tested" and file/line references refer to the **prior attempt's** repository and are retained only as evidence; no code exists here. `?` characters are lost non-ASCII characters in the source export.

Evidence: four read-only investigators each read the handlers for a share of the routes in `apps/api/src/server.ts` (S) and compared them with `apps/api/src/durability.ts` (D). The first pass (`02-flows.md`) covered auth, jobs and applications, work history, billing and boot. Together the two passes cover most route groups; route groups not listed here were not read. Status of each claim: **Reported** (investigator cited a line) unless marked **Fixed** or **Tested**.

Legend: Auth = anonymous (anon), signed in (any), or a role. Check = the role or ownership test the handler makes. P = durable in PostgreSQL, M = memory only (lost on restart, response carries `x-talentsphere-durability: ephemeral`). Several routes labelled ephemeral also write durable rows; those are noted.

## Fixed in this pass (each has a test)

| Route | Defect | Fix |
| ----- | ------ | --- |
| `GET /courses/:id` | Returned unpublished courses, including lesson text, to anyone. | Visible only to the course's instructor and platform admins; everyone else gets 404. Tested in `lms-courses.test.ts`. |
| `POST /skills/:skillId/forecast/generate` | Route comment says "Admin / Recruiter" but any signed-in account could replace the cached forecast everyone reads. | Requires `recruiter`, `hiring_manager` or `platform_admin`; 403 otherwise. Tested in `skill-forecasting.test.ts`. |
| `POST /alumni/groups/:id/join` | A joiner could ask for `role: moderator` and receive it. | 403 unless the caller administers the institution. Tested in `alumni-networks.test.ts`. |
| `POST /skills/endorsements` | Accepted any recipient id, including one that is not a user. | 404 for an unknown recipient. Tested in `peer-credibility.test.ts`. |
| `POST /reputation/organizations/:id/reviews` | `isVerifiedEmployee` was taken from the request body. | Set only from the reviewer's membership of the organization. Tested in `employer-reputation.test.ts`. |
| `POST /skills/:skillId/market-signals` | Any signed-in account could post market data (earlier pass, CF-12). | Platform admin only. |

## Open findings from this pass (not fixed: each needs a product or policy decision)

| ID | Finding | Evidence | Why not fixed |
| -- | ------- | -------- | ------------- |
| CF-31 | `POST /gamification/claim-activity` lets any account award itself XP and badges: arbitrary `referenceType`, `referenceId` and amount 1 to 200, deduplicated per pair and capped at 200 per day. A fresh reference id each time still counts toward badges and the leaderboard. | S:9705; contracts 558-563; `gamification.ts:204-237` | The route's intended use is not documented. |
| CF-32 | Challenge and course XP follow a different rule from the documented per-reference idempotent cap (BR-25): repeat passes earn XP until a lifetime cap of 200, and neither path updates the gamification profile that `/summary` and the leaderboard read. | S:4684, 5215; `assessment.ts:170-177` | Needs the intended XP rules. |
| CF-33 | `POST /settings/erasure/execute` never checks the 30-day grace period the UI and `SSOT.md:3706` promise; any signed-in account can anonymise immediately. The request, status and cancel routes are cosmetic once execute is called. | S:10071 | Issue #45 (deletion policy) is unresolved. |
| CF-34 | `GET /activity/users/:userId/score` lets any signed-in user read any user's score, band and streak, ignoring the `showActivity` setting that the analytics route respects. | S:9365 | Decide whether scores are public. |
| CF-35 | The AI data-consent setting ("Allow TalentSphere AI to use my profile data") is not checked on any AI route. The tier is hardcoded to free. `POST /ai/assistant/query` skips the quota and the prompt firewall. | S:5947-5968, 4718 | AI provider and entitlement policy is reserved for the owner. |
| CF-36 | Anonymous reads: `GET /feedback/aggregate-insights` (cross-organization feedback counts, suppressed under 10), `GET /salaries/benchmarks` (k 5), `GET /salaries/company/:name` (k 3, below the benchmark k), `GET /reputation/organizations/:id`, `GET /organizations/:id/reviews` (returns `reviewerId`), instructor reputation. | S:3086, 2525, 2543, 4353, 4504, 4159 | Decide the public surface. |
| CF-37 | Salary cohorts can be filled by one account: reports are auto-verified unless an outlier, self-reported counts, 5 reports a day. The company summary floor is 3 reports, which equals one person's pay at a median of 3 values; **BR-180 sets that floor at 3**, so raising it would override an approved rule (an attempt was reverted when its test failed). | S:2432; `salary-intelligence.ts:191` | Needs a distinct-people rule and an owner decision on BR-180. |
| CF-38 | `isVerifiedEnrollment` on instructor reviews is still accepted from the request body, and instructor reviews are unlimited per user. (The employer flag is fixed, see above.) A server-side check was written and reverted because the API exposes no way to test it. | S:4305, 4297 | Needs a testable server-side source for the flag. |
| CF-39 | Warm-intro paths: any signed-in user can query paths to any user across the accepted-connection graph; connection requests have no rate limit or block check. | S:6577, 6231 | Needs a privacy decision. |
| CF-40 | `POST /skills/endorsements` ignores the "connected peer" rule in `SSOT.md:1933` and mixes profile and user ids so the specialization bonus never fires. (The unknown-recipient case is fixed, see above.) | S:7098, 7133 | Needs the intended rules. |
| CF-41 | Revoking a certificate does not revoke its linked evidence, which stays authority-verified and still verifies through `/verify/:hash`. Course-completion evidence is persisted while the certificate, enrollment and XP are not. | S:5371-5409, 5193 | Product decision on revocation. |
| CF-42 | Maintenance mode only changes diagnostics output and resets on restart; it blocks no traffic. | S:10930, 10893 | Decide intended behaviour. |
| CF-43 | In-memory only, although the UI offers them: resumes, connections, warm intros, portfolio, AI conversations, activity, moderation reports and appeals, analytics, salaries, reputation, interviews, talent pools, alumni, referrals, job templates (issue #48). | D:21-105 | Durable storage for each is a scoped project. |
| CF-44 | Alumni and referral trust: alumni affiliation verification trusts the unverified account email; talent-pool stealth checks read a field (`isStealthMode`) not confirmed to be set; referral create passes `resumeId` through without an ownership check. | S:8911, 8064, 6846 | Needs verification of each before changing. |
| CF-45 | "Any organization membership" authorizes interview questions and scorecards, talent pools (6 routes), employer metrics, job templates and referrals, in addition to the job and applicant routes in CF-14. The member's role is never read. | S:3280, 3339, 3359, 7892-8161, 4471, 2375, 6919 | Same decision as CF-14: define which organization roles may act. |

## Route tables

### Jobs, applications, organizations, work history, billing, auth
See `02-flows.md` (F2 to F5) and `04-conditions.md`.

### Messaging, notifications, AI, resumes, portfolio, connections, warm intros, saved searches (all signed in unless noted)

| Routes | Check | P/M |
| ------ | ----- | --- |
| `GET/POST /threads`, `/threads/:id`, `/threads/:id/messages`, `/threads/:id/read` | participant check on every by-id route; starting a conversation needs an accepted connection or an application link (`mayStartConversation`) | P |
| `GET /notifications`, `/summary`, `POST /mark-read`, `GET/PATCH /preferences` | own records only | P (a default preference is created in memory on first read) |
| `POST /ai/assistant/query` | any signed-in; assessment prohibition only | M |
| `POST /ai/career-assistant/chat` | assessment prohibition, prompt firewall (2000 characters; injection patterns rejected), free quota 20 requests and 5000 tokens per day, conversation ownership | M |
| `POST/GET /ai/conversations`, `/:id`, `GET /ai/usage` | own | M |
| `POST/GET/PATCH /resumes`, `/:id`, `/:id/export`, `/:id/exports`, `DELETE /resumes/exports/:id` | owner (`userId`) | M |
| `POST /connections/request`, `GET /connections`, `/status/:id`, `POST /:id/respond`, `/:id/withdraw`, `DELETE /:id` | respond: recipient only; withdraw: sender only; delete: either party | M |
| `/networking/warm-intros/*` | own lists; request rate limit and block list in the domain; detail visible to requester, introducer, approved target or admin | M |
| `POST/GET /portfolio/projects`, `PATCH/DELETE /:id` | owner; reads use `canViewPortfolioProject` (anon may read public projects; `recruiters_only` passes for any recruiter) | M |
| `GET/POST/PATCH/DELETE /jobs/saved-searches*` | owner | P |

### Evidence, skills, courses, learning, challenges, gamification, certificates

| Routes | Check | P/M |
| ------ | ----- | --- |
| `POST /evidence`, `GET /evidence/mine`, `/:id`, `/subject/:id`, `POST /:id/verify`, `/dispute`, `/revoke`, `GET /:id/verify-public` | create: own profile; verify needs the role for the target level (peer: staff or confirmed referee; institution: institution admin, instructor or admin; authority: admin or verification staff); public proof is anonymous and carries no personal data | P |
| `GET /skills`, `POST /skills`, `/skills/relationships` | list anonymous; writes platform admin | P / M |
| `/skills/freshness*`, `/skills/:id/reverify` | own record; `refresh-all` platform admin | M |
| `/skills/endorsements*` | any signed-in (see CF-40) | M |
| `GET /skills/forecast/top-growth`, `/skills/:id/forecast` | anonymous | M |
| `POST /courses`, `/:id/modules`, `/modules/:id/lessons`, `/:id/publish` | instructor, course author or admin to create; course instructor or admin to change | M |
| `POST /courses/:id/enroll`, `/lessons/:id/complete`, `GET /:id/progress` | enrollment required; no enrolling in your own course | M (completion evidence P) |
| `GET /certificates/*`, `/verify/:hash` | anonymous | M (evidence P) |
| `POST /certificates/:n/revoke` | admin or the course's instructor | M |
| `GET /challenges*` | anonymous (hidden tests removed) | M |
| `POST /challenges` | domain: admin, instructor or course author | M |
| `POST /challenges/:id/start-session`, `/submit` | own profile and session | M (evidence P) |
| `GET /xp/ledger`, `/gamification/*` | own; leaderboard shows all display names and XP | M |
| `/learning/impact/*` | outcomes: enrolled learner, once per course; metrics anonymous with cohort floor 30; compute: instructor or admin | M |

### Admin, moderation, settings, search, analytics, activity

| Routes | Check | P/M |
| ------ | ----- | --- |
| `GET /health`, `/feature-flags` | anonymous | stateless / P |
| `GET/PATCH /profile/me`, `GET /profile/:id` | own; `canViewProfile` for others | P |
| `GET/PATCH /settings`, `POST /settings/export`, `/erasure/*` | own (see CF-33) | P (export and execute write durable rows) |
| `GET /admin/users`, `PATCH /users/:id/status`, `/roles`, feature flags, audit logs, diagnostics, maintenance | `assertPlatformAdmin` (also accepts the string `admin`); an admin cannot suspend or demote themselves | P for flags, audit and user changes |
| `POST /moderation/scan` | anonymous, compute only | M |
| `POST /moderation/reports`, `GET /reports/my`, `POST /reports/:id/appeal` | own; the target is not checked for existence | M |
| `GET /moderation/reports`, `/:id`, `PATCH /:id/status`, `POST /:id/resolve`, `/appeals/:id/review` | moderator or admin; a ban needs two different admins; a reporter cannot resolve their own report | M (user and job changes P) |
| `GET /search*` | anonymous; profiles gated by `canViewProfile`; published jobs only | M |
| `POST /analytics/events` | anonymous allowed; honours the user's telemetry setting; `GET` events and KPIs admin only | M |
| `POST/GET /activity/*` | own (see CF-34 for the score lookup) | M |

### Interviews, reputation, recruiter, alumni, referrals, salaries, career, job templates

| Routes | Check | P/M |
| ------ | ----- | --- |
| `/job-templates*` | organization member (any role) and domain role for writes | M (instantiate writes a job) |
| `/interviews/*` | organization member for create and list; participants for read; panel only for end, score and review; the candidate view strips private notes and hidden tests; code execution is simulated and returns 503 in production and staging | M (scorecard may move an application) |
| `POST /reputation/signals`, `/recovery/.../complete`, `/recalculate-all`, `/instructors/recompute` | admin or moderator | M |
| `GET /reputation/users/:id` | self, admin, or a hiring role for a user who applied to their organization | M |
| `/reputation/instructors`, `/organizations` | reads anonymous; writes any signed in (see CF-38) | M |
| `/recruiter/talent-pools*`, `/discovery/behavioral*`, `/talent-segmentation*` | any membership of an organization for pools (CF-45); a global hiring role for discovery and segmentation, with a stealth check | M |
| `/alumni/*` | verified alumnus or institution administrator for directory, groups and mentorship | M |
| `/referrals/*` | referrer only to respond; candidate, referrer, organization member or admin to read | M (respond may tag an application) |
| `/salaries/*` | reports: any signed in, 5 per day; benchmarks and company summary anonymous | M |
| `/career/*` | transitions own; benchmarks, probability and pathways anonymous with 20-person floor | M |

## Not read

Per-route Zod schemas, `canViewProfile` beyond its first branches, the gamification badge tail, the bodies of several domain functions (`discoverWarmIntroPaths`, `computeEndorsementWeight`, `detectSalaryOutlier`), rate limiting, the error handler, storage SQL and tests for these groups.

## 5. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B14-10 | Intended gamification/XP model (claim vs event-driven; one ledger) | Product Director (OPEN-50) |
| L-B14-11 | Are activity scores ever public; default visibility | Product + Privacy |
| L-B14-12 | Warm-intro path discovery: who may query whose network | Privacy Lead |
| L-B14-13 | Job approval and moderation states (CF-15) | Product Director |
| OPEN-44 | Authorization model and organization roles | Security Architect + Domain Architect |
