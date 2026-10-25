# Feature Specifications — Group 3: Assessment & Learning

Doc ID: SPEC-G3 · Owner: Product Director + Learning/Assessment leads · Version 1.0 · Status: Under Review · Relates: DOM-07, DOM-08, DOM-17, FEAT-07-02…07-08, FEAT-08-01…08-04, FEAT-08-08, FEAT-17-03, SM-ATTEMPT, SM-ENROLMENT, DT-10, BR-T024…T034, INV-T06, INV-T17, INV-T20, INV-T26, INV-T27, ADR-T12, ADR-T13

Conventions: see `README.md`. Endpoints provisional under `/api/v1`. All **[TARGET]**; `{…}` **[OPEN]**.

---

# SPEC-05 Assessment Attempt (Sandbox Runner, AI_PROHIBITED, Unverified Fallback)

**Metadata:** Doc ID SPEC-05 · Owner: Assessment PM · Version 1.0 · Status Under Review · Phase 1 (auto-graded, fallback, AI policy) / Phase 2 (runner) · Priority P0 · Features: FEAT-07-02, FEAT-07-03, FEAT-07-04, FEAT-07-05, FEAT-07-06, FEAT-07-07, FEAT-07-08, FEAT-17-03 · Modules: MOD-LRN, MOD-ADM · `api/assessment`, `api/ai`, `api/safety`, `apps/worker` · Relates: ADR-T12, ADR-T13, INV-T06, INV-T20, INV-T26, INV-T27, BR-T024…T030, SM-ATTEMPT, DT-10

## 1. Business purpose
"Prove" in the loop needs assessments whose results employers can trust. This feature delivers fair, time-bounded attempts; honest grading (never a simulated pass, ADR-T13); an enforced no-AI policy during evidence-minting assessments (INV-T06); and an integrity process that treats anomalies as questions for a human, not verdicts (INV-T20). Value: GOAL-01, GOAL-04; protects the authority rung from inflation.

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-CAND | start/answer/submit own attempts; view own result; appeal | `attempt:write:own` |
| ROLE-INST | author assessments in own courses; view attempts in own courses; grade manual items; sign off | `assessment:author`, `attempt:read:course` |
| ROLE-INSTADM / ROLE-FAC | read attempts for own cohort (aggregate by default) | `attempt:read:cohort` |
| ROLE-MOD | review integrity cases, void or clear | `integrity:review` |
| ROLE-SUP | read under grant; grant accommodations after verification | `attempt:read:granted`, `accommodation:grant` |
| System | grade, run sandbox, auto-submit, mint evidence | worker |
| ROLE-REC/HM | no access to attempts; see only resulting evidence per DT-01 | — |

## 3. Functional behavior
### 3.1 Assessment definition (inputs for authors; consumed here)
`mode` ∈ {`auto_graded`, `code`, `manual`}; `durationMinutes` 5–240; `passThreshold` 1–100 (%); `skills` 1–5 canonical; `aiPolicy` ∈ {`AI_PROHIBITED`, `AI_ALLOWED`} — **any assessment that can mint evidence must be `AI_PROHIBITED`**; `attemptPolicy` {cooldown, maxPerWindow} (BR-T028); `accommodationsAllowed` boolean. A published assessment version is immutable; edits create a new version; running attempts stay on their version.

