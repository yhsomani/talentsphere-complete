# Micro-Feature Specifications

Doc ID: SPEC-MICRO · Owner: Product Director (Functional Spec) · Version 1.0 · Status: Under Review · Relates: `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` (every ID below exists there), BR-REG, INV-REG, DT-00, SM-00, SPEC-01…SPEC-14

> **Revision 2 folded in (2026-10-27)** from `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.

Compact, implementation-ready specs for small behaviours that need an unambiguous rule but not a full document. **[TARGET]**; `{…}` **[OPEN]**. Each row carries: **Rule** (what is always true), **Inputs/validation**, **Behaviour**, **Edge/failure**, **AC** (Given/When/Then in one line; ID `AC-<micro id>-NN`), **Test** (UT unit, IT integration, E2E, SEC, A11Y accessibility, PROP property). Phase and priority are inherited from the parent feature in the hierarchy. Where a micro-feature is fully specified in a long-form spec, the row points there instead of repeating.

## 1. Identity & access

| ID | Micro-feature | Rule · Inputs · Behaviour | Edge / failure | AC | Test |
|---|---|---|---|---|---|
| FEAT-01-01.2 | Breached-password check | Password hashed-prefix lookup (k-anonymity) against breach list; reject if present (BR-T051). Input: candidate password (never sent in full). | List unavailable ⇒ accept only ≥ 14 chars and schedule re-check (SPEC-01 §9) | AC-01-01.2-01: Given password in list, When register, Then `422 password_breached`, no account | UT, SEC |
| FEAT-01-01.4 | Enumeration-safe responses | Register/login/reset return the same status and body for known and unknown emails; existing-owner gets an informational email. | Latency difference ≤ noise floor in test harness | AC-01-01.4-01: Given known and unknown email, When request reset, Then identical body and status | SEC |
| FEAT-01-02.1 | Progressive lockout | After 5 consecutive failures per (account, IP bucket): delay = min(15 min, 2^(n−5)·15 s); applies even to correct password during delay (BR-T052). | Different IP bucket unaffected; success resets counter | AC-01-02.1-01: Given 5 failures, When correct password 1 s later, Then `429 Retry-After` | IT, SEC |
| FEAT-01-02.2 | New-device sign-in notice | On sign-in from a device label/UA hash not seen in last 90 d, email holder within 5 min with "revoke" link (BR-T059). | Suppressed for first sign-in after registration | AC-01-02.2-01: Given new device, When login, Then one email within 5 min | IT |
| FEAT-01-02.3 | Remember-me | Checkbox extends session absolute lifetime to {90} d; idle timeout unchanged; ignored for privileged roles. | Shared-device warning text shown | AC-01-02.3-01: Given remember-me, When 31 d pass with activity, Then session still valid; without it ⇒ expired | IT |
| FEAT-01-03.4 | Passkey fallback | WebAuthn feature-detected; if unsupported or cancelled, password path remains fully functional; no dead ends. | Passkey-only account on unsupported device ⇒ recovery email flow | AC-01-03.4-01: Given no WebAuthn API, When open login, Then passkey UI absent and password login works | E2E (WebKit) |
| FEAT-01-05.1 | Revoke other sessions on password change | Password change/reset revokes all families except the current (change) or all (reset). | Concurrent refresh during revoke ⇒ 401 reuse-safe | AC-01-05.1-01: Given 3 sessions, When change password, Then 2 revoked within 60 s | IT |
| FEAT-02-02.1 | Invite expiry | Org invite token hashed, TTL 7 d, single-use, bound to invited email; accepting requires matching verified email. | Expired ⇒ admin may resend (new token) | AC-02-02.1-01: Given invite 7 d + 1 s old, When accept, Then `410` | UT |
| FEAT-02-02.3 | Revoke pending invite | Admin can revoke any pending invite; token dies immediately. | Revoke after accept ⇒ no-op with message | AC-02-02.3-01: Given pending invite, When revoke, Then accept ⇒ `410` | IT |
| FEAT-02-03.1 | Last-owner protection | An org must always have ≥ 1 `org_owner`; demoting/removing the last owner is refused; transfer ownership first. | Concurrent demotions of two owners ⇒ one fails (row lock) | AC-02-03.1-01: Given 2 owners, When both demote each other concurrently, Then exactly one succeeds | IT |
| FEAT-20-02.3 | Subject notification of support access | When a support grant starts, notify the subject ("Support accessed your data for ticket X, until HH:MM") unless suppression applies (BR-T042, OPEN-08). | Notification failure does not block the grant but is audited | AC-20-02.3-01: Given grant created, When start, Then subject receives notice and audit shows grant id | IT |

## 2. Profile, showcase, preferences

| ID | Micro-feature | Rule · Inputs · Behaviour | Edge / failure | AC | Test |
|---|---|---|---|---|---|
| FEAT-03-04.1 | Resume variant | Per-target-role variant = (selected evidence ids ≤ 12, work claims, skills ≤ 20, summary ≤ 600, template). Free ≤ 1 variant; premium more (DT-02b). Variant never contains data the owner hasn't made visible for applications. | Referenced evidence later revoked ⇒ variant shows "evidence removed" placeholder and warns owner | AC-03-04.1-01: Given 2 variants, When export B, Then output contains only B's selections | IT, E2E |
| FEAT-03-04.2 | Accessible PDF export | Tagged PDF (headings, reading order, language, alt text); filename `<name>-<variant>.pdf`. | Fonts missing ⇒ fallback embedded font | AC-03-04.2-01: Given exported PDF, When checked with an accessibility validator, Then no critical failures | A11Y |
| FEAT-03-04.3 | Variant evidence/skill selection | Picker shows rung chips; unverified items allowed but labelled "Not verified" on the résumé. | Selection limit exceeded ⇒ `422` | AC-03-04.3-01: Given 13th evidence selected, When save, Then `422` | UT |
| FEAT-03-06.1 | Vanity slug | 3–30 `[a-z0-9-]`, no edge hyphens, unique, reserved list; change ≤ once per 30 d; old slug redirects 90 d (SPEC-02 §3.3). | Race ⇒ `409` | AC-03-06.1-01: Given taken slug, When set, Then `409 slug_taken` | UT |
| FEAT-03-06.2 | Expiring share link | Random ≥128-bit token stored hashed; expiry default 14 d, max 90 d; revocable; shows evidence subset (SPEC-02). | Expired vs missing ⇒ same `404` | AC-03-06.2-01: Given expired and unknown links, When open, Then identical responses | SEC |
| FEAT-03-08.1 | Draft conflict resolution | Edits carry `If-Match`; mismatch ⇒ `412` + server doc; UI offers per-field choose-mine/theirs/merge for text. | Both edited same field ⇒ explicit choice, never auto-merge text | AC-03-08.1-01: Given stale ETag, When save, Then `412` and neither version lost | IT, E2E |
| FEAT-03-08.2 | Offline queued profile edit | Edits stored locally with `baseVersion`; replayed on reconnect through same PATCH; max queue {50} edits; user sees "will sync". | Account state changed (deactivated) ⇒ discarded with notice | AC-03-08.2-01: Given offline edit and newer server version, When reconnect, Then conflict UI | E2E |
| FEAT-03-09.1 | Private salary expectation | Optional range + currency; visible only to the candidate; used only for candidate-side overlap hints; never sent to recruiters or scorers (DT-03). | Export includes it | AC-03-09.1-01: Given salary set, When recruiter fetches profile, Then field absent in payload | SEC |
| FEAT-03-09.3 | Blocked employers | ≤ 200 orgs; hides candidate from the org's search, shortlist and outreach (INV-T40); candidate may still apply (explicit confirm clears block for that org). | Org merges/renames ⇒ block follows org id | AC-03-09.3-01: Given org blocked, When org searches, Then candidate absent | IT |
| FEAT-22-01.4 | Per-employer artefact grant | Grant `evidence.share_artefact` (was `CS-EVID-ARTEFACT`) to one org id (`grantee_type=org`, `grantee_id`), optionally narrowed to one evidence item (`target_id`), with optional expiry (default {12 months}); revocable; listed in consent centre; denial applies from the first read after revocation (CSC section 6). | Org deleted ⇒ grant auto-ends | AC-22-01.4-01: Given grant to Org A, When Org B recruiter opens artefact, Then denied | SEC |

## 3. Evidence, verification, assessment

| ID | Micro-feature | Rule · Inputs · Behaviour | Edge / failure | AC | Test |
|---|---|---|---|---|---|
| FEAT-05-01.2 | Link evidence liveness check | HTTPS only; DNS resolved server-side; private/link-local/metadata ranges rejected; ≤ 3 redirects; 5 s timeout; success on 200; recheck every 30 d; failing 14 d ⇒ provenance invalid (BR-T009). | Slow host ⇒ saved as `claimed` with "not yet checked" | AC-05-01.2-01: Given link to 169.254.169.254, When submit, Then rejected, no outbound request | SEC |
| FEAT-05-05.3 | Holder notified of revocation | Notice ≤ 24 h: reason category, effects (skills, matches updated), appeal link and deadline (30 d). | Email fails ⇒ in-app notice remains; retry | AC-05-05.3-01: Given revoke, When 24 h pass, Then in-app and email notices exist | IT |
| FEAT-05-12.1 | Quarantine until scan clean | Uploaded blob lives in private quarantine bucket; unreadable by any other principal; promoted only on clean verdict (BR-T003). | Scanner outage ⇒ stays pending; never auto-promote | AC-05-12.1-01: Given pending_scan item, When another user requests blob, Then `404` | SEC |
| FEAT-05-12.3 | Preview thumbnails | Generated only after clean scan; images re-encoded; EXIF location stripped; non-image types show icon. | Thumbnail failure ⇒ item still usable | AC-05-12.3-01: Given JPEG with GPS, When thumbnail served, Then no GPS tags | UT |
| FEAT-06-02.3 | Referee reminders | Exactly two reminders on day 4 and day 9 while unanswered; none after submit/cancel/expiry (BR-T022). | Job rerun ⇒ no duplicates (key `(request, n)`) | AC-06-02.3-01: Given job run twice on day 4, When count emails, Then 1 | IT |
| FEAT-06-02.4 | Referee decline / "don't know them" | Single-click decline; optional reason not shown to candidate; outcome per DT-04 rows 5–6. | Decline then later submit with same token ⇒ refused (single-use) | AC-06-02.4-01: Given decline, When candidate views, Then neutral message, no rung change | IT |
| FEAT-06-02.5 | Referee consent to be named | Unticked checkbox "recruiters may see my name"; stored on response; governs display (BR-T023). | Consent cannot be added later without a new response | AC-06-02.5-01: Given unticked, When recruiter views, Then "former colleague" only | UT |
| FEAT-07-02.1 | Answer autosave | `PUT` per question with `clientSeq`; highest seq wins; idempotent; rejected after deadline (SPEC-05). | Out-of-order seqs tolerated | AC-07-02.1-01: Given seq 5 then 4, When both arrive, Then stored value = seq 5 | UT |
| FEAT-07-02.2 | Server-authoritative timer | `deadline_at` from DB time; client shows synced countdown; auto-submit at deadline (job + lazy check). | Client clock manipulation has no effect | AC-07-02.2-01: Given client clock −2 h, When view timer, Then derived from server | SEC |
| FEAT-07-02.4 | Accommodation extra time | Multiplier {1.25, 1.5, 2.0} stored on attempt by support/instructor; invisible to recruiters (BR-T030). | Granted after start ⇒ applies to next attempt only | AC-07-02.4-01: Given ×1.5 on 40 min, When start, Then deadline = +60 min | UT |
| FEAT-07-08.1 | Retake cooldown | {24 h} after a failed attempt; ≤ {3} attempts/7 d (BR-T028). | Instructor override with reason | AC-07-08.1-01: Given fail at T, When start at T+23:59, Then `409`; at T+24:00 allowed | UT |

## 4. Learning

| ID | Micro-feature | Rule · Inputs · Behaviour | Edge / failure | AC | Test |
|---|---|---|---|---|---|
| FEAT-08-03.1 | Resume lesson position | Server stores last `positionSeconds` per lesson (max seq wins); resume offered at ≥ 5 s and < 95 %. | Different devices ⇒ latest wins | AC-08-03.1-01: Given pause at 120 s on phone, When open on laptop, Then offered resume at 120 s | E2E |
| FEAT-08-03.2 | Offline lesson cache | Only lessons flagged cacheable; read-only; cache invalidated on version change; progress queued, never completion (INV-T13). | Storage quota exceeded ⇒ user chooses what to keep | AC-08-03.2-01: Given cached text lesson offline, When mark complete, Then queued; completion only after server confirms | E2E |
| FEAT-08-03.3 | Captions & transcripts required | Video lesson cannot be published without captions + transcript (instructor studio gate); learner player shows captions by default if available. | Auto-captions flagged "auto-generated" until reviewed | AC-08-03.3-01: Given video without captions, When publish, Then blocked with reason | UT |

## 5. Opportunities, applications, hiring

| ID | Micro-feature | Rule · Inputs · Behaviour | Edge / failure | AC | Test |
|---|---|---|---|---|---|
| FEAT-09-01.2 | Pay-range disclosure | Fields `{currency, min, max, period, disclosed}`; `min ≤ max`; undisclosed allowed unless org policy/jurisdiction requires {OPEN-08}; disclosed pay searchable by `payMin`. | Currency mismatch with location ⇒ warning only | AC-09-01.2-01: Given min > max, When save, Then `422` | UT |
| FEAT-09-01.5 | Inclusive-language check | Configurable term lists: warn on flagged terms, hard-block only "never allowed" list; results logged for audit; no legal claim. | False positives dismissible with reason | AC-09-01.5-01: Given flagged term, When publish, Then warning shown and dismissal recorded | UT |
| FEAT-09-02.3 | Scheduled publish | `publish_at` future ≤ 30 d; at run time re-check entitlement + validation; failure ⇒ back to `draft` + notify (SM-JOB t6). | Clock change ⇒ uses UTC instant | AC-09-02.3-01: Given lapsed subscription at run time, When scheduled time arrives, Then job returns to draft | IT |
| FEAT-09-06.1 | Saved search alert | Saved search = normalised query + filters; alert when a *new published* job matches; consent for email/push per FEAT-15-02. Limit {20} saved searches. | Search deleted while alert queued ⇒ drop | AC-09-06.1-01: Given saved search, When matching job published, Then one alert within 15 min | IT |
| FEAT-09-06.2 | Alert frequency | `instant`, `daily` (digest at 08:00 local), `weekly`; default daily. | Changing frequency applies to next window | AC-09-06.2-01: Given daily, When 3 jobs match in a day, Then one digest with 3 jobs | IT |
| FEAT-09-06.3 | Alert dedupe | A job is alerted at most once per (user, saved search) and at most once per user per day across searches (merged into one message). | Job edited ⇒ not re-alerted | AC-09-06.3-01: Given job matches 2 saved searches, When published, Then one notification listing both | UT |
| FEAT-10-01.1 | Offline draft queue | Draft edits queued with `baseVersion`/`clientSeq`; submit disabled offline; replay idempotent (SPEC-09). | Quota/localStorage full ⇒ visible warning | AC-10-01.1-01: Given offline edits, When reconnect, Then synced without loss | E2E |
| FEAT-10-02.2 | Duplicate-click protection | Submit button disables on first click; server idempotency by `Idempotency-Key`; second request returns first result. | Network retry with new key ⇒ `409 already_applied` with link | AC-10-02.2-01: Given double click, When processed, Then one application | E2E, IT |
| FEAT-10-07.2 | Interview reschedule | Either party ≥ 2 h before start; new `proposed` linked; ICS SEQUENCE+1; old `rescheduled` (SM-INTERVIEW t4). | < 2 h ⇒ `409 too_late` | AC-10-07.2-01: Given 3 h before, When reschedule, Then new proposal created | IT |
| FEAT-10-07.5 | Time-zone-safe display | Store UTC + IANA zone; render in viewer zone with explicit offset; show both when zones differ; DST-safe. | Missing zone ⇒ prompt | AC-10-07.5-01: Given interview across DST change, When viewed, Then correct local time and offset | UT (property) |

## 6. Engagement, notifications, billing, privacy, institutions, platform

| ID | Micro-feature | Rule · Inputs · Behaviour | Edge / failure | AC | Test |
|---|---|---|---|---|---|
| FEAT-13-02.2 | Per-candidate outreach cooldown | After a decline, same org blocked from first contact to that candidate for {30} d (BR-T081). | Different org unaffected | AC-13-02.2-01: Given decline at T, When same org at T+29 d, Then `409 cooldown` | UT |
| FEAT-13-03.1 | Queued send with idempotency key | Offline-composed message has `clientMessageId`; server dedupes; ordered replay; > 24 h asks confirmation. | Thread blocked meanwhile ⇒ returns to composer | AC-13-03.1-01: Given 3 queued, When reconnect, Then delivered once, in order | E2E |
| FEAT-13-05.2 | Mute thread | Mute suppresses notifications for that thread; unread count continues; unmute any time. | Mute does not affect safety notices | AC-13-05.2-01: Given muted, When new message, Then no email/push | IT |
| FEAT-15-02.1 | Quiet hours | Default 21:00–08:00 local (user tz); defers non-mandatory, non-time-critical deliveries until end; user may change/disable; DST-safe (BR-T086). | Tz unknown ⇒ use account locale tz; ask on first prompt | AC-15-02.1-01: Given engagement notice at 22:00, When route, Then deferred to 08:00 | IT |
| FEAT-15-02.2 | Mandatory transactional categories | Security, verification, legal, billing categories cannot be disabled; preferences UI shows them as locked with reason (BR-T085). | Suppression list still honoured for hard bounces | AC-15-02.2-01: Given user disabled all optional, When password reset requested, Then email still sent | UT |
| FEAT-15-05.1 | Nudge frequency cap | ≤ 3 nudges/week and ≤ 1/day/user; priority order; suppressed when user acted recently (BR-T087). | Cap resets Monday 00:00 user tz | AC-15-05.1-01: Given 3 nudges this week, When 4th eligible, Then suppressed | UT |
| FEAT-16-07.1 | Past-due grace window | {7} d full entitlements after `invoice.payment_failed`, then degrade; notices day 0/3/6 (SPEC-12). | Payment on day 7 exact boundary ⇒ restored | AC-16-07.1-01: Given past_due day 6/day 8, When derive, Then full/degraded | UT |
| FEAT-16-11.1 | AI quota meter | Credits per period by plan; atomic conditional decrement; blocked at 0 with upgrade message; free tier 0 paid inference (INV-T07). | Streaming call partially consumed ⇒ charge actual units, floor at limit | AC-16-11.1-01: Given 1 credit and 2 concurrent calls, When processed, Then one succeeds | IT |
| FEAT-22-02.2 | Expiring download link | One-time signed URL TTL 15 min created after re-auth; archive deleted after 7 d (SPEC-13). | Link reuse ⇒ `410` | AC-22-02.2-01: Given used link, When reused, Then `410` | SEC |
| FEAT-22-03.1 | Erasure cooling-off cancel | 7-day window; sign-in only shows cancel page; cancel restores prior state; reminders day 1 and 6. | Cancel at day 7 + 1 s ⇒ refused | AC-22-03.1-01: Given day 3, When cancel, Then account restored | IT |
| FEAT-18-02.1 | CSV roster dedupe | Dedupe by NFKC-lowercased email within file and cohort; first row wins; report lists dropped rows. | Plus-addressing treated as distinct (no provider-specific normalisation) | AC-18-02.1-01: Given `A@x.edu` and `a@x.edu`, When dry-run, Then one valid + one duplicate | UT |
| FEAT-18-02.2 | Roster dry-run preview | Creates nothing; downloadable error report; counts only (no disclosure of existing platform accounts). | Large files processed async with progress | AC-18-02.2-01: Given dry-run, When inspect DB, Then no rows created | IT |
| FEAT-24-03.1 | Idempotency key scope | Key unique per `(principal, method+route)`; retained 24 h; same key + same payload ⇒ stored response; different payload ⇒ `422`. | Concurrent identical requests ⇒ second waits for first, then replays | AC-24-03.1-01: Given same key twice concurrently, When processed, Then one execution | IT |
| FEAT-24-06.2 | Offline read cache | Cache own profile, evidence list, applications list, saved jobs, last search results with age label; never authoritative (INV-T13). | Logout clears cache | AC-24-06.2-01: Given offline, When open My applications, Then cached list with "as of" time | E2E |
| FEAT-24-06.3 | Service-worker update prompt | New version detected ⇒ non-blocking "Update available" toast; apply on next navigation or user action; never reload mid-form. | Incompatible remote/host versions ⇒ force refresh with draft preservation | AC-24-06.3-01: Given unsaved draft and new version, When update available, Then no auto-reload | E2E |

## 7. Intelligence, safety, AI, search

| ID | Micro-feature | Rule · Inputs · Behaviour | Edge / failure | AC | Test |
|---|---|---|---|---|---|
| FEAT-04-04.1 | Recency decay | Evidence weight × exp(−age_years/τ), τ = {3}; applies to rung weight in skill confidence (SPEC-08 §3.2). | Ongoing evidence age counted from latest activity date | AC-04-04.1-01: Given evidence aged 0 and 3 y, When compute, Then weights 1.0 and ≈0.37 | PROP |
| FEAT-11-01.1 | Typeahead & spell tolerance | Typeahead suggests canonical skills/titles (≥ 2 chars); typo tolerance via trigram similarity ≥ {0.3}; suggestions never include sponsored items. | Empty result ⇒ suggestions | AC-11-01.1-01: Given "pyton", When search, Then Python jobs returned | IT |
| FEAT-11-02.3 | Uncertainty band | Band from verified-weight share: low/medium/high with ±δ shown as range; copy explains meaning (SPEC-08). | No evidence ⇒ guidance state, not 0 | AC-11-02.3-01: Given only claimed evidence, When view, Then wide range + "mostly self-reported" | UT |
| FEAT-17-04.1 | Per-field accept/reject of AI suggestions | AI suggestions appear as diffs; user accepts per field; nothing saved without explicit action; marked "AI-assisted" optionally (INV-T09, BR-T112). | Free tier ⇒ deterministic suggestions only | AC-17-04.1-01: Given suggestion, When user leaves page, Then profile unchanged | E2E |
| FEAT-19-01.1 | Report with context snapshot | Report attaches frozen context (message window, job text, profile fields) at report time; retained for case life + {90 d}; reporter hidden from subject. | Content deleted later ⇒ snapshot preserved | AC-19-01.1-01: Given report then message delete, When moderator opens case, Then original text visible | IT |

## 8. Coverage

Count: **65 micro-feature specs**, covering all 24 domains except DOM-12, DOM-14, DOM-21, DOM-23 (no Phase-1/2 micro-behaviours needing a standalone rule; they are specified when their parent features enter delivery). Each row's parent feature, phase and priority are authoritative in the hierarchy. Rows must be promoted to a full spec (SPEC-n) if they gain more than one actor, more than one state, or any money/privacy consequence.

# Revision 2 additions (folded 2026-10-27 from `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2`)

## 1. Criteria for review-resolution rules

### 1.1 Evidence integrity (REVW-12, REVW-22, REVW-20 archive)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-05-04-51 | a learner completes a first-party course with a platform rule | the issuer mints the completion | one item at `authority_verified` with `issuer_class = platform`; the badge shows the class | Happy |
| AC-05-04-52 | any client sends an `issuerClass` or `rung` field when creating or editing evidence | POST/PATCH | field ignored or `422`; the stored class equals the class of the issuing record (INV-T46) | Security |
| AC-05-04-53 | instructor account equals the learner account | instructor signs off | `422 self_signoff`; nothing minted; enrolment unchanged (INV-T47) | Negative |
| AC-05-04-54 | instructor and learner share a device cluster or payment instrument | instructor signs off | sign-off held for human review; enrolment stays `completion_pending_signoff`; no evidence; no automatic rejection (DT-14 row 2) | Negative/Security |
| AC-05-04-55 | an item whose only authority record has `issuer_class = instructor` | rendered; filtered by "platform verified"; scored for matching | badge "Instructor attested"; excluded from the platform-verified filter; match explanation shows the lower class weight | Honesty |
| AC-05-04-56 | an `instructor`-class record is revoked by its issuer or a moderator | confirm | rung recomputes (falls to the next supported rung); holder notified within 24 h with appeal path; audited | Happy |
| AC-08-04-51 | an approved instructor with a completed conflict-of-interest declaration signs off a learner other than themselves with no shared signal | sign-off | accepted; evidence minted at `authority_verified` with class `instructor` (DT-14 row 5) | Happy |
| AC-06-01-51 | a work claim at a domain equal to a verified `org_domain` of a verified organization | candidate enters the code correctly | rung `artifact_backed`; badge "Mailbox verified" (`domain_binding = bound`) | Happy |
| AC-06-01-52 | a work claim at a domain the candidate owns or controls that is not bound to a verified organization | code entered correctly | rung stays `claimed`; badge "Mailbox verified, employer not confirmed"; the popover says the employer is not confirmed | Honesty |
| AC-06-01-53 | a `bound` proof exists and its organization's verification is revoked | revocation commits | the provenance record is invalidated; the item's rung recomputes; audited (INV-T48) | Happy |
| AC-05-01-51 | an active evidence item | user chooses Archive then Undo within 8 s | no withdraw request is sent; item still `active` | Happy |
| AC-05-01-52 | an active evidence item | user chooses Archive and does not undo | after 8 s the item is `withdrawn` (terminal); "Create again from this" creates a new `draft` with `restored_from` | Happy |

### 1.2 Organization lifecycle (REVW-20)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-02-01-01 | a new organization (`verification_state = unverified`) | owner publishes a first valid job | allowed (pending-limited mode, 1 live job) | Happy |
| AC-02-01-02 | the same organization with 1 live job | owner publishes a second job | `409 org_verification_required` | Negative |
| AC-02-01-03 | owner submits a domain with a correct DNS TXT proof | review completes | `pending → verified`; `org_domain` usable for employer-domain binding; audited | Happy |
| AC-02-01-04 | a verified organization with 3 live jobs | a reviewer revokes verification | in one transaction the oldest live job stays and two move to `paused` (reason `org_unverified`); applications on paused jobs continue; owner notified (BR-T123) | Happy |
| AC-02-01-05 | an automated check fails a domain re-check | the system runs | a review task opens; `verification_state` does not change by itself (U6) | Negative |

### 1.3 Account, age and erasure (REVW-21, REVW-29)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-01-01-51 | a registration without the minimum-age attestation | submit | `422 age_attestation_required`; no account row | Negative |
| AC-01-01-52 | the person declares an age below the minimum | submit | refused with a neutral message; no account created; only a hashed rate-limit signal kept for 24 h | Security |
| AC-01-01-53 | any account with status `active` | database constraint check | `min_age_attested_at` and the policy version are present (INV-T50) | Invariant |
| AC-19-07-01 | one moderator decides to suspend an account | submits without a second approver | rejected `second_person_required`; with the documented emergency exception the action applies and is reviewed within 24 h | Negative |
| AC-22-03-51 | a `suspended` account with an open moderation case | the holder requests erasure | request acknowledged and parked `on_hold` (reason `moderation_case_open`); the account stays `suspended`; the requester is told a hold applies (INV-T49) | Negative |
| AC-22-03-52 | the case in AC-22-03-51 becomes `closed` | the hold clears | the request resumes; cooling-off starts | Happy |

### 1.4 Applications, referees, matching view (REVW-27, REVW-38, REVW-43, REVW-11)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-10-03-51 | an application withdrawn 2 h ago, cooldown 24 h | the candidate re-applies | `409 reapply_cooldown` with the earliest allowed time | Negative |
| AC-10-03-52 | a withdrawn application, cooldown passed, job `published` | the candidate re-applies | a new application with `reapplied_from`; the hiring team sees the link and withdrawal date; a new evidence snapshot is taken | Happy |
| AC-10-03-53 | an application ended `rejected` | the candidate tries to re-apply | refused; only a recruiter invitation creates a new linked application | Negative |
| AC-06-10-51 | a manual reminder was sent on day 3 | day 4 arrives | the system reminder is deferred until 3 days after the manual one; the total never exceeds 2 | Happy |
| AC-06-10-52 | two reminders sent in any mix of system and manual | the candidate presses "Send reminder" | disabled with "2 of 2 reminders used"; the API returns `409 reminder_cap_reached` | Negative |
| AC-11-10-01 | a job with 12 applicants of mixed scores | a recruiter opens "Suggested order" | 12 rows are returned; none hidden; the view is labelled "Suggested order" and advisory (INV-T52) | Honesty |
| AC-11-10-02 | the UI and API surface | text and route lint | the advisory view is never named "shortlist" | Honesty |
| AC-11-09-01 | a tenant with no recorded fairness review | a recruiter requests score-ranked results | the feature flag `matching.recruiter_ranking` is off; the plain filter and the candidate-facing explanation still work (BR-T126) | Negative |
| AC-11-09-02 | ROLE-AUD has recorded the baseline review | the flag is switched on | the change is audited with the review reference | Happy |

### 1.5 Sessions, idempotency, retention (REVW-18, REVW-14, REVW-26, entitlement stub)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-01-04-51 | a refresh token idle for more than CONST-S02 | refresh | `401 session_expired` (constants table in BR-REG-R2) | Negative |
| AC-01-04-52 | a sensitive action and a re-auth older than CONST-S06 (5 min) | the action is submitted | step-up required | Security |
| AC-01-04-53 | a refresh token presented again within CONST-S07 (5 s) with its successor unused | refresh | the same successor is returned; presented outside the leeway the family is revoked | Security |
| AC-24-03-51 | a queued offline write with an `Idempotency-Key` created on day 0 | replayed on day 13 | the stored response is returned, no second effect | Idempotency |
| AC-24-03-52 | a route with a natural key | the same logical write arrives twice after day 15 | the second is deduplicated by the natural key | Idempotency |
| AC-10-14-51 | an application whose consent window ended 31 days ago | the retention job has run | the organization's copy holds no snapshot content, answers or contact details; at most the minimal record with an opaque `subject_ref` remains, and only if the OPEN-08 policy keeps it (BR-T122) | Privacy |
| AC-16-04-51 | a free organization in Phase 1 | an admin compensation grant is created | the grant needs reason, approver and expiry; it is audited; a client or redirect cannot create it (BR-T090) | Security |
| AC-02-03-51 | a principal with role `viewer` in an organization | the principal opens candidate content | denied; metadata only where DT-01 allows | Security |
| AC-02-03-52 | an `org_admin` in an organization | the admin files a data-rights request for an employee | refused; the requester must be the subject (SM-DSR t1) | Security |

## 2. Criteria for P0 features that had none (REVW-17)

Method and list: `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md#record-capability-map-phase-reconciliation-rev2` section 5. Each feature below was a P0 feature in Phase 0 or 1 (or a P0 Phase 2 feature) with no criterion of its own.

