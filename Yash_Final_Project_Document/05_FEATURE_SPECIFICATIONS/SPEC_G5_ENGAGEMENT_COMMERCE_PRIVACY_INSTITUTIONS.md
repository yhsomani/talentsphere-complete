# Feature Specifications — Group 5: Messaging, Billing, Data Rights, Institutions

Doc ID: SPEC-G5 · Owner: Product Director + Messaging/Billing/Privacy/Institution leads · Version 1.0 · Status: Under Review · Relates: DOM-13, DOM-15, DOM-16, DOM-18, DOM-22, FEAT-13-01…13-06, FEAT-16-01…16-04, FEAT-16-07, FEAT-16-08, FEAT-16-11, FEAT-22-02, FEAT-22-03, FEAT-22-07, FEAT-18-01…18-04, FEAT-18-06, FEAT-18-07, SM-SUBSCRIPTION, SM-DSR, SM-ACCOUNT, DT-02, DT-08, DT-11, BR-T060…T066, BR-T080…T084, BR-T090…T097, BR-T100…T106, INV-T17, INV-T35, INV-T38, INV-T41, INV-T42, ADR-T15

Conventions: see `README.md`. Endpoints provisional under `/api/v1`. All **[TARGET]**; `{…}` **[OPEN]**. Stripe event names and statuses are cited from general knowledge of the processor and must be **re-verified against current Stripe documentation at build time [OPEN]**.

---

# SPEC-11 Messaging & Recruiter Outreach Quota

**Metadata:** Doc ID SPEC-11 · Owner: Messaging PM · Version 1.0 · Status Under Review · Phase 2 · Priority P0 · Features: FEAT-13-01, FEAT-13-02, FEAT-13-03, FEAT-13-05, FEAT-13-06, FEAT-16-11, FEAT-11-05 · Modules: MOD-MSG, MOD-HIR · `api/messaging`, `api/billing`, `api/safety`, `apps/worker` · Relates: DT-08, BR-T080…T084, INV-T40, INV-T42, SM-MODCASE, ADR-T10

## 1. Business purpose
Allow useful candidate–employer conversation while making unsolicited recruiter contact **consented, rate-limited and candidate-controlled**. Value: recruiter response speed, candidate trust, spam control; the quota is both the abuse brake and a plan lever (never a ranking lever).

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-CAND | read/write own threads; accept/decline/block first contact; mute; report | `message:write:own` |
| ROLE-REC / ROLE-HM | message applicants of their jobs; send outreach within quota; read threads of own jobs | `message:write:job`, `outreach:send` |
| ROLE-ORGADM | read thread **metadata** (participants, timestamps) for org threads; no bodies unless on job team | `message:read:meta:org` |
| ROLE-MOD | read reported content via case snapshot | `message:read:case` |
| ROLE-SUP | read under grant | `message:read:granted` |
| ROLE-INSTADM/FAC | none (BR-T105) | — |

## 3. Functional behavior
### 3.1 Conversation model
Thread types: `application` (created with an application or when a job-team member first messages an applicant; participants = candidate + job team) and `outreach` (created on acceptance of a first-contact request; participants = candidate + sender + sender-nominated colleagues, visible to the candidate). A thread belongs to exactly one candidate and one org (INV-T03).
Message: `body` 1–4,000 chars plain text with auto-linked https URLs (no HTML); attachments Phase 3 (scanned). Rate limits: 30 messages/min/user; 200 messages/day to distinct first-contact targets (quota separate, §3.3).
Edit: within 5 min, marked "edited"; delete = tombstone ("message deleted"), reported messages retained for review (BR-T084).

### 3.2 Sending, delivery, offline (FEAT-13-01, 13-03)
`POST /threads/{id}/messages` with `clientMessageId` + `Idempotency-Key`; server dedupes on `(thread, clientMessageId)`. Real-time via SSE with polling fallback (15 s). **Offline compose queue:** composed messages are stored locally and shown as "Queued"; on reconnect each is sent in order. Revalidation at send time: thread still exists and is not blocked/archived, sender still authorised; queued > 24 h ⇒ user must confirm before send; rejected items return to composer with reason. Notifications: new-message notification per thread, collapsed to one email per thread per 10 min; push if enabled; quiet hours per BR-T086 (messages are not time-critical).

### 3.3 Recruiter outreach (FEAT-13-02) — DT-08
`POST /outreach {candidateId, jobId?, templateId?, body ≤ 1,000}` with Idempotency-Key:
1. Authorise recruiter; candidate must be discoverable for contact (`outreach.recruiter_contact` live), org not blocked by candidate (INV-T40).
2. Evaluate DT-08: if candidate applied to this org's job ⇒ no outreach needed, use application thread.
3. **Quota:** decrement atomically — `UPDATE quota SET used = used + 1 WHERE subject = ? AND period = ? AND used + 1 <= limit`; zero rows ⇒ `409 quota_exceeded` with reset date (INV-T42; counter is derived/recomputable from requests). Quota is per org per period, allocated per plan and seats (DT-02b); display shows remaining.
4. Create `first_contact_request` (`pending`), 14-day expiry, notify candidate. **No quota refund** on expiry or decline (prevents spray-and-pray); a withdrawn request (sender cancels before candidate action) is refunded once.
5. Cooldown: after a decline, the same org cannot send another request to that candidate for 30 d (BR-T081).
Candidate actions (FEAT-13-06): **Accept** (creates `outreach` thread, sender notified), **Decline** (optional reason code `not_interested|not_looking|wrong_role|other`; sender sees only "not interested"), **Block org** (BR-T083). Candidates may pause all outreach by revoking `outreach.recruiter_contact`; pending requests stay but cannot be answered by sender follow-ups.

### 3.4 Block, mute, report (FEAT-13-05)
Block user/org: bidirectional; existing threads become read-only archived; candidate disappears from the blocked org's search/shortlist suggestions; org members see only "unavailable". Mute thread: suppresses notifications, thread remains. Report: attaches a frozen snapshot of the last 20 messages and metadata, opens SM-MODCASE; the reported party is not told who reported (BR-T048). Automated content classifiers may flag messages for review; they never delete or block by themselves (INV-T09).

### 3.5 Metering (FEAT-16-11.2) and side effects
Events: `message.sent` (seed), `outreach.requested/accepted/declined/expired`, `thread.blocked`. Postconditions: first-contact count in a period equals quota counter (INV-T42); blocked pairs have no new messages.

## 4. User interaction
Candidate: SCR-INBOX (tabs: Messages · Requests), request card shows sender, org, role, message, **Accept / Decline / Block org**, one-tap "Pause outreach"; SCR-THREAD (bubbles with timestamps, participants header, report/mute/block menu). Recruiter: SCR-OUTREACH-COMPOSE (template picker, remaining quota "37 of 50 · resets 1 Nov", preview of what candidate sees), SCR-OUTREACH-LIST (pending/accepted/declined/expired with reasons as candidate allows). Accessibility: live region for new messages, keyboard send, no auto-play; mobile-first thread view. Offline: banner "Messages will send when you're back online".

