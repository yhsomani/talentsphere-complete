# Open Decisions, Conflicts, Governance and Lessons Merged from the Legacy Documentation (Group A)

Doc ID: DEC-LGA · Owner: Architecture Review Board secretary (with Documentation Architect) · Version 1.0 · Status: Draft for Review · Relates: `OPEN_DECISIONS.md` (DEC-OPEN, OPEN-01..OPEN-52), `ADR_REGISTER.md`, `RISK_REGISTER.md`, `GOVERNANCE_REGISTRATIONS_REV2.md`, `../06_BUSINESS_PROCESSES/LEGACY_BR_CATALOGUE_BR001_BR248.md`, `../04_PRODUCT_CAPABILITIES/LEGACY_FEATURE_REGISTRY_F01_F173.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. `OPEN_DECISIONS.md` and the ADR register are **not edited** by this file. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## Merged from legacy: `31_LEGACY_ARCHIVE/docs/governance/GAP_ANALYSIS.md`, `.../governance/GOVERNANCE.md`, `.../INDEX.md` (authority and conventions), `BRAIN/MEMORY.md` section 11 (known risks) and the open items raised by the other Group A merges

## 0. Frame and ID rules

- **Nothing is implemented.** All "prior attempt reported" statements are history.
- New items use the namespace `OPEN-LGA-nn` (Legacy Group A). Existing ids (OPEN-03 to OPEN-52) are reused wherever the topic is already registered; none is renumbered.
- "Blocking?" follows the convention of `OPEN_DECISIONS.md`: Yes means the named phase cannot exit until decided.

## 1. New open decisions (OPEN-LGA)

| ID | Question | Options | Owner | Needed by | Blocking? | Source / notes |
|---|---|---|---|---|---|---|
| OPEN-LGA-01 | One privacy threshold policy for small-cell aggregates (k): the prior corpus used k >= 3, 5, 10, plus minimum sample sizes of 20 and 30 for different outputs | Single default k with a per-use override table; keep legacy values per use; derive from legal review | Privacy Lead + Analytics Lead | Ph1 (events), Ph3 (cohort analytics) | Yes for institution and salary analytics | Legacy conflict C-8; rules BR-135, 158, 160, 178, 180, 189, 196, 207, 220; related OPEN-25, OPEN-43 |
| OPEN-LGA-02 | Which tensions inside the legacy rule corpus are real conflicts vs duplicates (duplicate XP key BR-025/060; profile gate BR-037/061; duplicate application BR-015/039; completion vs final exam BR-023/048/109; emerging-skill promotion BR-148/206; decay BR-166/226; four cap windows BR-130/211/233/239; billing audience BR-007) | Consolidate to one rule each; keep both with scope notes; retire | Business Analyst Lead | Ph1 (before rule parity claims) | No | `LEGACY_BR_CATALOGUE_BR001_BR248.md` editorial analysis; related OPEN-43 |
| OPEN-LGA-03 | Should institution views of individual learner outcomes require learner consent? (legacy BR-190 says yes; target BR-T061/BR-T100 do not say so expressly) | Consent-gate individual views; aggregate-only above threshold; contractual basis | Privacy Lead + Institutions PM | Ph3 | Yes for institution onboarding | Crosswalk conflict row; related OPEN-09, OPEN-43 |
| OPEN-LGA-04 | Are fixed AI confidence thresholds (legacy BR-065 disclaimer below 0.7; BR-066 suppress below 0.5) acceptable, or must thresholds be capability-specific and evaluated (SSOT wording) | Capability-specific evaluation gates with human/non-AI fallback; fixed global thresholds; both | AI owner + Security Architect | Ph2 | Yes for AI features | Crosswalk text differences for BR-065/066; related OPEN-24, OPEN-48 |
| OPEN-LGA-05 | Re-derive feature phases from dependencies: the legacy registry has 24 phase-order inversions and one dependency cycle (F-45 <-> F-115) | Topological re-phasing against target Ph0..Ph4; keep legacy phases as metadata only | Program Director + Domain Architect | Ph0 (roadmap lock) | No | `LEGACY_FEATURE_REGISTRY_F01_F173.md` section 3; related OPEN-41, OPEN-42 |
| OPEN-LGA-06 | Consolidate duplicate or stale legacy rule IDs and decide the fate of BR-035 (marked SUPERSEDED) and out-of-range `BR-` mentions | Retire with record; keep IDs as aliases in the crosswalk | Business Analyst Lead | Ph1 | No | Legacy registry authority text; conflict C-9; related OPEN-43 |
| OPEN-LGA-07 | Adopt, defer or retire the six legacy journeys with no target match (J-08 mentor, J-11 extension, J-21 contestant, J-23 author/newsletter, J-25 peer reviewer, J-28 skills analyst) and the 19-persona set | Add UJ journeys; defer to named roadmap phases; retire with owner sign-off | Product Director + UX Research | Ph1 (MVP lock) | No | `LEGACY_JOURNEY_REGISTRY_J01_J28.md`; related OPEN-45, OPEN-07 |
| OPEN-LGA-08 | Reconcile roles and personas: prior 14 PRD roles, 3 JWT roles + 24 contextual roles (SSOT), 10 built roles, 19 personas; target ROLE-* set and P1..P5 | Map each prior role to a target role or record "no target role"; confirm 24-role model is target or not | Product Director + Security Architect | Ph0 | Yes for permission matrix freeze | Legacy conflict C-21; related OPEN-44 |
| OPEN-LGA-09 | Does STR-01 need the prior explicit Goal and Gap stages in the loop, the "close the feedback loop" goal, the extra non-goals (guaranteed outcomes, non-career marketplace, hardware/OS) and the GA path including Learning/Assessment/Career Graph | Add to STR-01; record as deliberate omissions | CPO | Ph0 | No | `LEGACY_PRD_PRODUCT_REQUIREMENTS.md` |
| OPEN-LGA-10 | Add missing metrics (goal creation, skill coverage, offers, outcome-feedback delivery, enterprise expansion) or record why not | Add MET-* entries; reject | Analytics Lead | Ph1 | No | `METRICS_CATALOG.md` merge note; related OPEN-51 |
| OPEN-LGA-11 | Career Graph status (third graph or view) and AI-evidence wording (legacy: AI-generated evidence allowed but labelled; target: AI output never becomes evidence) | Keep target stricter rule; document Career Graph as derived view | Domain Architect + Product Director | Ph1 | No | `LEGACY_BRAIN_CONCEPTUAL_MODEL.md` |
| OPEN-LGA-12 | Extend SPEC-00 contract with Analytics, Observability and Future-extension lines | Add three lines; reject | Product Director | Ph0 | No | `LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md` |
| OPEN-LGA-13 | Add permissions, analytics, observability and acceptance-evidence lines to each UJ | Add; reject | UX Lead | Ph1 | No | `LEGACY_JOURNEY_REGISTRY_J01_J28.md` section 4 |
| OPEN-LGA-14 | Canonical route vocabulary (legacy aliases `/register`, `/courses`, `/challenges`, `/recruiter/*`, `/hm/dashboard`, `/institution/*`) and local-return-path rule for login redirects; request ID in 5xx errors | Pick one vocabulary; keep aliases as redirects | Frontend Architect | Ph0 | No | `LEGACY_APP_FLOW_MERGE.md` |
| OPEN-LGA-15 | Confirm the prior 66-workflow register (and 66 declared workflow state machines) is covered by target BP/SM documents | Map each to BP-*/SM-*; mark gaps | Documentation Architect | Ph1 | No | Prior INDEX statement; the retired workflow register's content is summarised in `../30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` Appendix A/B (outside Group A); related OPEN-45 |
| OPEN-LGA-16 | Design-token and state reconciliation (motion durations 120/200/320 vs 80/150/240/400; missing states; z-index scale; "Aura" origin; second-reuse promotion rule) | Adopt target values; adopt legacy; hybrid | Design System Lead | Ph0 | No | `LEGACY_UI_UX_DESIGN_SYSTEM_MERGE.md` |
| OPEN-LGA-17 | Reconcile legacy plan names, prices and quotas with target tier structure | Use legacy numbers as the draft price book; ignore; run market research first | CPO + Finance | Ph2 | Yes for billing | `LEGACY_PRICING_PRIOR_ATTEMPT.md`; related OPEN-19, OPEN-05 |
| OPEN-LGA-18 | Free-employer posting policy and organisation-level billing owner (legacy: entitlements followed the acting user; free recruiters unlimited) | Org-level entitlement owner; per-user; paid-only posting | CPO + Finance | Ph2 | Yes for billing | `LEGACY_PRICING_PRIOR_ATTEMPT.md` |
| OPEN-LGA-19 | Place legacy Stages A..F and BL-001..BL-018 into the roadmap; BL-018 (Dockerfile pruning, P3) and D-01..D-03 (reproduced defects) are identified in the roadmap file | Map to WPs; discard those superseded by target ADRs | Program Director | Ph0 | No | `LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` |
| OPEN-LGA-20 | Confirm the target stack where the prior documents differed: prior SSOT/TRD intended Supabase Auth, TanStack Query, Edge Functions, Stripe and RLS; the prior built system used HMAC session tokens and plain React state | Confirm ADR-T06 (cookie sessions) and ADR-T05 as the target; record Supabase/TanStack as rejected or optional | Enterprise Architect | Ph0 | Yes for architecture lock | Legacy conflict C-5; related OPEN-47, OPEN-52 |
| OPEN-LGA-21 | Map the three conflicting legacy ADR numbering lists (C-13) and the unratified legacy ADR-015 (C-14) to ADR-T## | Single mapping table; no legacy ADR ID reused | Architecture Review Board | Ph0 | No | Legacy conflicts C-13, C-14; related OPEN-52 |

