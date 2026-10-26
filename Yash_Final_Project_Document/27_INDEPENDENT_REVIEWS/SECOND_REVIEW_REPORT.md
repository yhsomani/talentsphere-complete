# Second Independent Review Report (originals plus REV2 layer)

Doc ID: REV-2ND · Owner: Independent reviewer (single model pass) · Version 1.0 · Status: Draft · Date: 2026-10-25
Supersedes nothing. Additive new file; the original FINAL_REVIEW_REPORT, REVIEW_FIX_STATUS and every other file are untouched. To be linked from `00_CONTROL_CENTRE/MASTER_INDEX_V9_ADDENDUM_2.md` by the orchestrator (not linked yet, so this file is currently an orphan).

This is a review of documentation. Nothing here asserts that any feature is built, tested, compliant or certified. Paths are relative to `Yash_Final_Project_Document/`. Line numbers are those of the files as read on 2026-10-25.

## 0. Verdict in brief

**The REV2 layer is mostly real, mostly consistent with the originals, and mostly unreachable.** Of 42 fix claims checked, 33 are CONFIRMED, 9 PARTIAL and 0 NOT FOUND (section 2). Where claims were not fixes but statements about the evidence (counts, preservation, tracker text), 3 of 18 were NOT FOUND (section 2.3). Headline counts reproduce by independent script almost everywhere.

The main problems are structural rather than textual:

1. No original document, and not the README or MASTER_INDEX, points to any REV2 or V9 addendum file (REVW2-01, REVW2-02). Readers who follow the documented entry path get superseded rules, including rules that REV2 itself calls defects (instructor sign-off as top rung, offline replay of assessment answers, 24 h idempotency retention).
2. Proposals are repeatedly called "binding decisions" although the source file says they are unratified (REVW2-07).
3. The V9 preservation records do not reproduce: the manifest CSV has 132 rows where its narrative claims 204 (REVW2-05); the baseline is path plus byte size only and has already drifted (REVW2-08).
4. REV2 files contradict each other on facts that decide Ready-for-Implementation gating (features without ACs 158 versus 168; job retry parameters; error-code spelling; telemetry classification; budget names).
5. One data-layer design defect would block the idempotency store as written (REVW2-06).

Totals: **44 new findings: 0 Critical, 7 High, 23 Medium, 14 Low.** No area is Ready for Implementation (agrees with the first review).

## 1. Scope and method

### 1.1 What was read

| Depth | Files |
|---|---|
| Read in full | `README.md`; `00_CONTROL_CENTRE/` MASTER_INDEX, MASTER_INDEX_V9_ADDENDUM, MASTER_INDEX_V9_ADDENDUM_2, EXECUTION_LEDGER_V9_ADDENDUM, CLEANUP_CANDIDATES, SOURCE_DOCUMENT_INVENTORY, INFORMATION_RECONCILIATION_MATRIX, DOCUMENT_STATUS; `27_*/` FINAL_REVIEW_REPORT (all 309 lines), REVIEW_RESOLUTION_DECISIONS, REVIEW_FIX_STATUS; `24_*/GOVERNANCE_REGISTRATIONS_REV2`, `RISK_REGISTER_REV2`; `99_*/` all four files; every REV2 or fix overlay: `01_*/PRODUCT_VISION_GOALS_REV2`, `02_*/PERMISSION_MATRIX_REV2`, `04_*/CAPABILITY_MAP_PHASE_RECONCILIATION_REV2`, `06_*/` BUSINESS_RULES_REGISTRY_REV2, DECISION_TABLES_REV2, PRODUCT_INVARIANT_REGISTRY_REV2, STATE_MACHINES_REV2, `07_*/UX_REVIEW_FIXES`, `08_*/` OFFLINE_AND_SYNC_DESIGN_REV2, PWA_MOBILE_REVIEW_FIXES, `09_*/FEDERATION_REVIEW_FIXES`, `10_*/FRONTEND_ARCHITECTURE_REV2`, `11_*/BACKEND_ARCHITECTURE_REV2`, `12_*/PHYSICAL_DESIGN_REV2`, `14_*/SECURITY_REV2`, `15_*/SLO_REV2`, `17_*/FRONTEND_DELIVERY_REVIEW_FIXES`, `19_*/MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL`, `21_*/COST_ENVELOPE`, `22_*/ROADMAP_REV2` |
| Read in part | `28_*/COVERAGE_MATRICES.md` (lines 1 to 542 of 1044; the rest only through scripts); `16_*/TEST_CATALOG_REV2.md` (header, section 2, start of section 3); `05_*/SPEC_ACCEPTANCE_ADDITIONS_REV2.md` (first 30 lines, rest by script); `13_*/API_CATALOG_ADDENDUM.md` (sections 1, 2 head, 3.4, 6); `13_*/ACTION_TO_OPERATION_MAP.md` (sections 1, 3 to 6; all 231 rows by script); `06_*/STATE_MACHINES.md` (header, vocabulary authority, headings, SM-JOB, SM-APPLICATION rows); `14_*/SECURITY_ARCHITECTURE.md` section 2.3; `12_*/PHYSICAL_DESIGN.md` sections 4.1, 4.2 and 17; `00_*/CONSENT_SCOPE_CATALOGUE.md` (first 40 lines) |
| Targeted search only (line-level reads of the hits) | the other originals in 02 to 24 and 99, including USR-01 rows, BR registry rows, DT-06 and DT-12, SPEC_G1 and G3, CAPABILITY_MAP, ROADMAP section 7, TEST_CATALOG, THREAT_MODEL rows, PRIVACY PUR-24, DATA_GOVERNANCE DATA-036, API_CATALOG, ADR_REGISTER, OPEN_DECISIONS, ID_REGISTRY, FEDERATION_ARCHITECTURE header, FRONTEND_ARCHITECTURE, PWA_ARCHITECTURE, GLOSSARY |
| Parsed as data only | `13_*/contracts/openapi.yaml`, `openapi.addendum.yaml`, `asyncapi.yaml`, the four JSON schemas, the six federation JSON files, `KNOWLEDGE_PRESERVATION_MANIFEST.csv`, `PROTECTED_DOCUMENT_TREE_BASELINE.csv` |
| Not read | `25_DIAGRAM_LIBRARY` (BFF grep only; Mermaid not rendered); `26_*` beyond first lines and access-date grep; `18`, `20` (counts only); USER_JOURNEYS, DESIGN_SYSTEM, ACCESSIBILITY_SPEC, SCREEN_REGISTRY, NAVIGATION (grep hits only); the 28_* crosswalk CSVs and MD files other than COVERAGE_MATRICES, AC_TEST_TRACEABILITY_MATRIX (not opened); `29_*`; 06 crosswalk CSVs; the second half of COVERAGE_MATRICES |

Absence of a finding in a "not read" area is not evidence of soundness.

### 1.2 Checks executed

Small Python scripts in a scratch directory outside the repository (scratchpad of this session; nothing added to the folder except this file):

- file counts, tracked versus untracked (`git ls-files`, `git status`), per-commit line counts (`git show --numstat 4451fc63`);
- baseline CSV versus current tree (existence and byte size);
- table-row extraction by first cell for AC, BR, INV, TEST, RISK, ADR, SCR, ACT, DT, WP identifiers; reference-resolution for BR, INV, AC and TEST ids;
- relative Markdown link resolution (152 Markdown files, 373 relative links, 0 broken);
- JSON parse (10 files), YAML parse (3 files), JSON Schema 2020-12 meta-validation and validation of `REMOTE_REGISTRY.example_REV2.json` against the REV2 schemas (0 errors), and **Ed25519 verification of all 8 entries** using the algorithm documented in FEDERATION_REVIEW_FIXES section 4 (8 of 8 verify; derived public key equals the published one);
- OpenAPI merge analysis: operationId, method-plus-path and `x-api-id` collisions (none), schema-name overlap (none), shared path templates (3, different methods), reference resolution, CSRF coverage of unsafe operations, state enums against `x-state-machine`, ambiguous merged paths (5 shapes, 1 with a shared method);
- ACTION_TO_OPERATION_MAP: 231 rows, every catalog id and operationId resolved, status counts reproduced;
- module dependency graph of BACKEND_ARCHITECTURE_REV2 section 2: 25 nodes, acyclic;
- FRONTEND_ARCHITECTURE_REV2 section 2 scoring scenarios S0 to S4 recomputed (all correct);
- DB-02-R2 write-budget row sums (12 use cases, all correct); retry-span arithmetic for 5 s/15 min (3,975 s) and 60 s/6 h (73,860 s) (both correct);
- phase counts and Phase-1 spine of PCAP-01-R2 recomputed from the capability map (correct: 82/87/42/32/7/3 becomes 85/85/40/33/7/3; spine = 73 = all P0 features in Phase 0 or 1);
- `SSOT.md` SHA-256 against the value recorded at inventory start.

### 1.3 Not run (and why)

Redocly, AsyncAPI CLI, oasdiff, Mermaid rendering (no network installs; downloading tooling was not authorised): the agent-reported results in `API_CATALOG_ADDENDUM.md` section 6 are therefore **not independently confirmed**. No SQL was executed (no PostgreSQL available; the DDL in PHYSICAL_DESIGN_REV2 is unrun by its authors too). No web research, so every external platform or library fact (iOS 16.4 Web Push gating, plugin version, WCAG success criteria) is taken as the documents state it. No device, browser or legal check.

### 1.4 Limits of this review

- **Independence is limited.** This is one reviewer pass by a model of the same family as the delegated writers (the ledger records "Sonnet only"). Correlated blind spots are possible.
- **Effort claim.** The request labelled this a "Sonnet xhigh" review. The reasoning-effort setting visible to this reviewer was 30, not xhigh; the "xhigh" label should not be repeated for this report. The model was Sonnet 5.5 as stated in the session context; runtime enforcement of model and effort cannot be verified from inside the folder (the ledger and PROJECT_SCOPE make the same admission).
- **Side effect outside the folder.** Running the mandatory `graphify query` (project CLAUDE.md rule) updated the tracked timestamp file `graphify-out/cache/last_query_stamp` (git shows it modified, value only). It is tool state, not a document; it was left as is rather than reverted, so the owner can decide. No other file outside the folder was touched.
- Severity scale is that of FINAL_REVIEW_REPORT section 1.3.

