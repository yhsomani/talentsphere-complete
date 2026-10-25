# Feature Specifications — Group 2: Evidence, Verification & Referees

Doc ID: SPEC-G2 · Owner: Product Director + Evidence/Verification leads · Version 1.0 · Status: Under Review · Relates: DOM-05, DOM-06, FEAT-05-01, FEAT-05-02, FEAT-05-04, FEAT-05-05, FEAT-05-07, FEAT-05-08, FEAT-05-12, FEAT-03-07, FEAT-06-01…06-04, FEAT-06-09, FEAT-06-10, SM-EVIDENCE, SM-VERIFICATION, SM-REFERENCE, DT-04, DT-06, BR-T003…T023, INV-T04, INV-T05, INV-T08, INV-T22…T25, ADR-T14

Conventions: see `README.md`. Endpoints provisional under `/api/v1`. All **[TARGET]**; `{…}` **[OPEN]**.

---

# SPEC-03 Evidence Creation, Evidence Ladder & Revocation Impact

**Metadata:** Doc ID SPEC-03 · Owner: Evidence PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-05-01, FEAT-05-02, FEAT-05-04, FEAT-05-05, FEAT-05-07, FEAT-05-08, FEAT-05-12 · Modules: MOD-CAND · `api/evidence`, `api/platform`, `apps/worker` · Relates: ADR-T14, INV-T04, INV-T08, INV-T22, INV-T23, INV-T25, INV-T28, BR-T003…T015, BR-T005, SM-EVIDENCE, DT-06

## 1. Business purpose
Evidence is the product's core asset (ADR-T01). This feature lets a candidate turn work, credentials and results into structured, graded items; assigns each an honest rung on the evidence ladder `claimed → artifact-backed → peer-attested → authority-verified` with provenance; and guarantees that when support for an item disappears the whole system tells the truth (skills, matches, recruiter views) without manual cleanup. Value: GOAL-01 (≥ 3 items at rung ≥ artifact-backed), GOAL-03 (explainable matches depend on rung).

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-CAND | create/edit/withdraw own evidence; request attestation; share (via consent) | `evidence:write:own` |
| ROLE-INST, issuers (platform course, assessment engine, ROLE-INSTADM) | mint `authority_verified` items for learners in their scope; revoke what they issued | `evidence:issue`, `evidence:revoke:issued` |
| ROLE-REC / ROLE-HM / ROLE-ORGADM | read per DT-01 (snapshot or live consent) | `evidence:read:consented` |
| ROLE-MOD | open review, revoke after human decision | `evidence:revoke:case` |
| ROLE-SUP / ROLE-ADM | read under grant only; **cannot** edit rung or content | `evidence:read:granted` |
| System | scan, liveness-check, recompute | worker |
Nobody can set `rung` directly, including admins (INV-T04).

## 3. Functional behavior
### 3.1 Inputs and validation
| Field | Rule | Error |
|---|---|---|
| type | user-created ∈ {`project`, `work_sample`, `publication`, `certificate_external`, `contribution`, `other`}; system-created ∈ {`course_completion`, `assessment_result`, `reference_attestation`, `institution_credential`} (clients cannot create these) | `422` / `403` |
| title | 1–120 | `422` |
| description | ≤ 2,000 plain text | `422` |
| skills | 1–10 canonical skill IDs (BR-T006); deprecated skills rejected | `422 skills_required` |
| period | `start` ≤ `end` ≤ today, or `ongoing` | `422` |
| artefacts | 0–{20} files, each ≤ {25 MB}; allowlist {pdf, png, jpg, webp, txt, md, csv, docx, pptx, mp4}; archives (zip/tar) not accepted in Phase 1 | `413` / `415` |
| links | 0–10 `https` URLs | `422` |
| aiAssisted | boolean declaration; has no effect on rung (BR-T007) | — |
| source | server-set only; a client-supplied `source=ai` ⇒ `422 source_forbidden` (INV-T08) | `422` |
| Idempotency-Key | required on create/submit (FF-07) | `400` |

