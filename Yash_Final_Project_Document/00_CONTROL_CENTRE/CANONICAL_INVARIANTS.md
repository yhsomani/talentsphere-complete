# Canonical Target Invariants & Cross-Cutting Rules (INV-T / BR-T seeds)

Doc ID: CC-INV · Owner: Architecture Review Board · Version 1.0 · Status: Under Review
All documents cite these IDs; do not restate them differently. Fuller registries: `06_BUSINESS_PROCESSES/`.

## Product & data invariants
| ID | Invariant | Enforced by | Verified by |
|---|---|---|---|
| INV-T01 | Every protected endpoint is authorized server-side by `packages/policy`, deny-by-default; client checks are hints only. | policy middleware + route registration lint | FF-01, authz matrix tests |
| INV-T02 | Every record loaded by id is authorized against that record (owner/org/participant/admin); "authenticated" is never sufficient. | policy `can(principal, action, resource)` | IDOR test suite |
| INV-T03 | No cross-tenant read/write: all tenant tables carry `org_id`/`institution_id` and RLS. | RLS + repository layer | cross-tenant canary tests (FF-05) |
| INV-T04 | Verified evidence status is set only by server-side verification transitions; a claim is never displayed as verified. | `evidence` module state machine SM-EVIDENCE | state-machine tests |
| INV-T05 | Verification credentials (email code, referee token) are stored only as hashes, single-use, expiring, bound to one request, never returned to the person they verify. | `verification` module | token tests |
| INV-T06 | Assessment AI restrictions (`AI_PROHIBITED`) are enforced in the AI gateway regardless of caller. | `api/ai` gateway | gateway test matrix |
| INV-T07 | Free-tier users never cause paid inference unless an explicit budget policy flag allows it; every call passes quota. | AI gateway budget check | cost-guard tests |
| INV-T08 | AI output and AI "memory" are never evidence or profile truth. | evidence creation rejects `source=ai` | schema test |
| INV-T09 | No autonomous consequential decision about a person (reject, rank-out, flag, ban) — a human acts or confirms. | workflow design; no auto-transition on AI/score alone | review checklist + tests |
| INV-T10 | Every consequential side effect is idempotent (idempotency key or natural key) and audited. | `Idempotency-Key` middleware, audit port | replay tests |
| INV-T11 | State changes follow declared state machines only; terminal states are immutable. | domain state-machine tables | SM tests |
| INV-T12 | Events are written to the outbox in the same transaction as the state change (no dual write). | repository `withOutbox` | transaction tests |
| INV-T13 | Offline caches are never authoritative; queued writes are revalidated server-side. | API + client sync layer | offline conflict tests |
| INV-T14 | Secrets never reach the browser or logs; PII redacted in logs. | config/observability | secret-scan, log tests |
| INV-T15 | Consent is purpose-bound, versioned, revocable; recruiter access to evidence requires a live consent scope. | `privacy` module | consent tests |
| INV-T16 | Remotes never read credentials/tokens and never import another remote's internals. | host contract + lint | FF-03, FF-04 |
| INV-T17 | Payment redirect success grants nothing; only verified webhook state changes entitlements. | billing module | webhook tests |
| INV-T18 | Privileged (support/admin) access to personal data is time-boxed, reason-coded and audited. | admin module | audit tests |
| INV-T19 | Matching/ranking is explainable, shows uncertainty, and never uses payment as a ranking input. | matching module | explanation tests, ranking-input allowlist |
| INV-T20 | Anomaly ≠ guilt: integrity flags route to human review and are appealable. | assessment/safety | process tests |

## Architecture fitness functions (automatable)
| ID | Rule | Tooling |
|---|---|---|
| FF-01 | Every route declares a policy action; routes without one fail CI. | route-registry lint |
| FF-02 | No import across `api/<module>` except via its `index.ts` public interface. | dependency-cruiser |
| FF-03 | No remote imports another remote's source; only shell-provided contracts. | dependency-cruiser + MF config check |
| FF-04 | Federation dependency graph is acyclic; shared deps have a singleton + version range. | manifest validator |
| FF-05 | Cross-tenant canary: seeded tenant B data must be unreadable as tenant A in every list/get endpoint. | generated integration suite |
| FF-06 | Every public contract change passes OpenAPI diff (breaking = major version). | oasdiff |
| FF-07 | Every unsafe mutation route accepts `Idempotency-Key`. | route-registry lint |
| FF-08 | Remote release requires compatibility check vs current shell + API ranges. | CI compat gate |
| FF-09 | Every PWA capability used has a feature-detected fallback listed in the platform matrix. | review + e2e on WebKit |
| FF-10 | Migrations are append-only, contiguous, and each has a rollback/forward-fix note. | migration lint |
| FF-11 | State vocabulary has one source: `06_BUSINESS_PROCESSES/STATE_MACHINES.md` (SM-00). Every DB `CHECK (state/status/lifecycle IN (...))`, OpenAPI state enum (schemas and query filters), AsyncAPI state-bearing enum and UI status lookup equals the persisted SM-00 state set of its machine; any difference fails CI ("enum-vs-SM lint"). | enum-vs-SM lint (machine-readable SM table in `packages/domain`; generates the others) |
| FF-12 | Consent scope vocabulary has one source: `00_CONTROL_CENTRE/CONSENT_SCOPE_CATALOGUE.md` section 8 (CSC). The DB `consent_record.scope` CHECK and `consent_grain_ck`, the OpenAPI `ConsentScope` enum (referenced by every consent schema and the `{scope}` path parameter), the DT-01 scope list, the PRIVACY purposes register and revocation table, and every `require_consent(` call use exactly the catalogue ids; no `CS-*` token or retired `evidence.share_recruiter` appears outside the CSC crosswalk, explicit "was `CS-...`" / "retired" annotations and review reports. Any difference fails CI. | consent-scope lint (generates the CHECK, enum and DT-01 header from the CSC machine-readable block; documentation lint over this folder until the generator exists) |

## Cross-cutting business rules (seed set; full registry in 06_*)
BR-T001 one active application per (candidate, job). BR-T002 application stage transitions only per SM-APPLICATION. BR-T003 evidence artefacts virus-scanned before becoming visible. BR-T004 reference requests expire after 14 days; max 2 reminders. BR-T005 revoked evidence triggers recomputation of dependent skill confidence and match explanations (async, audited). BR-T041 privileged access grant ≤ 4 h, reason required. BR-T050 session refresh-token reuse revokes the whole token family. BR-T060 erasure completes within 30 days except legally retained audit/billing records (retention list OPEN-08).