## 2. Fix-claim verification

Criteria. **CONFIRMED**: the cited fix text is present in the cited file and is consistent with the rest of the REV2 set and with the originals it relies on. **PARTIAL**: present but with a defect, conflict or missing piece that a reader would hit. **NOT FOUND**: the cited fix is absent. Whether the originals still carry the old text (they do, almost everywhere, because V9 forbids editing them) is reported separately in section 4 and does not by itself downgrade a verdict.

### 2.1 The 42 fix rows

| Finding | Tracker status | Where checked | Verdict | Evidence and residual |
|---|---|---|---|---|
| REVW-01 permission over-grant | Fixed in docs + REV2 | `02_*/STAKEHOLDERS_ROLES_PERMISSIONS.md` rows Evidence items (L38), Applications (L41), Data-rights (L50); `16_*/TEST_CATALOG.md` L23; PERMISSION_MATRIX_REV2 sections 1 to 2 | CONFIRMED | ORGADM evidence "no individual evidence reads"; INSTADM and FAC "aggregate only (k>=5)"; TEST-SEC-NEG-01 present. Residual: HM job-postings cell still `RU(O)` in USR-01 L40, corrected only in REV2 section 2.1 |
| REVW-02 consent vocabularies | Fixed in docs | `00_*/CONSENT_SCOPE_CATALOGUE.md`; `13_*/openapi.yaml` `ConsentScope` (14 values); `12_*/CONCEPTUAL_AND_LOGICAL_MODEL.md` L2859 CHECK (14 values); ID_REGISTRY L63 | CONFIRMED | DB CHECK, OpenAPI enum and catalogue list the same 14; `evidence.share_recruiter` retired in all three; legacy `CS-*` appear only as "(was ...)" annotations (SPEC_G1 L207 to L220) |
| REVW-03 state vocabularies | Fixed in docs + REV2 | SM-00 "Vocabulary authority" (L24 to L80); openapi.yaml enums; DB-01 L144 to L151, L223, L1503, L1694, L2267 | CONFIRMED | 15 base and 8 addendum `x-state-machine` enums match SM sets: ACCOUNT has no `locked`, JOB has `paused`, APPLICATION has `offer_extended` and `offer_declined`, SUBSCRIPTION has no `trialing`. Scope: ATTEMPT, ENROLMENT, NOTIFY have no OpenAPI schema, so parity there is not checkable; Dispute enum gap is REVW2-21 |
| REVW-04 audit versus erasure | Fixed in docs | `12_*/PHYSICAL_DESIGN.md` L106 (4.1), L123 (4.2); PRODUCT_INVARIANT_REGISTRY L54, L55, L57 | CONFIRMED | Opaque `subject_ref`, erasable `subject_identity_map`, KMS-signed batch anchors, no inline chain lock. Design assertion only, nothing executed. See REVW2-35 for INV-T38 wording |
| REVW-05 cookie contract | Fixed in docs | PWA_ARCHITECTURE L197; SPEC_G1 L42; SECURITY_ARCHITECTURE L42 to L47; API_DESIGN_STANDARDS L45 to L46; ADR_REGISTER ADR-T06 (L13); openapi.yaml securitySchemes | CONFIRMED | `__Host-ts_at` Path=/, `__Secure-ts_rt` Path=/api/v1/auth/refresh, `X-CSRF-Token` identical in all; `/bff` appears only in the glossary, REV2 notes and review text. Residual: "BFF" survives as a glossary-defined term in 26 files outside the review and REV2 files (REVW2-38) |
| REVW-06 write contention | Addressed in REV2 | BACKEND_REV2 sections 1, 5; PHYSICAL_REV2 sections 1 to 3, 9 | CONFIRMED | Inline/job consumer modes, coalescing index, durable `auth_throttle`, per-use-case budget; all 12 row sums reproduce. Design only (REVW2-06, REVW2-22 are new defects in the same area) |
| REVW-07 federation default | Addressed in REV2 | FEDERATION_REVIEW_FIXES section 1; FEDERATION_ARCHITECTURE L8 (in-place banner); ADR_REGISTER ADR-T23 (L30); TEST_CATALOG L13, L151 | CONFIRMED | `MF_MODE=bundled` default consistently stated; activation criteria; federated tests tagged conditional. Residual wording in REVW2-38; ADR ids in REVW2-32 |
| REVW-08 MOD-ADM split | Addressed in REV2 | FEDERATION_REVIEW_FIXES section 2; `REMOTE_*_REV2.json` | CONFIRMED | 8 remotes; REV2 schemas meta-valid; example validates with 0 errors; 8 of 8 signatures verify by script. ID_REGISTRY not updated (disclosed); FD-14 capability source open (REVW2-16) |
| REVW-09 UI to API mapping | Partial | ACTION_TO_OPERATION_MAP; API_CATALOG_ADDENDUM; openapi.addendum.yaml | CONFIRMED | 231 ACT rows: OK 153, CATALOGUED 59, CLIENT 15, DEFERRED 3, MISSING 1; 117 addendum operations; 333 catalog rows, 226 with OpenAPI. All ids resolve. "Partial" is the right tracker status |
| REVW-10 phases | Addressed in REV2 | CAPABILITY_MAP_PHASE_RECONCILIATION_REV2 sections 2 to 4, 8 | CONFIRMED | Phase counts and 73-feature spine reproduce. OPEN-42 (learning in Phase 1) honestly recorded, undecided (REVW2-30) |
| REVW-11 dependencies | Addressed in REV2 | ROADMAP_REV2 section 1 against ROADMAP.md L111, L118, L120, L125, L126 | CONFIRMED | Dependency edges (identity needs worker and email; apply-core, search-base need consent; referee needs shell; entitlement stub) exist in ROADMAP.md as REV2 states; WP count 60 reproduces (61 after overlay) |
| REVW-12 instructor rung | Addressed in REV2 | BR_REV2 BR-T118/T119; DT_REV2 DT-06, DT-14; INV_REV2 INV-T46/T47; PHYSICAL_REV2 section 6; `EvidenceIssuer.schema.json`; openapi.addendum `IssuerClass` | CONFIRMED | Same four-value enum everywhere. Originals unchanged and still wrong (REVW2-03) |
| REVW-13 SEO | Addressed in REV2 | FRONTEND_REV2 section 2 | CONFIRMED | Scenario table S0 to S4 recomputed exactly (103/78/84/94/107 for A; C=86 in S2). ADR-T24 not in ADR_REGISTER |
| REVW-14 idempotency retention | Addressed in REV2 | BR_REV2 BR-T114, CONST-S12; OFFLINE_REV2 section 4; BACKEND_REV2 section 4; PHYSICAL_REV2 section 2 | PARTIAL | Rule text consistent (14 d for queued routes, natural-key alternative, `x-idempotency` on all 117 addendum operations). But the store as specified cannot enforce uniqueness (REVW2-06); the 25 base operations are classified only in prose (REVW2-25); FF-07, BR-T114, BE-01 section 8 unchanged |
| REVW-15 offline scope | Addressed in REV2 | OFFLINE_REV2 sections 2 to 3; UX_REVIEW_FIXES section 2.1 | CONFIRMED | Assessment online-only, lesson progress queued after trigger, one constants table. Originals SPEC_G3 and SM-00 unchanged (REVW2-04) |
| REVW-16 cost evidence | Partial | COST_ENVELOPE; COST_MODEL.md section 11 | CONFIRMED | 28 component rows, all cost and quote cells empty by design; duplicate in COST_MODEL section 11 exists as stated. Gate not wired into roadmap (REVW2-24). "Partial" is correct |
| REVW-17 traceability | Partial | COVERAGE_MATRICES; PCAP-01-R2 section 5; SPEC_ACCEPTANCE_ADDITIONS_REV2 | PARTIAL | Counts reproduce (359 / 97 / 262; 95 new ACs, no collisions) but two REV2 files give different "features without AC" figures and blocker lists (REVW2-12) |
| REVW-18 session constants | Addressed in REV2 | BR_REV2 section 3 CONST-S01 to S15; SECURITY_REV2 section 1 | PARTIAL | Values agree with BR-T020/T044/T050/T054/T057/T064 originals. But SECURITY_ARCHITECTURE L44 still says the table is "pending" and points to the wrong file; PWA-01 L197 still lists OPEN-FE-08; ACTION_REGISTRY 15 min unchanged (REVW2-43) |
| REVW-19 job engine | Addressed in REV2 | SM_REV2 section 2.7 to 2.8; BACKEND_REV2 section 3 | PARTIAL | BACKEND_REV2 resolves the 66 min versus 24 h arithmetic (60 s base, 6 h cap, 73,860 s) but SM_REV2 still carries 5 s/15 min and the "[OPEN]" note; REVIEW_FIX_STATUS row 19 still says open (REVW2-14) |
| REVW-20 missing machines | Addressed in REV2 | SM_REV2 section 3 (nine machines) and 3.10; PHYSICAL_REV2 section 7 | CONFIRMED | SM-FILE, ORG, COURSE, CREDENTIAL, DISPUTE, WORKCLAIM, FIRSTCONTACT, SUPPORTGRANT, EXPORT; CHECK sets present. Effects of org un-verification have a loophole (REVW2-17) |
| REVW-21 account guard | Addressed in REV2 | SM_REV2 section 2.1, 2.6; BR-T124; INV-T49 | CONFIRMED | Second-person guard on suspension; erasure parked while a case is open |
| REVW-22 employer-domain badge | Addressed in REV2 | BR-T017; DT-06 rows 3, 3a; INV-T48; SM_REV2 section 2.3; PHYSICAL_REV2 `domain_binding` | CONFIRMED | Bound versus unbound split present end to end |
| REVW-23 budgets | Addressed in REV2 | FRONTEND_REV2 section 4; SLO_REV2 section 4 | PARTIAL | First-visit arithmetic reproduces (2.80 s, 2.50 s, 2.75 s). SLO_REV2 uses a different budget name and a different B9/SLO-17 relationship (REVW2-42) |
| REVW-24 offline outbox | Addressed in REV2 | OFFLINE_REV2 sections 0 to 1; ROADMAP_REV2 R4; COST_ENVELOPE E26; BACKEND_REV2 section 4 phase note | CONFIRMED | Phase 1 = read cache + local unsent drafts, no outbox; trigger defined, threshold [OPEN] |
| REVW-25 consent timing | Fixed in docs | BR_REG L93 (BR-T063); TEST_CATALOG L29 (TEST-SEC-009); BR_REV2 CONST-S13; BACKEND_REV2 section 6; PHYSICAL_REV2 section 4 | CONFIRMED | "First read after the revoking commit; no consent cache; 60 s is a test timeout". Mis-citation of INV-T25 in BACKEND_REV2 (REVW2-34) |
| REVW-26 retention after consent | Partial | BR_REV2 BR-T122 | CONFIRMED | 30 d deletion, minimal hiring record only with counsel basis [OPEN-08]. "Partial" is correct |
| REVW-27 withdrawn re-apply | Addressed in REV2 | BR-T001, BR-T125; DT-05 row 5a; SM_REV2 t12; PHYSICAL_REV2 section 7 | CONFIRMED | Cooldown {24 h} [OPEN]; OPEN-B20 closed on paper. Error-code spelling conflict (REVW2-13) |
| REVW-28 role columns | Addressed in REV2 | PERMISSION_MATRIX_REV2 sections 1, 2.1, 2.2 | CONFIRMED | 17 columns; new ORGOWN, VIEW, PROCT, REFEREE, MENTOR, SVC; HM and ORGADM cells corrected. ID_REGISTRY has 15 ROLE ids (REVW2-33); proctor inconsistency (REVW2-41) |
| REVW-29 minimum age | Partial | BR-T120; INV-T50; RISK-32 replacement | CONFIRMED | Attestation rule present; value awaits counsel |
| REVW-30 marketplace money flow | Addressed in REV2 | MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL; ROADMAP_REV2 R5; COMMERCIAL_OPERATIONS L5, L203 | CONFIRMED | Phase 2 first-party only; `TEST-BIL-009` exists in TEST_CATALOG |
| REVW-31 telemetry | Addressed in REV2 | SECURITY_REV2 section 4; SLO_REV2 sections 1 to 3; PRIVACY L44 (PUR-24) | PARTIAL | Two REV2 files classify client timing beacons differently (REVW2-15) |
| REVW-32 cookie tossing / UGC domain | Addressed in REV2 | SECURITY_REV2 section 2; SECURITY_ARCHITECTURE L43, L102, L117; THREAT_MODEL rows C15, C16, AC-33, AC-34, RR-8; PRIVACY PUR-24; TEST_CATALOG_REV2 TEST-SEC-032/033 | CONFIRMED | All cited rows exist; `__Host-` session binding of refresh stated consistently |
| REVW-36 headline counts | Open | COVERAGE_MATRICES section 2 | PARTIAL | Reproduces (108 CAP, 359 ACs, 236 tests, 168 features without AC) but originals are still stale, no generator is committed, and REV2 files disagree (REVW2-12, REVW2-29, REVW2-44) |
| REVW-37 iOS push markers | Addressed in REV2 | PWA_MOBILE_REVIEW_FIXES section 1; RESEARCH_LOG R2 | CONFIRMED | Canonical IOS-PUSH-CLAIM text present; "accessed 2026-10-25" is supported by RESEARCH_LOG. Blueprint section 6 still unmarked (section 6) |
| REVW-38 referee reminder cap | Addressed in REV2 (unverified) | BR-T004, T022, T121; DT-13; INV-T51; SM_REV2 section 2.4 | CONFIRMED | Shared cap of 2, 3-day spacing, deferral not drop |
| REVW-39 binary goals | Addressed in REV2 (folder owner to confirm) | PRODUCT_VISION_GOALS_REV2 | CONFIRMED | "Passes" retired, thresholds [OPEN]. MET-013 in folder 20 still unedited |
| REVW-41 unlogged limiter | Addressed in REV2 | BACKEND_REV2 section 5; PHYSICAL_REV2 section 1; SECURITY_REV2 section 3; SLO_REV2 section 6 | CONFIRMED | Logged `auth_throttle`; edge first; earlier Redis trigger |
| REVW-42 module graph | Addressed in REV2 | BACKEND_REV2 section 2 | CONFIRMED | 25 nodes, no cycle, no undefined import target (script). Registry has `api/network` (deferred, omitted deliberately) |
| REVW-43 "shortlist" naming | Addressed in REV2 (unverified) | BR-T072; INV-T52; AC-11-10-02; GOALS_REV2 | PARTIAL | Rename done in rules and goals; the API addendum still defines `GET /orgs/{orgId}/jobs/{jobId}/shortlist` (REVW2-19) |
| REVW-44 envelope `human` | Fixed in docs | `EventEnvelope.schema.json` actor; asyncapi.yaml L3014 to L3026; EVENT_CATALOG L17 | PARTIAL | Envelope fixed. SM-00 U6 (L16), INV-T31 (L50), TEST-HIR-014 (L289) and SM_REV2 L136 still say `actor.kind = human` (REVW2-20) |
| REVW-45 SQL/domain parity | Addressed in REV2 | PHYSICAL_REV2 section 5; BACKEND_REV2 section 9 | CONFIRMED | Generated `sm_edge` plus Cartesian parity test specified; not executed |
| REVW-46 IndexedDB encryption claim | Closed in documentation (not in tracker) | THREAT_MODEL L114 (C2), L158 (AC-24); OFF-01 section 7 L146 | CONFIRMED | Aligned to "no app-layer encryption at launch". REVIEW_FIX_STATUS does not list REVW-46 (REVW2-11) |

