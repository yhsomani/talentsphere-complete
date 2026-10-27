# Cost Model and FinOps

Doc ID: FIN-COST · Owner: Finance Lead with FinOps/SRE Lead and AI owner · Version 1.0 · Status: Draft for Review · Relates: GOAL-07, STR-01 §5, INV-T07, ADR-T04, ADR-T05, ADR-T11, ADR-T12, ADR-T15, ADR-T20, OPS-CAP, OPS-DEP, COM-OPS, ANL-MET (MET-028…MET-032), OPEN-05, OPEN-06, OPEN-14, OPEN-19, OPEN-20, OPEN-24, OPEN-26

**No price, rate, volume or cost figure appears in this document.** Variables are symbols; their values are [OPEN] until vendor quotes, a forecast and `WP-LOADBASE` exist. Provider pricing changes; every unit price must carry a source and a date when filled in.

**Status of the cost evidence (REVW-16, binding decision in `27_INDEPENDENT_REVIEWS/REVIEW_RESOLUTION_DECISIONS.md`):** the architecture's cost-bearing components are listed with an empty envelope in §11. The envelope is a **Ph0-exit blocker**: Phase 0 cannot exit, and GOAL-07 cannot be called measurable, until §11 has dated vendor quotes in every Ph1-active row. The envelope is also the input that settles the activation question for federated runtime (REVW-07, `MF_MODE`, OPEN-03).

## 1. Principles

1. Cost is a design input: every module owner knows the cost drivers of their module.
2. Unit economics first: what matters is cost per active user, per paying org and per feature, not the total.
3. Free tier must be structurally cheap: free users never cause paid AI inference unless a budget policy allows it (INV-T07).
4. Prefer boring, consolidated infrastructure (Postgres for queue/search/events, ADR-T04/T05/T09/T11) until a measured trigger.
5. Buy commodity (payments, email, CDN, observability storage, video hosting); build differentiators (evidence ladder, verification, matching explainability).
6. Guardrails are automatic: budgets, alerts and kill switches, not monthly surprises.

## 2. Cost drivers

| Driver | What drives it | Variable or fixed | Unit | Formula (symbols) | Owner | Controls |
|---|---|---|---|---|---|---|
| Compute (API, worker, scanner, runner) | requests, jobs, concurrency, headroom | Step-fixed (replica counts) | replica-hours | `C_compute = (N + W + S) × hours × rate_instance` (N, W from OPS-CAP) | SRE | Headroom policy `u ≤ 0.6`; autoscale; right-sizing; spot only for non-critical workers |
| Database | storage, IOPS, HA standby, replicas, backups | Step-fixed + growth | instance-hours, GB-months | `C_db = (instances × rate) + storage_GB × rate_gb + backup_GB × rate_backup + replica_count × rate` | DBA | Partitioning/archival; index hygiene; replica use only if needed |
| Object storage | evidence/resume/media volume, versions, replication | Variable | GB-months | `C_obj = GB_total × rate_gb × replication_factor + requests × rate_req` | Platform | Lifecycle tiers; size limits; dedupe of derivatives |
| CDN & egress | cold loads, bundle size, media | Variable | GB egress | `C_egress = MAU × sessions × bytes_cold × (1−h) × rate_egress + API egress` | Frontend Platform | Hash-immutable caching (hit ratio h), bundle budgets (SLO-19), image/video optimisation |
| Email | verification, notification, marketing | Variable | messages | `C_email = msgs_per_user × MAU × rate_msg` (+ dedicated IP) | Messaging | Digest and preference defaults; suppress duplicates; transactional vs marketing split |
| Push | notifications | Near-zero | messages | negligible provider fees; engineering cost | Messaging | Quiet hours; opt-in |
| SMS (deferred, ADR-T20) | none at launch | — | — | out of scope | — | Not built |
| AI tokens | calls × tokens × model price | Variable, highest volatility | tokens | `C_ai = Σ_calls (tok_in × p_in + tok_out × p_out)` | AI owner | Budgets, tiering, caching, model routing (§5) |
| Payments (Stripe fees) | revenue, payment mix, disputes | Variable with revenue | % + fixed per transaction | `C_pay = revenue × pct_fee + n_txn × fixed_fee + dispute_fees + billing/tax product fees` | Finance Ops | Annual/upfront billing; ACH/invoice for large B2B [OPEN-19]; dispute prevention |
| Tax tooling | tax calculation fees | Variable | per transaction | provider-specific (OPEN-18) | Finance | Scope of jurisdictions |
| Observability | telemetry volume, retention | Variable | GB ingested, series | `C_obs = bytes_per_day × retention × rate + series × rate_series` | SRE | Sampling, cardinality limits, retention tiers (OPEN-20) |
| Support | ticket volume × handle time | Variable (labour) | tickets | `C_support = tickets × avg_handle_time × loaded_rate` | Support Lead | Self-service, in-product help, deflection, tickets per 1k MAU (MET-033) |
| Trust & safety / moderation | reports, queue volume | Variable (labour) | cases | `C_mod = cases × handle_time × rate` | T&S | Tooling, clear policy, rate limits on abuse |
| Vendor SaaS (CRM/helpdesk/flags/etc.) | seats | Fixed per seat | seats | `Σ seats × rate` | Ops | Consolidate; avoid duplicate tools (§7) |
| Dev & CI | CI minutes, preview environments, device lab | Variable | minutes, device-hours | `C_ci = minutes × rate + device lab fees` | Release Eng | Affected-only builds (OPS-REL §3), cache, scheduled heavy suites |
| Environments | staging, load tests, DR drills | Step-fixed | env-hours | `C_env = Σ env_hours × rate` | SRE | Ephemeral environments; scheduled scaling down |
| Compliance & security | audits, pen tests, certifications | Fixed/annual | engagements | per quote | Security | Prioritise by risk; scope control |
| Content & instructor payouts | course sales | Variable with revenue | % | `C_payout = course_revenue × share` (OPEN-06). **Ph2 sells first-party (platform-sold) courses only (REVW-30), so `C_payout` is zero in Ph2**; it applies only after the Ph3 marketplace ADR (see `COM-OPS` section 13A) | Content Ops | Statement reconciliation |