| AC | Feature | Given | When | Then | Category |
|---|---|---|---|---|---|
| AC-01-09-01 | FEAT-01-09 | an authenticated principal with several scoped grants | `GET /me/capabilities` for one scope | returns only that scope's evaluated capability set | Happy |
| AC-01-09-02 | FEAT-01-09 | a capability absent from the response | the client calls the action directly | `403`; the capability set is a hint, never the enforcement (INV-T01) | Security |
| AC-01-09-03 | FEAT-01-09 | a grant changes | the next request is made | the response reflects the new set (no stale cache) | Happy |
| AC-02-07-01 | FEAT-02-07 | a principal of organization A | requests any tenant-scoped route with an id of organization B | `404` or `403`; the canary suite fails the build if any route returns B's data | Security |
| AC-02-07-02 | FEAT-02-07 | any tenant table | lint | it has `org_id` and a forced row-level security policy | Invariant |
| AC-02-07-03 | FEAT-02-07 | the application database role | role check | no `BYPASSRLS` | Invariant |
| AC-04-01-01 | FEAT-04-01 | the skills read API | list | canonical skills are returned with a taxonomy version | Happy |
| AC-04-01-02 | FEAT-04-01 | an alias of a skill | resolved | resolves to the canonical skill | Happy |
| AC-04-01-03 | FEAT-04-01 | two skills are merged | an old id is read | it still resolves (redirect) and a merge event is emitted | Happy |
| AC-04-02-01 | FEAT-04-02 | evidence, a job or a course | tagged with a canonical skill | accepted | Happy |
| AC-04-02-02 | FEAT-04-02 | a free-text skill | tagged | `422` (BR-T006) | Negative |
| AC-04-02-03 | FEAT-04-02 | any entity type | tagged | the same skill ids and API are used | Happy |
| AC-08-01-01 | FEAT-08-01 | the course catalogue | filtered by skill and level | only `published` courses are returned | Happy |
| AC-08-01-02 | FEAT-08-01 | a course with prerequisites | opened by a learner who has not met them | unmet prerequisites are shown with links | Happy |
| AC-15-01-01 | FEAT-15-01 | in-app notifications exist | the notification centre opens | newest first, with an unread count | Happy |
| AC-15-01-02 | FEAT-15-01 | an unread notification | marked read twice | idempotent | Idempotency |
| AC-15-03-01 | FEAT-15-03 | the email provider is down | a notification is raised | the in-app item exists; the `email.send` job retries (SM-BGJOB t4); no duplicate email on recovery | Failure |
| AC-15-03-02 | FEAT-15-03 | a mandatory security email during quiet hours | routed | sent now (DT-07 row 2) | Happy |
| AC-15-06-01 | FEAT-15-06 | a hard bounce | the provider webhook arrives | delivery `bounced`; the address is suppressed | Happy |
| AC-15-06-02 | FEAT-15-06 | a transient provider error | the job retries | delivery shows `failed_retry` and mirrors the job, not a second retry schedule | Happy |
| AC-15-07-01 | FEAT-15-07 | an engagement email | the recipient uses one-click unsubscribe | that category is suppressed | Happy |
| AC-15-07-02 | FEAT-15-07 | a mandatory transactional category | unsubscribe attempted | not suppressed; the page explains why | Negative |
| AC-15-07-03 | FEAT-15-07 | an address on the suppression list | a send is attempted | not sent (SM-NOTIFY t1) | Negative |
| AC-20-01-01 | FEAT-20-01 | a customer principal | opens a back-office route | `403`; back-office code is not served to the principal (authenticated edge rule) | Security |
| AC-20-01-02 | FEAT-20-01 | a staff principal without MFA | opens the console | denied until MFA is enrolled (BR-T044) | Security |
| AC-20-01-03 | FEAT-20-01 | a role grant changes | saved | audited with actor and reason | Happy |
| AC-20-03-01 | FEAT-20-03 | the audit viewer | a record is opened | actor, action, resource, reason and request id are shown | Happy |
| AC-20-03-02 | FEAT-20-03 | an audit export | requested | re-auth is required and the export is itself audited | Security |
| AC-21-01-01 | FEAT-21-01 | a user without `analytics.product` consent | uses the product | no product-analytics event is captured | Privacy |
| AC-21-01-02 | FEAT-21-01 | consent is withdrawn | the next event would fire | it is not captured | Privacy |
| AC-22-06-01 | FEAT-22-06 | a user accepts policy version v | stored | version, timestamp and account are recorded | Happy |
| AC-22-06-02 | FEAT-22-06 | policy version v+1 is published | the user's next sensitive action | acceptance of v+1 is required first | Happy |
| AC-24-01-01 | FEAT-24-01 | a state change commits | the process is killed before dispatch | the outbox row survives and the event is delivered after restart | Failure |
| AC-24-01-02 | FEAT-24-01 | an event is delivered twice | the consumer handles it | one effect (consumer dedupe on `event_id`) | Idempotency |
| AC-24-01-03 | FEAT-24-01 | the dispatcher restarts | mid-batch | no event is lost | Failure |
| AC-24-02-01 | FEAT-24-02 | two workers race for one job | claim | exactly one wins (`SKIP LOCKED`) | Concurrency |
| AC-24-02-02 | FEAT-24-02 | a stale worker finishes after its lease expired | complete | the fenced write affects zero rows and the result is discarded | Concurrency |
| AC-24-02-03 | FEAT-24-02 | jobs of kinds `email.send`, `ai.*` and a permanent error | failures repeat | `email.send` is attempted up to 12 times, `ai.*` 3 times, a permanent error goes straight to `dead`; a dead job of a protected kind raises an alert (SM-BGJOB t4, t7) | Failure |
| AC-24-04-01 | FEAT-24-04 | a signed download URL | used after expiry | `403` | Security |
| AC-24-04-02 | FEAT-24-04 | a non-image file | downloaded | forced as attachment (BR-T116) | Security |
| AC-24-05-01 | FEAT-24-05 | a request that passes shell, API and worker | traced | one trace id spans all three; logs redact secrets and direct identifiers | Observability |
| AC-24-08-01 | FEAT-24-08 | requests over the limit | sent | `429` with `Retry-After`; auth endpoints are stricter (BR-T115) | Security |
| AC-24-09-01 | FEAT-24-09 | two worker replicas | a scheduled tick fires | it runs once (unique kind and tick) | Concurrency |
| AC-24-09-02 | FEAT-24-09 | a time-driven transition is due | the job runs | the guard is re-checked at execution time (U7) | Happy |
| AC-24-11-01 | FEAT-24-11 | a migration that drops or rewrites a column in one step | lint | rejected unless it follows expand/contract with a rollback note | Invariant |
| AC-17-01-01 | FEAT-17-01 | code that imports a model provider directly | CI lint | the build fails (BR-T110) | Invariant |
| AC-17-01-02 | FEAT-17-01 | the Phase 0 gateway stub | a call is made | denied by default; no provider is contacted | Security |
| AC-17-02-01 | FEAT-17-02 | a free-tier user | requests AI assistance | no paid inference; the deterministic fallback runs (BR-T111) | Happy |
| AC-17-03-01 | FEAT-17-03 | a principal bound to `AI_PROHIBITED` | any gateway call | denied regardless of caller (BR-T025) | Security |
| AC-17-03-02 | FEAT-17-03 | a denial | logged | the log holds the policy and principal, not the prompt content | Privacy |
| AC-07-01-01 | FEAT-07-01 (Phase 2) | the assessment catalogue | an item is opened | mode badge and AI-policy label are shown | Happy |
| AC-16-01-01 | FEAT-16-01 (Phase 2) | a plan with no price set | the catalogue renders | no price is shown (prices are OPEN-05) | Honesty |
| AC-19-02-01 | FEAT-19-02 (Phase 2) | a report and a system flag on one target | the queue is built | one case (dedupe by target and category); automation cannot move it to `actioned` | Happy |
| AC-19-08-01 | FEAT-19-08 (Phase 2) | a reporter files more than 20 reports in a day | files one more | `429` (BR-T048) | Negative |