### 3.2 Rules and calculations
1. **Rung** is computed by DT-06 from valid provenance records; stored as a cache column with `computed_at`; **reads recompute from validity** so a revoked supporter cannot leave a stale verified display (INV-T25).
2. **Provenance record** = `{id, evidenceId, kind ∈ {artefact_scan, link_liveness, attestation, issuer_verification, employer_domain_proof, referee_confirmation}, issuerRef, createdAt, validUntil?, revokedAt?, dataHash}`.
3. **Artefact pipeline (FEAT-05-12):** upload → object store `quarantine/` bucket (private) → scan + content-type sniff + image re-encode stripping EXIF location → promote to `clean/` on pass → derive thumbnails. Evidence stays `pending_scan` until clean (BR-T003). Download via signed URL, `Content-Disposition: attachment` for non-images (BR-T116).
4. **Link liveness (05-01.2):** DNS resolve; reject loopback, link-local, private and cloud-metadata ranges; ≤ 3 redirects; 5 s timeout; response size cap; success only on HTTP 200 content; repeated every 30 d; failing 14 consecutive days ⇒ provenance record invalid ⇒ rung recompute (BR-T009).
5. **Duplicate signal:** identical artefact hash on two accounts ⇒ internal flag for human review; never auto-action (INV-T20).
6. **Authority issuance (05-04):** only registered issuer services call `POST /internal/evidence/issue` with a signed service identity (ROLE-SVC); issuers: platform course completion (SPEC-06), auto-graded assessment pass (SPEC-05), verified institution (SPEC-14), verified employer org. Issuance is idempotent on `(issuer, sourceRef)` (BR-T027, BR-T032).
7. **Revocation (05-05):** human issuer or moderator supplies reason ∈ {`issuer_withdrawn`, `fraud_confirmed`, `policy_violation`, `error_correction`, `legal`}; SM-EVIDENCE t8. Impact pipeline (same transaction writes state + audit + outbox `evidence.revoked`; worker does the rest): (a) recompute skill confidence for each tagged skill (FEAT-04-04) (b) recompute matches/explanations for the owner (FEAT-11-07) (c) update search index (d) notify holder ≤ 24 h with reason category and appeal path (e) for already-submitted application snapshots, recruiter views overlay `Revoked on <date>` — the snapshot itself is not edited (INV-T28).
8. **Withdrawal (owner):** SM-EVIDENCE t9; recipients lose live access; snapshots keep tombstones (BR-T013).
9. **Appeal:** within 30 d via moderation case (SM-MODCASE t6); if upheld, a **new** evidence item is created with `supersedes=<old id>` and provenance re-validated; the old item stays `revoked`.
10. **Sharing (05-07):** evidence is `private` unless covered by `evidence.share_summary` (all verified orgs: titles, skills, rung; needs `search.discoverable`) or `evidence.share_artefact` (specific org, optionally one item) or an application snapshot (`application.share_snapshot`; DT-01). Scope ids: Consent Scope Catalogue.

### 3.3 Side effects and postconditions
Events: `evidence.created`, `evidence.verified` (rung rises), `evidence.revoked`, `evidence.rung_changed` (proposed event; not in the domain seed list). Audit on every state or rung change. Postconditions: rung = DT-06(valid provenance); revoked item excluded from skill confidence, matches, search, share links; counts in "evidence strength" exclude non-`active` items.

## 4. User interaction
| Screen | Behaviour |
|---|---|
| SCR-EVIDENCE-NEW | stepper: type → details → skills (typeahead from taxonomy only) → attach (drag-drop, camera capture on mobile, link) → review; autosave as `draft`; upload progress with resume on flaky networks (chunked/tus-style, **[OPEN]** protocol) |
| SCR-EVIDENCE-DETAIL | rung chip + "What this means" popover; provenance timeline; actions: add attestation request, withdraw; `Claimed` items show a neutral "Not verified" label (never a green tick) |
| SCR-EVIDENCE-LIST (05-08) | filter by rung, skill, type; "next best evidence" hints from gap analysis (never auto-created) |
| SCR-REVOKED-NOTICE | reason category, effect (skills/matches updated), appeal button, deadline |
Offline: read cache only; creation requires connectivity (consequential, ADR-T10), though the draft form may be saved locally and uploaded later with explicit user action. A11y: drag-drop has a button alternative; progress announced politely; chips use text + icon, not colour alone.