## 3. Cost visibility and allocation

| Practice | Detail |
|---|---|
| Tagging | Every cloud resource tagged `env`, `service`, `owner`, `cost_center`; untagged resources flagged weekly |
| Allocation | Shared costs (DB, CDN) allocated to modules/features by driver (requests, rows, bytes) — approximate by design |
| Per-tenant attribution | For large org tenants, track usage-based drivers (storage, AI tokens, emails) to detect unprofitable accounts and noisy neighbours (OPS-CAP §4) |
| Per-feature | AI cost per feature tag at the gateway; email per template class |
| Dashboards | DASH-09 (AI), cost dashboards by driver; weekly review by owners; monthly FinOps review |

## 4. Unit economics (formulas)

Variables: `MAU`, `MAU_paid`, `ARPU_p` (average revenue per paying user), `ARPA_o` (average revenue per paying org), `s_seat` (seats per org), `M_var` (variable cost per MAU), `F` (fixed monthly cost), `n_txn`, `r_churn`, `CAC`.

| Quantity | Formula | Use |
|---|---|---|
| Variable cost per MAU | `M_var = (C_compute_var + C_db_var + C_obj + C_egress + C_email + C_ai + C_obs_var + C_support_var) / MAU` | Core margin driver; MET-029/030 |
| Free-user cost to serve | `M_free = M_var(free) = (infra share + email + support share) / MAU_free`, with `C_ai(free) = 0` unless budget policy flag (INV-T07) | Must be sustainable by structure |
| Contribution margin per paying user | `CM_p = ARPU_p − M_var(paid) − pay_fee_p − allocated_support` | Packaging decisions |
| Contribution margin per org | `CM_o = ARPA_o − (s_seat × M_var(employer seat)) − pay_fee_o − CS_cost_o − AI_cost_o` | Employer tier pricing floor |
| Gross margin | `GM = (Revenue − COGS) / Revenue`, COGS = infra + payments fees + AI + support + payouts (definition fixed by Finance, OPEN-05) | GOAL-07; MET-028 |
| Break-even paying users | `MAU_paid* = (F + M_var_free × MAU_free) / (ARPU_p − M_var_paid − pay_fee_p)` | Early-stage sustainability check (symbolic; no numbers asserted) |
| Payback | `Payback = CAC / (CM_p per month)` | Marketing efficiency (CAC is [OPEN]) |
| LTV | `LTV = CM_p / r_churn` (simple; refine with cohort curves) | Packaging, retention |
| Marginal cost of an extra tenant | `ΔC_tenant = ΔC_infra(usage) + ΔC_support + ΔC_ai` | Large-tenant pricing / quota design |
| AI margin guard | For each paid tier: `AI_quota_cost_max ≤ k_ai × tier_price` where `k_ai` is a policy fraction [OPEN-05/OPEN-24] | Prevent AI quotas making a tier unprofitable |
| Payment fee impact | `fee_eff = pct_fee + fixed_fee / avg_txn_value` | Minimum price points; annual billing incentive |
| Storage per candidate | `GB_cand = n_items × f_avg × replication` | Retention/size policies |