### 3.2 Attempt lifecycle (SM-ATTEMPT)
1. **Start** (`created → in_progress`): checks account active, entitlement if gated, cooldown/cap (BR-T028), no other `in_progress` attempt for the same assessment. The server fixes `started_at`, `deadline_at = started_at + duration × accommodationMultiplier` (1.0 default), question order seed, and `aiPolicy` copy. Returns the question set (no answers/grading data). The start screen **discloses** the AI policy, the retake rules and every integrity signal collected.
2. **Answer autosave:** `PUT /attempts/{id}/answers` with `{questionId, value, clientSeq}`; server keeps highest `clientSeq` per question (idempotent, order-tolerant); rejected after deadline (`409 attempt_closed`).
3. **Heartbeat** every 30 s: refreshes `last_seen_at` and carries signal counters; absent for > 5 min ⇒ attempt continues (timer still runs) but flagged `connection_gaps`.
4. **Submit** or **deadline**: scheduler job auto-submits the last autosaved answers (`auto_submitted=true`); lazy deadline check on any request guarantees correctness if the job lags.
5. **Grading:** `auto_graded` ⇒ deterministic scorer; `code` ⇒ runner (§3.3) else fallback (§3.4); `manual` ⇒ instructor queue.
6. **Pass:** `score ≥ passThreshold` (inclusive); evidence minted (§3.5). **Fail:** result summary; retake after cooldown.

### 3.3 Code sandbox runner (FEAT-07-03)
Contract (implementation technology is an architecture decision, not fixed here):
| Aspect | Requirement |
|---|---|
| Input | `{attemptId, submissionSnapshotHash, language, files, testSuiteId, limits}`; snapshot immutable once submitted |
| Isolation | ephemeral sandbox per run; **no network**; read-only base filesystem; writable scratch only; no host mounts; no secrets in environment; processes/threads capped |
| Limits | CPU {2 s}/test, wall {10 s}/test, {30 s} total, memory {256 MB}, stdout/stderr {64 KB}, file size {1 MB} |
| Tests | public tests (shown) + hidden tests (never shown) from `testSuiteId`; deterministic seeds |
| Output | `{attemptId, snapshotHash, runnerVersion, testResults[], signature}`; grading service verifies signature **and** `snapshotHash` before using the result |
| Failure | crash/timeout of the runner (not the code) ⇒ retry ≤ 3 (SM-BGJOB) then fallback §3.4 |
User code that loops or exhausts memory fails that test; it does not fail the attempt as "runner error".

### 3.4 Unverified fallback (FEAT-07-04, ADR-T13)
If a `code` attempt is submitted while no runner is available (not yet shipped, or outage past retry budget): state `unverified` (SM-ATTEMPT t5). **No evidence is minted.** The candidate sees: "Submitted. This challenge can't be automatically verified yet, so it won't count as verified evidence." They may attach their solution as ordinary user evidence (which will be `claimed`/`artifact_backed` by normal rules). When a runner exists, the system re-grades eligible attempts (≤ 30 d old; snapshot intact) via t6; older ones require a retake. No score, pass/fail wording or badge is shown for `unverified`.

### 3.5 Scoring and evidence minting (FEAT-07-06)
`score = Σ(question points earned) / Σ(points available) × 100`, rounded half-up to 0.01; multi-select partial credit = (correct selected − incorrect selected)/total correct, floored at 0; unanswered = 0. Pass mints evidence once per attempt: type `assessment_result`, rung `authority_verified`, skills from the assessment, `issuerRef=assessment:<id>@<version>`, idempotent on `attemptId` (BR-T027, INV-T27). If an integrity hold exists (DT-10 row 3), minting waits for the human decision; a `voided` attempt mints nothing and revokes any minted item (SM-ATTEMPT t9).

### 3.6 AI_PROHIBITED enforcement (FEAT-07-05, FEAT-17-03)
On `in_progress` start with `aiPolicy=AI_PROHIBITED` the assessment module writes a `principal_restriction {principal, kind: ai_prohibited, attemptId, until: deadline_at + 5 min}`. The AI gateway checks restrictions on **every** call for that principal regardless of route, client or feature and returns `403 ai_prohibited` (INV-T06, BR-T025). The UI hides AI assist inside the assessment and shows a persistent banner. A blocked attempt to call AI is logged as a signal and may open a review (never auto-fail, BR-T029).

