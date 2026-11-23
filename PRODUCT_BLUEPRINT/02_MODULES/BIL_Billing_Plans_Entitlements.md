# BIL — Billing, Plans & Entitlements

Module code: `BIL` · Group: Commercial · Release tier: R5 (commercial scale), with the entitlement model and enforcement points needed from R1.

Everything in this file describes the intended product. Nothing here claims that anything is built. What exists today is recorded only in `ARCHITECTURE.md`, `docs/reports/` and `docs/PRICING.md`. Per the owner's rule, every price, quota, allowance and cap in this file is a parameter name with a `[PROP]` default or no default; none is a decision. `docs/PRICING.md` is read only as an input.

## 1. Purpose, outcomes and boundaries

### 1.1 Purpose

BIL decides what each account is entitled to, collects money for it, and proves that the books agree with the payment provider. It is the only module that talks to the payment provider, and the only source of entitlements for paid capability across all other modules. [SRC: SSOT F-16, BR-055, BR-056, BR-32; docs/PRICING.md]

### 1.2 Outcomes

| Outcome | How the system knows |
|---|---|
| Every role can see exactly what its plan includes and what it has left | Entitlement view returns values with source (plan, grant, seat, contract) |
| Paid access follows verified payment state and nothing else | Entitlements recomputed only from webhook-confirmed state (BR-BIL-001, BR-BIL-002) |
| No plan buys credibility, hiring rank, assessment bypass or private evidence | Integrity guard passes on every plan version (BR-BIL-004) |
| Money movements reconcile | Daily reconciliation run has zero unexplained differences (SM-BIL-12) |
| Seats are never oversold | Pool counters reconcile to assignments (BR-BIL-017) |
| Failed payments recover or degrade access in defined steps | Dunning state machine reaches `recovered` or `exhausted` (SM-BIL-03) |
| Finance can correct mistakes safely | Adjustments carry reason, approver and audit (BR-BIL-022) |

### 1.3 Boundaries

**In scope (owned):** plan catalogue and price books; entitlement definitions, grants and resolution; enforcement-point contract; trials; checkout; subscription lifecycle (upgrade, downgrade, proration, cancel, pause); customer portal; payment methods (as provider references); invoices, credit notes and receipts; tax collection; coupons; refunds, credits and disputes; dunning; webhook ingestion; reconciliation; ledger and revenue-recognition hooks; usage metering and quotas (AI, posting, outreach, invitations); seat pools and team seats; procurement and purchase approval; enterprise contracts and quotes; one-time and course payments; payouts to earners; finance operator console; billing notices; finance reporting; billing compliance.

**Out of scope (owned elsewhere):**

| Capability | Owner | Relationship |
|---|---|---|
| Course catalogue, course pricing display, enrollment | LRN, STU (planned) | They set the product and price reference; BIL charges |
| Seat assignment to individual students | INS (this batch) | BIL owns pools; INS owns assignment (FR-INS-010 to 012) |
| Job posting limits being applied to a job | JOB, ATS (planned) | BIL owns the limit value and the check function; JOB calls it |
| AI request execution | AIC (planned) | AIC asks BIL to reserve and settle quota |
| Notification delivery | NTF (planned) | BIL emits events |
| Identity and sessions | IDN (planned) | BIL reads the authenticated principal |
| Support tickets and general admin | ADM (planned) | FIN console is billing-specific |
| General ledger, payroll, accounts payable | Out of product (SSOT §4.2 non-goal: not a generic HR/payroll system) | BIL emits hooks (FR-BIL-020) for an external ERP |
| Sales prospecting and CRM | Out of product | Enterprise quotes are a document workflow only (FR-BIL-027, OD-BIL-12) |
| Advertising | Out of product (SSOT §4.2 non-goal) | No ad billing exists |

**Non-goal brushes (SSOT §4.2):** enterprise quotes and invoicing must not grow into a CRM; payouts must not grow into a payroll system. Both are specified narrowly and recorded as OD-BIL-12 and OD-BIL-10.

### 1.4 Owned versus consumed

Owned entities: `ENT-BIL-01` to `ENT-BIL-28` (section 8). Consumed: user, organization (IDN, EMP planned), institution (INS), course and product references (LRN planned), usage events from AIC, JOB, NET, MSG (planned).

