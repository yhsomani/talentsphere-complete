# Scenario Simulations (paper walk-throughs — NOT executed tests)

Doc ID: REV-SIM · Owner: Independent Review Council · Version 1.0 · Status: Draft
Trace pattern: User → UI → Shell/Remote → Platform services → API → Policy/Domain → Data → Outbox/Events → Response → Outcome.

| # | Scenario | Walk-through | Outcome / finding |
|---|---|---|---|
| S1 | New candidate registers on iOS Safari (not installed) | Shell loads; passkey or password via BFF; cookie set; onboarding in mf-candidate; push prompt hidden because not installed | OK. Push CTA gated on `display-mode: standalone` (verify in 08_*). |
| S2 | Expired session mid-form | API 401 → shell refresh once → if fails, queue draft in IndexedDB, re-auth modal, resume | Browser storage is not a secure enclave → drafts exclude sensitive fields (OPEN-40: draft field allowlist). |
| S3 | Double-click "Submit application" | Same Idempotency-Key returns stored result; partial unique index blocks different-key duplicate (BR-T001) | OK; both layers required. |
| S4 | Two recruiters move same candidate stage | `If-Match` ETag mismatch → 412 → UI shows latest stage and who changed | OK; UI string must exist in ACTION_REGISTRY. |
| S5 | Recruiter A requests application of org B | policy resource check fails → 404 (not 403, avoids enumeration) | Specify 404-on-foreign-tenant convention (INV-T02). |
| S6 | `mf-hiring` crashes on render | Route-level error boundary; shell and other remotes alive; telemetry; retry; no data loss (server state) | OK. A crash in a shared singleton (React) takes all down → pinned deps + canary rollout. |
| S7 | Remote deployed with incompatible hostContract | Shell validates manifest range → rejects → loads last-known-good; alert | Registry keeps ≥2 previous versions per remote. |
| S8 | Stale service worker serves old shell against new API | API checks `X-Client-Version`; returns upgrade-required problem → shell forces SW update | Define min-supported client policy (VERSION_COMPATIBILITY_DESIGN). |
| S9 | Offline profile edit conflicts with server change | Queued PATCH with `If-Match` → 412 on replay → merge UI for text, last-writer prompt otherwise | OK; queued-write class. |
| S10 | Referee opens link twice / forwards it | Token single-use, bound to request; second use → "already submitted" | OK; token theft residual risk in THREAT_MODEL. |
| S11 | Assessment runner down | Attempt `pending_execution`, never `passed`; truthful message; retry via fenced job | Aligns ADR-T13. |
| S12 | AI provider outage during resume feedback | Gateway breaker opens; feature shows unavailable; core flows unaffected | OK. |
| S13 | Stripe webhook delayed after checkout | UI shows "processing" from server state; entitlement unchanged until webhook | OK (INV-T17). |
| S14 | Candidate revokes consent while recruiter has profile open | Next API read denied; recruiter-side caches of consented data are `no-store` | Added requirement: no persistent caching of third-party consented data. |
| S15 | Erasure request with legal-hold audit rows | Erase PII, pseudonymize audit/billing, confirm; backups age out per policy | Backup retention disclosure needed (OPEN-08). |
| S16 | New endpoint leaks cross-tenant | FF-05 canary fails CI | OK. |
| S17 | API rollback while remotes newer | Remote `apiRange` minimums constrain rollback; deploy expand-first/contract-last | Verify in release strategy. |
| S18 | Worker crash mid-job | Lease expires; second worker reclaims with new generation; first's completion rejected | OK (fenced). |

Follow-ups raised: OPEN-40 (draft field allowlist), `X-Client-Version` min-support policy, ≥2 retained versions per remote, `no-store` for consented third-party data.