### 3.7 Integrity signals and review (FEAT-07-07)
Signals (disclosed, minimal): window-blur count and total blur seconds; paste events count (no clipboard contents); answer-time anomalies (e.g. all answers < 3 s each); second-device attempt to join the same attempt (blocked, logged); code-similarity score against other submissions (flag only); gateway AI-block events. No keystroke logging, screen capture or webcam. A flag opens a case (SM-MODCASE) and the candidate can see which signals were considered; reviewers see context, can clear or void; voiding needs reason; appeal goes to another reviewer (BR-T047). Aggregated false-positive rate is tracked.

### 3.8 Retake and accommodations (FEAT-07-08, 07-02.4)
Cooldown {24 h} after fail; ≤ {3} attempts per 7 days (BR-T028). Accommodation multipliers {1.25, 1.5, 2.0} granted by support/instructor after verification of need; the multiplier is stored on the attempt and never shown to recruiters (BR-T030).

### 3.9 Side effects & postconditions
Events: `attempt.started`, `attempt.submitted`, `assessment.passed` (seed domain event), `assessment.failed`, `attempt.unverified`, `integrity.flagged`. Postconditions: INV-T26 (no `authority_verified` evidence from `unverified`/`voided`/`under_review` attempts), INV-T27 (≤ 1 mint per attempt).

## 4. User interaction
| Screen | Behaviour |
|---|---|
| SCR-ASSESS-DETAIL | mode badge, duration, threshold, AI policy label, retake rules, accommodation link |
| SCR-ASSESS-START | disclosure checklist (must read; checkbox) |
| SCR-ASSESS-RUN | question navigator, visible server-synced timer (announces 10, 5, 1 min via polite live region; no auto-focus theft), "Saved" indicator, banner "AI assistance is disabled for this assessment", submit confirmation listing unanswered count |
| SCR-ASSESS-RESULT | pass/fail with score band, per-skill summary, next steps; `unverified` explanation; flagged ⇒ "Your result is being reviewed" with signals considered and appeal |
Resume after reload/disconnect lands on the same question with the server timer. Offline: answers are cached locally and replayed idempotently when back online *before* the deadline; submission after deadline is not accepted (INV-T13). Accessibility: full keyboard operation, timer is not the only cue, screen-reader order, no time pressure beyond accommodation, high-contrast support.

## 5. Backend behavior
Modules: `api/assessment` (definitions, attempts, scoring), `apps/worker` (auto-submit, grading, runner dispatch, re-grade), `api/ai` (restriction checks), `api/evidence` (issuer API), `api/safety` (cases). Grading queue jobs carry `(attemptId, snapshotHash)`; result writes are fenced by job generation (SM-BGJOB) and idempotent on attempt id. Question bank API never serves answer keys to clients; answer keys stored separately and only loaded by the grader.

| Endpoint (provisional) | Method |
|---|---|
| `/assessments`, `/assessments/{id}` | GET catalogue/detail |
| `/assessments/{id}/attempts` | POST start |
| `/attempts/{id}` | GET state/timer |
| `/attempts/{id}/answers` | PUT autosave |
| `/attempts/{id}/heartbeat` | POST |
| `/attempts/{id}/submit` | POST (Idempotency-Key) |
| `/attempts/{id}/appeal` | POST |
| `/internal/runner/result` | POST (runner service identity) |

## 6. Data
| Entity | Key fields |
|---|---|
| `assessment`, `assessment_version` | id, version, mode, duration, threshold, ai_policy, skills[], published_at, immutable |
| `question` | id, version_id, type, points, body, options, answer_key_ref |
| `attempt` | id, account_id, assessment_version_id, state, started_at, deadline_at, multiplier, auto_submitted, score, result, unverified_reason, evidence_id, seed |
| `attempt_answer` | attempt_id, question_id, value, client_seq, saved_at |
| `attempt_signal` | attempt_id, kind, count, detail_min, at |
| `submission_snapshot` | attempt_id, hash, files_ref, created_at |
| `runner_job` | id, attempt_id, snapshot_hash, generation, state, runner_version, result_signature |
| `principal_restriction` | principal, kind, attempt_id, until |
| `accommodation` | account_id, multiplier, granted_by, reason_code, expires_at |