Sensitivity analysis: each formula is exercised over low/base/high ranges in a spreadsheet model owned by Finance (outside this documentation); the model is validated against actual invoices each month and variance explained.

## 5. AI budget policy

Binding: ADR-T12, INV-T06, INV-T07, INV-T08, INV-T09. All model usage goes through the AI gateway, which enforces budgets before calling a provider.

| Principal / tier | Default policy | Allowed AI | Budget enforcement |
|---|---|---|---|
| Free candidate | **No paid inference.** Deterministic features, templates, rules, and cached/precomputed results only | Non-LLM assistance (checklists, validation), pre-generated tips; optionally a tiny capped allowance if an explicit **budget policy flag** is turned on for experiments or promotion | Gateway denies when no flag; flag is per-cohort, time-boxed, with total cap |
| Paid candidate (Plus) | Monthly quota of AI actions [OPEN-19/24] | Resume suggestions, interview practice, summarisation | Hard stop at quota; soft warning at defined fractions; no silent overage |
| Employer seat | Quota per seat/org [OPEN-19/24] | JD drafting, summarising consented evidence **with human decisions** (INV-T09) | Org-level pool with per-user caps; admin visibility |
| Institution | Contracted pool [OPEN-19/24] | Instructor assist, cohort summarisation (aggregate) | Pool cap |
| Assessment sessions marked `AI_PROHIBITED` | **Blocked** for all callers | none | Gateway rule independent of tier (INV-T06) |
| System/internal jobs | Budgeted per job class | Moderation assist (advisory only), embeddings for search/match | Separate system budget and alerts |

Policy details:

| Topic | Rule |
|---|---|
| Accounting | Every call logs tier, feature, model class, token counts and cost bucket (event `ai.call.completed`); attribution to user/org/feature |
| Budget hierarchy | Global monthly cap → tier pool → org/user quota → per-request token limits; the lowest binding limit wins |
| Concurrency safety | Budget reservation before call, reconcile after; atomic (TEST-ASM-006) |
| Model routing | Cheapest adequate model per feature (small model for classification/embedding; larger for drafting); routing table versioned; changes need cost review |
| Caching & reuse | Cache deterministic transformations by content hash (privacy-safe, tenant-scoped); reuse embeddings; avoid recomputation on unchanged inputs |
| Prompt hygiene | Token budgets per feature; truncate inputs; no raw PII beyond need; no provider training on our data where contractually available (OPEN-24) |
| Failure | Provider outage → breaker, non-AI path (TEST-ASM-009); budget exhaustion → clear user message |
| Governance | Quarterly review of model choices and cost per feature; new AI feature requires cost estimate (`tokens × price × expected calls`) and a kill switch; AI outputs are never evidence (INV-T08) |
| Abuse | Rate limits per principal; anomaly alerts (ALT-18); automated lockout of abusive usage with human review |
| Transparency | Users see remaining quota; AI-generated content labelled |

## 6. Cost guardrails and alerts

| Guardrail | Mechanism | Alert / action |
|---|---|---|
| Cloud budget per environment | Budget with forecast alerts at fractions of the monthly budget [params OPEN] | Notify owner; staging auto-scale-down; production alert only |
| Anomaly detection | Daily spend vs trailing baseline by service/tag | Ticket to owner; page if combined with traffic anomaly (possible abuse) |
| AI spend | Gateway budgets (§5); alerts at soft/hard thresholds (ALT-18) | Soft: notify; hard: stop paid inference for the affected pool; global kill switch |
| Egress | CDN hit ratio, bytes per session vs budget | Frontend bundle review; cache fix |
| Storage growth | Projected exhaustion/cost horizon (OPS-CAP) | Lifecycle policy review |
| Telemetry volume | Ingest quota per service | Sampling increase / log level change |
| Idle resources | Scheduled report of idle environments, unattached volumes, unused IPs | Auto-stop non-production |
| Reserved/committed spend | Only after 3+ stable usage observations [policy OPEN-15 param] | Finance approval |
| Tenant outliers | Per-tenant usage vs contract | Customer Success outreach / quota enforcement |
| Release review | PRs that add a recurring cost (new vendor, new job, new AI feature) include a cost note | RG-12 readiness item |
| Cost of reliability | DR, HA standby and observability cost shown with their SLO justification | Annual review: remove over-engineering without lowering SLO |