## 5. Backend behavior
Flow for submit: validate → create `evidence` (`draft`→`pending_scan` or `active`) → enqueue scan/liveness job (SM-BGJOB) → on result worker calls domain `applyProvenance()` (DT-06) → writes rung + outbox. Revocation handler `evidence.revoked` consumers: skills (recompute), matching (recompute), search (reindex), notify, application (overlay cache bust). All consumers idempotent on `event_id` (INV-T37). Public interface for other modules: `evidence.getForViewer(principal, id)` which applies DT-01 and returns rung computed from validity.

| Endpoint (provisional) | Method |
|---|---|
| `/me/evidence` | POST create draft / GET list |
| `/me/evidence/{id}` | GET / PATCH (draft or active text fields) / DELETE (withdraw) |
| `/me/evidence/{id}/submit` | POST (Idempotency-Key) |
| `/me/evidence/{id}/artefacts` | POST upload init (returns signed upload) |
| `/evidence/{id}/revoke` | POST (moderator/issuer; reason) |
| `/me/evidence/{id}/appeal` | POST |
| `/internal/evidence/issue` | POST (ROLE-SVC only) |

## 6. Data
| Entity | Key fields |
|---|---|
| `evidence` | id, owner_id, type, title, description, skills[], period, state (SM-EVIDENCE), rung (cache), rung_computed_at, source, ai_assisted, supersedes_id, version |
| `evidence_artefact` | id, evidence_id, object_key, sha256, size, mime, scan_state, scanned_at |
| `evidence_link` | id, evidence_id, url, last_checked_at, last_ok_at, failing_since |
| `provenance` | as §3.2 |
| `evidence_revocation` | evidence_id, reason, actor_id, case_id, at |
Retention: artefacts and metadata until withdrawal/erasure; revocation records kept (minimised) for appeal and audit {OPEN-08}.