## 2. Legacy documentation-conflict register C-1..C-21 (preserved; all dated 2026-10-21 unless stated)

Prior statements, restated so that none is lost. "Target disposition" says what happens to each in this project. C-19 does not exist in the source numbering (the list jumps from C-18 to C-20).

| # | Prior conflict (summary) | Evidence the prior attempt gave | Target disposition |
|---|---|---|---|
| C-1 | Prior root SSOT status line said GREENFIELD / 0% verified while the repository had code | Resolved as a text change by the prior attempt | Not applicable. This project is greenfield; the status lines in the blueprint say so. |
| C-2 | Feature maturity counts differed across reports (see roadmap file section 2) | Audit counts: 6 implemented-unverified, 87 partial, 1 broken, 75 not implemented, 4 deprecated; none certified end to end | Not applicable as counts; lesson: one tracker, executable evidence only. |
| C-3 | Test counts and scope (1,172 assertions / 115 files; lint failed on 7 files; PostgreSQL and browser suites not run) | Same | Lesson only. |
| C-4 | SQL migration count disagreed (41, 46, 51...) | Same | Lesson: generate counts, do not hand-write them. |
| C-5 | Intended stack vs built stack | SSOT/TRD vs architecture-as-built | OPEN-LGA-20 |
| C-6 | Registry status ownership | Registry delegated status to the audit | Resolved by design in this project: registries carry identity, status lives elsewhere (see `LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md`). |
| C-7 | Stray personal note vault folder in the repository | Obsidian vault with template notes | Hygiene item for the prior repo; no target action. Do not add personal vaults to the project tree. |
| C-8 | Salary and small-cell privacy threshold disagree (k >= 10 default in privacy sections; BR-178 and BR-158 k >= 5; SSOT also k >= 3 and k >= 5 elsewhere) | Registry vs SSOT | OPEN-LGA-01 |
| C-9 | Rule reference formatting and semantic mismatch (same number, different meaning in feature prose, for example SSOT F-01 BR-001/BR-002 vs registry BR-01/BR-02) | Registry vs SSOT prose | OPEN-43, OPEN-LGA-06; do not create BR-249+ or renumber to fix formatting. |
| C-10 | Stale duplicate copies of SSOT sections in other documents (workflows, database, UI appendices) were replaced with pointers | Diffs showed no unique text | Resolved there. Lesson: no duplication (governance section 3 below). |
| C-11 | A protected build ignore-file referenced a deleted index | Harmless | Prior-repo item; not applicable. |
| C-12 | Agent-verification (Reticle) instructions duplicated across files, with a managed block that tools rewrite | Local edits would be overwritten | Not applicable to the blueprint; lesson: managed blocks should live in one file with pointers. |
| C-13 | Three ADR numbering lists disagreed | Target-architecture list vs architecture-as-built list vs SSOT (ADR-001..013) | OPEN-LGA-21 |
| C-14 | ADR-015 (persistence of the core loop) was "accepted for this branch, pending owner ratification"; it changed schema and dropped a token column | ADR-015 escalation section | OPEN-52, OPEN-LGA-21 |
| C-15 | Feature maturity overstatement for F-94 and F-26 (email provider existed but delivery unverified; portfolio state process-local) | Current matrix | Lesson: "adapter exists" is not "delivery works". |
| C-16 | Migration inventory counts are dated snapshots, not execution proof | Evidence ledger | Lesson. |
| C-17 | Table count vs target model: 50 canonical tables planned, about 185 operational tables planned, about 220 total; measured 111 distinct tables and 130 RLS-enable statements | Measured by the prior attempt | Target data model is `12_DATA_AND_DATABASE`; record that the prior plan sized the schema at about 220 tables and the prior built system had 111. |
| C-18 | About 30 routes in the target docs were not mounted in the web app | Measured | Lesson; see route aliases in `LEGACY_APP_FLOW_MERGE.md`. |
| C-20 | Who owns the 173-feature register: root SSOT section 7 or `FEATURE_REGISTRY.md` (175 of 180 unique lines identical, rest headings) | Measured | OPEN-41 (identity and metadata) |
| C-21 | Role count: SSOT 3 JWT + 24 contextual roles vs 10 built | Measured | OPEN-44, OPEN-LGA-08 |