## 5. Backend behavior
`api/messaging` owns threads/messages/requests/blocks; calls `privacy.hasConsent` and `billing.consumeQuota` via public interfaces; emits events to notify. Quota consumption is a single-statement conditional update inside the request-creation transaction; quota counters are rebuilt nightly from requests and compared (drift alert). SSE gateway authenticates with cookie session; per-user connection cap.

| Endpoint (provisional) | Method |
|---|---|
| `/threads`, `/threads/{id}` | GET |
| `/threads/{id}/messages` | GET (cursor) / POST |
| `/messages/{id}` | PATCH (edit ≤ 5 min) / DELETE |
| `/outreach` | POST (recruiter) / GET |
| `/outreach/{id}/accept`, `/decline`, `/withdraw` | POST |
| `/blocks` | POST/DELETE |
| `/threads/{id}/mute`, `/report` | POST |
| `/orgs/{org}/quota` | GET |

## 6. Data
| Entity | Key fields |
|---|---|
| `thread` | id, type, candidate_id, org_id, job_id?, state (`open`/`archived`), created_at |
| `thread_participant` | thread_id, member_id, role, muted |
| `message` | id, thread_id, sender_id, client_message_id, body, created_at, edited_at, deleted_at |
| `first_contact_request` | id, org_id, sender_id, candidate_id, job_id?, body, state (`pending`/`accepted`/`declined`/`expired`/`withdrawn`), expires_at, decline_code |
| `block` | blocker_id (person or org), blocked_id, created_at |
| `quota_counter` | subject (org), meter, period_start, limit, used (derived) |
| `report_snapshot` | case_id, messages jsonb, created_at |

## 7. States and transitions
First-contact request: `pending → accepted | declined | expired | withdrawn` (all terminal). Thread: `open → archived` (block, or application terminal + 90 d **[OPEN]**). Moderation: SM-MODCASE.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | send p95 ≤ 250 ms; delivery via SSE p95 ≤ 2 s |
| Security | per-thread authz; anti-enumeration of candidates; message bodies encrypted at rest |
| Privacy | counterpart sees only display name and role; contact details only by explicit share |
| Abuse | rate limits; quota; report flow; classifier flags (human decides) |
| Accessibility | WCAG 2.2 AA; live regions politely announced |
| Offline | compose queue per ADR-T10 |
| Retention | messages kept while participants' accounts exist + {12 months} after application end for hiring records **[OPEN-08]** |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Duplicate send (retry) | deduped by `clientMessageId` |
| Quota race: 2 recruiters, 1 remaining | exactly one succeeds; other `409 quota_exceeded` |
| Candidate blocks org while recruiter composing | send fails with neutral "unavailable"; no leak that block exists beyond that |
| SSE connection drops | client falls back to polling and resumes with last event id |
| Queued message after consent revoked | rejected on replay; returns to composer |
| Mass-outreach pattern (≥ 100 requests/hour from one org) | throttle + case for review (flag-only) |
| Candidate account deactivated | pending requests hidden; expire on schedule |
| Report on a deleted message | snapshot already holds content; case proceeds |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-13-01-01 | submitted application | job-team member messages | `application` thread created; candidate notified | Happy |
| AC-13-01-02 | same `clientMessageId` sent twice | POST | one message | Idempotency |
| AC-13-01-03 | message of 4,000 / 4,001 chars | POST | accepted / `422` | Boundary |
| AC-13-01-04 | user not in thread | GET thread | `404` | IDOR |
| AC-13-01-05 | edit at 4:59 / 5:01 after send | PATCH | allowed / `409` | Boundary |
| AC-13-03-01 | offline, 3 messages queued | reconnect | sent in order exactly once | Recovery |
| AC-13-03-02 | queued message when thread now blocked | replay | rejected; text returns to composer | Edge |
| AC-13-03-03 | message queued 25 h | reconnect | asks user to confirm before sending | Boundary |
| AC-13-02-01 | `outreach.recruiter_contact` live, quota available | outreach | request `pending`; quota −1 | Happy |
| AC-13-02-02 | no `outreach.recruiter_contact` | outreach | `403 no_consent` (DT-08 row 3) | Negative |
| AC-13-02-03 | quota exhausted | outreach | `409 quota_exceeded` with reset date | Negative |
| AC-13-02-04 | quota 1, two concurrent requests | submit | exactly one succeeds; counter = limit | Concurrency |
| AC-13-02-05 | decline 10 days ago | same org outreach | `409 cooldown` until day 30 | Boundary |
| AC-13-02-06 | request pending 14 d | sweep | `expired`; no refund | Time |
| AC-13-02-07 | sender withdraws before candidate acts | withdraw | `withdrawn`; one refund only (second withdraw no-op) | Idempotency |
| AC-13-02-08 | quota counter vs requests | nightly check | equal; drift raises alert | Consistency |
| AC-13-06-01 | candidate accepts | accept | thread created; sender notified | Happy |
| AC-13-06-02 | candidate declines with reason `wrong_role` | decline | sender sees "not interested" only | Privacy |
| AC-13-06-03 | candidate blocks org | block | all org members blocked; earlier threads archived | Happy |
| AC-13-05-01 | candidate blocked by org-side recruiter | search | candidate absent for that org | Negative |
| AC-13-05-02 | report with 20-message snapshot | submit | case opened; reporter hidden from subject; deleting messages later does not alter snapshot | Safety |
| AC-13-05-03 | muted thread | new message | in-app unread increments; no email/push | Happy |
| AC-16-11-04 | org plan without outreach | outreach | `403 entitlement` | Negative |
| AC-11-05-01 | recruiter search | results | only candidates with live `search.discoverable` + not blocking org | Consent |

## 11. Testing
DT-08 table tests (one per row); concurrency tests for quota; SSE reconnect tests; offline queue e2e; cross-tenant canary on thread endpoints; abuse simulation (burst outreach); notification collapse tests; accessibility audit of live regions.

## 12. Developer guidance
Order: threads/messages → application-thread auto-creation → blocks/reports → first-contact request → quota → SSE → offline queue. Pitfalls: counting quota in application memory; leaking "blocked" state through error text; sending email per message. Decisions pending: quota values (OPEN-05), message retention (OPEN-08), attachment scope.

## 13. Related
`DECISION_TABLES.md` DT-08, DT-01 · `BUSINESS_RULES_REGISTRY.md` BR-T080…T084 · SPEC-02 (consent) · SPEC-10 · SPEC-12.

---

# SPEC-12 Billing Checkout & Entitlement Derivation

**Metadata:** Doc ID SPEC-12 · Owner: Monetisation PM · Version 1.0 · Status Under Review · Phase 2 · Priority P0 · Features: FEAT-16-01, FEAT-16-02, FEAT-16-03, FEAT-16-04, FEAT-16-07, FEAT-16-08, FEAT-16-09, FEAT-16-11 · Modules: MOD-ACC · `api/billing`, `packages/policy`, `apps/worker` · Relates: ADR-T15, INV-T17, INV-T32, SM-SUBSCRIPTION, DT-02, BR-T090…T097

