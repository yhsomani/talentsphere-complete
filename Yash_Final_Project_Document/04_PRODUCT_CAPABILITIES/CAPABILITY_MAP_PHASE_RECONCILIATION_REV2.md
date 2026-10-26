# Capability Map Phase Reconciliation, Revision 2 (PCAP-01 REV2)

Doc ID: PCAP-01-R2 · Owner: Product Director · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-10, REVW-34 (phases), REVW-36 (counts), REVW-17 (feature/AC gap list); proposes the resolution of OPEN-42 · Relates: PCAP-01, RDM-01 and RDM-01-R2, BR-REG-R2

**Relationship (no original file was edited).** This file **supersedes, once accepted**, the "Ph" column of the feature tables, the "Counts" section (section 3) and the "Phase-1 spine" item of `CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` (PCAP-01) **where they differ from the tables below**. All other content of PCAP-01 stands. The roadmap `22_IMPLEMENTATION_ROADMAP/ROADMAP.md` stays the authority for phases (REVW-10): a feature has the phase of the first work package that delivers it. This file records that crosswalk, which PCAP-01 flags as open (OPEN-42). Governance should link it from `00_CONTROL_CENTRE/MASTER_INDEX.md`.

Nothing here claims any feature is built. Phase tags are product sequencing, not delivery commitments. Phase 1 is the pre-GA pilot of RDM-01 section 5.2.

## 1. Method

1. Baseline: the PCAP-01 phase column as it stands now (it already carries an earlier reconciliation: assessment features in Phase 2, FEAT-17-01..03 in Phase 0 as the policy-only gateway skeleton).
2. Every feature tagged Phase 0 or Phase 1 is assigned to the work package of `ROADMAP.md` that delivers it (section 2). A feature that no Phase 0/1 work package delivers cannot stay in Phase 0/1.
3. A work package that delivers a feature the map tags later, or a binding decision that requires it earlier, moves the feature (section 3).
4. Counts are produced by a script that parses the rows `| FEAT-DD-NN |` and reads the last column (section 4).

## 2. Phase 0 and Phase 1 crosswalk: work package → features

| Work package | Features (current map phase 0 or 1) | Count |
|---|---|---|
| WP-POLICY-CORE (Ph0) | 01-09 | 1 |
| WP-IDENTITY-SESSIONS | 01-01, 01-02, 01-03, 01-04, 01-05, 01-06, 01-10, 01-13 | 8 |
| WP-ORG-TENANCY | 02-01, 02-02, 02-03, 02-07 | 4 |
| WP-PROFILE | 03-01, 03-02, 03-03, 03-04, 03-06, 03-07, 03-08, 03-09 | 8 |
| WP-SKILLS-TAXONOMY | 04-01, 04-02, 04-04 | 3 |
| WP-EVIDENCE-CORE | 05-01, 05-02, 05-04, 05-05, 05-08, 05-12, 24-04 | 7 |
| WP-PRIVACY-CONSENT | 05-07, 22-01, 22-02, 22-03, 22-05, 22-06 | 6 |
| WP-VERIF-REFEREE | 06-01, 06-02, 06-03, 06-04, 06-10 | 5 |
| WP-LEARNING-CORE | 07-05, 07-11, 08-01, 08-02, 08-03, 08-04 | 6 |
| WP-OPP-JOBS | 09-01, 09-02, 09-03, 09-05, 09-07 | 5 |
| WP-APPLY-CORE | 10-01, 10-02, 10-03, 10-14 | 4 |
| WP-SEARCH-BASE | 11-01, 24-12 | 2 |
| WP-MATCH-EXPLAIN | 11-02, 11-03, 11-07 | 3 |
| WP-NOTIFY-EMAIL | 15-01, 15-02, 15-03, 15-06, 15-07 | 5 |
| WP-ADMIN-TOOLING | 20-01, 20-02, 20-03 | 3 |
| WP-FEATURE-FLAGS | 20-04 | 1 |
| WP-ANALYTICS-BASE | 21-01 | 1 |
| WP-WORKER-OUTBOX | 24-01, 24-02, 24-09 | 3 |
| WP-CONTRACTS-OPENAPI (Ph0) | 24-03, 24-08 | 2 |
| WP-OBS-BASE (Ph0) | 24-05 | 1 |
| WP-DB-BASE (Ph0) | 24-11 | 1 |
| WP-PWA-PLATFORM | 24-06, 24-07 | 2 |
| WP-AI-GATEWAY-BASE (Ph0) | 17-01, 17-02, 17-03 | 3 |

Feature ids are shown without the `FEAT-` prefix. FEAT-24-08 (rate limiting) is not named by any work package; it is assigned here to WP-CONTRACTS-OPENAPI (middleware) and the roadmap owner should confirm. FEAT-05-04 (authority verification) delivers the issuer-class mechanism (BR-T118) in Phase 1; the only issuer live in Phase 1 is `platform` (first-party course rule and staff sign-off); the `instructor` class needs the instructor studio (WP-LEARNING-DEPTH, Phase 2).