Source-reconciliation note (2026-10-23, prior): C-2 and C-3 stayed dated evidence; C-4 reached 54 migrations; the "no provider SDKs" wording in C-5 was historical (a payments provider and an email adapter existed) while Supabase Auth, TanStack Query and Edge Functions remained target differences; a hosted manual adapter and migration 00054 existed with full live isolation unverified; salary policy, rule-ID semantics and ADR authority stayed owner decisions.

## 3. Resolved design gaps (legacy; with target counterpart)

| Legacy gap | Legacy resolution | Target counterpart |
|---|---|---|
| Direct table API vs domain API ambiguity | Browser uses the application API for domain mutations | ADR-T08 (REST /api/v1), ADR-T05 |
| AI platform late in roadmap | Gateway/policy foundation moved to Phase 0 | ADR-T12 (AI gateway only path) |
| Oversized shared kernel | Narrowed to true cross-cutting primitives | ADR-T04 module boundaries |
| 173 features treated as implementation target | Portfolio separated from GA scope | `LEGACY_FEATURE_REGISTRY_F01_F173.md` section 0 |
| Consumer AI subscription assumption | Separated from API authorisation | ADR-T12 budgets |
| Free AI cost ambiguity | Hard cost policy | INV-T07 |
| Assessment AI escape routes | Session-aware gateway enforcement | ADR-T12/T13 `AI_PROHIBITED` |
| Candidate-level hiring prediction risk | Reframed as governed/descriptive intelligence | INV-T09; F-154/F-168 flagged |
| Hard-coded retention | Policy-driven | `14_*` retention schedule (OPEN-08) |
| Low cohort threshold | Conservative configurable suppression | OPEN-25, OPEN-LGA-01 |
| Hash commitment called ZK | Terminology corrected; stable Verifiable Credentials 2.0 target | Never call a hash commitment zero-knowledge |
| LinkedIn runtime dependency | Adapter-only | STR-01 out-of-scope list; MIG-01..MIG-08 |
| Realtime as correctness | Advisory only | Realtime is a hint; state from the database |
| Queue exactly-once confusion | Idempotent side effects | ADR-T09 at-least-once + dedupe |
| Production-ready documentation claims | Separate specification vs runtime readiness | Every document here is [TARGET] |