## 1. Business purpose
Take payment safely and translate it into exactly the access the buyer paid for — no more, no less — with the processor's signed word as the only authority. Value: GOAL-07 (sustainability), reduced fraud/support load, never charging for core candidate loop (BR-T091).

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-CAND | buy candidate premium or paid courses; manage own subscription | `billing:buy:self`, `billing:manage:self` |
| ROLE-ORGADM / org_owner | buy org plans, manage seats, view invoices | `billing:manage:org` |
| other org roles | read entitlement status | `billing:read:org` |
| ROLE-INSTADM | institution licence billing (SPEC-14, invoice-based) | `billing:manage:institution` |
| ROLE-SUP | read billing status under grant; initiate refunds per policy | `billing:read:granted`, `billing:refund` |
| Stripe (system) | signed webhooks | `webhook:stripe` |

## 3. Functional behavior
### 3.1 Catalogue (FEAT-16-01)
`plan {id, audience ∈ {candidate, org, institution}, name, interval ∈ {month, year}, stripePriceId, entitlements{}, seatBased, version, active}`. Entitlement keys (examples): `job_slots`, `seats`, `outreach_per_seat_month`, `verified_search_month`, `ai_credits_month`, `resume_variants`, `analytics_advanced`, `scheduling_tools`. Prices and tiers are **[OPEN-05]**; the catalogue is data, versioned; existing subscribers stay on their plan version until they change.

### 3.2 Checkout (FEAT-16-02) — redirect grants nothing
`POST /billing/checkout {planId, quantity?}` + Idempotency-Key:
1. Authorise buyer for the billing subject (self or org).
2. If an active subscription for the same audience/plan family exists ⇒ `409 already_subscribed` with portal link.
3. Create local `checkout_attempt (pending)` and a Stripe Checkout Session with `client_reference_id = billing_subject_id`, metadata `{checkoutAttemptId, planId}`, success/cancel URLs. Return `{url}`.
4. Return page `/billing/return?attempt=<id>`: **informational only**; polls `GET /billing/status` until the local subscription state reflects the webhook (max 2 min), then shows result; at timeout shows "still processing — we'll email you".
Card data never touches the platform.

### 3.3 Webhook processing (FEAT-16-03) — authority
`POST /webhooks/stripe`: (a) verify signature on the raw body against the current and, during rotation, the previous endpoint secret, tolerance 5 min; invalid ⇒ `400`, alert on rate; (b) insert `stripe_event(event_id)` — unique violation ⇒ already processed ⇒ `200`; (c) for subscription/invoice events, **fetch the current object from the processor** (or use `created` ordering) and apply only if its version/timestamp ≥ stored `processor_version` (out-of-order safe); (d) transition SM-SUBSCRIPTION; (e) write entitlement snapshot; (f) outbox `entitlement.changed`; (g) respond `200` quickly, heavy work async. Unknown event types are stored and ignored. Failures return `5xx` so the processor retries; poison events dead-lettered after 5 internal failures with alert (SM-BGJOB).
Handled event families (illustrative; re-verify at build): `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`, `charge.dispute.created`.
Daily **reconciliation**: list processor subscriptions changed in the last 48 h and compare with local state; differences are applied via the same handler and reported.

### 3.4 Entitlement derivation (FEAT-16-04)
`deriveEntitlements(subjectState, plan, adminGrants, now) → EntitlementSet` is a **pure function** implementing DT-02a/b (INV-T32). Results cached as `entitlement_snapshot {subject, set, version, derived_at}` and invalidated by `entitlement.changed`; consumers call `billing.can(subject, "job.publish")` or read the snapshot via the public interface — never subscription tables. Admin comps are explicit grants with expiry, reason and audit. Grace: `past_due` keeps full entitlements for {7} d (BR-T092) then degrades (DT-02a).

### 3.5 Seats (FEAT-16-08), meters (FEAT-16-11)
Seat assignment: org admin assigns purchased seats to members; `assigned ≤ purchased`; lowering quantity below assigned requires unassign first (BR-T094). Meters: `ai_credits`, `outreach`, `verified_search` with `(subject, meter, period_start)` counters; consumption by conditional update (no overspend race); period = subscription billing period (free tier: calendar month); resets by period roll; exceeding ⇒ typed `409 quota_exceeded` — **no overage billing** (BR-T095). Free-tier AI = 0 paid inference (INV-T07).

### 3.6 Dunning (FEAT-16-07)
On `invoice.payment_failed`: state `past_due`, notify billing contacts day 0, 3, 6 (mandatory transactional); day 7 degrade; recover on `invoice.paid` (restore instantly). Never delete data.

### 3.7 Postconditions
Entitlements at any time = pure function of current state; no code path grants access from a redirect, a client claim or a cache older than invalidation (INV-T17/T32).

## 4. User interaction
SCR-PLANS (comparison; recommended plan marker never pushy; prices localised; currency shown; annual savings computed server-side), SCR-CHECKOUT-RETURN (processing/success/cancelled states, no premature "unlocked" copy), SCR-BILLING (current plan, status chip, next renewal, seats, meters with bars + text, invoices list, "Manage payment details" opening Stripe Customer Portal), SCR-SEATS, upgrade prompts at gates with explicit reason ("You've used 50 of 50 outreach requests; resets 1 Nov"). Accessibility: WCAG 2.2 AA; meters as text + progressbar semantics. Mobile-friendly checkout via processor.

## 5. Backend behavior
`api/billing` owns plans, subjects, subscriptions, snapshots, meters, events. Stripe access only through `PaymentProviderPort` (single adapter; ADR-T15). The webhook route is excluded from CSRF and cookie auth, protected by signature; IP allow-listing optional. Secrets from config; never logged (INV-T14). Entitlement reads must be < 5 ms (in-memory cache keyed by snapshot version).

| Endpoint (provisional) | Method |
|---|---|
| `/billing/plans` | GET |
| `/billing/checkout` | POST (Idempotency-Key) |
| `/billing/status` | GET |
| `/billing/portal` | POST (returns portal URL) |
| `/billing/seats` | GET/PUT |
| `/billing/usage` | GET |
| `/webhooks/stripe` | POST (signature) |

## 6. Data
| Entity | Key fields |
|---|---|
| `billing_subject` | id, type (account/org/institution), processor_customer_id |
| `plan`, `plan_entitlement` | see §3.1 |
| `checkout_attempt` | id, subject_id, plan_id, state (`pending`/`completed`/`abandoned`), created_at |
| `subscription` | id, subject_id, plan_id, plan_version, state (SM-SUBSCRIPTION), processor_id, current_period_start/end, cancel_at_period_end, processor_version |
| `stripe_event` | event_id (unique), type, received_at, processed_at, outcome |
| `entitlement_snapshot` | subject_id, set jsonb, version, derived_at |
| `entitlement_grant` | subject_id, key, value, reason, granted_by, expires_at |
| `usage_meter` | subject_id, meter, period_start, limit, used |
| `seat_assignment` | subject_id, member_id, assigned_at |
| `invoice_ref` | processor_invoice_id, subject_id, amount, currency, status, issued_at |
Retention of invoice records: legal requirement **[OPEN-08]**.