### 2.2 Tally

Rows: **42. CONFIRMED 33. PARTIAL 9** (REVW-14, 17, 18, 19, 23, 31, 36, 43, 44). **NOT FOUND 0.** Tracker rows for REVW-33, 35 and 40 are "Open"; their status text is accurate (no global OPEN register exists; ID_REGISTRY unchanged; `.omc/state/*` is tracked in the folder).

### 2.3 Adjacent claims checked (not fix rows)

| Claim | Where | Verdict | Evidence |
|---|---|---|---|
| Manifest records 204 sources, DOC-000192 to 000204 in the CSV | KNOWLEDGE_PRESERVATION_MANIFEST.md L9, L27, L79; SOURCE_DOCUMENT_INVENTORY | NOT FOUND | CSV has 132 rows, ids 1 to 132, same at git HEAD (REVW2-05) |
| "The original FINAL_REVIEW_REPORT is unchanged" | REVIEW_FIX_STATUS L3 | NOT FOUND | Report is v1.5 with a post-review disposition; commit 4451fc63 shows +54/-6 lines |
| BACKEND_REV2 section 6 "INV-T25 cache TTL <= 60 s retired" | BACKEND_REV2 L160 | NOT FOUND | INV-T25 is the rung-freshness invariant and still carries that text (PRODUCT_INVARIANT_REGISTRY L44) |
| "158 files in the root", "no uncommitted change outside the doc root" | EXECUTION_LEDGER_V9_ADDENDUM L9 | CONFIRMED when written, now stale | 158 tracked files (8 of them `.omc`); before this report the folder held 189 non-`.omc` files (150 tracked + 39 untracked); one tool-state file outside the folder is modified (see 1.4) |
| `SSOT.md` unchanged | ledger addendum, SOURCE_DOCUMENT_INVENTORY | CONFIRMED | git clean; SHA-256 `891cb4a4...f68d` equals the value recorded at inventory start; exactly one `SSOT.md` |
| 8 signatures verify, example validates | FEDERATION_REVIEW_FIXES sections 4, 8 | CONFIRMED | script |
| 117 addendum operations; 333 rows; 226 with OpenAPI; 23 enums matched | API_CATALOG_ADDENDUM sections 1, 6 | CONFIRMED | script (15 + 8 enums) |
| ACT map counts 231 / 153 / 59 / 15 / 3 / 1 | ACTION_TO_OPERATION_MAP section 1 | CONFIRMED | script |
| 25 base operations lack the Idempotency-Key parameter | BACKEND_REV2 section 4 | CONFIRMED | script (25 of 65 unsafe); addendum has 40 of 82 without the parameter but all 117 carry `x-idempotency` |
| COVERAGE_MATRICES headline counts | section 2 | CONFIRMED except "P0: 36" | 97/359 long-form and 29/30 platform ACs cited; 236 unique test ids; 168 features without AC; 108 CAP rows. 36 includes 2 features dispositioned "Remove" (REVW2-26) |
| Module graph acyclic | BACKEND_REV2 section 2 | CONFIRMED | script |
| Retry arithmetic (66 min; 20.5 h) | SM_REV2 L114; BACKEND_REV2 section 3.2 | CONFIRMED | 3,975 s and 73,860 s |
| Write-budget row sums | PHYSICAL_REV2 section 9 | CONFIRMED except summary sentence | REVW2-40 |
| 340 relative links, 0 broken | REVIEW_FIX_STATUS last paragraph | CONFIRMED | 373 now, 0 broken |
| YAML/JSON parse clean | REVIEW_FIX_STATUS | CONFIRMED | 3 YAML, 10 JSON |
| Redocly 0 errors / 1 warning; AsyncAPI parser valid | API_CATALOG_ADDENDUM section 6 | NOT RE-RUN | agent report only; the warned ambiguity is real (REVW2-37) |
| SLO_REV2 section 4 "needs recheck" | REVIEW_FIX_STATUS row 23 | CONFIRMED | recheck done here: REVW2-42 |
| PHYSICAL_DESIGN_REV2 DDL valid | section 2 to 7 | NOT VERIFIED | never executed by its authors or here; one construct is not enforceable as written (REVW2-06) |

## 3. New findings

Evidence lists where to check. "Owner" proposes who acts; nothing here is a decision.

### 3.1 High

