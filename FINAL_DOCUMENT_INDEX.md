# TalentSphere — Final Documentation Index v6.0

## Canonical master
- [`SSOT.md`](SSOT.md) — complete authoritative project/system definition.

## Documentation Index
- [`docs/INDEX.md`](docs/INDEX.md) — comprehensive map of all specifications located under `docs/`.

## Product
- [`docs/product/PRD.md`](docs/product/PRD.md)
- [`BRAIN/BRAIN.md`](BRAIN/BRAIN.md)

## Experience
- [`docs/experience/UI_UX_DESIGN_SYSTEM.md`](docs/experience/UI_UX_DESIGN_SYSTEM.md)
- [`docs/experience/APP_FLOW.md`](docs/experience/APP_FLOW.md)
- [`docs/experience/JOURNEY_REGISTRY.md`](docs/experience/JOURNEY_REGISTRY.md)

## Engineering
- [`docs/engineering/TRD.md`](docs/engineering/TRD.md)
- [`docs/engineering/ARCHITECTURE.md`](docs/engineering/ARCHITECTURE.md)
- [`docs/engineering/DATABASE.md`](docs/engineering/DATABASE.md)
- [`docs/engineering/API_CONTRACTS.md`](docs/engineering/API_CONTRACTS.md)
- [`docs/engineering/CODE_STYLE.md`](docs/engineering/CODE_STYLE.md)
- [`AGENTS.md`](AGENTS.md)

## Quality, security & operations
- [`docs/quality/SECURITY.md`](docs/quality/SECURITY.md)
- [`docs/quality/TESTING.md`](docs/quality/TESTING.md)
- [`docs/quality/OPERATIONS.md`](docs/quality/OPERATIONS.md)

## Product/behavior registries
- [`docs/registries/FEATURE_REGISTRY.md`](docs/registries/FEATURE_REGISTRY.md)
- [`docs/registries/BUSINESS_RULE_REGISTRY.md`](docs/registries/BUSINESS_RULE_REGISTRY.md)
- [`docs/registries/WORKFLOWS_AND_BUSINESS_RULES.md`](docs/registries/WORKFLOWS_AND_BUSINESS_RULES.md)

## Execution, memory & governance
- [`BRAIN/MEMORY.md`](BRAIN/MEMORY.md) — Living project memory & execution history
- [`docs/governance/SOURCE_RECONCILIATION.md`](docs/governance/SOURCE_RECONCILIATION.md)
- [`docs/governance/IMPLEMENTATION_PLAN.md`](docs/governance/IMPLEMENTATION_PLAN.md)
- [`docs/governance/GAP_ANALYSIS.md`](docs/governance/GAP_ANALYSIS.md)
- [`docs/governance/GOVERNANCE.md`](docs/governance/GOVERNANCE.md)
- [`docs/reports/FINAL_VALIDATION_REPORT.md`](docs/reports/FINAL_VALIDATION_REPORT.md)

## Developer onboarding
- [`README.md`](README.md)

## Non-duplication principle

The SSOT owns the complete intended system definition. Specialized files own their specific concern and reference the SSOT rather than copying unrelated definitions.

## Verified Implementation Status

The platform has transitioned from greenfield baseline to **51 fully implemented and verified features** spanning Phase 0 through Phase 4/5. All implemented features are strictly validated by **1004 automated tests** (537 unit tests, 333 integration tests, 134 Playwright E2E browser and API specs) and 41 Supabase SQL schema migrations with full RLS policy coverage.