## 7. States and transitions
SM-SUBSCRIPTION t1–t10. Forbidden: any transition from a browser request; applying an older processor object.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Correctness | exactly-once effect per event id; reconciliation drift = 0 target |
| Performance | webhook ack p95 ≤ 300 ms; entitlement check ≤ 5 ms cached |
| Security | signature verification; secret rotation procedure; PCI scope minimised (hosted checkout); no card data stored |
| Availability | checkout creation errors degrade gracefully; paid users keep entitlements if the processor is down (state is local) |
| Privacy | billing identifiers separated from profile data; export includes own invoices |
| Auditability | every entitlement change traceable to an event or admin grant |
| Accessibility | WCAG 2.2 AA on plan/billing pages |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Customer pays, closes tab before return | webhook activates entitlements; email confirms |
| Webhook delayed/failed | return page shows "processing"; reconciliation job repairs ≤ 1 h; no manual grant needed |
| Duplicate/replayed webhook | idempotent (unique event id) |
| Events arrive out of order | version/refetch rule yields correct final state |
| Signature invalid | `400`; no state change; alert on spikes |
| Secret rotation | both secrets accepted during window; then old removed |
| Double checkout click | one attempt per Idempotency-Key; `already_subscribed` for second subscription |
| Downgrade below used job slots/seats | change scheduled at period end or blocked with required actions; no data deletion |
| Stripe API outage at checkout | friendly error with retry; nothing charged |
| Refund/dispute | state per events; access removal per policy; human review of disputes |
| Currency/tax mismatch | **[OPEN]** tax handling (FEAT-16-12) not specified |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-16-02-01 | org admin picks plan | checkout | session URL returned; `checkout_attempt` pending; no entitlement change | Happy |
| AC-16-02-02 | same Idempotency-Key twice | POST | same session URL | Idempotency |
| AC-16-02-03 | active subscription same family | checkout | `409 already_subscribed` | Negative |
| AC-16-02-04 | user hits success URL manually without payment | open return page | status stays processing/failed; entitlements unchanged | Security (INV-T17) |
| AC-16-02-05 | non-owner org member | checkout | `403` | Negative |
| AC-16-03-01 | valid signed event | POST webhook | `200`; state updated; `entitlement.changed` | Happy |
| AC-16-03-02 | tampered body or wrong secret | POST | `400`; nothing changed | Security |
| AC-16-03-03 | event id seen before | POST | `200`; no second effect | Idempotency |
| AC-16-03-04 | `updated` event older than stored version | process | ignored | Concurrency |
| AC-16-03-05 | handler throws | process | `5xx` returned; processor retries; success later applies once | Recovery |
| AC-16-03-06 | webhook lost for 2 h | reconcile job | local state corrected; report lists the drift | Recovery |
| AC-16-04-01 | state `active` | derive | plan entitlements per DT-02 | Happy |
| AC-16-04-02 | `past_due` day 6 vs day 8 | derive | full / degraded | Boundary |
| AC-16-04-03 | `canceled` | derive | free tier; data intact | Happy |
| AC-16-04-04 | any plan | derive | candidate core loop features always available (BR-T091) | Invariant |
| AC-16-04-05 | admin comp with expiry | derive after expiry | comp absent | Time |
| AC-16-04-06 | property test over random state/plan/grant combos | derive | deterministic; monotone with plan tier; never grants key not in plan/grant | Property |
| AC-16-07-01 | payment fails | day 0, 3, 6 | three notices; no feature loss until day 7 | Process |
| AC-16-08-01 | 5 seats, 5 assigned | reduce to 3 | `409` until 2 unassigned | Boundary |
| AC-16-11-01 | 1 outreach left, two parallel consumes | consume | exactly one succeeds | Concurrency |
| AC-16-11-02 | period rolls | reset job | counters reset once; replay safe | Idempotency |
| AC-16-11-03 | free-tier user triggers AI feature | call | deterministic fallback; no paid inference (INV-T07) | Cost |
| AC-16-09-02 | paid course | pay | enrolment activates from webhook only (SPEC-06) | Integration |

## 11. Testing
Stripe test-mode integration suite using the processor's test fixtures; signed-payload fixtures for replay, tamper, out-of-order, duplicate; pure-function property tests for `deriveEntitlements`; concurrency tests on meters and seats; reconciliation tests with a fake provider; time-travel tests for grace; security test that no route mutates `subscription` except the webhook handler and admin grants.

## 12. Developer guidance
Build order: plans → `deriveEntitlements` + snapshot → webhook handler with event table → checkout → status page → portal → meters → seats → dunning → reconciliation. Pitfalls: trusting `client_reference_id` without matching a local attempt; computing entitlements ad hoc in feature code; using JSON body parsing before signature verification (raw body required). Decisions pending: pricing/tiers (OPEN-05), tax (FEAT-16-12), refund windows (OPEN-06), annual proration rules.

## 13. Related
`ADR_REGISTER.md` ADR-T15 · `STATE_MACHINES.md` SM-SUBSCRIPTION · `DECISION_TABLES.md` DT-02 · `BUSINESS_RULES_REGISTRY.md` BR-T090…T097 · SPEC-06, SPEC-07, SPEC-11.

---

# SPEC-13 Data Export & Erasure

**Metadata:** Doc ID SPEC-13 · Owner: Privacy PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-22-02, FEAT-22-03, FEAT-01-10, FEAT-22-07 · Modules: MOD-ACC · `api/privacy` (orchestrator) + contributor interface in every module · Relates: SM-DSR, SM-ACCOUNT, DT-11, BR-T060, BR-T064…T066, INV-T35, INV-T38, INV-T43, OPEN-08

## 1. Business purpose
Give every person a trustworthy way to take their data with them and to leave completely, within defined time limits, without support heroics. Value: GOAL-06 (privacy), trust, regulatory posture (statutory specifics are **[OPEN-08]**; no legal claim is made).

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| Data subject (any authenticated principal) | request export/erasure for self; cancel in allowed windows | `dsr:create:self`, `dsr:cancel:self` |
| ROLE-ORGADM | assist org employees' requests (Phase 3) | `dsr:assist:org` |
| ROLE-SUP | assist a locked-out subject after identity verification; cannot read archive contents | `dsr:assist` (grant-bound) |
| ROLE-ADM | replay failed jobs; place/lift legal hold | `dsr:operate`, `legalhold:manage` |
| ROLE-AUD | read request metrics and receipts | `dsr:audit` |