## 7. States and transitions
SM-EVIDENCE t1–t11 and rung rules (this spec implements all). Forbidden: any → rung field write; revoked → active; client creation of system types.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | evidence create (metadata) p95 ≤ 250 ms; scan completion p95 ≤ 60 s for ≤ 25 MB; revocation→recompute p95 ≤ 15 min (BR-T076) |
| Security | virus scan; SSRF-hardened fetcher; signed URLs ≤ 5 min; no artefact served from the app origin; EXIF stripping |
| Privacy | artefacts private by default; erasure deletes blobs (BR-T065) |
| Reliability | scan dead-letter alerts; recompute idempotent; no promotion without clean verdict |
| Accessibility | alt-text field for image artefacts; captions for video evidence recommended, required for recruiter-facing "showcase" video **[OPEN]** |
| Cost | storage lifecycle: quarantined blobs deleted after 30 d; per-user storage cap {1 GB} free |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Scan service unavailable | item stays `pending_scan`; retries per SM-BGJOB; dead-letter ⇒ ops alert; never auto-clean |
| Upload interrupted | resumable; abandoned uploads reaped after 24 h |
| Link host slow/unreachable at submit | item saved at `claimed` with "link not yet checked"; re-check scheduled |
| Revoke and withdraw race | one wins by version; other `409`; final state consistent and audited |
| Recompute job fails | retries; meanwhile reads already reflect lower rung (INV-T25) |
| Issuer service replays mint | idempotency returns same item |
| Appeal after 30 d | `422 appeal_window_closed`; support may open a manual case |
| Malware found after promotion (new signatures) | rescan sweep quarantines retroactively; recipients lose access; owner notified (neutral) |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-05-01-01 | claim-only payload with 1 skill | submit | state `active`, rung `claimed`, `evidence.created` | Happy |
| AC-05-01-02 | 0, 1, 10, 11 skills | submit | 0 and 11 ⇒ `422`; 1 and 10 accepted | Boundary |
| AC-05-01-03 | payload with `source=ai` or `rung=authority_verified` | POST | `422`; nothing stored | Negative/Security |
| AC-05-01-04 | file of 25 MB and 25 MB + 1 byte; `.exe` | upload | accepted / `413` / `415` | Boundary |
| AC-05-01-05 | same Idempotency-Key submitted twice | submit | exactly one item | Idempotency |
| AC-05-01-06 | link to `http://169.254.169.254/` or private IP | submit | rejected `422`; no outbound request made | Security/SSRF |
| AC-05-01-07 | link returns 404 | liveness | item stays `claimed`; owner warned; re-check scheduled | Negative |
| AC-05-01-08 | draft untouched 83 and 90 days | sweeper | notice at day 83; deleted at day 90 | Time |
| AC-05-12-01 | item `pending_scan` | any other user requests artefact or lists item | `404`; not in search or shares | Security |
| AC-05-12-02 | scan verdict positive | worker completes | `quarantined`; owner notified; never visible to others | Negative |
| AC-05-12-03 | scanner down 2 h | worker retries | item remains `pending_scan`; no promotion; alert after dead-letter | Recovery |
| AC-05-12-04 | JPEG with GPS EXIF | view served file | served derivative has no GPS tags | Privacy |
| AC-05-02-01 | clean artefact | scan passes | rung `artifact_backed`; provenance `artefact_scan` exists | Happy |
| AC-05-02-02 | any client | PATCH `rung` | `422`/`405`; unchanged | Security |
| AC-05-02-03 | valid attestation added, then revoked | recompute | rung `peer_attested` then back to `artifact_backed`; both transitions audited | Happy |
| AC-05-02-04 | `claimed` item displayed to anyone | render | label "Not verified"; no verified styling anywhere (UI test) | Honesty |
| AC-05-04-01 | course-completion issuer mints twice with same `sourceRef` | issue | one item at `authority_verified` | Idempotency |
| AC-05-04-02 | candidate token calls issue endpoint | POST | `403` | Security |
| AC-05-05-01 | moderator revokes with reason `fraud_confirmed` | confirm | state `revoked`; `evidence.revoked`; holder notified ≤ 24 h with appeal link | Happy |
| AC-05-05-02 | revoke without reason or by non-human actor | POST | `422` / `403` | Negative |
| AC-05-05-03 | revoked evidence supported a skill and a match | recompute | skill confidence lower and match explanation refreshed ≤ 15 min p95; audit entries exist | Happy |
| AC-05-05-04 | evidence inside an already-submitted application | recruiter opens application | item shows "Revoked on <date>" overlay; stored snapshot bytes unchanged | Consistency |
| AC-05-05-05 | revoked item | reactivate attempt | `409 invalid_transition` | Negative |
| AC-05-05-06 | owner withdraw and moderator revoke simultaneously | both submit | one succeeds, other `409`; final state valid | Concurrency |
| AC-05-05-07 | recompute worker down | read evidence after revoke | displayed rung already reflects revocation | Recovery |
| AC-05-05-08 | appeal upheld | reviewer decides | new item with `supersedes`; old stays `revoked` | Happy |
| AC-05-07-01 | per-employer artefact grant to Org A | Org A opens; Org B opens | allowed / denied | Negative/IDOR |
| AC-05-07-02 | grant revoked | Org A next fetch | denied ≤ 60 s | Timing |
| AC-05-08-01 | filter rung = peer_attested | list | only matching items | Happy |

## 11. Testing
State-machine matrix (SM-EVIDENCE). Property test: for random provenance sets, `computeRung` equals DT-06 and never exceeds the highest valid record. Integration: EICAR-style fixture, SSRF fixtures, revoke→recompute chain with outbox. Security: IDOR on evidence and artefact URLs; signed URL expiry. E2E: create→scan→share→revoke→recruiter overlay. Visual honesty test: snapshot test failing if any green-check component renders for rung `claimed`.

