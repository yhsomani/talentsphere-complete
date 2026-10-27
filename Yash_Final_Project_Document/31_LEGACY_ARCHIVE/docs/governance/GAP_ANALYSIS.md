# TalentSphere — GAP_ANALYSIS.md v6.0

## Important reality

This register was written against the 2026-09-24 greenfield baseline. The repository now contains an implemented API, web shell, domain package and worker; current implementation status is recorded in [`docs/reports/FEATURE_STATUS_2026-10-21.md`](../reports/FEATURE_STATUS_2026-10-21.md). The gaps below are design and decision gaps; the verification gaps are still open.

## Resolved gaps

| Gap | Resolution |
|---|---|
| Direct table API vs domain API ambiguity | Browser uses application API for domain mutations |
| AI platform late in roadmap | Gateway/policy foundation moved to Phase 0 |
| Oversized shared kernel | Shared kernel narrowed to true cross-cutting primitives |
| 173 features treated as implementation target | Portfolio separated from GA scope |
| Consumer AI subscription assumption | Explicitly separated from API authorization |
| Free AI cost ambiguity | Hard cost policy |
| Assessment AI escape routes | Session-aware gateway enforcement |
| Candidate-level hiring prediction risk | Reframed as governed/descriptive intelligence |
| Hard-coded retention | Policy-driven |
| Low cohort threshold | Conservative configurable suppression |
| Hash commitment called ZK | Corrected terminology; stable VC 2.0 target |
| LinkedIn runtime dependency | Adapter-only |
| Realtime as correctness | Advisory only |
| Queue exactly-once confusion | Idempotent side effects |
| Production-ready documentation claims | Separate specification vs runtime readiness |

## Remaining decision-gated gaps

- legal review for interview recording;
- final licensed market-data providers;
- media provider selection;
- institution legal/controller-processor model;
- pricing validation;
- optional proctoring decision;
- AI provider support matrix;
- regional compliance mappings.

## Verification gaps

These cannot be closed by documentation:
- executable implementation;
- deployment;
- security penetration evidence;
- accessibility conformance evidence;
- performance under target load;
- backup/restore drill;
- incident-response drill;
- AI evaluation results;
- assessment anti-cheat validation.

## Gap closure rule

For each remaining gap:
```text
Owner
→ evidence required
→ decision
→ implementation impact
→ test
→ acceptance
→ closure date
```

## Documentation conflicts (open, 2026-10-21)

Found during the documentation consolidation. Each needs an owner decision; none was resolved by assumption.