## 2. Roles and permission matrix

Legend: V view, C create, U update, A approve, X execute, `own` own account only, `org` the billing owner of an organization, `—` none.

| Capability | CAN/STD/FRL/MNT/INS | REC/HMG | EAD (billing owner) | IAD (billing role) | FIN | SUP | PAD | SAD | API |
|---|---|---|---|---|---|---|---|---|---|
| View plans and prices | V | V | V | V | V | V | V | V | V |
| View own entitlements and usage | V own | V own | V org | V org | V any | V any (read-only, audited) | V any | V any | — |
| Checkout, change, cancel plan | X own | X own (if org permits) | X org | X org | — | — | — | — | — |
| Manage payment methods, invoices | X own | — | X org | X org | V | V | V | V | — |
| Apply coupon | X own | X own | X org | X org | V | — | — | — | — |
| Request refund | C own | C own | C org | C org | A | — | A (bounded) | — | — |
| Purchase seats, request quote | — | — | C | C | A | — | — | — | — |
| Create plan or price version | — | — | — | — | C draft | — | A | A | — |
| Create coupon | — | — | — | — | C, A within bounds | — | A beyond bounds | — | — |
| Post adjustment or credit | — | — | — | — | C | — | A (second approver) | — | — |
| Override entitlement grant | — | — | — | — | C | — | A | A | — |
| View reconciliation, ledger | — | — | — | — | V, X | — | V | V | — |
| Replay webhook event | — | — | — | — | X | — | X | X | — |
| Provider webhook | — | — | — | — | — | — | — | — | X (signed) |

Notes: Billing actions follow the buyer's context, not a single role (BR-BIL-033). `SUP` has read-only billing view with a reason captured. `PLO` and `INS` hold no billing rights (SSOT BR-078 via BR-INS-004). Two-person approval applies to refunds and adjustments above the threshold parameter (BR-BIL-022).

## 3. Sub-module map

| Code | Sub-module | Features |
|---|---|---|
| A | Plans and entitlements | FR-BIL-001 to 006 |
| B | Checkout and subscription lifecycle | FR-BIL-007 to 012 |
| C | Invoices, tax, promotions, refunds, dunning | FR-BIL-013 to 017 |
| D | Provider integration and books | FR-BIL-018 to 020 |
| E | Usage metering | FR-BIL-021 to 023 |
| F | Seats, procurement and contracts | FR-BIL-024 to 028 |
| G | Payouts | FR-BIL-029 |
| H | Finance operations and governance | FR-BIL-030 to 033 |

## 4. Feature specifications

### A. Plans and entitlements

### FR-BIL-001 — Plan catalogue and versioned price book