## 12. Developer guidance
Build order: evidence core + SM → artefact pipeline → rung computation → issuer API → revocation pipeline → sharing. Keep `computeRung` pure and in `packages/domain`; the DB column is a cache. Pitfalls: treating `verified` as a boolean in the UI; fetching links from the API process without the hardened fetcher; letting search return stale rung. Decisions pending: upload protocol; storage caps; whether video evidence ships in Phase 1; **OPEN-08** retention of revocation records.

## 13. Related
`ADR_REGISTER.md` ADR-T14 · `STATE_MACHINES.md` SM-EVIDENCE · `DECISION_TABLES.md` DT-06, DT-01 · `BUSINESS_RULES_REGISTRY.md` BR-T003…T015 · SPEC-04 (referee/work history), SPEC-05, SPEC-06, SPEC-09.

---

# SPEC-04 Work-History Verification & Tokenised Referee Flow

**Metadata:** Doc ID SPEC-04 · Owner: Verification PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-03-07, FEAT-06-01, FEAT-06-02, FEAT-06-03, FEAT-06-04, FEAT-06-09, FEAT-06-10 · Modules: MOD-CAND, MOD-HIR (display) · `api/verification`, `api/profile`, `apps/worker` · Relates: INV-T05, INV-T20, INV-T24, BR-T004, BR-T016…T023, SM-VERIFICATION, SM-REFERENCE, DT-04, DT-06, ADR-T14

## 1. Business purpose
Employment history is the most-claimed, least-checked part of hiring. This feature gives a candidate two cheap ways to raise a work claim above `claimed`: (1) proof of control of an employer-domain mailbox, (2) one or more **referees** who confirm in under three minutes without an account. Value: GOAL-01/02, differentiator vs. résumé-only platforms. Risk it must control: collusion, referee harassment, phishing look-alikes.

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-CAND | create work claims; start verification; invite/cancel referee requests | `claim:write:own`, `verification:request:own` |
| ROLE-REFEREE (token, non-account) | open one request, answer once | `referee:respond:token` (single-use, INV-T05/T24) |
| ROLE-REC / ROLE-HM | read status/provenance per DT-01 | `verification:read:consented` |
| ROLE-MOD | resolve disputes and abuse flags | `verification:review` |
| System | send emails, reminders, expire | worker |

## 3. Functional behavior
### 3.1 Work claim (FEAT-03-07)
| Field | Rule |
|---|---|
| employerName | 1–120 |
| employerDomain | optional; registrable domain, lower-case, not a free-mail provider (list maintained) |
| title | 1–120 |
| employmentType | `full_time`, `part_time`, `contract`, `internship`, `self_employed`, `volunteer` |
| start / end | `start` ≥ 1950-01-01 and ≤ today; `end` ≥ `start` or `current=true` |
| description | ≤ 1,500 |
| skills | ≤ 10 canonical |
Overlapping claims allowed. Editing dates/employer of a **verified** claim creates a new claim version and resets its verification (old provenance stays bound to old version).

### 3.2 Employer-email proof (FEAT-06-01) — SM-VERIFICATION
Candidate enters an address `name@<employerDomain>`; the system checks the domain equals the claim's `employerDomain`, is not free-mail, and not blocked; sends a 6-digit code (hashed, TTL 15 min, ≤ 5 attempts, ≤ 3 resends/h, ≤ 3 requests/24 h per claim; BR-T016/T017). On success a provenance record `employer_domain_proof` (valid until claim version changes) is attached; rung ≥ `artifact_backed` (DT-06 row 3). It proves control of a mailbox at that domain **now**, not employment at the stated dates — the UI says exactly that.