## 3. Spec-text deltas (passages replaced once accepted)

| Original passage | Replacement meaning |
|---|---|
| SPEC-G2 badge line (about L203): "`Mailbox verified` (artifact-backed via domain proof) ... `Employer confirmed` (authority; Phase 3 via verified org)" | Badges: "Not verified"; "Mailbox verified" only for a `bound` domain; "Mailbox verified, employer not confirmed" for an `unbound` domain (rung stays `claimed`); "Confirmed by referee"; for authority, the class is shown: "Platform verified", "Institution verified", "Employer confirmed", "Instructor attested" (DT-06 REV2) |
| SPEC-G2 actors table (about L20): ROLE-INST and issuers "mint `authority_verified` items" | Issuers mint authority records with a mandatory `issuer_class`; instructor-class records follow BR-T119 and DT-14 |
| SPEC-G3 actors and completion rule (about L189, L212 to L214): `instructorSignoff`, "rung `authority_verified` when ... instructor-signed-off" | Instructor sign-off mints `authority_verified` with class `instructor` only after DT-14; it never counts as platform-verified; revocable |
| SPEC-G3 offline lines (L76, L209, L256) | Assessment answers are online-only; lesson progress is a queued write; downloadable video is out of Phases 1 and 2 (REVW-15 decision) |
| SPEC-G1 onboarding (registration step, micro-feature FEAT-01-01.3 "age/guardian gate [OPEN-09]") | Registration requires the minimum-age attestation of BR-T120 (value [OPEN-counsel]); no account is created below the minimum |
| SPEC-G4 FEAT-10-03 "Withdraw & re-apply policy" and the application states paragraph | Withdrawn is terminal; the candidate may submit a new linked application after the cooldown (BR-T125, SM-APPLICATION t12) |
| SPEC-G4 FEAT-11-10 "Suggested shortlist per job (human-gated)" (also PCAP-01 title) | "Suggested order"; the view returns all applicants (INV-T52) |
| SPEC-G5 section 3.2 CSV columns and BR-T106 | The roster CSV may carry the attestation flag or date of birth only if counsel requires it (BR-T120); rows flagged under-age stay blocked |
| USER_JOURNEYS about line 115: "1st reminder after 3 days (ACT-VER-03)" | "Reminders: the system sends on day 4 and day 9; you can also send one yourself 3 days after the last send; two in total" (BR-T121) |
| ACT-VER-03 availability (`07_UI_UX`) | "≥ 3 days since last send of any kind and fewer than 2 reminders in total" (DT-13) |
| SPEC-G5 retention paragraph for applications; DATA-021 (24 months) | Identifiable content follows BR-T122; the 24-month figure applies only to the minimal record if OPEN-08 allows it |