| ID | Sev | Evidence (check here) | Consequence | Recommendation | Owner |
|---|---|---|---|---|---|
| REVW2-01 | High | README.md L5 to L9 (links MASTER_INDEX, blueprint, ID registry, ledger, manifest only); 00_*/MASTER_INDEX.md L3 and L31 (no row for either V9 addendum; still says the review is "in progress at time of writing"); DOCUMENT_STATUS.md (no mention of REV2). Script: no file other than the two addenda and the REV2 files themselves names any REV2 file; `MASTER_INDEX_V9_ADDENDUM_2.md` is linked from no file | The documented start path (README, then MASTER_INDEX, then originals) never reveals the REV2 layer. Readers treat superseded text as final | V9 forbids editing these files, so obtain explicit authorisation for one-line banners in README, MASTER_INDEX and DOCUMENT_STATUS, or add a new top-level `START_HERE` file; link ADDENDUM_2 from ADDENDUM 1 | Documentation Architect, user |
| REVW2-02 | High | Section 4 (56 originals listed, 0 contain a pointer; script). BR_REV2, SM_REV2, DB-02-R2, BE-01-R2 and others each list what they supersede, but the superseded text has no back-reference; RISK_REGISTER_REV2 RISK-56 names the problem | Two texts in force for every REV2 topic; generators and reviewers derive from the older one | Publish a generated supersession map (original, section, REV2 file, status) as a new file; with authorisation add banners; merge accepted overlays one file at a time as RISK-56 proposes | Documentation Architect, ARB |
| REVW2-03 | High | 06_*/BUSINESS_RULES_REGISTRY.md L26 (BR-T011: "platform course rule/instructor sign-off" reaches `authority_verified`); DECISION_TABLES.md DT-06 row 1 (L126); 05_*/SPEC_G3 L212 to L213 and AC-08-04-03 (L291); 24_*/ADR_REGISTER.md ADR-T14 (L21, no issuer class). Fix exists only in BR_REV2 BR-T118/T119, DT_REV2 DT-06/DT-14, INV_REV2 INV-T46/T47, PHYSICAL_REV2 section 6, EvidenceIssuer.schema.json | Implementers or test generators following the originals rebuild REVW-12: an instructor can mint the top rung for themselves. ADR-T14a is not in the ADR register | Pointer or banner on BR-T011, DT-06, ADR-T14, SPEC-G3; register ADR-T14a as Proposed; make the self-sign-off negative control a Phase 1 exit test | Trust PM, ARB |
| REVW2-04 | High | 05_*/SPEC_G3 L76 and L122 (assessment answers "cached locally and replayed"), L209, L256, AC-08-03-03 (L286); 06_*/STATE_MACHINES.md L332 ("offline autosave replays idempotently"); versus OFF-01 section 7 ("never persisted") and OFFLINE_REV2 section 3, UX_REVIEW_FIXES section 2.1 (withdrawn). OFFLINE_REV2 section 9 lists the owner edits as still open | A build from SPEC-G3 stores exam answers in IndexedDB on possibly shared devices and replays them after deadline pressure, the opposite of the REV2 contract; REV2 test TEST-PWA-015 (storage scan) would fail against it | Owner edits or pointer on SPEC-G3, SM-ATTEMPT, SM-ENROLMENT recovery rows; block WP-ASSESS-ENGINE entry on it | Assessment owner |
| REVW2-05 | High | KNOWLEDGE_PRESERVATION_MANIFEST.md L9 and L27 (204 rows: 174 partial, 28 out of scope, 1 full, 1 historical), L79 (DOC-000192 to 000204 "in the CSV"); SOURCE_DOCUMENT_INVENTORY.md ("204 source records"); `KNOWLEDGE_PRESERVATION_MANIFEST.csv`: 132 data rows, ids DOC-000001 to DOC-000132 (123 partially processed, 9 out of scope), identical at git HEAD | The V9 source inventory that feeds the cleanup gate is short by 72 records (35 percent) and its status counts do not reproduce. "0 eligible for cleanup" stays safe but is unverifiable for the missing records | Rebuild the CSV from the 204-source list or correct the narrative to 132; add a row-count self-check to the control documents | Documentation Architect |
| REVW2-06 | High | PHYSICAL_DESIGN_REV2.md section 2 (`idempotency_short`, `idempotency_queued`: `PARTITION BY RANGE (expires_at)`, columns from the template); template PK `(principal_id, idem_key)` per CONCEPTUAL_AND_LOGICAL_MODEL.md DATA-E2403 (L3174 to L3190) and PHYSICAL_DESIGN.md L85, L223; BACKEND_REV2 section 4 ("a concurrent duplicate blocks on the unique index until the first commits"). API_CATALOG_ADDENDUM section 6: "no PostgreSQL instance was available" | PostgreSQL requires a primary key or unique constraint on a partitioned table to include the partition column, so `(principal_id, key)` cannot be declared unique across partitions. The dedupe and replay guarantee that BR-T114 and REVW-14 rely on is not enforceable as written (two inserts with different `expires_at` both succeed). Inherited from the original and now load-bearing | Verify on a scratch PostgreSQL before WP-DB-BASE; redesign (single table with batched delete, or include `expires_at` and enforce dedupe by a separate unpartitioned key table); add a concurrent-duplicate test | Data Architect |
| REVW2-07 | High | REVIEW_RESOLUTION_DECISIONS.md L3 ("recommendations ... not decisions by the board or product owner ... must not be described as approved"). Described as binding in: MASTER_INDEX_V9_ADDENDUM L13; EXECUTION_LEDGER_V9_ADDENDUM L11; ROADMAP_REV2 R1 and section 7; CAPABILITY_MAP_PHASE_RECONCILIATION_REV2 (3 places); MARKETPLACE_MONEY_FLOW section 1 title; COST_MODEL L7; COMMERCIAL_OPERATIONS L5; FEDERATION_ARCHITECTURE L8 | Governance status is overstated: ARB ratification is not recorded anywhere, yet 8 remotes, bundled default, Phase 1 scope and first-party-only commerce are written as settled | Replace "binding" with "proposed (REV-RES)" through addenda; record ratification in ADR_REGISTER only on an ARB decision | Documentation Architect, ARB |

### 3.2 Medium