### 3.3 Referee request (FEAT-06-02)
Inputs: `refereeName` 1–80; `refereeEmail` valid, ≠ any candidate email (BR-T018); `relationship` ∈ {`manager`, `peer`, `report`, `hr`, `client`, `other`}; `message` ≤ 300; candidate attests "this person may be contacted" and sees the exact text the referee will get. Limits: ≤ 3 open requests per claim, ≤ {10} referee emails/24 h (BR-T019).
Token: 32 random bytes, URL-safe, SHA-256 stored; link `/r/{token}`; TTL 14 d; **GET is side-effect free** (email security scanners prefetch links) and only POST consumes; `opened` is advisory.
Referee form (mobile-first, no login): shows candidate name, employer, title, dates, and "Report this request" link. Questions: Q1 *Did they work there during these dates?* (`yes` / `partly` / `no` / `dont_know_them`); Q2 if `partly` or `no`: which detail differs (dates / title / employer) + ≤ 200 chars; Q3 relationship confirmation; Q4 optional comment ≤ 500; Q5 "You may be named to recruiters" (unticked default; BR-T023). Submit ⇒ outcome mapping: `yes` ⇒ `confirm`; `no` ⇒ `dispute`; `partly` ⇒ `dispute` with `reason=dates_differ|title_differs`; `dont_know_them` ⇒ `unknown_candidate`; "Decline" button ⇒ `decline`.
Handling per DT-04, with refinement: `dispute` with `reason=dates_differ` and ≤ 3 months difference is shown to the candidate as "your referee suggests different dates" (candidate may correct the claim; nothing is shown to recruiters, no human case) — all other disputes follow DT-04 row 4.

### 3.4 Abuse detection (FEAT-06-09)
Signals, all **flag-only** (INV-T09/T20): referee submit from the same IP-hash/device-hash cluster as the candidate's recent sessions; referee email domain free-mail while claim has an employer domain (warning, not a block); same referee used by ≥ 5 unrelated candidates in 24 h; response in < 20 s from open; referee registered with the candidate within 24 h. A flag moves the response to "recorded, not counted" (DT-04 row 2) pending human review; the candidate sees only "under review".

### 3.5 Reminders & expiry (FEAT-06-10)
Worker sends reminder on day 4 and day 9 if still unanswered (max 2, BR-T022); marks `expired` at day 14 (SM-REFERENCE t4); bounces handled via provider webhooks; all jobs idempotent via `(request_id, reminder_no)`.

### 3.6 Display (FEAT-06-04)
Badges: `Not verified` (claimed), `Mailbox verified` (artifact-backed via domain proof), `Confirmed by referee` (peer-attested), `Employer confirmed` (authority; Phase 3 via verified org). A "What this means" popover states exactly what was checked. Referee identity appears only if named consent (BR-T023).

### 3.7 Side effects and postconditions
Events: `verification.requested`, `verification.completed`, `reference.requested`, `reference.reminded`, `reference.submitted` (proposed), each with outbox. After any outcome the owning evidence/claim rung is recomputed (DT-06). Postcondition: token unusable after submit/expiry/cancel (INV-T24).

## 4. User interaction
Candidate: SCR-CLAIMS (list with status chips), SCR-VERIFY-EMAIL-PROOF (code entry), SCR-REFEREE-INVITE (form + preview of email text + consent attestation), SCR-REFEREE-STATUS (per request: sent/opened/expired, reminder count, cancel). Referee: SCR-REFEREE-LANDING (single column, large controls, language auto-detected, ≤ 5 fields, progress-less), SCR-REFEREE-THANKS (no marketing; link to privacy notice; optional "how we use this"). Accessibility: referee page WCAG 2.2 AA, works with 200 % zoom, no timer. Phishing resistance: email contains candidate name and employer; page shows the same; the domain is the product's own; no attachments. Offline: none (online-only).

## 5. Backend behavior
Modules: `api/verification` owns requests/responses/tokens; `api/profile` owns claims; `api/evidence` consumes `verification.completed` to attach provenance. Referee page is served by the shell on a public route; its API (`/referee/{token}`) is separately rate-limited (per IP 20/h, per token 10/h) and returns identical `404` for unknown/expired/used tokens. Referee email stored encrypted (for sending) plus salted hash (anti-abuse counters); content removed after retention {12 months, OPEN-08}. Candidate-visible details of the response are limited to outcome + reason category (not free-text comment unless referee ticks "share my comment with the candidate").

