# 06 — Business Model and Cross-Module Rules

Monetization options, the entitlement philosophy, and the cross-cutting business rules (`BR-XCT-nnn`) that every module must obey. Module rules (`BR-<MOD>-nnn`) may refine but never contradict a `BR-XCT` rule; a contradiction is resolved by the precedence in §5 and recorded as an `OD-`. **No price, fee, percentage, quota value or revenue figure is decided here**; where a number is needed, a parameter name and a [PROP] default are given, or the value is left to an `OD-PRD-` decision. [SRC: SSOT Appendix E V61-09; COMMERCIAL_OPERATIONS preamble]

## 1. Monetization options

### 1.1 Streams

| Stream | Payer | Unit options | Value delivered | Guardrails (rules) | Active when | Tier |
|---|---|---|---|---|---|---|
| Employer subscription | Employer org | Per seat; per active job slot; hybrid of seats plus slot and quota bundles | Seats, active jobs, verified-search and outreach quotas, ATS depth, SSO, audit export | `BR-XCT-020`, `BR-XCT-043`, `BR-XCT-045` | `OD-PRD-06`, `OD-PRD-08` close | R2 |
| Free employer tier | — | Limited active jobs and seats | Lets small employers post and close the loop for candidates | Same ranking treatment as paid jobs | `OD-PRD-06` (free posting policy) | R1 |
| Institution licence | Institution | Per provisioned seat; per cohort; campus licence | Cohorts, licensed content, analytics, credentials, placement | `BR-XCT-001`, `BR-XCT-029` | `OD-PRD-07` | R3 |
| Candidate premium | Candidate | Monthly or yearly subscription | Tools: extra résumé variants above the free count, advanced personal analytics, higher AI quota | `BR-XCT-027`, `BR-XCT-047`, `BR-XCT-039` | `OD-PRD-05` | R5 |
| First-party course sales | Learner | Per course; per path; course bundle | Paid catalog content sold by the platform | `BR-XCT-044`, `BR-XCT-049` | `OD-PRD-04` | R5 |
| Third-party marketplace commission | Seller (instructor, mentor, freelancer, event organizer) or buyer | Percentage commission; fixed fee per transaction; listing fee | Reach, payments, dispute handling | `BR-XCT-048`, `BR-XCT-049` | `OD-PRD-04` plus module admission `OD-PRD-02` | R6 |
| Enterprise talent | Enterprise org | Per employee per period | Skills inventory, internal mobility, mandated learning, HRIS sync | `BR-XCT-001`, `OD-PRD-20` | `OD-PRD-02`, `OD-PRD-20` | R6 |
| Verification services | Employer org | Per check | Background checks, bulk employment verification | `BR-XCT-012`, `BR-XCT-021` | `OD-PRD-19` | R4 |
| Public API | Partner or org | Included in top employer and institution tiers; metered calls | Integrations | `BR-XCT-055` | `OD-PRD-23` | R5 |
| Aggregate insights | Employer, institution | Subscription add-on | k-anonymous salary and skills-demand benchmarks | `BR-XCT-029` | `OD-PRD-29`, `OD-PRD-12` | R6 |
| Promoted job placement | Employer org | Per placement period | Labelled visibility in separate slots | `BR-XCT-020` | `OD-PRD-18` (default: not offered) | R5 |

### 1.2 Streams excluded

| Excluded stream | Reason | Source |
|---|---|---|
| Advertising network, display ads, sponsored feed posts | Non-goal; degrades trust and fairness | [SRC: SSOT §4.2, OD-32] |
| Selling or licensing person-level data | Breaks consent model | [SRC: SSOT §4.2] |
| Pay-to-apply, pay-to-be-seen, paid "verified" badge | Core loop must be free; verification must be earned | [SRC: COMMERCIAL_OPERATIONS §1] |
| Pay-to-rank candidates or jobs in organic results | Fairness | [SRC: ADR-T22] |
| Paid unlock of contact details of non-consenting people | Consent | [DER] |
| Cryptocurrency or token rewards | Excluded scope | [SRC: SSOT §3.3] |