| ID | Sev | Evidence (check here) | Consequence | Recommendation | Owner |
|---|---|---|---|---|---|
| REVW2-08 | Medium | PROTECTED_DOCUMENT_TREE_BASELINE.csv: 113 rows, columns `Path`, `Bytes` only. Script: all 105 non-`.omc` paths exist (0 missing), but 33 of them differ in size (34 counting one `.omc` row) and 84 current non-`.omc` files are absent from it; EXECUTION_LEDGER_V9_ADDENDUM L9 and SOURCE_DOCUMENT_INVENTORY (hash exists only for SSOT.md) | Proves existence, not content. Cannot separate disclosed from undisclosed edits. Eight volatile `.omc` rows pollute it | Regenerate with SHA-256 per file at a tagged commit; exclude tool state; keep the old baseline as history | Documentation Architect |
| REVW2-09 | Medium | `git show --numstat 4451fc63`: 48 pre-existing files modified, 37 with deletions (315 lines): ROADMAP.md -79/+125, FEDERATION_ARCHITECTURE.md -41/+79, 05_*/README.md -29/+29, TEST_CATALOG.md -23/+48, CAPABILITY_MAP -20/+22, SYSTEM_DIAGRAMS -11/+11, PROJECT_MASTER -10/+10. EXECUTION_LEDGER_V9_ADDENDUM L6 names only consent catalogue, SM vocabulary, cookie contract, audit/erasure, permission rows, ledger append, status lines. Per-file disclosures exist only inside REV2 headers (FEDERATION_REVIEW_FIXES section 0, SECURITY_REV2, BACKEND_REV2, TEST_CATALOG_REV2, COST_ENVELOPE, MARKETPLACE) | V9 disclosure is piecemeal; the roadmap rewrite appears only as "the concurrent revision" (ROADMAP_REV2 section 1) | Add a disclosure table generated from `git diff` (new file). Git history is the complete record, so keep it intact | Documentation Architect |
| REVW2-10 | Medium | `git status`: 39 untracked files in the folder (every REV2 and V9 addition) plus this report; `.omc/state/*` is tracked inside the folder (8 baseline rows) and 2 of those are modified now; REVW-40 still open | The entire REV2 layer has no history and is lost by a clean or a checkout; tool state sits in the deliverable | With user authorisation, commit the REV2 files only and untrack `.omc`; until then treat the folder as unprotected. This review makes no commit | User, Documentation Architect |
| REVW2-11 | Medium | REVIEW_FIX_STATUS covers REVW-01..45, FINAL_REVIEW_REPORT has REVW-46; MASTER_INDEX_V9_ADDENDUM and INFORMATION_RECONCILIATION_MATRIX say "45 findings", PROJECT_MASTER and READINESS say 46. FIX_STATUS L3 says the report is unchanged (false, v1.5). Row 19 still "open" though BACKEND_REV2 resolved it; row 17 says 168 "not reproduced" while PCAP-01-R2 says 158 reproduces. FINAL_REVIEW_REPORT headline (6 closed, 6 partial, 34 open) and FIX_STATUS ("Addressed") describe the same findings in different vocabularies | Three trackers disagree; none is canonical | One tracker with one vocabulary and an "as of" commit; include REVW-46 | Documentation Architect |
| REVW2-12 | Medium | PCAP-01-R2 section 5 ("158 of 253" features without AC, "this script finds 158"; 24 P0 Phase 0/1 blockers) versus COVERAGE_MATRICES L331 ("168 ... P0: 36") and section 5.1. Script reproduces 168 using long-form SPEC_G ACs only, 137 after the 95 REV2 ACs, and shows 8 P0 features still without AC after REV2 (FEAT-02-02, 04-04, 15-02, 20-02, 24-06 in Phase 1; 19-01 in Phase 2; 10-17, 20-07 removed). The five Phase 1 ones appear in COVERAGE section 5.1 (02-02, 04-04, 24-06 as BLOCKER; 15-02, 20-02 as partial) but not in PCAP section 5 nor in SPEC_ACCEPTANCE_ADDITIONS_REV2 | Two definitions of "has an AC" (micro-feature ACs counted or not), two opposite blocker lists; the Ready gate depends on which is canonical | Fix one definition in COVERAGE_MATRICES method, regenerate both, and write ACs for the five unassigned Phase 1 P0 features | QA Architect, Product Director |
| REVW2-13 | Medium | Problem-code spelling: `reapply_cooldown` is the live name in BR_REV2, DT_REV2, SM_REV2 and SPEC_ACCEPTANCE_ADDITIONS_REV2, while BACKEND_REV2 section 3.4 renames it to `reapply-cooldown-active` (also used in openapi.addendum.yaml) without those four files being updated; `invalid_transition` in SM-00 U2, SPEC_G2, SPEC_G4, API_CATALOG_ADDENDUM versus `state-transition-invalid` in OpenAPI; `already_applied`, `org_verification_required`, `self_signoff` underscore forms against API-STD kebab-case | Tests and clients written from rules and from the contract disagree on the error identity | One problem-type table in API-STD; REV2 rule files cite it | Backend Architect |
| REVW2-14 | Medium | SM_REV2 section 2.7 and 2.8 (email 12 attempts at 5 s base, 15 min cap, "[OPEN]" 66 min) versus BACKEND_REV2 section 3.2 (email and webhook 60 s base, 6 h cap, about 20.5 h). BACKEND_REV2 section 3.3 says the span is shorter than the 72 h delivery TTL, but CONST-S08 (code TTL 15 min) and CONST-S09 (reset 30 min) make a 20 h retry window meaningless for security mail | Two retry specifications again; time-limited emails keep retrying after the secret expired | Set per-class delivery TTL (security mail minutes, not 72 h); update SM-00-R2 t4 and t7 | Backend Architect |
| REVW2-15 | Medium | SLO_REV2 section 1 (web-vitals field samples and RUM are consent-gated product analytics; operational telemetry basis "strictly necessary") versus SECURITY_REV2 section 4 and PRIVACY L44 PUR-24 (client error and timing beacons are operational, legitimate interest, no consent). Both pending counsel (OPEN-08) | Whether browser timing beacons need consent is decided differently by two files; implementing either contradicts the other and may carry legal exposure | Put the beacon allowlist and its legal basis in one file; SLO_REV2 cites it | Privacy Lead, SRE Lead |
| REVW2-16 | Medium | FEDERATION_REVIEW_FIXES section 2.4 and FRONTEND_DELIVERY_REVIEW_FIXES section 2: edge learns `admin.console` from "the signed session token and a capability claim" or the "self-issued HMAC token of ADR-T06". SECURITY_ARCHITECTURE L41 and L74: access token is an EdDSA JWS whose claims are `sub, sid, amr, iat, exp, grants_version, recent_auth_at` (no roles or capabilities); ADR_REGISTER ADR-T06 (L13) does not say HMAC | Option (a) assumes a claim the token does not carry; the stated premise (HMAC) is not the target design. R2b and FI-31 depend on FD-14, which REV-RES said must be designed and tested before it counts as a control | Decide the capability source against SEC-02; until then do not describe FD-14 as a control | Security Architect |
| REVW2-17 | Medium | SM-00 SM-JOB t7 (STATE_MACHINES.md L423: `published <-> paused`, actor recruiter, guard "-"); BR-T123 and SM_REV2 section 3.2 v5 pause jobs with reason `org_unverified` and "refuse new publishes beyond 1 (DT-12 row 2)"; DT-12 gates draft-to-published only; INV-T30 (PRODUCT_INVARIANT_REGISTRY L49) | A recruiter of an un-verified organisation can resume every paused job, so an unverified org holds more than one live job | Add org-verification and slot guards to t7 resume, or forbid resume while reason is `org_unverified` | Domain Architect |
| REVW2-18 | Medium | ROADMAP_REV2 R3 and section 5 gate ("Staff and org-owner TOTP enforced"); PCAP-01-R2 section 3 (FEAT-01-07 to Phase 1, "mandatory TOTP for staff and org owners"); BR-T044 and CONST-S05 cover privileged platform roles only; COVERAGE_MATRICES FEAT-01-07: 0 ACs | A gate condition has no rule or acceptance criterion behind it | Add a BR and ACs (or drop org owners from the gate) | Product Director |
| REVW2-19 | Medium | API_CATALOG_ADDENDUM.md L115 (API-11-05 `GET /orgs/{orgId}/jobs/{jobId}/shortlist`, `Y (addendum)`), policy action `matching.shortlist.read`, schema `ShortlistPage`; SCREEN_REGISTRY SCR-HIR-08 `/hiring/shortlists` and NAVIGATION_ARCHITECTURE L79, L231. BR-T072, INV-T52 and AC-11-10-02 ("text and route lint" fails on any route named "shortlist") | The REV2 contract violates the REV2 rule it implements | Rename the advisory view route, action and schema, or narrow AC-11-10-02 to the advisory view | Matching PM, Backend Architect |
| REVW2-20 | Medium | `actor.kind = human` still in STATE_MACHINES.md L16 (U6), PRODUCT_INVARIANT_REGISTRY L50 (INV-T31), TEST_CATALOG L289 (TEST-HIR-014) and STATE_MACHINES_REV2.md L136, while EventEnvelope `kind` has no `human` value and BACKEND_REV2 section 8 defines `human` as a separate boolean | The original REVW-44 inconsistency is reintroduced in a new file; tests derived from TEST-HIR-014 cannot be written against the envelope | Reword U6, INV-T31, TEST-HIR-014 and SM_REV2 to "envelope human = true and kind in user or support" | Backend Architecture Team |
| REVW2-21 | Medium | openapi.yaml `Dispute.state` = open, under_review, upheld, dismissed (no `x-state-machine`); SM_REV2 section 3.5 and PHYSICAL_REV2 section 7 add `withdrawn`; the addendum does not override `Dispute`. Same gap pattern for WorkClaim, DataExport, FileObject (no machine mapping) | Enum-vs-SM lint FF-11 fails the moment the REV2 machines are accepted | Add the mapping and `withdrawn` to the contract, or list the schemas in the addendum | Backend Architect |
| REVW2-22 | Medium | BACKEND_REV2 section 4 and PHYSICAL_REV2 section 2: response bodies up to 8 KB stored for 24 h to 15 days (partition drop after 15 d) in `idempotency_*`; DATA_GOVERNANCE_AND_LIFECYCLE.md L58 (DATA-036) classes `idempotency_key` as C1 "no personal free text by design" with 24 h to 7 d retention; UC-10 erasure and INV-T38 do not list the idempotency tables | Stored responses to profile or application calls hold personal data for up to 15 days beyond erasure; the data inventory misclassifies it | Reclassify DATA-036, add the tables to the erasure sweep, or store only a hash and status | Privacy Lead, Data Architect |
| REVW2-23 | Medium | BACKEND_REV2 section 6 ("never a replica"); PHYSICAL_REV2 section 4 (consent predicate joins `pv_consent_current` on the primary in the same SQL statement as every candidate search or match query); COST_ENVELOPE E04 (read replicas conditional); no capacity re-derivation in SLO_REV2 section 6 or OPS-CAP | All candidate search load lands on the primary, undermining the replica scaling path that COST_ENVELOPE E04 and the OPS-CAP replica trigger presuppose | Measure under WP-LOADBASE; document the replica consequence; consider a consent-epoch check that tolerates replica reads only with a read-your-writes fence | Backend Architect, SRE Lead |
| REVW2-24 | Medium | COST_ENVELOPE section 0 and COST_MODEL L7 ("Phase 0 exit blocker"; 19 Ph1-active rows need dated quotes); ROADMAP.md section 7, row "Ph0 to Ph1" (spike decisions and lint only; no cost item); ROADMAP_REV2 section 5 gate additions (no cost item; 0 mentions of COST_ENVELOPE) | The binding review requirement (REVW-16) is not enforceable through the roadmap gate | Add the envelope to the Ph0 to Ph1 gate through the roadmap overlay | Program Director, Finance Lead |
| REVW2-25 | Medium | openapi.addendum.yaml: 30 `$ref` targets exist only in openapi.yaml, no `securitySchemes`; `info.description` says it validates only after merge; the merge script is "kept outside the repository" (API_CATALOG_ADDENDUM section 6); base operations carry no `x-idempotency` (25 unsafe without the parameter, classified only in APIC-02 section 3.4 prose) | There is no single contract file for FF-06 (oasdiff) or for client generation, and the route lint cannot pass on openapi.yaml | Commit the merge tool or publish a merged file; add `x-idempotency` to the 25 base operations | Backend Architect |
| REVW2-26 | Medium | CAPABILITY_MAP rows FEAT-10-17 ("Automatic reject on score", Remove, P0, phase "-") and FEAT-20-07 ("Impersonation", Remove, P0, "-"); COVERAGE_MATRICES section 5.1 lists both as "BLOCKER (no AC, no test)" and counts them in "P0: 36" | Headline inflated by 2; deliberate non-features need prohibition tests (INV-T09), not feature ACs | Exclude Remove rows from the blocker count; add negative-control tests | QA Architect |
| REVW2-27 | Medium | FRONTEND_ARCHITECTURE.md L161: "standalone-mode behaviour device-tested (PLT-01)"; PLATFORM_COMPATIBILITY_MATRIX L10 ("V(dev) ... None exist yet"), L32 (passkeys standalone "U ... must be device-tested") | Unsupported past-tense claim of device verification | Reword to "must be device-tested" via the REV2 pointer mechanism | Frontend Architect |
| REVW2-28 | Medium | 99_*/IMPLEMENTATION_READINESS.md area table says "Under Review" for 02/04 to 06 ("Strategy, roles, domains"; "Features & rules"), 07, 08, 11 to 13 and 14, while DOCUMENT_STATUS.md says Revision Required for each; FINAL_DOMAIN_COVERAGE.md "Full specs" for DOM-01 to 11 although DOM-02 and DOM-04 have no long-form spec (COVERAGE section 5: FEAT-02-01/02 and 04-01/02/04 have 0 ACs); "26 features lack ACs" in READINESS and FINAL_DOMAIN_COVERAGE (168 by script) | The summary documents read as more mature than the registers they cite | Align to DOCUMENT_STATUS; correct depth wording | Documentation Architect |
| REVW2-29 | Medium | Section 6 (stale blueprint headlines) and 99_*/FINAL_ARCHITECTURE_SUMMARY.md ("FF-01 to FF-10 and 214 test cases"; FF are 12 and unique test ids 236) | Counts a reader quotes are wrong | See section 6 | Documentation Architect |
| REVW2-30 | Medium | REVIEW_RESOLUTION_DECISIONS REVW-10 (Phase 1 loop Prove, Showcase, Apply; learning depth to Phase 2) versus ROADMAP_REV2 section 7 and PCAP-01-R2 section 8 (first-party learning and practice stay in Phase 1; 85 Phase 1 features) versus COST_ENVELOPE L15 (Phase 1 proves Prove, Showcase, Apply) | The Phase 1 scope has three descriptions; OPEN-42 records the choice but no one owns the date | Decide OPEN-42 before cost quotes and WP sizing | Program Director, ARB |

