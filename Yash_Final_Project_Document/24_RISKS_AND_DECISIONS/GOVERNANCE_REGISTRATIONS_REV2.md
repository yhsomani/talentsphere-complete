# Governance Registrations (proposed) — ADRs, OPEN items, index additions

Doc ID: DEC-GOV2 · Version 1.0 · 2026-10-25 · Additive; supplements [ADR_REGISTER](ADR_REGISTER.md) and [OPEN_DECISIONS](OPEN_DECISIONS.md) without changing them. Every entry is **Proposed**; nothing here is approved by an ARB or owner.

## 1. ADR amendments / new ADRs
| ID | Proposal | Source |
|---|---|---|
| ADR-T03a | Default `MF_MODE=bundled`; federated runtime is an activation option once OPEN-03 (≥3 named teams) and the spike close; 8 remotes after MOD-ADM/MOD-INS split | REVIEW_RESOLUTION_DECISIONS; FEDERATION_REVIEW_FIXES |
| ADR-T05a / T06a / T09a | Write-budget and batch anchoring; cookie contract (`__Host-ts_at`, `__Secure-ts_rt`, `X-CSRF-Token`); in-process consumers and fenced job engine details | BACKEND/SECURITY REV2 |
| ADR-T10a | Ph1 offline = read cache + local unsent drafts; assessment answers online-only; lesson progress queued; outbox on trigger | OFFLINE_AND_SYNC_DESIGN_REV2 |
| ADR-T14a | `authority_verified` carries mandatory `issuer_class`; instructor ≠ learner | BR/DT/INV REV2 |
| ADR-T23 | Bundled lazy modules as baseline; federation conditional (referenced by research log R1) | FEDERATION_REVIEW_FIXES |
| ADR-T24 | Edge prerender of public job/profile pages + sitemap | FRONTEND_ARCHITECTURE_REV2 |
| ADR-T25 (number proposed) | Third-party course marketplace money flow (Ph3) | MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL |
| FD-14 | How the edge learns `admin.console` | FEDERATION_REVIEW_FIXES |

## 2. Fitness-function wording (CANONICAL_INVARIANTS not edited)
FF-07: "accepts `Idempotency-Key` or declares a natural key". FF-02: complete module graph generated from imports. FF-11 (enum-vs-SM lint) and FF-12 (consent-catalogue generation) are already defined in `CANONICAL_INVARIANTS.md`.

## 3. OPEN-item consolidation rule
A single global register is **not built yet**. Proposed rule: keep global `OPEN-nn`; map `OPEN-FE-*`, `OPEN-UX-*`, `OPEN-B*`, `OPEN-CS-*` to a new global id with owner, phase, blocking flag; close answered items. Dispositions reported by agents: OPEN-B20 closed (re-apply as linked application); OPEN-FE-08 and OPEN-FE-10 closed by the CONST-S table; OPEN-FE-17/18 and OPEN-UX-14 to renumber; OPEN-06 re-tag Ph3. New: OPEN-42 (phase reconciliation), OPEN-B57/58/59, operational-telemetry classification, RUM coverage threshold, edge limiter, minimum-age value (counsel), retention basis (OPEN-08).

## 4. Route prefixes / ID registry additions (ID_REGISTRY not edited)
Add MOD-INS (`/institution/*`); shell prefixes `/r/*`, `/invite/*`, `/p/*`, `/login/callback`, `/offline`, `/help`; screen aliases SCR-INS-01..06 for SCR-ADM-17..22.

## 5. New files to link from the master index
See [MASTER_INDEX_V9_ADDENDUM_2](../00_CONTROL_CENTRE/MASTER_INDEX_V9_ADDENDUM_2.md).