## 7. States and transitions
SM-ATTEMPT t1–t10; SM-EVIDENCE creation by issuer; SM-MODCASE for integrity. Forbidden: `unverified → passed`; edits after submit; minting from non-`passed`.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | start p95 ≤ 400 ms; autosave p95 ≤ 150 ms; auto-grade p95 ≤ 5 s; runner end-to-end p95 ≤ 60 s for suites ≤ 30 s |
| Reliability | timer correctness independent of job lag; grading idempotent; runner outage degrades to `unverified`, never to wrong grades |
| Security | answer keys never in client payloads; runner network-less (ADR-T13); signed results; restriction checks in gateway not UI |
| Privacy | signals minimised; no recordings; retention of signals {90 d} unless case open |
| Fairness | accommodations; disclosure; human review; false-positive monitoring |
| Accessibility | WCAG 2.2 AA; time extensions; no mandatory fullscreen or camera |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Browser crash/closed mid-attempt | resume on same device or another within deadline; second simultaneous session blocked |
| Network lost during final minutes | local cache replays on reconnect if before deadline; otherwise last server autosave graded |
| Auto-submit job delayed | any request after the deadline triggers lazy submission; late answers rejected |
| Runner returns bad signature or mismatched snapshot hash | result discarded; retry; ultimately `unverified` |
| Runner outage during peak | queue backs up; candidates see "grading in progress"; SLA alert; after budget ⇒ `unverified` with re-grade later |
| Gateway cache misses restriction | restriction table is authoritative and checked inline; cache TTL ≤ 5 s and fail-closed for restricted principals |
| Integrity false positive | reviewer clears; evidence minted; candidate notified |
| Duplicate evidence mint on retry | idempotent by `attemptId` |
| Assessment version retired mid-attempt | attempt continues on its version |
| Clock drift between app nodes | all deadlines computed from DB time |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-07-02-01 | cooldown not elapsed (23 h 59 m) | start | `409 cooldown`; at 24 h 00 m accepted | Boundary |
| AC-07-02-02 | client clock set 2 h back | start and view timer | deadline and remaining time derive from server only | Security |
| AC-07-02-03 | autosave of question 3 sent twice and out of order (seq 5 then 4) | PUT | stored value is seq 5; no error | Idempotency |
| AC-07-02-04 | disconnect at minute 10 of 30, reconnect at minute 12 | resume | same attempt, same question, timer at minute 12 | Recovery |
| AC-07-02-05 | deadline passed, no submit | job delayed 10 min then runs | answers as of deadline graded; later PUT answers rejected `409` | Time |
| AC-07-02-06 | attempt open on device A | start/join on device B | second session refused with explanation | Concurrency |
| AC-07-02-07 | accommodation 1.5 on 40-min test | start | deadline = 60 min | Happy |
| AC-07-02-08 | any client | fetch attempt payload | no answer keys, no grading config | Security |
| AC-07-05-01 | `AI_PROHIBITED` attempt `in_progress` | candidate calls AI endpoint via UI, API client, or another remote | `403 ai_prohibited` each time; signal logged; attempt unaffected | Security |
| AC-07-05-02 | deadline + 5 min passed | candidate calls AI | allowed (subject to quota) | Boundary |
| AC-07-05-03 | assessment with `AI_ALLOWED` | attempt starts | cannot mint evidence (publish blocked) | Negative |
| AC-07-05-04 | in assessment UI | open page | persistent banner; AI controls absent | UX |
| AC-07-04-01 | `code` assessment, no runner | submit | state `unverified`; zero evidence rows; explanatory message; no score displayed | Honesty |
| AC-07-04-02 | runner ships; attempt 20 days old | re-grade job | graded normally; pass mints evidence | Recovery |
| AC-07-04-03 | attempt 31 days old | re-grade job | stays `unverified`; candidate prompted to retake | Boundary |
| AC-07-03-01 | submission opens a network socket | run | connection fails; test reports failure | Security |
| AC-07-03-02 | infinite loop | run | killed at wall limit; that test fails; attempt gradable | Negative |
| AC-07-03-03 | output exceeds 64 KB | run | truncated; test fails if output compared | Boundary |
| AC-07-03-04 | result with wrong signature or hash | submit to `/internal/runner/result` | `403`; ignored; job retried | Security |
| AC-07-03-05 | runner crashes 3 times | grading | `unverified (runner_unavailable)` | Recovery |
| AC-07-03-06 | two workers grade same attempt | both finish | only highest-generation result stored (fenced) | Concurrency |
| AC-07-06-01 | threshold 70, score 69.99 and 70.00 | grade | fail / pass | Boundary |
| AC-07-06-02 | passed auto-graded attempt | mint | one evidence item at `authority_verified` with issuerRef | Happy |
| AC-07-06-03 | mint job retried 3 times | replay | still one item (INV-T27) | Idempotency |
| AC-07-06-04 | failed attempt | read evidence | no item | Negative |
| AC-07-06-05 | passed but integrity-flagged | grade | evidence not minted until reviewer clears; then minted once | Edge |
| AC-07-07-01 | high blur count only | flagged | case opened; attempt not failed; candidate sees signal list | Fairness |
| AC-07-07-02 | reviewer voids | decision | attempt `voided`; any minted evidence revoked; notice with appeal | Happy |
| AC-07-07-03 | appeal | assign | reviewer ≠ original | Process |
| AC-07-08-01 | 3 attempts in 7 days | 4th start | `409 attempt_cap` | Boundary |