### 3.3 Low

| ID | Sev | Evidence (check here) | Consequence | Recommendation | Owner |
|---|---|---|---|---|---|
| REVW2-31 | Low | Doc ID `APIC-02` used by both `13_*/API_CATALOG_ADDENDUM.md` and `13_*/SSOT_SERVICE_CONTRACT_CROSSWALK.md` (L3); REV2 files use `-R2` (15) and `-REV2` (6) suffixes | Citations of APIC-02 are ambiguous | Rename the crosswalk id; fix one suffix convention | Documentation Architect |
| REVW2-32 | Low | ADR-T03a (GOVERNANCE_REGISTRATIONS_REV2 row 1, TEST_CATALOG L13 and L151, COVERAGE_MATRICES, SLO_REV2 section 5) and ADR-T23 (ADR_REGISTER L30) are the same decision under two ids; ADR-T10a, T14a, T24 and T03a are cited but absent from ADR_REGISTER; ADR-T25 is proposed for the marketplace (GOVERNANCE row 7) and floated for FD-14 (FEDERATION_REVIEW_FIXES section 7) | Dangling and colliding ids | One id per decision; register all as Proposed | ARB secretary |
| REVW2-33 | Low | ID_REGISTRY (L53: 15 ROLE ids incl. ROLE-ANON) has no MOD-INS, SCR-INS, ORGOWN/VIEW/PROCT roles, RISK-51..56, BR-T118..127, INV-T46..52, OPEN-B57..59, new DATA ids; all are already used by REV2 files and 7 rows of API_CATALOG_ADDENDUM. Disclosed in GOVERNANCE_REGISTRATIONS_REV2 section 4 | Registry-driven lints cannot resolve ids that the contracts already use | Register as Proposed in a new registry addendum | Documentation Architect |
| REVW2-34 | Low | BACKEND_REV2 L160 retires "INV-T25's cache TTL <= 60 s"; INV-T25 (PRODUCT_INVARIANT_REGISTRY L44) is the rung-freshness invariant, not a consent invariant, and keeps the text | The retirement is a no-op; REVW-25 originally mis-cited the id | Correct the citation | Backend Architect |
| REVW2-35 | Low | PRODUCT_INVARIANT_REGISTRY L57 (INV-T38: "Opaque subject_ref tokens ... are not personal data once the identity mapping is deleted") versus PHYSICAL_DESIGN L106 to L120 ("whether skeletons count as anonymous data ... [OPEN-08]") | A legal conclusion is stated as an invariant while counsel review is open | Reword to "treated as non-identifying for the sweep pending OPEN-08" | Privacy Lead |
| REVW2-36 | Low | FEDERATION_REVIEW_FIXES section 4: example registry signed with a key whose seed is SHA-256 of a public string (`ts-registry-2026-a`); I reproduced the public key and all 8 signatures | A copied example config is forgeable by anyone | CI denylist for `ts-registry-2026-a` outside dev; keep the "not a trust anchor" label in the schema description | Frontend Platform Lead |
| REVW2-37 | Low | Merged OpenAPI: `POST /notifications/{notificationId}/read-markers` versus `POST /notifications/unsubscribe/{token}` match the same request; API_CATALOG_ADDENDUM section 6 reports it as a Redocly warning and proposes `/unsubscribe/{token}`; not applied | Router ambiguity on a security-relevant route | Apply the proposed move in the next contract revision | Backend Architect |
| REVW2-38 | Low | "BFF" remains in openapi.yaml L19 and openapi.addendum.yaml L20 (`Same-origin REST/BFF base path`) and SYSTEM_DIAGRAMS L44 to L52 as a separate box; FRONTEND_ARCHITECTURE L18 ("federated by @module-federation/vite"); SCREEN_REGISTRY L1 ("seven remotes"); DEPENDENCY_AND_OWNERSHIP_MAP L121 ("all 7 remotes"); FEDERATION_ARCHITECTURE L6 ("FD-09 is superseded by ADR-T23") versus L8, L28 and section 1.1 (FD-09 kept) | Residual wording contradicts the REV2 decisions | Cover through the supersession map | Frontend Platform Architect |
| REVW2-39 | Low | INV-T46 and BR-T118 say "DB NOT NULL + CHECK" for `issuer_class`; PHYSICAL_REV2 section 6 declares the column `NULL` with a CHECK only when `rung = 'authority_verified'` | Spec and DDL differ | Align one way | Data Architect |
| REVW2-40 | Low | PHYSICAL_REV2 L192 "1 to 3 fixed rows" per request; table: UC-01 and UC-04a each have idempotency, rate-limit, audit and outbox rows (4 fixed) | Summary understates the budget | Reword | Data Architect |
| REVW2-41 | Low | UX_REVIEW_FIXES section 1 (SCR-INS-01 roles include proctor) and FEDERATION_REVIEW_FIXES section 3.1 (permission `institution.workspace` for proctor) versus PERMISSION_MATRIX_REV2 section 4 (proctor Phase 4, every cell denied) | A role listed for a screen that policy denies | Remove proctor from Phase 1 to 3 screen and permission lists | Product Design |
| REVW2-42 | Low | SLO_REV2 section 4 names the first-visit budget `B_first` and says B9 applies to non-LCP routes and SLO-17 to LCP routes only; FRONTEND_REV2 section 4.3 names it B10a and says B9 and SLO-17 nest | Same budget, two names and two relationships | One owner for the table; SLO_REV2 cites it | Performance Engineer |
| REVW2-43 | Low | SECURITY_ARCHITECTURE L44 ends "[pending: the product agent creates the constants table; until it exists no value is authoritative]" and points at BUSINESS_RULES_REGISTRY.md (the table is CONST-S01..15 in BR_REV2, still Proposed); PWA_ARCHITECTURE L197 "[OPEN-FE-08]"; ACTION_REGISTRY step-up 15 min | A stale placeholder says no session value is authoritative | Pointer or banner via section 4 | Security Architect |
| REVW2-44 | Low | REV2 files say counts are to be "regenerated by script after acceptance" (BR_REV2 section 4, RISK_REV2 section 3, FIX_STATUS row 36) but the generators are "kept outside the repository" (ACTION_TO_OPERATION_MAP header, TEST_CATALOG_REV2 section 3, COVERAGE_MATRICES section 9 reference); no committed generator exists | Headline counts rot again after the next edit | Commit one count script (or a CI check) | Documentation Architect |

## 4. Originals without a prominent supersession pointer

Method: for each of the 56 original files named below (rows group them), the text was searched for any REV2 or addendum file name or the strings `REV2`, `ADDENDUM`, `REVIEW_FIXES`. **None contains one** (0 of 56). The last column states what a reader following only the original gets wrong.

