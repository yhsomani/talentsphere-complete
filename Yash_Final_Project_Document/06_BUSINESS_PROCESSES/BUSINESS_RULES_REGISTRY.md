# Business Rules Registry (BR-T)

Doc ID: BR-REG · Owner: Business Analyst Lead + Product Director · Version 1.0 · Status: Under Review · Relates: CC-INV (seed BR-T001, T002, T003, T004, T005, T041, T050, T060), INV-T01…INV-T45, SM-00, DT-00, FEAT-* (see `04_PRODUCT_CAPABILITIES`)

**Numbering blocks:** T001–T040 core loop (evidence, verification, assessment, learning, jobs, applications) · T041–T049 privileged access & safety · T050–T059 identity & sessions · T060–T069 privacy & data rights · T070–T077 matching & search · T080–T087 messaging & notifications · T090–T097 billing & entitlements · T100–T106 institutions · T110–T117 AI & platform. Gaps between blocks are intentional (room to grow). Seeds from `CANONICAL_INVARIANTS.md` are reproduced **verbatim in meaning**; they are marked `seed`.

Tags: all rules **[TARGET]**. Numeric thresholds in `{braces}` are **[OPEN]** tunables (product default stated; owner may change without changing the rule's shape). Rules touching legal duties are **[OPEN-08]** until counsel review; no legal claim is made.
**Namespace and legacy mapping:** `BR-T###` is the proposed target namespace; it is not numerically equivalent to legacy `BR-*`. The legacy rules and migration rules remain preserved. See [LEGACY_RULE_CROSSWALK](LEGACY_RULE_CROSSWALK.md) and its [row-level CSV](LEGACY_RULE_CROSSWALK.csv); mapping does not approve adoption or retirement.
**Enforcement vocabulary:** DOM = `packages/domain` function · POL = `packages/policy` · SM = state-machine table (SM-00) · DB = constraint/RLS/index · WRK = worker job · UI = hint only (never sole control, INV-T01) · GW = AI gateway · LINT = CI fitness function.
**Verification vocabulary:** UT unit · IT integration · SEC security suite · E2E Playwright journey · PROP property test · CAN cross-tenant canary (FF-05).

## 1. Core loop (T001–T040)

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification |
|---|---|---|---|---|---|---|---|
| BR-T001 | Application | Candidate submits to a job | At most one **active** (non-terminal, incl. draft) application per (candidate, job) (seed) | After terminal state, a recruiter-invited reconsideration may create a new linked application | DB partial unique index + DOM | FEAT-10-02 | IT concurrency, UT |
| BR-T002 | Application | Any stage change | Only transitions in SM-APPLICATION (seed) | None | SM | FEAT-10-05 | SM matrix tests |
| BR-T003 | Evidence | Artefact uploaded | Not visible/shareable until virus-scan clean (seed) | None | SM-EVIDENCE + WRK | FEAT-05-12 | IT with EICAR-style fixture |
| BR-T004 | Referee | Reference requested | Expires 14 days after send; max 2 reminders (seed) | None | SM-REFERENCE + WRK | FEAT-06-02, FEAT-06-10 | UT clock, IT |
| BR-T005 | Evidence | Evidence revoked or downgraded | Dependent skill confidence and match explanations recomputed asynchronously and audited (seed) | None | WRK via outbox | FEAT-05-05, FEAT-11-07 | IT end-to-end |
| BR-T006 | Evidence | Evidence activated | Requires ≥ 1 canonical skill tag; free-text skills rejected | Draft state allows none | DOM | FEAT-05-01, FEAT-04-02 | UT |
| BR-T007 | Evidence | Evidence source is AI or AI-generated claim of verification | Rejected if `source=ai`; owner may declare "AI-assisted" which never raises rung | None | DOM schema | FEAT-05-01 | Schema test (INV-T08) |
| BR-T008 | Evidence | Any rung read/write | Rung is derived from valid provenance; no client field may set it | None | DOM | FEAT-05-02 | SEC, PROP |
| BR-T009 | Evidence | Link-type evidence | Reaches `artifact_backed` only if liveness check succeeds (≤ 3 redirects, HTTP 200); re-checked every 30 d; failing 14 d ⇒ back to `claimed` | Private-network targets blocked (SSRF) | WRK + DOM | FEAT-05-01 | IT, SEC |
| BR-T010 | Evidence | Peer attestation | Attester ≠ owner, verified account, one attestation per (attester, item), ≤ 10 attestations/day/attester | Attesters flagged by FEAT-06-09 are held for human review, not rejected | DOM + POL | FEAT-05-03 | UT, IT |
| BR-T011 | Evidence | `authority_verified` rung | Only from issuer types: platform course rule/instructor sign-off, auto-graded platform assessment, verified institution, verified employer org | None | DOM | FEAT-05-04 | UT per issuer |
| BR-T012 | Evidence | Revocation | Human issuer + reason code; holder notified ≤ 24 h with appeal route | Safety emergency: revoke first, notify immediately after | SM + WRK | FEAT-05-05 | IT |
| BR-T013 | Evidence | Owner withdraws evidence | Live access ends; submitted-application snapshots keep a redacted tombstone | None | SM + DOM | FEAT-05-01, FEAT-10-14 | IT |
| BR-T014 | Evidence | Upload | Allowlisted types, ≤ {25 MB} per file, ≤ {20} files/item, content-type sniffed | Larger files only via linked evidence | DOM | FEAT-05-12 | UT |
| BR-T015 | Evidence | Draft not submitted for 90 d | Auto-deleted with 7-day notice | Pinned drafts none | WRK | FEAT-05-01 | IT clock |
| BR-T016 | Verification | Work-history code | ≥ 6 digits, TTL 15 min, ≤ 5 attempts, ≤ 3 resends/h, stored hashed, never echoed (INV-T05) | None | DOM | FEAT-06-01 | Token tests |
| BR-T017 | Verification | Work-history proof | Code goes only to an address on the claimed employer domain; free-mail domains rejected | Employer without own domain ⇒ referee route only | DOM | FEAT-06-01 | UT |
| BR-T018 | Referee | Referee submits | Referee email/account ≠ candidate's; same-session submission by candidate blocked | None | DOM | FEAT-06-02, FEAT-06-09 | UT, SEC |
| BR-T019 | Referee | Requests per claim | ≤ 3 open requests per work claim; ≤ {10} referee emails per candidate per 24 h | Raised for verified institutions | DOM + rate limit | FEAT-06-02 | IT |
| BR-T020 | Referee | Token | ≥ 128-bit random, hashed at rest, single-use, TTL 14 d, bound to (request, email) (INV-T05) | None | DOM | FEAT-06-02 | Token tests |
| BR-T021 | Referee | Outcome `dispute` | No automatic downgrade/flag of candidate; human review, candidate may respond within 7 d | None | DOM + SM | FEAT-06-03, FEAT-06-05 | IT |
| BR-T022 | Referee | Reminders | Sent only on day 4 and day 9 while unanswered | None | WRK | FEAT-06-10 | UT clock |
| BR-T023 | Referee | Recruiter views attestation | Referee's name shown only if the referee ticked "may be named"; else "attested by a former colleague" | None | DOM | FEAT-06-02, FEAT-06-04 | UT |
| BR-T024 | Assessment | Attempt timing | Server clock authoritative; deadline auto-submits last autosave | Accommodation multiplies duration (BR-T030) | DOM | FEAT-07-02 | UT, IT |
| BR-T025 | Assessment | Attempt bound to AI_PROHIBITED | AI gateway denies every call for that principal during the attempt, regardless of caller (INV-T06) | None | GW | FEAT-07-05, FEAT-17-03 | Gateway matrix |
| BR-T026 | Assessment | Code assessment, no runner or runner outage | Attempt becomes `unverified`; no verified evidence minted (ADR-T13) | None | SM | FEAT-07-04 | IT |
| BR-T027 | Assessment | Auto-graded pass | Evidence minted exactly once per attempt (idempotent) at `authority_verified` | Voided/under-review attempts mint nothing | DOM + idempotency | FEAT-07-06 | Replay test |
| BR-T028 | Assessment | Retake | {24 h} cooldown after fail; ≤ {3} attempts per 7 days per assessment | Instructor override with reason | DOM | FEAT-07-08 | UT |
| BR-T029 | Assessment | Integrity signals | Never alone fail or void an attempt; only a human voids; candidate sees the signals considered (INV-T20) | None | SM | FEAT-07-07, FEAT-19-05 | Process test |
| BR-T030 | Assessment | Accommodation granted | Extra time multiplier recorded on attempt; not visible to recruiters | None | DOM | FEAT-07-02 | UT |
| BR-T031 | Learning | Completion | Requires all required lessons and passing required assessments; rule version frozen at enrolment | Instructor sign-off option per course | DOM | FEAT-08-04 | UT |
| BR-T032 | Learning | Completion evidence | Minted once per enrolment; revoked only by human issuer | None | DOM + idempotency | FEAT-08-04 | Replay test |
| BR-T033 | Learning | Paid course | Access only after verified-webhook payment state (INV-T17) | Admin comp access with audit | SM + POL | FEAT-08-02, FEAT-16-09 | Webhook tests |
| BR-T034 | Learning | Review | Only completed or ≥ 50 % progress learners; one per learner per course | None | DOM | FEAT-08-07 | UT |
| BR-T035 | Jobs | Publish | Org verified (pending org may have 1 live job), ≥ 1 canonical skill, location/work-mode, description ≥ {200} chars, pay-range field present (value mandatory when org policy or jurisdiction rule requires [OPEN-08]) | None | DOM | FEAT-09-01, FEAT-09-02 | UT |
| BR-T036 | Jobs | Expiry | Default {45} d live, extendable; max {90} d continuous | None | WRK | FEAT-09-03 | IT clock |
| BR-T037 | Jobs | Closed job | Cannot reopen; clone to new draft; open applicants notified ≤ 24 h if closed unfilled | None | SM + WRK | FEAT-09-03 | IT |
| BR-T038 | Application | Submit | Job must be `published` at submit instant; request idempotent by (candidate, job) | Draft retained for 7 d if job closes mid-edit | DOM | FEAT-10-02 | IT |
| BR-T039 | Application | Snapshot | Evidence snapshot frozen at submit; recruiters see snapshot plus live items still within consent; revoked consent shows tombstones | None | DOM | FEAT-10-14 | IT |
| BR-T040 | Application | Rejection | Human actor, reason code, two-step confirm; no reject by score/AI (INV-T09); bulk reject ≤ {50} per action with summary confirm | None | SM + POL | FEAT-10-06 | Process test, SM test |

## 2. Privileged access & safety (T041–T049)

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification |
|---|---|---|---|---|---|---|---|
| BR-T041 | Admin | Privileged access to personal data | Grant ≤ 4 h, reason code required (seed) | None | POL + DB | FEAT-20-02 | Audit tests |
| BR-T042 | Admin | Support grant | Scoped to one subject; ticket id; subject notified unless notice is prohibited [OPEN-08]; every read audited; extension = new grant | None | POL | FEAT-20-02, FEAT-20-03 | Audit tests |
| BR-T043 | Admin | Support/admin write | No write to a person's evidence, applications or verification state except via designed human workflows (moderation, appeal) | None | POL | FEAT-20-02, FEAT-20-07 | SEC |
| BR-T044 | Admin | Privileged roles | MFA mandatory; sessions idle 30 min, absolute 8 h | None | POL + SM-SESSION | FEAT-01-07 | SEC |
| BR-T045 | Safety | Takedown, suspension, evidence revocation | Human decision with reason; suspension needs second-person approval | Emergency block of spreading malware: single moderator, reviewed within 24 h | SM-MODCASE | FEAT-19-02, FEAT-19-07 | Process test |
| BR-T046 | Safety | Any moderation action | Notice to subject with category, effect and appeal path | Notice withheld when law/safety forbids [OPEN-08] | WRK | FEAT-19-03 | IT |
| BR-T047 | Safety | Appeal | Reviewed by a different moderator; target response ≤ {5} business days | None | SM-MODCASE | FEAT-19-06 | Process test |
| BR-T048 | Safety | Reports | ≤ {20}/day/reporter; deduped per (target, category); reporter identity hidden from subject | Legal process may compel disclosure [OPEN-08] | DOM + rate limit | FEAT-19-01, FEAT-19-08 | UT |
| BR-T049 | Admin | Privileged grant unused 60 d | Auto-expires; monthly review by Security | None | WRK | FEAT-20-08 | IT clock |

## 3. Identity & sessions (T050–T059)

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification |
|---|---|---|---|---|---|---|---|
| BR-T050 | Session | Refresh token reuse detected | Revoke the whole token family (seed) | 5-second leeway returns the same unused successor | SM-SESSION | FEAT-01-04 | Token reuse tests |
| BR-T051 | Identity | Password set | ≥ 12 chars, not in breached list, no composition rules; memory-hard hash | Passkey-only accounts have none | DOM | FEAT-01-01, FEAT-01-06 | UT |
| BR-T052 | Identity | Failed logins | Progressive delay after 5 failures per (account, IP bucket) up to 15 min; identical response for unknown accounts | None | DOM + rate limit | FEAT-01-02 | SEC |
| BR-T053 | Identity | Email verification code | ≥ 6 digits, TTL 15 min, ≤ 5 attempts, single-use, hashed (INV-T05) | None | DOM | FEAT-01-01 | Token tests |
| BR-T054 | Identity | Password reset | Token single-use, TTL 30 min; use revokes all other sessions; response never reveals account existence | None | DOM | FEAT-01-06 | SEC |
| BR-T055 | Identity | Passkeys | ≤ 10 per account; last sign-in method cannot be removed | Verified recovery email counts as a method | DOM | FEAT-01-03 | UT |
| BR-T056 | Session | Lifetimes | Access 15 min; refresh idle {14} d, absolute {30} d; privileged see BR-T044 | "Remember me" absolute {90} d | SM-SESSION | FEAT-01-04 | Clock tests |
| BR-T057 | Identity | Sensitive action | Re-auth ≤ 5 min old for: change email/password/passkey, deactivate, erase, download export, billing change | None | POL | FEAT-01-05, FEAT-22-02 | SEC |
| BR-T058 | Identity | Email change | Confirm at new address; notice to old; old address may revert within 7 d | None | DOM | FEAT-01-05 | IT |
| BR-T059 | Identity | Sign-in from unrecognised device | Holder notified by email; link to revoke | Suppressed for first sign-in after registration | WRK | FEAT-01-02 | IT |

## 4. Privacy & data rights (T060–T069)

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification |
|---|---|---|---|---|---|---|---|
| BR-T060 | Privacy | Erasure request | Completes ≤ 30 days except legally retained audit/billing records (seed; list OPEN-08) | None | SM-DSR + WRK | FEAT-22-03 | IT clock |
| BR-T061 | Privacy | Consent record | Purpose-bound scope, versioned, timestamped, with grantee; default = none for recruiter access beyond an application | None | DOM | FEAT-22-01 | Consent tests |
| BR-T062 | Privacy | Candidate applies | Grants the job's hiring team application-scoped consent over the snapshot only, while the application is active and for {12 months} after terminal state [OPEN-08] | Candidate may withdraw earlier | DOM | FEAT-10-14, FEAT-22-01 | IT |
| BR-T063 | Privacy | Consent revoked | New reads denied on the first read after the revoking transaction commits (read-time check, no consent cache; 60 s is the test timeout, not a tolerated stale window; CSC section 6); search index entry removed ≤ 15 min; access-log entry written; past snapshots keep tombstones | None | DOM + WRK | FEAT-22-01, FEAT-05-07 | IT timing |
| BR-T064 | Privacy | Export | JSON + files, own data only (no other person's personal data, no internal fraud signals); link expires 7 d; re-auth before download; one export / 24 h | Support may re-issue | WRK | FEAT-22-02 | IT |
| BR-T065 | Privacy | Erasure execution | Removes from primary store, search, caches, object storage, analytics; backups age out ≤ {35} d [OPEN-08]; append-only audit, consent and transition history is never rewritten: it holds only opaque `subject_ref` tokens and erasure deletes the token-to-identity mapping (DB-02 §4.1); retained records minimised and listed on receipt | Legal hold ⇒ `on_hold` | WRK | FEAT-22-03, FEAT-22-07 | Fan-out test |
| BR-T066 | Privacy | Erasure cooling-off | 7 days; profile hidden and sign-in blocked; cancel restores | None | SM-DSR | FEAT-22-03 | IT |
| BR-T067 | Privacy | Rectification | Holder edits own claims directly; changing a verified item creates a new item; old revoked only by its issuer | None | DOM | FEAT-22-09 | UT |
| BR-T068 | Privacy | Access-log | Shows accessing org + purpose + time; individual recruiter name only if org policy allows; retained {24 months} | None | DOM | FEAT-22-04 | UT |
| BR-T069 | Privacy | "Exclude from search" restriction | Profile not indexed for recruiter search; applications and messaging unaffected | None | DOM + WRK | FEAT-22-10 | IT |

## 5. Matching & search (T070–T077)

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification |
|---|---|---|---|---|---|---|---|
| BR-T070 | Matching | Scoring | Only allowlisted inputs (DT-03); protected attributes and photo never inputs; plan/payment never an input (INV-T19) | None | DOM + allowlist validator | FEAT-11-03 | Allowlist test |
| BR-T071 | Matching | Match shown | Always with rationale (matched/missing skills, rungs), freshness time and uncertainty band | None | DOM + UI | FEAT-11-02 | Explanation tests |
| BR-T072 | Matching | Recruiter views applicants | Score is advisory; all applicants remain visible; default order selectable, no hiding by score | None | POL | FEAT-11-10, FEAT-10-17 | UT |
| BR-T073 | Matching | Candidate view | Candidate sees why matched and what would change it; may hide a recommendation category | None | UI + DOM | FEAT-11-08 | UT |
| BR-T074 | Search | Recruiter candidate search | Returns only discoverable profiles within consented fields; quota counts unique profiles opened | None | POL + DB | FEAT-11-05 | CAN, IT |
| BR-T075 | Search | Index membership | Excludes accounts not `active`, erased, or restricted (BR-T069) | None | WRK | FEAT-24-12 | IT |
| BR-T076 | Matching | Evidence change | Recompute ≤ 15 min p95; explanation refresh | None | WRK | FEAT-11-07 | IT timing |
| BR-T077 | Matching | Quarterly audit | Adverse-impact analysis using voluntarily supplied audit-only attributes; results to ROLE-AUD; breach of {threshold} opens a review | None | WRK + MOD-ADM | FEAT-11-09 | Process test |

## 6. Messaging & notifications (T080–T087)

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification |
|---|---|---|---|---|---|---|---|
| BR-T080 | Messaging | Recruiter contacts non-applicant | Needs candidate discoverable-for-messaging consent, quota available, no block; creates a pending first-contact request | Applicants: thread allowed from application | POL + DOM | FEAT-13-02, FEAT-13-06 | IT |
| BR-T081 | Messaging | Outreach quota | Plan-defined {values OPEN-05}, monthly reset, counts first-contact only; {30} d cooldown per candidate after decline | None | DOM + billing meter | FEAT-13-02, FEAT-16-11 | UT |
| BR-T082 | Messaging | First contact | Candidate may accept, decline or block; sender sees only a generic "not interested" code | None | DOM | FEAT-13-06 | UT |
| BR-T083 | Messaging | Block | Bidirectional; blocking an org blocks all its members | None | POL | FEAT-13-05 | SEC |
| BR-T084 | Messaging | Edit/delete | Edit window 5 min; delete is a tombstone; reported messages preserved for review | None | DOM | FEAT-13-01, FEAT-13-05 | UT |
| BR-T085 | Notify | Categories | Mandatory transactional (security, verification, legal, billing) cannot be disabled; engagement opt-out; marketing opt-in | None | DOM | FEAT-15-02, FEAT-15-07 | UT |
| BR-T086 | Notify | Quiet hours | Default 21:00–08:00 local; defers non-mandatory, non-time-critical messages; interview reminders are time-critical | User may disable quiet hours | DOM + WRK | FEAT-15-02 | IT clock |
| BR-T087 | Notify | Nudges and digests | ≤ {3} nudges/week and ≤ 1/day per user; ≤ 1 digest/day | None | DOM | FEAT-15-05 | UT |

## 7. Billing & entitlements (T090–T097)

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification |
|---|---|---|---|---|---|---|---|
| BR-T090 | Billing | Entitlement change | Derived only from subscription state via DT-02; redirects and clients cannot grant (INV-T17) | Admin comp with audit | DOM + POL | FEAT-16-04 | Webhook tests |
| BR-T091 | Billing | Candidate core loop | Profile, evidence, applying, replying to messages are always free | None | POL | FEAT-16-04 | Entitlement matrix |
| BR-T092 | Billing | Payment past due | {7}-day grace at full access, then degrade paid features read-only; never delete data | None | SM-SUBSCRIPTION | FEAT-16-07 | IT clock |
| BR-T093 | Billing | Job slots | Count published + paused jobs; reserved inside the publish transaction | None | DB lock | FEAT-09-02, FEAT-16-04 | Concurrency test |
| BR-T094 | Billing | Seats | Assigned ≤ purchased; downgrade below assigned requires unassign first; seats never change data ownership | None | DOM | FEAT-16-08 | UT |
| BR-T095 | Billing | Metered quotas (AI, outreach, verified-search) | Reset per period; over quota ⇒ block with upgrade message; no silent overage charges | Admin grant | DOM | FEAT-16-11 | UT |
| BR-T096 | Billing | Webhook | Verified signature; idempotent by event id; out-of-order resolved by object version; unknown types logged and ignored | None | DOM | FEAT-16-03 | Replay tests |
| BR-T097 | Billing | Refunds | Course: within {14} d and < {20} % progress [OPEN-06]; subscription: support discretion; always audited and reflected only via webhook | Exceptional refund after completion by human only | DOM + POL | FEAT-16-10, FEAT-08-10 | IT |

## 8. Institutions (T100–T106)

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification |
|---|---|---|---|---|---|---|---|
| BR-T100 | Institution | Admin/faculty views learners | Aggregates only with k ≥ {5}; individual data only for institution-issued credentials and work in institution courses | None | POL + DB | FEAT-18-04 | CAN, IT |
| BR-T101 | Institution | Roster import | Dedupe by normalised email; dry-run preview; ≤ {2,000} rows; unclaimed rows hold no profile | None | DOM | FEAT-18-02 | UT |
| BR-T102 | Institution | Learner identity | Learner owns evidence and profile; institution may revoke only credentials it issued, with reason | None | POL | FEAT-18-03, FEAT-18-06 | SEC |
| BR-T103 | Institution | Graduation | Institution access sunsets ≤ 24 h after graduation except issued credentials and aggregates; alumni sharing is opt-in | None | WRK | FEAT-18-07 | IT clock |
| BR-T104 | Institution | Faculty scope | Faculty see only assigned cohorts/courses | None | POL | FEAT-18-05 | SEC |
| BR-T105 | Institution | Job-search data | Applications, saved jobs and messages are never visible to institutions | None | POL + DB | FEAT-18-04 | CAN |
| BR-T106 | Institution | Possible minors | Rows flagged under-age are blocked from onboarding until OPEN-09 is resolved | None | DOM | FEAT-18-11 | UT |

## 9. AI & platform (T110–T117)

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification |
|---|---|---|---|---|---|---|---|
| BR-T110 | AI | Any model call | Only through the gateway; direct provider imports fail CI | None | LINT | FEAT-17-01 | Lint |
| BR-T111 | AI | Free-tier user | No paid inference unless budget policy flag; fall back to deterministic behaviour (INV-T07) | None | GW | FEAT-17-02 | Cost-guard tests |
| BR-T112 | AI | Output shown | Always a labelled draft; applying needs explicit per-field user action | None | UI + DOM | FEAT-17-04, FEAT-03-05 | E2E |
| BR-T113 | AI | Input to model | Secrets stripped; PII minimised; artefact contents sent only when the user triggers it for that item | None | GW | FEAT-17-01 | Redaction tests |
| BR-T114 | Platform | Unsafe mutation | `Idempotency-Key` required; retained 24 h; replay returns stored response; same key with different payload ⇒ 422 | Webhooks (own dedupe) | LINT + DOM | FEAT-24-03 | Replay tests |
| BR-T115 | Platform | Rate limits | Per-IP and per-principal; auth endpoints stricter; 429 + `Retry-After` | Verified webhook senders exempt | DOM | FEAT-24-08 | Load test |
| BR-T116 | Platform | File download | Signed short-lived URL; non-image types forced to attachment | None | DOM | FEAT-24-04 | SEC |
| BR-T117 | Platform | Queued offline write | Revalidated server-side; newer server version ⇒ conflict UI showing both versions; never silent overwrite (INV-T13) | None | DOM + UI | FEAT-24-07, FEAT-03-08 | Conflict tests |

## 10. Summary and open items

**Count:** 108 rules (8 seed, 100 new). By block: core 40 · privileged/safety 9 · identity 10 · privacy 10 · matching 8 · messaging/notify 8 · billing 8 · institutions 7 · AI/platform 8.
**Rules with unresolved policy [OPEN]:** BR-T035 (pay-range duty), BR-T062 (applicant retention), BR-T065 (backup age-out), BR-T060 / T068 / T045-T048 (legal notice duties), BR-T097 (refund window), BR-T081 (quota values), BR-T106 (minors).
**Authoring rule:** a new rule needs ID, FEAT link, enforcement point, and a verification entry before it is cited in a spec; a rule with only `UI` enforcement is invalid (INV-T01).
