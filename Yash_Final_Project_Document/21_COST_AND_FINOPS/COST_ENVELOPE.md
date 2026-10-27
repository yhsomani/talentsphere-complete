# Coarse Cost Envelope (structure only)

Doc ID: FIN-ENV - Owner: Finance Lead with SRE Lead - Version 1.0 - Status: Draft for Review - Date 2026-10-25 - Relates: FIN-COST, OPS-CAP, OPS-DEP, GOAL-07, ADR-T03, ADR-T04, ADR-T05, ADR-T09, ADR-T11, OPEN-03, OPEN-05, OPEN-14, REVW-07, REVW-16, REVW-24, REVW-30

**Relationship statement:** this file supersedes nothing. It is the additive record of the cost envelope required by REVW-16 in `27_INDEPENDENT_REVIEWS/REVIEW_RESOLUTION_DECISIONS.md`. `COST_MODEL.md` section 11 carries the same structure from an earlier in-place edit; if the owner reverts that edit, this file stands alone. Where the two ever differ, this file is the one to maintain.

**No price, rate, volume or cost figure appears in this document.** Every cell in a cost, quote-reference or quote-date column is intentionally empty. A figure may be entered only with a named vendor quote and a quote date. Provider pricing changes; an undated figure is not valid.

**Gate: this envelope is a Phase 0 exit blocker.** Phase 0 cannot exit, and GOAL-07 cannot be called measurable, until every row marked `Ph1-active` below has a quote reference and a quote date. The envelope is also an input to the decision on activating federated runtime (REVW-07, OPEN-03): the default is `MF_MODE=bundled`, and federated activation must be justified against the cost of rows E10 and E27.

## 1. Volume scenarios (variables to fill; no values asserted)

| Scenario | Intent | MAU | MAU_paid | Orgs (employer / institution) | Storage GB_total | Background jobs per day | AI calls per month | Source of the numbers | Date |
|---|---|---|---|---|---|---|---|---|---|
| L (pilot) | One launch cohort; proves the Phase 1 loop (Prove, Showcase, Apply) | [OPEN] | [OPEN] | [OPEN] | [OPEN] | [OPEN] | 0 in Phase 1 (REVW-10: no AI gateway features in Phase 1) | | |
| M (growth) | First sustained paid usage | [OPEN] | [OPEN] | [OPEN] | [OPEN] | [OPEN] | [OPEN] | | |
| H (scale) | The point at which the ADR-T04, ADR-T09 and ADR-T11 revisit triggers are expected to fire | [OPEN] | [OPEN] | [OPEN] | [OPEN] | [OPEN] | [OPEN] | | |

The scenario values come from the product forecast (OPEN-05) and `WP-LOADBASE`. Until then the scenarios are named but unsized.

## 2. Component list by scenario

`Ph1-active` = needed to deliver the Phase 1 loop. `Conditional` = exists only if the named trigger fires and is excluded from the Phase 1 envelope until then. The cost cells hold a per-month figure once filled; the currency and quote reference sit in the next columns.