---

<a id="record-spec-acceptance-additions-rev2"></a>
## Preserved source record: SPEC_ACCEPTANCE_ADDITIONS_REV2

> Consolidated on 2026-10-27. The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. Approval conditions and authority remain unchanged: this move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_ACCEPTANCE_ADDITIONS_REV2.md -->
<a id="record-spec-acceptance-additions-rev2--feature-specifications-acceptance-additions-spec-rev2"></a>
# Feature Specifications, Acceptance Additions (SPEC REV2)

Doc ID: SPEC-00-R2 · Owner: Product Director (Functional Spec) · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-12, REVW-17 (P0 feature gaps), REVW-18, REVW-20, REVW-21, REVW-22, REVW-26, REVW-27, REVW-29, REVW-38, REVW-43 (acceptance and spec-text parts) · Relates: SPEC-00 and SPEC-G1 to G5, MICRO-FEAT, QA-AC, BR-REG-R2, INV-REG-R2, SM-00-R2, DT-00-R2

> **Folded into `MICRO_FEATURE_SPECS.md` on 2026-10-27.** Change record only; edit the original.

**Relationship (no original file was edited).** This file **extends** the long-form specifications `SPEC_G1…G5` and `MICRO_FEATURE_SPECS.md` with acceptance criteria and with spec-text deltas. It supersedes nothing. The spec-text deltas in section 3 name the original passages they would replace **once accepted**. Criteria are numbered so they cannot collide with registered ones: for features that already have criteria the new numbers start at 51; for features with none they start at 01. The test catalogue is owned by QA; this file proposes no TEST ids. Governance should link this file from `05_FEATURE_SPECIFICATIONS/README.md` (index) and `00_CONTROL_CENTRE/MASTER_INDEX.md`.