## 7. Build vs buy

| Capability | Decision [TARGET] | Rationale | Revisit trigger |
|---|---|---|---|
| Payments, subscriptions, invoices, tax calc | **Buy** (Stripe + tax product, ADR-T15, OPEN-18) | Compliance and fraud surface; no differentiation | Market expansion needing local methods |
| Transactional email delivery | **Buy** (provider port, Brevo default, ADR-T20) | Deliverability is a specialised discipline | Cost or deliverability issues |
| Marketing automation/CRM | **Buy minimal** (lightweight tool) or defer; no CRM build | Domain doc K says light; avoid building | Scale of sales-assist |
| Helpdesk | **Buy** (OPEN-38) | Commodity | Integration pain |
| Auth primitives (passkeys/WebAuthn, session) | **Build thin on libraries** (ADR-T06) with SSO via standards | Control of session security model and cookie BFF; avoid heavy IAM | Enterprise requirements exceeding scope |
| Search | **Build on Postgres** (ADR-T11) | Cost/ops | p95 > 400 ms at corpus or relevance gap |
| Queue/events | **Build on Postgres** outbox (ADR-T09) | Fewer moving parts | Throughput beyond budget |
| Feature flags | **Decide** (OPEN-35): simple Postgres-backed flags vs vendor | Small needs initially | Experimentation scale |
| CDN | **Buy** | Commodity | — |
| Observability backend | **Decide** (OPEN-20) | Ops burden vs cost | Volume |
| Video hosting / transcoding for courses | **Buy** | Heavy, commodity | — |
| Virus scanning | **Buy/integrate** engine behind port | Specialised | Detection gaps |
| Code execution sandbox | **Decide** (OPEN-27): build on hardened container/microVM tech vs buy a runner service | Security-critical, specialised; WP-ASSESS-RUNNER | Security review outcome |
| Proctoring / ID verification | **Buy only if adopted** (OPEN-28, OPEN-10) | Sensitive, regulated; vendor-gated | Customer demand |
| AI models | **Buy** via gateway (ADR-T12) | No model training | Cost/quality shift |
| Matching/ranking logic, evidence ladder, verification flows | **Build** | Core differentiator (ADR-T01) | — |
| Analytics warehouse | **Decide** (OPEN-25) | Privacy and cost | Volume |
| Status page | **Buy** | Independent hosting | — |
| Device lab | **Buy cloud device access or small owned lab** (OPEN-12) | Cost vs control | Issue volume |

## 8. Simplification opportunities — what NOT to build

| Do not build (now) | Because | Alternative |
|---|---|---|
| Microservices | ADR-T04: no independent-scale evidence; operational cost | Modular monolith + module boundaries |
| Kafka/NATS broker | ADR-T09 deferral | Postgres outbox |
| Dedicated search engine | ADR-T11 | Postgres FTS + trigram + pgvector |
| Kubernetes cluster (unless a hosting option mandates) | Operational overhead | Managed containers (OPS-DEP §6) |
| Generic workflow engine | Rejected in DOM-00 | Pipelines and state machines (SM-*) |
| Custom CRM / marketing automation | Domain K | Buy light or defer |
| Native iOS/Android apps | ADR-T02 | PWA; revisit on trigger |
| SMS notifications | ADR-T20 | Email + web push |
| Social network features (feeds, ads, sponsored content) | ADR-T01 non-goals; DOM-00 removals | Deferred Ph4 community scope only |
| Own payment processing or card handling | Compliance | Stripe-hosted |
| Own video platform / interview recording at launch | Heavy; deferred | Buy or defer |
| Own proctoring | Vendor-gated | Integrations only if adopted |
| Real-time collaboration/chat infrastructure beyond messaging basics | Cost, complexity | Simple conversation model with polling/SSE |
| Multi-region active-active | Cost vs SLO need | Single region HA + DR (OPEN-23) |
| Multi-processor payments | ADR-T15 | Single processor |
| Custom feature-flag system with UI beyond need | OPEN-35 | Minimal flags + audit |
| Data lake/ML platform | No requirement | Warehouse tables |
| Blockchain credentials | Out of scope (STR-01 §6) | Evidence ladder |
| Per-tenant schemas/databases | ADR-T21 | RLS (revisit for regulated tenant) |
Each item is re-evaluated only when its revisit trigger in the ADR/decision fires.