## 11. Testing
SM-ATTEMPT matrix (all transitions and forbidden pairs). Property tests for scoring (monotonicity, bounds). Gateway test matrix: restricted principal × route × client type. Runner conformance suite (network, FS, resource, determinism, signature). Chaos: kill grader mid-job; delay scheduler; duplicate queue delivery. Time tests with controllable clock. Accessibility audit of timer and navigator. Fairness review of signal thresholds before enabling any flagging.

## 12. Developer guidance
Ship order: auto-graded path → fallback + AI restriction → integrity signals/case → runner. Never let the front end decide pass/fail or time. Pitfalls: storing answer keys with questions in the client bundle; counting a `unverified` attempt toward "assessments passed"; treating AI-block logs as proof of cheating. Decisions pending: runner technology (architecture doc), per-language support, whether to reveal correct answers after pass, signal retention length.

## 13. Related
`ADR_REGISTER.md` ADR-T12, T13 · `STATE_MACHINES.md` SM-ATTEMPT · `DECISION_TABLES.md` DT-10 · `BUSINESS_RULES_REGISTRY.md` BR-T024…T030 · SPEC-03 (issuance), SPEC-06 (course assessments), SPEC-12 (AI quota).

---

# SPEC-06 Course Enrolment & Completion → Evidence

**Metadata:** Doc ID SPEC-06 · Owner: Learning PM · Version 1.0 · Status Under Review · Phase 1 (free + platform-authored), Phase 2 (paid, instructor-authored) · Priority P0 · Features: FEAT-08-01, FEAT-08-02, FEAT-08-03, FEAT-08-04, FEAT-08-08, FEAT-16-09 · Modules: MOD-LRN · `api/learning`, `api/billing`, `api/evidence`, `apps/worker` · Relates: SM-ENROLMENT, BR-T031…T034, INV-T17, INV-T27, ADR-T10, ADR-T14

## 1. Business purpose
"Learn" must feed "Prove": finishing a course produces graded evidence automatically, not a PDF the learner must self-describe. This feature covers discovery, enrolment (free and paid), progress that survives bad networks, rule-based completion, and the hand-off to evidence. Value: GOAL-04 (completion→evidence rate), institutional use (SPEC-14).

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-ANON | browse catalogue and public course pages | `course:read:public` |
| ROLE-CAND (learner) | enrol, learn, drop, review | `enrolment:write:own` |
| ROLE-INST | see enrolments and progress of own courses (aggregate + per learner within course), sign off completion | `course:read:learners`, `completion:signoff` |
| ROLE-FAC | cohort-scoped progress (aggregate default) | `course:read:cohort` |
| ROLE-MOD | takedown a course | `course:takedown` |
| System | track progress, evaluate rules, issue evidence | worker |