## 3. Functional behavior
### 3.1 Export (FEAT-22-02) — SM-DSR
Request: `POST /me/data-requests {type:"export"}` with Idempotency-Key; requires re-auth ≤ 5 min (BR-T057); one open request per type; ≤ 1 completed export per 24 h (BR-T064).
Archive contents (by category; each module registers an **export contributor**; CI fails if a module owning personal-data tables has none):
| Category | Included |
|---|---|
| Account | email addresses (verified status), created/last-seen dates, policy acceptances, passkey names (not keys), session list metadata |
| Profile | all profile fields, links, preferences, blocklist, résumé variants |
| Evidence | items, provenance summaries, artefact files, revocation records about the subject |
| Verification | work claims, verification requests (no codes/tokens), referee requests the subject sent and the **outcomes** (not referee free text unless referee consented to share) |
| Learning / assessment | enrolments, progress, attempts, results, certificates |
| Applications | submitted answers, snapshots as submitted, status history, notes **visible to candidate** only |
| Messages | the subject's sent and received messages in their threads; counterpart identified by display name/role only |
| Consents | full ledger |
| Billing | invoices metadata, plan history (no card data) |
| Notifications | preferences, delivery log |
| Access log | who accessed the subject's data (FEAT-22-04) |
| Excluded | other people's personal data, fraud/abuse signals, moderation reporter identities, secrets, internal notes about the subject written by staff for security reasons **[OPEN-08]** |
Format: ZIP with `manifest.json` (schema version, generated_at, categories, counts, sha256 per file), `data/*.json` (UTF-8), `files/` (artefacts), `README.txt` describing structure. Large archives split in parts ≤ 2 GB.
Delivery: worker builds async; on completion the subject gets an email that **links to the authenticated Privacy page, not to the file**; download requires re-auth ≤ 5 min and uses a one-time signed URL (TTL 15 min); archive deleted after 7 d (BR-T064).