| Original (section) | Superseding file | What the original still says |
|---|---|---|
| README.md; MASTER_INDEX.md; DOCUMENT_STATUS.md | MASTER_INDEX_V9_ADDENDUM(_2) | No REV2 layer exists; review "in progress" |
| 01_*/PRODUCT_VISION_AND_BUSINESS_MODEL.md section 3 | PRODUCT_VISION_GOALS_REV2 | GOAL-03 "adverse-impact audit passes quarterly", GOAL-06 "zero incidents / audit pass" |
| 02_*/STAKEHOLDERS_ROLES_PERMISSIONS.md sections 3 to 4 | PERMISSION_MATRIX_REV2 | 11 columns; HM `RU(O)` on all org postings; no org_owner, viewer, proctor |
| 04_*/CAPABILITY_MAP.. phase column, section 3 counts, section 4 spine | CAPABILITY_MAP_PHASE_RECONCILIATION_REV2 | 82/87/42/32 phases; messaging and entitlement in Phase 2; DOM-14 Phase 3 |
| 05_*/SPEC_G1 to G5 (ACs), SPEC_G3 offline text, MICRO_FEATURE_SPECS | SPEC_ACCEPTANCE_ADDITIONS_REV2; OFFLINE_REV2 | 359 ACs; 24 P0 features without AC; offline answer replay |
| 06_*/BUSINESS_RULES_REGISTRY.md BR-T001, T004, T011, T017, T022, T050, T056, T057, T062, T072, T090, T114 | BUSINESS_RULES_REGISTRY_REV2 | No candidate re-apply; instructor sign-off is authority; any employer-domain mailbox is artifact-backed; 24 h idempotency; "shortlist" |
| 06_*/PRODUCT_INVARIANT_REGISTRY.md | PRODUCT_INVARIANT_REGISTRY_REV2 | 45 invariants |
| 06_*/DECISION_TABLES.md DT-05, DT-06, DT-12 | DECISION_TABLES_REV2 | no reapply row; DT-06 row 1 instructor as authority; 12 tables |
| 06_*/STATE_MACHINES.md SM-ACCOUNT t3, t7; SM-EVIDENCE; SM-VERIFICATION; SM-REFERENCE; SM-APPLICATION; SM-DSR; SM-NOTIFY; SM-BGJOB; "Not covered" paragraph | STATE_MACHINES_REV2 | 6 attempts, 30 s backoff, 1 h cap; two retry layers; withdrawn terminal; 15 machines |
| 07_*/ACTION_REGISTRY, SCREEN_REGISTRY, NAVIGATION, SCREEN_SPECIFICATIONS_KEY, PROGRESSIVE_UX | UX_REVIEW_FIXES; ACTION_TO_OPERATION_MAP | placeholder API names; SCR-ADM-17..22; 30-day queue expiry; offline answer buffer; "seven remotes" |
| 08_*/OFFLINE_AND_SYNC_DESIGN, PWA_ARCHITECTURE section 10, MOBILE_DISTRIBUTION | OFFLINE_REV2; PWA_MOBILE_REVIEW_FIXES | four queued classes in Phase 1; OPEN-FE-08; "BFF cookies" heading |
| 09_*/FEDERATION_ARCHITECTURE (partly edited in place), HOST_CONTRACT, DEPENDENCY_AND_OWNERSHIP_MAP, FAULT_ISOLATION_MATRIX, VERSION_COMPATIBILITY_DESIGN, REMOTE_*.json | FEDERATION_REVIEW_FIXES; `*_REV2.json` | 7 remotes; `idempotencyKey: 'auto'`; MOD-ADM serves institutions |
| 10_*/FRONTEND_ARCHITECTURE.md sections 2, 3, 7, 14, 15, 16 | FRONTEND_ARCHITECTURE_REV2 | federated by default; B10 120 KB; 'auto' idempotency; SEO 2/5 |
| 11_*/BACKEND_ARCHITECTURE.md sections 3, 6, 7.3, 8, 10, 16, 22 | BACKEND_ARCHITECTURE_REV2 | job per subscriber; 24 h idempotency; UNLOGGED `rate_limit_bucket`; 17-node graph |
| 12_*/PHYSICAL_DESIGN.md sections 7, 17; DB-01 E2403, E2408 | PHYSICAL_DESIGN_REV2 | single idempotency table; write budget "TBD"; OPEN-B20 open |
| 13_*/API_CATALOG.md (DOM-14 rows API-14-01..03, API-18-01..06 consumer MOD-ADM, API-11-05), openapi.yaml | API_CATALOG_ADDENDUM; openapi.addendum.yaml | `/network` in launch catalog; institution consumer MOD-ADM; 109 operations |
| 14_*/SECURITY_ARCHITECTURE.md section 2.3 | SECURITY_REV2 | "constants table pending" |
| 15_*/SLO_AND_PERFORMANCE_TARGETS.md SLO-03, SLO-13..17 | SLO_REV2 | RUM-based client SLIs; per-remote availability |
| 16_*/TEST_CATALOG.md section 15 | TEST_CATALOG_REV2; COVERAGE_MATRICES | 214 tests; 26 features without AC |
| 17_*/DEPLOYMENT_ARCHITECTURE, DEVOPS_AND_RELEASE_STRATEGY, OBSERVABILITY_DESIGN | FRONTEND_DELIVERY_REVIEW_FIXES | `mf.*` metrics without bundled equivalents |
| 19_*/COMMERCIAL_OPERATIONS.md; 21_*/COST_MODEL.md | MARKETPLACE_MONEY_FLOW; COST_ENVELOPE | duplicates (in-place sections 13A and 11) |
| 22_*/ROADMAP.md sections 5, 7 | ROADMAP_REV2 | no WP-MESSAGING-BASIC; fairness audit Phase 3; 60 WPs |
| 24_*/RISK_REGISTER.md RISK-32; ADR_REGISTER; OPEN_DECISIONS | RISK_REGISTER_REV2; GOVERNANCE_REGISTRATIONS_REV2 | 50 risks; no ADR-T24/T10a/T14a |
| 28_*/AC_TEST_TRACEABILITY_MATRIX, TRACEABILITY_AND_VALIDATION | COVERAGE_MATRICES | 125 of 389; 210 tests |
| 99_*/PROJECT_MASTER_BLUEPRINT, FINAL_ARCHITECTURE_SUMMARY, IMPLEMENTATION_READINESS, FINAL_DOMAIN_COVERAGE | all of the above | section 6 |

Highest-risk silent contradictions (a reader implements the wrong thing): REVW2-03 (instructor rung), REVW2-04 (answer replay), BR-T114/FF-07 (24 h versus 14 d keys), BR-T001/DB-02 OPEN-B20 (no re-apply), SM-00 BGJOB/SM-NOTIFY (retry parameters), ACTION_REGISTRY and PWA-01 session constants, and API_CATALOG DOM-14 launch rows.

## 5. V9 compliance check

| Check | Result | Evidence |
|---|---|---|
| `SSOT.md` untouched | PASS | exactly one `SSOT.md` (repo root); `git status -- SSOT.md` empty; last commit 20143509 (2026-10-21); SHA-256 equals the value recorded in KNOWLEDGE_PRESERVATION_MANIFEST.md L10 |
| Nothing deleted from the folder | PASS (weak evidence) | all 105 non-`.omc` baseline paths exist; no deleted file in `git status`; but the baseline holds sizes only (REVW2-08) |
| REV2 pass did not edit existing files | PASS | `git status`: no modified tracked document; 39 untracked additions; only `.omc` tool-state files are modified |
| Earlier in-place edits disclosed | PARTIAL | categories listed in EXECUTION_LEDGER_V9_ADDENDUM L6; 48 files and 315 deleted lines in commit 4451fc63; per-file disclosure only in REV2 headers (REVW2-09). Whether each edit preceded the V9 rule cannot be established from the folder |
| No file claimed written that does not exist | FAIL (one) | 373 relative links resolve; every REV2 file named in ADDENDUM_2 exists; but the manifest narrative claims DOC-000192..204 in a CSV that stops at 132 (REVW2-05). `EvidenceIssuer.schema.json` is not named in ADDENDUM_2 |
| New files linked from an index | PARTIAL | ADDENDUM_2 lists the REV2 files; ADDENDUM_2 itself and this report are unlinked; originals unlinked (REVW2-01) |
| Proposals not presented as decisions | FAIL | REVW2-07 |
| Model and effort claims honest | PASS with limits | PROJECT_SCOPE L9 and ledger addendum L13 both say "not independently verified". This report adds: its own effort setting was 30, not xhigh |
| Version control | RISK | REVW2-10 |
| Cleanup candidates | PASS | CLEANUP_CANDIDATES lists zero; consistent with no deletion |

## 6. Master blueprint staleness (99_FINAL_MASTER_BLUEPRINT/PROJECT_MASTER_BLUEPRINT.md and siblings)

A reader of the blueprint alone would be misled about the following (blueprint line, then what the REV2 set says):

1. Section 1 loop "Learn, Prove, Showcase, Match, Apply, Hire, Grow": the Phase 1 pilot loop is Prove, Showcase, Apply with explained search-based match (REV-RES REVW-10; PCAP-01-R2 section 8); whether Phase 1 also contains first-party learning is undecided (OPEN-42).
2. Section 2 "15 roles": 15 ROLE ids in ID_REGISTRY, but 17 matrix columns in PERMISSION_MATRIX_REV2 (adds ORGOWN, VIEW, PROCT; ANON column dropped; REFEREE, MENTOR, SVC now columns).
3. Section 4 "108 business rules, 45 invariants, 15 state machines, 12 decision tables": 118, 52, 24 and 14 if the REV2 files are accepted (BR-T118..127, INV-T46..52, nine new machines, DT-13/14). "125 of 389 ACs cited by tests": 126 by script (97 of 359 + 29 of 30). "14 indexed full feature specs (359 ACs)": 95 proposed ACs not counted.
4. Section 5 "130 screens": unchanged, but six institution screens gain SCR-INS aliases.
5. Section 6 Client row "iOS push only for installed apps": canonical marker required "(V(src), PLT-01; not device-verified)" (PWA_MOBILE_REVIEW_FIXES section 1); blueprint is listed there as still unmarked.
6. Section 6 Offline row "Read cache + few queued drafts": Phase 1 is read cache plus local unsent drafts with no outbox; assessment answers online-only (OFFLINE_REV2 sections 0, 3).
7. Section 6 Security row "BFF cookie sessions ... STRIDE threat model (32 abuse cases)": no `/bff` namespace (GLOSSARY L31); THREAT_MODEL now has 34 abuse-case rows (AC-33, AC-34 added).
8. Section 6 Frontend row: says bundled baseline (correct) but not the 8-remote split, FD-14, or ADR-T24 prerender.
9. Section 6 API row "109 operations in the contract file; 230 in the catalog": 226 operations across two contract files (109 + 117), 333 catalog rows.
10. Section 6 Backend row: no consumer modes, per-kind retry overrides, `auth_throttle`; Data row: no `subject_ref` erasure model mention in the table (only linked docs).
11. Section 7 "214 specified test cases": 236 unique test ids (22 REV2 tests already inside the catalog; plus 60 suite-level tests that are not individual tests). FINAL_ARCHITECTURE_SUMMARY also says "FF-01 to FF-10": 12 fitness functions.
12. Section 8 "60 work packages": 61 with ROADMAP_REV2 (adds WP-MESSAGING-BASIC; fairness audit moves to Phase 2).
13. Section 9 "50 risks": 56 with RISK_REGISTER_REV2.
14. Status line "6 closed, 6 partial, 34 open": a separate tracker (REVIEW_FIX_STATUS) shows most findings "Addressed in REV2"; neither says which REV2 files are accepted (none are).
15. Section 11 "Honest limits" does not mention the REV2 layer or the absence of any accepted overlay.
16. IMPLEMENTATION_READINESS and FINAL_DOMAIN_COVERAGE: "26 features lack ACs" (168 by script before REV2, 137 after), area statuses more optimistic than DOCUMENT_STATUS, "Full specs" for DOM-02 and DOM-04 (REVW2-28).

## 7. Per-folder status

Vocabulary: Discovery, Draft, Under Review, Revision Required, Ready for Implementation, Blocked, Deferred, Superseded. No folder is Ready for Implementation. **Superseded: none today**; every REV2 file states it supersedes "once accepted", and none has been accepted. On acceptance the partly superseded originals in section 4 become Superseded per section, not per file. Statuses below are this reviewer's judgement; they agree with DOCUMENT_STATUS except 25 (Draft here, Under Review there), 27 and 28 (Revision Required here, Draft there), and the nuance for 09.