### 1.3 Commercial parameters (names only)

| Parameter | Meaning | Default proposal | Decision |
|---|---|---|---|
| `plan.catalog_version` | Immutable version of each plan and price | Versioned; never edited in place [PROP] | `OD-PRD-06` |
| `bil.grace_period_days` | Days of full entitlements while `past_due` | Set by owner | `OD-PRD-06` |
| `bil.refund_window_days` | Days in which a refund is granted by rule | SSOT recommends 30 days, pro-rated after 20 percent consumption [SRC: SSOT OD-29]; not adopted | `OD-PRD-04`, `OD-PRD-05` |
| `bil.refund_dual_control_threshold` | Amount above which a second `FIN` approves | One billing period of the plan [PROP] | Finance setting |
| `mkt.commission_rate` | Marketplace commission | SSOT recommends 70/30 revenue share for courses [SRC: SSOT OD-28]; not adopted | `OD-PRD-04` |
| `ai.free_daily_quota` | Free AI usage | Zero paid inference unless cost policy (`BR-XCT-039`) | `OD-PRD-21` |
| `msg.outreach_quota_per_period` | First-contact requests per recruiter per period | SSOT carries 20 (Pro) and 50 (Team) per week [SRC: SSOT BR-130]; not adopted | `OD-PRD-06` |
| `job.free_active_slots` | Active jobs on the free employer tier | Set by owner | `OD-PRD-06` |

## 2. Entitlement philosophy

1. **Charge for tools, scale and convenience; never for trust, rank or access to the core loop.** Entitlements may gate quotas (seats, active jobs, outreach requests, AI requests, résumé variants) and tools (SSO, audit export, API, advanced analytics). They may never gate: evidence creation and verification, applying, messaging in consented threads, consent and privacy controls, data export, accessibility features, or safety reporting. [SRC: COMMERCIAL_OPERATIONS §1; STR-01 §5]
2. **Entitlements are computed server-side from verified billing state.** The client and the checkout redirect grant nothing. [SRC: INV-T17]
3. **Entitlements never enter ranking.** Search, matching and suggested order read no billing field; tests assert that changing a plan leaves ranking output unchanged. (`BR-XCT-020`)
4. **Losing an entitlement never deletes data.** Over-limit items become read-only or stop accepting new activity; the owner chooses what to keep active. (`BR-XCT-045`)
5. **Entitlement holder is explicit.** In an org context, the org subscription is the default holder; whether a member's personal plan can add org quota is `OD-PRD-08`. [SRC: docs/PRICING.md review notes]
6. **Quotas are visible before they bite.** Every quota shows usage and reset time; hitting a quota returns `402 entitlement-required` with what is still free.
7. **Gated modules are off, not hidden-but-reachable.** A capability gated by an `OD-` returns `404 feature-unavailable` from the server; UI hiding is not enforcement. (04 §2 step 4)
8. **Institution and enterprise sponsorship.** An institution or enterprise may sponsor entitlements for its learners or employees; sponsorship ends with the seat and the person keeps all data. (`BR-XCT-001`)

### 2.1 Entitlement dimensions

| Dimension | Applies to | Kind | Free floor |
|---|---|---|---|
| `seats` | Employer org, institution | Count | Owner decides (`OD-PRD-06`, `OD-PRD-07`) |
| `active_job_slots` | Employer org | Count | `job.free_active_slots` |
| `outreach_requests` | Recruiter in an org | Per period | Zero or owner-set |
| `verified_search_views` | Recruiter in an org | Per period | Owner-set |
| `resume_variants` | Candidate | Count | A free count is always available (value `OD-PRD-05`) |
| `ai_requests` | Any role | Per period | `ai.free_daily_quota` |
| `sso_scim` | Org, institution | Boolean | No |
| `audit_export` | Org, institution | Boolean | No |
| `api_access` | Org, institution | Boolean plus rate | No |
| `advanced_analytics` | Org, institution, candidate | Boolean | No |
| `cohort_analytics` | Institution | Boolean | Basic always |
| `branding` | Org, institution | Level (none, co-brand, white-label) | None (`OD-PRD-24`) |
