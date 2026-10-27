# Legacy Merge B-08: PWA and Offline Claims (Prior Attempt) and the Six-Flag Offline Declaration

Doc ID: LGM-B-08 · Owner: Frontend/Platform Architecture (PWA engineering) · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: PWA-01, OFF-01-REV2, PLT-01, ADR-T02, ADR-T10, INV-T13, OPEN-12, OPEN-40 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/engineering/TRD.md` section 2 and section 8, `.../system-model/02-flows.md` F7 status notes, `.../system-model/01-inventory-and-coverage.md` (feature status table: browser shell/PWA), root `ARCHITECTURE.md` section 15, `.../quality/TESTING.md` accessibility coverage.

## 0. Frame

Nothing is built. The items below are what an earlier attempt reported about its PWA/offline posture. PWA-01 (section 1 "Reference gap [REF]") already records that the prior attempt shipped a manifest, icons and a capability-detection module but no offline sync and kept the bearer token in browser storage. This file adds the remaining unique facts and the legacy offline declaration template.

## 1. Facts reported (prior attempt)

- The manifest and a small capability module only **reported** capabilities; "offline readiness" was detected from an *existing* service-worker controller; nothing registered a service worker. The page footer nevertheless said "PWA Installable" (a claim without backing; recorded as a UI-honesty defect in `../10_FRONTEND_ARCHITECTURE/LEGACY_MERGE_FRONTEND_AND_UI_QUALITY.md` section 3).
- No durable offline mutation or sync system was found. Feature-status table classified the browser shell/PWA as "partially implemented: mounted pages, session recovery, error boundaries, manifest/capability reporting; offline sync not implemented".
- Session token lived in browser `localStorage` (XSS-readable); there was no refresh flow, so any offline design would have had to keep a long-lived bearer in script-reachable storage.
- Accessibility automation covered reflow at 320 px, 200% zoom and `prefers-reduced-motion`; contrast checking and screen-reader verification were not automated (relevant to installed-PWA display modes).

**Target requires:** (a) install and offline indicators driven by actual capability checks, never static text; (b) tokens never in script-readable storage (ADR-T06); (c) offline caches are never authoritative (INV-T13) and queued writes are server-revalidated; (d) draft persistence follows OPEN-40 (allow-list of non-sensitive fields).

## 2. Legacy offline declaration template (TRD section 8)

Each feature declares six properties: `READ_OFFLINE`, `WRITE_OFFLINE`, `QUEUE`, `SYNC`, `CONFLICT`, `SERVER_REQUIRED`. "No secure assessment or other explicitly server-authoritative decision relies on offline authority."

Mapping to the blueprint: ADR-T10 defines tiers (read-cache of owner data; queued writes only for application drafts, profile edits, message compose, notes; everything consequential online-only) and FEA-01 requires each query to declare `meta.offline = { class, ttl }`. The six-flag template is a *different vocabulary for the same intent*. **Decision needed (L-B08-01, owner Frontend Architect):** keep the six flags as the per-feature spec fields in `05_FEATURE_SPECIFICATIONS` (and derive `meta.offline` from them), or declare them superseded by the tier classes. Until decided, feature specs may list both.

## 3. Open items

| ID | Question | Owner |
|---|---|---|
| L-B08-01 | Six-flag offline declaration vs tier classes (ADR-T10) | Frontend Architect |
| OPEN-12 | Verified iOS/Android PWA facts and device matrix | QA + Frontend Platform |
| OPEN-40 | Allow-list for persisted offline drafts | Security Architect + Frontend Architect |
