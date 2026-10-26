# PWA and Mobile - Review Fixes (revision overlay)

Doc ID: PWA-01-REV2 · Owner: Frontend/Platform Architecture · Version 2.0 · Status: Under Review
Relates: PWA-01, PLT-01, MOB-01, OFF-01 / OFF-01-REV2, MFA-01, FEA-01 · REVW-05, REVW-07, REVW-08, REVW-24, REVW-37 · REV-RES

This file is **additive**. The originals in this folder are unchanged; where this overlay differs, it governs, and the superseded place is named. Supersession is a relationship, not a deletion. Offline scope, constants and idempotency are in `OFFLINE_AND_SYNC_DESIGN_REV2.md`.

## 1. iOS Web Push claim: one marker, used everywhere (REVW-37)
The claim recurs in many documents with different source tiers. The canonical form is defined here and in PLT-01 (marks V(src), V(dev), U):

> **IOS-PUSH-CLAIM** - Web Push on iOS and iPadOS is available only to Home Screen web apps (installed), after a user gesture, from iOS 16.4. **V(src)** (WebKit and MDN documentation, PLT-01 section 1; accessed 2026-10-25). **Not device-verified**: no V(dev) record exists (OPEN-FE-01 / OPEN-12).

Rule: any document that repeats the claim writes "(V(src), PLT-01; not device-verified)" or links to this text; none states it unmarked and none cites a secondary source (RES-01 R2) for it.

| Place that repeats the claim | Marker status | Fix |
|---|---|---|
| PLT-01 sections 1, 4 | V(src) present | none (source of the marker) |
| PWA-01 section 8 "iOS gating" | V(src) F1 present | add "not device-verified" |
| MOB-01 sections 3, 4 | V(src) present | add "not device-verified" |
| ACTION_REGISTRY ACT-NTF-04; UX-07 install and push paragraph | cites RES-01 R2 only | replace with the canonical marker |
| FEA-01 section 3 "Browser targets" (iOS 16.4+ floor) | "PLT-01" without tier | add "(V(src), not device-verified)" |
| PROJECT_MASTER section 6 table; ADR-T02 "secondary sources" (outside this folder) | no marker, secondary tier | governance pass: use the canonical marker |

The declarative-push row in PLT-01 was updated by another editor to V(src) for several columns; the product-integration part stays unverified.

## 2. Service worker rules for the bundled default and gated back-office code (REVW-07, REVW-08)
PWA-01 section 4.1 rules R2 and R3 are written for federated remotes under `/mf/**`. In the default bundled mode (ADR-T23) there is one build. Overlay:

| Rule | Overlay |
|---|---|
| R2 (supersedes the "/assets/* (shell, hashed)" row) | **Precache only** the shell critical path and the offline page (budget B13, <= 1.5 MB). Lazy module chunks under `/assets/` are **not** precached; they are runtime-cached `CacheFirst` on first use (hashed, immutable), expiry as R3 |
| R2b (new) | **Never precache or runtime-cache the back-office path** `/assets/bo/**` (and `/mf/mf-admin/**` when federated). These paths sit behind the authenticated edge rule FD-14; precaching would make every installing client download back-office code and would bypass the rule. A CI test lists the generated precache manifest and fails if any `bo` path is present |
| R3 | Applies only when federated |
| R4 | Applies only when federated (no registry exists in bundled mode) |
| Update apply condition (section 5) | "outbox not mid-flush" applies only after the outbox exists; in Phase 1 the condition is "no dirty form and no unsent draft being edited" |
| Navigation fallback | Unchanged. The back-office and institution routes render the shell, which then requests the gated chunk; an unauthenticated request for the chunk gets `404` and the shell shows "no access" |

## 3. Session contract leftovers (REVW-05, frontend side)
The authoritative contract is SEC-02 section 2.3 / API-STD: `__Host-ts_at` (`HttpOnly; Secure; SameSite=Lax; Path=/`), `__Secure-ts_rt` (`Path=/api/v1/auth/refresh`, `SameSite=Strict`), `X-CSRF-Token`, `GET /api/v1/me`, `POST /api/v1/auth/refresh` and `/auth/logout`. No `/bff/*` namespace exists. Read the following as corrected: PWA-01 section 10 heading ("BFF cookies" means session cookies), FEA-01 section 12 credentials row (SameSite per cookie), MOB-01 section 6 ("session-cookie based"), OFF-01 row 3. A native client would still need a different token transport (new ADR), as MOB-01 says.

## 4. Mobile distribution (MOB-01) consistency
| Item | Overlay |
|---|---|
| Trigger T5 (offline need beyond ADR-T10) | Evidence source is the Phase 1 draft telemetry in OFF-01-REV2 section 0; revisit ADR-T10 first, wrapper second (unchanged order) |
| Option scoring | Unchanged; the iOS-push cell uses the section 1 marker |
| Store-wrapper decision | Unchanged: PWA first; no change from the bundled default |

## 5. Items for the governance pass
IOS-PUSH-CLAIM wording in PROJECT_MASTER section 6 and ADR-T02; confirm FD-14 edge rule is accepted before R2b is implemented; device verification (OPEN-FE-01) is still open, so no cell is upgraded to V(dev).
