# Legacy Merge B-09: Module Boundary Rules from the Prior Attempt (No Federation Existed)

Doc ID: LGM-B-09 · Owner: Frontend/Platform Architecture · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: MFA-01, HC-01, DEP-01, FIM-01, ADR-T03, ADR-T19, ADR-T23, INV-T16, OPEN-03, OPEN-47 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/engineering/TARGET_ARCHITECTURE.md` (sections 4, 5, 5.1, 11-12) and `.../engineering/TRD.md` section 3. **Finding: none of the assigned legacy sources describes Module Federation.** The prior attempt was a single-bundle React app. The material below is the closest legacy content: module-boundary and import rules that the bundled-mode module contract (ADR-T23, `MF_MODE=bundled`) must satisfy regardless of whether federation is ever activated.

## 1. Rules (legacy wording kept; full context in `../11_BACKEND_ARCHITECTURE/LEGACY_MERGE_ARCHITECTURE_RULES_AND_ADRS.md`)

- Feature -> own local components first; shared UI only after demonstrated reuse (TRD).
- Cross-feature imports go through a feature's public `index.ts` only (legacy ARCH-016); cross-context communication through events or application-service interfaces (ARCH-018); zero circular dependencies (ARCH-019).
- `shared/platform` stays intentionally small: no business domain moves into a generic shared kernel merely to avoid imports (legacy V6 correction).
- The earlier "Web OS" layer concept became a Career Workspace *feature boundary* (not a runtime layer).
- Intra-package rule: never import a package's own barrel; leaf `core` module imports nothing.

## 2. Target mapping and decisions

| Legacy rule | Target counterpart | Note |
|---|---|---|
| Public `index.ts` barrel per feature | Host contract (HC-01) in federated mode; typed module contract in bundled mode | Barrel rule is the bundled-mode equivalent of "remotes never import another remote's internals" (INV-T16) |
| Zero circular dependencies | Add to CI as a dependency-cruiser-style check (affected-only) | Legacy enforced only by review; see proposal in the 11 file section 2.1 |
| Small shared platform | DEP-01 ownership map "shared singletons" list | Verify the shared-singleton list stays minimal (React, router, query client, design-system, host SDK) |
| Chrome extension local-first (legacy SSOT ADR-006) | Not in target scope | Out of scope unless re-decided; record as a legacy-only decision |

**L-B09-01 (open, owner Frontend Platform Lead):** confirm the bundled-mode module contract forbids deep imports across modules by lint, using the legacy barrel rule as the acceptance wording.