| # | Component | Cost driver (FIN-COST section 2) | Activation | Cost L | Cost M | Cost H | Vendor or option quoted | Quote reference | Quote date | Owner |
|---|---|---|---|---|---|---|---|---|---|---|
| E01 | API, worker and scanner compute (three deployables) | Compute | Ph1-active | | | | | | | SRE Lead |
| E02 | PostgreSQL primary with HA standby | Database | Ph1-active | | | | | | | SRE Lead |
| E03 | PITR, WAL archive and backups | Database | Ph1-active | | | | | | | SRE Lead |
| E04 | Read replicas | Database | Conditional: replica trigger in OPS-CAP | | | | | | | SRE Lead |
| E05 | Connection pooler | Database | Ph1-active | | | | | | | SRE Lead |
| E06 | Object storage with lifecycle and replication | Object storage | Ph1-active | | | | | | | Platform |
| E07 | Virus-scan fleet (engine behind a port) | Compute | Ph1-active (uploads gate verification, BR-T003) | | | | | | | Security |
| E08 | CDN and egress | CDN and egress | Ph1-active | | | | | | | Frontend Platform |
| E09 | KMS: key custody for session and token signing, encryption keys | Compliance and security | Ph1-active; manifest-signing keys are Conditional (see E10) | | | | | | | Security Architect |
| E10 | Remote registry hosting, signed manifests, registry mirror, last-known-good store | CDN and egress | Conditional: `MF_MODE=federated` activation (REVW-07, OPEN-03) | | | | | | | Frontend Platform Lead |
| E11 | Transactional email (provider behind a port; dedicated IP optional) | Email | Ph1-active | | | | | | | Messaging |
| E12 | Web push | Push | Ph2 | | | | | | | Messaging |
| E13 | Code-execution sandbox runner | Compute | Ph2 (WP-ASSESS-RUNNER); excluded from the Phase 1 envelope | | | | | | | Assessment owner |
| E14 | AI gateway and model spend | AI tokens | Ph2 (REVW-10); excluded from the Phase 1 envelope | | | | | | | AI owner |
| E15 | Observability stack (metrics, logs, traces, error reporting) | Observability | Ph1-active | | | | | | | SRE Lead |
| E16 | Synthetic monitoring from outside the network (primary source for client SLIs, see `SLO_AND_PERFORMANCE_TARGETS.md#record-slo-rev2`) | Observability | Ph1-active | | | | | | | SRE Lead |
| E17 | Payments (processor fees, tax product) | Payments, tax | Ph2, first-party courses only (REVW-30) | | | | | | | Finance Lead |
| E18 | Instructor or seller payouts and seller KYC | Content and instructor payouts | Conditional: Phase 3 marketplace ADR (`19_*/MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL.md`) | | | | | | | Finance Lead |
| E19 | Helpdesk and CRM seats | Vendor SaaS | Ph1-active (minimal) | | | | | | | Ops |
| E20 | CI minutes and preview environments | Dev and CI | Ph1-active | | | | | | | Release Eng |
| E21 | Device lab (cloud access or owned) | Dev and CI | Ph1-active for the PWA matrix (OPEN-12) | | | | | | | QA Architect |
| E22 | Staging, load-test and DR-drill environments | Environments | Ph1-active | | | | | | | SRE Lead |
| E23 | Pen tests, audits, counsel review | Compliance and security | Ph1-active (OPEN-08) | | | | | | | Security Architect |
| E24 | Support and moderation labour | Support, trust and safety | Ph1-active (support); moderation Ph2 | | | | | | | Support Lead |
| E25 | Status page and on-call tooling | Vendor SaaS | Ph1-active | | | | | | | SRE Lead |
| E26 | Offline outbox subsystem (client engineering, conflict UI, extra test matrix) | Dev and CI | Conditional: ADR-T10 trigger (telemetry or research shows need). Phase 1 ships read cache plus local unsent drafts only (REVW-24) | | | | | | | Frontend Platform Lead |
| E27 | Federated-runtime extras: per-remote CI pipelines, version-skew test matrix, canary and rollback tooling | Dev and CI | Conditional: `MF_MODE=federated` activation | | | | | | | Frontend Platform Lead |
| E28 | Public-page prerender at the edge and sitemap generation (REVW-13 proposal) | CDN and egress | Ph1-active if the ADR is accepted; otherwise open | | | | | | | Frontend Architect |

## 3. Totals and the decisions the envelope must support

| Output | Formula | Filled by | Status |
|---|---|---|---|
| Phase 1 envelope per scenario | sum of E rows marked Ph1-active | Finance Lead | empty; blocks Phase 0 exit |
| Cost of activating federated runtime | E10 + E27 + the extra part of E15 and E20, compared with the measured benefit from `WP-FED-SPIKE` | Finance Lead with Frontend Platform Lead | empty; input to the OPEN-03 activation decision |
| Cost of activating the offline outbox | E26 compared with telemetry or research evidence of need | Finance Lead with Product Director | empty; input to the ADR-T10 trigger |
| Cost of the HA, DR and observability footprint with its SLO justification | `COST_MODEL.md` section 6, "Cost of reliability" | SRE Lead | empty |
| Cost per MAU (`M_var`) per scenario | `COST_MODEL.md` section 4 formula over the E rows | Finance Lead | empty |
| Gate | Every Ph1-active row has a quote reference and a quote date no older than the cadence Finance sets (value [OPEN]) | Architecture Review Board | **blocker** |

## 4. Open items

| Item | Ref |
|---|---|
| Gross margin target and scenario sizing | OPEN-05 |
| Hosting cost model inputs (changes E01 to E05) | OPEN-14 |
| Observability backend choice (changes E15, E16) | OPEN-20 |
| Instructor revenue share (E18, Phase 3 only) | OPEN-06 |


## Forecast versus measured labelling (patch 2026-10-27, PROPOSED)

Every cost figure, volume, unit price or margin that is ever entered in this document or in a dashboard fed by it must carry exactly one label.

| Label | Meaning | Required with it |
|---|---|---|
| FORECAST | An estimate or scenario; not observed | Scenario name, assumptions, author, date; never shown as actual |
| QUOTED | Vendor quote | Vendor, quote reference, quote date (existing rule) |
| MEASURED | Observed from an invoice, billing export or metering record | Source system, period, extraction date; reconciled to invoice |

Rules: no unlabelled number; a FORECAST is not promoted to MEASURED by rounding or editing, only by replacement from a source; mixed totals show the label of their least certain component; the current state of this document is that **no figure of any label exists** (structure only), and nothing here is a measurement. Cost metrics MET-028 to MET-030 inherit the label of their inputs (`../20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md` section 9).