| Endpoint (provisional) | Method |
|---|---|
| `/me/claims`, `/me/claims/{id}` | CRUD |
| `/me/claims/{id}/verify/email` | POST start; `/verify/email/confirm` POST code |
| `/me/claims/{id}/referees` | POST create request / GET list |
| `/me/referees/{reqId}` | DELETE cancel |
| `/referee/{token}` | GET read request (no side effect); POST submit |
| `/referee/{token}/report` | POST report suspicious request |

## 6. Data
| Entity | Key fields |
|---|---|
| `work_claim` | id, account_id, version, employer_name, employer_domain, title, type, start, end, current, description, skills[] |
| `verification_request` | id, claim_id, claim_version, method (`employer_email`), address_hash, code_hash, state (SM-VERIFICATION), attempts, expires_at |
| `reference_request` | id, claim_id, claim_version, referee_email_enc, referee_email_hash, relationship, token_hash, state (SM-REFERENCE), sent_at, expires_at, reminders_sent, submitted_at |
| `reference_response` | request_id, answers (JSON), outcome, reason, named_consent, share_comment_consent, submit_ip_hash, submit_device_hash, opened_to_submit_ms |
| `abuse_flag` | id, subject_ref, signal, created_at, case_id |
Invariants: INV-T05, INV-T22, INV-T24, INV-T43.