## 9. FinOps operating cadence

| Cadence | Activity | Participants |
|---|---|---|
| Weekly | Anomaly and tag hygiene review | SRE, owners |
| Monthly | Cost vs forecast; unit-economics review (MET-028…030); AI spend review; actions | Finance, SRE, AI owner, Product |
| Per release | Cost note for recurring-cost changes | Release owner |
| Quarterly | Vendor and commitment review; reserved capacity decisions; simplification backlog | Finance, SRE, Architecture |
| Per phase gate | Re-forecast with measured drivers (OPS-CAP §7) | Finance, SRE |

## 10. Open items

| Item | Ref |
|---|---|
| Gross margin target | OPEN-05 |
| Pricing/quota values and AI allowances | OPEN-19, OPEN-24 |
| Hosting cost model inputs | OPEN-14 |
| Instructor revenue share | OPEN-06 |
| Observability backend and retention | OPEN-20 |
| Email providers and separation | OPEN-26 |
| Analytics warehouse | OPEN-25 |
| Coarse cost envelope (§11): vendor quotes, dated, for every Ph1-active component. **Ph0-exit blocker** | REVW-16, GOAL-07 |

## 11. Coarse cost envelope (structure only; REVW-16) [TARGET]

**Purpose:** give the Architecture Review Board something to compare. It is a structure to be filled by Finance Lead and SRE Lead from vendor quotes, not an estimate. **Every cell in the cost, quote and date columns is intentionally empty.** No figure may be entered without a named source and a quote date (§1 header rule). An empty cell in a row marked *Ph1-active* blocks Ph0 exit.

### 11.1 Volume scenarios (variables to be filled; no values asserted)

| Scenario | Intent | MAU | MAU_paid | Orgs (employer / institution) | Storage GB_total | Jobs per day | AI calls per month | Source of the numbers | Date |
|---|---|---|---|---|---|---|---|---|---|
| L (pilot) | One launch cohort; proves the Ph1 loop (Prove, Showcase, Apply) | [OPEN] | [OPEN] | [OPEN] | [OPEN] | [OPEN] | 0 in Ph1 (REVW-10: no AI gateway features in Ph1) | | |
| M (growth) | First sustained paid usage | [OPEN] | [OPEN] | [OPEN] | [OPEN] | [OPEN] | [OPEN] | | |
| H (scale) | The point at which ADR-T04/T09/T11 revisit triggers are expected to fire | [OPEN] | [OPEN] | [OPEN] | [OPEN] | [OPEN] | [OPEN] | | |

Scenario values come from the product forecast (OPEN-05) and `WP-LOADBASE`; until then the scenarios are named but unsized.

### 11.2 Component list x scenario

`Ph1-active` = needed to deliver the Phase 1 loop. `Conditional` = exists only if the named trigger fires (so it is excluded from the Ph1 envelope until then). Cost cells hold a per-month figure when filled, with the currency and quote reference in the next columns.