### 3.2 Erasure (FEAT-22-03)
1. **Request:** `POST /me/data-requests {type:"erasure"}`; screen lists consequences; requires re-auth and typing the account email; blocks with `409` if the subject is the **sole owner** of an organisation/institution (transfer or close first, FEAT-02-08) or has an open legal hold; for instructors with live courses the subject chooses *transfer*, *unpublish and keep learner access for 30 d*, or *remove*.
2. **Cooling-off (7 d):** SM-DSR `cooling_off`; account `pending_erasure` (SM-ACCOUNT t7): sessions revoked, profile hidden, search removed, scheduled jobs for the subject paused; sign-in leads only to a **Cancel erasure** page; reminder emails day 1 and 6. Cancel restores prior state (t8) and re-publishes profile if it was public.
3. **Execution (≤ 30 d from request, BR-T060):** orchestrator fans out `eraseContributor(subjectId, requestId)` to every module (idempotent, returns checkpoint). Sequence: (a) stop processing: revoke credentials, push tokens, share links; (b) billing: cancel subscriptions at period end or immediately per user choice, request deletion of the processor customer except legally retained records; (c) applications: withdraw active ones (employers are notified "candidate withdrew"); employer-held hiring records follow org policy/**[OPEN-08]**, with subject identifiers pseudonymised; (d) evidence/profile/learning/messages per DT-11; (e) referee data about the subject deleted; responses the subject gave **as a referee** for others are anonymised (attester becomes "former colleague") so others' verification does not silently collapse — a documented trade-off **[OPEN-08]**; (f) search index and caches purged; (g) analytics deleted or aggregated irreversibly; (h) billing records pseudonymised and retained (list in receipt); audit, consent and stage-transition history is **not rewritten**: it holds only the opaque `subject_ref`, and the orchestrator deletes the `subject_identity_map` row (and per-subject key) as the last contributor step, so those rows are retained as unlinkable records listed on the receipt (REVW-04, DB-02 §4.1); (i) object storage blobs deleted; (j) **verification sweep** (INV-T38): scans every store for the subject id, email hash and artefact hashes (opaque `subject_ref` tokens are excluded from the hit terms; instead it asserts that no identity-map row or key remains and that the audit/consent anchors covering the subject's rows still verify); any hit fails the request into `failed` for ops.
4. **Receipt:** email to the verified address plus on-screen page (while it exists) listing: what was deleted, what was retained and why, and the date. The receipt itself stores no personal data beyond a salted hash of the email, kept for {30 d} to answer follow-ups **[OPEN-08]**.
5. **Deactivation (FEAT-01-10)** is separate and reversible: profile hidden, alerts paused, data kept {12 months} **[OPEN]**; the UI explains the difference between deactivate and erase.

### 3.3 Legal hold (FEAT-22-07)
Admins can place a hold on a subject with reason and case reference; the DSR moves to `on_hold` (SM-DSR t7); the subject is told only that a lawful restriction applies [OPEN-08]. Holds are reviewed monthly.

### 3.4 Side effects & postconditions
Events: `dsr.requested`, `export.ready`, `erasure.requested`, `erasure.completed` (seed), `account.erased`. Postconditions: INV-T38 after completion; an audit trail of the request (not of personal content) persists.

## 4. User interaction
SCR-PRIVACY-HOME (export, erase, consents, access log, deactivate); SCR-EXPORT-STATUS (queued/building/ready with expiry countdown; failure message with retry); SCR-ERASE-WARN (plain-language consequences, checkbox per irreversible item, typed confirmation), SCR-ERASE-PENDING (countdown, cancel button prominent), SCR-ERASE-RECEIPT. Copy avoids dark patterns: Cancel is as visible as Confirm. Accessibility: WCAG 2.2 AA; no timed controls beyond security re-auth; screen-reader friendly status updates.

## 5. Backend behavior
`api/privacy` hosts the orchestrator and the DSR state machine; modules implement `privacy.exportContributor` and `privacy.eraseContributor` in their public interface (FF-02). The orchestrator persists per-module checkpoints so a crash resumes without repeating destructive steps (idempotent deletes). Export builds stream data (no full in-memory) to object storage in a `dsr/` bucket with lifecycle expiry. SLA monitor alerts ops at day 20, 25 and 28 for any open erasure. Export and erase jobs run with a service identity limited to the subject's data (not general admin).

| Endpoint (provisional) | Method |
|---|---|
| `/me/data-requests` | POST create / GET list |
| `/me/data-requests/{id}` | GET status |
| `/me/data-requests/{id}/cancel` | POST |
| `/me/data-requests/{id}/download` | POST (re-auth; returns one-time URL) |
| `/admin/legal-holds` | POST/DELETE (ROLE-ADM) |
| `/admin/data-requests/{id}/replay` | POST (audited) |

## 6. Data
| Entity | Key fields |
|---|---|
| `data_request` | id, subject_id, type, state (SM-DSR), requested_at, deadline_at, verified_at, completed_at, outcome, receipt_ref |
| `dsr_checkpoint` | request_id, module, step, status, at, detail_min |
| `export_archive` | request_id, object_key, size, sha256, expires_at, downloads |
| `legal_hold` | id, subject_id, reason_code, case_ref, placed_by, placed_at, lifted_at |
| `erasure_tombstone` | email_hash_salted, request_id, expires_at |
| `retained_record_ref` | request_id, store, category, legal_basis_note |

## 7. States and transitions
SM-DSR t1–t10; SM-ACCOUNT t7–t9. Forbidden: cancelling an erasure in `in_progress`; marking `completed` without a clean sweep.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Timeliness | export ready p95 ≤ 4 h for typical accounts (≤ 5 GB); erasure complete ≤ 30 d (target ≤ 10 d) |
| Reliability | resumable, idempotent; no partial-delete-without-record |
| Security | re-auth; archive encrypted at rest; one-time URLs; support cannot read archives; archive never emailed |
| Privacy | exports exclude third-party personal data; receipts minimal |
| Completeness | contributor coverage enforced by CI lint; sweep verifies |
| Accessibility | WCAG 2.2 AA; plain-language |
| Cost | archive TTL 7 d; storage lifecycle |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Build crashes mid-export | job resumes from checkpoint; same request id; no duplicate archives |
| Archive link forwarded | useless: link requires authenticated session and re-auth |
| Subject locked out | support-assisted verification flow (documented, audited, human) before any request is created |
| Module contributor missing/failing | request `failed`; ops alert; deadline clock visible; replay after fix |
| Sweep finds residual data | request stays `in_progress`/`failed`; residual deleted by targeted job; sweep re-run |
| Legal hold appears mid-erasure | execution pauses at next safe checkpoint (`on_hold`) |
| Subject cancels during cooling-off | account restored; profile republished only if previously public |
| Subject re-registers with same email after erasure | allowed; no data linked; tombstone only blocks receipt replay |
| Backups contain subject | restore procedure replays erasure log before serving; backups age out {35 d} |
| Employer disputes deletion of hiring record | follows org policy/legal guidance [OPEN-08]; subject informed in receipt |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-22-02-01 | authenticated, re-auth fresh | request export | `202`; request `received`; one open per type | Happy |
| AC-22-02-02 | stale re-auth | request | `403 reauth_required` | Negative |
| AC-22-02-03 | export 23 h after previous | request | `429` until 24 h | Boundary |
| AC-22-02-04 | export built | inspect archive | manifest lists categories/hashes; contains own data only; excludes counterpart emails, fraud signals, reporter identities | Privacy |
| AC-22-02-05 | email notification | read email | contains no file link; contains link to authenticated page | Security |
| AC-22-02-06 | download | POST download without re-auth | `403`; with re-auth one-time URL valid ≤ 15 min | Security |
| AC-22-02-07 | archive older than 7 d | sweep | deleted; status `expired` | Time |
| AC-22-02-08 | a new module with personal-data table and no contributor | CI | build fails | Fitness function |
| AC-22-02-09 | worker killed during build | restart | resumes; one archive | Recovery |
| AC-22-03-01 | sole owner of org | erase | `409 transfer_ownership_first` | Negative |
| AC-22-03-02 | valid request | confirm | state `cooling_off`; account `pending_erasure`; sessions revoked; profile not publicly visible | Happy |
| AC-22-03-03 | day 3 of cooling-off | cancel | account restored; request `cancelled` | Happy |
| AC-22-03-04 | day 7 reached | worker | `in_progress`; cancel now `409` | Boundary |
| AC-22-03-05 | execution completes | sweep | zero hits for subject id/email hash/artefact hashes in all stores (INV-T38) | Invariant |
| AC-22-03-06 | request day 29 not complete | monitor | alert raised day 20/25/28; day 30 breach recorded as incident | Time |
| AC-22-03-07 | retained billing/audit records | receipt | lists categories and reason; billing records pseudonymised, audit/consent history unlinkable (opaque refs, mapping deleted) | Transparency |
| AC-22-03-08 | active applications at erase | execute | withdrawn; employers notified; snapshots handled per policy | Process |
| AC-22-03-09 | subject was referee for others | execute | attester anonymised; others' claims keep rung | Edge |
| AC-22-03-10 | legal hold placed | execute | `on_hold`; subject sees generic notice | Edge |
| AC-22-03-11 | duplicate erase submit | POST twice | single request | Idempotency |
| AC-22-03-12 | same step executed twice after crash | resume | idempotent; no error | Recovery |
| AC-22-03-13 | execution completes | run audit/consent anchor verifier over ranges covering the subject's rows | all anchors verify; no history row changed; identity-map row and key are gone (TEST-PRV-009) | Invariant |
| AC-01-10-01 | deactivate | confirm | profile hidden; sign-in within window reactivates | Happy |
| AC-22-07-01 | admin lifts hold | lift | DSR resumes automatically | Process |

## 11. Testing
SM-DSR matrix; contributor conformance test per module (export completeness vs schema; erase idempotency); end-to-end fixture account with data in every store, then erase and run the sweep; time-travel tests for cooling-off and SLA alerts; security tests for archive access; fault injection (kill worker at each step); restore-from-backup drill replays erasure log.

## 12. Developer guidance
Order: DSR state machine → contributor interface + CI lint → export → erase orchestrator + sweep → legal hold → UI. Keep erase steps idempotent and checkpointed. Pitfalls: forgetting derived stores (search index, caches, analytics), emailing archive links, treating soft-delete as erasure. Decisions pending: **OPEN-08** retention list, backup age-out, statutory timelines, employer-held record treatment; **OPEN-09** minors.

## 13. Related
`STATE_MACHINES.md` SM-DSR, SM-ACCOUNT · `DECISION_TABLES.md` DT-11 · `BUSINESS_RULES_REGISTRY.md` BR-T060…T066 · SPEC-01, SPEC-02, SPEC-14.

---

# SPEC-14 Institution Cohort Onboarding & Graduation

**Metadata:** Doc ID SPEC-14 · Owner: Institutions PM · Version 1.0 · Status Under Review · Phase 3 · Priority P1 · Features: FEAT-18-01, FEAT-18-02, FEAT-18-03, FEAT-18-04, FEAT-18-06, FEAT-18-07, FEAT-22-01 (`alumni.share_outcomes`) · Modules: MOD-ADM (institution workspace), MOD-SHELL · `api/institutions`, `api/verification`, `api/evidence`, `api/billing`, `apps/worker` · Relates: DOM-18, BR-T100…T106, INV-T41, DT-01, OPEN-09

## 1. Business purpose
Let institutions bring a cohort into the platform, see **aggregate** skill coverage without seeing private job-search data, issue verifiable credentials, and hand learners their career identity intact at graduation. Value: GOAL-05, cold-start supply of learners, B2B2C revenue.

## 2. Actors & access
| Actor | May | Policy action |
|---|---|---|
| ROLE-INSTADM | manage institution, faculty, cohorts, rosters, licences; view aggregates; issue credentials | `inst:admin` |
| ROLE-FAC | cohorts/courses assigned only; view aggregates and own-course work; issue credentials if delegated | `inst:faculty` |
| proctor | Phase 4 | — |
| ROLE-CAND (learner) | claim/decline invite; manage own consents; keep identity after graduation | `cohort:claim:self` |
| ROLE-ADM | create institution tenant, verify, suspend | `inst:provision` |
| ROLE-SUP | grant-bound reads | — |
Institution principals never read applications, saved jobs, messages or consents beyond their own scope (BR-T105).

## 3. Functional behavior
### 3.1 Onboarding (FEAT-18-01)
Platform admin creates an institution tenant (`pending`), records contract and licence reference, and verifies the institution (domain proof and a named signatory **[OPEN]**); state `active`. A bootstrap admin invite (hashed token, TTL 7 d, single-use) is sent to the signatory's institutional address; the admin must enable MFA before first use (BR-T044 spirit). Admin adds faculty (roles `inst_admin`, `faculty`), programmes and cohorts. Tenant isolation by `institution_id` with RLS (INV-T03).

### 3.2 Cohort and roster import (FEAT-18-02)
Cohort: `{name 1–120, programme, startDate, graduationDate (> startDate), seatPoolId, sizeLimit}`.
CSV columns: `email` (required), `given_name`, `family_name`, `student_id` (optional), `cohort` (name/id). Limits: ≤ 2,000 rows/file, UTF-8, ≤ 2 MB. **Dry run** returns a report: valid, duplicates (normalised email within file and already in cohort), invalid emails, role-conflicts (email already an institution staff member), rows flagged for age (if the institution supplies a date of birth column, under-age rows are blocked pending OPEN-09, BR-T106), seat shortfall. Nothing is created until the admin confirms. Confirm creates `cohort_member` rows in state `invited_pending` — **no learner accounts or profiles are created** (BR-T101).

### 3.3 Invitation and claim (FEAT-18-03)
Invites are sent in rate-limited batches (≤ 200/min) from the product's verified sender; token ≥ 128-bit hashed, TTL 14 d, single-use; reminder once at day 7; bounces reported to admin. Claim flow: (a) invitee already signed in with matching verified email ⇒ link; (b) signed in with a different email ⇒ add and verify the invited email, then link; (c) no account ⇒ register with the invited email pre-filled; clicking the invite proves mailbox control, so no second code is required **[TARGET; OPEN to security review]**. Before accepting, the learner sees a plain-language **consent screen** stating what the institution will and will not see (course progress and credentials in institution courses, aggregates; **not** applications, saved jobs, messages) and can **decline** (`declined`). A claim consumes one licence seat (not at import). The learner owns the account; the institution can never edit or delete the learner's evidence or profile (BR-T102).

### 3.4 Cohort member states
| State | Meaning |
|---|---|
| `invited_pending` | Imported, invite not yet sent or not accepted |
| `claimed` | Linked to a learner account; seat consumed |
| `declined` | Learner declined; seat free; admin sees only "declined" |
| `expired` | Invite lapsed (14 d); can be re-invited |
| `graduated` | Graduation date reached; institution access sunset |
| `left` | Removed by admin or learner leaves early; same sunset |
Transitions: `invited_pending → claimed | declined | expired`; `expired → invited_pending` (re-invite); `claimed → graduated | left`; `declined → invited_pending` (admin re-invites only after 30 d). Terminal: `graduated`, `left` (re-enrolment creates a new membership).

### 3.5 Cohort dashboard (FEAT-18-04)
Metrics: for target skills (from programme competency map), the count of claimed learners with skill confidence ≥ threshold, rung distribution per skill, course progress distribution, assessment pass rates, evidence count distribution. **Small-cell suppression:** any cell with n < {5} is hidden (BR-T100, INV-T41). No per-learner rows except (i) institution-issued credentials and (ii) work inside institution courses by faculty with a course assignment. Exports are aggregate CSV only. Learners can see what contributes to their cohort's aggregates.

### 3.6 Institution-issued credentials (FEAT-18-06)
Authorised staff issue `institution_credential` evidence to a **claimed** learner (title, programme, date, optional grade), via the evidence issuer API (SPEC-03) at `authority_verified`. Only the issuing institution may revoke, with reason (BR-T102); the learner may hide a credential from recruiters (visibility) but cannot alter or delete issued content except by erasure of their account (the credential then disappears with it, but the institution retains its issuance record per its own policy **[OPEN-08]**). Verification link for third parties shows credential status without personal data beyond what the learner shares.

### 3.7 Graduation (FEAT-18-07)
At the cohort's `graduationDate` (institution time zone, 00:00), the scheduler sets `claimed → graduated` and enqueues sunset: within 24 h institution access to individual-level data ends (except issued credentials and aggregates). Prior: reminders T−30 d and T−7 d to learners to **add and verify a personal email** (institutional addresses may be deprovisioned) and to review sharing. On graduation the learner receives "Welcome, alumni" with choices: keep everything (default), opt in to `alumni.share_outcomes` outcome sharing (specific fields chosen by the learner), convert licensed premium features to free tier (entitlements derive from the institution seat ending, SPEC-12). The learner's career identity — profile, evidence, applications, messages — is unchanged. Graduation date edits are allowed until the day before; afterwards only by platform admin with audit.

### 3.8 Side effects & postconditions
Events: `institution.activated`, `cohort.created`, `roster.imported`, `cohort.member.claimed`, `cohort.member.graduated`, `credential.issued`, `credential.revoked`. Postconditions: INV-T41; seats consumed = number of `claimed` members; after graduation no institution principal can read individual-level learner data other than issued credentials.

## 4. User interaction
Institution workspace (MOD-ADM): SCR-INST-SETUP (stepper), SCR-COHORTS, SCR-ROSTER-IMPORT (upload → dry-run report with row-level errors downloadable → confirm), SCR-INVITES (status per member, resend/expire), SCR-COHORT-DASH (charts with data tables and suppression notices "fewer than 5 learners — hidden"), SCR-CREDENTIALS. Learner: SCR-INVITE-LANDING (institution name, what is shared, Accept/Decline), SCR-COHORT-PRIVACY (view and withdraw), SCR-ALUMNI-WELCOME. Accessibility: WCAG 2.2 AA; charts have text equivalents; CSV import accessible with error list. Offline: not applicable to admin workflows.

## 5. Backend behavior
`api/institutions` owns institutions, cohorts, members, imports, invites. Dashboards are computed from derived, pre-aggregated tables updated by workers (not by querying learner tables directly), applying suppression in SQL views so that no code path can bypass it. Cross-module reads use public interfaces (`skills.getConfidenceAggregate`, `learning.getProgressAggregate`). Credential issuance calls `evidence.issue` with the institution service identity. Scheduler jobs: invite batches/reminders/expiry, graduation, reminders T−30/T−7, aggregate refresh (hourly), sunset enforcement.

| Endpoint (provisional) | Method |
|---|---|
| `/admin/institutions` | POST (ROLE-ADM) |
| `/institution/cohorts` | POST/GET |
| `/institution/cohorts/{id}/roster/dry-run`, `/roster/confirm` | POST |
| `/institution/cohorts/{id}/invites` | POST (send) |
| `/invites/{token}` | GET (landing, side-effect free) / POST accept/decline |
| `/institution/cohorts/{id}/dashboard` | GET (aggregates) |
| `/institution/credentials` | POST issue / POST revoke |
| `/me/cohorts` | GET / DELETE (leave) |

## 6. Data
| Entity | Key fields |
|---|---|
| `institution` | id, name, state (`pending`/`active`/`suspended`), domain, contract_ref, licence_seats, tz |
| `institution_member` | institution_id, account_id, role (`inst_admin`/`faculty`), mfa_required |
| `cohort` | id, institution_id, name, programme_id, start_date, graduation_date, size_limit, seat_pool_id |
| `cohort_member` | id, cohort_id, email_hash, account_id?, state, invited_at, claimed_at, graduated_at, source_import_id |
| `roster_import` | id, cohort_id, uploaded_by, rows, valid, duplicates, invalid, state |
| `invite` | id, cohort_member_id, token_hash, expires_at, reminded_at, consumed_at |
| `agg_cohort_skill` | cohort_id, skill_id, n, n_above_threshold, rung_dist (suppressed views) |
| `credential_issuance` | id, institution_id, evidence_id, issued_by, revoked_at, reason |
Roster emails stored encrypted + hashed; unclaimed rows deleted after {90 d} of expiry.

## 7. States and transitions
Cohort member states §3.4; institution `pending → active → suspended`; credentials per SM-EVIDENCE; invite tokens like SM-REFERENCE patterns (single-use, expiry). Forbidden: institution editing learner evidence; accessing individual rows after graduation.

## 8. Non-functional requirements
| Area | Requirement |
|---|---|
| Scale | roster ≤ 2,000 rows/file; import dry-run p95 ≤ 10 s; invite throughput ≤ 200/min |
| Security | tenant RLS; MFA for institution admins; hashed tokens; CSV injection hardening on export (prefix `'` for leading `= + - @`) |
| Privacy | k ≥ 5 suppression in DB views; learner consent screen; no job-search data |
| Reliability | graduation job idempotent; sunset verified by sweep |
| Auditability | roster uploads, invites, credential issue/revoke, graduation changes audited |
| Accessibility | WCAG 2.2 AA; import errors screen-reader friendly |
| i18n | names with non-ASCII; date formats; institution time zone |

## 9. Failure scenarios
| Scenario | Expected behaviour |
|---|---|
| Duplicate emails in file or across cohorts | flagged in dry run; one membership per (cohort, email) |
| Learner already has an account on a different email | claim flow adds and verifies the invited email |
| Invite forwarded to someone else | token binds to invited email; claim requires matching verified email unless via invite mailbox proof, which only the recipient controls; forwarded link attempts by another logged-in email are refused |
| Invite bounces | admin sees status; learner can be re-invited with corrected email |
| Licence seats insufficient at claim | claim blocked "no seats"; admin notified; learner can retry; nothing lost |
| Graduation job misses a cohort | catch-up sweep on next run; lazy access check also denies after date |
| Graduation date changed after passing | platform admin with audit only |
| Learner leaves early | `left`; same sunset |
| Institution suspended (non-payment) | institution workspace read-only 30 d then locked; learners unaffected |
| Credential revoked by institution | evidence revoked per SM-EVIDENCE with reason; learner notified with appeal route to the institution and platform |
| Dashboard tiny cohort | everything suppressed; message explains why |
| Minor flagged | row blocked; admin sees "requires review" (OPEN-09) |

## 10. Acceptance criteria
| AC | Given | When | Then | Type |
|---|---|---|---|---|
| AC-18-01-01 | platform admin creates institution | verify | `active`; bootstrap invite sent; token hashed, TTL 7 d | Happy |
| AC-18-01-02 | institution admin without MFA | opens workspace | forced MFA enrolment | Security |
| AC-18-01-03 | admin of Institution A requests cohort of B | GET | `404` | IDOR/Tenant |
| AC-18-02-01 | CSV with 2,000 valid rows vs 2,001 | dry run | accepted / `422 too_many_rows` | Boundary |
| AC-18-02-02 | duplicate emails differing by case | dry run | one valid, one flagged duplicate | Negative |
| AC-18-02-03 | dry run completed | inspect DB | no members or accounts created | Safety |
| AC-18-02-04 | confirm import | check | members `invited_pending`; no profiles created | Happy |
| AC-18-02-05 | cell value `=HYPERLINK(...)` in name | export | neutralised in CSV | Security |
| AC-18-02-06 | under-age flagged row | confirm | blocked (BR-T106) | Negative |
| AC-18-03-01 | invite sent | learner opens link | landing has no side effect (GET); shows what is shared | Happy |
| AC-18-03-02 | learner accepts | accept | `claimed`; seat consumed; institution sees membership only | Happy |
| AC-18-03-03 | learner declines | decline | `declined`; seat unused; no further invites for 30 d | Happy |
| AC-18-03-04 | invite older than 14 d | accept | `expired`; admin can re-invite | Time |
| AC-18-03-05 | same invite used twice | accept again | rejected (single-use) | Negative |
| AC-18-03-06 | no seats left | accept | blocked with message; no seat consumed | Edge |
| AC-18-04-01 | cohort of 12 with skill coverage | dashboard | aggregates shown; cells < 5 suppressed | Privacy |
| AC-18-04-02 | cohort of 4 | dashboard | all cells suppressed with explanation | Boundary |
| AC-18-04-03 | faculty tries to open learner's applications | GET | `403` (BR-T105) | Negative |
| AC-18-04-04 | direct SQL view bypass attempt by app role | query raw learner tables | denied by DB grants | Security |
| AC-18-06-01 | faculty issues credential to claimed learner | issue | evidence at `authority_verified` with issuer ref | Happy |
| AC-18-06-02 | issue to unclaimed row | issue | `409` | Negative |
| AC-18-06-03 | institution revokes with reason | revoke | evidence `revoked`; learner notified | Happy |
| AC-18-06-04 | institution tries to edit learner's non-issued evidence | PATCH | `403` | Negative |
| AC-18-07-01 | graduation date T | job at T | members `graduated`; individual access denied ≤ 24 h | Happy |
| AC-18-07-02 | post-graduation | faculty opens learner detail | denied; aggregates remain | Negative |
| AC-18-07-03 | T−30 and T−7 | scheduler | reminders to add personal email sent once each | Time |
| AC-18-07-04 | graduate opts in `alumni.share_outcomes` for chosen fields (`field_set`) | check | only chosen fields shared; ledger entry | Consent |
| AC-18-07-05 | graduation job runs twice | rerun | idempotent | Idempotency |
| AC-18-07-06 | institutional email deprovisioned after graduation | learner signs in | works via personal email; if none, support-assisted recovery | Recovery |

## 11. Testing
Cohort-member state tests; cross-tenant canary for every institution endpoint (FF-05); aggregate suppression tests incl. differencing attacks (two overlapping cohorts) — rule: suppress when subtracting overlapping published aggregates would reveal n < 5 **[OPEN]**; import fuzzing (encodings, huge cells, CSV injection); graduation time-zone tests; invite replay/forwarding tests; E2E from import to graduation with a fake clock; consent-screen content review.

## 12. Developer guidance
Order: tenant + roles → cohorts → roster dry-run → invites/claim → aggregates with suppression views → credentials → graduation. Do aggregation in the database layer so suppression cannot be skipped by new endpoints. Pitfalls: creating accounts at import; leaking existence of accounts by email in dry-run (report only counts and the admin's own file rows, never "this email already has a TalentSphere account"); reading learner tables from dashboards. Decisions pending: **OPEN-09** minors, institution verification process, aggregate differencing rule, alumni sharing fields, licence mechanics.

## 13. Related
`BUSINESS_RULES_REGISTRY.md` BR-T100…T106 · `PRODUCT_INVARIANT_REGISTRY.md` INV-T41 · `DECISION_TABLES.md` DT-01 rows 10–11 · SPEC-02, SPEC-03, SPEC-06, SPEC-12, SPEC-13.