## 4. Remaining decision-gated gaps (legacy) mapped to existing OPEN ids

| Legacy gap | Nearest existing id | Note |
|---|---|---|
| Legal review for interview recording (dual consent, <= 90-day retention, BR-169/170) | OPEN-08 | Counsel needed before recording features |
| Final licensed market-data providers (salary/market analytics) | OPEN-24 (providers) and OPEN-LGA-01 (thresholds) | No dedicated id; add if salary intelligence is in scope |
| Media provider selection | none found | Candidate new decision when institutional media (legacy F-42/F-44/F-51) enters scope |
| Institution legal/controller-processor model | OPEN-09, OPEN-30 | |
| Pricing validation | OPEN-19, OPEN-LGA-17 | |
| Optional proctoring decision | OPEN-28 | |
| AI provider support matrix | OPEN-24 | |
| Regional compliance mappings | OPEN-08, OPEN-30 | |

## 5. Verification gaps (legacy) and the gap-closure rule

Gaps documentation cannot close: executable implementation; deployment; security penetration evidence; accessibility conformance evidence; performance under target load; backup/restore drill; incident-response drill; AI evaluation results; assessment anti-cheat validation. In this project all nine are open by definition.

**Gap closure rule (carried over):** for each remaining gap record, in order: owner; evidence required; decision; implementation impact; test; acceptance; closure date. Target: use as the template for rows in `OPEN_DECISIONS.md` and for release-gate evidence (`16_QA_AND_TESTING`).