## 3. Functional behavior
### 3.1 Course model (as consumed)
`course` → immutable `course_version` → ordered `module`s → `lesson`s of type {`video`, `text`, `quiz`, `assessment_link`, `assignment` (Phase 2)}. Each lesson: stable `lessonKey`, `optional` flag, estimated minutes, captions/transcript required for video (FEAT-08-03.3). A `completion_rule` is stored per version: `{requiredLessonKeys (default all non-optional), requiredAssessments[{assessmentId, minScore}], instructorSignoff: boolean}`. `price`: null/0 ⇒ free. `prerequisites[]`: courses completed and/or skills with confidence ≥ {level}.

### 3.2 Enrolment (FEAT-08-02)
| Step | Rule |
|---|---|
| Idempotency | `POST /courses/{id}/enrolments` with `Idempotency-Key`; natural key `(account, course)`: second call returns the existing enrolment |
| Checks | course published; learner account active; prerequisites met else `409 prerequisites_unmet` with list; not sanctioned; plan gate (FEAT-08-08 lock reasons: `prerequisite`, `plan`, `region`) |
| Free | ⇒ `active` (SM-ENROLMENT t1) pinned to current `course_version` |
| Paid | ⇒ `pending_payment` (t2); client is sent to checkout (SPEC-12). **Return from checkout grants nothing** (INV-T17); access begins on t3 from the verified webhook; `expired` after 24 h (t4) |
| Drop/re-enrol | t6/t7, progress kept 90 d |

### 3.3 Progress (FEAT-08-03)
Events `{enrolmentId, lessonKey, courseVersion, kind ∈ {started, position, completed}, positionSeconds?, clientSeq}`. Server stores per lesson `max(clientSeq)`; `completed` is sticky; `position` never decreases completion state. Idempotent on `(enrolmentId, lessonKey, kind, clientSeq)`. A `video` lesson counts complete when watched ≥ {90 %} of duration with seek-skipping > {25 %} not credited **or** instructor marks "no minimum" **[OPEN]**; `quiz` lessons need pass per quiz rule; `assessment_link` completes on `assessment.passed` (SPEC-05).
Offline (ADR-T10): designated lessons (text, transcripts, downloadable video **[OPEN]**) may be cached for reading/watching; progress events queue locally and replay; the server decides completion (INV-T13). Resume position stored per lesson; `FEAT-08-03.4` conflicts resolved by server max.

### 3.4 Completion evaluation (FEAT-08-04)
Triggered after each progress/assessment event and by a nightly sweep. Rule: all `requiredLessonKeys` complete **and** each required assessment passed at ≥ `minScore` **and** (if `instructorSignoff`) a sign-off exists. Rules are those of the enrolment's pinned `course_version` (BR-T031); if the instructor publishes a new version, the learner is offered an optional "move to latest" with progress mapped by `lessonKey`; never forced.
On true: set `completed` (t5), outbox `course.completed`. With `instructorSignoff=true` the enrolment stays `active` with attribute `completion_pending_signoff=true` and the instructor receives a task; `completed` is set on sign-off.
Evidence minting: consumer calls the evidence issuer API with `(issuer=course:<id>@<version>, sourceRef=enrolmentId)`: type `course_completion`, rung `authority_verified` when completion is rule-based/auto-verifiable or instructor-signed-off, skills = course skills, title = course title + version, period = enrolment dates. Exactly once (BR-T032, INV-T27 analogue). Learner is notified and offered next steps (add to profile, related assessments, gap analysis).

### 3.5 Refund, takedown, suspension
Refund per policy (BR-T097): before completion ⇒ `refunded` (t8) and access removed; after completion only by human exception (t9) and the linked evidence is then revoked by a **human** issuer (BR-T012). Course takedown (moderator): existing enrolees keep access unless the takedown reason is safety/legal; new enrolments blocked. Learner sanction ⇒ `suspended` (t10).