This file registers **95 new criteria** (counted by script over rows that begin `| AC-DD-NN-NN |`; no id collides with a criterion registered in `05_*` or `16_*`). All content **[TARGET]**; nothing here claims anything is built. Table form is that of the long-form specs: `| AC id | Given | When | Then | Category |`.

<a id="record-spec-acceptance-additions-rev2--1-criteria-for-review-resolution-rules"></a>
## 1. Criteria for review-resolution rules

<a id="record-spec-acceptance-additions-rev2--11-evidence-integrity-revw-12-revw-22-revw-20-archive"></a>
### 1.1 Evidence integrity (REVW-12, REVW-22, REVW-20 archive)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-05-04-51 | a learner completes a first-party course with a platform rule | the issuer mints the completion | one item at `authority_verified` with `issuer_class = platform`; the badge shows the class | Happy |
| AC-05-04-52 | any client sends an `issuerClass` or `rung` field when creating or editing evidence | POST/PATCH | field ignored or `422`; the stored class equals the class of the issuing record (INV-T46) | Security |
| AC-05-04-53 | instructor account equals the learner account | instructor signs off | `422 self_signoff`; nothing minted; enrolment unchanged (INV-T47) | Negative |
| AC-05-04-54 | instructor and learner share a device cluster or payment instrument | instructor signs off | sign-off held for human review; enrolment stays `completion_pending_signoff`; no evidence; no automatic rejection (DT-14 row 2) | Negative/Security |
| AC-05-04-55 | an item whose only authority record has `issuer_class = instructor` | rendered; filtered by "platform verified"; scored for matching | badge "Instructor attested"; excluded from the platform-verified filter; match explanation shows the lower class weight | Honesty |
| AC-05-04-56 | an `instructor`-class record is revoked by its issuer or a moderator | confirm | rung recomputes (falls to the next supported rung); holder notified within 24 h with appeal path; audited | Happy |
| AC-08-04-51 | an approved instructor with a completed conflict-of-interest declaration signs off a learner other than themselves with no shared signal | sign-off | accepted; evidence minted at `authority_verified` with class `instructor` (DT-14 row 5) | Happy |
| AC-06-01-51 | a work claim at a domain equal to a verified `org_domain` of a verified organization | candidate enters the code correctly | rung `artifact_backed`; badge "Mailbox verified" (`domain_binding = bound`) | Happy |
| AC-06-01-52 | a work claim at a domain the candidate owns or controls that is not bound to a verified organization | code entered correctly | rung stays `claimed`; badge "Mailbox verified, employer not confirmed"; the popover says the employer is not confirmed | Honesty |
| AC-06-01-53 | a `bound` proof exists and its organization's verification is revoked | revocation commits | the provenance record is invalidated; the item's rung recomputes; audited (INV-T48) | Happy |
| AC-05-01-51 | an active evidence item | user chooses Archive then Undo within 8 s | no withdraw request is sent; item still `active` | Happy |
| AC-05-01-52 | an active evidence item | user chooses Archive and does not undo | after 8 s the item is `withdrawn` (terminal); "Create again from this" creates a new `draft` with `restored_from` | Happy |

