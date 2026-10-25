# Review Resolution Decisions (binding for the fix pass)

Doc ID: REV-RES · Version 1.0 · Status: Under Review. Decisions by the orchestrator (acting as ARB) in response to `FINAL_REVIEW_REPORT.md`. They are **[TARGET]** decisions; each must be reflected in the affected documents and registered in the ADR register as an amendment (ADR-T03a, T10a, T14a, T23+).

| Finding | Decision |
|---|---|
| REVW-07 | **Default `MF_MODE=bundled`.** Federated runtime (signed registry, LKG, canary, SRI work) is an *activation option* enabled only when OPEN-03 closes with ≥3 named independent frontend teams and a spike (WP-FED-SPIKE) result. The typed module contract (FD-09), remote boundaries and manifest schema stay as the design for that option. Docs must stop calling federated "the production default". |
| REVW-08 | Split MOD-ADM: **MOD-ADM** = platform back-office (support, moderation, admin, auditor, flags) and new **MOD-INS** (`mf-institution`, `/institution/*`) for institution customers (INSTADM, FAC, proctor). Total 8 remotes. Back-office chunks are served only behind an authenticated edge rule; customers never download back-office code. |
| REVW-10 | **Phase 1 loop = Prove → Showcase → Apply**, with search-based (non-AI) matching + explanation. In Ph1: identity, profile, evidence + referee verification, jobs, applications, basic messaging, email notifications, consent, entitlement stub (admin comp, audited). Demoted to Ph2: AI gateway features, learning depth, assessments beyond basic unverified attempts, billing checkout. The roadmap is authoritative; the capability map's phases are regenerated from it. |
| REVW-11 | Add missing dependency edges to the roadmap (identity needs notify-email + worker-outbox; apply-core needs consent + entitlement stub). Fairness audit gates *public matching launch*, scheduled Ph2. |
| REVW-12 | Keep 4 rungs, but the `authority_verified` rung carries a mandatory **`issuer_class`** ∈ {platform, institution, employer_org, instructor}. UI always shows issuer class; matching weights differ by class; instructor-issued attestations require instructor ≠ learner (and no shared account/device signal), issuer independence checks, and are revocable. Instructor sign-off never counts as platform-verified. |
| REVW-14 | Idempotency record retention for queued-op routes = outbox TTL (14 d); routes that cannot hold keys that long must use a natural key. FF-07 reworded: "accepts `Idempotency-Key` or declares a natural key". |
| REVW-15 | Assessment answers are **online-only** (no offline replay). Lesson progress is queued-write. Downloadable video offline is out of Ph1–2. ADR-T10 amended; one expiry/backoff table lives in OFF-01 and is cited elsewhere. |
| REVW-24 | Ph1 offline = read cache + **local unsent drafts only (no outbox)**; the outbox subsystem activates on the ADR-T10 trigger (telemetry/research shows need). |
| REVW-27 | A withdrawn application is terminal, but the candidate may **re-apply as a new linked application** after a cooldown (placeholder 24 h, [OPEN]); closes OPEN-B20. |
| REVW-30 | Ph2 restricted to **first-party (platform-sold) courses**. Third-party paid marketplace deferred to Ph3 behind an ADR on seller of record, payouts, tax/VAT, refunds. |
| REVW-32 | User-generated content is served from a **separate registrable domain**; the refresh token is bound to the session id carried by the `__Host-` access cookie; STRIDE rows for cookie tossing added. |
| REVW-22 | Employer-domain proof-of-control yields a distinct, lower badge ("Mailbox verified, employer not confirmed") unless the domain is bound to a verified employer org (DNS/registry match). Only bound domains reach `artifact_backed`. |
| REVW-25 | Consent revocation: authorization at read time, **no consent cache** (already in CONSENT_SCOPE_CATALOGUE). All docs/tests use it. |
| REVW-16 | No cost numbers invented. Add a coarse cost *envelope structure* (3 volume scenarios × component list, vendor-quote columns empty) and mark it a Ph0-exit blocker. |
| REVW-13 | Add ADR proposal (T24): public job/profile pages prerendered at the edge + sitemap; app routes stay SPA. |
| REVW-33 | One global OPEN register (renumber OPEN-FE-*, OPEN-UX-*, OPEN-B*, OPEN-CS-* into it with owner/phase/blocking; close answered items). |