- **Sub-module:** A. Plans and entitlements
- **Priority / tier:** Must · R1 (catalogue), R5 (full price book)
- **Source:** [SRC: SSOT F-16 plans Free, Pro, Team, Enterprise; docs/PRICING.md `PLATFORM_PLANS`] · [DER]
- **Purpose and outcome:** `FIN` defines which plans exist for which audience and what each costs in each currency, with every change versioned. Known by every plan having an immutable active price version.
- **Roles and permissions:** `FIN: create draft, edit draft` · `PAD, SAD: approve and publish` · `all roles: read published`
- **Preconditions and entry points:** Finance console `/admin/billing/plans`. Plan names and audiences are pending OD-BIL-14.
- **User interactions and actions:** 1. Create a plan: key, name, audience (candidate, recruiter or employer, institution, instructor, mentor, freelancer), billing interval options (monthly, annual, one-time), tier order. 2. Add a price version per currency and region (FR-BIL-006): amount in minor units, interval, trial days (FR-BIL-008), effective date. 3. Attach an entitlement set (FR-BIL-002). 4. Run the integrity check (FR-BIL-004). 5. Submit for approval. 6. Approver publishes; the system creates the matching provider price object.
- **System behaviour:** A published price version is immutable; edits create a new version with `effective_from`. Existing subscriptions keep their version until renewal and receive notice before a higher price applies (BR-BIL-037). Unpublished drafts are invisible to the public API. Archiving a plan stops new sales; existing subscribers continue until they change or cancel (grandfathering). A plan may not be deleted if any subscription references it. Provider price creation is idempotent on (plan version id).
- **UI elements and controls:** Plan list with status chips (draft, pending approval, published, archived), plan editor tabs (Basics, Prices, Entitlements, Preview), price table by currency, "Run integrity check" button, "Submit for approval", approver diff view.
- **Configuration options:** Platform: plan audiences list, allowed intervals, minimum approvers (default 2: author plus one approver, `[PROP]`).
- **Business rules:** BR-BIL-004, BR-BIL-005, BR-BIL-006, BR-BIL-018, BR-BIL-037
- **Validation:** Key lowercase `a-z0-9_`, 3-40 chars, unique; amounts integers at least 0; currency ISO 4217 from the supported list; one active version per (plan, currency, region, interval); effective date not earlier than now plus 1 hour.
- **Inputs and outputs:** In: plan and price definitions. Out: published price book, provider price ids, diff log.
- **Filters, sorting, search:** Filter by audience, status, currency; search by key or name.
- **Notifications and communication:** `bil.plan.pending_approval` to approvers (internal); `bil.price.change_notice` to affected subscribers (FR-BIL-031).
- **Error handling and edge cases:** Provider price creation fails: version stays `pending_provider`, retried with backoff, not sellable. Approver is the author: refused. Two drafts for the same slot: second blocked. Currency removed from the support list: existing subscriptions unaffected, new sales blocked.
- **Dependencies:** FR-BIL-002, FR-BIL-004, FR-BIL-006, payment provider; `ENT-BIL-01`, `ENT-BIL-02`.
- **Security and privacy:** Plan edits audited; no PII. Prices are public data after publish.
- **Acceptance criteria:**
  - Given a published price version, when `FIN` edits the amount, then a new draft version is created and the published one is unchanged.
  - Given a draft failing the integrity check, when submitted, then submission is refused with the violated rule.
  - Given an author who is also the only approver, when they try to publish, then the system refuses.

### FR-BIL-002 — Entitlement model: features, limits, flags and meters

- **Sub-module:** A. Plans and entitlements
- **Priority / tier:** Must · R1
- **Source:** [SRC: SSOT §5 Entitlement definition; BR-056; docs/PRICING.md entitlement keys] · [DER]
- **Purpose and outcome:** One vocabulary of entitlement keys describes everything a plan can include. Known by every gated capability in the product naming exactly one key.
- **Roles and permissions:** `FIN: create draft key` · `PAD: approve` · `module owners: register keys for their module` · `all authenticated: read own values`
- **Preconditions and entry points:** `/admin/billing/entitlements`. Modules register keys at design time.
- **User interactions and actions:** 1. Define a key: name, module, type (boolean flag, integer limit, rate window limit, metered quota, enum tier), unit, default value for free, description shown to users. 2. Set per-plan values in the plan editor. 3. Mark the key "customer-visible" with copy. 4. Deprecate a key (hidden, still enforced until removed).
- **System behaviour:** Keys are the contract between BIL and modules (examples: `ai.requests_per_day`, `ai.tokens_per_day`, `jobs.active_limit`, `outreach.per_week`, `assessments.invites_per_month`, `seats.included`, `storage.mb`, `analytics.advanced` ). A key with no enforcement point is flagged "unenforced" and cannot appear in marketing copy (carries forward the 2026-11-20 finding that unenforced claims were removed from plan copy). Adding a value type is a platform change, not a data change.
- **UI elements and controls:** Key table, editor with type-specific fields, "Enforced by" column listing registered enforcement points (FR-BIL-003), warnings for unenforced keys.
- **Configuration options:** Platform: unit list; defaults for free plan values (parameters, OD-BIL-05).
- **Business rules:** BR-BIL-001, BR-BIL-004, BR-BIL-026
- **Validation:** Key `module.name` lowercase, unique; integer limits 0 to 2,147,483,647 or null for unlimited; rate windows from list (hour, day, week, month); enum values predefined.
- **Inputs and outputs:** In: key definitions. Out: entitlement vocabulary used by plans and enforcement.
- **Filters, sorting, search:** Filter by module, type, enforced status.
- **Notifications and communication:** Internal alert when a key is unenforced for more than 14 days.
- **Error handling and edge cases:** Plan value missing for a key: falls back to the key's default; the editor shows "inherited default". Removing a key still referenced by an enforcement point: blocked. Type change of a live key: blocked; create a new key.
- **Dependencies:** FR-BIL-001, FR-BIL-003; `ENT-BIL-03`, `ENT-BIL-04`.
- **Security and privacy:** No PII; admin-only writes; audited.
- **Acceptance criteria:**
  - Given a key with no registered enforcement point, when it is added to a plan's customer-visible list, then publishing is blocked.
  - Given a deprecated key, when a request hits its enforcement point, then the limit is still applied.
  - Given a type change on a live key, when attempted, then it is rejected.