| Folder | Status | Justification |
|---|---|---|
| 00_CONTROL_CENTRE | Revision Required | manifest CSV 132 versus 204; weak baseline; indexes omit addenda; ID_REGISTRY lacks REV2 ids (REVW2-01, 05, 08, 33) |
| 01_EXECUTIVE_AND_STRATEGY | Under Review | GOALS_REV2 fixes REVW-39 but folder owner has not confirmed; OPEN-05/06/07 |
| 02_STAKEHOLDERS_AND_USERS | Revision Required | matrix Critical fixed in original; REV2 columns unaccepted; personas hypothetical |
| 03_BUSINESS_DOMAINS | Under Review | DOM-14 phase text stale; no REV2 conflicts found |
| 04_PRODUCT_CAPABILITIES | Revision Required | phase column superseded by REV2; 158/168 conflict (REVW2-12); OPEN-41/42 |
| 05_FEATURE_SPECIFICATIONS | Revision Required | SPEC-G3 offline contradiction; 137 features still without AC; five Phase 1 P0 features unassigned |
| 06_BUSINESS_PROCESSES | Revision Required | comprehensive REV2 but two texts in force; error codes, job t7 loophole, `actor.kind` |
| 07_UI_UX_AND_DESIGN_SYSTEM | Revision Required | 59 actions only catalogued; 126 placeholder names unmapped; no org-verification action; shortlist route |
| 08_PWA_AND_MOBILE | Revision Required | decisions sound in REV2; device facts unverified (OPEN-12); originals contradict |
| 09_MODULE_FEDERATION | Deferred (option); FD-14 Revision Required | federation optional by proposal; FD-14 capability source open; DOCUMENT_STATUS also Deferred, FINAL_REVIEW says Blocked |
| 10_FRONTEND_ARCHITECTURE | Revision Required | bundled baseline and budgets re-derived; ADR-T24 and renderer spike open; stale federated wording |
| 11_BACKEND_ARCHITECTURE | Revision Required | strong REV2; retry and TTL conflict; consent-on-primary capacity |
| 12_DATA_AND_DATABASE | Revision Required | partition/PK defect; DDL never executed; DATA-036 misclassified |
| 13_API_EVENTS_AND_INTEGRATIONS | Revision Required | two contract files, no merge tool; Dispute enum; ambiguous path; shortlist; P0 operations catalogued but not defined |
| 14_SECURITY_PRIVACY_COMPLIANCE | Revision Required | telemetry basis conflict; FD-14 premise; counsel items OPEN-08/34 |
| 15_RELIABILITY_AND_PERFORMANCE | Draft | SLO_REV2 conflicts with FEA-01-REV2 naming; nothing calibrated (OPEN-15) |
| 16_QA_AND_TESTING | Draft | 97/359 ACs directly cited; 60 generated suite-level tests are placeholders; count sentence stale |
| 17_DEVOPS_AND_INFRASTRUCTURE | Blocked | hosting OPEN-14, OPEN-22, OPEN-36 |
| 18_OPERATIONS_AND_SUPPORT | Draft | not reviewed in depth; OPEN-16/39 |
| 19_BUSINESS_AND_COMMERCIAL_OPERATIONS | Draft | Phase 2 scope narrowed; marketplace ADR outline only (Deferred for third-party commerce) |
| 20_ANALYTICS_AND_MEASUREMENT | Revision Required | MET-013 not edited; telemetry classification unresolved |
| 21_COST_AND_FINOPS | Draft | envelope structure complete, every figure empty; gate unwired (REVW2-24) |
| 22_IMPLEMENTATION_ROADMAP | Revision Required | overlay not merged; OPEN-42; TOTP gate lacks rule; cost gate missing |
| 23_MIGRATION_AND_EVOLUTION | Blocked | OPEN-17 |
| 24_RISKS_AND_DECISIONS | Revision Required | proposals unregistered; ADR id collisions; no global OPEN register |
| 25_DIAGRAM_LIBRARY | Draft | not reviewed; Mermaid not rendered; BFF box stale |
| 26_RESEARCH_AND_REFERENCES | Draft | external facts unverified by this review |
| 27_INDEPENDENT_REVIEWS | Revision Required | three trackers disagree (REVW2-11); this report adds a fourth view |
| 28_TRACEABILITY_AND_COVERAGE | Revision Required | mechanical but two AC definitions in force (REVW2-12); generators not committed |
| 29_DEVELOPER_IMPLEMENTATION_GUIDE | Draft | depends on unresolved roadmap and contract decisions; not read |
| 99_FINAL_MASTER_BLUEPRINT | Revision Required | section 6 |

## 8. Top 10 recommended next actions

| Rank | Action | Closes |
|---|---|---|
| 1 | Make the REV2 layer reachable: new `START_HERE` and generated supersession map now; banners in README, MASTER_INDEX, DOCUMENT_STATUS and the section-4 originals only with explicit user authorisation | REVW2-01, 02, 03, 04, 38, 43 |
| 2 | Run the ARB and owner acceptance sweep over the REV2 set: accept, amend or reject each file; replace "binding" by "proposed" until then; register ADR-T10a, T14a, T23 (merge T03a), T24 and the FD-14 decision | REVW2-07, 16, 32 |
| 3 | Repair the V9 control records: rebuild or correct the preservation manifest (132 versus 204), regenerate the baseline with SHA-256 at a commit, add a per-file in-place-edit disclosure from git | REVW2-05, 08, 09 |
| 4 | Protect the work: with user authorisation, commit the REV2 files (not `.omc`); untrack tool state | REVW2-10 |
| 5 | Resolve REV2-versus-REV2 conflicts in one pass: AC definition (158/168) and blocker list, problem-type names, job retry and delivery TTL, telemetry classification, budget naming, `actor.kind`, proctor | REVW2-12, 13, 14, 15, 20, 41, 42 |
| 6 | Validate the data layer on a scratch PostgreSQL before WP-DB-BASE: idempotency partition keys, coalescing index, the new CHECKs, `sm_edge` generation and parity test; reclassify DATA-036 and extend the erasure sweep | REVW2-06, 22, 39 |
| 7 | Fix the unsafe-to-misread rules in the originals through the supersession mechanism: instructor rung, offline answer replay, 24 h idempotency, no re-apply; add the SM-JOB resume guard | REVW2-03, 04, 17 |
| 8 | Decide OPEN-42 (Phase 1 learning), add the missing rule and ACs for the TOTP gate and the five unassigned P0 features, and wire the cost envelope into the Phase 0 gate | REVW2-12, 18, 24, 30 |
| 9 | Make the contract single and lint-able: publish a merged OpenAPI or commit the merge tool; add `x-idempotency` to the 25 base operations; add `withdrawn` and mappings for Dispute and others; rename the shortlist route; fix the ambiguous notification paths | REVW2-19, 21, 25, 37 |
| 10 | Refresh the blueprint, readiness and domain-coverage summaries and the trackers (counts, loop, offline, roles, remotes, REVW-46) as new addendum files, and commit one count generator | REVW2-11, 28, 29, 44; section 6 |

## Appendix A. Counts: published versus reproduced

| Item | Published | Reproduced by script |
|---|---|---|
| Files in folder | 158 (ledger addendum, when written) | 197 before this report: 189 non-`.omc` (150 tracked + 39 untracked) + 8 tracked `.omc`; 190 non-`.omc` with this report |
| Long-form ACs / platform ACs / REV2 ACs | 359 / 30 / 95 | 359 / 30 / 95, no id collision, all AC references resolve |
| Business rules / REV2 additions | 108 / 10 | 108 (BR-T001..T117) / 10 (BR-T118..T127) |
| Invariants / fitness functions | 45 / 7 new / 12 | 45 (20 + 25) / 7 / 12 |
| State machines / REV2 additions | 15 / 9 | 15 / 9 |
| Decision tables / REV2 | 12 / DT-13, DT-14 | 12 / 2 new |
| Risks / REV2 | 50 / RISK-51..56 | 50 / 6 new (+ RISK-32 replaced) |
| Capabilities / features / micro-feature specs | 108 / 253 / 65 | 108 / 253 / 65 |
| Screens / actions / processes / journeys / runbooks | 130 / 231 / 38 / 20 / 37 | same |
| Events (AsyncAPI channels / messages / operations) | 74 / 74 / 128 | same |
| OpenAPI operations base / addendum / catalog rows | 109 / 117 / 230 plus 103 | 109 / 117 / 230 plus 103 = 333 |
| ACT map | 231: 153 / 59 / 15 / 3 / 1 | same |
| Unique TEST ids in TEST_CATALOG | 214 (section 15, blueprint); 236 (COVERAGE) | 236 (first-column ids, header excluded; includes the 22 REV2 tests). 60 further suite-level ids in TEST_CATALOG_REV2 |
| ACs directly cited by individual tests | 125 of 389 (status docs); 97 + 29 = 126 (COVERAGE) | 97 of 359 and 29 of 30 = 126 |
| Features without an AC | 158 (PCAP-01-R2); 168 (COVERAGE) | 168 (long-form ACs only); 137 after the 95 REV2 ACs; 8 P0 still without AC |
| Phase counts | 82/87/42/32/7/3 then 85/85/40/33/7/3 | same; Phase-1 spine 73 = all P0 in Phase 0 or 1 |
| Work packages | 60, then 61 | 60 unique rows in ROADMAP.md |
| Abuse cases | 32 (blueprint) | 34 rows in THREAT_MODEL |
| Roles | 15 (ID_REGISTRY) | 15 ROLE ids; 17 matrix columns in REV2 |
| Preservation manifest rows | 204 | 132 |
| Baseline rows | 113 | 113 (105 non-`.omc`) |
| Relative links / broken | 340 / 0 (FIX_STATUS), 159 / 0 (ledger) | 373 / 0 |

Git tracks 158 files in the folder (8 of them `.omc` tool state); 39 files were untracked before this report, which makes it the 40th.

## Appendix B. Method notes

Scripts read the folder in place and wrote nothing to it. Identifier extraction used the first cell of Markdown table rows; prose-only mentions were not counted as definitions. AC "directly cited" means the id appears in a non-first cell of an individual test row (suite-level `TEST-ACC-*` and `TEST-BRU-*` excluded), the convention of COVERAGE_MATRICES. "Features without AC" used the convention that an AC belongs to the FEAT whose number it carries; micro-feature ACs written as `AC-dd-ff.k-nn` in MICRO_FEATURE_SPECS were not counted, which explains the 158 versus 168 gap. Where a number could not be reproduced, the table says so; where it reproduced, it is not repeated as a finding.