## 6. Governance model of the prior attempt (carried over)

| Topic | Prior rule | Target status |
|---|---|---|
| Authority | The root SSOT is canonical project intent; supporting documents specialise (PRD product; TRD technical; ARCHITECTURE as built; TARGET_ARCHITECTURE intended; UI/UX visual; SECURITY; TESTING; FEATURE_REGISTRY; APP_FLOW; workflows corpus; IMPLEMENTATION_PLAN; AGENTS; CODE_STYLE; DATABASE/API current references; BRAIN conceptual) | Target authority is the numbered folders plus `MASTER_INDEX`; the root SSOT is protected and reconciled via `28_*` |
| No duplication | A definition belongs in one canonical place; others reference it | Adopt (also visible in this merge: BR text lives only in the BR catalogue) |
| Change classes | C1 text/copy; C2 code/behaviour; C3 schema/security-policy; C4 dependency; C5 secret/config; C6 architecture; C7 commercial/entitlement. C3 and above need expanded review; C6 and C7 need founder approval | OPEN-50 already covers reconciling C1-C7 with target governance; adopt as change-class vocabulary for ADR/OPEN decisions |
| Traceability chain | Business outcome, user need, journey, feature, requirement, data/API/event, implementation, test, release gate | Matches `28_TRACEABILITY_AND_COVERAGE`; keep |
| Status vocabulary | PLANNED, IN DEVELOPMENT, IMPLEMENTED, VERIFIED, RELEASED; side states BLOCKED, DEPRECATED, REJECTED | See `LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md` |
| Documentation sync | A change that alters canonical behaviour updates the relevant artifact in the same change set | Adopt |
| Historical material | Prior editions are provenance only; they cannot override current canonical decisions | Adopt: this is the status of everything in `31_LEGACY_ARCHIVE` |