### FR-BIL-003 — Entitlement resolution and enforcement points

- **Sub-module:** A. Plans and entitlements
- **Priority / tier:** Must · R1
- **Source:** [SRC: BR-056; CLAUDE rule "business rules live only in domain; routes call them"; docs/PRICING.md enforcement table]
- **Purpose and outcome:** Every gated action asks BIL once, server-side, what the actor may do and gets a consistent answer. Known by an enforcement test per key that bypasses the UI.
- **Roles and permissions:** `all modules: call check` · `FIN: view resolution trace` · `SUP: view trace (audited)` · `API: call with service identity`
- **Preconditions and entry points:** Any module action that consumes or depends on an entitlement.
- **User interactions and actions:** End users see consequences: a disabled button with an explanation, an upgrade prompt, a limit message. Developers: 1. Register the enforcement point (module, key, function). 2. Call `check(actor, key, context)` before the action and `consume(actor, key, amount, idempotency key)` after, where metered.
- **System behaviour:** Resolution order for an actor and key: (1) active contract or manual grant with unexpired window (FR-BIL-027, FR-BIL-030), (2) seat-derived grant from an institution or team pool, (3) the billing owner's active or trialing subscription, (4) free plan default. Highest value wins for limits; any `deny` flag (for example a suspended account) overrides all. Result includes value, remaining, source and reason code. Resolution is cached up to 60 seconds and invalidated on any entitlement event. Paid access derives only from verified provider state: `past_due` follows the dunning policy, `canceled`, `unpaid` and `expired` resolve to free values (BR-BIL-001, BR-BIL-013). The UI never decides: it renders what the API returns.
- **UI elements and controls:** Shared entitlement-aware components: locked-feature badge, "Upgrade" link to the right plan, usage meter, limit dialog (FR-BIL-023).
- **Configuration options:** Platform: cache TTL (default 60 seconds), fail-open or fail-closed per key class (default fail-closed for paid features, fail-open for read-only free features when BIL is unreachable, `[PROP]`).
- **Business rules:** BR-BIL-001, BR-BIL-009, BR-BIL-026
- **Validation:** `check` requires an authenticated principal and a registered key; unknown key is an error, not a silent allow.
- **Inputs and outputs:** In: actor, key, context (organization, resource). Out: allowed boolean, limit, remaining, source, reason code.
- **Filters, sorting, search:** Trace view filters by actor, key, time.
- **Notifications and communication:** None directly; see FR-BIL-023.
- **Error handling and edge cases:** BIL unreachable: apply fail policy and log. Actor has two sources: highest wins and the trace shows both. Race on the last unit: `consume` is atomic and returns insufficient; module shows the limit dialog. Subscription changed during request: the next check sees new state; in-flight action completes under the old state.
- **Dependencies:** FR-BIL-002, FR-BIL-018, all consuming modules; `ENT-BIL-17`.
- **Security and privacy:** Client-supplied plan claims are ignored; trace views audited; resolution responses contain no payment data.
- **Acceptance criteria:**
  - Given a canceled subscription, when the user calls a paid-only endpoint directly with the API, then the response is 402 with the entitlement reason code.
  - Given a seat-derived grant and a free plan, when resolved, then the grant value applies and its source is `seat`.
  - Given a key with no registered enforcement point, when a module calls check, then an error is returned and logged (never allow by default).

### FR-BIL-004 — Monetization integrity guard