<a id="record-spec-acceptance-additions-rev2--12-organization-lifecycle-revw-20"></a>
### 1.2 Organization lifecycle (REVW-20)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-02-01-01 | a new organization (`verification_state = unverified`) | owner publishes a first valid job | allowed (pending-limited mode, 1 live job) | Happy |
| AC-02-01-02 | the same organization with 1 live job | owner publishes a second job | `409 org_verification_required` | Negative |
| AC-02-01-03 | owner submits a domain with a correct DNS TXT proof | review completes | `pending → verified`; `org_domain` usable for employer-domain binding; audited | Happy |
| AC-02-01-04 | a verified organization with 3 live jobs | a reviewer revokes verification | in one transaction the oldest live job stays and two move to `paused` (reason `org_unverified`); applications on paused jobs continue; owner notified (BR-T123) | Happy |
| AC-02-01-05 | an automated check fails a domain re-check | the system runs | a review task opens; `verification_state` does not change by itself (U6) | Negative |

<a id="record-spec-acceptance-additions-rev2--13-account-age-and-erasure-revw-21-revw-29"></a>
### 1.3 Account, age and erasure (REVW-21, REVW-29)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-01-01-51 | a registration without the minimum-age attestation | submit | `422 age_attestation_required`; no account row | Negative |
| AC-01-01-52 | the person declares an age below the minimum | submit | refused with a neutral message; no account created; only a hashed rate-limit signal kept for 24 h | Security |
| AC-01-01-53 | any account with status `active` | database constraint check | `min_age_attested_at` and the policy version are present (INV-T50) | Invariant |
| AC-19-07-01 | one moderator decides to suspend an account | submits without a second approver | rejected `second_person_required`; with the documented emergency exception the action applies and is reviewed within 24 h | Negative |
| AC-22-03-51 | a `suspended` account with an open moderation case | the holder requests erasure | request acknowledged and parked `on_hold` (reason `moderation_case_open`); the account stays `suspended`; the requester is told a hold applies (INV-T49) | Negative |
| AC-22-03-52 | the case in AC-22-03-51 becomes `closed` | the hold clears | the request resumes; cooling-off starts | Happy |