| # | Conflict | Sources | Evidence | Owner decision needed |
|---|---|---|---|---|
| C-1 | `SSOT.md` status said GREENFIELD / 0% verified | `SSOT.md` lines 5, 4192, 5675; `FEATURE_REGISTRY.md` line 5 | Resolved 2026-10-21 as a C1 text change (`GOVERNANCE.md` §3): status lines now cite the code-checked cross-check. No intent changed. SSOT body still describes the target system | Founder: confirm the C1 change, or revert it |
| C-2 | Feature maturity counts | Current audit and evidence ledger at source `a771a87b` | 6 implemented-unverified, 87 partial, 1 broken/regressed, 75 provisionally not implemented, 4 deprecated/not recommended. No feature newly certified end-to-end verified. Earlier 16/78/75, 47 and 51 counts are superseded | Complete semantic acceptance and journey verification; do not use inventory coverage as release approval |
| C-3 | Test counts and scope | Current audit at source `a771a87b` | Executed: 1,172 Vitest assertions in 115 files, 5 migration-helper tests, ten non-emitting TypeScript project checks. Lint failed on seven files. Existing built workspace dependencies were reused. PostgreSQL and browser suites were not run | Fresh build, database and browser verification remain required; protected-file restrictions apply |
| C-4 | SQL migration count | Former index (41), README (46), `supabase/migrations/` | 51 `.sql` files on 2026-10-21 | None; README and index now use 51 |
| C-5 | Intended stack vs built stack | `SSOT.md`, `docs/engineering/TRD.md`, `docs/engineering/DATABASE.md` (Supabase Auth, TanStack Query, Edge Functions, Stripe, RLS) | Root `ARCHITECTURE.md` §20 and §24: HMAC sessions, plain React state, no provider SDKs | Whether the SSOT stack is still the target, or the built stack replaces it |
| C-6 | Registry status ownership | FEATURE_REGISTRY Authority section | Registry explicitly delegates implementation status to the current audit; it is an identity inventory | Resolved by existing separation; keep one status tracker |
| C-7 | Stray Obsidian vault | `TalentSphere/` (`Welcome.md` is the Obsidian template; `create a link.md` is empty) | Personal vault config under `TalentSphere/.obsidian/` | Delete the folder or keep it as the user's own notes |
| C-8 | Salary and small-cell privacy threshold | `SSOT.md` HDN-026 and the privacy sections say k ≥10 by default; `BUSINESS_RULE_REGISTRY.md` BR-178 says k ≥5 for salary cells and BR-158 says k ≥5 for aggregated career data; SSOT also uses k ≥3 (line ~1890) and k ≥5 (line ~597, ~1300) | Registry and SSOT disagree for salary data; SSOT is internally inconsistent | Owner and legal set one salary threshold and the default |
| C-9 | Rule reference formatting and semantic mismatch | Canonical registry BR-001..BR-248; SSOT feature prose | Leading zeroes differ, but matching numbers do not prove matching meaning: SSOT F-01 calls BR-001 auth-required and BR-002 role-separation, while registry BR-01 governs job-posting roles and BR-02 application roles. SSOT explicitly declares out-of-range IDs stale and non-authoritative | Reconcile each feature reference by canonical rule meaning. Do not create BR-249+ from historical prose or renumber code/tests as a formatting fix |
| C-10 | Stale duplicate copies (resolved) | Removed on 2026-10-21. Also removed from `WORKFLOWS_AND_BUSINESS_RULES.md`: a second copy of its journeys, workflows and state machines (no unique lines), a second copy of the business-rule corpus, and the journey register (identical to `JOURNEY_REGISTRY.md`). The business-rule text was identical to `BUSINESS_RULE_REGISTRY.md` for all 248 rules, and its eight MIG rules were moved there. Earlier duplicates, verbatim-older copies of SSOT: `WORKFLOWS_AND_BUSINESS_RULES.md` §11–§26 and Appendices A–D (said 31 journeys and 246 rules), `DATABASE.md` §15–§22 and §31–§32 (said k ≥5 for salary cells), `UI_UX_DESIGN_SYSTEM.md` Appendix D | Diffs showed replacements only, no unique text. The one unique sentence in DATABASE moved to §4 | None. J count is 28 in `JOURNEY_REGISTRY.md` and SSOT |
| C-11 | Protected file references a deleted index | `.prettierignore` still lists `FINAL_DOCUMENT_INDEX.md`. It is a protected build file under `AGENTS.md` ("Build files are read-only"), so it was not edited | Harmless; the entry matches nothing | Authorise a one-line removal |
| C-12 | Reticle instructions duplicated | `CLAUDE.md` and `AGENTS.md` carry the same managed Reticle block; `.claude/commands/reticle.md` repeats the "nothing connected" steps, and its step 1 contains a duplicated paragraph with a nested, misnumbered list | The managed block sits between `reticle:begin`/`reticle:end` markers and is rewritten by `reticle init`, so a local edit would be overwritten. Command file not edited: owner unclear | Choose whether Reticle moves the full text to `RETICLE.md` and leaves a pointer, or the duplication stays |
| C-13 | ADR numbering | Three lists disagree. `TARGET_ARCHITECTURE.md` §11 (21.3) says ADR-001 is "Supabase Auth sole session authority" and ADR-003 is "50 canonical tables"; root `ARCHITECTURE.md` §26 says ADR-001 is "modular monolith" and ADR-004 is HMAC tokens. `SSOT.md` uses ADR-001 to 013; root `ARCHITECTURE.md` §21.3 says "Locked at 13" and §26 uses ADR-001 to 011; ADR-015 supersedes "ADR-003 in ARCHITECTURE §26" | ADR-015 file header | Owner: adopt one ADR register |
| C-14 | ADR-015 not ratified | `docs/engineering/adr/ADR-015-core-loop-persistence.md` is "Accepted for this branch, pending owner ratification". Migration `00043` changes schema and drops `employment_references.token` | ADR-015 Escalation section; the root `ARCHITECTURE.md` header says it was revised on branch `improvement/core-loop-durability` | Owner ratifies ADR-015 and approves `00043` before any populated database is migrated |
| C-15 | Feature maturity overstatement | Current feature matrix | F-94 and F-26 are now partial. Resend exists, but live delivery is unverified; portfolio state remains process-local. Earlier implemented labels are historical | No decision needed for this factual correction; acceptance remains open |
| C-16 | Migration inventory | `supabase/migrations/` and audit evidence ledger | 51 migration files, with recorded hashes. Historical counts are dated snapshots; inventory is not migration execution proof | Verify populated migration and recovery before release |
| C-17 | Table count vs target model | `DATABASE.md` §3.1 lists 50 canonical tables; §3.2 says about 185 operational tables; the total is about 220 | Measured 2026-10-21: 111 distinct `CREATE TABLE` names across the migrations, and 130 `ENABLE ROW LEVEL SECURITY` statements (per-table coverage not checked here) | Owner: confirm §3 is the target and §3.2 is a plan, or record the migrated schema as the model. Banner added to §3 |
| C-18 | Routes in target docs but not built | `APP_FLOW.md` §1 lists about 30 routes that `apps/web/src/App.tsx` does not define (for example `/register`, `/courses`, `/recruiter/*`, `/feed`). `App.tsx` defines 30 `<Route>` entries, including layout, index and catch-all | Measured 2026-10-21 | Owner: keep these as planned routes, or drop them. Banner added to `APP_FLOW.md`; the root architecture doc's "9 leaf routes" is now counted directly from source |
| C-20 | Who owns the 173-feature register | `SSOT.md` §7 says it is the active feature identity and priority index. `docs/product/PRD.md` §11 says the canonical register lives in `FEATURE_REGISTRY.md`. The two inventories are identical except for heading numbers (checked 2026-10-21: 175 of 180 unique lines match, and the 5 others are headings). `FEATURE_STATUS_2026-10-21.md` uses the registry as its source | Measured on the two files | Owner: pick one register. Until then the registry's §9 detail was moved to SSOT, so SSOT is the only detail source |
| C-21 | Role count | `SSOT.md` §6.1 describes two tiers: three JWT roles (`ROLE_USER`, `ROLE_RECRUITER`, `ROLE_ADMIN`) and 24 contextual roles. The built `Role` union in `packages/domain/src/core.ts` has 10 values (candidate, recruiter, hiring_manager, course_author, instructor, institution_admin, platform_admin, moderator, verification_staff, service_account). `ARCHITECTURE.md` §12 says 10 | Measured 2026-10-21 | Owner: confirm whether the 24-role model is target. Measured role union is 10 |


## Source reconciliation, 2026-10-23

C-2/C-3 remain dated evidence, not freshly measured feature/test totals. C-4 now
has 54 migrations in source; the database reference owns the inventory. C-5's
?no provider SDKs? wording is historical: Stripe and the Resend adapter exist,
while Supabase Auth, TanStack Query and Edge Functions remain target differences.
The hosted manual adapter and migration 00054 exist; full live application and
isolation are unverified. Salary policy, rule-ID semantics and ADR authority
conflicts remain owner decisions. This audit changes documentation only and
preserves SSOT. See [coverage and disposition](../system-model/01-inventory-and-coverage.md).