| # | Component | Driver (§2) | Activation | Cost L | Cost M | Cost H | Vendor / option quoted | Quote reference | Quote date | Owner |
|---|---|---|---|---|---|---|---|---|---|---|
| E01 | API, worker and scanner compute (three deployables) | Compute | Ph1-active | | | | | | | SRE Lead |
| E02 | PostgreSQL primary with HA standby | Database | Ph1-active | | | | | | | SRE Lead |
| E03 | PITR / WAL archive and backups | Database | Ph1-active | | | | | | | SRE Lead |
| E04 | Read replicas | Database | Conditional: read-replica trigger in OPS-CAP | | | | | | | SRE Lead |
| E05 | Connection pooler | Database | Ph1-active | | | | | | | SRE Lead |
| E06 | Object storage with lifecycle and replication | Object storage | Ph1-active | | | | | | | Platform |
| E07 | Virus-scan fleet (engine behind port) | Compute | Ph1-active (uploads gate verification, BR-T003) | | | | | | | Security |
| E08 | CDN and egress | CDN and egress | Ph1-active | | | | | | | Frontend Platform |
| E09 | KMS: key custody for signing and encryption | Compliance and security | Ph1-active (session and tokenised links); manifest signing keys are Conditional | | | | | | | Security Architect |
| E10 | Remote registry hosting, signed manifests, registry mirror | CDN and egress | Conditional: `MF_MODE=federated` activation (REVW-07, OPEN-03) | | | | | | | Frontend Platform Lead |
| E11 | Transactional email (provider behind port; dedicated IP optional) | Email | Ph1-active | | | | | | | Messaging |
| E12 | Web push | Push | Ph2 | | | | | | | Messaging |
| E13 | Code-execution sandbox runner | Compute | Ph2 (WP-ASSESS-RUNNER); excluded from the Ph1 envelope | | | | | | | Assessment owner |
| E14 | AI gateway and model spend | AI tokens | Ph2 (REVW-10); excluded from the Ph1 envelope | | | | | | | AI owner |
| E15 | Observability stack (metrics, logs, traces, RUM, error reporting) | Observability | Ph1-active | | | | | | | SRE Lead |
| E16 | Synthetic monitoring (see OPS-SLO REVW-31 synthetic-only SLIs) | Observability | Ph1-active | | | | | | | SRE Lead |
| E17 | Payments (Stripe fees, tax product) | Payments, tax | Ph2 (first-party courses only, REVW-30) | | | | | | | Finance Lead |
| E18 | Instructor or seller payouts and seller KYC | Content and instructor payouts | Conditional: Ph3 third-party marketplace ADR (`COM-OPS` section on REVW-30) | | | | | | | Finance Lead |
| E19 | Helpdesk and CRM seats | Vendor SaaS | Ph1-active (minimal) | | | | | | | Ops |
| E20 | CI minutes and preview environments | Dev and CI | Ph1-active | | | | | | | Release Eng |
| E21 | Device lab (cloud access or owned) | Dev and CI | Ph1-active for the PWA matrix (OPEN-12) | | | | | | | QA Architect |
| E22 | Staging, load-test and DR-drill environments | Environments | Ph1-active | | | | | | | SRE Lead |
| E23 | Pen tests, audits, counsel review | Compliance and security | Ph1-active (OPEN-08) | | | | | | | Security Architect |
| E24 | Support and moderation labour | Support, T&S | Ph1-active (support); moderation Ph2 | | | | | | | Support Lead |
| E25 | Status page and on-call tooling | Vendor SaaS | Ph1-active | | | | | | | SRE Lead |

### 11.3 Totals and decisions the envelope must support

| Output | Formula | Filled by | Status |
|---|---|---|---|
| Ph1 envelope per scenario | `sum(E where Ph1-active)` | Finance Lead | empty, blocks Ph0 exit |
| Cost of activating federated runtime | `E10 + extra CI/E20 + extra E15` against measured benefit | Finance Lead with Frontend Platform Lead | empty; input to the OPEN-03 / WP-FED-SPIKE decision |
| Cost of the HA, DR and observability footprint with its SLO justification | §6 "Cost of reliability" | SRE Lead | empty |
| Cost per MAU (`M_var`, §4) per scenario | §4 formula over E01..E25 | Finance Lead | empty |
| Gate | Ph0 exit requires: every Ph1-active row has a quote reference and a quote date no older than the review cadence set by Finance (value [OPEN]) | Architecture Review Board | **blocker** |


## Forecast versus measured labelling (patch 2026-10-27, PROPOSED)

Every cost figure, volume, unit price or margin that is ever entered in this document or in a dashboard fed by it must carry exactly one label.

| Label | Meaning | Required with it |
|---|---|---|
| FORECAST | An estimate or scenario; not observed | Scenario name, assumptions, author, date; never shown as actual |
| QUOTED | Vendor quote | Vendor, quote reference, quote date (existing rule) |
| MEASURED | Observed from an invoice, billing export or metering record | Source system, period, extraction date; reconciled to invoice |

Rules: no unlabelled number; a FORECAST is not promoted to MEASURED by rounding or editing, only by replacement from a source; mixed totals show the label of their least certain component; the current state of this document is that **no figure of any label exists** (structure only), and nothing here is a measurement. Cost metrics MET-028 to MET-030 inherit the label of their inputs (`../20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md` section 9).