## 7. States and transitions
SM-VERIFICATION t1–t7; SM-REFERENCE t1–t6 (+ reminders). Forbidden: `submitted → any`; `verified → awaiting_proof`; submission after cancel.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Usability | referee median completion ≤ 3 min; ≥ 95 % complete on mobile browsers in usability test **[OPEN-07]** |
| Performance | referee page p95 TTFB ≤ 300 ms; submit ≤ 400 ms |
| Security | hashed tokens/codes; constant-time compare; per-IP/token rate limits; no PII in URLs; `Referrer-Policy: no-referrer`; `X-Robots-Tag: noindex` |
| Privacy | referee told what is stored and for how long; named-consent opt-in; erasure rights extend to referee data on request (support path) |
| Deliverability | SPF/DKIM/DMARC aligned sending; plain-text alternative; no link shorteners |
| Reliability | reminder job exactly-once per `(request, n)` |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Referee email bounces | `bounced`; candidate told to fix; no reminders |
| Mail scanner opens the link | `opened` may be set early; token not consumed; reminders continue per schedule |
| Referee double-submits / two devices | first POST wins (row lock); second sees "already answered" |
| Referee and candidate are the same person (alias address) | same-session/device-hash heuristics flag for review; rule BR-T018 blocks identical addresses only |
| Claim edited after request sent | requests bound to old `claim_version`; referee sees old text; result applies to old version only; candidate prompted to re-request |
| Candidate cancels after referee opened | token dead; referee sees neutral "request withdrawn" |
| Domain proof code email delayed | resend limits apply; code TTL not extended; user may restart after cooldown |
| Referee submits dispute | DT-04 row 4 path; candidate sees notice and may respond ≤ 7 d |
| Provider webhook lost | daily reconcile of `sent` requests older than 48 h without delivery receipt triggers a single retry |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-03-07-01 | start 2024-05-01, end 2024-04-01 | save claim | `422` | Negative |
| AC-03-07-02 | start in the future / before 1950 | save | `422`; today and 1950-01-01 accepted | Boundary |
| AC-03-07-03 | verified claim, change employer | save | new claim version; verification reset; old provenance bound to old version | Consistency |
| AC-06-01-01 | claim domain `acme.com`, address `a@acme.com` | request code | code emailed; stored hashed; never in API response or logs | Happy/Security |
| AC-06-01-02 | address `a@gmail.com` or other domain | request | `422 domain_mismatch` | Negative |
| AC-06-01-03 | code age 15:00 vs 15:01 | confirm | accepted / `422` | Boundary |
| AC-06-01-04 | 5 wrong codes, then right code | confirm | locked ⇒ `429`; state `failed` | Boundary |
| AC-06-01-05 | verified | read claim | rung `artifact_backed`; label "Mailbox verified"; popover states limits | Happy |
| AC-06-01-06 | 4th request within 24 h for one claim | request | `429` | Boundary |
| AC-06-02-01 | valid request | referee opens link on phone, no account | form renders ≤ 5 fields; submit works | Happy |
| AC-06-02-02 | scanner issues GET | then referee POSTs | token still valid; GET caused no state other than `opened` | Edge |
| AC-06-02-03 | two simultaneous POSTs | submit | exactly one response stored; other "already answered" | Concurrency |
| AC-06-02-04 | referee email equals candidate email | create | `422` | Negative |
| AC-06-02-05 | 4th open request on one claim | create | `422` | Boundary |
| AC-06-02-06 | no response | day 4 and day 9 | exactly 2 reminders (rerun job ⇒ still 2); day 14 `expired`; link ⇒ neutral 404 | Time/Idempotency |
| AC-06-02-07 | candidate cancels | referee opens link | neutral "withdrawn" page; no form | Negative |
| AC-06-02-08 | referee does not tick "may be named" | recruiter views attestation | "Confirmed by a former colleague"; no name | Privacy |
| AC-06-03-01 | outcome `confirm`, no flags | submit | rung ≥ `peer_attested`; candidate notified | Happy |
| AC-06-03-02 | outcome `dispute` (title differs) | submit | no downgrade, no recruiter flag until human review; candidate notice with 7-day response window | Negative |
| AC-06-03-03 | outcome `dispute` reason `dates_differ`, difference 2 months | submit | candidate sees suggestion; recruiters see nothing; no case | Edge |
| AC-06-03-04 | outcome `unknown_candidate` or `decline` | submit | no rung change; candidate told neutrally | Negative |
| AC-06-04-01 | claim at `claimed` | any viewer | label "Not verified"; no verified styling | Honesty |
| AC-06-09-01 | referee submit shares device-hash with candidate | submit | response recorded not counted; case opened; candidate sees "under review"; no auto-penalty | Abuse |
| AC-06-09-02 | same referee answers 5 unrelated candidates in 24 h | 5th submit | flagged for review (not blocked) | Abuse |
| AC-06-10-01 | job run twice for the same day | reminder job | one email per `(request, n)` | Idempotency |
| AC-06-10-02 | token past 14 d | referee POST | neutral `404`; no state change | Time |

## 11. Testing
Token suite (entropy length, hash-only storage, single use, expiry, constant-time compare, log scan). SM tests for SM-VERIFICATION and SM-REFERENCE incl. forbidden pairs. Concurrency tests on token consume. Email-scanner simulation (HEAD/GET prefetch). Abuse-signal unit tests with fixtures. E2E on a mobile viewport with Playwright, plus a usability script for the 3-minute target. Deliverability checks in staging (SPF/DKIM). Fairness check: no signal uses protected attributes.

## 12. Developer guidance
Build order: claims → email proof → referee request/response → DT-04 mapping → reminders/expiry → abuse flags → badges. Pitfalls: do not mark a click as consent; do not email the candidate the raw token; do not let the referee API distinguish unknown vs used tokens; avoid exposing referee free-text to candidates by default (retaliation risk). Decisions pending: **OPEN-07** usability evidence; **OPEN-08** retention of referee data; whether `partly` should have its own SM outcome in a later version (currently handled as `dispute` + reason).

## 13. Related
`DECISION_TABLES.md` DT-04, DT-06 · `STATE_MACHINES.md` SM-VERIFICATION, SM-REFERENCE · `BUSINESS_RULES_REGISTRY.md` BR-T016…T023 · SPEC-03 · SPEC-13 (referee data in erasure).