## 3. Changes to the phase column

| Feature | Title | Current | REV2 | Delivering work package | Reason |
|---|---|---|---|---|---|
| FEAT-01-07 | Multi-factor TOTP | 2 | 1 | WP-IDENTITY-SESSIONS | Privileged roles need MFA (BR-T044) from the first day the Phase 1 admin console exists; scope limited to mandatory TOTP for staff and org owners |
| FEAT-13-01 | Conversations (consented threads) | 2 | 1 | WP-MESSAGING-BASIC (new) | Binding decision REVW-10 puts basic messaging in Phase 1; scope is application-linked threads only |
| FEAT-13-05 | Block, report & mute | 2 | 1 | WP-MESSAGING-BASIC (new) | Messaging without block and report is unsafe; reports go to the admin queue until WP-MODERATION |
| FEAT-16-04 | Entitlement derivation & gates | 2 | 1 | WP-ENTITLEMENT-BASE | The roadmap already schedules the entitlement stub in Phase 1 (BR-T090); the map still said Phase 2 |
| FEAT-19-08 | Abuse throttles & spam limits | 1 | 2 | WP-MODERATION | No Phase 1 work package delivers it; FEAT-24-08 provides platform rate limits in Phase 1 |
| FEAT-11-09 | Adverse-impact audit reports | 3 | 2 | WP-FAIRNESS-AUDIT (moved to Ph2) | Fairness audit gates recruiter-facing ranking and public matching (BR-T126), which are Phase 2 |
| FEAT-14-07 | Employee/peer referrals | 3 | 4 | WP-COMMUNITY | Networking domain DOM-14 is Phase 4 / deferred (REVW-34); referrals live in api/network |

Proposed new work packages are specified in `ROADMAP_REV2.md`. No feature is added or removed.

## 4. Counts (method: script over the feature tables)

| Dimension | Current PCAP-01 | REV2 |
|---|---|---|
| Phase | Ph0 3 · Ph1 82 · Ph2 87 · Ph3 42 · Ph4 32 · not built 7 | Ph0 3 · Ph1 85 · Ph2 85 · Ph3 40 · Ph4 33 · not built 7 |
| Features | 253 | 253 |
| Priority | P0 92 · P1 84 · P2 77 | unchanged |

Reproduced counts, other headline figures: 253 features; 108 `CAP-` rows (the "97 capabilities" figure in PCAP-01 and PROJECT_MASTER does not reproduce; REVW-36); 318 micro-features (PCAP-01 figure, not re-derived here); 571 = 253 + 318.

## 5. Features without an acceptance criterion (REVW-17)

Method: a feature "has an AC" when some `AC-DD-NN-xx` (with optional `.k` micro-feature part) with its own domain and feature number appears in `05_FEATURE_SPECIFICATIONS` or `16_QA_AND_TESTING`. Features covered only by cross-cutting `AC-00-*` criteria count as having none. Indirect coverage is not assumed.

| Dimension | Count |
|---|---|
| Features with no AC of their own (all phases) | 158 of 253 |
| of which REV2 phase 0 | 3 (P0: 3) |
| of which REV2 phase 1 | 27 (P0: 21) |
| of which REV2 phase 2 | 54 (P0: 4) |
| of which REV2 phase 3 | 34 (P0: 0) |
| of which REV2 phase 4 | 33 (P0: 0) |

The figure "26 features without ACs" in TEST_CATALOG section 15, TRC-01 and PROJECT_MASTER does not reproduce under this method; REVW-17 reported 158 and this script finds 158.

**P0 features in Phase 0 or 1 with no AC (blockers to Ready until each has one):**

| Feature | Title | Resolution |
|---|---|---|
| FEAT-17-01 | Gateway single path & routing | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-17-02 | Budget & quota enforcement | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-17-03 | Policy blocks (AI_PROHIBITED etc.) | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-01-09 | Capability endpoint `GET /me/capabilities` | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-02-01 | Organization creation & domain verification | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-02-07 | Tenant isolation (RLS + canary suite) | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-04-01 | Canonical skill taxonomy | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-04-02 | Skill tagging on any entity | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-08-01 | Course catalogue & discovery | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-15-01 | Notification centre | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-15-03 | Email delivery via provider port | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-15-06 | Delivery tracking & retry | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-15-07 | Unsubscribe & suppression list | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-20-01 | Admin console shell & RBAC | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-20-03 | Audit log viewer & export | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-21-01 | Event taxonomy & product telemetry | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-22-06 | Policy version acceptance ledger | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-24-01 | Transactional outbox & dispatcher | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-24-02 | Background job queue with fenced leases | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-24-04 | Object storage & signed URLs | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-24-05 | Observability (trace-context, redacted logs) | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-24-08 | Rate limiting | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-24-09 | Scheduler (expiry, digests, retention sweeps) | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |
| FEAT-24-11 | Migration tooling (append-only, rollback note) | AC written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |

P1/P2 features in Phase 0 or 1 with no AC: 01-07, 03-03, 07-11, 09-07, 20-04, 22-05. They are not blockers to Ready but must be written before their work package exits.

P0 features in Phase 2 with no AC (blocker to the Phase 2 work packages that deliver them): 07-01, 16-01, 19-02, 19-08.

## 6. Phase 1 gaps this reconciliation exposes

| # | Gap | Proposed handling |
|---|---|---|
| G1 | FEAT-06-03 (referee outcomes, Phase 1) can produce `dispute`, but dispute handling FEAT-06-05 and the moderation queue FEAT-19-02 are Phase 2 | In Phase 1 a `dispute` outcome is recorded with no automatic effect (DT-04 row 4a) and is reviewed through the WP-ADMIN-TOOLING queue by two staff; SM-DISPUTE t1 to t4 run on that queue |
| G2 | Jobs, applications and messaging are live in Phase 1 while the moderation queue is Phase 2 | Pilot exposure only (RDM-01 section 5.2); mandatory organization verification (BR-T035); admin takedown through WP-ADMIN-TOOLING with reason code and second person (BR-T045); registered as RISK-51 in `RISK_REGISTER_REV2.md` |
| G3 | Recruiter stage movement and rejection (FEAT-10-05/06) are Phase 2 | A Phase 1 hiring team can read the application snapshot (DT-01 row 4) and message the candidate; it cannot move stages. This matches the roadmap statement that Phase 1 is not GA |
| G4 | FEAT-01-07 is Phase 2 while staff sign in to the Phase 1 admin console | Moved to Phase 1 (section 3) |

## 7. Networking and public API phases (REVW-34)

Decision: DOM-14 networking is **Phase 4 / deferred** (FEAT-14-01 to 14-09 all Phase 4 or removed; FEAT-14-07 moved from Phase 3). The public API (FEAT-23-01, 23-02, 23-07) is **Phase 4**, and WP-INTEGRATIONS-API already sits in Phase 4 in the current roadmap. FEAT-23-03 (calendar integration, Phase 2) and FEAT-23-04/05/08 (Phase 3) are unaffected.

**List for the backend, API and UI registry owners (not edited here; these belong to other folders):**

| Where | Item | Action |
|---|---|---|
| `03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md` section 6 | "DOM-14 phase 3" | Change to Phase 4 / deferred |
| `13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md` | DOM-14 header "phase 3"; API-14-01 `GET /network/connections`, API-14-02 `POST /network/connection-requests`, API-14-03 `POST /network/connection-requests/{requestId}/response` | Mark Phase 4 and remove from the launch contract (`openapi.yaml`) and launch registries |
| `13_.../EVENT_CATALOG.md`, `asyncapi.yaml` | `connection.*` events | Mark Phase 4; do not publish in Phase 1/2 |
| `07_UI_UX_AND_DESIGN_SYSTEM/SCREEN_REGISTRY.md`, `NAVIGATION_ARCHITECTURE.md` | `/network/*` routes and any `ACT-NET-*` actions | Remove from the launch registries; keep as Phase 4 backlog |
| `12_DATA_AND_DATABASE` | `connection` table (DATA-E1401) | Mark Phase 4; do not create in the Phase 1 migrations |
| `13_.../API_CATALOG.md` | DOM-23 endpoints for FEAT-23-01/02/07 | Mark Phase 4 |

## 8. Phase-1 spine (replacement for PCAP-01 section 4, item 1)

One candidate completes Prove → Showcase → Apply with job search and an explained, advisory match, and one hiring team receives and reads the application: 01-01, 01-02, 01-04, 01-06, 01-09, 01-13, 02-01, 02-02, 02-03, 02-07, 03-01, 03-02, 03-07, 04-01, 04-02, 04-04, 05-01, 05-02, 05-04, 05-05, 05-07, 05-12, 06-01, 06-02, 06-03, 06-04, 06-10, 07-05, 08-01, 08-02, 08-03, 08-04, 09-01, 09-02, 09-03, 09-05, 10-01, 10-02, 10-03, 10-14, 11-01, 11-02, 11-03, 11-07, 13-01, 13-05, 15-01, 15-02, 15-03, 15-06, 15-07, 16-04, 17-01, 17-02, 17-03, 20-01, 20-02, 20-03, 21-01, 22-01, 22-02, 22-03, 22-06, 24-01, 24-02, 24-03, 24-04, 24-05, 24-06, 24-08, 24-09, 24-11, 24-12 (all P0 features in Phase 0 or 1 after this reconciliation).

First-party learning (FEAT-08-01..04) and practice (FEAT-07-11) remain in Phase 1 in the current roadmap. The binding decision for REVW-10 demotes learning *depth*, not the minimum first-party path, so the two are consistent; if the ARB reads the decision more strictly, move FEAT-07-05, 07-11 and 08-01..04 to Phase 2 and WP-LEARNING-CORE with them (Phase 1 would then have 79 features). **[OPEN-42, owner: Program Director]**