<a id="record-spec-acceptance-additions-rev2--14-applications-referees-matching-view-revw-27-revw-38-revw-43-revw-11"></a>
### 1.4 Applications, referees, matching view (REVW-27, REVW-38, REVW-43, REVW-11)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-10-03-51 | an application withdrawn 2 h ago, cooldown 24 h | the candidate re-applies | `409 reapply_cooldown` with the earliest allowed time | Negative |
| AC-10-03-52 | a withdrawn application, cooldown passed, job `published` | the candidate re-applies | a new application with `reapplied_from`; the hiring team sees the link and withdrawal date; a new evidence snapshot is taken | Happy |
| AC-10-03-53 | an application ended `rejected` | the candidate tries to re-apply | refused; only a recruiter invitation creates a new linked application | Negative |
| AC-06-10-51 | a manual reminder was sent on day 3 | day 4 arrives | the system reminder is deferred until 3 days after the manual one; the total never exceeds 2 | Happy |
| AC-06-10-52 | two reminders sent in any mix of system and manual | the candidate presses "Send reminder" | disabled with "2 of 2 reminders used"; the API returns `409 reminder_cap_reached` | Negative |
| AC-11-10-01 | a job with 12 applicants of mixed scores | a recruiter opens "Suggested order" | 12 rows are returned; none hidden; the view is labelled "Suggested order" and advisory (INV-T52) | Honesty |
| AC-11-10-02 | the UI and API surface | text and route lint | the advisory view is never named "shortlist" | Honesty |
| AC-11-09-01 | a tenant with no recorded fairness review | a recruiter requests score-ranked results | the feature flag `matching.recruiter_ranking` is off; the plain filter and the candidate-facing explanation still work (BR-T126) | Negative |
| AC-11-09-02 | ROLE-AUD has recorded the baseline review | the flag is switched on | the change is audited with the review reference | Happy |

<a id="record-spec-acceptance-additions-rev2--15-sessions-idempotency-retention-revw-18-revw-14-revw-26-entitlement-stub"></a>
### 1.5 Sessions, idempotency, retention (REVW-18, REVW-14, REVW-26, entitlement stub)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-01-04-51 | a refresh token idle for more than CONST-S02 | refresh | `401 session_expired` (constants table in BR-REG-R2) | Negative |
| AC-01-04-52 | a sensitive action and a re-auth older than CONST-S06 (5 min) | the action is submitted | step-up required | Security |
| AC-01-04-53 | a refresh token presented again within CONST-S07 (5 s) with its successor unused | refresh | the same successor is returned; presented outside the leeway the family is revoked | Security |
| AC-24-03-51 | a queued offline write with an `Idempotency-Key` created on day 0 | replayed on day 13 | the stored response is returned, no second effect | Idempotency |
| AC-24-03-52 | a route with a natural key | the same logical write arrives twice after day 15 | the second is deduplicated by the natural key | Idempotency |
| AC-10-14-51 | an application whose consent window ended 31 days ago | the retention job has run | the organization's copy holds no snapshot content, answers or contact details; at most the minimal record with an opaque `subject_ref` remains, and only if the OPEN-08 policy keeps it (BR-T122) | Privacy |
| AC-16-04-51 | a free organization in Phase 1 | an admin compensation grant is created | the grant needs reason, approver and expiry; it is audited; a client or redirect cannot create it (BR-T090) | Security |
| AC-02-03-51 | a principal with role `viewer` in an organization | the principal opens candidate content | denied; metadata only where DT-01 allows | Security |
| AC-02-03-52 | an `org_admin` in an organization | the admin files a data-rights request for an employee | refused; the requester must be the subject (SM-DSR t1) | Security |

<a id="record-spec-acceptance-additions-rev2--2-criteria-for-p0-features-that-had-none-revw-17"></a>
## 2. Criteria for P0 features that had none (REVW-17)

Method and list: `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md#record-capability-map-phase-reconciliation-rev2` section 5. Each feature below was a P0 feature in Phase 0 or 1 (or a P0 Phase 2 feature) with no criterion of its own.