## 7. Legacy documentation authority order and conventions (from the prior INDEX; carried over)

When two documents disagreed the prior attempt applied this order: (1) what exists today: the code, then the architecture-as-built document, then the source-scoped inventory; dated reports never override newer source; (2) what is intended: the root SSOT, then PRD, TRD, registries, target architecture; (3) history: dated reports and the memory file are evidence of what happened, not of current state. Unresolved conflicts were listed, "not resolved by assumption".

Conventions: each definition lives in one canonical document; dated report filenames carry their date and undated files are living; a personal note vault is not project documentation. Prior documentation audit of 2026-10-23: a file-by-file classification of every tracked Markdown document; four redundant files consolidated (197 to 193 Markdown files); API and database target registers linked to the SSOT with their files describing implementation; build/deployment files, personal notes and tooling instructions preserved.

Target use: the order (1) code, (2) intent, (3) history becomes, for this greenfield project, (1) approved ADR/OPEN decisions, (2) the numbered blueprint folders, (3) `30_PRIOR_IMPLEMENTATION_REFERENCE` and `31_LEGACY_ARCHIVE` as history only.

## 8. Lessons from the prior attempt's known risks (BRAIN/MEMORY section 11) as risk candidates

Rated by the prior attempt as architectural risks or deficiencies; here they are **design requirements to avoid repeating**. Candidate additions to `RISK_REGISTER.md` (not edited here).

| Candidate id | Prior finding | Target requirement | Existing target anchor |
|---|---|---|---|
| LGA-RSK-01 (SEC-01) | Corporate-email challenge hashed as plain SHA-256 of a public id and code, no keyed HMAC; a database reader could precompute a 1,000,000-entry table in under 50 ms | Keyed HMAC (server secret) for any short-code or OTP verifier; rate limit and expiry | SECURITY_ARCHITECTURE; ADR-T06 |
| LGA-RSK-02 (SEC-02) | Referee voucher tokens had 128-bit entropy but no expiry column | Referee tokens must have an `expires_at` (prior remediation: 30-day TTL), single use, hashed at rest | BR-T004 (referee request expiry) |
| LGA-RSK-03 (SEC-04) | The API connected as a database owner so row-level security was bypassed; tenant isolation depended on application guards alone | API connects with a non-owner role; RLS exercised in tests as defence in depth | ADR-T05, RISK-01 |
| LGA-RSK-04 (OPS-01) | Boot-time hydration of every row of 20 tables into memory; single-writer lock blocked horizontal scale | No in-process read model; direct SQL reads | ADR-T05; OPEN-52 |
| LGA-RSK-05 (OPS-02) | Edge proxy served the static page with status 200 for `/health`, masking API crashes | Health endpoints routed to the API through the edge; synthetic checks hit the API | OPS-DEP / OPS-OBS |
| LGA-RSK-06 | Simulated results presented as passed (challenge text received passed/100 while evidence stayed unverified) | No simulated pass anywhere; unverified status | ADR-T13 |
| LGA-RSK-07 | Duplicate handler executions from sequential worker batch leases | Per-job claims, fenced leases, idempotent handlers | ADR-T09 |
| LGA-RSK-08 | Cross-store erasure could fail after account deactivation | Durable erasure saga with retries and visible state | BR-T060, OPEN-08 |
| LGA-RSK-09 | AI usage meter in process memory (not durable, not shared) | Durable shared quota counters | ADR-T12, COM-OPS |
| LGA-RSK-10 | Status figures hand-written in memory files drifted from reality | Counts generated by tooling; one status tracker | `28_*`, release gates |

## 9. Source-group conflicts and open items elsewhere

Every merged file in this group registers its own local decisions with OPEN-LGA ids from section 1. If an owner closes one, record the outcome in `OPEN_DECISIONS.md` and strike it here, as the register convention requires.