### 3.6 Side effects & postconditions
Events: `enrolment.created`, `enrolment.activated`, `lesson.completed`, `course.completed` (seed), `evidence.created`. Notifications: enrolment confirmed, payment pending/failed, completion + evidence, sign-off pending (instructor). Postcondition: `completed` ⇔ rule satisfied at pinned version (verifiable by recomputation); one evidence item per completed enrolment.

## 4. User interaction
SCR-COURSE-LIST (filters: skill, level, price, duration, language, accessibility features); SCR-COURSE-DETAIL (syllabus, prerequisites with met/unmet states, price, captions available, "what evidence you'll earn"); SCR-ENROL-CONFIRM; SCR-LESSON (player: captions on by default if available, keyboard shortcuts, speed 0.5–2×, transcript panel, next-lesson focus management, reduced-motion respected); SCR-MY-LEARNING (progress, resume, locked reasons); SCR-COMPLETION (celebration without confetti dependence, evidence link). Payment pending state: "We're confirming your payment" with auto-refresh (poll/SSE) up to 2 min then email. Mobile: lesson text and quiz usable one-handed; video adaptive. Offline badge on cached lessons.

## 5. Backend behavior
`api/learning` owns courses/enrolments/progress; `api/billing` raises `entitlement.changed`/`purchase.fulfilled` consumed by learning to activate paid enrolments (idempotent on payment event id); `apps/worker` runs completion sweep and expiry of unpaid enrolments. Public service interface exposes `learning.getEnrolmentState`, `learning.markAssessmentPassed` (consumer of `assessment.passed`).

| Endpoint (provisional) | Method |
|---|---|
| `/courses`, `/courses/{id}` | GET |
| `/courses/{id}/enrolments` | POST (Idempotency-Key) |
| `/me/enrolments`, `/me/enrolments/{id}` | GET; DELETE = drop |
| `/me/enrolments/{id}/progress` | POST batch of events |
| `/me/enrolments/{id}/migrate` | POST (opt-in to latest version) |
| `/instructor/enrolments/{id}/signoff` | POST |

## 6. Data
| Entity | Key fields |
|---|---|
| `course`, `course_version` | id, version, rule JSON, price, prerequisites, published_at |
| `lesson` | course_version_id, lesson_key, type, optional, duration, captions_ref |
| `enrolment` | id, account_id, course_id, course_version, state (SM-ENROLMENT), completion_pending_signoff, completed_at, evidence_id, payment_ref |
| `lesson_progress` | enrolment_id, lesson_key, status, position_s, max_client_seq, updated_at |
| `signoff` | enrolment_id, instructor_id, at, note |
Unique `(account_id, course_id)` among non-terminal enrolments.