- **Sub-module:** A. Plans and entitlements
- **Priority / tier:** Must · R1
- **Source:** [SRC: docs/PRICING.md invariants (`validateMonetizationIntegrity`, SSOT section 64): no plan buys credibility, hiring rank, assessment bypass or private evidence; SSOT §4.2 avoid opaque pay-to-rank]
- **Purpose and outcome:** The system refuses to publish any plan or grant that sells trust. Known by the guard blocking violating versions.
- **Roles and permissions:** `FIN: run check` · `PAD, SAD: approve exceptions (none allowed for the listed classes)` · `all: n/a`
- **Preconditions and entry points:** Runs automatically at plan submit, contract creation and manual grant.
- **User interactions and actions:** 1. Author submits a plan, contract or grant. 2. Sees pass or a list of violations with the entitlement key and rule. 3. Fixes and resubmits.
- **System behaviour:** Maintains a denylist of entitlement classes that can never be sold: verification status or badge level, ranking boost in candidate search or job search, assessment score or integrity-check bypass, access to another user's private evidence, removal of moderation outcomes, review or rating placement. A key is tagged with a class in FR-BIL-002; tagging a key into a forbidden class is itself blocked at plan save. Allowed commercial advantages are explicit: capacity, convenience, analytics, speed of delivery of non-trust features (more AI messages, more active jobs, more seats, more reports). Sponsored placement is excluded (SSOT OD-32).
- **UI elements and controls:** Violation list with rule ids, link to the offending key, "No exceptions" notice.
- **Configuration options:** Platform: denylist classes (changes need `SAD` approval).
- **Business rules:** BR-BIL-004
- **Validation:** Every entitlement key must carry a class tag from a fixed list.
- **Inputs and outputs:** In: plan, contract or grant. Out: pass or violations.
- **Filters, sorting, search:** n/a — inline check.
- **Notifications and communication:** `bil.integrity.blocked` to the author and `PAD` (internal).
- **Error handling and edge cases:** New key tagged incorrectly: reviewers see the tag in approval; mis-tag found later: plans using the key are flagged and sales paused until reviewed. Enterprise custom request for "priority ranking": refused with explanation citing BR-BIL-004.
- **Dependencies:** FR-BIL-001, FR-BIL-002, FR-BIL-027; `ENT-BIL-03`.
- **Security and privacy:** Audit record of every pass and block.
- **Acceptance criteria:**
  - Given a plan with a "search ranking boost" key, when submitted, then it is blocked citing BR-BIL-004.
  - Given a manual grant that bypasses an integrity check, when created, then the grant is refused.
  - Given a plan with only capacity keys, when submitted, then the guard passes.

### FR-BIL-005 — Pricing page and plan comparison

- **Sub-module:** A. Plans and entitlements
- **Priority / tier:** Must · R5
- **Source:** [SRC: docs/PRICING.md "no comparison table yet"] · [DER]
- **Purpose and outcome:** Visitors and members compare plans for their audience in their currency and start checkout. Known by a rendered comparison from published versions only.
- **Roles and permissions:** `GUE, all roles: view` · `FIN: preview unpublished`
- **Preconditions and entry points:** `/pricing`, in-app upgrade prompts, `/pricing?audience=recruiter`.
- **User interactions and actions:** 1. Choose audience tab (Candidates, Employers, Institutions, Instructors). 2. Toggle monthly or annual. 3. Read the comparison table of customer-visible entitlements. 4. Click "Start" (checkout), "Start trial" (if offered), or "Contact us" for enterprise (FR-BIL-027). 5. See current plan highlighted when signed in.
- **System behaviour:** Renders only customer-visible, enforced keys (BR-BIL-004 and FR-BIL-002). Shows the price for the viewer's billing country, using the saved billing country if signed in, else a country picker defaulting from the browser region with an explicit selector (BR-BIL-028). Taxes shown as "excl." or "incl." per region. Annual price shown with the effective monthly equivalent and savings computed from the price book, never typed copy. Page is cacheable per (audience, country).
- **UI elements and controls:** Audience tabs, interval toggle (default monthly), comparison table with checks and limits, price cards with CTA buttons, country and currency selector, FAQ accordion, legal footer with refund and cancellation summary.
- **Configuration options:** Platform: which audiences are visible, FAQ content, default interval.
- **Business rules:** BR-BIL-004, BR-BIL-006, BR-BIL-028
- **Validation:** Country from ISO 3166 list; interval from available set.
- **Inputs and outputs:** In: audience, country, interval. Out: rendered prices and entitlements.
- **Filters, sorting, search:** Tab and toggle only.
- **Notifications and communication:** n/a — static public page.
- **Error handling and edge cases:** Price book load fails: page shows cached copy with "Prices may be out of date" or an error with retry. Unsupported country: shows "Not yet available in your country" with a waitlist email field. Currency mismatch with saved billing profile: shows the saved profile currency and a link to change country (starts FR-BIL-006 flow).
- **Dependencies:** FR-BIL-001, FR-BIL-002, FR-BIL-006, FR-BIL-007; `ENT-BIL-02`.
- **Security and privacy:** No account data on the public render; analytics events carry no PII.
- **Acceptance criteria:**
  - Given an unenforced entitlement key, when the page renders, then it is not listed.
  - Given a visitor in a supported country, when the page loads, then prices appear in that country's currency from the published version.
  - Given an unsupported country, when selected, then no checkout button is shown.