| AC | Feature | Given | When | Then | Category |
|---|---|---|---|---|---|
| AC-01-09-01 | FEAT-01-09 | an authenticated principal with several scoped grants | `GET /me/capabilities` for one scope | returns only that scope's evaluated capability set | Happy |
| AC-01-09-02 | FEAT-01-09 | a capability absent from the response | the client calls the action directly | `403`; the capability set is a hint, never the enforcement (INV-T01) | Security |
| AC-01-09-03 | FEAT-01-09 | a grant changes | the next request is made | the response reflects the new set (no stale cache) | Happy |
| AC-02-07-01 | FEAT-02-07 | a principal of organization A | requests any tenant-scoped route with an id of organization B | `404` or `403`; the canary suite fails the build if any route returns B's data | Security |
| AC-02-07-02 | FEAT-02-07 | any tenant table | lint | it has `org_id` and a forced row-level security policy | Invariant |
| AC-02-07-03 | FEAT-02-07 | the application database role | role check | no `BYPASSRLS` | Invariant |
| AC-04-01-01 | FEAT-04-01 | the skills read API | list | canonical skills are returned with a taxonomy version | Happy |
| AC-04-01-02 | FEAT-04-01 | an alias of a skill | resolved | resolves to the canonical skill | Happy |
| AC-04-01-03 | FEAT-04-01 | two skills are merged | an old id is read | it still resolves (redirect) and a merge event is emitted | Happy |
| AC-04-02-01 | FEAT-04-02 | evidence, a job or a course | tagged with a canonical skill | accepted | Happy |
| AC-04-02-02 | FEAT-04-02 | a free-text skill | tagged | `422` (BR-T006) | Negative |
| AC-04-02-03 | FEAT-04-02 | any entity type | tagged | the same skill ids and API are used | Happy |
| AC-08-01-01 | FEAT-08-01 | the course catalogue | filtered by skill and level | only `published` courses are returned | Happy |
| AC-08-01-02 | FEAT-08-01 | a course with prerequisites | opened by a learner who has not met them | unmet prerequisites are shown with links | Happy |
| AC-15-01-01 | FEAT-15-01 | in-app notifications exist | the notification centre opens | newest first, with an unread count | Happy |
| AC-15-01-02 | FEAT-15-01 | an unread notification | marked read twice | idempotent | Idempotency |
| AC-15-03-01 | FEAT-15-03 | the email provider is down | a notification is raised | the in-app item exists; the `email.send` job retries (SM-BGJOB t4); no duplicate email on recovery | Failure |
| AC-15-03-02 | FEAT-15-03 | a mandatory security email during quiet hours | routed | sent now (DT-07 row 2) | Happy |
| AC-15-06-01 | FEAT-15-06 | a hard bounce | the provider webhook arrives | delivery `bounced`; the address is suppressed | Happy |
| AC-15-06-02 | FEAT-15-06 | a transient provider error | the job retries | delivery shows `failed_retry` and mirrors the job, not a second retry schedule | Happy |
| AC-15-07-01 | FEAT-15-07 | an engagement email | the recipient uses one-click unsubscribe | that category is suppressed | Happy |
| AC-15-07-02 | FEAT-15-07 | a mandatory transactional category | unsubscribe attempted | not suppressed; the page explains why | Negative |
| AC-15-07-03 | FEAT-15-07 | an address on the suppression list | a send is attempted | not sent (SM-NOTIFY t1) | Negative |
| AC-20-01-01 | FEAT-20-01 | a customer principal | opens a back-office route | `403`; back-office code is not served to the principal (authenticated edge rule) | Security |
| AC-20-01-02 | FEAT-20-01 | a staff principal without MFA | opens the console | denied until MFA is enrolled (BR-T044) | Security |
| AC-20-01-03 | FEAT-20-01 | a role grant changes | saved | audited with actor and reason | Happy |
| AC-20-03-01 | FEAT-20-03 | the audit viewer | a record is opened | actor, action, resource, reason and request id are shown | Happy |
| AC-20-03-02 | FEAT-20-03 | an audit export | requested | re-auth is required and the export is itself audited | Security |
| AC-21-01-01 | FEAT-21-01 | a user without `analytics.product` consent | uses the product | no product-analytics event is captured | Privacy |
| AC-21-01-02 | FEAT-21-01 | consent is withdrawn | the next event would fire | it is not captured | Privacy |
| AC-22-06-01 | FEAT-22-06 | a user accepts policy version v | stored | version, timestamp and account are recorded | Happy |
| AC-22-06-02 | FEAT-22-06 | policy version v+1 is published | the user's next sensitive action | acceptance of v+1 is required first | Happy |
| AC-24-01-01 | FEAT-24-01 | a state change commits | the process is killed before dispatch | the outbox row survives and the event is delivered after restart | Failure |
| AC-24-01-02 | FEAT-24-01 | an event is delivered twice | the consumer handles it | one effect (consumer dedupe on `event_id`) | Idempotency |
| AC-24-01-03 | FEAT-24-01 | the dispatcher restarts | mid-batch | no event is lost | Failure |
| AC-24-02-01 | FEAT-24-02 | two workers race for one job | claim | exactly one wins (`SKIP LOCKED`) | Concurrency |
| AC-24-02-02 | FEAT-24-02 | a stale worker finishes after its lease expired | complete | the fenced write affects zero rows and the result is discarded | Concurrency |
| AC-24-02-03 | FEAT-24-02 | jobs of kinds `email.send`, `ai.*` and a permanent error | failures repeat | `email.send` is attempted up to 12 times, `ai.*` 3 times, a permanent error goes straight to `dead`; a dead job of a protected kind raises an alert (SM-BGJOB t4, t7) | Failure |
| AC-24-04-01 | FEAT-24-04 | a signed download URL | used after expiry | `403` | Security |
| AC-24-04-02 | FEAT-24-04 | a non-image file | downloaded | forced as attachment (BR-T116) | Security |
| AC-24-05-01 | FEAT-24-05 | a request that passes shell, API and worker | traced | one trace id spans all three; logs redact secrets and direct identifiers | Observability |
| AC-24-08-01 | FEAT-24-08 | requests over the limit | sent | `429` with `Retry-After`; auth endpoints are stricter (BR-T115) | Security |
| AC-24-09-01 | FEAT-24-09 | two worker replicas | a scheduled tick fires | it runs once (unique kind and tick) | Concurrency |
| AC-24-09-02 | FEAT-24-09 | a time-driven transition is due | the job runs | the guard is re-checked at execution time (U7) | Happy |
| AC-24-11-01 | FEAT-24-11 | a migration that drops or rewrites a column in one step | lint | rejected unless it follows expand/contract with a rollback note | Invariant |
| AC-17-01-01 | FEAT-17-01 | code that imports a model provider directly | CI lint | the build fails (BR-T110) | Invariant |
| AC-17-01-02 | FEAT-17-01 | the Phase 0 gateway stub | a call is made | denied by default; no provider is contacted | Security |
| AC-17-02-01 | FEAT-17-02 | a free-tier user | requests AI assistance | no paid inference; the deterministic fallback runs (BR-T111) | Happy |
| AC-17-03-01 | FEAT-17-03 | a principal bound to `AI_PROHIBITED` | any gateway call | denied regardless of caller (BR-T025) | Security |
| AC-17-03-02 | FEAT-17-03 | a denial | logged | the log holds the policy and principal, not the prompt content | Privacy |
| AC-07-01-01 | FEAT-07-01 (Phase 2) | the assessment catalogue | an item is opened | mode badge and AI-policy label are shown | Happy |
| AC-16-01-01 | FEAT-16-01 (Phase 2) | a plan with no price set | the catalogue renders | no price is shown (prices are OPEN-05) | Honesty |
| AC-19-02-01 | FEAT-19-02 (Phase 2) | a report and a system flag on one target | the queue is built | one case (dedupe by target and category); automation cannot move it to `actioned` | Happy |
| AC-19-08-01 | FEAT-19-08 (Phase 2) | a reporter files more than 20 reports in a day | files one more | `429` (BR-T048) | Negative |

<a id="record-spec-acceptance-additions-rev2--3-spec-text-deltas-passages-replaced-once-accepted"></a>
## 3. Spec-text deltas (passages replaced once accepted)

| Original passage | Replacement meaning |
|---|---|
| SPEC-G2 badge line (about L203): "`Mailbox verified` (artifact-backed via domain proof) ... `Employer confirmed` (authority; Phase 3 via verified org)" | Badges: "Not verified"; "Mailbox verified" only for a `bound` domain; "Mailbox verified, employer not confirmed" for an `unbound` domain (rung stays `claimed`); "Confirmed by referee"; for authority, the class is shown: "Platform verified", "Institution verified", "Employer confirmed", "Instructor attested" (DT-06 REV2) |
| SPEC-G2 actors table (about L20): ROLE-INST and issuers "mint `authority_verified` items" | Issuers mint authority records with a mandatory `issuer_class`; instructor-class records follow BR-T119 and DT-14 |
| SPEC-G3 actors and completion rule (about L189, L212 to L214): `instructorSignoff`, "rung `authority_verified` when ... instructor-signed-off" | Instructor sign-off mints `authority_verified` with class `instructor` only after DT-14; it never counts as platform-verified; revocable |
| SPEC-G3 offline lines (L76, L209, L256) | Assessment answers are online-only; lesson progress is a queued write; downloadable video is out of Phases 1 and 2 (REVW-15 decision) |
| SPEC-G1 onboarding (registration step, micro-feature FEAT-01-01.3 "age/guardian gate [OPEN-09]") | Registration requires the minimum-age attestation of BR-T120 (value [OPEN-counsel]); no account is created below the minimum |
| SPEC-G4 FEAT-10-03 "Withdraw & re-apply policy" and the application states paragraph | Withdrawn is terminal; the candidate may submit a new linked application after the cooldown (BR-T125, SM-APPLICATION t12) |
| SPEC-G4 FEAT-11-10 "Suggested shortlist per job (human-gated)" (also PCAP-01 title) | "Suggested order"; the view returns all applicants (INV-T52) |
| SPEC-G5 section 3.2 CSV columns and BR-T106 | The roster CSV may carry the attestation flag or date of birth only if counsel requires it (BR-T120); rows flagged under-age stay blocked |
| USER_JOURNEYS about line 115: "1st reminder after 3 days (ACT-VER-03)" | "Reminders: the system sends on day 4 and day 9; you can also send one yourself 3 days after the last send; two in total" (BR-T121) |
| ACT-VER-03 availability (`07_UI_UX`) | "≥ 3 days since last send of any kind and fewer than 2 reminders in total" (DT-13) |
| SPEC-G5 retention paragraph for applications; DATA-021 (24 months) | Identifiable content follows BR-T122; the 24-month figure applies only to the minimal record if OPEN-08 allows it |

<!-- source-record-end: Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_ACCEPTANCE_ADDITIONS_REV2.md -->