## 7. States and transitions
SM-ENROLMENT t1–t10. Forbidden: `completed → active`, completion without recomputed rule, unlock from payment redirect.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | catalogue p95 ≤ 300 ms; progress batch p95 ≤ 200 ms; completion evaluation ≤ 2 s after final event |
| Reliability | progress events idempotent; evidence issuance exactly-once effect |
| Accessibility | captions/transcripts mandatory to publish video; keyboard-operable player; WCAG 2.2 AA |
| Offline | read cache + queued progress; revalidated |
| Cost | video delivery via CDN; offline video only if cost model accepted |
| Privacy | learning activity visible to instructor only within their course; institutions per BR-T100 |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Double-click enrol | single enrolment (idempotent) |
| Payment webhook delayed | "processing" state; no access; auto-activates when event arrives; unpaid for 24 h ⇒ `expired` |
| Progress events arrive out of order or duplicated | max-seq wins; no regression |
| Learner completes offline, device lost | nothing is completed until events reach the server |
| Course updated mid-enrolment | pinned version continues; optional migration |
| Evidence issuance fails | enrolment stays `completed`; issue job retried (SM-BGJOB); dead-letter alert; learner sees "evidence pending" |
| Instructor never signs off | reminder at 3 and 7 days; escalate to course owner; learner sees "awaiting sign-off" |
| Refund after completion | only by human exception; evidence revoked by human issuer with notice |
| Prerequisite skill confidence drops after enrolment | enrolment unaffected (checked at enrol time only) |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-08-02-01 | free course, prerequisites met | POST enrol twice (same key, then new key) | one enrolment `active`; both calls return it | Idempotency |
| AC-08-02-02 | unmet prerequisite | enrol | `409 prerequisites_unmet` listing items; no enrolment | Negative |
| AC-08-02-03 | paid course | enrol | `pending_payment`; lesson endpoints `403` | Happy |
| AC-08-02-04 | checkout success redirect, no webhook yet | open lesson | still `403`; status page says processing (INV-T17) | Security |
| AC-08-02-05 | verified payment webhook | processed | enrolment `active` exactly once even if event redelivered | Idempotency |
| AC-08-02-06 | unpaid for 24 h | sweep | `expired` | Time |
| AC-08-02-07 | dropped 89 d ago vs 91 d ago | re-enrol | progress restored / fresh start | Boundary |
| AC-08-08-01 | course locked by plan | learner opens | lock reason displayed; enrol blocked | Negative |
| AC-08-03-01 | `position` events seq 7 then 5 | process | stored position from seq 7 | Idempotency |
| AC-08-03-02 | `completed` event for lesson, then `started` event later | process | lesson remains completed | Edge |
| AC-08-03-03 | offline progress queued then sync | reconnect | accepted idempotently; conflicts resolved by max seq | Recovery |
| AC-08-03-04 | video w/o captions | instructor publishes | publish blocked with reason | Accessibility |
| AC-08-03-05 | keyboard only | complete lesson and navigate next | all controls operable; focus order logical | Accessibility |
| AC-08-04-01 | last required lesson done, all assessments passed | event | enrolment `completed`; `course.completed` once | Happy |
| AC-08-04-02 | one required assessment not passed | all lessons done | stays `active` | Negative |
| AC-08-04-03 | `instructorSignoff=true` | all criteria met | `completion_pending_signoff`; instructor task; `completed` after sign-off | Happy |
| AC-08-04-04 | `course.completed` redelivered 3 times | consumer | exactly one `course_completion` item at `authority_verified` | Idempotency |
| AC-08-04-05 | course new version published mid-enrolment | learner continues | completion judged on pinned version | Consistency |
| AC-08-04-06 | evidence issuer down | completion | enrolment `completed`, evidence created after retry; learner sees pending state | Recovery |
| AC-08-04-07 | refund after completion by human exception | decision | `refunded`; evidence revoked by human with reason | Edge |
| AC-16-09-01 | paid course purchase | webhook order inverted (invoice before checkout) | final state correct, single activation | Concurrency |

## 11. Testing
SM-ENROLMENT matrix; idempotency suite for enrol and progress; webhook replay and ordering tests (shared with SPEC-12); completion-rule property tests (monotonic, version-pinned); offline/queue tests with network throttling; accessibility audit on player; issuer replay tests; load test for progress batches (peak 10k concurrent learners **[OPEN]**).

## 12. Developer guidance
Build order: catalogue → free enrolment → progress → completion rule engine → evidence hand-off → paid enrolment → sign-off. Keep the rule evaluator pure and shared with the nightly sweep. Pitfalls: computing completion in the client; using floating percentage thresholds without defining rounding; binding evidence to course title strings instead of `course_version`. Decisions pending: offline video, video-watch threshold, instructor sign-off SLAs, refund window (OPEN-06).

## 13. Related
`STATE_MACHINES.md` SM-ENROLMENT · `BUSINESS_RULES_REGISTRY.md` BR-T031…T034, T097 · SPEC-03 · SPEC-05 · SPEC-12 · SPEC-14.