### FR-BIL-006 — Regional pricing and currency

- **Sub-module:** A. Plans and entitlements
- **Priority / tier:** Should · R5
- **Source:** [SRC: CON-010 money in integer minor units plus ISO-4217; docs/PRICING.md "currency is USD only"] · [PROP] regional pricing
- **Purpose and outcome:** A buyer pays in a local currency at a price set for their region. Known by a subscription with exactly one currency and a fixed price version.
- **Roles and permissions:** `FIN: manage regions and prices (draft)` · `PAD: approve` · `all: view`
- **Preconditions and entry points:** Price versions per (plan, currency, region). `/admin/billing/regions`.
- **User interactions and actions:** 1. Define a region: name, country list, currency, tax display mode (inclusive or exclusive), supported payment methods. 2. Add price versions for the region. 3. Optionally enable a policy for localized or purchasing-power-adjusted prices (OD-BIL-08). 4. Buyer: sees the region price automatically and can change billing country with proof requirements.
- **System behaviour:** Region is decided from the billing country entered at checkout and validated against card issuer country and (where available) tax-location evidence; IP is only a hint (BR-BIL-028). A subscription is single-currency for its life; a change of country creates a new subscription at period end with notice, never an in-place conversion. Foreign exchange for finance reporting uses dated rates stored in the ledger (FR-BIL-020). Region-restricted payment methods are filtered at checkout.
- **UI elements and controls:** Region table, country multi-select, currency select, tax mode select, price matrix, buyer-side country select with explanation.
- **Configuration options:** Platform: default region; supported currency list; rounding rule per currency (charm pricing yes or no, `[PROP]`).
- **Business rules:** BR-BIL-006, BR-BIL-028, BR-BIL-036
- **Validation:** Each country in at most one region; currency decimals per ISO (JPY 0, BHD 3); price multiples respect the currency's minimum unit.
- **Inputs and outputs:** In: region and price config. Out: price resolution function by (plan, country).
- **Filters, sorting, search:** Region list by currency.
- **Notifications and communication:** `bil.region.country_change` to the buyer when a country change is scheduled.
- **Error handling and edge cases:** Buyer in a high-price region claims a low-price country: mismatch between card country, billing country and tax evidence triggers a manual review hold before access, not an instant block (`FIN` queue). Currency not supported by the provider: region cannot be activated.
- **Dependencies:** FR-BIL-001, FR-BIL-014, FR-BIL-020, provider; `ENT-BIL-02`, `ENT-BIL-23`.
- **Security and privacy:** Billing country is Confidential; mismatch review uses minimal data.
- **Acceptance criteria:**
  - Given a region with INR pricing, when a buyer with an Indian billing country checks out, then the charge is in INR at the published version.
  - Given an active subscription, when the buyer changes country, then the current subscription continues unchanged until period end.
  - Given a country in two regions, when `FIN` saves the second, then the save is rejected.
